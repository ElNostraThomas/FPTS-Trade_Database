# FPTS Trade Database — Formula & Calculation Inventory

> Source-of-truth catalog of every formula, threshold, multiplier, and heuristic that
> determines a value, trend, ranking, archetype, color, or signal anywhere on the site.
> Built for hand-off to data analysts. Every entry includes file:line, verbatim math,
> and any magic-number context that's not obvious from the code.
>
> **Last full audit:** 2026-05-17 (post commit `e456540`)
> **Format:** each entry has `Inputs`, `Math` (verbatim from source), `Output`, `Notes`.
> When the code has a known heuristic or unexplained constant, it's called out in `Notes`.

---

## Table of contents

**Trade values**
1. [Player value — format multipliers (`getMultiplier`)](#1-player-value--format-multipliers)
2. [Adjusted asset value (`adjVal`)](#2-adjusted-asset-value)
3. [Pick value — shape-aware extractor (`_pickNumericValue`)](#3-pick-value--shape-aware-extractor)
4. [Pick key derivation (`_derivePickKey`)](#4-pick-key-derivation)
5. [FAAB → MVS conversion](#5-faab--mvs-conversion)
6. [Side total + 3-side trade balance](#6-side-total--trade-balance-verdict)

**Player signals**
7. [Trade-volume liquidity chip](#7-trade-volume-liquidity-chip)
8. [Baseline vs market delta](#8-baseline-vs-market-delta)
9. [ADP month-to-month comparison chip](#9-adp-month-to-month-comparison-chip)
10. [MVS sparkline (history mini-chart)](#10-mvs-sparkline)
11. [Trend arrow / sign convention (site-wide)](#11-trend-arrow-convention)

**Age curve (player panel)**
12. [Per-position age curves](#12-per-position-age-curves)
13. [Player-specific value at age (`playerValue`)](#13-player-specific-value-at-age)
14. [ADP-implied value (`adpToValue`)](#14-adp-implied-value)
15. [Buy-low / Sell-high signal logic](#15-buy-low--sell-high-signal-logic)

**Per-season Sleeper stats**
16. [PPG / TGT-per-game / YPC / YPR](#16-per-season-stats-formulas)

**Tiers page**
17. [Tier assignment + color spectrum](#17-tier-assignment--color-spectrum)
18. [Buy / Sell / Hold chip enum](#18-buy--sell--hold-chips)

**My Leagues — team analysis**
19. [Team value aggregation (per roster)](#19-team-value-aggregation)
20. [Per-position power rankings](#20-per-position-power-rankings)
21. [League medians (per metric)](#21-league-medians)
22. [Team archetype classification (`mlGetArchetype`)](#22-team-archetype-classification)
23. [Archetype color + sort order](#23-archetype-color--sort-order)

**My Leagues — trade tools**
24. [Owned picks aggregation (`mlGetOwnedPicks`)](#24-owned-picks-aggregation)
25. [Pick valuation — median slot (`mlPickValue`)](#25-pick-valuation--median-slot)
26. [Trade-suggestion fit score (`mlPackageFit` + `mlGenerateTradeSuggestions`)](#26-trade-suggestion-fit-score)
27. [Inline trade calculator (`mlCalcSideTotal` verdict bands)](#27-inline-trade-calculator-bands)
28. [Trade-suggester balance label](#28-trade-suggester-balance-label)

**My Leagues — performance + waivers**
29. [Max-points efficiency (mpxPct)](#29-max-points-efficiency)
30. [Waiver bid win rate](#30-waiver-bid-win-rate)
31. [Per-player waiver FAAB averages](#31-per-player-waiver-faab-averages)
32. [Position scoring leader](#32-position-scoring-leader)
33. [Player-value color band (`valColor`)](#33-player-value-color-band)
34. [Pick exposure color band (`expoColor`)](#34-pick-exposure-color-band)
35. [Rank color band](#35-rank-color-band)

**Lineup optimizer**
36. [Optimal lineup signal selection + slot precedence](#36-optimal-lineup)

**ADP heatmap (pick availability)**
37. [Per-cell availability probability](#37-per-cell-availability-probability)
38. [Dropoff per round](#38-dropoff-per-round)
39. [Expected pick number](#39-expected-pick-number)
40. [Heatmap CSS intensity / text contrast](#40-heatmap-css-intensity--text-contrast)

**Rankings / Analysts**
41. [Consensus rank averaging (`merge_per_position`)](#41-consensus-rank-averaging)
42. [Position-rank backfill (rankings sync)](#42-position-rank-backfill)
43. [Heat coloring per row (analyst comparison)](#43-heat-coloring-per-row)

**League format detection**
44. [PPR / TEP / Pass-TD / Starters parsing](#44-league-format-detection)

**Sync pipeline (data layer)**
45. [`sync-mvs.py` — pick key normalization](#45-sync-mvs-pick-key-normalization)
46. [`sync-mvs.py` — player record build + trend](#46-sync-mvs-player-record--trend)
47. [`sync-fp.py` — rank-to-value map](#47-sync-fp-rank-to-value)
48. [`sync-fp.py` — age + PPG + 30-day trend](#48-sync-fp-age-ppg-trend)
49. [`sync-fp.py` — article attachment threshold](#49-sync-fp-article-attachment)
50. [`sync-adp.py` — draft classifier (picks/rookies/simple)](#50-sync-adp-draft-classifier)
51. [`sync-adp.py` — K→ROOKIE_PICK relabel](#51-sync-adp-k-rdp-relabel)
52. [`sync-adp.py` — weighted ADP aggregation](#52-sync-adp-weighted-adp)
53. [`sync-adp.py` — pick availability matrix](#53-sync-adp-availability-matrix)
54. [Name normalization (cross-source joining)](#54-name-normalization)

**Glossary**
55. [Magic-numbers glossary](#55-magic-numbers-glossary)
56. [Open heuristics / flagged for analyst review](#56-open-heuristics)

---

## Trade values

### 1. Player value — format multipliers
`getMultiplier(pos)` — `trade-calculator.html:2302`

**Inputs**
- `qb` ← `_calcQb()` returns `'sf'` or `'1qb'`. Reads visible `f-qb` filter dropdown; default `'sf'`.
- `ppr` ← `_calcPpr()` returns `1` (Full) / `0.5` (Half) / `0` (Std). Reads `f-ppr`; default `1`.
- `tep` ← `_calcTep()` returns `0` / `0.5` / `0.75` / `1.0`. Reads `f-tep` (normalizes `'all'`/`'none'` → `0`); default `0`.
- `passtd` ← `_calcPasstd()` returns `4` / `5` / `6`. Reads `f-passtd`; default `4`.

**Math (verbatim)**
```js
let m = 1.0;
if (pos === 'QB') {
  if (qb === 'sf')    m *= 1.15;     // SF gives QBs +15%
  if (passtd === 6)   m *= 1.08;     // 6pt TDs +8%
  else if (passtd === 5) m *= 1.04;  // 5pt TDs +4%
}
if (pos === 'WR') {
  if      (ppr === 1)   m *= 1.0;    // baseline
  else if (ppr === 0.5) m *= 0.96;   // half PPR −4%
  else                  m *= 0.90;   // standard −10%
}
if (pos === 'RB') {
  if      (ppr === 1)   m *= 1.04;   // full PPR +4%
  else if (ppr === 0.5) m *= 1.0;    // baseline
  else                  m *= 0.93;   // standard −7%
}
if (pos === 'TE') {
  m *= 1 + (tep * 0.12);             // TEP scaling: +12% per full TEP unit
}
return m;
```

**Output** Float multiplier ∈ `[0.90, 1.242]` (max = SF + 6pt TD: 1.15 × 1.08).

**Notes**
- Stacks multiplicatively across QB/passtd. WR/RB/TE multipliers are mutually exclusive (each position checked separately).
- TEP only applies to TE; other positions ignore the TEP setting in this function.
- K and PK return `1.0` (no branch hit).

---

### 2. Adjusted asset value
`adjVal(asset)` — `trade-calculator.html:2329`

**Inputs**
- `asset.type` ← `'pick'` or `'player'`.
- `asset.value` ← base MVS value (integer).
- `asset.pos` ← position code (`QB`/`RB`/`WR`/`TE`/`K`/`PK`).
- `asset.pickKey` ← canonical key into `PICK_VALUES` (optional).
- `asset.name` ← human label (used to derive `pickKey` if missing).

**Math (verbatim)**
```js
function adjVal(asset) {
  if (asset.type === 'pick') {
    let key = asset.pickKey;
    if (!key || !PICK_VALUES[key]) key = _derivePickKey(asset.name);
    if (key && PICK_VALUES[key]) {
      return Math.round(_pickNumericValue(PICK_VALUES[key]));
    }
    return Math.round(Number(asset.value) || 0);
  }
  return Math.round(asset.value * getMultiplier(asset.pos));
}
```

**Output** Integer.

**Notes**
- Picks **re-resolve live** through `PICK_VALUES` on every render — flipping QB/TEP filters immediately updates pick rows.
- Players use the multiplier; their base `asset.value` is the format-default snapshot from `FP_VALUES.value` at add time. Re-renders apply the multiplier; the base never re-fetches.
- Handoff'd / legacy picks without `pickKey` fall through to name-parsing via `_derivePickKey`. If still unresolved, returns the frozen snapshot value.

---

### 3. Pick value — shape-aware extractor
`_pickNumericValue(rec)` — `trade-calculator.html:2253`

**Inputs**
- `rec` — pick value record. Three known shapes:
  - From `data/picks.json` (sync-fp.py, 2025 only): `{ value, valueSf, valueTep }` — `value` IS the 1QB baseline.
  - From `data/mvs.json` overlay (sync-mvs.py, 2026/27/28): `{ value, valueSf, value1qb, valueTep, label }` — `value` is current-format default, `value1qb` is the true 1QB baseline, `valueTep` is aliased to `valueSf` (no real TEP data).
  - Legacy flat number (very old payloads).
- Format flags via `_calcQb()` and `_calcTep()`.

**Math (verbatim)**
```js
if (rec == null) return 0;
if (typeof rec === 'number') return rec;
if (typeof rec !== 'object') return Number(rec) || 0;
const isSf  = _calcQb() === 'sf';
const isTep = _calcTep() > 0;
if (isTep && rec.valueTep != null) return Number(rec.valueTep) || 0;
if (isSf  && rec.valueSf  != null) return Number(rec.valueSf)  || 0;
if (rec.value1qb != null) return Number(rec.value1qb) || 0;
return Number(rec.value) || 0;
```

**Priority** TEP wins if `tep > 0` and `valueTep` exists → SF if SF mode → `value1qb` (MVS shape) → `value` (picks.json shape).

**Notes**
- MVS picks alias `valueTep` to `valueSf` because the upstream source has no real TEP data for picks. Practical effect: in SF+TEP mode, MVS picks show the SF value.
- picks.json shape has real TEP data (computed by sync-fp.py from Fantasy Points' `tradeValueTePremium` column).

---

### 4. Pick key derivation
`_derivePickKey(name)` — `trade-calculator.html:2273`

**Inputs** Pick label string (e.g. `"2026 1.02"`, `"2026 Pick 1.02"`, `"2026 1st"`).

**Math (verbatim)**
```js
let m = name.match(/^(\d{4})\s+(?:Pick\s+)?(\d+)\.(\d+)$/i);
if (m) return `${m[1]}-${parseInt(m[2],10)}.${String(parseInt(m[3],10)).padStart(2,'0')}`;
m = name.match(/^(\d{4})\s+(\d+)(?:st|nd|rd|th)$/i);
if (m) return `${m[1]}-${parseInt(m[2],10)}`;
return null;
```

**Output** Canonical PICK_VALUES key (e.g. `"2026-1.02"` or `"2026-1"`) or `null`.

**Notes**
- Slot is padded to 2 digits (`"1.1"` → `"1.01"`).
- No range validation — `"2026 1.99"` parses to `"2026-1.99"` and silently misses on lookup.

---

### 5. FAAB → MVS conversion
`sideTotal` — `trade-calculator.html:2345`

**Math (verbatim)**
```js
function sideTotal(side) {
  return side.assets.reduce((s,a) => s + adjVal(a), 0) + (side.faab||0) * 10;
}
```

**Output** Integer (sum of asset values + FAAB × 10).

**Notes — heuristic flag**
- **$1 FAAB = 10 MVS units.** Hardcoded constant. Not tied to league settings, not adjustable in UI. For mixed-auction leagues this ratio may not hold; tell users to ignore the FAAB row in those formats.

---

### 6. Side total + trade balance verdict
`recalc` + `renderBalance` — `trade-calculator.html:2444-2505`

**Inputs** `sides` array — 2 or 3 sides; each `sideTotal(side)`.

**Two-side logic (verbatim)**
```js
const max = Math.max(t0, t1, 1);
const diff = t0 - t1;
const abs = Math.abs(diff);
const pctOff = max > 0 ? abs / max : 0;
if (pctOff < 0.05) {
  verdict = '⚖ Fair Trade';                    // class 'fair' — yellow
} else if (diff > 0) {
  verdict = `▲ Side A wins (+${Math.round(pctOff*100)}%)`;  // class 'win' — green
} else {
  verdict = `▲ Side B wins (+${Math.round(pctOff*100)}%)`;  // class 'lose' — red
}
```

**Three-side logic (verbatim)**
```js
const sorted = totals.sort((a,b) => b.total - a.total);
const gap = sorted[0].total - sorted[1].total;
const pctOff = sorted[0].total > 0 ? gap / sorted[0].total : 0;
verdict = pctOff < 0.05 ? '⚖ Balanced' : `▲ ${sorted[0].label} leads`;
```

**Balance bar widths**
```js
pct = Math.round(t.total / max * 100);
```

**Threshold** `pctOff < 0.05` (5% relative to the larger side) is the fair-trade cutoff.

**Notes — flagged**
- 2-way and 3-way use different denominators (max-of-two vs. leader-of-three). For a 3-way trade where #1 and #2 are nearly equal but #3 is far behind, the verdict reads "Balanced" even though one side is decisively losing.
- Threshold is 5%, not 3% or 10% — single magic number, no UI config.

---

## Player signals

### 7. Trade-volume liquidity chip
`MvsExtras.buildHeader` — `assets/js/mvs-extras.js:106-116`

**Inputs** `rec.tradesLastWeek` (integer count, format-aware via data-bootstrap overlay).

**Math**
```js
v >= 200  → 'Hot' / 'mvs-vol-hot' (red bg)
v >= 50   → 'Active' / 'mvs-vol-warm' (TE-orange bg)
v > 0     → 'Quiet' / 'mvs-vol-cool' (surface2 bg)
v === 0   → 'No trades' / 'mvs-vol-cold' (transparent)
```

**Notes** Hard cutoffs at **200** and **50** trades/7-day window. No interpolation.

---

### 8. Baseline vs market delta
`MvsExtras.buildHeader` — `assets/js/mvs-extras.js:90-104`

**Math (verbatim)**
```js
bDiff = current - baseline;
bPct  = Math.round((bDiff / baseline) * 100);
bSign = bDiff >= 0 ? '+' : '';
bClass = bDiff >= 0 ? 'mvs-extras-diff up' : 'mvs-extras-diff down';
// Renders as "{baseline} ({sign}{pct}% market)"
```

**Output** Percentage (rounded integer). Green if positive (market over baseline), red if negative.

**Notes**
- Baseline source: MVS pre-market formula (computed in `sync-mvs.py` upstream — comes through as `mvs.baseline` field, see entry 46).
- Only renders when `baseline > 0 && value != null`. Skipped silently otherwise.
- Positive % = market hyped above baseline (potential sell). Negative % = market under baseline (potential buy).

---

### 9. ADP month-to-month comparison chip
`AdpComparator.changeChipHtml` — `assets/js/adp-comparator.js:167-182`

**Inputs** `current` (current month ADP), `previous` (prior month ADP).

**Math (verbatim)**
```js
delta = current - previous;
abs = Math.abs(delta);
if (abs < 0.05) return '<span class="adp-cmp-chip flat" title="No change">●</span>';
label = abs.toFixed(1);
if (delta < 0) return '▲' chip [green #66dd84]   // ADP improved (number went down)
else           return '▼' chip [red var(--red)]   // ADP slipped (number went up)
```

**Threshold** `< 0.05` spots = noise → flat bullet.

**Notes** Lower ADP = better in fantasy convention. A delta of `−2.5` means "moved up 2.5 spots".

---

### 10. MVS sparkline
`MvsExtras.buildSparkline` — `assets/js/mvs-extras.js:13-44`

**Inputs** `history` array of `{ mvs: number }` objects (typically 14 points, see entry 46).

**SVG scaling**
```js
W = 280; H = 56; PAD = 4;
minV = min(vals); maxV = max(vals); range = maxV - minV || 1;
For each value v at index i:
  x = PAD + (i / (vals.length - 1)) * (W - 2*PAD);
  y = H - PAD - ((v - minV) / range) * (H - 2*PAD);
```

**Stroke color**
```js
delta = vals[last] - vals[first];
stroke = delta > 0 ? '#66dd84' : delta < 0 ? 'var(--red)' : 'var(--white)';
```

**Output** SVG polyline + text legend `"{sign}{delta} over {days}d · now {last_value}"`.

**Notes** Requires ≥2 history points; otherwise renders nothing. Days = number of data points (each is typically 1 sync run apart, not 1 calendar day).

---

### 11. Trend arrow convention
Site-wide CSS — `trade-calculator.html:1141-1146`, `index.html:944-949`, etc.

**Convention**
- `up` / positive → `#66dd84` (brand bright green) + `▲`
- `down` / negative → `var(--red)` + `▼`
- `flat` / zero / null → `#ffffff` (white) + `●`

Any non-zero value triggers direction; no magnitude threshold (except sparkline / ADP-chip which have their own no-change cutoffs).

---

## Age curve

### 12. Per-position age curves
`renderAgeCurve` `curves` object — `assets/js/player-panel.js:908`

**Verbatim**
```js
const curves = {
  QB: { peak: 28, peakVal: 9000, start: 22, end: 38, rampUp: 1.8, decayRate: 0.88 },
  RB: { peak: 24, peakVal: 8500, start: 21, end: 32, rampUp: 2.5, decayRate: 0.78 },
  WR: { peak: 26, peakVal: 9000, start: 21, end: 35, rampUp: 1.6, decayRate: 0.84 },
  TE: { peak: 27, peakVal: 7500, start: 22, end: 35, rampUp: 1.4, decayRate: 0.83 },
};
```

| Pos | Peak age | Peak value | Start age | End age | Ramp-up exp | Decay rate/yr |
|-----|----------|-----------|-----------|---------|-------------|---------------|
| QB  | 28       | 9000      | 22        | 38      | 1.8         | 0.88          |
| RB  | 24       | 8500      | 21        | 32      | 2.5         | 0.78          |
| WR  | 26       | 9000      | 21        | 35      | 1.6         | 0.84          |
| TE  | 27       | 7500      | 22        | 35      | 1.4         | 0.83          |

**`posValue(age)`** position-curve baseline
```js
if (age < start || age > end) return 0;
if (age <= peak) {
  t = (age - start) / (peak - start);
  return round(peakVal * Math.pow(t, 1 / rampUp));
} else {
  return round(peakVal * Math.pow(decayRate, age - peak));
}
```

**Notes** Constants are hand-tuned, not derived from data analysis. Worth analyst review — RB decay (0.78/yr) is the steepest; QB decay (0.88/yr) is the gentlest. Larger `rampUp` exponent denominator = slower rise to peak (so RB at 2.5 ramps up slowest, TE at 1.4 ramps up fastest).

---

### 13. Player-specific value at age
`scaleFactor` + `playerValue(age)` — `assets/js/player-panel.js:950-951`

**Math**
```js
scaleFactor = (playerVal > 0 && posValue(playerAge) > 0)
  ? playerVal / posValue(playerAge)
  : 1;
playerValue(age) = Math.max(0, Math.round(posValue(age) * scaleFactor));
```

**Output** Per-age projected value (curve scaled vertically to fit the player's current value point).

---

### 14. ADP-implied value
`adpToValue(adp)` — `assets/js/player-panel.js:919-923`

**Math**
```js
const maxVal = 10000;
return Math.round(maxVal * Math.pow(0.93, adp - 1));
```

**Output** Implied trade value if a player were drafted at ADP slot `adp` (slot 1 = 10000, slot 2 ≈ 9300, slot 10 ≈ 5204, slot 50 ≈ 280).

**Notes** Constants: max value **10000**, geometric decay **0.93 per slot**. Hand-tuned to roughly match the value spread of dynasty rank-1 vs late-2nd.

---

### 15. Buy-low / Sell-high signal logic
`renderAgeCurve` — `assets/js/player-panel.js:984-991`

**Math (verbatim)**
```js
gap = playerVal - adpImpliedVal;
pct = Math.round(Math.abs(gap) / Math.max(playerVal, adpImpliedVal) * 100);
if (gap > 500)   { signal = '▲ Buy-low — FC value pct% above ADP cost';    color = green; }
else if (gap < -500) { signal = '▼ Sell-high — ADP cost pct% above FC value'; color = red; }
else             { signal = '≈ Fairly priced';                              color = yellow; }
```

**Thresholds** ±**500** value units (gap from `playerVal` to `adpImpliedVal`).

---

## Per-season stats formulas

### 16. PPG, TGT/G, YPC, YPR
`renderPlayerStats` colDefs — `assets/js/player-panel.js:1314-1454`

**Data source** Sleeper API `/stats/nfl/player/{sleeperId}?season={yr}&season_type=regular&grouping=season`.

| Stat | Formula | Rounded |
|------|---------|---------|
| PPG (all pos)  | `pts_ppr / gp`        | 1 decimal |
| TGT/G (WR)     | `rec_tgt / gp`        | 1 decimal |
| YPC (RB)       | `rush_yd_per_att` (raw) | 1 decimal |
| YPR (WR/TE)    | `rec_yd_per_rec` (raw) | 1 decimal |
| Cmp% (QB)      | `pass_cmp_pct * 100`  | 1 decimal |

All other columns are raw Sleeper stat fields.

---

## Tiers page

### 17. Tier assignment + color spectrum
`TIER_DESCRIPTIONS` + `.tier-badge.t-*` — `tiers.html:494-516` + `tiers.html:161-171`

**Assignment** Manual via Google Sheet → `sync-tiers.py` → `tiers.html`. No formula. 20 discrete tiers: S++, S+, S, A+, A, A−, B+, B, B−, C+, C, C−, D+, D, D−, E+, E, E−, F+, F, F−.

**Tier descriptions** (verbatim, from sheet)
```
S++  Cornerstone Players (3-4 Base 1sts)
S+   Elite + (2.5-3 Base 1sts)
S    Elite (2+ Base 1sts)
A+   Elite Lite (2 Base 1sts)
A    Knocking On The Door (1.75 - 2 base 1sts)
A-   Tweener Tier (1.5-2 Base 1sts)
B+   High Risk Upside (1.25-1.5 + Base 1sts)
B    Upside But Safer (1.25 - 1.5 base 1sts)
B-   Interesting Values (1 - 1.25 Base 1sts)
C+   Good Players Not Really Values (1 Base 1st)
C    Risky and Probably More Expensive Than I Want For 1 Late First
C-   Late Firsts I Want To Pay 1 Late First
D+   Risky Late First With Upside
D    Veterans Worth The Early 2
D-   Mid 2nd Veterans
E+   Upside Mid 2nd Value With Risk
E    Mid 2nd Safety Players
E-   Late 2nd Players
F+   Early 3rd Players
F    Mid 3rd Players
F-   Late 3rd
```

**Color spectrum**
| Tier | Color | Token |
|------|-------|-------|
| S++ | dynasty orange | `var(--red)` |
| S+ | brand vivid red | `var(--pos-qb-bg)` (#e05252) |
| S | brand yellow | `var(--yellow)` (#f0c040) |
| A+ | warm orange | `var(--orange)` (#e8732a) |
| A / A− | brand green | `var(--pos-rb-bg)` (#4caf6e) |
| B+/B/B− | brand blue | `var(--pos-wr-bg)` (#5b9bd5) |
| C+/C/C− | brand lavender | `var(--pos-pick-bg)` (#9b91d4) |
| D+/D/D− | dark gray | `#555` |
| E+/E/E− | darker gray | `#444` |
| F+/F/F− | darkest gray | `#333` |

`tierBadgeClass(tier)` (`tiers.html:2707`)
```js
return 't-' + (tier || 'S').toLowerCase().replace(/\+/g, 'p').replace(/-/g, 'm');
// "S++" → "t-spp"; "A−" → "t-am"
```

---

### 18. Buy / Sell / Hold chips
`bshChipHtml(val)` — `tiers.html:2728`

**Enum** (verbatim)
```
'buying'   → green                  (BUYING)
'checking' → green @ 65% opacity    (CHECKING)
'selling'  → red                    (SELLING)
'shopping' → orange                 (SHOPPING)
'hold'     → orange @ 80% opacity   (HOLD)
```

**Source** Manual per-player tag in the tiers sheet. Not threshold-driven.

---

## My Leagues — team analysis

### 19. Team value aggregation
`mlComputeLeagueValueData` — `my-leagues.html:5093-5174`

**Per-roster** for each `roster.players` (filtered to active starters via Sleeper API metadata)
```js
posVals = { QB:0, RB:0, WR:0, TE:0 };
for each player_id in roster.players:
  if (player.position in posVals):
    posVals[position] += FP_VALUES[player.full_name]?.value || 0;

total = posVals.QB + posVals.RB + posVals.WR + posVals.TE;

avgAge = ages.length > 0 ? mean(ages where age > 0) : 0;

projTotal = sum(ML_SEASON_PROJ[pid] || 0 for each player_id);
```

**Output per team** `{ posVals, total, avgAge, pickValue, projTotal, isMe }`.

**Notes** Skill positions only (QB/RB/WR/TE). K, IDP, picks counted separately. `FP_VALUES.value` reflects current format (1QB vs SF) via data-bootstrap overlay (see entry 46).

---

### 20. Per-position power rankings
`mlComputeLeagueValueData` — `my-leagues.html` (same function)

**Per-position** (`QB`, `RB`, `WR`, `TE`):
```js
sorted = teams.sort((a,b) => (b.posVals[pos] || 0) - (a.posVals[pos] || 0));
myRanks[pos] = sorted.findIndex(t => t.isMe) + 1;
```

**Pick rank**
```js
sortedByPicks = teams.sort((a,b) => (b.pickValue || 0) - (a.pickValue || 0));
myRanks.PICK = sortedByPicks.findIndex(t => t.isMe) + 1;
```

**Grand total rank** (players + picks)
```js
sortedByGrand = teams.sort((a,b) => ((b.total||0) + (b.pickValue||0)) - ((a.total||0) + (a.pickValue||0)));
myRanks.TOTAL = sortedByGrand.findIndex(t => t.isMe) + 1;
```

---

### 21. League medians
`mlComputeLeagueValueData` — `my-leagues.html`

**Median helper**
```js
const median = arr => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a,b)=>a-b);
  const m = Math.floor(s.length/2);
  return s.length%2 ? s[m] : (s[m-1]+s[m])/2;
};
```

**Computed per league**
```js
leagueAvg = {
  age:       median(teams.filter(t => t.avgAge > 0).map(t => t.avgAge)),
  value:     median(teams.map(t => t.total)),
  pickValue: median(teams.map(t => t.pickValue || 0)),
  proj:      median(teams.map(t => t.projTotal || 0).filter(v => v > 0)),
};
```

**Note** Despite the variable name, these are **medians**, not means. The label `leagueAvg` is a misnomer carried over from earlier code.

---

### 22. Team archetype classification
`mlGetArchetype(avgAge, totalValue, pickValue, projValue, leagueAvg)` — `my-leagues.html:2937-2959`

**Composite (verbatim)**
```js
const valNorm  = (totalValue || 0) / (leagueAvg.value || 1);
const pickNorm = leagueAvg.pickValue ? ((pickValue || 0) / leagueAvg.pickValue) : 1;
const projNorm = leagueAvg.proj      ? ((projValue || 0) / leagueAvg.proj)      : 1;
const composite = 0.6 * valNorm + 0.2 * pickNorm + 0.2 * projNorm;
```

**Thresholds**
```js
const valueHigh = composite > 1.10;
const valueLow  = composite < 0.90;
const ageYoung  = avgAge < leagueAvg.age - 0.6;
const ageOld    = avgAge > leagueAvg.age + 0.6;
```

**Decision grid (verbatim)**
```js
if (valueHigh && ageYoung) return 'dynasty';
if (valueHigh)             return 'contender';
if (valueLow && ageOld)    return 'emergency';
if (valueLow && ageYoung)  return 'rebuilder';
if (valueLow)              return 'rebuilder';
if (ageYoung)              return 'rebuilder';
if (ageOld)                return 'emergency';
return 'tweener';
```

**Output** One of `'dynasty'`, `'contender'`, `'tweener'`, `'rebuilder'`, `'emergency'`.

**Weights** 60% player value, 20% pick value, 20% projected points. Age band is ±0.6 years from median.

**Notes — flagged**
- Weights and thresholds are hand-tuned.
- "Emergency" fires for low-value OR old-mid teams. "Rebuilder" fires for low-value OR young-mid teams. These overlap in edge cases — a low-value team gets "rebuilder" not "emergency" because the value check fires first.
- Fallback `tweener` when `leagueAvg` is missing or pre-overlay.

---

### 23. Archetype color + sort order
`my-leagues.html:3414`, `:3615-3631`

**Sort order** (used in player-availability listings)
```js
const archOrder = { dynasty: 0, contender: 1, tweener: 2, rebuilder: 3, emergency: 4 };
```

**Color map**
| Archetype  | Foreground | Background |
|------------|-----------|------------|
| dynasty    | `#9b91d4` (lavender) | `rgba(155,145,212,.10)` |
| contender  | `var(--green)`       | `rgba(76,175,110,.10)`  |
| tweener    | `#5b9bd5` (blue)     | `rgba(91,155,213,.10)`  |
| rebuilder  | `#e09a30` (orange)   | `rgba(224,154,48,.10)`  |
| emergency  | `var(--red)`         | `rgba(237,129,12,.10)`  |

---

## My Leagues — trade tools

### 24. Owned picks aggregation
`mlGetOwnedPicks(rosterId, tradedPicks, leagueRounds, currentSeason, completedDraftSeasons)` — `my-leagues.html:3222-3272`

**Round cap** `Math.min(leagueRounds || 4, 5)` — max 5 rounds tracked.

**Season window** `currentSeason` through `currentSeason + 3` (4 future drafts).

**Logic**
1. **Natural picks** — every (season, round) the team owns by default, minus any traded away.
2. **Acquired picks** — `tradedPicks` where `owner_id === rosterId`.
3. **Exclude** any picks in `completedDraftSeasons`.
4. **Sort** by season (string), then round (numeric).

---

### 25. Pick valuation — median slot
`mlPickValue(season, round)` — `my-leagues.html:3207-3216`

**Math (verbatim)**
```js
const specific = Object.keys(PICK_VALUES).filter(k => k.startsWith(`${season}-${round}.`));
if (specific.length) {
  specific.sort();
  return _num(PICK_VALUES[specific[Math.floor(specific.length / 2)]]);
}
return _num(PICK_VALUES[`${season}-${round}`]);
```

**`_num` helper** Handles both shapes — `{ value: ... }` object or flat number.

**Output** Numeric value for a "round X pick this season" (median across known slots), with fallback to the generic round entry.

---

### 26. Trade-suggestion fit score
`mlPackageFit(pkg, archetype)` + `mlGenerateTradeSuggestions(myAssets, targetValue, archetype, maxCount)` — `my-leagues.html:3713-3836`

**Archetype preferences (verbatim)**
```js
const ARCH_PREFS = {
  rebuilder: { wantPicks: 1.0, wantYouth: 1.0, wantVeterans: 0.3 },
  emergency: { wantPicks: 1.0, wantYouth: 0.6, wantVeterans: 0.4 },
  tweener:   { wantPicks: 0.5, wantYouth: 0.5, wantVeterans: 0.5 },
  contender: { wantPicks: 0.3, wantYouth: 0.3, wantVeterans: 1.0 },
  dynasty:   { wantPicks: 0.5, wantYouth: 0.7, wantVeterans: 0.7 },
};
```

**Package fit (per candidate)**
```js
for each asset a in pkg:
  w = a.value;                                  // weighted by value
  if (a.type === 'pick')          score += prefs.wantPicks    * w;
  else if (a.age && a.age <= 24)  score += prefs.wantYouth    * w;
  else                            score += prefs.wantVeterans * w;
return weight > 0 ? score / weight : 0;
```

**Youth threshold** age ≤ **24**.

**Candidate generation**
- Filter pool: `value >= max(50, targetValue * 0.05)`.
- 1, 2, and 3-asset combinations (loop caps: 12 for 2-asset, 8×12 for 3-asset).
- Accept ratio range: `0.85 ≤ total / targetValue ≤ 1.30`.

**Composite fitScore (verbatim)**
```js
valueFit = 1 - Math.min(Math.abs(ratio - 1), 0.30) / 0.30;  // ∈ [0, 1]
archFit  = mlPackageFit(assets, archetype);                  // ∈ [0, 1]
fewer    = 1 - (assets.length - 1) * 0.05;                   // 1, 0.95, 0.90
fitScore = (valueFit * 0.55 + archFit * 0.35 + fewer * 0.10);
```

**Weights** 55% value-fit, 35% archetype-fit, 10% asset-count parsimony.

**Bucket selection** (top picks per category, then sorted by fitScore)
1. `1-asset && ratio ∈ [0.95, 1.05]` → "FAIR VALUE — 1 ASSET"
2. `2-asset && ratio ∈ [0.95, 1.05]` → "FAIR VALUE — 2 ASSETS"
3. `ratio ∈ (1.05, 1.15]` → "SLIGHT OVERPAY"
4. `3-asset && ratio ∈ [0.95, 1.10]` → "VALUE PACKAGE — 3 ASSETS"
5. `archFit ≥ 0.65 && ratio ∈ [0.92, 1.15]` → "ARCHETYPE-TILTED"
6. Remaining by fitScore → "ALTERNATIVE"

---

### 27. Inline trade calculator bands
`mlCalcRender` — `my-leagues.html:4528-4551`

**Math**
```js
totalA = side.A.reduce((sum, a) => sum + (a.value || 0), 0);
totalB = side.B.reduce((sum, a) => sum + (a.value || 0), 0);
diff = totalA - totalB;
absDiff = Math.abs(diff);
larger = Math.max(totalA, totalB) || 1;
pctOff = (absDiff / larger) * 100;
```

**Verdict bands**
- `pctOff ≤ 5`  → "✓ Fair Trade" (`'fair'`)
- `pctOff ≤ 15` → "~ Slightly Unbalanced" (`'unbalanced'`)
- `pctOff > 15` → "⚠ Side X overpays" (`'heavy'`)

**Notes** Distinct from the main trade-calculator's fair/win/lose verdict (entry 6) — that's 5% only, with no middle band.

---

### 28. Trade-suggester balance label
`mltbRender` — `my-leagues.html:4048-4067`

**Math**
```js
ratio = targetPlayer.value > 0 ? totalSent / targetPlayer.value : 0;
overpct = (ratio - 1) * 100;
```

**Bands**
- `|overpct| < 2.5`         → "⚖ Even trade" (green)
- `0 < overpct ≤ 10`        → "+pct% overpay (you give more)" (yellow)
- `overpct > 10`            → "+pct% heavy overpay" (red)
- `-10 ≤ overpct < 0`       → "-pct% steal (you give less)" (green)
- `overpct < -10`           → "-pct% lopsided in your favor" (blue)

---

## My Leagues — performance + waivers

### 29. Max-points efficiency
`mpxPct` — `my-leagues.html:7196-7198`

**Math**
```js
pf     = (settings.fpts || 0) + (settings.fpts_decimal || 0) / 100;
maxPts = (settings.fpts_max || 0) + (settings.fpts_max_decimal || 0) / 100;
mpxPct = (maxPts > 0 && pf > 0) ? Math.round((pf / maxPts) * 100) : null;
```

**Color bands** ≥90 green, ≥75 white, else red.

---

### 30. Waiver bid win rate
`winPct` — `my-leagues.html:6720`

**Math** `Math.round((won / tried) * 100)`.

---

### 31. Per-player waiver FAAB averages
`fetchAndCacheWaivers` + `mlGetPlayerStatus` — `my-leagues.html:3278-3305`

**Math**
```js
for each completed transaction in weeks 1..maxWeek (cap 18):
  if (waiver_bid is numeric):
    stats[pid].totalBid += waiver_bid;
    stats[pid].bidCount++;
avgFaab = bidCount > 0 ? Math.round(totalBid / bidCount) : null;
```

---

### 32. Position scoring leader
`topScoringPos` — `my-leagues.html:7188-7190`

**Math** `Object.entries(posScore).reduce((best, [pos, pts]) => pts > best[1] ? [pos, pts] : best, ['—', 0])[0]`

---

### 33. Player-value color band (`valColor`)
`valColor` — `my-leagues.html:6291-6293`

**Math**
```js
v > 8000 → 'var(--green)';
v > 5000 → 'var(--green)';
v > 2000 → 'var(--white)';
v > 500  → 'var(--muted)';
else     → '#555';
```

**Notes** First two branches both return green (cosmetic — used to be a separate `#a8d8a0` shade; collapsed in the brand-color audit, commit `fca6d0e`).

---

### 34. Pick exposure color band (`expoColor`)
`my-leagues.html:5831`, `:5917`

**Math** `pct >= 50 ? green : pct >= 25 ? yellow : muted`.

---

### 35. Rank color band
`my-leagues.html:5194-5196`, `:5332`, `:7263-7266`

**Math**
```js
rank <= 3                 → green;
rank <= ceil(teamCount/2) → white;
rank >  teamCount/2       → red;
```

---

## Lineup optimizer

### 36. Optimal lineup
`_mlComputeOptimalLineup` — `my-leagues.html:6162-6236`

**Signal** Per player:
```js
if (projections exist) signal = projections[id];
else                   signal = FP_VALUES[name].value;
```

**Slot precedence (verbatim)**
```js
const slotPrecedence = ['QB','RB','WR','TE','K','DEF','DL','LB','DB',
  'WRRB_FLEX','WRRB','REC_FLEX','WRTE_FLEX','FLEX','IDP_FLEX','SUPER_FLEX'];
```

**Slot eligibility (excerpt)**
- `SUPER_FLEX` → QB / RB / WR / TE
- `FLEX` → RB / WR / TE
- `WRRB_FLEX` → RB / WR
- `REC_FLEX` → WR / TE
- `IDP_FLEX` → DL / LB / DB / DE / DT / CB / S / SS / FS

**Algorithm** Sort slots by precedence; greedy-fill each slot with the highest-signal eligible player who isn't already used.

**Notes** Greedy — doesn't always produce the global optimum when FLEX positions could be filled by a player who'd be better used elsewhere. In practice the precedence ordering minimizes regressions, but flag if you want a true LP optimization.

---

## ADP heatmap

### 37. Per-cell availability probability
`_availability_matrix_from_picks` — `sync-adp.py:642-693`

**Math**
```python
for each (round R, slot S):
    target_pick = (R - 1) * team_count + S
    drafts_taken_before = count(pick.pick_no < target_pick for this player)
    drafts_available    = total_drafts - drafts_taken_before
    prob = drafts_available / total_drafts
    cell_value = round(prob * 100)   # percentage 0-100
```

**Interpretation** "In what % of past drafts was player X still on the board at pick (R,S)?"

---

### 38. Dropoff per round
`sync-adp.py:642-693` (same function)

**Math**
```python
row_available_count = sum(prob for all slots in round)
dropoff[round] = round((row_available_count / team_count) * 100)
```

Average availability across all slots in a round. Used for the per-round summary chip on the heatmap.

---

### 39. Expected pick number
**Math** `expectedPick = round(mean([pick.pick_no for all drafts]), 2)`

**Output** Displayed at the top of the heatmap modal.

---

### 40. Heatmap CSS intensity / text contrast
`Heatmap.render` — `assets/js/heatmap.js:41-127`

**Math**
```js
alpha     = v === 0 ? 0.04 : Math.max(0.08, v / 100);
textColor = v >= 35 ? '#111' : 'rgba(255,255,255,.5)';
label     = v >= 8  ? v : '';
background = `rgba(237, 129, 12, ${alpha.toFixed(2)})`;
```

**Thresholds**
- 35% = text-contrast switch (dark text above, semi-white below)
- 8% = label visibility (numbers hidden below to reduce noise)
- 0% = min alpha 0.04 (still slightly visible to distinguish "no data" from "off-board")

---

## Rankings / analysts

### 41. Consensus rank averaging
`merge_per_position` — `sync-analysts.py:187-231`

**Math**
```python
ranks = [r for r in entry["ranks"].values() if r is not None]
consensus = round(mean(ranks), 1) if len(ranks) > 0 else None
```

**Sort** Players sorted by `consensus` ascending; unranked sink to bottom (sentinel 9999).

**Sanity** `MIN_PLAYERS_PER_SECTION = 10` per analyst per position; sync aborts if any analyst sub-min (catches CSV parsing failures).

---

### 42. Position-rank backfill
`sync-rankings.py:128-193`

**Math**
```python
players.sort(by rank, asc, missing→9999)
pos_counts = {}
for each player in sorted order:
    pos_counts[pos] += 1
    if not player.posRank:
        player.posRank = f"{pos}{pos_counts[pos]}"
```

---

### 43. Heat coloring per row (analyst comparison)
`rankings.html` — "By Analyst" mode

**Logic** For each row (player), find min and max rank across analysts:
- Cell with min rank (best) → `var(--pos-rb-bg)` green tint
- Cell with max rank (worst) → `var(--pos-te-bg)` orange tint
- All other cells → neutral

**Notes** Bipolar highlighting: only the extremes are colored, not the middle. Solid brand colors with `#111` text (per the COLOR USAGE RULE in `brand.css`).

---

## League format detection

### 44. League format detection
`my-leagues.html:6075-6082`

**PPR points** (from `scoring_settings.rec`)
```js
ppr = recPts >= 0.99 ? '1.0' : recPts >= 0.49 ? '0.5' : '0.0';
```

**TEP points** (from `scoring_settings.bonus_rec_te`)
```js
tep = tepPts >= 0.99 ? '1.0' :
      tepPts >= 0.74 ? '0.75' :
      tepPts >= 0.49 ? '0.5'  : '0';
```

**Pass TD points** `Math.round(scoring_settings.pass_td || 4)`.

**Starters count**
```js
const benchSlots = new Set(['BN', 'TAXI', 'IR', 'RES']);
startersCount = rosterPositions.filter(s => !benchSlots.has(s)).length;
```

**QB slot** `rosterPositions.includes('SUPER_FLEX') ? 'SF' : '1QB'`.

---

## Sync pipeline

### 45. `sync-mvs.py` — pick key normalization
`normalize_pick_key(name)` — `sync-mvs.py:127-141`

**Patterns**
```python
_SLOT_RE = r"^(\d{4})\s+(\d+)\.(\d+)$"          # "2026 1.01" → "2026-1.01"
_ORD_RE  = r"^(\d{4})\s+(\d+)(?:st|nd|rd|th)(?:\s*\(([^)]+)\))?$"
                                                # "2026 1st"          → "2026-1"
                                                # "2026 1st (Early)"  → "2026-1-early"
```

---

### 46. `sync-mvs.py` — player record + trend
`build_player_record(row)` — `sync-mvs.py:80-114`

**Trend (verbatim)**
```python
trend    = int(round(mvs_sf  - (to_float(row["mvs_last_week_sf"])  or mvs_sf)))
trend1qb = int(round(mvs_1qb - (to_float(row["mvs_last_week_1qb"]) or mvs_1qb)))
```

**Convention** Positive = riser (value moved up since last week).

**Array trimming**
```python
HISTORY_KEEP = 14   # sparkline data points (≈2 weeks of MVS snapshots)
TRADES_KEEP  = 3    # recent trades shown in modal
```

**Validation thresholds** (refuse to write if below)
```python
MIN_ACTIVE_PLAYERS = 300
MIN_PICK_ROWS      = 30
```

**Inactive filter** Skip rows where both `mvs_sf == 0` and `mvs_1qb == 0`.

---

### 47. `sync-fp.py` — rank-to-value map
`build_values_from_trade_value(tv_resp)` — `sync-fp.py:210-234`

**Logic**
- For each row in FP's trade-value rankings, extract `(value, valueSf, valueTep)` triple.
- If `rank` is a pure integer → player. Map `rank → triple`.
- If `rank` matches `"YYYY R.SS"` → pick. Map `"YYYY-R.SS" → triple`.

---

### 48. `sync-fp.py` — age, PPG, 30-day trend
`_age_from_birthdate` — `sync-fp.py:279-291`
```python
days = (today - birth_date).days
return round(days / 365.25, 1)
```

`_ppg_from_stats_row` — `sync-fp.py:294-300`
```python
pts = stats.get("pts_ppr") or stats.get("pts_half_ppr") or stats.get("pts_std") or 0
return round(pts / gp, 1) if (gp and pts) else None
```

**30-day trend** — `sync-fp.py:440-463`
```python
TREND_WINDOW_DAYS = 30
target_date = today - timedelta(days=30)
baseline_rank = snapshots[closest_date]['name']
trend = baseline_rank - current_rank  # positive = moved up
```

**History pruning** `MAX_HISTORY_DAYS = 90`. Older snapshots dropped.

---

### 49. `sync-fp.py` — article attachment
**Threshold** `BODY_MENTION_MIN = 2`. Player name must appear ≥2 times in article body (word-boundary regex) to attach. In title → always attach.

---

### 50. `sync-adp.py` — draft classifier
`classify_startup_drafts` — `sync-adp.py:303-364`

**Priority**
1. **Picks bucket** — any K in rounds 1..`RDP_EARLY_ROUNDS` (fingerprint for picks-as-K drafts).
2. **Rookies bucket** — any incoming-class rookie (`yearsExp == season_offset`).
3. **Simple bucket** — neither (vets-only).

**Rookie detection**
```python
_target_yexp = max(0, current_season - season)
# 2026 current, 2024 season → target_yexp = 2
# Player with yearsExp == 2 in 2026 was a rookie in 2024
```

---

### 51. `sync-adp.py` — K → ROOKIE_PICK relabel
`relabel_picks_K_to_rdp` — `sync-adp.py:367-445`

**Logic** Within each picks-bucket draft, sort all K-position rows by pick_no ascending, cumcount 0-indexed.
```python
rp_round = (seq // st_teams) + 1
rp_pir   = (seq % st_teams) + 1
new_id   = f"ROOKIE_PICK_{rp_round}.{str(rp_pir).zfill(2)}"
```

---

### 52. `sync-adp.py` — weighted ADP aggregation
**Math**
```python
weighted_adp = adp * picks       # weight by number of picks contributing
aggregated   = sum(weighted_adp) / sum(picks)
```

**Top-N filter** `top_n = 300` most-drafted players. `min_drafts = 5` per player.

---

### 53. `sync-adp.py` — availability matrix
See entry 37–39. Constants:
- `HEATMAP_MAX_ROUNDS = 14`
- Rookie heatmap capped at 6 rounds
- `top_n = 300` for real-player heatmap
- `min_drafts = 5` for inclusion

---

### 54. Name normalization
`normalize_name(name)` — `sync-fp.py:152-160`, `_norm_name(name)` — `sync-analysts.py:90-103`, `normalizePlayerName(name)` — site-wide JS.

**Math (Python, equivalent JS exists)**
```python
s = NFKD(name)            # unicode decomposition
s = ASCII-encode-ignore   # drop accents
s = lowercase
s = strip "jr|sr|ii|iii|iv|v" (with optional dots)
s = keep only alphanumeric
```

**Example** `"Ja'Marr Chase Jr."` → `"jamarrchase"`.

**Purpose** Cross-source joining (FP rankings ↔ Sleeper players ↔ MVS CSV ↔ analyst CSVs).

---

## Glossary

### 55. Magic-numbers glossary

**Format multipliers (trade calc)**
| Constant | Where | Meaning |
|----------|-------|---------|
| `1.15`   | trade-calc:2309 | SF bonus on QBs |
| `1.08`   | trade-calc:2310 | 6pt-TD QB bonus |
| `1.04`   | trade-calc:2311 | 5pt-TD QB bonus |
| `1.0/0.96/0.90` | trade-calc:2314-16 | WR full / half / std PPR |
| `1.04/1.0/0.93` | trade-calc:2319-21 | RB full / half / std PPR |
| `0.12`   | trade-calc:2324 | TE TEP per-unit multiplier |

**Trade balance**
| Constant | Where | Meaning |
|----------|-------|---------|
| `0.05` (5%) | trade-calc:2478, 2498 | "Fair Trade" cutoff (main calc) |
| `5%`        | my-leagues:4542 | "Fair" cutoff (inline calc) |
| `15%`       | my-leagues:4545 | "Slightly Unbalanced" cutoff |
| `10`        | trade-calc:2346 | FAAB → MVS ratio ($1 = 10 MVS) |
| `2.5%`      | my-leagues:4052 | "Even trade" tolerance (suggester) |
| `10%`       | my-leagues:4055 | Mild overpay cutoff (suggester) |

**Volume / liquidity**
| Constant | Where | Meaning |
|----------|-------|---------|
| `200`    | mvs-extras:108 | "Hot" volume (trades/week) |
| `50`     | mvs-extras:108 | "Active" volume |
| `8000 / 5000 / 2000 / 500` | my-leagues:6292 | `valColor` thresholds |
| `50% / 25%` | my-leagues:5831 | `expoColor` thresholds |
| `90% / 75%` | my-leagues:7254 | `mpxPct` color bands |
| `35% / 8%`  | heatmap.js | Heatmap text-contrast / label-visibility |

**Trends / signals**
| Constant | Where | Meaning |
|----------|-------|---------|
| `0.05` spots | adp-comparator:172 | ADP-chip no-change cutoff |
| `±500` units | player-panel:984 | Buy-low / Sell-high signal threshold |

**Age curves (player panel)**
- See full table in entry 12. Per-position peak age, peak value, rampUp exponent, decayRate.
- ADP-implied value: `maxVal = 10000`, decay `0.93/slot`.

**Archetype scoring (my-leagues)**
| Constant | Where | Meaning |
|----------|-------|---------|
| `0.6 / 0.2 / 0.2` | my-leagues:2942 | Composite weights: value / picks / projections |
| `> 1.10` | my-leagues:2944 | "valueHigh" cutoff |
| `< 0.90` | my-leagues:2945 | "valueLow" cutoff |
| `± 0.6` yrs | my-leagues:2946-47 | Age band vs league median |

**Trade-suggester scoring**
| Constant | Where | Meaning |
|----------|-------|---------|
| `≤ 24` | my-leagues:3722 | "Youth" age cutoff |
| `0.85, 1.30` | my-leagues:3758 | Acceptable ratio range |
| `0.95, 1.05` | my-leagues:3814-15 | "Fair Value" ratio range |
| `0.55 / 0.35 / 0.10` | my-leagues:3796 | fitScore: valueFit / archFit / fewer weights |
| `0.30` | my-leagues:3793 | Value-fit cap (max ratio diff before flat penalty) |
| `0.65` | my-leagues:3818 | Archetype-tilted bucket threshold |

**Sync / pipeline**
| Constant | Where | Meaning |
|----------|-------|---------|
| `HISTORY_KEEP = 14` | sync-mvs.py | MVS sparkline points |
| `TRADES_KEEP = 3`   | sync-mvs.py | Recent trades per player |
| `MIN_ACTIVE_PLAYERS = 300` | sync-mvs.py | Min for valid sync |
| `MIN_PICK_ROWS = 30` | sync-mvs.py | Min for valid sync |
| `TREND_WINDOW_DAYS = 30` | sync-fp.py | Trend baseline window |
| `MAX_HISTORY_DAYS = 90` | sync-fp.py | Snapshot retention |
| `BODY_MENTION_MIN = 2` | sync-fp.py | Article attach threshold |
| `top_n = 300, min_drafts = 5` | sync-adp.py | Heatmap inclusion |
| `HEATMAP_MAX_ROUNDS = 14` | sync-adp.py | Real heatmap depth |
| Rookie heatmap = 6 rounds | sync-adp.py | RDP heatmap depth |
| `MIN_PLAYERS_PER_SECTION = 10` | sync-analysts.py | Per analyst per position |

---

### 56. Open heuristics

Flagging for analyst review — these are hand-tuned with no documented source data:

1. **FAAB → MVS ratio (`× 10`)** — `trade-calculator.html:2346`. Hardcoded; no league-format sensitivity.
2. **Age curves (entry 12)** — peak ages, peakVals, rampUp/decay constants per position. Hand-tuned; not regressed against actual dynasty value-vs-age data.
3. **ADP-implied value decay (`0.93/pick`)** — `player-panel.js:919-923`. Tunes how aggressively buy/sell signals fire vs ADP.
4. **Buy-low / sell-high threshold (`±500`)** — `player-panel.js:984`. Could be % of player value instead of absolute units.
5. **Composite archetype weights (`0.6 / 0.2 / 0.2`)** — `my-leagues.html:2942`. Player value gets 3× weight of picks; projections weighted equally with picks. Worth a sensitivity check.
6. **Archetype value/age cutoffs (`±10%` value, `±0.6yr` age)** — same. Border teams flip archetype on small changes.
7. **Trade-suggester weights (`0.55/0.35/0.10`)** — `my-leagues.html:3796`. valueFit dominates; "fewer assets" gets only 10%.
8. **Trade volume cutoffs (`200 / 50`)** — `mvs-extras.js:108`. League-context-agnostic; could be percentile-based.
9. **Heatmap text-contrast at 35%** — `heatmap.js`. Arbitrary; could be derived from WCAG contrast ratio.
10. **MVS overlay zeros out FP players not in MVS** — `data-bootstrap.js:191-194`. If a player exists in `data/values.json` but not `data/mvs.json` (e.g. inactive/cut), `value` is set to 0. This is intentional but means stale value-only players show 0 across the calc, not the FP fallback.
11. **3-way trade balance uses leader-relative %** while 2-way uses max-relative — entry 6. Edge-case divergence.
12. **MVS `valueTep` aliased to `valueSf`** — `data-bootstrap.js:203`. MVS picks have no real TEP data; SF+TEP mode just shows SF value. Real TEP exists for picks.json (2025-only).
13. **`leagueAvg` is a median, not a mean** — entry 21 (misleading variable name).
14. **Player-value color (`valColor`)** has duplicate green branches at 8000 and 5000 — cosmetic artifact of the brand-color audit. Effectively one threshold at 2000.

---

## Notes on this document

- Compile / regenerate after any change to a formula, threshold, or sync-script constant.
- Pair with `assets/js/legend-content.js` (in-app developer legend) when those entries also drift.
- Surface this as a user-facing **Legend** page (in plan, not yet built).
