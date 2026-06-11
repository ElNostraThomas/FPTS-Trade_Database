/* ════════════════════════════════════════════════════════════════════════════
   waiver-wire.js — window.WaiverWire.
   Search a player's availability across the user's leagues + show global Sleeper
   trending adds/drops (last 7 days). Reads the same globals the other modules use:
   window.ML_ALL_LEAGUE_DATA (rosters/users/players/league per league), FP_VALUES,
   SLEEPER_IDS. No write to Sleeper (no API) — "Claim On Sleeper" opens the league.
   ════════════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var API = 'https://api.sleeper.app/v1';
  var CDN = 'https://sleepercdn.com';
  var cfg = {};
  var _raw = null;          // raw Sleeper trending [{player_id,count}] cached per session (mapped at render time)

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function jsq(s) { return String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }
  function thumbBySid(sid) { return sid ? ('<img class="tc-wv-thumb" src="' + CDN + '/content/nfl/players/thumb/' + sid + '.jpg" onerror="this.style.visibility=\'hidden\'">') : '<span class="tc-wv-thumb"></span>'; }
  function thumbByName(name) { return thumbBySid((global.SLEEPER_IDS || {})[name]); }
  // Player's NFL team logo. Free agents (no team) get the NFL shield instead of a
  // blank/broken logo; a missing team-logo PNG also falls back to the shield.
  function teamLogo(team, extraCls) {
    var t = team ? String(team).trim() : '';
    var cls = 'tc-wv-team' + (extraCls ? ' ' + extraCls : '');
    var shield = 'https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png';
    if (!t || t === 'FA' || t === '—' || t === 'N/A') {
      return '<img class="' + cls + '" src="' + shield + '" alt="NFL" title="Free agent" onerror="this.style.display=\'none\'">';
    }
    return '<img class="' + cls + '" src="' + CDN + '/images/team_logos/nfl/' + t.toLowerCase() + '.png" alt="' + esc(t) + '" title="' + esc(t) + '" onerror="this.onerror=function(){this.style.display=\'none\'};this.src=\'' + shield + '\'">';
  }
  function sleeperUrl(lid) {
    if (!lid) return '#';
    var m = false; try { m = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || ''); } catch (e) {}
    return m ? ('https://sleeper.com/leagues/' + lid) : ('https://sleeper.com/leagues/' + lid + '/team');
  }

  function fmtStr(lg) {
    if (!lg) return '';
    var rp = lg.roster_positions || [];
    var qb = rp.indexOf('SUPER_FLEX') >= 0 ? 'SF' : '1QB';
    var teams = lg.total_rosters || '';
    var ss = lg.scoring_settings || {};
    var rec = ss.rec || 0;
    var ppr = rec >= 0.99 ? 'PPR' : rec >= 0.49 ? 'Half PPR' : 'Std';
    var tep = (ss.bonus_rec_te || 0) >= 0.49 ? ' TEP' : '';
    return (teams ? teams + '-team ' : '') + qb + ' ' + ppr + tep;
  }

  // Per-league availability for a sleeperId: free / mine / taken in each of your leagues.
  function availability(sid) {
    sid = String(sid);
    var all = global.ML_ALL_LEAGUE_DATA || {};
    var out = [];
    Object.keys(all).forEach(function (lid) {
      var d = all[lid]; if (!d) return;
      var lg = d.league || {};
      var row = {
        leagueId: lid,
        leagueName: lg.name || d.leagueName || ('League ' + lid),
        format: fmtStr(lg),
        avatar: lg.avatar || null
      };
      var owning = (d.rosters || []).find(function (r) { return (r.players || []).map(String).indexOf(sid) >= 0; });
      if (!owning) { row.status = 'free'; }
      else if (String(owning.roster_id) === String(d.myRosterId)) { row.status = 'mine'; }
      else {
        var u = (d.users || []).find(function (x) { return x.user_id === owning.owner_id; });
        row.status = 'taken';
        row.ownerName = (u && u.metadata && u.metadata.team_name) || (u && u.display_name) || ('Team ' + owning.roster_id);
      }
      out.push(row);
    });
    return out;
  }
  function freeCount(sid) { return availability(sid).filter(function (r) { return r.status === 'free'; }).length; }

  // ── player search (autocomplete over FP_VALUES) ──
  function search(query) {
    var box = document.getElementById('tc-wv-results'); if (!box) return;
    var q = (query || '').trim().toLowerCase();
    // Empty box → clear the dropdown AND the selected-player availability, so deleting
    // the name returns to the "board" (just the trending lists below).
    if (!q) { box.style.display = 'none'; box.innerHTML = ''; var av = document.getElementById('tc-wv-avail'); if (av) av.innerHTML = ''; return; }
    var fp = global.FP_VALUES || {};
    var names = Object.keys(fp)
      .filter(function (n) { return n.toLowerCase().indexOf(q) >= 0; })
      .sort(function (a, b) { return (fp[b].value || 0) - (fp[a].value || 0); })
      .slice(0, 10);
    if (!names.length) { box.style.display = 'none'; box.innerHTML = ''; return; }
    box.innerHTML = names.map(function (n) {
      var pr = (fp[n] && fp[n].posRank) || '';
      return '<div class="tc-wv-opt" onmousedown="WaiverWire.pick(\'' + jsq(n) + '\')">' + thumbByName(n) +
        '<span class="tc-wv-opt-n">' + esc(n) + '</span><span class="tc-wv-opt-r">' + esc(pr) + '</span></div>';
    }).join('');
    box.style.display = '';
  }
  function hideResultsSoon() { setTimeout(function () { var b = document.getElementById('tc-wv-results'); if (b) b.style.display = 'none'; }, 150); }
  function pick(name) {
    var inp = document.getElementById('tc-wv-search'); if (inp) inp.value = name;
    var box = document.getElementById('tc-wv-results'); if (box) box.style.display = 'none';
    selectPlayer(name);
  }

  // Render the per-league availability for the picked player.
  function selectPlayer(name) {
    var mount = document.getElementById('tc-wv-avail'); if (!mount) return;
    var sid = (global.SLEEPER_IDS || {})[name];
    if (!sid) { mount.innerHTML = '<div class="tc-wv-empty">No Sleeper match for ' + esc(name) + '.</div>'; return; }
    var rows = availability(sid);
    if (!rows.length) { mount.innerHTML = '<div class="tc-wv-empty">No leagues loaded yet.</div>'; return; }
    var free = rows.filter(function (r) { return r.status === 'free'; });
    var taken = rows.filter(function (r) { return r.status === 'taken'; });
    var mine = rows.filter(function (r) { return r.status === 'mine'; });
    var fp = (global.FP_VALUES || {})[name] || {};

    var lgRow = function (r, action) {
      var av = r.avatar
        ? '<img class="tc-wv-lg-av" src="' + CDN + '/avatars/thumbs/' + r.avatar + '" onerror="this.style.visibility=\'hidden\'">'
        : '<span class="tc-wv-lg-av"></span>';
      return '<div class="tc-wv-lg-row">' + av +
        '<div class="tc-wv-lg-info"><div class="tc-wv-lg-name">' + esc(r.leagueName) + '</div><div class="tc-wv-lg-fmt">' + esc(r.format) + '</div></div>' +
        action + '</div>';
    };
    var parts = ['<div class="tc-wv-avail-head">' + thumbBySid(sid) +
      '<span class="tc-wv-avail-name">' + esc(name) + '</span>' + teamLogo(fp.team) +
      (fp.value ? '<span class="tc-wv-avail-val">' + fp.value.toLocaleString() + '</span>' : '<span class="tc-wv-avail-val tc-wv-nr" title="No dynasty value — not ranked">NR</span>') +
      '<span class="tc-wv-avail-summary">Available in ' + free.length + ' of ' + rows.length + ' leagues</span></div>'];
    if (free.length) {
      parts.push('<div class="tc-wv-group">Available — Free Agent <span class="tc-wv-group-n">' + free.length + '</span></div>');
      parts.push(free.map(function (r) { return lgRow(r, '<a class="tc-wv-claim" href="' + sleeperUrl(r.leagueId) + '" target="_blank" rel="noopener">Claim On Sleeper ↗</a>'); }).join(''));
    }
    if (taken.length) {
      parts.push('<div class="tc-wv-group">Owned by a manager <span class="tc-wv-group-n">' + taken.length + '</span></div>');
      parts.push(taken.map(function (r) { return lgRow(r, '<span class="tc-wv-owned">' + esc(r.ownerName) + '</span>'); }).join(''));
    }
    if (mine.length) {
      parts.push('<div class="tc-wv-group">On your roster <span class="tc-wv-group-n">' + mine.length + '</span></div>');
      parts.push(mine.map(function (r) { return lgRow(r, '<span class="tc-wv-mine">★ You own</span>'); }).join(''));
    }
    mount.innerHTML = parts.join('');
  }

  // ── trending (global Sleeper, 7-day) ──
  function _playersDict() {
    var all = global.ML_ALL_LEAGUE_DATA || {};
    var k = Object.keys(all)[0];
    return (k && all[k] && all[k].players) || {};
  }
  function _mapTrending(list) {
    var pdict = _playersDict();
    return (list || []).map(function (t) {
      var pid = String(t.player_id);
      var p = pdict[pid] || {};
      var name = p.full_name || ((p.first_name || '') + ' ' + (p.last_name || '')).trim() || pid;
      var fp = (global.FP_VALUES || {})[name] || {};
      return { sid: pid, name: name, pos: p.position || '', team: p.team || fp.team || '', value: fp.value || 0, count: t.count || 0, free: freeCount(pid) };
    });
  }
  // ── league-scoped board: Most Valuable Available + Most Added (available here) ──
  var _leagueId = null, _trendingLoading = false;

  function _leagues() {
    var all = global.ML_ALL_LEAGUE_DATA || {};
    return Object.keys(all).filter(function (id) { return all[id]; }).map(function (id) {
      var d = all[id], lg = d.league || {};
      return { id: id, name: lg.name || d.leagueName || ('League ' + id) };
    }).sort(function (a, b) { return a.name.localeCompare(b.name); });
  }
  function _valueKey(leagueId) {
    var d = (global.ML_ALL_LEAGUE_DATA || {})[leagueId];
    var rp = (d && d.league && d.league.roster_positions) || [];
    return rp.indexOf('SUPER_FLEX') >= 0 ? 'valueSf' : 'value1qb';
  }
  function _rosteredSet(leagueId) {
    var d = (global.ML_ALL_LEAGUE_DATA || {})[leagueId], s = {};
    ((d && d.rosters) || []).forEach(function (r) { (r.players || []).forEach(function (pid) { s[String(pid)] = 1; }); });
    return s;
  }
  // Highest-value players NOT rostered in this league (best free agents by value).
  function _bestAvailable(leagueId) {
    var fp = global.FP_VALUES || {}, rostered = _rosteredSet(leagueId), key = _valueKey(leagueId), out = [];
    Object.keys(fp).forEach(function (name) {
      var k = fp[name]; if (!k) return;
      var sid = k.sleeperId || (global.SLEEPER_IDS || {})[name];
      if (!sid || rostered[String(sid)]) return;
      var v = k[key] || k.value || 0; if (v <= 0) return;
      out.push({ sid: String(sid), name: name, pos: k.pos || (k.posRank || '').replace(/[0-9]+$/, '') || 'WR', team: k.team || '', value: v, posRank: k.posRank || '' });
    });
    out.sort(function (a, b) { return b.value - a.value; });
    return out.slice(0, 30);
  }
  // Global trending adds, filtered to players available (not rostered) in this league.
  function _addedHere(leagueId) {
    if (!_raw) return null;
    var rostered = _rosteredSet(leagueId);
    return _mapTrending(_raw.adds).filter(function (p) { return !rostered[String(p.sid)]; });
  }
  function _fmtCount(n) { n = n || 0; return n >= 1000 ? (Math.round(n / 100) / 10) + 'k' : String(n); }

  function _valueRow(p) {
    var pos = p.pos || 'WR';
    return '<div class="tc-wv-trend-row" onclick="WaiverWire.pick(\'' + jsq(p.name) + '\')">' +
      thumbBySid(p.sid) +
      '<span class="ml-calc-asset-pos pos-' + pos.toLowerCase() + '">' + esc(pos) + '</span>' +
      '<span class="tc-wv-trend-id"><span class="tc-wv-trend-name">' + esc(p.name) + '</span>' + teamLogo(p.team, 'tc-wv-team--sm') + '</span>' +
      (p.posRank ? '<span class="tc-wv-tag none">' + esc(p.posRank) + '</span>' : '') +
      '<span class="tc-wv-trend-val">' + (p.value || 0).toLocaleString() + '</span></div>';
  }
  function _addedRow(p) {
    var pos = p.pos || 'WR';
    var val = p.value ? '<span class="tc-wv-trend-val">' + p.value.toLocaleString() + '</span>' : '<span class="tc-wv-trend-val tc-wv-nr">NR</span>';
    return '<div class="tc-wv-trend-row" onclick="WaiverWire.pick(\'' + jsq(p.name) + '\')">' +
      thumbBySid(p.sid) +
      '<span class="ml-calc-asset-pos pos-' + pos.toLowerCase() + '">' + esc(pos) + '</span>' +
      '<span class="tc-wv-trend-id"><span class="tc-wv-trend-name">' + esc(p.name) + '</span>' + teamLogo(p.team, 'tc-wv-team--sm') + '</span>' +
      val + '<span class="tc-wv-addcount">🔥 ' + _fmtCount(p.count) + '</span></div>';
  }

  function setLeague(id) { _leagueId = id; renderBoard(); }

  function loadTrending() {
    if (!_raw && !_trendingLoading) {
      _trendingLoading = true;
      fetch(API + '/players/nfl/trending/add?lookback_hours=168&limit=40').then(function (r) { return r.json(); }).catch(function () { return []; })
        .then(function (adds) { _raw = { adds: adds || [] }; _trendingLoading = false; renderBoard(); });
    }
    renderBoard();
  }

  function renderBoard() {
    var valEl = document.getElementById('tc-wv-value');
    var addEl = document.getElementById('tc-wv-added');
    var sel = document.getElementById('tc-wv-league');
    var leagues = _leagues();
    // Populate the league picker once the leagues are loaded (and keep it in sync).
    if (sel && sel.dataset.count !== String(leagues.length)) {
      sel.innerHTML = leagues.map(function (l) { return '<option value="' + l.id + '">' + esc(l.name) + '</option>'; }).join('');
      sel.dataset.count = String(leagues.length);
      if (!_leagueId || !leagues.some(function (l) { return l.id === _leagueId; })) _leagueId = leagues.length ? leagues[0].id : null;
      if (_leagueId) sel.value = _leagueId;
    }
    if (!leagues.length || !Object.keys(_playersDict()).length) {
      if (valEl) valEl.innerHTML = '<div class="tc-wv-trend-head">Most Valuable Available</div><div class="tc-wv-empty">Loading your leagues…</div>';
      if (addEl) addEl.innerHTML = '<div class="tc-wv-trend-head">Most Added · 7d</div><div class="tc-wv-empty">Loading your leagues…</div>';
      return;
    }
    if (!_leagueId) _leagueId = leagues[0].id;
    var best = _bestAvailable(_leagueId);
    if (valEl) valEl.innerHTML = '<div class="tc-wv-trend-head">Most Valuable Available</div>' + (best.map(_valueRow).join('') || '<div class="tc-wv-empty">—</div>');
    var added = _addedHere(_leagueId);
    if (addEl) addEl.innerHTML = '<div class="tc-wv-trend-head">Most Added · 7d</div>' +
      (added === null ? '<div class="tc-wv-empty">Loading trends…</div>'
        : (added.length ? added.map(_addedRow).join('') : '<div class="tc-wv-empty">No trending adds available here.</div>'));
  }

  global.WaiverWire = {
    init: function (c) { cfg = c || {}; },
    availability: availability,
    search: search,
    hideResultsSoon: hideResultsSoon,
    pick: pick,
    selectPlayer: selectPlayer,
    loadTrending: loadTrending,
    setLeague: setLeague,
    renderTrending: renderBoard
  };
})(window);
