# my-leagues.html inline-style inventory

Generated from `my-leagues.html` (8875 lines).
Total `style="..."` occurrences: **47**.

This is a read-only audit. No code was changed. The goal is to make the
refactor safe to execute supervised by giving every occurrence a category,
a section assignment, and an actionability verdict.

---

## Mode breakdown

| Mode | Count | % | Refactorable to CSS class? |
|---|---|---|---|
| `dynamic` | 35 | 74.5% | Conditional - if the interpolated value is a discrete enum, use a modifier class (e.g. `.is-active`); otherwise leave inline |
| `static` | 11 | 23.4% | Yes - pure HTML attribute, drop into a class |
| `dynamic-context` | 1 | 2.1% | Conditional - inside a JS-built HTML string; refactor only if the declaration set is static |

**Headline:** ~11 are directly refactorable, ~36 require case-by-case judgement, ~0 must stay inline (JS-set).

---

## Top 25 declaration properties

Which CSS properties carry most of the inline styling. Where one property dominates, a single utility class can collapse many sites.

| Property | Count |
|---|---|
| `display` | 8 |
| `--rank-color` | 4 |
| `--st-pos-color` | 4 |
| `--archetype-bg` | 3 |
| `--archetype-fg` | 3 |
| `color` | 3 |
| `width` | 3 |
| `--rp-stripe-color` | 3 |
| `background` | 2 |
| `--pos-color` | 2 |
| `--cell-value-color` | 2 |
| `--cell-proj-color` | 2 |
| `--cell-proj-opacity` | 2 |
| `--rp-total-color` | 2 |
| `--pos-bg` | 1 |
| `--balance-color` | 1 |
| `--net-color` | 1 |
| `border-color` | 1 |
| `opacity` | 1 |
| `--pos-chip-color` | 1 |
| `--rank-chip-color` | 1 |
| `--expo-color` | 1 |
| `--mpx-color` | 1 |
| `--bar-width` | 1 |
| `--bar-color` | 1 |

---

## Most-repeated declaration sets (>= 2 occurrences)

Each row below is a strong refactor candidate: same declaration set appearing N times -> create one class once, replace N sites.

| Count | Normalized declaration set |
|---|---|
| 8 | `display:none` |
| 2 | `...` |
| 2 | `--archetype-bg:${mlArchetypeBg(archetype)}; --archetype-fg:${mlArchetypeFg(archetype)}` |
| 2 | `--rp-stripe-color:var(--pos-pick-bg)` |

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
| 2 | Sort state for the leagues list |
| 2 | Save current scoped IDs so the existing loadRoster / loadAllTrades can target them |
| 2 | Color helpers |
| 2 | Aggregate per-roster |
| 1 | Columns: expandable league list (left) + player exposure (right) |
| 1 | RIGHT: player exposure sidebar |
| 1 | PANEL 1: player exposure |
| 1 | Archetype lookup for the owning team |
| 1 | Render the current state of the suggestion pre-screener |
| 1 | Render the current suggestion as a single card |
| 1 | Close player-detail modal if open |
| 1 | Close modals on Escape |
| 1 | PICKS BRANCH |
| 1 | Total roster value |
| 1 | Store per-league so multiple leagues can expand without collision |

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
| 8569 | dynamic | `--bar-width:${w}%;--bar-color:${posColors[pos]}` |
| 8574 | dynamic | `--top-pos-color:${posColors[r.topScoringPos]}` |
| 8593 | dynamic | `--st-pos-color:${posColors.QB}` |
| 8594 | dynamic | `--st-pos-color:${posColors.RB}` |
| 8595 | dynamic | `--st-pos-color:${posColors.WR}` |
| 8596 | dynamic | `--st-pos-color:${posColors.TE}` |

### Helpers (5)

| Line | Mode | Declaration |
|---|---|---|
| 7197 | dynamic | `--cell-value-color:${valColor(r.value)}` |
| 7199 | dynamic | `--cell-proj-color:${seasonProjColor};--cell-proj-opacity:${seasonProjOpacity}` |
| 7200 | dynamic | `--cell-proj-color:${projColor};--cell-proj-opacity:${projOpacity}` |
| 7217 | dynamic | `--rp-stripe-color:${posColors[pos]}` |
| 7221 | dynamic | `--rp-total-color:${posColors[pos]}` |

### Renders draft picks in the same visual layout as a position section so the (4)

| Line | Mode | Declaration |
|---|---|---|
| 7264 | static | `--rp-stripe-color:var(--pos-pick-bg)` |
| 7301 | dynamic | `--cell-value-color:${valColor}` |
| 7311 | static | `--rp-stripe-color:var(--pos-pick-bg)` |
| 7315 | dynamic | `--rp-total-color:var(--pos-pick-bg)` |

