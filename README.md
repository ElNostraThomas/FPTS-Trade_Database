# Fantasy Points Front Office — Session Handoff

A static fantasy-football site deployed via GitHub Pages from `main`.
**Ten HTML pages, all live and shipping:** `index.html` (trade DB),
`trade-calculator.html`, `compare.html` (player comparison),
`my-leagues.html`, `live-draft.html`, `mock-draft.html` (AI-personality
mock drafts), `tiers.html`, `adp-tool.html`, `rankings.html`,
`formulas.html`.

Full operator manual: [`docs/WORKFLOW.md`](docs/WORKFLOW.md).
Session-by-session changelog: [`docs/CHANGES.md`](docs/CHANGES.md).
This file is the **resume-where-we-left-off** doc.

---

## Where we are (end of 2026-05-23 — sixteenth session)

**Mock-draft + live-draft card parity ship + punch-list final cleanup + Admin Scratchpad legend docs.** Presentation-day session. Inherited an open punch list of 6 actionable items; closed the actionable ones, marked the rest as external-blocked or deferred so the operator has a clean state heading into the demo. 7 substantive commits + 1 data-sync auto-commit between sessions.

### What shipped

- **Mock-draft + live-draft pick-card parity** (`207724a` + `6678dda` + `be9c1af`). Bundled three asks the user had been carrying: (1) both pages' cells should read as identical to the ADP `.box-card` recipe, (2) keep the live-draft trade icon but reposition it between the two coins, (3) add an above/below-ADP indicator chip on each completed pick.
  - **Mock-draft was the smaller delta** (`207724a`) — cells already lifted `.box-card` recipe with both coins; just needed the new `.card-delta` chip in `.card-top` next to `#{pickNo}`. ±5 threshold mirrors live-draft `_pickDelta` so VALUE (green `+N`) / REACH (red `−N`) / ON ADP (muted `·`) land consistently. Uses `player.rawAdp` (the source ADP) so the comparison matches what consumers see on adp-tool / rankings, not the scoring-shifted internal value.
  - **Live-draft was the bigger rebuild** (`6678dda`). `.ld-cell` height bumped 76 → 100px; new `.ld-cell-team-logo` (bottom-left, 32px) + `.ld-cell-hs` (bottom-right, 40px) coins lifted from adp-tool; `.ld-cell-meta` spacer preserves a consistent bottom band; `.ld-cell-name` got `padding-right: 44px` to reserve room for the headshot coin. The existing `.ld-cell-traded` chip relocated from absolute bottom-right to center-bottom between the new coins (`left:50%; transform:translateX(-50%); z-index:2`). New `.ld-cell-delta` chip in `.ld-cell-top` driven by `_pickDelta()` with the per-draft `fmtKey` computed once at the top of `ldRenderBoard`. POS pill + delta chip wrapped in a `.ld-cell-top-right` inline-flex span so flex `space-between` groups them on the right (instead of spreading three direct children across the row). All page-specific modifiers (`.mine`, `.on-the-clock`, `.user-up-next`, `.traded`, `.empty`) preserved unchanged. Empty cells inherit the new height but skip the coins + delta chip (no player to look up).
  - **Mobile follow-up** (`be9c1af`) — the new coins are desktop-sized; without overrides they'd overflow at 64px mobile cell height. Mobile `@media` block now mirrors mock-draft's mobile sizing exactly: cell 72px, hs/-hs-fallback 26×26, team-logo 22×22 with 15×15 img, name `padding-right: 30px`, top font 7px.

- **Punch-list cleanup arc** (`c360190` + `2ea3236` + `6c3bd36` + `3d4eb82`). Four commits across the session brought the open list from 6 items → 4, all of the remaining four either external-blocked or open-ended polish.
  - `c360190` — punch list ADD: original mock-draft-only entry for the card-parity ask.
  - `2ea3236` — punch list EXPAND: scope corrected to cover both mock-draft AND live-draft once the user flagged the latter. Documented the structural delta (`.ld-cell` vs `.box-card`) and noted that `.ld-cell-traded` already existed at line 896.
  - `6c3bd36` — cleanup commit: marked stale **Player Comparison full page** item as `[x]` (actually shipped session 10 as `compare.html`); moved **Bulk tier rename** + **Cross-tier drag** from open queued-next list to a new "Deferred — won't-do unless demand emerges" subsection. Open count dropped 6 → 4.
  - `3d4eb82` — punch list mark: closed the card-parity item with `[x]` once `207724a` + `6678dda` + `be9c1af` deployed.

- **Admin Scratchpad legend documentation** (`58bf7d5`). New "Admin Scratchpad (operator-only)" section added to `assets/js/legend-content.js` under the `'tiers'` page entry. 10 items: Activation flow (`?admin=1` / `?admin=hash` / `?admin=0` URL params + SHA-256 password gate); ⚙ Settings (fine-grained GitHub PAT + the four storage keys); the four override layers (`fpts-tier-overrides` / `-tier-title-overrides` / `-tier-order-override` / `-player-order-overrides`); Publish ⬆ Contents API GET-SHA → PUT pipeline; Stale-CSV defense (157b636); Publish Dry-Run / Diff Preview Modal (b65e102 + 5832be2); Disable button. Cache token bump `legend-content.js ?v=1786400001 → ?v=1787200000` across all 10 deployed pages + `templates/page-template.html` (which was also out-of-date at `?v=1783300000` — opportunistic fix).

