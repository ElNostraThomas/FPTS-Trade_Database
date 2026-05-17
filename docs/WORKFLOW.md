# Fantasy Points Front Office — Workflow Reference

Operator's manual. Indexed by "**I want to do X**" so you can find your command fast.

All commands assume you're in the repo root:
`C:\Users\deons\Desktop\05_11_26 dynasty Tool\FPTS-Trade_Database`

---

## 🚀 The one command you'll run 90% of the time

```powershell
push.bat
```

**What it does**, in order:
1. **[1/5]** `sync-adp.py` — rebuilds `data/adp.json`, `data/auction.json`, `data/pick-availability.json` from the sleeper_dynasty_adp parquets (your local data factory).
2. **[2/5]** `sync-fp.py` — pulls fresh data from the Fantasy Points API (5 endpoints) + Sleeper API (players + stats) → rewrites `data/values.json`, `data/picks.json`, `data/articles.json`, and the internal `data/rank-history.json` state file.
3. **[3/5]** `sync-tiers.py` — pulls fresh data from your Google Sheet "New SF Tier System" → rewrites the `TIER_PLAYERS` block inside `tiers.html`.
4. **[3b/5]** `sync-mvs.py` — rebuilds `data/mvs.json` from `data/source/player_market_mvs.csv` (player + pick MVS values).
5. **[4/5]** `make-pdf.ps1` — regenerates `docs/function-reference.pdf` from the source HTML.
6. **[5/5]** Checks for changes — if nothing changed, **exits without prompting** (zero-friction no-op). Otherwise shows the diff, runs three non-blocking sync-check warnings (modal-sections / panel-css / legend-sync), asks for a commit message (press **Enter** to accept the default `Update site + refresh data`), commits, pushes to GitHub Pages — site redeploys in ~2 minutes.

**If any sync step fails**, push.bat aborts before commit. You'll never accidentally ship a broken or stale site.

**Run this after any change.** Code edit, data edit, brand tweak — `push.bat` covers it all.

---

## Every workflow, ordered by frequency

### 1. Update tier rankings (most common)

**A. Hand-edit the Google Sheet** (small tweaks, single players moving tiers)

1. Open your Google Sheet "Fantasy Points Trade Tiers (03/19/26)".
2. Drag players between tier sections, edit any column.
3. Save (it auto-saves).
4. Run `push.bat` — `sync-tiers.py` reads the sheet and updates `tiers.html`.

**B. Bulk import a new TAT CSV** (whole new ranking cycle)

