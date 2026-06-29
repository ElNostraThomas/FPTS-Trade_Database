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
  // On a missing headshot, drop the broken img but KEEP the element visible so its
  // .tc-wv-thumb disc background shows (matches the no-sid <span> placeholder) — the old
  // visibility:hidden hid the disc too, leaving a blank gap.
  function thumbBySid(sid) { return sid ? ('<img class="tc-wv-thumb" src="' + CDN + '/content/nfl/players/thumb/' + sid + '.jpg" onerror="this.onerror=null;this.removeAttribute(\'src\')">') : '<span class="tc-wv-thumb"></span>'; }
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
    var _cl = document.getElementById('tc-wv-clear'); if (_cl) _cl.style.display = q ? '' : 'none';
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
  // One-click reset: clear the input + dropdown + the selected-player availability →
  // back to the league board (no need to backspace the search bar).
  function clearSearch() {
    var inp = document.getElementById('tc-wv-search'); if (inp) inp.value = '';
    var box = document.getElementById('tc-wv-results'); if (box) { box.style.display = 'none'; box.innerHTML = ''; }
    var av = document.getElementById('tc-wv-avail'); if (av) av.innerHTML = '';
    var cl = document.getElementById('tc-wv-clear'); if (cl) cl.style.display = 'none';
    if (inp) inp.focus();
  }
  function pick(name) {
    var inp = document.getElementById('tc-wv-search'); if (inp) inp.value = name;
    var box = document.getElementById('tc-wv-results'); if (box) box.style.display = 'none';
    selectPlayer(name);
  }

  // League-row used by both the search availability panel and the inline board-row expansions.
  function _lgRow(r, action) {
    var av = r.avatar
      ? '<img class="tc-wv-lg-av" src="' + CDN + '/avatars/thumbs/' + r.avatar + '" onerror="this.style.visibility=\'hidden\'">'
      : '<span class="tc-wv-lg-av"></span>';
    return '<div class="tc-wv-lg-row">' + av +
      '<div class="tc-wv-lg-info"><div class="tc-wv-lg-name">' + esc(r.leagueName) + '</div><div class="tc-wv-lg-fmt">' + esc(r.format) + '</div></div>' +
      action + '</div>';
  }
  // Grouped per-league availability (Free / Owned by a manager / On your roster) for a sid.
  function _availGroupsHtml(sid, name) {
    var rows = availability(sid);
    if (!rows.length) return '<div class="tc-wv-empty">No leagues loaded yet.</div>';
    var free = rows.filter(function (r) { return r.status === 'free'; });
    var taken = rows.filter(function (r) { return r.status === 'taken'; });
    var mine = rows.filter(function (r) { return r.status === 'mine'; });
    var parts = [];
    if (free.length) {
      parts.push('<div class="tc-wv-group">Available — Free Agent <span class="tc-wv-group-n">' + free.length + '</span></div>');
      parts.push(free.map(function (r) { return _lgRow(r, '<a class="tc-wv-claim" href="' + sleeperUrl(r.leagueId) + '" target="_blank" rel="noopener">Claim On Sleeper ↗</a>'); }).join(''));
    }
    if (taken.length) {
      parts.push('<div class="tc-wv-group">Owned by a manager <span class="tc-wv-group-n">' + taken.length + '</span></div>');
      parts.push(taken.map(function (r) { return _lgRow(r, '<span class="tc-wv-owned">' + esc(r.ownerName) + '</span>'); }).join(''));
    }
    if (mine.length) {
      parts.push('<div class="tc-wv-group">On your roster <span class="tc-wv-group-n">' + mine.length + '</span></div>');
      parts.push(mine.map(function (r) { return _lgRow(r, '<span class="tc-wv-mine">★ You own</span>'); }).join(''));
    }
    return parts.join('');
  }

  // Render the per-league availability for the picked player (search-box selection).
  function selectPlayer(name) {
    var mount = document.getElementById('tc-wv-avail'); if (!mount) return;
    var _cl = document.getElementById('tc-wv-clear'); if (_cl) _cl.style.display = '';
    var sid = (global.SLEEPER_IDS || {})[name];
    if (!sid) { mount.innerHTML = '<div class="tc-wv-empty">No Sleeper match for ' + esc(name) + '.</div>'; return; }
    var rows = availability(sid);
    if (!rows.length) { mount.innerHTML = '<div class="tc-wv-empty">No leagues loaded yet.</div>'; return; }
    var free = rows.filter(function (r) { return r.status === 'free'; });
    var fp = (global.FP_VALUES || {})[name] || {};
    mount.innerHTML = '<div class="tc-wv-avail-head">' + thumbBySid(sid) +
      '<span class="tc-wv-avail-name">' + esc(name) + '</span>' + teamLogo(fp.team) +
      (fp.value ? '<span class="tc-wv-avail-val">' + fp.value.toLocaleString() + '</span>' : '<span class="tc-wv-avail-val tc-wv-nr" title="No dynasty value — not ranked">NR</span>') +
      '<span class="tc-wv-avail-summary">Available in ' + free.length + ' of ' + rows.length + ' leagues</span></div>' +
      _availGroupsHtml(String(sid), name);
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
  // ── cross-league board: Most Valuable Available + Most Added (available in ANY league) ──
  var _trendingLoading = false;

  function _leagues() {
    var all = global.ML_ALL_LEAGUE_DATA || {};
    return Object.keys(all).filter(function (id) { return all[id]; }).map(function (id) {
      var d = all[id], lg = d.league || {};
      return { id: id, name: lg.name || d.leagueName || ('League ' + id) };
    }).sort(function (a, b) { return a.name.localeCompare(b.name); });
  }
  function _rosteredSet(leagueId) {
    var d = (global.ML_ALL_LEAGUE_DATA || {})[leagueId], s = {};
    ((d && d.rosters) || []).forEach(function (r) { (r.players || []).forEach(function (pid) { s[String(pid)] = 1; }); });
    return s;
  }
  // An INCOMING rookie hasn't played an NFL down yet (no current AND no prior PPG) —
  // in dynasty he arrives via the ROOKIE DRAFT, not waivers, so he shouldn't surface
  // as a claimable free agent before that draft. The flag clears automatically once
  // he plays (ppg populates). Age guard avoids mis-flagging a vet with missing stats.
  function _isIncomingRookie(k) {
    if (!k) return false;
    var noProd = !(+k.ppg > 0) && !(+k.ppgPrior > 0);
    var young = (k.age == null) || (+k.age <= 24);
    return noProd && young;
  }
  // Highest-value players available (a free agent in at least ONE of your leagues),
  // ranked by canonical dynasty value. `freeN` = how many of your leagues he's free in.
  function _bestAvailable() {
    var fp = global.FP_VALUES || {}, ids = global.SLEEPER_IDS || {};
    var leagues = _leagues(); if (!leagues.length) return [];
    var sets = leagues.map(function (l) { return _rosteredSet(l.id); }), nLg = leagues.length, out = [];
    Object.keys(fp).forEach(function (name) {
      var k = fp[name]; if (!k) return;
      var rookie = _isIncomingRookie(k);  // not a waiver claim — comes via the rookie draft; LABELED below, not hidden
      var sid = k.sleeperId || ids[name]; if (!sid) return; sid = String(sid);
      var v = k.value || 0; if (v <= 0) return;
      var freeN = 0; for (var i = 0; i < nLg; i++) { if (!sets[i][sid]) freeN++; }
      if (!freeN) return;                 // rostered in every league → not available anywhere
      out.push({ sid: sid, name: name, pos: k.pos || (k.posRank || '').replace(/[0-9]+$/, '') || 'WR', team: k.team || '', value: v, posRank: k.posRank || '', freeN: freeN, totalLg: nLg, rookie: rookie });
    });
    out.sort(function (a, b) { return b.value - a.value; });
    return out.slice(0, 30);
  }
  // Global trending adds, filtered to players available (free) in at least one league.
  function _addedHere() {
    if (!_raw) return null;
    return _mapTrending(_raw.adds).filter(function (p) { return p.free > 0; });
  }
  function _fmtCount(n) { n = n || 0; return n >= 1000 ? (Math.round(n / 100) / 10) + 'k' : String(n); }

  // A board row collapses an inline expansion (.tc-wv-row-exp) that lists which of your
  // leagues the player is free/owned/yours in. The caret signals it's tappable.
  function _freeTag(p) {
    return p.freeN ? '<span class="tc-wv-tag free" title="Free agent in ' + p.freeN + ' of ' + p.totalLg + ' of your leagues">' + p.freeN + ' lg</span>' : '';
  }
  // An incoming rookie shows up "free" everywhere, but you can't waiver-claim him — he's
  // acquired through the league's rookie draft. Label it instead of the free-count tag.
  function _rookieTag() {
    return '<span class="tc-wv-tag rookie" title="Not a waiver claim — this rookie is acquired through your league\'s rookie draft">rookie draft</span>';
  }
  function _valueRow(p) {
    var pos = p.pos || 'WR';
    return '<div class="tc-wv-trend-item"><div class="tc-wv-trend-row" data-name="' + esc(p.name) + '" onclick="WaiverWire.toggleRow(this)">' +
      thumbBySid(p.sid) +
      '<span class="ml-calc-asset-pos pos-' + pos.toLowerCase() + '">' + esc(pos) + '</span>' +
      '<span class="tc-wv-trend-id"><span class="tc-wv-trend-name">' + esc(p.name) + '</span>' + teamLogo(p.team, 'tc-wv-team--sm') + '</span>' +
      (p.rookie ? _rookieTag() : _freeTag(p)) +
      '<span class="tc-wv-trend-val">' + (p.value || 0).toLocaleString() + '</span>' +
      '<span class="tc-wv-caret">▾</span></div><div class="tc-wv-row-exp" hidden></div></div>';
  }
  function _addedRow(p) {
    var pos = p.pos || 'WR';
    var val = p.value ? '<span class="tc-wv-trend-val">' + p.value.toLocaleString() + '</span>' : '<span class="tc-wv-trend-val tc-wv-nr">NR</span>';
    return '<div class="tc-wv-trend-item"><div class="tc-wv-trend-row" data-name="' + esc(p.name) + '" onclick="WaiverWire.toggleRow(this)">' +
      thumbBySid(p.sid) +
      '<span class="ml-calc-asset-pos pos-' + pos.toLowerCase() + '">' + esc(pos) + '</span>' +
      '<span class="tc-wv-trend-id"><span class="tc-wv-trend-name">' + esc(p.name) + '</span>' + teamLogo(p.team, 'tc-wv-team--sm') + '</span>' +
      val + '<span class="tc-wv-addcount">🔥 ' + _fmtCount(p.count) + '</span>' +
      '<span class="tc-wv-caret">▾</span></div><div class="tc-wv-row-exp" hidden></div></div>';
  }
  // Expand/collapse a board row to reveal the per-league availability (lazy, cached once).
  function toggleRow(rowEl) {
    var item = rowEl && rowEl.parentNode; if (!item) return;
    var exp = item.querySelector('.tc-wv-row-exp'); if (!exp) return;
    var open = item.classList.toggle('open');
    if (open && !exp.dataset.loaded) {
      var name = rowEl.getAttribute('data-name');
      var sid = (global.SLEEPER_IDS || {})[name] || ((global.FP_VALUES || {})[name] || {}).sleeperId;
      exp.innerHTML = sid ? _availGroupsHtml(String(sid), name) : '<div class="tc-wv-empty">No Sleeper match for ' + esc(name) + '.</div>';
      exp.dataset.loaded = '1';
    }
    exp.hidden = !open;
  }

  // Kept for backward-compat (My Leagues calls it with its focused league id); the board
  // is cross-league now, so the id is ignored — just (re)render.
  function setLeague() { renderBoard(); }

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
    var leagues = _leagues();
    if (!leagues.length || !Object.keys(_playersDict()).length) {
      if (valEl) valEl.innerHTML = '<div class="tc-wv-trend-head">Most Valuable Available</div><div class="tc-wv-empty">Loading your leagues…</div>';
      if (addEl) addEl.innerHTML = '<div class="tc-wv-trend-head">Most Added · 7d</div><div class="tc-wv-empty">Loading your leagues…</div>';
      return;
    }
    var best = _bestAvailable();
    if (valEl) valEl.innerHTML = '<div class="tc-wv-trend-head">Most Valuable Available</div>' + (best.map(_valueRow).join('') || '<div class="tc-wv-empty">—</div>');
    var added = _addedHere();
    if (addEl) addEl.innerHTML = '<div class="tc-wv-trend-head">Most Added · 7d</div>' +
      (added === null ? '<div class="tc-wv-empty">Loading trends…</div>'
        : (added.length ? added.map(_addedRow).join('') : '<div class="tc-wv-empty">No trending adds available.</div>'));
  }

  global.WaiverWire = {
    init: function (c) { cfg = c || {}; },
    availability: availability,
    search: search,
    hideResultsSoon: hideResultsSoon,
    clearSearch: clearSearch,
    pick: pick,
    selectPlayer: selectPlayer,
    loadTrending: loadTrending,
    setLeague: setLeague,
    toggleRow: toggleRow,
    renderTrending: renderBoard
  };
})(window);
