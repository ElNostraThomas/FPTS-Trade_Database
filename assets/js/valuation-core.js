/* ════════════════════════════════════════════════════════════════════════════
   valuation-core.js — three-number player valuation (pure math).

   Every public calculator gives ONE value per player: the average market price
   across thousands of leagues. But nobody trades in "the market" — they trade in
   one league with specific rosters and lineup settings. This module turns the one
   market value into THREE context-aware numbers:

     1. MARKET    — the league-agnostic value (FP_VALUES, already computed elsewhere).
     2. TO-TEAM   — the marginal value the player adds to a SPECIFIC team's optimal
                    starting lineup, scaled against a typical roster and floored so a
                    3rd stud QB still carries trade value.
     3. IN-LEAGUE — market × a position supply/demand (liquidity) multiplier; the
                    scarcity→price slope `k` is calibrated per-user from real trades
                    by valuation-calibrate.js (falls back to a tunable default here).

   PURE: no DOM, no fetch, no page state. Reads window.SLEEPER (optimalLineup) +
   window.LC (fpValue) + window.FP_VALUES. The page passes in rosters / buyer-seller
   counts; this module only does arithmetic, so it is headless-testable. Mirrors the
   league-compute.js IIFE style. Exposes window.Valuation.

   See docs/FORMULAS.md "Player valuation" + the Updates & Formulas page (S29).
   ════════════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  // ── Tunable constants ──────────────────────────────────────────────────────
  // All curator-set defaults, documented in the Legend + FORMULAS as adjustable.
  // Tune these to taste; nothing here is derived from data EXCEPT LIQ_K, which the
  // calibrator overrides per-position from the user's real trades when it can.
  var K = {
    // #2 value-to-team scaling
    TEAM_FLOOR: 0.55,   // a zero-marginal-fit player (3rd stud QB) still trades — keep ≥55% of market
    TEAM_CEIL:  1.60,   // cap perfect-fit upside; market already prices stardom, don't double-count

    // #3 league-liquidity elasticity
    LIQ_K_DEFAULT: 0.60, // pre-calibration scarcity→price slope (modest so the default isn't loud)
    LIQ_LO: 0.75,        // liquidity multiplier floor (max −25% of market)
    LIQ_HI: 1.35,        // liquidity multiplier ceiling (max +35% of market)
    LIQ_K_MAX: 1.50,     // clamp any FITTED slope to reject thin-sample outliers

    // calibration guards (read by valuation-calibrate.js; kept here so every
    // tunable lives in one place)
    MIN_TRADES_PER_POS: 8,        // below this, a position falls back to global/default k
    NEED_PCTL: 0.60,              // buyer = ranked in the bottom 40% at the position
    OWNER_SURPLUS_RANK: 0.50,     // seller = ranked in the top half at the position
    CALIB_TTL_MS: 86400000        // 24h cache for a fitted k set (trades accrue slowly)
  };

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

  function median(arr) {
    if (!arr || !arr.length) return 0;
    var s = arr.slice().sort(function (a, b) { return a - b; });
    var m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }

  function playerName(p) {
    return p ? (p.full_name || ((p.first_name || '') + ' ' + (p.last_name || '')).trim()) : '';
  }

  // ── #2 value to a team ─────────────────────────────────────────────────────

  // The total VALUE (MVS units) of a roster's optimal legal starting lineup.
  // Trick: optimalLineup() falls back to FP_VALUES value when no projections are
  // present (sleeper-helpers.js:467), so passing {} for projections makes it both
  // SELECT and (via our sum) MEASURE starters on the MVS value basis — same units
  // as market value, so To-Team scales cleanly. Picks aren't in `players` /
  // roster_positions, so they never enter a lineup (handled as pass-through above).
  function lineupValue(playerIds, players, league) {
    if (!playerIds || !playerIds.length) return 0;
    var S = global.SLEEPER, LC = global.LC, FP = global.FP_VALUES || {};
    if (!S || !LC || typeof S.optimalLineup !== 'function') return 0;
    var rp = (league && league.roster_positions) || [];
    var starters = S.optimalLineup(playerIds, players, {}, rp);
    var total = 0;
    starters.forEach(function (pid) {
      var p = players[pid]; if (!p) return;
      total += LC.fpValue(FP[playerName(p)], league);
    });
    return total;
  }

  // Ensure the focal player is resolvable in a players map (he may be a free agent
  // or owned in a different league than the one whose roster we're testing). Returns
  // a (possibly cloned) players map that contains `sid`.
  function withFocal(sid, players, focalMeta) {
    if (!sid || players[sid] || !focalMeta) return players;
    var pl = {}; for (var k in players) if (players.hasOwnProperty(k)) pl[k] = players[k];
    pl[sid] = { full_name: focalMeta.name, position: focalMeta.position, age: focalMeta.age };
    return pl;
  }

  // Marginal value of adding player `sid` to a roster = lineupValue(roster ∪ sid) −
  // lineupValue(roster ∖ sid). Uses with−without (not with−current) so it's well
  // defined whether or not the player is already on the roster. A 3rd stud QB who
  // never cracks the optimal lineup yields ≈0 here → floored by teamValue().
  function marginalValue(sid, rosterIds, players, league, focalMeta) {
    var pl = withFocal(sid, players, focalMeta);
    if (!pl[sid]) return 0; // unresolvable player → no marginal signal
    var ids = rosterIds || [];
    var withIds = ids.indexOf(sid) >= 0 ? ids : ids.concat([sid]);
    var without = ids.filter(function (id) { return id !== sid; });
    return lineupValue(withIds, pl, league) - lineupValue(without, pl, league);
  }

  // Compute the focal player's marginal value to EVERY team in the league, plus the
  // "average roster" denominator = the MEDIAN of those marginals (robust to the one
  // team he'd be a huge upgrade for). This is what market value is scaled against.
  //   teams: [{ rosterId, playerIds }]
  //   focal: { sid, name, position, age }
  // Returns { perTeam:{rosterId→marginal}, denom:number }.
  function teamMarginals(focal, teams, players, league) {
    var pl = withFocal(focal.sid, players, focal);
    var perTeam = {}, vals = [];
    (teams || []).forEach(function (t) {
      var m = marginalValue(focal.sid, t.playerIds, pl, league);
      perTeam[t.rosterId] = m;
      vals.push(m);
    });
    return { perTeam: perTeam, denom: median(vals) };
  }

  // market × clamp(marginalToTeam / marginalToAverage, FLOOR, CEIL).
  // Degenerate denominator (no team gains from him — e.g. a deep-bench-only asset, or
  // a pick) → pass market through unchanged.
  function teamValue(market, marginalToTeam, marginalToAverage) {
    market = +market || 0;
    if (!(marginalToAverage > 0)) return market;
    var ratio = marginalToTeam / marginalToAverage;
    return market * clamp(ratio, K.TEAM_FLOOR, K.TEAM_CEIL);
  }

  // ── #3 value in a league (liquidity) ───────────────────────────────────────

  // Normalized Herfindahl concentration of a value vector across N TEAMS, ∈ [0,1]:
  // 0 = perfectly even (every team holds an equal share), 1 = one team owns it all.
  // n is the team count (zeros included) — so a position only a few teams roster
  // reads as highly concentrated (scarce), which is the point.
  function concentration(values) {
    var n = (values || []).length; if (n <= 1) return 0;
    var tot = 0;
    values.forEach(function (v) { if (v > 0) tot += v; });
    if (tot <= 0) return 0;
    var hhi = 0;
    values.forEach(function (v) { if (v > 0) { var s = v / tot; hhi += s * s; } });
    return clamp((hhi - 1 / n) / (1 - 1 / n), 0, 1);
  }

  // Per-position SCARCITY signal x behind the In-League multiplier — one canonical
  // definition used BOTH live and in calibration (so a fitted slope applies to the
  // same x). For each position we take the concentration of its value across the
  // league's teams, then DE-MEAN across the four positions: a position held more
  // tightly than this league's OTHER positions reads scarce (x > 0 → premium); one
  // spread more evenly reads abundant (x < 0 → discount). This operationalizes the
  // "a couple of teams hoard every startable TE, so TEs cost more here" intuition
  // without a fragile startable-quality bar, and centers so liquidity ≈ 1 on average.
  //   teams: [{ rosterId, playerIds }]   players: pid→{position,full_name,…}
  // Returns { QB:{hhi,x}, RB:{…}, WR:{…}, TE:{…} }.
  function positionScarcity(teams, players, league) {
    var FP = global.FP_VALUES || {}, LC = global.LC, POSS = ['QB', 'RB', 'WR', 'TE'];
    var colByPos = { QB: [], RB: [], WR: [], TE: [] };
    (teams || []).forEach(function (t) {
      var sums = { QB: 0, RB: 0, WR: 0, TE: 0 };
      (t.playerIds || []).forEach(function (pid) {
        var p = players[pid]; if (!p) return;
        var pos = (p.position || '').toUpperCase(); if (sums[pos] == null) return;
        sums[pos] += LC ? LC.fpValue(FP[playerName(p)], league) : 0;
      });
      POSS.forEach(function (pos) { colByPos[pos].push(sums[pos]); });
    });
    var hhi = {};
    POSS.forEach(function (pos) { hhi[pos] = concentration(colByPos[pos]); });
    var mean = (hhi.QB + hhi.RB + hhi.WR + hhi.TE) / 4;
    var out = {};
    POSS.forEach(function (pos) { out[pos] = { hhi: hhi[pos], x: hhi[pos] - mean }; });
    return out;
  }

  // Liquidity multiplier from a scarcity scalar x. x > 0 → scarce → premium.
  // `slope` is the calibrated per-position k (valuation-calibrate.js) or LIQ_K_DEFAULT.
  function leagueLiquidity(x, slope) {
    var k = (slope != null && isFinite(slope)) ? slope : K.LIQ_K_DEFAULT;
    return clamp(1 + k * x, K.LIQ_LO, K.LIQ_HI);
  }

  // In-league value = market × liquidity. `scarcity` = positionScarcity() output;
  // `kByPos` = optional calibrated { QB,RB,WR,TE → slope } (position's own slope used).
  function inLeagueValue(market, pos, scarcity, kByPos) {
    market = +market || 0;
    var x = (scarcity && scarcity[pos] && scarcity[pos].x) || 0;
    var slope = (kByPos && kByPos[pos] != null) ? kByPos[pos] : null;
    return market * leagueLiquidity(x, slope);
  }

  global.Valuation = {
    K: K,
    clamp: clamp,
    median: median,
    lineupValue: lineupValue,
    marginalValue: marginalValue,
    teamMarginals: teamMarginals,
    teamValue: teamValue,
    concentration: concentration,
    positionScarcity: positionScarcity,
    leagueLiquidity: leagueLiquidity,
    inLeagueValue: inLeagueValue
  };
})(window);