1. Save the new TAT CSV to your `Downloads` folder (filename starts with `TAT`).
2. Run:
   ```powershell
   python import-tat.py
   ```
   Auto-detects the newest `TAT*.csv` in Downloads, **merges** the new tier assignments into your Google Sheet (keeps Age/ADP/Auction/PPG/Buy-Sell/Priority/Contender/Notes you've already filled in).
3. Run `push.bat` to deploy.

**Modes** for `import-tat.py`:
- `python import-tat.py` — default merge (preserves your hand-filled columns)
- `python import-tat.py --dry-run` — preview what would change, no upload
- `python import-tat.py --replace path/to.csv` — full overwrite of the sheet (loses hand-filled data)
- `python import-tat.py --whoami` — print the service-account email if you need to re-share the sheet

### 2. Edit a page (HTML / CSS / JavaScript)

1. Open the relevant `*.html` file in your text editor.
2. Save.
3. Test locally first:
   ```powershell
   start.bat
   ```
   Opens `http://localhost:8000/index.html` in your browser. Click around, confirm nothing's broken.
4. Run `push.bat`.

The 4 main pages:
- `index.html` — Trade Database (hub)
- `my-leagues.html` — Sleeper League Importer
- `tiers.html` — Dynasty Trade Tiers (data is auto-synced; don't hand-edit the `TIER_PLAYERS` block)
- `trade-calculator.html` — Trade Calculator

### 2b. Add a new page or tool

The repo ships a scaffold so new pages inherit every shared pattern (data, ADP, heatmap, trades, position colors, slide-out drawer, articles, legend) automatically. You should never have to re-wire any of those by hand.

1. **Copy the scaffold**:
   ```powershell
   copy templates\page-template.html your-new-page.html
   ```
2. **Edit the three TODO markers** in your new page:
   - `<title>` — browser-tab title.
   - `window.FPTS_CURRENT_PAGE = 'newpage';` — a short slug.
   - `<main id="page-body">` — the page's unique markup.
3. **Add the page link to the nav block** in the new page itself **AND** in all 5 existing pages (`index.html`, `trade-calculator.html`, `my-leagues.html`, `tiers.html`, `adp-tool.html`). One-time manual step; the nav has matching `<a class="nav-link">` entries plus a mobile `<select>` `<option>`.
4. **Write page-specific code** inside the `document.addEventListener('fpts:data-ready', ...)` block at the bottom of the template. By the time that event fires:
   - Every `data/*.json` file has been fetched
   - Every `window.*` global is hydrated (FP_VALUES, PICK_VALUES, SLEEPER_IDS, ADP_PAYLOAD, AUCTION_PAYLOAD, MVS_PAYLOAD, PLAYER_ARTICLES, PICK_AVAILABILITY, PICK_AVAILABILITY_META)
   - The shared player-panel drawer is ready: `window.openPanel('Bijan Robinson')` works
   - The heatmap renderer is ready: `window.Heatmap.render(el, sleeperId)` works
5. **Test locally**: `start.bat` → open `http://localhost:8000/your-new-page.html` and verify the page loads, the nav looks right, clicking any player opens the drawer with all 5 tabs.
6. **Deploy**: `push.bat`.

**What's shared** (the scaffold loads all of these — you never copy them into your page):
- `assets/css/brand.css` — color variables, fonts, nav, position pills, page chrome
- `assets/css/player-panel.css` + `assets/js/player-panel.js` — slide-out drawer
- `assets/css/heatmap.css` + `assets/js/heatmap.js` — pick-availability heatmap
- `assets/css/mvs-extras.css` + `assets/js/mvs-extras.js` — OTC/Baseline/Trade Volume header
- `assets/js/player-articles.js` — FantasyPoints article banner
- `assets/css/legend.css` + `assets/js/legend.js` + `assets/js/legend-content.js` — developer Legend drawer
- `assets/js/data-bootstrap.js` — the data layer (all 7 JSON fetches + window mirrors + `_apply*` helpers + `fpts:data-ready` event)

**What stays page-specific** (you write these):
- Your `<main id="page-body">` markup
- Your `fpts:data-ready` listener that reads the globals and renders your page
- Optional inline `<style>` for page-specific UI (anything that isn't brand-level)

**Skipping data sources**: If your page doesn't need certain JSON files, set `window.FPTS_DATA_OPTS = { skip: ['picks', 'mvs'] }` before the data-bootstrap script tag. Default behavior fetches everything — recommended unless you have a clear reason.

**The 5 existing pages** still carry their hand-rolled bootstrap blocks (predate the scaffold). They work as-is. Migrating any of them to use `data-bootstrap.js` is a separate cleanup that can happen whenever you next touch the page — it's a ~40-line subtraction.

### 3. Update the function reference doc (the printable PDF)

1. Edit `docs/function-reference.html` directly.
2. Run `push.bat`. `make-pdf.ps1` regenerates `docs/function-reference.pdf` automatically.

### 4. Refresh FP API data without pushing

If you want to see the latest API data locally without deploying:

```powershell
python sync-fp.py
```

Updates `data/*.json` in place. You can then `start.bat` to preview before pushing.

### 5. Refresh tier data without pushing

```powershell
python sync-tiers.py
```

Pulls from the Google Sheet and rewrites the `TIER_PLAYERS` block in `tiers.html`. Same standalone-test logic as above.

### 6. Regenerate the PDF only (without re-fetching anything)

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File make-pdf.ps1
```

Useful if you only edited `docs/function-reference.html` and want to preview the PDF without doing a full push.

### 7. Test the site locally

```powershell
start.bat
```

Opens `http://localhost:8000/index.html` in your default browser. The page hits `data/*.json` from your local filesystem — same as the deployed site. Useful for previewing changes before pushing.

To stop the server: close the PowerShell window that's running it, or press `Ctrl+C` in that window.

### 8. Rotate your FP API key

If someone gives you a new X-Source or Authorization value:

1. Open `sync-fp.config.json` in Notepad.
2. Replace the old `x_source` and/or `auth_token` values.
3. Save.
4. Test:
   ```powershell
   python sync-fp.py
   ```
5. Run `push.bat`.

### 9. Rotate the Google Sheets service account

1. Generate a new key from Google Cloud Console for the service account.
2. Save the JSON file to the repo root as `service-account.json` (overwrite the existing one).
3. If you changed which service account, re-share the Google Sheet with the new email (Editor access).
4. Test:
   ```powershell
   python sync-tiers.py
   ```
5. Run `push.bat`.

### 10. Add a new data source (future)

If FP adds new endpoints you want to use, or you want to add a new data input:

1. Open `sync-fp.py`, add another `fp_get(cfg, "/v2/your/new/endpoint")` call inside `main()`.
2. Build a new `data/your-new-data.json` write at the end of `main()`.
3. Open each HTML file that needs the new data, add a `fetch('data/your-new-data.json' + v)` line inside the existing `_fpBootstrap` block.
4. Reference the loaded data anywhere downstream.

### 11. Adding a new ADP filter (UI ↔ scrape coupling)

Driven by the **ADP scrape-coupling rule** in `assets/js/legend-content.js` header. The short version: any new filter on `adp-tool.html` needs the scrape pipeline to capture that dimension, or the filter silently returns empty results.

If you want to add a filter (e.g. PPR vs Half-PPR vs Non-PPR, or 10-team vs 12-team-only):

1. **Check the scrape captures it.** Look at `C:\Users\deons\Desktop\sleeper_dynasty_adp\scripts_or_notebooks\01_ingest_historical.py` — the per-draft / per-pick columns and the `compute_adp_time_series()` groupby (~line 466). If your dimension isn't there, add it:
   - To `draft_to_row()` / `picks_to_rows()` so it lands on the parquet rows.
   - To the groupby tuple so aggregated stats split on it.
2. **Re-run the ingest.** `cd` to the data factory, `python 01_ingest_historical.py`. ~30 min per season.
3. **Extend `sync-adp.py`'s build functions** (`build_adp`, `build_format_adp`, `build_auction`, etc.) so the new dimension shows up as a `view_key` in `adp.json` / `auction.json`.
4. **Re-run `sync-adp.py`** to regenerate year-stamped JSON files.
5. **Add the filter button(s)** to `adp-tool.html` controls bar; wire to `STATE.<newDim>`; teach `getSourceKey()` / `getActiveBucket()` to use the new dimension.
6. **Add the mapping** to the coupling-rule table in `legend-content.js` header so the next person sees it.

If a Sleeper API change removes a column a filter depends on, deprecate the filter in the UI before the next push — silent "no results" is worse than a missing toggle.

---

## File inventory — what every file is for

### The site (always tracked in git, deploys to GitHub Pages)

| File | Purpose |
|---|---|
| `index.html` | Trade Database — the hub |
| `my-leagues.html` | Sleeper user/league importer (accordion variant of shared player drawer) |
| `tiers.html` | Dynasty trade tiers table (data auto-synced from Google Sheet) |
| `trade-calculator.html` | Trade calculator |
| `adp-tool.html` | ADP Tool — Box/List views, Picks/Simple/Rookies toggles, pick-availability heatmap |
| `rankings.html` | Dynasty rankings, two modes (Consensus + By Analyst). Driven by `data/rankings/*.json` (consensus) and `data/analyst-rankings/*.json` (per-analyst). Replaces external FantasyPoints Rankings link. |
| `formulas.html` | Site-wide formula + calculation catalog. Renders from `assets/js/formulas-content.js`. Companion analyst-handoff doc at `docs/FORMULAS.md`. |
| `data/values.json` | Player trade values (auto-generated by `sync-fp.py`) |
| `data/adp.json` | Dynasty ADP per player (auto-generated by `sync-adp.py`) |
| `data/auction.json` | Per-player auction price ranges from real dynasty auctions (auto-generated by `sync-adp.py`) |
| `data/pick-availability.json` | Per-player [round][slot] → probability heatmap (auto-generated by `sync-adp.py`) |
| `data/picks.json` | Rookie pick values — `{value, valueSf, valueTep}` records per pick slot (auto-generated by `sync-fp.py`). 2025 only. |
| `data/mvs.json` | MVS player + pick values from local CSV (auto-generated by `sync-mvs.py`). Picks for 2026/2027/2028 ship here. |
| `data/articles.json` | Player → recent articles map (auto-generated by `sync-fp.py`) |
| `data/rankings/` + `data/rankings/manifest.json` | Consensus rankings per (analyst, format) combo — drives the Consensus mode on `rankings.html`. Auto-generated by `sync-rankings.py`. |
| `data/analyst-rankings/` + `data/analyst-rankings/manifest.json` | Per-analyst rankings split by position — drives the By Analyst mode on `rankings.html`. Auto-generated by `sync-analysts.py`. |
| `data/rank-history.json` | Sync-internal state file: rolling rank snapshots (per-date) used by the *next* `sync-fp.py` run to seed the `trend` field on `values.json`. Not fetched by any page directly (and `_applyAdpPayload` ultimately overwrites `trend` with ADP month-over-month delta). Snapshots > 90 days old are auto-pruned. |
| `assets/css/player-panel.css` + `assets/js/player-panel.js` | Shared right-edge slide-out player drawer used by all 7 pages |
| `assets/css/mvs-extras.css` + `assets/js/mvs-extras.js` | MVS header (OTC, baseline, trade volume, contributor rankings, recent-trades helpers) |
| `assets/js/player-articles.js` | Shared articles section (banner-style) used in every player drawer |
| `assets/css/heatmap.css` + `assets/js/heatmap.js` | Pick-availability heatmap component |
| `assets/css/legend.css` + `assets/js/legend.js` + `legend-content.js` | In-app developer legend drawer |
| `assets/js/adp-comparator.js` | Shared month-to-month ADP calendar popup module. Used by `tiers.html` (Previous-ADP column) and `rankings.html` (Consensus-mode ADP overlays). Each consumer passes its own `storageKey` + `onChange` callback. |
| `assets/js/formulas-content.js` + `assets/js/formulas.js` | Drive the Formulas page. Structured 56-entry catalog + renderer with provenance chips, worked examples, cross-link chips, and "why this number?" callouts. **Maintain in sync with `docs/FORMULAS.md` on every formula change** (see `CLAUDE.md`). |
| `assets/css/brand.css` | Canonical brand variables, fonts, top-nav, position pills, page chrome, **softened position palette** (deeper backgrounds + white text), **site-wide 125% body zoom** (mobile + print exempt). Header comment contains the **COLOR USAGE RULE** (8 categories) enforced by `scripts/check-colors.py`. |
| `assets/js/data-bootstrap.js` | Shared data layer: fetches every `data/*.json`, populates `window.FP_VALUES` / `PICK_VALUES` / `SLEEPER_IDS` / `ADP_PAYLOAD` / `AUCTION_PAYLOAD` / `MVS_PAYLOAD` / `PLAYER_ARTICLES` / `PICK_AVAILABILITY` / `PICK_AVAILABILITY_META`, fires `fpts:data-ready`. Used by new pages via the scaffold. |
| `assets/js/team-helpers.js` | NFL team logo helpers exposed on `window.TeamHelpers` — `logoUrl(team)`, `logoImg(team, opts)`, `headshotBadge(team, opts)`, `wrapWithBadge(html, team, opts)`. Sleeper-CDN-backed. **Convention:** chip contexts emit `logoImg(team, { size: 18 })` right of the player name. |
| `scripts/check-colors.py` | Pre-push brand color audit. Run `python scripts/check-colors.py` — exit 0 = clean, exit 1 = drift with file:line. Tracked in git so any new contributor can run it. |
| `templates/page-template.html` | Starter HTML for new pages. Copy + edit three TODO markers — see "Add a new page or tool" workflow above. |
| `docs/function-reference.html` | Source of the function reference (hand-edited) |
| `docs/function-reference.pdf` | Generated from the HTML by `make-pdf.ps1` |
| `docs/FORMULAS.md` | Site-wide formula + calculation catalog for analyst hand-off. Live companion: `formulas.html`. Maintain in sync with `assets/js/formulas-content.js`. |
| `docs/WORKFLOW.md` | This file |
| `docs/CHANGES.md` | Session-by-session changelog |
| `CLAUDE.md` | Per-project conventions for future Claude Code sessions (panel async-guard pattern, formulas dual-file sync rule, cache-bump rule). |
| `assets/fonts/` | Brand TTFs (Kanit, Mulish) |

### Local-only scripts (gitignored, never deploy)

| File | Purpose |
|---|---|
| `start.bat` | Run local dev server on `http://localhost:8000/` |
| `push.bat` | Full deploy pipeline (the command you run) |
| `make-pdf.ps1` | Headless-Chrome PDF generator |
| `sync-fp.py` | Fetch FP API + Sleeper API → write `data/*.json` |
| `sync-adp.py` | Read sleeper_dynasty_adp parquets → write ADP / auction / heatmap JSON |
| `sync-mvs.py` | Read local CSV → write `data/mvs.json` |
| `sync-tiers.py` | Fetch Google Sheet → write to `tiers.html` |
| `sync-rankings.py` | Read `data/source/rankings/*.csv` → write `data/rankings/*.json` + manifest (drives `rankings.html` Consensus mode) |
| `sync-analysts.py` | Read `data/source/analysts/*.csv` (each CSV holds 4 positions stacked, banner-delimited) → write `data/analyst-rankings/*.json` + manifest (drives `rankings.html` By Analyst mode) |
| `import-tat.py` | Upload TAT CSV → Google Sheet (merge mode) |

### Local-only secrets (gitignored, never deploy)

| File | Holds | Get from |
|---|---|---|
| `sync-fp.config.json` | FP API key (`x_source`, `auth_token`) | Your FP dev contact |
| `sync-tiers.config.json` | Google Sheet ID + tab name | The sheet URL |
| `sync-rankings.config.json` | Per-CSV source-path map (which CSV belongs to which analyst/format) | Local paths to your downloaded CSVs |
| `sync-analysts.config.json` | Per-analyst CSV source-path map | Local paths to your downloaded CSVs |
| `service-account.json` | Google Cloud service account credentials | Google Cloud Console |

### Templates (tracked in git — used to seed a new local setup)

| File | Use |
|---|---|
| `sync-fp.config.example.json` | Copy → `sync-fp.config.json`, fill in your key |
| `sync-tiers.config.example.json` | Copy → `sync-tiers.config.json`, fill in your sheet ID |

---

## Shared player-panel module

All seven pages route player clicks through one shared right-edge slide-out
drawer, mounted by `assets/js/player-panel.js` into `document.body` on first
`init()`. CSS lives in `assets/css/player-panel.css`.

**Public API:**
```js
window.PlayerPanel = {
  init(),                        // idempotent — auto-runs on DOMContentLoaded
  open(name),                    // open the panel for a player by name
  close(),                       // close it
  showTab(tabName),              // switch tab: 'trades' | 'stats' | 'curve' | 'finder' | 'heatmap'
  setCurrentPage(pageKey),       // tell it what host page it's on
};

// Backwards-compat globals:
window.openPanel(name);
window.closePanel();
window.ppShowTab(tabName);
```

**Required `window.*` globals (the shared accessors read these):**

- `window.FP_VALUES` — `{ [name]: { value, valueSf, ..., sleeperId, age, posRank, ... } }`
- `window.SLEEPER_IDS` — `{ [name]: sleeperId }`
- `window.PICK_VALUES` — `{ [key]: { value, valueSf, valueTep } }` (objects, not numbers)
- `window.MVS_PAYLOAD` — `data/mvs.json` payload (drives the Trades tab + MVS extras)
- `window.PLAYER_ARTICLES` — `{ [normalizedName]: [{title, url, date}, ...] }`
- `window.PICK_AVAILABILITY` — `{ [name]: [round][slot] }` (heatmap)
- `window.FPTS_CURRENT_PAGE` — `'db' | 'calc' | 'ml' | 'adp' | 'tiers'`

Each page bootstrap is responsible for fetching the JSON files, assigning
to its page-local `let` (so DOM-level CSS classes still work), AND
mirroring the same identity to `window.*` so the shared module sees it.
Failure to mirror = empty panel.

**Tabs:** every page has 5 tabs — Trades / Player Stats / Age Curve /
Trade Finder / ADP Heatmap. The Trades tab is auto-rendered by the panel
itself; the other four lazy-render on tab switch via `ppShowTab(name)`.

**Known quirk:** `ppShowTab('curve')` resolves to `'age-curve'` internally
and reads `#pp-age-curve-tab` which doesn't exist in the template. The
template uses `#pp-curve-tab`. ML works around this by calling
`window.renderAgeCurve('pp-curve-tab', player)` directly.

**League-context slot:** `<div id="pp-league-context">` lives outside the
scrollable tab area, with `flex-shrink:0`. DB / Calc / ADP / Tiers leave
it empty (the `:empty` CSS rule collapses it). My-Leagues populates it
post-open with the "On Your Roster" badge + "Availability Across Your
Leagues" section.

**My-Leagues accordion variant:** scoped via `body.fpts-ml-page` CSS in
`my-leagues.html`. The horizontal `.pp-tabs` strip is hidden; all 5 tab
bodies render as stacked accordion sections, each with a clickable
header button. A MutationObserver per tab re-injects the header if an
async renderer (notably `renderPlayerStats`, which fetches from Sleeper)
overwrites the tab's innerHTML and wipes it.

---

## Common troubleshooting

### "401 Unauthorized" when running `sync-fp.py`

Your `sync-fp.config.json` has wrong or missing auth.
- Open the file in Notepad.
- Check that `x_source` is the letters value and `auth_token` is the numbers value (not swapped).
- Make sure there are no stray spaces or quotes around the values.
- Re-run `python sync-fp.py`.

### "Permission denied" when running `sync-tiers.py` or `import-tat.py`

The service account needs Editor access on the Google Sheet (not just Viewer).
1. Run `python import-tat.py --whoami` to get the service-account email.
2. Open the sheet → Share → find that email → set to **Editor** → Save.

### `push.bat` says "Tiers sync failed - aborting"

`sync-tiers.py` couldn't reach the Google Sheet. Most often:
- The sheet ID in `sync-tiers.config.json` is wrong.
- Your service account lost access to the sheet.
- Network blip — try again.

To debug: run `python sync-tiers.py` standalone, look at the error.

### Page on the live site shows "Data load failed"

The `data/*.json` files didn't make it to the deploy.
- Open DevTools → Network tab on the live site, look for 404s on `data/*.json`.
- Run `python sync-fp.py` locally, confirm data files are generated.
- Re-run `push.bat`.

### My local edits don't show up after `push.bat`

GitHub Pages takes ~2 minutes to redeploy. Wait, then hard-refresh with `Ctrl+Shift+R` to bypass browser cache.

### Page is missing player data temporarily

The `_fp-loading` overlay should show "Loading…" for ~100ms while `data/*.json` files load. If it stays forever:
- Hard-refresh.
- Open DevTools → Network → look for failed `data/*.json` requests.
- Confirm those files exist in the deployed repo (`git ls-files data/`).

---

## What the user-visible "Front Office" branding is

- Wordmark: `FANTASY POINTS` (the SVG logotype) + `FRONT OFFICE` (CSS text in Kanit Extrabold Italic 800).
- Accent color: `#ED810C` (dynasty orange), bound to the `--red` CSS variable for backward compatibility.
- Brand fonts: Kanit ExtraBold Italic + Mulish variable. Self-hosted from `assets/fonts/`.

If FantasyPoints rebrands to "Dynasty Points", the only change needed is:
- Swap the wordmark SVG in each HTML file's nav.
- The `FRONT OFFICE` span stays.
- The `<title>` prefix changes.

---

## One-time setup (if you ever start from a fresh machine)

1. Clone the repo: `git clone https://github.com/<your-account>/<repo>.git`
2. Copy `sync-fp.config.example.json` → `sync-fp.config.json`. Paste your FP API key fields.
3. Copy `sync-tiers.config.example.json` → `sync-tiers.config.json`. Paste your Google Sheet ID.
4. Put your service-account JSON file at `service-account.json` in the repo root.
5. Install Python dependencies:
   ```powershell
   python -m pip install requests google-api-python-client google-auth
   ```
6. Test the syncs:
   ```powershell
   python sync-fp.py
   python sync-tiers.py
   ```
7. Test locally:
   ```powershell
   start.bat
   ```
8. Deploy:
   ```powershell
   push.bat
   ```

---

## Quick command index

| Goal | Command |
|---|---|
| Deploy everything | `push.bat` |
| Preview locally | `start.bat` |
| Refresh FP data only | `python sync-fp.py` |
| Refresh tier rankings only | `python sync-tiers.py` |
| Upload TAT CSV to sheet | `python import-tat.py` |
| Dry-run TAT upload | `python import-tat.py --dry-run` |
| Service-account email | `python import-tat.py --whoami` |
| Rebuild PDF only | `powershell -NoProfile -ExecutionPolicy Bypass -File make-pdf.ps1` |
| Audit colors against brand rule | `python scripts/check-colors.py` |

### `scripts/check-colors.py` — brand color audit

Exhaustive sweep that catches off-brand color drift across every `.html` /
`.css` / `.js` file in the repo. Walks every hex + rgba/rgb in every CSS
property value and JS color string, ignores `:root` declarations + SVG fills
+ legitimate non-chromatic uses (black shadows, white highlights, brand-RGB
rgba tints, gray fallbacks), and reports anything that survives those
filters.

Exit code 0 = clean, exit code 1 = drift found (with `file:line` + offending
value + suggested context). Recommended pre-push step before `push.bat` to
catch any new drift before it ships. Authoritative brand palette lives in
`assets/css/brand.css`'s COLOR USAGE RULE comment block — when adding a new
brand color there, also extend `BRAND_HEXES` / `LEGIT_RGBA_RGB` at the top
of `scripts/check-colors.py`.
