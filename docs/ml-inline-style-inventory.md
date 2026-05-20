# my-leagues.html inline-style inventory

Generated from `my-leagues.html` (8552 lines).
Total `style="..."` occurrences: **52**.

This is a read-only audit. No code was changed. The goal is to make the
refactor safe to execute supervised by giving every occurrence a category,
a section assignment, and an actionability verdict.

---

## Mode breakdown

| Mode | Count | % | Refactorable to CSS class? |
|---|---|---|---|
| `dynamic` | 40 | 76.9% | Conditional - if the interpolated value is a discrete enum, use a modifier class (e.g. `.is-active`); otherwise leave inline |
| `static` | 11 | 21.2% | Yes - pure HTML attribute, drop into a class |
| `dynamic-context` | 1 | 1.9% | Conditional - inside a JS-built HTML string; refactor only if the declaration set is static |

**Headline:** ~11 are directly refactorable, ~41 require case-by-case judgement, ~0 must stay inline (JS-set).

---

## Top 25 declaration properties

Which CSS properties carry most of the inline styling. Where one property dominates, a single utility class can collapse many sites.

| Property | Count |
|---|---|
| `color` | 8 |
| `display` | 7 |
| `--rank-color` | 4 |
| `--st-pos-color` | 4 |
| `--archetype-bg` | 3 |
| `--archetype-fg` | 3 |
| `width` | 3 |
| `--rp-stripe-color` | 3 |
| `font-style` | 3 |
| `background` | 2 |
| `--pos-color` | 2 |
| `--cell-value-color` | 2 |
| `--cell-proj-color` | 2 |
| `--cell-proj-opacity` | 2 |
| `--rp-total-color` | 2 |
| `font-family` | 2 |
| `font-weight` | 2 |
| `--pos-bg` | 1 |
| `--balance-color` | 1 |
| `--net-color` | 1 |
| `border-color` | 1 |
| `opacity` | 1 |
| `--pos-chip-color` | 1 |
| `--rank-chip-color` | 1 |
| `--expo-color` | 1 |

---

## Most-repeated declaration sets (>= 2 occurrences)

Each row below is a strong refactor candidate: same declaration set appearing N times -> create one class once, replace N sites.

| Count | Normalized declaration set |
|---|---|
| 7 | `display:none` |
| 2 | `...` |
| 2 | `--archetype-bg:${mlArchetypeBg(archetype)}; --archetype-fg:${mlArchetypeFg(archetype)}` |
| 2 | `--rp-stripe-color:var(--pos-pick-bg)` |
| 2 | `color:var(--white); font-family:'Kanit',sans-serif; font-style:italic; font-weight:800` |

---

## Occurrences per region

Sorted by count - the busiest regions are the highest-leverage refactor batches.

| Count | Region (nearest banner-comment heading above the hit) |
|---|---|
| 6 | Sort rosters by chosen key |
| 5 | Helpers |
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
| 1 | Close player-detail modal if open |
| 1 | Close modals on Escape |
| 1 | PICKS BRANCH |
| 1 | Total roster value |

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
| 8246 | dynamic | `--bar-width:${w}%;--bar-color:${posColors[pos]}` |
| 8251 | dynamic | `--top-pos-color:${posColors[r.topScoringPos]}` |
| 8270 | dynamic | `--st-pos-color:${posColors.QB}` |
| 8271 | dynamic | `--st-pos-color:${posColors.RB}` |
| 8272 | dynamic | `--st-pos-color:${posColors.WR}` |
| 8273 | dynamic | `--st-pos-color:${posColors.TE}` |

### Helpers (5)

| Line | Mode | Declaration |
|---|---|---|
| 7121 | dynamic | `--cell-value-color:${valColor(r.value)}` |
| 7123 | dynamic | `--cell-proj-color:${seasonProjColor};--cell-proj-opacity:${seasonProjOpacity}` |
| 7124 | dynamic | `--cell-proj-color:${projColor};--cell-proj-opacity:${projOpacity}` |
| 7141 | dynamic | `--rp-stripe-color:${posColors[pos]}` |
| 7145 | dynamic | `--rp-total-color:${posColors[pos]}` |

### Renders draft picks in the same visual layout as a position section so the (4)

| Line | Mode | Declaration |
|---|---|---|
| 7188 | static | `--rp-stripe-color:var(--pos-pick-bg)` |
| 7225 | dynamic | `--cell-value-color:${valColor}` |
| 7235 | static | `--rp-stripe-color:var(--pos-pick-bg)` |
| 7239 | dynamic | `--rp-total-color:var(--pos-pick-bg)` |

### Stash render context on window so the sort buttons can re-render (4)

