# my-leagues.html inline-style inventory

Generated from `my-leagues.html` (8430 lines).
Total `style="..."` occurrences: **107**.

This is a read-only audit. No code was changed. The goal is to make the
refactor safe to execute supervised by giving every occurrence a category,
a section assignment, and an actionability verdict.

---

## Mode breakdown

| Mode | Count | % | Refactorable to CSS class? |
|---|---|---|---|
| `static` | 52 | 48.6% | Yes - pure HTML attribute, drop into a class |
| `dynamic` | 48 | 44.9% | Conditional - if the interpolated value is a discrete enum, use a modifier class (e.g. `.is-active`); otherwise leave inline |
| `dynamic-context` | 6 | 5.6% | Conditional - inside a JS-built HTML string; refactor only if the declaration set is static |
| `js-composed` | 1 | 0.9% | No - imperatively set at runtime; leave as-is |

**Headline:** ~52 are directly refactorable, ~54 require case-by-case judgement, ~1 must stay inline (JS-set).

---

## Top 25 declaration properties

Which CSS properties carry most of the inline styling. Where one property dominates, a single utility class can collapse many sites.

| Property | Count |
|---|---|
| `color` | 26 |
| `display` | 25 |
| `font-family` | 18 |
| `font-size` | 18 |
| `fill-rule` | 14 |
| `fill` | 14 |
| `align-items` | 13 |
| `font-style` | 13 |
| `flex-shrink` | 12 |
| `font-weight` | 12 |
| `gap` | 10 |
| `background` | 10 |
| `width` | 9 |
| `padding` | 9 |
| `border` | 7 |
| `border-radius` | 6 |
| `opacity` | 6 |
| `margin-bottom` | 5 |
| `text-decoration` | 5 |
| `flex` | 4 |
| `justify-content` | 4 |
| `text-transform` | 4 |
| `letter-spacing` | 4 |
| `--st-pos-color` | 4 |
| `margin-right` | 3 |

---

## Most-repeated declaration sets (>= 2 occurrences)

Each row below is a strong refactor candidate: same declaration set appearing N times -> create one class once, replace N sites.

| Count | Normalized declaration set |
|---|---|
| 13 | `fill-rule:nonzero; fill:var(--black)` |
| 5 | `display:none` |
| 2 | `...` |
| 2 | `display:block` |
| 2 | `color:var(--muted); flex-shrink:0; font-family:'Mulish',sans-serif; font-size:10px; opacity:.5` |
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
| 22 | Render an archetype chip |
| 21 | RIGHT: player exposure sidebar |
| 6 | Sort rosters by chosen key |
| 5 | Close player-detail modal if open |
| 5 | Helpers |
| 5 | Total roster value |
| 5 | Trade Builder Modal — opens over the player detail modal (z-index 250) |
| 4 | PICKS BRANCH |
| 4 | Renders draft picks in the same visual layout as a position section so the |
| 4 | Stash render context on window so the sort buttons can re-render |
| 3 | Team logo helpers — load BEFORE player-panel.js so modal-hero badge works. |
| 3 | Ensure roster/users/players are loaded and stashed on window for the modal layer |
| 3 | Group transactions by roster |
| 2 | Sort state for the leagues list |
| 2 | Save current scoped IDs so the existing loadRoster / loadAllTrades can target them |
| 2 | Color helpers |
| 2 | Store per-league so multiple leagues can expand without collision |
| 2 | Aggregate per-roster |
| 2 | Update section meta with archetype legend + league averages |
| 1 | Columns: expandable league list (left) + player exposure (right) |
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

### Render an archetype chip (22)

