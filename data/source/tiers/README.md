# Tier data source

`sync-tiers.py` looks here for `tiers.csv` before falling back to the
Google Sheets API. Drop your latest Sheet export here and it becomes the
canonical source for `tiers.html` `TIER_PLAYERS` + `data/tiers.json`.

## Workflow

1. Open the FPTS Google Sheet ("New SF Tier System" tab)
2. (Optionally) paste a fresh DPP CSV in for bulk updates
3. Hand-edit ADP / Auction / PPG / Buy-Sell / Priority / Contender / Notes
4. **File → Download → Comma-Separated Values (.csv)**
5. Save / rename the file to **`data/source/tiers/tiers.csv`**
   (overwrite the existing one)
6. Run `push.bat`

`sync-tiers.py` will:
- Read the CSV (preferred — no Google API auth needed)
- Parse the same column layout as the Sheet
- Regenerate `tiers.html` `TIER_PLAYERS` array
- Regenerate `data/tiers.json` (which `data-bootstrap.js` hydrates as
  `window.TIERS_DATA` for every page)

## Why CSV instead of the Google API

- Versioned: `git log data/source/tiers/tiers.csv` shows every tier
  change with a diff
- No Google API auth required (the script's API path is now a fallback
  for setups that haven't migrated)
- Matches the existing CSV pattern used by `sync-stats.py`,
  `sync-rankings.py`, `sync-analysts.py`

## Between exports: use the admin scratchpad

If you spot a one-off tier change between Sheet exports, use the
admin-mode editor at `?admin=1` on tiers.html — it stores local
overrides in browser localStorage and overlays on top of `tiers.csv`
automatically. When you eventually re-export the Sheet, the local
overrides become redundant; clear them via the banner's "Clear all"
button.

## File expected shape

Whatever the Google Sheet exports as CSV. The parser is column-
header-aware (matches columns like `Tier`, `Player`, `Buy/Sell/Hold`,
etc.) so column order can shift without breaking the sync. See
`HEADER_ALIASES` in `sync-tiers.py` for the recognized headers.
