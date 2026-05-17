# Session-by-session changelog

Notable changes per work session. Newest first. For the live punch list and
"resume where we left off" guidance see [`../README.md`](../README.md). For
the operator manual see [`WORKFLOW.md`](WORKFLOW.md).

---

## 2026-05-16 (late evening) — Rankings page + Analysts comparison + brand color audit

Massive session, 13 commits. Three distinct major shipments + an enforcement tool, all landing in one push window.

### 1. New Rankings page (rankings.html) — replaces external FantasyPoints link

Brand-new in-app page driven by user-maintained Google Sheet CSVs. Replaces the external `fantasypoints.com/nfl/rankings/dynasty` link in every page's nav (one-line swap in 6 files). Multi-source architecture from day one — manifest-driven analyst tabs + format toggle (`SF / SF+TEP / 1QB / 1QB+TEP`), lazy-fetch per combo, cached in `RANKINGS_CACHE`. Adding a new CSV is a config-edit + sync-run, never a code change.

Currently shipping 3 consensus combos:
- **Overall — 1QB** (264 players, Chase WR #1)
- **Overall — Superflex** (284 players, Josh Allen QB #1)
- **Overall — 1QB + TE Premium** (283 players, Chase #1 with Bowers elevated to #10 by TEP)

`SF + TEP` toggle stays disabled until that CSV is provided. CSV column layout is detected by header name (not position), so the SF tab's extra `SFX RANK` column at position 1 doesn't break parsing. POS RANK auto-filled by per-position count when the source CSV omits the header label.

Sync: `sync-rankings.py` (gitignored, modeled on `sync-tiers.py`). Reads `sync-rankings.config.json` → walks `data/source/rankings/*.csv` → produces `data/rankings/{analyst}-{format}.json` + `data/rankings/manifest.json`.

### 2. Shared adp-comparator.js — extracted from tiers, used by tiers + rankings

`assets/js/adp-comparator.js` (~415 lines). Pulled the calendar popup + `YEAR_CACHE` + `MONTH_INDEX` + `_ensureYearLoaded` + `changeChipHtml` out of `tiers.html` into a shared module. Each consuming page initializes with its own `storageKey` + `onChange` callback. Tiers uses `fpts-tiers-compare-month`; rankings uses `fpts-rankings-compare-month` (independent state).

`tiers.html` refactored to consume the module — `~310 lines deleted` from inline calendar code, replaced with `<script>` tag + `AdpComparator.init({...})` + 3 short call sites. Behavior preserved exactly.

### 3. Analysts page → merged into rankings.html (two-tab pattern)

Originally shipped as standalone `analysts.html` (multi-analyst rank comparison per position with bipolar heat tints), then merged into `rankings.html` via two big underline tabs in the page-header (mirrors `adp-tool.html`'s Dynasty Startup / Dynasty Rookie pattern). `analysts.html` deleted; one "Rankings" nav link instead of two.

Data: 5 analysts (Ryan, Theo, John, Andy, Thomas) × 4 positions (QB/RB/WR/TE). Each analyst's CSV holds all 4 positions stacked with `"{POS} Ranks"` banner rows. `sync-analysts.py` splits by banner detection, merges by normalized name per position, computes consensus average, writes `data/analyst-rankings/{qb,rb,wr,te}.json` + manifest.

Page state: `STATE.mode` ∈ {`consensus`, `analyst`} with per-mode sub-state in separate `localStorage` keys (`fpts-rankings-*` for consensus, `fpts-rankings-analyst-*` for analyst). URL hash `#mode=analyst` supports deep-linking. Heat tints use solid brand colors (`var(--green)` / `var(--red)` + `#111` text) — same pattern as `.icon-btn.active` and position pills.

### 4. Brand color standardization across entire codebase

User caught repeated partial audits. Final pass was truly exhaustive:

- **22 real drift hits across 6 files + 2 shared modules** all normalized to brand vars
- **61 legitimate non-chromatic uses confirmed and left alone** (black shadows, white highlights, brand-RGB rgba tints, IDP-position grays, tier-D/E/F intentional grayscale)

Drift fixed:
- `#e0a060` → `var(--pos-te-bg)` (mvs-extras.css `.mvs-vol-warm` + 3 inline copies)
- `#5dcaa5` → `#66dd84` (player-panel.css `.pp-value-trend.up` + 2 inline copies — now matches `.trend.up` exception literal)
- `#3a3a3a` → `var(--muted); opacity: .35` (3 sites — theme-safe dim, no more invisible dark gray)
- `#ffc800` + paired `rgba(255,200,0,X)` → `var(--yellow)` + `rgba(240,192,64,X)` (trade-calc balance verdict — CSS + 2 JS color assignments)
- `#1e1e1e` → `var(--border)` (index.html section divider)
- `#7a1a1a` → `var(--pos-qb-bg)` (3 sites — "Data load failed" error backgrounds; brand vivid red as semantic alarm)
- `#a8d8a0` → `var(--green)` (my-leagues mid-tier trade-value gradient)

`tiers.html` was the biggest source of drift before this pass — had its own inline palette with darker greens (`#1a8754`), darker reds (`#c33`), darker tier-badge spectrum. Now normalized to brand-vivid (`#4caf6e` green, `#e05252` red, brand tier-badge spectrum for S/A/B/C, intentional grayscale preserved for D/E/F).

### 5. Brand color rule documented in brand.css

New COLOR USAGE RULE comment block in `assets/css/brand.css` (above `:root`). 8 categories: primary accent / secondary green / position pills / active button-tab / trend badge / heatmap / bipolar highlights / surfaces. Explicit rules including:
- NEVER use `#66dd84` as a background (reserved for foreground `.trend.up` text only)
- ERROR backgrounds use `var(--pos-qb-bg)` (semantic alarm, distinct from dynasty orange)
- BIPOLAR highlights use SOLID brand colors with `#111` text (matches position pills, not 50% opacity tints)

### 6. scripts/check-colors.py — pre-push enforcement

New tracked tool at `scripts/check-colors.py`. Exhaustive sweep: every `.html`/`.css`/`.js` in the repo, every hex + rgba/rgb in every CSS property + JS color string. Skips legitimate non-chromatic uses + brand-RGB tints. Exit 0 = clean, exit 1 = drift with file:line + offending value + suggested fix.

`WORKFLOW.md` gained a section documenting usage + extension (`BRAND_HEXES` + `LEGIT_RGBA_RGB` at top of script, keep in lockstep with `brand.css` when adding new tokens).

Pre-push workflow: `python scripts/check-colors.py` before every `push.bat`. Current verified state: **CLEAN across all 21 files**.

### Cache token bumps (this session)

- `brand.css?v=1779840000 → 1779920000`
- `mvs-extras.css?v=1778680030 → 1779920000`
- `player-panel.css?v=1778680035 → 1779920000`
- `legend-content.js?v=1779520000 → 1779840000`
- `adp-comparator.js?v=1779360001` (new file, first version)

All bumped across all 7 pages + page-template.

### Files added (tracked)

- `rankings.html` (new dedicated page — Consensus + By Analyst modes)
- `assets/js/adp-comparator.js` (shared calendar/comparator module)
- `sync-rankings.config.example.json`
- `sync-analysts.config.example.json`
- `scripts/check-colors.py` (audit tool)
- `data/source/rankings/{overall-1qb,overall-sf,overall-1qb-tep}.csv`
- `data/source/analysts/{ryan,theo,john,andy,thomas}.csv`
- `data/rankings/{manifest,overall-1qb,overall-sf,overall-1qb-tep}.json`
- `data/analyst-rankings/{manifest,qb,rb,wr,te}.json`

### Files added (gitignored)

- `sync-rankings.py`
- `sync-rankings.config.json`
- `sync-analysts.py`
- `sync-analysts.config.json`

### Files deleted

- `analysts.html` (merged into rankings.html)

### Iteration summary (the rough road this session)

Color work required 4 separate revision passes before landing because I kept doing partial audits (catching some drift, shipping, user catching more). Lesson saved to feedback memory `feedback-exhaustive-audits.md`: for codebase-wide audit tasks, ONE truly exhaustive sweep + categorized report + post-fix re-verification, never iterate-then-get-caught. Audit script ensures this is enforceable going forward.

---

## 2026-05-16 (evening) — Tiers ADP comparison columns + calendar popup picker (2022-2026)

Major update on `tiers.html`: shipped a real **Current ADP / Previous ADP / Change** trio of columns where the *previous* anchor is a user-selectable historical month, picked via a calendar popup that spans the full 2022-2026 horizon. Year payloads lazy-fetch on demand. The feature was iterated through four rounds of live feedback; the final shape is documented here.

### Final tier-table layout (15 columns)

Left-to-right after the Team logo: **Current ADP → Previous ADP (▾ picker) → Change → Auction → 2025 PPG → 2024 PPG → Buy/Sell → Priority → Contender.**

- "2026 ADP" relabeled to **Current ADP** (same data — `byMonth.ALL` of `data/adp.json` — just renamed).
- "2025 ADP" relabeled to **Previous ADP** and made dynamic — reads `MONTH_INDEX[selectedMonth][view_key]`, driven by the calendar popup in the column header.
- The previously-empty "Trending" sheet column got repurposed into **Change** — and then physically moved from col 12 to col 9 so the chip sits next to the two numbers it computes from.
- "2024 PPG" preserved at col 12. Editorial 📈 emojis in `TIER_PLAYERS.trending` are preserved in the data but no longer rendered.

### Calendar popup picker

- Header trigger: `<button class="tier-compare-trigger">` shows e.g. `"Apr 2026 ▾"`. Click opens the popup.
- Popup: ◀ year-nav ◀ + year label + ▶ year-nav ▶ at top; 4×3 month grid below.
- Cell states: **active** (brand-orange filled, currently selected); **disabled** (25% opacity — future months + the most-recent "now" month); **no-data** (45% opacity — month exists in a loaded year payload but no record for that bucket); default (clickable, hover border).
- Single popup mounted once at `document.body` level. Grouped view's 21 tier-group `<thead>`s each render their own trigger button but all open the *same* popup, positioned beneath whichever trigger was clicked via `getBoundingClientRect()` + `window.scrollX/Y`.
- Year range **2022–2026** (matches `adp-tool.html`'s year picker; the data factory dropped 2019-2021 for missing format-bucket dimensions).
- Year-crossing in the popup triggers `_ensureYearLoaded(year)` which fetches `data/adp-{year}.json` (~15 MB) once per year and caches in `YEAR_CACHE`. "Loading {year}…" status renders in the popup while pending; errors surface as "Failed to load {year}" without crashing.
- Outside-click, ESC keypress, scroll, and picking a month all close the popup.

### CHANGE chip styling — match adp-tool.html

The chip palette intentionally mirrors `brand.css:163-171`'s `.trend` rules so the two pages read consistently:

- Transparent background, colored text + arrow
- `▲ #66dd84` (bright green) — player rising, ADP improved
- `▼ var(--red)` `#ED810C` (dynasty orange) — player slipped, ADP went up
- `● #ffffff` (white) — flat (|Δ| < 0.05)
- Black text-shadow stroke for legibility against any row background
- Number is `|Δ|.toFixed(1)` — sign encoded in arrow direction, not in label

Sign convention: `delta = current − previous`. Negative Δ = improvement = ▲. Matches `adp-tool.html:trendBadge` at line 2162 exactly.

### Architecture

- **`YEAR_CACHE`** (`{ [year]: payload }`) — Seeded at boot from `window.ADP_PAYLOAD` for the current season. Other years populate lazily.
- **`MONTH_INDEX`** (`{ [YYYY-MM]: bucket }`) — Flat per-month lookup rebuilt by `buildMonthIndex()` after every YEAR_CACHE mutation. Walks every cached year payload and merges all `byMonth` keys (excluding `'ALL'`).
- **`_ensureYearLoaded(year)`** — Promise-returning lazy-fetch helper. Skips network if already cached. Updates popup status during pending state. Rebuilds `MONTH_INDEX` on success.
- **`_applyAdpOverlayFrom(bucket, fieldName)`** — Reused unchanged from the prior iteration; called twice per render (once for CURRENT with `byMonth.ALL`, once for PREVIOUS with `MONTH_INDEX[selectedMonth]`).
- **`changeChipHtml(curr, prev)`** — Direct port of adp-tool's `trendBadge` sign/color logic.
- **Calendar helpers**: `_tierCalendarMount/Open/Close/NavYear/RenderGrid/PickMonth` — ~140 lines inline in tiers.html. Documented for future extraction to `assets/js/adp-comparator.js` when the dedicated rankings page lands.

### Boot-time saved-year race

A subtle race needed explicit handling: if `localStorage 'fpts-tiers-compare-month'` holds a non-current year (e.g. `"2023-08"`), `MONTH_INDEX` won't contain that month at boot (only 2026 months are loaded). Without intervention, `_initTierCompareMonth()` would silently fall back to the latest 2026 option and overwrite the saved selection. Fix: the `fpts:data-ready` handler now reads `localStorage` directly to detect the year mismatch, kicks `_ensureYearLoaded(savedYear)` in parallel, and re-runs `_initTierCompareMonth` + overlay + render after the fetch lands. Saved selection sticks across reloads.

### Trade-offs flagged

- Each historical year payload is **15-17 MB**. Worst case: a user navigates ◀ four times in the popup → ~60 MB of JSON fetched over the session. Acceptable for desktop; gzip-over-wire compresses to ~3-5 MB per file.
- Sort on the Previous ADP column is dropped (the column header is now interactive). The more useful sort lives on the adjacent **Change** column (numeric, ascending/descending).
- 2024 PPG column kept but unmodified; could be repurposed later if a second comparison anchor is wanted.

### Legend update

`assets/js/legend-content.js` Tiers > "ADP Comparison" section. Three entries: **Current ADP**, **Previous ADP**, **Change Column**. Each uses the Phase A schema (`formula` / `inputs` / `output` / `example` / `codeRef`). Previous ADP entry documents the calendar popup UI, lazy-fetch behavior, `MIN_YEAR=2022` lower bound, and YEAR_CACHE cache strategy.

### Iteration history (for the record)

The feature went through four rounds in one session:
1. **Rev 0** — initial 3-column trio with toolbar "Compare to:" dropdown, solid-color chips, 2025+2026 months.
2. **Rev 1** — dropped solid chip backgrounds; matched adp-tool's transparent + bright text trend palette.
3. **Rev 2** — moved CHANGE column from col 12 to col 9; dropped toolbar widget; inlined dropdown into Previous ADP `<th>`; restricted to current-year months only.
4. **Rev 3** (final) — replaced inline `<select>` with calendar popup; expanded horizon to 2022-2026 via lazy-loaded year payloads.

### Cache token

`assets/js/legend-content.js?v=` bumped three times during the session (`1778949514 → 1779120000 → 1779200000 → 1779280000`); current value lives on all 5 pages + the page template.

### Files touched

- `tiers.html` — state additions, helpers (~250 new lines net), CSS (~80 lines), markup, boot sequence
- `assets/js/legend-content.js` — "ADP Comparison" section authored + iterated
- `?v=` cache token on `legend-content.js` across all 5 pages + `templates/page-template.html`

### What we explicitly did NOT do

- No backend changes — `sync-adp.py` already emits `byMonth` buckets correctly; the data was just under-surfaced.
- No new data files — relied on existing `data/adp.json` + `data/adp-{2022..2025}.json` produced by the 2026-05-14 year-picker shipment.
- No shared module yet — calendar helpers stay inline in tiers.html for v1. Extract candidate for `assets/js/adp-comparator.js` when the dedicated rankings page lands.

---

## 2026-05-16 — Legend system Phase A (dev-grade algorithm docs)

User reported: "last I checked none of the legends on the site populated. On
each page write me a detailed legend concept that shows everything. I want
a dev to look at that legend and understand exactly how and why things are
the way they are." Two-part response: (1) verify the legend actually renders
(it does — earlier nested-comment fix unbroke it), then (2) expand content
to dev-grade depth for the highest-payoff algorithms.

### Schema upgrade
- **`assets/js/legend.js` `renderItem()` upgraded.** Original schema was `{label, what, source, values, notes}`. Added five optional fields rendered in narrative order: `inputs` (what feeds the algo) → `formula` (the actual math, mono-spaced) → `output` (how to read the result) → `example` (a worked example with real numbers, accent-block styled) → `codeRef` (file:line for navigation). Simple UI entries continue to work with the original five fields; algorithm entries opt into the new ones.
- **`assets/css/legend.css` `.lg-example` class added.** Worked-example rows render with `rgba(237,129,12,.06)` background + `2px solid var(--red)` left border so they read as self-contained "try it with real numbers" demos.

### Six algorithm entries authored (Phase A)
- **Archetype Scoring** (my-leagues → Standings + Position Rankings, replacing the thin existing entry). Documents the composite formula `composite = 0.6×(totalValue/leagueAvg.value) + 0.2×(pickValue/leagueAvg.pickValue) + 0.2×(projValue/leagueAvg.proj)` with `valueHigh/Low` thresholds and `ageYoung/Old` deltas that combine into `dynasty / contender / tweener / rebuilder / emergency`. Worked example included. `codeRef: my-leagues.html:2937-2958`.
- **Picks-as-Assets Relabeling** (adp-tool → new "Data Pipeline" section, 3 items). Documents `sync-adp.py:367-445` `relabel_picks_K_to_rdp` with formula `round=(_k_seq // st_teams)+1, pir=(_k_seq % st_teams)+1` and label format `"{round}.{pir:02d}"`. Includes 12-team draft worked example (K picks at 24/48/72/96/120 → `ROOKIE_PICK_1.01` through `1.05`). Heatmap coverage entry covers the ~77 synthetic pick entries in `data/pick-availability.json`.
- **Trade Finder Algorithm** (index → Player Panel section, upgraded the existing thin entry). Documents `assets/js/player-panel.js:1096-1282` `_drawTradeFinder`: sort by `Math.abs(asset.value − gap)` ascending, take first 8, flag "fair" when `absDiff < 300`. Notes the single-asset-only constraint (no bundle combinatorics). Worked example with Jefferson 9,800 as anchor.
- **Sleeper API Coupling** (my-leagues → new "Sleeper API Coupling" section, 3 items). Documents the `apiFetch()` wrapper at `my-leagues.html:2889-2892` (no retry, throws on non-2xx). Lists all 11 endpoints with file:line callsites. Documents the `.catch(() => [])` graceful-degradation pattern for non-required endpoints (`/traded_picks`, `/drafts`).
- **MVS Overlay Precedence** (index → new "Data Pipeline" section, 3 items). Documents `data-bootstrap.js:153-207` `_applyMvsPayload`: wholesale-replaces value/baseline/trend/history/otcValue/otcDiff/rankings/recentTrades/lastUpdated; falls back to FP_VALUES for sleeperId/age/team/pos/posRank/ppg/injury. Format toggle (`localStorage.fpts-adp-format` SF↔1QB) entry explains why a single key drives every page.
- **Cross-Page Handoff Schema** (index → upgraded 2 of 3 existing entries). `_fptsWriteHandoff` and `_fptsReadHandoff` now have full formula + worked-example coverage. The 60s TTL rationale is documented ("users sometimes click and re-open 10 minutes later"). Consume-once semantics + removal-before-validation flow spelled out.

### Coverage stats
- ~186 items → ~195 items, 38 sections → 41 sections.
- 5 of 6 algorithm entries use the new full schema; 1 (handoff) is a partial upgrade.

### Cache + wiring
- **`?v=` tokens bumped to `1778949514`** for `assets/css/legend.css`, `assets/js/legend-content.js`, and `assets/js/legend.js` across `index.html`, `adp-tool.html`, `trade-calculator.html`, `my-leagues.html`, `tiers.html`, and `templates/page-template.html`. All 5 pages verified to call `Legend.init('<pageKey>')` correctly.

### Deferred to future sessions
- **Phase B** (~30 partial-coverage entries): age curve depth, PPR multiplier justification, pick-value computation, year-picker on adp-tool, search/filter on tiers, etc.
- **Phase C**: polish + consistency pass; verify every `codeRef` resolves.

---

## 2026-05-15 — Mobile Round 2 (sub-plans A-E), theme polish, pick modal wiring

Mobile screenshots from user showed five distinct issues. Each got its own sub-plan and commit.

### Mobile Round 2 sub-plans
- **Sub-plan A — Drawer header overflow** (commit `5e47cd9`). Drawer header was clipping its action buttons (Calc/ADP/Leagues) on phone widths. Collapsed them behind a `⋯` overflow menu that flyouts the three buttons. Desktop unchanged.
- **Sub-plan B — Profile reflow + articles collapsed default** (commit `c881d29`). Player profile section reflowed for narrow widths (avatar above stats row instead of beside it). Articles section now starts collapsed on mobile to keep the drawer scrollable to the lower tabs.
- **Sub-plan C — Nav polish + "My Leagues" label** (commit `b905be7`). Mobile nav uses a styled `<select>` for cross-page navigation (single dropdown beats a row of cramped tabs). "User Importer" renamed to "My Leagues" everywhere — the page slug stayed `my-leagues` but the user-facing nav label is friendlier.
- **Sub-plan D — Search dropdowns above input** (commit `e587844`). On iOS the keyboard popping up was covering the autocomplete dropdown rendered below the input. Mobile-only: dropdown renders above the input (max-height + reversed flex), so suggestions stay visible while typing.
- **Sub-plan E — Sleeper deeplink** (commit `9e80d25`). Sleeper iOS app handles `sleeper://league/{id}` natively but treats `sleeper://league/{id}/team` as an invalid path and lands users on the wrong league. Mobile-only: the deeplink builder drops the `/team` suffix. Desktop (web Sleeper) keeps the full URL.

### Mobile polish (pre-Round 2, same session)
- **Drawer header overflow guard** (commit `4294cef`). Header row gets `overflow: hidden` + `text-overflow: ellipsis` so long player names don't push the close button off-screen. Tab fade-hint added — gradient on the right edge of the tab row signals there's more content to scroll. Legend button gets a 72px bottom-padding spacer so it doesn't sit on top of the last row of trade-balance text or tier-table content.

### Theme polish (commit `77822e9`)
- **Three hardcoded color drift cases fixed.** A long click-through of the dark↔light toggle revealed three spots where colors were hardcoded rather than using CSS variables, so they didn't flip with the theme. All three migrated to `var(--white)` / `var(--black)` / `var(--border)` so the toggle works cleanly across all 5 pages.

### Pick modal wiring (commit `0826dbf`, supersedes earlier `4b4820c`)
- **Cross-league exposure picker now opens on pick row click.** My-Leagues' own-roster picks table had no `onclick` handler at all — pick rows were dead. First wired to Trade Builder (commit `4b4820c`); user redirected: they wanted the same UX as a player ("treat the pick as a first-class asset — what leagues do I have a 2026 2nd in?"). Switched to `openPickExposurePicker(season, round)` (commit `0826dbf`).

### Inline-style migration (Phase A of the `my-leagues.html` cleanup)
- **A.1** (commit `2d4cf5b`): table-cell style constants migrated to CSS classes. The repeated `style="text-align:right; font-variant-numeric:tabular-nums"` pattern on numeric columns became `.ml-tar.num`.
- **A.2** (commit `dc592c3`): 7 mid-frequency repeated utility patterns migrated. A `replace_all` bug introduced 11 duplicate `class=` attributes (e.g. `class="num" class="ml-tar"`) — fixed in the same session via regex merge.
- **A.3** (commit `61ad387`): 7 more mid-frequency repeated patterns. Phase A complete for the high-value targets; remaining ~150 inline styles are dynamic (color/width/opacity computed at runtime) or genuine one-offs.

### Other polish (same window)
- **Typography normalization** (commit `ddf3acd`). Eyebrow letter-spacing normalized to `.06em` everywhere (had drifted to `.04em` / `.05em` / `.07em` in three places). Single value across the site now.
- **Availability section collapsed by default** (commit `97bd9c3`). User feedback: when the drawer opens, the "Availability in leagues" section was expanded and pushed the more-important profile info below the fold. Now starts collapsed; click to expand.

---

## 2026-05-14 (evening) — ADP year picker + team-logo coin + many polishes

### ADP year picker (2022-2026)
- **`sync-adp.py` refactored** to loop seasons via `_build_one_season()` helper. Default `seasons_to_export = range(2022, current_season + 1)`. Writes per-year JSONs: `data/adp-{year}.json`, `data/auction-{year}.json`, `data/pick-availability-{year}.json`. Current-season payload also writes to canonical filenames + injects `availableYears: [...]` for the frontend dropdown.
- **`adp-tool.html` year dropdown** in the controls bar (`<select id="year-select">`). New `STATE.year` + `STATE.datePreset` + `STATE._yearCache`. `setYear()` lazy-fetches the target year's three JSONs, repoints `window.ADP_PAYLOAD` / `AUCTION_PAYLOAD` / `PICK_AVAILABILITY`, calls `_applyAdpPayload` (exposed to `window` for cross-IIFE access), re-applies the date-preset against new year's max-date, updates topnav badge + tab labels, writes year into URL hash, re-renders.
- **`applyDatePreset()` refactored** — anchor changed from `today` to `_datasetMaxDate(window.ADP_PAYLOAD)`. For 2026 this is ≈ today (no behavior change). For 2024 it's that season's last draft date, so "30d" means "last 30 days of 2024 drafts."
- **2019-2021 intentionally dropped.** Sleeper's dynasty corpus pre-2022 lacked format-bucket data — `picks_sf` / `simple_sf` / `rookies_sf` all empty, no RDP placeholders, no rookie drafts. Boards rendered structurally different from 2026. Restricting the year picker to 2022-2026 ensures every selectable year has the same data shape.

### Backend filters (sync-adp.py)
- **Season-aware rookie filter.** `build_adp` / `classify_startup_drafts` / `build_rookie_draft_pick_availability` take `season` + `current_season` params. Rookie filter is now `years_exp == (current_season - season)` instead of global `== 0`. Sleeper's `years_exp` is current-as-of-today; a 2024 rookie now has years_exp=2, so the old filter dropped them. Verified: 2025 filter targets yearsExp=1 (223 entities), 2026 targets 0 (212).
- **Offense-only filter.** New `_OFFENSIVE_POSITIONS = {QB, RB, WR, TE, K}` + `_is_offensive` + `_filter_offense_inplace(by_month_dict)` helpers. Applied to every list emission in `build_adp` / `build_format_adp` / `build_auction`. JSONs no longer contain IDP / DST / P / FB records.

### Team-logo coin treatment
- **`.team-logo--coin` CSS rule** (`assets/css/brand.css`). Translucent dark backdrop (`rgba(0,0,0,.22)`) + soft drop shadow. No border. `TeamHelpers.logoImg(team, { size, coin: true })` opts in.
- **9 chip-context callsites updated**: `player-panel.js:552/759/1184` (drawer hero / Trade Calc chips / Trade Finder rows), `index.html:6276`, `trade-calculator.html:2303`, `tiers.html:5108`, `my-leagues.html:5301/6164/6945`. ADP-tool callsites kept bare (per user direction).
- **Iterated several times** through palette options — final settle was rgba dark wash, no border, no orange ring.

### Visual polishes
- **Palette revert.** Bright pre-softening pos-pill colors restored across `brand.css` + 5 HTML page inline duplicates. WR `#5b9bd5`, RB `#4caf6e`, QB `#e05252`, TE `#e09a30`, K/Pick `#9b91d4`. Position text reverted to `#111`.
- **Uniform Trade-Finder pos-pills.** `.tf-asset .pos-badge` + `.tf-add-option .pos-badge` get `min-width: 30px` so QB / RB / WR / TE / K / PK all sit at uniform width despite Kanit's variable glyph widths.
- **MVS team-logo emit.** `renderTopPlayers()` main row + "By Position" rows + `renderValueTracker()` rows (Top Risers / Top Fallers) now emit `TeamHelpers.logoImg(team, { size: 22, coin: true })` right of every player name. Closes trade-chip rule across MVS surfaces.
- **My-Leagues exposure scroll fix.** Lifted the `.slice(0, 200)` cap so the full filtered list renders; added `min-height: 0` to `.ml-exposure-list` (classic flex-column scroll idiom — without it, content overflows the parent's `max-height` and the wheel falls through to the page).
- **Box-card sizing fixes.** Top-row font-sizes 9px → 8px with `justify-content: space-between`. `.card-meta` padding 34/38 → 30/36 to center trend chip in the actual coin gap. Headshot fallback opacity .55 → .95 + bg-size 75% → 85% so silhouette matches photo weight.

### Page migrations
- **`tiers.html` migrated to `data-bootstrap.js`** (-38 lines). Two duplicate inline fetch blocks (`applySleeperOverlay`'s Promise.all + `_tiersHydrateExtras` IIFE) collapsed to a single bootstrap script + `fpts:data-ready` listener.
- **`trade-calculator.html` migrated to `data-bootstrap.js`** (-139 lines). 167-line `_fpBootstrap` IIFE removed (3 duplicate payload-apply functions + Promise.all chain).

### Tiers data fixes
- **Sleeper-API age fallback.** New `applySleeperApiAgeFallback()` for players who aren't in FP's `values.json` yet (e.g. Eli Stowers — fresh rookies between Sleeper-recognizing them and FP adding their KTC record). Fetches `https://api.sleeper.app/v1/players/nfl` once per session (cached on window + browser HTTP cache), looks up by sleeperId from `MVS_PAYLOAD.players`, computes age from `birth_date` if Sleeper only carries that.
- **Hot-fix entries** in `tiers.html`: added `Jayden Daniels` to S+ tier; fixed `Coltson` → `Colston Loveland` and `Nick` → `Nicholas Singleton` typo spellings. ⚠️ These get wiped on next `sync-tiers.py` unless the Google Sheet is updated to match.

### Cleanup
- **`push.bat` stale sync-checks removed.** `tab-sync` (looked for retired per-page tab fns like `_calcShowTab`) and `chip-sync` (looked for `.tf-asset[data-pos=]` in `index.html`, but that palette migrated to `player-panel.css`). The other three checks (`modal-sections` / `panel-css` / `legend-sync`) stay.

### Documentation
- **Design vocabulary glossary** in `legend-content.js` header: pill, coin, chip, card, row, badge, thumb/headshot, flame, page-title/section-hdr/sub-hdr, plus design tokens (`--red`, `--surface`, etc.).
- **ADP scrape-coupling rule** added to `legend-content.js` header. Documents UI filter ↔ scrape dimension mapping. Lists candidates for future scrape expansion (PPR / IDP / scoring-format / injury / post-draft-trades).
- **`docs/WORKFLOW.md` §11** "Adding a new ADP filter" — operator checklist for the coupling rule.

### Historical scrape backfill
- **`01_ingest_historical.py` SEASONS** bumped from `[2026]` to `[2020..2026]` (then user added 2019 making it `[2019..2026]`). User ran the full historical ingest (~3-4 hours). Parquets refreshed for 2020-2026; 2019 added separately. The app's `sync-adp.py` then processed only 2022-2026 from these (post-restriction).

### Post-doc-update polish
After the initial doc commit (`46b0459`) shipped, a few more bugs surfaced in the year picker:
- **Uniform ADP card heights** (`adp-tool.html`). On historical year boards (2022-2025) some cards were collapsing to the `min-height: 60px` floor while 2026 cards grew to ~75px because their trend chip was filling `.card-meta`. Two-stage fix: (a) `metaHtml` always renders `<div class="card-meta">` even when `trendBadge` returns empty, using `&nbsp;` as the placeholder; (b) `.box-card` switched from `min-height: 60px` to a fixed `height: 78px` so every card across every year and tab is exactly the same size regardless of content variation. Box-card overflow is already hidden, so long player names still truncate cleanly.
- **My-Leagues exposure scroll — real fix.** Earlier I'd added `min-height: 0` to `.ml-exposure-list` thinking that completed the flex-column scroll idiom, but I never verified the actual chain. The parent `.ml-exposure-body` (between the sticky aside and the list) had NO CSS at all — default `display: block` — which broke the flex chain at the middle node. Result: `.ml-exposure-list { flex: 1 }` was a no-op, list height resolved to content height (~11,000px for 365 players), `overflow: auto` never fired, wheel events fell through to the page. Added `.ml-exposure-body { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; }`. Now the chain is complete and scroll-on-hover actually works. Documented in README "Sticky known quirks" as a general rule: every ancestor in a flex-scroll chain must be flex.

---

## 2026-05-14 — Silhouette fallback rule + season rollover trigger

### Site-wide headshot-fallback rule
- **Problem**: Sleeper's CDN returns 403/404 on `sleepercdn.com/content/nfl/players/thumb/{id}.jpg` for many incoming rookies (their player record exists, but no photo has been uploaded yet — typically lags weeks-to-months after the NFL Draft). The pre-existing fallback rendered the player's first letter ("M", "H", "J") in a circle, which looked broken when a row had a mix of real headshots and floating initials.
- **Fix**: a new canonical CSS rule in `assets/css/brand.css` (already loaded by every page) covers every legacy fallback class — `.hs-fallback`, `.card-hs-fallback`, `.pp-hs-fallback`, `.cc-hs-fallback`, `.ml-pd-avatar-initials` — plus a new generic `.fpts-hs-fallback`. The rule hides any initials text with `color:transparent; font-size:0` and paints a neutral SVG silhouette as `background-image`. `!important` flags ensure no per-page inline style accidentally re-enables the letter.
- **Coverage**: JS callers in `index.html` (`_imgThumb` / `_imgThumbFallback`), `trade-calculator.html` (same), `assets/js/player-panel.js` (drawer hero avatar), and `my-leagues.html` (exposure-row fallback) were updated to opt their fallback spans into the rule via `class="fpts-hs-fallback"`. The initials text is preserved in `textContent` for screen readers / DOM introspection but never displayed.
- **The new convention**: any new headshot surface across the site MUST emit `class="fpts-hs-fallback"` on its fallback element. Documented in the brand.css header block.

### Season rollover trigger
- **`sync-adp.py` auto-detects season** from today's date: `year if month >= 4 else year - 1` (rolls over with the NFL Draft). Config override via `sync-adp.config.json` `"season"` still wins when set. Default is auto.
- **All year displays now drive from `ADP_PAYLOAD.season`**:
  - Dynasty Startup ADP {year} / Dynasty Rookie ADP {year} tabs (already dynamic via `applyAdpYearLabel`)
  - "With Rookies" subtitle "...startups with the {year} rookie class in the pool" (new `_adpSeason()` helper)
  - "SEASON {year}" topnav badge across all 5 pages + the page-template scaffold — new shared helper `window.applySeasonBadge(season)` in `team-helpers.js`, called from each `_applyAdpPayload`
- **Result**: next April, when `sync-adp.py` runs after `today.month >= 4`, every label rolls to 2027 automatically. Zero code edits.

### Rookie data filtering
- Veterans who occasionally show up in rookie drafts (Josh Allen, Tannehill, Watson, Mark Ingram, etc.) are now filtered out of both the rookie ADP records and the rookie-draft heatmap. Filter applied at the `dynasty_class=='rookie'` duplication step in `build_adp` and at the `entity_ids` step in `build_rookie_draft_pick_availability`: `yearsExp == 0` AND position in `{QB,RB,WR,TE,K}`. Drops Sleeper duplicate/garbage rows too (e.g. "Jadyn Ott DUPLICATE" with empty position).
- 2026 numbers: `rookie_draft_sf` 420 → 185 records, `rookie_draft_1qb` 114 → 92, heatmap entries 470 → 189.

---

## 2026-05-13 (late) — Dynasty Rookie ADP tab

### What landed
- **New top-level tabs** in the ADP Tool page-header: **Dynasty Startup ADP 2026**
  (the existing view) and **Dynasty Rookie ADP 2026** (new, rookie-only drafts).
  Underline-style, bold Kanit italic, orange `--red` underline on active.
  Year suffix is pulled dynamically from `ADP_PAYLOAD.season` so the label
  auto-rolls each season.
- **Sub-mode descriptor**: the prior big `.page-title` shrunk to a smaller
  descriptor line below the tab strip (e.g. "Sub-view: Picks-as-assets
  startups" / "Rookie-only drafts (≤6 rounds)"). Subtitles rewritten per
  (source, variant) combo.
- **"Rookies" variant renamed to "With Rookies"** to disambiguate from the
  new Rookie tab. The underlying data key (`rookies_sf` / `rookies_1qb`)
  stays the same — other pages read it untouched.

### Data plumbing
- **`sync-adp.py` second pass** in `build_adp` (line 145): duplicates rows
  with `dynasty_class == 'rookie'` and re-tags them with a SF/1QB-split
  view key. The legacy `rookie` key (no SF/1QB split) is preserved for
  backward compat — `my-leagues` / DB / etc still read it.
- **New keys in `data/adp.json`**: `rookie_draft_sf` (420 records) and
  `rookie_draft_1qb` (114 records). Top picks match the actual 2026 rookie
  class (Jeremiyah Love, Carnell Tate, Fernando Mendoza, Jordyn Tyson).
  `min_drafts = 5` unchanged.

### State + UX
- **Per-tab state isolation**: each tab (`startup` / `rookie`) keeps its
  own qbFormat, date range, view, snake, search, filters, sort, rounds,
  team count. STATE has a `source` field + a private `_cache` that swaps
  on tab change. Two localStorage keys: `fpts-adp-startup-state`,
  `fpts-adp-rookie-state`, plus `fpts-adp-active-source`.
- **URL hash gains `source=`** param so a shared `#source=rookie&qb=1qb`
  link opens directly on the rookie tab in the right format.
- **Rookie tab defaults**: SF forced on first load, snake on, rounds=5
  (vs 20 on startup). Variant button row (Picks/Simple/With Rookies) is
  hidden on the rookie tab.
- **Trend arrows** (▲/▼ MoM) work on the rookie tab — `rebuildTrendIndex`
  was already keyed by `getSourceKey()`, which now resolves to
  `rookie_draft_{qb}` when source=rookie.
- **Player drawer** opens identically from rookie cards (shared
  `window.openPanel`). All 5 panel tabs are usable; the heatmap tab will
  show "no data" for rookie picks (rookie-draft pick-availability heatmap
  is deferred — `_availability_matrix_from_picks` supports it, separate
  ticket).

### Rookie-draft pick-availability heatmap (added late in session)
- **`sync-adp.py` new `build_rookie_draft_pick_availability`** filters
  the draft catalog to `dynasty_class=='rookie'` drafts at the configured
  team count (12), feeds every player who appears in ≥`min_drafts`
  rookie drafts through the existing `_availability_matrix_from_picks`
  kernel, and emits a 6-round × 12-slot matrix per rookie. 9,070 rookie
  drafts feed 470 rookie heatmap entries for 2026.
- **New `rookiePlayers` section** in `data/pick-availability.json`
  (separate from `players` so the same sleeperId can have distinct
  startup vs rookie-draft heatmaps — Jeremiyah Love is 100% available
  at 1.01 in rookie drafts, but never appears in the startup heatmap
  because his startup ADP is ~60-70 and below the top-300 budget).
- **`assets/js/heatmap.js`** now picks the map at render time via a
  `window.PICK_AVAILABILITY_SOURCE` flag (`'rookie'` vs default
  `'startup'`). All 5 pages (`adp-tool.html`, `index.html`,
  `my-leagues.html`, `trade-calculator.html`, `tiers.html`) plus
  `assets/js/data-bootstrap.js` were updated to also stash
  `j.rookiePlayers` into `window.PICK_AVAILABILITY_ROOKIE` on load.
- **`adp-tool.html` flips the flag** on init + on every `setSource()`,
  so opening the player drawer from the Rookie tab now renders the
  rookie-draft heatmap (Jeremiyah Love → R1 row [100,5,2,2,2,2,2,2,2,2,2,2]).
- Empty-state message in `heatmap.js` adapts: "Rookie-draft
  pick-availability isn't tracked for this player — coverage requires
  at least 5 completed rookie drafts." when in rookie context.

### Out of scope this session
- Scrape expansion for 1QB rookie data (114 records is already healthier
  than the picks-1QB 4-draft hole).
- Rookie-specific scouting content in the player drawer.
- SF/1QB split of the rookie-draft heatmap (currently mixed; SF
  dominates the sample anyway).

---

## 2026-05-13 (evening) — Team logos everywhere + softer palette + 125% body zoom

### Team logos site-wide

- **New shared module `assets/js/team-helpers.js`** with helpers:
  `logoUrl(team)`, `logoImg(team, opts)`, `headshotBadge(team, opts)`,
  `wrapWithBadge(headshotHtml, team, opts)`. Sleeper's CDN serves the
  PNGs at `sleepercdn.com/images/team_logos/nfl/{team.toLowerCase()}.png` —
  same origin we already use for player headshots, no auth, transparent
  backgrounds (work on dark + light themes).
- **Inline team-text → logo** in every place a player name appears next
  to a player image: ADP list-view `.team-pill`, ADP box-card bottom-left
  mirrored circle, ADP card-meta line, DB recent-trades chips (line
  6267 of `index.html` `tradeCardHtml`), drawer Trades tab (line 756 of
  `player-panel.js` `tradeCardHtml`), drawer Trade Finder tab (line 1181
  of `player-panel.js`), Trade Calculator main asset-row chips (line
  2299 of `trade-calculator.html`), Tiers table team column, My-Leagues
  league-detail roster sub-tables + trade-history cards.
- **The unified "trade-chip rule":** any future surface that renders a
  player image next to their name MUST emit the team logo right after
  the name span via `TeamHelpers.logoImg(team, { size: 18 })`. Parent
  flex container uses `align-items: center` for baseline. Plain-text
  fallback when `window.TeamHelpers` isn't loaded. Documented in the
  `team-helpers.js` header.
- **ADP Box-view layout refined:** team logo lives in the bottom-LEFT
  of each box card (26px circle, `rgba(0,0,0,.1)` backdrop matching the
  player headshot's halo), player headshot in the bottom-RIGHT (32px).
  Player name flows left-to-right with right-padding only (no truncation).
  Trend chip centered in the meta row via symmetric 34px padding. No
  element touches another.
- **Modal-hero badge removed** from the 80px `.pp-avatar`. Team identity
  shows once via the `#pp-nfl-team` slot next to the player name (22px
  logo, no text).

### Softened position palette

- **Position background colors** dropped a noticeable saturation/lightness
  step. Dark theme:
  - WR `#5b9bd5` → `#3c6788` (deeper slate-blue)
  - RB `#4caf6e` → `#2f6d44` (deep forest)
  - QB `#e05252` → `#963a3a` (muted brick)
  - TE `#e09a30` → `#8c601a` (deep amber)
  - K / RDP / Pick `#9b91d4` → `#5a5290` (deep plum)
- **Position text flipped from `#111` (dark) to `#f0f0f0` (light)** so
  contrast on the darker backgrounds reads cleanly.
- **Brand orange `--red: #ED810C` untouched** (wordmark, RDP flame,
  trend-down indicator, section labels). `--green` for trend-up accents
  untouched.
- Tiers.html's separate per-page palette + `.pos-pill` text rules also
  updated to match.

### Site-wide 125% body zoom

- **`body { zoom: 1.25 }`** added to `assets/css/brand.css` and mirrored
  into each of the 5 pages' inline `<style>` blocks so the inline copy
  doesn't override brand.css. Every page renders 25% larger by default
  — text, headshots, chips, spacing all scale together. User interactions
  (click/scroll/drag) work normally because zoom integrates with the
  browser's hit-testing.
- **Mobile (`<700px`) and print explicitly exempt** so the existing
  mobile layout and the function-reference PDF stay at 100%.
- Known caveat: monitors narrower than ~1700px may see horizontal scroll
  on the ADP Box view (its `min-width:1500px` becomes ~1875px effective
  after the zoom).

### Cache-bust generation

- `brand.css?v=1778680008`
- `team-helpers.js?v=1778680001`
- `player-panel.js?v=1778680005`
- All bumped on the 5 pages + template where applicable.

### Commit highlights

- (multiple) Trade-chip team-logo wiring across drawer + DB + Calc + ML
- (multiple) Softened palette + flipped text color
- 125% body zoom site-wide
- ADP Box-view layout polish (bottom-left team circle mirroring bottom-right headshot)
- Modal-hero badge removed; `#pp-nfl-team` now logo-only at 22px

---

## 2026-05-13 (afternoon) — Picks bucket fix + RDP heatmap + scaffold for new pages

### ADP Tool: Picks bucket

- **Real players + RDP placeholders intermixed.** The previous fix overwrote
  the Picks bucket with RDP-only records (78 entries in slot order). The
  data factory `app_adp_board.py:1543` actually concatenates real picks with
  relabeled K picks before aggregation — port that. New `relabel_picks_K_to_rdp`
  helper in `sync-adp.py` rewrites K `player_id`s to `ROOKIE_PICK_X.YY`
  in-place inside `build_format_adp`, so aggregation produces a unified pool
  of real players + RDP records.
- **Tightened classification.** `classify_startup_drafts` changed from
  "any K = picks" to "K in rounds 1..RDP_EARLY_ROUNDS (=4) = picks", matching
  factory's `early_rounds=4`. Vet-only leagues with a real K in round 18 no
  longer pollute the picks bucket. Verified: picks_sf now has 681 real +
  77 RDP records; rank 1 is Josh Allen (ADP 2.6, 1,017 drafts), Rookie Pick
  1.01 enters at rank 16 (ADP 16.0).
- **1QB picks toggle hidden.** Only 4 qualifying 2026 1QB drafts; below
  `min_drafts=5`. `adp-tool.html` adds `_applyPicksOneQbConstraint` that
  hides the 1QB button while in Picks mode and silently forces qbFormat to
  'sf'. Toggle reappears on Simple/Rookies.
- **RDP card styling.** Added `.box-card.RDP` / `.pos-pill.RDP` / `tr.RDP`
  selectors to the `--pos-pick-bg` (brand purple) rules so RDP cards no
  longer render with a black default.

### Pick-availability heatmap

- **RDP heatmap entries.** New `build_rdp_pick_availability` function in
  `sync-adp.py` produces availability matrices for each `ROOKIE_PICK_X.YY`
  slot, drawn from qualifying picks-bucket drafts only. Per-(round, slot)
  probability math extracted to the shared `_availability_matrix_from_picks`
  helper — both real-player and RDP heatmaps use it. `data/pick-availability.json`
  now has 300 real players + 77 RDP entries (Rookie Pick 1.01 = expected
  pick 15.96, dropoff 92% → 37% → 3% over rounds 1-3).
- **"Data refreshed" stamp.** `assets/js/heatmap.js` renders a new stat cell
  next to "Expected pick" and "Drafts sampled" showing the source data's
  version date. Pulled from `window.PICK_AVAILABILITY_META.version` which
  is now stashed on every page's pick-availability.json fetch. Guaranteed
  in lockstep with ADP because `sync-adp.py` writes the same `version`
  timestamp to `adp.json`, `auction.json`, and `pick-availability.json`.

### Scaffold for new pages

- **`assets/js/data-bootstrap.js`** (new, 307 lines). Single shared data
  layer: fetches all 7 `data/*.json` files, populates 9 `window.*` globals,
  exposes canonical `_applyAdpPayload` / `_applyAuctionPayload` /
  `_applyMvsPayload` helpers, fires `fpts:data-ready` when done. Public API
  on `window.FPTS_DATA`. Pages opt in by setting `FPTS_CURRENT_PAGE` and
  including this script.
- **`assets/css/brand.css`** (new). Canonical brand variables, fonts, top
  nav, position pills, page chrome. Extracted from `adp-tool.html:8-167`.
  Existing 5 pages keep their inline copies (unchanged); future pages link
  to this.
- **`templates/page-template.html`** (new). Copy-this-to-start scaffold
  with three TODO markers + a `fpts:data-ready` listener skeleton.
- **`docs/WORKFLOW.md` § "2b. Add a new page or tool"** documents the
  6-step copy-fill-test-push flow.

### Commits

- `2c05c93` Picks bucket: real players + RDP placeholders intermixed
- `44aca37` Add RDP heatmap entries to pick-availability.json
- (pending) data-bootstrap + page-template scaffold + heatmap data-refresh stamp

---

## 2026-05-13 — My-Leagues → shared drawer (accordion variant) + data fixes + push.bat hardening

### Architecture

- **My-Leagues player card retired its custom centered modal** (`#ml-pd-backdrop` + `.ml-modal` + `.ml-pd-*`) and now routes through the shared right-edge slide-out drawer in `assets/js/player-panel.js`. Click handlers, sid resolution, and cross-page handoff buttons (Open in DB / Calc / ADP) unchanged.
- **Accordion presentation** is scoped to ML only via `body.fpts-ml-page` CSS. The horizontal 5-tab strip is hidden; all 5 tab bodies render as stacked collapsible sections. ADP Heatmap is open by default; the other four collapsed. State persists in `localStorage` under `fpts-ml-acc-open`.
- **`#pp-league-context` slot** (always-present in the shared panel template, hidden via `:empty` on the other 4 pages) is now populated by ML with the On-Your-Roster status badge + Availability Across Your Leagues section. Moved above the accordion via flexbox `order` so it sits right under the profile, not pinned to the bottom.
- **MutationObserver per accordion tab** + 300ms / 1500ms safety-net timers re-inject the section header if an async renderer (Player Stats fetches Sleeper season stats) overwrites the tab body's innerHTML.

### Data shape

- **`data/picks.json` is now record-shaped:** each pick is `{value, valueSf, valueTep}` rather than a flat number. `mlPickValue` and `pickValue` in `my-leagues.html` extract `.value`. Before the fix, callers were string-concatenating objects, producing `"0[object Object][object Object]…"` in the PICKS chip + TOTAL ROSTER VALUE.
- **Player Exposure (361-players) panel renders rows again.** Root cause was an undefined `htmlEscape` reference inside `renderExposureList` — the `.map()` aborted with a ReferenceError between the count update and the `innerHTML` assignment, so the count showed "361 players" but no rows rendered. Local `htmlEscape` helper added inside the function.

### My-Leagues archetype scoring overhaul

- **`mlGetArchetype` now composites three signals** instead of just trade value: 60% player trade value + 20% pick value + 20% season projection sum, each normalized to the league median. League medians for picks and projections are computed alongside age and player value in `mlComputeLeagueValueData`. The standings table (`loadStandings`) gets the same treatment.
- **All three `archOrder` maps reversed** to `dynasty: 0, contender: 1, tweener: 2, rebuilder: 3, emergency: 4` (most valuable first). Affects the league teams sort, the outer league-list `ML_ARCHETYPE_ORDER` sort, and the trade-finder bucketing.
- **Dropdown label updated:** "Archetype (rebuilders first)" → "Archetype (most valuable first)".

### Visual polish

- **`.ml-wv-table .num` and `.ml-standings-table .num`** explicitly `color: var(--white)` so WON / WIN% cells render white instead of black on the dark theme.
- **Roster-section AGE + EXP cells** changed from `color: var(--muted); opacity: .5` to `color: var(--white)` per user feedback.

### push.bat parser fixes

push.bat's five sync-check warning blocks had two latent bugs that surfaced once the My-Leagues refactor caused drift detectors to fire:

- **Unescaped `(` and `)` inside `if defined … (…)` echo lines** in five warning blocks (tab-sync / modal-sections / panel-css / chip-sync / legend-sync). The `)` inside `5 tabs (Trades …)` closed the outer `if` block prematurely. Fixed with `^(` / `^)` escapes.
- **`\"\|` alternation inside findstr's `/C:"…"` patterns** (modal-sections and legend-sync checks). cmd doesn't interpret `\"` as an escaped quote, so the string terminator collapsed and `|` was parsed as a pipe operator → `| was unexpected at this time.` Replaced with findstr's native space-separated OR mode (drop `/C:` and `/R`, list patterns as space-separated tokens).

These fixes are in push.bat (gitignored / local-only) — the repo doesn't carry them, but the fix recipe is documented here in case it needs to be re-applied.

### Commit highlights (selected)

- `b82cb26` Fix my-leagues PICK_VALUES record-object handling
- `1dded81` Archetype ordering + composite scoring; white text on .num cells
- `ee2343b` Roster table: AGE + EXP cells render white instead of muted
- `bfb7bfb` Fix exposure rows not rendering; league sort order Dynasty-first
- `86833ee` ML player modal → shared slide-out drawer with accordion sections
- `95fd797` ML accordion: MutationObserver re-injects header after async renders
- `bd29bb3` ML panel: lift availability slot above accordion, harden header injection
- `e9dcb02` update site + refresh data (final deploy of the day)

---

## 2026-05-12 — Shared player-panel module + ADP tool + Tiers modal + sync-check warnings

### Shared module extraction

- **Extracted `assets/js/player-panel.js` (~1600 lines)** as a self-contained IIFE that mounts the right-edge slide-out drawer into `document.body`. Public API: `window.PlayerPanel.{init, open, close, showTab, setCurrentPage}` + backwards-compat globals (`window.openPanel`, `window.ppShowTab`).
- **Extracted `assets/css/player-panel.css` (~600 lines)** with drawer chrome, tab styles, position-badge palette, trade-card layout, headshot fallback.
- **Wired DB / Calc / ADP / Tiers** to the shared drawer via page-local `window.*` mirroring + `FPTS_CURRENT_PAGE` marker + `data/mvs.json` fetch chain.
- **`#pp-league-context` slot** added to the panel template for page-specific content (only ML uses it now).
- **Cache-bust tokens** on shared asset URLs (`?v=1778645000`).

### Pages

- **`adp-tool.html` deployed.** Box + List views, Picks/Simple/Rookies toggle, ADP heatmap tab. Player modal routed through shared drawer; SLEEPER_IDS built from the active ADP bucket.
- **`tiers.html` player modal** opens inline (no longer redirects to DB). Routes through shared drawer.
- **All 5 modals share the same 5 tabs:** Trades / Player Stats / Age Curve / Trade Finder / ADP Heatmap.

### push.bat sync-check additions

Five non-blocking drift detectors added so future refactors get a heads-up if pages diverge:
- `tab-sync` — counts of `*ShowTab(...)` calls must match across DB / Calc / ML / ADP.
- `modal-sections` — every page must have `pp-mvs-extras` + `articles-mount` mount divs.
- `panel-css` — every secondary page must link `assets/css/player-panel.css`.
- `chip-sync` — Trade Calculator `.asset-row[data-pos=…]` count must match Trade Finder `.tf-asset[data-pos=…]` count.
- `legend-sync` — if UI files changed but `assets/js/legend-content.js` didn't, nudge to update the in-app legend.

### Visual / UX

- **Articles section unified** across all 5 player modals (banner-style, FantasyPoints branding).
- **Article overflow list** floats as an overlay (`position:absolute`) so expanding it doesn't shift the profile content.
- **Calendar inputs** got a custom white SVG indicator (replaces the native indicator that was dark on dark theme).
- **Grey removed from text palette** per brand spec — opacities bumped to 1.
- **MVS History sparkline** removed from inline player-modal header (was duplicating Recent Trades below).

### Legend drawer + function reference

- **Per-page Legend drawer** added (`assets/js/legend.js` + `legend-content.js`) — expandable developer documentation surfaced in-app.
- **~150 documented items** across all 5 pages.
- **Function-reference PDF** expanded with Data Pipeline / Legend / Shared Modules pages.

### Defensive fixes

- Search bars wrapped in try/catch with startup data-health diagnostic.
- "No trades found" race on cross-page handoff fixed (timing race with TRADES build).
- Headshot fallback chain covers `ktc.sleeperId` (camelCase from FP_VALUES) in addition to `SLEEPER_IDS[name]`.

---

## 2026-05-11 — Dynasty ADP / auction / heatmap pipeline

- Built **`sync-adp.py`** that reads parquets from `C:\Users\deons\Desktop\sleeper_dynasty_adp` (a separate folder + notebook that mines ~1,800 real dynasty drafts + ~856 real dynasty auctions from the Sleeper API) and produces `data/adp.json`, `data/auction.json`, `data/pick-availability.json`.
- **Stripped FP's ADP and auction values** from `data/values.json` output — FP endpoints still called for name/rank resolution but their auction (redraft-flavored) is no longer used.
- **Added sync-adp step to push.bat** (became 5-step pipeline).
- **Wired all page bootstraps** to fetch + apply the new ADP/auction shape.
- README rewritten as a session handoff doc.

---

## Convention

Each entry: `## YYYY-MM-DD — short headline` + a few sub-sections (Architecture / Data / Visual / Fixes / Commits). Append new sessions at the top.
