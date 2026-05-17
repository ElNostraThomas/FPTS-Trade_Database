/* Formulas page content — structured mirror of docs/FORMULAS.md.
   Hand-authored (not generated). When you change a formula in the code,
   update this AND docs/FORMULAS.md. The audit script flags drift in colors
   but not in this content; keep both in sync manually.

   Schema:
     domains[]:
       id     — kebab-case anchor used in TOC + URL hash
       name   — display name (TOC label + section heading)
       entries[]:
         id        — kebab-case anchor (deep-link to a specific entry)
         label     — display name (entry heading)
         location  — file:line reference
         inputs    — what data + where it comes from
         math      — verbatim code/formula (rendered in monospace block)
         output    — what the calculation produces
         notes     — edge cases, hand-tuned constants, analyst-relevant context

   Glossary + open-heuristics domains use a compact `rows` field instead
   of one entry per row, to keep the file scannable.
*/
window.FormulasContent = {
  title: 'Formulas & calculations',
  blurb: 'Source-of-truth catalog of every formula, threshold, multiplier, and heuristic that determines a value, trend, ranking, archetype, color, or signal on this site. 56 entries across 12 domains. Each entry shows file:line, verbatim math, and analyst-relevant notes.',
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
          notes: 'QB and PassTD bonuses stack multiplicatively. WR/RB/TE multipliers are mutually exclusive (each position checked separately). TEP only applies to TE. K and PK return 1.0.'
        },
        {
          id: 'adj-val',
          label: '2. Adjusted asset value (adjVal)',
          location: 'trade-calculator.html:2329',
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
          notes: 'Picks re-resolve live through PICK_VALUES every render — flipping QB/TEP filters immediately updates pick rows. Players use the multiplier; their base asset.value is the format-default snapshot from FP_VALUES.value at add time. Handoff\'d / legacy picks without pickKey fall through to name-parsing via _derivePickKey.'
        },
        {
          id: 'pick-numeric-value',
          label: '3. Pick value — shape-aware extractor (_pickNumericValue)',
          location: 'trade-calculator.html:2253',
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
          notes: 'MVS picks alias valueTep to valueSf because the upstream MVS source has no real TEP data for picks. In SF+TEP mode, MVS picks effectively show the SF value. Only picks.json (2025-only) has real TEP data (from FP\'s tradeValueTePremium column).'
        },
        {
          id: 'derive-pick-key',
          label: '4. Pick key derivation (_derivePickKey)',
          location: 'trade-calculator.html:2273',
          inputs: 'Pick label string (e.g. "2026 1.02", "2026 Pick 1.02", "2026 1st").',
          math: `let m = name.match(/^(\\d{4})\\s+(?:Pick\\s+)?(\\d+)\\.(\\d+)$/i);
if (m) return \`\${m[1]}-\${parseInt(m[2],10)}.\${String(parseInt(m[3],10)).padStart(2,'0')}\`;
m = name.match(/^(\\d{4})\\s+(\\d+)(?:st|nd|rd|th)$/i);
if (m) return \`\${m[1]}-\${parseInt(m[2],10)}\`;
return null;`,
          output: 'Canonical PICK_VALUES key (e.g. "2026-1.02" or "2026-1") or null.',
          notes: 'Slot padded to 2 digits ("1.1" → "1.01"). No range validation — "2026 1.99" parses to "2026-1.99" and silently misses on lookup.'
        },
        {
          id: 'faab-conversion',
          label: '5. FAAB → MVS conversion (inside sideTotal)',
          location: 'trade-calculator.html:2345',
          inputs: 'side.faab (integer dollars).',
          math: `function sideTotal(side) {
  return side.assets.reduce((s,a) => s + adjVal(a), 0)
       + (side.faab || 0) * 10;
}`,
          output: 'Integer (sum of asset values + FAAB × 10).',
          notes: 'HEURISTIC: $1 FAAB = 10 MVS units. Hardcoded constant. Not tied to league settings, not adjustable in UI. For mixed-auction leagues this ratio may not hold.'
        },
        {
          id: 'trade-balance',
          label: '6. Trade balance verdict (2-way and 3-way)',
          location: 'trade-calculator.html:2444-2505',
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
          notes: 'FLAGGED: 2-way and 3-way use different denominators (max-of-two vs. leader-of-three). A 3-way trade where #1 and #2 are nearly equal but #3 is far behind reads "Balanced" even though one side is decisively losing. Threshold is 5%, hardcoded, no UI config.'
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
          inputs: 'rec.tradesLastWeek (integer count, format-aware via data-bootstrap overlay).',
          math: `v >= 200  → 'Hot'        / 'mvs-vol-hot'  (red bg)
v >= 50   → 'Active'     / 'mvs-vol-warm' (TE-orange bg)
v > 0     → 'Quiet'      / 'mvs-vol-cool' (surface2 bg)
v === 0   → 'No trades'  / 'mvs-vol-cold' (transparent)`,
          output: 'HTML chip with tone-coded background.',
          notes: 'Hard cutoffs at 200 and 50 trades/7-day window. No interpolation.'
        },
        {
          id: 'baseline-vs-market',
          label: '8. Baseline vs market delta',
          location: 'assets/js/mvs-extras.js:90-104',
          inputs: 'rec.value (current MVS), rec.baseline (pre-market formula baseline, computed upstream in sync-mvs.py).',
          math: `bDiff  = current - baseline;
bPct   = Math.round((bDiff / baseline) * 100);
bSign  = bDiff >= 0 ? '+' : '';
bClass = bDiff >= 0 ? 'mvs-extras-diff up' : 'mvs-extras-diff down';
// Renders: "{baseline} ({sign}{pct}% market)"`,
          output: 'Percentage (rounded integer). Green if positive (market over baseline), red if negative.',
          notes: 'Only renders when baseline > 0 && value != null. Positive % = market hyped above baseline (potential sell). Negative % = market under baseline (potential buy).'
        },
        {
          id: 'adp-month-change',
          label: '9. ADP month-to-month comparison chip',
          location: 'assets/js/adp-comparator.js:167-182',
          inputs: 'current (current month ADP), previous (prior month ADP).',
          math: `delta = current - previous;
abs   = Math.abs(delta);
if (abs < 0.05) return '●' chip (flat, no change);
label = abs.toFixed(1);
if (delta < 0) return '▲' chip [green #66dd84]   // ADP improved (number went down)
else           return '▼' chip [red var(--red)]   // ADP slipped (number went up)`,
          output: 'Styled HTML chip with delta label + arrow + tooltip.',
          notes: 'Threshold: < 0.05 spots = noise → flat bullet. Lower ADP = better in fantasy convention. A delta of -2.5 means "moved up 2.5 spots".'
        },
        {
          id: 'sparkline',
          label: '10. MVS sparkline (history mini-chart)',
          location: 'assets/js/mvs-extras.js:13-44',
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
          notes: 'Requires ≥2 history points; otherwise renders nothing. "Days" = number of data points (each is one sync run apart, not necessarily 1 calendar day).'
        },
        {
          id: 'trend-arrow',
          label: '11. Trend arrow / sign convention (site-wide)',
          location: 'trade-calculator.html:1141-1146, index.html:944-949 (CSS)',
          inputs: 'Any numeric value.',
          math: `up    / positive → #66dd84 (brand bright green) + ▲
down  / negative → var(--red)                    + ▼
flat  / zero     → #ffffff (white)               + ●`,
          output: 'CSS class .trend.up / .trend.down / .trend.flat.',
          notes: 'Any non-zero value triggers direction; no magnitude threshold (except sparkline / ADP-chip which have their own cutoffs).'
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
          notes: 'HEURISTIC: Constants hand-tuned, not derived from data analysis. RB decay (0.78/yr) is the steepest; QB decay (0.88/yr) gentlest. Larger rampUp exponent denominator = slower rise to peak (RB at 2.5 ramps up slowest, TE at 1.4 fastest).'
        },
        {
          id: 'player-value-at-age',
          label: '13. Player-specific value at age (playerValue)',
          location: 'assets/js/player-panel.js:950-951',
          inputs: 'playerVal (current value), playerAge, posValue function from entry 12.',
          math: `scaleFactor = (playerVal > 0 && posValue(playerAge) > 0)
  ? playerVal / posValue(playerAge)
  : 1;
playerValue(age) = Math.max(0, Math.round(posValue(age) * scaleFactor));`,
          output: 'Per-age projected value (position curve scaled vertically to fit the player\'s current value).',
          notes: 'Scaling assumes the player follows the position-average shape but at their own elevation.'
        },
        {
          id: 'adp-implied-value',
          label: '14. ADP-implied value (adpToValue)',
          location: 'assets/js/player-panel.js:919-923',
          inputs: 'adp (numeric rank).',
          math: `const maxVal = 10000;
return Math.round(maxVal * Math.pow(0.93, adp - 1));`,
          output: 'Implied trade value at ADP slot. Slot 1 = 10000, slot 2 ≈ 9300, slot 10 ≈ 5204, slot 50 ≈ 280.',
          notes: 'HEURISTIC: Max value 10000, geometric decay 0.93/slot. Hand-tuned to roughly match dynasty rank-1 vs late-2nd spread.'
        },
        {
          id: 'buy-sell-signal',
          label: '15. Buy-low / Sell-high signal logic',
          location: 'assets/js/player-panel.js:984-991',
          inputs: 'playerVal (current FC/MVS value), adpImpliedVal (from entry 14).',
          math: `gap = playerVal - adpImpliedVal;
pct = Math.round(Math.abs(gap) / Math.max(playerVal, adpImpliedVal) * 100);
if (gap > 500)   signal = '▲ Buy-low — FC value pct% above ADP cost';    color = green
else if (gap < -500) signal = '▼ Sell-high — ADP cost pct% above FC value'; color = red
else             signal = '≈ Fairly priced';                              color = yellow`,
          output: 'Buy/sell/fair signal label + color.',
          notes: 'Thresholds: ±500 value units. Could be % of player value instead of absolute units.'
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
          inputs: 'Sleeper API stats row per (player, season).',
          math: `PPG (all pos):  pts_ppr / gp                      → 1 decimal
TGT/G (WR):     rec_tgt / gp                      → 1 decimal
YPC (RB):       rush_yd_per_att (raw from API)    → 1 decimal
YPR (WR/TE):    rec_yd_per_rec (raw from API)     → 1 decimal
Cmp% (QB):      pass_cmp_pct * 100                → 1 decimal`,
          output: 'Per-season table rendered in the Player Stats tab.',
          notes: 'Data source: Sleeper API /stats/nfl/player/{sleeperId}?season={yr}&season_type=regular&grouping=season. All other columns are raw Sleeper stat fields.'
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
          notes: 'Tiers correspond to "base 1st round picks" valuation per the curator (see TIER_DESCRIPTIONS), not auto-computed value bands.'
        },
        {
          id: 'bsh-chips',
          label: '18. Buy / Sell / Hold chips',
          location: 'tiers.html:2728',
          inputs: 'Per-player tag from the tiers sheet.',
          math: `'buying'   → green                  (BUYING)
'checking' → green @ 65% opacity    (CHECKING)
'selling'  → red                    (SELLING)
'shopping' → orange                 (SHOPPING)
'hold'     → orange @ 80% opacity   (HOLD)`,
          output: 'HTML chip with color class.',
          notes: 'Enum-based, not threshold-driven. Source: manual curator tag.'
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
          inputs: 'roster.players (Sleeper player IDs), FP_VALUES, ML_SEASON_PROJ.',
          math: `posVals = { QB:0, RB:0, WR:0, TE:0 };
for each player_id in roster.players:
  if (player.position in posVals):
    posVals[position] += FP_VALUES[player.full_name]?.value || 0;
total      = posVals.QB + posVals.RB + posVals.WR + posVals.TE;
avgAge     = mean(ages where age > 0);
projTotal  = sum(ML_SEASON_PROJ[pid] || 0 for each player_id);`,
          output: 'Per-team: { posVals, total, avgAge, pickValue, projTotal, isMe }.',
          notes: 'Skill positions only (QB/RB/WR/TE). K, IDP, picks counted separately. FP_VALUES.value reflects current format (1QB vs SF) via data-bootstrap overlay.'
        },
        {
          id: 'per-position-rankings',
          label: '20. Per-position power rankings',
          location: 'my-leagues.html (same function)',
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
          notes: 'Ties broken by JS sort stability (insertion order).'
        },
        {
          id: 'league-medians',
          label: '21. League medians (per metric)',
          location: 'my-leagues.html (same function)',
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
          notes: 'FLAGGED: Despite the variable name, these are MEDIANS, not means. The label "leagueAvg" is a misnomer carried from earlier code.'
        },
        {
          id: 'team-archetype',
          label: '22. Team archetype classification (mlGetArchetype)',
          location: 'my-leagues.html:2937-2959',
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
          notes: 'HEURISTIC: Weights 60% player value, 20% pick value, 20% projected points. Age band ±0.6 years from median. Hand-tuned. "Emergency" fires for low-value OR old-mid teams; "rebuilder" fires for low-value OR young-mid teams. Low-value teams always get "rebuilder" (the valueLow check is unconditional). Fallback "tweener" when leagueAvg missing/unhydrated.'
        },
        {
          id: 'archetype-colors',
          label: '23. Archetype color + sort order',
          location: 'my-leagues.html:3414, :3615-3631',
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
          notes: 'Sort order is intentional — dynasty/contender first (you want to know who you\'re trading against first), emergency last.'
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
          inputs: 'rosterId, tradedPicks, leagueRounds, currentSeason, completedDraftSeasons (Set).',
          math: `roundCap = Math.min(leagueRounds || 4, 5);    // max 5 rounds tracked
seasonWindow = [currentSeason, currentSeason+1, currentSeason+2, currentSeason+3];

1. Natural picks: every (season, round) the team owns by default, minus traded-away.
2. Acquired picks: tradedPicks where owner_id === rosterId.
3. Exclude any picks in completedDraftSeasons.
4. Sort by season (string), then round (numeric).`,
          output: 'Array of owned-pick objects.',
          notes: 'Round cap at 5 prevents low-value 6th+ rounders from inflating pick totals.'
        },
        {
          id: 'pick-valuation-ml',
          label: '25. Pick valuation — median slot (mlPickValue)',
          location: 'my-leagues.html:3207-3216',
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
          notes: 'Median, not mean, to dampen outliers (e.g. 1.01 dominating a "round 1" pick valuation).'
        },
        {
          id: 'trade-suggestion-fit',
          label: '26. Trade-suggestion fit score (mlPackageFit + mlGenerateTradeSuggestions)',
          location: 'my-leagues.html:3713-3836',
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
          notes: 'HEURISTIC: Weights 55% value-fit, 35% archetype-fit, 10% asset-count parsimony. Youth threshold age ≤ 24. ARCH_PREFS hand-tuned (e.g. contender weight on veterans = 1.0 but youth = 0.3 — opposite of rebuilder).'
        },
        {
          id: 'inline-calc-bands',
          label: '27. Inline trade calculator bands (mlCalc)',
          location: 'my-leagues.html:4528-4551',
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
          notes: 'Distinct from the main trade-calculator\'s verdict (entry 6) — that\'s 5% only with no middle band. Inline calc has a 5%/15% two-tier system.'
        },
        {
          id: 'trade-suggester-balance',
          label: '28. Trade-suggester balance label (mltbRender)',
          location: 'my-leagues.html:4048-4067',
          inputs: 'targetPlayer.value, totalSent.',
          math: `ratio   = targetPlayer.value > 0 ? totalSent / targetPlayer.value : 0;
overpct = (ratio - 1) * 100;

|overpct| < 2.5      → '⚖ Even trade'                           green
0 < overpct ≤ 10     → '+pct% overpay (you give more)'          yellow
overpct > 10         → '+pct% heavy overpay'                    red
-10 ≤ overpct < 0    → '-pct% steal (you give less)'            green
overpct < -10        → '-pct% lopsided in your favor'           blue`,
          output: 'Balance label + color.',
          notes: '5-band system specifically for the suggester. Tighter tolerance (2.5%) than the inline calc (5%) because suggestions should land near-fair by design.'
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
          inputs: 'roster.settings.fpts + fpts_decimal, fpts_max + fpts_max_decimal.',
          math: `pf     = (settings.fpts || 0) + (settings.fpts_decimal || 0) / 100;
maxPts = (settings.fpts_max || 0) + (settings.fpts_max_decimal || 0) / 100;
mpxPct = (maxPts > 0 && pf > 0) ? Math.round((pf / maxPts) * 100) : null;

// Color bands: ≥90 green, ≥75 white, else red.`,
          output: 'Percentage (or null if no data).',
          notes: 'Measures how close to optimal lineup you played (actual points / theoretical max for that week).'
        },
        {
          id: 'waiver-win-rate',
          label: '30. Waiver bid win rate',
          location: 'my-leagues.html:6720',
          inputs: 'Per-user st (waiver stats) { tried, won }.',
          math: 'winPct = st.tried > 0 ? Math.round((st.won / st.tried) * 100) : 0;',
          output: 'Percentage of submitted bids that won.',
          notes: 'Aggregates across the full season.'
        },
        {
          id: 'waiver-faab-avg',
          label: '31. Per-player waiver FAAB averages',
          location: 'my-leagues.html:3278-3305 (fetchAndCacheWaivers)',
          inputs: 'Completed waiver/free_agent transactions, weeks 1..maxWeek (cap 18).',
          math: `for each completed transaction in weeks 1..maxWeek:
  if (waiver_bid is numeric):
    stats[pid].totalBid += waiver_bid;
    stats[pid].bidCount++;

avgFaab = bidCount > 0 ? Math.round(totalBid / bidCount) : null;`,
          output: 'Per-player avgFaab + claims count.',
          notes: 'Free-agent (non-bid) adds count toward "claims" but not toward avgFaab.'
        },
        {
          id: 'top-scoring-pos',
          label: '32. Position scoring leader',
          location: 'my-leagues.html:7188-7190',
          inputs: 'posScore object { QB: pts, RB: pts, ... }.',
          math: `topScoringPos = Object.entries(posScore).reduce(
  (best, [pos, pts]) => pts > best[1] ? [pos, pts] : best,
  ['—', 0]
)[0];`,
          output: 'Position code (e.g. "RB") of the highest fpts contributor.',
          notes: 'Tiebreak: first encountered wins (Object.entries order is insertion order).'
        },
        {
          id: 'val-color',
          label: '33. Player-value color band (valColor)',
          location: 'my-leagues.html:6291-6293',
          inputs: 'v (player value integer).',
          math: `v > 8000 → 'var(--green)';
v > 5000 → 'var(--green)';
v > 2000 → 'var(--white)';
v > 500  → 'var(--muted)';
else     → '#555';`,
          output: 'CSS color value.',
          notes: 'First two branches both return green — cosmetic artifact of the brand-color audit (originally had a separate light-green mid-shade, collapsed to brand green in commit fca6d0e). Effectively one threshold at 2000.'
        },
        {
          id: 'expo-color',
          label: '34. Pick exposure color band (expoColor)',
          location: 'my-leagues.html:5831, :5917',
          inputs: 'pct (exposure percentage).',
          math: `pct >= 50 → 'var(--green)';     // concentrated
pct >= 25 → 'var(--yellow)';    // moderate
else      → 'var(--muted)';     // rare`,
          output: 'CSS color value.',
          notes: 'Drives the pick-exposure heatmap intensity.'
        },
        {
          id: 'rank-color',
          label: '35. Rank color band',
          location: 'my-leagues.html:5194-5196, :5332, :7263-7266',
          inputs: 'rank (1-indexed), teamCount.',
          math: `rank <= 3                  → 'var(--green)';    // top tier
rank <= Math.ceil(teamCount/2) → 'var(--white)';    // median
else                           → 'var(--red)';      // bottom half`,
          output: 'CSS color value.',
          notes: 'Top-3 always green regardless of league size — could be percentile-based for small leagues.'
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
          notes: 'Greedy — doesn\'t always produce the global optimum when FLEX positions could be better filled. In practice the precedence ordering minimizes regressions.'
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
          inputs: 'Per-player picks history (from Sleeper drafts), total_drafts, team_count.',
          math: `for each (round R, slot S):
    target_pick = (R - 1) * team_count + S
    drafts_taken_before = count(pick.pick_no < target_pick for this player)
    drafts_available    = total_drafts - drafts_taken_before
    prob = drafts_available / total_drafts
    cell_value = round(prob * 100)   # percentage 0-100`,
          output: 'Per-cell percentage (0-100).',
          notes: '"In what % of past drafts was player X still on the board at pick (R,S)?"'
        },
        {
          id: 'dropoff-per-round',
          label: '38. Dropoff per round',
          location: 'sync-adp.py:642-693',
          inputs: 'Same as entry 37.',
          math: `row_available_count = sum(prob for all slots in round)
dropoff[round] = round((row_available_count / team_count) * 100)`,
          output: 'Per-round average availability percentage.',
          notes: 'Used for the per-round summary chip at the heatmap edges.'
        },
        {
          id: 'expected-pick',
          label: '39. Expected pick number',
          location: 'sync-adp.py heatmap builder',
          inputs: 'Per-player picks across drafts.',
          math: 'expectedPick = round(mean([pick.pick_no for all drafts]), 2)',
          output: 'Average pick number where this player went.',
          notes: 'Displayed at the top of the heatmap modal.'
        },
        {
          id: 'heatmap-css-intensity',
          label: '40. Heatmap CSS intensity / text contrast',
          location: 'assets/js/heatmap.js:41-127',
          inputs: 'v (cell percentage 0-100).',
          math: `alpha     = v === 0 ? 0.04 : Math.max(0.08, v / 100);
textColor = v >= 35 ? '#111' : 'rgba(255,255,255,.5)';
label     = v >= 8  ? v : '';
background = \`rgba(237, 129, 12, \${alpha.toFixed(2)})\`;`,
          output: 'CSS bg color + text color + label visibility per cell.',
          notes: 'Thresholds: 35% = text-contrast switch (dark text above, semi-white below); 8% = label visibility (numbers hidden below to reduce noise); 0% = min alpha 0.04 (still slightly visible to distinguish "no data" from "off-board").'
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
          inputs: 'Per-analyst per-player rank entries.',
          math: `ranks = [r for r in entry["ranks"].values() if r is not None]
consensus = round(mean(ranks), 1) if len(ranks) > 0 else None

# Sort: by consensus ascending; unranked sink to bottom (sentinel 9999).`,
          output: 'Consensus value per player.',
          notes: 'MIN_PLAYERS_PER_SECTION = 10 per analyst per position; sync aborts if any analyst sub-min (catches CSV parsing failures).'
        },
        {
          id: 'pos-rank-backfill',
          label: '42. Position-rank backfill (sync-rankings.py)',
          location: 'sync-rankings.py:128-193',
          inputs: 'Per-player rank, position. Optionally posRank if provided.',
          math: `players.sort(by rank, asc, missing→9999)
pos_counts = {}
for each player in sorted order:
    pos_counts[pos] += 1
    if not player.posRank:
        player.posRank = f"{pos}{pos_counts[pos]}"`,
          output: 'Backfilled posRank string (e.g. "QB1", "RB12").',
          notes: 'Only fills if the source CSV didn\'t provide one.'
        },
        {
          id: 'heat-coloring-row',
          label: '43. Heat coloring per row (analyst comparison)',
          location: 'rankings.html ("By Analyst" mode)',
          inputs: 'Per-row ranks across N analysts.',
          math: `// For each row (player), find min and max rank across analysts:
minCell  → var(--pos-rb-bg) green tint    // best (lowest rank)
maxCell  → var(--pos-te-bg) orange tint   // worst (highest rank)
others   → neutral`,
          output: 'CSS background tint per cell.',
          notes: 'Bipolar highlighting — only the extremes are colored, not the middle. Solid brand colors with #111 text (per COLOR USAGE RULE in brand.css).'
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
          notes: 'Tolerant matching — handles partial-PPR (e.g. 0.49 → Half PPR). Default 4pt pass TD if missing.'
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
          inputs: 'CSV pick label.',
          math: `_SLOT_RE = r"^(\\d{4})\\s+(\\d+)\\.(\\d+)$"
                              # "2026 1.01" → "2026-1.01"
_ORD_RE  = r"^(\\d{4})\\s+(\\d+)(?:st|nd|rd|th)(?:\\s*\\(([^)]+)\\))?$"
                              # "2026 1st"          → "2026-1"
                              # "2026 1st (Early)"  → "2026-1-early"`,
          output: 'Canonical key for PICK_VALUES.',
          notes: 'Tier-variant labels (Early/Mid/Late) preserved as a hyphenated suffix.'
        },
        {
          id: 'sync-mvs-player-trend',
          label: '46. sync-mvs.py — player record + trend',
          location: 'sync-mvs.py:80-114 (build_player_record)',
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
          notes: 'Trend convention: positive = riser (value moved up since last week).'
        },
        {
          id: 'sync-fp-rank-to-value',
          label: '47. sync-fp.py — rank-to-value map',
          location: 'sync-fp.py:210-234 (build_values_from_trade_value)',
          inputs: 'FP\'s trade-value rankings API response.',
          math: `For each row:
  triple = {value, valueSf, valueTep} from FP fields
  if rank is pure integer → player: rank_to_value[int] = triple
  if rank matches "YYYY R.SS" → pick: pick_to_value["YYYY-R.SS"] = triple`,
          output: 'rank_to_value (players) + pick_to_value (picks).',
          notes: 'FP API only ships 2025 picks currently. 2026-2028 come via sync-mvs.py overlay.'
        },
        {
          id: 'sync-fp-age-ppg-trend',
          label: '48. sync-fp.py — age, PPG, 30-day trend',
          location: 'sync-fp.py:279-291 (_age_from_birthdate), :294-300 (_ppg), :440-463 (trend)',
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
          notes: 'PPG prefers full-PPR, falls back to half-PPR, then standard. Trend baseline finds the closest snapshot to 30 days ago.'
        },
        {
          id: 'sync-fp-articles',
          label: '49. sync-fp.py — article attachment',
          location: 'sync-fp.py:366-422',
          inputs: 'Article title, body, candidate player names.',
          math: `BODY_MENTION_MIN = 2

# Attach if:
#   - player name in article title (always attach)
#   - player name appears >= 2 times in body (word-boundary regex)`,
          output: 'data/articles.json with per-player article lists.',
          notes: '2-mention threshold prevents single-mention vet comps from attaching to the wrong player.'
        },
        {
          id: 'sync-adp-classifier',
          label: '50. sync-adp.py — draft classifier (picks/rookies/simple)',
          location: 'sync-adp.py:303-364 (classify_startup_drafts)',
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
          notes: 'Used downstream to decide which heatmap (RDP vs real-player) the draft contributes to.'
        },
        {
          id: 'sync-adp-k-relabel',
          label: '51. sync-adp.py — K → ROOKIE_PICK relabel',
          location: 'sync-adp.py:367-445 (relabel_picks_K_to_rdp)',
          inputs: 'Picks-bucket drafts.',
          math: `# Within each draft, sort K-position rows by pick_no asc, cumcount 0-indexed:
rp_round = (seq // st_teams) + 1
rp_pir   = (seq % st_teams) + 1
new_id   = f"ROOKIE_PICK_{rp_round}.{str(rp_pir).zfill(2)}"`,
          output: 'Rewritten player_id ROOKIE_PICK_X.YY for each K in a picks-bucket draft.',
          notes: 'These IDs then feed a separate RDP-only heatmap.'
        },
        {
          id: 'sync-adp-weighted-adp',
          label: '52. sync-adp.py — weighted ADP aggregation',
          location: 'sync-adp.py:174-294 (build_adp)',
          inputs: 'Per-player per-month draft picks.',
          math: `weighted_adp = adp * picks
aggregated   = sum(weighted_adp) / sum(picks)

# Top-N + min-drafts filter:
top_n = 300        # most-drafted players
min_drafts = 5     # per player min`,
          output: 'data/adp.json aggregated per (month, view_key, player_id).',
          notes: 'Heavier-weighted by # of drafts; a player with 50 picks gets 5× the weight of a player with 10.'
        },
        {
          id: 'sync-adp-availability-matrix',
          label: '53. sync-adp.py — pick availability matrix',
          location: 'sync-adp.py:642-693',
          inputs: 'Filtered picks + draft catalog.',
          math: `HEATMAP_MAX_ROUNDS = 14   # real heatmap depth
Rookie heatmap = 6 rounds  # max for RDP
top_n = 300                # for real-player heatmap
min_drafts = 5             # min appearance count for inclusion`,
          output: 'Matrix written to data/pick-availability.json.',
          notes: 'See entries 37-39 for the underlying probability formula.'
        },
        {
          id: 'name-normalization',
          label: '54. Name normalization (cross-source joining)',
          location: 'sync-fp.py:152-160, sync-analysts.py:90-103, site-wide JS normalizePlayerName',
          inputs: 'Player name string.',
          math: `s = NFKD(name)            # unicode decomposition
s = ASCII-encode-ignore   # drop accents
s = lowercase
s = strip "jr|sr|ii|iii|iv|v" (with optional dots)
s = keep only alphanumeric`,
          output: 'Normalized key (e.g. "Ja\'Marr Chase Jr." → "jamarrchase").',
          notes: 'Used to join FP rankings ↔ Sleeper players ↔ MVS CSV ↔ analyst CSVs across all data sources.'
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
          inputs: '—',
          math: `1.15           SF bonus on QBs (trade-calc:2309)
1.08           6pt-TD QB bonus (:2310)
1.04           5pt-TD QB bonus (:2311)
1.0/0.96/0.90  WR full / half / std PPR (:2314-16)
1.04/1.0/0.93  RB full / half / std PPR (:2319-21)
0.12           TE TEP per-unit multiplier (:2324)`,
          output: '—',
          notes: '—'
        },
        {
          id: 'mn-trade-balance',
          label: '55b. Trade balance thresholds',
          location: 'trade-calc + my-leagues',
          inputs: '—',
          math: `0.05 (5%)     "Fair Trade" cutoff (trade-calc:2478, 2498)
5%            "Fair" cutoff (my-leagues inline calc:4542)
15%           "Slightly Unbalanced" cutoff (my-leagues:4545)
10            FAAB → MVS ratio ($1 = 10 MVS) (trade-calc:2346)
2.5%          "Even trade" tolerance (suggester) (my-leagues:4052)
10%           Mild overpay cutoff (suggester) (my-leagues:4055)`,
          output: '—',
          notes: '—'
        },
        {
          id: 'mn-volume-liquidity',
          label: '55c. Volume / liquidity thresholds',
          location: 'mvs-extras.js + my-leagues',
          inputs: '—',
          math: `200           "Hot" volume (trades/week) (mvs-extras:108)
50            "Active" volume (mvs-extras:108)
8000/5000/2000/500  valColor thresholds (my-leagues:6292)
50% / 25%     expoColor thresholds (my-leagues:5831)
90% / 75%     mpxPct color bands (my-leagues:7254)
35% / 8%      Heatmap text-contrast / label-visibility (heatmap.js)`,
          output: '—',
          notes: '—'
        },
        {
          id: 'mn-trends-signals',
          label: '55d. Trends / signals thresholds',
          location: 'adp-comparator + player-panel',
          inputs: '—',
          math: `0.05 spots   ADP-chip no-change cutoff (adp-comparator:172)
±500 units   Buy-low / Sell-high signal threshold (player-panel:984)`,
          output: '—',
          notes: '—'
        },
        {
          id: 'mn-age-curves',
          label: '55e. Age curves (player panel)',
          location: 'player-panel.js:908',
          inputs: '—',
          math: `Per position (peak age / peak value / rampUp exp / decay rate):
QB: 28 / 9000 / 1.8 / 0.88
RB: 24 / 8500 / 2.5 / 0.78
WR: 26 / 9000 / 1.6 / 0.84
TE: 27 / 7500 / 1.4 / 0.83

ADP-implied value: maxVal = 10000, decay 0.93/slot.`,
          output: '—',
          notes: 'See entry 12 for usage.'
        },
        {
          id: 'mn-archetype-scoring',
          label: '55f. Archetype scoring (my-leagues)',
          location: 'my-leagues.html:2937+',
          inputs: '—',
          math: `0.6 / 0.2 / 0.2   Composite weights: value / picks / projections (:2942)
> 1.10            "valueHigh" cutoff (:2944)
< 0.90            "valueLow" cutoff (:2945)
± 0.6 yrs         Age band vs league median (:2946-47)`,
          output: '—',
          notes: 'See entry 22 for full decision grid.'
        },
        {
          id: 'mn-suggester',
          label: '55g. Trade-suggester scoring',
          location: 'my-leagues.html:3713+',
          inputs: '—',
          math: `≤ 24                Youth age cutoff (:3722)
0.85, 1.30          Acceptable ratio range (:3758)
0.95, 1.05          "Fair Value" ratio range (:3814-15)
0.55 / 0.35 / 0.10  fitScore: valueFit / archFit / fewer weights (:3796)
0.30                Value-fit cap (max ratio diff before flat penalty) (:3793)
0.65                Archetype-tilted bucket threshold (:3818)`,
          output: '—',
          notes: 'See entry 26 for full algorithm.'
        },
        {
          id: 'mn-sync-pipeline',
          label: '55h. Sync / pipeline thresholds',
          location: 'sync-*.py',
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
          notes: '—'
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
          inputs: '—',
          math: 'side.faab * 10',
          output: '—',
          notes: 'Hardcoded; no league-format sensitivity. In mixed-auction leagues this ratio may not hold.'
        },
        {
          id: 'heur-2-age-curves',
          label: '56-2. Age curve constants per position',
          location: 'assets/js/player-panel.js:908',
          inputs: '—',
          math: 'See entry 12.',
          output: '—',
          notes: 'Peak ages, peakVals, rampUp/decay constants are hand-tuned; not regressed against actual dynasty value-vs-age data.'
        },
        {
          id: 'heur-3-adp-decay',
          label: '56-3. ADP-implied value decay (0.93/pick)',
          location: 'assets/js/player-panel.js:919-923',
          inputs: '—',
          math: 'maxVal × 0.93^(adp - 1)',
          output: '—',
          notes: 'Tunes how aggressively buy/sell signals fire vs ADP. Slot 50 gets 2.8% of max.'
        },
        {
          id: 'heur-4-buy-sell',
          label: '56-4. Buy-low / sell-high threshold (±500)',
          location: 'assets/js/player-panel.js:984',
          inputs: '—',
          math: 'gap > 500 / gap < -500',
          output: '—',
          notes: 'Absolute units; could be % of player value instead.'
        },
        {
          id: 'heur-5-archetype-weights',
          label: '56-5. Composite archetype weights (0.6 / 0.2 / 0.2)',
          location: 'my-leagues.html:2942',
          inputs: '—',
          math: 'composite = 0.6*valNorm + 0.2*pickNorm + 0.2*projNorm',
          output: '—',
          notes: 'Player value gets 3× weight of picks; projections weighted equally with picks. Worth a sensitivity check.'
        },
        {
          id: 'heur-6-archetype-bands',
          label: '56-6. Archetype value/age cutoffs (±10% value, ±0.6yr age)',
          location: 'my-leagues.html:2944-47',
          inputs: '—',
          math: 'valueHigh = composite > 1.10; valueLow = composite < 0.90; ageBand = ±0.6yr',
          output: '—',
          notes: 'Border teams flip archetype on small changes (e.g. 1.09 → tweener, 1.11 → contender).'
        },
        {
          id: 'heur-7-suggester-weights',
          label: '56-7. Trade-suggester weights (0.55 / 0.35 / 0.10)',
          location: 'my-leagues.html:3796',
          inputs: '—',
          math: 'fitScore = 0.55*valueFit + 0.35*archFit + 0.10*fewer',
          output: '—',
          notes: 'valueFit dominates; "fewer assets" gets only 10%.'
        },
        {
          id: 'heur-8-volume',
          label: '56-8. Trade volume cutoffs (200 / 50)',
          location: 'assets/js/mvs-extras.js:108',
          inputs: '—',
          math: 'See entry 7.',
          output: '—',
          notes: 'League-context-agnostic; could be percentile-based across the player pool.'
        },
        {
          id: 'heur-9-heatmap-contrast',
          label: '56-9. Heatmap text-contrast at 35%',
          location: 'assets/js/heatmap.js',
          inputs: '—',
          math: 'textColor = v >= 35 ? "#111" : "rgba(255,255,255,.5)"',
          output: '—',
          notes: 'Arbitrary; could be derived from WCAG contrast ratio against the actual bg alpha.'
        },
        {
          id: 'heur-10-mvs-zero-fp-fallback',
          label: '56-10. MVS overlay zeros out FP players not in MVS',
          location: 'assets/js/data-bootstrap.js:191-194',
          inputs: '—',
          math: `Object.values(FP).forEach(rec => {
  if (overlaid.has(rec)) return;
  rec.value = 0; rec.valueSf = 0; rec.value1qb = 0;
});`,
          output: '—',
          notes: 'Intentional but means stale value-only players show 0 across the calc, not the FP fallback.'
        },
        {
          id: 'heur-11-3way-balance',
          label: '56-11. 3-way trade balance uses different denominator',
          location: 'trade-calculator.html:2497',
          inputs: '—',
          math: '2-way: pctOff = abs / max(t0,t1); 3-way: pctOff = gap / sorted[0].total',
          output: '—',
          notes: 'Edge-case divergence — see entry 6.'
        },
        {
          id: 'heur-12-mvs-tep-alias',
          label: '56-12. MVS valueTep aliased to valueSf (no real TEP)',
          location: 'assets/js/data-bootstrap.js:203',
          inputs: '—',
          math: 'valueTep: rec.valueSf  // alias',
          output: '—',
          notes: 'MVS picks have no real TEP data; SF+TEP mode just shows SF value. Real TEP exists for picks.json (2025-only).'
        },
        {
          id: 'heur-13-misnamed-avg',
          label: '56-13. `leagueAvg` is a median, not a mean',
          location: 'my-leagues.html:5093-5174',
          inputs: '—',
          math: 'See entry 21.',
          output: '—',
          notes: 'Misleading variable name. Worth noting when explaining the archetype logic to analysts.'
        },
        {
          id: 'heur-14-val-color-collapse',
          label: '56-14. valColor has duplicate green branches',
          location: 'my-leagues.html:6292',
          inputs: '—',
          math: 'v > 8000 → green; v > 5000 → green;  // duplicate branches',
          output: '—',
          notes: 'Cosmetic artifact of the brand-color audit (originally had a separate light-green mid-shade, collapsed to brand green in commit fca6d0e). Effectively one threshold at 2000.'
        }
      ]
    }

  ]
};
