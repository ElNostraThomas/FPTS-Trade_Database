# Fantasy Points Front Office — Session Handoff

A static fantasy-football site deployed via GitHub Pages from `main`.
**Five HTML pages, all live and shipping:** `index.html` (trade DB),
`trade-calculator.html`, `tiers.html`, `adp-tool.html`, `my-leagues.html`.

Full operator manual: [`docs/WORKFLOW.md`](docs/WORKFLOW.md).
Session-by-session changelog: [`docs/CHANGES.md`](docs/CHANGES.md).
This file is the **resume-where-we-left-off** doc.

---

## Where we are (end of 2026-05-13 session)

**All five pages are wired to a shared player-panel slide-out drawer**,
My-Leagues uses an accordion variant of that same drawer, and **future
pages can now inherit every shared pattern via the scaffold** (one HTML
template + one bootstrap module — no more per-page boilerplate).

### What changed in 2026-05-13 (afternoon session)

- **Picks-bucket ADP fix.** The ADP Tool's Picks tab now shows real players
  + RDP placeholders intermixed (matching the data factory's `app_adp_board.py`
  behavior), instead of an RDP-only synthetic board. Rank 1 is Josh Allen
  (ADP 2.6); Rookie Pick 1.01 enters at rank 16 (ADP 16.0). Achieved by
  rewriting K player_ids to `ROOKIE_PICK_X.YY` in-place inside
  `build_format_adp` via the new `relabel_picks_K_to_rdp` helper.
  `classify_startup_drafts` was also tightened from "any K = picks" to
  "K in rounds 1..4 = picks" so vet-only leagues no longer pollute the bucket.
- **RDP heatmap entries.** `data/pick-availability.json` now contains 77
  Rookie Pick X.YY entries alongside the 300 real players. Built by the new
  `build_rdp_pick_availability` function which shares the per-(round, slot)
  probability math with `build_pick_availability` via the extracted
  `_availability_matrix_from_picks` helper. Frontend needed zero changes —
  `Heatmap.render` is entity-agnostic.
- **1QB toggle hidden on Picks mode** (`_applyPicksOneQbConstraint` in
  adp-tool.html). 2026 has only 4 qualifying 1QB picks-as-K drafts, below
  `min_drafts=5`. When the user switches to Picks, the 1QB button hides and
  qbFormat silently falls back to SF; switching to Simple or Rookies brings
  the toggle back.
- **RDP card styling** — `.box-card.RDP` / `.pos-pill.RDP` / `tr.RDP` now
  use the brand `--pos-pick-bg` (purple) instead of falling through to a
  black default. The orange flame thumbnail sits cleanly on the purple
  background; text inherits `--pos-pick` for matching contrast.
