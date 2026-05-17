# CLAUDE.md — project conventions for Claude

Project conventions that aren't obvious from reading the code. Add to this file when you encounter a non-obvious rule or pattern that future sessions need to follow.

---

## Branding: white text on every bright fill, never opacity on colored parents

The site has a strict branding rule, codified at the top of `assets/css/brand.css` ("THE BRANDING HARD RULES"). Summary:

1. **WHITE text on every bright-colored fill.** Position pills, tier badges, heat tints (`.rk-min`/`.rk-max`), `*.active` button states, `.mvs-vol-hot`/`.mvs-vol-warm`, `.hm-flash-label`, `.lg-trigger`, every place a bright brand color is a `background` — the text inside is `var(--white)`. Position text tokens (`--pos-qb`, `--pos-rb`, `--pos-wr`, `--pos-te`, `--pos-k`, `--pos-pick`) resolve to white in dark theme — `color: var(--pos-qb)` and `color: var(--white)` are equivalent. The one exception: bg is itself white/muted/surface (e.g. `.fm-prov-chip.prov-framework`) — then dark text is correct.
2. **Never use `opacity:` on a parent that contains a colored child.** CSS opacity compounds down to all children and can't be overridden by `opacity: 1` on the child. To fade muted text, use `color: rgba(255,255,255,X)` directly on the text element. Reserve `opacity:` for leaf-only elements (placeholders, footnotes, disabled state on a standalone button with no children).
3. **Brand tokens are the source of truth in `brand.css`.** 6 inline `:root` duplicates exist in HTML pages (index, trade-calculator, adp-tool, my-leagues, tiers) — they must match `brand.css` exactly. Never hardcode `color: #111` on a bright fill; reference the token.
4. **Vibrant by default.** "Grey-looking" surfaces are a bug. The cause is always one of: (a) opacity compounding from a parent, (b) hardcoded `#111` text on a bright fill, (c) wrong token reference. Don't ship a "grey" surface that should be colored.
5. **`python scripts/check-colors.py` must print CLEAN after any change.** Extend `BRAND_HEXES` if you add a new brand color.

**Cache bump:** any change to `brand.css`, `mvs-extras.css`, `heatmap.css`, `legend.css`, or `player-panel.css` requires bumping `?v=...` on the `<link>`/`<script>` tag in every page that loads it. Browsers cache hard.

---

## Recipes for new components (follow these instead of inventing new patterns)

The branding rules above tell you what NOT to do. These recipes tell you what TO do when adding new UI. Each pattern is already proven across the site — reuse, don't reinvent.

### Adding a new TABLE

```css
.my-table thead th {
  background: var(--surface2); color: rgba(255,255,255,0.45);
  font-family: 'Mulish', sans-serif; font-weight: 700; font-size: 10px;
  text-transform: uppercase; letter-spacing: .06em;
  padding: 10px 8px; text-align: center;
  border-bottom: 1px solid var(--border);
}
.my-table td {
  padding: 8px; border-bottom: 1px solid var(--border);
  color: var(--white); text-align: center;
}
.my-table .col-num { text-align: center; font-variant-numeric: tabular-nums; }
.my-table .col-name, .my-table th[data-col="name"] { text-align: left; }
```

- Padding MUST be symmetric (`8px` each side, not `8px 12px 8px 0`) — centered content centers correctly only when padding is balanced.
- Variable-length text columns (Player / Pick / Team / etc.) override to `text-align: left`. Use a `col-name`-style class on data cells AND a `th[data-col="<key>"]` attribute selector on the header.
- Numeric cells: `font-variant-numeric: tabular-nums` so single/double/triple-digit numbers vertically align.

### Adding a new pill / badge

- Use `.pos-pill.<POS>` from `brand.css` directly for QB/RB/WR/TE/K/DEF/PICK — no new CSS needed.
- For a NEW categorical badge (not position), follow this pattern:
  ```css
  .my-badge { display:inline-block; padding:3px 9px; font-family:'Kanit',sans-serif; font-weight:800; font-style:italic; font-size:11px; letter-spacing:.04em; }
  .my-badge.success { background: var(--green); color: var(--white); }
  .my-badge.warning { background: var(--pos-te-bg); color: var(--white); }
  .my-badge.danger  { background: var(--red); color: var(--white); }
  ```
  ALWAYS `color: var(--white)` on a bright fill. NEVER `color: #111` — that's the dim look we explicitly fixed across the site.

### Adding a new "active" button state

```css
.my-btn.active { background: var(--red); color: var(--white); border-color: var(--red); }
```

Match existing patterns: `.icon-btn.active`, `.rk-format-btn.active`, `.controls-btn.active`, `.tier-toggle-btn.active`. White text on the brand-orange fill.

### Adding a new drawer tab

- If it renders a table, reuse the inline-style constants from `player-panel.js` `renderPlayerStats` (around line 1420): `_thBase`, `thStyle`, `thStyleName`, `_tdBase`, `tdStyle`, `tdNum`, `tdName`. Copy-paste them into the new tab's renderer.
- If it's not a table, follow `.pp-tab` styling.
- Cache bump `player-panel.js` after any change.