| Line | Mode | Declaration |
|---|---|---|
| 3784 | dynamic | `display:inline-flex;align-items:center;justify-content:center;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;...` |
| 3787 | dynamic | `display:inline-flex;align-items:center;justify-content:center;background:${c};color:#fff;font-family:'Kanit',sans-serif;font-we...` |
| 3791 | dynamic-context | `width:32px;height:32px;flex-shrink:0;display:inline-block;` |
| 3792 | js-composed | `width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0;` |
| 3797 | dynamic-context | `width:32px;height:32px;border-radius:50%;background:var(--surface2);display:inline-flex;align-items:center;justify-content:cent...` |
| 3798 | static | `display:block` |
| 3882 | static | `display:flex;align-items:center;gap:8px;margin-bottom:6px` |
| 3884 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5` |
| 3886 | static | `display:flex;align-items:center;gap:10px;min-height:24px` |
| 3887 | static | `display:none;margin-top:8px` |
| 3889 | static | `background:none;border:none;color:var(--muted);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;...` |
| 3893 | static | `font-size:8px;transition:transform .15s` |
| 3895 | static | `display:none;margin-top:8px;padding-top:8px;border-top:1px solid var(--border)` |
| 3929 | static | `display:flex;align-items:center;gap:10px;width:100%;padding:8px 12px;background:rgba(237,129,12,0.06);border:1px dashed var(--b...` |
| 3930 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted);font-style:italic;flex:1;min-width:0` |
| 3932 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3947 | static | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;color:var(--white);text-decoration:none;flex:1;min-width:0;overf...` |
| 3951 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;flex-shrink:0` |
| 3953 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3963 | static | `display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border)` |
| 3965 | static | `font-family:'Mulish',sans-serif;font-weight:700;font-size:12px;color:var(--white);text-decoration:none;flex:1;min-width:0;overf...` |
| 3969 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;flex-shrink:0` |

### RIGHT: player exposure sidebar (21)

| Line | Mode | Declaration |
|---|---|---|
| 3142 | static | `display:flex;align-items:center;gap:8px` |
| 3143 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);width:12px;text-align:center;flex-shrink:0;transition:transfo...` |
| 3149 | static | `display:none` |
| 3168 | static | `width:24px;flex-shrink:0` |
| 3169 | static | `flex:1` |
| 3184 | static | `fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;` |
| 3184 | static | `fill:#c33;` |
| 3184 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3184 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3184 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3184 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3184 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3184 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3184 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3184 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3184 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3184 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3184 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3184 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3184 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3186 | dynamic-context | `flex-shrink:0;vertical-align:middle;margin-right:4px` |

### Sort rosters by chosen key (6)

| Line | Mode | Declaration |
|---|---|---|
| 8124 | dynamic | `--bar-width:${w}%;--bar-color:${posColors[pos]}` |
| 8129 | dynamic | `--top-pos-color:${posColors[r.topScoringPos]}` |
| 8148 | dynamic | `--st-pos-color:${posColors.QB}` |
| 8149 | dynamic | `--st-pos-color:${posColors.RB}` |
| 8150 | dynamic | `--st-pos-color:${posColors.WR}` |
| 8151 | dynamic | `--st-pos-color:${posColors.TE}` |

### Close player-detail modal if open (5)

| Line | Mode | Declaration |
|---|---|---|
| 5198 | dynamic-context | `margin-top:14px;padding-top:14px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:8px;align-items:center` |
| 5200 | static | `display:inline-block;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:12px;color:var(--white);backgro...` |
| 5202 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-style:italic;text-align:center;line-height:1.5;max-width...` |
| 5216 | dynamic | `color:${diff>0?'var(--red)':diff<0?'var(--green)':'var(--white)'}` |
| 5276 | dynamic-context | `opacity:.5` |

### Helpers (5)

| Line | Mode | Declaration |
|---|---|---|
| 6999 | dynamic | `--cell-value-color:${valColor(r.value)}` |
| 7001 | dynamic | `--cell-proj-color:${seasonProjColor};--cell-proj-opacity:${seasonProjOpacity}` |
| 7002 | dynamic | `--cell-proj-color:${projColor};--cell-proj-opacity:${projOpacity}` |
| 7019 | dynamic | `--rp-stripe-color:${posColors[pos]}` |
| 7023 | dynamic | `--rp-total-color:${posColors[pos]}` |

### Total roster value (5)

| Line | Mode | Declaration |
|---|---|---|
| 7152 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:${_rankColor(rank)};padding:1px 6px;backg...` |
| 7156 | static | `display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px;padding:16px;background:var(--surface2);border:1px solid var(--border)` |
| 7157 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 7159 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 7162 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:var(--green)` |

### Trade Builder Modal — opens over the player detail modal (z-index 250) (5)

| Line | Mode | Declaration |
|---|---|---|
| 8407 | static | `z-index:250` |
| 8411 | static | `margin-right:8px` |
| 8418 | static | `z-index:260` |
| 8419 | static | `max-width:540px` |
| 8422 | static | `margin-right:8px` |

### PICKS BRANCH (4)

| Line | Mode | Declaration |
|---|---|---|
| 6536 | static | `background:var(--surface2);display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border)` |
| 6536 | static | `display:block` |
| 6538 | dynamic | `color:#9b91d4` |
| 6541 | dynamic | `color:${expoColor(p.exposure)}` |

