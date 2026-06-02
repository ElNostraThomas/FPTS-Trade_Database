/* ════════════════════════════════════════════════════════════════════════
   OBS ZOOM CONTROLS — shared floating widget for OBS Browser Source
   ════════════════════════════════════════════════════════════════════════

   OBS Browser Source's Interactive mode doesn't forward Ctrl+wheel or
   Ctrl+plus/minus to the iframed page — streamers have no in-band way to
   zoom the site. This widget renders a tiny top-right pill with
   [ − ]  zoom%  [ + ]  ⟲  so the streamer can step zoom up/down or reset
   to the brand.css adaptive default.

   Hard guarantee: only renders when iframed (window.self !== window.top).
   Direct browser visitors (desktop AND mobile) see nothing.

   Mechanism (2026-06-02 rewrite): the widget DOES NOT touch body { zoom }.
   Instead it rewrites <meta name="viewport"> content="width=W" — shrinking
   the layout viewport in CSS px so the same @media breakpoints in
   brand.css that fire when a desktop user does Ctrl+wheel zoom-in ALSO
   fire under this widget. Result: zooming in via the widget causes the
   topnav to auto-collapse (wordmark-tag hides ≤1599, nav-stat hides
   ≤1299, full nav collapses to mobile-select ≤1099) and content reflows
   to fit the iframe — no clipping. Exactly mirrors what Ctrl+wheel does
   in a regular browser.

   Why this works: setting meta viewport `width=N` on a physical iframe of
   width P tells Chromium/CEF to lay out at N CSS px and scale the
   rendered output by P/N (the "zoom"). N also drives @media query
   evaluation, so the layout adapts to N.

   Why we DON'T use body { zoom: N } from JS: body { zoom } only inflates
   the visual scale; @media queries continue evaluating against the
   actual layout viewport. The desktop layout stays at full size and
   gets visually inflated past the iframe edge, clipping names/columns
   — the bug this rewrite fixes.

   History:
   - abf4d72 added a mobile-direct-browser branch; reverted because
     body { zoom } broke mobile native pinch + scroll.
   - 2026-06-02 rewrote the iframe path away from body { zoom } onto
     viewport-meta manipulation so OBS zoom behaves like Ctrl+wheel.

   Mounted on document.documentElement (NOT document.body) so the widget
   itself doesn't visually scale when the layout viewport changes. CSS
   vars (--red, --white, etc.) still resolve because they're declared on
   :root (which IS the html element).

   Zoom ladder: 1.0 / 1.25 / 1.5 / 1.75 / 2.0. Override persists in
   localStorage('fpts-obs-zoom'); reset clears it and restores the
   default meta viewport.
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
  var DEFAULT_VIEWPORT = 'width=device-width, initial-scale=1.0, viewport-fit=cover';

  // Physical CSS px width of the iframe at default viewport meta.
  // Captured ONCE at init (before any zoom is applied) so we have a stable
  // reference for `layoutViewportWidth = basePhysicalWidth / zoom`.
  // Re-measured on window resize via a temporary default-viewport revert.
  var basePhysicalWidth = 0;

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

  // ── Viewport-meta manipulation ────────────────────────────────────────
  function viewportMetaEl() {
    return document.querySelector('meta[name="viewport"]');
  }
  function setViewportContent(content) {
    var meta = viewportMetaEl();
    if (!meta) return;
    meta.setAttribute('content', content);
  }
  function applyZoom(zoom) {
    if (zoom == null || zoom === 1.0) {
      setViewportContent(DEFAULT_VIEWPORT);
      return;
    }
    if (!basePhysicalWidth) measureBasePhysicalWidth();
    if (!basePhysicalWidth) return;   // measurement failed; bail safely
    var laidOutWidth = Math.max(320, Math.round(basePhysicalWidth / zoom));
    setViewportContent('width=' + laidOutWidth + ', initial-scale=1.0, viewport-fit=cover');
  }
  function measureBasePhysicalWidth() {
    // To get the iframe's physical CSS px width, the viewport meta must be
    // at the default `width=device-width` first. Save current content,
    // revert to default, force reflow, read clientWidth, then restore.
    var meta = viewportMetaEl();
    if (!meta) { basePhysicalWidth = window.innerWidth || 0; return; }
    var saved = meta.getAttribute('content');
    var wasDefault = (saved === DEFAULT_VIEWPORT);
    if (!wasDefault) meta.setAttribute('content', DEFAULT_VIEWPORT);
    // Force synchronous layout pass so clientWidth reflects the revert.
    void document.documentElement.offsetWidth;
    basePhysicalWidth = document.documentElement.clientWidth || window.innerWidth || 0;
    if (!wasDefault) meta.setAttribute('content', saved);
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
    var reset = makeBtn('⟲', 'Reset zoom to adaptive default', resetZoom);
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

  // ── Resize handling ───────────────────────────────────────────────────
  // If the iframe's physical size changes (OBS source resize), the cached
  // basePhysicalWidth becomes stale. Re-measure and re-apply.
  var resizeRaf = 0;
  function onResize() {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(function () {
      resizeRaf = 0;
      measureBasePhysicalWidth();
      var override = readOverride();
      if (override != null) applyZoom(override);
    });
  }

  // ── Init ──────────────────────────────────────────────────────────────
  function init() {
    if (document.getElementById('fpts-obs-zoom-controls')) return;   // idempotent
    measureBasePhysicalWidth();   // capture BEFORE any zoom is applied
    var stored = readOverride();
    if (stored != null) applyZoom(stored);   // restore persisted override
    widget = createWidget();
    // Mount on documentElement (NOT body). If we mounted on body, the
    // widget would scale with the layout viewport changes — clicking [+]
    // would inflate the buttons along with the page content.
    (document.documentElement || document.body).appendChild(widget);
    render();
    window.addEventListener('resize', onResize, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