### Adding a new section toggle

- Underline-style toggle (Trade History / Waivers / Standings on my-leagues): use `.ml-section-toggle-btn`.
- Pill-style toggle (year tabs, waivers sub-tabs): use `.ml-history-tab`.
- Mode tab on a top-of-page header (Consensus / By Analyst on rankings, Dynasty Startup / Dynasty Rookie on adp-tool): use `.rk-mode-tab` or `.adp-tab` pattern — big italic uppercase Kanit with red border-bottom on active.

### Adding muted text

```css
.my-muted-label { color: rgba(255,255,255,0.45); }   /* ✓ correct */
```

NEVER:
```css
.my-muted-label { color: var(--white); opacity: 0.45; }   /* ✗ compounds to children */
```

If the muted element contains any colored child (pill, badge, logo, icon with its own color), the parent's `opacity:` dims the child too — a bug that can't be overridden by `opacity: 1` on the child. Always put alpha on the `color` property directly via `rgba()`. The only safe `opacity:` is on leaf elements with no children, OR on `:hover` / `:disabled` state transitions.

### Verification

After ANY change, before commit:
1. `python scripts/check-colors.py` — must print CLEAN.
2. The script is wired into `push.bat` and will fail the deploy if drift is detected.

---

## Player panel: async fetches MUST guard against player switches

The shared `assets/js/player-panel.js` drawer reuses a single set of DOM containers (`#pp-stats-tab`, `#pp-exp-val`, etc.) across every player the user opens. The "+ Add player to compare" search lets the user swap players inside the open drawer.

**The bug class:** any `fetch(...).then(write to DOM)` started for player A will resolve at an unpredictable time. If the user has already switched to player B by then, A's late response overwrites B's DOM — both tabs end up showing the same (stale) data.

**The rule:** every async DOM write in the panel system must capture the target player at render time and bail at resolution time if the user has switched.

**The pattern** (see `player-panel.js:1306` `renderPlayerStats` and `player-panel.js:600` years-of-experience fetch for reference implementations):

```js
function renderSomething(containerId, player) {
  const targetName = player.label;            // capture at call time

  fetch(url).then(data => {
    const active = global._currentPanelPlayer;
    if (!active || active.label !== targetName) return;   // bail if switched
    el.innerHTML = render(data);
  }).catch(() => {
    const active = global._currentPanelPlayer;
    if (!active || active.label !== targetName) return;   // guard catch too
    el.innerHTML = 'Error';
  });
}
```

`global._currentPanelPlayer` is set inside `openPanelContent` (`player-panel.js:662`) on every player switch and is the source of truth for "who is the panel currently showing."

**When this applies:** any new panel tab or post-open hook that does a `fetch`, awaits a Promise, or schedules a `setTimeout` callback that writes player-specific data into a `#pp-*` element.

**When this does NOT apply:** synchronous renders that read from already-loaded globals (`FP_VALUES`, `ADP_PAYLOAD`, `MVS_PAYLOAD`, `PLAYER_ARTICLES`, `ML_ALL_LEAGUE_DATA`, etc.). Most existing renderers — `renderAgeCurve`, `renderTradeFinder`, `Heatmap.render`, `MvsExtras.buildHeader`, `PlayerArticles.mount`, `renderPlayerAvailability` — are synchronous and safe.

**One-time page-init fetches** (e.g. `loadPlayerArticles()` in `index.html:1546`) are also safe — they populate a global once, and per-render reads are synchronous.

**Cache bump:** any change to `player-panel.js` requires bumping `?v=...` on the `<script src>` tag in all 7 pages (index, trade-calculator, tiers, adp-tool, my-leagues, rankings, formulas) plus `templates/page-template.html`. Browsers cache the file hard and won't pick up changes otherwise.

---

## Formulas catalog: keep `docs/FORMULAS.md` and `assets/js/formulas-content.js` in sync

The site has a user-facing **Formulas page** (`formulas.html`) and a markdown handoff doc (`docs/FORMULAS.md`). They contain the same 56-entry catalog of formulas / thresholds / heuristics but in different formats — the markdown is the static analyst-handoff artifact, the JS structured data drives the live page.

**The rule:** any change to a formula, threshold, multiplier, or heuristic in the codebase must update **both files** in the same commit:
- `docs/FORMULAS.md` — markdown entry with file:line, verbatim math, notes
- `assets/js/formulas-content.js` — structured JS entry with the same fields plus `provenance`, `example`, `related`, and (for heuristics) `whyThisNumber`

Header comments in both files repeat this rule. There is no audit script that enforces drift between them — it's manual discipline.

When adding a new formula entry to `formulas-content.js`, also:
- Pick the correct `provenance.kind` from the list at the top of the file
- Add `related` cross-links both directions (if entry X depends on Y, list Y in X.related AND X in Y.related)
- For heuristics (hand-tuned constants), add `whyThisNumber` with the actual reasoning or the literal string "Analyst input requested" if origin is undocumented

The renderer (`assets/js/formulas.js`) auto-generates a "View source on GitHub" deep-link from every `location: 'file:line'` value, so the link stays valid as long as the file:line is correct.
