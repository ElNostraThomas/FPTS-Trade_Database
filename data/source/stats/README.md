# Data Suite stats CSVs

Drop the per-player season-stats CSV exports from the data suite here. Whether to commit the CSVs alongside the generated `data/stats.json` is your call — the existing sibling directories (`data/source/rankings/`, `data/source/analysts/`) DO commit their source CSVs; if your data-suite license is more restrictive, add an explicit `.gitignore` entry for `data/source/stats/*.csv` before committing.

## Workflow

1. Export CSV from the data suite (one file per season is fine; multiple sources can be merged).
2. Save the file to this directory.
3. Copy `sync-stats.config.example.json` → `sync-stats.config.json` in the repo root.
4. Edit `sync-stats.config.json` so the **right-hand side** of each `"fields"` entry matches your CSV's actual column header text (left-hand side names are the canonical names downstream code reads — don't change those).
5. Run `python sync-stats.py` from the repo root.
6. Verify `data/stats.json` looks right (player count, sample record fields).

The script fails loudly if a required field is missing, or fewer than 50 players are parsed (catches a broken header row).

## Canonical field names

The downstream consumers (`live-draft.html`, `my-leagues.html` via `sleeper-helpers.js`) read these fields off each player record. Map your CSV column to whichever canonical names you have data for:

- `name` (REQUIRED) — player full name
- `team` — NFL team abbreviation (e.g. `LV`, `KC`)
- `pos` — position (`QB` / `RB` / `WR` / `TE`)
- `sleeperId` — Sleeper player_id (when present, used as the stable key; falls back to normalized name when absent)
- `games` — games played
- `passAtt`, `passCmp`, `passYards`, `passTd`, `passInts` — passing
- `rushAtt`, `rushYards`, `rushTd` — rushing
- `targets`, `rec`, `recYards`, `recTd` — receiving
- `fumbles` — fumbles lost

Fields not present in the CSV are simply skipped — downstream code reads each field defensively and falls back to Sleeper `/projections` when the data-suite record is missing.

## What's tracked vs local

- `sync-stats.py` — local-only (gitignored, like every other `sync-*.py`).
- `sync-stats.config.json` — local-only (gitignored, like every other `sync-*.config.json`).
- `sync-stats.config.example.json` — tracked. Copy → edit → run.
- `data/stats.json` — tracked (this is what the live site reads).
- `data/source/stats/*.csv` — your call (see opening paragraph).
