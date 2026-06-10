/* ════════════════════════════════════════════════════════════════════════════
   league-compute.js — page-agnostic per-league value + archetype compute.
   Pure functions over window.SLEEPER (sleeper-helpers.js) + window.FP_VALUES
   (data-bootstrap.js). No DOM, no page-local state. Used by my-leagues.html and
   the standalone trade-calculator.html (via the trade-finder / trade-calc modules).
   Exposes window.LC.
   ════════════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var CDN = 'https://sleepercdn.com';
  function S() { return global.SLEEPER; }

  // Format key from a league OBJECT (SUPER_FLEX → valueSf, else value1qb).
  function valueKey(league) {
    var rp = league && league.roster_positions;
    if (Array.isArray(rp)) return rp.indexOf('SUPER_FLEX') >= 0 ? 'valueSf' : 'value1qb';
    return 'value';
  }
  // Format-aware trade value off a FP_VALUES record; falls back to .value.
  function fpValue(ktc, league) {
    if (!ktc) return 0;
    var k = valueKey(league);
    return (ktc[k] != null ? ktc[k] : ktc.value) || 0;
  }
  function pickValue(season, round, league) {
    return S().pickValue(season, round, valueKey(league));
  }
  function buildAssetPool(data, rosterId, league) {
    if (!data) return [];
    return S().buildAssetPool({
      rosters: data.rosters, players: data.players, tradedPicks: data.tradedPicks,
      draftRounds: data.draftRounds, leagueSeason: data.leagueSeason,
      completedDraftSeasons: data.completedDraftSeasons
    }, rosterId, valueKey(league));
  }
  function getArchetype(avgAge, totalValue, pickVal, projValue, leagueAvg) {
    return S().archetypeFromTotals(avgAge, totalValue, pickVal, projValue, leagueAvg);
  }
  function archetypeLabel(key) { return S().archetypeLabel(key); }
  function archetypeBg(key) {
    var map = {
      dynasty: 'rgba(76,175,110,.15)', contender: 'rgba(91,155,213,.15)',
      tweener: 'rgba(155,145,212,.15)', rebuilder: 'rgba(224,154,48,.15)',
      emergency: 'rgba(237,129,12,.15)'
    };
    return map[key] || 'rgba(255,255,255,.08)';
  }
  function archetypeFg(key) {
    var map = {
      dynasty: 'var(--green)', contender: '#5b9bd5', tweener: '#9b91d4',
      rebuilder: '#e09a30', emergency: 'var(--red)'
    };
    return map[key] || 'var(--white)';
  }

  // Per-league team value + archetype data. Takes the league DATA (rosters/users/
  // players/tradedPicks/draftRounds/leagueSeason/completedDraftSeasons) and the
  // league OBJECT (scoring_settings + roster_positions). Returns
  // { teams[].archetype, myTeam, myRanks, leagueAvg }.
  function computeLeagueValueData(d, league) {
    if (!d) return null;
    league = league || {};
    var FP = global.FP_VALUES || {};
    var rosters = d.rosters || [], users = d.users || [], players = d.players || {}, myRosterId = d.myRosterId;

    var teams = rosters.map(function (r) {
      var u = users.find(function (x) { return x.user_id === r.owner_id; });
      var name = u ? ((u.metadata && u.metadata.team_name) || u.display_name || u.username) : ('Team ' + r.roster_id);
      var avatarUrl = '';
      var metaAv = u && u.metadata && u.metadata.avatar;
      if (metaAv && metaAv.indexOf('http') === 0) avatarUrl = metaAv;
      else if (metaAv) avatarUrl = CDN + '/avatars/thumbs/' + metaAv;
      else if (u && u.avatar) avatarUrl = CDN + '/avatars/thumbs/' + u.avatar;
      var isMe = r.roster_id === myRosterId;
      var posVals = { QB: 0, RB: 0, WR: 0, TE: 0 };
      var ages = [];
      (r.players || []).forEach(function (pid) {
        var p = players[pid];
        if (!p || !posVals.hasOwnProperty(p.position)) return;
        var pname = p.full_name || ((p.first_name || '') + ' ' + (p.last_name || '')).trim();
        if (!pname) return;
        posVals[p.position] += fpValue(FP[pname], league);
        if (p.age && p.age > 0) ages.push(p.age);
      });
      var avgAge = ages.length ? ages.reduce(function (s, a) { return s + a; }, 0) / ages.length : 0;
      var total = posVals.QB + posVals.RB + posVals.WR + posVals.TE;
      // Team projection = sum of OPTIMAL STARTING LINEUP projected points (not whole roster).
      var projTotal = 0;
      if (S() && typeof S().lineupProjection === 'function') {
        projTotal = S().lineupProjection(r.players || [], players, league.scoring_settings || {}, league.roster_positions || []);
      }
      return { rosterId: r.roster_id, name: name, avatarUrl: avatarUrl, isMe: isMe, posVals: posVals, total: total, avgAge: avgAge, projTotal: projTotal, pickValue: 0 };
    });

    // Pick value for EVERY team via the full owned-picks computation.
    teams.forEach(function (t) {
      var owned = S().getOwnedPicks(t.rosterId, d.tradedPicks, d.draftRounds, d.leagueSeason, d.completedDraftSeasons);
      t.pickValue = owned.reduce(function (sum, p) { return sum + pickValue(p.season, p.round, league); }, 0);
      t.pickCount = owned.length;
    });

    var myTeam = teams.find(function (t) { return t.isMe; });
    var myRanks = {};
    ['QB', 'RB', 'WR', 'TE'].forEach(function (pos) {
      var sorted = teams.slice().sort(function (a, b) { return (b.posVals[pos] || 0) - (a.posVals[pos] || 0); });
      myRanks[pos] = myTeam ? sorted.findIndex(function (t) { return t.isMe; }) + 1 : '—';
    });
    var sortedByPicks = teams.slice().sort(function (a, b) { return (b.pickValue || 0) - (a.pickValue || 0); });
    myRanks.PICK = myTeam ? sortedByPicks.findIndex(function (t) { return t.isMe; }) + 1 : '—';
    var sortedByGrand = teams.slice().sort(function (a, b) { return ((b.total || 0) + (b.pickValue || 0)) - ((a.total || 0) + (a.pickValue || 0)); });
    myRanks.TOTAL = myTeam ? sortedByGrand.findIndex(function (t) { return t.isMe; }) + 1 : '—';
    var sortedByPlayers = teams.slice().sort(function (a, b) { return (b.total || 0) - (a.total || 0); });
    myRanks.PLAYER = myTeam ? sortedByPlayers.findIndex(function (t) { return t.isMe; }) + 1 : '—';

    var median = function (arr) {
      if (!arr.length) return 0;
      var s = arr.slice().sort(function (a, b) { return a - b; });
      var m = Math.floor(s.length / 2);
      return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
    };
    var leagueAvg = {
      age: median(teams.filter(function (t) { return t.avgAge > 0; }).map(function (t) { return t.avgAge; })),
      value: median(teams.map(function (t) { return t.total; })),
      pickValue: median(teams.map(function (t) { return t.pickValue || 0; })),
      proj: median(teams.map(function (t) { return t.projTotal || 0; }).filter(function (v) { return v > 0; }))
    };
    teams.forEach(function (t) { t.archetype = getArchetype(t.avgAge, t.total, t.pickValue, t.projTotal, leagueAvg); });

    return { teams: teams, myTeam: myTeam, myRanks: myRanks, leagueAvg: leagueAvg };
  }

  global.LC = {
    valueKey: valueKey,
    fpValue: fpValue,
    pickValue: pickValue,
    buildAssetPool: buildAssetPool,
    getArchetype: getArchetype,
    archetypeLabel: archetypeLabel,
    archetypeBg: archetypeBg,
    archetypeFg: archetypeFg,
    computeLeagueValueData: computeLeagueValueData
  };
})(window);
