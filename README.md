# Fantasy Points Front Office — Session Handoff

A static fantasy-football site deployed via GitHub Pages from `main`.
Four HTML pages today: `index.html` (trade DB), `trade-calculator.html`, `tiers.html`, `my-leagues.html`. A fifth page (`adp-tool.html`) is in progress.

Full operator manual: [`docs/WORKFLOW.md`](docs/WORKFLOW.md). This file is the
**resume-where-we-left-off** doc.

---

## Where we are (end of 2026-05-11 session)

**Big change this session: dynasty ADP + auction now come from your own data pipeline, not the FP API.**

You ran `01_ingest_historical.ipynb` in `C:\Users\deons\Desktop\sleeper_dynasty_adp\scripts_or_notebooks` to mine ~1,800 real dynasty drafts and ~856 real dynasty auctions. That feeds a new `sync-adp.py` script in this repo which writes three new JSON files the site consumes.

### New data architecture

```
sleeper_dynasty_adp/  (separate desktop folder, your data factory)
  └─ data/snapshots/
       ├─ adp_time_series_ALL.parquet      (219k rows, 7 monthly buckets)
       ├─ auction_price_series_ALL.parquet (34k rows, real auction prices)
       └─ draft_catalog_ALL.parquet        (36k drafts metadata)
  └─ data/raw/picks/picks_2026.parquet     (2M picks, fuels heatmap)
                ↓
        sync-adp.py  (this repo, gitignored)
                ↓
  data/adp.json               per-player ADP, monthly + ALL buckets, by view (startup_sf/1qb/rookie)
  data/auction.json           per-player auction price ranges (avg/med/min/max) from real dynasty auctions
  data/pick-availability.json per-player [round][slot] -> probability heatmap, top-300 players
```

### Per-data-field source-of-truth (current)

| Field | Source |
|---|---|
| `value`, `valueSf`, `valueTep`, `rank`, `posRank`, `trend`, `tier` | Fantasy Points API → `data/values.json` (via `sync-fp.py`) |
| `age`, `team`, `pos`, `injury`, `ppg`, `sleeperId` | Sleeper API → `data/values.json` (via `sync-fp.py` overlay) |
| `adp` (1QB + SF) | sleeper_dynasty_adp parquets → `data/adp.json` (via `sync-adp.py`) |
| `auction`, `auctionSf` | sleeper_dynasty_adp parquets → `data/auction.json` (via `sync-adp.py`) |
| Pick availability heatmap | sleeper_dynasty_adp parquets → `data/pick-availability.json` (via `sync-adp.py`) |
| Articles | Fantasy Points API → `data/articles.json` |
| Tier rankings, buy/sell, priority, contender, notes | Google Sheet → `tiers.html` (via `sync-tiers.py`) |
| Roster data (my-leagues) | Sleeper API at runtime |
| Trade corpus | **Still synthetic** (placeholder — pending real trade source) |

### Tasks completed in this session

- [x] #16 Inspect parquet schemas in sleeper_dynasty_adp
- [x] #17 Build `sync-adp.py` (reads parquets, produces 3 JSON files)
- [x] #18 Strip FP's ADP + auction values from `data/values.json` output (FP endpoints still called for name/rank resolution)
- [x] #19 Add sync-adp step to `push.bat` (5-step pipeline now)
- [x] #20 Wire `index.html` / `my-leagues.html` / `trade-calculator.html` bootstraps to fetch + apply the new ADP/auction shape

### Tasks remaining (UI build for `adp-tool.html`)

- [ ] #21 Scaffold `adp-tool.html` (brand + nav + shell, no functionality yet)
- [ ] #22 Build Box + List views with Picks/Simple/Rookies mode toggle
- [ ] #23 Modal player card on adp-tool.html (lift from index.html, mount into modal)
- [ ] #24 Build Pick Availability heatmap component (round × slot grid, dropoff bars, expected-pick callout)
- [ ] #25 Wire heatmap into player card on every page (index, calc, my-leagues, adp-tool)
- [ ] #26 Filters drawer + Settings drawer on adp-tool.html

