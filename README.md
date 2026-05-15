# Fantasy Points Front Office — Session Handoff

A static fantasy-football site deployed via GitHub Pages from `main`.
**Five HTML pages, all live and shipping:** `index.html` (trade DB),
`trade-calculator.html`, `tiers.html`, `adp-tool.html`, `my-leagues.html`.

Full operator manual: [`docs/WORKFLOW.md`](docs/WORKFLOW.md).
Session-by-session changelog: [`docs/CHANGES.md`](docs/CHANGES.md).
This file is the **resume-where-we-left-off** doc.

---

## Where we are (end of 2026-05-14 evening session)

**ADP Tool now has a year picker** (`2022 / 2023 / 2024 / 2025 / 2026`) —
historical years use the same rendering shell as the current year, with
season-aware rookie filtering and identical visual treatment. Years
2019-2021 were intentionally dropped because Sleeper's dynasty corpus
pre-2022 lacked format-bucket data (picks/simple/rookies variants) and
the boards looked structurally different.

**Team logos got a "coin" treatment** — every chip-context logo sits in
a circular translucent dark backdrop so team colors never clash with
position-pill colors. Trade Finder pos-pills have uniform `min-width: 30px`.
MVS Top Players / Risers / Fallers rows finally show team logos.

**tiers.html + trade-calculator.html migrated to `data-bootstrap.js`** —
2 of 5 pages now use the shared data layer; per-page bootstrap removed
(~180 lines combined). Tiers also got a Sleeper-API age fallback for
players who aren't in FP's `values.json` yet (fresh rookies).

**Design vocabulary glossary** added to `legend-content.js` header.
Documents what "pill / coin / chip / card / row / badge / thumb / flame"
each mean, plus the design tokens. Plus an "ADP scrape-coupling rule"
documenting that UI filters must have matching scrape dimensions.

### What changed in 2026-05-14 (evening session)

- **ADP year picker shipped.** `setYear()` swaps `ADP_PAYLOAD` /
  `AUCTION_PAYLOAD` / `PICK_AVAILABILITY` to the year's payload,
  re-applies the active date-preset against the new year's max-date
  anchor, updates topnav badge + tab labels, writes the year into the
  URL hash, re-renders. Year payloads are lazy-loaded and cached in
  `STATE._yearCache`. Year list lives in `availableYears` written by
  `sync-adp.py` to canonical `adp.json`.
- **Restricted to 2022-2026.** Older years had no format-bucket data
  (`picks_sf` / `simple_sf` / `rookies_sf` all empty) so they looked
  structurally different from 2026 — no Rookie Pick flame placeholders,
  no variant separation. `sync-adp.py` `seasons_to_export` defaults to
  `range(2022, current_season + 1)`. 9 stale year-stamped JSONs deleted.
- **Season-aware rookie filter.** `build_adp` / `build_format_adp` /
  `build_rookie_draft_pick_availability` now take `current_season` and
  `season` params and target `yearsExp == (current_season - season)` so
  past-year rookie tabs show that year's actual rookie class (Bijan in
  2023, Breece in 2022, etc.) instead of being filtered out because
  current Sleeper data shows them as 2-3 year vets.
- **Backend offense-only filter.** `_OFFENSIVE_POSITIONS = {QB,RB,WR,TE,K}`
  + `_filter_offense_inplace()` in `sync-adp.py`. Drops IDP / DST / P / FB
  records at write time so every year's JSON matches 2026's contract.
- **Team-logo coin** (`assets/css/brand.css`). `TeamHelpers.logoImg(team, { size, coin: true })`
  wraps the logo in a `.team-logo--coin` translucent dark circle so the
  logo never blends with the pos-pill behind it. Applied to every chip
  context (Trade Calc, Trade Finder, drawer hero, DB recent trades,
  Tiers table, My-Leagues roster). Box-card uses its own coin
  (`.card-team-logo` 26px); ADP-tool's list-view stays bare (its
  `.team-pill` provides separation).
