/* Player Articles — shared module, mounted into any player modal.
   Renders the most-recent FantasyPoints article for the player inline,
   plus a "See more articles" dropdown for the next 4 (5 total).
   Falls back to a "browse FantasyPoints" CTA when no articles match.

   Usage:
     1. The page must have loaded data/articles.json into window.PLAYER_ARTICLES
        (already done by every page's bootstrap).
     2. Call:
          PlayerArticles.mount(containerEl, playerName);
        The container can be any empty <div>; this module owns its markup.

   The shared module replaces the previously duplicated mountPlayerArticles()
   function that lived in both index.html and my-leagues.html. */

(function () {
  'use strict';

  function escHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function fmtArticleDate(s) {
    if (!s) return '';
    try {
      const d = new Date(s);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) { return ''; }
  }

  function normalizeName(name) {
    // Mirrors normalizePlayerName used elsewhere — lowercase, strip punctuation.
    return String(name || '').toLowerCase()
      .replace(/[.'’]/g, '')
      .replace(/\s+(jr|sr|ii|iii|iv)\.?$/i, '')
      .replace(/[^a-z0-9]/g, '');
  }

  function mount(containerEl, playerName) {
    if (!containerEl) return;

    // Find or create the section root inside the container.
    // Section wrapper carries no chrome (no padding / border / background) —
    // mirrors DB's inline mountPlayerArticles so the article row sits flush
    // inside .pp-info on every page. The visual prominence on the empty
    // state comes from the dashed-orange inner box, not from this wrapper.
    let row = containerEl.querySelector(':scope > .pp-articles-section');
    if (!row) {
      row = document.createElement('div');
      row.className = 'pp-articles-section';
      row.style.cssText = 'display:none';
      row.innerHTML = ''
        + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">'
        +   '<span style="font-family:\'Kanit\',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;letter-spacing:.06em">Articles</span>'
        +   '<span class="pp-articles-source" style="font-family:\'Mulish\',sans-serif;font-size:10px;color:var(--white);opacity:.55">FantasyPoints.com</span>'
        + '</div>'
        + '<div class="pp-article-inline" style="display:flex;align-items:center;gap:10px;min-height:24px"></div>'
        + '<div class="pp-articles-more-wrap" style="display:none;margin-top:8px">'
        +   '<button type="button" class="pp-articles-more-btn" '
        +     'style="background:none;border:none;color:var(--white);opacity:.7;font-family:\'Kanit\',sans-serif;font-weight:800;font-style:italic;font-size:10px;text-transform:uppercase;letter-spacing:.06em;cursor:pointer;padding:0;display:flex;align-items:center;gap:4px">'
        +     '<span class="pp-articles-more-label">See more articles</span>'
        +     '<span class="pp-articles-more-arrow" style="font-size:8px;transition:transform .15s">▼</span>'
        +   '</button>'
        +   '<div class="pp-articles-more-list" style="display:none;margin-top:8px;padding-top:8px;border-top:1px solid var(--border)"></div>'
        + '</div>';
      containerEl.appendChild(row);

      const btn = row.querySelector('.pp-articles-more-btn');
      const list = row.querySelector('.pp-articles-more-list');
      const lbl = row.querySelector('.pp-articles-more-label');
      const arr = row.querySelector('.pp-articles-more-arrow');
      btn.addEventListener('click', function () {
        const open = list.style.display === 'block';
        list.style.display  = open ? 'none' : 'block';
        lbl.textContent     = open ? 'See more articles' : 'Hide articles';
        arr.style.transform = open ? '' : 'rotate(180deg)';
      });
    }

    // Look up articles for this player. Try the name as-is first (most
    // page bootstraps key PLAYER_ARTICLES by display name); fall back to
    // a normalized key for variant spellings.
    const ARTICLES = window.PLAYER_ARTICLES || {};
    let articles = ARTICLES[playerName];
    if (!articles) {
      const want = normalizeName(playerName);
      for (const k in ARTICLES) {
        if (normalizeName(k) === want) { articles = ARTICLES[k]; break; }
      }
    }
    articles = (articles || []).slice().sort(function (a, b) {
      return String(b.date || '').localeCompare(String(a.date || ''));
    });

    // Always reset dropdown to closed when re-rendering for a new player
    const list = row.querySelector('.pp-articles-more-list');
    const lbl  = row.querySelector('.pp-articles-more-label');
    const arr  = row.querySelector('.pp-articles-more-arrow');
    list.style.display  = 'none';
    lbl.textContent     = 'See more articles';
    arr.style.transform = '';

    if (!articles.length) {
      row.style.display = '';
      row.querySelector('.pp-article-inline').innerHTML = ''
        + '<div style="display:flex;align-items:center;gap:10px;width:100%;padding:8px 12px;background:rgba(237,129,12,0.06);border:1px dashed var(--border2)">'
        +   '<span style="font-family:\'Mulish\',sans-serif;font-size:12px;color:var(--white);opacity:.7;font-style:italic;flex:1;min-width:0">'
        +     'No curated articles yet — browse FantasyPoints for ' + escHtml(playerName) + ' coverage'
        +   '</span>'
        +   '<a href="https://www.fantasypoints.com/articles#/" target="_blank" rel="noopener" '
        +     'style="font-family:\'Kanit\',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-transform:uppercase;letter-spacing:.06em;flex-shrink:0;padding:5px 10px;border:1px solid var(--red)">'
        +     'Browse FantasyPoints ↗'
        +   '</a>'
        + '</div>';
      const moreWrap = row.querySelector('.pp-articles-more-wrap');
      if (moreWrap) moreWrap.style.display = 'none';
      return;
    }

    row.style.display = '';
    const first = articles[0];
    row.querySelector('.pp-article-inline').innerHTML = ''
      + '<a href="' + escHtml(first.url || '#') + '" target="_blank" rel="noopener" '
      +   'style="font-family:\'Mulish\',sans-serif;font-weight:900;font-size:13px;color:var(--white);text-decoration:none;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" '
      +   'title="' + escHtml(first.title || '') + '">' + escHtml(first.title || '(untitled)') + '</a>'
      + (first.date ? '<span style="font-family:\'Mulish\',sans-serif;font-size:10px;color:var(--white);opacity:.55;flex-shrink:0">' + escHtml(fmtArticleDate(first.date)) + '</span>' : '')
      + '<a href="' + escHtml(first.url || '#') + '" target="_blank" rel="noopener" '
      +   'style="font-family:\'Kanit\',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-transform:uppercase;letter-spacing:.06em;flex-shrink:0">'
      +   'Read →'
      + '</a>';

    const rest = articles.slice(1, 5);
    const moreWrap = row.querySelector('.pp-articles-more-wrap');
    if (rest.length) {
      moreWrap.style.display = '';
      list.innerHTML = rest.map(function (a) {
        return '<div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border)">'
          + '<a href="' + escHtml(a.url || '#') + '" target="_blank" rel="noopener" '
          +   'style="font-family:\'Mulish\',sans-serif;font-weight:700;font-size:12px;color:var(--white);text-decoration:none;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" '
          +   'title="' + escHtml(a.title || '') + '">' + escHtml(a.title || '(untitled)') + '</a>'
          + (a.date ? '<span style="font-family:\'Mulish\',sans-serif;font-size:10px;color:var(--white);opacity:.55;flex-shrink:0">' + escHtml(fmtArticleDate(a.date)) + '</span>' : '')
          + '</div>';
      }).join('');
    } else {
      moreWrap.style.display = 'none';
    }
  }

  window.PlayerArticles = { mount: mount };
})();
