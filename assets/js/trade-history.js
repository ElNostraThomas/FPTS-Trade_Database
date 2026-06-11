/* ════════════════════════════════════════════════════════════════════════════
   trade-history.js — window.TradeHistory.
   Search a player → every TRADE across the user's leagues + seasons that involved
   him and that the user was a side of, flagged by who initiated it (Sleeper's
   `creator` vs the logged-in user). Shared by My Leagues + the Roster Moves page.

   Builds (or reuses) window.ML_MY_TRADES = { years, byYear:{season:[{t,ctx}]} } —
   the same cross-league pool My Leagues' "My Trades" tab uses. ctx =
   { players, rosters, rosterToTeam, userToName, myRosterId, leagueId, leagueName }.
   Reads window.ML_ALL_LEAGUE_DATA + FP_VALUES/SLEEPER_IDS; no new Sleeper endpoints
   beyond /league/{id}/transactions/{week} (+ /league/{id} for the history chain).
   ════════════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var API = 'https://api.sleeper.app/v1';
  var CDN = 'https://sleepercdn.com';
  var cfg = { userId: null, getLeagues: null };
  var _loading = null;     // in-flight ensure() promise

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function jsq(s) { return String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }
  function _api(path) { return fetch(API + path).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); }
  function _playersDict() { var all = global.ML_ALL_LEAGUE_DATA || {}; var k = Object.keys(all)[0]; return (k && all[k] && all[k].players) || {}; }
  function fmtDate(sec) { try { var d = new Date(Number(sec)); return (d.getMonth() + 1) + '/' + d.getDate() + '/' + String(d.getFullYear()).slice(2); } catch (e) { return ''; } }

  // Format-aware value (SF vs 1QB) where the league is known; SF default otherwise.
  function _valueKey(leagueId) {
    var d = (global.ML_ALL_LEAGUE_DATA || {})[leagueId];
    var lg = d && d.league;
    var rp = (lg && lg.roster_positions) || [];
    return rp.indexOf('SUPER_FLEX') >= 0 ? 'valueSf' : 'value1qb';
  }
  function _val(name, leagueId) {
    var k = (global.FP_VALUES || {})[name]; if (!k) return 0;
    return k[_valueKey(leagueId)] || k.value || 0;
  }

  // ── build / reuse the cross-league trade pool ──
  function ensure() {
    if (global.ML_MY_TRADES) return Promise.resolve(global.ML_MY_TRADES);
    if (_loading) return _loading;
    _loading = (async function () {
      try {
      var players = _playersDict();
      var all = global.ML_ALL_LEAGUE_DATA || {};
      var leagues = (cfg.getLeagues && cfg.getLeagues()) || [];
      var leagueById = {};
      leagues.forEach(function (l) { if (l && l.league_id) leagueById[l.league_id] = l; });

      // 1) node set — each base league + its previous_league_id chain back to 2017.
      var nodes = [], seen = {};
      var baseIds = Object.keys(all).filter(function (id) { return all[id]; });
      await Promise.all(baseIds.map(async function (lid) {
        var lg = leagueById[lid] || (all[lid] && all[lid].league) || null;
        var baseName = (all[lid] && all[lid].leagueName) || (lg && lg.name) || 'League';
        var baseSeason = String((lg && lg.season) || (all[lid] && all[lid].leagueSeason) || '');
        if (!seen[lid]) { seen[lid] = 1; nodes.push({ leagueId: lid, season: baseSeason, name: baseName }); }
        var prevId = lg ? lg.previous_league_id : null;
        var prevSeason = parseInt(baseSeason, 10) - 1, guard = 0;
        while (prevId && prevSeason >= 2017 && guard < 10) {
          var prev = await _api('/league/' + prevId);
          if (!prev) break;
          if (!seen[prevId]) { seen[prevId] = 1; nodes.push({ leagueId: prevId, season: String(prev.season || prevSeason), name: prev.name || baseName }); }
          prevId = prev.previous_league_id;
          prevSeason = parseInt(prev.season || prevSeason, 10) - 1;
          guard++;
        }
      }));

      // 2) per node — rosters/users + trades the user was a side of.
      var byYear = {};
      await Promise.all(nodes.map(async function (node) {
        try {
          var cur = all[node.leagueId];
          var rosters = (cur && cur.rosters) || (await _api('/league/' + node.leagueId + '/rosters')) || [];
          var users = (cur && cur.users) || (await _api('/league/' + node.leagueId + '/users')) || [];
          var myRoster = (rosters || []).find(function (r) { return String(r.owner_id) === String(cfg.userId); });
          if (!myRoster) return;
          var myRosterId = myRoster.roster_id;
          var rosterToTeam = {};
          (rosters || []).forEach(function (r) {
            var u = (users || []).find(function (x) { return x.user_id === r.owner_id; });
            rosterToTeam[r.roster_id] = u ? ((u.metadata && u.metadata.team_name) || u.display_name || u.username) : ('Team ' + r.roster_id);
          });
          var userToName = {};
          (users || []).forEach(function (u) { userToName[u.user_id] = (u.metadata && u.metadata.team_name) || u.display_name || u.username; });
          var weeks = await Promise.all(Array.from({ length: 18 }, function (_, w) { return _api('/league/' + node.leagueId + '/transactions/' + (w + 1)).then(function (x) { return x || []; }); }));
          var trades = weeks.reduce(function (a, b) { return a.concat(b); }, []).filter(function (t) {
            return t && t.type === 'trade' && t.status === 'complete' && (t.roster_ids || []).indexOf(myRosterId) >= 0;
          });
          if (!trades.length) return;
          var ctx = { players: players, rosters: rosters, rosterToTeam: rosterToTeam, userToName: userToName, myRosterId: myRosterId, leagueId: node.leagueId, leagueName: node.name };
          (byYear[node.season] = byYear[node.season] || []).push.apply(byYear[node.season], trades.map(function (t) { return { t: t, ctx: ctx }; }));
        } catch (e) {}
      }));

      Object.keys(byYear).forEach(function (y) { byYear[y].sort(function (a, b) { return b.t.status_updated - a.t.status_updated; }); });
      var years = Object.keys(byYear).sort(function (a, b) { return Number(b) - Number(a); });
      global.ML_MY_TRADES = { years: years, byYear: byYear, activeIdx: 0 };
      return global.ML_MY_TRADES;
      } catch (e) { _loading = null; throw e; }   // reset so a transient failure can retry
    })();
    return _loading;
  }

  // Every {t,ctx} where `sid` is on either side, newest-first.
  function tradesForSid(sid) {
    sid = String(sid);
    var data = global.ML_MY_TRADES; if (!data) return [];
    var out = [];
    data.years.forEach(function (y) {
      (data.byYear[y] || []).forEach(function (rec) {
        var t = rec.t;
        if ((t.adds && t.adds[sid] != null) || (t.drops && t.drops[sid] != null)) out.push(rec);
      });
    });
    out.sort(function (a, b) { return b.t.status_updated - a.t.status_updated; });
    return out;
  }

  // ── one trade card (self-contained; YOU/THEM initiator) ──
  function _sideAssets(t, rid, ctx) {
    var players = ctx.players, assets = [];
    if (t.adds) Object.keys(t.adds).forEach(function (pid) {
      if (t.adds[pid] !== rid) return;
      var p = players[pid]; if (!p) return;
      var name = p.full_name || ((p.first_name || '') + ' ' + (p.last_name || '')).trim();
      if (!name || name.length > 40) return;
      assets.push({ type: 'player', sid: pid, name: name, pos: p.position || '?', team: p.team || '', value: _val(name, ctx.leagueId) });
    });
    (t.draft_picks || []).forEach(function (dp) {
      if (dp.owner_id !== rid) return;
      assets.push({ type: 'pick', label: dp.season + ' Rd' + dp.round, origOwner: ctx.rosterToTeam[dp.roster_id] || ('Team ' + dp.roster_id) });
    });
    var faab = (t.waiver_budget || []).find(function (w) { return w.receiver === rid; });
    return { assets: assets, faab: faab };
  }

  function cardHtml(t, ctx, opts) {
    opts = opts || {};
    var hi = String(opts.highlightSid || '');
    var rosterIds = t.roster_ids || [];
    var youInitiated = String(t.creator) === String(cfg.userId);
    var creatorRoster = (ctx.rosters || []).find(function (r) { return r.owner_id === t.creator; });
    var creatorName = creatorRoster ? (ctx.rosterToTeam[creatorRoster.roster_id] || '') : ((ctx.userToName && ctx.userToName[t.creator]) || '');
    var badge = youInitiated
      ? '<span class="th-init you">🫵 You proposed</span>'
      : '<span class="th-init them">' + esc(creatorName || 'Other manager') + ' proposed</span>';

    var sidesHtml = rosterIds.map(function (rid, i) {
      var sa = _sideAssets(t, rid, ctx);
      var isMe = rid === ctx.myRosterId;
      var team = ctx.rosterToTeam[rid] || ('Team ' + rid);
      var rows = sa.assets.map(function (a) {
        var on = a.type === 'player' && String(a.sid) === hi ? ' is-hit' : '';
        if (a.type === 'player') {
          var thumb = a.sid ? '<img class="th-thumb" src="' + CDN + '/content/nfl/players/thumb/' + a.sid + '.jpg" onerror="this.style.visibility=\'hidden\'">' : '<span class="th-thumb"></span>';
          return '<div class="th-asset' + on + '">' + thumb +
            '<span class="th-pos pos-' + String(a.pos).toLowerCase() + '">' + esc(a.pos) + '</span>' +
            '<span class="th-asset-name">' + esc(a.name) + (a.team ? ' <span class="th-team">' + esc(a.team) + '</span>' : '') + '</span>' +
            (a.value ? '<span class="th-asset-val">' + a.value.toLocaleString() + '</span>' : '') + '</div>';
        }
        return '<div class="th-asset"><span class="th-pos pos-pick">PK</span><span class="th-asset-name">' + esc(a.label) + (a.origOwner ? ' <span class="th-team">via ' + esc(a.origOwner) + '</span>' : '') + '</span></div>';
      }).join('');
      var faab = sa.faab ? '<div class="th-asset th-faab">$' + sa.faab.amount + ' FAAB</div>' : '';
      return '<div class="th-side">' +
        '<div class="th-side-label' + (isMe ? ' is-mine' : '') + '">' + esc(team) + (isMe ? ' 🫵' : '') + '</div>' +
        (rows + faab || '<div class="th-asset th-empty">—</div>') + '</div>' +
        (i < rosterIds.length - 1 ? '<div class="th-divider"></div>' : '');
    }).join('');

    return '<div class="th-card' + (youInitiated ? ' th-you' : '') + '">' +
      '<div class="th-card-head">' +
        '<span class="th-league">' + esc(ctx.leagueName || 'League') + '</span>' +
        '<span class="th-date">' + fmtDate(t.status_updated) + '</span>' + badge +
      '</div>' +
      '<div class="th-card-body">' + sidesHtml + '</div></div>';
  }

  // ── search UI ──
  function suggest(query) {
    var box = document.getElementById('th-results'); if (!box) return;
    var q = (query || '').trim().toLowerCase();
    if (!q) { box.style.display = 'none'; box.innerHTML = ''; return; }
    var fp = global.FP_VALUES || {};
    var names = Object.keys(fp).filter(function (n) { return n.toLowerCase().indexOf(q) >= 0; })
      .sort(function (a, b) { return (fp[b].value || 0) - (fp[a].value || 0); }).slice(0, 10);
    if (!names.length) { box.style.display = 'none'; box.innerHTML = ''; return; }
    box.innerHTML = names.map(function (n) {
      var sid = (global.SLEEPER_IDS || {})[n];
      var thumb = sid ? '<img class="th-opt-thumb" src="' + CDN + '/content/nfl/players/thumb/' + sid + '.jpg" onerror="this.style.visibility=\'hidden\'">' : '<span class="th-opt-thumb"></span>';
      return '<div class="th-opt" onmousedown="TradeHistory.pick(\'' + jsq(n) + '\')">' + thumb + '<span class="th-opt-n">' + esc(n) + '</span></div>';
    }).join('');
    box.style.display = '';
  }
  function hideResultsSoon() { setTimeout(function () { var b = document.getElementById('th-results'); if (b) b.style.display = 'none'; }, 150); }

  function pick(name) {
    var inp = document.getElementById('th-search'); if (inp) inp.value = name;
    var box = document.getElementById('th-results'); if (box) box.style.display = 'none';
    showTradesFor(name);
  }

  async function showTradesFor(name) {
    var mount = document.getElementById('th-cards'); if (!mount) return;
    if (cfg.onSearch) cfg.onSearch(name);   // let the host toggle its own default view
    var sid = (global.SLEEPER_IDS || {})[name];
    mount.innerHTML = '<div class="th-msg">Loading your trade history…</div>';
    try { await ensure(); }
    catch (e) { mount.innerHTML = '<div class="th-msg">Could not load your trade history — please try again.</div>'; return; }
    if (!sid) { mount.innerHTML = '<div class="th-msg">No Sleeper match for ' + esc(name) + '.</div>'; return; }
    var recs = tradesForSid(sid);
    if (!recs.length) { mount.innerHTML = '<div class="th-msg">No trades found for <b>' + esc(name) + '</b> across your leagues.</div>'; return; }
    var youCount = recs.filter(function (r) { return String(r.t.creator) === String(cfg.userId); }).length;
    mount.innerHTML = '<div class="th-summary"><b>' + esc(name) + '</b> — ' + recs.length + ' trade' + (recs.length !== 1 ? 's' : '') +
      ' · you proposed ' + youCount + ', they proposed ' + (recs.length - youCount) + '</div>' +
      recs.map(function (r) { return cardHtml(r.t, r.ctx, { highlightSid: sid }); }).join('');
  }

  global.TradeHistory = {
    init: function (c) { cfg = Object.assign({ userId: null, getLeagues: null }, c || {}); },
    ensure: ensure,
    suggest: suggest,
    hideResultsSoon: hideResultsSoon,
    pick: pick,
    showTradesFor: showTradesFor,
    tradesForSid: tradesForSid,
    cardHtml: cardHtml
  };
})(window);