- **MVS team-logo emit.** `renderTopPlayers()` (DB Most Traded Players +
  By Position) and `renderValueTracker()` (Top Risers / Top Fallers) now
  emit `TeamHelpers.logoImg` right of every player name — closing the
  trade-chip rule across these surfaces.
- **Uniform Trade-Finder pos-pills.** `.tf-asset .pos-badge` +
  `.tf-add-option .pos-badge` get `min-width: 30px` so QB / RB / WR / TE
  all sit at the same width despite Kanit's variable glyph widths.
- **My-Leagues exposure scroll fixed.** 200-player render cap lifted +
  `min-height: 0` added to `.ml-exposure-list` (classic flex-column
  scroll-fix idiom). User can hover the box and scroll all players.
- **Push.bat sync-check cleanup.** Stale `tab-sync` + `chip-sync`
  detectors removed (post-shared-panel refactor); `modal-sections` /
  `panel-css` / `legend-sync` kept.
- **Tiers Sleeper-API age fallback** (`tiers.html`). When `values.json`
  doesn't have a player's age (typically fresh rookies FP hasn't added
  yet like Eli Stowers), fetch `https://api.sleeper.app/v1/players/nfl`
  once per session, look up by sleeperId from `MVS_PAYLOAD.players`,
  compute age from `birth_date` if needed, re-render.
- **Tiers hot-fix entries in `tiers.html`.** Added Jayden Daniels to S+
  (manually); fixed `Coltson` → `Colston Loveland` and `Nick` → `Nicholas Singleton`
  spellings. ⚠️ These get wiped on next `sync-tiers.py` unless the
  Google Sheet is updated to match.
- **Page migrations.** `tiers.html` (-38 lines) and `trade-calculator.html`
  (-139 lines) migrated to `data-bootstrap.js` — first two of the 5
  existing pages on the scaffold. Pattern is now battle-tested for the
  remaining 3 (adp-tool, my-leagues, index).
- **Legend updates.** Design-vocabulary glossary + ADP scrape-coupling
  rule + IDP-exclusion convention all added to `legend-content.js`
  header. `docs/WORKFLOW.md` gained §11 "Adding a new ADP filter."

### What changed in 2026-05-14 (morning session — see CHANGES.md for full detail)