These are the big UI lifts. Probably 2–4 focused sessions.

---

## Before doing anything else in the next session

**Run `push.bat`** to ship what's already done. Uncommitted changes on disk include `sync-adp.py`, all three updated bootstraps, README, push.bat, .gitignore. Once it deploys, smoke-test:

- Player cards (any page): the **Auction** stat should now show real dynasty auction values like `$84`, `$76`, `$1` — these are medians from real Sleeper dynasty auctions, not FP's redraft-flavored numbers.
- Player cards: the **Dynasty ADP** stat should reflect dynasty 1QB draft ADP (Josh Allen ≈ 6, Bijan ≈ 4, Drake Maye ≈ 5).
- Nothing else should change visually — the data feed swapped, the rendering didn't.

---

## How to start the next Claude Code session

Paste this as the first message:

```
Read README.md to see where we left off. Confirm the deploy went through
by running `git log --oneline -5` and `git status`. We're picking up at
task #21 (scaffold adp-tool.html). Look at the visual references in
images shared previously: ADP Startup board (Box view), ADP List view,
Pick Availability heatmap. Same branding as the other 4 pages — Kanit
ExtraBold Italic display, Mulish body, --red = #ED810C accent.
```

If anything in `data/*.json` is stale, also run `python sync-adp.py` and `python sync-fp.py` to refresh.

---

## Top commands

| What | Command |
|---|---|
| Deploy everything (the 90% command) | `push.bat` |
| Preview locally | `start.bat` → opens http://localhost:8000/ |
| Refresh dynasty ADP + auction + heatmap | `python sync-adp.py` |
| Refresh FP + Sleeper values | `python sync-fp.py` |
| Refresh tier rankings from Google Sheet | `python sync-tiers.py` |
| Re-ingest Sleeper drafts (slow, ~30 min) | `cd ../sleeper_dynasty_adp/scripts_or_notebooks ; python 01_ingest_historical.py` |

Full reference: `docs/WORKFLOW.md`.

---

## File map

- **`index.html`** — trade database (largest, ~8500 lines; use Grep/offsets, never read in full)
- **`trade-calculator.html`** — trade value calculator
- **`tiers.html`** — dynasty trade tiers
- **`my-leagues.html`** — Sleeper user/league importer
- **`adp-tool.html`** — *planned, not yet built* (new page for tasks #21–#26)
- **`sync-fp.py`** — FP + Sleeper sync (local-only, gitignored)
- **`sync-adp.py`** — dynasty ADP/auction/heatmap sync from parquet (local-only, gitignored)
- **`sync-tiers.py`** — Google Sheet → tiers.html (local-only)
- **`import-tat.py`** — TAT CSV → Google Sheet (local-only)
- **`push.bat`** — 5-step deploy pipeline (local-only)
- **`sync-adp.config.json`** — paths to your sleeper_dynasty_adp folder (local-only)
- **`docs/WORKFLOW.md`** — full operator manual
- **`docs/function-reference.html`** + **`.pdf`** — printable function reference

---

## Outside-the-repo dependency

This site now depends on data produced by `C:\Users\deons\Desktop\sleeper_dynasty_adp` (a separate repo/folder on your desktop). If those parquet files go stale, run the notebook there. The notebook itself talks to the Sleeper API directly (no auth) and produces the parquet files; `sync-adp.py` in this repo reads them.

When the auction or ADP data gets stale, the refresh cycle is:

```powershell
# Step 1: pull fresh dynasty data (15-30+ min)
cd C:\Users\deons\Desktop\sleeper_dynasty_adp\scripts_or_notebooks
python 01_ingest_historical.py

# Step 2: come back here, deploy
cd C:\Users\deons\Desktop\05_11_26 dynasty Tool\FPTS-Trade_Database
push.bat
```
