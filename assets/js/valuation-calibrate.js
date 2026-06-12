/* ════════════════════════════════════════════════════════════════════════════
   valuation-calibrate.js — window.ValuationCalibrate.

   The part KTC/FantasyCalc structurally CANNOT do: instead of guessing how much
   position scarcity moves price, we MEASURE it from the user's own real trades.

   For each completed trade across the user's leagues + seasons we:
     1. reconstruct the league's roster state at the MOMENT of the trade (Sleeper
        only returns CURRENT rosters, so we replay the transaction log BACKWARD from
        today's rosters — undoing every add/drop/trade),
     2. compute the scarcity x of the traded position THEN (Valuation.positionSupply-
        Demand: buyers vs sellers, the same metric the live In-League number uses),
     3. measure how much the buyer over/under-paid vs market value,
   then regress overpay-share on x per position → the scarcity→price slope k. That
   fitted k feeds Valuation.inLeagueValue. With too few trades a position falls back
   to a pooled global slope, then to the hand-tuned default in valuation-core.

   Reuses TradeHistory.ensure() — which now stashes window.ML_TXN_LOG (full txn log +
   each node's final rosters/slots) — so calibration costs ~0 extra fetches. Pure CPU
   after that. Cached in localStorage (24h). Degrades to default k on any failure, so
   the three-number display never blocks on this. Exposes window.ValuationCalibrate.

   See docs/FORMULAS.md "Player valuation → Liquidity calibration" + Updates page S29.
   ════════════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var cfg = { userId: null };
  var _mem = null;          // in-memory fitted result for the session
  var _loading = null;      // in-flight ensure() promise
  var POSS = ['QB', 'RB', 'WR', 'TE'];
  var ENSURE_TIMEOUT_MS = 6000;

  function K() { return (global.Valuation && global.Valuation.K) || {}; }
  function lsKey() { return 'fpts-valk-' + (cfg.userId || 'anon'); }

  // merged player dict across every loaded league (max historical coverage)
  function mergedPlayers() {
    var all = global.ML_ALL_LEAGUE_DATA || {}, out = {};
    Object.keys(all).forEach(function (id) {
      var pl = all[id] && all[id].players; if (!pl) return;
      for (var pid in pl) if (pl.hasOwnProperty(pid) && !out[pid]) out[pid] = pl[pid];
    });
    return out;
  }
  function pName(p) { return p ? (p.full_name || ((p.first_name || '') + ' ' + (p.last_name || '')).trim()) : ''; }

  // ── localStorage cache ──
  function loadCache() {
    try {
      var raw = global.localStorage && localStorage.getItem(lsKey());
      if (!raw) return null;
      var o = JSON.parse(raw);
      var ttl = K().CALIB_TTL_MS || 86400000;
      if (!o || !o.fittedAt || (nowMs() - o.fittedAt) > ttl) return null;
      return o;
    } catch (e) { return null; }
  }
  function saveCache(o) {
    try { if (global.localStorage) localStorage.setItem(lsKey(), JSON.stringify(o)); } catch (e) {}
  }
  // status_updated/created are real epoch values carried by Sleeper; we only ever
  // read them off transactions (never synthesize a clock), so this is replay-safe.
  function nowMs() {
    var all = global.ML_TXN_LOG || {}, latest = 0;
    Object.keys(all).forEach(function (id) {
      (all[id].transactions || []).forEach(function (t) {
        var ts = +(t.status_updated || t.created || 0); if (ts > latest) latest = ts;
      });
    });
    return latest || 0; // 0 → treat cache as fresh only within session memory
  }

  // ── backward roster-state replay (per node / season) ──
  function clonePresent(rosters) {
    var s = {};
    (rosters || []).forEach(function (r) { s[r.roster_id] = new Set(r.players || []); });
    return s;
  }
  function cloneState(state) {
    var s = {}; Object.keys(state).forEach(function (rid) { s[rid] = new Set(state[rid]); }); return s;
  }
  // Undo t IN PLACE and COUNT anomalies. The log reconciles with the roster state
  // when, going backward: undoing an ADD finds the player present (we remove him),
  // and undoing a DROP finds him absent (we restore him). A violation means the log
  // doesn't line up with reality at this point — a missing/overlapping txn, a commish
  // edit, or a draft acquisition Sleeper never emitted as a transaction. We tolerate a
  // few (drafts legitimately leave players un-added) but exclude badly-diverging nodes
  // from the fit so corrupt scarcity never poisons the regression. (A naive
  // undo-then-redo round-trip is identity by construction and detects nothing — this
  // precondition check is what actually flags inconsistency.)
  function applyUndo(state, t, stats) {
    if (t.adds) Object.keys(t.adds).forEach(function (pid) {
      var r = t.adds[pid]; if (!state[r]) return;
      if (!state[r].has(pid)) { if (stats) stats.anomaly++; } else state[r].delete(pid);
    });
    if (t.drops) Object.keys(t.drops).forEach(function (pid) {
      var r = t.drops[pid]; if (!state[r]) return;
      if (state[r].has(pid)) { if (stats) stats.anomaly++; } else state[r].add(pid);
    });
  }

  function median(arr) {
    if (!arr || !arr.length) return 0;
    var s = arr.slice().sort(function (a, b) { return a - b; });
    var m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }

  // ── per-node point extraction ──
  // Returns { points:{QB:[{x,y}],…}, dirty:bool }.
  function nodePoints(node, players) {
    var Val = global.Valuation, LC = global.LC, FP = global.FP_VALUES || {};
    var league = { roster_positions: node.rosterPositions || [] };
    var present = clonePresent(node.rosters);
    if (!Object.keys(present).length) return { points: {}, dirty: true };

    var txns = (node.transactions || []).filter(function (t) {
      return t && t.status === 'complete' && (t.adds || t.drops);
    });
    var desc = txns.slice().sort(function (a, b) {
      return (+(b.status_updated || b.created || 0)) - (+(a.status_updated || a.created || 0));
    });

    var pts = { QB: [], RB: [], WR: [], TE: [] };
    var state = cloneState(present);
    var stats = { anomaly: 0 };
    var rosterPlayers = 0; Object.keys(present).forEach(function (r) { rosterPlayers += present[r].size; });

    function valOf(pid) { var p = players[pid]; return p ? LC.fpValue(FP[pName(p)], league) : 0; }

    desc.forEach(function (t) {
      applyUndo(state, t, stats);   // state is now "just before t"
      if (t.type !== 'trade') return;
      var rids = t.roster_ids || [];
      if (rids.length !== 2) return; // attribute overpay cleanly only for 2-team deals

      // headline = highest-value player moved
      var headPid = null, headVal = 0, headPos = '';
      if (t.adds) Object.keys(t.adds).forEach(function (pid) {
        var v = valOf(pid), p = players[pid];
        if (v > headVal && p && POSS.indexOf((p.position || '').toUpperCase()) >= 0) {
          headVal = v; headPid = pid; headPos = (p.position || '').toUpperCase();
        }
      });
      if (!headPid || headVal <= 0) return; // picks-only / unvaluable → no positional signal

      // per-side totals received (players + picks)
      var gets = {}; rids.forEach(function (r) { gets[r] = 0; });
      if (t.adds) Object.keys(t.adds).forEach(function (pid) { var r = t.adds[pid]; if (gets[r] != null) gets[r] += valOf(pid); });
      (t.draft_picks || []).forEach(function (dp) {
        var r = dp.owner_id; if (gets[r] == null) return;
        gets[r] += (LC.pickValue ? LC.pickValue(dp.season, dp.round, league) : 0);
      });
      var buyer = t.adds && t.adds[headPid];        // roster that RECEIVED the headline player
      if (gets[buyer] == null) return;
      var other = rids[0] === buyer ? rids[1] : rids[0];
      var overpay = gets[other] - gets[buyer];      // what buyer GAVE − what buyer GOT (>0 = overpaid)
      var y = overpay / headVal;
      if (!isFinite(y)) return;

      // scarcity x of the headline position at THIS moment
      var teams = Object.keys(state).map(function (rid) { return { rosterId: rid, playerIds: Array.from(state[rid]) }; });
      var sc = Val.positionScarcity(teams, players, league);
      var x = (sc[headPos] && sc[headPos].x) || 0;
      pts[headPos].push({ x: x, y: y });
    });

    // exclude a node whose log diverges badly from its roster state (corrupt scarcity)
    var tol = Math.max(4, Math.round(0.15 * rosterPlayers));
    var dirty = stats.anomaly > tol;
    return { points: pts, dirty: dirty, anomaly: stats.anomaly };
  }

  // least-squares slope through the origin, clamped to [0, LIQ_K_MAX]
  function fitSlope(points) {
    var sxy = 0, sxx = 0;
    points.forEach(function (p) { sxy += p.x * p.y; sxx += p.x * p.x; });
    if (!(sxx > 1e-9)) return null;
    var k = sxy / sxx;
    var max = K().LIQ_K_MAX != null ? K().LIQ_K_MAX : 1.5;
    return global.Valuation.clamp(k, 0, max);
  }

  // ── main compute ──
  function compute() {
    var players = mergedPlayers();
    var log = global.ML_TXN_LOG || {};
    var perPos = { QB: [], RB: [], WR: [], TE: [] };
    var dirtyNodes = 0, totalNodes = 0;
    Object.keys(log).forEach(function (id) {
      totalNodes++;
      var res;
      try { res = nodePoints(log[id], players); }
      catch (e) { dirtyNodes++; return; }
      if (res.dirty) { dirtyNodes++; return; }   // exclude inconsistent replays from the fit
      POSS.forEach(function (pos) { perPos[pos] = perPos[pos].concat(res.points[pos] || []); });
    });

    var minN = K().MIN_TRADES_PER_POS || 8;
    var allPts = perPos.QB.concat(perPos.RB, perPos.WR, perPos.TE);
    var kGlobal = allPts.length >= minN ? fitSlope(allPts) : null;

    var kByPos = {}, perPosN = {}, n = 0;
    POSS.forEach(function (pos) {
      var pts = perPos[pos]; perPosN[pos] = pts.length; n += pts.length;
      var k = pts.length >= minN ? fitSlope(pts) : null;
      if (k == null) k = kGlobal;                 // pooled fallback
      if (k != null) kByPos[pos] = k;             // else omitted → core uses LIQ_K_DEFAULT
    });

    return { kByPos: kByPos, n: n, perPosN: perPosN, dirtyNodes: dirtyNodes, totalNodes: totalNodes, fittedAt: nowMs() || 1 };
  }

  // ── public ensure(): lazy, cached, never throws ──
  function ensure() {
    if (_mem) return Promise.resolve(_mem);
    if (_loading) return _loading;
    var cached = loadCache();
    if (cached) { _mem = cached; return Promise.resolve(_mem); }

    _loading = (async function () {
      var fallback = { kByPos: {}, n: 0, perPosN: {}, dirtyNodes: 0, totalNodes: 0, fittedAt: 0, fellBack: true };
      try {
        if (!global.TradeHistory || typeof TradeHistory.ensure !== 'function') { _mem = fallback; return _mem; }
        var timed = new Promise(function (resolve) { setTimeout(function () { resolve('timeout'); }, ENSURE_TIMEOUT_MS); });
        var done = await Promise.race([TradeHistory.ensure().then(function () { return 'ok'; }).catch(function () { return 'err'; }), timed]);
        if (done !== 'ok' || !global.ML_TXN_LOG) { _mem = fallback; return _mem; }
        _mem = compute();
        saveCache({ kByPos: _mem.kByPos, n: _mem.n, perPosN: _mem.perPosN, fittedAt: _mem.fittedAt });
        return _mem;
      } catch (e) {
        _mem = fallback; return _mem;
      } finally { _loading = null; }
    })();
    return _loading;
  }

  global.ValuationCalibrate = {
    init: function (c) { cfg = Object.assign({ userId: null }, c || {}); },
    ensure: ensure,
    getK: function () { return (_mem && _mem.kByPos) || null; },
    getInfo: function () { return _mem; },
    invalidate: function () { _mem = null; try { if (global.localStorage) localStorage.removeItem(lsKey()); } catch (e) {} },
    // exposed for headless testing of the replay/regression
    _nodePoints: nodePoints, _fitSlope: fitSlope, _compute: compute
  };
})(window);
