# Request to data provider: extend `recent_trades` schema

The current `player_market_mvs_rows.csv` carries enough per-trade context to display:

- date / transaction_id
- both sides + every asset (name, MVS, baseline, position, isPick)
- format (`sf` / `1qb`)

But the Front Office trade-card UI has historically also surfaced **league context** for each observed trade. Those fields are filter chips and visible badges on every trade card. Without them, those UI affordances are hidden.

## Fields we need added per trade entry

When you regenerate the `recent_trades` JSON column, please include these per-trade fields alongside the existing `date / sides / format / transaction_id`:

| Field | Type | Source on Sleeper | Example |
|---|---|---|---|
| `teams_count` | int | `league.total_rosters` | `12` |
| `starters` | int | `league.roster_positions.length` (count of non-bench slots) | `10` |
| `roster_size` | int | `league.roster_positions.length` (total slots, incl. bench/IR) | `25` |
| `ppr` | string | `league.scoring_settings.rec` → `"1"` / `"0.5"` / `"0.25"` / `"0"` | `"1"` |
| `tep` | string | `league.scoring_settings.bonus_rec_te` → `"none"` / `"0.25"` / `"0.5"` / `"0.75"` / `"1.0"` | `"0.5"` |
| `passtd` | int | `league.scoring_settings.pass_td` | `4` |
| `faab_budget` | int or null | `league.settings.waiver_budget` (null if free-agent waivers, not FAAB) | `100` |
| `week` | int or null | NFL week of trade date (1-18 regular, 19+ playoffs) | `9` |

## Why each one matters

- **teams_count + starters + roster_size** — segments trade behavior by league depth. 12-team trades behave differently from 8-team trades.
- **ppr + tep + passtd** — scoring deeply changes player valuations. TEP especially distorts the TE position.
- **faab_budget** — many trades include FAAB; without it, the trade looks incomplete.
- **week** — orients each trade in the NFL season (early dynasty trades vs. midseason rentals vs. playoff push).

## Backward-compatibility note

If the field is unknown for older trades, populate as `null`. The site is now null-tolerant: filters treat null as a wildcard and badges only render when the field is present.

## Schema example after extension

```json
{
  "date": "2026-05-06T15:05:14.439Z",
  "transaction_id": "1357618240385220608",
  "format": "sf",
  "teams_count": 12,
  "starters": 10,
  "roster_size": 25,
  "ppr": "0.5",
  "tep": "0.5",
  "passtd": 4,
  "faab_budget": 100,
  "week": 9,
  "sides": [
    { "roster_id": 32, "assets": [...] },
    { "roster_id": 30, "assets": [...] }
  ]
}
```

Once these fields appear in the CSV, the existing filter dropdowns in the Trade Database (qb / starters / teams / TEP / PPR / FAAB / pass-TD / roster size / date / asset count) automatically light up — no code change required.
