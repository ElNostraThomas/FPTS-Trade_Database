/* ═══════════════════════════════════════════════════════════════════════════
   RANK COMPARATOR — daily rank-snapshot lookback for rankings.html

   Sibling module to adp-comparator.js, but lighter: rank-history.json is a
   single small file with daily snapshots (~12 days kept rolling), so there's
   no per-year lazy-load needed. UI surface is a dropdown date-picker
   triggered from the Rank column header on rankings.html. Picking a date
   makes the row's rank cell render an inline change chip
   (▲N / ▼N / ●) comparing current rank to the rank at that snapshot.

   Public API on window.RankComparator:

     init({ storageKey, onChange })   Same shape as AdpComparator.init.
     ensureLoaded()                   Returns Promise; fetches and caches
                                      data/rank-history.json on first call.
     getSnapshotDates()               Returns sorted [oldest…newest] array.
     getCurrentDate()                 Selected lookback date (YYYY-MM-DD).
     setCurrentDate(d)                Programmatic setter; persists +
                                      fires onChange.
     getRankFor(name, date)           Returns historical rank or undefined.
     renderTriggerHtml()              <button> markup for the host's <th>.
     openPopup(triggerEl)             Opens the date-picker popup.
     closePopup()                     Hides the popup.
     changeChipHtml(curRank, prevRank)  Returns the ▲/▼/● chip HTML.
   ═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  let _initialized  = false;
  let _storageKey   = 'fpts-rank-compare-date';
  let _onChange     = function () {};

  let _payload      = null;          // { snapshots: { date: { name: rank } }, lastUpdated }
  let _loadPromise  = null;
  let _currentDate  = null;          // "YYYY-MM-DD" the host is comparing against

  function _injectCss() {
    if (document.getElementById('fpts-rank-cmp-style')) return;
    const s = document.createElement('style');
    s.id = 'fpts-rank-cmp-style';
    s.textContent = [
      '.rank-cmp-trigger{display:inline-flex;align-items:center;gap:4px;background:transparent;border:1px solid var(--border2);color:var(--text);padding:2px 8px;border-radius:4px;font:inherit;cursor:pointer;text-transform:none;letter-spacing:0}',
      '.rank-cmp-trigger:hover{border-color:var(--red);color:var(--red)}',
      '.rank-cmp-label{font-family:"Kanit",sans-serif;font-weight:800;font-style:italic;font-size:11px;letter-spacing:.04em;text-transform:uppercase}',
      '.rank-cmp-chevron{font-size:10px;opacity:.7}',
      '.rank-cmp-popup{position:absolute;z-index:9500;background:#1a1a1a;border:1px solid var(--red);border-radius:6px;padding:6px;box-shadow:0 6px 22px rgba(0,0,0,.55);min-width:160px;max-height:320px;overflow-y:auto}',
      '.rank-cmp-popup[hidden]{display:none}',
      '.rank-cmp-date{display:block;width:100%;text-align:left;background:transparent;border:1px solid transparent;color:var(--text);padding:6px 10px;font-family:"Mulish",sans-serif;font-size:12px;cursor:pointer;border-radius:3px}',
      '.rank-cmp-date:hover{background:#222;border-color:#333}',
      '.rank-cmp-date.is-selected{background:var(--red);color:#fff;border-color:var(--red)}',
      '.rank-cmp-chip{display:inline-flex;align-items:center;gap:2px;font-family:"Kanit",sans-serif;font-weight:800;font-style:italic;font-size:10px;letter-spacing:.02em;padding:1px 5px;border-radius:3px;margin-left:6px;vertical-align:middle}',
      '.rank-cmp-chip.up{color:#66dd84}',
      '.rank-cmp-chip.down{color:var(--red)}',
      '.rank-cmp-chip.flat{color:var(--muted);font-size:9px}',
      '.rank-cmp-arrow{font-size:9px}',
    ].join('');
    document.head.appendChild(s);
  }

  // ── data plumbing ─────────────────────────────────────────────────────
  function ensureLoaded() {
    if (_loadPromise) return _loadPromise;
    const _v = '?v=' + (window.__DATA_VERSION || Date.now());
    _loadPromise = fetch('data/rank-history.json' + _v)
      .then(r => r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status)))
      .then(j => { _payload = j || { snapshots: {} }; })
      .catch(err => {
        console.warn('[rank-comparator] failed to load rank-history.json', err);
        _payload = { snapshots: {} };
      });
    return _loadPromise;
  }

  function getSnapshotDates() {
    if (!_payload || !_payload.snapshots) return [];
    return Object.keys(_payload.snapshots).sort();
  }

  function getCurrentDate() { return _currentDate; }

  function setCurrentDate(d) {
    if (!d) return;
    _currentDate = d;
    try { localStorage.setItem(_storageKey, d); } catch (e) {}
    try { _onChange(d); } catch (e) { console.warn('[rank-comparator] onChange threw', e); }
  }

  function getRankFor(name, date) {
    if (!_payload || !_payload.snapshots || !date) return undefined;
    const snap = _payload.snapshots[date];
    if (!snap) return undefined;
    return snap[name];
  }

  function _initCurrentFromStorage() {
    // Default to the OLDEST snapshot so chips reflect the largest available
    // window. Saved value wins if it's still in range.
    let saved = null;
    try { saved = localStorage.getItem(_storageKey); } catch (e) {}
    const dates = getSnapshotDates();
    if (!dates.length) { _currentDate = null; return; }
    _currentDate = (saved && dates.includes(saved)) ? saved : dates[0];
  }

  // ── trigger + chip markup ─────────────────────────────────────────────
  function _shortLabel(d) {
    if (!d) return '—';
    // "2026-05-11" → "May 11"
    const m = d.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return d;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return (months[parseInt(m[2], 10) - 1] || m[2]) + ' ' + parseInt(m[3], 10);
  }

  function renderTriggerHtml() {
    const label = _shortLabel(_currentDate);
    return '<button type="button" class="rank-cmp-trigger"'
         +   ' onclick="event.stopPropagation(); window.RankComparator.openPopup(this)"'
         +   ' aria-label="Pick rank comparison date">'
         +   '<span class="rank-cmp-label">Rank · ' + label + '</span>'
         +   '<span class="rank-cmp-chevron">▾</span>'
         + '</button>';
  }

  // Lower rank number = better, same direction as ADP. So if currentRank
  // moved DOWN in numeric value (e.g., 50 → 45), the player ranked better
  // now (green ▲); if it moved UP (50 → 55), worse (red ▼).
  function changeChipHtml(curRank, prevRank) {
    const c = parseInt(curRank, 10), p = parseInt(prevRank, 10);
    if (!isFinite(c) || !isFinite(p)) return '';
    const delta = c - p;
    if (delta === 0) return '<span class="rank-cmp-chip flat" title="No rank change">●</span>';
    const abs = Math.abs(delta);
    const tip = 'Rank ' + (delta < 0 ? 'improved' : 'slipped')
              + ' from #' + p + ' to #' + c;
    if (delta < 0) {
      return '<span class="rank-cmp-chip up" title="' + tip + '">'
           + '<span class="rank-cmp-arrow">▲</span>' + abs + '</span>';
    }
    return '<span class="rank-cmp-chip down" title="' + tip + '">'
         + '<span class="rank-cmp-arrow">▼</span>' + abs + '</span>';
  }

  // ── popup ─────────────────────────────────────────────────────────────
  function _mountPopup() {
    if (document.getElementById('rank-cmp-popup')) return;
    const pop = document.createElement('div');
    pop.id = 'rank-cmp-popup';
    pop.className = 'rank-cmp-popup';
    pop.hidden = true;
    document.body.appendChild(pop);

    document.addEventListener('click', (e) => {
      if (pop.hidden) return;
      if (pop.contains(e.target)) return;
      if (e.target.closest && e.target.closest('.rank-cmp-trigger')) return;
      closePopup();
    });
    document.addEventListener('keydown', (e) => {
      if (!pop.hidden && e.key === 'Escape') closePopup();
    });
    window.addEventListener('scroll', () => { if (!pop.hidden) closePopup(); }, { passive: true });
  }

  function openPopup(triggerEl) {
    _mountPopup();
    const pop = document.getElementById('rank-cmp-popup');
    if (!pop.hidden) { closePopup(); return; }   // toggle

    ensureLoaded().then(() => {
      const dates = getSnapshotDates();
      if (!dates.length) {
        pop.innerHTML = '<div style="padding:8px 12px;font-size:12px;opacity:.6">No snapshots available yet.</div>';
      } else {
        // Newest first for picker readability.
        pop.innerHTML = dates.slice().reverse().map(d => {
          const cls = 'rank-cmp-date' + (d === _currentDate ? ' is-selected' : '');
          return '<button type="button" class="' + cls + '" data-date="' + d + '">' + _shortLabel(d) + '  <span style="opacity:.5;font-size:10px;margin-left:4px">' + d + '</span></button>';
        }).join('');
        Array.prototype.forEach.call(pop.querySelectorAll('.rank-cmp-date'), btn => {
          btn.addEventListener('click', () => {
            const d = btn.getAttribute('data-date');
            setCurrentDate(d);
            closePopup();
          });
        });
      }
      // Position beneath trigger. body-zoom-aware (mirrors adp-comparator fix).
      const rect = triggerEl.getBoundingClientRect();
      const z = parseFloat(getComputedStyle(document.body).zoom) || 1;
      pop.style.left = (rect.left / z + window.scrollX) + 'px';
      pop.style.top  = (rect.bottom / z + window.scrollY + 4) + 'px';
      pop.hidden = false;
    });
  }

  function closePopup() {
    const pop = document.getElementById('rank-cmp-popup');
    if (pop) pop.hidden = true;
  }

  // ── init ──────────────────────────────────────────────────────────────
  function init(opts) {
    opts = opts || {};
    if (opts.storageKey) _storageKey = opts.storageKey;
    if (typeof opts.onChange === 'function') _onChange = opts.onChange;
    _injectCss();
    if (_initialized) return Promise.resolve();
    _initialized = true;
    return ensureLoaded().then(() => { _initCurrentFromStorage(); });
  }

  window.RankComparator = {
    init:               init,
    ensureLoaded:       ensureLoaded,
    getSnapshotDates:   getSnapshotDates,
    getCurrentDate:     getCurrentDate,
    setCurrentDate:     setCurrentDate,
    getRankFor:         getRankFor,
    renderTriggerHtml:  renderTriggerHtml,
    openPopup:          openPopup,
    closePopup:         closePopup,
    changeChipHtml:     changeChipHtml,
  };
})();