- **Formulas + Legend hidden by default — admin-only entry points** (post-wrap-up follow-up). The Formulas top-nav link and the Legend drawer's floating `.lg-trigger` button are now visible ONLY when admin mode is active. Implementation:
  - `admin-tiers.js` IIFE gained a top-of-file init block that reads `fpts-admin-mode` from localStorage; if true, adds `fpts-admin` class to `<html>` (runs in render-blocking <head>, so no flash of admin chrome on non-admin loads). If false, strips the `<option value="formulas.html">` from `.mobile-nav-select` after `DOMContentLoaded` (browsers ignore `display:none` on `<option>`).
  - `brand.css` gained an "ADMIN-GATED UI" section right after the NAV block. Default: `.lg-trigger` + `.nav-link[href="formulas.html"]` set to `display:none !important`. With `html.fpts-admin`: both restored to their original display (`inline-flex` for the trigger, `flex` for the nav link). `!important` is doctrine-legitimate — `.lg-trigger` is mounted programmatically and the default browser display would otherwise win.
  - Direct URL access to `formulas.html` still works (only entry points hidden; the page itself isn't gated). Existing admin-mode workflow (`FPTS Admin.url` shortcut → `?admin=1` → password → activate) lights both surfaces back up.
  - Cache token bumps: `admin-tiers.js ?v=1786600000 → ?v=1787500000` + `brand.css ?v=1782600000 → ?v=1787500000` across all 10 deployed pages + `templates/page-template.html`.

### Override-layer state model (unchanged from session 15, now documented in legend)

Four independent localStorage maps on top of canonical `tiers.csv` + `tier-config.json`. Reference table mirrors the session-15 entry; see `legend-content.js` 'tiers' → "Admin Scratchpad" section for full detail.

### Cache tokens at session close

- `legend-content.js ?v=1786400001 → ?v=1787200000` (10 deployed pages + templates/page-template.html; admin-scratchpad section added)
- `admin-tiers.js ?v=1786600000 → ?v=1787500000` (11 consumers; admin-gated-UI init block)
- `brand.css ?v=1782600000 → ?v=1787500000` (11 consumers; admin-gated-UI CSS section)
- `live-draft.html` inline CSS — page-local, no shared cache token
- `mock-draft.html` inline CSS — page-local, no shared cache token
- All other shared modules unchanged from session 15

### What's queued next

**Open punch list — all blocked or open-ended (4 items):**

1. **Expand the scrape's 1QB coverage** — external-blocked on user-supplied 1QB-active Sleeper usernames for `SEED_USERS`.
2. **`my-leagues.html` inline-style cleanup** — deferred (diminishing returns; remaining ~46 are the `--bar-width` / `display:none` design end-state).
3. **Analyst feedback loop** — external-blocked on analyst recommendations for the 14 original heuristics in `formulas.html`.
4. **Visual polish pass** — open-ended; act on specific issues that surface during use.

**Carryover from session 13 (still open, no change this session):** mock-draft personality weight calibration, Manager Clone archetype (blocked on 1QB SEED_USERS), compare-page UX iteration, prospect-score classifier, NFL draft round/pick (blocked on Sleeper API).

**Deferred — won't-do unless demand emerges:** Bulk tier rename, Cross-tier drag (both closed 2026-05-23).

**Audit:** `python scripts/check-colors.py` — CLEAN across 34 files after every commit.

See [`docs/CHANGES.md`](docs/CHANGES.md) 2026-05-23 (sixteenth session) for full per-commit detail.

---

## Where we were (end of 2026-05-22 — fifteenth session)

**Admin scratchpad hardening + new lookback features + data-correctness sweep.** Continuation session after the fourteenth shipped Phases 1A-4. Closed out 6 of the 7 punch-list items inherited from session 14 (only "Bulk tier rename" + "Cross-tier drag" remain — both flagged low-priority). Also surfaced and shipped a brand-new analytical feature (rank-history lookback) that had been carrying over from session 13 with `data/rank-history.json` sitting orphaned. 8 substantive commits + 2 data-sync auto-commits.

### What shipped

- **Re-created the admin PAT** (punch-list item 1 from session 14). New fine-grained token pasted into ⚙ SETTINGS via the GitHub Pages admin URL. Publish round-tripped successfully (commits `d3bb5c7`, `a468301`, `a98d0cf`, `1e16d75` during initial testing). PAT-persistence fix `ad8ffd8` from session 14 verified — Settings now correctly treats empty token-input on Save as "no change" (defending against Chrome's password-manager value-attr stripping).

- **17 tier-row name canonicalizations** (`773cb17`) — `data/source/tiers/tiers.csv` had 17 player rows using name forms that didn't exact-match `data/values.json`, so their tier table rendered blank (no value, no headshot, no team, no posRank). Categories:
  - 5 punctuation/nickname fixes (`Coltson Loveland → Colston Loveland`, `Nick Singleton → Nicholas Singleton`, `JK Dobbins → J.K. Dobbins`, `TJ Hockenson → T.J. Hockenson`, `Tre Harris → Tre' Harris`)
  - 12 Jr./II/III suffix drops (`Brian Thomas Jr. → Brian Thomas`, `Marvin Harrison Jr. → Marvin Harrison`, etc. — `values.json` strips these)
  - Trending flags preserved on 4 rows that had them
  - Verified post-fix: 0 remaining name mismatches between tiers.csv and values.json

- **values-supplement layer** (`bac9d04`) — Found 3 tier rows genuinely absent from `values.json` (Deebo Samuel, Tyreek Hill, Eli Stowers). Root cause: FP's `/v2/adp/dynasty/nfl` API filters veteran FAs + below-cutoff rookies. Fix: new `data/source/values-supplement.csv` (header-driven: `name, sleeperId, rank, posRank, pos, team, age, ppg, ppgPrior, tier, trend`); new `sync-fp.py:apply_values_supplement()` merges entries after the FP fetch + Sleeper overlay. Sleeper overlay auto-fills age/team/pos/ppg/injury when supplement leaves blank but provides `sleeperId`. Skip-with-log if supplement name is already in FP response (so user can prune the row once FP starts returning that player). Note: `sync-fp.py` itself is gitignored by design (local-only alongside `sync-fp.config.json`) — only the supplement CSV is tracked. Verified on next `push.bat`: all 3 players now in `values.json` with proper data.

- **Admin scratchpad stale-CSV defense** (`157b636`) — Discovered during the Loveland investigation: when `tiers.html` is loaded from `file://` on a desktop folder behind `origin/main`, the page reads the stale local `tiers.csv` and Publish writes that stale state back to GitHub, silently reverting other admin commits. Loveland's row had ping-ponged across `d3bb5c7 / a98d0cf / 1e16d75` because of this exact bug — metadata like `up, buying, Top Target, Dynasty` was added in one session and reverted in the next from a stale page. Fix: `admin-tiers.js publishToGitHub` now does a GET-latest on `tiers.csv` from GitHub, parses it via the new `_parseTiersCsv` helper, applies the user's localStorage overrides via `_applyOverridesToData`, and PUTs the merged result. So even when loaded from `file://` and behind origin, the published CSV is always `(latest GitHub state) + (user's overrides)` — no clobbering. Plus a `_utf8Atob` helper to decode GitHub's base64-encoded content with embedded newlines.

- **`FPTS Admin.url` desktop shortcut** — Belt-and-suspenders for the stale-CSV bug. Points at `https://elnostrathomas.github.io/FPTS-Trade_Database/tiers.html?admin=1` so the operator can stop opening `file://` versions entirely. (Initial shortcut had `?admin=hash` — the SETUP URL — which got fixed in commit `9cec3c3` after the user hit the regenerate-password prompt; URL is `?admin=1` for the activation flow, `?admin=hash` is the one-time setup helper, `?admin=0` disables.)

- **Publish dry-run / diff preview modal** (`b65e102` + brand-audit fix `5832be2`) — Click **Publish ⬆** now fetches GitHub's latest state, builds the merged result via the stale-CSV defense's GET-merge logic, and shows a modal listing every change before any commit fires. Each change rendered with type-specific styling:
  - `⇅` yellow for tier-change (`Caleb Williams: S+ → A+`)
  - `+` green for added player
  - `−` red for removed player
  - `✎` gray for metadata-only change (Trending / Buy-Sell / Priority / Contender / Notes)
  - Tier-config diffs: rename (`✎ Tier S++: "Cornerstone Players" → "Foundation"`) + order change (was/now)
  No-op case ("Your overrides match GitHub's current state — nothing to commit") handled with a Clear-all hint. Cancel or Escape or backdrop-click bails out cleanly; "Publish to GitHub ⬆" runs the existing `publishToGitHub` pipeline. New helpers: `_buildPlayerDiff`, `_buildConfigDiff`, `_openPublishPreviewModal`, `_esc` (inline HTML escape). Brand-audit follow-up: 3 hardcoded hex (`#0a0a0a / #ffd86b / #ff7766`) mapped to `var(--black) / var(--yellow) / var(--red)` so `scripts/check-colors.py` stays CLEAN.

- **Rank-history surface on rankings.html** (`bd61f28`) — `data/rank-history.json` (12 daily rank snapshots, captured by `sync-fp.py` on each `push.bat`) was previously orphaned — no UI consumed it. New shared module `assets/js/rank-comparator.js` parallels `adp-comparator.js` but lighter: single JSON file, daily granularity, dropdown picker instead of calendar grid. The RANK column header on `rankings.html` is now a clickable date picker showing "Rank · May 11 ▾"; the small sort-arrow ▲/▼ moves inline next to the trigger so sort still works. Selecting a date inserts a rank-delta chip next to every row's rank value (▲N green / ▼N red / ● flat) comparing current rank to the historical snapshot. Same chip pattern on the consensus mobile card. Selected date persists to localStorage (`fpts-rankings-rank-compare-date`). New public API: `RankComparator.init/ensureLoaded/getSnapshotDates/getCurrentDate/setCurrentDate/getRankFor/renderTriggerHtml/openPopup/closePopup/changeChipHtml`. body-zoom-aware positioning (mirrors the `adp-comparator` fix from session 13). Legend entry added.

- **Phase 5 — tier section drag-and-drop** (`8bf8ecc`) — Mirrors the Phase 4 row-drag pattern. When admin mode is on, each `.tier-group-header` becomes the drag handle (`draggable="true"` + `data-tier-code` + `cursor:grab` + a ⋮⋮ glyph for discoverability). Drag a header onto another header → drop-position is the hover-target's midline (above = drop before, below = drop after). Source group dims to 0.5 opacity during drag; valid target shows a 3px red top/bottom border on its header. On drop the source `.tier-group` is spliced into place and the new order array is read off the DOM and passed to the new public `AdminTiers.setTierOrder(orderArray)` — which filters unknown codes and re-appends any canonical codes missing from the input so a partial drop can't drop tiers from the display. ▲/▼ buttons stay in place for adjacent-swap convenience.

- **README admin URL doc correction** (`9cec3c3`) — Session 14's Phase 1A description had `?admin=hash` listed as the password challenge. Source of truth is `admin-tiers.js:_handleUrlParam` (lines 127-184): `?admin=1` activates with password check, `?admin=hash` is the one-time setup helper to regenerate `PASSWORD_HASH`, `?admin=0` disables.

### Override-layer state model (unchanged from session 14)

Four independent localStorage maps on top of canonical `tiers.csv` + `tier-config.json`:

| Key | Phase | Shape | What it overrides |
|---|---|---|---|
| `fpts-tier-overrides` | 0/2 | `{ playerName: { tier?, trending?, buySell?, priority?, contender?, notes?, _deleted? } }` | Per-player field edits + soft-deletes + Phase-2 adds |
| `fpts-tier-title-overrides` | 3 | `{ tierCode: "New Title" }` | Tier section header titles |
| `fpts-tier-order-override` | 3 (extended in 5) | `[code, code, code, ...]` | Tier section display order — written by both `moveTier` (arrow buttons) and the new `setTierOrder` (drag-and-drop) |
| `fpts-player-order-overrides` | 4 | `{ tierCode: [name, name, ...] }` | Player order within each tier |

Plus GitHub publish settings: `fpts-admin-gh-token` / `-repo` / `-branch` / `-path`. Plus the mode flag: `fpts-admin-mode`. Plus `fpts-rankings-rank-compare-date` (new) for the rank-history picker's selected date.

### Workflow consolidation

Two-rule operator workflow locked in (simpler than the old "edit in code OR via admin scratchpad" matrix):

| Task | Where | How |
|---|---|---|
| Tier edits (drag players, rename tiers, add/remove) | `FPTS Admin` shortcut on desktop | Double-click → enter password → edit → Publish ⬆ (which now previews the diff first) |
| Code/data edits (anything in a code editor) | Desktop folder | Run `push.bat` |

The shortcut points at the live GitHub Pages URL with `?admin=1`. The stale-CSV defense protects against any remaining `file://` accesses.

### Cache tokens at session close

- `admin-tiers.js ?v=1784700000 → ?v=1786600000` (3 ships: stale-CSV defense, dry-run modal, brand-audit fix, Phase 5; 11 consumers: all 10 pages + `templates/page-template.html`)
- `rank-comparator.js ?v=1786400000` (new module; rankings-only consumer)
- `legend-content.js ?v=1783300000 → ?v=1786400001` (rank-comparator entry; 10 consumers)
- All other shared modules unchanged from session 14

### What's queued next

**Punch list (highest priority first):**

1. ~~**Admin scratchpad legend documentation**~~ — shipped 2026-05-23. New "Admin Scratchpad (operator-only)" section added to `assets/js/legend-content.js` under the `'tiers'` page entry. 10 items: Activation flow, ⚙ Settings PAT, the four override layers (`fpts-tier-overrides` / `-tier-title-overrides` / `-tier-order-override` / `-player-order-overrides`), Publish ⬆ Contents API, Stale-CSV defense, Publish dry-run / diff preview, Disable button. Cache token bumped `?v=1786400001 → ?v=1787200000` across all 10 deployed pages + page-template.html.

**Deferred — won't-do unless demand emerges:**

- ~~**Bulk tier rename**~~ — single-tier rename is sufficient. Closed 2026-05-23.
- ~~**Cross-tier drag**~~ — Phase 4 blocks drag across tier boundaries; current path is the row Edit popover which correctly changes the player's tier letter. Closed 2026-05-23.

**Carryover from session 13 (still open):** mock-draft personality weight calibration, Manager Clone archetype (blocked on 1QB SEED_USERS), compare-page UX iteration, prospect-score classifier, NFL draft round/pick (blocked on Sleeper API), 1QB SEED_USERS expansion, 14 original heuristics analyst feedback, my-leagues inline-style cleanup.

**Audit:** `python scripts/check-colors.py` — CLEAN across 34 files.

See [`docs/CHANGES.md`](docs/CHANGES.md) 2026-05-22 (fifteenth session) for full per-commit detail.

---

## Where we are (end of 2026-05-22 — fourteenth session)

**Admin scratchpad — phases 1A, 1B, 2, 3, 4 shipped end-to-end + two follow-up bug fixes.** New `assets/js/admin-tiers.js` IIFE (1280+ lines) that gates a tier-editing UI behind the URL `?admin=hash` activator + SHA-256-hashed password challenge, lets the operator add/remove/edit players in localStorage, **rename + reorder tier section headers**, **drag-and-drop player ordering within a tier**, and **publish** the resulting `tiers.csv` + `tier-config.json` back to the repo via the GitHub Contents API (one-click PUT, no local git step). Local-only `push.bat` gained a `[0/5] git pull --rebase` step so the next desktop push integrates API-made commits cleanly. 4 substantive commits + 2 data-sync auto-commits.

### What shipped

- **Phase 1A — password gate.** Hidden-by-default activation. URL flags (per `admin-tiers.js` `_handleUrlParam`): `?admin=1` prompts for the password and activates on match; `?admin=hash` is the one-time SETUP helper that prompts for a NEW password and emits the SHA-256 hex to paste into the `PASSWORD_HASH` constant; `?admin=0` disables. Hash comparison via `crypto.subtle.digest('SHA-256', ...)` → hex; correct password unlocks the in-page scratchpad for the session.
- **Phase 1B — GitHub Publish.** Settings cog stores a fine-grained PAT (Contents: Read/write on this repo only) in localStorage. Publish button runs the GET-SHA → PUT-content dance against `data/source/tiers/tiers.csv`. UTF-8-safe base64 via `btoa(unescape(encodeURIComponent(str)))`. Toast confirms with commit SHA.
- **Phase 2 — add/remove players.** "+ Add player" modal (autocomplete + tier picker + buy/sell/dynamic dropdowns). Each row's existing popover gains a "Remove" button. Removes are soft-deletes (`_deleted: true`) in the overrides map so they survive across sessions until republished. Re-render via `fpts:tiers-overrides-changed` event.
- **Phase 3 — tier rename + reorder** (`b0f8e6a`). New `data/source/tiers/tier-config.json` seed (21 tiers, S++ through F-, titles lifted from existing `TIER_DESCRIPTIONS`). `tiers.html` lazy-loads it on startup, falls back to legacy constants if fetch fails. Admin-only ✎ / ▲ / ▼ buttons inline in each tier-divider header — ✎ opens a `prompt()` rename, arrows call `moveTier(code, ±1)`. Both surfaces persist via two new localStorage keys (`fpts-tier-title-overrides`, `fpts-tier-order-override`); merge happens in `effectiveTierConfig()`. Publish now PUTs both `tiers.csv` AND `tier-config.json` when either has overrides. Re-render via `fpts:tier-config-changed`.
- **Phase 3 fix — button visibility** (`462a5d6`). Initial ship colored the ✎/▲/▼ glyphs `var(--red)` over the red-orange tier-header gradient → effectively invisible. Switched to `#111111` on a translucent white pill with a 1px black border per the black-text-on-bright-fill doctrine; bumped 13→14px with padding so they're clearly tappable.
- **Phase 4 — drag-and-drop player reorder within a tier** (`36f7452`). User picked drag over arrows or numeric rank field. Third override layer added: `fpts-player-order-overrides` localStorage map keyed by tier code, value = ordered list of player names. `sortPlayersForTier(code, names)` is now the shared sort — listed names render first in given order, unlisted players append alphabetically so partial reorders never drop rows. Render path: each `<tr>` gets `draggable="true"` + `data-player` + `cursor:grab` when admin is on; each `<tbody>` gets `data-tier`. New IIFE handles `dragstart`/`dragover`/`drop` — dim source row to 0.4 opacity, show red top/bottom border on hover target for drop position, splice via `tbody.insertBefore`, read final order from `tr[data-player]` attrs, persist via `setPlayerOrder`. Cross-tier drag explicitly blocked by a `sameTbody` guard (use Edit popover to change tier letter instead). Publish path: `_buildOverriddenCsv` rewritten to bucket by tier and apply per-tier player order — the published CSV row order now matches what admin sees on the page. `_hasConfigOverrides` and `clearAllOverrides` extended to cover this third override layer.
- **PAT-persistence fix — stop silently wiping saved token** (`ad8ffd8`). Likely root cause of the user's "PAT keeps disappearing" report: the Settings modal pre-filled the input with the saved token, but Chrome's password manager often strips `value=""` from `type=password` inputs. If the user clicked Save without retyping (e.g., just to tweak repo/branch/path), the empty input was interpreted as "user cleared the token" and the PAT was removed from localStorage. Fix: `_ghSettingsSave` dropped the `else localStorage.removeItem()` branch — empty token input on Save now means "no change." The dedicated "Clear token" button is the only path that erases the PAT. Settings modal also rewritten: when a token is already saved, render an empty input with a green `✓ A token is saved on this device. Leave blank to keep it; type a new value to replace.` line and a clarifying placeholder. `autocomplete="off"` → `autocomplete="new-password"` (Chrome ignores "off" but respects "new-password").

### Override-layer state model (end of session)

The admin scratchpad now layers four independent localStorage maps on top of canonical `tiers.csv` + `tier-config.json`:

| Key | Phase | Shape | What it overrides |
|---|---|---|---|
| `fpts-tier-overrides` | Phase 0/2 | `{ playerName: { tier?, trending?, buySell?, priority?, contender?, notes?, _deleted? } }` | Per-player field edits + soft-deletes + Phase-2 adds |
| `fpts-tier-title-overrides` | Phase 3 | `{ tierCode: "New Title" }` | Tier section header titles |
| `fpts-tier-order-override` | Phase 3 | `[code, code, code, ...]` | Tier section display order |
| `fpts-player-order-overrides` | Phase 4 | `{ tierCode: [name, name, ...] }` | Player order within each tier |

Plus GitHub publish settings: `fpts-admin-gh-token` / `-repo` / `-branch` / `-path`. Plus the mode flag: `fpts-admin-mode`.

### Cache tokens at session close

- `admin-tiers.js ?v=1784400000 → ?v=1784700000` (4 ship commits + 1 visibility fix + 1 PAT fix; 11 consumers: all 10 pages + `templates/page-template.html`)
- All other shared modules unchanged from session 13

### What's queued next

**Punch list (highest priority first):**

1. **Re-create the admin PAT** — user lost the old token value (GitHub only shows PATs once at creation). Fine-grained token, repo = `elnostrathomas/FPTS-Trade_Database`, scope = **Contents: Read & write** only. After creation, paste into the ⚙ SETTINGS cog on tiers.html. Old token should be revoked on github.com/settings/personal-access-tokens for a clean slate. Verify the new fix (`ad8ffd8`) actually holds it across Disable + reopen cycles.
2. **Reorder UX for tiers** — current ▲/▼ arrows on the section headers require N clicks to move a tier N slots. If section reordering becomes frequent, add drag-and-drop here too (mirror the Phase 4 row pattern).
3. **Bulk tier rename** — single-tier rename only today. Probably unnecessary, but flag-worthy.
4. **Publish dry-run / diff preview** — Publish is "fire one PUT per file." A pre-flight that shows the operator the upcoming diff before committing would harden the workflow.
5. **Cross-tier drag** — Phase 4 explicitly blocks drag across tier boundaries. Crossing requires also changing the player's tier letter; current path is the row Edit popover. If demand emerges, add it.

**Carryover from session 13 (still open):** mock-draft personality weight calibration, Manager Clone archetype (blocked on 1QB SEED_USERS), compare-page UX iteration, prospect-score classifier, NFL draft round/pick (blocked on Sleeper API), 1QB SEED_USERS expansion, 14 original heuristics analyst feedback, rank-history surface, my-leagues inline-style cleanup.

**Audit:** `python scripts/check-colors.py` — CLEAN across 33 files.

See [`docs/CHANGES.md`](docs/CHANGES.md) 2026-05-22 (fourteenth session) for full per-commit detail.

---

## Where we are (end of 2026-05-21 — thirteenth session)

**Mock Draft page shipped end-to-end + site-wide doctrine cleanup + AdpComparator zoom fix.** 13 substantive commits + 2 data-sync auto-commits, picking up immediately after session 12's compare-page closeout. Three arcs: (1) new `mock-draft.html` page (the **tenth** deployed page) — skeleton → drafting UI → mobile → docs → three iterative AI-personality calibration tweaks driven by user mock-draft testing; (2) doctrine-drift cleanup that closed 26 leftover `color: var(--white)` surfaces on bright brand fills (the 2026-05-20 inversion left a long tail); (3) targeted bug fix for the rankings.html `APR 2026 ▼` calendar trigger that the user flagged as non-responsive — root cause was body-zoom mis-positioning the popup off-screen.

### What shipped

**Mock Draft page** — new top-nav slot between Live Draft and Tiers (`mock-draft.html`). Setup screen (12-team / SF or 1QB / scoring preset / rounds / your slot / personality mix) → drafting UI with live board, BPA rail, player search, status bar, on-the-clock pulse. 5 AI personality archetypes (ADP Value, BPA, My Guys, Need-Based, Positional Scarcity) drive opponent picks via a candidate-pool filter + PICK_AVAILABILITY matrix augmentation + per-candidate composite scoring + softmax sample of top-8 (temperature 0.5).

Phase commits:

| Phase | Commit | What |
|---|---|---|
| 1 | `10b6871` | Skeleton, setup screen, nav linkage (10th deployed page) |
| 2 | `bfe26e1` | AI personality engine + pick simulator — `PERSONALITIES` const, `personalityDraftScore`, `aiPick`, `computeTierScarcity`, `buildPlayerUniverse`, `assignOpponents` |
| 3 | `4caf626` | Drafting UI — board, BPA rail, search, status bar, on-clock pulse |
| 4 | `822b2bb` | Mobile `@media (max-width: 768px)` block from scratch (mobile-first doctrine) |
| 5 | `d9c478b` | Docs — FORMULAS.md §51 + formulas-content.js "mock-draft" domain + legend-content.js 'mock-draft' page entry + README punch-list item + cache token bumps |

Calibration tweaks (driven by user playtesting):

| Commit | What |
|---|---|
| `a641e0b` | **ADP weight bump** (all archetypes +0.10) + **scoring-aware ADP shifts** (`applyScoringAdpShift`) — TEP boosts elite TE ADP into round 1, 6pt TD nudges QB ADP up; raw ADP preserved as `rawAdp` for debugging. |
| `66835b8` | **Quadratic reach penalty** (`reach^1.5 × 0.05`, was linear `× 0.05`) — fixes Drake Maye 1.02 problem where high-value young SF QBs at ADP 25 sneaked into round 1. 5-pick reach now -0.56; 20-pick reach now -4.50. |
| `66b9f85` | Mobile **scroll-lock + board horizontal scroll** fixes for OBS Browser Source mobile viewports. |
| `faa4401` | **ADP-heavy calibration** (third tweak) — pushes ADP weight even harder (`adp_value: 0.85`), tightens candidate-pool windows. Picks now closely track ADP-page startup ordering with personality-driven deviations. |

PICK_AVAILABILITY-matrix-replaces-Monte-Carlo: instead of 5,000-50,000 simulations per pick (per the LLM Handoff Spec at `C:\Users\deons\Downloads\# Fantasy Draft Personality, Prediction & Availability System — Full….md`), the engine reads `data/pick-availability-2026.json` (pre-computed empirical probability matrix derived from thousands of real dynasty drafts). Massive perf + simplicity win. Limitation: matrix is currently 12-team-only; other team counts fall back to ADP-window scoring.

Console debug surface: `MockDraft._aiPick(personalityKey, currentPick, picks)`, `MockDraft._buildUniverse()`, `MockDraft._assignOpponents()` for weight tuning without reloading.

**Doctrine cleanup — white-on-bright drift closed** (`937f3ed`). The 2026-05-20 doctrine inversion (`372f894`) flipped the rule from "white text on bright fills" → "black text on bright fills" but the `dim-text-on-bright-bg` lint detector was removed in the same commit, leaving 26 leftover surfaces still hardcoding `color: var(--white)`. One-shot audit script caught them all; single edit per rule (`color: var(--white)` → `color: #111111`). Covered:

- `index.html` — `.nav-badge`, `.filter-multi option:checked`, `.btn-add-pick`, `.filter-chip`, `.filter-chip-muted`
- `my-leagues.html` — same 5 + `.pp-col-header`, `.ml-pd-avail-trade-btn`, `.ml-tb-sleeper-link`, `.ml-team-mebadge`, `.ml-calc-sleeper-btn`
- `trade-calculator.html` — `.btn-add-pick`, `.filter-chip`, `.filter-chip-muted` (duplicated in two inline blocks)
- `live-draft.html` — `.ld-needs-tag`, `.ld-otc-bar-mine`
- `mock-draft.html` — `.box-col-header.md-col-user`
- `assets/css/player-panel.css` — `.pp-col-header` (shared module, 10-consumer cache bump)

Plus a **cascade case** the single-rule auditor missed but the user flagged directly: the database page's Risers/Fallers rows (`index.html`). `.value-row` gets a bright pos-color background from the bare `.pos-qb`/`.pos-rb`/etc. rule (line 540) composed onto `.value-row.pos-XX`. Child `.value-row-name` and `.value-row-val` rules were hardcoding `color: var(--white)`, producing white text on bright fills. Both child rules now `#111111`. The `.value-row-change.up/.down` trend wrappers were left alone — they wrap `<span class="trend up/down">` which uses brand-bright `#66dd84` / `var(--red)` foreground with text-shadow stroke per the brand.css §5 documented exception.

**AdpComparator zoom fix** (bundled into `44e5e68`). User reported the `APR 2026 ▼` calendar trigger on `rankings.html` couldn't change the month — investigation found `body { zoom: 1.25 }` (from session 12's adaptive zoom ladder) was double-applying to popups mounted on body. `getBoundingClientRect()` returns post-zoom visual coords, but assigning them to `style.left/top` on a body child re-applies the 1.25× zoom, pushing the popup roughly 1.25× too far right and down — off-screen for triggers near the right edge of a wide table. Fix in `assets/js/adp-comparator.js` `openCalendar()`: read `getComputedStyle(document.body).zoom` and divide rect coords by it before assigning. Affects both `rankings.html` (5 selectable months: Dec 2025 through Apr 2026) and `tiers.html` (21 tier-group triggers, same widget).

**Memory** clarifications from this session: ranking lookback is **ADP-only** (the calendar swaps the APR 2026 column value + CHG chip; the RANK column never changes). `data/rank-history.json` exists (10 daily snapshots from 2026-05-11 to 2026-05-20, flat `{ name: rank }` per date) but is **not consumed by any frontend code** — backend-only artifact today. Worth surfacing if the user wants true rank-vs-rank lookback alongside the existing ADP-vs-ADP comparison.

### Cache tokens at session close

- `player-panel.css ?v=1782600000 → ?v=1783100000` (doctrine fix, 10 consumers)
- `adp-comparator.js ?v=1779360001 → ?v=1783200000` (zoom fix, 2 consumers: rankings + tiers)
- `legend-content.js ?v=1782900000 → ?v=1783000000` (mock-draft 'mock-draft' page entry, 10 consumers)
- `formulas-content.js ?v=1782800003 → ?v=1783000000` (mock-draft §51 entry, 1 consumer: formulas)
- All other shared modules unchanged from session 12

### What's queued next

User explicitly flagged the next focus: **player comparisons (`compare.html`) and mock draft (`mock-draft.html`) — both will see extensive iteration**. Open items:

1. **Mock-draft personality weights** — first-pass calibration is in writing (FORMULAS.md §51). Triple-sync rule applies on any tuning: `mock-draft.html` `PERSONALITIES` const + `docs/FORMULAS.md` §51 + `assets/js/formulas-content.js` `mock-draft-personality-scoring` entry + `assets/js/legend-content.js` 'mock-draft' page entry. Tune after running 10+ mocks; current state is ADP-heavy (third tweak).
2. **Manager Clone archetype** — deferred (needs real Sleeper draft history per user, same blocker as 1QB SEED_USERS).
3. **Compare page polish** — page is shipping clean but visual refinements come up; analyst-input punch list is closed but UX iteration is open-ended.
4. **Prospect-score classifier** — replaces `_pcArchetypeLabel(fp)` placeholder on compare.html when prospect/route/coverage data ships.
5. **NFL draft round/pick** — Sleeper API doesn't expose; tile marked `data-pending="nfl-draft-round-pick"`.
6. **1QB scrape `SEED_USERS`** — needs user-supplied 1QB-active Sleeper usernames.
7. **14 original heuristics in `formulas.html`** — external-blocked on analyst recommendations.
8. **Rank-history surface** — `data/rank-history.json` exists but isn't wired into any UI; could power true rank-vs-rank lookback on rankings.html if scope.
9. **`my-leagues` inline-style cleanup** — deferred (diminishing returns; remaining are mostly the CSS-custom-property pattern which is the design end-state).

**Audit:** `python scripts/check-colors.py` — CLEAN across 31 files. (8 remaining white-on-bright hits in `docs/analyst-heuristics-review.html` are intentionally out-of-scope — that's the analyst handoff doc, not deployed UI.)

See [`docs/CHANGES.md`](docs/CHANGES.md) 2026-05-21 (thirteenth session) for full per-commit detail.

---

## Where we were (end of 2026-05-20 — twelfth session)

**OBS polish + doctrine inversion + compare-page closeout + Madden-card hero refinement.** 17 substantive commits picking up immediately after session 11's UI overhaul ship — tuned the chrome to actual OBS-stream usage, locked every user-decidable analyst-input bullet on the compare page, then iterated the hero card into a Madden-Ultimate-Team-style trading card with proper mobile fallbacks.

### What shipped

- **Default zoom dropped 1.75 → 1.25** (`7e15a42`). Session 11's 1.75 felt too aggressive at typical viewing distance. Simpler 2-step adaptive ladder: `≥1100 → 1.25`, `≤1099 → 1.0`. All other session-11 OBS-readability gains (lifted gutters, tightened topnav, ADP fluid-fit) stay intact.

- **Text-on-bright-fill doctrine INVERTED: white → black, both themes** (`372f894`). The previous "white on bright" rule hurt readability on lighter pill colors (TE/yellow, WR/blue). Flipped to `color: #111111` on every bright fill. Light-mode `--pos-*-bg` tokens brightened to match dark-mode so the rule applies consistently. 19 files changed: token redefinitions, ~46 leaf CSS rules updated, `BRANDING HARD RULES` block rewritten, `CLAUDE.md` branding rule + badge recipe inverted, lint detector for old doctrine removed.

- **ADP Box view card polish** (`1c0b3a4`, `ab7082d`). Card height 78 → 100 + width capped at 130 CSS via `minmax(88px, 130px)` so cards stay taller-than-wide on wide monitors. Headshot 32 → 40, team coin 26 → 32 (proportional to taller cards). **Trend chip relocated** out of `.card-meta` (was being squeezed to ~12-30 CSS px between the bottom-row coins, rendering invisible) into `.card-top` next to the overall-pick number — full top-row width available, arrows visible on every position.

- **Compare page features**:
  - **Scoring toggle (§50)** (`459ffe8`) — 3rd toggle group in the page header. 4 presets: PPR / Half PPR / 6pt TD / TEP. Wired through `SLEEPER.adjustStatsForLeague`; position threaded so TEP fires only on TEs.
  - **"+ Add comparison player" inline autocomplete** (`493c427`, `5e9272f`) — replaces the legacy `window.prompt()` popup with a full-size search input that takes over the secondary-link row when activated. Wide dropdown (560px max) with full player names, click-outside or Esc to close.

- **Dropdown + compare hero fixes** (`927884c`). `custom-select.js` popup widths now `min-width: 100%; width: max-content; max-width: min(420px, 95vw)` so option labels render in full (YEAR dropdown stopped truncating "2025" to "20…"). `.pc-search-name` dropped its ellipsis. `.pc-hero-row { max-width: 1100px; margin: 8px auto 0; }` caps multi-mode photos at ~530×330 (was ~600+ on wide monitors after lifted gutters).

### Late-session refinements (post-handoff commits)

Compare-page hero card iteration after the handoff doc was first written. All single-file edits to `compare.html`:

- **Critical bug fix: 2025 seasonal data showing empty** (`03e73b5`) — `_pcGetStats` was reading `STATS_DATA.players[key]` but `data-bootstrap.js` flattens stats via `Object.assign(global.STATS_DATA, stats.players)`. Path `.players[key]` → `[key]` restored visibility of every player's 2025 season block on the compare page.
- **Hero photo slimming + face recenter** (`3626462`) — capped `.pc-hero-row` photos to slimmer aspect, changed headshot `object-position` from `top` to `center 20%` so the face frames properly instead of cropping to the forehead.
- **Madden-card hero aesthetic** (`f20fee2`) — single-mode hero photo aspect tightened to 5:4 portrait; multi-mode grid pinned to `grid-template-columns: repeat(2, 320px)` (fixed-width cards centered) so two players don't stretch wide on large monitors. Visual reference: Hayden Winks Madden-Ultimate-Team-style player cards.
- **In-card name strip** (`8a24115`) — added `.pc-card-name-strip` between the photo wrap and archetype bar, rendering the player name in 16px Kanit italic uppercase with `.02em` letter-spacing. Card stack now reads Header → Photo → Name strip → Archetype bar → Stats grid → Footer, like an actual trading card. Page-level big "PLAYER NAME" heading to the right of the card stays (dual placement matches reference).
- **Mobile bleed patches** (`532ac8d`) — static mobile diagnostic sweep found 4 desktop CSS changes that inherited into mobile without overrides. Added to `@media (max-width: 768px)`: `.pc-search-results { max-height: 320px }` (was 480 — too tall on a 700px phone), `.pc-card-name { font-size: 14px }` (16px truncates earlier on a 320px card), `.pc-card-name-strip { padding: 8px 10px 4px }` (tighter to match smaller name), `.pc-card-photo-wrap { aspect-ratio: 4 / 3 }` (was 5/4 — too tall, pushed stats grid below the fold on phones). Adp-tool, brand.css zoom, and text-color inversion already had proper mobile coverage.

### Analyst-input punch list — ALL compare-page bullets CLOSED

- ✅ **§44 Compare similarity scoring** (`127bdcc`) — weights 25/30/45, delta windows ±8/±14/±4500, tier thresholds 90/75/60. Loose-tier kept in top-5 with muted styling.
- ✅ **§47 Best-in-row tie behavior** (`ac816e3`) — `_pcBestIdx` refactored to return `{ winners, tied }`. Table mode + Identity group + multi metric-table all use yellow `.is-tied` band for full ties. Partial top ties keep green co-winners. Strict equality, no near-tied threshold.
- ✅ **§48 Last-N window default** (`725a55f`) — default 4 games (Underdog convention), playoff weeks excluded.
- ✅ **§49 Multi-card metric comparison bands** (`4c73112`) — strict equality only, unified with §47.
- ✅ **§50 Compare-page scoring toggle** — shipped earlier (`459ffe8`).

### Diagnostic: OBS interactivity audit

Mid-session sweep verified site-wide click parity in OBS Browser Source. Result: **CLEAN**. All `<select>` elements covered by `custom-select.js`; `iframe-scroll-fix.js` only intercepts middle-button (left-clicks pass through); `pointer-events: none` only on decorative overlays; z-index 9999 only on the `_fp-loading` overlay (auto-removed on `fpts:data-ready`). Per-page OBS walkthrough deferred to user's tech test.

### Cache tokens at session close

- `custom-select.js?v=1782700000` (dropdown width fix)
- `formulas-content.js?v=1782800003` (bumped 4× for §44/§47/§48/§49 doc updates)
- `legend-content.js?v=1782900000` (§44 + best-in-row stale-entry fix)
- All other shared modules unchanged from session 11

### What's queued next (external-blocked or deferred)

1. Prospect-score classifier — waiting on prospect/route/coverage data
2. NFL draft round/pick — Sleeper API doesn't expose
3. 1QB scrape `SEED_USERS` expansion — needs user-supplied 1QB-active Sleeper usernames
4. 14 original heuristics in `formulas.html` — external-blocked on analyst recommendations
5. `my-leagues` inline-style cleanup — deferred (diminishing returns)
6. Visual polish — open-ended

**Audit:** `python scripts/check-colors.py` — CLEAN across 30 files. The `dim-text-on-bright-bg` lint detector was removed alongside the doctrine inversion (it enforced the old rule).

**Tech-test follow-up:** user to load each page in OBS Browser Source per the punch list captured in session conversation and report any layout / interaction issues that surface there.

See [`docs/CHANGES.md`](docs/CHANGES.md) 2026-05-20 (twelfth session) for full per-commit detail.

---

## Where we were (end of 2026-05-20 — eleventh session)

**Site-wide UI overhaul shipped + pushed to GitHub Pages.** One bundled commit (`fae0818`) replaced the long-standing 1.25x zoom + 1440px max-width chrome with an adaptive design sized for OBS Browser Source readability.

### What changed

- **Adaptive base zoom** — `body { zoom: N }` stepped via @media breakpoints (1.75 default at viewport ≥1600 / 1.5 at 1300-1599 / 1.25 at 1100-1299 / 1.0 at ≤1099 + ≤768 mobile). When user Ctrl+wheel zooms in, browser shrinks layout viewport in CSS px, breakpoints fire, base zoom steps down — chrome auto-fits any window/zoom combination without horizontal cutoff.

- **Lifted 1440px content cap on desktop** — `.topnav`, `.page`, `footer` get `max-width: none` + `padding-inline: 32px`. Content fills viewport with a consistent 32px breathing margin instead of leaving large dead side gutters at higher zoom. Mobile keeps the original cap.

- **ADP 12-team grid fluid-fit** — `renderBoxView` JS simplified for `TC === 12`: `cellMin=88, headW=24, minWidth=0`. All 12 columns fit any viewport at 1.75x via `minmax(88, 1fr)` flex expansion. 8/10/14-team unchanged.

- **Topnav adaptive content shedding** — FRONT OFFICE tag hides at ≤1599 viewport; Updated stamp hides at ≤1299; inline nav-links collapse into the existing mobile-nav-select dropdown at ≤1099. Logo SVG also shrinks 20→18→16 across breakpoints. All `html`-prefixed selectors that beat 5 inline-duplicate `.topnav` blocks via specificity — no per-page edits needed.

### Phase 0 calibration scaffold removed

Session opened with `assets/js/view-mode.js` + `html.production-view` class as a calibration tool for A/B-testing zoom values. After locking 1.75x, the scaffold was fully deleted (view-mode.js gone, 10 head injections removed, `html.production-view` selector dropped from `brand.css` + 5 inline duplicates). Grep verification: zero leftover references anywhere in the codebase.

**Memory saved:** "Single mode over toggles" — for UI overhauls where the new design dominates the old, consolidate to a single default rather than shipping a permanent mode toggle.

### Per-page audit

Walked every deployed page (`index`, `trade-calculator`, `tiers`, `adp-tool`, `my-leagues`, `rankings`, `formulas`, `compare`, `live-draft`) at the new defaults — no issues. Adaptive zoom + lifted side margins + auto-fitting topnav all work cleanly.

### What's queued next (unchanged from session 10)

1. compare.html refinements — open analyst questions in FORMULAS.md §§44, 47, 48, 49, 50 (similarity weights, tie behavior, Last-N default, near-tied bands, per-page scoring toggle)
2. Prospect-score classifier — replaces `_pcArchetypeLabel(fp)` placeholder when prospect/route/coverage data ships
3. NFL draft round/pick — Sleeper doesn't expose; tile marked `data-pending="nfl-draft-round-pick"`
4. 1QB scrape SEED_USERS — external-blocked on user-supplied 1QB-active Sleeper usernames
5. Analyst feedback loop on 14 heuristics + the new compare-similarity formula — external-blocked

**Cache tokens bumped this session:** `brand.css ?v=1780600000 → ?v=1782400010` across all 10 consumers (single bump capturing all calibration iterations).

**Audit:** `python scripts/check-colors.py` — CLEAN across 30 files (was 31; `view-mode.js` deleted).

**Commit:** `fae0818 ui: adaptive layout zoom + lifted side gutters + auto-fitting topnav`. Pushed to `origin/main`.

See [`docs/CHANGES.md`](docs/CHANGES.md) 2026-05-20 (eleventh session) for full per-edit detail.

---

## Where we were (end of 2026-05-20 — tenth session)

**Player Comparison page shipped.** New `compare.html` slot in the top nav between Calculator and My Leagues. 9 commits across Phases 0-8 took the page from skeleton to full-featured player comparison surface — single-player deep dive (Profile mode) + 2-4 player stat comparison (Table mode), with side-by-side cards that contain tab content directly so each card is a self-contained mini-profile.

### Architecture overview

Two distinct modes selected via toggle in the page header:

- **Profile mode (1-2 players)** — deep-dive comparison. With 1 player: hero trading-card on the left + info column on the right (8 metric tiles) + sub-tabs for ADP / Heatmap / Value / Career / Trades below. With 2 players: hero cards row turns into two side-by-side mini-profiles, the metric table swaps INTO each card, and the tab bar at the top swaps each card's body in lockstep (Profile / ADP / Heatmap / Value / Career / Trades). The 2nd card is added via "+ Add comparison player" link below the single-player hero.
- **Table mode (2-4 players)** — broad stat-comparison grid. 4-slot picker row at the top (each empty slot shows its own search input), then stat-category row groups below (Identity / Trade value / 2025 season / Last-N games with a window toggle for 4 / 8 / 16). Best-in-row green-bordered cells per metric (min for INT and ranks, max for everything else). Position-specific stat rows hide automatically when every player has zero in that row.

URL hash drives full state. Schema: `compare.html#mode=profile&fmt=sf&tab=adp&player=Josh+Allen` (single) or `&players=Josh+Allen,Lamar+Jackson` (multi). Hash parser enforces per-mode player cap (2 in Profile, 4 in Table) so hand-edited URLs degrade gracefully.

### What lives in each tab (Profile-mode card body)

- **Profile** — Identity / Trade value metric table (color-coded vs the other card: green/red/yellow) + position-specific sections (Passing or Rushing or Receiving with year subtitle) + Background tiles (Class / College / Born / Hometown / High School / Jersey / Status / Draft Pick) below.
- **ADP** — `_pcChart` line chart with 5 Y-axis labels + dashed grid + gradient fill + HTML-overlay data point labels above each dot + 5 per-year cells below.
- **Heatmap** — pick-availability matrix via `Heatmap.render(el, sid)` from `assets/js/heatmap.js` (per-card mount IDs `pc-card-heatmap-mount-{idx}`).
- **Value** — FantasyPoints Dynasty Value line chart + PEAK / LOWEST / AVG / CURRENT 4-tile summary row beneath.
- **Career** — slim per-year stat table (position-aware columns) reading `STATS_DATA[name:norm].seasons[year]` directly. Single-player Career still lifts `renderPlayerStats` for the click-to-expand-weeks; multi gets the streamlined year-over-year view.
- **Trades** — actual trades involving that player via `_buildTradesFromMvs()` + `tradeCardHtml(t)` from `player-panel.js`.

### Top Profile Matches row (Profile tab, single-player)

5 similar-player cards below the Background tiles. Similarity scoring is hand-tuned: position hard-gate + weighted composite of 45% FP dynasty value + 30% PPG + 25% age. Tier-banded 0-100 score: 90+ Elite (yellow), 75-89 Strong (green), 60-74 Moderate (blue #5b9bd5), <60 Loose (muted). Click any match card → pivots the hero to that player. **Flagged "Analyst input requested"** in `formulas.html` §44 + `docs/FORMULAS.md` §44 + `legend-content.js` 'compare' entry. See "Analyst feedback loop" in the punch list.

### Reusable existing modules lifted into the page

No new shared modules. Compare.html reuses:
- `assets/js/data-bootstrap.js` — every `data/*.json` payload is hydrated on `fpts:data-ready`.
- `assets/js/player-panel.js` — `renderPlayerStats(containerId, player)` (Career single-player), `_buildTradesFromMvs()` + `tradeCardHtml(t)` (Trades), `openPanel(name)` (drawer access via "Open full player drawer →" secondary link).
- `assets/js/heatmap.js` — `Heatmap.render(el, sleeperId)` (Heatmap tab).
- `assets/js/sleeper-helpers.js` — `SLEEPER.archetypeFromTotals` (archetype label, currently a placeholder showing posRank until prospect-score data ships).
- `assets/js/custom-select.js` — auto-wraps any `<select>` element for OBS Browser Source compat (no native `<select>` in compare.html beyond the topnav mobile-nav-select; the picker uses click handlers).
- `assets/js/iframe-scroll-fix.js`, `assets/js/back-to-top.js`, `assets/js/legend.js` + `legend-content.js`, `assets/js/team-helpers.js` — standard chrome.

### Sleeper player DB lazy-load

`window.SLEEPER_PLAYERS_DB` is fetched from `https://api.sleeper.app/v1/players/nfl` on `fpts:data-ready` (via `_pcEnsureSleeperDb`, idempotent — shared cache with `player-panel.js`). Gives us `height`, `weight`, `years_exp`, `metadata.rookie_year`, `college`, `birth_date`, `birth_city`, `birth_state`, `high_school`, `number`, `status`. NFL draft round / pick isn't exposed by Sleeper — Background tile shows `—` with `data-pending="nfl-draft-round-pick"` until a separate source ships.

### Per-year ADP lazy-load

`window.PC_ADP_BY_YEAR` is fetched from `data/adp-{2022..2026}.json` (5 files in parallel) on first Profile render. Read via `_pcGetAdpForYear(name, year)` which pulls from `byMonth.ALL.{startup_sf | startup_1qb}` based on `PC.fmt`.

### Phase-by-phase commits (all on `main`)

| Phase | Commit | What |
|---|---|---|
| 0 | `28fb9b2` | Skeleton compare.html + nav link in 9 consumers |
| 1 | `483d72f` | Profile-mode hero card (single player) + URL routing |
| 2a-2e | `fe308aa` → `0e7b2cc` | In-page Historical section (Background / ADP / charts / Career / Trades / CTA + scroll). Premium chart redesign in 2b (Y-axis column, 5 labels, gradient fill, floating data labels, PEAK/LOW/AVG/CURRENT summary tiles, "KTC" → "FP Dynasty" rebrand). |
| 3 | `944211a` | Top Profile Matches row + similarity scoring (45% value / 30% PPG / 25% age; tier banding) |
| 3-docs | `b93d751` | Surface compare-page formulas in `formulas-content.js` + `docs/FORMULAS.md` + `legend-content.js` + README punch list. **Durable rule saved to memory** so future sessions auto-sync these whenever new logic ships. |
| 4 | `406c48d` | Table mode skeleton — 4-slot picker + Identity row group |
| 5 | `0f318a8` | Table mode full — Trade Value + 2025 Season + Last-N Games rows + 4G/8G/16G window toggle + best-in-row across all rows |
| 6a | `19b21d6` | Side-by-side Profile mode (2 players, deep cards with metric tables) |
| 6b | `897e373` | Multi-player ADP / Value / Heatmap panels (initial 2-column layout, later restructured in 6c) |
| 6c | `a68c25c` | **Tab content INSIDE each card.** The biggest UX shift — each card becomes a self-contained mini-profile, the global tab bar swaps each card's body in lockstep. No more separate panels below the cards. |
| 7 | `8a214b8` | Mobile polish + dead-code cleanup (240 lines removed — the 6b standalone panel wrappers got obsoleted by the 6c inside-card layout) |

### What's queued next

- **Player Comparison page refinements** as the user identifies them — the page is shipping and shipping clean as of today. Specific open items:
  - **Similarity scoring weights** — three open analyst questions in FORMULAS.md §44 (composite weights 45/30/25, delta windows ±8 / ±14 / ±4500, tier-band thresholds 90/75/60).
  - **Prospect-score classifier** — when prospect / route / coverage data ships, `_pcArchetypeLabel(fp)` swaps from posRank placeholder to a real classifier. Tile already marked `data-pending="archetype-classifier"`.
  - **NFL draft round / pick** — Sleeper `/players/nfl` doesn't expose. Background tile marked `data-pending="nfl-draft-round-pick"` — drop a new data source in and the tile lights up.
- External-blocked: 1QB scrape `SEED_USERS`, analyst feedback loop on the 14 original heuristics + the new compare-similarity formula.
- Visual polish — open-ended; surface specific issues as they come up.

**Cache tokens bumped this session:** none — compare.html is new, all shared modules unchanged. compare.html doesn't have its own cache token (it's a top-level HTML page, not a shared asset).

**Audit:** `python scripts/check-colors.py` — CLEAN across 30 files after every commit.

See [`docs/CHANGES.md`](docs/CHANGES.md) 2026-05-20 (tenth session) for full per-commit detail.

---

## Where we were (end of 2026-05-19 — ninth session)

**Two-thread session.** First, the OBS Browser Source dropdown bug that prompted the live-draft inline combobox in session 8 got promoted to a **site-wide shared module** (`assets/js/custom-select.js`) because every other native `<select>` on the site has the same CEF bug. Then, a **12-commit inline-style cleanup marathon on `my-leagues.html`** took the file from **293 → 46** inline `style="..."` attrs (84% reduction).

### Site-wide custom combobox — `assets/js/custom-select.js` (`6e38c3d`)

Auto-wraps every native `<select>` on every page (skip-list: `.mobile-nav-select`, `.no-fpts-cs`). Body-level MutationObserver with 100ms debounce catches dynamically-added selects (e.g., the my-leagues team-sort dropdown rendered inside a template literal). Mirrors native state via MutationObserver (childList + subtree + `attributeFilter:['disabled']`) and a per-instance `Object.defineProperty` override of the `.value` setter so programmatic value sets fire the mirror update. When the user picks an option, the native `<select>.value` is set + `new Event('change')` dispatched so existing `onchange` attributes fire normally. Loaded on all 8 pages + template with `?v=1782300000`.

### Inline-style cleanup — `my-leagues.html` 293 → 46 inline `style="..."` attrs

Sixteen commits ranging from 4 to 38 inline-style attrs each. Pattern: scoped CSS classes (`.ml-<region>-<purpose>`), CSS custom properties for per-element dynamic values (`--bar-width`, `--pos-color`, `--rank-color`, etc.), modifier classes for state (`is-mine`, `is-pick`, `is-fa`), and CSS `:hover` rules replacing ~15 `onmouseover`/`onmouseout` JS handlers.

Biggest single wins:
- `efcf777` — WORDMARK_LIGHT SVG string had 14 path `style="fill:...;fill-rule:..."` + 1 root style. All converted to **native SVG attributes** (`fill="..."`, `fill-rule="..."`). Identical rendering, zero audit hits. (−20 attrs.)
- `85815da` — `posBadge`/`playerThumb`/`pickThumb` helpers + FantasyPoints articles row. Adds `.ml-pos-badge`/`.ml-thumb-32`/`.ml-pick-thumb-32` family + 13 `.pp-articles-*`/`.pp-article-*` classes; eliminates 8 `onmouseover`/`onmouseout` handlers. (−19 attrs.)
- `99cb24a` — Trade-suggestion modal `.ml-tb-*` family with per-position pos-pill modifiers. (−38 attrs.)

Full per-commit table in [`docs/CHANGES.md`](docs/CHANGES.md) ninth-session entry.

Remaining 46 inline styles break down as: **7 × `display:none`** (JS-toggled initial-state idiom — would require class-toggle refactor across the JS to eliminate, deferred), **2 × CSS-comment false-positives** in the audit regex, and **37 × the CSS custom-property pattern** (`--bar-width`, `--pos-color`, `--archetype-bg/fg`, `--cell-value-color`, `--rp-stripe-color`, etc.) which IS the design end-state for dynamic per-element values.

### What's queued next

- **Player Comparison full page** — still the headline unblocked initiative. New `compare.html`. Two visual references unchanged (Underdog stat-table + Hayden-Winks profile-matches). Per-year career data in `STATS_DATA[key].seasons`.
- External-blocked: 1QB scrape `SEED_USERS`, analyst feedback loop (14 heuristics in `formulas.html`).
- The 7 remaining `display:none` inline styles in my-leagues could become a `.is-hidden` utility class + JS class-toggle refactor — small and tractable as a one-off when convenient, not urgent.

**Cache tokens bumped this session:** `custom-select.js?v=1782300000` (new shared module across all 9 consumers). All other module versions inherited from session 8.

**Audit:** `python scripts/check-colors.py` — CLEAN across 29 files after every commit. `python audit-ml-styles.py` — 293 → 46 inline-style attrs in `my-leagues.html`.

See [`docs/CHANGES.md`](docs/CHANGES.md) 2026-05-19 (ninth session) for full per-commit detail.

---

## Where we were (end of 2026-05-19 — eighth session)

**Closure session.** The last static-checkable hard-rules drift item (Drift #4 — `player-panel.css` `!important` refactor) closed in two diff-trusted passes; the lingering low-priority data item (Drift #6 — 2021/2022 rushing Basic CSV re-export) also shipped. With those two, the entire hard-rules audit punch list from session 7 is now done.

Plus a substantial **OBS Browser Source compatibility suite** that came up mid-session as the user started streaming the site, and **two user-driven UX features** (a Rookies tab in the my-leagues player-exposure sidebar, and a site-wide back-to-top floating button).

### Drift #4 — `player-panel.css` `!important` 97 → 4 mobile-section, in 2 diff-trusted passes

Pass 1 (`4d9cd9c`) consolidated 6 fragmented `@media (max-width: 768px)` blocks at the original lines 321 / 410 / 418 / 476 / 485 / 639 into ONE ordered block, deduplicating rules whose values were already overridden by a later block in the cascade. Visual no-op: every effective rule from the prior cascade preserved; only dead-code duplicates dropped. Mobile-section `!important` count: 97 → 81.

Pass 2 (`b309ccd`) refactored the remaining 81 via two patterns: (a) **specificity escalation** — selectors with a corresponding higher-specificity desktop rule (`.player-panel .pp-close-bar` line 306, `.player-panel .pp-profile` line 308, `.player-panel .pp-avatar` line 309, `.player-panel .pp-name` line 310, `.player-panel .pp-tab` line 313, `.player-panel .pp-value-val` line 315) got upgraded to match — no `!important` needed once specificity matches; (b) **same-specificity source-order wins** for everything else. Mobile-section `!important` count: 81 → **4**. The four kept are doctrine-legitimate **inline-style defenders** (the only thing in external CSS that beats inline is `!important`), each with an inline comment naming the JS line it defends: `.pp-close-bar > div:first-child font-size` (defeats JS:74 inline 13px), `.pp-search-input min-width` (defeats JS:86 inline 260px), `.player-panel .pp-profile padding` (defeats JS:105 inline 28px 32px), `.pp-name font-size` (defeats JS:109 inline 32px).

Desktop CSS byte-equivalent — `git diff` shows only post-line-317 changes. Cache token bumped: `player-panel.css?v=1780500000 → ?v=1781500000` across all 8 consumers + template.

### Drift #6 — 2021/2022 rushing Basic CSVs re-exported

`3612da1`. User dropped fresh Basic-format CSVs at `data/source/stats/{2021,2022}/rushing.csv`. `sync-stats.config.json` lines 61 and 65 swapped from `label: "rushing (Advanced)"` (with the trimmed field map) → `label: "rushing"` (with the full Basic field map matching the 2023+ rows). The stale `_comment` at the top of the config was refreshed. `sync-stats.py` rerun regenerated `data/stats.json` (1,102 unique players × 5 seasons). Spot-check Najee Harris 2021: `rushAtt=307, rushYards=1200, rushTd=7, targets=94, rec=74, recYards=467, recTd=3` — every number matches real NFL stats; per-week breakdown intact + 1 playoff week.

### OBS Browser Source compatibility suite — 4-commit arc + 1 diagnostic round-trip

The user started loading the site as an OBS Browser Source overlay for streaming. Two issues surfaced — page-scroll-trapping inside iframe contexts, then native `<select>` dropdowns failing on `live-draft.html` — driving a multi-commit response:

- `ee9df70` **`assets/js/iframe-scroll-fix.js`** — new shared module loaded by all 8 pages + template. When iframed (`window.self !== window.top`, with try/catch for cross-origin parents), it (1) injects an overflow-reset stylesheet, (2) flattens any oversized inner scrollable container that would trap wheel events, (3) installs a capture-phase wheel handler that defers to legitimate inner scrollers and falls through to `window.scrollBy` for the outer document. **Hard guarantee: direct browser visitors get zero behavior change** (the guard exits before doing anything).

- `0b820b6` / `774bb57` **OBS dropdown diagnostic** — temporarily disabled the new script on `live-draft.html` only to isolate cause of the dropdown failure. Dropdowns still failed → confirmed the iframe-scroll-fix was innocent, real culprit was CEF's native `<select>` rendering in cross-origin iframes (a known regression on multiple CEF versions including OBS 32.1.2). Script restored.

- `21eb03e` **Custom combobox wrapper for OBS** — added inline to `live-draft.html`. Hides each native `<select class="ld-select">` (display:none) and wraps with a button + custom popup that **mirrors** the `<select>` state. The native `<select>` stays in DOM and keeps its full JS API (`.value`, `.innerHTML`, `.disabled`) so the existing cascading-picker logic in `ldFetchLeagues` / `ldFetchDrafts` / `ldOnYearChange` / etc. is unchanged. The mirror updates via MutationObserver (childList + disabled attribute) + a per-instance `.value` setter override (programmatic value sets aren't reflected to attributes). When user picks an option, we set `<select>.value` and dispatch `new Event('change')` so the inline `onchange` attribute fires normally. Multi-popup management: clicking one dropdown closes the others (button click does NOT `stopPropagation`).

- `ace0025` **Horizontal scroll** for iframe contexts — flipped `overflow-x: hidden !important` → `auto` on html/body in both the CSS injection and the `fixContainers` walker. `isScrollable` and the wheel handler both now detect horizontal-scroll containers and defer to them in the wheel `deltaX` direction.

- `4c35b60` **Middle-click drag-scroll** — CEF doesn't surface the native middle-click pan/auto-scroll gesture in iframes. Re-implemented manually: mousedown w/ `e.button === 1` enters pan mode (`cursor: all-scroll`, captures start position); mousemove drags the page Google-Maps-style (drag right → page follows right); mouseup exits. `auxclick` suppression prevents CEF from toggling its own auto-scroll cursor over our handler.

### Two user-driven UX additions

- `ce85d59` **Rookies tab in my-leagues player exposure** — new `ROOKIE` filter button between TE and Picks. Shows only current-year rookies (`years_exp === 0` per Sleeper) scoped to QB/RB/WR/TE. `computePlayerExposure()` now caches `yearsExp` on each exposure entry; `renderExposureList()` has a `filter === 'ROOKIE'` branch BEFORE the position filter. Sidebar widened **360px → 440px** (`.ml-columns` grid template) so the long player names (Christian McCaffrey, etc.) no longer get ellipsis-truncated. The search-augmentation block that surfaces non-rostered FP players on name-search is intentionally skipped under ROOKIE filter — `FP_VALUES` records don't carry rookie status, so we can only show rostered rookies (which is the user's intent anyway).

- `5422fa5` **Back-to-top floating button** — new `assets/js/back-to-top.js` shared module, loaded by all 8 pages + template. Round red 44×44 FAB-style button with ↑ arrow, positioned at `bottom: 70px; right: 18px` so it stacks 12px above the existing Legend trigger (`.lg-trigger` at `bottom: 18px`). Fades in when `scrollY > 400`, fades back out near top, smooth-scroll on click. `z-index: 150` — above ordinary content but below the player-panel drawer (z 200+) and Legend backdrop (z 8999) so it hides correctly behind open modals.

### What's queued next

- **Player Comparison full page** — still the headline unblocked initiative. New `compare.html`. Two visual references unchanged from prior sessions (Underdog stat-table + Hayden-Winks profile-matches). Per-year career data in `STATS_DATA[key].seasons`. Multi-session work.
- External-blocked: 1QB scrape `SEED_USERS` (needs 1QB-active Sleeper usernames), analyst feedback loop (needs analyst recommendations on 14 heuristics in `formulas.html`).
- Visual polish — open-ended; surface specific issues as they come up.

**Cache tokens bumped this session:** `player-panel.css?v=1781500000`, `iframe-scroll-fix.js?v=1782100000` (created + iterated twice), `back-to-top.js?v=1782200000` (new module).

**Audit:** `python scripts/check-colors.py` — CLEAN across 28 files after every commit.

See [`docs/CHANGES.md`](docs/CHANGES.md) 2026-05-19 (eighth session) for full per-commit detail.

---

## Where we were (end of 2026-05-18 — seventh session)

**The day the data suite became the source of truth.** Two major initiatives shipped across ~30 commits: (1) Live Draft Assistant page from skeleton through Phase 5 + polish, (2) Data-Suite Migration Phases 1-8 that replaces Sleeper-sourced stats / projections across the entire site with user-supplied CSVs from FantasyPoints' Data Suite.

### Live Draft Assistant — page complete end-to-end

New `live-draft.html` page in the nav. Flow: Sleeper username → year + league dropdown (with historic leagues via `previous_league_id` chain walk, active drafts surfaced with 🔥 marker) → draft picker (rookie + startup auto-detected) → live board.

Per-pick analysis: **Pick Analysis card** (Pick / ADP / Proj / Delta with VALUE/ON ADP/REACH/NO ADP badge), **Team Needs** sorted by league rank with worst-rank-first = biggest need, **Roster Panel** with per-position groups (4-up desktop, 2x2 mobile) showing per-player Val + Proj, **Best Player Available** card (top 10 undrafted by ADP, position-filtered to QB/RB/WR/TE, 25-draft minimum-volume floor), **Fair Value at Your Next Pick** trade-suggestion card backed by the shared trade engine.

Live polling every 25s with `visibilitychange` pause (no API burn on backgrounded tabs). On-the-clock highlight: pulsing brand-orange halo on the next-up cell, green when it's the user's pick. **Sticky on-the-clock summary bar** pins under the nav so the user always sees whose pick is up without scrolling to the board.

Traded-pick handling: `slot_to_roster_id` + `/league/{id}/traded_picks` + `pk.roster_id` precedence chain resolves the actual owner of every cell (regardless of season). Per-position **league rank chip** mirrors my-leagues' prank-pills (top 3 green, bottom half red).

### Data-Suite Migration — `data/stats.json` is the source of truth

Multi-year archive: **1,104 unique players × 5 seasons (2021-2025)** × per-week + per-season detail. Ingest pipeline:

```
data-suite CSV (passing / rushing / receiving × 5 years × weekly-split toggle)
   → sync-stats.py with composite-key support ("Passing/YDS" vs "Rushing/YDS")
   → data/stats.json (per-player .seasons[year].weeks + .playoffWeeks maps)
      → window.STATS_DATA (data-bootstrap.js loadStats)
         → SLEEPER.adjustStatsForLeague(rawStats, scoring_settings)
              [+TEP, +PPC, +pass-TD bonus, +half-PPR / std]
            → SLEEPER.projectPlayer(playerKey, scoring)
               → SLEEPER.lineupProjection(roster, scoring, roster_positions)
                  [sum of Start-N optimal-lineup starters]
                 → SLEEPER.archetypeFromTotals(...projValue=lineupProj...)
                    → SLEEPER.generateTradeSuggestions(myAssets, target, archetype)
```

**Start-N lineup auto-sizes** from each league's `roster_positions` array — Start-10 SF, Start-9 1QB, Start-8, all work without hardcoding. **TEP / PPC / pass-TD bonus** detected per league from `scoring_settings.bonus_rec_te` / `.rush_att` / `.pass_td`. **Phase 8** migrated the last two Sleeper stat surfaces in my-leagues (`ML_SEASON_STATS` PPG column + `ML_SEASON_PROJ` season projections) to the data suite — both now derived from `STATS_DATA` via the same scoring overlay.

### What stays Sleeper-sourced (intentional)

- `/league/{id}/*` — rosters, users, drafts, traded_picks (the league IS Sleeper)
- `/players/nfl` — player identity (Sleeper IDs, positions, teams, ages, injury status). The data suite doesn't ship Sleeper IDs.
- `league.scoring_settings` + `league.roster_positions` — per-league configuration
- `/projections/nfl/regular/{year}/{week}` (per-week) — Sleeper's forward-looking weekly projection. The data suite ships historical weeks only — no forward-looking equivalent. Displayed only during in-season weeks.
- Live-draft `_projForPlayerId` tier-2 fallback — Sleeper /projections for IDP / K / DEF / unmapped rookies (returns null when STATS_DATA misses).

### Format-aware values everywhere

`SLEEPER.pickValue(season, round, formatKey)` and `SLEEPER.buildAssetPool(data, rosterId, formatKey)` route the right column (valueSf vs value1qb) per league. my-leagues + live-draft both detect format from `roster_positions.includes('SUPER_FLEX')` and pass the key through. Trade suggestions in 1QB leagues no longer over-value QBs.

### Session persistence

`fpts-sleeper-username` / `-user-id` / `-display-name` / `-avatar` localStorage keys are shared between my-leagues and live-draft — sign in on either page, auto-restore on both.

### What's queued next

- **Player Comparison full page** — was gated on the data-suite migration; now unblocked. `STATS_DATA[key].seasons` provides per-year career-trend data. Two visual references in the punch list (Underdog stat-table layout + Hayden-Winks profile-matches layout).
- **ADP audit** — user flagged "some players are not in the right spots." Audit path documented in punch list; needs specific player names.
- Remaining items external-blocked (1QB scrape seed users, 14 analyst-flagged heuristics) or deferred (my-leagues inline-style cleanup).

**Cache tokens bumped this session:** `data-bootstrap.js`, `sleeper-helpers.js`, `my-leagues.html` → `?v=1780800000` across all 9 consumers.

**Audit:** `python scripts/check-colors.py` — CLEAN across 26 files after every phase commit.

### Post-Phase-8 polish that landed late in the session

After the data-suite migration completed (commit `f276530`) and the doc resync (`b1f5e53`), six follow-up commits closed out remaining gaps:

| Commit | What |
|---|---|
| `3fee1fd` | ADP cleanup filter (position + 25-draft floor) in `data-bootstrap.js` — kickers + 5-12-draft outliers no longer pollute ranks. |
| `22f45dd` | Scale-aware floor — `max(25, corpus_max × 10%)` so SF and 1QB corpora each get their proper threshold (SF rookie → 1,091; 1QB rookie → 58). |
| `1db152d` | adp-tool rookie draft display capped at 4 rounds (R5 isn't common practice; the corpus only sparsely populates it). |
| `8e45560` | Player-drawer Stats tab migrated to data suite. `_statsDataLookup` + `_toSleeperShape` translate STATS_DATA records to Sleeper-API shape so the renderer is unchanged; Sleeper /stats stays as fallback for IDP / K / pre-2021. |
| `8e08aed` | Drawer fixes: FPTS column populating (added `sleeper-helpers.js` to every page that loads `player-panel.js`); year list trimmed to 2021-2025 (data suite cut-off); subtitle now reads "Source: Data Suite". |
| `0ddfd85` | Punch list — ADP audit item marked done (user-confirmed "adp looks way better"). |

**Cache token state after the session:** `data-bootstrap.js?v=1781000000`, `sleeper-helpers.js?v=1780800000`, `player-panel.js?v=1781200000`, `legend-content.js?v=1781100000` across the 9 consumers.

See [`docs/CHANGES.md`](docs/CHANGES.md) 2026-05-18 (seventh session) for full per-commit detail.

---

## Where we were (end of 2026-05-17 — sixth session, overnight autonomous)

**Six sessions on 2026-05-17.** The sixth one (covered here) was an autonomous overnight run that shipped Phases 1 + 2A + 2B+ + 2C of the mobile-first refactor. User went to bed with instructions: "push through this overnight stop if there is something wrong." Six phase commits pushed live, each gated on a clean brand audit.

**What shipped tonight (6 commits past Phase 0):**

| Commit | Phase | Summary |
|---|---|---|
| `2d9aae6` | Phase 1B+C+D+E | Shared-module mobile rebuilds (heatmap / legend / mvs-extras / brand-topnav) |
| `f2fd8cf` | Phase 1A (partial) | Dropped 480px sub-breakpoint from player-panel.css |
| `44e18ba` | Phase 2A | **Rankings By Analyst mobile card mode** — the headliner. Parallel renderer + matchMedia switch. All 5 analyst ranks visible at a glance on phone, no horizontal swipe needed. |
| `f321440` | Phase 2B+ | Cross-page breakpoint sweep — 480/600 folded into 768 across all 6 remaining HTML pages |
| `8085f87` | Phase 2C | **ADP Box view enabled on mobile** via horizontal scroll-snap. Was force-disabled before. |

**The mobile-first doctrine is now lived, not just codified.** Every shared CSS module has a clean from-scratch mobile block. One breakpoint (768px) everywhere — zero 480/600/700 in deployed code. Rankings By Analyst uses the parallel-render pattern (table on desktop, cards on mobile). ADP Box view works on phones.

**Deferred to a daytime session (need browser verification):**

1. **Phase 1A-deep** — `player-panel.css` `!important` count still at 97 baseline. A clean mobile-block rewrite needs on-device verification of all 5 drawer tabs across 7 host pages; too risky overnight.
2. **Phase 2B-deep** — `my-leagues.html` table → card conversion. Same parallel-renderer pattern as Phase 2A but my-leagues has 5+ table renderers vs rankings' 1, each with different data shapes.
3. **Phase 2D** — `index.html` + `trade-calculator.html` mobile polish. Both files >370k tokens (cannot Read in full); without specific bug reports to drive the work, speculative refactor is high-risk. `tiers.html` + `formulas.html` already mobile-OK.

**Cache tokens bumped this session:** brand.css, heatmap.css, legend.css, mvs-extras.css, player-panel.css all → `?v=1780400000`.

**Audit:** `python scripts/check-colors.py` — CLEAN across 24 files after every phase commit.

**Plan file with detailed handoff:** `~/.claude/plans/i-have-a-deeper-golden-wadler.md` (includes a morning verification walkthrough).

**What to check on your phone in the morning:**
- `rankings.html` → BY ANALYST tab → QB — should see card-mode (player + team + 5 analyst cells + AVG), no horizontal scroll
- `adp-tool.html` → Box view (no longer disabled) — swipe horizontally across columns
- Player drawer on any page — Session-4 fixes still apply (FP hero beside avatar, search dropdown solid)
- `my-leagues.html` — unchanged this session (mobile rebuild deferred)

See [`docs/CHANGES.md`](docs/CHANGES.md) 2026-05-17 (sixth session) for full per-edit detail.

---

## Where we were (end of 2026-05-17 — fifth session)

**Five sessions on 2026-05-17.** The fifth one (covered here) was **Phase 0 of a mobile-first refactor**: codified the mobile-first doctrine in `brand.css` and `CLAUDE.md`, added a MOBILE-FIRST RULES block to `templates/page-template.html`, and swept the codebase's 700px breakpoints to 768px (user-approved tradeoff). The plan file at `~/.claude/plans/i-have-a-deeper-golden-wadler.md` covers the full multi-phase refactor.

**The strategic shift.** After the fourth session shipped four targeted mobile fixes, user raised the concern that mobile work feels like half measures. A codebase audit confirmed it: `body { zoom: 1.25 }` is the structural foundation; 97 `!important` overrides in player-panel.css mobile section alone; tables hard-coded at `min-width: 1100px` and `min-width: 1500px` (ADP Box view literally disabled on mobile); 27% of shared CSS lives inside mobile media-query blocks. Direction: rebuild the mobile experience from a 390px touch-first baseline. **Hard constraint**: desktop CSS stays byte-equivalent — only mobile blocks change.

**1. MOBILE-FIRST RULES codified in `brand.css`.** Sixth top-of-file comment block alongside BRANDING HARD RULES + COLOR USAGE RULE. Six rules: (1) one breakpoint — 768px, (2) mobile blocks are self-contained designs not patches, (3) minimal `!important`, (4) no desktop-pixel references in mobile blocks, (5) desktop CSS never changes, (6) use the recipes.

**2. Mobile-first recipes added to `CLAUDE.md`.** Five copy-paste conversions: table → card mode, side drawer → bottom sheet (transform-axis flip from X to Y), multi-column grid → swipeable carousel with scroll-snap, hover state → tap state, tap-target sizing (44px iOS HIG minimum). Each recipe has worked CSS + verification checklist.

**3. Template scaffold updated.** `templates/page-template.html` got a second comment box (MOBILE-FIRST RULES) directly below the existing BRANDING + ALIGNMENT RULES box. New pages inherit the doctrine on copy.

**4. Breakpoint swept 700px → 768px.** User-confirmed tradeoff: viewports 700–768px wide (rare narrow desktop windows, iPad portrait at exactly 768px) flip from desktop-zoom 1.25 to mobile-zoom 1.0. Typical desktops at 1200px+ unaffected. Swept across: `brand.css` zoom reset, `player-panel.css`, `legend.css`, `heatmap.css`, the 5 page-level inline zoom resets (`index`, `my-leagues`, `adp-tool`, `tiers`, `trade-calculator`), and `legend-content.js` doc strings. Zero `max-width: 700px` remaining in deployed code (the only remaining hits are in `docs/function-reference.html`, which is the legacy printable PDF source not deployed CSS).

**5. Baseline metric for Phase 1 tracking.** `!important` count in `assets/css/player-panel.css` = 97 today. Phase 1 target: drop to <30 by rebuilding the mobile section as a self-contained bottom-sheet design rather than a thicket of overrides.

**Cache tokens bumped:** brand.css, player-panel.css, legend.css, heatmap.css, legend-content.js all → `?v=1780300000` across all 8 consumers.

**Audit:** `python scripts/check-colors.py` — CLEAN across 24 files.

**Phase 1 next.** Rebuild the 5 shared-module mobile blocks (player-panel.css, heatmap.css, legend.css, mvs-extras.css, brand.css topnav-mobile) as from-scratch mobile designs. Desktop untouched.

See [`docs/CHANGES.md`](docs/CHANGES.md) 2026-05-17 (fifth session) for full per-edit detail.

---

## Where we were (end of 2026-05-17 — fourth session)

**Four sessions on 2026-05-17.** The fourth one (covered here) was mobile fixes pass: nav dropdown sync to current page, player drawer compare-search dropdown solidity + count-wrap, Fantasy Points hero block reflow next to the headshot (saved an ~80px vertical band), and rankings By Analyst table compact-fit so all 5 analyst cells render without horizontal scroll on iPhone. Plus a standalone interactive `docs/analyst-heuristics-review.html` for the 14 analyst-flagged heuristics so the user can hand it to the data analyst.

**1. Mobile nav dropdown — synced to current page.** The `<select class="mobile-nav-select">` placeholder ("— Pages —") was sticking on every page. Added `_syncMobileNav()` to `assets/js/data-bootstrap.js` — runs after DOM ready, matches `window.location.pathname` to the right `<option value>`, sets `selectedIndex`. Idempotent + shared across all 7 pages + the template via the bootstrap. Now `rankings.html` reads "Rankings" in the dropdown instead of "— Pages —".

**2. Player drawer compare-search dropdown — solid + opaque, count compact.** `.pp-search-results` got an explicit `background-color: var(--surface)`, `z-index: 500` (up from 300 — clears the actions-menu overlay), and a `box-shadow` so a 1-result dropdown reads as a clearly-bounded panel. Each `.pp-search-result` row also got its own `background-color` + `text-decoration: none` defensively. `.pp-search-result-name` now uses `text-overflow: ellipsis` instead of wrapping; `.pp-search-result-count` is `flex-shrink: 0; white-space: nowrap` so "No trades yet" never breaks onto two lines next to the player name. Combined fix kills the "Chase / yet / No" garbled-overlap from the screenshot.

**3. Fantasy Points hero block — moved next to headshot on mobile.** The `.pp-profile` mobile flex direction flipped from `column` back to `row` with `flex-wrap: wrap`. Children get `order:` properties so they lay out as: avatar (left, 72px) + Fantasy Points block (right, flex-1, vertically centered) on row 1, then the rest of player info (name + meta grids + articles) as a full-width band on row 2. Removed the late-block `.pp-avatar { 48px }` override that conflicted with the new layout. Net: ~80px vertical band killed, tab strip + trade cards lift up into the viewport.

**4. Rankings By Analyst table — compact-fit on mobile.** `_analystHeaderCols` + `renderAnalystHeaderRow` now emit BOTH `<span class="th-full">Ryan</span>` AND `<span class="th-short">RYA</span>` per `<th>`. Mobile `@media` shows only the short span and drops the table's `min-width: 1100px` so it contracts to viewport. Compact widths (Player auto / Team 30px / each analyst 34px / Avg 42px) fit all 5 analyst cells + Player + Team + Avg in ~365px — no horizontal scroll needed on a 393px iPhone. Bipolar heat tints (best/worst rank per row) survive unchanged.

**Cache tokens bumped this session:** `player-panel.css ?v=1779990000` → `?v=1780200000`, `data-bootstrap.js ?v=1778680027` → `?v=1780200000` (both across all 8 consumers).

**Audit:** `python scripts/check-colors.py` — CLEAN across 24 files.

**Bonus artifact:** `docs/analyst-heuristics-review.html` — standalone interactive document for the 14 analyst-flagged heuristics (9 questions needing data + 5 developer flags). localStorage-backed checkboxes + textareas + "Copy summary" button that emits paste-ready markdown for the developer follow-up. Emailable as a single file.

See [`docs/CHANGES.md`](docs/CHANGES.md) 2026-05-17 (fourth session) for full per-edit detail.

---

## Where we were (end of 2026-05-17 — third session)

**Three sessions on 2026-05-17.** The third one (covered here) was a punch-list close-out: migrated the inline `:root` duplicates off all 5 pages onto canonical `brand.css`, verified the data-bootstrap migration was already complete (README item was stale), verified the trade corpus flow end-to-end, and removed 388 KB of dead inline texture data from `trade-calculator.html`. The user explicitly redirected mobile work to the next session — this one closed every tractable polish item first.

**1. Inline `:root` migration — complete.** `brand.css` is now the sole source of truth for brand color tokens across every page. Added `--orange` and `--muted2` to the canonical `:root` (both were used at 239+ sites but had only lived in page-local duplicates). Deleted the inline `:root` + `[data-theme="light"]` blocks entirely from `tiers.html` and `adp-tool.html`. Shrunk `index.html` and `my-leagues.html` inline blocks down to only the 3 page-specific texture tokens (`--tex-url`, `--tex-size`, `--tex-opacity` — these back `body::before`). Removed both the brand duplicates AND the dead texture tokens from `trade-calculator.html` (no `body::before`, ~388 KB of unused inline base64 image data). Surgery used `sed -i` for the 3 big pages because the texture data-URL lines (376,710 chars each) exceed the Edit tool's input window.

**2. data-bootstrap migration — verified already complete.** The README's open item "Migrate remaining 3 pages to data-bootstrap.js" was stale. Verified by code inspection: `adp-tool.html:932-970`, `my-leagues.html:7656-7695`, and `index.html:5855-5985` already use `fpts:data-ready` listeners; their wrapper IIFEs only do page-specific work (SLEEPER_IDS hydration, TRADES build from MVS, the extra `data/adp-prev.json` fetch for ADP year-picker). Zero hand-rolled `fetch('data/*.json')` calls remain across all HTML files.

**3. Trade corpus — verified by code path.** Punch-list item "Verify all five player modals display real recent trades" traced end-to-end: `data/mvs.json` per-player `recentTrades` → `data-bootstrap.js:186` overlay → `player-panel.js:_buildTradesFromMvs` (line 688) dedupe + normalize → `_trades()` lazy cache (line 183) → `tradeCardHtml` render. All 5 pages route through the same chain; `index` has its own builder, the other 4 rely on the panel's lazy fallback.

**4. Deferred-by-design items closed with rationale.**
- **`loadStandings` orphan DOM IDs** (cleanup item from prior handoff) — source comment at `my-leagues.html:6601-6604` already documents the trade-off as intentional. Refactor would touch ~10 sites with zero functional benefit and no browser-test safety net.
- **Pedantic `opacity:` → `rgba()` for ~50 leaf elements** — discarded because `rgba(255,255,255,X)` doesn't flip with theme like `var(--white)` does. The conversion would break light mode. CLAUDE.md rule #2 already permits leaf-element opacity.
- **`my-leagues.html` inline-style cleanup** — diminishing returns. `docs/ml-inline-style-inventory.md` marks itself "historical snapshot, superseded" after Phase A. Remaining 280 occurrences are 144 dynamic (must stay), 8 JS-set (must stay), 137 static-but-1-off.

**5. Remaining items are external-blocked.**
- 1QB scrape SEED_USERS expansion — needs user-supplied 1QB-active Sleeper usernames.
- Analyst feedback loop on 14 flagged heuristics — waiting on analyst recommendations.

**Cache tokens bumped this session:** `brand.css ?v=1779990000` → `?v=1780100000` across every consumer (`index`, `trade-calculator`, `tiers`, `adp-tool`, `my-leagues`, `rankings`, `formulas`, `templates/page-template.html`).

**Audit:** `python scripts/check-colors.py` — CLEAN across 24 files.

**Next session:** mobile issues (user-directed). The punch list is closed except for the 2 external-blocked items.

See [`docs/CHANGES.md`](docs/CHANGES.md) 2026-05-17 (third session) for full per-edit detail.

---

## Where we were (end of 2026-05-17 — second session)

**Two sessions on 2026-05-17.** The second one (covered here) was a site-wide alignment + branding consistency pass, codified the branding rules into a 4-layer governance system that machine-enforces drift at push time, and shipped a long-deferred weekly-stats breakdown feature in the drawer. The first session (calc bug-fix arc + Formulas page) is documented below under "Where we were."

**1. Site-wide alignment audit — closed.** Every table and table-like layout on every page now follows one rule: `text-align: center` on both `thead th` and `td`, except variable-length text columns (Player / Pick / Team / etc.) which stay `text-align: left` via `.col-name` + `th[data-col="name"]` overrides. Padding made symmetric (`8px 8px` not asymmetric `8px 12px 8px 0` — centered content needs balanced padding). Affected: rankings, tiers, my-leagues (5 tables), drawer Player Stats table (was the worst — built with inline-style strings forcing every header LEFT), MVS extras strip on index.html, Top Risers/Fallers headers. The ADP main Box/List view is the only excluded surface (data shape is intentionally unique); the drawer that opens FROM ADP follows the rule.

**2. Site-wide branding consistency.** Every "bright colored fill" surface — pos pills, tier badges, heat tints, `.active` button states, mvs-vol indicators, Legend trigger — now uses `color: var(--white)` for text inside. Flipped the `--pos-qb / --pos-rb / --pos-wr / --pos-te / --pos-k / --pos-pick` text tokens from `#111111` → `#ffffff` in `brand.css` + 5 inline `:root` duplicates so every consumer auto-updates. Hand-edited 30+ remaining hardcoded `color: #111` rules across `brand.css` / `mvs-extras.css` / `heatmap.css` / `legend.css` / 5 HTML pages. Fixed 5 opacity-compounding bugs (parent `opacity: .X` was dimming colored children) by converting to `rgba(R,G,B,X)` on the `color` property directly. Then caught 3 more cases where a brand color itself was being rendered at reduced opacity and fixed those too.

**3. Standings tab wired up + Max PF + per-position MPX%.** `loadStandings` had been fully built (data layer, archetype scoring, Position Rankings cards) but never wired to a UI button — added a 3rd tab next to Trade History / Waivers. Replaced the team-level MPX% column with raw Max PF (Sleeper's `fpts_max`). Added a NEW per-position MPX% formula — the 4 Position Rankings cards (QB / RB / WR / TE) now show a third stat block per card: what % of your team's Max PF comes from that position group, computed via optimal-lineup simulation that walks `league.roster_positions` and greedily assigns the highest-scoring eligible player to each starter slot. Handles FLEX, SUPER_FLEX, REC_FLEX, WRRB_FLEX variants. Normalized so QB+RB+WR+TE ≈ 100%.

**4. Weekly stats breakdown in drawer Player Stats.** Each Year row in the Player Stats table is now clickable with a chevron (`▸` collapsed, `▾` expanded). Clicking fetches that (player, year) tuple's weekly stats from Sleeper (both regular + post-season in parallel), then inserts weekly child rows below the season row using the same column structure. Playoff weeks get a bright orange "PLAYOFF" chip. Result cached per `(sleeperId, year)` so re-expand is instant. Async-guard pattern per `CLAUDE.md` §1 — captures target player at fetch time, bails if user swapped to a different compared player.

**5. Governance — 4-layer enforcement so future pages can't drift:**
- **`templates/page-template.html`**: BRANDING + ALIGNMENT RULES box at the top of the comment block — first thing visible when copying the scaffold.
- **`scripts/check-colors.py`**: extended with 2 new lint patterns. `dim-text-on-bright-bg` flags `color: #111` inside a rule whose body has a brand-color background. `opacity-on-pill-with-bright-bg` flags `opacity: < 1` on selectors matching pill/badge/chip/active patterns when the rule also has a bright fill. False positives suppressed via "last selector segment only" + state-transition exclusion + intentional-muted-variant skips (`.cold` / `.dim` / `.empty` etc.).
- **`push.bat`**: brand-audit hard gate before commit. Drift aborts the push.
- **`CLAUDE.md`**: new "Recipes for new components" section with copy-paste CSS for tables / pills / `.active` buttons / drawer tabs / section toggles / muted text. Every recipe references the canonical existing class so no one rolls their own.

**The branding hard rule, codified at the top of `brand.css`:**
1. White text on every bright fill — no `color: #111` on a `var(--pos-*-bg)` or `var(--red)/(--green)/(--yellow)/(--orange)` background.
2. Never `opacity:` on a parent that contains colored children — use `color: rgba(255,255,255,X)` on the text directly.
3. Brand color tokens are the source of truth in `brand.css`.
4. Vibrant by default — muted text uses `rgba` alpha, never `opacity:` on a container.
5. `python scripts/check-colors.py` must print CLEAN. `push.bat` aborts the deploy on drift.

**Cache tokens bumped this session:** `brand.css` `?v=1779990000`, `mvs-extras.css` `?v=1780000000`, `heatmap.css` `?v=1779990000`, `legend.css` `?v=1779990000`, `player-panel.js` `?v=1780000100`, `player-panel.css` `?v=1779990000`.

See [`docs/CHANGES.md`](docs/CHANGES.md) 2026-05-17 (second session) for full per-commit detail.

---

## Where we were (end of 2026-05-17 — first session)

**The site is now 7 pages, not 6.** New `formulas.html` (top-nav "Formulas") catalogs every formula / threshold / heuristic on the site for data-analyst hand-off. Also: 11 trade-calculator + player-panel bug fixes shipped in a single session.

**1. New Formulas page (formulas.html).** Site-wide catalog of 56 entries across 14 sections — trade values, player signals, age curve, tiers, team archetypes, trade suggester, lineup optimizer, ADP heatmap, rankings/analysts, sync pipeline + magic-numbers glossary + 14 open heuristics flagged for analyst review. Each entry has:
- File:line with "View source on GitHub" deep-link
- Provenance chip (Hand-tuned / Derived from data / External standard / Manual curation / Site convention / Unknown — analyst input requested)
- Verbatim math in monospace block
- Concrete worked example (input → math → output trace) in green-tinted block
- Cross-link chips to related entries (click → smooth-scroll + flash)
- "Why this number?" yellow callout on magic-numbers + heuristics with the actual reasoning or "Analyst input requested"
- Sticky TOC sidebar with scroll-spy + live search bar

Source-of-truth pair: `docs/FORMULAS.md` (markdown handoff artifact) + `assets/js/formulas-content.js` (structured data driving the page). Both must update together on any formula change — discipline documented in `CLAUDE.md`.

**2. Calc page bug-fix arc (11 commits).** User testing surfaced a chain of issues:
- Compare-player async-race in shared drawer (Sleeper stats showed the same for both compared players) — `c164944`
- Pick value object-shape mismatch breaking trade calc (picks displayed `[object Object]`, sort broken, totals NaN) — `2e3b797`
- `PICK_VALUES` never reached calc page (page-local `let` shadowed `window.PICK_VALUES`) — `0adea20`
- Format toggle didn't re-render per-row asset values — `36d7ffd`
- Reset All Filters + presets silently dying due to missing `#pick-tags` element — `8017154`
- Visible filters never drove calc values (calc math read hidden `fmt-*` selectors, not visible `f-*`) — `50a3b14`
- 2026-2028 picks invisible (MVS shape value1qb field unread; legacy/handoff picks had no pickKey) — `1677df9`
- Cross-page handoff to calc silently dropping trade payload (`tradeState` variable didn't exist) — `4a6a9d4`
- 149 lines of dead code removed from trade-calc — `e456540`

See [`docs/CHANGES.md`](docs/CHANGES.md) 2026-05-17 for full per-commit detail.

**3. CLAUDE.md extended.** Now documents both the panel async-guard pattern AND the FORMULAS.md ↔ formulas-content.js dual-file sync rule.

---

## Where we were (end of 2026-05-16 late-evening session)

**The site is now 6 pages, not 5.** New dedicated `rankings.html` shipped
plus a brand-color standardization pass across every page.

**1. Rankings page (rankings.html — REPLACES external FantasyPoints link).**
Two top-level modes via underline tabs in the page-header (mirrors
adp-tool's Dynasty Startup / Dynasty Rookie pattern):
- **CONSENSUS mode**: 12-col table per (analyst, format) combo with ADP
  overlays (Current / Previous / Change). Format toggle (`SF / SF+TEP /
  1QB / 1QB+TEP`) manifest-driven; missing combos render disabled.
  Currently ships Overall consensus for 1QB / SF / 1QB+TEP (3 of 4 format
  combos populated; SF+TEP awaits CSV).
- **BY ANALYST mode**: 8-col side-by-side comparison per position with
  bipolar heat tints. 5 analysts (Ryan, Theo, John, Andy, Thomas) ×
  4 positions (QB/RB/WR/TE) = 20 data points. Solid `var(--green)` for
  lowest rank per row, solid `var(--red)` for highest, `#111` text.

Architecture: `STATE.mode` ∈ {`consensus`, `analyst`} with per-mode
sub-state in separate localStorage keys. URL hash `#mode=analyst` for
deep-links. Both modes share the page's data layer + nav. Standalone
`analysts.html` was shipped briefly then merged into rankings.html —
file deleted, only one "Rankings" nav link.

**2. Shared `assets/js/adp-comparator.js` module** extracted from
tiers.html. Provides the calendar popup, `YEAR_CACHE`, `MONTH_INDEX`,
`_ensureYearLoaded`, `changeChipHtml`, and the trigger button markup
used by tiers' Previous ADP column header. Each consumer initializes
with its own `storageKey` + `onChange` callback. Tiers shrunk by
~310 lines as a result.

**3. Brand color standardization across all 6 pages.** Exhaustive audit
(every hex + rgba in every HTML/CSS/JS) caught 22 real drift hits across
6 files + 2 shared modules. All normalized to brand tokens. The biggest
source of disparity was `tiers.html` which had its own darker/muted
palette (`--green: #1a8754` forest vs brand `#4caf6e` bright, `#c33` red
vs brand `#e05252`, etc.) — now mirrors `brand.css` exactly. The full
COLOR USAGE RULE is now documented in a comment block at the top of
`brand.css` (8 categories: primary accent, secondary green, position
pills, active button/tab, trend badge, heatmap, bipolar highlights,
surface/borders). New `scripts/check-colors.py` enforces the rule:
`python scripts/check-colors.py` returns clean or names the file:line
of any drift. Recommended pre-`push.bat` step.

**4. Tiers ADP comparison feature** (previously shipped) is intact and
uses the new shared comparator module. Same calendar UX, just no longer
duplicated code. Cache tokens: `brand.css?v=1779920000`,
`mvs-extras.css?v=1779920000`, `player-panel.css?v=1779920000`,
`legend-content.js?v=1779840000`, `adp-comparator.js?v=1779360001`.

**Legend system is dev-grade.** Every algorithm with non-obvious logic
now has a `formula` / `inputs` / `output` / `example` / `codeRef` block in
`legend-content.js`. Phase A authored 6 new entries (Archetype Scoring,
Picks-as-Assets Relabeling, Trade Finder, Sleeper API Coupling, MVS Overlay
Precedence, Cross-Page Handoff). A developer opening the legend on any page
can now answer "why does this number look like that" without leaving the
drawer. `assets/js/legend.js` renderer was upgraded to display the new
optional fields in narrative order; `.lg-example` block in legend.css gives
worked-example rows an orange left-border accent. ~195 items across 41
sections, 5 pages. Cache token `legend-content.js?v=1779280000` (bumped
three times during the 2026-05-16 evening session as the ADP feature
iterated).

**Mobile Round 2 sub-plans A-E all shipped (2026-05-15).** Drawer header
collapse button menu (Sub-plan A), styled select for nav + "My Leagues"
label (Sub-plan C), profile reflow + articles collapsed by default
(Sub-plan B), search dropdown rendered above iOS keyboard (Sub-plan D),
Sleeper deeplink drops `/team` on mobile so the iOS app lands on the right
league (Sub-plan E).

**Theme polish (2026-05-15).** Three hardcoded color drift cases fixed so
the dark→light toggle flips cleanly on all 5 pages (commit `77822e9`).

**Pick modal wiring (2026-05-15).** Clicking a draft pick in the own-roster
picks table on My-Leagues now opens the **cross-league exposure picker**
(treats picks as first-class assets, same as a player). Originally wired
to Trade Builder; user redirected to exposure picker so they could answer
"which leagues do I have a 2026 2nd in?".

**Inline-style migration (2026-05-15).** Three commits (`2d4cf5b`,
`dc592c3`, `4294cef`) — A.1/A.2/A.3 — migrated repeated inline `style="..."`
patterns in `my-leagues.html` to CSS classes. Mid-frequency utility
patterns and table-cell constants moved out. Phase A complete; remaining
inline styles are dynamic or one-offs.

**ADP Tool has a year picker** (`2022 / 2023 / 2024 / 2025 / 2026`) —
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

**Final-polish round (after the initial doc commit)**: every ADP
`.box-card` is now a fixed `height: 78px` instead of `min-height: 60px`
so card heights stay uniform across years and tabs (rookie cards no
longer collapse below startup cards because of missing trend data).
`.card-meta` always renders (even with `&nbsp;` placeholder) to reserve
its row height. **My-Leagues player exposure scroll** got its real
fix — earlier I'd added `min-height: 0` to the list but the parent
`.ml-exposure-body` had no CSS at all so the flex chain was broken at
the middle node. Added `.ml-exposure-body { display: flex; flex:1;
min-height: 0; overflow: hidden }` and now scroll-on-hover works.

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

- **Flex-column scroll chain must be unbroken.** When a child element uses
  `flex: 1; overflow-y: auto; min-height: 0;` to scroll internally, EVERY
  ancestor in the chain back to the bounded parent must ALSO be a flex
  container with `flex: 1; min-height: 0;`. A single intermediate `div`
  with no CSS (defaults to `display: block`) breaks the chain — `flex: 1`
  on the child becomes a no-op, the child's height resolves to its content
  height, and `overflow: auto` never fires because there's nothing to
  overflow against. The wheel event falls through to the page. This bit
  My-Leagues' Player Exposure twice: `.ml-exposure-body` had no CSS at all.
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
- **Tiers ADP comparison lazy-loads historical year payloads** (~15 MB
  each). `YEAR_CACHE[currentSeason]` seeds from `window.ADP_PAYLOAD` at
  boot; other years fetch on demand. **Saved-year race**: if
  `localStorage 'fpts-tiers-compare-month'` is from a non-current year
  on boot, the data-ready handler MUST kick the lazy fetch BEFORE
  `AdpComparator.init` finalizes — otherwise init falls back to the
  newest 2026 option and overwrites the saved selection. The shared
  module handles this internally now via its own init logic; consumers
  just supply `storageKey` + `onChange`. See `tiers.html` /
  `rankings.html` for the standard init pattern.
- **rankings.html uses TWO manifests** loaded in parallel at boot:
  `data/rankings/manifest.json` (consensus combos) and
  `data/analyst-rankings/manifest.json` (analyst comparison positions).
  Each mode (`STATE.mode = 'consensus' | 'analyst'`) reads its own
  manifest and cache (`RANKINGS_CACHE` for consensus combos,
  `ANALYSTS_CACHE` for analyst positions). Mode switch lazy-fetches
  the missing combo via `_ensureComboLoaded` / `_ensurePositionLoaded`.
  URL hash `#mode=analyst` pre-sets STATE.mode on boot. Each mode has
  its own localStorage key prefix to avoid state collision.
- **Brand color rule + pre-push audit.** `scripts/check-colors.py` is
  the source of truth for "no off-brand color drift anywhere." Run it
  before every `push.bat`. When adding a new brand color, update
  `assets/css/brand.css` :root + COLOR USAGE RULE comment block, AND
  extend `BRAND_HEXES` (and possibly `LEGIT_RGBA_RGB`) at the top of
  the audit script. Keep both in lockstep or the audit drifts away
  from the actual brand.

---

## What's still on the punch list

Nothing structural. Polish / nice-to-haves only:

- [x] ~~**Formulas page + analyst hand-off doc**~~ — shipped 2026-05-17.
  New `formulas.html` (top-nav "Formulas") catalogs 56 entries across
  14 sections with provenance / examples / cross-links / "why this
  number" callouts. Markdown companion at `docs/FORMULAS.md`. 14 open
  heuristics flagged for analyst review. Source-of-truth pair —
  `docs/FORMULAS.md` + `assets/js/formulas-content.js` — must stay
  in sync; rule documented in `CLAUDE.md`.
- [x] ~~**Trade calculator pick-handling overhaul**~~ — shipped 2026-05-17.
  11-commit bug arc: compare-player async race, pick value object
  shape, PICK_VALUES window mirror, format toggle re-render, Reset
  All Filters / presets null-guard, visible filters drive calc,
  2026-2028 picks lit up, cross-page handoff fix, 149 lines of dead
  code removed. See `docs/CHANGES.md` 2026-05-17.
- [x] ~~**Rankings page + Analysts comparison merged into one page**~~ —
  shipped 2026-05-16 (late evening). New `rankings.html` replaces the
  external Rankings nav link. Two modes (Consensus / By Analyst) via
  underline tabs in the page-header. Manifest-driven format toggle +
  position filter + lazy-fetch per combo. Shared `adp-comparator.js`
  module extracted from tiers and consumed by both pages. See
  `docs/CHANGES.md` 2026-05-16 (late evening) for the full arc.
- [x] ~~**Brand color standardization across all pages**~~ — shipped
  2026-05-16 (late evening). 22 real drift hits fixed across 6 files +
  2 shared modules. COLOR USAGE RULE documented in `brand.css` head
  comment. `scripts/check-colors.py` enforces the rule: zero off-brand
  hexes anywhere in HTML/CSS/JS after the pass. Run before every
  `push.bat`.
- [x] ~~**Tiers ADP comparison + calendar popup picker**~~ — shipped
  2026-05-16 (evening). `tiers.html` gained Current ADP / Previous ADP /
  Change columns; Previous ADP anchor is user-selectable via a calendar
  popup spanning Dec 2021 → most-recent month. Now uses the shared
  `adp-comparator.js` module (refactor 2026-05-16 late-evening).
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
  **BLOCKED on user-supplied 1QB-active Sleeper usernames.**
- [x] ~~**Year-specific ADP**~~ — shipped 2026-05-14 (evening). ADP Tool
  has a year-picker dropdown (2022-2026). Per-year files under
  `data/adp-{year}.json`, `data/auction-{year}.json`,
  `data/pick-availability-{year}.json`. Backend filters offense-only
  and uses season-aware rookie classification. Years 2019-2021 dropped
  because their data shape differs from 2026.
- [x] ~~**Migrate remaining 3 pages to `data-bootstrap.js`**~~ — verified
  complete 2026-05-17 (third session). All 7 pages already route through
  `data-bootstrap.js`; `adp-tool` / `my-leagues` / `index` each use a
  `fpts:data-ready` listener for page-specific init (SLEEPER_IDS
  hydration, TRADES build from MVS, page-specific extra fetches like
  `data/adp-prev.json`). Zero hand-rolled `fetch('data/*.json')` calls
  remain across all HTML.
- [x] ~~**Migrate inline `:root` duplicates to canonical `brand.css`**~~ —
  shipped 2026-05-17 (third session). Added `--orange` and `--muted2` to
  `brand.css` canonical; deleted the inline `:root` + `[data-theme="light"]`
  blocks from `tiers` and `adp-tool` entirely; shrunk `index` and
  `my-leagues` inline blocks down to only the 3 page-specific texture
  tokens (`--tex-url/size/opacity`); removed the dead texture tokens from
  `trade-calculator` (no `body::before`, ~388 KB of unused inline base64
  image data deleted — file shrunk from 571 KB → 183 KB). Brand-color
  audit CLEAN across 24 files.
- [ ] `my-leagues.html` inline-style cleanup (~280 occurrences of
  `style="…"`). **DEFERRED — diminishing returns.** Phase A (2026-05-15)
  migrated the high-frequency repeated patterns. Remaining static residue
  is overwhelmingly 1-off; top repeated declaration sets are SVG
  `fill-rule:nonzero; fill:var(--black)` (13×, can't refactor) and
  `display:none/block` (JS toggles, must stay inline). See
  `docs/ml-inline-style-inventory.md` for the audit trail.
- [x] ~~Audit `push.bat` sync-check warnings~~ — done 2026-05-14
  (evening). Stale `tab-sync` + `chip-sync` detectors removed (their
  regex matched against retired per-page tab functions). The other
  three checks (`modal-sections` / `panel-css` / `legend-sync`) stay.
- [x] ~~**Trade corpus on all 5 modals**~~ — verified by code-path
  inspection 2026-05-17 (third session). Full chain: `data/mvs.json`
  → `data-bootstrap.js:186` writes `recentTrades` per player →
  `_buildTradesFromMvs` (player-panel.js:688) dedupes + normalizes →
  `_trades()` (line 183) lazy-caches → `tradeCardHtml` renders. All
  5 pages route through the same chain.
- [ ] **Analyst feedback loop** — heuristics flagged
  "Analyst input requested" in `formulas.html` + `docs/FORMULAS.md`.
  **BLOCKED on analyst recommendations.** When the analyst returns
  constants/threshold revisions, update **THREE** sources per the
  triple-sync rule:
    1. `docs/FORMULAS.md` (canonical doc)
    2. `assets/js/formulas-content.js` (in-app Formulas page)
    3. `assets/js/legend-content.js` (in-app Legend drawer per page)
  Current open items needing analyst input:
    - 14 original heuristics (trade-value multipliers, age-curve constants,
      buy/sell signal thresholds, tier assignments, etc. — see `formulas.html`)
    - **Mock-draft personality weights** (FORMULAS.md §51) — first-pass
      calibration shipped 2026-05-20 (twelfth session). Five archetype
      weights (adp / posNeed / value / scarcity / favor), per-personality
      reachTolerance + candidatePoolWindow values, softmax temperature
      (0.5), anti-clumping penalty (-0.3), jitter magnitude (±0.075), and
      My Guys favorites pool size (8 from top 80). All hand-tuned per the
      LLM Handoff Spec at `C:\Users\deons\Downloads\# Fantasy Draft
      Personality, Prediction & Availability System — Full….md`. Tune
      after running 10+ mocks vs the various archetypes. Triple-sync rule
      applies: update `mock-draft.html` (PERSONALITIES const) AND
      `docs/FORMULAS.md` §51 AND `assets/js/formulas-content.js` entry
      `mock-draft-personality-scoring` AND `assets/js/legend-content.js`
      'mock-draft' page entry.
    - ~~**Compare similarity scoring** (FORMULAS.md §44)~~ — **LOCKED
      2026-05-20 (twelfth session).** All three knobs (weights 25/30/45,
      delta windows ±8/±14/±4500, tier thresholds 90/75/60) reviewed and
      approved as the official design. Loose-tier matches stay in the
      top-5 list (muted styling signals "no great match" rather than
      hiding cards). Position-aware delta windows deferred until more
      data ships.
    - ~~**Best-in-row tie behavior** (FORMULAS.md §47)~~ — **LOCKED
      2026-05-20 (twelfth session).** Tie behavior unified across all
      three renderers — Table mode + Identity group + multi metric-table
      all use yellow `is-tied` band when every valid cell shares the top
      value. Partial top ties (e.g. [40,40,35]) keep green `is-best` on
      the co-winners. No near-tied threshold (strict equality only).
    - ~~**Last-N games window default** (FORMULAS.md §48)~~ — **LOCKED
      2026-05-20 (twelfth session).** Default window = 4 games (matches
      Underdog reference, reflects most-recent form). 8G/16G still
      available via the in-page toggle. Playoff weeks EXCLUDED from the
      rolling window — regular-season-only keeps the "playing now" signal
      clean. Playoff per-week stats still visible in Career-tab expanded
      year view.
    - ~~**Multi-card metric comparison bands** (FORMULAS.md §49)~~ —
      **LOCKED 2026-05-20 (twelfth session).** Strict equality only —
      no near-tied threshold. Same call as §47; both surfaces now unified
      with yellow `is-tied` band for literal ties + green `is-best` for
      clear winners. Close races (within 5%) still show a clear winner
      rather than washing into ambiguous yellow.
    - ~~**Compare-page scoring variants** (FORMULAS.md §50)~~ — **SHIPPED
      2026-05-20 (twelfth session).** `compare.html` now has a Scoring
      toggle in the page header with 4 presets: PPR (default), Half PPR,
      6pt TD, TEP. Wired through `SLEEPER.adjustStatsForLeague(stats,
      scoring)`; URL hash persistence via `?scoring=<key>`. Position
      threaded per slot via `_pcPlayerPos(name)` so TEP fires only on TEs.
      Row-group titles reflect the active preset. PPC + combined variants
      (TEP + 6pt TD) deferred — easy to add to PC_SCORING if requested.
- [x] ~~**Mock-draft + live-draft pick cards — ADP-card parity +
  trade-icon placement + above/below-ADP indicator**~~ — shipped
  2026-05-23 across three commits:
    - `207724a` — mock-draft: new `.card-delta` chip in `.card-top`
      next to `#{pickNo}`. ±5 threshold mirrors live-draft `_pickDelta`
      so VALUE (green `+N`) / REACH (red `−N`) / ON ADP (muted `·`)
      land consistently. Uses `player.rawAdp` for source-ADP parity
      with what users see on adp-tool / rankings.
    - `6678dda` — live-draft: `.ld-cell` rebuilt to match the
      `.box-card` recipe. Height 76 → 100px; new `.ld-cell-team-logo`
      (bottom-left, 32px) + `.ld-cell-hs` (bottom-right, 40px) coins
      lifted from adp-tool. `.ld-cell-traded` relocated from absolute
      bottom-right to center-bottom (between the coins). New
      `.ld-cell-delta` chip in `.ld-cell-top` driven by `_pickDelta()`
      with the per-draft fmtKey computed at the top of `ldRenderBoard`.
      Page-specific modifiers (.mine, .on-the-clock, .user-up-next,
      .traded, .empty) preserved unchanged.
    - `be9c1af` — live-draft mobile: `@media` downscale mirrors mock-
      draft's mobile sizing (cell 72px, hs 26px, logo 22×22 with 15px
      img, name padding-right 30px, top fonts 7px).
- [ ] Visual polish pass after live use — typography balance, mobile
  viewport on each page, dark/light theme toggle on the new accordion.
  **Next session focus: mobile issues.**
- [x] ~~**Player Comparison full page**~~ — shipped 2026-05-20 (tenth
  session) as `compare.html`. Both reference layouts landed: Profile
  mode (single-player hero + similar-matches row OR side-by-side
  2-player comparison) and Table mode (2-4 players, stat-category row
  groups, best-in-row green highlight). Tab content lives INSIDE each
  card so each card is a self-contained mini-profile. See README
  session-10 entry above for full architecture overview.
- [x] ~~**Migrate stats data to data-suite CSVs**~~ — shipped 2026-05-18
  (seventh session). Phases 1-8 covered ingest (`sync-stats.py` with
  composite-key support + season-mismatch guard), the bootstrap pipe
  (`data-bootstrap loadStats` → `window.STATS_DATA`), per-league scoring
  overlay (`SLEEPER.adjustStatsForLeague`), per-player projection
  (`SLEEPER.projectPlayer`), lineup math (`SLEEPER.lineupProjection`),
  the live-draft cascade through `_aggregateRoster` + `_computeLeagueRanks`
  + real archetype detection, and the my-leagues PPG + `ML_SEASON_PROJ`
  migration off Sleeper. Multi-year archive (2021-2025) at 1,104 players
  in `data/stats.json` (~1.8MB gzipped OTW).
- [x] ~~**ADP audit — players in wrong spots**~~ — shipped 2026-05-18
  (user-confirmed "adp looks way better"). Audit identified two root
  causes: position pollution (kickers ranked alongside QBs in rookie
  ADP) + small-sample noise (5-12-draft players appearing at top-30
  ranks because their handful of outlier drafts averaged out early).
  Fix: consumer-side filter in `data-bootstrap.js` `_cleanAdpPayload`
  — keep QB/RB/WR/TE only, drop entries below `max(25, corpus_max ×
  10%)`, re-rank within the filtered list. Auto-scales across the
  100x corpus-size gap between SF (~10K leagues) and 1QB (~hundreds).
  Raw payload preserved under `window.ADP_PAYLOAD_RAW` for the
  future ADP-tool research-mode toggle. Rookie draft display also
  capped at 4 rounds (R5 wasn't common enough practice). See commits
  `3fee1fd` + `22f45dd` + `1db152d` for the cascade.
- [x] ~~**Scoring-variant math layer (TEP / PPC / passing TD)**~~ — shipped
  2026-05-18 (seventh session) as part of the data-suite migration. Lives in
  `SLEEPER.adjustStatsForLeague(rawStats, scoring_settings)` in
  `assets/js/sleeper-helpers.js`. Pulls `bonus_rec_te`, `rush_att`,
  `pass_td`, `rec` from each league's Sleeper `scoring_settings` and
  applies bonuses on top of the base full-PPR / 4-pt-pass-TD line. Used
  by every projection consumer (live-draft Pick Analysis + Team Needs
  + Trade Suggestions; my-leagues PPG + ML_SEASON_PROJ + archetype).
- [x] ~~**Re-export 2021 + 2022 rushing "Basic" CSVs**~~ — shipped
  2026-05-19 (eighth session) in commit `3612da1`. User dropped fresh
  Basic-format CSVs at `data/source/stats/{2021,2022}/rushing.csv`;
  `sync-stats.config.json` lines 61 + 65 swapped from `"rushing (Advanced)"`
  → `"rushing"` with the full Basic field map (adds targets / rec /
  recYards / recTd from Receiving/*). `sync-stats.py` rerun regenerated
  `data/stats.json`. Najee Harris 2021 spot-check passes (rushAtt 307,
  rushYards 1200, targets 94, rec 74, recYards 467 — all real values).
- [x] ~~**Drift #4 — `player-panel.css` `!important` refactor**~~ —
  shipped 2026-05-19 (eighth session) in commits `4d9cd9c` (Pass 1
  consolidation) + `b309ccd` (Pass 2 specificity refactor). Mobile-section
  count dropped 97 → **4**, all 4 doctrine-legitimate inline-style
  defenders. Desktop CSS byte-equivalent (lines 1-317 untouched). Cache
  token bumped to `?v=1781500000` across all 8 consumers. Drift item
  closed; the full hard-rules audit punch list from session 7 is now done.
- [x] ~~**OBS Browser Source compatibility suite**~~ — shipped
  2026-05-19 (eighth session) across 4 commits. (1) `ee9df70` new
  `assets/js/iframe-scroll-fix.js` shared module (only runs when
  iframed; zero behavior change for direct visitors). (2) `21eb03e`
  custom combobox wrapper on `live-draft.html` — hides each native
  `<select class="ld-select">` and mirrors state via MutationObserver +
  per-instance `.value` setter override; native `<select>` keeps full
  JS API so existing cascading-picker logic is unchanged. Works around
  CEF's native-`<select>` rendering bug in cross-origin iframes on OBS
  32.1.2. (3) `ace0025` horizontal-scroll support — `overflow-x:auto`
  on html/body; `isScrollable` + wheel handler now detect horizontal
  scroll containers and defer in the `deltaX` direction. (4) `4c35b60`
  middle-click drag-scroll — manual Google-Maps-style pan since CEF
  doesn't surface the native middle-click gesture in iframes.
- [x] ~~**Rookies tab in my-leagues player exposure**~~ — shipped
  2026-05-19 (eighth session) in commit `ce85d59`. New `ROOKIE` filter
  button between TE and Picks; shows only `years_exp === 0` players
  (current-year rookies) scoped to QB/RB/WR/TE. `computePlayerExposure()`
  caches `yearsExp` on each entry; `renderExposureList()` adds a
  ROOKIE branch. Sidebar widened 360px → 440px (`.ml-columns` grid
  template) so long names like Christian McCaffrey no longer get
  ellipsis-truncated.
- [x] ~~**Back-to-top floating button**~~ — shipped 2026-05-19 (eighth
  session) in commit `5422fa5`. New `assets/js/back-to-top.js` shared
  module loaded by all 8 pages + template. Round red 44×44 button at
  `bottom: 70px; right: 18px` (stacked 12px above the Legend trigger),
  fades in when `scrollY > 400`, smooth-scroll on click, hides correctly
  behind open modals via `z-index: 150`.

---

## How to start the next Claude Code session

Paste this as the first message:

```
Read README.md for current state. End-of-2026-05-23 (sixteenth session):
- MOCK-DRAFT + LIVE-DRAFT CARD PARITY SHIP. Three asks bundled:
  * Mock-draft (207724a) — new .card-delta chip in .card-top next to
    #{pickNo}. ±5 threshold mirrors live-draft _pickDelta so VALUE
    (green +N) / REACH (red −N) / ON ADP (muted ·) land consistently
    across pages. Uses player.rawAdp for source-ADP parity.
  * Live-draft (6678dda) — bigger rebuild. .ld-cell height 76→100px;
    new .ld-cell-team-logo (bottom-left, 32px) + .ld-cell-hs (bottom-
    right, 40px) coins lifted from adp-tool. .ld-cell-traded chip
    relocated absolute bottom-right → center-bottom between the new
    coins (left:50%; transform:translateX(-50%); z-index:2). New
    .ld-cell-delta chip in .ld-cell-top driven by _pickDelta() with
    per-draft fmtKey computed once at top of ldRenderBoard. POS+delta
    wrapped in .ld-cell-top-right inline-flex span so flex
    space-between keeps them grouped on the right.
  * Live-draft mobile (be9c1af) — @media downscale mirrors mock-
    draft sizing: cell 72px, hs 26×26, logo 22×22 with 15×15 img,
    name padding-right 30px, top fonts 7px.
- PUNCH-LIST CLEANUP ARC (c360190 → 2ea3236 → 6c3bd36 → 3d4eb82).
  Open list shrunk 6 → 4 items: Player Comparison full page marked
  [x] (shipped session 10); Bulk tier rename + Cross-tier drag moved
  to new "Deferred — won't-do unless demand" subsection;
  card-parity item closed once implementation deployed.
- ADMIN SCRATCHPAD LEGEND DOCS (58bf7d5). New "Admin Scratchpad
  (operator-only)" section in legend-content.js 'tiers' page entry.
  10 items: activation flow + ⚙ Settings + four override layers
  (fpts-tier-overrides / -tier-title-overrides / -tier-order-override
  / -player-order-overrides) + Publish ⬆ Contents API + stale-CSV
  defense + Publish dry-run modal + Disable button. Cache token bump
  legend-content.js ?v=1786400001 → ?v=1787200000 across all 10
  deployed pages + templates/page-template.html.
- ADMIN-GATE FORMULAS + LEGEND (post-wrap-up follow-up). The
  Formulas top-nav link AND the Legend drawer's floating .lg-trigger
  button are visible ONLY when admin mode is active. Implementation:
  admin-tiers.js IIFE gained a top-of-file init block that adds
  `fpts-admin` class to <html> if fpts-admin-mode === 'true' (runs in
  render-blocking <head> → no flash). brand.css gained an
  "ADMIN-GATED UI" section right after NAV — default hides both
  surfaces with !important; html.fpts-admin restores their original
  display values (inline-flex / flex). mobile-nav-select option
  stripped via DOMContentLoaded JS since browsers ignore display:none
  on <option>. Direct URL to formulas.html still works — only entry
  points hidden. Cache token bumps: admin-tiers.js ?v=1786600000 →
  ?v=1787500000, brand.css ?v=1782600000 → ?v=1787500000 across all
  11 consumers (10 pages + template).
- Cache tokens at session close: legend-content.js ?v=1787200000,
  admin-tiers.js ?v=1787500000, brand.css ?v=1787500000 (all across
  10 pages + template). Page-local CSS on live-draft.html +
  mock-draft.html — no shared cache tokens touched.
- Color audit CLEAN across 34 files.

Confirm by running `git log --oneline -10`.

PUNCH LIST (present this to the user at session start — don't act
on any item without explicit user direction):
  1. Expand 1QB scrape SEED_USERS — external-blocked on user-supplied
     1QB-active Sleeper usernames.
  2. my-leagues inline-style cleanup — deferred (~46 remaining are
     the --bar-width / display:none design end-state).
  3. Analyst feedback loop — external-blocked on analyst recommendations
     for the 14 original heuristics in formulas.html.
  4. Visual polish — open-ended; surface specific issues as they come up.

CARRYOVER (still open, no change in session 16): mock-draft
personality weight calibration, Manager Clone archetype (blocked
on 1QB SEED_USERS), compare-page UX iteration, prospect-score
classifier, NFL draft round/pick (blocked on Sleeper API).

DEFERRED (won't-do unless demand emerges): Bulk tier rename,
Cross-tier drag.

ALL of the above are either user-deferred, external-blocked, or
require user direction. Don't auto-start work — present the list +
wait.
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

### Pages (7 live)
- **`index.html`** — trade database (largest, ~7000 lines; use Grep/offsets, never read in full)
- **`trade-calculator.html`** — trade value calculator
- **`tiers.html`** — dynasty trade tiers (uses `adp-comparator.js` for Previous-ADP calendar)
- **`adp-tool.html`** — ADP Tool (Box/List/heatmap views)
- **`my-leagues.html`** — Sleeper user/league importer (accordion player drawer)
- **`rankings.html`** — dynasty rankings with two modes (Consensus / By Analyst). Replaces the prior external FantasyPoints Rankings link. Uses `adp-comparator.js`.
- **`formulas.html`** — site-wide formula + calculation catalog (56 entries, 14 sections). Data-analyst hand-off + developer reference. Driven by `assets/js/formulas-content.js`. Companion doc: `docs/FORMULAS.md`.

### Shared modules (under `assets/`)
- **`assets/css/brand.css`** — canonical brand variables, fonts, top nav, position pills, page chrome, **125% body zoom**. Contains the **COLOR USAGE RULE** comment block at the top (above `:root`). Source of truth for new pages via the scaffold; 5 existing pages still inline-duplicate this CSS — all now mirror brand values exactly after the 2026-05-16 normalization.
- **`assets/js/data-bootstrap.js`** — shared data layer. Fetches `data/*.json` + populates `window.*` globals + fires `fpts:data-ready`.
- **`assets/js/team-helpers.js`** — NFL team logo helpers (`logoUrl`, `logoImg`, `headshotBadge`, `wrapWithBadge`). Sleeper-CDN-backed PNGs. Standard chip-context call: `TeamHelpers.logoImg(team, { size: 22, coin: true })`.
- **`assets/js/adp-comparator.js`** — **shared month-to-month ADP comparison module**. Provides the calendar popup, `YEAR_CACHE` (lazy-loaded per-year payloads), `MONTH_INDEX`, `changeChipHtml`, `renderTriggerHtml`. Used by both `tiers.html` and `rankings.html`. Each consumer calls `window.AdpComparator.init({ storageKey, onChange })`. CSS is injected by the module on first init.
- **`assets/css/player-panel.css`** + **`assets/js/player-panel.js`** — shared right-edge slide-out drawer (used by all 6 pages)
- **`assets/css/mvs-extras.css`** + **`assets/js/mvs-extras.js`** — MVS header (OTC, baseline, trade volume, contributor rankings, recent trades helpers)
- **`assets/js/player-articles.js`** — shared articles section (banner-style)
- **`assets/css/heatmap.css`** + **`assets/js/heatmap.js`** — ADP pick-availability heatmap (with "Data refreshed" stamp)
- **`assets/css/legend.css`** + **`assets/js/legend.js`** + **`legend-content.js`** — in-app developer legend drawer. The header comment block of `legend-content.js` is the canonical **design vocabulary** glossary.
- **`assets/js/formulas-content.js`** + **`assets/js/formulas.js`** — drives the Formulas page (`formulas.html`). 56-entry structured catalog with provenance / examples / cross-links / "why this number" callouts. Renderer auto-generates GitHub source deep-links from every file:line. Source-of-truth pair with `docs/FORMULAS.md` — keep both in sync on any formula change (see `CLAUDE.md`).

### Quality tools (tracked)
- **`scripts/check-colors.py`** — exhaustive brand-color audit. Run `python scripts/check-colors.py` before every `push.bat`. Exit 0 = clean, exit 1 = drift with file:line. See `docs/WORKFLOW.md` for usage + extension points.

### Scaffold for new pages
- **`templates/page-template.html`** — copy-this-to-start scaffold. See `docs/WORKFLOW.md` § "2b. Add a new page or tool" for the flow.

### Sync + deploy (all gitignored, local-only)
- **`sync-fp.py`** — FP + Sleeper sync
- **`sync-adp.py`** — dynasty ADP/auction/heatmap from parquets
- **`sync-mvs.py`** — MVS values from local CSV
- **`sync-tiers.py`** — Google Sheet → tiers.html
- **`sync-rankings.py`** — reads `data/source/rankings/*.csv` → writes `data/rankings/{analyst}-{format}.json` + `manifest.json`. Drives rankings.html Consensus mode.
- **`sync-analysts.py`** — reads `data/source/analysts/*.csv` (each contains 4 positions stacked, banner-delimited) → writes `data/analyst-rankings/{qb,rb,wr,te}.json` + `manifest.json`. Drives rankings.html By Analyst mode.
- **`import-tat.py`** — TAT CSV → Google Sheet
- **`make-pdf.ps1`** — regenerates function-reference PDF
- **`push.bat`** — full deploy pipeline (5+ sync steps + checks + commit + push)
- **`sync-adp.config.json`** / **`sync-fp.config.json`** / **`sync-tiers.config.json`** / **`sync-rankings.config.json`** / **`sync-analysts.config.json`** — local paths/credentials

### Docs
- **`docs/WORKFLOW.md`** — full operator manual
- **`docs/CHANGES.md`** — session-by-session changelog
- **`docs/FORMULAS.md`** — site-wide formula + calculation catalog (analyst hand-off). Live companion: `formulas.html`. Maintain in sync with `assets/js/formulas-content.js`.
- **`docs/function-reference.html`** + **`.pdf`** — printable function reference
- **`CLAUDE.md`** — per-project conventions for future Claude Code sessions (panel async-guard pattern, formulas dual-file sync, cache-bump rule for shared modules)

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
