# my-leagues.html inline-style inventory

Generated from `my-leagues.html` (8509 lines).
Total `style="..."` occurrences: **68**.

This is a read-only audit. No code was changed. The goal is to make the
refactor safe to execute supervised by giving every occurrence a category,
a section assignment, and an actionability verdict.

---

## Mode breakdown

| Mode | Count | % | Refactorable to CSS class? |
|---|---|---|---|
| `dynamic` | 44 | 64.7% | Conditional - if the interpolated value is a discrete enum, use a modifier class (e.g. `.is-active`); otherwise leave inline |
| `static` | 21 | 30.9% | Yes - pure HTML attribute, drop into a class |
| `dynamic-context` | 3 | 4.4% | Conditional - inside a JS-built HTML string; refactor only if the declaration set is static |

**Headline:** ~21 are directly refactorable, ~47 require case-by-case judgement, ~0 must stay inline (JS-set).

---

## Top 25 declaration properties

Which CSS properties carry most of the inline styling. Where one property dominates, a single utility class can collapse many sites.

| Property | Count |
|---|---|
| `color` | 15 |
| `display` | 14 |
| `font-style` | 7 |
| `font-family` | 6 |
| `background` | 6 |
| `font-weight` | 5 |
| `font-size` | 5 |
| `gap` | 4 |
| `align-items` | 4 |
| `margin-bottom` | 4 |
| `--st-pos-color` | 4 |
| `--archetype-bg` | 3 |
| `--archetype-fg` | 3 |
| `padding` | 3 |
| `width` | 3 |
| `--rank-color` | 3 |
| `border` | 3 |
| `--rp-stripe-color` | 3 |
| `border-radius` | 2 |
| `max-width` | 2 |
| `opacity` | 2 |
| `--pos-color` | 2 |
| `--cell-value-color` | 2 |
| `--cell-proj-color` | 2 |
| `--cell-proj-opacity` | 2 |

---

## Most-repeated declaration sets (>= 2 occurrences)

Each row below is a strong refactor candidate: same declaration set appearing N times -> create one class once, replace N sites.

| Count | Normalized declaration set |
|---|---|
| 7 | `display:none` |
| 2 | `...` |
| 2 | `--archetype-bg:${mlArchetypeBg(archetype)}; --archetype-fg:${mlArchetypeFg(archetype)}` |
| 2 | `color:${expoColor(p.exposure)}` |
| 2 | `--rp-stripe-color:var(--pos-pick-bg)` |
| 2 | `align-items:center; display:flex; gap:8px; margin-bottom:2px` |
| 2 | `color:var(--white); font-family:'Kanit',sans-serif; font-style:italic; font-weight:800` |
| 2 | `margin-right:8px` |

---

## Occurrences per region

Sorted by count - the busiest regions are the highest-leverage refactor batches.

| Count | Region (nearest banner-comment heading above the hit) |
|---|---|
| 6 | Sort rosters by chosen key |
| 5 | Close player-detail modal if open |
| 5 | Helpers |
| 5 | Total roster value |
| 5 | Trade Builder Modal — opens over the player detail modal (z-index 250) |
| 4 | PICKS BRANCH |
| 4 | Renders draft picks in the same visual layout as a position section so the |
| 4 | Stash render context on window so the sort buttons can re-render |
| 3 | Team logo helpers — load BEFORE player-panel.js so modal-hero badge works. |
| 3 | Render an archetype chip |
| 3 | Ensure roster/users/players are loaded and stashed on window for the modal layer |
| 3 | Group transactions by roster |
| 2 | Sort state for the leagues list |
| 2 | Save current scoped IDs so the existing loadRoster / loadAllTrades can target them |
| 2 | Color helpers |
| 2 | Store per-league so multiple leagues can expand without collision |
| 2 | Aggregate per-roster |
| 2 | Update section meta with archetype legend + league averages |
| 1 | Columns: expandable league list (left) + player exposure (right) |
| 1 | RIGHT: player exposure sidebar |
| 1 | Archetype lookup for the owning team |
| 1 | Render the current state of the suggestion pre-screener |
| 1 | Render the current suggestion as a single card |
| 1 | Close modals on Escape |

---

## Recommended phased refactor plan

Each phase is one short, supervised session. Verify in-browser between phases.

