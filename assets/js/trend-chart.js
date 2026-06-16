/* ════════════════════════════════════════════════════════════════════════════
   trend-chart.js — window.TrendChart: a tiny hand-rolled SVG line-chart renderer
   for time-series on player cards (e.g. the ADP Trend tab). Lifted from the
   proven compare.html _pcChart / _pcChartStats renderers, with the emitted
   classes namespaced `.tc-trend-*` (styled by assets/css/trend-chart.css) so it
   is self-contained on every page that opens the shared player panel.

   API:
     TrendChart.line(points, opts)  -> chart HTML (legend + axes + svg)
     TrendChart.stats(points, opts) -> Peak / Low / Avg / Current tiles
   points = [{ value:Number|null, label:String }]  (nulls are skipped)
   opts   = { color, yInvert, xLabels, gradientId, valueFmt, pointLabelFmt,
              legend, width, height, padX, padY, yLabelCount, showPointLabels }
   ════════════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  function _escAttr(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function line(points, opts) {
    opts = opts || {};
    points = points || [];
    const W = opts.width || 1000;
    const H = opts.height || 240;
    const padX = opts.padX != null ? opts.padX : 18;
    const padY = opts.padY != null ? opts.padY : 24;
    const color = opts.color || 'var(--red)';
    const yInvert = !!opts.yInvert;
    const xLabels = opts.xLabels || [];
    const gradId = opts.gradientId || ('tc-grad-' + Math.random().toString(36).slice(2, 9));
    const valueFmt = typeof opts.valueFmt === 'function' ? opts.valueFmt : (v => Number(v).toLocaleString());
    const pointLabelFmt = typeof opts.pointLabelFmt === 'function' ? opts.pointLabelFmt : valueFmt;
    const yLabelCount = opts.yLabelCount || 5;
    const legend = opts.legend || '';
    const showPointLabels = opts.showPointLabels !== false;

    const valid = points.map((p, i) => ({ value: p && p.value, label: p && p.label, idx: i }))
      .filter(p => p.value != null && !isNaN(p.value));
    if (valid.length < 1) {
      return `<div class="tc-trend-empty">No data to chart</div>`;
    }

    let vmin = Math.min(...valid.map(p => p.value));
    let vmax = Math.max(...valid.map(p => p.value));
    const rawRange = vmax - vmin;
    if (rawRange === 0) {
      const pad = Math.max(1, Math.abs(vmax) * 0.05);
      vmax += pad; vmin -= pad;
    } else {
      const pad = rawRange * 0.12;
      vmax += pad; vmin -= pad;
    }
    const vrange = (vmax - vmin) || 1;
    const lastIdx = Math.max(1, points.length - 1);

    const xForIdx = (idx) => padX + (idx / lastIdx) * (W - padX * 2);
    const yForVal = (v) => {
      const t = (v - vmin) / vrange;
      return yInvert ? padY + t * (H - padY * 2) : padY + (1 - t) * (H - padY * 2);
    };

    const gridFracs = [];
    for (let i = 1; i < yLabelCount - 1; i++) gridFracs.push(i / (yLabelCount - 1));
    const gridlines = gridFracs.map(t => {
      const y = (padY + t * (H - padY * 2)).toFixed(1);
      return `<line class="tc-trend-gridline" x1="${padX}" y1="${y}" x2="${W - padX}" y2="${y}"/>`;
    }).join('');
    const baseline = `<line class="tc-trend-baseline" x1="${padX}" y1="${(H - padY).toFixed(1)}" x2="${W - padX}" y2="${(H - padY).toFixed(1)}"/>`;

    let svgBody = '';
    if (valid.length === 1) {
      const v = valid[0];
      const x = xForIdx(v.idx).toFixed(1), y = yForVal(v.value).toFixed(1);
      svgBody = `<circle class="tc-trend-dot" cx="${x}" cy="${y}" r="5.5" fill="${color}" stroke="var(--surface2)" stroke-width="2.5"><title>${_escAttr(v.label || '')}</title></circle>`;
    } else {
      const polyPts = valid.map(p => `${xForIdx(p.idx).toFixed(1)},${yForVal(p.value).toFixed(1)}`).join(' ');
      const firstX = xForIdx(valid[0].idx).toFixed(1);
      const lastX = xForIdx(valid[valid.length - 1].idx).toFixed(1);
      const baseY = (H - padY).toFixed(1);
      const fillPoly = `<polygon points="${firstX},${baseY} ${polyPts} ${lastX},${baseY}" fill="url(#${gradId})"/>`;
      const lineEl = `<polyline class="tc-trend-line" points="${polyPts}" stroke="${color}"/>`;
      const dots = valid.map(p => {
        const x = xForIdx(p.idx).toFixed(1);
        const y = yForVal(p.value).toFixed(1);
        return `<circle class="tc-trend-dot" cx="${x}" cy="${y}" r="5.5" fill="${color}" stroke="var(--surface2)" stroke-width="2.5"><title>${_escAttr(p.label || '')}</title></circle>`;
      }).join('');
      svgBody = `${fillPoly}${lineEl}${dots}`;
    }

    let overlay = '';
    if (showPointLabels) {
      const overlayLabels = valid.map(p => {
        const xPct = (xForIdx(p.idx) / W * 100).toFixed(2);
        const yPct = (yForVal(p.value) / H * 100).toFixed(2);
        return `<span class="tc-trend-data-label" style="left:${xPct}%;top:${yPct}%">${pointLabelFmt(p.value)}</span>`;
      }).join('');
      overlay = `<div class="tc-trend-overlay">${overlayLabels}</div>`;
    }

    const yLabels = [];
    for (let i = 0; i < yLabelCount; i++) {
      const t = i / (yLabelCount - 1);
      const v = yInvert ? (vmin + t * vrange) : (vmax - t * vrange);
      yLabels.push(v);
    }
    const yAxisHtml = `
      <div class="tc-trend-yaxis">
        ${yLabels.map(v => `<span class="tc-trend-yaxis-label">${valueFmt(v)}</span>`).join('')}
      </div>`;

    let xAxisHtml = '';
    if (xLabels.length) {
      const cols = `repeat(${xLabels.length}, 1fr)`;
      const cells = xLabels.map(l => `<span class="tc-trend-xaxis-label">${l}</span>`).join('');
      xAxisHtml = `<div class="tc-trend-xaxis" style="grid-template-columns:${cols}">${cells}</div>`;
    }

    const legendHtml = legend ? `
      <div class="tc-trend-legend" style="--legend-color:${color}">
        <span class="tc-trend-legend-dot"></span>
        <span>${legend}</span>
      </div>` : '';

    return `
      ${legendHtml}
      <div class="tc-trend-body">
        ${yAxisHtml}
        <div class="tc-trend-svg-col">
          <div class="tc-trend-svg-wrap">
            <svg class="tc-trend-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" role="img">
              <defs>
                <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="${color}" stop-opacity="0.32"/>
                  <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
                </linearGradient>
              </defs>
              ${gridlines}
              ${baseline}
              ${svgBody}
            </svg>
            ${overlay}
          </div>
          ${xAxisHtml}
        </div>
      </div>`;
  }

  // Summary stat tiles below the chart: PEAK / LOW / AVG / CURRENT.
  // For yInvert (lower = better, e.g. ADP pick number / rank) PEAK = the
  // smallest value (best) and LOW = the largest.
  function stats(points, opts) {
    opts = opts || {};
    const valid = (points || []).filter(p => p && p.value != null && !isNaN(p.value));
    if (!valid.length) return '';
    const yInvert = !!opts.yInvert;
    const fmt = typeof opts.valueFmt === 'function' ? opts.valueFmt : (v => Number(v).toLocaleString());

    const vmin = Math.min(...valid.map(p => p.value));
    const vmax = Math.max(...valid.map(p => p.value));
    const avg = valid.reduce((s, p) => s + p.value, 0) / valid.length;
    const cur = valid[valid.length - 1].value;

    const peakLabel = yInvert ? 'PEAK' : 'HIGH';
    const lowLabel  = yInvert ? 'LOWEST' : 'LOW';
    const peakVal   = yInvert ? vmin : vmax;
    const lowVal    = yInvert ? vmax : vmin;

    const tile = (label, value, color) => `
      <div class="tc-trend-stat" style="--stat-color:${color}">
        <div class="tc-trend-stat-label">${label}</div>
        <div class="tc-trend-stat-value">${fmt(value)}</div>
      </div>`;

    return `
      <div class="tc-trend-stats">
        ${tile(peakLabel, peakVal, 'var(--green)')}
        ${tile(lowLabel,  lowVal,  'var(--red)')}
        ${tile('AVG',     avg,     'var(--muted)')}
        ${tile('CURRENT', cur,     'var(--yellow)')}
      </div>`;
  }

  global.TrendChart = { line: line, stats: stats };
})(window);
