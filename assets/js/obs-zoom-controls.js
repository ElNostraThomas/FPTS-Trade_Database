/* ════════════════════════════════════════════════════════════════════════
   OBS ZOOM CONTROLS — shared floating widget for OBS Browser Source
   ════════════════════════════════════════════════════════════════════════

   OBS Browser Source's Interactive mode doesn't forward Ctrl+wheel or
   Ctrl+plus/minus to the iframed page — streamers have no in-band way to
   zoom the site. This widget renders a tiny top-right pill with
   [ − ]  zoom%  [ + ]  ⟲  so the streamer can step zoom up/down or reset.

   Hard guarantee: only renders when iframed (window.self !== window.top).
   Direct browser visitors (desktop AND mobile) see nothing.

   Mechanism (2026-06-02 v3): the widget inline-overrides body.style.zoom.
   At "100%" (no override / reset) body zoom is forced to 1.0 — OVERRIDING
   brand.css's desktop-monitor default of body{zoom:1.25}. This makes
   "100%" mean "content fits the iframe naturally" rather than the 1.25×
   inflated default that was making names bunch up in OBS. At higher
   ladder values, body.style.zoom is set to the user's chosen multiplier
   directly. Inline style beats brand.css's @media-driven body{zoom}
   rules so the visual scale is predictable.

   Horizontal overflow from zoom-in is handled by iframe-scroll-fix.js's
   floating scrollbar (added 2026-06-02). Content that extends past the
   iframe edge stays reachable via the bottom-pinned proxy scrollbar.

   Why NOT viewport-meta manipulation: a prior rewrite (commit 48e938d)
   tried <meta name="viewport" content="width=W"> to shrink the layout
   viewport so brand.css's @media breakpoints would fire smaller versions
   and the topnav would auto-collapse. The breakpoint that fires (≤1099
   in particular) ALSO drops body{zoom:1.25 → 1.0} — which exactly
   cancels the visual scale-up from the smaller viewport. Net visual
   change: zero. The compensation that brand.css was designed to do for
   direct browser Ctrl+wheel killed the widget's effect entirely.

   Why NOT just modify brand.css: the 1.25× default is the right at-
   monitor experience for direct desktop browser visitors — non-OBS
   users like it. Tying it to iframe-only context via JS keeps the
   non-OBS behavior unchanged.

   Mounted on document.documentElement (NOT document.body) so the widget
   itself doesn't visually scale when body{zoom} changes. CSS vars
   (--red, --white, etc.) still resolve because they're declared on
   :root (which IS the html element).

   Zoom ladder: 1.0 / 1.25 / 1.5 / 1.75 / 2.0. Override persists in
   localStorage('fpts-obs-zoom'); reset clears it and applies body{zoom:1}
   so iframed view always fits to screen at default.

   History:
   - abf4d72 added a mobile-direct-browser branch; reverted because
     body{zoom} broke mobile native pinch + scroll.
   - 2026-06-02 v2 (commit 48e938d): viewport-meta rewrite. Failed
     because brand.css's adaptive body{zoom} compensation cancelled the
     visual scale exactly.
   - 2026-06-02 v3 (this version): back to inline body.style.zoom but
     with body zoom forced to 1.0 at "100%" so OBS fit-to-screen is the
     default, and horizontal overflow handled by the iframe-scroll-fix
     floating scrollbar instead of by @media collapsing.
   ════════════════════════════════════════════════════════════════════════ */
