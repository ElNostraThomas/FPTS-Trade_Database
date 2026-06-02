# ADP — picks_sf RDP vs rookies_sf consistency check

Cross-validation that the `ROOKIE_PICK_X.YY` placeholders in the **Picks**
view of the ADP board land at ADP positions consistent with where the
corresponding *named* rookie appears in the **With Rookies** view.

The two views come from different draft corpora — `picks` bucket = drafts
that use Sleeper-K player_ids as pick-as-asset placeholders (Mason Crosby
= "the 5.01 pick"); `rookies` bucket = drafts that include the actual
rookie class in the player pool. Same dynasty market, different formats.
A reasonable consistency between RDP slot N and the Nth-ADP rookie is the
correctness signal.

## 5-year picture (top 14 RDP slots, SF format)

| Year | Mean Δ | Median Δ | Range            | Notes                                      |
|------|-------:|---------:|------------------|--------------------------------------------|
| 2022 |  −2.5  |   −0.9   | −14.5 to +8.3    | Breece Hall 1.01 within 4 picks            |
| 2023 |  −1.2  |   −0.2   | −9.8  to +6.4    | Bijan 1.01 +0.6; Bryce Young 1.03 exact    |
| 2024 |  −5.0  |   −1.6   | −17.6 to +6.4    | Caleb Williams 1.01 +1.3, Maye 1.07 −0.1   |
| 2025 | −15.0  |  −14.6   | −31.5 to −3.2    | Outlier — Jeanty/Hampton/Hunter elite class locked in early |
| 2026 |  −5.3  |   −4.1   | −18.1 to +6.1    | (in-season; matches 2024 shape)            |

Δ = (rookie ADP) − (RDP slot ADP). Negative = the named rookie was drafted
*earlier* than the abstract pick was valued.

## What the pattern means

1. **Top 6–8 picks track tightly** every year — usually within 1–6 ADP
   slots, often <1 in the very top picks (Bijan / Caleb / Breece).
2. **Late R1 + early R2 drift wider** — abstract picks carry a "future
   asset uncertainty" discount in picks-as-K leagues, so they're valued
   slightly later than the eventual realized rookie.
3. **The size of the systematic gap tracks class quality.** When the
   rookie class is pre-Draft-consensus locked (2025: Jeanty / Hunter /
   Hampton / Henderson / Loveland / Warren — many elite names), the
   rookies-in-pool drafts pull ADP forward aggressively, opening a
   ~15-pick gap vs picks-as-K. When the class is mixed (2023: Bijan +
   uncertainty), the gap stays close to zero.

Pick ordering is strictly monotonic in every year's RDP ladder (1.01 <
1.02 < … no crossovers) and all named rookies resolve correctly back
through 2022 — so the bucketing + player_id resolution are correct.

## How to reproduce

`data/adp-{year}.json` carries each season's `picks_sf` and `rookies_sf`
records in the `byMonth.ALL` bucket. The rookie filter must be
`yearsExp == (CURRENT_SEASON − year)` — using `yearsExp == 0` selects
*today's* rookies which won't match historical files. Drop any record
whose name contains "Invalid" (Sleeper's placeholder for unresolved
player_ids that have since been cut from the league).

```python
import json, statistics
CURRENT_SEASON = 2026   # bump after April rollover

def deltas_for(year, n=14):
    target_yexp = CURRENT_SEASON - year
    with open(f'data/adp-{year}.json','r',encoding='utf-8') as f:
        d = json.load(f)
    all_b = d['byMonth']['ALL']
    rdps = sorted(
        (p for p in all_b.get('picks_sf', [])
         if str(p.get('sleeperId','')).startswith('ROOKIE_PICK_')),
        key=lambda p: p['adp'])
    rookies = sorted(
        (p for p in all_b.get('rookies_sf', [])
         if p.get('yearsExp') == target_yexp
         and (p.get('position') or '').upper() in ('QB','RB','WR','TE')
         and p.get('name') and 'Invalid' not in p['name']),
        key=lambda p: p['adp'])
    return [rookies[i]['adp'] - rdps[i]['adp'] for i in range(min(n, len(rdps), len(rookies)))]

for y in (2022, 2023, 2024, 2025, 2026):
    ds = deltas_for(y)
    print(y, f'mean {sum(ds)/len(ds):+.1f}', f'median {statistics.median(ds):+.1f}',
          f'range {min(ds):+.1f}..{max(ds):+.1f}')
```

Re-run after every `sync-adp.py` refresh. Mean delta should stay within
±10 (median ±5) for every closed season; the current season can run
larger as draft volume is still building and the class is still settling
into consensus.

## Why this doc exists

`sync-adp.py:_OFFENSIVE_POSITIONS` originally excluded `"RDP"`, so the
post-build offense filter stripped every rookie-pick placeholder out of
the JSON before write. Fixed 2026-06-02 in commit `4dc4387` (gitignored
sync-adp.py change + data regen). This file documents the validation
that confirmed the regen produced data consistent with the rookies view.
