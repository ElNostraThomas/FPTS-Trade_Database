/* Formulas page content — structured mirror of docs/FORMULAS.md.
   Hand-authored (not generated). When you change a formula in the code,
   update this AND docs/FORMULAS.md. The audit script flags drift in colors
   but not in this content; keep both in sync manually.

   Schema:
     domains[]:
       id     — kebab-case anchor used in TOC + URL hash
       name   — display name (TOC label + section heading)
       entries[]:
         id            — kebab-case anchor (deep-link to a specific entry)
         label         — display name (entry heading)
         location      — file:line (auto-converted to a GitHub source link)
         provenance    — { kind, detail } where kind is one of:
                         'hand-tuned'         curator-set, no formal data backing
                         'derived-from-data'  computed from a real dataset / API
                         'external-standard'  comes from an external system (Sleeper, FP)
                         'manual-curation'    author picks from a fixed enum per item
                         'framework-default'  JS/CSS convention; not a chosen value
                         'site-convention'    brand-style choice
                         'unknown'            origin not documented; analyst input requested
         inputs        — what data + where it comes from
         math          — verbatim code/formula (rendered in monospace block)
         output        — what the calculation produces
         example       — concrete input → output trace (rendered in green-tinted block)
         notes         — edge cases, hand-tuned constants, analyst-relevant context
         related       — array of other entry ids that link to this one (cross-refs)
         whyThisNumber — for magic-numbers + heuristics, the actual reasoning where
                         it can be verified, or 'Analyst input requested' where it
                         can't (rendered in yellow-tinted callout).
*/
window.FormulasContent = {
  title: 'Formulas & calculations',
  blurb: 'Source-of-truth catalog of every formula, threshold, multiplier, and heuristic that determines a value, trend, ranking, archetype, color, or signal on this site. 56 entries across 14 sections. Each entry shows file:line (with a deep-link to GitHub source), provenance, verbatim math, a concrete worked example, related cross-references, and analyst-relevant notes.',
  domains: [

    // ── 1. TRADE VALUES ───────────────────────────────────────────────────
    {
      id: 'trade-values',
      name: 'Trade values',
      entries: [
        {
          id: 'get-multiplier',
          label: '1. Player value — format multipliers (getMultiplier)',
          location: 'trade-calculator.html:2302',
          provenance: { kind: 'hand-tuned', detail: 'Per-format multiplier scalars chosen by the curator to mirror dynasty-community-standard format-vs-1QB-Standard PPR conversions.' },
          inputs: 'qb (\'sf\' or \'1qb\'), ppr (1 / 0.5 / 0), tep (0 / 0.5 / 0.75 / 1.0), passtd (4 / 5 / 6). All read from the visible f-* filter dropdowns via _calcQb / _calcPpr / _calcTep / _calcPasstd. Defaults: sf, 1, 0, 4.',
          math: `let m = 1.0;
if (pos === 'QB') {
  if (qb === 'sf')    m *= 1.15;     // SF gives QBs +15%
  if (passtd === 6)   m *= 1.08;     // 6pt TDs +8%
  else if (passtd === 5) m *= 1.04;  // 5pt TDs +4%
}
if (pos === 'WR') {
  if      (ppr === 1)   m *= 1.0;    // baseline
  else if (ppr === 0.5) m *= 0.96;   // half PPR -4%
  else                  m *= 0.90;   // standard -10%
}
if (pos === 'RB') {
  if      (ppr === 1)   m *= 1.04;   // full PPR +4%
  else if (ppr === 0.5) m *= 1.0;    // baseline
  else                  m *= 0.93;   // standard -7%
}
if (pos === 'TE') {
  m *= 1 + (tep * 0.12);             // TEP: +12% per full TEP unit
}
return m;`,
          output: 'Float multiplier in [0.90, 1.242]. Max = SF QB with 6pt TDs (1.15 × 1.08).',
          example: `Lamar Jackson (QB) in Superflex with 6pt pass TDs:
  m = 1.0
  m *= 1.15  (SF QB bonus)      → 1.15
  m *= 1.08  (6pt TD bonus)     → 1.242
  → multiplier = 1.242

Justin Jefferson (WR) in Standard PPR:
  m = 1.0
  m *= 0.90  (Standard PPR)     → 0.90
  → multiplier = 0.90

Travis Kelce (TE) with 1.0 TEP:
  m = 1.0
  m *= 1 + (1.0 × 0.12)         → 1.12
  → multiplier = 1.12`,
          notes: 'QB and PassTD bonuses stack multiplicatively. WR/RB/TE multipliers are mutually exclusive (each position checked separately). TEP only applies to TE. K and PK return 1.0.',
          related: ['adj-val', 'league-format-detect']
        },
        {
          id: 'adj-val',
          label: '2. Adjusted asset value (adjVal)',
          location: 'trade-calculator.html:2329',
          provenance: { kind: 'site-convention', detail: 'Composition of pick-resolution + format-multiplier logic; no chosen constants of its own.' },
          inputs: 'asset.type (pick or player), asset.value (base MVS integer), asset.pos, asset.pickKey (optional), asset.name (used to derive pickKey if missing).',
          math: `function adjVal(asset) {
  if (asset.type === 'pick') {
    let key = asset.pickKey;
    if (!key || !PICK_VALUES[key]) key = _derivePickKey(asset.name);
    if (key && PICK_VALUES[key]) {
      return Math.round(_pickNumericValue(PICK_VALUES[key]));
    }
    return Math.round(Number(asset.value) || 0);
  }
  return Math.round(asset.value * getMultiplier(asset.pos));
}`,
          output: 'Integer (rounded).',
          example: `Pick: 2026 1.02 (asset.pickKey="2026-1.02") in SF mode:
  PICK_VALUES["2026-1.02"] = { value:5268, valueSf:5268, value1qb:5511, valueTep:5268 }
  _pickNumericValue → returns valueSf = 5268
  → adjVal = 5268

Player: Justin Jefferson (asset.value=9500, WR) in Standard PPR:
  getMultiplier('WR') = 0.90
  9500 × 0.90 = 8550
  → adjVal = 8550`,
          notes: 'Picks re-resolve live through PICK_VALUES every render — flipping QB/TEP filters immediately updates pick rows. Players use the multiplier; their base asset.value is the format-default snapshot from FP_VALUES.value at add time. Handoff\'d / legacy picks without pickKey fall through to name-parsing via _derivePickKey.',
          related: ['get-multiplier', 'pick-numeric-value', 'derive-pick-key', 'trade-balance']
        },
        {
          id: 'pick-numeric-value',
          label: '3. Pick value — shape-aware extractor (_pickNumericValue)',
          location: 'trade-calculator.html:2253',
          provenance: { kind: 'site-convention', detail: 'Priority-based resolution to handle three coexisting pick record shapes from different sync scripts.' },
          inputs: 'Pick value record. Three known shapes: (1) picks.json {value, valueSf, valueTep} — value IS 1QB baseline; (2) mvs.json overlay {value, valueSf, value1qb, valueTep, label} — value is current-format default, value1qb is true 1QB, valueTep aliased to valueSf; (3) legacy flat number. Format flags via _calcQb / _calcTep.',
          math: `if (rec == null) return 0;
if (typeof rec === 'number') return rec;
if (typeof rec !== 'object') return Number(rec) || 0;
const isSf  = _calcQb() === 'sf';
const isTep = _calcTep() > 0;
if (isTep && rec.valueTep != null) return Number(rec.valueTep) || 0;
if (isSf  && rec.valueSf  != null) return Number(rec.valueSf)  || 0;
if (rec.value1qb != null) return Number(rec.value1qb) || 0;
return Number(rec.value) || 0;`,
          output: 'Numeric value. Priority: TEP wins if tep > 0 and valueTep exists → SF if SF mode → value1qb (MVS shape) → value (picks.json shape).',
          example: `PICK_VALUES["2026-1.02"] = { value:5268, valueSf:5268, value1qb:5511, valueTep:5268 }
  SF + no TEP:  isSf=true, isTep=false → valueSf = 5268
  1QB + no TEP: isSf=false, isTep=false → value1qb = 5511
  SF + 1.0 TEP: isSf=true, isTep=true   → valueTep = 5268 (aliased to valueSf for MVS picks)

PICK_VALUES["2025-1.02"] = { value:477, valueSf:523, valueTep:477 }  (picks.json shape)
  1QB: returns rec.value = 477 (the 1QB baseline; no value1qb field)
  SF:  returns rec.valueSf = 523
  TEP: returns rec.valueTep = 477 (real TEP data, slight discount because 1.02 typically is a non-TE skill pick)`,
          notes: 'MVS picks alias valueTep to valueSf because the upstream MVS source has no real TEP data for picks. In SF+TEP mode, MVS picks effectively show the SF value. Only picks.json (2025-only) has real TEP data (from FP\'s tradeValueTePremium column).',
          related: ['adj-val', 'derive-pick-key']
        },
        {
          id: 'derive-pick-key',
          label: '4. Pick key derivation (_derivePickKey)',
          location: 'trade-calculator.html:2273',
          provenance: { kind: 'site-convention', detail: 'Regex parser to normalize human pick labels into PICK_VALUES lookup keys.' },
          inputs: 'Pick label string (e.g. "2026 1.02", "2026 Pick 1.02", "2026 1st").',
          math: `let m = name.match(/^(\\d{4})\\s+(?:Pick\\s+)?(\\d+)\\.(\\d+)$/i);
if (m) return \`\${m[1]}-\${parseInt(m[2],10)}.\${String(parseInt(m[3],10)).padStart(2,'0')}\`;
m = name.match(/^(\\d{4})\\s+(\\d+)(?:st|nd|rd|th)$/i);
if (m) return \`\${m[1]}-\${parseInt(m[2],10)}\`;
return null;`,
          output: 'Canonical PICK_VALUES key (e.g. "2026-1.02" or "2026-1") or null.',
          example: `"2026 1.02"      → "2026-1.02"
"2026 Pick 1.02" → "2026-1.02"
"2026 1.1"       → "2026-1.01"   (slot padded to 2 digits)
"2027 1st"       → "2027-1"      (generic round, no slot)
"2027 1st (Early)" → null         (tier-variant labels not matched — MVS only)`,
          notes: 'Slot padded to 2 digits ("1.1" → "1.01"). No range validation — "2026 1.99" parses to "2026-1.99" and silently misses on lookup.',
          related: ['adj-val', 'pick-numeric-value', 'sync-mvs-pick-key']
        },
        {
          id: 'faab-conversion',
          label: '5. FAAB → MVS conversion (inside sideTotal)',
          location: 'trade-calculator.html:2345',
          provenance: { kind: 'hand-tuned', detail: 'Hardcoded $1 = 10 MVS heuristic; not derived from league-specific budgets.' },
          inputs: 'side.faab (integer dollars).',
          math: `function sideTotal(side) {
  return side.assets.reduce((s,a) => s + adjVal(a), 0)
       + (side.faab || 0) * 10;
}`,
          output: 'Integer (sum of asset values + FAAB × 10).',
          example: `Side A: [Lamar Jackson 10580], FAAB = $50
  asset sum = 10580
  FAAB     = 50 × 10 = 500
  sideTotal = 11080

Side B: [Justin Jefferson 9500], FAAB = $0
  asset sum = 9500
  FAAB     = 0 × 10 = 0
  sideTotal = 9500`,
          notes: 'HEURISTIC: $1 FAAB = 10 MVS units. Hardcoded constant. Not tied to league settings, not adjustable in UI. For mixed-auction leagues this ratio may not hold.',
          related: ['trade-balance', 'adj-val']
        },
        {
          id: 'trade-balance',
          label: '6. Trade balance verdict (2-way and 3-way)',
          location: 'trade-calculator.html:2444-2505',
          provenance: { kind: 'hand-tuned', detail: 'The 5% "fair trade" cutoff is a single chosen threshold; no UI config.' },
          inputs: 'totals[] = sides.map(s => sideTotal(s)). 2 or 3 sides.',
          math: `// Two-side:
const max = Math.max(t0, t1, 1);
const diff = t0 - t1;
const pctOff = max > 0 ? Math.abs(diff) / max : 0;
if (pctOff < 0.05)        verdict = '⚖ Fair Trade';                                  // fair (yellow)
else if (diff > 0)        verdict = \`▲ Side A wins (+\${Math.round(pctOff*100)}%)\`;  // win (green)
else                      verdict = \`▲ Side B wins (+\${Math.round(pctOff*100)}%)\`;  // lose (red)

// Three-side:
const sorted = totals.sort((a,b) => b.total - a.total);
const gap = sorted[0].total - sorted[1].total;
const pctOff = sorted[0].total > 0 ? gap / sorted[0].total : 0;
verdict = pctOff < 0.05 ? '⚖ Balanced' : \`▲ \${sorted[0].label} leads\`;`,
          output: 'String verdict + CSS class (fair/win/lose). Balance bars use pct = round(t.total / max * 100).',
          example: `2-way trade — Side A 10000 vs Side B 9700:
  max = 10000, diff = +300, pctOff = 300 / 10000 = 0.03 (3%)
  3% < 5% → '⚖ Fair Trade'

2-way trade — Side A 11000 vs Side B 9500:
  max = 11000, diff = +1500, pctOff = 1500 / 11000 = 0.136 (14%)
  14% > 5% → '▲ Side A wins (+14%)' (green)

3-way trade — A:10000, B:9800, C:5000:
  sorted: [A=10000, B=9800, C=5000]
  gap = 10000 - 9800 = 200, pctOff = 200 / 10000 = 0.02 (2%)
  2% < 5% → '⚖ Balanced'   (note: C is 50% behind but doesn't factor in)`,
          notes: 'FLAGGED: 2-way and 3-way use different denominators (max-of-two vs. leader-of-three). A 3-way trade where #1 and #2 are nearly equal but #3 is far behind reads "Balanced" even though one side is decisively losing. Threshold is 5%, hardcoded, no UI config.',
          related: ['adj-val', 'faab-conversion', 'inline-calc-bands']
        }
      ]
    },

    // ── 2. PLAYER SIGNALS ────────────────────────────────────────────────
    {
      id: 'player-signals',
      name: 'Player signals',
      entries: [
        {
          id: 'trade-volume-chip',
          label: '7. Trade-volume liquidity chip',
          location: 'assets/js/mvs-extras.js:106-116',
          provenance: { kind: 'hand-tuned', detail: 'Cutoffs at 200/50 trades/week chosen as visually meaningful tiers; not percentile-derived.' },
          inputs: 'rec.tradesLastWeek (integer count, format-aware via data-bootstrap overlay).',
          math: `v >= 200  → 'Hot'        / 'mvs-vol-hot'  (red bg)
v >= 50   → 'Active'     / 'mvs-vol-warm' (TE-orange bg)
v > 0     → 'Quiet'      / 'mvs-vol-cool' (surface2 bg)
v === 0   → 'No trades'  / 'mvs-vol-cold' (transparent)`,
          output: 'HTML chip with tone-coded background.',
          example: `Top dynasty asset (e.g. Bijan Robinson, ~250 trades/wk) → 'Hot' (red)
Solid starter (e.g. James Conner, ~80 trades/wk)          → 'Active' (orange)
Deep bench (e.g. backup TE, ~10 trades/wk)                → 'Quiet' (surface)
Inactive / cut / IR (~0 trades/wk)                        → 'No trades' (transparent)`,
          notes: 'Hard cutoffs at 200 and 50 trades/7-day window. No interpolation.',
          related: ['baseline-vs-market', 'sparkline']
        },
        {
          id: 'baseline-vs-market',
          label: '8. Baseline vs market delta',
          location: 'assets/js/mvs-extras.js:90-104',
          provenance: { kind: 'site-convention', detail: 'Standard percent-change formula; baseline source is computed upstream in sync-mvs.py.' },
          inputs: 'rec.value (current MVS), rec.baseline (pre-market formula baseline, computed upstream in sync-mvs.py).',
          math: `bDiff  = current - baseline;
bPct   = Math.round((bDiff / baseline) * 100);
bSign  = bDiff >= 0 ? '+' : '';
bClass = bDiff >= 0 ? 'mvs-extras-diff up' : 'mvs-extras-diff down';
// Renders: "{baseline} ({sign}{pct}% market)"`,
          output: 'Percentage (rounded integer). Green if positive (market over baseline), red if negative.',
          example: `Hyped rookie: value=8500, baseline=7800
  bDiff = +700, bPct = round(700/7800 * 100) = +9
  → "7800 (+9% market)" green   ← market price elevated above formula

Faded vet: value=4200, baseline=4900
  bDiff = -700, bPct = round(-700/4900 * 100) = -14
  → "4900 (-14% market)" red   ← market discounted vs formula`,
          notes: 'Only renders when baseline > 0 && value != null. Positive % = market hyped above baseline (potential sell). Negative % = market under baseline (potential buy).',
          related: ['trade-volume-chip', 'sparkline', 'sync-mvs-player-trend']
        },
        {
          id: 'adp-month-change',
          label: '9. ADP month-to-month comparison chip',
          location: 'assets/js/adp-comparator.js:167-182',
          provenance: { kind: 'hand-tuned', detail: 'The 0.05-spot no-change threshold is a chosen noise cutoff.' },
          inputs: 'current (current month ADP), previous (prior month ADP).',
          math: `delta = current - previous;
abs   = Math.abs(delta);
if (abs < 0.05) return '●' chip (flat, no change);
label = abs.toFixed(1);
if (delta < 0) return '▲' chip [green #66dd84]   // ADP improved (number went down)
else           return '▼' chip [red var(--red)]   // ADP slipped (number went up)`,
          output: 'Styled HTML chip with delta label + arrow + tooltip.',
          example: `Player ADP improved: current=10.8, previous=12.3
  delta = -1.5, abs = 1.5
  -1.5 < 0 → '▲ 1.5' (green) — moved up 1.5 spots

Player ADP slipped: current=14.2, previous=11.7
  delta = +2.5, abs = 2.5
  +2.5 > 0 → '▼ 2.5' (red) — fell 2.5 spots

No meaningful change: current=8.1, previous=8.12
  delta = -0.02, abs = 0.02
  0.02 < 0.05 → '●' (flat bullet)`,
          notes: 'Threshold: < 0.05 spots = noise → flat bullet. Lower ADP = better in fantasy convention. A delta of -2.5 means "moved up 2.5 spots".',
          related: ['trend-arrow']
        },
        {
          id: 'sparkline',
          label: '10. MVS sparkline (history mini-chart)',
          location: 'assets/js/mvs-extras.js:13-44',
          provenance: { kind: 'site-convention', detail: 'Standard SVG min-max scaling; no chosen thresholds.' },
          inputs: 'history array of { mvs: number } objects (typically 14 points, see sync-mvs.py HISTORY_KEEP).',
          math: `// SVG scaling:
W = 280; H = 56; PAD = 4;
minV = min(vals); maxV = max(vals); range = maxV - minV || 1;
For each value v at index i:
  x = PAD + (i / (vals.length - 1)) * (W - 2*PAD);
  y = H - PAD - ((v - minV) / range) * (H - 2*PAD);

// Stroke color:
delta  = vals[last] - vals[first];
stroke = delta > 0 ? '#66dd84' : delta < 0 ? 'var(--red)' : 'var(--white)';`,
          output: 'SVG polyline + text legend "{sign}{delta} over {days}d · now {last_value}".',
          example: `history = [5400, 5450, 5500, 5650, 5700, 5750, 5800]  (7 days, value rising)
  minV = 5400, maxV = 5800, range = 400
  delta = 5800 - 5400 = +400
  stroke = green (delta > 0)
  legend: "+400 over 7d · now 5800"`,
          notes: 'Requires ≥2 history points; otherwise renders nothing. "Days" = number of data points (each is one sync run apart, not necessarily 1 calendar day).',
          related: ['baseline-vs-market', 'trend-arrow', 'sync-mvs-player-trend']
        },
        {
          id: 'trend-arrow',
          label: '11. Trend arrow / sign convention (site-wide)',
          location: 'trade-calculator.html:1141-1146, index.html:944-949 (CSS)',
          provenance: { kind: 'site-convention', detail: 'Brand color + symbol convention for direction indicators.' },
          inputs: 'Any numeric value.',
          math: `up    / positive → #66dd84 (brand bright green) + ▲
down  / negative → var(--red)                    + ▼
flat  / zero     → #ffffff (white)               + ●`,
          output: 'CSS class .trend.up / .trend.down / .trend.flat.',
          example: `value = +50   → ▲ green   (small gain still triggers up)
value = -3    → ▼ red
value = 0     → ● white
value = null  → ● white (flat fallback)`,
          notes: 'Any non-zero value triggers direction; no magnitude threshold (except sparkline / ADP-chip which have their own cutoffs).',
          related: ['sparkline', 'adp-month-change', 'baseline-vs-market']
        }
      ]
    },

    // ── 3. AGE CURVE ─────────────────────────────────────────────────────
    {
      id: 'age-curve',
      name: 'Age curve (player panel)',
      entries: [
        {
          id: 'age-curves-per-pos',
          label: '12. Per-position age curves',
          location: 'assets/js/player-panel.js:908',
          provenance: { kind: 'hand-tuned', detail: 'Peak ages, peak values, rampUp + decayRate constants chosen by the curator to mirror dynasty-community-standard age curves; not regressed against actual value-vs-age data.' },
          inputs: 'Position code (QB/RB/WR/TE).',
          math: `const curves = {
  QB: { peak: 28, peakVal: 9000, start: 22, end: 38, rampUp: 1.8, decayRate: 0.88 },
  RB: { peak: 24, peakVal: 8500, start: 21, end: 32, rampUp: 2.5, decayRate: 0.78 },
  WR: { peak: 26, peakVal: 9000, start: 21, end: 35, rampUp: 1.6, decayRate: 0.84 },
  TE: { peak: 27, peakVal: 7500, start: 22, end: 35, rampUp: 1.4, decayRate: 0.83 },
};

function posValue(age) {
  if (age < start || age > end) return 0;
  if (age <= peak) {
    t = (age - start) / (peak - start);
    return round(peakVal * Math.pow(t, 1 / rampUp));
  } else {
    return round(peakVal * Math.pow(decayRate, age - peak));
  }
}`,
          output: 'Numeric "position-average" value at the given age.',
          example: `RB at age 28 (past peak 24):
  decay years = 28 - 24 = 4
  posValue = round(8500 × 0.78^4) = round(8500 × 0.370) = 3148

WR at age 24 (ramping toward peak 26):
  t = (24 - 21) / (26 - 21) = 0.6
  posValue = round(9000 × 0.6^(1/1.6)) = round(9000 × 0.731) = 6579

QB at age 32 (past peak 28):
  decay years = 4
  posValue = round(9000 × 0.88^4) = round(9000 × 0.600) = 5400`,
          notes: 'HEURISTIC: Constants hand-tuned, not derived from data analysis. RB decay (0.78/yr) is the steepest; QB decay (0.88/yr) gentlest. Larger rampUp exponent denominator = slower rise to peak (RB at 2.5 ramps up slowest, TE at 1.4 fastest).',
          related: ['player-value-at-age', 'buy-sell-signal']
        },
        {
          id: 'player-value-at-age',
          label: '13. Player-specific value at age (playerValue)',
          location: 'assets/js/player-panel.js:950-951',
          provenance: { kind: 'site-convention', detail: 'Vertical scaling of the position-curve to fit the player\'s current value; no chosen constants.' },
          inputs: 'playerVal (current value), playerAge, posValue function from entry 12.',
          math: `scaleFactor = (playerVal > 0 && posValue(playerAge) > 0)
  ? playerVal / posValue(playerAge)
  : 1;
playerValue(age) = Math.max(0, Math.round(posValue(age) * scaleFactor));`,
          output: 'Per-age projected value (position curve scaled vertically to fit the player\'s current value).',
          example: `Bijan Robinson — RB, current value 9500, age 24:
  posValue(24) at peak = 8500
  scaleFactor = 9500 / 8500 = 1.118 (Bijan is 11.8% above position-average)
  playerValue(28) = round(posValue(28) × 1.118)
                  = round(3148 × 1.118)
                  = 3519
  → "At age 28 (4 years out), projected value: 3519"`,
          notes: 'Scaling assumes the player follows the position-average shape but at their own elevation.',
          related: ['age-curves-per-pos', 'adp-implied-value']
        },
        {
          id: 'adp-implied-value',
          label: '14. ADP-implied value (adpToValue)',
          location: 'assets/js/player-panel.js:919-923',
          provenance: { kind: 'hand-tuned', detail: 'Max value 10000 and 0.93/slot decay chosen to roughly match dynasty rank-1 vs late-2nd value spread.' },
          inputs: 'adp (numeric rank).',
          math: `const maxVal = 10000;
return Math.round(maxVal * Math.pow(0.93, adp - 1));`,
          output: 'Implied trade value at ADP slot. Slot 1 = 10000, slot 2 ≈ 9300, slot 10 ≈ 5204, slot 50 ≈ 280.',
          example: `ADP 1.01: 10000 × 0.93^0  = 10000  (rank 1 overall)
ADP 1.05: 10000 × 0.93^4  ≈ 7481
ADP 1.10: 10000 × 0.93^9  ≈ 5204   (early 2nd round implied value)
ADP 2.05: 10000 × 0.93^16 ≈ 3245
ADP 50:   10000 × 0.93^49 ≈ 280`,
          notes: 'HEURISTIC: Max value 10000, geometric decay 0.93/slot. Hand-tuned to roughly match dynasty rank-1 vs late-2nd spread.',
          related: ['buy-sell-signal']
        },
        {
          id: 'buy-sell-signal',
          label: '15. Buy-low / Sell-high signal logic',
          location: 'assets/js/player-panel.js:984-991',
          provenance: { kind: 'hand-tuned', detail: 'The ±500 absolute-value threshold is a chosen "meaningful gap" cutoff.' },
          inputs: 'playerVal (current FC/MVS value), adpImpliedVal (from entry 14).',
          math: `gap = playerVal - adpImpliedVal;
pct = Math.round(Math.abs(gap) / Math.max(playerVal, adpImpliedVal) * 100);
if (gap > 500)   signal = '▲ Buy-low — FC value pct% above ADP cost';    color = green
else if (gap < -500) signal = '▼ Sell-high — ADP cost pct% above FC value'; color = red
else             signal = '≈ Fairly priced';                              color = yellow`,
          output: 'Buy/sell/fair signal label + color.',
          example: `Underpriced star: playerVal = 9200, adpImpliedVal = 7500 (ADP rank ~5)
  gap = +1700, pct = round(1700 / 9200 × 100) = 18
  +1700 > 500 → "▲ Buy-low — FC value 18% above ADP cost" (green)

Overhyped rookie: playerVal = 4500, adpImpliedVal = 6800 (ADP rank ~7)
  gap = -2300, pct = round(2300 / 6800 × 100) = 34
  -2300 < -500 → "▼ Sell-high — ADP cost 34% above FC value" (red)

Fairly priced: playerVal = 7100, adpImpliedVal = 7400
  gap = -300, |gap| ≤ 500 → "≈ Fairly priced" (yellow)`,
          notes: 'Thresholds: ±500 value units. Could be % of player value instead of absolute units.',
          related: ['adp-implied-value', 'age-curves-per-pos']
        }
      ]
    },

    // ── 4. PER-SEASON STATS ──────────────────────────────────────────────
    {
      id: 'per-season-stats',
      name: 'Per-season stats (player panel)',
      entries: [
        {
          id: 'stats-formulas',
          label: '16. PPG, TGT/G, YPC, YPR formulas',
          location: 'assets/js/player-panel.js:1314-1454',
          provenance: { kind: 'external-standard', detail: 'Raw stats from Sleeper API; per-game derivations are arithmetic averages.' },
          inputs: 'Sleeper API stats row per (player, season).',
          math: `PPG (all pos):  pts_ppr / gp                      → 1 decimal
TGT/G (WR):     rec_tgt / gp                      → 1 decimal
YPC (RB):       rush_yd_per_att (raw from API)    → 1 decimal
YPR (WR/TE):    rec_yd_per_rec (raw from API)     → 1 decimal
Cmp% (QB):      pass_cmp_pct * 100                → 1 decimal`,
          output: 'Per-season table rendered in the Player Stats tab.',
          example: `Lamar Jackson 2023: pts_ppr = 362.0, gp = 16
  PPG = 362.0 / 16 = 22.6

CeeDee Lamb 2023: rec_tgt = 181, gp = 17
  TGT/G = 181 / 17 = 10.6

Saquon Barkley 2023: rush_yd_per_att = 4.0 (already per-attempt)
  YPC = 4.0`,
          notes: 'Data source: Sleeper API /stats/nfl/player/{sleeperId}?season={yr}&season_type=regular&grouping=season. All other columns are raw Sleeper stat fields.',
          related: []
        }
      ]
    },

    // ── 5. TIERS PAGE ────────────────────────────────────────────────────
    {
      id: 'tiers',
      name: 'Tiers page',
      entries: [
        {
          id: 'tier-assignment',
          label: '17. Tier assignment + color spectrum',
          location: 'tiers.html:494-516 (descriptions), tiers.html:161-171 (colors)',
          provenance: { kind: 'manual-curation', detail: 'Each player is manually tagged with a tier letter by the curator in the upstream Google Sheet; no formula.' },
          inputs: 'Manual assignment via Google Sheet → sync-tiers.py → tiers.html. No formula.',
          math: `20 tier labels: S++, S+, S, A+, A, A−, B+, B, B−,
                C+, C, C−, D+, D, D−, E+, E, E−, F+, F, F−

Color spectrum (CSS class via tierBadgeClass(tier)):
  S++       → var(--red)            dynasty orange
  S+        → var(--pos-qb-bg)      brand vivid red (#e05252)
  S         → var(--yellow)         brand yellow (#f0c040)
  A+        → var(--orange)         warm orange (#e8732a)
  A / A−    → var(--pos-rb-bg)      brand green (#4caf6e)
  B+/B/B−   → var(--pos-wr-bg)      brand blue (#5b9bd5)
  C+/C/C−   → var(--pos-pick-bg)    brand lavender (#9b91d4)
  D+/D/D−   → #555                  dark gray
  E+/E/E−   → #444                  darker gray
  F+/F/F−   → #333                  darkest gray

tierBadgeClass(tier):
  return 't-' + (tier || 'S').toLowerCase()
    .replace(/\\+/g, 'p').replace(/-/g, 'm');
  // "S++" → "t-spp"; "A−" → "t-am"`,
          output: 'CSS class for the tier badge.',
          example: `Bijan Robinson tagged "S" → tierBadgeClass("S") = "t-s" → yellow badge
Drake London tagged "A-" → "t-am" → green badge at 85% opacity
Jonathan Taylor tagged "B+" → "t-bp" → blue badge
Russell Wilson tagged "F" → "t-f" → darkest-gray badge`,
          notes: 'Tiers correspond to "base 1st round picks" valuation per the curator (see TIER_DESCRIPTIONS), not auto-computed value bands.',
          related: ['bsh-chips']
        },
        {
          id: 'bsh-chips',
          label: '18. Buy / Sell / Hold chips',
          location: 'tiers.html:2728',
          provenance: { kind: 'manual-curation', detail: 'Each player is tagged with one of 5 enum values by the curator.' },
          inputs: 'Per-player tag from the tiers sheet.',
          math: `'buying'   → green                  (BUYING)
'checking' → green @ 65% opacity    (CHECKING)
'selling'  → red                    (SELLING)
'shopping' → orange                 (SHOPPING)
'hold'     → orange @ 80% opacity   (HOLD)`,
          output: 'HTML chip with color class.',
          example: `Player tagged "buying"  → green BUYING chip
Player tagged "selling" → red SELLING chip
Player with no tag      → no chip rendered`,
          notes: 'Enum-based, not threshold-driven. Source: manual curator tag.',
          related: ['tier-assignment']
        }
      ]
    },

    // ── 6. MY LEAGUES — TEAM ANALYSIS ────────────────────────────────────
    {
      id: 'team-analysis',
      name: 'My Leagues — team analysis',
      entries: [
        {
          id: 'team-value-aggregation',
          label: '19. Team value aggregation (per roster)',
          location: 'my-leagues.html:5093-5174 (mlComputeLeagueValueData)',
          provenance: { kind: 'site-convention', detail: 'Sum of FP_VALUES per skill position; no chosen weights.' },
          inputs: 'roster.players (Sleeper player IDs), FP_VALUES, ML_SEASON_PROJ.',
          math: `posVals = { QB:0, RB:0, WR:0, TE:0 };
for each player_id in roster.players:
  if (player.position in posVals):
    posVals[position] += FP_VALUES[player.full_name]?.value || 0;
total      = posVals.QB + posVals.RB + posVals.WR + posVals.TE;
avgAge     = mean(ages where age > 0);
projTotal  = sum(ML_SEASON_PROJ[pid] || 0 for each player_id);`,
          output: 'Per-team: { posVals, total, avgAge, pickValue, projTotal, isMe }.',
          example: `Team "Dynasty Kings" roster:
  Lamar Jackson (QB, value 8500)
  Bijan Robinson (RB, value 9500)
  Breece Hall (RB, value 7500)
  Justin Jefferson (WR, value 10000)
  Drake London (WR, value 8500)
  Sam LaPorta (TE, value 6500)
  ...
  posVals = { QB: 8500, RB: 17000, WR: 18500, TE: 6500 }
  total   = 50500`,
          notes: 'Skill positions only (QB/RB/WR/TE). K, IDP, picks counted separately. FP_VALUES.value reflects current format (1QB vs SF) via data-bootstrap overlay.',
          related: ['per-position-rankings', 'league-medians', 'team-archetype']
        },
        {
          id: 'per-position-rankings',
          label: '20. Per-position power rankings',
          location: 'my-leagues.html (same function)',
          provenance: { kind: 'site-convention', detail: 'Standard descending sort + 1-indexed rank.' },
          inputs: 'teams[] with posVals.',
          math: `// Per position (QB, RB, WR, TE):
sorted = teams.sort((a,b) => (b.posVals[pos] || 0) - (a.posVals[pos] || 0));
myRanks[pos] = sorted.findIndex(t => t.isMe) + 1;

// Pick rank:
sortedByPicks = teams.sort((a,b) => (b.pickValue || 0) - (a.pickValue || 0));
myRanks.PICK = sortedByPicks.findIndex(t => t.isMe) + 1;

// Grand total rank (players + picks):
sortedByGrand = teams.sort((a,b) =>
  ((b.total||0) + (b.pickValue||0)) - ((a.total||0) + (a.pickValue||0)));
myRanks.TOTAL = sortedByGrand.findIndex(t => t.isMe) + 1;`,
          output: '1-indexed rank (1 = highest).',
          example: `12-team league. My WR posVal = 18500.
  Other teams' WR totals: [22000, 20500, 18500, 17000, 15500, ...]
  Sorted desc: [22000, 20500, 18500, 18500 (mine), 17000, ...]
  My WR rank = findIndex(mine) + 1 = 3 + 1 = 4`,
          notes: 'Ties broken by JS sort stability (insertion order).',
          related: ['team-value-aggregation', 'rank-color']
        },
        {
          id: 'league-medians',
          label: '21. League medians (per metric)',
          location: 'my-leagues.html (same function)',
          provenance: { kind: 'site-convention', detail: 'Standard median computation.' },
          inputs: 'teams[] with avgAge, total, pickValue, projTotal.',
          math: `const median = arr => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a,b)=>a-b);
  const m = Math.floor(s.length/2);
  return s.length%2 ? s[m] : (s[m-1]+s[m])/2;
};

leagueAvg = {
  age:       median(teams.filter(t => t.avgAge > 0).map(t => t.avgAge)),
  value:     median(teams.map(t => t.total)),
  pickValue: median(teams.map(t => t.pickValue || 0)),
  proj:      median(teams.map(t => t.projTotal || 0).filter(v => v > 0)),
};`,
          output: 'leagueAvg object with the four medians.',
          example: `12-team league, total values sorted: [42000, 44000, 45500, 47000, 48500, 50000, 51500, 53000, 54500, 56000, 58000, 62000]
  m = floor(12/2) = 6
  median = (s[5]+s[6])/2 = (50000+51500)/2 = 50750`,
          notes: 'FLAGGED: Despite the variable name, these are MEDIANS, not means. The label "leagueAvg" is a misnomer carried from earlier code.',
          related: ['team-archetype', 'team-value-aggregation']
        },
        {
          id: 'team-archetype',
          label: '22. Team archetype classification (mlGetArchetype)',
          location: 'my-leagues.html:2937-2959',
          provenance: { kind: 'hand-tuned', detail: 'Composite weights (60/20/20), value/age thresholds (±10%, ±0.6yr), and 9-cell decision grid all chosen by the curator.' },
          inputs: 'avgAge, totalValue, pickValue, projValue, leagueAvg {age, value, pickValue, proj}.',
          math: `const valNorm  = (totalValue || 0) / (leagueAvg.value || 1);
const pickNorm = leagueAvg.pickValue
  ? ((pickValue || 0) / leagueAvg.pickValue) : 1;
const projNorm = leagueAvg.proj
  ? ((projValue || 0) / leagueAvg.proj) : 1;
const composite = 0.6 * valNorm + 0.2 * pickNorm + 0.2 * projNorm;

const valueHigh = composite > 1.10;
const valueLow  = composite < 0.90;
const ageYoung  = avgAge < leagueAvg.age - 0.6;
const ageOld    = avgAge > leagueAvg.age + 0.6;

if (valueHigh && ageYoung) return 'dynasty';
if (valueHigh)             return 'contender';
if (valueLow && ageOld)    return 'emergency';
if (valueLow && ageYoung)  return 'rebuilder';
if (valueLow)              return 'rebuilder';
if (ageYoung)              return 'rebuilder';
if (ageOld)                return 'emergency';
return 'tweener';`,
          output: 'One of: dynasty, contender, tweener, rebuilder, emergency.',
          example: `League medians: { age: 26.0, value: 50000, pickValue: 8000, proj: 1800 }

Team A: avgAge 24.5, total 55000, pickValue 9500, projTotal 1950
  valNorm  = 55000 / 50000 = 1.10
  pickNorm = 9500 / 8000   = 1.19
  projNorm = 1950 / 1800   = 1.08
  composite = 0.6×1.10 + 0.2×1.19 + 0.2×1.08 = 0.66 + 0.238 + 0.216 = 1.114
  valueHigh = 1.114 > 1.10 ✓
  ageYoung  = 24.5 < 26.0 - 0.6 = 25.4 ✓
  → 'dynasty'

Team B: avgAge 27.5, total 56000, pickValue 7000, projTotal 1950
  composite = 1.097 (just below 1.10)
  ageOld    = 27.5 > 26.0 + 0.6 ✓
  valueHigh = false, valueLow = false → falls to ageOld branch → 'emergency'`,
          notes: 'HEURISTIC: Weights 60% player value, 20% pick value, 20% projected points. Age band ±0.6 years from median. Hand-tuned. "Emergency" fires for low-value OR old-mid teams; "rebuilder" fires for low-value OR young-mid teams. Low-value teams always get "rebuilder" (the valueLow check is unconditional). Fallback "tweener" when leagueAvg missing/unhydrated.',
          related: ['team-value-aggregation', 'league-medians', 'archetype-colors', 'trade-suggestion-fit']
        },
        {
          id: 'archetype-colors',
          label: '23. Archetype color + sort order',
          location: 'my-leagues.html:3414, :3615-3631',
          provenance: { kind: 'site-convention', detail: 'Brand palette assignments per archetype; sort order chosen to prioritize trade-relevant archetypes.' },
          inputs: 'Archetype string.',
          math: `// Sort order (for player-availability listings):
const archOrder = { dynasty:0, contender:1, tweener:2, rebuilder:3, emergency:4 };

// Color map:
dynasty   → #9b91d4 (lavender) on rgba(155,145,212,.10)
contender → var(--green)       on rgba(76,175,110,.10)
tweener   → #5b9bd5 (blue)     on rgba(91,155,213,.10)
rebuilder → #e09a30 (orange)   on rgba(224,154,48,.10)
emergency → var(--red)         on rgba(237,129,12,.10)`,
          output: 'CSS class for archetype chip + sort weight.',
          example: `Player owned by: dynasty team → lavender chip, sorts first
Player owned by: emergency team → red chip, sorts last`,
          notes: 'Sort order is intentional — dynasty/contender first (you want to know who you\'re trading against first), emergency last.',
          related: ['team-archetype']
        }
      ]
    },

    // ── 7. MY LEAGUES — TRADE TOOLS ──────────────────────────────────────
    {
      id: 'trade-tools',
      name: 'My Leagues — trade tools',
      entries: [
        {
          id: 'owned-picks',
          label: '24. Owned picks aggregation (mlGetOwnedPicks)',
          location: 'my-leagues.html:3222-3272',
          provenance: { kind: 'site-convention', detail: 'Logic is standard pick-tracking; the 5-round cap is hand-tuned to skip low-value rounds.' },
          inputs: 'rosterId, tradedPicks, leagueRounds, currentSeason, completedDraftSeasons (Set).',
          math: `roundCap = Math.min(leagueRounds || 4, 5);    // max 5 rounds tracked
seasonWindow = [currentSeason, currentSeason+1, currentSeason+2, currentSeason+3];

1. Natural picks: every (season, round) the team owns by default, minus traded-away.
2. Acquired picks: tradedPicks where owner_id === rosterId.
3. Exclude any picks in completedDraftSeasons.
4. Sort by season (string), then round (numeric).`,
          output: 'Array of owned-pick objects.',
          example: `League has 4-round rookie draft, current season 2026. Roster A:
  Natural: 2026 R1, R2, R3, R4 (defaults)
  Traded away: 2026 R3 (to Roster B)
  Acquired: 2027 R2 (from Roster C)
  completedDraftSeasons: {} (no drafts done yet)
  Result: [2026 R1, 2026 R2, 2026 R4, 2027 R1, 2027 R2, 2027 R3, 2027 R4, ...]`,
          notes: 'Round cap at 5 prevents low-value 6th+ rounders from inflating pick totals.',
          related: ['pick-valuation-ml', 'team-value-aggregation']
        },
        {
          id: 'pick-valuation-ml',
          label: '25. Pick valuation — median slot (mlPickValue)',
          location: 'my-leagues.html:3207-3216',
          provenance: { kind: 'site-convention', detail: 'Median across known slot values in the round; falls back to generic round entry.' },
          inputs: 'season, round.',
          math: `const specific = Object.keys(PICK_VALUES)
  .filter(k => k.startsWith(\`\${season}-\${round}.\`));
if (specific.length) {
  specific.sort();
  return _num(PICK_VALUES[specific[Math.floor(specific.length / 2)]]);
}
return _num(PICK_VALUES[\`\${season}-\${round}\`]);

// _num: handles {value: ...} object OR flat number
const _num = v => (v && typeof v === 'object')
  ? (Number(v.value) || 0) : (Number(v) || 0);`,
          output: 'Median pick value for the round (across all known slots) with fallback to the generic round entry.',
          example: `mlPickValue(2025, 1):
  PICK_VALUES keys matching "2025-1.": ["2025-1.01", "2025-1.02", ..., "2025-1.12"]
  Sorted, median is "2025-1.06" → value 309.7
  → 309.7 (rounded)

mlPickValue(2027, 1):
  No "2027-1.XX" keys in PICK_VALUES
  Falls back to PICK_VALUES["2027-1"] (generic round entry from MVS)
  → ~3000`,
          notes: 'Median, not mean, to dampen outliers (e.g. 1.01 dominating a "round 1" pick valuation).',
          related: ['owned-picks', 'trade-suggestion-fit']
        },
        {
          id: 'trade-suggestion-fit',
          label: '26. Trade-suggestion fit score (mlPackageFit + mlGenerateTradeSuggestions)',
          location: 'my-leagues.html:3713-3836',
          provenance: { kind: 'hand-tuned', detail: 'ARCH_PREFS table, youth threshold age ≤24, ratio bounds [0.85,1.30], fitScore weights (0.55/0.35/0.10), and bucket thresholds all chosen by the curator.' },
          inputs: 'myAssets, targetValue, archetype, maxCount.',
          math: `// Archetype preferences:
const ARCH_PREFS = {
  rebuilder: { wantPicks: 1.0, wantYouth: 1.0, wantVeterans: 0.3 },
  emergency: { wantPicks: 1.0, wantYouth: 0.6, wantVeterans: 0.4 },
  tweener:   { wantPicks: 0.5, wantYouth: 0.5, wantVeterans: 0.5 },
  contender: { wantPicks: 0.3, wantYouth: 0.3, wantVeterans: 1.0 },
  dynasty:   { wantPicks: 0.5, wantYouth: 0.7, wantVeterans: 0.7 },
};

// mlPackageFit (per candidate):
for each asset a in pkg:
  w = a.value;
  if (a.type === 'pick')          score += prefs.wantPicks    * w;
  else if (a.age && a.age <= 24)  score += prefs.wantYouth    * w;
  else                            score += prefs.wantVeterans * w;
return weight > 0 ? score / weight : 0;

// Generator pool filter + ratio check:
minSize = Math.max(50, targetValue * 0.05);
pool = myAssets.filter(a => a.value >= minSize);
acceptRatio = total / targetValue;       // require 0.85 ≤ ratio ≤ 1.30

// Composite fitScore:
valueFit = 1 - Math.min(Math.abs(ratio - 1), 0.30) / 0.30;
archFit  = mlPackageFit(assets, archetype);
fewer    = 1 - (assets.length - 1) * 0.05;
fitScore = (valueFit * 0.55 + archFit * 0.35 + fewer * 0.10);

// Selection buckets (top picks per category):
1. 1-asset && ratio ∈ [0.95, 1.05] → 'FAIR VALUE — 1 ASSET'
2. 2-asset && ratio ∈ [0.95, 1.05] → 'FAIR VALUE — 2 ASSETS'
3. ratio ∈ (1.05, 1.15]            → 'SLIGHT OVERPAY'
4. 3-asset && ratio ∈ [0.95, 1.10] → 'VALUE PACKAGE — 3 ASSETS'
5. archFit ≥ 0.65 && ratio ∈ [0.92, 1.15] → 'ARCHETYPE-TILTED'
6. Remaining by fitScore           → 'ALTERNATIVE'`,
          output: 'Array of candidate trade packages with labels.',
          example: `Target: rebuilder team\'s 2026 R1 pick (value 5268)
Candidate: [Lamar Jackson age 29 (player, value 8500), my 2027 R3 pick (value 1200)]
  ratio = (8500 + 1200) / 5268 = 1.842   ← rejected, > 1.30 cap

Better candidate: [my 2026 R1 (value 4800), 2026 R3 (value 600)]
  ratio = 5400 / 5268 = 1.025   ← in [0.95, 1.05]
  archFit (rebuilder, both picks):
    score = 1.0×4800 + 1.0×600 = 5400
    weight = 5400
    archFit = 5400/5400 = 1.0
  valueFit = 1 - min(|1.025-1|, 0.30)/0.30 = 1 - 0.025/0.30 = 0.917
  fewer = 1 - (2-1)×0.05 = 0.95
  fitScore = 0.55×0.917 + 0.35×1.0 + 0.10×0.95 = 0.504 + 0.35 + 0.095 = 0.949
  bucket: '2-asset' + ratio in [0.95, 1.05] → 'FAIR VALUE — 2 ASSETS'`,
          notes: 'HEURISTIC: Weights 55% value-fit, 35% archetype-fit, 10% asset-count parsimony. Youth threshold age ≤ 24. ARCH_PREFS hand-tuned (e.g. contender weight on veterans = 1.0 but youth = 0.3 — opposite of rebuilder).',
          related: ['team-archetype', 'pick-valuation-ml', 'trade-suggester-balance']
        },
        {
          id: 'inline-calc-bands',
          label: '27. Inline trade calculator bands (mlCalc)',
          location: 'my-leagues.html:4528-4551',
          provenance: { kind: 'hand-tuned', detail: '5%/15% two-band system chosen by the curator; differs from main calc\'s single 5% cutoff.' },
          inputs: 'MLCALC.sides.A, MLCALC.sides.B (arrays of assets).',
          math: `totalA = side.A.reduce((sum, a) => sum + (a.value || 0), 0);
totalB = side.B.reduce((sum, a) => sum + (a.value || 0), 0);
diff   = totalA - totalB;
larger = Math.max(totalA, totalB) || 1;
pctOff = (Math.abs(diff) / larger) * 100;

// Verdict bands:
pctOff ≤ 5   → '✓ Fair Trade'              (fair)
pctOff ≤ 15  → '~ Slightly Unbalanced'     (unbalanced)
pctOff > 15  → '⚠ Side X overpays'         (heavy)`,
          output: 'Verdict label + class.',
          example: `Side A 5000 vs Side B 4900:
  pctOff = (100 / 5000) × 100 = 2%   → '✓ Fair Trade'

Side A 5000 vs Side B 4500:
  pctOff = (500 / 5000) × 100 = 10%  → '~ Slightly Unbalanced'

Side A 5000 vs Side B 3500:
  pctOff = (1500 / 5000) × 100 = 30% → '⚠ Side B overpays'`,
          notes: 'Distinct from the main trade-calculator\'s verdict (entry 6) — that\'s 5% only with no middle band. Inline calc has a 5%/15% two-tier system.',
          related: ['trade-balance']
        },
        {
          id: 'trade-suggester-balance',
          label: '28. Trade-suggester balance label (mltbRender)',
          location: 'my-leagues.html:4048-4067',
          provenance: { kind: 'hand-tuned', detail: '5-band system with tighter 2.5% tolerance for the suggester (vs 5% for general calc).' },
          inputs: 'targetPlayer.value, totalSent.',
          math: `ratio   = targetPlayer.value > 0 ? totalSent / targetPlayer.value : 0;
overpct = (ratio - 1) * 100;

|overpct| < 2.5      → '⚖ Even trade'                           green
0 < overpct ≤ 10     → '+pct% overpay (you give more)'          yellow
overpct > 10         → '+pct% heavy overpay'                    red
-10 ≤ overpct < 0    → '-pct% steal (you give less)'            green
overpct < -10        → '-pct% lopsided in your favor'           blue`,
          output: 'Balance label + color.',
          example: `Target value 5000. totalSent 5050:
  ratio = 1.01, overpct = +1.0%
  |+1.0| < 2.5 → '⚖ Even trade' (green)

Target 5000. totalSent 5600:
  ratio = 1.12, overpct = +12.0%
  +12 > 10 → '+12.0% heavy overpay' (red)

Target 5000. totalSent 4400:
  ratio = 0.88, overpct = -12.0%
  -12 < -10 → '-12.0% lopsided in your favor' (blue)`,
          notes: '5-band system specifically for the suggester. Tighter tolerance (2.5%) than the inline calc (5%) because suggestions should land near-fair by design.',
          related: ['trade-suggestion-fit']
        }
      ]
    },

    // ── 8. MY LEAGUES — PERFORMANCE + WAIVERS ────────────────────────────
    {
      id: 'perf-waivers',
      name: 'My Leagues — performance + waivers',
      entries: [
        {
          id: 'mpx-pct',
          label: '29. Max-points efficiency (mpxPct)',
          location: 'my-leagues.html:7196-7198',
          provenance: { kind: 'derived-from-data', detail: 'Computed from Sleeper roster.settings.fpts vs fpts_max (real points / max possible weekly).' },
          inputs: 'roster.settings.fpts + fpts_decimal, fpts_max + fpts_max_decimal.',
          math: `pf     = (settings.fpts || 0) + (settings.fpts_decimal || 0) / 100;
maxPts = (settings.fpts_max || 0) + (settings.fpts_max_decimal || 0) / 100;
mpxPct = (maxPts > 0 && pf > 0) ? Math.round((pf / maxPts) * 100) : null;

// Color bands: ≥90 green, ≥75 white, else red.`,
          output: 'Percentage (or null if no data).',
          example: `Team scored 1250.4 points; max possible 1380.5:
  mpxPct = round(1250.4 / 1380.5 × 100) = round(90.6) = 91
  91 ≥ 90 → green color   (excellent lineup decisions)

Team scored 1050.0; max possible 1380.5:
  mpxPct = round(76.1) = 76
  76 ≥ 75 → white color (decent, but room to improve)`,
          notes: 'Measures how close to optimal lineup you played (actual points / theoretical max for that week).',
          related: ['optimal-lineup']
        },
        {
          id: 'waiver-win-rate',
          label: '30. Waiver bid win rate',
          location: 'my-leagues.html:6720',
          provenance: { kind: 'derived-from-data', detail: 'won / tried from Sleeper transactions log.' },
          inputs: 'Per-user st (waiver stats) { tried, won }.',
          math: 'winPct = st.tried > 0 ? Math.round((st.won / st.tried) * 100) : 0;',
          output: 'Percentage of submitted bids that won.',
          example: `User submitted 14 bids this season, won 8:
  winPct = round(8 / 14 × 100) = round(57.1) = 57   → "57%"`,
          notes: 'Aggregates across the full season.',
          related: ['waiver-faab-avg']
        },
        {
          id: 'waiver-faab-avg',
          label: '31. Per-player waiver FAAB averages',
          location: 'my-leagues.html:3278-3305 (fetchAndCacheWaivers)',
          provenance: { kind: 'derived-from-data', detail: 'Mean FAAB bid across all winning claims for the player, from Sleeper transactions.' },
          inputs: 'Completed waiver/free_agent transactions, weeks 1..maxWeek (cap 18).',
          math: `for each completed transaction in weeks 1..maxWeek:
  if (waiver_bid is numeric):
    stats[pid].totalBid += waiver_bid;
    stats[pid].bidCount++;

avgFaab = bidCount > 0 ? Math.round(totalBid / bidCount) : null;`,
          output: 'Per-player avgFaab + claims count.',
          example: `Hot waiver target: picked up in 5 leagues for [$20, $50, $30, $15, $25]
  totalBid = 140, bidCount = 5
  avgFaab = round(140 / 5) = $28
  claims  = 5
  Display: "5 prior waiver claims · avg $28"`,
          notes: 'Free-agent (non-bid) adds count toward "claims" but not toward avgFaab.',
          related: ['waiver-win-rate']
        },
        {
          id: 'top-scoring-pos',
          label: '32. Position scoring leader',
          location: 'my-leagues.html:7188-7190',
          provenance: { kind: 'derived-from-data', detail: 'Reduce to find max-points position from per-position fpts dict.' },
          inputs: 'posScore object { QB: pts, RB: pts, ... }.',
          math: `topScoringPos = Object.entries(posScore).reduce(
  (best, [pos, pts]) => pts > best[1] ? [pos, pts] : best,
  ['—', 0]
)[0];`,
          output: 'Position code (e.g. "RB") of the highest fpts contributor.',
          example: `posScore = { QB: 360, RB: 520, WR: 480, TE: 180 }
  iter QB: best=['QB', 360]
  iter RB: 520 > 360 → best=['RB', 520]
  iter WR: 480 < 520 → best stays ['RB', 520]
  iter TE: 180 < 520 → best stays
  → 'RB'`,
          notes: 'Tiebreak: first encountered wins (Object.entries order is insertion order).',
          related: ['per-position-rankings']
        },
        {
          id: 'val-color',
          label: '33. Player-value color band (valColor)',
          location: 'my-leagues.html:6291-6293',
          provenance: { kind: 'hand-tuned', detail: 'Value thresholds 8000/5000/2000/500 chosen for visual binning; first two collapsed to same green after brand audit.' },
          inputs: 'v (player value integer).',
          math: `v > 8000 → 'var(--green)';
v > 5000 → 'var(--green)';
v > 2000 → 'var(--white)';
v > 500  → 'var(--muted)';
else     → '#555';`,
          output: 'CSS color value.',
          example: `Bijan Robinson value 9500 → green
Drake London value 6800 → green
Jaylen Warren value 3200 → white
Khalil Herbert value 850 → muted gray
Backup K value 100 → #555`,
          notes: 'First two branches both return green — cosmetic artifact of the brand-color audit (originally had a separate light-green mid-shade, collapsed to brand green in commit fca6d0e). Effectively one threshold at 2000.',
          related: ['rank-color']
        },
        {
          id: 'expo-color',
          label: '34. Pick exposure color band (expoColor)',
          location: 'my-leagues.html:5831, :5917',
          provenance: { kind: 'hand-tuned', detail: 'Exposure thresholds 50%/25% chosen for visual binning of pick-concentration heatmap.' },
          inputs: 'pct (exposure percentage).',
          math: `pct >= 50 → 'var(--green)';     // concentrated
pct >= 25 → 'var(--yellow)';    // moderate
else      → 'var(--muted)';     // rare`,
          output: 'CSS color value.',
          example: `Player picked in 60% of your leagues at this slot → green
Player picked in 30% → yellow
Player picked in 12% → muted`,
          notes: 'Drives the pick-exposure heatmap intensity.',
          related: ['owned-picks']
        },
        {
          id: 'rank-color',
          label: '35. Rank color band',
          location: 'my-leagues.html:5194-5196, :5332, :7263-7266',
          provenance: { kind: 'hand-tuned', detail: 'Top-3 always green; bottom-half always red; rest white. Top-3 is absolute, not percentile.' },
          inputs: 'rank (1-indexed), teamCount.',
          math: `rank <= 3                  → 'var(--green)';    // top tier
rank <= Math.ceil(teamCount/2) → 'var(--white)';    // median
else                           → 'var(--red)';      // bottom half`,
          output: 'CSS color value.',
          example: `12-team league:
  rank 2 → green
  rank 5 → white (5 ≤ ceil(12/2) = 6)
  rank 7 → red

8-team league:
  rank 1 → green
  rank 4 → white (4 ≤ ceil(8/2) = 4)
  rank 5 → red`,
          notes: 'Top-3 always green regardless of league size — could be percentile-based for small leagues.',
          related: ['per-position-rankings', 'val-color']
        }
      ]
    },

    // ── 9. LINEUP OPTIMIZER ──────────────────────────────────────────────
    {
      id: 'lineup-optimizer',
      name: 'Lineup optimizer',
      entries: [
        {
          id: 'optimal-lineup',
          label: '36. Optimal lineup signal + slot precedence',
          location: 'my-leagues.html:6162-6236 (_mlComputeOptimalLineup)',
          provenance: { kind: 'site-convention', detail: 'Greedy algorithm with hand-tuned slot precedence to minimize bad FLEX assignments. Slot eligibility from Sleeper standard.' },
          inputs: 'roster.players, projections (optional), FP_VALUES.',
          math: `// Signal per player:
if (projections exist) signal = projections[id];
else                   signal = FP_VALUES[name].value;

// Slot precedence (fill order):
const slotPrecedence = ['QB','RB','WR','TE','K','DEF','DL','LB','DB',
  'WRRB_FLEX','WRRB','REC_FLEX','WRTE_FLEX','FLEX','IDP_FLEX','SUPER_FLEX'];

// Slot eligibility (excerpt):
SUPER_FLEX  → QB / RB / WR / TE
FLEX        → RB / WR / TE
WRRB_FLEX   → RB / WR
REC_FLEX    → WR / TE
IDP_FLEX    → DL / LB / DB / DE / DT / CB / S / SS / FS

// Algorithm: greedy
For each slot in precedence order:
  Pick highest-signal unused eligible player.`,
          output: 'Set of player IDs that SHOULD start.',
          example: `Roster slots: 1QB, 2RB, 3WR, 1TE, 1FLEX, 1SUPER_FLEX
Players (signal in parens):
  Mahomes QB (28), Allen QB (26)
  Bijan RB (22), Saquon RB (20), Pacheco RB (14)
  Jefferson WR (24), CeeDee WR (22), Olave WR (18), Wilson WR (16)
  Kelce TE (15), Andrews TE (12)

Fill order:
  QB         → Mahomes (28)
  RB×2       → Bijan (22), Saquon (20)
  WR×3       → Jefferson, CeeDee, Olave
  TE         → Kelce (15)
  FLEX       → Andrews (12)  ← highest unused TE/RB/WR
  SUPER_FLEX → Allen (26)    ← highest unused QB/RB/WR/TE`,
          notes: 'Greedy — doesn\'t always produce the global optimum when FLEX positions could be better filled. In practice the precedence ordering minimizes regressions.',
          related: ['mpx-pct', 'league-format-detect']
        }
      ]
    },

    // ── 10. ADP HEATMAP ──────────────────────────────────────────────────
    {
      id: 'adp-heatmap',
      name: 'ADP heatmap (pick availability)',
      entries: [
        {
          id: 'cell-probability',
          label: '37. Per-cell availability probability',
          location: 'sync-adp.py:642-693 (_availability_matrix_from_picks)',
          provenance: { kind: 'derived-from-data', detail: 'Computed from Sleeper draft history (parquet) — counts drafts where the player went before this slot vs total drafts.' },
          inputs: 'Per-player picks history (from Sleeper drafts), total_drafts, team_count.',
          math: `for each (round R, slot S):
    target_pick = (R - 1) * team_count + S
    drafts_taken_before = count(pick.pick_no < target_pick for this player)
    drafts_available    = total_drafts - drafts_taken_before
    prob = drafts_available / total_drafts
    cell_value = round(prob * 100)   # percentage 0-100`,
          output: 'Per-cell percentage (0-100).',
          example: `Player X appeared in 100 drafts. At (R=1, S=10) in a 12-team league:
  target_pick = (1-1) × 12 + 10 = 10
  drafts_taken_before = 65 (Player X went pick 1-9 in 65 drafts)
  drafts_available = 100 - 65 = 35
  prob = 35 / 100 = 0.35
  cell_value = 35   → "35% chance still available at 1.10"`,
          notes: '"In what % of past drafts was player X still on the board at pick (R,S)?"',
          related: ['dropoff-per-round', 'expected-pick', 'heatmap-css-intensity']
        },
        {
          id: 'dropoff-per-round',
          label: '38. Dropoff per round',
          location: 'sync-adp.py:642-693',
          provenance: { kind: 'derived-from-data', detail: 'Per-round summary derived from the per-cell probabilities.' },
          inputs: 'Same as entry 37.',
          math: `row_available_count = sum(prob for all slots in round)
dropoff[round] = round((row_available_count / team_count) * 100)`,
          output: 'Per-round average availability percentage.',
          example: `12-team league, Player X round 1 slot probabilities:
  [95, 90, 85, 80, 75, 68, 60, 50, 42, 35, 28, 20] (slots 1-12)
  row_available_count = sum = 728
  dropoff[1] = round(728 / 12 × 100) ... wait, this formula sums probs as fractions then * 100
  Actually: row_available_count uses probs (0-1), sum = 7.28
  dropoff[1] = round(7.28 / 12 × 100) = round(60.7) = 61`,
          notes: 'Used for the per-round summary chip at the heatmap edges.',
          related: ['cell-probability']
        },
        {
          id: 'expected-pick',
          label: '39. Expected pick number',
          location: 'sync-adp.py heatmap builder',
          provenance: { kind: 'derived-from-data', detail: 'Simple mean of pick_no across all draft appearances.' },
          inputs: 'Per-player picks across drafts.',
          math: 'expectedPick = round(mean([pick.pick_no for all drafts]), 2)',
          output: 'Average pick number where this player went.',
          example: `Player X pick history: [8, 12, 5, 9, 11, 7, 10, 8, 13, 6]
  mean = 89 / 10 = 8.9
  expectedPick = 8.9
  Display: "Avg pick 8.9"`,
          notes: 'Displayed at the top of the heatmap modal.',
          related: ['cell-probability', 'sync-adp-availability-matrix']
        },
        {
          id: 'heatmap-css-intensity',
          label: '40. Heatmap CSS intensity / text contrast',
          location: 'assets/js/heatmap.js:41-127',
          provenance: { kind: 'hand-tuned', detail: '35% text-contrast switch, 8% label cutoff, 0.04 min-alpha all chosen for visual legibility; not WCAG-derived.' },
          inputs: 'v (cell percentage 0-100).',
          math: `alpha     = v === 0 ? 0.04 : Math.max(0.08, v / 100);
textColor = v >= 35 ? '#111' : 'rgba(255,255,255,.5)';
label     = v >= 8  ? v : '';
background = \`rgba(237, 129, 12, \${alpha.toFixed(2)})\`;`,
          output: 'CSS bg color + text color + label visibility per cell.',
          example: `v = 75:  alpha = 0.75 → strong orange bg; v >= 35 → dark text; v >= 8 → label "75"
v = 45:  alpha = 0.45 → med orange bg; v >= 35 → dark text; label "45"
v = 25:  alpha = 0.25 → light orange bg; v < 35 → semi-white text; label "25"
v = 5:   alpha = 0.08 → faint bg; v < 35 → semi-white text; v < 8 → no label
v = 0:   alpha = 0.04 → barely visible; no text, no label`,
          notes: 'Thresholds: 35% = text-contrast switch (dark text above, semi-white below); 8% = label visibility (numbers hidden below to reduce noise); 0% = min alpha 0.04 (still slightly visible to distinguish "no data" from "off-board").',
          related: ['cell-probability']
        }
      ]
    },

    // ── 11. RANKINGS / ANALYSTS ──────────────────────────────────────────
    {
      id: 'rankings-analysts',
      name: 'Rankings / analysts',
      entries: [
        {
          id: 'consensus-averaging',
          label: '41. Consensus rank averaging (merge_per_position)',
          location: 'sync-analysts.py:187-231',
          provenance: { kind: 'site-convention', detail: 'Arithmetic mean of available ranks; analyst ranks themselves are manual-curation from each analyst CSV.' },
          inputs: 'Per-analyst per-player rank entries.',
          math: `ranks = [r for r in entry["ranks"].values() if r is not None]
consensus = round(mean(ranks), 1) if len(ranks) > 0 else None

# Sort: by consensus ascending; unranked sink to bottom (sentinel 9999).`,
          output: 'Consensus value per player.',
          example: `Player Y, ranks from 5 analysts: { ryan:3, theo:5, john:4, andy:null, thomas:6 }
  Filter nulls: [3, 5, 4, 6]
  mean = 18 / 4 = 4.5
  consensus = round(4.5, 1) = 4.5

Player Z, ranks: { ryan:null, theo:null, ..., thomas:null }  (no ranks)
  consensus = None  → sorts to bottom (sentinel 9999)`,
          notes: 'MIN_PLAYERS_PER_SECTION = 10 per analyst per position; sync aborts if any analyst sub-min (catches CSV parsing failures).',
          related: ['pos-rank-backfill', 'heat-coloring-row']
        },
        {
          id: 'pos-rank-backfill',
          label: '42. Position-rank backfill (sync-rankings.py)',
          location: 'sync-rankings.py:128-193',
          provenance: { kind: 'site-convention', detail: 'Counter-based labeling of "QB1", "WR12" etc when CSV lacks posRank column.' },
          inputs: 'Per-player rank, position. Optionally posRank if provided.',
          math: `players.sort(by rank, asc, missing→9999)
pos_counts = {}
for each player in sorted order:
    pos_counts[pos] += 1
    if not player.posRank:
        player.posRank = f"{pos}{pos_counts[pos]}"`,
          output: 'Backfilled posRank string (e.g. "QB1", "RB12").',
          example: `Sorted by overall rank:
  1. Bijan Robinson (RB)        → pos_counts={RB:1}, posRank="RB1"
  2. Jefferson (WR)             → pos_counts={RB:1, WR:1}, posRank="WR1"
  3. CeeDee Lamb (WR)           → pos_counts={RB:1, WR:2}, posRank="WR2"
  4. Saquon Barkley (RB)        → pos_counts={RB:2, WR:2}, posRank="RB2"
  5. Lamar Jackson (QB)         → pos_counts={QB:1, RB:2, WR:2}, posRank="QB1"`,
          notes: 'Only fills if the source CSV didn\'t provide one.',
          related: ['consensus-averaging']
        },
        {
          id: 'heat-coloring-row',
          label: '43. Heat coloring per row (analyst comparison)',
          location: 'rankings.html ("By Analyst" mode)',
          provenance: { kind: 'site-convention', detail: 'Bipolar highlighting: only the extreme cells get colored, not the middle.' },
          inputs: 'Per-row ranks across N analysts.',
          math: `// For each row (player), find min and max rank across analysts:
minCell  → var(--pos-rb-bg) green tint    // best (lowest rank)
maxCell  → var(--pos-te-bg) orange tint   // worst (highest rank)
others   → neutral`,
          output: 'CSS background tint per cell.',
          example: `Player X, ranks: [Ryan=3, Theo=5, John=4, Andy=7, Thomas=4]
  min = 3 (Ryan)   → green tint
  max = 7 (Andy)   → orange tint
  others           → neutral

If multiple analysts share min/max:
  All min-tied cells get green; all max-tied cells get orange.`,
          notes: 'Bipolar highlighting — only the extremes are colored, not the middle. Solid brand colors with #111 text (per COLOR USAGE RULE in brand.css).',
          related: ['consensus-averaging']
        }
      ]
    },

    // ── 12. LEAGUE FORMAT DETECTION ──────────────────────────────────────
    {
      id: 'league-format',
      name: 'League format detection',
      entries: [
        {
          id: 'format-parse',
          label: '44. PPR / TEP / Pass-TD / Starters parsing',
          location: 'my-leagues.html:6075-6082',
          provenance: { kind: 'external-standard', detail: 'Sleeper league.scoring_settings + roster_positions fields; PPR/TEP buckets chosen by site convention.' },
          inputs: 'Sleeper league.scoring_settings + roster_positions.',
          math: `// PPR points (scoring_settings.rec):
ppr = recPts >= 0.99 ? '1.0' : recPts >= 0.49 ? '0.5' : '0.0';

// TEP points (scoring_settings.bonus_rec_te):
tep = tepPts >= 0.99 ? '1.0' :
      tepPts >= 0.74 ? '0.75' :
      tepPts >= 0.49 ? '0.5'  : '0';

// Pass TD (scoring_settings.pass_td, default 4):
passTd = Math.round(scoring_settings.pass_td || 4);

// Starters:
const benchSlots = new Set(['BN', 'TAXI', 'IR', 'RES']);
startersCount = rosterPositions.filter(s => !benchSlots.has(s)).length;

// QB slot:
qb = rosterPositions.includes('SUPER_FLEX') ? 'SF' : '1QB';`,
          output: 'League format string (e.g. "12-Team Dynasty SF Half PPR TEP").',
          example: `Sleeper league {scoring_settings:{rec:1.0, bonus_rec_te:0.5, pass_td:4}, roster_positions:['QB','RB','RB','WR','WR','TE','FLEX','SUPER_FLEX','BN','BN',...]}:
  ppr = 1.0 (>=0.99) → 'Full PPR'
  tep = 0.5 (>=0.49, <0.74) → '0.5 TEP'
  passTd = 4
  startersCount = 8 (filtered out BN)
  qb = 'SF' (SUPER_FLEX present)
  → "12-Team Dynasty SF Full PPR 0.5 TEP 4pt"`,
          notes: 'Tolerant matching — handles partial-PPR (e.g. 0.49 → Half PPR). Default 4pt pass TD if missing.',
          related: ['get-multiplier', 'optimal-lineup']
        }
      ]
    },

    // ── 13. SYNC PIPELINE ────────────────────────────────────────────────
    {
      id: 'sync-pipeline',
      name: 'Sync pipeline (data layer)',
      entries: [
        {
          id: 'sync-mvs-pick-key',
          label: '45. sync-mvs.py — pick key normalization',
          location: 'sync-mvs.py:127-141',
          provenance: { kind: 'site-convention', detail: 'Regex parser to convert CSV pick labels to canonical PICK_VALUES keys.' },
          inputs: 'CSV pick label.',
          math: `_SLOT_RE = r"^(\\d{4})\\s+(\\d+)\\.(\\d+)$"
                              # "2026 1.01" → "2026-1.01"
_ORD_RE  = r"^(\\d{4})\\s+(\\d+)(?:st|nd|rd|th)(?:\\s*\\(([^)]+)\\))?$"
                              # "2026 1st"          → "2026-1"
                              # "2026 1st (Early)"  → "2026-1-early"`,
          output: 'Canonical key for PICK_VALUES.',
          example: `"2026 1.01"        → "2026-1.01"
"2026 4.12"        → "2026-4.12"
"2027 2nd"         → "2027-2"
"2026 1st (Early)" → "2026-1-early"
"2026 1st (Late)"  → "2026-1-late"`,
          notes: 'Tier-variant labels (Early/Mid/Late) preserved as a hyphenated suffix.',
          related: ['derive-pick-key', 'sync-mvs-player-trend']
        },
        {
          id: 'sync-mvs-player-trend',
          label: '46. sync-mvs.py — player record + trend',
          location: 'sync-mvs.py:80-114 (build_player_record)',
          provenance: { kind: 'derived-from-data', detail: 'Per-player values + trend derived from MVS source CSV columns. Array trimming + validation thresholds are hand-tuned.' },
          inputs: 'MVS CSV row.',
          math: `trend    = int(round(mvs_sf  - (to_float(row["mvs_last_week_sf"])  or mvs_sf)))
trend1qb = int(round(mvs_1qb - (to_float(row["mvs_last_week_1qb"]) or mvs_1qb)))

# Array trimming constants:
HISTORY_KEEP = 14   # sparkline data points (≈2 weeks)
TRADES_KEEP  = 3    # recent trades shown in modal

# Validation thresholds (refuse to write if below):
MIN_ACTIVE_PLAYERS = 300
MIN_PICK_ROWS      = 30

# Inactive filter: skip rows where both mvs_sf == 0 AND mvs_1qb == 0.`,
          output: 'Per-player record written to data/mvs.json.',
          example: `Player X row: mvs_sf=5400, mvs_last_week_sf=5200, mvs_1qb=4900, mvs_last_week_1qb=5000
  trend    = round(5400 - 5200) = +200    (rose 200 in SF)
  trend1qb = round(4900 - 5000) = -100    (fell 100 in 1QB)

Player Y: mvs_sf=0, mvs_1qb=0 → SKIPPED (inactive)`,
          notes: 'Trend convention: positive = riser (value moved up since last week).',
          related: ['sync-mvs-pick-key', 'baseline-vs-market', 'sparkline']
        },
        {
          id: 'sync-fp-rank-to-value',
          label: '47. sync-fp.py — rank-to-value map',
          location: 'sync-fp.py:210-234 (build_values_from_trade_value)',
          provenance: { kind: 'external-standard', detail: 'FP API ships pre-computed value triples per (rank | pick_label).' },
          inputs: 'FP\'s trade-value rankings API response.',
          math: `For each row:
  triple = {value, valueSf, valueTep} from FP fields
  if rank is pure integer → player: rank_to_value[int] = triple
  if rank matches "YYYY R.SS" → pick: pick_to_value["YYYY-R.SS"] = triple`,
          output: 'rank_to_value (players) + pick_to_value (picks).',
          example: `FP API row: {rank:"1", tradeValue:1234, tradeValueSuperflex:1300, tradeValueTePremium:1200}
  triple = {value:1234, valueSf:1300, valueTep:1200}
  rank "1" is integer → rank_to_value[1] = triple

FP row: {rank:"2025 1.01", tradeValue:707, tradeValueSuperflex:716, tradeValueTePremium:698}
  rank matches pick pattern → pick_to_value["2025-1.01"] = {value:707, valueSf:716, valueTep:698}`,
          notes: 'FP API only ships 2025 picks currently. 2026-2028 come via sync-mvs.py overlay.',
          related: ['pick-numeric-value']
        },
        {
          id: 'sync-fp-age-ppg-trend',
          label: '48. sync-fp.py — age, PPG, 30-day trend',
          location: 'sync-fp.py:279-291 (_age_from_birthdate), :294-300 (_ppg), :440-463 (trend)',
          provenance: { kind: 'derived-from-data', detail: 'Age from Sleeper birthdate; PPG from Sleeper stats; trend from FP rank history snapshots.' },
          inputs: 'Sleeper birthdate, stats row, FP rank history.',
          math: `# Age:
days = (today - birth_date).days
return round(days / 365.25, 1)

# PPG:
pts = stats.get("pts_ppr") or stats.get("pts_half_ppr") or stats.get("pts_std") or 0
return round(pts / gp, 1) if (gp and pts) else None

# 30-day trend:
TREND_WINDOW_DAYS = 30
target_date = today - timedelta(days=30)
baseline_rank = snapshots[closest_date]['name']
trend = baseline_rank - current_rank   # positive = moved up

# History pruning:
MAX_HISTORY_DAYS = 90`,
          output: 'Per-player age (decimal), PPG, trend (rank delta).',
          example: `Born 1998-06-22, today 2026-05-17:
  days = 10186
  age = round(10186 / 365.25, 1) = 27.9

PPG: stats {pts_ppr: 280.4, gp: 16}:
  PPG = round(280.4 / 16, 1) = 17.5

Trend: today 2026-05-17, 30 days ago = 2026-04-17
  closest snapshot 2026-04-15: this player was rank 12
  current rank: 8
  trend = 12 - 8 = +4 (moved up 4 spots)`,
          notes: 'PPG prefers full-PPR, falls back to half-PPR, then standard. Trend baseline finds the closest snapshot to 30 days ago.',
          related: ['sparkline']
        },
        {
          id: 'sync-fp-articles',
          label: '49. sync-fp.py — article attachment',
          location: 'sync-fp.py:366-422',
          provenance: { kind: 'hand-tuned', detail: '2-mention threshold chosen to prevent single-mention vet comps from attaching to the wrong player.' },
          inputs: 'Article title, body, candidate player names.',
          math: `BODY_MENTION_MIN = 2

# Attach if:
#   - player name in article title (always attach)
#   - player name appears >= 2 times in body (word-boundary regex)`,
          output: 'data/articles.json with per-player article lists.',
          example: `Article title: "Justin Jefferson trade rumors swirl"
  → Always attach to Jefferson

Article body mentions "DeAndre Hopkins" 3 times (not in title):
  3 >= 2 → attach to Hopkins

Article body mentions "Russell Wilson" 1 time (vet comp):
  1 < 2 → DO NOT attach (avoids false positive)`,
          notes: '2-mention threshold prevents single-mention vet comps from attaching to the wrong player.',
          related: []
        },
        {
          id: 'sync-adp-classifier',
          label: '50. sync-adp.py — draft classifier (picks/rookies/simple)',
          location: 'sync-adp.py:303-364 (classify_startup_drafts)',
          provenance: { kind: 'hand-tuned', detail: 'Bucket heuristics based on draft fingerprints (K-in-early-rounds = picks bucket; rookie-class presence = rookies bucket).' },
          inputs: 'Sleeper draft catalog + picks dataframes.',
          math: `# Priority (first match wins):
1. Picks bucket: any K in rounds 1..RDP_EARLY_ROUNDS
   (fingerprint for picks-as-K drafts)
2. Rookies bucket: any incoming-class rookie (yearsExp == season_offset)
3. Simple bucket: neither (vets-only)

# Rookie detection:
_target_yexp = max(0, current_season - season)
# 2026 current, 2024 season → target_yexp = 2
# Player with yearsExp == 2 in 2026 was a rookie in 2024`,
          output: 'Per-draft bucket label (picks / rookies / simple).',
          example: `Draft from 2026 season: contains K in round 1 → 'picks' bucket
Draft from 2025 season: contains player with yearsExp==1 in 2026 → 'rookies' bucket
Draft from 2024 season: vets only, no Ks in early rounds → 'simple' bucket`,
          notes: 'Used downstream to decide which heatmap (RDP vs real-player) the draft contributes to.',
          related: ['sync-adp-k-relabel', 'sync-adp-availability-matrix']
        },
        {
          id: 'sync-adp-k-relabel',
          label: '51. sync-adp.py — K → ROOKIE_PICK relabel',
          location: 'sync-adp.py:367-445 (relabel_picks_K_to_rdp)',
          provenance: { kind: 'site-convention', detail: 'Sequential rewrite of K player_ids in picks-bucket drafts to ROOKIE_PICK placeholders.' },
          inputs: 'Picks-bucket drafts.',
          math: `# Within each draft, sort K-position rows by pick_no asc, cumcount 0-indexed:
rp_round = (seq // st_teams) + 1
rp_pir   = (seq % st_teams) + 1
new_id   = f"ROOKIE_PICK_{rp_round}.{str(rp_pir).zfill(2)}"`,
          output: 'Rewritten player_id ROOKIE_PICK_X.YY for each K in a picks-bucket draft.',
          example: `12-team picks-bucket draft, K position rows by pick_no:
  seq=0 (1st K)  → rp_round=1, rp_pir=1  → ROOKIE_PICK_1.01
  seq=1 (2nd K)  → rp_round=1, rp_pir=2  → ROOKIE_PICK_1.02
  ...
  seq=11 (12th K) → rp_round=1, rp_pir=12 → ROOKIE_PICK_1.12
  seq=12 (13th K) → rp_round=2, rp_pir=1  → ROOKIE_PICK_2.01`,
          notes: 'These IDs then feed a separate RDP-only heatmap.',
          related: ['sync-adp-classifier']
        },
        {
          id: 'sync-adp-weighted-adp',
          label: '52. sync-adp.py — weighted ADP aggregation',
          location: 'sync-adp.py:174-294 (build_adp)',
          provenance: { kind: 'site-convention', detail: 'Weighted mean by pick count; top-N + min-drafts filters hand-tuned.' },
          inputs: 'Per-player per-month draft picks.',
          math: `weighted_adp = adp * picks
aggregated   = sum(weighted_adp) / sum(picks)

# Top-N + min-drafts filter:
top_n = 300        # most-drafted players
min_drafts = 5     # per player min`,
          output: 'data/adp.json aggregated per (month, view_key, player_id).',
          example: `Player X draft appearances across 3 sources:
  (adp=5, picks=20), (adp=6, picks=30), (adp=4, picks=10)
  weighted_adp = 5×20 + 6×30 + 4×10 = 100 + 180 + 40 = 320
  sum(picks)   = 60
  aggregated   = 320 / 60 = 5.33`,
          notes: 'Heavier-weighted by # of drafts; a player with 50 picks gets 5× the weight of a player with 10.',
          related: ['sync-adp-availability-matrix']
        },
        {
          id: 'sync-adp-availability-matrix',
          label: '53. sync-adp.py — pick availability matrix',
          location: 'sync-adp.py:642-693',
          provenance: { kind: 'derived-from-data', detail: 'Heatmap matrix derived from per-cell availability probabilities (entry 37).' },
          inputs: 'Filtered picks + draft catalog.',
          math: `HEATMAP_MAX_ROUNDS = 14   # real heatmap depth
Rookie heatmap = 6 rounds  # max for RDP
top_n = 300                # for real-player heatmap
min_drafts = 5             # min appearance count for inclusion`,
          output: 'Matrix written to data/pick-availability.json.',
          example: `Player X (in top 300, appeared in 50+ drafts):
  Matrix 14×12 (14 rounds × 12 slots) of cell probabilities (0-100)
  Per-round dropoff[1..14] summary stats
  expectedPick number
  All written to PICK_AVAILABILITY[sleeperId]`,
          notes: 'See entries 37-39 for the underlying probability formula.',
          related: ['cell-probability', 'sync-adp-weighted-adp']
        },
        {
          id: 'name-normalization',
          label: '54. Name normalization (cross-source joining)',
          location: 'sync-fp.py:152-160, sync-analysts.py:90-103, site-wide JS normalizePlayerName',
          provenance: { kind: 'site-convention', detail: 'Standard NFKD + ASCII + suffix-strip approach to handle name variation across data sources.' },
          inputs: 'Player name string.',
          math: `s = NFKD(name)            # unicode decomposition
s = ASCII-encode-ignore   # drop accents
s = lowercase
s = strip "jr|sr|ii|iii|iv|v" (with optional dots)
s = keep only alphanumeric`,
          output: 'Normalized key (e.g. "Ja\'Marr Chase Jr." → "jamarrchase").',
          example: `"Ja'Marr Chase Jr." → "jamarrchase"
"Marvin Harrison Jr"  → "marvinharrison"
"DeAndre Hopkins"     → "deandrehopkins"
"Patrick Mahomes II"  → "patrickmahomes"
"José Cuervo"         → "josecuervo"`,
          notes: 'Used to join FP rankings ↔ Sleeper players ↔ MVS CSV ↔ analyst CSVs across all data sources.',
          related: []
        }
      ]
    },

    // ── 14. GLOSSARY: MAGIC NUMBERS ──────────────────────────────────────
    {
      id: 'magic-numbers',
      name: 'Magic-numbers glossary',
      entries: [
        {
          id: 'mn-format-multipliers',
          label: '55a. Format multipliers (trade calc)',
          location: 'trade-calculator.html:2302+',
          provenance: { kind: 'hand-tuned', detail: 'See entry 1.' },
          inputs: '—',
          math: `1.15           SF bonus on QBs (trade-calc:2309)
1.08           6pt-TD QB bonus (:2310)
1.04           5pt-TD QB bonus (:2311)
1.0/0.96/0.90  WR full / half / std PPR (:2314-16)
1.04/1.0/0.93  RB full / half / std PPR (:2319-21)
0.12           TE TEP per-unit multiplier (:2324)`,
          output: '—',
          notes: '—',
          related: ['get-multiplier']
        },
        {
          id: 'mn-trade-balance',
          label: '55b. Trade balance thresholds',
          location: 'trade-calc + my-leagues',
          provenance: { kind: 'hand-tuned', detail: 'See entries 6, 27, 28.' },
          inputs: '—',
          math: `0.05 (5%)     "Fair Trade" cutoff (trade-calc:2478, 2498)
5%            "Fair" cutoff (my-leagues inline calc:4542)
15%           "Slightly Unbalanced" cutoff (my-leagues:4545)
10            FAAB → MVS ratio ($1 = 10 MVS) (trade-calc:2346)
2.5%          "Even trade" tolerance (suggester) (my-leagues:4052)
10%           Mild overpay cutoff (suggester) (my-leagues:4055)`,
          output: '—',
          notes: '—',
          related: ['trade-balance', 'inline-calc-bands', 'trade-suggester-balance', 'faab-conversion']
        },
        {
          id: 'mn-volume-liquidity',
          label: '55c. Volume / liquidity thresholds',
          location: 'mvs-extras.js + my-leagues',
          provenance: { kind: 'hand-tuned', detail: 'See entries 7, 33, 34, 29, 40.' },
          inputs: '—',
          math: `200           "Hot" volume (trades/week) (mvs-extras:108)
50            "Active" volume (mvs-extras:108)
8000/5000/2000/500  valColor thresholds (my-leagues:6292)
50% / 25%     expoColor thresholds (my-leagues:5831)
90% / 75%     mpxPct color bands (my-leagues:7254)
35% / 8%      Heatmap text-contrast / label-visibility (heatmap.js)`,
          output: '—',
          notes: '—',
          related: ['trade-volume-chip', 'val-color', 'expo-color', 'mpx-pct', 'heatmap-css-intensity']
        },
        {
          id: 'mn-trends-signals',
          label: '55d. Trends / signals thresholds',
          location: 'adp-comparator + player-panel',
          provenance: { kind: 'hand-tuned', detail: 'See entries 9, 15.' },
          inputs: '—',
          math: `0.05 spots   ADP-chip no-change cutoff (adp-comparator:172)
±500 units   Buy-low / Sell-high signal threshold (player-panel:984)`,
          output: '—',
          notes: '—',
          related: ['adp-month-change', 'buy-sell-signal']
        },
        {
          id: 'mn-age-curves',
          label: '55e. Age curves (player panel)',
          location: 'player-panel.js:908',
          provenance: { kind: 'hand-tuned', detail: 'See entry 12.' },
          inputs: '—',
          math: `Per position (peak age / peak value / rampUp exp / decay rate):
QB: 28 / 9000 / 1.8 / 0.88
RB: 24 / 8500 / 2.5 / 0.78
WR: 26 / 9000 / 1.6 / 0.84
TE: 27 / 7500 / 1.4 / 0.83

ADP-implied value: maxVal = 10000, decay 0.93/slot.`,
          output: '—',
          notes: 'See entry 12 for usage.',
          related: ['age-curves-per-pos', 'adp-implied-value']
        },
        {
          id: 'mn-archetype-scoring',
          label: '55f. Archetype scoring (my-leagues)',
          location: 'my-leagues.html:2937+',
          provenance: { kind: 'hand-tuned', detail: 'See entry 22.' },
          inputs: '—',
          math: `0.6 / 0.2 / 0.2   Composite weights: value / picks / projections (:2942)
> 1.10            "valueHigh" cutoff (:2944)
< 0.90            "valueLow" cutoff (:2945)
± 0.6 yrs         Age band vs league median (:2946-47)`,
          output: '—',
          notes: 'See entry 22 for full decision grid.',
          related: ['team-archetype']
        },
        {
          id: 'mn-suggester',
          label: '55g. Trade-suggester scoring',
          location: 'my-leagues.html:3713+',
          provenance: { kind: 'hand-tuned', detail: 'See entry 26.' },
          inputs: '—',
          math: `≤ 24                Youth age cutoff (:3722)
0.85, 1.30          Acceptable ratio range (:3758)
0.95, 1.05          "Fair Value" ratio range (:3814-15)
0.55 / 0.35 / 0.10  fitScore: valueFit / archFit / fewer weights (:3796)
0.30                Value-fit cap (max ratio diff before flat penalty) (:3793)
0.65                Archetype-tilted bucket threshold (:3818)`,
          output: '—',
          notes: 'See entry 26 for full algorithm.',
          related: ['trade-suggestion-fit']
        },
        {
          id: 'mn-sync-pipeline',
          label: '55h. Sync / pipeline thresholds',
          location: 'sync-*.py',
          provenance: { kind: 'hand-tuned', detail: 'Sync-script constants chosen by author for validation + retention + sanity checks.' },
          inputs: '—',
          math: `HISTORY_KEEP = 14            MVS sparkline points (sync-mvs)
TRADES_KEEP = 3              Recent trades per player (sync-mvs)
MIN_ACTIVE_PLAYERS = 300     Min for valid sync (sync-mvs)
MIN_PICK_ROWS = 30           Min for valid sync (sync-mvs)
TREND_WINDOW_DAYS = 30       Trend baseline window (sync-fp)
MAX_HISTORY_DAYS = 90        Snapshot retention (sync-fp)
BODY_MENTION_MIN = 2         Article attach threshold (sync-fp)
top_n = 300, min_drafts = 5  Heatmap inclusion (sync-adp)
HEATMAP_MAX_ROUNDS = 14      Real heatmap depth (sync-adp)
Rookie heatmap = 6 rounds    RDP heatmap depth (sync-adp)
MIN_PLAYERS_PER_SECTION = 10 Per analyst per position (sync-analysts)`,
          output: '—',
          notes: '—',
          related: ['sync-mvs-player-trend', 'sync-fp-age-ppg-trend', 'sync-fp-articles', 'sync-adp-availability-matrix', 'consensus-averaging']
        }
      ]
    },

    // ── 15. OPEN HEURISTICS ──────────────────────────────────────────────
    {
      id: 'open-heuristics',
      name: 'Open heuristics (flagged for analyst review)',
      entries: [
        {
          id: 'heur-1-faab',
          label: '56-1. FAAB → MVS ratio (× 10)',
          location: 'trade-calculator.html:2346',
          provenance: { kind: 'hand-tuned', detail: 'Hardcoded constant; no league-format sensitivity.' },
          inputs: '—',
          math: 'side.faab * 10',
          output: '—',
          whyThisNumber: 'The 10:1 ratio approximates the dynasty community heuristic that $1 of FAAB ≈ 10 mid-range trade-value units (e.g. $100 FAAB ≈ 1000, which is around a late-3rd / early-4th rookie pick). In auction leagues or shallow leagues this ratio breaks down. Analyst input requested: should this scale with league depth (starter count) or FAAB budget?',
          notes: 'In mixed-auction leagues this ratio may not hold.',
          related: ['faab-conversion']
        },
        {
          id: 'heur-2-age-curves',
          label: '56-2. Age curve constants per position',
          location: 'assets/js/player-panel.js:908',
          provenance: { kind: 'hand-tuned', detail: 'Peak ages, peakVals, rampUp/decay constants per position.' },
          inputs: '—',
          math: 'See entry 12.',
          output: '—',
          whyThisNumber: 'Peak ages roughly match community-cited positional aging research (RB peak earliest at 24, TE latest at 27). Decay rates are hand-tuned to match observed "the cliff" patterns (RB decay 0.78/yr = ~22% drop per year past peak; QB decay 0.88/yr = ~12% drop). PeakVals are intentionally close (~8500-9000) so a "max-tier WR" and "max-tier QB" feel comparable. Analyst input requested: regression against actual dynasty value-vs-age data could refine these constants.',
          notes: 'Not regressed against actual dynasty value-vs-age data.',
          related: ['age-curves-per-pos']
        },
        {
          id: 'heur-3-adp-decay',
          label: '56-3. ADP-implied value decay (0.93/pick)',
          location: 'assets/js/player-panel.js:919-923',
          provenance: { kind: 'hand-tuned', detail: 'Geometric decay factor.' },
          inputs: '—',
          math: 'maxVal × 0.93^(adp - 1)',
          output: '—',
          whyThisNumber: 'The 0.93 decay produces values that roughly halve every 10 picks (0.93^10 ≈ 0.48). Slot 1 = 10000, slot 11 ≈ 4840, slot 21 ≈ 2342 — feels right against dynasty rank-1 vs late-2nd vs early-4th valuations. Analyst input requested: validate decay shape against real ADP-vs-value scatter; could be power-law instead of exponential.',
          notes: 'Slot 50 gets 2.8% of max.',
          related: ['adp-implied-value']
        },
        {
          id: 'heur-4-buy-sell',
          label: '56-4. Buy-low / sell-high threshold (±500)',
          location: 'assets/js/player-panel.js:984',
          provenance: { kind: 'hand-tuned', detail: 'Absolute value-units threshold.' },
          inputs: '—',
          math: 'gap > 500 / gap < -500',
          output: '—',
          whyThisNumber: '±500 represents a "meaningful gap" — roughly 5-7% of a mid-range dynasty asset value. Below that the FC/ADP delta is plausibly noise. Analyst input requested: percentage-based threshold (e.g. ±10%) would scale better — at very high values (10000) the current 500 threshold is only 5%, but at low values (2000) it\'s 25%. The asymmetry probably under-fires for stars and over-fires for depth pieces.',
          notes: 'Absolute units; could be % of player value instead.',
          related: ['buy-sell-signal']
        },
        {
          id: 'heur-5-archetype-weights',
          label: '56-5. Composite archetype weights (0.6 / 0.2 / 0.2)',
          location: 'my-leagues.html:2942',
          provenance: { kind: 'hand-tuned', detail: 'Linear combination of three normalized signals.' },
          inputs: '—',
          math: 'composite = 0.6*valNorm + 0.2*pickNorm + 0.2*projNorm',
          output: '—',
          whyThisNumber: 'Player value gets 3× weight because skill-position rosters are the dominant indicator of dynasty league strength (vs picks which are future-tense and projections which are short-tense). 20/20 split between picks and projections reflects them being roughly equally informative for "where this team is right now" (picks lean future, projections lean current). Analyst input requested: sensitivity analysis — does shifting to 0.5/0.3/0.2 or 0.7/0.15/0.15 change archetype assignments meaningfully?',
          notes: 'Player value gets 3× weight of picks.',
          related: ['team-archetype']
        },
        {
          id: 'heur-6-archetype-bands',
          label: '56-6. Archetype value/age cutoffs (±10% value, ±0.6yr age)',
          location: 'my-leagues.html:2944-47',
          provenance: { kind: 'hand-tuned', detail: 'Symmetric value bands; tight age band.' },
          inputs: '—',
          math: 'valueHigh = composite > 1.10; valueLow = composite < 0.90; ageBand = ±0.6yr',
          output: '—',
          whyThisNumber: '±10% composite value creates 3 buckets (low / mid / high) that roughly correspond to bottom-3 / middle-6 / top-3 in a 12-team league. ±0.6yr age band is intentionally narrow to catch real youth/age skews (the median league age band is typically ~3 years total, so ±0.6 = ~40% of the spread). Analyst input requested: border teams (1.09 → tweener, 1.11 → contender) flip on small changes. Should there be a "soft border" treatment or a wider band?',
          notes: 'Border teams flip archetype on small changes.',
          related: ['team-archetype']
        },
        {
          id: 'heur-7-suggester-weights',
          label: '56-7. Trade-suggester weights (0.55 / 0.35 / 0.10)',
          location: 'my-leagues.html:3796',
          provenance: { kind: 'hand-tuned', detail: 'Three-way linear combination.' },
          inputs: '—',
          math: 'fitScore = 0.55*valueFit + 0.35*archFit + 0.10*fewer',
          output: '—',
          whyThisNumber: 'Value-fit dominates because a trade that\'s far from par is broken regardless of archetype alignment. Archetype-fit is secondary (35%) because a fair trade that doesn\'t match the target\'s preferences is unlikely to get accepted. The 10% "fewer assets" weight is a mild penalty for multi-asset packages — keeps the simpler offer ranking higher when scores are otherwise close. Analyst input requested: are the weights right? Suggester-acceptance data (which suggestions actually got traded) would refine these.',
          notes: 'valueFit dominates; "fewer assets" gets only 10%.',
          related: ['trade-suggestion-fit']
        },
        {
          id: 'heur-8-volume',
          label: '56-8. Trade volume cutoffs (200 / 50)',
          location: 'assets/js/mvs-extras.js:108',
          provenance: { kind: 'hand-tuned', detail: 'Hard cutoffs in trades-per-week count.' },
          inputs: '—',
          math: 'See entry 7.',
          output: '—',
          whyThisNumber: '200 trades/week is roughly top-decile activity across the MVS player universe (~150-200 active players). 50/week is roughly median for the top half of skill-position players. Both are absolute counts, not percentiles. Analyst input requested: should these be percentile-derived from the current week\'s distribution to self-calibrate as the platform user count changes?',
          notes: 'League-context-agnostic; could be percentile-based across the player pool.',
          related: ['trade-volume-chip']
        },
        {
          id: 'heur-9-heatmap-contrast',
          label: '56-9. Heatmap text-contrast at 35%',
          location: 'assets/js/heatmap.js',
          provenance: { kind: 'hand-tuned', detail: 'Single-threshold text-color switch.' },
          inputs: '—',
          math: 'textColor = v >= 35 ? "#111" : "rgba(255,255,255,.5)"',
          output: '—',
          whyThisNumber: 'At ~35% alpha on the brand orange (rgb 237,129,12), the bg becomes "dark enough" that #111 text is more readable than semi-white. Below 35% the bg is faint enough that semi-white reads better on the parent surface. Picked by eye. Analyst input requested: verify against WCAG AA contrast ratio. The 35% threshold could be derived from the actual bg luminance vs both text colors.',
          notes: 'Could be derived from WCAG contrast ratio against the actual bg alpha.',
          related: ['heatmap-css-intensity']
        },
        {
          id: 'heur-10-mvs-zero-fp-fallback',
          label: '56-10. MVS overlay zeros out FP players not in MVS',
          location: 'assets/js/data-bootstrap.js:191-194',
          provenance: { kind: 'site-convention', detail: 'Wholesale replacement strategy.' },
          inputs: '—',
          math: `Object.values(FP).forEach(rec => {
  if (overlaid.has(rec)) return;
  rec.value = 0; rec.valueSf = 0; rec.value1qb = 0;
});`,
          output: '—',
          whyThisNumber: 'Intentional. Players in data/values.json without a matching MVS record are most likely inactive / cut / suspended — keeping the stale FP value would mislead users (e.g. showing a 5000-value chip on a player who hasn\'t played in 6 months). Zeroing makes them obviously "no current market" in any value display.',
          notes: 'Intentional but means stale value-only players show 0 across the calc, not the FP fallback.',
          related: []
        },
        {
          id: 'heur-11-3way-balance',
          label: '56-11. 3-way trade balance uses different denominator',
          location: 'trade-calculator.html:2497',
          provenance: { kind: 'unknown', detail: 'Code asymmetry; no comment in source explaining the choice.' },
          inputs: '—',
          math: '2-way: pctOff = abs / max(t0,t1); 3-way: pctOff = gap / sorted[0].total',
          output: '—',
          whyThisNumber: 'Likely an oversight from when 3-way support was added — code re-used the leader-relative pattern instead of generalizing the max-relative pattern. 3-way trades are rare in the calc usage data so the bug rarely surfaces. Analyst input not really needed; this is a code-correctness flag, not a math-validity flag.',
          notes: 'Edge-case divergence — see entry 6.',
          related: ['trade-balance']
        },
        {
          id: 'heur-12-mvs-tep-alias',
          label: '56-12. MVS valueTep aliased to valueSf (no real TEP)',
          location: 'assets/js/data-bootstrap.js:203',
          provenance: { kind: 'site-convention', detail: 'Documented in source comment.' },
          inputs: '—',
          math: 'valueTep: rec.valueSf  // alias',
          output: '—',
          whyThisNumber: 'The upstream MVS CSV (player_market_mvs.csv) only ships value_sf and value_1qb columns for picks — no TEP variant. Aliasing valueTep to valueSf means: in SF+TEP mode, an MVS pick shows the SF value (the closer of the two available numbers). The picks.json (FP API, 2025-only) DOES have real TEP data; for 2026-2028 picks coming via MVS, we don\'t have it.',
          notes: 'Real TEP exists for picks.json (2025-only).',
          related: ['pick-numeric-value']
        },
        {
          id: 'heur-13-misnamed-avg',
          label: '56-13. `leagueAvg` is a median, not a mean',
          location: 'my-leagues.html:5093-5174',
          provenance: { kind: 'unknown', detail: 'Naming inherited from older code that used means before refactor.' },
          inputs: '—',
          math: 'See entry 21.',
          output: '—',
          whyThisNumber: 'Earlier code used means; later refactored to medians (more robust to outliers in 12-team leagues where 1 standout team can skew the mean). The variable name didn\'t get updated. Pure naming bug, no math impact. Worth noting to analysts so they don\'t assume mean when reading the code.',
          notes: 'Misleading variable name.',
          related: ['league-medians']
        },
        {
          id: 'heur-14-val-color-collapse',
          label: '56-14. valColor has duplicate green branches',
          location: 'my-leagues.html:6292',
          provenance: { kind: 'site-convention', detail: 'Cosmetic collapse from brand-color audit.' },
          inputs: '—',
          math: 'v > 8000 → green; v > 5000 → green;  // duplicate branches',
          output: '—',
          whyThisNumber: 'Originally `v > 8000 → bright-green` and `v > 5000 → light-green-mid-shade`. The brand-color audit (commit fca6d0e) collapsed the mid-shade to brand green for palette consistency. The duplicate branches were left in case the design wants to differentiate again later. Effectively one threshold at v > 2000 (everything above is green).',
          notes: 'Cosmetic artifact of the brand-color audit (originally had a separate light-green mid-shade, collapsed to brand green in commit fca6d0e). Effectively one threshold at 2000.',
          related: ['val-color']
        }
      ]
    }

  ]
};
