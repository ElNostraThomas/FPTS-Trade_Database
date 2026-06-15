# Session-by-session changelog

Notable changes per work session. Newest first. For the live punch list and
"resume where we left off" guidance see [`../README.md`](../README.md). For
the operator manual see [`WORKFLOW.md`](WORKFLOW.md).

---

## 2026-06-14 — Cross-league Waiver board + tappable rows (`451a2a6`)

Tester feedback on the Waiver Wire board (Roster Moves standalone + My Leagues sidebar): the per-league picker looked off-brand and there was no signal the rows were interactive. Reframed the board **cross-league** and removed the picker.

### `assets/js/waiver-wire.js`, `assets/css/waiver-wire.css`
- **Removed the league picker** (`#tc-wv-league` + `.tc-wv-league*` markup/CSS) from both pages.
- **`_bestAvailable()` is now cross-league** — highest-value players who are a free agent in **any** of your leagues (ranked by canonical `value`), each row tagged "**N lg**" (how many of your leagues he's free in). **`_addedHere()`** filters the 7-day trending adds to players free in at least one league.
- **Tappable rows** — every board row gets a ▾ **caret** and toggles an **inline expansion** (`.tc-wv-row-exp`) showing the per-league Free / Owned-by-a-manager / On-your-roster breakdown (lazy-rendered, cached once). Extracted `_lgRow` + `_availGroupsHtml` (shared with the search panel) and added `toggleRow`.
- `setLeague()` kept as a backward-compat render shim (My Leagues still calls it; the id is ignored now).
- Tokens: `waiver-wire.js` / `.css` → 1799500000 (both pages). `check-colors` CLEAN (47); JS delimiter-balanced.

### Updates timeline
Added **S30** "Cross-league Waiver board" to `formulas-content.js` `sessions[]` (public → also on What's New); token → 1799500000 (formulas.html + whats-new.html). Supersedes S26 ("League-scoped Waiver Wire").

---

## 2026-06-11 (follow-on) — Headshot placeholder fix + sidebar Waiver slim + calculator formula docs + trade-calc.css de-dupe

All pushed; `check-colors.py` CLEAN (44 files).

### Player headshot placeholder (`321917b`)
Players Sleeper has no photo for (usually rookies) were breaking row layout: `playerThumb` returned a bare `<img>` that WAS the roster-row grid's first cell, so `onerror` `display:none` collapsed the cell and scrambled the row one column left. Wrapped the img in the fixed-32px span (the codebase's own safe pattern) + a `.ml-thumb-ph` placeholder disc. Swept the same disc to every other player-headshot wrapper so a missing photo reads as a neutral avatar site-wide: calc trade cards, Recent-Trades cards (`index.html`), shared trade cards (`player-panel.js`, all pages), Waiver rows (`waiver-wire.js`), and Standings avatars. Tokens: `player-panel.js`/`waiver-wire.js` → 1799000000.

### Slimmed the My Leagues sidebar Waiver tab (`a2f0e9b`)
Dropped the redundant "Most Valuable Available" column (each league's Waivers → Best Available sub-tab covers it now); `renderBoard`'s `if (valEl)` guard skips it (no JS change). The sidebar keeps its unique cross-league search + "Most Added · 7d". The standalone Roster Moves page still renders both columns.

### Guru-Approved seal + gap-targeted suggestions → formula cards (`0b7d440`)
Filed the two S22 calculator heuristics as full cards: `formulas-content.js` entries 29/30 (trade-tools domain), `docs/FORMULAS.md` §28a/§28b + TOC + constants table, `legend-content.js` items, README marked done. Guru: `guruApprove = totalA>0 && totalB>0 && (diff<=0 || pctOff<=5)` (reuses the 5% fair band). Gap: browsing the lighter side with no query sorts by `|value − need|`. Also repointed two stale `my-leagues.html → assets/js/trade-calc.js` line refs.

### trade-calc.css de-dupe (`de1f9f9`)
my-leagues carried a byte-identical inline copy of the 132 `.ml-calc-*`/`.ml-tb-*`/`.ml-modal*` + `.ml-pd-*` mobile + grouped-core/picker rules already in `assets/css/trade-calc.css`. Both pages now load the one file: removed the 132 duplicated inline rules (−415 lines) via a comment/string-aware CSS tokenizer matching each rule by exact (media-context, selector, body), and linked `trade-calc.css`. Page-unique rules stay inline. Verified: 0 calc/modal defs remain inline, 0 non-duplicates removed, `<style>` CSS brace-balanced, standalone untouched.

### Updates timeline (`this commit`)
Added S27 to the "Updates & Formulas" page (`formulas-content.js` sessions; token → 1799100000).

---

## 2026-06-11 (twenty-fifth session) — Waiver Wire + Live Draft "Your Drafts" + Roster Moves rename + mobile sweep

All pushed; `check-colors.py` CLEAN (42 files).

### Waiver Wire (`ab2f781`, `e25acee`, `15434e4`, `eb6b618`, `a75bfba`, `91ff100`)
New shared module `assets/js/waiver-wire.js` (`window.WaiverWire`) + `assets/css/waiver-wire.css`. Search a player → per-league availability across your leagues (FA leagues first with a "Claim On Sleeper ↗" link, then owned/yours — a lean port of my-leagues' `mlGetPlayerAvailability` over `window.ML_ALL_LEAGUE_DATA`), plus a global Most-Added / Most-Dropped board (Sleeper `/players/nfl/trending/add|drop?lookback_hours=168`) annotated "available in N of your leagues". Added as a tab on Roster Moves and as a 4th My Leagues sidebar tab (`15434e4`; `mlEnsureWaiverPanel` enriches `ML_ALL_LEAGUE_DATA[id].league` from `ML.leagues`, trending stacked 1-col). Polish: trending mapped at **render time** so it survives the league-load race (was showing raw player IDs + all "rostered"); player **NFL team logo** in the header + clearing the search resets to the board; **NFL shield** for free agents instead of a blank/broken logo; **"NR"** indicator for players MVS doesn't value + team logos on the trending rows.

### Live Draft — "Your Drafts" after sign-in (`001dac8`)
`live-draft.html`: the active-draft probe (which only marked leagues 🔥 and discarded the drafts) now keeps them and renders a "Your Drafts" card row above the pickers — every in-progress (Live) + scheduled (Upcoming) draft across current-season leagues, tagged Startup/Rookie. Clicking a card drives the existing cascade (`ldFetchLeagues`→`ldOnLeagueChange`→`ldOnDraftChange`→`ldLoadDraft`) to load the board; no new Sleeper calls.

### "Trade Tools" → "Roster Moves" + roster-style dropdowns (`8654cfe`, `422b998`)
Renamed `trade-calculator.html` site-wide (nav + mobile selects on all 11 pages + title/header). Roster-style grouped "Add player" dropdowns on the calculator: browsing a side (no query) groups candidates by position (QB→RB→WR→TE→K/Other→Picks); in scoped mode the candidates ARE the rosters (yours on Send, the manager's on Receive), with a "Need ~X to balance" hint.

### Mobile sweep (`ff68715`, `82e8a00`)
Roster Moves had no mobile `@media` → the 3-tab strip overflowed; added a horizontally-scrollable tab strip + tighter chrome. Shared waiver CSS: phone tap-targets, 16px search input (no iOS focus-zoom), compact tags, wrapping availability header.

### Trade History Search (`0363ca5`)
New shared module `assets/js/trade-history.js` (`window.TradeHistory`) + `trade-history.css`. Type a player → every trade across your leagues/seasons that involved him and that you were a side of, each card flagged with who proposed it (🫵 You / the manager, from Sleeper's transaction `creator` vs your user id), the searched player highlighted, your side marked. Reuses/builds the cross-league `window.ML_MY_TRADES` pool (ports `mlEnsureMyTrades`: walks `previous_league_id` chains, fetches `/league/{id}/transactions/{week}` w1–18, keeps complete trades where `roster_ids` includes your roster; lazy + cached + shared with My Leagues' My Trades tab). Self-contained `cardHtml` (adds/drops/picks/FAAB, format-aware values), autocomplete over `FP_VALUES`, match by sleeperId in adds/drops. Mounted on the Roster Moves **"Trade History"** tab + atop the My Leagues **"My Trades"** tab.

### Waiver Wire → league-scoped board (`acd5f1c`, `b355e81`)
Replaced the global Most Added/Dropped with a **league picker** + two columns: **Most Valuable Available** (highest-value players NOT rostered in the selected league — best free agents by format-aware dynasty value, `FP_VALUES` minus the league's rostered sleeperIds, top 30) + **Most Added** (the one global Sleeper trending-add fetch filtered to players available in that league, "🔥 N adds"). All in-memory from already-loaded rosters + FP_VALUES; no new Sleeper calls. **User-feedback fixes (`b355e81`):** the My Leagues board now opens on the league you're focused on (`mlEnsureWaiverPanel` → `WaiverWire.setLeague(ML.selectedLeagueId)`), and the player search gained a one-click **✕ clear** (`WaiverWire.clearSearch` — resets input + dropdown + availability back to the board, no backspacing).

### Updates timeline (`47b12af` + S25/S26)
S22 (Roster Moves hub), S23 (Waiver Wire), S24 (Live Draft cards), S25 (Trade History Search), S26 (league-scoped Waiver Wire) added as description-only nodes to `formulas-content.js`; README + this file + the function-reference PDF kept in sync.

---

## 2026-06-10 (twenty-fourth session) — Modularized the trade engine → public Roster Moves page

The Trade Finder + editable Trade Calculator were extracted into shared `assets/js` modules (one engine, two pages), as 6 verified phases (`6a40993` … `b036fa2`).

- New modules: `assets/js/league-compute.js` (`window.LC` — value/archetype compute over `window.SLEEPER` + `FP_VALUES`), `assets/js/trade-finder.js` (`window.TradeFinder`), `assets/js/trade-calc.js` (`window.TradeCalc`); styles `assets/css/trade-finder.css` + `trade-calc.css`.
- `my-leagues.html` loads the modules + inits them with data/feature hooks; inline finder/calc moved out (`ml*` wrappers delegate to `LC`); the Trade Finder tab is now public (admin gate removed).
- `trade-calculator.html` (was a redirect) became the public page built from the modules: Sleeper login → all leagues → `Trade Finder | Trade Calculator` tabs, full-width; consumes the cross-page handoff.
- Nav: a "Trade Tools" link added to every page (later renamed → "Roster Moves").
- Regression caught + fixed: `mlGetPlayerStatus` slipped out of the slice and broke the My-Leagues player panel until re-exposed (`b8fd564`). **Lesson:** when byte-slicing, enumerate every moved fn + check host-page callers.
- Calculator iterations: gap-targeted suggestions + longer list (`92d8f25`), a Guru-Approved seal that lights for fair-or-better (`eff02aa`), de-coined guru image (`5a85e6d`).
- Carried debt: `trade-calc.css` duplicates my-leagues' inline `.ml-calc-*`/`.ml-tb-*`/`.ml-modal-*` styles.

---

## 2026-06-09 (sessions 21–23) — Cross-league Trade Finder

The trade calculator's "find comparable real trades" idea evolved into a login-gated **cross-league Trade Finder**: list the player(s) you want → it scans all your leagues for who rosters them → suggests a package from your roster, tilted to the owner's archetype and built against `value × WIN_BIAS (0.93)` so it lands ~5–8% in your favor (`edge = 1 − totalSent / targetVal`, shown as "You win N%"). Built first as a standalone page, then moved to a My Leagues sidebar tab. Documented in `docs/FORMULAS.md` + `formulas-content.js` (S21 node, `trade-finder` domain) + the legend. See `README.md` for the full session-21–23 handoffs.

---

## 2026-06-08 (twentieth session) — Accumulating trade archive + TEP value basis + docs-as-timeline + TAT→DPP

Large multi-part session; all pushed live. `check-colors.py` CLEAN across 34 files throughout.

### Accumulating trade archive (`ce6669c`)
The trade DB read trades from `MVS_PAYLOAD.players.*.recentTrades`, a rolling ~30-per-player window that `sync-mvs.py` further truncated to 3 — so each export *shrank* trade history. New local-only **`sync-trades.py`** unions every CSV's `recent_trades` into a persistent **`data/trades.json`** keyed by `transaction_id` (purely additive; aborts if the count would drop). Seeded from the old + new exports = **16,785 unique trades** (Jan 1 → Jun 8), preserving 6,642 the latest export had dropped. `data-bootstrap.js` fetches it (DB-page only, ~7 MB) → `window.TRADES_ARCHIVE`; `index.html` `_buildTradesFromMvs` builds from the archive (MVS path as supplement, deduped) and `renderRecent` got Load-more pagination (60/page). `push.bat` gained a `[3c/5]` accumulate step. On-page trade count ~1,500 → **16,764**.

### TEP value basis site-wide + calculator slider removed (`5b9f581`)
`sync-mvs.py` now sources every value-derived field (value/baseline/trend/history, SF + 1QB, players + picks) from the CSV's `*_tep` columns — tight-end premium baked into the canonical value everywhere (Loveland 3,929 → 4,945). Eight `COL_*` constants make it a one-line revert. With TEP in the base, the trade calculator's `×(1+tep·0.12)` TE multiplier double-counted, so the whole TEP slider was removed from `trade-calculator.html` (dropdown, `getMultiplier` TE term, `_calcTep`, `_pickNumericValue` valueTep branch, the `t.tep` trade filter). Docs synced: `legend-content.js`, `formulas-content.js`, `docs/FORMULAS.md`. **Untouched:** the QB/PPR/PassTD multipliers (a separate possible double-count, flagged for later).

### Top Risers/Fallers row fix (`15b5889`)
Names truncated early in the ~260px sidebar. Single-line ellipsis, team logo moved left of the name, value stacked over the change pill on the right, fixed 40px row height → uniform list, no early truncation.

### Docs as a timeline-card UI + TAT→DPP (`aff7fbd`, `17fadd6`)
Legend drawer restyled to a "New Features" timeline-card look (`legend.css` only). Formulas page repurposed into an **"Updates & Formulas" timeline** — formulas grouped under the session that introduced/last-changed them, newest first; `formulas-content.js` gained `sessions[]` (the **full 32-session pushed history**), `domainSessions`, `entrySessions`; `formulas.js` rewritten to group + render the timeline (formula-less updates render as description-only nodes); `tiers` filed under the S17 DPP-ladder node. Renamed the tier value-ladder label **TAT → DPP** (65 occ / 11 files; `import-dpp.py` glob accepts both `DPP*.csv` + `TAT*.csv`). Cleanup: removed dead `.fm-domain*` CSS, renamed `import-tat.py → import-dpp.py`, this CHANGES.md catch-up.

**Updates-page polish + nav rename.** Nav link **"Formulas" → "Updates"** across all 11 pages + `<title>` (href still `formulas.html`). Formula-less update nodes made **compact + muted** with a **"Formulas only" toggle** (`fmToggleNotes`) to hide them; formula cards now **lead with name + headline math** and tuck the rest behind a collapsed **"Details ▸"** expander (`renderEntry` rewrite; search auto-expands matches). New `.fm-toggle` / `.fm-primary*` / `.fm-more*` CSS; `formulas.js → 1796700000`.

**Cache tokens:** `data-bootstrap.js → 1796100000`, `legend.css → 1796300000`, `legend-content.js`/`formulas-content.js`/`formulas.js` bumped (latest `1796700000`).

---

## 2026-06-07 (nineteenth session) — My Leagues cross-league "My Trades" + per-team Trade History filter

Three commits, all pushed live (`21202b8`, `7130bfc`, `de9b6fe`). `check-colors.py` CLEAN across 34 files.

- **Cross-league "My Trades" sidebar tab** on `my-leagues.html` — a top tab strip (`Exposure | My Trades`) that pools **every trade the user was a side of, across all their leagues**, into one year-switchable view (years = union of seasons via each league's `previous_league_id` chain). Lazy + cached on `window.ML_MY_TRADES`, invalidated on season switch + logout.
- **Shared trade-card builder** `_mlTradeCardHtml(t, ctx)` extracted so the per-league Trade History and the new cross-league sidebar render from one source (`leagueName` in `ctx` adds the league banner for the cross-league view).
- **Per-team filter on Trade History** (`de9b6fe`) — a team dropdown leads the year-tab row; filters a league's trades to one owner (by stable `user_id`, resolved to each season's `roster_id`). Defaults to All Teams; persists in `window.ML_TRADE_TEAM_FILTER`, cleared on sign-out.
- All inline in `my-leagues.html` — no shared-asset cache bumps.

---

## 2026-06-02 (eighteenth session) — OBS zoom rewrite + ADP RDP two-layer filter fix + 5-year consistency validation

Four substantive commits, all pushed live (`b198878..e9197c2`). `check-colors.py` CLEAN across 34 files after every commit.

### `48e938d` — obs: viewport-meta zoom (matches browser Ctrl+wheel, auto-collapses chrome, no clipping)

Rewrites `assets/js/obs-zoom-controls.js` to manipulate `<meta name="viewport" content="width=W">` instead of `body { zoom: N }`. Setting a smaller meta viewport width tells Chromium/CEF to lay out at that CSS px width and scale the rendered output up — the same chain Ctrl+wheel produces in a desktop browser. brand.css adaptive `@media` breakpoints (1599 / 1299 / 1099 / 768) re-fire smaller versions on zoom-in, so the topnav auto-collapses (wordmark-tag → nav-stat → mobile-select) and content reflows to fit the iframe.

**Why the old approach failed:** `body { zoom: N }` only inflated visual scale; `@media` kept evaluating against the unchanged layout viewport, so the desktop layout stayed full-size and overflowed when the visual blow-up pushed it past the iframe edge.

- Captures the iframe's physical CSS px width on init (temporary default-viewport revert + forced reflow), re-measures on resize via rAF-debounced hook.
- Reset restores `width=device-width, initial-scale=1.0, viewport-fit=cover` exactly.
- localStorage persistence (`fpts-obs-zoom`), ladder (1.0/1.25/1.5/1.75/2.0), iframe-only guard, mount on `documentElement` — all unchanged.

Cache token `obs-zoom-controls.js ?v=1783800000 → ?v=1791400000` across all 11 consumers (10 deployed pages + `templates/page-template.html`).

### `4dc4387` — data: regenerate ADP, picks_sf now carries ROOKIE_PICK_X.YY placeholders

User reported: Dynasty Startup ADP → "Picks" view showed only vets — zero rookie pick rows even though `relabel_picks_K_to_rdp` was supposed to translate K-as-pick stand-ins to `ROOKIE_PICK_X.YY` placeholders. Investigation chain:

1. Verified `data/adp.json` `picks_sf` had 656 entries, ZERO `ROOKIE_PICK_*` IDs, ZERO K-pos IDs.
2. Manually ran `relabel_picks_K_to_rdp` against `picks_2026.parquet` → produced 41,318 ROOKIE_PICK_ rows with 141 unique RDP placeholders (1.01 through ~12.01) → code works.
3. Manually ran `build_format_adp` → produced 741 entries with 78 RDP records → code works in isolation.
4. Re-ran `sync-adp.py` end-to-end → STILL produced zero RDP records in `picks_sf`.
5. Found `_filter_offense_inplace` at `sync-adp.py:59-69` was iterating every record and dropping anything outside `_OFFENSIVE_POSITIONS = {"QB", "RB", "WR", "TE", "K"}`. Synthetic placeholders carry `position: "RDP"` — they all got filtered out after `build_format_adp` produced them correctly, just before the JSON write.

**Fix:** added `"RDP"` to `_OFFENSIVE_POSITIONS` in `sync-adp.py` (local-only, gitignored per project doctrine). Re-ran sync-adp.py — regenerated all 5 years of ADP outputs (`data/adp-{year}.json` + `data/auction-{year}.json` + `data/pick-availability-{year}.json`).

**Verified `picks_sf` after regen:**

| Year | picks_sf RDP | picks_1qb RDP |
|------|-------------:|--------------:|
| 2022 | 82 | 48 |
| 2023 | 94 | 47 |
| 2024 | 96 | 45 |
| 2025 | 85 | 51 |
| 2026 | 78 | — (no qualifying 1QB drafts — only 8 in corpus, below `min_drafts=5` after player-split) |

Pick-availability heatmaps also include RDP entries per year (82 / 94 / 96 / 85 / 78).

### `1199547` — docs: ADP picks_sf RDP vs rookies_sf consistency validation

New `docs/adp-picks-rdp-consistency.md`: 5-year delta table comparing each `picks_sf` RDP placeholder vs the correspondingly-ranked rookie in `rookies_sf`, interpretation of the systematic gap as the "abstract-pick discount" (uncertain future picks valued slightly later than the realized rookie), and a repro script.

The repro doc captures the **correct rookie filter** for past-year files: `yearsExp == (CURRENT_SEASON − year)`, NOT `yearsExp == 0`. The latter selects today's rookies (2026 class) from historical files where they don't exist, returning Sleeper's "Player Invalid" placeholder for ~all rows. The corrected filter shows Caleb Williams as 2024 1.01, Bijan as 2023 1.01, Breece Hall as 2022 1.01 — confirming bucketing + player_id resolution work correctly back through 2022.

**5-year delta summary:**

| Year | Mean Δ | Median Δ | Range          |
|------|-------:|---------:|---------------:|
| 2022 | −2.5   | −0.9     | −14.5 to +8.3  |
| 2023 | −1.2   | −0.2     | −9.8 to +6.4   |
| 2024 | −5.0   | −1.6     | −17.6 to +6.4  |
| 2025 | −15.0  | −14.6    | −31.5 to −3.2  |
| 2026 | −5.3   | −4.1     | −18.1 to +6.1  |

Median within ±5 picks for 4 of 5 years. 2025 outlier reflects elite-class consensus locking in early.

### `e9197c2` — adp: surface rookie-pick (RDP) placeholders in Picks view

`4dc4387` shipped the data fix but the board still rendered no rookie picks. Second filter gate discovered: `data-bootstrap.js:_cleanAdpPayload` runs `ADP_FILTER_KEEP_POS = new Set(['QB','RB','WR','TE'])` on hydrate. Same shape as the sync-adp.py gate — silently stripping RDP records on the frontend.

**Two-part fix:**

1. **`assets/js/data-bootstrap.js`** — `ADP_FILTER_KEEP_POS` extended to `{QB, RB, WR, TE, RDP}`. RDP records now pass through to `window.ADP_PAYLOAD`. The 10%-of-corpus draft floor still applies, but RDP rows comfortably clear it (Rookie Pick 1.01 has 881 drafts vs floor ~88).
2. **`adp-tool.html`** — `.pb-item.RDP` chip styling added using `var(--pos-pick-bg) / var(--pos-pick)` (matches existing PICK/DEF/RDP color family). `renderPosBreakdown` `order` array gained `'RDP'`. Display label maps `RDP → "PICKS"` so the chip reads `PICKS 78` next to QB/RB/WR/TE. Click-to-highlight wiring inherits unchanged via `data-pos-toggle="RDP"`.

Existing rendering hooks were already in place from prior sessions (`isRookiePick`, `flameThumb`, `.box-card.RDP` CSS at line 259) — they just had no records to render.

Cache token `data-bootstrap.js ?v=1783700000 → ?v=1791500000` across all 11 consumers.

### Durable rule (two-gate RDP)

Any future change touching ADP must preserve RDP through **both** filter gates:

1. **`sync-adp.py:_OFFENSIVE_POSITIONS`** must include `"RDP"`.
2. **`assets/js/data-bootstrap.js:ADP_FILTER_KEEP_POS`** must include `"RDP"`.

If a sync run produces zero RDP entries in `picks_sf` despite a non-empty corpus, gate #1 was stripped. If the JSON has RDP but the board renders no rookie picks, gate #2 was stripped. Verify both before declaring a fix complete.

`docs/FORMULAS.md` §51 + `assets/js/formulas-content.js` 'sync-adp-k-relabel' entry document both gates with file:line refs. `assets/js/legend-content.js` 'adp-tool' → "Data Pipeline (Picks-as-Assets)" section adds a "Two-gate RDP rule" item.

### Notes for next session

- The RDP fix did not require any per-page edits beyond `adp-tool.html`. Other pages that consume `ADP_PAYLOAD` (player-panel heatmap mounts, FP_VALUES `.adp` overlay) read RDP-aware data automatically now.
- `sync-adp.py` is gitignored — the `_OFFENSIVE_POSITIONS` fix lives on the operator's local machine. Any new machine cloning this repo will need to re-apply the same edit before `push.bat` produces correct ADP outputs.

---

## 2026-05-28→29 (seventeenth session) — 12-tier DPP ladder + standalone tier-sync, 2026 ADP refresh (both sites), MVS trade-value refresh

Multi-part session; all committed + pushed. Main: `36be966..b63309c` (tiers + mirror + 2026 ADP + docs) then `b63309c..5d0d809` (MVS). Standalone: `de01a45..321b55f` (2026 ADP). `check-colors.py` CLEAN across 34 files.

### Tiers → 12-tier DPP ladder + single-source-of-truth mirror

Collapsed the old 21-tier ladder (S++…F−) to DPP's **12-tier value ladder** (S++, S+, S, A+, A, A−, B+, B, B−, C+, C, C−), matching the `FPTS-Tiers-Standalone` fork. **The standalone is now the canonical tier source.** `push.bat` gained a `[3a]` step (local-only, like the other sync scripts) that `git pull`s the standalone and copies its `tiers.csv` + `tier-config.json` into this repo before `sync-tiers.py` (which auto-detects the DPP value-divider format). Main's `tiers.csv` is now byte-identical to the standalone's (200 players). **Edit tiers only on the standalone going forward** — the mirror clobbers main-side edits on the next deploy.

- Tier titles are hybrid (descriptor + DPP value, e.g. `S++ = "Cornerstone 3 Base 1sts (+/-)"`), admin-published and mirrored to both sites.
- `tiers.html` (12-tier `TIER_DESCRIPTIONS`/`TIER_ORDER`/`tierBadgeClass`; removed `.t-d*/.t-e*/.t-f*` CSS); `sync-tiers.py` (`VALID_TIERS` 21→12; `parse_tat_rows` now ignores the Recent Movement column → trending manual-only); `admin-tiers.js` (both 21-tier lists trimmed); `tier-config.json`. Cache bump `admin-tiers.js` + `formulas-content.js → ?v=1788000000`. Docs: `FORMULAS.md §17` + `formulas-content.js` (dual-sync).
- **posRank NOT ported** — `applySleeperOverlay()` already overlays `posRank` from `values.json` client-side, so PRK already matched FP consensus. **No player data dropped** (D/E/F were empty scaffolding).
- The combined main commit rebased over 2 upstream admin commits (`Jeremiyah Love S+→S` + a version bump); the standalone-canonical files won the conflict and Love stayed at S (already matched).

### 2026 ADP refresh (both sites)

Re-ran the factory scrape (`02_update_adp_snapshot`, now auto-detects season; ~335k adp_time_series rows) → `sync-adp.py` in both repos → `adp/auction/pick-availability` JSONs (5 seasons; 2,216 drafts in the heatmap). The ADP factory repo (`LGilbertFF/sleeper-dynasty-adp-board`) is not pushable from the `ElNostraThomas` account, so the notebook fix (`eb6a6ff`) + scrape data (`f92d25e`) are committed **locally only** — fine, since `sync-adp.py` reads the local parquets.

### MVS trade-value refresh (main only)

Full Supabase player-market export → `data/source/player_market_mvs.csv` → `sync-mvs.py` → `data/mvs.json` (**527 players, 60 picks**, current through 2026-05-29). Powers the trade calculator + value displays. The standalone doesn't consume MVS.

Left untouched: `compare.html` `_pcTierBgColor`/`_pcTierFgColor` (dead-but-harmless D/E/F branches behind a safe default); `legend-content.js` (its "Cornerstone Players" mentions are hypothetical rename examples).

---

## 2026-05-23 (sixteenth session) — Mock-draft + live-draft pick-card parity ship + punch-list final cleanup + Admin Scratchpad legend documentation

Presentation-day session. Inherited an open punch list of 6 actionable items; closed the actionable ones, marked the rest as external-blocked or deferred so the operator has a clean state heading into the demo. 7 substantive commits + 1 data-sync auto-commit between sessions. Per-commit detail below in chronological order:

### `c360190` — docs: punch list — mock-draft card parity + trade-icon placement + ADP-delta indicator

First of three commits in the cleanup arc. User flagged three asks on mock-draft pick cards: (1) closer visual parity with the ADP `.box-card` recipe, (2) keep the trade icon but reposition it between the two coins, (3) add a small above/below-ADP indicator. Captured as a new open punch-list item with technical detail (file:line refs, the structural delta vs ADP cards). Initial scope was mock-draft-only — corrected in the next commit when the user flagged live-draft too.

### `ffcdb9d` — data-sync auto-commit (between sessions)

Standard `push.bat` data refresh. No code changes.

### `2ea3236` — docs: punch list — expand card-parity item to cover live-draft cells

Scope expansion after the user clarified "it needs to be the mock draft and the live draft cards." Code inspection revealed the structural delta: `mock-draft.html` already lifts the `.box-card` recipe with both coins (audit-and-reconcile job), while `live-draft.html` uses its own `.ld-cell` system at lines 789-918 (text-only, height 76px, no coins, but trade indicator `.ld-cell-traded` already exists at line 896 — chip with arrow + new owner's 16px avatar). The two pages need different amounts of work to land at the same visual.

### `207724a` — mock-draft: add above/below-ADP delta chip to each pick card

First implementation commit. Mock-draft cells already had both coins from the ADP recipe — just needed the new chip. Added `.card-delta` CSS in the `.box-card` block + wired into `pickCardHtml()` at line 1441:

- `.card-delta` CSS: tiny pill (`padding: 0 4px; font-size: 8px; border-radius: 2px`) in `.card-top` next to `#{pickNo}`. Brand-token backgrounds: `.value` = `var(--green)`, `.reach` = `var(--red)`, `.par` = `rgba(0,0,0,.22)`. Black text on bright fills per site doctrine.
- `pickCardHtml` change: look up player's `rawAdp` (from `_activeUniverse`), compute delta vs `pick.pickNo`, render chip with label `+N` / `−N` / `·` and tooltip showing the full label + ADP reference. Skipped entirely when no ADP coverage (rare deep rookies / IDP) so cells don't carry a useless indicator.
- Wrapped in a containing span so the `#{pickNo}` text and chip group together on the right side of `.card-top` without disrupting the existing flex `space-between` layout.

±5 threshold mirrors `live-draft.html _pickDelta()` so the same player feels the same on both pages. `rawAdp` (the source ADP from `ADP_PAYLOAD.byMonth.ALL[fmtKey]`) is the right field — not `player.adp` which is scoring-shifted (TEP nudges, 6pt-TD nudges) for internal pick-scoring.

### `6678dda` — live-draft: rebuild .ld-cell for ADP-card parity + relocate trade chip + delta chip

The bigger implementation commit. Three structural changes bundled to land the punch-list ask in one commit:

1. **`.ld-cell` recipe rebuild.** Height bumped 76 → 100px. New `.ld-cell-team-logo` (bottom-left, 32px coin, holds 24×24 team logo via `TeamHelpers.logoUrl`) + `.ld-cell-hs` (bottom-right, 40px headshot coin, Sleeper CDN URL `https://sleepercdn.com/content/nfl/players/thumb/{sid}.jpg`) + `.ld-cell-hs-fallback` (neutral silhouette SVG when 403/404, mirrors `fpts-hs-fallback` doctrine). New `.ld-cell-meta` spacer (`margin-top: auto; min-height: 2px`) preserves a consistent bottom band. `.ld-cell-name` got `padding-right: 44px` to reserve room for the headshot coin.

2. **`.ld-cell-traded` chip relocation.** Moved from absolute `bottom:3px; right:3px` to centered `bottom:6px; left:50%; transform:translateX(-50%); z-index:2`. Background opacity bumped `.45 → .55` so the avatar/arrow stay legible over a bright position-color fill now that the chip sits over the more visible center-bottom strip. `z-index:2` keeps it above the two coins so it never hides behind them.

3. **`.ld-cell-delta` chip added in `.ld-cell-top`.** Same `.value` / `.reach` / `.par` recipe + same `_pickDelta()` math as the existing Pick Analysis card. New `fmtKeyForBoard = _adpFmtKey(meta, DRAFT.league)` computed once at the top of `ldRenderBoard` (line 3000) so the per-cell lookup via `_playerAdp(fullName, fmtKeyForBoard)` doesn't re-derive on every cell. POS pill + delta chip wrapped in a new `.ld-cell-top-right` inline-flex span so flex `space-between` keeps them grouped on the right (otherwise three direct children would spread across the row).

All page-specific modifiers (`.mine`, `.on-the-clock`, `.user-up-next`, `.traded`, `.empty`) preserved unchanged — only the cell internals changed. Empty cells inherit the new height but skip the coins + delta chip (no player_id to look up). Spot-checked: empty cells with `ON THE CLOCK` / `YOUR PICK` label still center correctly with the new height.

### `be9c1af` — live-draft: mobile @media — downscale .ld-cell + coins to match mock-draft sizing

Caught immediately after `6678dda` by checking the mobile `@media (max-width: 768px)` block — the new headshot + team-logo coins are sized for the desktop 100px cell; on mobile the cell drops to 72px and the coins need to shrink with it so they don't overflow. Mirrors `mock-draft.html` mobile `@media` block exactly:

- `.ld-cell` height 64 → 72px (room for the 26px headshot coin)
- `.ld-cell-hs / -hs-fallback`: 26×26 (was inherited 40×40)
- `.ld-cell-team-logo`: 22×22 with 15×15 img (was inherited 32×32 + 24×24)
- `.ld-cell-name` padding-right: 30 (was inherited 44)
- `.ld-cell-top / -pick / -pos / -delta` font-size: 7px (was inherited 8)

### `6c3bd36` — docs: punch list cleanup — close shipped + deferred items

Mid-session housekeeping triggered by the user's "we have a big presentation today we need to clean up everything." Three changes to the README punch list:

1. **Stale "Player Comparison full page" item** at line 1410 — flagged `[ ]` but actually shipped 2026-05-20 (tenth session) as `compare.html`. Marked `[x]` with strikethrough + short note pointing to the session-10 entry above for full architecture.
2. **"Bulk tier rename" + "Cross-tier drag"** moved from the session-15 queued-next list to a new "Deferred — won't-do unless demand emerges" subsection. Both were already flagged "if demand emerges" in session 15 — this commit promotes that status to first-class so the open count drops.
3. Open punch-list count drops 6 → 4 (3 of those 4 are external-blocked or open-ended).

### `3d4eb82` — docs: punch list — mark card-parity item shipped

Closure commit for the card-parity work. Replaced the open `[ ]` entry with an `[x]` strikethrough + per-commit summary citing `207724a` / `6678dda` / `be9c1af`. Reduces the active punch-list count to 3 actionable items (1QB scrape, my-leagues inline-style cleanup, visual polish) + 1 external-blocked (analyst feedback loop).

### `58bf7d5` — tiers: legend — document Admin Scratchpad (Phases 1-5)

Last cleanup item from session 15's queued-next list. New "Admin Scratchpad (operator-only)" section in `assets/js/legend-content.js` under the `'tiers'` page entry. 10 items covering the full feature:

- **Activation Flow** — `?admin=1` activates with password check, `?admin=hash` is the one-time SETUP helper to regenerate `PASSWORD_HASH`, `?admin=0` disables. SHA-256 hash comparison via `crypto.subtle.digest`. `fpts-admin-mode` session flag.
- **⚙ Settings — GitHub PAT** — fine-grained Personal Access Token + repo/branch/path. Storage keys: `fpts-admin-gh-token / -repo / -branch / -path`. Documents the empty-input-is-no-change defense against Chrome password-manager value-attribute stripping (ad8ffd8 fix from session 14).
- **The four override layers** (one item each):
  - `fpts-tier-overrides` (Phase 0/2 — per-player field edits + soft-deletes + Phase-2 adds)
  - `fpts-tier-title-overrides` (Phase 3 — tier section header rewrites)
  - `fpts-tier-order-override` (Phase 3 + 5 — written by both `moveTier` arrow buttons and `setTierOrder` drag-and-drop)
  - `fpts-player-order-overrides` (Phase 4 — drag-and-drop within tier; cross-tier explicitly blocked by `sameTbody` guard)
- **Publish ⬆ — GitHub Contents API** — one-click GET-SHA → PUT pipeline. UTF-8-safe base64 encoding via `btoa(unescape(encodeURIComponent(str)))`. Success toast with new commit SHA. Two-PUT max per publish (tiers.csv + tier-config.json), each only fired when its override layer is non-empty.
- **Stale-CSV Defense** — `publishToGitHub` does a GET-latest on tiers.csv from GitHub, parses via `_parseTiersCsv`, applies operator overrides via `_applyOverridesToData`, PUTs the merged result. So even from `file://` behind origin, published CSV is always `(latest GitHub state) + (operator overrides)`. References commit `157b636` (root cause: Loveland's row had ping-ponged across three earlier commits).
- **Publish Dry-Run / Diff Preview Modal** — preview modal lists every change with typed icons (⇅ yellow tier-change, + green add, − red remove, ✎ gray metadata-only) before committing. References commits `b65e102` (initial ship) + `5832be2` (brand-audit fix mapping inline hex to brand vars).
- **Disable Button** — flips `fpts-admin-mode=false` and reloads. Overrides PERSIST across cycles until explicitly cleared via Settings → "Clear all overrides."

Cache token bump `legend-content.js ?v=1786400001 → ?v=1787200000` across all 10 deployed pages (`adp-tool`, `compare`, `formulas`, `live-draft`, `mock-draft`, `rankings`, `my-leagues`, `index`, `trade-calculator`, `tiers`) + `templates/page-template.html` (which was also out-of-date at `?v=1783300000` — opportunistic fix). `docs/function-reference.html` left alone (placeholder `?v=...` string).

### `[post-wrap-up follow-up]` — admin-gate the Formulas top-nav link + Legend drawer trigger

User flagged after the session wrap-up doc landed: hide both the Formulas top-nav entry and the floating Legend `.lg-trigger` button unless admin mode is active. Direct URL to `formulas.html` should still work — only the entry points get hidden.

**Three-file change:**

- `assets/js/admin-tiers.js` — new top-of-IIFE init block (runs before any other code in the file, before <body> renders since the script is render-blocking in <head>). Reads `fpts-admin-mode` from localStorage. If true: adds `fpts-admin` class to `<html>`. If false: registers a `DOMContentLoaded` handler that strips the `<option value="formulas.html">` from every `.mobile-nav-select` (browsers ignore `display:none` on `<option>`, so JS removal is the only reliable approach). The block is wrapped in `try { ... } catch (e) {}` so localStorage-disabled browsers default to non-admin cleanly.

- `assets/css/brand.css` — new "ADMIN-GATED UI" section right after the NAV block (lines 369+). Default rules: `.lg-trigger` + `.nav-link[href="formulas.html"]` set to `display: none !important`. With `html.fpts-admin` ancestor: restored to `inline-flex` for `.lg-trigger` (matches legend.css line 13 default) + `flex` for the nav link (matches the `.nav-link` default at brand.css:338). `!important` is doctrine-legitimate — `.lg-trigger` is mounted programmatically and the existing `.nav-link { display: flex }` rule would otherwise win against an unmarked admin-hide.

- **Cache token bumps via sed across 11 consumers** (10 deployed pages + `templates/page-template.html`): `admin-tiers.js ?v=1786600000 → ?v=1787500000` + `brand.css ?v=1782600000 → ?v=1787500000`.

**No flash on non-admin loads:** `admin-tiers.js` loads at the top of `<head>` (line 15-ish on every page) as render-blocking `<script src="...">`. By the time `<body>` parses, the `fpts-admin` class is either on `<html>` or it isn't — CSS applies immediately on first paint.

**Activation still uses the existing flow:** operator visits any page with `?admin=1` → password prompt → `fpts-admin-mode=true` written to localStorage. Reload or next navigation lights the Formulas link + Legend trigger back up. `?admin=0` → reload → both surfaces vanish for that device.

### Audit + cache token summary

`python scripts/check-colors.py` — **CLEAN across 34 files** after every commit (including the admin-gate follow-up).

Cache tokens at session close:
- `legend-content.js ?v=1787200000` (10 deployed pages + template; admin-scratchpad section added)
- `admin-tiers.js ?v=1787500000` (11 consumers; admin-gated-UI init block)
- `brand.css ?v=1787500000` (11 consumers; admin-gated-UI CSS section)
- Page-local CSS on `live-draft.html` + `mock-draft.html` — no shared cache tokens
- All other shared modules unchanged from session 15

### Open punch list state at session close

**4 open `[ ]` items, all blocked or open-ended:**
1. Expand 1QB scrape coverage — external-blocked (Sleeper usernames)
2. `my-leagues.html` inline-style cleanup — deferred (diminishing returns)
3. Analyst feedback loop — external-blocked (analyst recommendations)
4. Visual polish pass — open-ended

**Deferred (won't-do unless demand emerges):** Bulk tier rename, Cross-tier drag.

---

## 2026-05-22 (fifteenth session) — Admin scratchpad hardening (stale-CSV defense, dry-run preview, Phase 5 drag) + rank-history surface + values-supplement layer + 17 name canonicalizations

Continuation session after the fourteenth shipped Phases 1A-4. 8 substantive commits + 3 data-sync auto-commits. Closed out 6 of the 7 punch-list items inherited from session 14 (only "Bulk tier rename" + "Cross-tier drag" remain — both flagged low-priority). Also shipped rank-history lookback, a feature that had been carrying over from session 13 with `data/rank-history.json` orphaned. Per-commit detail below in chronological order:

### `773cb17` — tiers: canonicalize 17 player names so values.json join lands

Audit found 20 tier rows in `data/source/tiers/tiers.csv` with no exact-match in `data/values.json` → blank tier-table rendering (no value, no headshot, no team, no posRank). 17 were fixable name-form drift; 3 were genuinely absent from values.json (Cat B — addressed in `bac9d04`).

Name fixes (left = old form in tiers.csv, right = canonical form from values.json):
- 5 punctuation/nickname: `Coltson Loveland → Colston Loveland` (typo), `Nick Singleton → Nicholas Singleton`, `JK Dobbins → J.K. Dobbins`, `TJ Hockenson → T.J. Hockenson`, `Tre Harris → Tre' Harris`
- 12 Jr./II/III suffix drops: Brian Thomas, Harold Fannin, Marvin Harrison, Travis Etienne, Omar Cooper, Oronde Gadsden, Michael Pittman, Chris Brazzell, Chris Rodriguez, Mike Washington, Tyrone Tracy, Luther Burden

Trending flags preserved on the 4 rows that had them (`Down 1 Tier` / `Up 1 Tier` on Fannin, Rodriguez, Dobbins, Tracy). Regenerated `data/tiers.json` + `tiers.html` via `sync-tiers.py`. Post-fix verification: 0 remaining name mismatches between tiers.csv and values.json's 932-player set.

### `bac9d04` — data: values-supplement layer for FP-absent players

Investigation of why 3 players (Deebo Samuel, Tyreek Hill, Eli Stowers) still rendered blank after the name fixes: they're genuinely missing from `data/values.json`. Root cause: `data/values.json` is built by `sync-fp.py` walking FP's `/v2/adp/dynasty/nfl` API response — and FP appears to filter veteran free agents (Deebo, Tyreek) + below-cutoff rookies (Stowers).

Fix: new force-include layer.

**New file:** `data/source/values-supplement.csv` — header-driven CSV: `name, sleeperId, rank, posRank, pos, team, age, ppg, ppgPrior, tier, trend`. All fields optional except `name`. Seed entries for the 3 known cases (ranks 1000/1001/1002 — past FP's 932-player tail so they sort to the bottom of any rank-ordered list).

**New function in sync-fp.py** (local-only — `sync-fp.py` is gitignored alongside `sync-fp.config.json`): `apply_values_supplement(players, sleeper_overlay)` reads the supplement after the FP fetch + Sleeper overlay, merges entries for any name NOT already in FP's response (skip-with-log otherwise). Sleeper overlay fills age/team/pos/ppg/injury auto when supplement leaves those blank but provides `sleeperId`. Wired into `main()` between the matched-overlay log and the articles-map build.

Smoke-tested with mock overlay (added=3, skipped=0 fresh; added=2, skipped=1 when FP already had Tyreek). Verified live on next `push.bat` (commit `0cfd441`): all 3 players landed in `data/values.json` with full data — Tyreek `{rank:1000, posRank:WR109, FA, age 32.2, ppg 13.4, sleeperId 18082, injury:Questionable}`, Deebo similar, Stowers `{rank:1002, posRank:TE11, PHI, age 23.1, ...}`.

### `9cec3c3` — docs: correct admin URL params in README session-14 description

Session 14's Phase 1A bullet had `?admin=hash` listed as the password challenge — actually that's the one-time setup helper to regenerate `PASSWORD_HASH`. Source of truth (`admin-tiers.js:_handleUrlParam` lines 127-184): `?admin=1` activates with password check, `?admin=hash` is the setup helper, `?admin=0` disables. Affected the `FPTS Admin.url` desktop shortcut which had been pointing at the setup URL (corrected in same session).

### `157b636` — admin: rebase Publish onto GitHub's latest CSV (stale-view defense)

Discovered during the Loveland investigation. When `tiers.html` is loaded from `file://` on a local desktop folder behind `origin/main`, the page reads the stale local `tiers.csv` and Publish writes that stale state back to GitHub, silently reverting other admin commits made since the page was loaded. Loveland's row had ping-ponged across `d3bb5c7 / a98d0cf / 1e16d75` because of this — metadata like `up, buying, Top Target, Dynasty` got added in one session and reverted in the next from a stale page.

**New publish flow** in `admin-tiers.js publishToGitHub`:

1. GET latest `tiers.csv` from GitHub Contents API
2. Decode base64 (new `_utf8Atob` helper — strips embedded newlines GitHub inserts every 60 chars)
3. Parse via new `_parseTiersCsv(csvText)` — `{ [playerName]: { tier, trending, buySell, priority, contender, notes } }`; handles quoted fields, CRLF, BOM
4. Merge localStorage overrides via new `_applyOverridesToData(base, overrides)` — user's overrides win on every field they set; `_deleted=true` preserved for downstream skip
5. Build CSV from merged map via the existing `_buildOverriddenCsv(dataArg)` (refactored to accept an optional pre-merged data argument; defaults to `window.TIERS_DATA` for backward compatibility)
6. PUT with GitHub's current SHA — concurrent edits within the same window still 409 cleanly

Net effect: published CSV is always `(latest GitHub state) + (user's overrides)`, regardless of how stale the page's view is. Cache token bump: `admin-tiers.js ?v=1784700000 → ?v=1785500000` across all 11 consumers. Operationally also dropped a `FPTS Admin.url` shortcut on the user's desktop pointing at the live GitHub Pages admin URL so the operator can stop using `file://` entirely.

### `b65e102` — admin: Publish dry-run / diff preview modal

Click **Publish ⬆** now fetches GitHub's latest state, builds the merged result via the stale-CSV defense's GET-merge logic, and shows a modal listing every change before any commit fires. Cancel bails out cleanly (overrides preserved on this device); "Publish to GitHub ⬆" runs the existing `publishToGitHub` pipeline.

**New helpers in admin-tiers.js:**

- `_buildPlayerDiff(latest, merged)` — diff per player across: `⇅ tier-change`, `+ add-to-tier`, `− remove-from-tier`, `✎ metadata-change` (Trending / Buy-Sell / Priority / Contender / Notes). Sorted by player name.
- `_buildConfigDiff(latestCfg, mergedCfg)` — tier renames + order changes
- `_openPublishPreviewModal(playerDiff, configDiff)` — modal renderer, returns `Promise<bool>`; backdrop + Escape + Cancel all resolve `false`
- `_esc(s)` — inline HTML-escape for player names + metadata interpolation

**UX details:**

- No-op case: if overrides match GitHub state exactly, modal shows "Your overrides match GitHub's current state. Nothing to commit." + hint to use Clear all
- Publish button shows "Loading preview…" briefly while the GET fires
- Preview errors (network / 401 / 403) alert + no publish attempt

Cache token bump: `admin-tiers.js ?v=1785500000 → ?v=1786200000` across all 11 consumers.

### `5832be2` — admin: brand-audit fix — map 3 inline hex to brand vars in preview modal

`b65e102` tripped `scripts/check-colors.py` with 3 hardcoded hex colors. Mapped to brand CSS vars:
- `#0a0a0a` (inline `<code>` background) → `var(--black)` (#111111)
- `#ffd86b` (tier-change ⇅ symbol) → `var(--yellow)` (#f0c040)
- `#ff7766` (player-removed − symbol) → `var(--red)` (#ED810C)

Visual no-op intent — `var(--yellow)` is the brand's actual chip yellow, `var(--red)` is the same dynasty-orange used everywhere, and `var(--black)` is slightly darker than the modal surface (#1a1a1a) so the `<code>` tag still stands out. Cache token bump: `admin-tiers.js ?v=1786200000 → ?v=1786500000`. Audit: CLEAN across 34 files.

### `bd61f28` — rankings: surface rank-history.json via daily-snapshot date picker

`data/rank-history.json` (12 daily rank snapshots captured by `sync-fp.py` on each push.bat) was previously orphaned — no UI consumed it. This ships the consumer.

**New module `assets/js/rank-comparator.js`** — parallels `adp-comparator.js` but lighter:
- Single small JSON file (no per-year lazy-load needed)
- Daily granularity (dropdown picker, not monthly calendar grid)
- body-zoom-aware positioning (same fix `adp-comparator` has)
- Public API: `init({storageKey, onChange}) / ensureLoaded() / getSnapshotDates() / getCurrentDate() / setCurrentDate(d) / getRankFor(name, date) / renderTriggerHtml() / openPopup(triggerEl) / closePopup() / changeChipHtml(cur, prev)`
- Defaults to oldest snapshot (widest comparison window) when no saved selection

**rankings.html integration:**

- The RANK column header doubles as the date-picker trigger; the small sort ▲/▼ arrow moves inline next to it so sort still works (new selector `.rk-th-rank-compare`)
- Each row's rank cell renders an inline chip next to the number: ▲N green = better now, ▼N red = worse, ● = flat
- Same chip pattern on the consensus mobile card (`.rk-ccard`)
- Renders blank if a player isn't in the selected snapshot (e.g., new players added since the snapshot was taken)

Direction convention: lower number = better, same as ADP. So if a player went from rank 50 (historical) to rank 45 (current), they improved by 5 → ▲5 green chip.

Legend entry added under tiers (`legend-content.js v=1783300000 → v=1786400001` across 10 consumers).

### `8bf8ecc` — admin: Phase 5 — drag-and-drop reorder of tier sections (mirrors Phase 4)

When admin mode is on, each `.tier-group-header` is now a drag handle (`draggable="true"` + `data-tier-code` + `cursor:grab` + a ⋮⋮ discoverability glyph). Drag a header onto another header → drop position uses the hover-target's midline (above/below). Source dims to 0.5 opacity; valid target shows a 3px red top/bottom border on its header. On drop the source `.tier-group` is spliced in place and the new order array is read off the DOM via:

```
parent.querySelectorAll('.tier-group > .tier-group-header[data-tier-code]')
```

then passed to the new public API: `AdminTiers.setTierOrder(orderArray)`. Defense: filters unknown codes + re-appends any canonical codes missing from the input so a partial array can't drop tiers from the display. No-op if the new order matches what would render today; in that case the existing override is cleared so a redundant override doesn't sit in localStorage.

The legacy ▲/▼ section-arrow buttons stay in place — drag is for big reorders, arrows for adjacent swaps. Both paths converge on the same `fpts-tier-order-override` localStorage key + same publish flow.

Cache token bump: `admin-tiers.js ?v=1786500000 → ?v=1786600000` across all 11 consumers.

### Data-sync auto-commits during the session

- `0cfd441` (`update site + refresh data`) — push.bat run that exercised the new `apply_values_supplement()` for the first time; landed Deebo/Tyreek/Stowers in `values.json` + refreshed all `data/adp-*.json`, `data/auction-*.json`, `data/pick-availability-*.json`, `data/mvs.json`, `data/picks.json`, `data/rank-history.json`, `docs/function-reference.pdf`.
- `f387689` (`Update site + refresh data`) — manual commit of data refreshes left unstaged after a brand-audit-blocked push.bat run.
- `966597f` (`update site + refresh date`) — push.bat run after the brand-audit fix.

### Closeout state at end of session

8 substantive commits + 3 data-sync commits all on `origin/main` (`8bf8ecc` Phase 5 still unpushed at this handoff; user to push next). Items 1, 2 from the new punch list (Bulk tier rename, Cross-tier drag) remain flagged low-priority. New item 3 added: admin-scratchpad Phases 1-5 aren't documented in `legend-content.js` under the `'tiers'` page entry. Audit CLEAN across 34 files.

---

## 2026-05-22 (fourteenth session) — Admin scratchpad: Phase 3 (tier rename + reorder + publish) + Phase 4 (drag-drop player reorder) + 2 follow-up fixes

4 substantive commits + 2 data-sync auto-commits. Session built on top of the Phase 1A/1B/2 admin scratchpad shipped earlier this same calendar day (carried over from end-of-session-13 context). Single dominant arc: complete the admin-tiers editor end-to-end so the operator can rename tier section headers, reorder tier sections, reorder players within a tier, and publish everything back to the repo with one click — then fix two real bugs the user caught during initial use.

### Phase 3 — tier title rename + reorder + publish (`b0f8e6a`)

**New canonical data file:** `data/source/tiers/tier-config.json` — 21-tier seed (S++ through F-), titles lifted from the existing `TIER_DESCRIPTIONS` const in `tiers.html`. Shape: `{ version, source, tiers: [{ code, title }] }`.

**admin-tiers.js additions:**

- 2 new localStorage keys: `fpts-tier-title-overrides` (`{ code: "title" }`) and `fpts-tier-order-override` (`[code, code, ...]`).
- `_readTitleOverrides` / `_writeTitleOverrides` / `_readOrderOverride` / `_writeOrderOverride` / `_hasConfigOverrides` helpers.
- `effectiveTierConfig()` — merges `window.TIER_CONFIG` canonical with the two localStorage layers; returns `[{ code, title }]` in display order. Defensive fallback to synthesized `TIERS.map(c => ({ code: c, title: c }))` if config wasn't loaded.
- `setTierTitle(code, title)` — clears override if title is empty or matches canonical; otherwise stores it.
- `moveTier(code, ±1)` — bounds-checked swap of adjacent codes in the order override.
- `_fireConfigChanged()` — dispatches `fpts:tier-config-changed` event.
- `_buildOverriddenTierConfigJson()` — bakes overrides into a publishable JSON payload.
- `publishToGitHub()` extended to sequentially PUT both `tiers.csv` AND `tier-config.json` when either has overrides.
- `_refreshBanner()` enables Publish button when either player or config overrides exist.
- `clearAllOverrides()` extended to wipe title + order overrides.
- New public APIs on `window.AdminTiers`: `effectiveTierConfig`, `setTierTitle`, `moveTier`.

**tiers.html additions:**

- Lazy-load `data/source/tiers/tier-config.json` on startup, sets `window.TIER_CONFIG`, re-runs `renderTiers()` when ready.
- `renderTiers()` uses `AdminTiers.effectiveTierConfig()` to drive the tier section loop, with fallback to legacy `TIER_ORDER` + `TIER_DESCRIPTIONS`.
- Admin-only ✎ / ▲ / ▼ buttons rendered inline in each `.tier-group-header`.
- `fpts:tier-config-changed` listener re-renders.
- Delegated click handler wires the buttons: ✎ opens a `prompt()` rename, ▲/▼ call `moveTier(code, ∓1)`.

11 cache-token bumps (`1784400000 → 1784500000`) across all 10 pages + `templates/page-template.html`.

### Phase 3 follow-up — fix invisible ✎/▲/▼ buttons (`462a5d6`)

User screenshot showed the tier section headers without any admin buttons. Root cause: I'd colored the glyphs `var(--red)` over the red-orange tier-header gradient — effectively invisible against the bg. Switched to `#111111` on a translucent white pill (`rgba(255,255,255,0.85)`) with a 1px black border, per the black-text-on-bright-fill doctrine. Bumped 13→14px with `padding:2px 8px` so they're clearly tappable. 11-consumer cache bump deferred to the next commit since it batches with Phase 4.

### Phase 4 — drag-and-drop player reorder within a tier (`36f7452`)

User chose drag-and-drop over ▲/▼ buttons or a numeric rank field. Mirrors the override architecture from Phases 2/3.

**admin-tiers.js:**

- New localStorage key: `fpts-player-order-overrides` — `{ tierCode: [name, name, ...] }`. Listed names render first in given order; unlisted players append alphabetically so partial reorders never drop rows.
- `_readPlayerOrder` / `_writePlayerOrder` helpers.
- `sortPlayersForTier(tierCode, names)` — shared sort consumed by both render and publish. Lookup-indexed map for O(1) override hits.
- `setPlayerOrder(tierCode, namesArray)` — passes `null`/empty to clear; persists + fires `fpts:tiers-overrides-changed` + refreshes banner.
- `_buildOverriddenCsv()` rewritten: buckets `TIERS_DATA` rows by tier code, walks the canonical `TIER_ORDER`, applies `sortPlayersForTier` per bucket. Tiers outside the canonical 21 (legacy data) get an alpha sort and append at the end so nothing is dropped. Net effect: the published CSV row order now matches what admin sees on the page.
- `_hasConfigOverrides()` extended to include `_readPlayerOrder()`.
- `clearAllOverrides()` extended to wipe player-order map.
- New public APIs: `sortPlayersForTier`, `setPlayerOrder`.

**tiers.html:**

- `renderTiers()` applies `sortPlayersForTier` to each tier's `groups[t]` array before render. Re-fetches row data from the original bucket so render fields stay intact.
- Admin mode adds `draggable="true"` + `data-player="<safeName>"` + `cursor:grab` to each `<tr>`, and `data-tier="<code>"` + `class="fpts-adm-tier-tbody"` to each `<tbody>`.
- New IIFE handles `dragstart` / `dragover` / `drop` events:
  - `dragstart` dims the source row to 0.4 opacity, sets `dataTransfer` with the player name.
  - `dragover` (rate-limited to a `lastDropTarget` ref to avoid border thrash) computes drop position by mouse-Y vs row midline; adds `2px solid var(--red)` top OR bottom border to the hover target.
  - `drop` splices the source row via `tbody.insertBefore`, reads final order from all `tr[data-player]` attrs in DOM order, persists via `AdminTiers.setPlayerOrder(tierCode, newOrder)`.
- Cross-tier drag explicitly blocked: `sameTbody` guard in both `dragover` and `drop`. User changes tier letter via the existing row Edit popover.

11 cache-token bumps (`1784500000 → 1784600000`).

### PAT-persistence fix — stop silently wiping saved token (`ad8ffd8`)

User reported "the token keeps disappearing" after pressing Disable. Audited the code paths — Disable doesn't touch `STORAGE_KEY_GH_TOKEN` (only `STORAGE_KEY_MODE`), and `clearAllOverrides` doesn't either. The only paths that remove the token are (1) the explicit "Clear token" button in the Settings modal, (2) saving Settings with an empty token input.

Root cause: the Settings modal pre-filled the input with the saved token (`value="<actual PAT>"`) but Chrome's password manager often strips `value` attributes from `type=password` inputs. If the user clicked Save without retyping (e.g., just to tweak repo/branch/path), the empty input was interpreted as "user cleared the token" and the PAT was removed from localStorage.

**Fixes:**

- `_ghSettingsSave()` — dropped the `else localStorage.removeItem(STORAGE_KEY_GH_TOKEN)` branch. Empty token input on Save now means "no change" instead of "delete it." The dedicated "Clear token" button remains the only path that erases the PAT.
- `_ghSettings()` adds `hasToken: !!_get(STORAGE_KEY_GH_TOKEN, '')` to the returned settings object.
- Settings modal — when a token is already saved, renders an empty input + green confirmation line: `✓ A token is saved on this device. Leave blank to keep it; type a new value to replace.` Placeholder text reinforces: `(leave blank to keep saved token)`. No more `value="<actual PAT>"` in HTML — Chrome's password manager can't strip what was never there.
- `autocomplete="off"` → `autocomplete="new-password"` since Chrome ignores `"off"` but respects `"new-password"`.

11 cache-token bumps (`1784600000 → 1784700000`).

### Override-layer state at session close

Four independent localStorage maps layer on top of canonical `tiers.csv` + `tier-config.json`:

| Key | Phase | Shape | Overrides |
|---|---|---|---|
| `fpts-tier-overrides` | 0/2 | `{ playerName: { tier?, trending?, buySell?, priority?, contender?, notes?, _deleted? } }` | Per-player fields + Phase-2 adds + soft-deletes |
| `fpts-tier-title-overrides` | 3 | `{ tierCode: "Title" }` | Tier section header titles |
| `fpts-tier-order-override` | 3 | `[code, code, code, ...]` | Tier section display order |
| `fpts-player-order-overrides` | 4 | `{ tierCode: [name, name, ...] }` | Player order within each tier |

Plus GitHub publish settings (`fpts-admin-gh-token` / `-repo` / `-branch` / `-path`) and the mode flag (`fpts-admin-mode`).

### Punch list at session close

1. **Re-create the admin PAT** — user lost the old token value (GitHub only shows PATs once at creation). Fine-grained token, repo = `elnostrathomas/FPTS-Trade_Database`, scope = **Contents: Read & write** only. After creation, paste into the ⚙ SETTINGS cog on tiers.html. Revoke the old token on github.com/settings/personal-access-tokens for a clean slate. Verify the new fix (`ad8ffd8`) actually holds it across Disable + reopen cycles.
2. Reorder UX for tier sections — drag-and-drop instead of multi-click ▲/▼.
3. Bulk tier rename (probably unnecessary, flag-worthy).
4. Publish dry-run / diff preview.
5. Cross-tier drag (currently blocked; use Edit popover to change tier letter).

### Audit

`python scripts/check-colors.py` — CLEAN across 33 files.

---

## 2026-05-21 (thirteenth session) — Mock Draft page + doctrine cleanup + AdpComparator zoom fix

13 substantive commits + 2 data-sync auto-commits, picking up immediately after session 12. Three arcs: (1) shipped the **tenth deployed page** — `mock-draft.html`, an AI-personality-driven mock-draft simulator (skeleton → drafting UI → mobile → docs → three iterative calibration tweaks driven by user playtesting); (2) closed the long-tail doctrine drift from the 2026-05-20 inversion (26 surfaces still hardcoded `color: var(--white)` on bright fills); (3) fixed a calendar-popup bug on `rankings.html` that the user flagged — body-zoom was mis-positioning the popup off-screen.

### Mock Draft page — `mock-draft.html`

5-phase build + 4 tweaks. Slots into the top nav between Live Draft and Tiers. Setup screen (12-team / SF or 1QB / scoring preset / rounds / your slot / personality mix) → drafting UI with live board, BPA rail, player search, status bar.

**Phase commits:**

| Phase | Commit | Summary |
|---|---|---|
| 1 | `10b6871` | Skeleton + setup screen + nav linkage. New `mock-draft.html` slot in topnav of all 9 prior deployed pages + template. |
| 2 | `bfe26e1` | AI personality engine — `PERSONALITIES` const (5 archetypes: ADP Value, BPA, My Guys, Need-Based, Positional Scarcity), `personalityDraftScore(player, ctx, personality)`, `aiPick(personality, ctx)`, `computeTierScarcity`, `buildPlayerUniverse(setup)`, `assignOpponents(setup)`. Composite scoring (weighted ADP + posNeed + value + scarcity + favor), softmax sample of top-8 (temperature 0.5), anti-clumping penalty (-0.3 for same-pos 2-of-last-3), jitter (±0.075). Position-need targets (QB/RB/WR/TE/K/DEF) per SF vs 1QB format. PICK_AVAILABILITY matrix replaces Monte Carlo simulation entirely. |
| 3 | `4caf626` | Drafting UI — live board, BPA rail (top-10 undrafted by ADP, position-filterable), search input, status bar, on-the-clock pulsing halo on next-up cell (green when user's pick). |
| 4 | `822b2bb` | Mobile `@media (max-width: 768px)` block — from-scratch mobile design per the mobile-first doctrine (not a desktop patch). Card mode replaces table for the board, BPA rail collapses to swipeable carousel. |
| 5 | `d9c478b` | **Docs sync per the standing triple-sync rule** — `FORMULAS.md` §51 (full Mock Draft AI personality scoring entry: weights table, composite math, position-need table, pick-selection algorithm, PICK_AVAILABILITY rationale, 9 locked decisions), `formulas-content.js` new "Mock Draft" domain (16th) with `mock-draft-personality-scoring` entry, `legend-content.js` new 'mock-draft' page key (6 sections, 30 items), README "Analyst feedback loop" punch-list item. Cache token bumps: `legend-content.js ?v=1782900000 → ?v=1783000000` (10 consumers), `formulas-content.js ?v=1782800003 → ?v=1783000000` (1 consumer). |

**Calibration tweaks (driven by user mock-draft playtesting):**

| Commit | What |
|---|---|
| `a641e0b` | **ADP weight bump + scoring-aware ADP shifts.** All 5 archetypes get +0.10 to their `adp` weight (was over-emphasizing value/scarcity at the expense of consensus). New `applyScoringAdpShift(p, scoring, format)` adjusts each player's ADP at universe-build time using FP_VALUES tier-aware buckets: TEP → elite TE jumps into round 1 (Brock Bowers raw ADP ~24 → ~6), 6pt TD → elite QB jumps (max(1, adp − 6)), Half PPR → slight RB boost / WR demotion (×0.97 / ×1.04). Raw ADP preserved on the player record as `rawAdp` for debugging. |
| `66835b8` | **Quadratic reach penalty — fix Drake Maye 1.02 problem.** Switched the reach penalty from linear (`0.05/pick`) to quadratic (`reach^1.5 × 0.05`). The linear curve let high-value young SF QBs (Maye, Williams, etc. at ADP 25-30) sneak into round 1 because their value component (0.15 × ~9.0 = 1.35) overwhelmed the linear penalty. Quadratic preserves "tendency" for small reaches (5 picks = -0.56) while making severe reaches a hard wall (20 picks = -4.50, 30 picks = -8.22). |
| `66b9f85` | **Mobile scroll-lock + board horizontal scroll fixes.** Board grid overflows the mobile viewport on 8/10/14-team configs; added horizontal scroll inside the board wrapper, plus a `body { overflow: hidden }` scroll-lock when the setup-screen modal is open so the page behind doesn't scroll under it. |
| `faa4401` | **ADP-heavy calibration (third tweak).** Pushed `adp_value` archetype weight from 0.75 → 0.85, tightened candidate-pool windows across the board. Goal: "picks closely track the ADP-page startup ordering with small personality-driven deviations." Earlier calibrations were each driven by a specific user-observed failure mode; this third tweak is the current target state — still expected to iterate. |

**Tuning surface (console-accessible for live calibration):**

```js
MockDraft._aiPick(personalityKey, currentPick, picks)    // single-pick test
MockDraft._buildUniverse()                                // rebuild player pool
MockDraft._assignOpponents()                              // resample personalities
```

**Implementation simplification note.** The LLM Handoff Spec at `C:\Users\deons\Downloads\# Fantasy Draft Personality, Prediction & Availability System — Full….md` calls for 5,000-50,000 Monte Carlo simulations per pick. This implementation replaces the simulation loop with one lookup into `data/pick-availability-2026.json` — a pre-computed empirical probability matrix derived from thousands of real dynasty drafts. Massive perf win with minimal loss of fidelity (the matrix encodes the simulation's empirical answer). Limitation: matrix is currently 12-team-only; 8 / 10 / 14-team modes fall back to ADP-window scoring (matrix augmentation is a refinement, not load-bearing).

### Doctrine drift — closed (`937f3ed`)

The 2026-05-20 inversion commit (`372f894`) flipped the text-on-bright-fill rule from white → black, and also removed the `dim-text-on-bright-bg` lint detector that had previously enforced the old doctrine. Result: 26 leftover surfaces still hardcoded `color: var(--white)` on bright brand backgrounds, with no automated check to catch them. The user flagged the Risers/Fallers rows on `index.html` directly ("the risers and fallers still has the players names in white"); a one-shot audit script caught the same drift pattern across the rest of the site.

All 26 fixes are byte-identical single-edit-per-rule:

```
-  color: var(--white);
+  color: #111111;
```

**Direct violations (single CSS rule with bright bg + white text):**

- `index.html` — `.nav-badge`, `.filter-multi option:checked`, `.btn-add-pick`, `.filter-chip`, `.filter-chip-muted`
- `my-leagues.html` — same 5 + `.pp-col-header`, `.ml-pd-avail-trade-btn`, `.ml-tb-sleeper-link`, `.ml-team-mebadge`, `.ml-calc-sleeper-btn`
- `trade-calculator.html` — `.btn-add-pick`, `.filter-chip`, `.filter-chip-muted` (each duplicated in two inline blocks, replace_all caught both)
- `live-draft.html` — `.ld-needs-tag` (red bg), `.ld-otc-bar-mine` (green bg)
- `mock-draft.html` — `.box-col-header.md-col-user` (red bg)
- `assets/css/player-panel.css` — `.pp-col-header` (shared module — cache bump propagated to all 10 consumers)

**Cascade violation (the auditor missed it, the user found it):**

- `index.html` — `.value-row-name` + `.value-row-val`. The Risers/Fallers rows get a bright pos-color background via the bare `.pos-qb`/`.pos-rb`/etc. rule (line 540) composed onto `.value-row.pos-XX`. The single-rule auditor only matched bright-bg + white-text within the same rule body; this case is a cross-rule cascade (bright bg from sibling pos-XX class, white text from descendant `.value-row-name` rule). Both child rules now `#111111`. The `.value-row-change.up/.down` trend wrappers are left alone — they wrap `<span class="trend up/down">` which uses the brand-bright `#66dd84` / `var(--red)` foreground with text-shadow stroke per the brand.css §5 documented exception.

Cache bump: `player-panel.css ?v=1782600000 → ?v=1783100000` across all 10 consumers (adp-tool, compare, index, rankings, my-leagues, live-draft, mock-draft, trade-calculator, tiers, templates/page-template).

8 remaining audit hits in `docs/analyst-heuristics-review.html` are out-of-scope per session 12 notes (analyst handoff doc, not deployed UI).

### AdpComparator zoom fix (bundled in `44e5e68`)

User reported the `APR 2026 ▼` calendar trigger on `rankings.html` was non-responsive — couldn't change the month. Investigation found that the AdpComparator popup (mounted on `<body>` via `position: absolute`) was being double-zoomed under session 12's `body { zoom: 1.25 }` adaptive zoom ladder.

Mechanism: `getBoundingClientRect()` returns post-zoom visual coordinates (the on-screen position the user sees). Assigning those values to `style.left/top` on a body child re-applies the body's 1.25× zoom, so the popup renders at roughly 1.25× the trigger's actual visual position. For `APR 2026` near the right edge of a wide table, that pushes the popup well past the viewport — the trigger IS opening it; the popup is just off-screen.

Fix in `assets/js/adp-comparator.js` `openCalendar()`: read `getComputedStyle(document.body).zoom` and divide the rect coords by it before assignment.

```js
const bodyZoom = (function () {
  const v = parseFloat(getComputedStyle(document.body).zoom);
  return (isFinite(v) && v > 0) ? v : 1;
})();
const rect = triggerEl.getBoundingClientRect();
pop.style.left = ((rect.left + window.scrollX) / bodyZoom) + 'px';
pop.style.top  = ((rect.bottom + window.scrollY + 4) / bodyZoom) + 'px';
```

Affects **both** consumers: `rankings.html` (single trigger in the consensus table header) and `tiers.html` (21 tier-group triggers in the tier table — same widget, same bug). Cache bump: `adp-comparator.js ?v=1779360001 → ?v=1783200000` on both consumers.

**Side finding worth surfacing for next session.** `data/rank-history.json` exists and contains 10 daily ranking snapshots from 2026-05-11 to 2026-05-20 (flat `{ name: rank }` per date, written by `sync-fp.py`). **No frontend code consumes it today** — the rankings.html `APR 2026 ▼` calendar swaps the ADP comparison value + CHG chip only; the RANK column never changes per month. If the user wants true rank-vs-rank historical comparison alongside the existing ADP-vs-ADP, the data is already there.

### Cache token state at session close

- `player-panel.css ?v=1783100000` (doctrine cleanup, 10 consumers)
- `adp-comparator.js ?v=1783200000` (zoom fix, 2 consumers)
- `legend-content.js ?v=1783000000` (mock-draft page entry, 10 consumers)
- `formulas-content.js ?v=1783000000` (mock-draft §51 entry, 1 consumer)
- All other shared modules unchanged from session 12

### Audit

`python scripts/check-colors.py` — CLEAN across 31 files after every commit.

The disposable one-shot `audit_white_on_bright.py` written for the doctrine sweep was deleted after the cleanup landed.

### Memory

No new durable memories saved this session — the session-13 work followed existing rules already captured (the doctrine, the triple-sync rule, mobile-first, no-assumptions-verify-before-push). The "Show content before commit confirmation" rule was applied for both the doctrine cleanup and the AdpComparator fix.

---

## 2026-05-20 (twelfth session) — OBS polish, doctrine inversion, compare-page closeout

17 substantive commits + 7 data-sync auto-commits, picking up immediately after session 11's UI overhaul ship. Three arcs: a UI/visual iteration arc that tuned the just-shipped chrome to actual OBS-stream usage; a docs-driven closeout of every user-decidable analyst-input bullet from the compare-page punch list; and a late-session iteration on the compare-page hero card into a Madden-Ultimate-Team-style trading card aesthetic with proper mobile fallbacks (plus a critical STATS_DATA-path bug fix that restored 2025 seasonal data visibility).

### What shipped

**Compare-page features:**
- `459ffe8` — **Scoring toggle (§50)** — `compare.html` gets a 3rd toggle group in the page header alongside Mode (Profile/Table) and Format (SF/1QB). Four presets: PPR (default) / Half PPR / 6pt TD / TEP, wired through `SLEEPER.adjustStatsForLeague(stats, scoring)`. URL hash `?scoring=<key>` persistence. Position threaded per slot via `_pcPlayerPos(name)` so TEP fires only on TEs. Row-group titles reflect the active preset ("2025 Season Stats · Half PPR" etc.).
- `493c427` — **Inline autocomplete for "+ Add comparison player"** — replaces the legacy `window.prompt()` popup with the same `.pc-search-*` autocomplete UX as the empty-state search. Click trigger → search input appears, debounced 60ms filter against `FP_VALUES`, excludes already-selected players, click result → adds player + re-renders to multi-card view. Esc / click-outside collapses.
- `5e9272f` — **Promote inline search to full search bar** — when the user clicks the trigger, the entire secondary-link row hides and the search expands to a full-size input (14px / 12-16px padding matching empty-state styling) with widened dropdown (560px max). Clean visual focus; restores when closed.

**Visual polish iteration:**
- `7e15a42` — **Drop default zoom 1.75 → 1.25** — user found themselves Ctrl+wheel-zooming out at the session-11 1.75 default. Simpler 2-step ladder: `≥1100 → 1.25`, `≤1099 → 1.0`. OBS-readability gains from session 11 (lifted side gutters, tightened topnav, ADP fluid-fit) stay intact; only zoom changes.
- `372f894` — **Invert text-on-bright-fill doctrine (white → black, both themes)** — the previous "WHITE text on every bright-colored fill" rule hurt readability on lighter pill colors (TE/yellow, WR/blue). Flipped to `color: #111111` on every bright fill. Light-mode `--pos-*-bg` tokens brightened to match dark-mode (so the same rule applies cleanly in both themes — no more dark-maroon QB pills in light mode). 19 files changed: position token redefinitions in `brand.css`, ~46 leaf CSS rules updated (`.nav-badge`, `.tier-badge.t-*`, `.mvs-vol-*`, `.lg-trigger`, `.icon-btn.active`, `.fpts-xpage-btn.primary`, `.ld-cell.{QB,RB,WR,TE,K,DEF}`, etc.), `BRANDING HARD RULES` block in `brand.css` rewritten, `CLAUDE.md` branding rule + badge recipe updated, `scripts/check-colors.py` `dim-text-on-bright-bg` detector removed (was enforcing the old doctrine).
- `1c0b3a4` — **Restore ADP card aspect ratio at 1.25x zoom** — after the zoom drop, `minmax(88px, 1fr)` let cards stretch wider via 1fr expansion (height locked at 78px, width grew to 110-159 CSS); aspect drifted to 2:1. Restored taller-than-wide look via `height: 78px → 100px`, `minmax(88px, 130px)` cap on width, `justify-content: center` so the grid centers when content < container.
- `ab7082d` — **ADP card content scaling + trend chip relocation** — headshot 32 → 40, team logo coin 26 → 32, logo img 19 → 24 (proportional to taller cards). Trend chip moved out of `.card-meta` (was squeezed to ~12-30 CSS px between the bottom-row coins) and INTO `.card-top` next to the overall-pick number where it has the full top row to render. `.card-meta` becomes a thin 2px spacer (still preserves uniform card heights for rookie years that lack trend data). Trend font 11 → 13, text-stroke 0.5px → 1px so colored arrows survive any pill bg.
- `927884c` — **Dropdown widths + compare hero cap** — `custom-select.js` popup: `left:0; right:0` → `min-width: 100%; width: max-content; max-width: min(420px, 95vw)`; option-row `overflow: hidden; text-overflow: ellipsis` removed so labels like "2025" don't truncate to "20…". `compare.html` `.pc-search-name` lost its ellipsis too. `.pc-hero-row { max-width: 1100px; margin: 8px auto 0; }` caps multi-mode photos at ~530×330 (was ~600×600 on wide monitors after the lifted gutters).

**Late-session compare-page hero refinements (post-handoff iteration):**
- `03e73b5` — **Fix STATS_DATA lookup path — 2025+ season stats now render** — `_pcGetStats` was reading `STATS_DATA.players[key]` but `data-bootstrap.js` flattens at line 354 via `if (stats && stats.players) Object.assign(global.STATS_DATA, stats.players)`. Path `.players[key]` → `[key]` restored 2025 seasonal data on the compare page (previously empty for every player). Two-line change, single-file (compare.html), critical user-facing visibility fix.
- `3626462` — **Slim hero photos + recenter face crop** — single-file `compare.html`. Hero photo aspect tightened so more data lands above the fold. `object-position: top` → `center 20%` since `top` was cropping to the player's forehead instead of framing the face on the new aspect ratio. Wide-monitor + 1.25 zoom validated.
- `f20fee2` — **Madden-card hero aesthetic** — `compare.html`. `.pc-card-photo-wrap` pinned to `aspect-ratio: 5 / 4` (taller portrait, trading-card feel). Multi-mode `.pc-hero-row.is-multi` switched from `grid-template-columns: 1fr 1fr` to `repeat(2, 320px)` with `justify-content: center` so two cards stay fixed-width and centered instead of stretching to fill wide viewports. Reference: Hayden Winks player-card layout (`Desktop/HIm4pBXaUAAsSMz.jpg`).
- `8a24115` — **In-card name strip — Madden trading-card finish** — `compare.html`. Added `.pc-card-name-strip` element between `.pc-card-photo-wrap` and `.pc-card-archetype-bar`. Player name now renders INSIDE the card (16px Kanit italic uppercase, `letter-spacing: 0.02em`, gradient surface2→surface bg, border-top, ellipsis on overflow) in addition to the page-level "PLAYER NAME" heading off to the right. Card stack: Header → Photo → **Name strip** → Archetype bar → Stats grid → Footer. Single CSS edit + single JS template edit in `_pcRenderProfile`. Multi-mode unaffected (multi renderer doesn't emit `.pc-card-name-strip`).
- `532ac8d` — **Mobile bleed patches** — `compare.html` only. Static mobile-diagnostic sweep surfaced 4 desktop CSS changes from the late-session work that inherited into mobile without `@media (max-width: 768px)` overrides:
  - `.pc-search-results { max-height: 480px }` (desktop, raised from 320 to fit ~20 results without silent clipping) → mobile override **320px** (480px = 68% of a 700px phone viewport).
  - `.pc-card-name { font-size: 16px }` Kanit italic uppercase → mobile **14px** (long names truncate earlier on a 320px card).
  - `.pc-card-name-strip { padding: 10px 12px 6px }` → mobile **8px 10px 4px** (tighter to match smaller name).
  - `.pc-card-photo-wrap { aspect-ratio: 5/4 }` → mobile **4/3** (5/4 = ~400px tall on a 320px card, pushed stats grid below the fold on phones).
  - Text-color inversion (#111111 on bright fills) deliberately NOT overridden — global doctrine. Adp-tool card height/headshot/coin already had mobile coverage at `adp-tool.html:580-588`. Brand.css already resets `zoom: 1` for ≤768px viewport.

**Analyst-input punch list closeout (4 sections, all locked to current settings after product review):**
- `127bdcc` — **§44 Compare similarity scoring** — weights 25 / 30 / 45 (age / PPG / FP value), delta windows ±8 yrs / ±14 PPG / ±4500 value, tier thresholds 90 / 75 / 60 / `<60`. All locked. Loose-tier matches stay in the top-5 list (muted styling signals "no great match" rather than hiding cards). Position-aware delta windows deferred until prospect/route data ships.
- `ac816e3` — **§47 Best-in-row tie behavior** — unified across all three renderers. `_pcBestIdx` now returns `{ winners: number[], tied: boolean }` instead of a single integer. Table mode + Identity group + Profile multi-card metric table all apply the yellow `.is-tied` band when every valid cell shares the top value. Partial top ties (e.g. `[40, 40, 35]`) keep green `.is-best` on co-winners. New CSS for `.pc-table-row-cell.is-tied`. Strict equality only — no near-tied (within-5%) threshold.
- `725a55f` — **§48 Last-N games window** — default = 4 (matches Underdog reference, reflects most-recent form). 8G / 16G still available via the in-page toggle. Playoff weeks EXCLUDED from the rolling window (regular-season-only keeps the "playing now" signal clean; playoff per-week stats stay visible in the Career-tab expanded year view).
- `4c73112` — **§49 Multi-card metric comparison bands** — strict equality only, no near-tied threshold. Same call as §47. Tie behavior now fully unified across all four surfaces (Table mode rows + Identity group + multi metric-table) — the previous "behavioral difference" note in the FORMULAS doc is gone.

### Diagnostic: OBS interactivity audit

Mid-session the user asked for a full diagnostic to verify the site's click/interaction behavior in OBS Browser Source after all the sizing + color changes. Sweep verdict was **CLEAN**:
- All `<select>` elements covered by `custom-select.js` (universal selector wraps every non-`.mobile-nav-select`, non-`.no-fpts-cs` select)
- `iframe-scroll-fix.js` mousedown handler is gated on `e.button === 1` — never intercepts left-clicks
- `pointer-events: none` only on decorative overlays (textures, headshot silhouettes, .ld-cell content)
- Z-index 9999 only on the `_fp-loading` overlay which is `display:none`d on `fpts:data-ready` (and a few legend backdrops)
- No bright-bg + white-text leftovers in production code (1 false-positive in `docs/analyst-heuristics-review.html` — out of scope)

User to verify in OBS tech test later. Per-page punch list captured in conversation (not codified) for the walkthrough.

### Cache token state at session close

- `brand.css ?v=1782600000` — unchanged from text-color inversion commit
- `mvs-extras.css ?v=1782600000` — same
- `heatmap.css ?v=1782600000` — same
- `legend.css ?v=1782600000` — same
- `player-panel.css ?v=1782600000` — same
- `custom-select.js ?v=1782700000` — dropdown width fix
- `formulas-content.js ?v=1782800003` — bumped 4 times for §44/§47/§48/§49 doc updates
- `legend-content.js ?v=1782900000` — bumped for §44 + best-in-row stale-entry fix

### Audit

`python scripts/check-colors.py` — CLEAN across 30 files after every commit. The `dim-text-on-bright-bg` detector was removed (it enforced the old doctrine that the inversion superseded); `opacity-on-pill-with-bright-bg` detector kept (independent of the rule change).

### Memory

No new persistent memories saved this session — design preferences and conventions captured in `docs/FORMULAS.md` + `assets/js/legend-content.js` + `assets/js/formulas-content.js` + `CLAUDE.md`.

---

## 2026-05-20 (eleventh session) — UI overhaul for OBS Browser Source readability

Site-wide rendering envelope re-tuned in **one bundled commit** (`fae0818`) after iterative A/B with the user on an actual OBS Browser Source canvas. The session opened as a "Production view toggle" but consolidated to a single default mid-session — the new design dominates the old in every relevant context (direct browser + OBS), so a permanent toggle would be maintenance burden, not UX gain.

### What shipped

**1. Adaptive base zoom**
`body { zoom: N }` stepped via `@media (max-width: ...)` breakpoints:

| Viewport CSS | Body zoom | Use case |
|---|---|---|
| ≥1600 | **1.75** | OBS canvas / wide monitor at 100% browser |
| 1300-1599 | **1.5** | 1080p monitor / ~110-125% browser zoom |
| 1100-1299 | **1.25** | Smaller laptop / ~130-150% browser zoom |
| 769-1099 | **1.0** | Narrow window / aggressive Ctrl+wheel zoom |
| ≤768 | **1.0** | Mobile (unchanged) |

When a user Ctrl+wheel zooms in, the browser shrinks the layout viewport in CSS px, the breakpoints fire, and base zoom steps down — net effect: the chrome auto-fits any window/zoom combination without horizontal cutoff. Wide inner surfaces (ADP grid, draft board) still scroll horizontally within their wrappers when content exceeds container.

**2. Lifted 1440px content cap on desktop**
`.topnav`, `.page`, and `footer` get `max-width: none` + `padding-inline: 32px` inside `@media (min-width: 769px)`. Replaces the old 1440px cap that left large dead side gutters at higher zoom. 32px CSS = 64px visual at 1.75x — content fills the viewport with consistent breathing margin on each side. `html`-prefixed selectors beat the 5 inline-duplicate `.topnav` / `.page` blocks via specificity (0,1,1 vs 0,0,1) — no per-page edits needed.

**3. ADP 12-team grid fluid-fit**
`adp-tool.html` `renderBoxView` JS path simplified — for 12-team boards only: `cellMin=88, headW=24, minWidth=0` with `minmax(88px, 1fr)` flex expansion. All 12 columns now fit any viewport at 1.75x. 8/10/14-team keep their existing explicit min-widths and may scroll horizontally on narrower viewports (14-team was explicitly called out as "not for production" by the user).

**4. Topnav adaptive content shedding**
Progressive compression across breakpoints:

| Viewport CSS | Logo SVG | FRONT OFFICE tag | Updated stamp | Nav links |
|---|---|---|---|---|
| ≥1600 | 20px | shown | shown | inline (9 links) |
| 1300-1599 | 18px | hidden | shown | inline (9 links) |
| 1100-1299 | 16px | hidden | hidden | inline (tighter font) |
| 769-1099 | 16px | hidden | hidden | **collapse to mobile-nav-select dropdown** |
| ≤768 | 20px | hidden | hidden | dropdown (mobile, unchanged) |

The 769-1099 band reuses the existing mobile-nav-select `<select>` (same orange chevron) so the topnav always reads cleanly at any desktop width. Also defensive: explicit `background: var(--nav-bg)` on `.topnav` itself so the topnav has its own background regardless of what the parent `.topnav-wrap` div does (sticky-positioning edge-case insurance).

### Phase 0 calibration scaffold (removed)

The session opened with a Phase 0 calibration scaffold: `assets/js/view-mode.js` (synchronous head-loaded URL-param / localStorage applier) + `html.production-view` CSS class + console helpers (`setProdScale(n)` / `exitProdView()`). After the user A/B'd scales visually and locked 1.75x as the new default, the scaffold was deleted in one consolidation pass:

- `assets/js/view-mode.js` removed
- `<script src=".../view-mode.js">` head injections removed from 10 pages (9 deployed + `templates/page-template.html`)
- `html.production-view` selector layer dropped from `brand.css` + 5 inline duplicates
- `adp-tool.html` JS branch `inProd / prod12` simplified to `TC === 12`

Grep verification: zero references to `view-mode | production-view | prod-zoom | setProdScale | exitProdView` anywhere in the codebase.

### Files touched (commit `fae0818`)

12 files, 143 insertions, 35 deletions:
- `assets/css/brand.css` — zoom block + desktop @media block (overflow + max-width + topnav scaling + adaptive content-hiding)
- `assets/js/legend-content.js` — doc comment updated to reflect adaptive zoom
- `adp-tool.html` — JS box-view sizing simplified for 12-team
- 5 pages with inline duplicates updated (`index`, `trade-calculator`, `tiers`, `adp-tool`, `my-leagues`) — zoom values + overflow rules
- All 9 deployed pages + template — cache token bump, view-mode.js script tag removed

Cache token: `brand.css ?v=1780600000 → ?v=1782400010` across all 10 consumers (single final state after all calibration iterations).

### Per-page audit

After commit, walked through every deployed page at the new defaults — **no issues**. Adaptive zoom + lifted side margins + auto-fitting topnav all work cleanly on: `index`, `trade-calculator`, `tiers`, `adp-tool`, `my-leagues`, `rankings`, `formulas`, `compare`, `live-draft`.

Color audit CLEAN across 30 files (was 31 — `view-mode.js` deleted).

### Memory

New durable feedback saved: **"Single mode over toggles"** — for UI overhauls where the new design dominates the old, consolidate to a single default rather than shipping a permanent mode toggle. Captures the rationale (the consolidation was explicitly user-directed mid-session) so future Claude sessions default to "Phase 0 = calibration scaffold; Phase N = consolidate" as the rollout shape for any major UI shift.

---

## 2026-05-20 (tenth session) — Player Comparison page (`compare.html`)

New `compare.html` shipped end-to-end across **17 commits in 8 phases** (0-8). Slots into the top nav between Calculator and My Leagues. Two distinct modes (Profile / Table) with notably different shapes — Profile is the deep dive (1-2 players), Table is the broad scan (2-4 players).

### Phase 0 (`28fb9b2`) — Skeleton + nav

New `compare.html` at site root, plus the "Compare" nav link inserted in all 8 deployed pages + `templates/page-template.html` (both the desktop `<a class="nav-link">` row and the mobile `<select>`). All shared modules loaded with current cache tokens; `.pc-*` class prefix scoped to `body.fpts-compare-page`. SVG wordmark uses native attributes from day one (no inline `style="fill:..."`).

### Phase 1 (`483d72f`) — Single-player Profile hero + URL routing

Hayden-Winks-style hero composition: trading card on the left (header strip + photo + archetype bar + position-aware 6-cell mini-grid + footer), info column on the right (NOW PROFILING eyebrow + big Kanit-italic name + 4×2 metric tiles: Height / Weight / BMI / Age / Yrs Exp / Pos Rank / FP Value SF or 1QB / Current PPG). Format toggle wired. URL hash routing (`compare.html#player=Josh+Allen`).

Data plumbing: `PC` state object + `_pcParseHash` / `_pcWriteHash`, `_pcEnsureSleeperDb()` lazy-loads `/players/nfl` and re-renders when ready, position-aware mini-grid for QB/RB/WR/TE with em-dash placeholders + `data-pending` attrs for future advanced metrics (route data / coverage splits).

### Phase 2 — In-page Historical section (5 sub-commits)

Restructured the bottom-of-page area from stacked sections into a sticky tab bar with one panel visible at a time. Six tabs total: Profile · ADP · **Heatmap** · Value · Career · Trades.

- **2a** `fe308aa` — Background tiles (Class / College / Born / Hometown / High School / Jersey / Status / Draft Pick) sourced from Sleeper `metadata.rookie_year` + `college` + `birth_*` + `high_school` + `number` + `status`. Dynasty Startup ADP per-year cells (lazy-fetch `data/adp-{YYYY}.json` 2022-2026).
- **2b** `0ed7113` — Premium chart redesign. External Y-axis column (no SVG text clipping), 5 evenly-spaced labels, dashed gridlines, gradient fill under, HTML-overlay floating data labels, 4-tile summary row (PEAK / LOWEST / AVG / CURRENT) with color stripes (green / red / muted / yellow). "KTC" terminology purged everywhere; rebranded as "Fantasy Points Dynasty Value." `_pcChart(points, opts)` helper used by both ADP and Value tabs.
- **2c** `6848cff` — Tab bar restructure (moved from "stacked sections" to "sticky tab bar + active panel"). Career Stats lift — `window.renderPlayerStats(containerId, player)` from `player-panel.js` mounted into `#pc-hist-stats-mount`. We mirror `global._currentPanelPlayer = { label, posKey }` to satisfy the renderer's "still the same player?" guard outside the drawer.
- **2d** `6d3d7fe` — Recent Trades panel — `window._buildTradesFromMvs()` + `window.tradeCardHtml(t)` from `player-panel.js`. Filter site-wide trades to ones involving the profiled player.
- **2e** `0e7b2cc` — Heatmap tab (between ADP and Value), secondary links replacing the big "Explore historical data" CTA: `← Pick a different player` | `Open full player drawer →` for drawer-only features.

### Phase 3 (`944211a`) — Top Profile Matches row

5 similar-player cards below Background tiles in the Profile tab (single-player). Click any card pivots the hero. Similarity scoring: position hard-gate + 45% FP dynasty value + 30% PPG + 25% age, weighted composite × 100. Tier banding: 90+ Elite / 75-89 Strong / 60-74 Moderate / <60 Loose, color-coded card top-stripe + photo ring + score text.

### Phase 3-docs (`b93d751`) — Surface formulas + analyst sync rule

**Durable rule saved to memory** (`feedback_logic_legend_punch_list.md`): every new formula on this project automatically gets entries in `legend-content.js` + `formulas-content.js` + `docs/FORMULAS.md` + the README "Analyst feedback loop" punch-list item. Three new formula entries added (compare-similarity §44 / compare-adp-history §45 / compare-fp-value-history §46) with `whyThisNumber: 'Analyst input requested'` on the weights/windows/thresholds.

### Phase 4 (`406c48d`) — Table mode skeleton

Mode toggle activated. 4-slot picker row (each empty slot shows its own search input filtered to FP_VALUES; filled slots show photo + name + pos pill + team + posRank with × clear). URL hash `#mode=table&players=A,B,C,D`. Identity row group below the picker (Position / Team / Pos rank / Age / PPG / FP SF or 1QB value) with best-in-row green tint.

### Phase 5 (`0f318a8`) — Table mode full

Trade Value + 2025 Season + Last-N Games row groups. Window toggle (4G / 8G / 16G) for the Last-N group, persisted in URL hash (`&games=8`). Season rows hide when every player has 0 (cross-position compare doesn't show empty passing rows for all-WR comparisons). `_pcStdFpts(s)` centralized scoring helper (full PPR + 4-pt pass TD baseline).

### Phase 6 — Side-by-side Profile mode (3 sub-commits)

The big UX shift — Profile mode now supports comparing **2 players** (cap at 2 for room to build deep card content; 3+ would crowd).

- **6a** `19b21d6` — 2-player hero row (was 1-player + info column). Each card has a comprehensive metric table with section-grouped rows: Identity · Trade value (Pos Rank / FP value / 30d trend / PPG / Age) + position-specific sections (QB: Passing + Rushing; RB: Rushing + Receiving; WR/TE: Receiving). **Color-coded comparison values** — green tint for winner, red for loser, yellow for tied, muted dash for N/A. INT and Age use mode='min'.
- **6b** `897e373` — Initial side-by-side panel layout for ADP / Value / Heatmap (2-column wrappers below the cards). Each tab panel rendered in 2 columns, each column showing one player's chart + a small chip header.
- **6c** `a68c25c` — **Tab content moved INSIDE each card.** The big UX win — cards become self-contained mini-profiles, the global tab bar swaps each card's body in lockstep. No more separate panels below the cards. `_pcCardTabContent(name, otherName)` dispatches by `PC.tab` to render the per-player content for the active tab. Career multi reads `STATS_DATA` directly (sync, no Sleeper fallback async, no `_currentPanelPlayer` guard issues). Trades multi filters per-player.

### Phase 7 (`8a214b8`) — Mobile polish + dead-code cleanup

240 lines removed — the standalone panel wrappers from 6b became unreachable once 6c moved content inside cards. Removed: `_pcPanelMultiColHead`, `_pcPanelAdpMulti`, `_pcPanelValueMulti`, `_pcPanelHeatmapMulti`, `_pcPanelCareerMulti`, `_pcPanelTradesMulti`, `_pcPanelProfileMulti`, `_pcMultiCareerColumn`, `_pcMultiTradesColumn`, plus their CSS (`.pc-panel-multi*`, `.pc-bg-columns*`).

Mobile polish: multi-mode cards span full width (overriding the single-card 320px cap), metric-table padding tightened at narrow widths, identity meta + section headings shrunk for legibility.

### Phase 8 (this commit) — Edge cases + session close

Hash defensive caps: `_pcParseHash` enforces per-mode player cap (2 in Profile, 4 in Table) so a hand-edited URL like `?players=A,B,C,D&mode=profile` doesn't break the 2-column hero layout. Also filters `PC.players` to names that exist in `FP_VALUES` (drops typos and deleted players gracefully).

Session-close: README updated to mark Player Comparison as shipped, this CHANGES.md entry, function-reference PDF regenerated.

### Reusable shared modules consumed (no new modules built)

- `assets/js/data-bootstrap.js` — `FP_VALUES`, `STATS_DATA`, `MVS_PAYLOAD`, `SLEEPER_IDS`, `PICK_AVAILABILITY` (via `fpts:data-ready` event)
- `assets/js/player-panel.js` — `renderPlayerStats` (single-player Career), `_buildTradesFromMvs` + `tradeCardHtml` (Trades), `openPanel` (drawer link)
- `assets/js/heatmap.js` — `Heatmap.render(el, sleeperId)` (Heatmap tab, per-card mount IDs in multi)
- `assets/js/sleeper-helpers.js`, `team-helpers.js`, `legend-content.js`, `legend.js`, `custom-select.js`, `iframe-scroll-fix.js`, `back-to-top.js` — standard page chrome

### Open items (flagged in punch list)

- Similarity scoring constants (3 open analyst questions on weights, delta windows, tier thresholds)
- Prospect-score / route / coverage data when it ships (replaces archetype placeholder + lights up the currently-em-dashed mini-grid cells)
- NFL draft round / pick (Sleeper doesn't expose; needs different source)

**Audit:** `python scripts/check-colors.py` — CLEAN across 30 files after every commit. compare.html final: ~3,250 lines with the Phase 7 cleanup.

---

## 2026-05-19 (ninth session) — Site-wide custom combobox + my-leagues inline-style cleanup marathon

Two threads. The OBS dropdown story that started in session 8 got promoted from "live-draft only" to "site-wide shared module," because every other native `<select>` on the site hits the same CEF rendering bug when iframed. Then a 12-commit inline-style cleanup of `my-leagues.html` took the file from **293 → 46** inline `style="..."` attrs (84% reduction). The remaining 46 are: 7 × `display:none` (JS-toggled idiom), 2 × CSS-comment false-positives in the audit script, and 37 instances of the CSS custom-property pattern (`--bar-width`, `--pos-color`, `--rank-color`, `--archetype-bg/fg`, etc.) which is the design end-state for dynamic per-element values.

### Site-wide custom combobox — `assets/js/custom-select.js`

`6e38c3d`. After the OBS show, user reported that the my-leagues team-sort dropdown ("Total Value / Archetype / A-Z") had the same can't-click problem as the live-draft year/league/draft pickers — confirming the CEF bug isn't live-draft-specific. Extracted the inline combobox logic from `live-draft.html` into a shared module that auto-wraps every native `<select>` on every page.

How it works: on `DOMContentLoaded` (and via a body-level MutationObserver with 100ms debounce so dynamically-added selects get wrapped too), the module finds every `<select>` element except `.mobile-nav-select` and `.no-fpts-cs`, marks it with `data-fpts-cs-wrapped` so it's idempotent, hides the native control via `display: none`, and inserts a sibling `<button>` + popup `<div>` that mirrors the select's state. Mirroring uses (a) MutationObserver on the native select watching `childList` + `subtree` + `attributeFilter:['disabled']`, and (b) a per-instance `Object.defineProperty` override of the native select's `value` setter so programmatic value sets (which don't reflect to attributes) also fire the mirror update. When the user picks an option, we set `<select>.value` + dispatch `new Event('change')` so any existing inline `onchange` attribute or `addEventListener('change')` fires normally.

Loaded on all 8 deployed pages + `templates/page-template.html` with `?v=1782300000`. Skip-list pattern (`.mobile-nav-select`, `.no-fpts-cs`) gives consumers an opt-out for cases where the native dropdown UX is desirable.

### Inline-style cleanup — 12 commits, 293 → 46 inline `style="..."` attrs on my-leagues.html

`audit-ml-styles.py` ranks `style=...` occurrences by section and declaration set. Each commit picks one section, designs scoped CSS classes (with CSS custom properties for dynamic colors/widths), refactors the corresponding JS template literal, and re-runs the audit. `docs/ml-inline-style-inventory.md` regenerates each commit so the doc tracks progress. Pattern: `class="..."` for static styling, `style="--custom-prop:${value}"` for per-element dynamic values (color, width, etc.) — never raw inline declarations.

Per-commit breakdown:

| Commit | Section | Lines | Notes |
|---|---|---|---|
| `f26a32b` | Player-detail availability | 293→274 (−19) | `.ml-pd-avail-*` family for cross-league exposure rows |
| `99cb24a` | Trade-suggestion modal | 274→236 (−38) | `.ml-tb-*` family with per-position pos-pill modifiers |
| `944d5cc` | Team rows + roster headers | 236→211 (−25) | `.ml-team-*` family |
| `63a75f9` | Standings table | 211→197 (−14) | `.ml-st-*` family |
| `ba9cdef` | Own-roster panel | 197→172 (−25) | `.ml-rp-*` family (pos sections + picks section, trendHtml, playerRow) |
| `b576b9a` | Standings position-rank cards | 172→161 (−11) | `.ml-stposrank-*` family with `--mpx-color`/`--pos-color`/`--rank-color` |
| `d0f9bc8` | Waiver sub-views | 161→149 (−12) | extends `.ml-wv-*` with table cell color modifiers + recent-activity row hl |
| `a422d70` | Recent-trades cards | 149→135 (−14) | `.ml-tc-*` family — full block to zero inline styles |
| `0be1207` | Pick-exposure picker modal | 135→123 (−12) | `.ml-pep-*` family; `:hover` replaces `onmouseover`/`onmouseout` |
| `acd2500` | League-row expansion header | 123→116 (−7) | `.ml-prank-*` + `.ml-sortby-*` (the sort dropdown now picks up `custom-select.js` too) |
| `469cc87` | Traded Picks rendering | 116→112 (−4) | `.ml-pick-card.is-mine` + `.ml-pick-owner-from`/`-mine` |
| `84e4c66` | Topnav chrome + loading overlay | 112→107 (−5) | `#_fp-loading`, `.ml-topnav-bar`, `#theme-toggle:hover` |
| `85815da` | Article cards + thumb helpers | 107→88 (−19) | `.ml-pos-badge` / `.ml-thumb-32` / `.ml-pick-thumb-32` + `.pp-articles-*` / `.pp-article-*` family. Eliminates 8 `onmouseover`/`onmouseout` handlers via CSS `:hover` |
| `efcf777` | Exposure sidebar + WORDMARK/FLAME SVGs | 88→68 (−20) | The big SVG win: 14 path `style="fill:...;fill-rule:..."` + 1 root style in WORDMARK_LIGHT converted to **native SVG attributes** (`fill="..."`, `fill-rule="..."`, `clip-rule="..."`). Identical rendering, zero audit hits. |
| `0cf47e3` | Sleeper-CTA, roster summary, modal layering, PICKS row | 68→52 (−16) | `.ml-calc-sleeper-*`, `.ml-rs-*`, `#ml-ts-backdrop` / `#ml-pep-backdrop` z-index, `.ml-exposure-row-*.is-pick` |
| `0809779` | Small static residues | 52→46 (−6) | `.ml-cv-yellow`/`-green` reused, `.ml-median-stat`, `.ml-mb-12` |

Cumulative impact across the marathon:
- Total inline-style attrs: **293 → 46** (−247, 84% reduction)
- `onmouseover`/`onmouseout` JS hover handlers eliminated in favor of CSS `:hover`: **~15** (article cards, browse link, read link, more-button, title links, theme-toggle, sleeper-cta, more-row titles, pick-exposure league rows)
- `audit-ml-styles.py` mode breakdown is now 35 dynamic / 10 static / 1 dynamic-context — the dynamic 35 are mostly `--custom-prop:${value}` patterns (irreducible by design); the static 10 break down as 7 × `display:none` (JS toggle idiom — would need `class` toggle refactor in JS to eliminate) + 2 × CSS-comment false positives + 1 small remaining; the 1 dynamic-context is also a CSS-var pattern.
- `python scripts/check-colors.py` CLEAN across all 29 files after every commit.

The pattern documented here is the standard going forward: design CSS classes scoped to the component (`body.fpts-ml-page .ml-<region>-<purpose>` form), use CSS custom properties for per-element dynamic values, use modifier classes (`is-mine`, `is-pick`, `is-sub`) for state toggles, and replace `onmouseover`/`onmouseout` JS handlers with CSS `:hover` rules.

**Cache token state at session close:** `custom-select.js?v=1782300000` (new), all other module versions from session 8 unchanged.

---

## 2026-05-19 (eighth session) — Drift cleanup finale + OBS compat suite + UX features

Closure session. The last static-checkable hard-rules drift item (Drift #4 — `player-panel.css` `!important` refactor) closed in two diff-trusted passes; the lingering low-priority data item (Drift #6 — 2021/2022 rushing Basic CSV re-export) also shipped. With those two, the entire hard-rules audit punch list from session 7 is done.

Plus a substantial **OBS Browser Source compatibility suite** that came up mid-session as the user started streaming the site, and **two user-driven UX features** (a Rookies tab in the my-leagues player-exposure sidebar, and a site-wide back-to-top floating button).

### Drift #4 closure — `player-panel.css` `!important` 97 → 4 mobile-section

Approved approach (Approach C): consolidate then refactor, two commits, diff-trusted between passes, single browser verification at the end.

**Pass 1 — Consolidate (visual no-op)** — `4d9cd9c`. Merged 6 fragmented `@media (max-width: 768px)` blocks (at original lines 321 / 410 / 418 / 476 / 485 / 639) into ONE ordered block. Rules whose values were already overridden by a later block in the cascade were dropped as dead code; every effective rule preserved. Order: structural → header (close-bar / search-wrap / actions menu) → profile → trade-stats → tabs → trade finder → articles. Mobile-section `!important` count: 97 → 81 (-16 byte-identical duplicates removed). File size: 724 → 648 lines. Desktop CSS byte-equivalent (`git diff` starts at line 318).

**Pass 2 — Refactor selector-by-selector** — `b309ccd`. Two patterns:
- **Specificity escalation** for selectors with a corresponding higher-specificity desktop rule. Five selectors got their mobile rule upgraded from `.X` to `.player-panel .X` to match desktop's specificity (which uses `.player-panel .pp-close-bar` at line 306, `.player-panel .pp-profile` at line 308, `.player-panel .pp-avatar` at line 309, `.player-panel .pp-name` at line 310, `.player-panel .pp-tab` at line 313, `.player-panel .pp-value-val` at line 315). With matching specificity, the mobile rule wins via source order — no `!important` needed.
- **Same-specificity source-order wins** for everything else. Removed `!important` from `.pp-search-wrap`, `.pp-ktc`, `.pp-info`, `.pp-trade-stats`, `.pp-meta`, `.pp-tabs`, `.pp-scroll`, `.panel-close`, `.tf-sides`, `.tf-side`, articles section, etc.

Mobile-section `!important` count: 81 → **4**. The four remaining are doctrine-legitimate inline-style defenders (the ONLY way to defeat an inline `style="..."` from external CSS is `!important`), each annotated with an inline comment naming the JS line:
- `.pp-close-bar > div:first-child { font-size: 10px !important; }` — defeats inline `font-size:13px` set by `player-panel.js:74`.
- `.pp-search-input { min-width: 0 !important; }` — defeats inline `min-width:260px` set by `player-panel.js:86`.
- `.player-panel .pp-profile { padding: 14px !important; }` — defeats inline `padding:28px 32px` set by `player-panel.js:105`.
- `.pp-name { font-size: 20px !important; }` — defeats inline `font-size:32px` set by `player-panel.js:109`.

Also dropped `#pp-player-tabs { min-height: 36px }` — it was dead code, overridden at runtime by JS:101's inline `min-height:44px` (which is the desired mobile value anyway).

Desktop CSS byte-equivalent (lines 1-317 untouched). `check-colors.py` CLEAN. Cache token bumped: `player-panel.css?v=1780500000 → ?v=1781500000` across all 8 consumers + `templates/page-template.html`.

### Drift #6 closure — 2021/2022 rushing Basic CSVs re-exported

`3612da1`. User dropped fresh Basic-format CSVs at `data/source/stats/2021/rushing.csv` and `data/source/stats/2022/rushing.csv`. Headers verified to match the existing 2023+ Basic format (includes the Receiving section with TGT/REC/YDS/TD that the old Advanced exports lacked).

`sync-stats.config.json` lines 61 and 65 swapped from `label: "rushing (Advanced)"` (with the trimmed Rushing-only field map) → `label: "rushing"` (with the full Basic field map mirroring the 2023+ rows: adds `targets: "Receiving/TGT"`, `rec: "Receiving/REC"`, `recYards: "Receiving/YDS"`, `recTd: "Receiving/TD"`). The stale `_comment` at the top of the config refreshed to drop the "Advanced rushing exception" note.

`sync-stats.py` rerun regenerated `data/stats.json` (1,102 unique players × 5 seasons). Spot-check **Najee Harris 2021**: rushAtt 307, rushYards 1200, rushTd 7, targets 94, rec 74, recYards 467, recTd 3, 17 weeks + 1 playoff week — every number matches real NFL stats. Receiving stats for 2021/2022 RBs now flow from the rushing CSV's new Receiving section (in addition to the receiving CSV, which is still the primary source — the two should agree).

The diff also bundled a routine site data refresh (`data/adp-*.json`, `data/auction-*.json`, `data/pick-availability-*.json`, `data/articles.json`, `data/values.json`, `data/mvs.json`, `data/picks.json`, `data/rank-history.json`, `tiers.html` Synced-timestamp, `docs/function-reference.pdf`) — pre-existing uncommitted changes from an earlier push.bat sync chain that hadn't been committed.

### OBS Browser Source compatibility suite

User started loading the deployed site as an OBS Browser Source overlay for streaming. Two issues surfaced and got fixed across a 4-commit arc plus 1 diagnostic round-trip:

#### `ee9df70` — `assets/js/iframe-scroll-fix.js` shared module

New module loaded by all 8 deployed pages + `templates/page-template.html`. The problem it solves: when the site is iframed in an OBS Browser Source (or any cross-origin parent), wheel events get trapped by inner scroll containers on our pages (player-panel drawer `.pp-scroll`, my-leagues table sections) and never bubble to the iframe document, so the parent can't scroll the iframe content.

The fix has three parts (only runs when iframed; bails immediately for direct browser visitors):
1. **CSS injection** — overflow-reset stylesheet that flattens common framework wrappers (`.page`, `.container`, `.layout`, etc.) to `overflow: visible !important; max-height: none !important;`. Forces html/body to `overflow-y: auto`.
2. **`fixContainers` walker** — runs on DOMContentLoaded + 400ms + 1500ms. Walks all div/main/article/section elements; if any is wider than 50% viewport AND taller than 200px AND has `overflow-y: auto/scroll/hidden`, flattens to `overflow-y: visible` so it doesn't trap wheel events.
3. **Capture-phase wheel handler** with `passive: false`. Walks up from `elementFromPoint(mouseX, mouseY)` to find a scrollable ancestor. If any ancestor still has room to scroll in the wheel direction → defer (return early — let native handle). If nothing wants the wheel event → `preventDefault()` and `window.scrollBy({ top: deltaY, left: deltaX })`.

Hard guarantee for direct browser visitors: zero behavior change. The IIFE starts with `if (window.self === window.top) return;` (try/catch'd for cross-origin parents). Every site feature that relies on inner scrolling (player-panel drawer, my-leagues tables, every other inner-scrollable surface) is completely untouched for normal visits.

#### `0b820b6` + `774bb57` — OBS dropdown diagnostic round-trip

User reported the three cascading native `<select>` dropdowns on `live-draft.html` (year / league / draft pickers) do nothing when clicked in OBS Browser Source. Direct browser visits worked fine. Hypothesis: the just-shipped `iframe-scroll-fix.js` might be interfering with native widget interaction.

Diagnostic (`0b820b6`): commented out the iframe-scroll-fix script tag on `live-draft.html` only (leaving it active on the other 8 consumers). User retested in OBS Interact mode — dropdowns still failed. **Conclusion: iframe-scroll-fix is innocent.** Real cause: CEF's native `<select>` rendering bug in cross-origin iframes, reproducible on OBS 32.1.2 even with the script removed.

Restore (`774bb57`): re-enabled the script tag on `live-draft.html`. Byte-identical to pre-diagnostic state.

#### `21eb03e` — Custom combobox wrapper for OBS compatibility

Since the OBS bug is in CEF's native-widget rendering (not something we can fix server-side), the practical workaround is to STOP using a native widget for the dropdown popup. Custom combobox inline in `live-draft.html` (50 lines CSS + 99 lines JS, no existing code modified):

- The original `<select class="ld-select">` element stays in DOM (display:none) and keeps its full JS API working — `.value`, `.innerHTML`, `.disabled` all continue to work for the existing `ldFetchLeagues` / `ldFetchDrafts` / `ldOnYearChange` / cascade logic. Zero modifications to the data-loading code.
- A sibling `<div class="ld-cs-wrap">` with a button trigger + popup `<div role="listbox">` provides the visible UI.
- The custom UI **mirrors** the `<select>` state via:
  - **`MutationObserver`** on the `<select>` watching `childList` (catches `innerHTML` changes from `ldFetchLeagues` / `ldFetchDrafts` rebuilding the option list) + `attributeFilter: ['disabled']` (catches `disabled` toggling).
  - **Per-instance `.value` setter override** via `Object.defineProperty` — programmatic `sel.value = x` doesn't reflect to an attribute, so MutationObserver alone misses it. The override calls the native setter (preserved via the prototype descriptor) then triggers `sync()`.
- When user picks an option in the custom popup: set `<select>.value` + dispatch `new Event('change', { bubbles: true })` so the inline `onchange="ldOnYearChange()"` attribute on the original `<select>` fires normally. The existing cascading-picker logic runs without knowing the click came from a custom widget.
- Multi-popup handling: clicking dropdown B closes dropdown A. The button click intentionally does NOT `stopPropagation` so the document handlers on sibling wraps fire and close their popups. Click-outside (document handler) + Escape key (keydown handler) both close all popups.
- Visual styling: the button reuses the existing `.ld-select` class so it looks identical to the original native dropdown. Popup styled with brand surface/border tokens, max-height 280px with scroll for long lists, z-index 50.

Works identically in direct browser AND OBS iframe contexts. No behavior change for direct visitors beyond the visual swap (popup is in-document instead of OS-level — slightly different look, same UX).

#### `ace0025` — Horizontal scroll support for iframed contexts

User reported the live-draft board (wider than the OBS viewport) couldn't be side-scrolled. Cause: `iframe-scroll-fix.js` forced `overflow-x: hidden !important` on html/body and the wheel handler only knew about vertical scrolling.

Three coordinated changes:
1. **CSS injection** — `overflow-x: hidden !important` → `overflow-x: auto !important` on html/body so the body can scroll horizontally when content overflows.
2. **`fixContainers` walker** — matching change on `body.style.overflowX` (was inline-set to `hidden`, now `auto`).
3. **`isScrollable` + `onWheel`** — both now detect horizontal scroll containers in addition to vertical. The wheel handler checks `canScrollY` AND `canScrollX` independently for each scrollable ancestor and defers to it when the wheel direction (deltaY or deltaX) still has room left.

End result in iframed contexts: trackpad / Shift+Wheel left-right over the draft board defers to the board's horizontal scroll. Same gesture in empty page area falls through to `window.scrollBy` → page horizontal-scrolls if content overflows.

#### `4c35b60` — Middle-click drag-scroll (Windows-style pan)

User reported they couldn't click the mouse wheel down + drag to pan the page in OBS. CEF doesn't surface the native middle-click pan/auto-scroll cursor that desktop Chromium ships with. Re-implementing manually:

- `mousedown` w/ `e.button === 1` (middle button) → enter pan mode. Capture (clientX, clientY) start position + current (scrollX, scrollY). Set cursor to `all-scroll` (4-arrow pan cursor).
- `mousemove` while panning → `window.scrollTo` with start scroll minus drag delta. Drag-to-scroll convention: drag RIGHT pulls the page right (Google-Maps-style grab). Diagonal drag pans diagonally.
- `mouseup` w/ `e.button === 1` → exit pan mode, restore default cursor.
- `auxclick` w/ `e.button === 1` → `preventDefault()` to suppress the native auto-scroll cursor toggle some Chromium builds ship (would conflict with our drag-pan).

Only runs when iframed (same guard as the rest of `iframe-scroll-fix.js`). Direct browser visitors continue to get the OS's native middle-click behavior unchanged.

Cache tokens after the OBS suite: `iframe-scroll-fix.js?v=1781700000 → ?v=1781900000 → ?v=1782100000` (bumped per iteration). All 9 consumers aligned at each bump.

### Rookies tab in my-leagues player exposure + sidebar widened

`ce85d59`. Two coordinated additions to the player-exposure sidebar:

1. **`ROOKIE` filter button** between TE and Picks (`ALL | QB | RB | WR | TE | Rookies | Picks`). Shows only current-year rookies on the user's rosters (`years_exp === 0` per Sleeper), scoped to skill positions (QB/RB/WR/TE) so K/DEF rookies don't pollute the list. Sleeper updates `years_exp` around April each year, so "rookie" here always tracks the most recent draft class.
   - **Data wiring:** `computePlayerExposure()` (line 5610) now caches `yearsExp` on each `ML_EXPOSURE_DATA` entry (null if Sleeper data missing). Avoids a re-lookup at filter time.
   - **Filter wiring:** `renderExposureList()` gets a `filter === 'ROOKIE'` branch BEFORE the existing position filter — applies `yearsExp === 0` + skill-pos scope.
   - The search-augmentation block that surfaces non-rostered FP players on name search is intentionally **skipped** for `ROOKIE` filter — `FP_VALUES` records don't carry `years_exp`, so we can't tell which non-rostered players are rookies. Only rostered rookies (with Sleeper data) show up in this tab.

2. **Sidebar widened 360px → 440px** (`.ml-columns` grid template). The fixed pixel columns (Pos / Shares / Value / Exp%) + image + padding consumed ~252px of the 360px container, leaving only ~108px for the player-name column — long names like "Christian McCaffrey" or "DeMario Douglas" were getting ellipsis-truncated. +80px on the sidebar gives the name column ~188px, fitting every full name in the FP catalog. Trade-off: the leagues list (left column) shrinks by 80px (on a 1440px viewport: 1062px → 982px, still comfortable). Collapsed state (`.ml-exposure-pinned` → `1fr 44px`) unchanged.

### Back-to-top floating button

`5422fa5`. New `assets/js/back-to-top.js` shared module loaded by all 8 deployed pages + `templates/page-template.html`. The user requested it for long scrolling pages (trade database, my-leagues exposure, tiers tables, etc.).

- **Built at runtime** — single IIFE creates a 44×44 round button (brand-red bg, white ↑) and appends to `document.body`.
- **Position:** fixed, `bottom: 70px; right: 18px` — stacked 12px above the existing Legend trigger (`.lg-trigger` at `bottom: 18px`, ~40px tall). The two floating buttons share the same right edge.
- **Behavior:** hidden by default. Fades in (200ms) when `scrollY > 400`, fades back out when user scrolls back near top. Click → `window.scrollTo({ top: 0, behavior: 'smooth' })` with a graceful fallback for older browsers without options-object scrollTo.
- **z-index 150** — above ordinary content but BELOW the player-panel drawer (z 200+) and Legend backdrop (z 8999), so it hides correctly behind any open modal.
- **Hover state:** subtle 1px lift + box-shadow expand, matches the Legend trigger's hover pattern.
- **Self-contained:** inline styles for full control, no `brand.css` load-order dependency. Uses `var(--red)` / `var(--white)` tokens pulled from whichever CSS the host page loads.
- **Idempotent** init — exits early if the button already exists.

Cache token: `back-to-top.js?v=1782200000` (new module).

### Audit status

`python scripts/check-colors.py` — CLEAN across 28 files after every commit. Two new shared JS modules (`iframe-scroll-fix.js`, `back-to-top.js`) added to the audit scope.

### Next session — Player Comparison full page

Still the headline unblocked initiative. New `compare.html`. Two visual references unchanged from prior sessions (Underdog stat-table at `Desktop/Player comparison page.jpg` + Hayden-Winks profile-matches at `Desktop/HIm4pBXaUAAsSMz.jpg`). Per-year career data ready from `STATS_DATA[key].seasons` (2021-2025). Real multi-session work — expect skeleton + Phase 1 in the next session.

---

## 2026-05-18 (seventh session) — Live Draft Assistant + Data-Suite Migration

Two major initiatives across ~30 commits.

### Live Draft Assistant — full page shipped (Phases 1-5 + polish)

New `live-draft.html` page in the top nav. Sign in with Sleeper username → year + league picker (historic leagues surfaced via `previous_league_id` chain walk; active drafts marked with 🔥) → draft picker → live board. Per-pick analysis card with VALUE/ON ADP/REACH/NO ADP badges. Team Needs sorted by league rank (worst rank = biggest need). Roster Panel with per-position groups (4-up desktop, 2x2 mobile). Best Player Available card (top 10 undrafted by ADP, position-filtered, 25-draft minimum-volume floor). Fair-Value Trade Suggestions backed by the shared trade engine.

Commit map:
- `fd5eccc` Phase 1: page skeleton + login + draft board
- `6c80a5a` Phase 1.5: unified login UI + draft-history chain + owner names + active markers
- `d7f470e` Sort leagues with active drafts to top of dropdown
- `bb4f57b` Phase 1.7: traded-pick tracking in the draft board
- `df6c570` Swap 🔴 → 🔥 for active-draft markers in league dropdown
- `60971e0` Phase 2: per-pick ADP analysis + roster + team needs cards
- `6b3e239` Phase 2.6-2.8: ON ADP rename + value-weighted Team Needs + wide roster panel
- `197e9af` Phase 2.10: roster position groups side-by-side (4-up desktop, 2x2 mobile)
- `41b39ba` CSS multi-column → Grid fix for roster panel
- `e1ab9a1` Replace PPG with Sleeper projected season pts + fix TE row alignment
- `870b71c` Per-position league rank + Proj on Pick Analysis
- `ea46503` Phase 3: live polling + on-the-clock highlight
- `9322af7` Phase 4.1: Best Player Available card
- `b27c5e9` Phase 4.2: Fair Value trade suggestions for next pick
- `128c6c1` Phase 5: sticky on-the-clock summary bar
- `04d776d` BPA: filter to fantasy positions + minimum draft volume

### Format-aware values across the site

Trade values + pick values now route to the right column (`valueSf` for SF leagues, `value1qb` for 1QB) per-league. TEP / PPC / pass-TD bonus applied via shared `SLEEPER.adjustStatsForLeague` reading each league's `scoring_settings`.

- `bc901f6` Extract `assets/js/sleeper-helpers.js` shared module (trade engine + asset pool + archetype + pick value)
- `0b7af01` Live Draft: factor in SF/1QB and TEP for values + projections
- `bf65836` my-leagues: factor in SF/1QB for trade values + pick values
- `4d5bbb1` my-leagues: apply TEP bonus to projections (consistency with live-draft)
- `8ec19bc` my-leagues: persist Sleeper session across reloads (shared LS keys with live-draft)

### Data-Suite Migration — Phases 1-8

User dropped CSV exports from FantasyPoints' Data Suite covering 5 seasons (2021-2025) × 3 categories (passing / rushing / receiving) with the "week split" toggle ON. The data suite is now the source of truth for stats; Sleeper stays only for league data + player identity + forward-looking weekly projections.

Phase 1-7 commits (ingest + math + cascade):
- `095979b` Phase 1: `sync-stats.py` shell + config example + source dir
- `4f3b48a` Phase 1 verification: ingest data-suite CSVs → data/stats.json (631 players)
- `3fef56c` Weekly-split mode — aggregate season totals + emit weeks map
- `544bc4e` Multi-year ingest (2021-2025) — pivot to per-player seasons map
- `136da75` Playoff data + season-mismatch guard + games fix
- `94401ce` Backfill 2021 + 2022 rushing (Advanced exports)
- `7b6986d` Phase 2: data-bootstrap loadStats — expose `window.STATS_DATA`
- `7784a7e` Phase 3+4: `SLEEPER.adjustStatsForLeague` + `projectPlayer`
- `a445b87` Phase 5: lineup projection → archetype cascade
- `6889ccf` Phase 6: live-draft cascade — lineup projection through Team Needs + League Ranks
- `a9c9953` Phase 7: real archetype detection in live-draft Trade Suggestions

Phase 8 commits (close out remaining Sleeper stat surfaces in my-leagues):
- `ef6bce4` Phase 8a: PPG column migrated from Sleeper /stats to data-suite STATS_DATA
- `f276530` Phase 8b: ML_SEASON_PROJ migrated from Sleeper /projections to data-suite

### What stays Sleeper-sourced (intentional)

- `/league/{id}/*` (rosters, users, drafts, traded_picks) — the league IS Sleeper
- `/players/nfl` — player identity; data suite doesn't ship Sleeper IDs
- `league.scoring_settings` + `league.roster_positions` — per-league configuration
- Per-week `/projections/nfl/regular/{year}/{week}` (in-season "Proj Wk N" column only) — forward-looking, no data-suite equivalent
- Live-draft `_projForPlayerId` tier-2 fallback for IDP / K / DEF / unmapped rookies

### Bugfixes worth flagging

- **BPA position filter** (`04d776d`): Ethan Sanchez (K, 12 drafts in the corpus, ADP 20.2) was landing at #1 BPA. Filtered to QB/RB/WR/TE with a 25-draft minimum-volume floor.
- **TE row alignment** (`e1ab9a1`): Team Needs row used `auto` last column + 1px-vs-2px border. Fixed via outline-with-negative-offset + fixed-width last column.
- **Footer-row garbage** (`136da75`): Data suite ships legend text rows ("Rank, Most to Least", "Weighted Opportunity, a somewhat watered down version of XFP") that snuck through as fake players. Filtered via `seasonType` check.
- **`games` count overwrite** (`136da75`): Per-source `games` summed within a CSV but the LAST source's count was overwriting earlier sources. Now derived from `len(weeks)` at restructure time.
- **Mislabeled CSVs caught** (`136da75`): `2021/rushing.csv` actually contained 2022 data, `2022/rushing.csv` contained 2023. Season-mismatch guard now aborts the sync with a clear file-naming error.

### Notable artifacts

- `data/stats.json` — ~12 MB on disk, ~1.8 MB gzipped OTW. Boot-fetched once via data-bootstrap. Shape: `{ currentSeason, seasons[], players: { 'name:<norm>' or 'sid:<id>': { name, sleeperId, [currentSeason top-level fields], seasons: { '2021': {...}, ..., '2025': {weeks, playoffWeeks} } } } }`.
- `assets/js/sleeper-helpers.js` — exports on `window.SLEEPER`: `pickValue`, `getValueByName`, `getOwnedPicks`, `buildAssetPool`, `generateTradeSuggestions`, `archetypeFromTotals`, `archetypeLabel`, `adjustStatsForLeague`, `projectPlayer`, `optimalLineup`, `lineupProjection`.
- `sync-stats.py` (local-only, gitignored) — config-driven multi-year CSV ingester with composite-key support + season-mismatch validation.

### Verification

- `python scripts/check-colors.py` — CLEAN across 26 files after every phase commit.
- Spot-checks against Pro Football Reference: Saquon 2024 (345/2005/13), JT 2021 (332/1811/18), CMC 2022 (244/1139/8), Henry 2021 (8 games — real foot-injury truncation).
- Cross-page consistency: my-leagues + live-draft produce identical archetype + lineupProjection for the same league/team.

### Post-Phase-8 polish

After Phase 8b closed out the last my-leagues Sleeper stat call, six more commits cleaned up adjacent surfaces.

**ADP cleanup** — user flagged outliers in rookie ADP ("some players are not in the right spots"). Audit identified two root causes: 11 kickers polluting rookie ADP (Ethan Sanchez at rank 18 from 12 drafts), and 115 of 204 `rookie_draft_sf` entries having fewer than 25 drafts (statistical noise from a handful of weirdo leagues). Fix:

- `3fee1fd` — initial filter in `data-bootstrap.js _cleanAdpPayload`: position ∈ {QB, RB, WR, TE} + `drafts >= 25`. Re-rank within filtered list. Raw preserved under `window.ADP_PAYLOAD_RAW`. FP_VALUES.adp overlay still uses RAW so individual players don't lose their ADP scalar.
- `22f45dd` — scale-aware floor: `max(25, corpus_max × 10%)`. Auto-handles the 100x corpus-size gap between SF (max 10,919 drafts) and 1QB (max 586). User-validated: "adp looks way better."
- `1db152d` — `adp-tool.html` rookie display caps at 4 rounds (R5 isn't common consensus practice; the corpus only sparsely populates it).

**Player-drawer Stats tab migrated to data suite** — user noted the drawer's Player Stats tab was still hitting Sleeper directly. The data suite already covers 2021-2025 weekly + season totals; just needed the drawer to read it.

- `8e45560` — Added `_statsDataLookup` + `_toSleeperShape` translators in `player-panel.js`. The renderer reads Sleeper-API shape (`gp`, `pts_ppr`, `pass_yd`, etc.); the translator adapts STATS_DATA records to that shape. Two-tier resolution: data suite first (synchronous, no network), Sleeper `/stats` fallback only for years/players the suite doesn't carry (pre-2021, IDP, K, DEF).
- `8e08aed` — Fix FPTS column rendering as `—` everywhere except my-leagues + live-draft. Root cause: `SLEEPER.adjustStatsForLeague` was undefined on pages that didn't load `sleeper-helpers.js`, so fantasyPts computed as 0 → formatter dashed it. Fix: add `sleeper-helpers.js <script>` tag to every page that loads `player-panel.js`. Also dropped 2020 from the year list (data suite cuts off at 2021) and updated the subtitle from "Source: Sleeper" → "Source: Data Suite".

**Punch list close-out** — `0ddfd85` marks the ADP audit item as ✅ done in the README. Player Comparison full page is now the only fully-unblocked next-big-initiative on the list (all other open items are external-blocked or deferred).

**Cache token state at session close**: `data-bootstrap.js?v=1781000000`, `sleeper-helpers.js?v=1780800000`, `player-panel.js?v=1781200000`, `legend-content.js?v=1781100000` across the 9 consumers.

---

## 2026-05-17 (sixth session — overnight autonomous) — Mobile-first refactor Phases 1 + 2A + 2B+ + 2C

User went to bed with instructions: "push through this overnight stop if there is something wrong." Six phase commits shipped autonomously through the night, each pushed live after a clean `python scripts/check-colors.py` audit. Stop conditions in the plan file held — anything requiring browser verification or risky cross-file changes was deferred to a daytime session.

### Phase 1B — `heatmap.css` mobile rebuild (commit `2d9aae6`)

Consolidated the legacy 480px sub-breakpoint into the 768px mobile block. Single from-scratch mobile design for the entire phone range. `.hm-callout` flips from horizontal flex-wrap to `flex-direction: column` with smaller stat rows. Cell min-heights bumped to 22px (folded from the old 480px rules) for finger taps. Legend bar shrinks to 90×8. Flash label moves to its own row below the cells on mobile.

### Phase 1C — `legend.css` mobile rebuild (commit `2d9aae6`)

Drawer becomes a bottom-sheet on mobile (transform-axis flip from `translateX` to `translateY`, `height: 92vh`). Close bar sticky-top inside the drawer for one-tap dismiss. Trigger button at bottom-center with 44px tap target via padding + min-height. Tighter content padding + smaller item-row column (52px instead of 60px) for narrow viewports.

### Phase 1D — `mvs-extras.css` mobile (fresh block, commit `2d9aae6`)

File had ZERO `@media` rules before — entirely desktop-first. Added a 768px mobile block. `.mvs-extras` grid was already `auto-fit minmax(220px, 1fr)` so it naturally collapses to 1 column on phone (that part already responsive). The real mobile-specific work: trade cards (`.mvs-t-sides`) now `flex-direction: column` so Side A stacks ABOVE Side B instead of side-by-side. `.mvs-t-vs` chevron becomes a horizontal separator rather than a vertical one. Sparkline shrinks to 44px height. Rankings row gap tightens.

### Phase 1E — `brand.css` topnav mobile expansion (commit `2d9aae6`)

Existing minimal mobile `@media` block (just `.mobile-nav-select`) expanded into canonical mobile topnav defaults so new pages inherit a working mobile nav from `brand.css` alone. Compact topnav (48px height, 10px padding, 20px wordmark svg), wordmark-tag hidden, nav-links hidden, mobile-nav-select revealed, page chrome scales (`.page` padding 0 8px, `.page-title` 22px), `body { padding-bottom: max(20px, env(safe-area-inset-bottom)) }` for notched phones. The 7 existing pages still carry duplicated rules in their inline `<style>` blocks; those keep winning via `!important` + load order until next-touched. The 1280px / 1100px / 940px wordmark-tag breakpoints are kept (they're desktop-narrowing rules, not mobile).

### Phase 1A (partial) — `player-panel.css` 480px → 768px (commit `f2fd8cf`)

Per Phase 0 doctrine — one breakpoint. The 3 `@media (max-width: 480px)` blocks in `player-panel.css` swept to 768px so their rules apply across the entire mobile range. iPhones (375–430px) unchanged (already <480). iPad Mini portrait at exactly 768px now sees the tighter rules. The full mobile-block rewrite + dropping the 97 `!important` count to <30 deferred — that needs browser testing to verify the 7 interlocking 768px blocks (Sub-plans A through E) all work together.

### Phase 2A — `rankings.html` By Analyst mobile card mode (commit `44e18ba`)

The headliner of the night. New `_renderAnalystCard(p)` function parallel to `_renderAnalystRow()`. `renderAnalystComparison()` chooses renderer via `window.matchMedia('(max-width: 768px)').matches`. `matchMedia 'change'` listener re-renders when the viewport crosses the breakpoint (window resize from desktop down to phone width flips the layout in real time). Each mobile card has: name + team logo + consensus value on the top row, 5 analyst rank cells in a CSS grid below (3-char labels RYA/THE/JOH/AND/THO + rank number), bipolar heat tints (green = best in row, orange = worst) on `.rk-acard-cell` instead of `<td>`. User complaint from the screenshots resolved: all 5 analyst ranks now visible at a glance on mobile, no horizontal swipe, no truncated columns.

### Phase 2B+ — cross-page breakpoint sweep (commit `f321440`)

Cleanup pass — found 480px and 600px sub-breakpoints still surviving in 6 HTML pages and swept them all to 768px to complete the "one breakpoint" doctrine:
- `my-leagues.html`: 3× 480px + 1× 600px → 768px
- `adp-tool.html`: 1× 480px → 768px
- `formulas.html`: 1× 600px → 768px
- `tiers.html`: 1× 480px → 768px
- `trade-calculator.html`: 2× 480px → 768px
- `index.html`: 2× 480px → 768px

Zero `@media (max-width: 480px)` / `(600px)` / `(700px)` remaining in deployed CSS. The only remaining 700px reference is in `docs/function-reference.html` (printable PDF source, not deployed). The full my-leagues table→card conversion was DEFERRED for the same reason as Phase 1A-deep: too many interlocking renderers to verify safely overnight.

### Phase 2C — ADP Box view mobile carousel (commit `8085f87`)

Box view was force-disabled on mobile via `enforceMobileView()` (button greyed out + `STATE.view` forced to 'list'). Now: Box view renders normally on mobile. `#view-box` becomes a horizontal scroll surface with `scroll-snap-type: x mandatory` + `scroll-snap-align: start` on `.box-card`. Swipes land on column edges instead of mid-card. Right-edge mask-image gradient as swipe affordance.

JS changes:
- `setView()`: removed the force-switch to 'list' when user clicks Box on mobile
- `enforceMobileView()`: now a no-op stub (kept so any upstream callers don't break; can be removed in a future cleanup)
- `[data-view="box"]` mobile CSS overrides any stuck opacity/cursor from the legacy disabled state

Card refinements inside `#view-box` on mobile: smaller cards (72px vs 78px desktop, padding 4px 6px), smaller fonts on names (8px first, 11px last), smaller headshot (28px) and team-logo coin (22px).

### Phase 2D — DEFERRED

`index.html` and `trade-calculator.html` are each >370k tokens (cannot be read in full); without specific bug reports to drive the polish, a speculative mobile refactor is high-risk overnight. `tiers.html` and `formulas.html` are already mobile-OK per the plan and confirmed by inspection. Phase 2D rolls forward to whenever specific complaints surface.

### Audit status

`python scripts/check-colors.py` — CLEAN across 24 files after every phase commit.

### Cache tokens bumped this session

- `brand.css ?v=1780300000 → ?v=1780400000`
- `heatmap.css ?v=1780300000 → ?v=1780400000`
- `legend.css ?v=1780300000 → ?v=1780400000`
- `mvs-extras.css ?v=1780000000 → ?v=1780400000`
- `player-panel.css ?v=1780300000 → ?v=1780400000`

(All bumped across the 7 consumer pages + `templates/page-template.html`.)

### Open work for the next session

1. **Phase 1A-deep** — drop player-panel.css `!important` from 97 to <30 via mobile-block rewrite. Needs browser testing.
2. **Phase 2B-deep** — my-leagues roster/standings/trade-history tables → card mode. Same parallel-renderer pattern as Phase 2A.
3. **Phase 2D** — index.html + trade-calculator.html mobile polish (waiting on specific bug reports).

Plan file with detailed handoff: `~/.claude/plans/i-have-a-deeper-golden-wadler.md`.

---

## 2026-05-17 (fifth session) — Mobile-first refactor Phase 0: foundation + doctrine

User raised a strategic concern after the fourth session: each session's mobile work feels like half measures — band-aids on top of desktop-first code rather than a coherent design. A codebase audit confirmed it: `body { zoom: 1.25 }` is the structural foundation; 97 `!important` overrides in player-panel.css mobile section alone; tables hard-coded at `min-width: 1100px` and `min-width: 1500px` (ADP Box view literally disabled on mobile via JS); breakpoint drift across 700px / 768px / 480px; 27% of all shared CSS sits inside mobile media-query blocks.

The decision: **mobile-first refactor** with one hard constraint — desktop CSS stays byte-equivalent. Every mobile change ships behind `@media (max-width: 768px)`, with the mobile block authored as a from-scratch design for a 390px viewport rather than as overrides on the desktop layout. Phased rollout: foundation (this session) → shared modules (Phase 1) → per-page rebuilds (Phase 2) → ongoing doctrine.

Plan file: `C:\Users\deons\.claude\plans\i-have-a-deeper-golden-wadler.md`.

### Phase 0.1 — MOBILE-FIRST RULES codified in brand.css

Added a sixth comment block at the top of `assets/css/brand.css` alongside the existing BRANDING HARD RULES, COLOR USAGE RULE, and PURPOSE blocks. Six rules:

1. **One breakpoint — 768px.** No 700px, no 480px (480px sub-breakpoints in player-panel.css + heatmap.css remain pending Phase 1).
2. **Mobile blocks are self-contained designs, not patches.** A mobile @media block should read like a from-scratch layout for a touch viewport — not a series of `flex-direction: column !important` overrides flipping desktop properties.
3. **Minimal `!important`.** Use selector specificity instead. The exception: defeating a JS inline `style="..."` attribute.
4. **No desktop-pixel references in mobile blocks.** Don't reference 1100px, 1500px, 1360px, 1440px inside a mobile block. Derive constraints from the viewport.
5. **Desktop CSS never changes.** Every mobile-first edit is gated behind `@media (max-width: 768px)`. Desktop pixel output stays byte-equivalent.
6. **Recipes.** Reference the canonical conversions in CLAUDE.md.

### Phase 0.2 — Mobile-first recipes section added to CLAUDE.md

Five copy-paste recipes for the conversions that come up over and over:

- **Table → card mode** — full CSS for converting a desktop table to a stack of labeled cards on mobile. Includes the `display: block` cascade on table/thead/tbody/tr/td and the `data-label` + `::before` pattern for showing column headers inside each card. Alternative: parallel `_renderCard()` function selected via `window.matchMedia`.
- **Side drawer → bottom sheet** — `transform: translateX(100%)` (desktop) → `transform: translateY(100%)` (mobile). Same animation primitive, different axis. Drawer slides in from the right on desktop, up from the bottom on phone.
- **Multi-column grid → swipeable carousel** — `display: grid; grid-template-columns: repeat(12, ...)` (desktop) → `display: flex; scroll-snap-type: x mandatory` (mobile). One card per swipe, snap-to-center.
- **Hover state → tap state** — replace `:hover` reveals with always-visible content on mobile. Tooltips become tap-toggled `(?)` icons.
- **Tap-target sizing** — `min-height: 44px` on all interactive elements per iOS HIG. Flex centering keeps visual content small while expanding the tap surface.

Each recipe has a worked CSS example and a verification checklist (DevTools at 390×844, desktop visual regression check, brand audit, `!important` count check).

### Phase 0.3 — Template scaffold updated

`templates/page-template.html` got a second comment box (MOBILE-FIRST RULES) directly below the existing BRANDING + ALIGNMENT RULES box. Any new page copied from the template sees the rules immediately.

### Phase 0.5 — Breakpoint swept from 700px to 768px

User confirmed the tradeoff before the sweep: viewports in the 700–768px range (rare narrow desktop windows, iPad portrait at exactly 768px) flip from desktop-zoom 1.25 to mobile-zoom 1.0. Typical desktops at 1200px+ are unaffected. The cleaner mobile story going forward justifies the change.

Files swept:
- `assets/css/brand.css` — zoom reset (`@media (max-width: 700px) { body { zoom: 1; } }`)
- `assets/css/player-panel.css` — late mobile block at line ~716
- `assets/css/legend.css` — drawer-becomes-full-screen rule at line 144
- `assets/css/heatmap.css` — callout mobile rules at line 23
- `index.html`, `my-leagues.html`, `adp-tool.html`, `tiers.html`, `trade-calculator.html` — each had an inline `@media (max-width: 700px) { body { zoom: 1; } }` zoom reset in their `<style>` block. All swept.
- `assets/js/legend-content.js` — doc-string references to "@media (max-width: 700px)" in 4 legend entries.

Verified: zero `max-width: 700px` references remaining in deployed code. The only remaining 700px references are in `docs/function-reference.html` (legacy printable PDF source, not deployed CSS) and in this very CHANGES.md file (historical). Brand audit CLEAN.

### Phase 0 baseline metric for tracking

`!important` count in `assets/css/player-panel.css` = **97**. Phase 1 target: drop to <30 by rebuilding the mobile section as a self-contained bottom-sheet design rather than a thicket of overrides.

### Cache tokens bumped this session

- `brand.css ?v=1780100000 → ?v=1780300000`
- `player-panel.css ?v=1780200000 → ?v=1780300000`
- `legend.css ?v=1779990000 → ?v=1780300000`
- `heatmap.css ?v=1779990000 → ?v=1780300000`
- `legend-content.js ?v=1779840000 → ?v=1780300000`

All bumped across the 7 consumer pages + `templates/page-template.html`. `data-bootstrap.js` was already at `?v=1780200000` and was NOT touched this session (no functional change).

### Audit status

`python scripts/check-colors.py` — CLEAN across 24 files. Desktop CSS rules unmodified; only mobile-block content changed (breakpoint number) plus new comment blocks (zero CSS rule emit).

### Next session — Phase 1 starts

Rebuild the 5 shared-module mobile blocks (`player-panel.css`, `heatmap.css`, `legend.css`, `mvs-extras.css`, `brand.css` topnav-mobile) as clean from-scratch mobile designs. Target: drop player-panel `!important` count from 97 to <30. Desktop CSS untouched.

---

## 2026-05-17 (fourth session) — Mobile fixes: nav sync, compare-search overlap, hero reflow, analyst table fit

User-driven mobile pass. Four distinct iPhone issues surfaced from on-device screenshots; each got a targeted fix plus a cache-token bump on the affected shared module.

### 1. Mobile nav dropdown — always says "— Pages —"

The mobile nav is a native `<select class="mobile-nav-select">` with a `"— Pages —"` placeholder option first. None of the per-page options carried a `selected` attribute, so on every page the browser fell back to the placeholder and the dropdown never reflected the current location. Navigating between pages always showed "— Pages —" regardless of where the user was.

**Fix:** added `_syncMobileNav()` to `assets/js/data-bootstrap.js` — runs on DOMContentLoaded (or immediately if DOM is already loaded), reads `window.location.pathname`'s filename, walks `sel.options[]` and sets `selectedIndex` to the matching option. Safe + idempotent — exits silently if the page doesn't have the select. Effect: now `rankings.html` shows "Rankings" in the dropdown, `tiers.html` shows "Tiers", etc. Implemented once in the shared bootstrap so all 7 pages + the template inherit the fix automatically — no per-page edits.

### 2. Player drawer compare-search dropdown — bleed-through + overlap

`.pp-search-results` autocomplete dropdown was rendering with article-banner text appearing to leak through the surface and the cross-page button strip's third button rendering with what looked like a strikethrough. Combined with iOS's own keyboard autocomplete suggestions doubling up the picks.

**Fix** in `assets/css/player-panel.css`:
- Made the dropdown more solid: explicit `background-color: var(--surface)` on `.pp-search-results` (was `background:` which is the same shorthand but easier to override accidentally), bumped `z-index: 300` → `500` so it sits above the Sub-plan A actions-menu overlay (which uses z-index 100) without ambiguity, added a `box-shadow` on desktop so the floating layer reads correctly even with one result.
- Made each `.pp-search-result` row self-contained: own `background-color: var(--surface)` (so a 1-result dropdown looks like a complete panel), explicit `text-decoration: none` on the row + both child spans to defend against any inherited line-through, `min-width: 0` so flex sizing computes correctly with long names.
- Fixed the "No trades yet" wrap: `.pp-search-result-name` got `white-space: nowrap; overflow: hidden; text-overflow: ellipsis`. `.pp-search-result-count` got `flex-shrink: 0; white-space: nowrap` so the count always sits compactly on the right of the row and doesn't break onto a new line.
- The `<input>` already had `autocomplete="off"`, so iOS suggestion-bar duplication is as suppressed as iOS allows.

### 3. Player drawer Fantasy Points hero — half-width column on mobile

Hero stat block (`FANTASY POINTS / 9,541 / +1350 (7d)`) was sitting in its own dedicated horizontal band BELOW the entire profile section, leaving the right half of the row beside the 80px headshot empty black space. Wasteful vertical real estate; pushed the tab strip + trade cards below the fold.

**Fix** in `assets/css/player-panel.css` `@media (max-width: 768px)`:
- Changed `.pp-profile` from `flex-direction: column` to `row` with `flex-wrap: wrap` and `align-items: flex-start`. The three children get explicit `order:` so they reflow as: avatar (order 1, left) + FANTASY POINTS block (order 2, fills remaining width on row 1, vertically centered) + the rest of player info (order 3, `flex: 0 0 100%` so it wraps onto row 2 as a full-width band).
- Bumped avatar from 48px back up to 72px so it has visual weight beside the FP value.
- Removed the duplicate `.pp-avatar { width: 48px }` override that lived later in the same media block (was inadvertently overriding the new size).
- Removed `border-top` + `padding-top` on `.pp-ktc` (they were defensive against the old column layout where the FP block was at the bottom).
- Reduced `.pp-value-val` from 28px to 26px so the number doesn't overflow when the avatar takes 72px on a 393px viewport.

Net effect: kills an entire ~80px vertical band. Tab strip + trade cards lift up into the viewport without scroll.

### 4. Rankings By Analyst table — 5 analyst columns invisible on mobile

The analyst-comparison table is built at desktop widths with `min-width: 1100px`. On a 393px iPhone viewport, the analyst rank cells were either off-screen-right (requires horizontal swipe most users don't realize is available) or showing as empty space between Player on the left and Team logo on the right.

**Fix** in `rankings.html`:
- JS (`_analystHeaderCols` + `renderAnalystHeaderRow`) now outputs **both** label spans per `<th>`: `<span class="th-full">Ryan</span><span class="th-short">RYA</span>`. CSS hides one or the other based on viewport. Short labels are first 3 chars uppercase (RYA / THE / JOH / AND / THO + Tm + Avg) — uniquely identifiable, never collide.
- CSS `@media (max-width: 768px)` block: dropped the table's 1100px `min-width` so it contracts to viewport, switched to `table-layout: fixed`, set compact column widths (Player auto / Team 30px / each analyst 34px / Avg 42px) so all 5 analyst cells + Player + Team + Avg fit on a ~390px screen WITHOUT horizontal scroll. Reduced cell padding to 5px 3px and font-size to 11–12px. Player names get `white-space: normal` so long names wrap to 2 lines instead of forcing a horizontal scroll. Bipolar heat tints (green = best rank in row, orange = worst) survive unchanged.
- Sticky thead positioning unchanged — header still pins to the top while you vertical-scroll the body.

### Cache tokens bumped

- `assets/css/player-panel.css ?v=1779990000` → `?v=1780200000` (across all 7 pages + `templates/page-template.html`)
- `assets/js/data-bootstrap.js ?v=1778680027` → `?v=1780200000` (same set)
- `rankings.html` is the page itself — no separate cache token needed for the inline `<style>` + `<script>` edits

### Audit status

`python scripts/check-colors.py` — CLEAN across 24 files.

### Companion artifact

`docs/analyst-heuristics-review.html` — standalone interactive doc for the 14 hand-tuned constants flagged for analyst review. localStorage-backed checkboxes + textareas; "Copy summary" button produces paste-ready markdown for the developer to apply. Built earlier in the session to make the analyst-feedback handoff actionable.

---

## 2026-05-17 (third session) — Punch-list close-out: canonical brand.css migration + dead-token cleanup

Pure cleanup session before the next mobile-issues phase. Closed every tractable punch-list item; remaining open items are blocked on external input (1QB scrape SEED_USERS, analyst-feedback heuristics) or explicitly deferred-by-design in the source.

### 1. Inline `:root` duplicates migrated to canonical `brand.css`

Every page now reads brand color tokens from `assets/css/brand.css` as a single source of truth. The 5 HTML pages (`index`, `trade-calculator`, `adp-tool`, `my-leagues`, `tiers`) previously duplicated the entire `:root` + `[data-theme="light"]` blocks inline; each duplicate had to be kept manually in lockstep with `brand.css`. Now removed.

- **`brand.css`**: added two tokens that had only existed in page-local duplicates — `--orange: #e8732a` (used by tiers' buy/sell badges; check-colors.py already accepted it) and `--muted2: var(--white)` (alias used by 239 sites across files).
- **`tiers.html`**: deleted lines 16-58 (entire inline brand block — both `:root` and `[data-theme="light"]`).
- **`adp-tool.html`**: deleted lines 33-64 (entire inline brand block).
- **`index.html`** and **`my-leagues.html`**: shrunk the inline `:root` + `[data-theme="light"]` blocks down to only the 3 page-specific texture tokens (`--tex-url`, `--tex-size`, `--tex-opacity`). All brand-color duplicates removed. The texture data URLs (388 KB combined per page across dark + light) had to stay because they're literally embedded image data backing `body::before`.
- **`trade-calculator.html`**: removed BOTH the brand duplicates AND the texture tokens — verified `body::before` doesn't exist anywhere in this page, so `--tex-url/size/opacity` were dead code defining ~388 KB of unused inline base64 image data. File shrunk from 571 KB → 183 KB.

Surgery technique: standard Edit for the 2 small pages where the data URL was absent; `sed -i` line-range deletes for the 3 pages with multi-hundred-KB texture URLs that exceed the Edit tool's input window.

### 2. data-bootstrap.js migration — verified complete

The README punch-list item "Migrate remaining 3 pages to data-bootstrap.js — still to migrate: adp-tool, my-leagues, index" turned out to be stale. Verified by code inspection:

- `adp-tool.html:932-970` — already uses `fpts:data-ready` listener. Only page-specific work: extra `data/adp-prev.json` fetch (intentional) + `_applyAdpPayload`/`_applyAuctionPayload` aliases for `setYear()` re-application.
- `my-leagues.html:7656-7695` — already uses `fpts:data-ready`. Page-specific work: SLEEPER_IDS hydration from FP_VALUES + page init function calls (`applyFilters`, `buildPickSlots`, `renderAll`, `renderTiers`).
- `index.html:5855-5985` — already uses `fpts:data-ready`. Page-specific work: SLEEPER_IDS hydrate + `_buildTradesFromMvs` to populate the global TRADES array.

Confirmed zero hand-rolled `fetch('data/*.json')` calls remain in any HTML file (grep for `fetch\(['"]data/(values|adp|auction|picks|mvs|articles|pick-availability)\.json` returns no matches across all `.html`). All 7 pages run through `data-bootstrap.js`.

### 3. Trade corpus verification — code-path verified

Punch-list item "Verify all five player modals display real recent trades" — confirmed by tracing the full chain:

1. **Source**: `data/mvs.json` per-player `recentTrades` arrays (generated by `sync-mvs.py` from local CSV)
2. **Hydrate**: `data-bootstrap.js:186` writes `target.recentTrades = mvs.recentTrades` on every `FP_VALUES[name]` record
3. **Build**: `player-panel.js:_buildTradesFromMvs` (line 688) iterates `MVS_PAYLOAD.players[*].recentTrades`, deduplicates by transaction_id, returns normalized `[{id, date, qb, players, picks, ...}]` array
4. **Cache**: `_trades()` lazy-builder (line 183) returns global `TRADES` if non-empty; otherwise calls `_buildTradesFromMvs` and caches on `global.TRADES` + `_tradesBuilt` flag
5. **Render**: drawer Trades tab fills via `tradeCardHtml` for trades involving the active player

Per-page coverage: `index.html` has its own `_buildTradesFromMvs` mirror in the page bootstrap (so the cross-page handoff consumer + DB search find TRADES already populated); `trade-calculator`, `tiers`, `adp-tool`, `my-leagues` rely on the panel's `_trades()` lazy build. Same data, same renderer.

### 4. Cache-token bump

`brand.css` got new tokens (`--orange`, `--muted2`), so its cache-bust query string was rolled from `?v=1779990000` to `?v=1780100000` across every consumer: `index.html`, `trade-calculator.html`, `tiers.html`, `adp-tool.html`, `my-leagues.html`, `rankings.html`, `formulas.html`, `templates/page-template.html`.

### 5. Punch-list items deferred-by-design (closed, not implemented)

- **loadStandings orphan DOM IDs.** Cleanup item from the prior session's handoff. The source comment at `my-leagues.html:6601-6604` documents that `standings-content` / `standings-loading` / `standings-section-meta` are intentionally unscoped because only one league dashboard's standings view is active at a time. Refactor to scoped IDs would touch ~10 sites with zero functional benefit and no browser-test safety net.
- **Pedantic `opacity:` → `rgba()` conversion (~50 leaf elements).** Discarded. The conversion would lock the alpha-applied color to `rgba(255,255,255,X)` literally, breaking light theme — `var(--white)` flips between `#ffffff` and `#111111` depending on theme, `rgba(255,255,255,X)` does not. CLAUDE.md rule #2 already permits leaf-element opacity.
- **`my-leagues.html` inline-style cleanup (~280 occurrences).** Diminishing returns. `docs/ml-inline-style-inventory.md` (already in the repo) marks itself "historical snapshot, superseded" — Phase A already migrated the high-frequency patterns. Remaining static residue is overwhelmingly 1-off; top repeated declaration sets are SVG `fill-rule:nonzero; fill:var(--black)` (13×, can't refactor) and `display:none/block` (JS toggles, must stay inline).

### 6. Punch-list items still blocked on external input

- **1QB scrape coverage expansion** — needs new SEED_USERS list for `sleeper_dynasty_adp/scripts_or_notebooks/01_ingest_historical.py`. Cannot proceed without user-supplied 1QB-active Sleeper usernames.
- **Analyst feedback loop on 14 flagged heuristics** — waiting on analyst recommendations to update `formulas-content.js` + `docs/FORMULAS.md`.

### Cache tokens bumped this session

- `brand.css ?v=1779990000` → `?v=1780100000`

### Audit status

`python scripts/check-colors.py` — CLEAN across 24 files.

---

## 2026-05-17 (second session) — Site-wide alignment audit + branding consistency + governance + weekly stats (9 commits)

Themes: every table and drawer-tab now follows one centering rule; every bright-colored fill uses white text (no more `color: #111` on a brand-color background, no more `opacity:` on a container that dims a colored child); the alignment + branding rules are now machine-enforced by `scripts/check-colors.py` wired into `push.bat`; and the drawer Player Stats tab gained a long-deferred weekly-breakdown feature.

### 1. Rankings + tiers alignment + header shortening (`b92c8e3`)

User flagged columns looking "off" on the rankings page (headers left-aligned, numeric data right-aligned — visible offset). Root cause: `.rk-table thead th { text-align: left }` had higher CSS specificity than `.rk-table .col-num { text-align: right }`, so headers stayed left even with the column-class applied. Fix: change `thead th` to `text-align: center` + `td` default to `text-align: center` + `.col-num` to `text-align: center`. Player name column overridden back to left via `.col-name` + `th[data-col="name"]` attribute selector. Same pattern applied to `tiers.html`. After centering shipped, columns still felt "spread out" on wide monitors because long headers (`TRADE VALUE`, `POS RANK`, `CURRENT ADP`, `AVG RANK`, `CHANGE`) set the column width while short numeric data floated centered in oversized cells — fixed by shortening header labels to `Val / PRK / ADP / Avg / Chg` (matches the FantasyPoints Data reference convention of short abbreviations).

### 2. My Leagues alignment + Standings wiring + per-position MPX% (`bd0e8c2` + `89953f8`)

Five tables on the My Leagues page (Roster / Picks / Waivers ×2 / Standings) all had the same pattern as rankings — headers forced left, numeric data inherited left. Same fix: `thead th` and `td` both centered, padding made symmetric (`9px 6px` not `9px 12px 9px 0` — asymmetric padding skews centered content), `:nth-child(2)` overrides keep Player / Pick / Team columns left.

While auditing My Leagues, discovered **`loadStandings` was complete dead code** — defined but never wired into the UI. The function had a fully built data layer (rosters, users, matchup-week scoring, archetype scoring with composite formula), rendering logic (sortable table + Position Rankings cards), and CSS classes — just no button to invoke it. **Wired it up as a 3rd tab** next to Trade History / Waivers via a new `data-mode="standings"` branch in `mlHistorySetMode`. The handler injects the DOM scaffolding the function expects (`#standings-content`, `#standings-loading`, `#standings-section-meta`) into the shared content container before calling `loadStandings(leagueId)`.

Two refinements requested after the initial standings wiring:

- **MPX% column → Max PF**. The original MPX% column (Points For ÷ Max Possible Points × 100) is team-level lineup efficiency — not useful in a standings comparison. Swapped to the raw Max PF value Sleeper exposes via `r.settings.fpts_max` (the team's optimal-lineup ceiling including bench contribution). The efficiency MPX% still displays in the Position Rankings card header as contextual info.
- **Position labels rendered as `.pos-pill` badges**, both in the Position Rankings cards and the standings table column headers. Previously rendered as colored TEXT on dark bg (per-position hex via inline style) — looked muted compared to the filled-pill treatment used elsewhere on the site. Swapping to `.pos-pill.QB|RB|WR|TE` from brand.css gives the bright-filled look everywhere.

**Per-position MPX% (new formula).** User requested: of your team's Max PF, what share comes from each position group? Implemented as a per-team `mpxByPos = { QB: %, RB: %, WR: %, TE: % }` computed via optimal-lineup simulation. For each week per team:
1. Build sorted list of all roster players by points scored that week (descending).
2. Walk `league.roster_positions` in order, skipping `BN / IR / TAXI` slots.
3. For each starter slot, assign the highest-scoring unassigned eligible player (FLEX = RB/WR/TE, SUPER_FLEX = QB/RB/WR/TE, REC_FLEX = WR/TE, WRRB_FLEX = RB/WR).
4. Sum the assigned player's points into the bucket keyed by the player's actual position (a WR in FLEX still counts as WR).

Result normalized so QB + RB + WR + TE ≈ 100% (any K/DEF contribution excluded from the four-position breakdown). Displayed as a third stat block in each Position Rankings card alongside Value Rank and Pts Rank.

Also added CSS for `.ml-standings-sort-*` (Sort by row above the table) — the classes were referenced in JS but had zero CSS rules, so the buttons rendered as raw browser-default `<button>` elements (light grey rounded rectangles with dark text). Mirrors the `.ml-history-tab` pattern (transparent bg + white outline + Kanit italic + red-active).

`89953f8` was a follow-up fix: `.ml-tbl-th-tight { opacity: .45 }` was compounding through the `.pos-pill` spans inside the table headers, making the standings header pills render duller than the same pills in the Position Rankings cards above. Converted the parent's muted-label fade from `opacity: .45` → `color: rgba(255,255,255,0.45)` so the alpha applies to the label text only, not to the child pills.

### 3. Site-wide branding consistency: white text on every bright fill (`096c80d`)

Found two different position-pill text-color conventions across the site: most surfaces (canonical `.pos-pill` in brand.css + duplicated `.pos-pill` blocks in 5 HTML pages + `.tier-badge.t-*` in tiers.html + various inline-styled chips) used dark text (`color: #111` / `color: var(--pos-qb)` resolving to dark) — looked dim. Two outlier surfaces (`rankings.html .pos-badge` and `my-leagues.html .ml-lr-bar-seg`) used white text — looked bright and matched what the user called "the brighter version."

Decision: **standardize on white text everywhere** for vibrant, consistent branding. Architectural fix:

- `brand.css` `:root` dark-theme tokens `--pos-qb / --pos-rb / --pos-wr / --pos-te / --pos-k / --pos-pick` flipped from `#111111` → `#ffffff`. Light-theme already used `#f0f0f0` so unchanged.
- Same flip in all 5 inline `:root` duplicates (index, trade-calculator, adp-tool, my-leagues, tiers).
- Hardcoded `color: #111` swept and replaced with `var(--white)` in 30+ rules across `brand.css` (.icon-btn.active), `mvs-extras.css` (.mvs-vol-hot/warm), `heatmap.css` (.hm-flash-label), `legend.css` (.lg-trigger), `tiers.html` (8 tier-badge variants + 5 pos-pill rules), `adp-tool.html` (.controls-btn/.date-presets/.icon-btn/.box-col-header/.box-row-head/.chip/.drawer-btn/.pp-fp-signin/.hm-flash-label active states), `rankings.html` (.rk-analyst-pos-btn.active + .rk-min / .rk-max bipolar heat tints), `formulas.html` (.fm-prov-chip), `index.html` + `trade-calculator.html` + `my-leagues.html` (inline `.mvs-vol-warm` duplicates), plus a JS-inline `color:#111` in my-leagues' posColor template.
- Opacity-compounding bugs fixed in 5 places: `.side-total` / `.ml-calc-side-total` (parent opacity was dimming the red value inside), `.adp-tab` / `.rk-mode-tab` (parent opacity at .45 dimming the tab labels), `.tier-badge.t-am`. All converted from `opacity: .X` to `color: rgba(255,255,255,X)` (or rgba on bg for the tier-bsh chips).
- **Codified the rule.** New "THE BRANDING HARD RULES" comment block at the top of `brand.css` (5 numbered rules: white text on bright fills / never opacity on parent with colored children / tokens are source of truth / vibrant by default / check-colors.py must stay CLEAN). Updated brand.css §7 BIPOLAR HIGHLIGHTS docs to reflect the new rule.
- `CLAUDE.md` gained a "Branding" section (the rules) plus a sibling "Recipes for new components" section with copy-paste-ready CSS for tables / pills / badges / .active button states / drawer tabs / section toggles / muted text.

Cache tokens bumped to `?v=1779990000` on `brand.css` + `mvs-extras.css` + `heatmap.css` + `legend.css` across all 7 consumer pages.

`ed954ba` follow-up: caught 3 remaining cases where a brand color was being rendered at reduced opacity (the SAME pattern but applied to colored elements instead of white text). `.fm-src-link` (orange link at `opacity: .75`), `.tier-bsh.checking` (green bg at `opacity: .65`), `.tier-bsh.hold` (orange bg at `opacity: .8`). All converted to `rgba()` on color/bg so the white text inside stays full-bright. Added `(232, 115, 42)` (the tiers-specific `--orange`) to `LEGIT_RGBA_RGB` in `scripts/check-colors.py`.

### 4. Drawer Player Stats centering (`8fa45d2`)

The weekly stats table inside the Player Stats tab on the shared drawer (used on every page) was the worst remaining alignment drift — built with inline `style="..."` strings in `player-panel.js` `renderPlayerStats`, every `<th>` hardcoded `text-align: left` and every `<td>` had no alignment. Refactored 3 inline-style constants → 7 well-named ones (`_thBase`, `thStyle`, `thStyleName`, `_tdBase`, `tdStyle`, `tdNum`, `tdName`). Year column emits `thStyleName / tdName` (left + zero left-padding). Numeric columns emit `thStyle / tdNum` (centered, symmetric `6px` padding). Muted header color converted from `color: var(--muted) + opacity: .45` → `color: rgba(255,255,255,0.45)` per the brand rule. `.tf-side-val` (Trade Finder side totals) also gained `text-align: center`. Cache bumps for player-panel.{js,css} to `?v=1779990000` across all 7 pages.

### 5. Index MVS extras + Top Risers/Fallers headers (`d82af75`)

Closes the alignment audit. `mvs-extras.css` got `text-align: center` on `.mvs-extras-cell` (propagates to all 3 child text rows — label / value / diff) plus `justify-content: center` on `.mvs-rk-row` (centers the contributor rank chips). Three `opacity:` rules converted to `rgba(255,255,255,X)`. `index.html` `.value-chart-title` gained `justify-content: center` (it's a flex container, so `text-align` wouldn't have worked) — centers the "TOP RISERS" / "TOP FALLERS" labels inside their boxes.

### 6. Governance layer — 4 mechanisms (`6b6705e`)

Answers "how do we make every new page / drawer / tab follow these rules exactly — is it a build structure rule?" There's no build pipeline on this site (pure static HTML/CSS/JS, GitHub Pages), so enforcement comes from 4 mechanisms working together:

- **`templates/page-template.html`**: added a BRANDING + ALIGNMENT RULES box as the FIRST thing in the top comment block — anyone copying the scaffold sees the 5 rules before anything else. Bumped 3 stale cache tokens (brand.css, heatmap.css, legend.css) to current generation.
- **`scripts/check-colors.py`**: extended the existing hex-drift audit with two new lint patterns:
  1. **dim-text-on-bright-bg** — `color: #111` (or `#111111` / `#000` / `#000000`) inside a CSS rule whose body has `background: var(--pos-*-bg) / var(--red) / var(--green) / var(--yellow) / var(--orange)` (or the literal brand hex).
  2. **opacity-on-pill-with-bright-bg** — `opacity: < 1` on a selector whose LAST simple-selector matches `pill / badge / chip / bsh / vol- / .active` AND the rule body has a bright fill.

  Heuristic refinements: only flags the LAST selector segment (so `.X .label` doesn't trip — `.label` is a leaf child). Skips `:hover / :focus / :disabled / @keyframes` (state transitions). Skips selectors with `.X` or `-X` for X ∈ {cold, cool, muted, dim, empty, disabled, placeholder, archived, na} (class name explicitly signals muting). Tested with 7 deliberate cases — all expected FLAG/PASS outcomes. Full repo still audits CLEAN.

- **`push.bat`**: added a brand-audit gate after the changes-detection step. If `check-colors.py` returns nonzero, push aborts with `"BRAND AUDIT FAILED — fix the drift above and rerun push.bat."` Drift now caught at deploy time, not days later. `push.bat` is gitignored / local-only so this change stays on the dev machine, but documented in this changelog.
- **`CLAUDE.md`**: added a "Recipes for new components" section with copy-paste CSS for: tables (centered headers + data, name column left override), pills/badges (use `.pos-pill.QB` directly, never `color: #111`), `.active` button states (`background: var(--red); color: var(--white)`), drawer tabs (reuse the inline-style constants from `renderPlayerStats`), section toggles (`.ml-section-toggle-btn` underline, `.ml-history-tab` pill, `.rk-mode-tab` mode), and muted text (always `color: rgba(255,255,255,X)`, never `opacity:` on a parent with colored children).

### 7. Drawer Player Stats weekly breakdown (`3f1afda`)

Deferred feature from Phase 2 — user wants each Year cell in the Player Stats table to be clickable, expanding inline to show every week's production (regular season + playoffs).

Three new module-level helpers in `player-panel.js`:
- **`_weeklyStatsCache`** — keyed by `${sleeperId}_${year}`. First click fetches, subsequent clicks expand instantly.
- **`_fetchWeeklyStats(sleeperId, year)`** — fetches both regular + post-season in parallel via the existing Sleeper endpoint pattern (`api.sleeper.com` primary, `api.sleeper.app` fallback) with `grouping=week`. Merges + sorts so regular weeks come first, then playoffs.
- **`_renderWeeklyRowsHtml(weeks, cols)`** — emits `<tr class="pp-weekly-row">` rows. Slightly smaller font + `rgba()`-muted text (not `opacity:` — preserves children) so weekly rows read as supplementary to the year row above. Playoff weeks get a bright orange "PLAYOFF" chip (white text on `var(--red)`) after the week number.
- **`_toggleWeeklyExpand(yearCell, sleeperId, year, cols, colCount, capturedName)`** — collapse/expand logic with transient loading row + async-guard against player switches.

`renderPlayerStats` wires it up by adding `cursor: pointer + chevron + data-pp-year` to each year cell, then attaching `addEventListener('click')` after `innerHTML` is set so the handler closes over `cols / sleeperId / targetName` cleanly (no inline `onclick` strings, no globals).

Async-guard per `CLAUDE.md` §1: click captures `_currentPanelPlayer.label` at fetch time. Both `.then()` and `.catch()` check it on resolution and bail if the user switched — the late response can't overwrite the new player's tab. Cache bump `player-panel.js?v=1780000100` across all 7 pages + template.

### Files touched this session

- `rankings.html`, `tiers.html` — alignment fix + header shortening (Phase 0)
- `my-leagues.html` — alignment fix for 5 tables, Standings tab wiring, per-position MPX%, sort-button styling, opacity-compounding fix (Phases 1 / 1.5 / 1.6 / 1.7)
- `assets/css/brand.css` — token flip, hard rule comment block, `.icon-btn.active` text + BIPOLAR HIGHLIGHTS docs
- `assets/css/mvs-extras.css` — `.mvs-vol-hot/warm` + `.mvs-extras-*` centering + rgba conversions
- `assets/css/heatmap.css` — `.hm-flash-label` text
- `assets/css/legend.css` — `.lg-trigger` text
- `assets/css/player-panel.css` — `.tf-side-val` centering
- `assets/js/player-panel.js` — Player Stats refactor + weekly stats breakdown
- `index.html`, `trade-calculator.html`, `adp-tool.html`, `rankings.html`, `tiers.html`, `my-leagues.html`, `formulas.html` — `:root` token flips (where applicable), hardcoded `#111` sweep, cache token bumps
- `scripts/check-colors.py` — 2 new lint patterns + `--orange` rgba in `LEGIT_RGBA_RGB`
- `push.bat` — brand-audit gate (local file, not committed)
- `templates/page-template.html` — BRANDING + ALIGNMENT RULES comment block + cache token bumps
- `CLAUDE.md` — Branding section + Recipes for new components

---

## 2026-05-17 (first session) — Calc bug-fix arc + Formulas page (12 commits)

Two distinct shipments in one session: a chain of fixes that unblocked the trade calculator after a user found multiple bugs while testing, then a brand-new Formulas page that catalogs every formula on the site for data-analyst hand-off.

### 1. Compare-player async-race fix (`c164944`)

User found that comparing two players in the shared drawer was showing the same Sleeper stats for both. Root cause: `renderPlayerStats` in `assets/js/player-panel.js` fires 6 Sleeper season fetches in parallel — when the user swapped players mid-load, late-arriving responses for player A clobbered player B's stats container. Same race in the years-of-experience fetch.

Fix: capture the target player at call time, bail in any `.then` / `.catch` if `global._currentPanelPlayer.label !== targetName`. Pattern documented in `CLAUDE.md` for future panel tabs. Cache bump `player-panel.js?v=1778985630` across all 6 pages + page-template.

### 2. Trade calculator pick-handling overhaul (8 commits, `2e3b797` … `1677df9`)

User found: "you can't search draft picks in the trade calculators". Investigation surfaced **five stacked bugs**, fixed one at a time:

- **Pick value object shape mismatch** (`2e3b797`): `getAllAssets` was treating `PICK_VALUES[key]` as a flat number, but data/picks.json ships `{value, valueSf, valueTep}` objects. Added `_pickNumericValue(rec)` extractor + `_derivePickKey(name)` parser; `addAssetToSide` now stores `pickKey` so format toggles re-resolve picks live.
- **PICK_VALUES never reached calc page** (`0adea20`): calc's `let PICK_VALUES = {}` was never mirrored to `window`, so `data-bootstrap.js` populated a different object. Zero picks ever appeared in search. Added the missing mirror.
- **Format toggle didn't re-render rows** (`36d7ffd`): `onchange="recalc()"` only updated bottom totals, not per-row asset displays. Switched to `renderAll()`.
- **Reset All Filters + presets silently dying** (`8017154`): `renderPickTags()` threw a TypeError on the missing `#pick-tags` element (legacy UI removed). The throw killed `applyFilters()` mid-execution → chip bar never refreshed. One null-guard fixed both Reset and Presets.
- **Visible filters never drove calc values** (`50a3b14`): the page has two sets of format selectors. The visible `f-*` filters at top filter trade history; the calc-value `fmt-*` selectors are `display:none`. All calc math read from the hidden set. Wired `_calcFmt(visibleId, hiddenId, default)` helper through `getMultiplier` and `_pickNumericValue` so visible filters drive the calc.
- **2026-2028 picks invisible** (`1677df9`): `data/mvs.json` ships 60 picks for 2026/27/28 and `data-bootstrap.js` already merged them into `PICK_VALUES` — but `_pickNumericValue` didn't know about MVS shape's `value1qb` field, and `adjVal` only re-resolved picks with a stored `pickKey`. Added value1qb branch + `_derivePickKey` fallback for legacy/handoff picks.

### 3. Cross-page handoff bug fix (`4a6a9d4`)

Trade calculator's `_fptsCalcCurrentTrade` and DOMContentLoaded restore handler both referenced a nonexistent `tradeState` variable. Page state actually lives in `sides[]`. All 6 references guarded by `typeof tradeState !== 'undefined'` (always false) so they silently no-op'd. Effects: "Open in Calculator" from My Leagues dropped the trade payload; "Open in Database/My Leagues/ADP" from calc shipped empty sides. Renamed to walk the `sides` array properly; preserved `pickKey` end-to-end.

### 4. Dead code cleanup (`e456540`)

149 lines removed from `trade-calculator.html`: `tradeSearchInput`, `tradeSearchKey`, `tradeSearchAdd`, `clearMainSearch`, `removeTradeSearchAsset`, `highlightMatch`, `showTab` (combined trade-history search bar — UI was removed in an earlier refactor, JS forgotten), plus `buildPickSlots` / `addPick` / `removePick` (legacy pick-builder). Several had latent bugs (`a.label` on assets with only `a.name`; null-pointer on `#pb-round`) that try/catch had been swallowing.

### 5. New Formulas page (3 commits, `df68e8c` … `f8cd9a0`)

User asked for a site-wide inventory of every formula / threshold / heuristic, suitable for hand-off to data analysts:

- **`df68e8c`**: `docs/FORMULAS.md` — 1317-line markdown catalog. 56 entries across 12 domains + magic-numbers glossary + 14 open heuristics flagged for analyst review. Each entry has file:line, verbatim math, inputs, output, notes.
- **`b2c08d8`**: `formulas.html` + `assets/js/formulas-content.js` + `assets/js/formulas.js`. New top-nav page (added "Formulas" link to all 7 pages — 6 existing + page-template). Sticky TOC sidebar + search bar + per-domain cards. Search across label / location / inputs / math / notes; sticky-scroll active TOC link tracks the section in viewport.
- **`f8cd9a0`**: enriched every entry with 4 new fields — `provenance` (categorized origin chip with brand color: Hand-tuned / Derived from data / External standard / Manual curation / Site convention / Unknown — analyst input requested), `example` (concrete worked input → output trace in green-tinted block), `related` (cross-link chips that smooth-scroll to connected entries with brief flash), `whyThisNumber` (yellow-tinted callout on magic-numbers + heuristics with actual reasoning or "Analyst input requested" where origin can't be verified). Plus a "View source on GitHub" deep-link from every file:line.

Maintenance discipline added to `CLAUDE.md`: any formula change must update both `docs/FORMULAS.md` AND `assets/js/formulas-content.js` in the same commit. No drift-detector script for this — manual.

### Files touched this session

- 7 commits to `trade-calculator.html` (pick-handling overhaul + handoff fix + dead code)
- 1 commit to `assets/js/player-panel.js` + 6 cache bumps for the async-race fix
- 3 commits creating new files: `docs/FORMULAS.md`, `formulas.html`, `assets/js/formulas-content.js`, `assets/js/formulas.js`
- 7 nav-link updates (each existing page + page-template for "Formulas" link)
- `CLAUDE.md` extended with formulas dual-file sync rule

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