### Stash render context on window so the sort buttons can re-render (4)

| Line | Mode | Declaration |
|---|---|---|
| 8465 | dynamic | `--mpx-color:${mpxColor}` |
| 8478 | dynamic | `--pos-color:${posColors[pos]}` |
| 8483 | dynamic | `--rank-color:${color}` |
| 8488 | dynamic | `--rank-color:${scoreColor}` |

### Team logo helpers — load BEFORE player-panel.js so modal-hero badge works. (3)

| Line | Mode | Declaration |
|---|---|---|
| 3060 | static | `...` |
| 3117 | static | `...` |
| 3294 | static | `display:none` |

### Render an archetype chip (3)

| Line | Mode | Declaration |
|---|---|---|
| 3997 | dynamic | `--pos-bg:${c}` |
| 4097 | static | `display:none` |
| 4102 | static | `display:none` |

### Ensure roster/users/players are loaded and stashed on window for the modal layer (3)

| Line | Mode | Declaration |
|---|---|---|
| 6090 | dynamic | `--pos-color:${color}` |
| 6092 | dynamic | `--rank-color:${rankColor}` |
| 6136 | dynamic | `display:none` |

### Sort state for the leagues list (2)

| Line | Mode | Declaration |
|---|---|---|
| 5884 | dynamic | `width:${w}%;background:${s.color}` |
| 5891 | dynamic-context | `opacity:.3` |

### Save current scoped IDs so the existing loadRoster / loadAllTrades can target them (2)

| Line | Mode | Declaration |
|---|---|---|
| 6217 | dynamic | `--archetype-bg:${mlArchetypeBg(archetype)};--archetype-fg:${mlArchetypeFg(archetype)}` |
| 6228 | dynamic | `--pos-chip-color:${color};--rank-chip-color:${rankColor}` |

### Color helpers (2)

| Line | Mode | Declaration |
|---|---|---|
| 6833 | dynamic | `color:${posColor(p.position)}` |
| 6836 | dynamic | `color:${expoColor(p.exposure)}` |

### Aggregate per-roster (2)

| Line | Mode | Declaration |
|---|---|---|
| 7663 | dynamic | `width:${maxSpent ? (r.spent/maxSpent*100).toFixed(0) : 0}%` |
| 7665 | dynamic | `width:${budget ? (r.left/budget*100).toFixed(0) : 0}%` |

### Columns: expandable league list (left) + player exposure (right) (1)

| Line | Mode | Declaration |
|---|---|---|
| 3316 | static | `display:none` |

### RIGHT: player exposure sidebar (1)

| Line | Mode | Declaration |
|---|---|---|
| 3342 | static | `display:none` |

### PANEL 1: player exposure (1)

| Line | Mode | Declaration |
|---|---|---|
| 3381 | static | `display:none` |

### Archetype lookup for the owning team (1)

| Line | Mode | Declaration |
|---|---|---|
| 4433 | dynamic | `--archetype-bg:${mlArchetypeBg(r.ownerArchetype)};--archetype-fg:${mlArchetypeFg(r.ownerArchetype)}` |

### Render the current state of the suggestion pre-screener (1)

| Line | Mode | Declaration |
|---|---|---|
| 4800 | dynamic | `--archetype-bg:${mlArchetypeBg(archetype)};--archetype-fg:${mlArchetypeFg(archetype)}` |

### Render the current suggestion as a single card (1)

| Line | Mode | Declaration |
|---|---|---|
| 4930 | dynamic | `--balance-color:${balanceColor}` |

### Close player-detail modal if open (1)

| Line | Mode | Declaration |
|---|---|---|
| 5409 | dynamic | `--net-color:${diff>0?'var(--red)':diff<0?'var(--green)':'var(--white)'}` |

### Close modals on Escape (1)

| Line | Mode | Declaration |
|---|---|---|
| 5517 | dynamic | `color:${color};border-color:${color};background:${bg}` |

### PICKS BRANCH (1)

| Line | Mode | Declaration |
|---|---|---|
| 6737 | dynamic | `--expo-color:${expoColor(p.exposure)}` |

### Total roster value (1)

| Line | Mode | Declaration |
|---|---|---|
| 7350 | dynamic | `--rank-color:${_rankColor(rank)}` |

### Store per-league so multiple leagues can expand without collision (1)

| Line | Mode | Declaration |
|---|---|---|
| 7506 | static | `display:none` |
