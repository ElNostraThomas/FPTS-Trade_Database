/* ════════════════════════════════════════════════════════════════════════
   ADMIN-TIERS — device-local tier + Buy/Sell/Hold editor (Tier 1 scope)
   ════════════════════════════════════════════════════════════════════════

   What this is
   ------------
   A scratchpad for the admin to override the tier / B/S/H / trending fields
   stored in data/tiers.json (the FPTS Google Sheet mirror) WITHOUT round-
   tripping through the Sheet sync. Overrides live in this device's
   localStorage only — other devices and regular site visitors see nothing.

   Workflow
   --------
   1. Visit any page with `?admin=1` once. The flag becomes sticky in
      localStorage (`fpts-admin-mode=true`); the URL param is then removed
      via history.replaceState so the link looks clean.
   2. Open `tiers.html`. The admin banner appears at the top, plus a small
      ✎ pencil next to every tier badge in the table.
   3. Click any pencil → small popover with tier dropdown / B/S/H dropdown
      / trending text field. Save mutates window.TIERS_DATA in place AND
      writes the override to localStorage (`fpts-tier-overrides`).
      data-bootstrap.js re-applies overrides on every future page load.
   4. Compare.html (and any future TIERS_DATA consumer) shows the overridden
      tier/B/S/H badge on subsequent visits — the merge happens inside
      data-bootstrap.js after fetching tiers.json.
   5. When ready to publish: click "Copy as JSON" in the banner, paste into
      Google Sheet. After the next push.bat run regenerates data/tiers.json,
      clear local overrides via the banner button.
   6. Disable admin mode by visiting `?admin=0` or clicking "Disable admin"
      in the banner.

   Security model
   --------------
   This is security-through-URL-obscurity: anyone who guesses or shares
   `?admin=1` can edit on their own device. No tampering with what other
   visitors see (overrides are device-local). For a personal-tool static
   site, this is the right tradeoff vs adding a backend.

   Hard guarantee: when admin mode is OFF (default), this module renders
   nothing. The data-bootstrap.js override-merge step still runs but is a
   no-op when no overrides exist in localStorage.
   ════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var STORAGE_KEY_MODE      = 'fpts-admin-mode';
  var STORAGE_KEY_OVERRIDES = 'fpts-tier-overrides';

  var TIERS = ['S++','S+','S','A+','A','A-','B+','B','B-','C+','C','C-','D+','D','D-','E+','E','E-','F+','F','F-'];
  var BSHS  = ['', 'buying', 'checking', 'selling', 'shopping', 'hold'];

  // ── Activation handling ─────────────────────────────────────────────────
  function _handleUrlParam() {
    var url = new URL(window.location.href);
    var p = url.searchParams.get('admin');
    if (p === '1') {
      try { localStorage.setItem(STORAGE_KEY_MODE, 'true'); } catch (e) {}
      url.searchParams.delete('admin');
      try { history.replaceState(null, '', url.toString()); } catch (e) {}
    } else if (p === '0') {
      try { localStorage.removeItem(STORAGE_KEY_MODE); } catch (e) {}
      url.searchParams.delete('admin');
      try { history.replaceState(null, '', url.toString()); } catch (e) {}
    }
  }

  function isActive() {
    try { return localStorage.getItem(STORAGE_KEY_MODE) === 'true'; } catch (e) { return false; }
  }

  // ── Override read/write ─────────────────────────────────────────────────
  function _readOverrides() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY_OVERRIDES);
      return raw ? (JSON.parse(raw) || {}) : {};
    } catch (e) { return {}; }
  }
  function _writeOverrides(map) {
    try {
      if (!map || !Object.keys(map).length) {
        localStorage.removeItem(STORAGE_KEY_OVERRIDES);
      } else {
        localStorage.setItem(STORAGE_KEY_OVERRIDES, JSON.stringify(map));
      }
    } catch (e) {}
  }
  function _overrideCount() {
    return Object.keys(_readOverrides()).length;
  }

  // Apply a single-player override + mutate live TIERS_DATA so the page
  // reflects the change without a reload. Fires 'fpts:tiers-overrides-changed'
  // so consumers (tiers.html, compare.html when open in another tab) can
  // re-render.
  function saveOverride(name, patch) {
    if (!name || !patch) return;
    var map = _readOverrides();
    var existing = map[name] || {};
    var merged = Object.assign({}, existing, patch);
    // Trim empty-string fields so the stored override stays compact.
    Object.keys(merged).forEach(function (k) {
      if (merged[k] === '' || merged[k] == null) delete merged[k];
    });
    if (Object.keys(merged).length === 0) {
      delete map[name];
    } else {
      map[name] = merged;
    }
    _writeOverrides(map);
    _applyOverrideToLive(name, merged);
    _fireChanged();
    _refreshBanner();
  }

  function clearOverride(name) {
    var map = _readOverrides();
    if (!(name in map)) return;
    delete map[name];
    _writeOverrides(map);
    // Restore live TIERS_DATA[name] from the original tiers.json. Since we
    // don't keep a clean copy, simplest restore = page reload. Alternative:
    // re-fetch tiers.json. Reload is the honest path.
    _fireChanged();
    _refreshBanner();
  }

  function clearAllOverrides() {
    _writeOverrides({});
    _fireChanged();
    _refreshBanner();
  }

  function _applyOverrideToLive(name, merged) {
    if (!window.TIERS_DATA) return;
    var base = window.TIERS_DATA[name] || {
      tier: '', trending: '', buySell: '', priority: '', contender: '', notes: '',
    };
    window.TIERS_DATA[name] = Object.assign({}, base, merged, { _override: true });
    if (window.TIERS_BY_NORM && typeof window.normalizePlayerName === 'function') {
      window.TIERS_BY_NORM[window.normalizePlayerName(name)] = window.TIERS_DATA[name];
    }
  }

  function _fireChanged() {
    try {
      document.dispatchEvent(new CustomEvent('fpts:tiers-overrides-changed', {
        detail: { count: _overrideCount() },
      }));
    } catch (e) {}
  }

  // ── Export ──────────────────────────────────────────────────────────────
  function exportToClipboard() {
    var map = _readOverrides();
    var lines = ['Tier overrides (paste into Google Sheet):', ''];
    Object.keys(map).sort().forEach(function (n) {
      var rec = map[n];
      var bits = [];
      if (rec.tier)     bits.push('tier=' + rec.tier);
      if (rec.buySell)  bits.push('buySell=' + rec.buySell);
      if (rec.trending) bits.push('trending=' + rec.trending);
      lines.push('  ' + n + ' → ' + bits.join(' · '));
    });
    lines.push('');
    lines.push('--- Raw JSON ---');
    lines.push(JSON.stringify(map, null, 2));
    var text = lines.join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { _flashBanner('Copied ' + Object.keys(map).length + ' overrides to clipboard.'); },
        function () { _fallbackCopy(text); }
      );
    } else {
      _fallbackCopy(text);
    }
  }
  function _fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); _flashBanner('Copied (fallback).'); }
    catch (e) { _flashBanner('Copy failed — see console.'); console.log(text); }
    document.body.removeChild(ta);
  }

  // ── Banner ──────────────────────────────────────────────────────────────
  var _banner = null;
  function _mountBanner() {
    if (_banner || !document.body) return;
    _banner = document.createElement('div');
    _banner.id = 'fpts-admin-banner';
    Object.assign(_banner.style, {
      position: 'fixed',
      top: '0', left: '0', right: '0',
      zIndex: '200',
      background: 'var(--red)',
      color: '#111',
      padding: '6px 14px',
      fontFamily: "'Mulish', sans-serif",
      fontSize: '12px',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,.35)',
      borderBottom: '2px solid #111',
    });
    _banner.innerHTML = ''
      + '<span style="font-family:\'Kanit\',sans-serif;font-style:italic;font-weight:800;font-size:13px;letter-spacing:.04em;text-transform:uppercase">ADMIN MODE</span>'
      + '<span id="fpts-admin-banner-count" style="opacity:.85"></span>'
      + '<span id="fpts-admin-banner-flash" style="margin-left:auto;font-style:italic;opacity:0;transition:opacity .2s"></span>'
      + '<button type="button" id="fpts-admin-banner-export" style="background:#111;color:var(--red);border:none;padding:4px 10px;font-family:\'Kanit\',sans-serif;font-weight:800;font-style:italic;font-size:11px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer">Copy as JSON</button>'
      + '<button type="button" id="fpts-admin-banner-clear" style="background:transparent;color:#111;border:1px solid #111;padding:4px 10px;font-family:\'Kanit\',sans-serif;font-weight:800;font-style:italic;font-size:11px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer">Clear all</button>'
      + '<button type="button" id="fpts-admin-banner-disable" style="background:transparent;color:#111;border:1px solid #111;padding:4px 10px;font-family:\'Kanit\',sans-serif;font-weight:800;font-style:italic;font-size:11px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer">Disable</button>';
    document.body.appendChild(_banner);
    // Push the page content down so the banner doesn't cover the topnav.
    document.body.style.paddingTop = (_banner.offsetHeight) + 'px';

    document.getElementById('fpts-admin-banner-export').addEventListener('click', exportToClipboard);

    // "Clear all" — wipes overrides AND auto-reloads so the user sees the
    // restored TAT-default tiers immediately. The prior "reload required"
    // warning text was confusing (the action was incomplete-feeling without
    // a manual reload).
    document.getElementById('fpts-admin-banner-clear').addEventListener('click', function () {
      var n = _overrideCount();
      if (!n) { _flashBanner('No overrides to clear.'); return; }
      if (confirm('Clear all ' + n + ' tier override' + (n === 1 ? '' : 's') +
                  ' on this device?\n\n' +
                  'This reloads the page so every player snaps back to the ' +
                  'TAT-default tier. Admin mode stays ON.')) {
        clearAllOverrides();
        window.location.reload();
      }
    });

    // "Disable" — turns off admin mode. Asks separately whether to also
    // clear overrides because the two are distinct intents:
    //   - keep overrides: your tier edits stay live on this device; only
    //     the editor UI hides. Use this if you're done editing for now
    //     but want your changes to still show on the page.
    //   - clear overrides: full revert. Page snaps back to TAT-default for
    //     everyone (on this device). Most common "I'm done" path.
    document.getElementById('fpts-admin-banner-disable').addEventListener('click', function () {
      var n = _overrideCount();
      if (!confirm('Disable admin mode on this device?')) return;
      var clearToo = false;
      if (n > 0) {
        clearToo = confirm(
          'You have ' + n + ' saved tier override' + (n === 1 ? '' : 's') +
          ' on this device.\n\n' +
          'OK = clear them too (page reverts to TAT-default tiers)\n' +
          'Cancel = keep them saved (your edits stay applied; only the ' +
          'editor UI hides)'
        );
      }
      if (clearToo) {
        clearAllOverrides();
      }
      try { localStorage.removeItem(STORAGE_KEY_MODE); } catch (e) {}
      window.location.reload();
    });
    _refreshBanner();
  }
  function _refreshBanner() {
    if (!_banner) return;
    var n = _overrideCount();
    var label = (n === 0) ? 'No overrides yet' : (n + ' override' + (n === 1 ? '' : 's') + ' on this device');
    var el = document.getElementById('fpts-admin-banner-count');
    if (el) el.textContent = '· ' + label;
  }
  function _flashBanner(msg) {
    var el = document.getElementById('fpts-admin-banner-flash');
    if (!el) return;
    el.textContent = msg;
    el.style.opacity = '1';
    setTimeout(function () { el.style.opacity = '0'; }, 2200);
  }

  // ── Per-row edit pencil + popover ───────────────────────────────────────
  // Returns the HTML for an inline edit pencil. Consumers (tiers.html row
  // template) include this string adjacent to the tier badge. Returns ''
  // when admin mode is off so the row is unchanged for regular visitors.
  function editButtonHtml(playerName) {
    if (!isActive()) return '';
    var safe = String(playerName || '').replace(/"/g, '&quot;');
    return '<button type="button" class="fpts-adm-edit-btn" data-player="' + safe +
           '" title="Edit tier / B-S-H for ' + safe + '"' +
           ' style="background:transparent;border:none;color:var(--red);cursor:pointer;font-size:13px;padding:0 4px;margin-left:4px;line-height:1">✎</button>';
  }

  var _popover = null;
  function _ensurePopoverMounted() {
    if (_popover) return _popover;
    _popover = document.createElement('div');
    _popover.id = 'fpts-adm-popover';
    Object.assign(_popover.style, {
      position: 'absolute',
      zIndex: '210',
      background: 'var(--surface)',
      border: '2px solid var(--red)',
      padding: '12px',
      minWidth: '260px',
      boxShadow: '0 6px 24px rgba(0,0,0,.5)',
      display: 'none',
      fontFamily: "'Mulish', sans-serif",
      fontSize: '12px',
      color: 'var(--white)',
    });
    document.body.appendChild(_popover);
    document.addEventListener('click', function (e) {
      if (_popover.style.display === 'none') return;
      if (_popover.contains(e.target)) return;
      if (e.target.closest && e.target.closest('.fpts-adm-edit-btn')) return;
      _popover.style.display = 'none';
    });
    return _popover;
  }

  function _openPopover(triggerEl, playerName) {
    _ensurePopoverMounted();
    var rec = (window.TIERS_DATA && window.TIERS_DATA[playerName]) || {};
    var overrides = _readOverrides();
    var hasOverride = !!overrides[playerName];
    var tierOpts = TIERS.map(function (t) {
      return '<option value="' + t + '"' + (t === rec.tier ? ' selected' : '') + '>' + t + '</option>';
    }).join('');
    var bshOpts = BSHS.map(function (b) {
      var label = b ? b.charAt(0).toUpperCase() + b.slice(1) : '— none —';
      return '<option value="' + b + '"' + (b === (rec.buySell || '') ? ' selected' : '') + '>' + label + '</option>';
    }).join('');
    _popover.innerHTML = ''
      + '<div style="font-family:\'Kanit\',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:var(--red);text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">' + playerName + '</div>'
      + '<label style="display:block;margin-bottom:8px">Tier'
      +   '<select id="fpts-adm-tier" style="width:100%;margin-top:3px;background:var(--surface2);color:var(--white);border:1px solid var(--border);padding:5px;font-family:\'Kanit\',sans-serif;font-weight:800;font-style:italic">'
      +     '<option value="">— none —</option>' + tierOpts
      +   '</select>'
      + '</label>'
      + '<label style="display:block;margin-bottom:8px">Buy / Sell / Hold'
      +   '<select id="fpts-adm-bsh" style="width:100%;margin-top:3px;background:var(--surface2);color:var(--white);border:1px solid var(--border);padding:5px;font-family:\'Kanit\',sans-serif;font-weight:800;font-style:italic">'
      +     bshOpts
      +   '</select>'
      + '</label>'
      + '<label style="display:block;margin-bottom:10px">Trending (emoji or text)'
      +   '<input id="fpts-adm-trending" type="text" value="' + String(rec.trending || '').replace(/"/g, '&quot;') + '" style="width:100%;margin-top:3px;background:var(--surface2);color:var(--white);border:1px solid var(--border);padding:5px;font-family:\'Mulish\',sans-serif">'
      + '</label>'
      + '<div style="display:flex;gap:6px">'
      +   '<button type="button" id="fpts-adm-save" style="flex:1;background:var(--red);color:#111;border:none;padding:6px;font-family:\'Kanit\',sans-serif;font-weight:800;font-style:italic;font-size:11px;text-transform:uppercase;letter-spacing:.06em;cursor:pointer">Save</button>'
      +   (hasOverride
        ? '<button type="button" id="fpts-adm-reset" style="background:transparent;color:var(--white);border:1px solid var(--border2);padding:6px 10px;font-family:\'Kanit\',sans-serif;font-weight:800;font-style:italic;font-size:11px;text-transform:uppercase;letter-spacing:.06em;cursor:pointer">Reset</button>'
        : '')
      +   '<button type="button" id="fpts-adm-cancel" style="background:transparent;color:var(--white);border:1px solid var(--border2);padding:6px 10px;font-family:\'Kanit\',sans-serif;font-weight:800;font-style:italic;font-size:11px;text-transform:uppercase;letter-spacing:.06em;cursor:pointer">Cancel</button>'
      + '</div>'
      + '<div style="margin-top:8px;font-size:10px;opacity:.55">Saved on this device only. Use "Copy as JSON" in the banner to export.</div>';

    // Position below the trigger.
    var rect = triggerEl.getBoundingClientRect();
    var bodyZoom = (function () {
      var v = parseFloat(getComputedStyle(document.body).zoom);
      return (isFinite(v) && v > 0) ? v : 1;
    })();
    _popover.style.display = 'block';
    _popover.style.left = ((rect.left + window.scrollX) / bodyZoom) + 'px';
    _popover.style.top  = ((rect.bottom + window.scrollY + 4) / bodyZoom) + 'px';

    document.getElementById('fpts-adm-save').addEventListener('click', function () {
      var tier     = document.getElementById('fpts-adm-tier').value || '';
      var buySell  = document.getElementById('fpts-adm-bsh').value || '';
      var trending = document.getElementById('fpts-adm-trending').value || '';
      saveOverride(playerName, { tier: tier, buySell: buySell, trending: trending });
      _popover.style.display = 'none';
      _flashBanner('Saved ' + playerName + '.');
    });
    document.getElementById('fpts-adm-cancel').addEventListener('click', function () {
      _popover.style.display = 'none';
    });
    var resetBtn = document.getElementById('fpts-adm-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        clearOverride(playerName);
        _popover.style.display = 'none';
        _flashBanner('Reset ' + playerName + ' (reload to see original).');
      });
    }
  }

  // Delegated click handler for any [data-player] edit button on the page.
  function _wireDelegatedClicks() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('.fpts-adm-edit-btn');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      var name = btn.getAttribute('data-player');
      if (name) _openPopover(btn, name);
    });
  }

  // ── Init ────────────────────────────────────────────────────────────────
  function init() {
    _handleUrlParam();
    if (!isActive()) return;
    _mountBanner();
    _wireDelegatedClicks();
  }

  // Public surface (used by tiers.html row template).
  window.AdminTiers = {
    isActive:           isActive,
    editButtonHtml:     editButtonHtml,
    saveOverride:       saveOverride,
    clearOverride:      clearOverride,
    clearAllOverrides:  clearAllOverrides,
    exportToClipboard:  exportToClipboard,
    overrideCount:      _overrideCount,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
