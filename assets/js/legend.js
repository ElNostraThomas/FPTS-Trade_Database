/* Legend drawer — shared module.
   - window.LegendContent: per-page documentation (set by legend-content.js).
   - window.Legend.init('page-key'): wires up the floating trigger + drawer.
   The drawer renders sections as <details> accordions; first section opens by default. */

(function () {
  'use strict';

  function escHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderItem(item) {
    // Row order tells a narrative: purpose → where the data lives → what
    // values mean → what feeds the algorithm → the math → what it produces
    // → a concrete worked example → code pointer → edge cases.
    //
    // Simple UI entries only need {what, source, values, notes}.
    // Algorithm entries can additionally include {inputs, formula, output,
    // example, codeRef} for full developer-grade documentation.
    var rows = [];
    if (item.what)    rows.push('<div class="lg-item-row"><span class="lg-k">What</span><span class="lg-v">'         + escHtml(item.what)    + '</span></div>');
    if (item.source)  rows.push('<div class="lg-item-row"><span class="lg-k">Source</span><span class="lg-v lg-mono">'  + escHtml(item.source)  + '</span></div>');
    if (item.values)  rows.push('<div class="lg-item-row"><span class="lg-k">Values</span><span class="lg-v">'       + escHtml(item.values)  + '</span></div>');
    if (item.inputs)  rows.push('<div class="lg-item-row"><span class="lg-k">Inputs</span><span class="lg-v">'       + escHtml(item.inputs)  + '</span></div>');
    if (item.formula) rows.push('<div class="lg-item-row"><span class="lg-k">Formula</span><span class="lg-v lg-mono">' + escHtml(item.formula) + '</span></div>');
    if (item.output)  rows.push('<div class="lg-item-row"><span class="lg-k">Output</span><span class="lg-v">'       + escHtml(item.output)  + '</span></div>');
    if (item.example) rows.push('<div class="lg-item-row"><span class="lg-k">Example</span><span class="lg-v lg-example">' + escHtml(item.example) + '</span></div>');
    if (item.codeRef) rows.push('<div class="lg-item-row"><span class="lg-k">Code</span><span class="lg-v lg-mono">'    + escHtml(item.codeRef) + '</span></div>');
    if (item.notes)   rows.push('<div class="lg-item-row"><span class="lg-k">Notes</span><span class="lg-v">'        + escHtml(item.notes)   + '</span></div>');
    return '<div class="lg-item">'
         +   '<div class="lg-item-head">' + escHtml(item.label) + '</div>'
         +   rows.join('')
         + '</div>';
  }

  function renderSection(section, idx) {
    var items = (section.items || []).map(renderItem).join('');
    return '<details class="lg-section"' + (idx === 0 ? ' open' : '') + '>'
         +   '<summary class="lg-section-head">'
         +     '<span class="lg-section-title">' + escHtml(section.name) + '</span>'
         +     '<span class="lg-section-count">' + (section.items || []).length + '</span>'
         +   '</summary>'
         +   '<div class="lg-section-body">' + items + '</div>'
         + '</details>';
  }

  function renderContent(content) {
    if (!content || !content.sections) {
      return '<div class="lg-blurb">No legend has been authored for this page yet.</div>';
    }
    var sections = content.sections.map(renderSection).join('');
    return '<div class="lg-header">'
         +   '<div class="lg-title">' + escHtml(content.title) + ' <span class="lg-title-sub">Legend</span></div>'
         +   (content.blurb ? '<div class="lg-blurb">' + escHtml(content.blurb) + '</div>' : '')
         + '</div>'
         + '<div class="lg-body">' + sections + '</div>';
  }

  function buildUI() {
    if (document.querySelector('.lg-trigger')) return;  // already built

    var btn = document.createElement('button');
    btn.className = 'lg-trigger';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Open page legend');
    btn.innerHTML = '<span class="lg-trigger-icon">?</span><span class="lg-trigger-text">Legend</span>';
    btn.addEventListener('click', open);

    var backdrop = document.createElement('div');
    backdrop.className = 'lg-backdrop';
    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) close(); });

    var drawer = document.createElement('aside');
    drawer.className = 'lg-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-label', 'Page legend');
    drawer.innerHTML = ''
      + '<div class="lg-close-bar">'
      +   '<span class="lg-top-label">Page Legend</span>'
      +   '<button class="lg-close" type="button" aria-label="Close legend">✕ Close</button>'
      + '</div>'
      + '<div class="lg-content" id="lg-content"></div>';
    drawer.querySelector('.lg-close').addEventListener('click', close);
    backdrop.appendChild(drawer);

    document.body.appendChild(btn);
    document.body.appendChild(backdrop);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && backdrop.classList.contains('open')) close();
    });
  }

  function open() {
    var backdrop = document.querySelector('.lg-backdrop');
    var key      = (window.Legend && window.Legend.pageKey) || '';
    var content  = window.LegendContent && window.LegendContent[key];
    document.getElementById('lg-content').innerHTML = renderContent(content);
    backdrop.classList.add('open');
  }
  function close() {
    var backdrop = document.querySelector('.lg-backdrop');
    if (backdrop) backdrop.classList.remove('open');
  }

  function init(pageKey) {
    window.Legend.pageKey = pageKey;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', buildUI);
    } else {
      buildUI();
    }
  }

  window.Legend = { init: init, open: open, close: close, pageKey: null };
})();
