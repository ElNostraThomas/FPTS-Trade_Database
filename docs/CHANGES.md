# Session-by-session changelog

Notable changes per work session. Newest first. For the live punch list and
"resume where we left off" guidance see [`../README.md`](../README.md). For
the operator manual see [`WORKFLOW.md`](WORKFLOW.md).

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