| Line | Mode | Declaration |
|---|---|---|
| 8142 | dynamic | `--mpx-color:${mpxColor}` |
| 8155 | dynamic | `--pos-color:${posColors[pos]}` |
| 8160 | dynamic | `--rank-color:${color}` |
| 8165 | dynamic | `--rank-color:${scoreColor}` |

### Team logo helpers — load BEFORE player-panel.js so modal-hero badge works. (3)

| Line | Mode | Declaration |
|---|---|---|
| 3017 | static | `...` |
| 3074 | static | `...` |
| 3240 | static | `display:none` |

### Render an archetype chip (3)

| Line | Mode | Declaration |
|---|---|---|
| 3926 | dynamic | `--pos-bg:${c}` |
| 4026 | static | `display:none` |
| 4031 | static | `display:none` |

### Ensure roster/users/players are loaded and stashed on window for the modal layer (3)

| Line | Mode | Declaration |
|---|---|---|
| 6016 | dynamic | `--pos-color:${color}` |
| 6018 | dynamic | `--rank-color:${rankColor}` |
| 6062 | dynamic | `display:none` |

### Group transactions by roster (3)

| Line | Mode | Declaration |
|---|---|---|
| 7785 | dynamic | `color:var(--red);font-size:10px;font-style:italic` |
| 7786 | dynamic | `color:var(--yellow)` |
| 7786 | dynamic | `color:var(--green)` |

### Sort state for the leagues list (2)

| Line | Mode | Declaration |
|---|---|---|
| 5810 | dynamic | `width:${w}%;background:${s.color}` |
| 5817 | dynamic-context | `opacity:.3` |

### Save current scoped IDs so the existing loadRoster / loadAllTrades can target them (2)

| Line | Mode | Declaration |
|---|---|---|
| 6143 | dynamic | `--archetype-bg:${mlArchetypeBg(archetype)};--archetype-fg:${mlArchetypeFg(archetype)}` |
| 6154 | dynamic | `--pos-chip-color:${color};--rank-chip-color:${rankColor}` |

### Color helpers (2)

| Line | Mode | Declaration |
|---|---|---|
| 6759 | dynamic | `color:${posColor(p.position)}` |
| 6762 | dynamic | `color:${expoColor(p.exposure)}` |

### Store per-league so multiple leagues can expand without collision (2)

| Line | Mode | Declaration |
|---|---|---|
| 7432 | static | `margin-bottom:12px` |
| 7433 | static | `display:none` |

### Aggregate per-roster (2)

| Line | Mode | Declaration |
|---|---|---|
| 7590 | dynamic | `width:${maxSpent ? (r.spent/maxSpent*100).toFixed(0) : 0}%` |
| 7592 | dynamic | `width:${budget ? (r.left/budget*100).toFixed(0) : 0}%` |

### Update section meta with archetype legend + league averages (2)

| Line | Mode | Declaration |
|---|---|---|
| 8187 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 8187 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |

### Columns: expandable league list (left) + player exposure (right) (1)

| Line | Mode | Declaration |
|---|---|---|
| 3262 | static | `display:none` |

### RIGHT: player exposure sidebar (1)

| Line | Mode | Declaration |
|---|---|---|
| 3288 | static | `display:none` |

### Archetype lookup for the owning team (1)

| Line | Mode | Declaration |
|---|---|---|
| 4362 | dynamic | `--archetype-bg:${mlArchetypeBg(r.ownerArchetype)};--archetype-fg:${mlArchetypeFg(r.ownerArchetype)}` |

### Render the current state of the suggestion pre-screener (1)

| Line | Mode | Declaration |
|---|---|---|
| 4729 | dynamic | `--archetype-bg:${mlArchetypeBg(archetype)};--archetype-fg:${mlArchetypeFg(archetype)}` |

### Render the current suggestion as a single card (1)

| Line | Mode | Declaration |
|---|---|---|
| 4859 | dynamic | `--balance-color:${balanceColor}` |

### Close player-detail modal if open (1)

| Line | Mode | Declaration |
|---|---|---|
| 5338 | dynamic | `--net-color:${diff>0?'var(--red)':diff<0?'var(--green)':'var(--white)'}` |

### Close modals on Escape (1)

| Line | Mode | Declaration |
|---|---|---|
| 5446 | dynamic | `color:${color};border-color:${color};background:${bg}` |

### PICKS BRANCH (1)

| Line | Mode | Declaration |
|---|---|---|
| 6663 | dynamic | `--expo-color:${expoColor(p.exposure)}` |

### Total roster value (1)

| Line | Mode | Declaration |
|---|---|---|
| 7274 | dynamic | `--rank-color:${_rankColor(rank)}` |
