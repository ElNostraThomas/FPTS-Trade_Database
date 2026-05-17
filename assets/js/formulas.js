/* Formulas page renderer.
   Reads window.FormulasContent (set by formulas-content.js) and builds:
     - Sticky TOC sidebar (one link per domain)
     - Main content area (one card per domain, one entry per formula)
   Adds a search filter that matches across label / location / inputs / math /
   notes and hides non-matching entries (and empty domains). Sticky-scroll the
   TOC's active link to whichever domain is currently in the viewport. */

(function () {
  'use strict';

  // ── Utilities ────────────────────────────────────────────────────────────
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function totalEntries(content) {
    return (content.domains || []).reduce(function (n, d) {
      return n + ((d.entries || []).length);
    }, 0);
  }

  // ── Render ──────────────────────────────────────────────────────────────
  function renderTOC(domains) {
    return domains.map(function (d) {
      var count = (d.entries || []).length;
      return '<a class="fm-toc-link" href="#' + esc(d.id) + '" '
           +   'data-domain="' + esc(d.id) + '" '
           +   'onclick="event.preventDefault(); formulasGoTo(\'' + esc(d.id) + '\')">'
           +   esc(d.name)
           +   '<span class="fm-toc-count">(' + count + ')</span>'
           + '</a>';
    }).join('');
  }

  // Repo source link — every file:line on a tracked file can deep-link to GitHub.
  var REPO_BLOB_URL = 'https://github.com/ElNostraThomas/FPTS-Trade_Database/blob/main/';
  function sourceLinkHtml(location) {
    if (!location) return '';
    // Match "{path}:{line}" or "{path}:{startLine}-{endLine}" or "{path}" alone.
    var m = location.match(/^([\w./\\-]+\.(?:html|js|py|css|md))(?::(\d+)(?:-(\d+))?)?$/);
    if (!m) return '';
    var path = m[1].replace(/\\/g, '/');
    var line = m[2];
    var href = REPO_BLOB_URL + path + (line ? '#L' + line : '');
    return ' <a class="fm-src-link" href="' + esc(href) + '" target="_blank" rel="noopener" title="View source on GitHub">↗</a>';
  }

  // Provenance categories — short tag + brand color class.
  var PROVENANCE = {
    'hand-tuned':         { label: 'Hand-tuned',         cls: 'prov-tuned',    desc: 'Curator-set with no formal data backing.' },
    'derived-from-data':  { label: 'Derived from data',  cls: 'prov-derived',  desc: 'Computed from a dataset (CSV, API, parquet, etc.).' },
    'external-standard':  { label: 'External standard',  cls: 'prov-external', desc: 'Comes from an external system (Sleeper API, FantasyPoints, etc.).' },
    'manual-curation':    { label: 'Manual curation',    cls: 'prov-manual',   desc: 'Author picks one of a fixed enum per item (e.g. tier letter, BSH tag).' },
    'framework-default':  { label: 'Framework default',  cls: 'prov-framework',desc: 'JS / CSS convention; not a chosen value.' },
    'unknown':            { label: 'Unknown',            cls: 'prov-unknown',  desc: 'Origin not documented in code; analyst input requested.' },
    'site-convention':    { label: 'Site convention',    cls: 'prov-conv',     desc: 'Brand-style choice (color, sign convention, layout).' }
  };
  function provenanceChipHtml(prov) {
    if (!prov) return '';
    var p = PROVENANCE[prov.kind] || PROVENANCE['unknown'];
    var detail = prov.detail ? ' <span class="fm-prov-detail">— ' + esc(prov.detail) + '</span>' : '';
    return '<span class="fm-prov-chip ' + p.cls + '" title="' + esc(p.desc) + '">' + esc(p.label) + '</span>' + detail;
  }

  function relatedChipsHtml(related) {
    if (!related || !related.length) return '';
    return related.map(function (id) {
      return '<a class="fm-related-chip" href="#' + esc(id) + '" '
           +   'onclick="event.preventDefault(); formulasGoToEntry(\'' + esc(id) + '\')">'
           + '↳ ' + esc(id) + '</a>';
    }).join(' ');
  }

  function renderEntry(e) {
    var rows = [];
    if (e.location)    rows.push(rowMono('Location', e.location + sourceLinkHtml(e.location)));
    if (e.provenance)  rows.push(rowRaw('Source',    provenanceChipHtml(e.provenance)));
    if (e.inputs)      rows.push(rowText('Inputs',   e.inputs));
    if (e.math)        rows.push(rowMono('Math',     e.math, true));
    if (e.output && e.output !== '—')         rows.push(rowText('Output',  e.output));
    if (e.example)                            rows.push(rowMono('Example', e.example, true, 'fm-rv-example'));
    if (e.whyThisNumber)                      rows.push(rowRaw('Why',      '<div class="fm-rv-why">' + esc(e.whyThisNumber) + '</div>'));
    if (e.notes && e.notes !== '—')           rows.push(rowText('Notes',   e.notes));
    if (e.related && e.related.length)        rows.push(rowRaw('Related',  relatedChipsHtml(e.related)));
    return '<div class="fm-entry" id="' + esc(e.id) + '" data-search="' + esc(buildSearchBlob(e)) + '">'
         +   '<div class="fm-entry-head">'
         +     '<div class="fm-entry-label">' + esc(e.label) + '</div>'
         +     (e.location ? '<div class="fm-entry-loc">' + esc(e.location) + sourceLinkHtml(e.location) + '</div>' : '')
         +   '</div>'
         +   '<div class="fm-rows">' + rows.join('') + '</div>'
         + '</div>';
  }
  function rowText(k, v) {
    return '<div class="fm-rk">' + esc(k) + '</div><div class="fm-rv">' + esc(v) + '</div>';
  }
  function rowMono(k, v, escapeText, extraClass) {
    // For Location we want the source link to render as HTML, so the value
    // arrives already-HTML-safe. For Math and Example we esc() the body.
    var body = escapeText ? esc(v) : v;
    var cls = 'fm-rv mono' + (extraClass ? ' ' + extraClass : '');
    return '<div class="fm-rk">' + esc(k) + '</div><div class="' + cls + '">' + body + '</div>';
  }
  function rowRaw(k, htmlValue) {
    return '<div class="fm-rk">' + esc(k) + '</div><div class="fm-rv">' + htmlValue + '</div>';
  }
  function buildSearchBlob(e) {
    return [e.label, e.location, e.inputs, e.math, e.output, e.notes,
            e.example, e.whyThisNumber,
            e.provenance && e.provenance.detail]
      .filter(Boolean).join(' ').toLowerCase();
  }

  function renderDomain(d) {
    var entries = (d.entries || []).map(renderEntry).join('');
    return '<section class="fm-domain" id="domain-' + esc(d.id) + '" data-domain="' + esc(d.id) + '">'
         +   '<div class="fm-domain-head">'
         +     '<div class="fm-domain-name">' + esc(d.name) + '</div>'
         +     '<div class="fm-domain-count">' + (d.entries || []).length + ' entries</div>'
         +   '</div>'
         +   '<div class="fm-domain-body">' + entries + '</div>'
         + '</section>';
  }

  function renderEmpty() {
    return '<div class="fm-empty">'
         +   '<div class="fm-empty-strong">No formulas match your search.</div>'
         +   '<div style="margin-top:8px">Try a different term, or clear the search to see all.</div>'
         + '</div>';
  }

  // ── Init ────────────────────────────────────────────────────────────────
  function init() {
    var content = window.FormulasContent;
    if (!content) {
      document.getElementById('fm-content').innerHTML =
        '<div class="fm-empty">FormulasContent not loaded.</div>';
      return;
    }
    var toc = document.getElementById('fm-toc');
    var main = document.getElementById('fm-content');
    var statCount = document.getElementById('fm-stat-count');

    toc.innerHTML = '<div class="fm-toc-title">Domains</div>' + renderTOC(content.domains);
    main.innerHTML = content.domains.map(renderDomain).join('') + '<div class="fm-empty" id="fm-empty" style="display:none"></div>';
    statCount.textContent = totalEntries(content) + ' entries · ' + content.domains.length + ' domains';

    // Deep-link via hash
    if (location.hash) {
      var id = location.hash.slice(1);
      setTimeout(function () { scrollTo(id); }, 100);
    }

    // Active-section tracking
    setupScrollSpy();
  }

  function scrollTo(id) {
    var el = document.getElementById('domain-' + id) || document.getElementById(id);
    if (!el) return;
    var rect = el.getBoundingClientRect();
    var top = window.scrollY + rect.top - 70;  // offset for sticky nav
    window.scrollTo({ top: top, behavior: 'smooth' });
    setActiveTOC(id);
  }
  function setActiveTOC(id) {
    var links = document.querySelectorAll('.fm-toc-link');
    links.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-domain') === id);
    });
  }

  // Scroll-spy: update active TOC link as user scrolls
  function setupScrollSpy() {
    var domains = Array.prototype.slice.call(document.querySelectorAll('.fm-domain'));
    if (!domains.length) return;
    function update() {
      // Pick the domain whose top is closest to (but not below) the viewport top + offset
      var anchor = 120;
      var best = domains[0];
      var bestDelta = Infinity;
      domains.forEach(function (d) {
        if (d.classList.contains('hidden')) return;
        var rect = d.getBoundingClientRect();
        if (rect.top <= anchor) {
          var delta = anchor - rect.top;
          if (delta < bestDelta) { bestDelta = delta; best = d; }
        }
      });
      if (best) setActiveTOC(best.getAttribute('data-domain'));
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // ── Search filter ────────────────────────────────────────────────────────
  window.formulasFilter = function (q) {
    var query = String(q || '').trim().toLowerCase();
    var clearBtn = document.getElementById('fm-search-clear');
    var resultCount = document.getElementById('fm-result-count');
    clearBtn.style.display = query ? '' : 'none';

    var allEntries = document.querySelectorAll('.fm-entry');
    var allDomains = document.querySelectorAll('.fm-domain');
    var empty = document.getElementById('fm-empty');
    var hits = 0;

    if (!query) {
      allEntries.forEach(function (e) { e.classList.remove('hidden', 'highlight'); });
      allDomains.forEach(function (d) { d.classList.remove('hidden'); });
      empty.style.display = 'none';
      resultCount.textContent = '';
      resultCount.classList.remove('filtering');
      return;
    }

    // Per-entry match
    allEntries.forEach(function (e) {
      var blob = e.getAttribute('data-search') || '';
      var match = blob.indexOf(query) !== -1;
      e.classList.toggle('hidden', !match);
      e.classList.toggle('highlight', match);
      if (match) hits++;
    });

    // Hide domains with zero matching entries
    allDomains.forEach(function (d) {
      var visibleEntries = d.querySelectorAll('.fm-entry:not(.hidden)');
      d.classList.toggle('hidden', visibleEntries.length === 0);
    });

    if (hits === 0) {
      empty.innerHTML = '<div class="fm-empty-strong">No formulas match "' + esc(query) + '"</div>'
                      + '<div style="margin-top:8px">Try a shorter or different term.</div>';
      empty.style.display = '';
    } else {
      empty.style.display = 'none';
    }
    resultCount.textContent = hits + ' match' + (hits !== 1 ? 'es' : '');
    resultCount.classList.add('filtering');
  };

  window.formulasClear = function () {
    var input = document.getElementById('fm-search');
    input.value = '';
    window.formulasFilter('');
    input.focus();
  };

  window.formulasGoTo = function (id) {
    if (history.replaceState) history.replaceState(null, '', '#' + id);
    scrollTo(id);
  };

  // Scroll to a specific entry (not a domain) — used by the related-chip links.
  window.formulasGoToEntry = function (entryId) {
    if (history.replaceState) history.replaceState(null, '', '#' + entryId);
    var el = document.getElementById(entryId);
    if (!el) return;
    var rect = el.getBoundingClientRect();
    var top = window.scrollY + rect.top - 80;
    window.scrollTo({ top: top, behavior: 'smooth' });
    // Brief flash so the user sees what landed in view.
    el.classList.add('fm-entry-flash');
    setTimeout(function () { el.classList.remove('fm-entry-flash'); }, 1400);
  };

  // Kick off
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
