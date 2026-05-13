/* ════════════════════════════════════════════════════════════════════════
   PLAYER PANEL — shared JS module
   Source of truth: extracted from index.html (FPTS Trade Database).
   Loaded by every page that uses the slide-in drawer:
   index.html, trade-calculator.html, my-leagues.html, adp-tool.html, tiers.html.

   Public API:
     PlayerPanel.init()                  — inject HTML template + bind globals
     PlayerPanel.open(name)              — open the drawer for a player
     PlayerPanel.close()                 — close the drawer
     PlayerPanel.showTab(tab)            — switch drawer to a tab
     PlayerPanel.setCurrentPage(pageId)  — 'db'|'calc'|'ml'|'adp'|'tiers'

   Page-detection: reads window.FPTS_CURRENT_PAGE (set before init), or falls
   back to location.pathname matching. Hides the "Open in <current page>"
   button and shows "Open in Database" on non-DB pages.

   Data dependencies (all OPTIONAL — module won't crash if missing):
     FP_VALUES, TRADES, SLEEPER_IDS, ADP_DATA, ADP_PAYLOAD, MVS_DATA,
     posColMap, posTxtMap, pc, MvsExtras, Heatmap, normalizePlayerName,
     renderPlayerStats, renderAgeCurve, renderTradeFinder, tradeCardHtml,
     renderPlayerArticles
   ════════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  // ────────────────────────────────────────────────────────────────────────
  // CONSTANTS — shared across renderers (date formatting, QB-format labels,
  // pos color maps). Mirrors what index.html declares at the top of its
  // <script> block so the module can render trade cards without those globals.
  // ────────────────────────────────────────────────────────────────────────
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  function fmtDate(d) {
    if (!d || typeof d !== 'string') return '';
    const parts = d.split('-');
    if (parts.length < 3) return d;
    const [y, m, day] = parts;
    return `${MONTHS[parseInt(m, 10) - 1] || ''} ${parseInt(day, 10)}, ${y}`;
  }
  const qbLabels = { '1qb': '1 QB', 'sf': 'Superflex', 'all': 'All Formats' };

  // pickThumb — circular flame thumbnail for draft picks. Default 28×28.
  function pickThumb(size) {
    const s = size || 28;
    const iconSize = Math.round(s * 0.62);
    return `<span style="width:${s}px;height:${s}px;border-radius:50%;background:var(--surface2);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid var(--border)">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="413 0 95 90" width="${iconSize}" height="${iconSize}" style="display:block">
        <path d="M508.084,47.801l-8.983,41.534c0,0 -75.276,-0.036 -85.237,-0.002l0.015,-0.067c0,0 2.533,-17.352 5.641,-25.475c3.708,-9.689 16.604,-32.658 16.604,-32.658c12.902,8.212 8.658,21.025 7.099,27.21c11.719,-8.962 11.012,-17.186 11.003,-28.608c-0.006,-7.356 4.797,-23.375 17.858,-28.257c-4.305,14.678 3.971,24.95 7.333,30.494c6.362,10.492 1.397,21.17 1.397,21.17c0,0 9.268,-3.36 8.863,-15.254c-0.117,-3.424 -1.714,-14.283 8.012,-18.422c-0.754,9.397 5.495,18.682 10.395,28.336Z" fill="var(--red)"/>
      </svg>
    </span>`;
  }

  // Install the universal _imgThumbFallback if the host page didn't define it.
  if (typeof global._imgThumbFallback !== 'function') {
    global._imgThumbFallback = function (img, size, initials) {
      const fontSize = Math.max(8, size - 15);
      const span = document.createElement('span');
      span.style.cssText = `width:${size}px;height:${size}px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;background:var(--surface2);border:1px solid var(--border);color:var(--muted);font-family:'Mulish',sans-serif;font-weight:700;font-size:${fontSize}px`;
      span.textContent = initials;
      if (img && img.parentNode) img.parentNode.replaceChild(span, img);
    };
  }

  // ────────────────────────────────────────────────────────────────────────
  // HTML TEMPLATE — overlay + drawer + 5 tabs
  // ────────────────────────────────────────────────────────────────────────
  const PANEL_HTML = `
<!-- PLAYER PANEL OVERLAY -->
<div class="panel-overlay" id="panel-overlay" onclick="closePanel()"></div>
<div class="player-panel" id="player-panel">

  <!-- CLOSE BAR -->
  <div class="pp-close-bar" style="justify-content:space-between;flex-shrink:0">
    <div style="font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:var(--red);text-transform:uppercase;letter-spacing:.06em">Player Profile</div>
    <div style="display:flex;align-items:center;gap:10px">
      <div class="pp-search-wrap" style="position:relative">
        <input type="text" id="pp-search" class="pp-search-input"
          placeholder="+ Add player to compare..."
          oninput="ppSearchInput(this.value)"
          onkeydown="ppSearchKey(event)"
          autocomplete="off"
          style="min-width:260px">
        <div id="pp-search-results" class="pp-search-results"></div>
      </div>
      <div class="fpts-xpage-bar" style="margin-right:6px">
        <button class="fpts-xpage-btn" data-page="db"   onclick="event.stopPropagation();_fptsXpageOpenDbFromPanel()"      title="Open the Trade Database with this player's profile">Open in Database ↗</button>
        <button class="fpts-xpage-btn" data-page="calc" onclick="event.stopPropagation();_fptsXpageOpenCalcFromPanel()"    title="Open the trade calculator with this player on Side B">Open in Calculator ↗</button>
        <button class="fpts-xpage-btn" data-page="ml"   onclick="event.stopPropagation();_fptsXpageOpenLeaguesFromPanel()" title="Open My Leagues with this player pinned in Player Exposure">Open in My Leagues ↗</button>
        <button class="fpts-xpage-btn" data-page="adp"  onclick="event.stopPropagation();_fptsXpageOpenAdpFromPanel()"     title="Open the ADP tool with this player's modal">Open in ADP ↗</button>
      </div>
      <button class="panel-close" onclick="closePanel()">✕ Close</button>
    </div>
  </div>

  <!-- PLAYER TAB STRIP -->
  <div id="pp-player-tabs" style="display:flex;align-items:center;gap:0;background:var(--surface);border-bottom:1px solid var(--border);flex-shrink:0;overflow-x:auto;min-height:44px"></div>

  <!-- SINGLE PLAYER VIEW (full width, swaps on tab click) -->
  <div id="pp-primary" style="flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0">
    <div class="pp-profile" id="pp-profile-left" style="padding:28px 32px">
      <div class="pp-avatar" id="pp-avatar"></div>
      <div class="pp-info">
        <div class="pp-pos-team"><span id="pp-pos-badge"></span><span class="pp-team-name" id="pp-nfl-team">—</span></div>
        <div class="pp-name" id="pp-player-name" style="font-size:32px">—</div>
        <div class="pp-meta" id="pp-meta-row"></div>
        <!-- ARTICLES SECTION (built by mountPlayerArticles in JS, lives in profile row's empty space) -->
        <div id="pp-articles-mount" style="margin-top:10px"></div>
      </div>
      <div class="pp-ktc">
        <div class="pp-value-label">Fantasy Points</div>
        <div class="pp-value-val" id="pp-value-val">—</div>
        <div class="pp-value-rank" id="pp-value-rank">—</div>
        <div class="pp-value-trend" id="pp-value-trend"></div>
      </div>
    </div>
    <!-- MVS extras: OTC + Baseline + Trade Volume (7d) + Contributor Rankings. -->
    <div id="pp-mvs-extras"></div>

    <!-- SYNC-RULE: this 5-tab strip must stay aligned across every player
         modal on the site (DB / Calc / My-Leagues / ADP-tool / Tiers). -->
    <div class="pp-tabs">
      <button class="pp-tab active" onclick="ppShowTab('trades')">Trades</button>
      <button class="pp-tab" onclick="ppShowTab('stats')">Player Stats</button>
      <button class="pp-tab" onclick="ppShowTab('curve')">Age Curve</button>
      <button class="pp-tab" onclick="ppShowTab('finder')">Trade Finder</button>
      <button class="pp-tab" onclick="ppShowTab('heatmap')">ADP Heatmap</button>
    </div>
    <div class="pp-scroll">
      <div id="pp-age-curve-tab" style="display:none"></div>
      <div id="pp-trades-tab"></div>
      <div id="pp-stats-tab" style="display:none"></div>
      <div id="pp-curve-tab" style="display:none"></div>
      <div id="pp-finder-tab" style="display:none"></div>
      <!-- Pick-availability heatmap as a tab so the inline layout stays
           consistent across every player regardless of heatmap coverage. -->
      <div id="pp-heatmap-tab" style="display:none"></div>
    </div>
  </div>

</div>`;

  // ────────────────────────────────────────────────────────────────────────
  // STATE
  // ────────────────────────────────────────────────────────────────────────
  let ppPlayers = [];
  let ppActivePlayer = null;
  let ppLastTab = 'trades';
  let currentPanelPlayer = null;
  let _currentPage = null; // 'db' | 'calc' | 'ml' | 'adp' | 'tiers'

  // Trade Finder state — keyed by containerId. Lives inside the module so each
  // page's panel keeps its own slot/search context. Mirrors the legacy tfState
  // in index.html; exposed on window for back-compat with the cross-page
  // _fptsXpageOpenCalcFromFinder helper which inspects tfState directly.
  const tfState = (typeof global.tfState === 'object' && global.tfState) ? global.tfState : {};
  global.tfState = tfState;

  function tfGetState(id) {
    if (!tfState[id]) tfState[id] = { sideA: [], sideB: [] };
    return tfState[id];
  }

  // Trades cache — built lazily from MVS_PAYLOAD when host page hasn't loaded
  // its own TRADES array. Kept on window.TRADES so other code can read it.
  let _tradesBuilt = false;

  // ────────────────────────────────────────────────────────────────────────
  // GRACEFUL DATA ACCESS — every global is optional
  // ────────────────────────────────────────────────────────────────────────
  function _fp()      { return (typeof global.FP_VALUES    !== 'undefined' && global.FP_VALUES)    ? global.FP_VALUES    : {}; }
  function _trades()  {
    // If host page has TRADES with rows, use it. Otherwise try to build from MVS.
    if (typeof global.TRADES !== 'undefined' && Array.isArray(global.TRADES) && global.TRADES.length) {
      return global.TRADES;
    }
    if (!_tradesBuilt && typeof global.MVS_PAYLOAD !== 'undefined' && global.MVS_PAYLOAD) {
      try {
        const built = _buildTradesFromMvs();
        if (built && built.length) {
          global.TRADES = built;
          _tradesBuilt = true;
          return built;
        }
        _tradesBuilt = true;
      } catch (e) {
        _tradesBuilt = true;
      }
    }
    return (typeof global.TRADES !== 'undefined' && global.TRADES) ? global.TRADES : [];
  }
  function _sleeper() { return (typeof global.SLEEPER_IDS  !== 'undefined' && global.SLEEPER_IDS)  ? global.SLEEPER_IDS  : {}; }
  function _adpData() { return (typeof global.ADP_DATA     !== 'undefined' && global.ADP_DATA)     ? global.ADP_DATA     : {}; }
  function _known()   { return (typeof global.KNOWN_PLAYERS !== 'undefined' && global.KNOWN_PLAYERS) ? global.KNOWN_PLAYERS : []; }
  function _posCol(p) {
    if (typeof global.posColMap !== 'undefined' && global.posColMap && global.posColMap[p]) return global.posColMap[p];
    const fallback = { WR:'var(--pos-wr-bg)', RB:'var(--pos-rb-bg)', QB:'var(--pos-qb-bg)', TE:'var(--pos-te-bg)', K:'var(--pos-k-bg)' };
    return fallback[p] || '#2a2a2a';
  }
  function _posTxt(p) {
    if (typeof global.posTxtMap !== 'undefined' && global.posTxtMap && global.posTxtMap[p]) return global.posTxtMap[p];
    const fallback = { WR:'var(--pos-wr)', RB:'var(--pos-rb)', QB:'var(--pos-qb)', TE:'var(--pos-te)', K:'var(--pos-k)' };
    return fallback[p] || 'var(--white)';
  }
  function _pc(p) {
    if (typeof global.pc === 'function') return global.pc(p);
    return 'pos-' + String(p || 'wr').toLowerCase();
  }
  function _normName(name) {
    if (typeof global.normalizePlayerName === 'function') return global.normalizePlayerName(name);
    // Minimal fallback: lowercase + strip punctuation + collapse whitespace
    return String(name || '').toLowerCase().replace(/[^a-z0-9 ]+/g, '').replace(/\s+/g, ' ').trim();
  }

  // Universal player thumbnail helper. Mirrors the global _imgThumb from index.html.
  function _imgThumb(name, size) {
    const ids = _sleeper();
    const looked = ids[name];
    const sid = looked || (() => {
      const k = _normName(name);
      const m = Object.keys(ids).find(n => _normName(n) === k);
      return m ? ids[m] : null;
    })();
    const initials = (name || '').split(' ').map(t => t[0]).join('').slice(0, 2).toUpperCase();
    const fontSize = Math.max(8, size - 15);
    return sid
      ? `<img src="https://sleepercdn.com/content/nfl/players/thumb/${sid}.jpg" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;flex-shrink:0;background:var(--surface2);" onerror="this.style.visibility='hidden'">`
      : `<span style="width:${size}px;height:${size}px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;background:var(--surface2);border:1px solid var(--border);color:var(--muted);font-family:'Mulish',sans-serif;font-weight:700;font-size:${fontSize}px;">${initials}</span>`;
  }

  // ────────────────────────────────────────────────────────────────────────
  // CROSS-PAGE HANDOFF — preserves player context when jumping between pages
  // (Index.html owns the master copy; we install if not present.)
  // ────────────────────────────────────────────────────────────────────────
  if (typeof global._fptsWriteHandoff !== 'function') {
    global._fptsWriteHandoff = function (payload, destUrl) {
      try {
        const data = Object.assign({ ts: Date.now() }, payload);
        localStorage.setItem('fpts-handoff', JSON.stringify(data));
      } catch (e) {}
      if (destUrl) global.open(destUrl, '_blank', 'noopener');
    };
  }
  if (typeof global._fptsReadHandoff !== 'function') {
    global._fptsReadHandoff = function () {
      try {
        const raw = localStorage.getItem('fpts-handoff');
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data.ts || (Date.now() - data.ts) > 60000) {
          localStorage.removeItem('fpts-handoff');
          return null;
        }
        localStorage.removeItem('fpts-handoff');
        return data;
      } catch (e) { return null; }
    };
  }

  function _fptsXpageOpenCalcFromPanel() {
    const name = ppActivePlayer || null;
    if (!name) { global.open('trade-calculator.html', '_blank', 'noopener'); return; }
    const ktc = _fp()[name] || {};
    const pos = (ktc.posRank || 'WR').replace(/\d+$/, '') || 'WR';
    global._fptsWriteHandoff({
      source: _currentPage || 'db',
      primaryPlayer: name,
      trade: { sideA: [], sideB: [{ name, pos, value: ktc.value || 0, type: 'player' }] }
    }, 'trade-calculator.html');
  }
  function _fptsXpageOpenLeaguesFromPanel() {
    const name = ppActivePlayer || null;
    global._fptsWriteHandoff({
      source: _currentPage || 'db',
      primaryPlayer: name,
      players: name ? [{ name }] : []
    }, 'my-leagues.html');
  }
  function _fptsXpageOpenAdpFromPanel() {
    const name = ppActivePlayer || null;
    global._fptsWriteHandoff({ source: _currentPage || 'db', primaryPlayer: name }, 'adp-tool.html');
  }
  function _fptsXpageOpenDbFromPanel() {
    const name = ppActivePlayer || null;
    global._fptsWriteHandoff({ source: _currentPage || 'db', primaryPlayer: name }, 'index.html');
  }

  // ────────────────────────────────────────────────────────────────────────
  // SEARCH (inside the panel close-bar — used to swap to another player)
  // ────────────────────────────────────────────────────────────────────────
  function ppSearchInput(val) {
    const results = document.getElementById('pp-search-results');
    if (!results) return;
    if (!val.trim()) { results.classList.remove('open'); results.innerHTML = ''; return; }
    try {
      return _ppSearchInputImpl(val, results);
    } catch (err) {
      console.error('[ppSearchInput] failed:', err);
      results.innerHTML = `<div class="main-search-no-results">Search error — open DevTools console (${err.message})</div>`;
      results.classList.add('open');
    }
  }
  function _ppSearchInputImpl(val, results) {
    const q = val.toLowerCase();
    const TRADES = _trades();
    const FP_VALUES = _fp();
    const SLEEPER_IDS = _sleeper();
    const KNOWN_PLAYERS = _known();

    // Aggregate trade counts keyed by NORMALIZED name so variations dedupe.
    const all = {};
    TRADES.forEach(t => (t.players || []).forEach(p => {
      const key = _normName(p.name);
      if (!all[key]) all[key] = { name: p.name, pos: p.pos, count: 0 };
      all[key].count++;
    }));

    // Build matches from trade records first
    let matches = Object.values(all)
      .filter(p => p.name.toLowerCase().includes(q))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // FP_VALUES fallback
    if (matches.length < 8) {
      const haveKeys = new Set(Object.keys(all));
      Object.entries(FP_VALUES).filter(([n]) => {
        if (haveKeys.has(_normName(n))) return false;
        return n.toLowerCase().includes(q);
      })
      .slice(0, 8 - matches.length).forEach(([n, d]) => {
        const pos = (d.posRank || '').replace(/\d+$/, '') || '?';
        matches.push({ name: n, pos, count: 0 });
      });
    }
    // KNOWN_PLAYERS fallback
    if (matches.length < 8) {
      const haveKeys = new Set([
        ...Object.keys(all),
        ...Object.keys(FP_VALUES).map(_normName),
        ...matches.map(m => _normName(m.name))
      ]);
      KNOWN_PLAYERS.filter(p => !haveKeys.has(_normName(p.name)) && p.name.toLowerCase().includes(q))
        .slice(0, 8 - matches.length).forEach(p => matches.push({ name: p.name, pos: p.pos, count: 0 }));
    }

    // Prefer the canonical name from FP_VALUES if it exists.
    matches = matches.map(m => {
      const key = _normName(m.name);
      const canonical = Object.keys(FP_VALUES).find(n => _normName(n) === key);
      return canonical ? Object.assign({}, m, { name: canonical }) : m;
    });

    if (!matches.length) {
      results.innerHTML = `<div class="main-search-no-results">No players found matching "${val}"</div>`;
      results.classList.add('open');
      return;
    }
    results.innerHTML = matches.map((p, i) => {
      const sid = SLEEPER_IDS[p.name] || (() => {
        const key = _normName(p.name);
        const match = Object.keys(SLEEPER_IDS).find(n => _normName(n) === key);
        return match ? SLEEPER_IDS[match] : null;
      })();
      const thumbHtml = sid
        ? `<img src="https://sleepercdn.com/content/nfl/players/thumb/${sid}.jpg" style="width:28px;height:28px;border-radius:50%;object-fit:cover;flex-shrink:0;background:var(--surface2);" onerror="this.style.visibility='hidden'">`
        : `<span style="width:28px;height:28px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;background:var(--surface2);border:1px solid var(--border);color:var(--muted);opacity:.5;font-family:'Mulish',sans-serif;font-weight:700;font-size:11px;">${(p.name || '').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase()}</span>`;
      return `<div class="pp-search-result${i === 0 ? ' focused' : ''}"
        onclick="ppSearchSelect('${p.name.replace(/'/g, "\\'")}')"
        onmouseover="ppFocusResult(this)">
        ${thumbHtml}
        <span class="pos-badge ${_pc(p.pos)}">${p.pos}</span>
        <span class="pp-search-result-name">${p.name}</span>
        <span class="pp-search-result-count">${p.count > 0 ? p.count + ' trade' + (p.count !== 1 ? 's' : '') : 'No trades yet'}</span>
      </div>`;
    }).join('');
    results.classList.add('open');
  }

  function ppFocusResult(el) {
    document.querySelectorAll('.pp-search-result').forEach(r => r.classList.remove('focused'));
    el.classList.add('focused');
  }

  function ppSearchKey(e) {
    const results = document.getElementById('pp-search-results');
    if (!results) return;
    const items = [].slice.call(results.querySelectorAll('.pp-search-result'));
    const focused = results.querySelector('.pp-search-result.focused');
    const idx = items.indexOf(focused);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = items[idx + 1] || items[0];
      items.forEach(r => r.classList.remove('focused'));
      if (next) next.classList.add('focused');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = items[idx - 1] || items[items.length - 1];
      items.forEach(r => r.classList.remove('focused'));
      if (prev) prev.classList.add('focused');
    } else if (e.key === 'Enter') {
      const f = results.querySelector('.pp-search-result.focused');
      if (f) { const name = f.querySelector('.pp-search-result-name').textContent; ppSearchSelect(name); }
    } else if (e.key === 'Escape') {
      results.classList.remove('open');
      results.innerHTML = '';
    }
  }

  function ppSearchSelect(name) {
    const input = document.getElementById('pp-search');
    if (input) input.value = '';
    const drop = document.getElementById('pp-search-results');
    if (drop) { drop.classList.remove('open'); drop.innerHTML = ''; }
    if (!ppPlayers.includes(name)) ppPlayers.push(name);
    ppSwitchTo(name);
  }

  function ppSwitchTo(name) {
    ppActivePlayer = name;
    ppRenderTabStrip();
    openPanelContent(name);
  }

  function ppRemovePlayer(name) {
    ppPlayers = ppPlayers.filter(p => p !== name);
    if (ppPlayers.length === 0) { closePanel(); return; }
    if (ppActivePlayer === name) ppSwitchTo(ppPlayers[ppPlayers.length - 1]);
    else ppRenderTabStrip();
  }

  function ppRenderTabStrip() {
    const strip = document.getElementById('pp-player-tabs');
    if (!strip) return;
    const TRADES = _trades();
    const FP_VALUES = _fp();
    strip.innerHTML = ppPlayers.map(name => {
      const isActive = name === ppActivePlayer;
      const info = TRADES.flatMap(t => t.players || []).find(p => p.name === name);
      const ktcRank = FP_VALUES[name] ? (FP_VALUES[name].posRank || '') : '';
      const pos = (String(ktcRank).replace(/\d+$/, '')) || (info && info.pos) || '?';
      const ktcPos = pos;
      return `<div onclick="ppSwitchTo('${name.replace(/'/g, "\\'")}')"
        style="display:flex;align-items:center;gap:8px;padding:0 16px;height:44px;cursor:pointer;border-bottom:2px solid ${isActive ? 'var(--red)' : 'transparent'};background:${isActive ? 'var(--surface)' : 'transparent'};flex-shrink:0;transition:all .15s;white-space:nowrap">
        ${_imgThumb(name, 24)}
        <span class="pos-badge ${_pc(ktcPos)}" style="font-size:10px;padding:2px 6px">${ktcPos}</span>
        <span style="font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;color:var(--white);opacity:${isActive ? 1 : 0.6}">${name}</span>
        <span onclick="event.stopPropagation();ppRemovePlayer('${name.replace(/'/g, "\\'")}')"
          style="color:var(--white);opacity:1;font-size:12px;cursor:pointer;margin-left:4px;line-height:1"
          onmouseover="this.style.opacity=1;this.style.color='var(--red)'" onmouseout="this.style.opacity=0.3;this.style.color='var(--white)'">✕</span>
      </div>`;
    }).join('');
  }

  // ────────────────────────────────────────────────────────────────────────
  // OPEN / CLOSE / TAB SWITCH
  // ────────────────────────────────────────────────────────────────────────
  function openPanel(playerName) {
    _ensureMounted();
    _maybeBuildTrades();
    if (!ppPlayers.includes(playerName)) ppPlayers.push(playerName);
    ppActivePlayer = playerName;
    ppRenderTabStrip();
    openPanelContent(playerName);
    const panel   = document.getElementById('player-panel');
    const overlay = document.getElementById('panel-overlay');
    if (panel)   panel.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function openPanelContent(playerName) {
    _ensureMounted();
    const TRADES = _trades();
    const FP_VALUES = _fp();
    const SLEEPER_IDS = _sleeper();

    const playerTrades = TRADES.filter(t => (t.players || []).some(p => p.name === playerName));
    const playerInfo = TRADES.flatMap(t => t.players || []).find(p => p.name === playerName);
    const ktc = FP_VALUES[playerName] || {};
    const pos = (playerInfo && playerInfo.pos) || (ktc.posRank ? ktc.posRank.replace(/\d+/g, '') : null) || 'WR';
    const trendVal = ktc.trend || '0';
    const trendNum = parseInt(trendVal, 10);

    const initials = playerName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const sleeperId = SLEEPER_IDS[playerName] || ktc.sleeper_id || null;
    const photoUrl = sleeperId ? `https://sleepercdn.com/content/nfl/players/thumb/${sleeperId}.jpg` : null;
    const avatarEl = document.getElementById('pp-avatar');
    if (!avatarEl) return; // panel not mounted (defensive)
    const fallbackHtml = `<div style="width:80px;height:80px;background:${_posCol(pos)};display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;font-style:italic;color:${_posTxt(pos)}">${initials}</div>`;
    if (photoUrl) {
      const img = document.createElement('img');
      img.src = photoUrl;
      img.alt = playerName;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => { avatarEl.innerHTML = fallbackHtml; };
      avatarEl.innerHTML = '';
      avatarEl.appendChild(img);
    } else {
      avatarEl.innerHTML = fallbackHtml;
    }

    const _set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
    const _setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };

    _set('pp-pos-badge', `<span class="pos-badge ${_pc(pos)}" style="font-size:12px;padding:3px 10px">${pos}</span>`);
    _setText('pp-nfl-team', ktc.team || '—');
    _setText('pp-player-name', playerName);
    _setText('pp-value-val', ktc.value ? ktc.value.toLocaleString() : 'N/A');
    // Overall rank now lives in the meta row chip — clear this line
    _setText('pp-value-rank', '');

    const trendEl = document.getElementById('pp-value-trend');
    if (trendEl) {
      trendEl.innerHTML = trendNum > 0
        ? `<span class="trend up">▲ +${trendNum}</span> <span style="opacity:.65">(7d)</span>`
        : trendNum < 0
          ? `<span class="trend down">▼ ${trendNum}</span> <span style="opacity:.65">(7d)</span>`
          : `<span class="trend flat">—</span> <span style="opacity:.65">(7d)</span>`;
      trendEl.className = `pp-value-trend ${trendNum > 0 ? 'up' : trendNum < 0 ? 'down' : ''}`;
    }

    // Render ALL seven stat cells so every player has the same modal layout.
    const _auctionStr = ktc.auction ? ('$' + String(ktc.auction).replace(/^\$+/, '')) : null;
    _set('pp-meta-row', [
      `<div class="pp-meta-item"><div class="pp-meta-label">Age</div><div class="pp-meta-val">${ktc.age != null ? ktc.age : '—'}</div></div>`,
      `<div class="pp-meta-item" id="pp-exp-item" style="display:none"><div class="pp-meta-label">EXP</div><div class="pp-meta-val" id="pp-exp-val">—</div></div>`,
      `<div class="pp-meta-item"><div class="pp-meta-label">Pos Rank</div><div class="pp-meta-val">${ktc.posRank || '—'}</div></div>`,
      `<div class="pp-meta-item"><div class="pp-meta-label">Overall Rank</div><div class="pp-meta-val">${ktc.rank ? '#' + ktc.rank : '—'}</div></div>`,
      `<div class="pp-meta-item"><div class="pp-meta-label">PPG</div><div class="pp-meta-val">${ktc.ppg != null ? ktc.ppg : '—'}</div></div>`,
      `<div class="pp-meta-item"><div class="pp-meta-label">Dynasty ADP</div><div class="pp-meta-val">${ktc.adp != null ? ktc.adp : '—'}</div></div>`,
      `<div class="pp-meta-item"><div class="pp-meta-label">Auction</div><div class="pp-meta-val" ${_auctionStr ? 'style="color:var(--green)"' : ''}>${_auctionStr || '—'}</div></div>`
    ].join(''));

    // Render articles row if any of the known helpers is available.
    // DB defines an inline renderPlayerArticles. Other pages load the shared
    // assets/js/player-articles.js module which exposes PlayerArticles.mount.
    if (typeof global.renderPlayerArticles === 'function') {
      try { global.renderPlayerArticles(playerName); } catch (e) {}
    } else if (global.PlayerArticles && typeof global.PlayerArticles.mount === 'function') {
      const mount = document.getElementById('pp-articles-mount');
      if (mount) { mount.innerHTML = ''; try { global.PlayerArticles.mount(mount, playerName); } catch (e) {} }
    } else if (typeof global.mountPlayerArticles === 'function') {
      const mount = document.getElementById('pp-articles-mount');
      if (mount) { try { global.mountPlayerArticles(mount, playerName); } catch (e) {} }
    }

    // Fetch years-of-experience from Sleeper.
    if (sleeperId) {
      const setExp = (yoe) => {
        const expEl = document.getElementById('pp-exp-val');
        if (!expEl || yoe === null || yoe === undefined) return;
        expEl.textContent = yoe === 0 ? 'Rookie' : `${yoe} yr${yoe !== 1 ? 's' : ''}`;
        expEl.closest('.pp-meta-item').style.display = '';
      };
      if (global.SLEEPER_PLAYERS_DB) {
        const p = global.SLEEPER_PLAYERS_DB[sleeperId];
        if (p) setExp(p.years_exp);
      } else if (!global.SLEEPER_PLAYERS_DB_LOADING) {
        global.SLEEPER_PLAYERS_DB_LOADING = fetch('https://api.sleeper.app/v1/players/nfl')
          .then(r => r.ok ? r.json() : null)
          .then(db => {
            if (!db) return;
            global.SLEEPER_PLAYERS_DB = db;
            const p = db[sleeperId];
            if (p) setExp(p.years_exp);
          }).catch(() => {});
      } else {
        global.SLEEPER_PLAYERS_DB_LOADING.then(() => {
          const p = global.SLEEPER_PLAYERS_DB && global.SLEEPER_PLAYERS_DB[sleeperId];
          if (p) setExp(p.years_exp);
        });
      }
    }

    const sorted = playerTrades.slice().sort((a, b) => b.date.localeCompare(a.date));

    // ── MVS extras row (shared widgets — OTC + Baseline + Volume + Rankings).
    const mvsExtrasEl = document.getElementById('pp-mvs-extras');
    if (mvsExtrasEl) {
      mvsExtrasEl.innerHTML = (global.MvsExtras && typeof global.MvsExtras.buildHeader === 'function')
        ? global.MvsExtras.buildHeader(playerName)
        : '';
    }
    // Stash sleeperId for the ADP Heatmap tab.
    global._ppActiveSleeperId = sleeperId || null;
    const heatmapTabEl = document.getElementById('pp-heatmap-tab');
    if (heatmapTabEl) heatmapTabEl.innerHTML = '';

    // ── Trades tab — module-local tradeCardHtml is the source of truth.
    // Falls back to page-global only if the host page chose to override it.
    const tradesTabEl = document.getElementById('pp-trades-tab');
    if (tradesTabEl) {
      const renderer = (typeof global.tradeCardHtml === 'function') ? global.tradeCardHtml : tradeCardHtml;
      if (sorted.length) {
        tradesTabEl.innerHTML = sorted.map(t => renderer(t)).join('');
      } else {
        tradesTabEl.innerHTML = `<div style="font-size:13px;opacity:1;padding:20px 0;text-align:center;font-family:'Mulish',sans-serif">No trades found</div>`;
      }
    }

    const ktcVal = ktc.value || 0;
    currentPanelPlayer = { label: playerName, value: ktcVal, posKey: pos, type: 'player' };
    global._currentPanelPlayer = currentPanelPlayer;
    // Restore the user's last-used tab so switching players keeps view.
    ppShowTab(ppLastTab || 'trades');
  }

  // ────────────────────────────────────────────────────────────────────────
  // _buildTradesFromMvs — translate MVS_PAYLOAD.players[*].recentTrades into
  // the legacy {id,date,qb,players[],picks[]} shape every renderer expects.
  // Deduplicates by transaction_id (each trade appears in N players' lists).
  // ────────────────────────────────────────────────────────────────────────
  function _parseMvsPickLabel(name) {
    if (!name) return null;
    let m = name.match(/(\d{4})\s+(?:\d+(?:st|nd|rd|th)\s+)?(\d+)\.(\d+)/i);
    if (m) return { year: m[1], round: parseInt(m[2], 10), slot: parseInt(m[3], 10) };
    m = name.match(/(\d{4})\s+(\d+)(?:st|nd|rd|th)/i);
    if (m) return { year: m[1], round: parseInt(m[2], 10), slot: null };
    return null;
  }
  function _buildTradesFromMvs() {
    if (typeof global.MVS_PAYLOAD === 'undefined' || !global.MVS_PAYLOAD || !global.MVS_PAYLOAD.players) {
      return [];
    }
    const seen = new Set();
    const out = [];
    Object.values(global.MVS_PAYLOAD.players).forEach(p => {
      (p.recentTrades || []).forEach(t => {
        const id = t.transaction_id || `${t.date}|${(t.sides || []).map(s => (s.assets || []).map(a => a.name).join(',')).join('|')}`;
        if (seen.has(id)) return;
        seen.add(id);
        const players = [];
        const picks = [];
        const sideAssetCounts = [0, 0];
        (t.sides || []).forEach((side, idx) => {
          const team = idx === 0 ? 'A' : 'B';
          (side.assets || []).forEach(a => {
            if (!a || a.name == null || String(a.name).trim() === '') return;
            const name = String(a.name);
            const pos = String(a.position || '');
            if (a.isPick || pos === 'PICK') {
              const parsed = _parseMvsPickLabel(name);
              picks.push(Object.assign({ to: team, from: 'TBD', label: name, mvs: a.mvs }, parsed || { year: null, round: null, slot: null }));
            } else {
              players.push({ name, pos, to: team, mvs: a.mvs });
            }
            if (idx < 2) sideAssetCounts[idx]++;
          });
        });
        if (sideAssetCounts[0] === 0 || sideAssetCounts[1] === 0) return;
        out.push({
          id: id,
          date: (t.date || '').slice(0, 10),
          qb: t.format || 'sf',
          players,
          picks,
          week: null, starters: null, teams_count: null, tep: null,
          ppr: null, passtd: null, roster: null, faab: null,
        });
      });
    });
    out.sort((a, b) => (a.date < b.date ? 1 : -1));
    return out;
  }

  // ────────────────────────────────────────────────────────────────────────
  // tradeCardHtml — the trade row renderer. Used for the Trades tab and any
  // pick-page renderer. Re-uses module-level pickThumb / fmtDate / qbLabels.
  // ────────────────────────────────────────────────────────────────────────
  function tradeCardHtml(t) {
    const FP_VALUES = _fp();
    const SLEEPER_IDS = _sleeper();
    const sides = {};
    (t.players || []).forEach(p => {
      const k = p.to || 'A';
      if (!sides[k]) sides[k] = { players: [], picks: [] };
      sides[k].players.push(p);
    });
    (t.picks || []).forEach(pk => {
      const k = pk.to || 'B';
      if (!sides[k]) sides[k] = { players: [], picks: [] };
      sides[k].picks.push(pk);
    });

    const teams = Object.keys(sides);
    const sideA = sides[teams[0]] || { players: [], picks: [] };
    const sideB = sides[teams[1]] || { players: [], picks: [] };

    function renderAssets(side) {
      const items = [];
      side.players.forEach(p => {
        if (!p || !p.name) return;
        const pname = String(p.name);
        const ppos  = String(p.pos || '');
        const nflTeam = (FP_VALUES[pname] && FP_VALUES[pname].team) || '';
        const sid = SLEEPER_IDS[pname]
          || (FP_VALUES[pname] && FP_VALUES[pname].sleeperId)
          || (global.MVS_PAYLOAD && global.MVS_PAYLOAD.players && global.MVS_PAYLOAD.players[pname] && global.MVS_PAYLOAD.players[pname].sleeperId)
          || null;
        const thumbUrl = sid ? `https://sleepercdn.com/content/nfl/players/thumb/${sid}.jpg` : null;
        const thumbHtml = thumbUrl ? `<img src="${thumbUrl}" alt="" style="width:28px;height:28px;min-width:28px;border-radius:50%;object-fit:cover;flex-shrink:0;" onerror="this.style.display='none'">` : '';
        items.push(`<div class="tc-asset">
          <span style="width:28px;height:28px;flex-shrink:0;display:inline-block;">${thumbHtml}</span>
          <span class="pos-badge ${_pc(ppos)}">${ppos}</span>
          <span class="tc-asset-name clickable-player" onclick="openPanel('${pname.replace(/'/g, "\\'")}')">${pname}</span>${nflTeam ? `<span class="tc-nfl-team">${nflTeam}</span>` : ''}
        </div>`);
      });
      side.picks.forEach(pk => {
        const label = `${pk.year} ${pk.round}${pk.slot ? '.' + String(pk.slot).padStart(2, '0') : ''}`;
        items.push(`<div class="tc-asset">
          <span class="clickable-pick" onclick="openPickPage('${pk.year}',${pk.round})">${pickThumb(28)}</span>
          <span class="tc-asset-name clickable-pick" onclick="openPickPage('${pk.year}',${pk.round})">${label}</span>
        </div>`);
      });
      if (!items.length) items.push(`<div class="tc-asset tc-empty">—</div>`);
      return items.join('');
    }

    const chips = [];
    chips.push(`<span class="fmt-chip ${t.qb === 'sf' ? 'sf' : ''}">${qbLabels[t.qb] || t.qb || ''}</span>`);
    if (t.teams_count != null) chips.push(`<span class="fmt-chip">${t.teams_count} Teams</span>`);
    if (t.starters    != null) chips.push(`<span class="fmt-chip">Start ${t.starters}</span>`);
    if (t.ppr != null) {
      const pprLabel = t.ppr === '1' ? 'Full PPR' : t.ppr === '0.5' ? 'Half PPR' : t.ppr === '0.25' ? 'PPC' : '';
      if (pprLabel) chips.push(`<span class="fmt-chip">${pprLabel}</span>`);
    }
    if (t.tep && t.tep !== 'none') chips.push(`<span class="fmt-chip tep">${t.tep} TEP</span>`);
    if (t.faab) chips.push(`<span class="faab-badge">${t.faab}</span>`);

    return `<div class="trade-card">
      <div class="tc-date">${fmtDate(t.date)}</div>
      <div class="tc-body">
        <div class="tc-side">
          <div class="tc-side-label">Side A</div>
          ${renderAssets(sideA)}
        </div>
        <div class="tc-divider"></div>
        <div class="tc-side">
          <div class="tc-side-label">Side B</div>
          ${renderAssets(sideB)}
        </div>
      </div>
      <div class="tc-chips">${chips.join('')}</div>
    </div>`;
  }

  // ────────────────────────────────────────────────────────────────────────
  // openPickPage — pick-detail panel (used by tradeCard onclick=openPickPage).
  // On pages that don't have the pick-panel DOM, falls back gracefully.
  // ────────────────────────────────────────────────────────────────────────
  function openPickPage(year, round) {
    // Only DB page has the pick-panel DOM. On other pages, no-op.
    if (!document.getElementById('pick-panel')) return;
    const TRADES = _trades();
    const pickTrades = TRADES.filter(t => (t.picks || []).some(p => p.year === year && p.round === round));
    if (!pickTrades.length) return;
    const sorted = pickTrades.slice().sort((a, b) => b.date.localeCompare(a.date));
    const key = `${year} Rd${round}`;
    const roundLabel = round === 1 ? '1st Round' : round === 2 ? '2nd Round' : round === 3 ? '3rd Round' : '4th Round';
    const _set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
    const _setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };

    _set('pick-panel-title',
      `${pickThumb(32)}<span class="${round === 1 ? 'rd1-badge' : 'pick-badge'}" style="font-size:14px;padding:4px 12px">${key}</span>
       <span style="font-size:12px;opacity:1;font-family:'Mulish';font-weight:400;font-style:normal">${roundLabel} · ${year} Rookie Draft Class</span>`);

    _setText('pkp-count',   pickTrades.length);
    _setText('pkp-last',    sorted[0].date);
    _setText('pkp-players', pickTrades.reduce((s, t) => s + (t.players || []).length, 0));
    _setText('pkp-year',    year);

    const otherRounds = Array.from(new Set(TRADES.flatMap(t => t.picks || []).filter(p => p.year === year).map(p => p.round))).sort();
    const otherYears  = Array.from(new Set(TRADES.flatMap(t => t.picks || []).filter(p => p.round === round && p.year !== year).map(p => p.year))).sort();
    _set('pick-panel-related',
      `<span style="font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-transform:uppercase;letter-spacing:.07em;align-self:center">${year}:</span>` +
      otherRounds.map(r => `<span class="${r === round ? 'rd1-badge' : 'pick-badge'} clickable-pick" onclick="openPickPage('${year}',${r})" style="cursor:pointer">${year} Rd${r}</span>`).join('') +
      (otherYears.length ? `<span style="font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--white);opacity:1;margin-left:8px;align-self:center">Other years:</span>` +
        otherYears.map(y => `<span class="pick-badge clickable-pick" onclick="openPickPage('${y}',${round})" style="cursor:pointer">${y} Rd${round}</span>`).join('') : ''));

    _set('pick-panel-body', sorted.map(t => tradeCardHtml(t)).join(''));

    const allPickAssets = getAllAssets().filter(a => a.type === 'pick');
    const seedPick = allPickAssets.find(a => a.label === `${year} ${round}.01`) || { label: `${year} Rd${round}`, value: 5000 };
    global.currentPanelPick = { label: seedPick.label, value: seedPick.value, posKey: 'PK', type: 'pick' };
    delete tfState['pick-panel-finder'];
    if (typeof global.pkpShowTab === 'function') {
      try { global.pkpShowTab('trades'); } catch (e) {}
    }

    const pickPanel   = document.getElementById('pick-panel');
    const pickOverlay = document.getElementById('pick-overlay');
    if (pickPanel)   pickPanel.classList.add('open');
    if (pickOverlay) pickOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  // pkpShowTab — pick-panel internal tab switcher (DB-only DOM; safe no-op
  // elsewhere). Mirrors index.html's pkpShowTab.
  function pkpShowTab(name) {
    const body   = document.getElementById('pick-panel-body');
    const finder = document.getElementById('pick-panel-finder');
    if (!body && !finder) return;
    if (body)   body.style.display   = name === 'trades' ? 'block' : 'none';
    if (finder) finder.style.display = name === 'finder' ? 'block' : 'none';
    document.querySelectorAll('#pick-panel .pp-tab').forEach((el, i) => {
      el.classList.toggle('active', ['trades', 'finder'][i] === name);
    });
    if (name === 'finder' && global.currentPanelPick) {
      renderTradeFinder('pick-panel-finder', global.currentPanelPick);
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // getAllAssets — every tradeable asset (players from FP_VALUES + picks
  // from PICK_VALUES). Used by Trade Finder and any inline search bar.
  // ────────────────────────────────────────────────────────────────────────
  function getAllAssets() {
    const FP_VALUES = _fp();
    const TRADES    = _trades();
    const PICK_VALUES = (typeof global.PICK_VALUES !== 'undefined' && global.PICK_VALUES) ? global.PICK_VALUES : {};
    const assets = [];
    Object.entries(FP_VALUES).forEach(([name, d]) => {
      let posKey = (d.posRank || '').replace(/\d+$/, '');
      if (!posKey) {
        const hit = TRADES.flatMap(t => t.players || []).find(p => p.name === name);
        posKey = (hit && hit.pos) || '?';
      }
      assets.push({ label: name, value: d.value || 0, pos: null, type: 'player', posKey });
    });
    Object.entries(PICK_VALUES).forEach(([key, rec]) => {
      const label = (rec && rec.label) || key;
      const value = (rec && rec.value) || 0;
      assets.push({ label, value, type: 'pick', posKey: 'PK' });
    });
    return assets.sort((a, b) => (b.value || 0) - (a.value || 0));
  }

  // ────────────────────────────────────────────────────────────────────────
  // renderAgeCurve — Age / Value curve SVG for the Curve tab.
  // ────────────────────────────────────────────────────────────────────────
  function renderAgeCurve(containerId, player) {
    const el = document.getElementById(containerId);
    if (!el || !player) return;

    const FP_VALUES = _fp();
    const ADP_DATA  = _adpData();
    const pos = player.posKey;
    const ktc = FP_VALUES[player.label] || {};
    const adpData = ADP_DATA[player.label] || null;
    const playerAge = ktc.age || 25;
    const playerVal = ktc.value || 0;

    function adpToValue(adp) {
      if (!adp || adp <= 0) return null;
      const maxVal = 10000;
      return Math.round(maxVal * Math.pow(0.93, adp - 1));
    }

    let _adpFmt = 'sf';
    try { const v = localStorage.getItem('fpts-adp-format'); if (v === '1qb' || v === 'sf') _adpFmt = v; } catch (e) {}
    const _adpSlot = _adpFmt === '1qb' ? (adpData && adpData.oneqb) : (adpData && adpData.sf);
    const adpOverall = (_adpSlot && _adpSlot.overall != null) ? _adpSlot.overall : (ktc.adp || null);
    const adpImpliedVal = adpToValue(adpOverall);

    const curves = {
      QB: { peak: 28, peakVal: 9000, start: 22, end: 38, rampUp: 1.8, decayRate: 0.88 },
      RB: { peak: 24, peakVal: 8500, start: 21, end: 32, rampUp: 2.5, decayRate: 0.78 },
      WR: { peak: 26, peakVal: 9000, start: 21, end: 35, rampUp: 1.6, decayRate: 0.84 },
      TE: { peak: 27, peakVal: 7500, start: 22, end: 35, rampUp: 1.4, decayRate: 0.83 },
    };
    const curve = curves[pos] || curves.WR;

    function posValue(age) {
      if (age < curve.start || age > curve.end) return 0;
      if (age <= curve.peak) {
        const t = (age - curve.start) / (curve.peak - curve.start);
        return Math.round(curve.peakVal * Math.pow(t, 1 / curve.rampUp));
      } else {
        return Math.round(curve.peakVal * Math.pow(curve.decayRate, age - curve.peak));
      }
    }

    const scaleFactor = playerVal > 0 && posValue(playerAge) > 0 ? playerVal / posValue(playerAge) : 1;
    function playerValue(age) { return Math.max(0, Math.round(posValue(age) * scaleFactor)); }

    const ages = [];
    for (let a = curve.start; a <= curve.end; a++) ages.push(a);

    const posVals    = ages.map(a => posValue(a));
    const playerVals = ages.map(a => playerValue(a));
    const maxVal = Math.max.apply(null, posVals.concat(playerVals, [adpImpliedVal || 0, 1000]));

    const W = 560, H = 260, PAD = { top: 24, right: 20, bottom: 40, left: 56 };
    const cW = W - PAD.left - PAD.right;
    const cH = H - PAD.top - PAD.bottom;

    function xPos(age) { return PAD.left + ((age - curve.start) / (curve.end - curve.start)) * cW; }
    function yPos(val) { return PAD.top + cH - (val / maxVal) * cH; }

    function makePath(vals) {
      return ages.map((a, i) => `${i === 0 ? 'M' : 'L'}${xPos(a).toFixed(1)},${yPos(vals[i]).toFixed(1)}`).join(' ');
    }
    function makeArea(vals) {
      const line = ages.map((a, i) => `${i === 0 ? 'M' : 'L'}${xPos(a).toFixed(1)},${yPos(vals[i]).toFixed(1)}`).join(' ');
      return `${line} L${xPos(curve.end).toFixed(1)},${(PAD.top + cH).toFixed(1)} L${xPos(curve.start).toFixed(1)},${(PAD.top + cH).toFixed(1)} Z`;
    }

    const posColorMap = { WR: '#5b9bd5', RB: 'var(--green)', QB: '#e05252', TE: '#e09a30' };
    const posCol = posColorMap[pos] || '#9b91d4';
    const adpCol = 'var(--red)';

    const gridLines = [0, 2500, 5000, 7500, 10000].filter(v => v <= maxVal * 1.1);
    const ageLabels = ages.filter(a => a % 2 === 0);
    const dotX = xPos(playerAge);
    const dotY = yPos(playerVal);

    let signal = '', signalColor = 'var(--white)';
    if (adpImpliedVal && playerVal) {
      const gap = playerVal - adpImpliedVal;
      const pct = Math.round(Math.abs(gap) / Math.max(playerVal, adpImpliedVal) * 100);
      if (gap > 500) { signal = `▲ Buy-low signal — FC value ${pct}% above ADP cost`; signalColor = 'var(--green)'; }
      else if (gap < -500) { signal = `▼ Sell-high signal — ADP cost ${pct}% above FC value`; signalColor = '#e05252'; }
      else { signal = `≈ Fairly priced — FC value and ADP within range`; signalColor = 'var(--yellow)'; }
    }

    const svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;overflow:visible">
      <defs>
        <linearGradient id="ag-playerGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${posCol}" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="${posCol}" stop-opacity="0.01"/>
        </linearGradient>
        <linearGradient id="ag-posGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--white)" stop-opacity="0.05"/>
          <stop offset="100%" stop-color="var(--white)" stop-opacity="0"/>
        </linearGradient>
      </defs>

      ${gridLines.map(v => `
        <line x1="${PAD.left}" y1="${yPos(v).toFixed(1)}" x2="${W - PAD.right}" y2="${yPos(v).toFixed(1)}"
          stroke="var(--border)" stroke-width="1"/>
        <text x="${PAD.left - 6}" y="${(yPos(v) + 4).toFixed(1)}"
          text-anchor="end" font-family="Mulish" font-size="9" fill="var(--white)" opacity="0.45">
          ${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}
        </text>`).join('')}

      <line x1="${xPos(playerAge).toFixed(1)}" y1="${PAD.top}" x2="${xPos(playerAge).toFixed(1)}" y2="${PAD.top + cH}"
        stroke="${posCol}" stroke-width="1" stroke-dasharray="4,3" opacity="0.4"/>
      <line x1="${xPos(curve.peak).toFixed(1)}" y1="${PAD.top}" x2="${xPos(curve.peak).toFixed(1)}" y2="${PAD.top + cH}"
        stroke="var(--white)" stroke-width="1" stroke-dasharray="2,4" opacity="0.15"/>
      <text x="${xPos(curve.peak).toFixed(1)}" y="${(PAD.top - 8).toFixed(1)}"
        text-anchor="middle" font-family="Kanit" font-weight="800" font-size="9" fill="var(--white)" opacity="0.25">PEAK ${curve.peak}</text>

      <path d="${makeArea(posVals)}" fill="url(#ag-posGrad)"/>
      <path d="${makePath(posVals)}" fill="none" stroke="var(--white)" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.3"/>

      <path d="${makeArea(playerVals)}" fill="url(#ag-playerGrad)"/>
      <path d="${makePath(playerVals)}" fill="none" stroke="${posCol}" stroke-width="2.5" stroke-linejoin="round"/>

      ${adpImpliedVal ? `
        <line x1="${PAD.left}" y1="${yPos(adpImpliedVal).toFixed(1)}" x2="${W - PAD.right}" y2="${yPos(adpImpliedVal).toFixed(1)}"
          stroke="${adpCol}" stroke-width="1.5" stroke-dasharray="6,3" opacity="0.7"/>
        <circle cx="${dotX.toFixed(1)}" cy="${yPos(adpImpliedVal).toFixed(1)}" r="4" fill="${adpCol}" stroke="var(--black)" stroke-width="2"/>
        <circle cx="${dotX.toFixed(1)}" cy="${yPos(adpImpliedVal).toFixed(1)}" r="8" fill="${adpCol}" opacity="0.15"/>
        <line x1="${dotX.toFixed(1)}" y1="${dotY.toFixed(1)}" x2="${dotX.toFixed(1)}" y2="${yPos(adpImpliedVal).toFixed(1)}"
          stroke="var(--white)" stroke-width="1" stroke-dasharray="2,2" opacity="0.3"/>
      ` : ''}

      <circle cx="${dotX.toFixed(1)}" cy="${dotY.toFixed(1)}" r="5" fill="${posCol}" stroke="var(--black)" stroke-width="2"/>
      <circle cx="${dotX.toFixed(1)}" cy="${dotY.toFixed(1)}" r="9" fill="${posCol}" opacity="0.2"/>

      ${ageLabels.map(a => `
        <text x="${xPos(a).toFixed(1)}" y="${(PAD.top + cH + 16).toFixed(1)}"
          text-anchor="middle" font-family="Mulish" font-size="9" fill="var(--white)" opacity="0.45">${a}</text>`).join('')}
      <text x="${(PAD.left + cW / 2).toFixed(1)}" y="${(H - 2).toFixed(1)}"
        text-anchor="middle" font-family="Mulish" font-size="10" fill="var(--white)" opacity="0.35">AGE</text>
    </svg>`;

    const legend = `<div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:14px;padding:0 2px">
      <div style="display:flex;align-items:center;gap:6px">
        <div style="width:18px;height:3px;background:${posCol};border-radius:2px"></div>
        <span style="font-family:'Mulish',sans-serif;font-size:11px;color:var(--white)">${player.label} — FC Value</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <div style="width:18px;height:2px;border-top:2px dashed var(--white);opacity:0.35"></div>
        <span style="font-family:'Mulish',sans-serif;font-size:11px;color:var(--white);opacity:0.5">${pos} Position Avg</span>
      </div>
      ${adpImpliedVal ? `<div style="display:flex;align-items:center;gap:6px">
        <div style="width:18px;height:2px;border-top:2px dashed ${adpCol};opacity:0.8"></div>
        <span style="font-family:'Mulish',sans-serif;font-size:11px;color:var(--red)">ADP-Implied Value</span>
      </div>` : ''}
    </div>`;

    const yearsTopeak = curve.peak - playerAge;
    const peakLabel = yearsTopeak > 0
      ? `<span style="color:var(--green);font-size:11px;font-family:'Mulish',sans-serif">▲ ${yearsTopeak}yr to peak</span>`
      : yearsTopeak === 0 ? `<span style="color:var(--red);font-size:11px;font-family:'Mulish',sans-serif">★ At peak</span>`
      : `<span style="color:var(--red);font-size:11px;font-family:'Mulish',sans-serif">▼ ${Math.abs(yearsTopeak)}yr past peak</span>`;

    const projVal5 = playerValue(playerAge + 5);
    const adpRank = adpOverall ? `SF: ${adpOverall.toFixed(1)}` : '—';

    const stats = `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border);border:1px solid var(--border);margin-top:14px">
      <div style="background:var(--surface);padding:10px 12px">
        <div style="font-family:'Mulish',sans-serif;font-size:9px;color:var(--white);opacity:0.5;text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px">Age / Peak</div>
        <div style="font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:18px;color:var(--white)">${playerAge} <span style="font-size:12px;opacity:0.4">/ ${curve.peak}</span></div>
        <div style="margin-top:2px">${peakLabel}</div>
      </div>
      <div style="background:var(--surface);padding:10px 12px">
        <div style="font-family:'Mulish',sans-serif;font-size:9px;color:var(--white);opacity:0.5;text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px">FC Value</div>
        <div style="font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:18px;color:var(--white)">${playerVal.toLocaleString()}</div>
      </div>
      <div style="background:var(--surface);padding:10px 12px">
        <div style="font-family:'Mulish',sans-serif;font-size:9px;color:var(--white);opacity:0.5;text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px">ADP (SF)</div>
        <div style="font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:18px;color:var(--red)">${adpRank}</div>
      </div>
      <div style="background:var(--surface);padding:10px 12px">
        <div style="font-family:'Mulish',sans-serif;font-size:9px;color:var(--white);opacity:0.5;text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px">Proj +5yr</div>
        <div style="font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:18px;color:var(--white)">${projVal5.toLocaleString()}</div>
      </div>
    </div>
    ${signal ? `<div style="margin-top:10px;padding:8px 12px;background:var(--surface);border:1px solid var(--border);border-left:3px solid ${signalColor}">
      <span style="font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:12px;color:${signalColor}">${signal}</span>
    </div>` : ''}`;

    el.innerHTML = `<div style="padding:16px 4px 20px">
      <div style="font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;letter-spacing:.07em;margin-bottom:14px;padding-bottom:6px;border-bottom:1px solid var(--border)">Age / Value Curve — ${pos} Position</div>
      ${legend}
      <div style="width:100%;overflow:hidden">${svg}</div>
      ${stats}
      <div style="font-family:'Mulish',sans-serif;font-size:10px;color:var(--white);opacity:0.25;margin-top:10px;text-align:center">Curve based on historical dynasty positional aging · FC value scaled to current rating · ADP reflects SF market cost</div>
    </div>`;
  }

  // ────────────────────────────────────────────────────────────────────────
  // renderTradeFinder + _drawTradeFinder + tf* helpers
  // ────────────────────────────────────────────────────────────────────────
  function renderTradeFinder(containerId, seedAsset) {
    const state = tfGetState(containerId);
    if (seedAsset && !state.sideA.length) state.sideA.push(seedAsset);
    _drawTradeFinder(containerId);
  }

  function _drawTradeFinder(containerId) {
    const state = tfGetState(containerId);
    const totalA = state.sideA.reduce((s, a) => s + (a.value || 0), 0);
    const totalB = state.sideB.reduce((s, a) => s + (a.value || 0), 0);
    const diff = totalA - totalB;
    const absDiff = Math.abs(diff);
    const maxSide = Math.max(totalA, totalB, 1);
    const pct = Math.min(Math.round(absDiff / maxSide * 100), 100);

    let balanceColor, balanceText;
    if (absDiff < 300) {
      balanceColor = 'var(--green)'; balanceText = '✓ Fair trade';
    } else if (diff > 0) {
      balanceColor = '#e05252'; balanceText = `Side A is ${absDiff.toLocaleString()} pts over`;
    } else {
      balanceColor = '#e05252'; balanceText = `Side B is ${absDiff.toLocaleString()} pts over`;
    }

    function renderAddSlot(side) {
      const activeSlot = global._tfActiveSlot;
      const isActive = activeSlot && activeSlot.id === containerId && activeSlot.side === side;
      const used = state.sideA.concat(state.sideB).map(a => a.label);
      const gap = side === 'A' ? Math.abs(totalA - totalB) : Math.abs(totalB - totalA);
      const allAssets = getAllAssets().filter(a => used.indexOf(a.label) === -1);
      const query = (global._tfQuery && global._tfQuery.id === containerId && global._tfQuery.side === side) ? global._tfQuery.val : '';
      const opts = query
        ? allAssets.filter(a => a.label.toLowerCase().indexOf(query.toLowerCase()) !== -1).slice(0, 8)
        : gap > 100
          ? allAssets.map(a => Object.assign({}, a, { cl: Math.abs((a.value || 0) - gap) })).sort((a, b) => a.cl - b.cl).slice(0, 8)
          : allAssets.slice(0, 8);
      const inputId = 'tf-search-' + containerId.replace(/[^a-z0-9]/gi, '-') + '-' + side;
      const slotHtml = isActive
        ? `<div style="margin-top:6px;border:1px solid var(--red)">
            <input id="${inputId}" type="text" value="${query}"
              placeholder="Search player or pick..."
              style="width:100%;background:var(--surface);border:none;outline:none;color:var(--white);font-family:'Mulish',sans-serif;font-size:12px;font-weight:700;padding:8px 10px"
              oninput="tfQuerySlot('${containerId}','${side}',this.value)"
              onkeydown="if(event.key==='Escape'){tfDeactivateSlot('${containerId}','${side}')}"
              autocomplete="off">
          </div>`
        : `<div onclick="tfActivateSlot('${containerId}','${side}')"
            style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--surface);border:1px dashed var(--border2);cursor:pointer;margin-top:6px;transition:border-color .15s"
            onmouseover="this.style.borderColor='var(--red)'" onmouseout="this.style.borderColor='var(--border2)'">
            <span style="font-family:'Mulish',sans-serif;font-size:12px;color:var(--white);opacity:1">+ Add player or pick...</span>
          </div>`;
      const listHtml = isActive ? `<div style="border:1px solid var(--border2);border-top:none;max-height:220px;overflow-y:auto">
        ${opts.length ? opts.map(a => `
          <div class="tf-add-option"
            onclick="tfAddFromSearch('${containerId}','${side}','${(a.label || '').replace(/'/g, "\\'")}',${a.value || 0},'${a.posKey || ''}','${a.type || ''}')"
            onmouseover="this.parentNode.querySelectorAll('.tf-add-option').forEach(e=>e.classList.remove('focused'));this.classList.add('focused')">
            ${a.type === 'pick' ? pickThumb(24) : _imgThumb(a.label, 24) + `<span class="pos-badge ${_pc(a.posKey)}" style="font-size:9px;padding:1px 5px">${a.posKey || ''}</span>`}
            <span class="tf-add-option-name">${a.label}</span>
            <span class="tf-add-option-val">${(a.value || 0).toLocaleString()}</span>
          </div>`).join('') : `<div style="padding:12px;font-family:'Mulish',sans-serif;font-size:12px;color:var(--white);opacity:1">No results</div>`}
      </div>` : '';
      if (isActive) setTimeout(() => { const el = document.getElementById(inputId); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }, 10);
      return slotHtml + listHtml;
    }

    const html = `<div class="tf-wrap">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border)">
        <div style="font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;letter-spacing:.07em">Build Your Trade</div>
        <button class="fpts-xpage-btn" onclick="event.stopPropagation();_fptsXpageOpenCalcFromFinder()" title="Open in the standalone trade calculator with this trade pre-loaded">Open in Calculator ↗</button>
      </div>

      <div class="tf-sides">
        ${['A', 'B'].map(side => `
          <div class="tf-side">
            <div class="tf-side-label">Side ${side}</div>
            <div class="tf-side-val">${state['side' + side].reduce((s, a) => s + (a.value || 0), 0).toLocaleString()}</div>
            <div class="tf-asset-list">
              ${state['side' + side].map((a, i) => {
                const _pos = a.type === 'pick' ? 'PK' : String(a.posKey || '').toUpperCase().replace(/\d+/g, '') || 'WR';
                const _parts = String(a.label || '').trim().split(/\s+/);
                const _fname = _parts.length > 1 ? _parts.slice(0, -1).join(' ') : '';
                const _lname = _parts[_parts.length - 1] || a.label;
                const _nameHtml = `<span class="tf-asset-name">${_fname ? `<span class="fn">${_fname.replace(/'/g, "\\'")}</span>` : ''}<span class="ln">${_lname.replace(/'/g, "\\'")}</span></span>`;
                return `
                <div class="tf-asset" data-pos="${_pos}">
                  ${a.type === 'pick' ? pickThumb(24) : _imgThumb(a.label, 24) + `<span class="pos-badge ${_pc(_pos)}" style="font-size:9px;padding:1px 5px">${_pos}</span>`}
                  ${_nameHtml}
                  <span class="tf-asset-val">${(a.value || 0).toLocaleString()}</span>
                  <span class="tf-asset-remove" onclick="tfRemove('${containerId}','${side}',${i})">✕</span>
                </div>`;
              }).join('')}
            </div>
            ${renderAddSlot(side)}
          </div>`).join('')}
      </div>

      <div class="tf-balance-bar">
        <div class="tf-balance-track" style="margin-bottom:10px">
          <div class="tf-balance-mid"></div>
          <div class="tf-balance-fill" style="
            background:${balanceColor};
            width:${pct / 2}%;
            left:${diff > 0 ? 50 : 50 - pct / 2}%">
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:20px;color:var(--white)">${totalA.toLocaleString()}<span style="font-size:10px;opacity:1;margin-left:4px;font-family:'Mulish',sans-serif;font-style:normal">SIDE A</span></div>
          <div style="text-align:center">
            <div class="tf-balance-summary" style="color:${balanceColor}">${balanceText}</div>
          </div>
          <div style="font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:20px;color:var(--white);text-align:right">${totalB.toLocaleString()}<span style="font-size:10px;opacity:1;margin-left:4px;font-family:'Mulish',sans-serif;font-style:normal">SIDE B</span></div>
        </div>
      </div>
    </div>`;

    const elTf = document.getElementById(containerId);
    if (elTf) elTf.innerHTML = html;
  }

  function tfQuerySlot(containerId, side, val) {
    global._tfQuery = { id: containerId, side, val };
    const state = tfGetState(containerId);
    const totalA = state.sideA.reduce((s, a) => s + (a.value || 0), 0);
    const totalB = state.sideB.reduce((s, a) => s + (a.value || 0), 0);
    const gap = side === 'A' ? Math.abs(totalA - totalB) : Math.abs(totalB - totalA);
    const used = state.sideA.concat(state.sideB).map(a => a.label);
    const allAssets = getAllAssets().filter(a => used.indexOf(a.label) === -1);
    const opts = val
      ? allAssets.filter(a => a.label.toLowerCase().indexOf(val.toLowerCase()) !== -1).slice(0, 8)
      : gap > 100
        ? allAssets.map(a => Object.assign({}, a, { cl: Math.abs((a.value || 0) - gap) })).sort((a, b) => a.cl - b.cl).slice(0, 8)
        : allAssets.slice(0, 8);
    const inputId = 'tf-search-' + containerId.replace(/[^a-z0-9]/gi, '-') + '-' + side;
    const input = document.getElementById(inputId);
    if (!input) { _drawTradeFinder(containerId); return; }
    const listEl = input.parentNode.nextElementSibling;
    if (!listEl) { _drawTradeFinder(containerId); return; }
    listEl.innerHTML = opts.length ? opts.map(a => `
      <div class="tf-add-option"
        onclick="tfAddFromSearch('${containerId}','${side}','${(a.label || '').replace(/'/g, "\\'")}',${a.value || 0},'${a.posKey || ''}','${a.type || ''}')"
        onmouseover="this.parentNode.querySelectorAll('.tf-add-option').forEach(e=>e.classList.remove('focused'));this.classList.add('focused')">
        ${a.type === 'pick' ? pickThumb(24) : _imgThumb(a.label, 24) + `<span class="pos-badge ${_pc(a.posKey)}" style="font-size:9px;padding:1px 5px">${a.posKey || ''}</span>`}
        <span class="tf-add-option-name">${a.label}</span>
        <span class="tf-add-option-val">${(a.value || 0).toLocaleString()}</span>
      </div>`).join('') : `<div style="padding:12px;font-family:'Mulish',sans-serif;font-size:12px;color:var(--white)">No results</div>`;
  }

  function tfDeactivateSlot(containerId, side) {
    global._tfActiveSlot = null;
    global._tfQuery = null;
    _drawTradeFinder(containerId);
  }

  function tfActivateSlot(containerId, side) {
    if (global._tfActiveSlot && global._tfActiveSlot.id === containerId && global._tfActiveSlot.side === side) {
      global._tfActiveSlot = null;
      global._tfQuery = null;
    } else {
      global._tfActiveSlot = { id: containerId, side };
      global._tfQuery = null;
    }
    _drawTradeFinder(containerId);
  }

  function tfAddFromSearch(containerId, side, label, value, posKey, type) {
    const state = tfGetState(containerId);
    state['side' + side].push({ label, value, posKey, type });
    global._tfActiveSlot = null;
    global._tfQuery = null;
    _drawTradeFinder(containerId);
  }

  function tfRemove(containerId, side, idx) {
    const state = tfGetState(containerId);
    state['side' + side].splice(idx, 1);
    _drawTradeFinder(containerId);
  }

  // Bridge for the Trade Finder's "Open in Calculator" button — collects all
  // active sides from tfState and pushes via the handoff bridge.
  function _fptsXpageOpenCalcFromFinder() {
    let payload = { source: _currentPage || 'db', trade: { sideA: [], sideB: [] } };
    try {
      if (tfState && typeof tfState === 'object') {
        const containerId = Object.keys(tfState)[0];
        if (containerId && tfState[containerId]) {
          const st = tfState[containerId];
          const map = a => ({ name: a.label || a.name, pos: a.posKey || a.pos || 'WR', value: a.value || 0, type: a.type || 'player' });
          payload.trade.sideA = (st.sideA || []).map(map);
          payload.trade.sideB = (st.sideB || []).map(map);
        }
      }
    } catch (e) {}
    global._fptsWriteHandoff(payload, 'trade-calculator.html');
  }

  // ────────────────────────────────────────────────────────────────────────
  // renderPlayerStats — Sleeper per-season stat table.
  // ────────────────────────────────────────────────────────────────────────
  function renderPlayerStats(containerId, player) {
    const el = document.getElementById(containerId);
    if (!el || !player) return;

    const SLEEPER_IDS = _sleeper();
    const pos     = player.posKey || 'WR';
    const posName = { WR: 'Wide Receiver', RB: 'Running Back', QB: 'Quarterback', TE: 'Tight End' }[pos] || pos;
    const name    = player.label;
    let sleeperId = SLEEPER_IDS[name] || null;
    if (!sleeperId) {
      const FP_VALUES = _fp();
      if (FP_VALUES[name] && FP_VALUES[name].sleeperId) sleeperId = String(FP_VALUES[name].sleeperId);
    }

    if (!sleeperId) {
      el.innerHTML = `<div style="padding:24px;text-align:center;font-family:'Mulish',sans-serif;font-size:13px;color:var(--muted);opacity:.5">No Sleeper ID found for ${name}</div>`;
      return;
    }

    el.innerHTML = `<div style="display:flex;align-items:center;gap:10px;padding:24px;font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted);opacity:.4">
      <div style="width:8px;height:8px;border-radius:50%;background:var(--red);animation:ml-pulse 1.2s ease-in-out infinite"></div>
      <div style="width:8px;height:8px;border-radius:50%;background:var(--red);animation:ml-pulse 1.2s ease-in-out .2s infinite"></div>
      <div style="width:8px;height:8px;border-radius:50%;background:var(--red);animation:ml-pulse 1.2s ease-in-out .4s infinite"></div>
      Loading stats from Sleeper...
    </div>`;

    const seasons = ['2025', '2024', '2023', '2022', '2021', '2020'];
    const tryFetch = url => fetch(url).then(r => r.ok ? r.json() : null).catch(() => null);
    const fetches = seasons.map(yr =>
      tryFetch(`https://api.sleeper.com/stats/nfl/player/${sleeperId}?season=${yr}&season_type=regular&grouping=season`)
        .then(d => d || tryFetch(`https://api.sleeper.app/v1/stats/nfl/player/${sleeperId}?season_type=regular&season=${yr}&grouping=season`))
    );

    Promise.all(fetches).then(results => {
      const yearStats = {};
      results.forEach((data, i) => {
        if (!data) return;
        const yr = seasons[i];
        const s = data.stats || data;
        if (!s || !s.gp || s.gp === 0) return;
        yearStats[yr] = s;
      });

      if (!Object.keys(yearStats).length) {
        el.innerHTML = `<div style="padding:24px;text-align:center;font-family:'Mulish',sans-serif;font-size:13px;color:var(--muted);opacity:.5">No stats available</div>`;
        return;
      }

      const colDefs = {
        QB: [
          { key: 'pts_ppr',   label: 'FPTS',    fmt: v => v ? (+v).toFixed(1) : '—' },
          { key: 'gp',        label: 'GP',      fmt: v => v || '—' },
          { key: 'pass_yd',   label: 'Pass Yds',fmt: v => v ? (+v).toLocaleString() : '—' },
          { key: 'pass_td',   label: 'Pass TD', fmt: v => v || '—' },
          { key: 'pass_int',  label: 'INT',     fmt: v => v != null ? v : '—' },
          { key: 'pass_cmp_pct', label: 'Cmp%', fmt: v => v ? (+(v) * 100).toFixed(1) + '%' : '—' },
          { key: 'pass_att',  label: 'Att',     fmt: v => v || '—' },
          { key: 'rush_yd',   label: 'Rush Yds',fmt: v => v || '—' },
          { key: 'rush_td',   label: 'Rush TD', fmt: v => v != null ? v : '—' },
          { key: 'pts_ppr',   label: 'PPG',     fmt: (v, s) => s.gp && v ? (+v / +s.gp).toFixed(1) : '—', useRow: true },
        ],
        RB: [
          { key: 'pts_ppr',   label: 'FPTS',    fmt: v => v ? (+v).toFixed(1) : '—' },
          { key: 'gp',        label: 'GP',      fmt: v => v || '—' },
          { key: 'rush_yd',   label: 'Rush Yds',fmt: v => v ? (+v).toLocaleString() : '—' },
          { key: 'rush_att',  label: 'Rush Att',fmt: v => v || '—' },
          { key: 'rush_td',   label: 'Rush TD', fmt: v => v != null ? v : '—' },
          { key: 'rush_yd_per_att', label: 'YPC', fmt: v => v ? (+v).toFixed(1) : '—' },
          { key: 'rec',       label: 'Rec',     fmt: v => v || '—' },
          { key: 'rec_yd',    label: 'Rec Yds', fmt: v => v || '—' },
          { key: 'rec_td',    label: 'Rec TD',  fmt: v => v != null ? v : '—' },
          { key: 'pts_ppr',   label: 'PPG',     fmt: (v, s) => s.gp && v ? (+v / +s.gp).toFixed(1) : '—', useRow: true },
        ],
        WR: [
          { key: 'pts_ppr',   label: 'FPTS',    fmt: v => v ? (+v).toFixed(1) : '—' },
          { key: 'gp',        label: 'GP',      fmt: v => v || '—' },
          { key: 'rec_tgt',   label: 'TGT',     fmt: v => v || '—' },
          { key: 'rec',       label: 'Rec',     fmt: v => v || '—' },
          { key: 'rec_yd',    label: 'Rec Yds', fmt: v => v ? (+v).toLocaleString() : '—' },
          { key: 'rec_td',    label: 'Rec TD',  fmt: v => v != null ? v : '—' },
          { key: 'rec_yd_per_rec', label: 'YPR', fmt: v => v ? (+v).toFixed(1) : '—' },
          { key: 'rec_tgt',   label: 'TGT/G',   fmt: (v, s) => s.gp && v ? (+v / +s.gp).toFixed(1) : '—', useRow: true },
          { key: 'pts_ppr',   label: 'PPG',     fmt: (v, s) => s.gp && v ? (+v / +s.gp).toFixed(1) : '—', useRow: true },
        ],
        TE: [
          { key: 'pts_ppr',   label: 'FPTS',    fmt: v => v ? (+v).toFixed(1) : '—' },
          { key: 'gp',        label: 'GP',      fmt: v => v || '—' },
          { key: 'rec_tgt',   label: 'TGT',     fmt: v => v || '—' },
          { key: 'rec',       label: 'Rec',     fmt: v => v || '—' },
          { key: 'rec_yd',    label: 'Rec Yds', fmt: v => v ? (+v).toLocaleString() : '—' },
          { key: 'rec_td',    label: 'Rec TD',  fmt: v => v != null ? v : '—' },
          { key: 'rec_yd_per_rec', label: 'YPR', fmt: v => v ? (+v).toFixed(1) : '—' },
          { key: 'pts_ppr',   label: 'PPG',     fmt: (v, s) => s.gp && v ? (+v / +s.gp).toFixed(1) : '—', useRow: true },
        ],
      };

      const cols = colDefs[pos] || colDefs.WR;

      const thStyle = `padding:6px 12px 8px 0;font-family:'Mulish',sans-serif;font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);opacity:.45;border-bottom:1px solid var(--border2);text-align:left;white-space:nowrap;`;
      const tdStyle = `padding:10px 12px 10px 0;font-family:'Mulish',sans-serif;font-size:13px;border-bottom:1px solid var(--border);vertical-align:middle;`;
      const tdNum   = `${tdStyle}font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:14px;`;

      const headers = ['Year'].concat(cols.map(c => c.label)).map(h => `<th style="${thStyle}">${h}</th>`).join('');

      const rows = Object.entries(yearStats)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([yr, s]) => {
          const cells = cols.map(c => {
            const raw = c.useRow ? s[c.key] : s[c.key];
            const val = c.useRow ? c.fmt(raw, s) : c.fmt(raw);
            return `<td style="${tdNum}color:var(--white)">${val}</td>`;
          }).join('');
          return `<tr>
            <td style="${tdStyle}font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:14px;color:var(--red)">${yr}</td>
            ${cells}
          </tr>`;
        }).join('');

      el.innerHTML = `
        <div style="font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px">${posName} Season Stats</div>
        <div style="font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.4;margin-bottom:10px">Source: Sleeper · Full PPR scoring</div>
        <div style="overflow-x:auto;-webkit-overflow-scrolling:touch">
          <table style="width:100%;border-collapse:collapse;min-width:400px">
            <thead><tr>${headers}</tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    }).catch(() => {
      el.innerHTML = `<div style="padding:24px;text-align:center;font-family:'Mulish',sans-serif;font-size:13px;color:var(--muted);opacity:.5">Error loading stats</div>`;
    });
  }

  // Minimal fallback trade-card renderer — kept only for the unlikely case
  // a host page overrides global.tradeCardHtml with something broken.
  function _fallbackTradeCardHtml(t) {
    const players = (t.players || []).map(p => p && p.name ? p.name : '').filter(Boolean).join(' / ') || '—';
    const picks = (t.picks || []).map(pk => `${pk.year} ${pk.round}${pk.slot ? '.' + String(pk.slot).padStart(2, '0') : ''}`).join(' / ');
    const assets = picks ? `${players}<br><span style="opacity:.7;font-size:11px">${picks}</span>` : players;
    return `<div class="trade-card" style="padding:10px 12px;margin-bottom:8px;border:1px solid var(--border);background:var(--surface)">
      <div style="font-family:'Mulish',sans-serif;font-size:11px;color:var(--white);opacity:.6;margin-bottom:4px">${t.date || ''}</div>
      <div style="font-family:'Mulish',sans-serif;font-size:13px;color:var(--white)">${assets}</div>
    </div>`;
  }

  function closePanel() {
    const panel   = document.getElementById('player-panel');
    const overlay = document.getElementById('panel-overlay');
    if (panel)   panel.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
    const inp = document.getElementById('pp-search');
    if (inp) inp.value = '';
    const drop = document.getElementById('pp-search-results');
    if (drop) { drop.classList.remove('open'); drop.innerHTML = ''; }
    const strip = document.getElementById('pp-player-tabs');
    if (strip) strip.innerHTML = '';
    ppPlayers = [];
    ppActivePlayer = null;
    currentPanelPlayer = null;
    global._currentPanelPlayer = null;
    ppLastTab = 'trades';
    // Trade Finder state cleanup if present on host page.
    try {
      if (global.tfState && global.tfState['pp-finder-tab']) delete global.tfState['pp-finder-tab'];
    } catch (e) {}
  }

  function ppShowTab(tabName) {
    const tabMap = { 'trades': 'trades', 'stats': 'stats', 'curve': 'age-curve', 'age-curve': 'age-curve', 'finder': 'finder', 'heatmap': 'heatmap' };
    const resolved = tabMap[tabName] || tabName;
    ppLastTab = resolved;
    ['trades', 'stats', 'age-curve', 'finder', 'heatmap'].forEach(t => {
      const el = document.getElementById('pp-' + t + '-tab');
      if (el) el.style.display = (t === resolved) ? 'block' : 'none';
    });
    // Update active state on tab buttons inside the panel only.
    const panel = document.getElementById('player-panel');
    if (panel) {
      panel.querySelectorAll('.pp-tabs .pp-tab').forEach(btn => {
        const onclickAttr = btn.getAttribute('onclick') || '';
        const m = onclickAttr.match(/ppShowTab\('([^']+)'\)/);
        const btnTab = m && m[1];
        if (btnTab) {
          const btnResolved = tabMap[btnTab] || btnTab;
          btn.classList.toggle('active', btnResolved === resolved);
        }
      });
    }
    if (resolved === 'stats' && currentPanelPlayer) {
      const renderer = (typeof global.renderPlayerStats === 'function') ? global.renderPlayerStats : renderPlayerStats;
      try { renderer('pp-stats-tab', currentPanelPlayer); } catch (e) {}
    }
    if (resolved === 'age-curve' && currentPanelPlayer) {
      const renderer = (typeof global.renderAgeCurve === 'function') ? global.renderAgeCurve : renderAgeCurve;
      try { renderer('pp-age-curve-tab', currentPanelPlayer); } catch (e) {}
    }
    if (resolved === 'heatmap' && global.Heatmap && typeof global.Heatmap.render === 'function') {
      const tabEl = document.getElementById('pp-heatmap-tab');
      if (tabEl) { try { global.Heatmap.render(tabEl, global._ppActiveSleeperId || null); } catch (e) {} }
    }
    if (resolved === 'finder' && currentPanelPlayer) {
      const renderer = (typeof global.renderTradeFinder === 'function') ? global.renderTradeFinder : renderTradeFinder;
      try { renderer('pp-finder-tab', currentPanelPlayer); } catch (e) {}
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // CURRENT-PAGE DETECTION + BUTTON VISIBILITY
  // ────────────────────────────────────────────────────────────────────────
  function _detectCurrentPage() {
    if (_currentPage) return _currentPage;
    if (typeof global.FPTS_CURRENT_PAGE === 'string' && global.FPTS_CURRENT_PAGE) {
      _currentPage = global.FPTS_CURRENT_PAGE;
      return _currentPage;
    }
    try {
      const path = (global.location && global.location.pathname || '').toLowerCase();
      if (path.endsWith('/trade-calculator.html') || path.endsWith('trade-calculator.html')) _currentPage = 'calc';
      else if (path.endsWith('/my-leagues.html')   || path.endsWith('my-leagues.html'))      _currentPage = 'ml';
      else if (path.endsWith('/adp-tool.html')     || path.endsWith('adp-tool.html'))        _currentPage = 'adp';
      else if (path.endsWith('/tiers.html')        || path.endsWith('tiers.html'))           _currentPage = 'tiers';
      else _currentPage = 'db';
    } catch (e) { _currentPage = 'db'; }
    return _currentPage;
  }
  function setCurrentPage(pageId) {
    _currentPage = pageId;
    _applyXpageVisibility();
  }
  function _applyXpageVisibility() {
    const panel = document.getElementById('player-panel');
    if (!panel) return;
    const page = _detectCurrentPage();
    const btns = panel.querySelectorAll('.fpts-xpage-btn[data-page]');
    btns.forEach(btn => {
      const target = btn.getAttribute('data-page');
      // Show "Open in Database" only on non-DB pages; hide on the DB page itself.
      if (target === 'db') {
        btn.style.display = (page === 'db') ? 'none' : '';
      } else {
        // Hide the button pointing at the current page.
        btn.style.display = (target === page) ? 'none' : '';
      }
    });
  }

  // ────────────────────────────────────────────────────────────────────────
  // MOUNT
  // ────────────────────────────────────────────────────────────────────────
  function _ensureMounted() {
    // Build TRADES from MVS_PAYLOAD if host page has the payload but no
    // pre-built TRADES array. This runs once and caches on window.TRADES
    // so other code (search bars, filters) sees a populated array.
    _maybeBuildTrades();
    if (document.getElementById('player-panel')) {
      _applyXpageVisibility();
      return;
    }
    const wrap = document.createElement('div');
    wrap.innerHTML = PANEL_HTML;
    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
    _applyXpageVisibility();
  }

  // Idempotent helper — invokes _buildTradesFromMvs() when MVS_PAYLOAD is
  // available and the host page hasn't supplied its own TRADES.
  function _maybeBuildTrades() {
    if (_tradesBuilt) return;
    if (Array.isArray(global.TRADES) && global.TRADES.length) { _tradesBuilt = true; return; }
    if (typeof global.MVS_PAYLOAD === 'undefined' || !global.MVS_PAYLOAD) return; // try again later when payload arrives
    try {
      const built = _buildTradesFromMvs();
      if (built && built.length) {
        global.TRADES = built;
      } else if (!Array.isArray(global.TRADES)) {
        global.TRADES = [];
      }
      _tradesBuilt = true;
    } catch (e) {
      _tradesBuilt = true;
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // PUBLIC API + BACK-COMPAT GLOBALS
  // ────────────────────────────────────────────────────────────────────────
  global.PlayerPanel = {
    init: _ensureMounted,
    open: openPanel,
    close: closePanel,
    showTab: ppShowTab,
    setCurrentPage: setCurrentPage
  };

  // Back-compat: existing inline onclick="openPanel('Name')" markup keeps working.
  global.openPanel = openPanel;
  global.closePanel = closePanel;
  global.openPanelContent = openPanelContent;
  global.ppShowTab = ppShowTab;
  global.ppSearchInput = ppSearchInput;
  global.ppSearchKey = ppSearchKey;
  global.ppSearchSelect = ppSearchSelect;
  global.ppSwitchTo = ppSwitchTo;
  global.ppRemovePlayer = ppRemovePlayer;
  global.ppRenderTabStrip = ppRenderTabStrip;
  global.ppFocusResult = ppFocusResult;
  // Cross-page helpers
  global._fptsXpageOpenCalcFromPanel    = _fptsXpageOpenCalcFromPanel;
  global._fptsXpageOpenLeaguesFromPanel = _fptsXpageOpenLeaguesFromPanel;
  global._fptsXpageOpenAdpFromPanel     = _fptsXpageOpenAdpFromPanel;
  global._fptsXpageOpenDbFromPanel      = _fptsXpageOpenDbFromPanel;
  global._fptsXpageOpenCalcFromFinder   = _fptsXpageOpenCalcFromFinder;

  // Renderers — overridable. Only install the module version if the host
  // page hasn't pre-defined its own. The Trades-tab render path always
  // prefers global.tradeCardHtml when present, so this preserves backwards
  // compat with index.html which defines tradeCardHtml inline.
  if (typeof global.tradeCardHtml      !== 'function') global.tradeCardHtml      = tradeCardHtml;
  if (typeof global.renderPlayerStats  !== 'function') global.renderPlayerStats  = renderPlayerStats;
  if (typeof global.renderAgeCurve     !== 'function') global.renderAgeCurve     = renderAgeCurve;
  if (typeof global.renderTradeFinder  !== 'function') global.renderTradeFinder  = renderTradeFinder;
  if (typeof global.openPickPage       !== 'function') global.openPickPage       = openPickPage;
  if (typeof global.pkpShowTab         !== 'function') global.pkpShowTab         = pkpShowTab;
  if (typeof global.getAllAssets       !== 'function') global.getAllAssets       = getAllAssets;
  if (typeof global._buildTradesFromMvs !== 'function') global._buildTradesFromMvs = _buildTradesFromMvs;
  if (typeof global.pickThumb          !== 'function') global.pickThumb          = pickThumb;
  if (typeof global.fmtDate            !== 'function') global.fmtDate            = fmtDate;
  if (typeof global.qbLabels           !== 'object'   || !global.qbLabels) global.qbLabels = qbLabels;

  // Trade Finder helpers — always installed (these reference the module's
  // own tfState, so the inline onclick attributes in the rendered HTML must
  // dispatch into the module's instances, not whatever the host page may
  // have defined). Override is intentional to keep tfState authoritative.
  global.tfGetState        = tfGetState;
  global.tfActivateSlot    = tfActivateSlot;
  global.tfDeactivateSlot  = tfDeactivateSlot;
  global.tfAddFromSearch   = tfAddFromSearch;
  global.tfRemove          = tfRemove;
  global.tfQuerySlot       = tfQuerySlot;

  // Auto-init on DOMContentLoaded.
  if (document.readyState !== 'loading') {
    _ensureMounted();
  } else {
    document.addEventListener('DOMContentLoaded', _ensureMounted);
  }
})(typeof window !== 'undefined' ? window : globalThis);