**Phase A - low-risk batch refactors** (target: the top 5-10 most-repeated declaration sets above)
- For each declaration set with count >= 4: add one CSS class to `body.fpts-ml-page` scope, then sweep-replace the matching `style="..."` attributes with `class="<new-class>"`.
- Skip occurrences inside JS template literals (mode `dynamic-context`) until Phase C - their host strings rebuild on every render so they're trickier to edit.
- Verify: open my-leagues, walk through League Importer -> Roster table -> Exposure list -> Trade Builder -> Heatmap. Spot-check visual diffs.

**Phase B - static template attributes** (target: the remaining `static` occurrences not covered by Phase A)
- These are the long tail of one-off inline declarations. For each region, decide: keep inline (one-off), promote to a `.ml-<region>-<purpose>` utility class, or absorb into an existing class.
- Where the declaration is truly unique to one element, **leaving it inline is fine** - the goal is reducing duplication, not zero-inline-styles.

**Phase C - dynamic-context occurrences inside JS template literals**
- Look at each `dynamic-context` occurrence. If the declaration set is static (no `${...}`), the only reason it's tagged dynamic is the surrounding backtick. Replace the inline style with a class in the JS template - same edit, just inside a string.
- Where the style contains `${...}` (mode `dynamic`), apply the modifier-class pattern when the interpolated value comes from a small enum (e.g. position color, status flag). Where the value is truly continuous (e.g. computed pixel widths), leave inline.

**Phase D - JS-set styles**
- The `js-composed` count above. **Do not refactor these.** They're imperative DOM mutations; moving them to CSS requires a logic refactor, not a style refactor. Leave them.

**Phase E - cleanup**
- Re-run `audit-ml-styles.py`. If total occurrences dropped by >70% and the remaining are mostly `js-composed` + truly-one-off, declare the task done.

---

## All occurrences (by region, with line numbers)

Every hit, grouped under the nearest banner-comment heading above it. Use this to find specific lines while refactoring.

### Sort rosters by chosen key (6)

| Line | Mode | Declaration |
|---|---|---|
| 8203 | dynamic | `--bar-width:${w}%;--bar-color:${posColors[pos]}` |
| 8208 | dynamic | `--top-pos-color:${posColors[r.topScoringPos]}` |
| 8227 | dynamic | `--st-pos-color:${posColors.QB}` |
| 8228 | dynamic | `--st-pos-color:${posColors.RB}` |
| 8229 | dynamic | `--st-pos-color:${posColors.WR}` |
| 8230 | dynamic | `--st-pos-color:${posColors.TE}` |

### Close player-detail modal if open (5)

| Line | Mode | Declaration |
|---|---|---|
| 5277 | dynamic-context | `margin-top:14px;padding-top:14px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:8px;align-items:center` |
| 5279 | static | `display:inline-block;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:12px;color:var(--white);backgro...` |
| 5281 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-style:italic;text-align:center;line-height:1.5;max-width...` |
| 5295 | dynamic | `color:${diff>0?'var(--red)':diff<0?'var(--green)':'var(--white)'}` |
| 5355 | dynamic-context | `opacity:.5` |

### Helpers (5)

| Line | Mode | Declaration |
|---|---|---|
| 7078 | dynamic | `--cell-value-color:${valColor(r.value)}` |
| 7080 | dynamic | `--cell-proj-color:${seasonProjColor};--cell-proj-opacity:${seasonProjOpacity}` |
| 7081 | dynamic | `--cell-proj-color:${projColor};--cell-proj-opacity:${projOpacity}` |
| 7098 | dynamic | `--rp-stripe-color:${posColors[pos]}` |
| 7102 | dynamic | `--rp-total-color:${posColors[pos]}` |

### Total roster value (5)

| Line | Mode | Declaration |
|---|---|---|
| 7231 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:${_rankColor(rank)};padding:1px 6px;backg...` |
| 7235 | static | `display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px;padding:16px;background:var(--surface2);border:1px solid var(--border)` |
| 7236 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 7238 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 7241 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:var(--green)` |

### Trade Builder Modal — opens over the player detail modal (z-index 250) (5)

| Line | Mode | Declaration |
|---|---|---|
| 8486 | static | `z-index:250` |
| 8490 | static | `margin-right:8px` |
| 8497 | static | `z-index:260` |
| 8498 | static | `max-width:540px` |
| 8501 | static | `margin-right:8px` |

### PICKS BRANCH (4)

| Line | Mode | Declaration |
|---|---|---|
| 6615 | static | `background:var(--surface2);display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border)` |
| 6615 | static | `display:block` |
| 6617 | dynamic | `color:#9b91d4` |
| 6620 | dynamic | `color:${expoColor(p.exposure)}` |

### Renders draft picks in the same visual layout as a position section so the (4)

