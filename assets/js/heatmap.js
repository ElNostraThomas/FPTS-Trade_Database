/* Heatmap module — shared across pages that show a player modal.
   Renders the pick-availability heatmap (probability of player being on the
   board at each pick slot) into a caller-provided container element.

   Usage:
     1. Each page must fetch data/pick-availability.json into a global, e.g.:
          window.PICK_AVAILABILITY = json.players;
     2. Then call:
          Heatmap.render(containerEl, sleeperId);

   The container will get filled with the heatmap section markup. If the
   player isn't in the heatmap dataset (coverage is top 300 startup ADP),
   a placeholder is rendered instead of nothing — so the modal layout is
   stable across players. */

(function () {
  'use strict';

  function escHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function renderInto(containerEl, sleeperId) {
    if (!containerEl) return;
    const heatmap = (window.PICK_AVAILABILITY && sleeperId)
      ? window.PICK_AVAILABILITY[String(sleeperId)]
      : null;

    // Always render the section frame so the modal layout is consistent.
    if (!heatmap || !heatmap.matrix || !heatmap.matrix.length) {
      containerEl.innerHTML = ''
        + '<div class="mvs-section">'
        +   '<div class="mvs-section-label">Pick Availability Heatmap</div>'
        +   '<div class="hm-empty">Pick-availability isn\'t tracked for this player — coverage is limited to the top ~300 startup ADP.</div>'
        + '</div>';
      return;
    }

    const slots  = heatmap.slots  || (heatmap.matrix[0] ? heatmap.matrix[0].length : 12);
    const rounds = heatmap.rounds || heatmap.matrix.length;
    const expected = heatmap.expectedPick != null ? heatmap.expectedPick.toFixed(1) : '—';
    const sampled  = (heatmap.draftsSampled || 0).toLocaleString();
    // Refresh stamp — pulled from PICK_AVAILABILITY_META.version (set by each
    // page's pick-availability.json fetch). Same `version` timestamp lives on
    // adp.json + auction.json so heatmap data is provably in lockstep with ADP.
    const metaVersion = (window.PICK_AVAILABILITY_META && window.PICK_AVAILABILITY_META.version) || '';
    const refreshed = metaVersion ? String(metaVersion).split('T')[0] : '';

    let bodyHtml = '<div class="hm-corner"></div>';
    for (let s = 1; s <= slots; s++) bodyHtml += '<div class="hm-col-head">' + s + '</div>';
    for (let r = 0; r < rounds; r++) {
      bodyHtml += '<div class="hm-row-head">R' + (r + 1) + '</div>';
      const row = heatmap.matrix[r] || [];
      for (let s = 0; s < slots; s++) {
        const v = Math.max(0, Math.min(100, Number(row[s] || 0)));
        const alpha = v === 0 ? 0.04 : Math.max(0.08, v / 100);
        const textColor = v >= 35 ? '#111' : 'rgba(255,255,255,.5)';
        const label = v >= 8 ? v : '';
        const pickLbl = (r + 1) + '.' + String(s + 1).padStart(2, '0');
        bodyHtml += '<div class="hm-cell" '
                  + 'style="background:rgba(237,129,12,' + alpha.toFixed(2) + ');color:' + textColor + '" '
                  + 'data-pick="' + pickLbl + '" data-val="' + v + '" '
                  + 'title="R' + pickLbl + ' — ' + v + '% available">' + label + '</div>';
      }
    }

    containerEl.innerHTML = ''
      + '<div class="mvs-section">'
      +   '<div class="mvs-section-label">Pick Availability Heatmap</div>'
      +   '<div class="hm-callout">'
      +     '<div class="hm-co-stat"><span class="hm-co-k">Expected pick</span><span class="hm-co-v">' + expected + '</span></div>'
      +     '<div class="hm-co-stat"><span class="hm-co-k">Drafts sampled</span><span class="hm-co-v">' + sampled + '</span></div>'
      +     (refreshed ? '<div class="hm-co-stat"><span class="hm-co-k">Data refreshed</span><span class="hm-co-v">' + escHtml(refreshed) + '</span></div>' : '')
      +     '<div class="hm-co-note">Each cell shows the % chance the player is still on the board at that pick. Darker orange = more likely available.</div>'
      +   '</div>'
      +   '<div class="hm-legend">'
      +     '<span>Availability</span>'
      +     '<span>0%</span>'
      +     '<div class="hm-legend-bar"></div>'
      +     '<span>100%</span>'
      +     '<span class="hm-flash-label">—</span>'
      +   '</div>'
      +   '<div class="hm-grid" style="grid-template-columns:34px repeat(' + slots + ', minmax(0, 1fr))">'
      +     bodyHtml
      +   '</div>'
      + '</div>';

    // Wire click-to-flash on cells.
    const grid = containerEl.querySelector('.hm-grid');
    const flashLab = containerEl.querySelector('.hm-flash-label');
    if (grid) {
      grid.addEventListener('click', function (e) {
        const cell = e.target.closest('.hm-cell');
        if (!cell) return;
        grid.querySelectorAll('.hm-flash').forEach(function (c) { c.classList.remove('hm-flash'); });
        cell.classList.add('hm-flash');
        if (flashLab) {
          flashLab.textContent = cell.dataset.pick + ' · ' + cell.dataset.val + '%';
          flashLab.classList.add('show');
        }
      });
    }
  }

  window.Heatmap = { render: renderInto };
})();
