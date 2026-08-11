/* ════════════════════════════════════════════════════════════════════════
   prospect-model.js — window.ProspectModel

   Drives prospect-model.html: the rookie-prospect card built on
   data/prospects.json (written by sync-prospects.py).

   ── VISUAL CONTRACT ──────────────────────────────────────────────────
   This page is the ROOKIE-SIDE TWIN of player-profile.html and must be
   visually indistinguishable from it. That is enforced structurally, not by
   eye: the page loads player-profile.css and this module emits the SAME
   `pf-*` class names — pf-grid, pf-card, pf-kpi, pf-group, pf-bar-row,
   pf-bubble, pf-donut, pf-share-row, pf-table, pf-season-tab. The donut,
   share bars and percentile bars below are the profile page's renderers
   reproduced against prospect data, deliberately kept line-for-line similar
   so the two stay in sync when either is restyled.

   prospect-model.css adds only what has no counterpart on the profile page:
   the class board and the historical-comp list.

   ── WHAT THIS PAGE HAS THAT THE PROFILE PAGE DOES NOT ────────────────
     1. MODEL VARIANTS. Each position ships more than one grade (WR base /
        fast-40 dock / final; RB with and without best season; TE pre-combine
        and SPORQ-bonused). All are shown; the card defaults to the one the
        sheet treats as final.
     2. TWO POOLS. Bars rank against every class in the model (DEFAULT) or
        against his own class only (SECOND option). Both precomputed.
     3. HISTORICAL COMPS. Past classes carry the NFL outcome the model was fit
        against, so the nearest grades can be shown with what they became. The
        CURRENT class is never a comp — it has no outcome.

   Like player-profile.js, this module ONLY RENDERS. Every percentile is
   precomputed by sync-prospects.py, so the browser never runs a distribution
   over the 741-prospect corpus and there is one definition of the pool rules.
   ════════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var DATA = null;
  var CURRENT = null;        // prospect record on screen
  var CURRENT_KEY = null;
  var VARIANT = null;        // model-variant key for the position on screen
  var POOL = 'all';          // 'all' (DEFAULT) | 'class' (second option)
  var BOARD_POS = 'ALL';
  var BOARD_CLASS = null;

  var DATA_URL = 'data/prospects.json?v=1801100000';

  // How many historical comps to list around a prospect's grade.
  var COMP_COUNT = 6;

  // ── small helpers (mirrors player-profile.js) ────────────────────────
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function normName(s) {
    return String(s || '').toLowerCase()
      .replace(/\b(jr|sr|ii|iii|iv|v)\b/g, '').replace(/[^a-z0-9]/g, '');
  }
  function el(id) { return document.getElementById(id); }

  function fmt(v, spec) {
    if (v == null || isNaN(v)) return '—';
    var d = spec === '0' ? 0 : spec === '2' ? 2 : spec === '3' ? 3 : 1;
    return Number(v).toFixed(d);
  }

  function ordinal(n) {
    var v = n % 100;
    if (v >= 11 && v <= 13) return n + 'th';
    return n + ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th');
  }

  /* Diverging fill — identical to player-profile.js so a bar means the same
     thing on both pages. Two hues + a neutral midpoint, gray at exactly 50. */
  function pctColor(p) {
    if (p == null) return 'var(--pf-track)';
    if (p >= 50) {
      return 'color-mix(in oklab, var(--pf-great) ' +
             Math.round(((p - 50) / 50) * 100) + '%, var(--pf-mid))';
    }
    return 'color-mix(in oklab, var(--pf-poor) ' +
           Math.round(((50 - p) / 50) * 100) + '%, var(--pf-mid))';
  }

  function kpi(label, val, accent) {
    return '<div class="pf-kpi"><div class="pf-kpi-label">' + esc(label) + '</div>' +
           '<div class="pf-kpi-val' + (accent ? ' pf-accent' : '') + '">' +
           esc(val) + '</div></div>';
  }

  // ── model-variant helpers ────────────────────────────────────────────
  function variantsFor(pos) { return (DATA.models || {})[pos] || []; }

  function defaultVariant(pos) {
    var list = variantsFor(pos);
    for (var i = 0; i < list.length; i++) { if (list[i].default) return list[i].key; }
    return list.length ? list[0].key : null;
  }

  function variantMeta(pos, key) {
    var list = variantsFor(pos);
    for (var i = 0; i < list.length; i++) { if (list[i].key === key) return list[i]; }
    return null;
  }

  /* The percentile map currently in force. Returns null when the class pool is
     too small to rank inside, so the caller can explain the fallback rather
     than silently showing all-classes bars under a "his class" label. */
  function pctMap(rec) {
    if (POOL === 'class') {
      var m = rec.pctClass || {};
      for (var k in m) { return m; }
      return null;
    }
    return rec.pctAll || {};
  }

  function gradeOf(rec, variant) {
    return (rec.models || {})[variant != null ? variant : VARIANT];
  }

  function finalSeason(rec) {
    var s = rec.seasons || [];
    return s.length ? s[s.length - 1] : {};
  }

  // ── search ───────────────────────────────────────────────────────────
  function onSearch(q) {
    var box = el('pm-search-results');
    if (!DATA) return;
    var term = normName(q);
    if (!term) { box.hidden = true; box.innerHTML = ''; return; }

    var hits = [];
    for (var key in DATA.players) {
      if (key.indexOf(term) === -1) continue;
      hits.push({ key: key, rec: DATA.players[key], starts: key.indexOf(term) === 0 });
      if (hits.length > 400) break;
    }
    // Prefix matches first, then the most recent class, then the best grade —
    // typing "tate" in August should surface this year's Carnell Tate first.
    hits.sort(function (a, b) {
      if (a.starts !== b.starts) return a.starts ? -1 : 1;
      if (a.rec['class'] !== b.rec['class']) return b.rec['class'] - a.rec['class'];
      return bestGrade(b.rec) - bestGrade(a.rec);
    });

    box.innerHTML = hits.slice(0, 12).map(function (h) {
      return '<div class="pf-search-row" onclick="ProspectModel.select(\'' + esc(h.key) + '\')">' +
             '<span class="pos-pill ' + esc(h.rec.pos) + '">' + esc(h.rec.pos) + '</span>' +
             '<span class="pf-search-name">' + esc(h.rec.name) + '</span>' +
             '<span class="pf-search-meta">' + esc(h.rec['class']) +
               (h.rec.college ? ' · ' + esc(h.rec.college) : '') + '</span>' +
             '</div>';
    }).join('') || '<div class="pf-search-row"><span class="pf-search-meta">' +
                   'No prospect found. The model covers WR, RB and TE only.</span></div>';
    box.hidden = false;
  }

  function bestGrade(rec) {
    var g = (rec.models || {})[defaultVariant(rec.pos)];
    return g == null ? -1e9 : g;
  }

  // ── selection ────────────────────────────────────────────────────────
  function select(key) {
    var rec = DATA.players[key];
    if (!rec) return;
    CURRENT = rec;
    CURRENT_KEY = key;
    VARIANT = defaultVariant(rec.pos);

    el('pm-search-results').hidden = true;
    el('pm-search').value = rec.name;
    el('pm-board-view').hidden = true;
    el('pm-card-view').hidden = false;

    try {
      history.replaceState(null, '', 'prospect-model.html?player=' +
        encodeURIComponent(rec.name));
    } catch (e) {}

    renderAll();
    if (global.scrollTo) global.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function backToBoard() {
    el('pm-card-view').hidden = true;
    el('pm-board-view').hidden = false;
    el('pm-search').value = '';
    CURRENT = null;
    try { history.replaceState(null, '', 'prospect-model.html'); } catch (e) {}
    renderBoard();
  }

  function setVariant(key) { VARIANT = key; renderAll(); }

  function setPool(p) {
    POOL = p;
    if (CURRENT) renderAll(); else renderBoard();
  }

  function renderAll() {
    renderIdentity();
    renderHero();
    renderMarket();
    renderPoolToggle();
    renderPercentiles();
    renderUsage();
    renderSplits();
    renderComps();
    renderCollege();
  }

  /* ── identity (mirrors player-profile.js renderIdentity) ───────────── */
  function renderIdentity() {
    var rec = CURRENT;
    var mk = rec.market || {};
    var logo = (global.TeamHelpers && global.TeamHelpers.logoUrl && mk.team)
      ? global.TeamHelpers.logoUrl(mk.team) : null;

    el('pm-identity').innerHTML =
      '<div class="pf-id-name">' + esc(rec.name) + '</div>' +
      '<div class="pf-id-sub">' +
        '<span class="pos-pill ' + esc(rec.pos) + '">' + esc(rec.pos) + '</span>' +
        (logo ? '<img class="pf-id-logo" src="' + esc(logo) + '" alt="' + esc(mk.team) + '">' : '') +
        '<span class="pf-id-team">' +
          esc(rec['class']) + ' class' +
          (rec.college ? ' · ' + esc(rec.college) : '') +
          (mk.team ? ' · ' + esc(mk.team) : '') +
          (rec.power === false ? ' · Non-Power' : '') +
        '</span>' +
      '</div>';
  }

  /* ── the grade, as a KPI block + variant tabs ───────────────────────
     Uses the profile page's pf-kpis grid rather than a bespoke hero, so the
     two identity columns line up pixel for pixel. */
  function renderHero() {
    var rec = CURRENT;
    var meta = variantMeta(rec.pos, VARIANT) || {};
    var grade = gradeOf(rec);
    var pm = pctMap(rec);
    var pct = pm ? pm['model:' + VARIANT] : null;
    var rank = rankInPool(rec);

    var html =
      '<div class="pf-kpis">' +
        kpi('Model Grade', grade == null ? '—' : Number(grade).toFixed(1), true) +
        kpi('Percentile', pct == null ? '—' : ordinal(pct)) +
        kpi('Rank', rank ? rank.at + ' / ' + rank.of : '—') +
        kpi('Class', rec['class']) +
      '</div>';

    // Variant tabs — every grade the sheet produces for this position.
    var vs = variantsFor(rec.pos);
    if (vs.length > 1) {
      html += '<div class="pf-block-title" style="margin-top:0">Model Version</div>' +
        '<div class="pf-season-tabs" style="margin:0 0 10px;justify-content:flex-start">' +
        vs.map(function (v) {
          var g = (rec.models || {})[v.key];
          return '<button class="pf-season-tab' + (v.key === VARIANT ? ' active' : '') +
            '" onclick="ProspectModel.setVariant(\'' + esc(v.key) + '\')"' +
            ' title="' + esc(v.blurb || '') + '">' + esc(v.label) +
            (g == null ? '' : ' ' + Number(g).toFixed(0)) + '</button>';
        }).join('') + '</div>';
    }
    if (meta.blurb) {
      html += '<div class="pf-qual-note" style="margin-top:0">' + esc(meta.blurb) + '</div>';
    }

    el('pm-hero').innerHTML = html;
  }

  /* Rank inside whichever pool is selected, by the CURRENT variant. Computed
     here rather than baked in because it depends on the variant on screen. */
  function rankInPool(rec) {
    var g = gradeOf(rec);
    if (g == null) return null;
    var peers = [];
    for (var k in DATA.players) {
      var p = DATA.players[k];
      if (p.pos !== rec.pos) continue;
      if (POOL === 'class' && p['class'] !== rec['class']) continue;
      var pg = (p.models || {})[VARIANT];
      if (pg != null) peers.push(pg);
    }
    if (peers.length < 2) return null;
    peers.sort(function (a, b) { return b - a; });
    return { at: peers.indexOf(g) + 1, of: peers.length };
  }

  /* Pool toggle, rendered as season tabs in the percentile card head — the
     same slot and the same control the profile page uses for its seasons.
     ALL CLASSES IS THE DEFAULT and is listed first; his own class is the
     second option. */
  function renderPoolToggle() {
    var mount = el('pm-pool-toggle');
    if (!mount || !CURRENT) return;
    var small = !CURRENT.pctClass || !Object.keys(CURRENT.pctClass).length;
    mount.innerHTML =
      '<button class="pf-season-tab' + (POOL === 'all' ? ' active' : '') +
        '" onclick="ProspectModel.setPool(\'all\')"' +
        ' title="Every prospect at this position across all classes in the model. ' +
        'A grade means the same thing every year.">All Classes</button>' +
      '<button class="pf-season-tab' + (POOL === 'class' ? ' active' : '') +
        '" onclick="ProspectModel.setPool(\'class\')"' +
        ' title="Only his own draft class at his position — who is the best ' +
        'available this year.">' + esc(CURRENT['class']) + ' Class</button>' +
      (small && POOL === 'class'
        ? '<span class="pf-note">Class too small to rank inside</span>' : '');
  }

  /* ── market (fills the identity column, like the profile page's) ───── */
  function renderMarket() {
    var rec = CURRENT;
    var mk = rec.market || {};
    var mount = el('pm-market');

    var isCurrent = rec['class'] === DATA.currentClass;
    var sf = mk.valueSf != null ? mk.valueSf : mk.value;
    var adp = mk.rookieAdpSf;

    if (sf == null && adp == null) {
      mount.innerHTML = '<div class="pf-block-title">Dynasty Market</div>' +
        '<div class="pf-qual-note">No dynasty market for this prospect. ' +
        (isCurrent
          ? 'He is in the current class but is not traded or drafted often enough to '
            + 'carry a value — typically an undrafted or late-round prospect.'
          : 'Players drop out of the market once they are out of the league, so this '
            + 'is expected for older classes.') + '</div>';
      return;
    }

    // Model rank vs rookie-ADP rank — the reach/value read. Current class only;
    // once a class has played this is archaeology.
    var edge = '';
    if (isCurrent && adp != null) {
      var mRank = rankAmongClass(rec);
      var aRank = adpRankAmongClass(rec);
      if (mRank && aRank) {
        var d = aRank - mRank;
        edge = '<div class="pf-qual-note"><strong>' +
          (d > 0 ? 'Model is higher than the room by ' + d + ' spot' + (d === 1 ? '' : 's')
           : d < 0 ? 'The room is higher than the model by ' + (-d) + ' spot' + (d === -1 ? '' : 's')
           : 'Model and market agree') + '.</strong> ' +
          'Model has him ' + ordinal(mRank) + ' in the ' + rec['class'] +
          ' class overall; rookie-draft ADP has him ' + ordinal(aRank) + '.</div>';
      }
    }

    mount.innerHTML =
      '<div class="pf-block-title">Dynasty Market</div>' +
      '<div class="pf-kpis">' +
        kpi('Dynasty Value (SF)', sf != null ? Number(sf).toLocaleString() : '—', true) +
        kpi('1QB Value', mk.value1qb != null ? Number(mk.value1qb).toLocaleString() : '—') +
        kpi('Rookie ADP (SF)', adp != null ? Number(adp).toFixed(1) : '—') +
        kpi('Rookie ADP (1QB)', mk.rookieAdp1qb != null ? Number(mk.rookieAdp1qb).toFixed(1) : '—') +
      '</div>' + edge;
  }

  /* ── cross-position ordering for one class ───────────────────────────
     SINGLE SOURCE OF TRUTH. The class board and the card's "model has him Nth
     in the class" line must never disagree, so both call this.

     Ordering prospects of different positions against each other needs care:

       - RAW GRADES are not comparable. The three position models are fit
         separately, so a class-leading RB grade is 364 and a class-leading WR
         grade is 214. Sorting raw grades would just sort by position.

       - The STORED PERCENTILE is position-normalized but rounded to an integer,
         which leaves large ties at the top — Jeremiyah Love and Carnell Tate are
         both "99th". Ranking on it alone left the board and the card resolving
         those ties in different orders.

     So order on each prospect's FRACTIONAL standing inside his own position pool
     (all classes, that position's default variant): 1 - (rank-1)/n. Still
     position-normalized, but fine-grained enough that ties are real ties. */
  var _orderCache = {};

  function classOrder(cls) {
    if (_orderCache[cls]) return _orderCache[cls];

    var byPos = {}, k, p;
    for (k in DATA.players) {
      p = DATA.players[k];
      var g = (p.models || {})[defaultVariant(p.pos)];
      if (g == null) continue;
      (byPos[p.pos] = byPos[p.pos] || []).push({ k: k, g: g });
    }
    var standing = {};
    for (var pos in byPos) {
      var arr = byPos[pos];
      arr.sort(function (a, b) { return b.g - a.g; });
      for (var i = 0; i < arr.length; i++) standing[arr[i].k] = 1 - i / arr.length;
    }

    var out = [];
    for (k in DATA.players) {
      p = DATA.players[k];
      if (p['class'] !== cls || standing[k] == null) continue;
      out.push({ key: k, rec: p, score: standing[k] });
    }
    out.sort(function (a, b) { return b.score - a.score; });
    _orderCache[cls] = out;
    return out;
  }

  function rankAmongClass(rec) {
    var order = classOrder(rec['class']);
    if (order.length < 2) return null;
    for (var i = 0; i < order.length; i++) {
      if (order[i].key === CURRENT_KEY) return i + 1;
    }
    return null;
  }

  function adpRankAmongClass(rec) {
    var list = [];
    for (var k in DATA.players) {
      var p = DATA.players[k];
      if (p['class'] !== rec['class']) continue;
      var a = (p.market || {}).rookieAdpSf;
      if (a != null) list.push({ k: k, a: a });
    }
    if (list.length < 2) return null;
    list.sort(function (x, y) { return x.a - y.a; });
    for (var i = 0; i < list.length; i++) { if (list[i].k === CURRENT_KEY) return i + 1; }
    return null;
  }

  /* ── percentile bars (the profile page's renderer, prospect data) ──── */
  function renderPercentiles() {
    var rec = CURRENT;
    var specs = (DATA.metrics || {})[rec.pos] || [];
    var metrics = rec.metrics || {};
    var pm = pctMap(rec);
    var pcts = pm || rec.pctAll || {};
    var fellBack = (POOL === 'class' && !pm);

    var html = '';
    var order = [];
    var hidden = 0;
    specs.forEach(function (sp) {
      if (order.indexOf(sp.group) === -1) order.push(sp.group);
    });

    order.forEach(function (group) {
      /* A metric with NO RAW VALUE is dropped entirely rather than drawn as an
         empty track — there is nothing to show and nothing to rank, and the
         source genuinely does not have it. The 2026 class has no height or
         weight at all, so keeping those rows turned a WR's Athleticism card
         into a wall of dashes that reads as broken rather than as absent.

         This is NOT the same as an unranked row: a metric that HAS a raw value
         but no percentile still renders, showing the value with no bubble. */
      var rows = specs.filter(function (s) {
        return s.group === group && metrics[s.key] != null;
      });
      hidden += specs.filter(function (s) {
        return s.group === group && metrics[s.key] == null;
      }).length;
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
        var poolWord = (POOL === 'class' && !fellBack)
          ? rec['class'] + ' ' + rec.pos + 's' : rec.pos + 's in the model';
        var title = s.label + ': ' + fmt(raw, s.fmt) +
          (has ? ' — ' + ordinal(p) + ' percentile among ' + poolWord +
                 (s.invert ? ' (lower is better)' : '')
               : ' — no comparable pool for this metric');

        html += '<div class="pf-bar-row' + (has ? '' : ' pf-unranked') +
                '" title="' + esc(title) + '">' +
          '<div class="pf-bar-label">' + esc(s.label) +
            (s.invert ? ' ↓' : '') + '</div>' +
          '<div class="pf-bar-track">' +
            (has ? '<div class="pf-bar-fill" style="width:' + p + '%;background:' +
                   pctColor(p) + '"></div>' +
                   // Bubble travels between its own half-widths, not 0–100% of
                   // the track, so percentile 0 and 100 stay fully inside.
                   '<div class="pf-bubble" style="left:calc(16px + (100% - 32px) * ' +
                   p + ' / 100);background:' + pctColor(p) + '">' + ordinal(p) + '</div>'
                 : '') +
          '</div>' +
          '<div class="pf-bar-val">' + esc(fmt(raw, s.fmt)) + '</div>' +
        '</div>';
      });
      html += '</div>';
    });

    html += '<div class="pf-pct-caption">Each bubble is a <strong>percentile</strong> — ' +
      'where he ranks among <strong>' + esc(poolSize(rec)) + '</strong>. ' +
      '96th = better than 96% of them. The number on the right is the raw value. ' +
      'A <strong>↓</strong> marks a metric where <strong>lower is better</strong> ' +
      '(40 time, age) — those percentiles are flipped, so a fast, young prospect ' +
      'still shows a long bar.' +
      (fellBack ? ' <strong>His class is too small to rank inside</strong>, so these ' +
                  'bars are all-classes.' : '') +
      // Say what is missing rather than quietly drawing a shorter card. The
      // 2026 class has no height/weight in the source at all.
      (hidden ? ' <strong>' + hidden + ' metric' + (hidden === 1 ? '' : 's') +
                ' not shown</strong> — the model workbook has no value for ' +
                (hidden === 1 ? 'it' : 'them') + ' for this prospect.' : '') +
      '</div>';

    el('pm-pct-body').innerHTML = html;
    el('pm-pct-variant').textContent = (variantMeta(rec.pos, VARIANT) || {}).label || '';
  }

  function poolSize(rec) {
    if (POOL === 'class') {
      var cm = (DATA.classMeta || {})[String(rec['class'])];
      var n = cm && cm.pool ? cm.pool[rec.pos] : null;
      if (n) return n + ' ' + rec.pos + 's in the ' + rec['class'] + ' class';
    }
    var count = 0;
    for (var k in DATA.players) { if (DATA.players[k].pos === rec.pos) count++; }
    return count + ' ' + rec.pos + 's across ' + DATA.classes[0] + '–' +
           DATA.classes[DATA.classes.length - 1];
  }

  /* ── usage share — the profile page's donut + share bars ─────────────
     Built from the prospect's FINAL college season, which is the season the
     model's "final season" inputs come from. The RB donut is deliberately the
     same split the profile page uses for an NFL back (carries vs receptions);
     the receiver donut splits screens out of the target diet, because the
     models carry both a with-screens and a minus-screens career efficiency
     number, so screen share is part of reading a receiver's grade. */
  function renderUsage() {
    var rec = CURRENT;
    var s = finalSeason(rec);
    var html = '';

    if (!s || s.season == null) {
      el('pm-usage').innerHTML =
        '<div class="pf-note" style="margin:0 0 14px">No college season data.</div>';
      return;
    }

    html += '<div class="pf-kpi-label" style="margin-bottom:8px">Final college season — ' +
            esc(s.season) + (s.team ? ' · ' + esc(s.team) : '') + '</div>';

    if (rec.pos === 'RB') {
      html += donut([
        { label: 'Carries', value: s.att || 0, color: 'var(--red)' },
        { label: 'Receptions', value: s.rec || 0, color: 'var(--pos-wr-bg)' }
      ], 'Touch mix');
      html += shareBar('Breakaway rate', s.brkPct);
      html += shareBar('Yards after contact per carry', s.ycoAtt, '');
      html += shareBar('PFF rushing grade', s.runGr, '');
    } else {
      var tgt = s.targets || 0, screen = s.screenTgt || 0;
      html += donut([
        { label: 'Downfield', value: Math.max(0, tgt - screen), color: 'var(--red)' },
        { label: 'Screens', value: screen, color: 'rgba(128,128,128,.35)' }
      ], 'Target mix');
      html += shareBar('Catch rate', s.catchPct);
      html += shareBar('Contested catch rate', s.contPct);
      html += shareBar('Drop rate (lower is better)', s.dropRate);
    }

    el('pm-usage').innerHTML = html;
  }

  /* Two-slice donut. Two categories only — beyond that this becomes a stacked
     bar, which is easier to read. Both slices are direct-labeled in the legend
     so identity is never carried by color alone. Same geometry and markup as
     player-profile.js's donut(). */
  function donut(parts, caption) {
    var total = parts.reduce(function (a, p) { return a + (p.value || 0); }, 0);
    if (!total) return '<div class="pf-note" style="margin:0 0 14px">No ' +
                       esc(caption.toLowerCase()) + ' data.</div>';

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
      return '<div class="pf-legend-item"><span class="pf-swatch" style="background:' +
             p.color + '"></span>' + esc(p.label) +
             ' <span class="pf-legend-val">' + pctv + '%</span></div>';
    }).join('');

    return '<div class="pf-donut-wrap">' +
      '<svg class="pf-donut" width="140" height="140" viewBox="0 0 140 140" role="img" ' +
        'aria-label="' + esc(caption) + '">' + arcs + '</svg>' +
      '<div class="pf-legend"><div class="pf-kpi-label">' + esc(caption) + '</div>' +
        legend + '</div>' +
    '</div>';
  }

  /* Share bar. `suffix` defaults to '%' — pass '' for a value that is not a
     percentage (yards after contact per carry, a PFF grade), where the track
     still reads as a 0-100 position but the label must not claim a percent. */
  function shareBar(label, val, suffix) {
    if (val == null) return '';
    var sfx = suffix === undefined ? '%' : suffix;
    var w = Math.max(0, Math.min(100, sfx === '%' ? val : val * 10));
    return '<div class="pf-share-row">' +
      '<div class="pf-share-head"><span>' + esc(label) + '</span>' +
      '<span>' + Number(val).toFixed(1) + sfx + '</span></div>' +
      '<div class="pf-share-track"><div class="pf-share-fill" style="width:' + w + '%"></div></div>' +
    '</div>';
  }

  /* ── what drives the grade — production vs draft capital ─────────────
     The single most useful diagnostic on the card: the composite grade hides
     which input is carrying it, and a prospect 90th in production / 20th in
     draft capital is a completely different bet from the reverse. */
  function renderSplits() {
    var rec = CURRENT;
    var s = rec.splits || {};
    var defs = (DATA.splits || {})[rec.pos] || [];
    var mount = el('pm-splits');

    var rows = defs.filter(function (d) {
      return d.key.slice(-3) === 'Pct' && s[d.key] != null;
    });
    if (!rows.length) { mount.innerHTML = ''; return; }

    mount.innerHTML =
      '<div class="pf-block-title">What Drives The Grade</div>' +
      rows.map(function (d) {
        var v = s[d.key];
        return '<div class="pf-share-row">' +
          '<div class="pf-share-head"><span>' + esc(d.label) + '</span>' +
          '<span>' + esc(ordinal(Math.round(v))) + '</span></div>' +
          '<div class="pf-share-track"><div class="pf-share-fill" style="width:' +
            Math.max(0, Math.min(100, v)) + '%;background:' + pctColor(v) + '"></div></div>' +
        '</div>';
      }).join('') +
      (s.prodOnly != null
        ? '<div class="pf-qual-note">Production-only score <strong>' +
          esc(Number(s.prodOnly).toFixed(1)) + '</strong> — the model with draft capital ' +
          'removed. A wide gap between the two bars is the whole story: production well ' +
          'ahead of draft capital is the market underrating the college tape, and the ' +
          'reverse is the NFL liking a player the numbers do not.</div>'
        : '<div class="pf-qual-note">Draft capital is one of the model inputs, so this ' +
          'bar shows how much of the grade the NFL supplied rather than the college ' +
          'production.</div>');
  }

  /* ── historical comps ────────────────────────────────────────────────
     Nearest grades from PAST classes on the same variant, with the NFL outcome
     the model was fit against. The current class is excluded on purpose — it
     has no outcome yet, so including it would pad the list with blanks. */
  function renderComps() {
    var rec = CURRENT;
    var mount = el('pm-comps');
    el('pm-comps-variant').textContent = (variantMeta(rec.pos, VARIANT) || {}).label || '';

    var g = gradeOf(rec);
    if (g == null) { mount.innerHTML = ''; return; }

    var pool = [];
    for (var k in DATA.players) {
      var p = DATA.players[k];
      if (k === CURRENT_KEY || p.pos !== rec.pos) continue;
      if (p['class'] === DATA.currentClass) continue;   // no outcome yet
      var pg = (p.models || {})[VARIANT];
      if (pg == null) continue;
      pool.push({ key: k, rec: p, grade: pg, d: Math.abs(pg - g) });
    }
    if (!pool.length) { mount.innerHTML = ''; return; }

    pool.sort(function (a, b) { return a.d - b.d; });
    var near = pool.slice(0, COMP_COUNT);

    var withOutcome = near.filter(function (c) { return c.rec.target != null; });
    var avg = withOutcome.length
      ? withOutcome.reduce(function (s, c) { return s + c.rec.target; }, 0) / withOutcome.length
      : null;

    mount.innerHTML =
      '<div class="pm-comp-grid">' +
      near.map(function (c) {
        var op = outcomePct(c.rec);
        return '<div class="pm-comp-card" onclick="ProspectModel.select(\'' + esc(c.key) + '\')">' +
          '<div class="pm-comp-name">' + esc(c.rec.name) + '</div>' +
          '<div class="pm-comp-meta">' + esc(c.rec['class']) +
            (c.rec.college ? ' · ' + esc(c.rec.college) : '') + '</div>' +
          '<div class="pm-comp-nums">' +
            '<div><div class="pf-kpi-label">Grade</div>' +
              '<div class="pm-comp-val">' + esc(Number(c.grade).toFixed(0)) + '</div></div>' +
            '<div><div class="pf-kpi-label">NFL Outcome</div>' +
              '<div class="pm-comp-val" style="color:' +
                (c.rec.target == null ? 'rgba(128,128,128,1)' : pctColor(op)) + '">' +
                (c.rec.target == null ? '—' : esc(Number(c.rec.target).toFixed(0))) +
              '</div></div>' +
          '</div>' +
        '</div>';
      }).join('') + '</div>' +
      '<div class="pf-pct-caption">The right-hand number is each comp\'s <strong>NFL ' +
      'outcome</strong> — the average of his best two of the first three seasons, which ' +
      'is the target the model was fit against. ' +
      (avg != null
        ? 'These ' + withOutcome.length + ' comps averaged <strong>' + esc(avg.toFixed(0)) +
          '</strong>. '
        : '') +
      'Comps are drawn from past classes only; the ' + esc(DATA.currentClass) +
      ' class has not played a down. Click any comp to open his card.</div>';
  }

  /* Position the outcome on the same diverging scale as everything else, so a
     comp that hit reads orange and a bust reads blue at a glance. */
  function outcomePct(rec) {
    var vals = [];
    for (var k in DATA.players) {
      var p = DATA.players[k];
      if (p.pos === rec.pos && p.target != null) vals.push(p.target);
    }
    if (vals.length < 2) return null;
    var below = 0, equal = 0;
    for (var i = 0; i < vals.length; i++) {
      if (vals[i] < rec.target) below++;
      else if (vals[i] === rec.target) equal++;
    }
    return Math.round(100 * (below + equal / 2) / vals.length);
  }

  /* ── college season table (the profile page's season table) ────────── */
  function renderCollege() {
    var rec = CURRENT;
    var mount = el('pm-college');
    var lines = rec.seasons || [];
    if (!lines.length) {
      mount.innerHTML = '<div class="pf-qual-note">No college stat lines matched this ' +
        'prospect in the PFF database.</div>';
      return;
    }

    var cols = (DATA.collegeCols || {})[rec.pos === 'RB' ? 'rushing' : 'receiving'] || [];
    var last = lines[lines.length - 1].season;

    var head = '<tr><th data-col="season">Season</th><th>Team</th>' +
      cols.map(function (c) { return '<th>' + esc(c.label) + '</th>'; }).join('') + '</tr>';

    var body = lines.map(function (ln) {
      return '<tr>' +
        '<td class="pf-col-season">' + esc(ln.season) +
          (ln.season === last ? ' <span class="pm-final-tag">Final</span>' : '') + '</td>' +
        '<td class="pf-col-season">' + esc(ln.team || '—') + '</td>' +
        cols.map(function (c) {
          return '<td>' + esc(fmt(ln[c.key], c.fmt)) + '</td>';
        }).join('') + '</tr>';
    }).join('');

    mount.innerHTML =
      '<table class="pf-table"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>' +
      '<div class="pf-pct-caption">Raw PFF college seasons, untouched by the model. ' +
      (rec.pos === 'RB' ? 'Rushing' : 'Receiving') + ' database, joined on PFF player id. ' +
      'The model reads adjusted versions of these — schedule, age and competition ' +
      'adjustments are applied before a grade is produced, so a line here will not match ' +
      'a bar above.</div>';
  }

  // ── the class board (landing state) ──────────────────────────────────
  function setBoardPos(pos) { BOARD_POS = pos; renderBoard(); }
  function setBoardClass(c) { BOARD_CLASS = Number(c); renderBoard(); }

  function renderBoard() {
    var cls = BOARD_CLASS != null ? BOARD_CLASS : DATA.currentClass;

    // Ordering comes from classOrder() so the board and the card's "Nth in the
    // class" line can never disagree. Filtering by position AFTER ranking is
    // intentional: a WR-only board should number 1..n within WRs.
    var rows = classOrder(cls)
      .filter(function (o) { return BOARD_POS === 'ALL' || o.rec.pos === BOARD_POS; })
      .map(function (o) {
        var v = defaultVariant(o.rec.pos);
        return {
          key: o.key, rec: o.rec,
          grade: (o.rec.models || {})[v],
          pct: (o.rec.pctAll || {})['model:' + v]
        };
      });

    el('pm-board-class').innerHTML = (DATA.classes || []).slice().reverse()
      .map(function (c) {
        return '<button class="pf-season-tab' + (c === cls ? ' active' : '') +
          '" onclick="ProspectModel.setBoardClass(' + c + ')">' + c + '</button>';
      }).join('');

    el('pm-board-pos').innerHTML = ['ALL', 'WR', 'RB', 'TE'].map(function (p) {
      return '<button class="pf-season-tab' + (p === BOARD_POS ? ' active' : '') +
        '" onclick="ProspectModel.setBoardPos(\'' + p + '\')">' + p + '</button>';
    }).join('');

    if (!rows.length) {
      el('pm-board-body').innerHTML =
        '<div class="pf-empty">No prospects in this class at this position.</div>';
      return;
    }

    var isCurrent = cls === DATA.currentClass;
    var head = '<tr><th></th><th data-col="season">Prospect</th><th>Pos</th>' +
      '<th>College</th><th>Grade</th><th>%ile</th>' +
      '<th>Rookie ADP</th><th>Dynasty Value</th>' +
      (isCurrent ? '' : '<th>NFL Outcome</th>') + '</tr>';

    var body = rows.map(function (r, i) {
      var mk = r.rec.market || {};
      var sf = mk.valueSf != null ? mk.valueSf : mk.value;
      return '<tr class="pm-board-row" onclick="ProspectModel.select(\'' + esc(r.key) + '\')">' +
        '<td class="pm-rank">' + (i + 1) + '</td>' +
        '<td class="pf-col-season pm-name">' + esc(r.rec.name) + '</td>' +
        '<td><span class="pos-pill ' + esc(r.rec.pos) + '">' + esc(r.rec.pos) + '</span></td>' +
        '<td>' + esc(r.rec.college || '—') + '</td>' +
        '<td class="pm-grade">' + (r.grade == null ? '—' : esc(r.grade.toFixed(0))) + '</td>' +
        '<td>' + (r.pct == null ? '—' :
          '<span class="pm-pct-chip" style="background:' + pctColor(r.pct) + '">' +
          esc(ordinal(r.pct)) + '</span>') + '</td>' +
        '<td>' + (mk.rookieAdpSf != null ? esc(mk.rookieAdpSf.toFixed(1)) : '—') + '</td>' +
        '<td>' + (sf != null ? esc(Number(sf).toLocaleString()) : '—') + '</td>' +
        (isCurrent ? '' : '<td>' +
          (r.rec.target == null ? '—' : esc(Number(r.rec.target).toFixed(0))) + '</td>') +
      '</tr>';
    }).join('');

    el('pm-board-body').innerHTML =
      '<div class="pf-table-scroll"><table class="pf-table">' +
      '<thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>' +
      '<div class="pf-pct-caption">Ranked by <strong>all-classes percentile</strong>, not ' +
      'raw grade — the three position models are fit separately, so their raw numbers are ' +
      'not comparable to each other. The percentile is, which makes this a cross-position ' +
      'board. Click any row for the full card.' +
      (isCurrent ? ' The ' + esc(cls) + ' class has no NFL outcome column: it has not ' +
                   'played a down.' : '') +
      '</div>';
  }

  // ── init ─────────────────────────────────────────────────────────────
  function init() {
    fetch(DATA_URL)
      .then(function (r) {
        if (!r.ok) throw new Error('prospects.json HTTP ' + r.status);
        return r.json();
      })
      .then(function (json) {
        DATA = json;
        global.PROSPECTS_PAYLOAD = json;
        BOARD_CLASS = json.currentClass;

        var scope = el('pm-scope');
        if (scope && json.noQbModel) {
          scope.innerHTML = '<strong>WR, RB and TE only.</strong> ' + esc(json.noQbModel) +
            ' Quarterback prospects will not appear in search or on the board.';
        }

        var params = new URLSearchParams(global.location.search);
        var want = params.get('player') || params.get('name');
        var key = want ? normName(want) : null;
        if (key && !DATA.players[key]) {
          // A name that collided across classes is stored with a class suffix.
          for (var k in DATA.players) {
            if (k.indexOf(key) === 0) { key = k; break; }
          }
          if (!DATA.players[key]) key = null;
        }
        renderBoard();
        if (key) select(key);
      })
      .catch(function (err) {
        el('pm-board-body').innerHTML =
          '<div class="pf-empty"><p>Could not load <code>data/prospects.json</code> (' +
          esc(err.message) + ').</p>' +
          '<p class="pf-note">If you opened this file directly, serve it over HTTP — ' +
          '<code>fetch()</code> is blocked on <code>file://</code>. Use <code>start.bat</code>.</p></div>';
      });

    document.addEventListener('click', function (e) {
      var box = el('pm-search-results');
      if (box && !box.hidden && !e.target.closest('.pf-search-wrap')) box.hidden = true;
    });
  }

  global.ProspectModel = {
    init: init,
    onSearch: onSearch,
    select: select,
    setVariant: setVariant,
    setPool: setPool,
    setBoardPos: setBoardPos,
    setBoardClass: setBoardClass,
    backToBoard: backToBoard
  };
})(window);