| Line | Mode | Declaration |
|---|---|---|
| 7145 | static | `--rp-stripe-color:var(--pos-pick-bg)` |
| 7182 | dynamic | `--cell-value-color:${valColor}` |
| 7192 | static | `--rp-stripe-color:var(--pos-pick-bg)` |
| 7196 | dynamic | `--rp-total-color:var(--pos-pick-bg)` |

### Stash render context on window so the sort buttons can re-render (4)

| Line | Mode | Declaration |
|---|---|---|
| 8099 | dynamic | `--mpx-color:${mpxColor}` |
| 8112 | dynamic | `--pos-color:${posColors[pos]}` |
| 8117 | dynamic | `--rank-color:${color}` |
| 8122 | dynamic | `--rank-color:${scoreColor}` |

### Team logo helpers — load BEFORE player-panel.js so modal-hero badge works. (3)

| Line | Mode | Declaration |
|---|---|---|
| 2972 | static | `...` |
| 3029 | static | `...` |
| 3195 | static | `display:none` |

### Render an archetype chip (3)

| Line | Mode | Declaration |
|---|---|---|
| 3881 | dynamic | `--pos-bg:${c}` |
| 3981 | static | `display:none` |
| 3986 | static | `display:none` |

### Ensure roster/users/players are loaded and stashed on window for the modal layer (3)

| Line | Mode | Declaration |
|---|---|---|
| 5973 | dynamic | `--pos-color:${color}` |
| 5975 | dynamic | `--rank-color:${rankColor}` |
| 6019 | dynamic | `display:none` |

### Group transactions by roster (3)

| Line | Mode | Declaration |
|---|---|---|
| 7742 | dynamic | `color:var(--red);font-size:10px;font-style:italic` |
| 7743 | dynamic | `color:var(--yellow)` |
| 7743 | dynamic | `color:var(--green)` |

### Sort state for the leagues list (2)

| Line | Mode | Declaration |
|---|---|---|
| 5767 | dynamic | `width:${w}%;background:${s.color}` |
| 5774 | dynamic-context | `opacity:.3` |

### Save current scoped IDs so the existing loadRoster / loadAllTrades can target them (2)

| Line | Mode | Declaration |
|---|---|---|
| 6100 | dynamic | `--archetype-bg:${mlArchetypeBg(archetype)};--archetype-fg:${mlArchetypeFg(archetype)}` |
| 6111 | dynamic | `--pos-chip-color:${color};--rank-chip-color:${rankColor}` |

### Color helpers (2)

| Line | Mode | Declaration |
|---|---|---|
| 6716 | dynamic | `color:${posColor(p.position)}` |
| 6719 | dynamic | `color:${expoColor(p.exposure)}` |

### Store per-league so multiple leagues can expand without collision (2)

| Line | Mode | Declaration |
|---|---|---|
| 7389 | static | `margin-bottom:12px` |
| 7390 | static | `display:none` |

### Aggregate per-roster (2)

| Line | Mode | Declaration |
|---|---|---|
| 7547 | dynamic | `width:${maxSpent ? (r.spent/maxSpent*100).toFixed(0) : 0}%` |
| 7549 | dynamic | `width:${budget ? (r.left/budget*100).toFixed(0) : 0}%` |

### Update section meta with archetype legend + league averages (2)

| Line | Mode | Declaration |
|---|---|---|
| 8144 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 8144 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |

### Columns: expandable league list (left) + player exposure (right) (1)

| Line | Mode | Declaration |
|---|---|---|
| 3217 | static | `display:none` |

### RIGHT: player exposure sidebar (1)

| Line | Mode | Declaration |
|---|---|---|
| 3243 | static | `display:none` |

### Archetype lookup for the owning team (1)

| Line | Mode | Declaration |
|---|---|---|
| 4317 | dynamic | `--archetype-bg:${mlArchetypeBg(r.ownerArchetype)};--archetype-fg:${mlArchetypeFg(r.ownerArchetype)}` |

### Render the current state of the suggestion pre-screener (1)

| Line | Mode | Declaration |
|---|---|---|
| 4684 | dynamic | `--archetype-bg:${mlArchetypeBg(archetype)};--archetype-fg:${mlArchetypeFg(archetype)}` |

### Render the current suggestion as a single card (1)

| Line | Mode | Declaration |
|---|---|---|
| 4814 | dynamic | `--balance-color:${balanceColor}` |

### Close modals on Escape (1)

| Line | Mode | Declaration |
|---|---|---|
| 5403 | dynamic | `color:${color};border-color:${color};background:${bg}` |
