/* Formulas page renderer — UPDATES TIMELINE.
   Reads window.FormulasContent (set by formulas-content.js) and builds a
   timeline grouped by the UPDATE (session) that introduced or last changed each
   formula:
     - Sticky TOC sidebar (one link per session, newest first)
     - Main content: one timeline node per session, each formula a card under
       its update, carrying a small chip naming its domain.
   Effective session per entry = entrySessions[entry.id] || domainSessions[domain.id].
   Entries whose session isn't listed in `sessions[]` fall into an "Earlier /
   unmapped" node at the bottom so nothing is dropped. Search matches across
   label / location / inputs / math / notes and hides non-matching cards (and
   empty session nodes). */

(function () {
  'use strict';

  // ── Utilities ────────────────────────────────────────────────────────────
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Repo source link — every file:line on a tracked file can deep-link to GitHub.
  var REPO_BLOB_URL = 'https://github.com/ElNostraThomas/FPTS-Trade_Database/blob/main/';
  function sourceLinkHtml(location) {
    if (!location) return '';
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

  function rowText(k, v) {
    return '<div class="fm-rk">' + esc(k) + '</div><div class="fm-rv">' + esc(v) + '</div>';
  }
  function rowMono(k, v, escapeText, extraClass) {
    var body = escapeText ? esc(v) : v;
    var cls = 'fm-rv mono' + (extraClass ? ' ' + extraClass : '');
    return '<div class="fm-rk">' + esc(k) + '</div><div class="' + cls + '">' + body + '</div>';
  }
  function rowRaw(k, htmlValue) {
    return '<div class="fm-rk">' + esc(k) + '</div><div class="fm-rv">' + htmlValue + '</div>';
  }
  function buildSearchBlob(e, domain) {
    return [e.label, e.location, e.inputs, e.math, e.output, e.notes,
            e.example, e.whyThisNumber,
            e.provenance && e.provenance.detail,
            domain && domain.name]
      .filter(Boolean).join(' ').toLowerCase();
  }

  // One formula card. `domain` supplies the context chip.
  function renderEntry(e, domain) {
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
    var chip = domain ? '<span class="fm-dom-chip">' + esc(domain.name) + '</span>' : '';
    return '<div class="fm-entry" id="' + esc(e.id) + '" data-search="' + esc(buildSearchBlob(e, domain)) + '">'
         +   '<div class="fm-entry-head">'
         +     '<div class="fm-entry-titlerow">' + chip + '<div class="fm-entry-label">' + esc(e.label) + '</div></div>'
         +     (e.location ? '<div class="fm-entry-loc">' + esc(e.location) + sourceLinkHtml(e.location) + '</div>' : '')
         +   '</div>'
         +   '<div class="fm-rows">' + rows.join('') + '</div>'
         + '</div>';
  }

  // ── Group entries by effective session ───────────────────────────────────
  function groupBySession(content) {
    var domainSessions = content.domainSessions || {};
    var entrySessions  = content.entrySessions || {};
    var groups = {};   // sessionId -> [{entry, domain}]
    (content.domains || []).forEach(function (d) {
      (d.entries || []).forEach(function (e) {
        var sid = entrySessions[e.id] || domainSessions[d.id] || '_unmapped';
        (groups[sid] = groups[sid] || []).push({ entry: e, domain: d });
      });
    });
    return groups;
  }

  // Ordered list of {session, items} — sessions[] order first, then any leftover
  // ids (incl. '_unmapped') appended so nothing is dropped.
  function orderedSessions(content, groups) {
    var out = [];
    var seen = {};
    (content.sessions || []).forEach(function (s) {
      if (groups[s.id] && groups[s.id].length) { out.push({ session: s, items: groups[s.id] }); seen[s.id] = 1; }
    });
    Object.keys(groups).forEach(function (sid) {
      if (seen[sid]) return;
      var label = sid === '_unmapped' ? 'Earlier / unmapped' : sid;
      out.push({ session: { id: sid, tag: '?', dateLabel: '', title: label, blurb: sid === '_unmapped' ? 'Formulas not yet filed under a specific update — map these in formulas-content.js.' : '' }, items: groups[sid] });
    });
    return out;
  }

  function renderSessionNode(group) {
    var s = group.session;
    var cards = group.items.map(function (it) { return renderEntry(it.entry, it.domain); }).join('');
    var head = '<div class="fm-session-head">'
             +   (s.dateLabel ? '<span class="fm-session-date">' + esc(s.dateLabel) + '</span>' : '')
             +   (s.tag ? '<span class="fm-session-tag">' + esc(s.tag) + '</span>' : '')
             +   '<div class="fm-session-title">' + esc(s.title || s.id) + '</div>'
             +   '<span class="fm-session-count">' + group.items.length + '</span>'
             + '</div>';
    var blurb = s.blurb ? '<div class="fm-session-blurb">' + esc(s.blurb) + '</div>' : '';
    return '<section class="fm-session" id="session-' + esc(s.id) + '" data-session="' + esc(s.id) + '">'
         +   head + blurb
         +   '<div class="fm-session-body">' + cards + '</div>'
         + '</section>';
  }

  function renderTOC(ordered) {
    return ordered.map(function (g) {
      var s = g.session;
      return '<a class="fm-toc-link" href="#session-' + esc(s.id) + '" '
           +   'data-session="' + esc(s.id) + '" '
           +   'onclick="event.preventDefault(); formulasGoTo(\'' + esc(s.id) + '\')">'
           +   '<span class="fm-toc-tag">' + esc(s.tag || '•') + '</span> ' + esc(s.title || s.id)
           +   '<span class="fm-toc-count">(' + g.items.length + ')</span>'
           + '</a>';
    }).join('');
  }

  // ── Init ────────────────────────────────────────────────────────────────
  function init() {
    var content = window.FormulasContent;
    if (!content) {
      document.getElementById('fm-content').innerHTML = '<div class="fm-empty">FormulasContent not loaded.</div>';
      return;
    }
    var groups  = groupBySession(content);
    var ordered = orderedSessions(content, groups);

    var toc = document.getElementById('fm-toc');
    var main = document.getElementById('fm-content');
    var statCount = document.getElementById('fm-stat-count');

    toc.innerHTML = '<div class="fm-toc-title">Updates</div>' + renderTOC(ordered);
    main.innerHTML = ordered.map(renderSessionNode).join('') + '<div class="fm-empty" id="fm-empty" style="display:none"></div>';

    var totalEntries = ordered.reduce(function (n, g) { return n + g.items.length; }, 0);
    statCount.textContent = totalEntries + ' formulas · ' + ordered.length + ' updates';

    if (location.hash) {
      var id = location.hash.slice(1).replace(/^session-/, '');
      setTimeout(function () { scrollTo(id); }, 100);
    }
    setupScrollSpy();
  }

  function scrollTo(id) {
    var el = document.getElementById('session-' + id) || document.getElementById(id);
    if (!el) return;
    var rect = el.getBoundingClientRect();
    var top = window.scrollY + rect.top - 70;
    window.scrollTo({ top: top, behavior: 'smooth' });
    setActiveTOC(id);
  }
  function setActiveTOC(id) {
    document.querySelectorAll('.fm-toc-link').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-session') === id);
    });
  }

  function setupScrollSpy() {
    var sections = Array.prototype.slice.call(document.querySelectorAll('.fm-session'));
    if (!sections.length) return;
    function update() {
      var anchor = 120;
      var best = sections[0];
      var bestDelta = Infinity;
      sections.forEach(function (d) {
        if (d.classList.contains('hidden')) return;
        var rect = d.getBoundingClientRect();
        if (rect.top <= anchor) {
          var delta = anchor - rect.top;
          if (delta < bestDelta) { bestDelta = delta; best = d; }
        }
      });
      if (best) setActiveTOC(best.getAttribute('data-session'));
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

    var allEntries  = document.querySelectorAll('.fm-entry');
    var allSessions = document.querySelectorAll('.fm-session');
    var empty = document.getElementById('fm-empty');
    var hits = 0;

    if (!query) {
      allEntries.forEach(function (e) { e.classList.remove('hidden', 'highlight'); });
      allSessions.forEach(function (d) { d.classList.remove('hidden'); });
      empty.style.display = 'none';
      resultCount.textContent = '';
      resultCount.classList.remove('filtering');
      return;
    }

    allEntries.forEach(function (e) {
      var blob = e.getAttribute('data-search') || '';
      var match = blob.indexOf(query) !== -1;
      e.classList.toggle('hidden', !match);
      e.classList.toggle('highlight', match);
      if (match) hits++;
    });
    allSessions.forEach(function (d) {
      var visible = d.querySelectorAll('.fm-entry:not(.hidden)');
      d.classList.toggle('hidden', visible.length === 0);
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
    if (history.replaceState) history.replaceState(null, '', '#session-' + id);
    scrollTo(id);
  };

  // Scroll to a specific entry (used by related-chip links).
  window.formulasGoToEntry = function (entryId) {
    if (history.replaceState) history.replaceState(null, '', '#' + entryId);
    var el = document.getElementById(entryId);
    if (!el) return;
    var rect = el.getBoundingClientRect();
    var top = window.scrollY + rect.top - 80;
    window.scrollTo({ top: top, behavior: 'smooth' });
    el.classList.add('fm-entry-flash');
    setTimeout(function () { el.classList.remove('fm-entry-flash'); }, 1400);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