- **Heatmap "Data refreshed" stamp.** Every heatmap rendering across all 5
  pages now shows the source data's `version` date as a stat cell next to
  "Expected pick" and "Drafts sampled". Pulled from `window.PICK_AVAILABILITY_META`
  (newly stashed on every page's pick-availability fetch). The stamp is
  guaranteed in lockstep with the ADP refresh because `sync-adp.py` writes
  identical `version` timestamps to adp.json, auction.json, and
  pick-availability.json in the same invocation.
- **Page scaffold added** (no more boilerplate for future pages):
  - **`assets/js/data-bootstrap.js`** — shared data layer. Fetches all 7
    `data/*.json` files, populates 9 `window.*` globals
    (FP_VALUES, PICK_VALUES, SLEEPER_IDS, ADP_PAYLOAD, AUCTION_PAYLOAD,
    MVS_PAYLOAD, PLAYER_ARTICLES, PICK_AVAILABILITY, PICK_AVAILABILITY_META),
    runs `_applyAdpPayload` / `_applyAuctionPayload` / `_applyMvsPayload`
    helpers, fires `fpts:data-ready` event when done.
  - **`assets/css/brand.css`** — canonical brand variables, fonts, top nav,
    position pills, page chrome. Single source of truth (existing 5 pages
    still carry inline copies; they migrate when next touched).
  - **`templates/page-template.html`** — copy-this-to-start scaffold with
    three TODO markers (title, FPTS_CURRENT_PAGE slug, page-body content).
    See `docs/WORKFLOW.md` § "2b. Add a new page or tool" for the flow.

### What changed in 2026-05-12 / 2026-05-13 (morning session)

- **`adp-tool.html` and `tiers.html` are deployed.** ADP Tool has Box/List
  views, Picks/Simple/Rookies toggles, ADP heatmap. Tiers has the player
  modal mounted inline (no longer redirects to DB).
- **Shared player-panel module extracted** to
  `assets/css/player-panel.css` + `assets/js/player-panel.js`. Public API:
  `window.PlayerPanel.{init, open, close, showTab, setCurrentPage}` plus
  backwards-compat globals (`window.openPanel`, `window.ppShowTab`).
  Mounts itself into `document.body` on first `init()`.
- **DB / Calc / ADP / Tiers all route through the shared drawer** with the
  same 5 tabs (Trades / Player Stats / Age Curve / Trade Finder / ADP
  Heatmap). Per-page data is mirrored to `window.*` so the shared accessors
  find it.
- **My-Leagues uses an accordion presentation** of the shared drawer
  (scoped via `body.fpts-ml-page` CSS). All 5 tab bodies render stacked
  with collapsible headers; ADP Heatmap is expanded by default; state
  persists in `localStorage`. ML-specific "On Your Roster" badge and
  "Availability Across Your Leagues" section mount into the panel's
  `#pp-league-context` slot at the top. Fixed mid-session: the panel itself
  now scrolls (was bleeding wheel events to the page body).
- **Data-shape fix:** `data/picks.json` now stores per-pick records as
  `{value, valueSf, valueTep}` objects rather than flat numbers. The
  `mlPickValue` / `pickValue` accessors extract `.value` so all callers
  keep getting numbers.
- **My-Leagues archetype scoring** now uses a composite of player trade
  value (60%), pick value (20%), and season projection sum (20%), each
  normalized to the league median. Sort order is **Dynasty → Contender →
  Tweener → Rebuilder → Emergency** (most valuable first).
- **`data/projections.json` removed.** Was a 3.9 MB build-time orphan
  (never fetched by any page; my-leagues fetches Sleeper directly at
  runtime). `sync-fp.py` no longer writes it.

### Current architecture

```
sleeper_dynasty_adp/  (separate desktop folder — your data factory)
  └─ data/snapshots/ + data/raw/picks/
                ↓
        sync-adp.py  (this repo, gitignored)
                ↓
  data/adp.json   data/auction.json   data/pick-availability.json

FantasyPoints API → sync-fp.py → data/values.json + data/articles.json +
                                  data/picks.json + data/rank-history.json (internal)

CSV (player_market_mvs.csv) → sync-mvs.py → data/mvs.json

Google Sheet → sync-tiers.py → tiers.html
```

All page bootstraps:
- Fetch `data/*.json` on load (existing 5 pages still wire this inline;
  future pages use `assets/js/data-bootstrap.js` which does it for them)
- Mirror page-local globals (`FP_VALUES`, `SLEEPER_IDS`, `PICK_VALUES`, etc.) to `window.*`
- Bind a click handler that calls `window.openPanel(name)`
- (My-Leagues only) Schedule `_mlAfterPanelOpen()` to inject status badge + accordion

New pages skip all of the above — they include
`assets/js/data-bootstrap.js`, set `window.FPTS_CURRENT_PAGE`, and listen
for the `fpts:data-ready` event.

### Per-data-field source-of-truth

| Field | Source |
|---|---|
| `value`, `valueSf`, `valueTep`, `rank`, `posRank`, `trend`, `tier` | FP API → `data/values.json` (via `sync-fp.py`) |
| `age`, `team`, `pos`, `injury`, `ppg`, `sleeperId` | Sleeper API → `data/values.json` (overlay in `sync-fp.py`) |
| `adp` (1QB + SF) | sleeper_dynasty_adp parquets → `data/adp.json` (via `sync-adp.py`) |
| `auction`, `auctionSf` | sleeper_dynasty_adp parquets → `data/auction.json` (via `sync-adp.py`) |
| Pick availability heatmap (real players + RDP placeholders) | sleeper_dynasty_adp parquets → `data/pick-availability.json` (via `sync-adp.py`). 300 real players + 77 `ROOKIE_PICK_X.YY` entries; identical `version` timestamp as `adp.json`. |
| MVS values (player + picks) | Local CSV → `data/mvs.json` (via `sync-mvs.py`) |
| Articles | FP API → `data/articles.json` |
| Tier rankings, buy/sell, priority, contender, notes | Google Sheet → `tiers.html` (via `sync-tiers.py`) |
| Roster data (my-leagues) | Sleeper API at runtime |
| Trade corpus (player modal "Trades" tab) | `data/mvs.json` → `MvsExtras.buildRecentTrades` |

### Sticky known quirks

- **`ppShowTab('curve')` ID-resolution bug** in the shared panel: it
  resolves `'curve'` to `'age-curve'` and reads a non-existent
  `#pp-age-curve-tab`. My-Leagues bypasses this by calling
  `window.renderAgeCurve('pp-curve-tab', player)` directly. The other 4
  pages tolerate it because age-curve is rarely the active tab.
- **`renderPlayerStats` is async** (fetches Sleeper season stats). When
  it completes it overwrites `el.innerHTML`, which can wipe injected DOM
  like My-Leagues' accordion header. ML uses a MutationObserver + 300ms /
  1500ms timers to re-inject the header.
- **`data/picks.json` keys** can be either specific slot (`"2025-1.01"`)
  or generic round (`"2027-1"`). `mlPickValue` searches specific first,
  falls back to generic.
- **Cache-bust tokens** on shared asset URLs (`?v=1778670000` is the
  current generation) — bump when shared modules change so users get fresh
  JS/CSS. Each module has its own token (heatmap.js, player-panel.js, etc.)
- **1QB Picks bucket is genuinely sparse** — only 4 qualifying 2026 drafts
  used K-as-pick placeholders in 1QB leagues. The toggle is hidden on
  Picks mode until the scrape grows or year-specific ADP lands. Toggle
  reappears on Simple/Rookies.
- **RDP entities use synthetic Sleeper ids** (`ROOKIE_PICK_X.YY`) — they
  flow through `SLEEPER_IDS`, the player-panel drawer (avatar = brand
  flame, pos chip = "RDP"), and the heatmap exactly like real players.
  Real `sleeperId`s are numeric strings, so there's no collision.

---

## What's still on the punch list

Nothing structural. Polish / nice-to-haves only:

- [ ] **Rookie-draft-only ADP** — fourth bucket on the ADP Tool alongside
  Picks/Simple/Rookies. Data is half-built: `build_adp` already emits a
  legacy `rookie` view_key from drafts where `dynasty_class == 'rookie'`
  (≤6 rounds). Wiring it to a 4th mode button + `getActiveBucket` branch
  is the remaining work.
- [ ] **Expand the scrape's 1QB coverage.** 33 1QB startups in 2026 vs
  1,614 SF; need 1QB-active seed users in
  `sleeper_dynasty_adp/scripts_or_notebooks/01_ingest_historical.py`
  (line 30 `SEED_USERS`). Until then, the 1QB Picks toggle stays hidden.
- [ ] **Year-specific ADP** — keep current adp.json as "current year only"
  and add archival files like `data/adp-2025.json`, `data/adp-2024.json`
  for cross-year comparison without smearing player ADPs across career stages.
- [ ] **Migrate existing 5 pages to `data-bootstrap.js`**. They work as-is
  but each carries ~40 lines of inline bootstrap that could be replaced
  with a single `<script>` include. Do it page-by-page as you touch each one.
- [ ] `my-leagues.html` inline-style cleanup (~361 occurrences of
  `style="…"` could move to CSS classes). Pure refactor, deferred.
- [ ] Audit `push.bat` sync-check warnings — three currently fire
  (`tab-sync`, `chip-sync`, `legend-sync`) because their drift detectors
  were written for the old per-page tab functions which the shared-panel
  refactor retired. Either update the detectors or remove them.
- [ ] Trade corpus is now sourced from `data/mvs.json` (real
  transactions). Verify all five player modals display real recent trades.
- [ ] Visual polish pass after live use — typography balance, mobile
  viewport on each page, dark/light theme toggle on the new accordion.

---

## How to start the next Claude Code session

Paste this as the first message:

```
Read README.md for current state. We're at end-of-2026-05-13 with the
Picks bucket showing real players + RDP placeholders intermixed, an RDP
heatmap shipping in pick-availability.json with a "Data refreshed" stamp
on every heatmap, and a new page scaffold (assets/js/data-bootstrap.js +
assets/css/brand.css + templates/page-template.html) so future pages
inherit everything automatically. Confirm by running
`git log --oneline -10` — most recent commits should be the picks-bucket
fix + RDP heatmap entries + data-bootstrap scaffold.

Punch list is in README under "What's still on the punch list" — pick
one of those (rookie-draft-only ADP is the next obvious feature), or
surface a new issue you've noticed.
```

If `data/*.json` is stale: run `push.bat` (handles all five sync steps +
commit + push in one command).

---

## Top commands

| What | Command |
|---|---|
| Deploy everything (the 90% command) | `push.bat` |
| Preview locally | `start.bat` → opens http://localhost:8000/ |
| Refresh dynasty ADP + auction + heatmap | `python sync-adp.py` |
| Refresh FP + Sleeper values | `python sync-fp.py` |
| Refresh MVS values from CSV | `python sync-mvs.py` |
| Refresh tier rankings from Google Sheet | `python sync-tiers.py` |
| Re-ingest Sleeper drafts (slow, ~30 min) | `cd ../sleeper_dynasty_adp/scripts_or_notebooks ; python 01_ingest_historical.py` |

Full reference: `docs/WORKFLOW.md`.

---

## File map

### Pages
- **`index.html`** — trade database (largest, ~7000 lines; use Grep/offsets, never read in full)
- **`trade-calculator.html`** — trade value calculator
- **`tiers.html`** — dynasty trade tiers
- **`adp-tool.html`** — ADP Tool (Box/List/heatmap views)
- **`my-leagues.html`** — Sleeper user/league importer (accordion player drawer)

### Shared modules (under `assets/`)
- **`assets/css/brand.css`** — canonical brand variables, fonts, top nav, position pills, page chrome. Source of truth for new pages via the scaffold; 5 existing pages still inline-duplicate this CSS until migrated.
- **`assets/js/data-bootstrap.js`** — shared data layer. Fetches `data/*.json` + populates `window.*` globals + fires `fpts:data-ready`. Used by future pages; 5 existing pages still hand-roll their bootstrap until migrated.
- **`assets/css/player-panel.css`** + **`assets/js/player-panel.js`** — shared right-edge slide-out drawer (used by all 5 pages)
- **`assets/css/mvs-extras.css`** + **`assets/js/mvs-extras.js`** — MVS header (OTC, baseline, trade volume, contributor rankings, recent trades helpers)
- **`assets/js/player-articles.js`** — shared articles section (banner-style)
- **`assets/css/heatmap.css`** + **`assets/js/heatmap.js`** — ADP pick-availability heatmap (now with "Data refreshed" stamp)
- **`assets/css/legend.css`** + **`assets/js/legend.js`** + **`legend-content.js`** — in-app developer legend drawer

### Scaffold for new pages
- **`templates/page-template.html`** — copy-this-to-start scaffold. See `docs/WORKFLOW.md` § "2b. Add a new page or tool" for the flow.

### Sync + deploy (all gitignored, local-only)
- **`sync-fp.py`** — FP + Sleeper sync
- **`sync-adp.py`** — dynasty ADP/auction/heatmap from parquets
- **`sync-mvs.py`** — MVS values from local CSV
- **`sync-tiers.py`** — Google Sheet → tiers.html
- **`import-tat.py`** — TAT CSV → Google Sheet
- **`make-pdf.ps1`** — regenerates function-reference PDF
- **`push.bat`** — full deploy pipeline (5 sync steps + checks + commit + push)
- **`sync-adp.config.json`** / **`sync-fp.config.json`** / **`sync-tiers.config.json`** — local paths/credentials

### Docs
- **`docs/WORKFLOW.md`** — full operator manual
- **`docs/CHANGES.md`** — session-by-session changelog
- **`docs/function-reference.html`** + **`.pdf`** — printable function reference

---

## Outside-the-repo dependency

`C:\Users\deons\Desktop\sleeper_dynasty_adp` (separate folder) is the data
factory for dynasty ADP/auction/heatmap. The notebook there talks to the
Sleeper API directly and writes parquets; `sync-adp.py` in this repo
reads them.

When that data goes stale, the refresh cycle is:

```powershell
# Step 1: pull fresh dynasty data (15–30+ min)
cd C:\Users\deons\Desktop\sleeper_dynasty_adp\scripts_or_notebooks
python 01_ingest_historical.py

# Step 2: come back here, deploy
cd C:\Users\deons\Desktop\05_11_26 dynasty Tool\FPTS-Trade_Database
push.bat
```
