/* ════════════════════════════════════════════════════════════════════════
   player-profile.js — window.PlayerProfile

   Drives player-profile.html: the Baseball-Savant-style profile built on
   data/profile.json (written by sync-profile.py).

   The percentile math is NOT done here. sync-profile.py precomputes each
   player's percentile within (season, position) over the qualified pool, so
   this module only renders. That keeps the page fast (no distribution pass
   over ~1,100 players in the browser) and keeps one definition of the
   qualifier rules.

   Percentile color is a DIVERGING scale — blue (poor) → neutral gray
   (average) → brand orange (great). See player-profile.css for the
   color-vision validation notes.
   ════════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var PROFILE = null;
  var CURRENT = null;          // the player record on screen
  var CURRENT_SEASON = null;   // season key (string) the bars are showing

  var PROFILE_URL = 'data/profile.json?v=1800700000';

  // ── small helpers ────────────────────────────────────────────────────
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function normName(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  function el(id) { return document.getElementById(id); }

  function fmt(v, spec) {
    if (v == null || isNaN(v)) return '—';
    var d = spec === '0' ? 0 : spec === '2' ? 2 : 1;
    return Number(v).toFixed(d);
  }

  /* Diverging fill for a percentile. Two hues + a neutral midpoint: never a
     rainbow, and gray sits at exactly 50 so "average" reads as average. */
  function pctColor(p) {
    if (p == null) return 'var(--pf-track)';
    if (p >= 50) {
      return 'color-mix(in oklab, var(--pf-great) ' +
             Math.round(((p - 50) / 50) * 100) + '%, var(--pf-mid))';
    }
    return 'color-mix(in oklab, var(--pf-poor) ' +
           Math.round(((50 - p) / 50) * 100) + '%, var(--pf-mid))';
  }

  // ── site-data joins ──────────────────────────────────────────────────
  function siteValues(rec) {
    var vals = global.FP_VALUES || {};
    if (vals[rec.name]) return vals[rec.name];
    var want = normName(rec.name);
    for (var k in vals) { if (normName(k) === want) return vals[k]; }
    return null;
  }

  function adpFor(rec) {
    var payload = global.ADP_PAYLOAD;
    if (!payload || !payload.byMonth) return null;
    var months = Object.keys(payload.byMonth);
    var bucket = payload.byMonth.ALL || payload.byMonth[months[months.length - 1]];
    var rows = bucket && (bucket.startup_sf || bucket.startup_1qb);
    if (!rows) return null;
    var want = normName(rec.name);
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].sleeperId && rec.sleeperId && String(rows[i].sleeperId) === String(rec.sleeperId)) return rows[i];
      if (normName(rows[i].name) === want) return rows[i];
    }
    return null;
  }

  // ── search ───────────────────────────────────────────────────────────
  function onSearch(q) {
    var box = el('pf-search-results');
    if (!PROFILE) return;
    var term = normName(q);
    if (!term) { box.hidden = true; box.innerHTML = ''; return; }

    var hits = [];
    for (var key in PROFILE.players) {
      if (key.indexOf(term) === -1) continue;
      var r = PROFILE.players[key];
      hits.push({ key: key, rec: r, starts: key.indexOf(term) === 0 });
      if (hits.length > 400) break;
    }
    // Prefix matches first, then by most recent season's fantasy points.
    hits.sort(function (a, b) {
      if (a.starts !== b.starts) return a.starts ? -1 : 1;
      return (lastFp(b.rec) || 0) - (lastFp(a.rec) || 0);
    });

    box.innerHTML = hits.slice(0, 12).map(function (h) {
      var pos = h.rec.pos || '';
      return '<div class="pf-search-row" onclick="PlayerProfile.select(\'' + esc(h.key) + '\')">' +
             '<span class="pos-pill ' + esc(pos) + '">' + esc(pos) + '</span>' +
             '<span class="pf-search-name">' + esc(h.rec.name) + '</span>' +
             '<span class="pf-search-meta">' + esc(h.rec.team || '') + '</span>' +
             '</div>';
    }).join('') || '<div class="pf-search-row"><span class="pf-search-meta">No player found.</span></div>';
    box.hidden = false;
  }

  function lastFp(rec) {
    var keys = Object.keys(rec.seasons || {}).sort();
    if (!keys.length) return 0;
    var m = rec.seasons[keys[keys.length - 1]].metrics || {};
    return m.fp || 0;
  }

  function select(key) {
    var rec = PROFILE.players[key];
    if (!rec) return;
    CURRENT = rec;
    el('pf-search-results').hidden = true;
    el('pf-search').value = rec.name;
    el('pf-empty').hidden = true;
    el('pf-content').hidden = false;

    var seasons = Object.keys(rec.seasons).sort();
    CURRENT_SEASON = seasons[seasons.length - 1];

    try {
      history.replaceState(null, '', 'player-profile.html?player=' + encodeURIComponent(rec.name));
    } catch (e) {}

    renderIdentity();
    renderMarket();      // season-independent, so it renders once per player
    renderRedraft();     // reserved placeholder slot; see renderRedraft()
    renderSeasonTabs();
    renderAll();
  }

  function renderAll() {
    renderPercentiles();
    renderUsage();
    renderConsistency();
    renderWeekly();
    renderTable();
  }

  function setSeason(season) {
    CURRENT_SEASON = String(season);
    renderSeasonTabs();
    renderAll();
  }

  // ── identity card ────────────────────────────────────────────────────
  function renderIdentity() {
    var rec = CURRENT;
    var v = siteValues(rec) || {};
    var adp = adpFor(rec);
    var logo = (global.TeamHelpers && global.TeamHelpers.logoUrl)
      ? global.TeamHelpers.logoUrl(rec.team) : null;

    var sf = v.valueSf != null ? v.valueSf : v.value;
    var one = v.value1qb;

    el('pf-identity').innerHTML =
      '<div class="pf-id-name">' + esc(rec.name) + '</div>' +
      '<div class="pf-id-sub">' +
        '<span class="pos-pill ' + esc(rec.pos) + '">' + esc(rec.pos) + '</span>' +
        (logo ? '<img class="pf-id-logo" src="' + esc(logo) + '" alt="' + esc(rec.team) + '">' : '') +
        '<span class="pf-id-team">' + esc(rec.team || '') +
          (rec.age != null ? ' · Age ' + esc(rec.age) : '') +
          (v.posRank ? ' · ' + esc(v.posRank) : '') +
        '</span>' +
      '</div>' +
      '<div class="pf-kpis">' +
        kpi('Dynasty Value (SF)', sf != null ? Number(sf).toLocaleString() : '—', true) +
        kpi('1QB Value', one != null ? Number(one).toLocaleString() : '—', false) +
        kpi('Startup ADP', adp && adp.adp != null ? Number(adp.adp).toFixed(1) : '—', false) +
        kpi('Tier', rec.tier != null ? rec.tier : (v.tier != null ? v.tier : '—'), false) +
      '</div>';

    renderCareer();
  }

  function kpi(label, val, accent) {
    return '<div class="pf-kpi"><div class="pf-kpi-label">' + esc(label) + '</div>' +
           '<div class="pf-kpi-val' + (accent ? ' pf-accent' : '') + '">' + esc(val) + '</div></div>';
  }

  /* Compact career line — one row per season, the way Savant stacks a
     hitter's PA/AB/R/H above the percentile card. */
  function renderCareer() {
    var rec = CURRENT;
    var cols = careerCols(rec.pos);
    var seasons = Object.keys(rec.seasons).sort();

    var head = '<tr><th data-col="season">Season</th>' +
      cols.map(function (c) { return '<th>' + esc(c.label) + '</th>'; }).join('') + '</tr>';

    var body = seasons.map(function (s) {
      var m = rec.seasons[s].metrics || {};
      return '<tr><td class="pf-col-season">' + esc(s) + '</td>' +
        cols.map(function (c) {
          return '<td>' + esc(fmt(m[c.key], c.fmt)) + '</td>';
        }).join('') + '</tr>';
    }).join('');

    el('pf-career').innerHTML =
      '<div class="pf-table-scroll"><table class="pf-table" style="min-width:0">' +
      '<thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>';
  }

  function careerCols(pos) {
    if (pos === 'QB') return [
      { key: 'games', label: 'G', fmt: '0' }, { key: 'passYds', label: 'Pass Yds', fmt: '0' },
      { key: 'passTd', label: 'TD', fmt: '0' }, { key: 'passInt', label: 'INT', fmt: '0' },
      { key: 'rushYds', label: 'Rush Yds', fmt: '0' }, { key: 'fpg', label: 'PPG', fmt: '1' }];
    if (pos === 'RB') return [
      { key: 'games', label: 'G', fmt: '0' }, { key: 'rushAtt', label: 'Att', fmt: '0' },
      { key: 'rushYds', label: 'Rush Yds', fmt: '0' }, { key: 'rec', label: 'Rec', fmt: '0' },
      { key: 'recYds', label: 'Rec Yds', fmt: '0' }, { key: 'totalTd', label: 'TD', fmt: '0' },
      { key: 'fpg', label: 'PPG', fmt: '1' }];
    return [
      { key: 'games', label: 'G', fmt: '0' }, { key: 'tgt', label: 'Tgt', fmt: '0' },
      { key: 'rec', label: 'Rec', fmt: '0' }, { key: 'recYds', label: 'Yds', fmt: '0' },
      { key: 'recTd', label: 'TD', fmt: '0' }, { key: 'fpg', label: 'PPG', fmt: '1' }];
  }

  /* ── market card (fills the column under the seasonal table) ──────────
     Dynasty-market context for the player, from MVS_PAYLOAD: where the
     market is moving, how heavily he's being traded, and how tightly the
     five contributor rankings agree. Season-independent, so it renders once
     per player rather than per season tab. */
  function renderMarket() {
    var mount = el('pf-market');
    var mvs = (global.MVS_PAYLOAD && global.MVS_PAYLOAD.players) || {};
    var rec = mvs[CURRENT.name];
    if (!rec) {
      var want = normName(CURRENT.name);
      for (var k in mvs) { if (normName(k) === want) { rec = mvs[k]; break; } }
    }
    if (!rec) { mount.innerHTML = ''; return; }

    var trend = rec.trend || 0;
    var trendTxt = (trend > 0 ? '+' : '') + Number(trend).toLocaleString();

    var html = '<div class="pf-block-title">Dynasty Market</div>' +
      '<div class="pf-kpis">' +
        kpi('Value Trend', trendTxt, trend > 0) +
        kpi('Trades (7d)', Number(rec.tradesLastWeek || 0).toLocaleString(), false) +
        kpi('On The Clock', rec.otcValue != null ? Number(rec.otcValue).toLocaleString() : '—', false) +
        kpi('OTC Diff', rec.otcDiff != null ? (rec.otcDiff > 0 ? '+' : '') +
            Number(rec.otcDiff).toLocaleString() : '—', false) +
      '</div>';

    mount.innerHTML = html;
  }

  /* ── redraft market (PLACEHOLDER) ─────────────────────────────────────
     Reserved slot, deliberately NOT wired to data yet.

     The market export already carries a full redraft family — mvs_redraft_sf,
     mvs_redraft_1qb and their baseline / history / change / last-week /
     trade-count siblings, plus recent_trades_redraft (15 columns added in the
     2026-07-29 export). Nothing on the site reads them.

     Filling this in is NOT just a rendering change: sync-mvs.py needs a
     value-basis decision for redraft (dynasty values carry a modeled TEP
     premium; whether redraft should too is a product call), and a third
     format key has to be threaded through FP_VALUES / mlFpValue alongside
     SF and 1QB. Until that happens this renders empty slots rather than
     zeros, so nothing here can be mistaken for a real valuation. */
  function renderRedraft() {
    el('pf-redraft').innerHTML =
      '<div class="pf-block-title">Redraft Market</div>' +
      '<div class="pf-placeholder">' +
        '<div class="pf-kpis" style="margin-bottom:10px">' +
          kpi('Redraft Value (SF)', '—', false) +
          kpi('Redraft 1QB', '—', false) +
          kpi('Redraft Trend', '—', false) +
          kpi('Redraft Trades (7d)', '—', false) +
        '</div>' +
        '<div class="pf-placeholder-note">Not wired yet. The market export already ships ' +
        'the redraft value family (<code>mvs_redraft_sf</code> / <code>_1qb</code> plus ' +
        'baseline, trend and trade-count columns) — surfacing it needs a value-basis call ' +
        'in <code>sync-mvs.py</code> and a third format key threaded through ' +
        '<code>FP_VALUES</code>.</div>' +
      '</div>';
  }

  /* ── consistency (fills the column under Usage Share) ─────────────────
     Boom/bust read from the weekly game log. Thresholds are RELATIVE to the
     player's own season average rather than a flat 20/10-point line, so the
     same definition works for a QB and a TE without inventing a
     position-specific constant. */
  var BOOM_MULT = 1.5, BUST_MULT = 0.5;

  function renderConsistency() {
    var mount = el('pf-consistency');
    var weeks = (CURRENT.seasons[CURRENT_SEASON].weeks || []).slice();
    if (weeks.length < 2) { mount.innerHTML = ''; return; }

    var pts = weeks.map(function (w) { return w.fp; });
    var sum = pts.reduce(function (a, b) { return a + b; }, 0);
    var avg = sum / pts.length;
    var boomLine = avg * BOOM_MULT, bustLine = avg * BUST_MULT;
    var booms = pts.filter(function (v) { return v >= boomLine; }).length;
    var busts = pts.filter(function (v) { return v <= bustLine; }).length;

    var best = weeks.reduce(function (a, b) { return b.fp > a.fp ? b : a; });
    var worst = weeks.reduce(function (a, b) { return b.fp < a.fp ? b : a; });

    // Coefficient of variation — spread relative to the mean, so it's
    // comparable across players with different scoring levels.
    var variance = pts.reduce(function (a, v) { return a + (v - avg) * (v - avg); }, 0) / pts.length;
    var cv = avg ? (Math.sqrt(variance) / avg) * 100 : 0;

    var mx = Math.max.apply(null, pts) || 1;
    var strip = weeks.map(function (w) {
      var cls = w.fp >= boomLine ? 'pf-wk-boom' : (w.fp <= bustLine ? 'pf-wk-bust' : '');
      return '<div class="pf-wk ' + cls + '" title="' +
             esc('Wk ' + w.w + (w.opp ? ' vs ' + w.opp : '') + ' — ' + w.fp.toFixed(1) + ' pts') +
             '"><div class="pf-wk-bar" style="height:' +
             Math.max(4, (w.fp / mx) * 100) + '%"></div>' +
             '<div class="pf-wk-num">' + w.w + '</div></div>';
    }).join('');

    mount.innerHTML =
      '<div class="pf-block-title">Consistency — ' + esc(CURRENT_SEASON) + '</div>' +
      '<div class="pf-kpis">' +
        kpi('Boom Games', booms + ' of ' + pts.length, true) +
        kpi('Bust Games', busts + ' of ' + pts.length, false) +
        kpi('Best Week', best.fp.toFixed(1) + (best.opp ? ' vs ' + best.opp : ''), false) +
        kpi('Volatility', cv.toFixed(0) + '%', false) +
      '</div>' +
      '<div class="pf-wk-strip">' + strip + '</div>' +
      '<div class="pf-legend" style="flex-direction:row;gap:14px;margin-top:8px;flex-wrap:wrap">' +
        '<div class="pf-legend-item"><span class="pf-swatch" style="background:var(--red)"></span>' +
          'Boom <span class="pf-legend-val">&ge;' + boomLine.toFixed(1) + '</span></div>' +
        '<div class="pf-legend-item"><span class="pf-swatch" style="background:var(--pos-wr-bg)"></span>' +
          'Bust <span class="pf-legend-val">&le;' + bustLine.toFixed(1) + '</span></div>' +
      '</div>' +
      '<div class="pf-note" style="margin:8px 0 0">Boom/bust are set at ' + BOOM_MULT +
      'x and ' + BUST_MULT + 'x his own ' + avg.toFixed(1) +
      '-point average, so the read holds across positions. Volatility is the ' +
      'coefficient of variation — lower is steadier.</div>';
  }

  // ── season tabs ──────────────────────────────────────────────────────
  function renderSeasonTabs() {
    var seasons = Object.keys(CURRENT.seasons).sort();
    el('pf-season-tabs').innerHTML = seasons.map(function (s) {
      return '<button class="pf-season-tab' + (s === CURRENT_SEASON ? ' active' : '') +
             '" onclick="PlayerProfile.setSeason(\'' + esc(s) + '\')">' + esc(s) + '</button>';
    }).join('');
    el('pf-pct-season').textContent = CURRENT_SEASON;
    el('pf-weekly-season').textContent = CURRENT_SEASON;
  }

  // ── percentile bars (the hero) ───────────────────────────────────────
  function renderPercentiles() {
    var season = CURRENT.seasons[CURRENT_SEASON];
    var specs = PROFILE.metrics[CURRENT.pos] || [];
    var metrics = season.metrics || {};
    var pcts = season.pct || {};
    var ranked = Object.keys(pcts).length > 0;

    var html = '';
    (PROFILE.groupOrder || []).forEach(function (group) {
      var rows = specs.filter(function (s) { return s.group === group; });
      if (!rows.length) return;

      html += '<div class="pf-group">';
      html += '<div class="pf-group-title">' + esc(group) + '</div>';
      html += '<div class="pf-scale"><div></div>' +
              '<div class="pf-scale-track">' +
                '<span class="pf-scale-poor">Poor</span>' +
                '<span class="pf-scale-avg">Average</span>' +
                '<span class="pf-scale-great">Great</span>' +
              '</div><div></div></div>';

      rows.forEach(function (s) {
        var raw = metrics[s.key];
        var p = pcts[s.key];
        var has = p != null;
        var title = s.label + ': ' + fmt(raw, s.fmt) +
                    (has ? ' — ' + ordinal(p) + ' percentile among ' + CURRENT.pos +
                           's who scored in ' + CURRENT_SEASON +
                           (s.invert ? ' (lower is better)' : '')
                         : ' — not ranked: ' + floorReason(s.key));

        html += '<div class="pf-bar-row' + (has ? '' : ' pf-unranked') + '" title="' + esc(title) + '">' +
          '<div class="pf-bar-label">' + esc(s.label) + '</div>' +
          '<div class="pf-bar-track">' +
            (has ? '<div class="pf-bar-fill" style="width:' + p + '%;background:' + pctColor(p) + '"></div>' +
                   // Bubble travels between its own half-widths, not 0–100% of
                   // the track, so percentile 0 and 100 stay fully inside.
                   '<div class="pf-bubble" style="left:calc(16px + (100% - 32px) * ' + p +
                   ' / 100);background:' + pctColor(p) + '">' + ordinal(p) + '</div>'
                 : '') +
          '</div>' +
          '<div class="pf-bar-val">' + esc(fmt(raw, s.fmt)) + '</div>' +
        '</div>';
      });
      html += '</div>';
    });

    if (!ranked) {
      var q = (PROFILE.qualifiers || {})[CURRENT.pos] || {};
      html += '<div class="pf-qual-note"><strong>Not percentile-ranked for ' + esc(CURRENT_SEASON) +
              '.</strong> Ranking requires at least ' + esc(q.games) + ' games and ' +
              esc(q.min) + ' ' + esc(qualWord(CURRENT.pos)) +
              ' — a small sample turns a rate stat into noise. Raw values are still shown.</div>';
    }

    var poolN = (PROFILE.seasonMeta[CURRENT_SEASON] || {}).pool || {};
    html += '<div class="pf-pct-caption">Each bubble is a <strong>percentile</strong> — ' +
            'where he ranks among all <strong>' + (poolN[CURRENT.pos] || '') + ' ' +
            esc(CURRENT.pos) + 's who scored in ' + esc(CURRENT_SEASON) + '</strong>. ' +
            '96th = better than 96% of them. The number on the right is the raw stat. ' +
            'Rate stats (catch %, yards per carry and the like) need a minimum denominator ' +
            'before they are ranked — without one, two catches on two targets would outrank ' +
            'a target hog. Those rows show the raw value with no bubble.</div>';

    el('pf-pct-body').innerHTML = html;
  }

  /* 96 -> "96th". The bubble is the one place the number appears without
     context, so it carries the ordinal rather than a bare integer that could
     be misread as the stat itself. */
  function ordinal(n) {
    var v = n % 100;
    if (v >= 11 && v <= 13) return n + 'th';
    return n + ({1: 'st', 2: 'nd', 3: 'rd'}[n % 10] || 'th');
  }

  /* Why a rate metric shows no bubble. The pool itself is ungated — every
     player who scored is in it — but a rate stat needs a real denominator
     before it means anything, so each one carries its own floor. */
  function floorReason(mkey) {
    var floors = (PROFILE.rateFloors || {})[CURRENT.pos] || {};
    var f = floors[mkey];
    if (!f) return 'no comparable pool for this season';
    var DEN = { tgt: 'targets', rec: 'receptions', rushAtt: 'carries',
                att: 'pass attempts', db: 'dropbacks' };
    return 'needs at least ' + f[1] + ' ' + (DEN[f[0]] || f[0]) +
           ' for a meaningful rate (he has ' +
           Math.round((CURRENT.seasons[CURRENT_SEASON].metrics || {})[f[0]] || 0) + ')';
  }

  function qualWord(pos) {
    return pos === 'QB' ? 'dropbacks' : pos === 'RB' ? 'touches' : 'targets';
  }

  // ── usage share ──────────────────────────────────────────────────────
  function renderUsage() {
    var m = CURRENT.seasons[CURRENT_SEASON].metrics || {};
    var pos = CURRENT.pos;
    var html = '';

    if (pos === 'RB') {
      var carries = m.rushAtt || 0, catches = m.rec || 0;
      html += donut([
        { label: 'Carries', value: carries, color: 'var(--red)' },
        { label: 'Receptions', value: catches, color: 'var(--pos-wr-bg)' }
      ], 'Touch mix');
      html += shareBar('Target share', m.tgtShare);
      html += shareBar('Inside-5 carry share', m.i5Pct);
      html += shareBar('Team receiving TD share', m.tmTdPct);
    } else if (pos === 'QB') {
      var ptd = m.passTd || 0, rtd = m.rushTd || 0;
      html += donut([
        { label: 'Pass TD', value: ptd, color: 'var(--red)' },
        { label: 'Rush TD', value: rtd, color: 'var(--pos-wr-bg)' }
      ], 'Touchdown mix');
      html += shareBar('Completion %', m.cmpPct);
      html += shareBar('TD %', m.tdPct);
      html += shareBar('Sack % (lower is better)', m.sackPct);
    } else {
      var share = m.tgtShare;
      html += donut([
        { label: 'His targets', value: share || 0, color: 'var(--red)' },
        { label: 'Rest of team', value: Math.max(0, 100 - (share || 0)), color: 'rgba(128,128,128,.35)' }
      ], 'Share of team targets');
      html += shareBar('Target share', m.tgtShare);
      html += shareBar('Team receiving yards share', m.tmYdsPct);
      html += shareBar('Team receiving TD share', m.tmTdPct);
    }

    el('pf-usage').innerHTML = html;
  }

  /* Two-slice donut. Two categories only — beyond that this becomes a
     stacked bar, which is easier to read. Both slices are direct-labeled
     in the legend so identity is never carried by color alone. */
  function donut(parts, caption) {
    var total = parts.reduce(function (a, p) { return a + (p.value || 0); }, 0);
    if (!total) return '<div class="pf-note" style="margin:0 0 14px">No ' + esc(caption.toLowerCase()) + ' data.</div>';

    var R = 52, C = 2 * Math.PI * R, offset = 0;
    var arcs = parts.map(function (p) {
      var frac = (p.value || 0) / total;
      var len = frac * C;
      var seg = '<circle cx="70" cy="70" r="' + R + '" fill="none" stroke="' + p.color +
        '" stroke-width="20" stroke-dasharray="' + (len - 2) + ' ' + (C - len + 2) + '"' +
        ' stroke-dashoffset="' + (-offset) + '" transform="rotate(-90 70 70)">' +
        '<title>' + esc(p.label + ': ' + Math.round(frac * 100) + '%') + '</title></circle>';
      offset += len;
      return seg;
    }).join('');

    var legend = parts.map(function (p) {
      var pctv = Math.round(((p.value || 0) / total) * 100);
      return '<div class="pf-legend-item"><span class="pf-swatch" style="background:' + p.color + '"></span>' +
             esc(p.label) + ' <span class="pf-legend-val">' + pctv + '%</span></div>';
    }).join('');

    return '<div class="pf-donut-wrap">' +
      '<svg class="pf-donut" width="140" height="140" viewBox="0 0 140 140" role="img" aria-label="' +
        esc(caption) + '">' + arcs + '</svg>' +
      '<div class="pf-legend"><div class="pf-kpi-label">' + esc(caption) + '</div>' + legend + '</div>' +
    '</div>';
  }

  function shareBar(label, pct) {
    if (pct == null) return '';
    var w = Math.max(0, Math.min(100, pct));
    return '<div class="pf-share-row">' +
      '<div class="pf-share-head"><span>' + esc(label) + '</span><span>' + pct.toFixed(1) + '%</span></div>' +
      '<div class="pf-share-track"><div class="pf-share-fill" style="width:' + w + '%"></div></div>' +
    '</div>';
  }

  // ── weekly fantasy points ────────────────────────────────────────────
  function renderWeekly() {
    var weeks = CURRENT.seasons[CURRENT_SEASON].weeks || [];
    var mount = el('pf-weekly');
    if (!weeks.length || !global.TrendChart) {
      mount.innerHTML = '<div class="pf-note" style="margin:0">No weekly game log for ' +
                        esc(CURRENT_SEASON) + '.</div>';
      return;
    }
    var points = weeks.map(function (w) {
      return { value: w.fp, label: 'Wk ' + w.w + (w.opp ? ' vs ' + w.opp : '') };
    });
    mount.innerHTML = global.TrendChart.line(points, {
      height: 220,
      color: 'var(--red)',
      xLabels: weeks.map(function (w) { return 'W' + w.w; }),
      legend: 'Fantasy points by week — ' + CURRENT_SEASON,
      showPointLabels: weeks.length <= 12,
      valueFmt: function (v) { return Number(v).toFixed(1); }
    });
  }

  // ── season table (heat-tinted) ───────────────────────────────────────
  function renderTable() {
    var rec = CURRENT;
    var specs = PROFILE.metrics[rec.pos] || [];
    var seasons = Object.keys(rec.seasons).sort();

    var head = '<tr><th data-col="season">Season</th><th>Team</th><th>G</th>' +
      specs.map(function (s) { return '<th>' + esc(s.label) + '</th>'; }).join('') + '</tr>';

    var body = seasons.map(function (s) {
      var sn = rec.seasons[s];
      var m = sn.metrics || {}, p = sn.pct || {};
      return '<tr><td class="pf-col-season">' + esc(s) + '</td>' +
        '<td>' + esc(sn.team || '') + '</td>' +
        '<td>' + esc(m.games != null ? m.games : '—') + '</td>' +
        specs.map(function (sp) {
          var pv = p[sp.key];
          // Tint only true outliers. At a +/-25 threshold an elite player's
          // row tints almost end-to-end and the table reads as one orange
          // block — a heatmap, not a stat table. 90/10 keeps the tint
          // meaningful.
          var style = '';
          var cls = '';
          if (pv != null && (pv >= 90 || pv <= 10)) {
            style = ' style="background:' + pctColor(pv) + '"';
            cls = ' class="pf-tint"';
          }
          return '<td' + cls + style + ' title="' + esc(sp.label + (pv != null ? ' — ' + pv + 'th pct' : '')) +
                 '">' + esc(fmt(m[sp.key], sp.fmt)) + '</td>';
        }).join('') + '</tr>';
    }).join('');

    el('pf-table').innerHTML =
      '<table class="pf-table"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>';
  }

  // ── init ─────────────────────────────────────────────────────────────
  function init() {
    fetch(PROFILE_URL)
      .then(function (r) {
        if (!r.ok) throw new Error('profile.json HTTP ' + r.status);
        return r.json();
      })
      .then(function (json) {
        PROFILE = json;
        global.PROFILE_PAYLOAD = json;
        var params = new URLSearchParams(global.location.search);
        var want = params.get('player') || params.get('name');
        var id = params.get('id');
        var key = null;
        if (want) {
          key = normName(want);
          if (!PROFILE.players[key]) key = null;
        }
        if (!key && id) {
          for (var k in PROFILE.players) {
            if (String(PROFILE.players[k].sleeperId) === String(id)) { key = k; break; }
          }
        }
        if (key) select(key);
      })
      .catch(function (err) {
        el('pf-empty').innerHTML =
          '<p>Could not load <code>data/profile.json</code> (' + esc(err.message) + ').</p>' +
          '<p class="pf-note">If you opened this file directly, serve it over HTTP — ' +
          '<code>fetch()</code> is blocked on <code>file://</code>. Use <code>start.bat</code>.</p>';
      });

    document.addEventListener('click', function (e) {
      var box = el('pf-search-results');
      if (box && !box.hidden && !e.target.closest('.pf-search-wrap')) box.hidden = true;
    });
  }

  global.PlayerProfile = {
    init: init,
    onSearch: onSearch,
    select: select,
    setSeason: setSeason
  };
})(window);
