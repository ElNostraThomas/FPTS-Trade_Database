/* MVS extras widgets — shared across index.html, trade-calculator.html, my-leagues.html.
   Renders: contributor rankings + OTC cross-check, recent-trades cards, MVS history sparkline.
   Pulls from FP_VALUES[name].{rankings, otcValue, otcDiff, recentTrades, history, value}.
   Returns plain HTML strings; callers inject into their modal's chosen container. */

(function () {
  'use strict';

  function _fmtInt(v)    { return (typeof v === 'number' && isFinite(v)) ? v.toLocaleString() : String(v); }
  function _escHtml(s)   { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  // ── Sparkline ─────────────────────────────────────────────────────────────
  function buildSparklineHtml(history) {
    if (!Array.isArray(history) || history.length < 2) return '';
    const vals = history.map(h => h && typeof h.mvs === 'number' ? h.mvs : null).filter(v => v != null);
    if (vals.length < 2) return '';
    const W = 280, H = 56, PAD = 4;
    const minV = Math.min.apply(null, vals);
    const maxV = Math.max.apply(null, vals);
    const range = (maxV - minV) || 1;
    const points = vals.map((v, i) => {
      const x = PAD + (i / (vals.length - 1)) * (W - 2 * PAD);
      const y = H - PAD - ((v - minV) / range) * (H - 2 * PAD);
      return [x, y];
    });
    const d = points.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
    const delta = vals[vals.length - 1] - vals[0];
    const stroke = delta > 0 ? '#66dd84' : delta < 0 ? 'var(--red)' : 'var(--white)';
    const sign   = delta >= 0 ? '+' : '';
    const days   = vals.length;
    const last   = vals[vals.length - 1];
    return ''
      + '<div class="mvs-section">'
      +   '<div class="mvs-section-label">MVS History <span class="mvs-section-sub">(last ' + days + 'd)</span></div>'
      +   '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" class="mvs-spark">'
      +     '<path d="' + d + '" stroke="' + stroke + '" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
      +   '</svg>'
      +   '<div class="mvs-section-foot">'
      +     '<span>' + _fmtInt(minV) + '</span>'
      +     '<span class="mvs-spark-delta" style="color:' + stroke + '">' + sign + _fmtInt(delta) + ' over ' + days + 'd · now ' + _fmtInt(last) + '</span>'
      +     '<span>' + _fmtInt(maxV) + '</span>'
      +   '</div>'
      + '</div>';
  }

  // ── Recent trades (compact card list) ─────────────────────────────────────
  function buildRecentTradesHtml(trades, currentPlayerName) {
    if (!Array.isArray(trades) || !trades.length) return '';
    const cards = trades.map(function (t) {
      const sides = (t.sides || []).map(function (side) {
        const items = (side.assets || []).map(function (a) {
          const isFocus = currentPlayerName && a.name === currentPlayerName;
          const cls = 'mvs-t-asset' + (isFocus ? ' mvs-t-asset-focus' : '');
          return '<span class="' + cls + '"><span class="mvs-t-asset-name">' + _escHtml(a.name) + '</span>'
               + '<span class="mvs-t-asset-mvs">' + _fmtInt(a.mvs || 0) + '</span></span>';
        }).join('');
        const total = (side.assets || []).reduce(function (s, a) { return s + (a.mvs || 0); }, 0);
        return '<div class="mvs-t-side"><div class="mvs-t-assets">' + items + '</div>'
             + '<div class="mvs-t-total">' + _fmtInt(total) + '</div></div>';
      });
      const fmt = t.format ? t.format.toUpperCase() : '';
      const date = (t.date || '').slice(0, 10);
      return '<div class="mvs-t-card">'
           +   '<div class="mvs-t-head"><span class="mvs-t-date">' + _escHtml(date) + '</span>'
           +     (fmt ? '<span class="mvs-t-fmt">' + _escHtml(fmt) + '</span>' : '') + '</div>'
           +   '<div class="mvs-t-sides">' + sides.join('<div class="mvs-t-vs">↔</div>') + '</div>'
           + '</div>';
    });
    return ''
      + '<div class="mvs-section">'
      +   '<div class="mvs-section-label">Recent Trades <span class="mvs-section-sub">(' + trades.length + ' most recent involving this player)</span></div>'
      +   '<div class="mvs-t-cards">' + cards.join('') + '</div>'
      + '</div>';
  }

  // ── OTC + Rankings + Baseline + Trade volume row ──────────────────────────
  function buildOtcRankingsHtml(rec) {
    if (!rec) return '';
    const cells = [];
    if (rec.otcValue != null) {
      const diff = (rec.value || 0) - rec.otcValue;
      const sign = diff >= 0 ? '+' : '';
      cells.push(''
        + '<div class="mvs-extras-cell">'
        +   '<div class="mvs-extras-label">OTC Value</div>'
        +   '<div class="mvs-extras-val">' + _fmtInt(rec.otcValue)
        +     ' <span class="mvs-extras-diff">(' + sign + _fmtInt(diff) + ' vs MVS)</span></div>'
        + '</div>');
    }
    // Baseline cell — pre-market formula baseline + delta vs current MVS.
    // Positive delta = market is pricing the player ABOVE baseline (hype),
    // negative = market is priced BELOW baseline (sell signal / undervalued).
    if (rec.baseline != null && rec.baseline > 0 && rec.value != null) {
      const bDiff = rec.value - rec.baseline;
      const bPct  = Math.round((bDiff / rec.baseline) * 100);
      const bSign = bDiff >= 0 ? '+' : '';
      const bClass = bDiff >= 0 ? 'mvs-extras-diff up' : 'mvs-extras-diff down';
      cells.push(''
        + '<div class="mvs-extras-cell">'
        +   '<div class="mvs-extras-label">Baseline</div>'
        +   '<div class="mvs-extras-val">' + _fmtInt(rec.baseline)
        +     ' <span class="' + bClass + '">(' + bSign + bPct + '% market)</span></div>'
        + '</div>');
    }
    // Trade volume — liquidity signal from the past 7 days.
    if (rec.tradesLastWeek != null) {
      const v = rec.tradesLastWeek;
      const tone = v >= 200 ? 'hot' : v >= 50 ? 'warm' : v > 0 ? 'cool' : 'cold';
      const tag  = v >= 200 ? 'Hot' : v >= 50 ? 'Active' : v > 0 ? 'Quiet' : 'No trades';
      cells.push(''
        + '<div class="mvs-extras-cell">'
        +   '<div class="mvs-extras-label">Trade Volume (7d)</div>'
        +   '<div class="mvs-extras-val">' + _fmtInt(v)
        +     ' <span class="mvs-vol mvs-vol-' + tone + '">' + tag + '</span></div>'
        + '</div>');
    }
    if (rec.rankings && Object.values(rec.rankings).some(function (v) { return v != null; })) {
      const r = rec.rankings;
      const chip = function (label, v) {
        if (v == null) return '';
        return '<span class="mvs-rk"><span class="mvs-rk-l">' + label + '</span>'
             + '<span class="mvs-rk-v">' + _fmtInt(v) + '</span></span>';
      };
      const chips = [
        chip('Main', r.main), chip('Jax', r.jax), chip('Jay', r.jay),
        chip('Joe', r.joe),  chip('Trav', r.trav),
      ].filter(Boolean).join('');
      cells.push(''
        + '<div class="mvs-extras-cell">'
        +   '<div class="mvs-extras-label">Contributor Rankings</div>'
        +   '<div class="mvs-extras-val mvs-rk-row">' + chips + '</div>'
        + '</div>');
    }
    if (!cells.length) return '';
    return '<div class="mvs-extras">' + cells.join('') + '</div>';
  }

  // ── Footer: data-freshness timestamp ──────────────────────────────────────
  function buildLastUpdatedHtml(lastUpdated) {
    if (!lastUpdated) return '';
    // CSV format: "2026-01-20 23:45:42.806" — strip seconds/ms for display
    const short = String(lastUpdated).replace(/(\d{4}-\d{2}-\d{2})[ T]?(\d{2}:\d{2}).*/, '$1 $2');
    return '<div class="mvs-foot">MVS data refreshed ' + _escHtml(short) + '</div>';
  }

  // Header composite: OTC + Rankings + Baseline + Volume cells + Last Updated footer.
  // Recent Trades live inside the Trades tab on every modal (no duplication).
  // MVS History sparkline removed from inline header per user feedback — the
  // chart wasn't part of the player-card visual spec. The buildSparkline
  // helper stays exposed in case any future caller wants to render it inside
  // a tab; the default inline header no longer includes it.
  function buildHeaderExtrasHtml(playerName) {
    if (typeof window.FP_VALUES === 'undefined') return '';
    const rec = window.FP_VALUES[playerName];
    if (!rec) return '';
    return buildOtcRankingsHtml(rec)
         + buildLastUpdatedHtml(rec.lastUpdated);
  }

  // Legacy composite (still includes RecentTrades) — kept for backwards
  // compatibility if any caller still wants the full block. Prefer
  // buildHeader + the Trades tab for new modals.
  function buildAllExtrasHtml(playerName) {
    if (typeof window.FP_VALUES === 'undefined') return '';
    const rec = window.FP_VALUES[playerName];
    if (!rec) return '';
    return buildOtcRankingsHtml(rec)
         + buildSparklineHtml(rec.history)
         + buildRecentTradesHtml(rec.recentTrades, playerName)
         + buildLastUpdatedHtml(rec.lastUpdated);
  }

  // Expose
  window.MvsExtras = {
    buildOtcRankings:  buildOtcRankingsHtml,
    buildSparkline:    buildSparklineHtml,
    buildRecentTrades: buildRecentTradesHtml,
    buildLastUpdated:  buildLastUpdatedHtml,
    buildHeader:       buildHeaderExtrasHtml,   // NEW — preferred (no trades)
    buildAll:          buildAllExtrasHtml,      // legacy — still includes trades
  };
})();
