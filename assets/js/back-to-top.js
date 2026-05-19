/* ════════════════════════════════════════════════════════════════════════
   BACK-TO-TOP — shared floating button
   ════════════════════════════════════════════════════════════════════════

   Appears in the bottom-right corner (above the Legend trigger) when the
   user has scrolled the page past 400px from the top. Click to smoothly
   scroll back to top. Fades in/out — auto-hides at top so it doesn't
   clutter the viewport on short pages.

   Loaded by every page that includes this script. No per-page wiring
   needed — the button is built and attached at runtime.

   Z-index 150 — sits above ordinary page content but BELOW the player-
   panel drawer (z 200+) and the Legend backdrop (z 8999) so it doesn't
   poke through open modals.
   ════════════════════════════════════════════════════════════════════════ */
(function () {
  var THRESHOLD = 400;        // px scrolled before button appears
  var FADE_MS   = 200;        // opacity transition duration

  function createButton() {
    var btn = document.createElement('button');
    btn.id = 'fpts-back-to-top';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Back to top');
    btn.title = 'Back to top';
    btn.innerHTML = '↑';   // ↑

    // Inline styles so this module is self-contained and doesn't depend
    // on brand.css load order or any per-page CSS overrides.
    Object.assign(btn.style, {
      position: 'fixed',
      bottom: '70px',           // sits 12px above .lg-trigger (which is at bottom:18px, ~40px tall)
      right: '18px',            // aligned with .lg-trigger right edge
      width: '44px',
      height: '44px',
      borderRadius: '50%',
      background: 'var(--red)',
      color: 'var(--white)',
      border: 'none',
      fontFamily: 'Mulish, sans-serif',
      fontSize: '22px',
      fontWeight: '900',
      lineHeight: '1',
      cursor: 'pointer',
      display: 'none',          // toggled to flex when scrolled
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(0,0,0,.4)',
      transition: 'opacity ' + FADE_MS + 'ms ease, transform .15s ease, box-shadow .15s ease',
      opacity: '0',
      zIndex: '150',
      padding: '0',
    });
    btn.addEventListener('mouseenter', function () {
      btn.style.transform = 'translateY(-1px)';
      btn.style.boxShadow = '0 6px 16px rgba(0,0,0,.5)';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.transform = '';
      btn.style.boxShadow = '0 4px 12px rgba(0,0,0,.4)';
    });
    btn.addEventListener('click', function () {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (_e) {
        // Older browsers without options-object scrollTo
        window.scrollTo(0, 0);
      }
    });
    return btn;
  }

  function init() {
    if (document.getElementById('fpts-back-to-top')) return;  // idempotent
    var btn = createButton();
    document.body.appendChild(btn);

    var visible = false;
    var hideTimer = null;

    function update() {
      var y = window.scrollY || window.pageYOffset || 0;
      var shouldShow = y > THRESHOLD;
      if (shouldShow && !visible) {
        visible = true;
        if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
        btn.style.display = 'flex';
        // Force layout flush before transitioning so the display change
        // doesn't get batched with the opacity change (which would skip
        // the fade-in transition).
        // eslint-disable-next-line no-unused-expressions
        btn.offsetHeight;
        btn.style.opacity = '1';
      } else if (!shouldShow && visible) {
        visible = false;
        btn.style.opacity = '0';
        hideTimer = setTimeout(function () {
          if (!visible) btn.style.display = 'none';
          hideTimer = null;
        }, FADE_MS);
      }
    }

    window.addEventListener('scroll', update, { passive: true });
    update();   // initial check (handles page-loaded-mid-scroll case)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