- **Site-wide headshot-fallback rule.** New canonical CSS rule in
  `assets/css/brand.css` covers every legacy fallback class
  (`.hs-fallback`, `.card-hs-fallback`, `.pp-hs-fallback`,
  `.cc-hs-fallback`, `.ml-pd-avatar-initials`) plus the new generic
  `.fpts-hs-fallback`. When a Sleeper headshot returns 403/404 (common
  for rookies whose photos haven't been uploaded yet), the page renders
  a neutral silhouette via SVG `background-image` and hides the initials
  text. **The convention going forward: every new headshot surface
  MUST emit `class="fpts-hs-fallback"` on its fallback element.**
  Existing JS callers in `index.html`, `trade-calculator.html`,
  `my-leagues.html`, and `assets/js/player-panel.js` have been opted in.
- **Season rollover trigger.** `sync-adp.py` auto-detects the season
  number (`year if today.month >= 4 else year - 1`) so the pipeline
  rolls over with the NFL Draft each April with no config edit. All
  year-bearing labels — tab titles, "With Rookies" subtitle, "SEASON
  {year}" nav badge across all 5 pages — drive from
  `ADP_PAYLOAD.season` via a shared `window.applySeasonBadge()` helper
  in `team-helpers.js`. The `sync-adp.config.json` `"season"` field is
  optional now and only honored as a manual override (for testing past
  seasons).
- **Rookie ADP filtered to incoming class only.** Both rookie ADP
  records (`rookie_draft_sf` / `_1qb`) and the rookie-draft heatmap now
  filter to players with `yearsExp == 0` and a real fantasy position,
  dropping veterans (Josh Allen, Tannehill, Watson, etc.) who
  occasionally appear in rookie drafts. 420 → 185 records SF.

### What changed in 2026-05-13 (late session)

- **Dynasty Rookie ADP tab** added to `adp-tool.html`. Two tabs in the
  page-header: **Dynasty Startup ADP 2026** (the existing view) and
  **Dynasty Rookie ADP 2026** (new). Underline-style, bold Kanit italic,
  orange underline on active. Year auto-rolls from `ADP_PAYLOAD.season`.
- **`sync-adp.py` `build_adp`** emits two new view-keys
  (`rookie_draft_sf`, `rookie_draft_1qb`) by duplicating
  `dynasty_class=='rookie'` rows and re-tagging by `is_superflex`. Legacy
  `rookie` view-key preserved for backward compat. Records in `data/adp.json`:
  420 (SF) + 114 (1QB) for 2026. Top-1 for both: Jeremiyah Love.
- **STATE refactor**: added `STATE.source` (`startup` | `rookie`) + a
  private `_cache` that parks the inactive tab's state. Two localStorage
  keys (`fpts-adp-startup-state`, `fpts-adp-rookie-state`) + URL hash
  gains `source=` param for sharing. Each tab keeps its own qbFormat,
  dates, view, snake, search, filters, sort, rounds, teamCount.
- **"Rookies" variant renamed to "With Rookies"** in the controls bar to
  disambiguate from the new tab. Data key (`rookies_*`) unchanged.
- **`.page-title` repurposed** as a smaller sub-mode descriptor below the
  tab strip (e.g. "Sub-view: Rookie-only drafts (≤6 rounds)").
- **Rookie tab defaults**: SF forced on first load, snake on, rounds=5.
  Picks/Simple/With-Rookies variant button row hidden on the rookie tab.

### What changed in 2026-05-13 (evening session)

- **NFL team logos everywhere a team is referenced.** New shared module
  `assets/js/team-helpers.js` exposes `TeamHelpers.{logoUrl, logoImg,
  headshotBadge, wrapWithBadge}` — pulled from Sleeper's CDN
  (`sleepercdn.com/images/team_logos/nfl/{team}.png`, same origin as
  player headshots). Replaces 3-letter team text (`ATL`, `PHI`, etc.)
  with logos in: ADP list-view team-pill column, box-card mirrored
  bottom-left circle (matches the 32px player headshot in the
  bottom-right), card-meta line, player-panel #pp-nfl-team slot, every
  trade-chip surface (DB recent trades, drawer Trades tab, drawer Trade
  Finder tab, Trade Calculator main asset-row chips), Tiers table team
  column, My-Leagues roster rows. Chip contexts now emit
  `logoImg(team, { size: 22, coin: true })` — the `coin: true` wraps the
  logo in a small white circular backdrop so team colors never clash
  with the pos-pill behind them. Falls back to plain text if
  `window.TeamHelpers` isn't loaded.
- **The "trade-chip rule":** any future surface that renders a player
  image next to their name MUST emit the team logo directly to the right
  of the name span via `TeamHelpers.logoImg(team, { size: 22, coin: true })`.
  Parent flex container uses `align-items: center` for vertical baseline.
  Tighter rows (My-Leagues) drop to `size: 16-18`. ADP-tool excludes the
  coin (its box-card uses `.card-team-logo`, its list-view uses
  `.team-pill`). Documented in `assets/js/team-helpers.js` header.
  Exempted: My-Leagues league-importer (user explicitly excluded for now).
- **Softened position palette** for less eye strain. Dark theme position
  backgrounds dropped from saturated brights (e.g. RB #4caf6e neon green)
  to deeper, muted tones (#2f6d44 forest). Position text flipped from
  dark `#111` to light `#f0f0f0` to maintain contrast on the darker
  backgrounds. Affected: WR `#3c6788`, RB `#2f6d44`, QB `#963a3a`, TE
  `#8c601a`, K/RDP/Pick `#5a5290`. Brand orange `--red: #ED810C` is
  untouched everywhere — wordmark, RDP flame, trend-down arrow all
  continue to pop.
- **Site-wide 125% layout zoom.** Added `body { zoom: 1.25 }` to
  `assets/css/brand.css` + the 5 pages' inline `<style>` blocks. Every
  page renders ~25% larger by default — names, headshots, chips,
  spacing all scale together; user interactions (click, drag, scroll)
  work normally because zoom integrates with browser hit-testing.
  Mobile (`<700px`) and print (`@media print`) are explicitly exempt so
  the existing mobile layout and the function-reference PDF render at
  100%. Known caveat: monitors narrower than ~1700px may see horizontal
  scroll on the ADP Box view (its `min-width:1500px` becomes ~1875px
  effective after the zoom).
- **Box-card team-logo + name layout iterated** to its final clean
  state: 26px team-logo circle in the bottom-left with `rgba(0,0,0,.1)`
  backdrop (matches the player-headshot circle exactly), 32px player
  headshot in the bottom-right, names flow left-to-right with right
  padding only (no truncation), trend chip centered in the meta row
  via symmetric padding. No element touches another.
- **Modal-hero badge removed** from the 80px player avatar in the panel
  hero. The team identity now lives only in the `#pp-nfl-team` slot
  next to the player name (with a 22px logo). The avatar reads cleaner.

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
- **Cache-bust tokens** on shared asset URLs (`?v=1778680008` is the
  current generation for `brand.css`, `1778680005` for `player-panel.js`,
  `1778680001` for `team-helpers.js`) — bump when shared modules change
  so users get fresh JS/CSS. Each module has its own token.
- **125% body zoom** is the new default. Browser zoom is transparent to
  most things, but two surfaces feel its effects: ADP Box view may need
  horizontal scroll on monitors narrower than ~1700px, and the slide-out
  drawer (1360px max-width) feels larger on small laptops. Rollback is
  a one-line CSS delete — see `assets/css/brand.css` "Site-wide 1.25x
  layout zoom" comment.
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

- [x] ~~**Rookie-draft-only ADP**~~ — shipped 2026-05-13 (late). The ADP
  Tool now has two top-level tabs (Dynasty Startup ADP / Dynasty Rookie
  ADP), with SF/1QB-split rookie data via `rookie_draft_{sf|1qb}` keys.
  Per-tab state + URL hash `source=` param. Variant button "Rookies" was
  renamed to "With Rookies" to avoid clash with the new tab.
- [x] ~~**Rookie-draft pick-availability heatmap**~~ — shipped same day.
  `sync-adp.py` `build_rookie_draft_pick_availability` writes a new
  `rookiePlayers` section to `data/pick-availability.json`; `heatmap.js`
  picks the map via `window.PICK_AVAILABILITY_SOURCE` flag set by
  `adp-tool.html` on `setSource()`.
- [ ] **Expand the scrape's 1QB coverage.** 33 1QB startups in 2026 vs
  1,614 SF; need 1QB-active seed users in
  `sleeper_dynasty_adp/scripts_or_notebooks/01_ingest_historical.py`
  (line 30 `SEED_USERS`). Until then, the 1QB Picks toggle stays hidden.
- [x] ~~**Year-specific ADP**~~ — shipped 2026-05-14 (evening). ADP Tool
  has a year-picker dropdown (2022-2026). Per-year files under
  `data/adp-{year}.json`, `data/auction-{year}.json`,
  `data/pick-availability-{year}.json`. Backend filters offense-only
  and uses season-aware rookie classification. Years 2019-2021 dropped
  because their data shape differs from 2026.
- [ ] **Migrate remaining 3 pages to `data-bootstrap.js`** —
  `tiers.html` and `trade-calculator.html` are done (2026-05-14 evening,
  -177 lines combined). Still to migrate: `adp-tool.html`, `my-leagues.html`,
  `index.html`. Pattern is proven; each is a near-mechanical repeat.
- [ ] `my-leagues.html` inline-style cleanup (~361 occurrences of
  `style="…"` could move to CSS classes). Pure refactor, deferred.
- [x] ~~Audit `push.bat` sync-check warnings~~ — done 2026-05-14
  (evening). Stale `tab-sync` + `chip-sync` detectors removed (their
  regex matched against retired per-page tab functions). The other
  three checks (`modal-sections` / `panel-css` / `legend-sync`) stay.
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
Read README.md for current state. End-of-2026-05-14:
- ADP Tool has two top-level tabs (Dynasty Startup ADP / Dynasty Rookie
  ADP). STATE.source ('startup'|'rookie') + per-tab _cache + two
  localStorage blobs (fpts-adp-{startup,rookie}-state) + URL hash
  `source=` param. setSource() flips PICK_AVAILABILITY_SOURCE so the
  shared heatmap module reads the right map.
- sync-adp.py emits rookie_draft_{sf,1qb} via duplicate-and-retag pass
  in build_adp, AND a separate rookie-draft pick-availability heatmap
  (rookiePlayers map in pick-availability.json) via
  build_rookie_draft_pick_availability. Both are filtered to incoming
  rookies only (yearsExp==0 + real position).
- Season is now auto-detected (year if month>=4 else year-1). All year
  labels drive from ADP_PAYLOAD.season via window.applySeasonBadge().
  Next April rolls automatically.
- Site-wide headshot-fallback rule lives in brand.css — emit
  class="fpts-hs-fallback" on any new headshot fallback element.
- "Rookies" startup variant renamed to "With Rookies" to disambiguate
  from the new top-level tab.
- Trade-chip rule still applies: any new player-image surface uses
  TeamHelpers.logoImg(team, { size: 22, coin: true }) right of the name.
  The coin opt wraps the logo in a light circular backdrop so team
  colors can't clash with the pos-pill behind them. ADP-tool excludes
  the coin (its own box-card and list-view already provide separation).

Confirm by running `git log --oneline -20`.

Punch list top: 1QB scrape expansion + per-tab SF/1QB split of the
rookie heatmap (currently mixed; SF dominates anyway).
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
- **`assets/css/brand.css`** — canonical brand variables, fonts, top nav, position pills, page chrome, **125% body zoom**. Source of truth for new pages via the scaffold; 5 existing pages still inline-duplicate this CSS until migrated.
- **`assets/js/data-bootstrap.js`** — shared data layer. Fetches `data/*.json` + populates `window.*` globals + fires `fpts:data-ready`. Used by future pages; 5 existing pages still hand-roll their bootstrap until migrated.
- **`assets/js/team-helpers.js`** — NFL team logo helpers (`logoUrl`, `logoImg`, `headshotBadge`, `wrapWithBadge`). Sleeper-CDN-backed PNGs at `sleepercdn.com/images/team_logos/nfl/{team}.png`. Standard chip-context call is `TeamHelpers.logoImg(team, { size: 22, coin: true })` — the `coin: true` opt wraps the logo in a `.team-logo--coin` light circular backdrop (defined in `brand.css`) so the logo never blends with the pos-pill color behind it. ADP-tool's two callsites omit the coin (box-card has `.card-team-logo`, list-view has `.team-pill`). Loaded by all 5 pages + the template.
- **`assets/css/player-panel.css`** + **`assets/js/player-panel.js`** — shared right-edge slide-out drawer (used by all 5 pages)
- **`assets/css/mvs-extras.css`** + **`assets/js/mvs-extras.js`** — MVS header (OTC, baseline, trade volume, contributor rankings, recent trades helpers)
- **`assets/js/player-articles.js`** — shared articles section (banner-style)
- **`assets/css/heatmap.css`** + **`assets/js/heatmap.js`** — ADP pick-availability heatmap (now with "Data refreshed" stamp)
- **`assets/css/legend.css`** + **`assets/js/legend.js`** + **`legend-content.js`** — in-app developer legend drawer. The header comment block of `legend-content.js` is the canonical **design vocabulary** glossary — what "pill", "coin", "chip", "card", "row", "badge", "thumb", "flame" each mean, plus the design tokens. Read it before invents-new-classes.

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
