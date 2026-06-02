/* ════════════════════════════════════════════════════════════════════════
   IFRAME SCROLL FIX — shared module
   ════════════════════════════════════════════════════════════════════════

   Problem: when the site is embedded inside a streaming-tool app (or any
   parent that iframes us), the parent page can't reach in and scroll the
   iframe content. Wheel events get trapped by inner scroll containers
   on our pages (e.g. the player-panel drawer's .pp-scroll, my-leagues
   table sections) and never bubble to the iframe document, so users in
   the parent app can't scroll past them.

   Solution: only when running inside an iframe (window.self !== window.top),
   flatten any oversized inner scrollable container to overflow: visible,
   and install a capture-phase wheel handler that manually scrolls the
   document when no scrollable child wants the wheel event.

   Features (all iframe-only):
   1. CSS overflow reset + container flattening (fixContainers) — frees
      trapped wheel events.
   2. Capture-phase wheel handler — defers to legit inner scrollers,
      otherwise window.scrollBy.
   3. Middle-click drag-scroll — CEF doesn't surface Chromium's native
      middle-click pan, so we re-implement it manually.
   4. Floating horizontal scrollbar (added 2026-06-02) — mounts a thin
      `position: fixed; bottom: 0` proxy scrollbar over any element with
      horizontal overflow whose native bar is below the viewport. Auto-
      hides when the target's bottom comes into view. Two-way scrollLeft
      sync. Refreshes via MutationObserver so ADP/table re-renders pick
      up the new content width without full reload.

   Hard guarantee: direct browser visitors (NOT in an iframe) get zero
   behavior change. The first thing this script does is bail if we're not
   embedded. Every site feature that relies on inner scrolling
   (player-panel drawer, my-leagues tables, tiers tables, etc.) is
   completely untouched for normal visits.

   Source spec: user-supplied iframe-compat snippet 2026-05-19; floating
   scrollbar feature added 2026-06-02 in response to OBS feedback.
   ════════════════════════════════════════════════════════════════════════ */