### Renders draft picks in the same visual layout as a position section so the (4)

| Line | Mode | Declaration |
|---|---|---|
| 7066 | static | `--rp-stripe-color:var(--pos-pick-bg)` |
| 7103 | dynamic | `--cell-value-color:${valColor}` |
| 7113 | static | `--rp-stripe-color:var(--pos-pick-bg)` |
| 7117 | dynamic | `--rp-total-color:var(--pos-pick-bg)` |

### Stash render context on window so the sort buttons can re-render (4)

| Line | Mode | Declaration |
|---|---|---|
| 8020 | dynamic | `--mpx-color:${mpxColor}` |
| 8033 | dynamic | `--pos-color:${posColors[pos]}` |
| 8038 | dynamic | `--rank-color:${color}` |
| 8043 | dynamic | `--rank-color:${scoreColor}` |

### Team logo helpers — load BEFORE player-panel.js so modal-hero badge works. (3)

| Line | Mode | Declaration |
|---|---|---|
| 2878 | static | `...` |
| 2935 | static | `...` |
| 3101 | static | `display:none` |

### Ensure roster/users/players are loaded and stashed on window for the modal layer (3)

| Line | Mode | Declaration |
|---|---|---|
| 5894 | dynamic | `--pos-color:${color}` |
| 5896 | dynamic | `--rank-color:${rankColor}` |
| 5940 | dynamic | `display:none` |

### Group transactions by roster (3)

| Line | Mode | Declaration |
|---|---|---|
| 7663 | dynamic | `color:var(--red);font-size:10px;font-style:italic` |
| 7664 | dynamic | `color:var(--yellow)` |
| 7664 | dynamic | `color:var(--green)` |

### Sort state for the leagues list (2)

| Line | Mode | Declaration |
|---|---|---|
| 5688 | dynamic | `width:${w}%;background:${s.color}` |
| 5695 | dynamic-context | `opacity:.3` |

### Save current scoped IDs so the existing loadRoster / loadAllTrades can target them (2)

| Line | Mode | Declaration |
|---|---|---|
| 6021 | dynamic | `--archetype-bg:${mlArchetypeBg(archetype)};--archetype-fg:${mlArchetypeFg(archetype)}` |
| 6032 | dynamic | `--pos-chip-color:${color};--rank-chip-color:${rankColor}` |

### Color helpers (2)

| Line | Mode | Declaration |
|---|---|---|
| 6637 | dynamic | `color:${posColor(p.position)}` |
| 6640 | dynamic | `color:${expoColor(p.exposure)}` |

### Store per-league so multiple leagues can expand without collision (2)

| Line | Mode | Declaration |
|---|---|---|
| 7310 | static | `margin-bottom:12px` |
| 7311 | static | `display:none` |

### Aggregate per-roster (2)

| Line | Mode | Declaration |
|---|---|---|
| 7468 | dynamic | `width:${maxSpent ? (r.spent/maxSpent*100).toFixed(0) : 0}%` |
| 7470 | dynamic | `width:${budget ? (r.left/budget*100).toFixed(0) : 0}%` |

### Update section meta with archetype legend + league averages (2)

| Line | Mode | Declaration |
|---|---|---|
| 8065 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 8065 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |

### Columns: expandable league list (left) + player exposure (right) (1)

| Line | Mode | Declaration |
|---|---|---|
| 3123 | static | `display:none` |

### Archetype lookup for the owning team (1)

| Line | Mode | Declaration |
|---|---|---|
| 4238 | dynamic | `--archetype-bg:${mlArchetypeBg(r.ownerArchetype)};--archetype-fg:${mlArchetypeFg(r.ownerArchetype)}` |

### Render the current state of the suggestion pre-screener (1)

| Line | Mode | Declaration |
|---|---|---|
| 4605 | dynamic | `--archetype-bg:${mlArchetypeBg(archetype)};--archetype-fg:${mlArchetypeFg(archetype)}` |

### Render the current suggestion as a single card (1)

| Line | Mode | Declaration |
|---|---|---|
| 4735 | dynamic | `--balance-color:${balanceColor}` |

### Close modals on Escape (1)

| Line | Mode | Declaration |
|---|---|---|
| 5324 | dynamic | `color:${color};border-color:${color};background:${bg}` |
