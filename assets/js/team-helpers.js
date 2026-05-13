/* ════════════════════════════════════════════════════════════════════════
   FPTS team-helpers — NFL team logo utilities shared across all pages.
   ════════════════════════════════════════════════════════════════════════

   PURPOSE
     Single source of truth for rendering NFL team logos. Today the site
     displays team affiliation as 3-letter text ("ATL", "PHI"); these
     helpers swap that for the team logo (with the abbreviation kept as
     alt/title text for accessibility + onerror fallback).

   USAGE
     <script src="assets/js/team-helpers.js?v=..."></script>

     // Then anywhere:
     TeamHelpers.logoUrl('ATL')
       → 'https://sleepercdn.com/images/team_logos/nfl/atl.png'

     TeamHelpers.logoImg('ATL')
       → '<img class="team-logo" src="..." alt="ATL" title="ATL" ...>'

     TeamHelpers.logoImg('ATL', { withText: true })
       → '<span class="team-logo-wrap"><img ...><span ...>ATL</span></span>'

     TeamHelpers.headshotBadge('ATL')
       → '<img class="player-hs-team" src="..." alt="ATL" ...>'
       (the small overlay that gets dropped inside a .player-hs-wrap)

   DATA CONTRACT
     team:  3-letter NFL abbreviation (uppercase, e.g. 'ATL', 'BUF')
            or falsy (free agents / RDP placeholders → no logo)

     Sleeper's CDN serves PNGs at
       https://sleepercdn.com/images/team_logos/nfl/{team.toLowerCase()}.png
     Transparent backgrounds — works on dark + light themes.

   FALLBACK CHAIN
     - Empty/falsy team           → returns empty string ('' / nothing)
     - Image load fails at CDN    → onerror swaps img for the text
                                    abbreviation, so a broken network
                                    degrades to today's behavior
   ════════════════════════════════════════════════════════════════════════ */

(function (global) {
  'use strict';

  function _esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function _norm(team) {
    if (!team) return '';
    const t = String(team).trim();
    if (!t || t === '—' || t === 'FA' || t === 'N/A') return '';
    return t;
  }

  function logoUrl(team) {
    const t = _norm(team);
    if (!t) return '';
    return 'https://sleepercdn.com/images/team_logos/nfl/' + t.toLowerCase() + '.png';
  }

  // Inline replacement for team-abbreviation text. Renders an <img> sized to
  // match adjacent text height. onerror swaps the img for the text fallback
  // so a CDN miss degrades cleanly.
  //
  //   opts.size      px height (default 14)
  //   opts.cls       extra classes (default 'team-logo')
  //   opts.withText  if true, render '<img> <span>ATL</span>' for accessibility
  function logoImg(team, opts) {
    opts = opts || {};
    const t = _norm(team);
    if (!t) return '';
    const size = opts.size || 14;
    const cls  = opts.cls  || 'team-logo';
    const url  = logoUrl(t);
    const alt  = _esc(t);
    const onerr = 'this.replaceWith(Object.assign(document.createElement(\'span\'),{className:\'team-logo-fallback\',textContent:\'' + alt + '\'}))';
    const img = '<img class="' + cls + '" src="' + url + '" alt="' + alt + '" title="' + alt + '" data-team="' + alt + '" style="height:' + size + 'px" loading="lazy" onerror="' + onerr + '">';
    if (opts.withText) {
      return '<span class="team-logo-wrap" style="display:inline-flex;align-items:center;gap:5px">' + img + '<span class="team-text" style="font-family:\'Mulish\',sans-serif;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--white);opacity:.78">' + alt + '</span></span>';
    }
    return img;
  }

  // Small team-logo overlay designed to drop inside a .player-hs-wrap as the
  // bottom-right badge. Sizing is driven by the badge CSS classes, not inline
  // style, so pages can pick the right modifier (.player-hs-team--md / --lg
  // / --xl) for the headshot they're badging.
  //
  //   opts.cls   extra modifier classes (e.g. 'player-hs-team--lg')
  function headshotBadge(team, opts) {
    opts = opts || {};
    const t = _norm(team);
    if (!t) return '';
    const cls = 'player-hs-team' + (opts.cls ? ' ' + opts.cls : '');
    const url = logoUrl(t);
    const alt = _esc(t);
    const onerr = 'this.style.display=\'none\'';
    return '<img class="' + cls + '" src="' + url + '" alt="' + alt + '" title="' + alt + '" data-team="' + alt + '" loading="lazy" onerror="' + onerr + '">';
  }

  // Convenience: wrap arbitrary headshot HTML in a .player-hs-wrap and append
  // the team-logo badge. Use when a caller has their own headshot markup
  // (e.g. existing <img class="hs">) and just wants to add the team overlay.
  //
  //   headshotHtml  existing HTML for the headshot (an <img> or <span>)
  //   team          3-letter team code (or falsy = no badge)
  //   opts.badgeCls modifier class for the badge size
  function wrapWithBadge(headshotHtml, team, opts) {
    opts = opts || {};
    const badge = headshotBadge(team, { cls: opts.badgeCls });
    if (!badge) return headshotHtml;
    return '<span class="player-hs-wrap">' + headshotHtml + badge + '</span>';
  }

  global.TeamHelpers = {
    logoUrl:        logoUrl,
    logoImg:        logoImg,
    headshotBadge:  headshotBadge,
    wrapWithBadge:  wrapWithBadge,
  };
})(typeof window !== 'undefined' ? window : globalThis);