(function () {
  // ── IFRAME-ONLY GUARD ─────────────────────────────────────────────────
  // OBS Browser Source = iframed context. Direct browser visitors bail.
  // Cross-origin parents throw SecurityError on window.top access — treat
  // as "embedded" and fall through (same pattern as iframe-scroll-fix.js).
  try {
    if (window.self === window.top) return;
  } catch (_e) {
    // Cross-origin parent — we ARE embedded. Proceed.
  }

  var STORAGE_KEY = 'fpts-obs-zoom';
  var LADDER = [1.0, 1.25, 1.5, 1.75, 2.0];

  // ── Persistence ────────────────────────────────────────────────────────
  function readOverride() {
    try {
      var v = parseFloat(localStorage.getItem(STORAGE_KEY));
      if (isFinite(v) && v > 0) return v;
    } catch (_e) {}
    return null;
  }
  function saveOverride(v) {
    try {
      if (v == null) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, String(v));
    } catch (_e) {}
  }

  // ── Zoom application ──────────────────────────────────────────────────
  // ALWAYS write inline body.style.zoom so brand.css's @media-driven
  // body{zoom:1.25} default is overridden. The widget's % is the
  // ABSOLUTE visual scale on top of the natural (zoom-1.0) layout.
  //
  // At "no override" (null/reset/1.0), we explicitly force body zoom to
  // 1.0 instead of leaving it to brand.css. This is the load-bearing
  // behavior change: iframed view defaults to fit-to-screen at 100%,
  // not the desktop-monitor 1.25× inflated layout that was making names
  // bunch up.
  function applyZoom(zoom) {
    if (!document.body) return;
    var effective = (zoom == null) ? 1.0 : zoom;
    document.body.style.zoom = String(effective);
  }

  function nearestLadderIndex(v) {
    var best = 0;
    var bestDist = Math.abs(LADDER[0] - v);
    for (var i = 1; i < LADDER.length; i++) {
      var d = Math.abs(LADDER[i] - v);
      if (d < bestDist) { best = i; bestDist = d; }
    }
    return best;
  }
  function stepZoom(delta) {
    var current = readOverride() || 1.0;
    var idx = nearestLadderIndex(current);
    var nextIdx = Math.max(0, Math.min(LADDER.length - 1, idx + delta));
    var v = LADDER[nextIdx];
    // null (no override) when at the bottom of the ladder so the readout
    // shows "100%" dimmed + reset-button is inert.
    saveOverride(v === 1.0 ? null : v);
    applyZoom(v);
    render();
  }
  function resetZoom() {
    saveOverride(null);
    applyZoom(null);
    render();
  }

  // ── Widget construction ───────────────────────────────────────────────
  var widget;

  function makeBtn(label, title, onClick) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.title = title;
    b.setAttribute('aria-label', title);
    Object.assign(b.style, {
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      border: 'none',
      background: 'transparent',
      color: 'var(--white)',
      fontFamily: "'Kanit', sans-serif",
      fontSize: '16px',
      fontWeight: '800',
      lineHeight: '1',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0',
      transition: 'background .15s, color .15s',
    });
    b.addEventListener('mouseenter', function () {
      b.style.background = 'var(--red)';
      b.style.color = '#111111';
    });
    b.addEventListener('mouseleave', function () {
      b.style.background = 'transparent';
      b.style.color = 'var(--white)';
      render();   // re-apply reset-button dim styling if applicable
    });
    b.addEventListener('click', onClick);
    return b;
  }

  function createWidget() {
    var w = document.createElement('div');
    w.id = 'fpts-obs-zoom-controls';
    Object.assign(w.style, {
      position: 'fixed',
      top: '70px',
      right: '18px',
      zIndex: '150',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 6px',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '999px',
      boxShadow: '0 4px 12px rgba(0,0,0,.4)',
      fontFamily: "'Mulish', sans-serif",
      fontSize: '12px',
      color: 'var(--white)',
      userSelect: 'none',
    });

    var minus = makeBtn('−', 'Zoom out', function () { stepZoom(-1); });

    var readout = document.createElement('span');
    readout.id = 'fpts-obs-zoom-readout';
    Object.assign(readout.style, {
      minWidth: '44px',
      textAlign: 'center',
      fontFamily: "'Kanit', sans-serif",
      fontWeight: '800',
      fontStyle: 'italic',
      fontSize: '13px',
      padding: '0 4px',
    });

    var plus  = makeBtn('+', 'Zoom in', function () { stepZoom(1); });
    var reset = makeBtn('⟲', 'Reset zoom to 100% (fit to iframe)', resetZoom);
    reset.id = 'fpts-obs-zoom-reset';

    w.appendChild(minus);
    w.appendChild(readout);
    w.appendChild(plus);
    w.appendChild(reset);
    return w;
  }

  function render() {
    if (!widget) return;
    var override = readOverride();
    var displayZoom = override != null ? override : 1.0;
    var readout = widget.querySelector('#fpts-obs-zoom-readout');
    if (readout) {
      readout.textContent = Math.round(displayZoom * 100) + '%';
      readout.style.color = (override != null) ? 'var(--red)' : 'rgba(255,255,255,.55)';
    }
    var reset = widget.querySelector('#fpts-obs-zoom-reset');
    if (reset) {
      reset.style.opacity = (override != null) ? '1' : '.35';
      reset.style.cursor  = (override != null) ? 'pointer' : 'default';
    }
  }

  // ── Init ──────────────────────────────────────────────────────────────
  function init() {
    if (document.getElementById('fpts-obs-zoom-controls')) return;   // idempotent
    // Always apply zoom on init — even with no stored override, we want
    // body.style.zoom inline-set to 1.0 so brand.css's 1.25 default is
    // overridden the moment the widget loads.
    var stored = readOverride();
    applyZoom(stored);
    widget = createWidget();
    // Mount on documentElement (NOT body) — if mounted on body the widget
    // would visually scale with body{zoom} and clicking [+] would inflate
    // the buttons along with the page content.
    (document.documentElement || document.body).appendChild(widget);
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