(function () {
  // ── IFRAME-ONLY GUARD ─────────────────────────────────────────────────
  // If we're the top-level window (direct browser visit), do nothing.
  // Catches the obvious case + cross-origin parents where window.top
  // access throws SecurityError (treat as "not embedded" defensively).
  try {
    if (window.self === window.top) return;
  } catch (_e) {
    // Cross-origin parent — we ARE embedded. Proceed.
  }

  // ── Inject the overflow-reset CSS ─────────────────────────────────────
  // Forces html/body to be scrollable + flattens common framework wrappers
  // and our own .page / page-wrapper selectors so the iframe's outer
  // document is the scroll surface.
  var css = [
    'html, body {',
    '  overflow-y: auto !important;',
    '  overflow-x: auto !important;',   /* was hidden — now allows horizontal scroll for wide content like the live-draft board */
    '  height: auto !important;',
    '  min-height: 100% !important;',
    '  max-height: none !important;',
    '}',
    '#__next, #root, #app, [data-reactroot] {',
    '  overflow: visible !important;',
    '  height: auto !important;',
    '  min-height: 0 !important;',
    '  max-height: none !important;',
    '}',
    'main, .main, #main,',
    '.container, .layout, .layout-wrapper,',
    '.page, .page-wrapper, .page-content,',
    '[class*="ScrollContainer"], [class*="scroll-container"] {',
    '  overflow: visible !important;',
    '  height: auto !important;',
    '  min-height: 0 !important;',
    '  max-height: none !important;',
    '}'
  ].join('\n');
  var styleEl = document.createElement('style');
  styleEl.setAttribute('data-iframe-scroll-fix', 'true');
  styleEl.appendChild(document.createTextNode(css));
  (document.head || document.documentElement).appendChild(styleEl);

  // ── fixContainers: flatten oversized scrollable inner containers ─────
  // Walks divs/main/article/section. Any element with overflow-y of
  // auto/scroll/hidden AND wider than 50% viewport AND taller than 200px
  // gets flipped to overflow: visible so it doesn't trap wheel events.
  function fixContainers() {
    if (!document.body) return;
    document.body.style.overflowY = 'auto';
    document.body.style.overflowX = 'auto';   /* was hidden — match the CSS reset above so the body can scroll horizontally when content overflows */
    document.body.style.height = 'auto';
    document.body.style.maxHeight = 'none';
    document.querySelectorAll('div, main, article, section').forEach(function (el) {
      try {
        var cs = getComputedStyle(el);
        var ov = cs.overflowY;
        if (ov === 'auto' || ov === 'scroll' || ov === 'hidden') {
          var r = el.getBoundingClientRect();
          if (r.width > window.innerWidth * 0.5 && r.height > 200) {
            el.style.overflowY = 'visible';
            el.style.maxHeight = 'none';
            el.style.height = 'auto';
          }
        }
      } catch (_e) { /* ignore unreachable elements */ }
    });
  }

  // ── Wheel handler: scroll the document when no inner child wants it ─
  // Walks up from the element under the cursor (up to 8 hops). If any
  // ancestor is still scrollable in the wheel direction, defer to it.
  // Only if NOTHING wants the wheel event does this preventDefault and
  // window.scrollBy manually — meaning legit inner scrollers (sidebars,
  // tables) keep working.
  function isScrollable(el) {
    if (!el || el === document.body || el === document.documentElement) return false;
    try {
      var cs = getComputedStyle(el);
      var vScroll = (cs.overflowY === 'auto' || cs.overflowY === 'scroll') &&
                    el.scrollHeight > el.clientHeight;
      var hScroll = (cs.overflowX === 'auto' || cs.overflowX === 'scroll') &&
                    el.scrollWidth > el.clientWidth;
      if (vScroll || hScroll) return true;
    } catch (_e) { /* ignore */ }
    return false;
  }
  function onWheel(e) {
    var el = document.elementFromPoint(e.clientX, e.clientY);
    var hops = 0;
    while (el && hops < 8) {
      if (isScrollable(el)) {
        var cs = getComputedStyle(el);
        var canScrollY = (cs.overflowY === 'auto' || cs.overflowY === 'scroll') &&
                         el.scrollHeight > el.clientHeight;
        var canScrollX = (cs.overflowX === 'auto' || cs.overflowX === 'scroll') &&
                         el.scrollWidth > el.clientWidth;
        // Defer to this ancestor if it still has room to scroll in the
        // wheel direction — vertical OR horizontal. The draft board is a
        // common horizontal-scrolling case (Shift+Wheel or trackpad).
        if (canScrollY) {
          var atTop    = el.scrollTop === 0;
          var atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
          if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) return;
        }
        if (canScrollX) {
          var atLeft  = el.scrollLeft === 0;
          var atRight = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
          if ((e.deltaX < 0 && !atLeft) || (e.deltaX > 0 && !atRight)) return;
        }
      }
      el = el.parentElement;
      hops++;
    }
    e.preventDefault();
    window.scrollBy({ top: e.deltaY, left: e.deltaX, behavior: 'auto' });
  }
  window.addEventListener('wheel', onWheel, { passive: false, capture: true });

  // ── Middle-click drag-scroll (Windows-style pan) ─────────────────────
  // OBS Browser Source doesn't surface the native middle-click pan/
  // auto-scroll gesture that desktop Chromium ships with. Re-implement
  // it manually so streamers can press the mouse wheel down + drag in
  // any direction to scroll the document. The board on live-draft and
  // wide tables on tiers / my-leagues / adp-tool benefit most.
  var pan = null;
  window.addEventListener('mousedown', function (e) {
    if (e.button !== 1) return;  // middle button only
    e.preventDefault();
    pan = {
      startX: e.clientX,
      startY: e.clientY,
      scrollX: window.scrollX || window.pageXOffset || 0,
      scrollY: window.scrollY || window.pageYOffset || 0,
    };
    document.body.style.cursor = 'all-scroll';
  }, true);
  window.addEventListener('mousemove', function (e) {
    if (!pan) return;
    var dx = e.clientX - pan.startX;
    var dy = e.clientY - pan.startY;
    // Drag-to-scroll convention: drag RIGHT moves content right →
    // viewport scrolls LEFT (so scrollLeft DECREASES). Drag follows
    // the page like a Google-Maps grab.
    window.scrollTo({
      left: pan.scrollX - dx,
      top:  pan.scrollY - dy,
      behavior: 'auto',
    });
  });
  window.addEventListener('mouseup', function (e) {
    if (e.button !== 1 || !pan) return;
    pan = null;
    document.body.style.cursor = '';
  });
  // Suppress the native auxclick fallback (some Chromium builds toggle
  // auto-scroll cursor mode on middle-down, which conflicts with the
  // drag-pan we just installed).
  window.addEventListener('auxclick', function (e) {
    if (e.button === 1) e.preventDefault();
  }, true);

  // ── Floating horizontal scrollbar (iframe-only) ──────────────────────
  // Problem: when a horizontally-scrollable element (ADP 12-col Box grid,
  // wide tables on rankings / my-leagues, draft board on live-draft) is
  // taller than the iframe viewport, the native horizontal scrollbar sits
  // at the BOTTOM of that element — well below the iframe's visible area.
  // OBS streamers had to scroll the whole page down before they could
  // touch the bar to pan horizontally.
  //
  // Solution: for every horizontally-overflowing scrollable element, mount
  // a thin scrollbar pinned to `bottom: 0` of the viewport. Two-way
  // scrollLeft sync with the target. Only visible when the target's
  // native bar is offscreen below the viewport (otherwise native suffices).
  //
  // Iframe-only (this whole module bailed at the top if not iframed), so
  // direct browser visitors see nothing.
  var BAR_HEIGHT_PX = 14;
  var floatingBarTargets = [];                // ordered list of target elements
  var floatingBarOfTarget = new WeakMap();    // target -> bar DOM element

  function _isHorizontallyScrollable(el) {
    if (!el || el === document.body || el === document.documentElement) return false;
    try {
      var cs = getComputedStyle(el);
      var ov = cs.overflowX;
      return (ov === 'auto' || ov === 'scroll') && el.scrollWidth > el.clientWidth + 1;
    } catch (_e) { return false; }
  }

  function _ensureFloatingBar(target) {
    var existing = floatingBarOfTarget.get(target);
    if (existing) return existing;

    var bar = document.createElement('div');
    bar.setAttribute('data-fpts-floating-hscroll', 'true');
    Object.assign(bar.style, {
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      height: BAR_HEIGHT_PX + 'px',
      overflowX: 'scroll',
      overflowY: 'hidden',
      zIndex: '99',
      background: 'rgba(0,0,0,0.65)',
      borderTop: '1px solid rgba(255,255,255,0.10)',
      display: 'none',
      pointerEvents: 'auto',
    });

    var inner = document.createElement('div');
    inner.setAttribute('data-fpts-floating-hscroll-inner', 'true');
    inner.style.height = '1px';
    inner.style.width = target.scrollWidth + 'px';
    bar.appendChild(inner);

    // Two-way sync. RAF guard prevents the bar↔target ping-pong from
    // doubling each event.
    var syncing = false;
    bar.addEventListener('scroll', function () {
      if (syncing) return;
      syncing = true;
      target.scrollLeft = bar.scrollLeft;
      requestAnimationFrame(function () { syncing = false; });
    }, { passive: true });
    target.addEventListener('scroll', function () {
      if (syncing) return;
      syncing = true;
      bar.scrollLeft = target.scrollLeft;
      requestAnimationFrame(function () { syncing = false; });
    }, { passive: true });

    document.body.appendChild(bar);
    floatingBarOfTarget.set(target, bar);
    floatingBarTargets.push(target);
    return bar;
  }

  function _updateFloatingBarVisibility(target) {
    var bar = floatingBarOfTarget.get(target);
    if (!bar) return;
    // If the target's overflow is gone (e.g. window resized, content
    // shrank), hide the bar.
    if (!_isHorizontallyScrollable(target)) {
      bar.style.display = 'none';
      return;
    }
    // Resync the inner spacer width — content can grow on re-render.
    var sw = target.scrollWidth;
    if (bar.firstChild && bar.firstChild.style.width !== sw + 'px') {
      bar.firstChild.style.width = sw + 'px';
    }
    // Visibility: show only when the target's native bottom edge is below
    // the viewport AND the target is at least partially in view. When the
    // user scrolls down enough that target.bottom comes into the viewport,
    // the native bar is reachable so hide the floating one.
    var r = target.getBoundingClientRect();
    var vh = window.innerHeight;
    var nativeBarHidden = r.bottom > vh - 2;
    var targetVisible   = r.top < vh && r.bottom > 0;
    bar.style.display = (nativeBarHidden && targetVisible) ? 'block' : 'none';
  }

  function _scanForOverflow() {
    // Look at any element that COULD be horizontally scrollable. Tag
    // names kept narrow to keep the walk cheap on big DOMs.
    var candidates = document.querySelectorAll('div, main, article, section, table');
    for (var i = 0; i < candidates.length; i++) {
      var el = candidates[i];
      if (_isHorizontallyScrollable(el)) {
        _ensureFloatingBar(el);
      }
    }
    // Visibility pass over every registered target (handles scroll-into-view
    // hide + post-resize show).
    for (var j = 0; j < floatingBarTargets.length; j++) {
      _updateFloatingBarVisibility(floatingBarTargets[j]);
    }
  }

  // Debounced via rAF so multiple events in one frame coalesce.
  var _scanScheduled = 0;
  function _scheduleScan() {
    if (_scanScheduled) return;
    _scanScheduled = requestAnimationFrame(function () {
      _scanScheduled = 0;
      _scanForOverflow();
    });
  }

  // Visibility-only update (cheaper than full scan). Fires on every
  // document scroll so the bar appears/disappears as the user pans
  // through the page vertically.
  var _visScheduled = 0;
  function _scheduleVisUpdate() {
    if (_visScheduled) return;
    _visScheduled = requestAnimationFrame(function () {
      _visScheduled = 0;
      for (var i = 0; i < floatingBarTargets.length; i++) {
        _updateFloatingBarVisibility(floatingBarTargets[i]);
      }
    });
  }

  window.addEventListener('scroll',  _scheduleVisUpdate, { passive: true, capture: true });
  window.addEventListener('resize',  _scheduleScan,      { passive: true });

  // ── Wire up ──────────────────────────────────────────────────────────
  // Run fixContainers ASAP, then again at 400ms and 1500ms to catch
  // anything that mounts late (async data render). MutationObserver
  // re-runs after SPA-style URL changes (we don't do SPA routing but
  // this is harmless and matches the source spec). The same hooks now
  // also drive the floating-scrollbar scan since both react to the same
  // mount-late + re-render triggers.
  function _runBothPasses() { fixContainers(); _scheduleScan(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _runBothPasses);
  } else {
    _runBothPasses();
  }
  setTimeout(_runBothPasses, 400);
  setTimeout(_runBothPasses, 1500);

  // MutationObserver does double duty: SPA URL change re-runs containers,
  // and any DOM mutation triggers a debounced scrollbar re-scan (catches
  // ADP filter changes, my-leagues sort, etc. — anything that re-renders
  // a wide table). The fixContainers calls still gate on URL change to
  // preserve original behavior.
  var lastUrl = location.href;
  new MutationObserver(function () {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(fixContainers, 250);
      setTimeout(fixContainers, 1200);
    }
    _scheduleScan();
  }).observe(document.documentElement, { subtree: true, childList: true });
})();
