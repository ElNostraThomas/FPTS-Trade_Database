# my-leagues.html inline-style inventory

Generated from `my-leagues.html` (8406 lines).
Total `style="..."` occurrences: **116**.

This is a read-only audit. No code was changed. The goal is to make the
refactor safe to execute supervised by giving every occurrence a category,
a section assignment, and an actionability verdict.

---

## Mode breakdown

| Mode | Count | % | Refactorable to CSS class? |
|---|---|---|---|
| `static` | 57 | 49.1% | Yes - pure HTML attribute, drop into a class |
| `dynamic` | 52 | 44.8% | Conditional - if the interpolated value is a discrete enum, use a modifier class (e.g. `.is-active`); otherwise leave inline |
| `dynamic-context` | 6 | 5.2% | Conditional - inside a JS-built HTML string; refactor only if the declaration set is static |
| `js-composed` | 1 | 0.9% | No - imperatively set at runtime; leave as-is |

**Headline:** ~57 are directly refactorable, ~58 require case-by-case judgement, ~1 must stay inline (JS-set).

---

## Top 25 declaration properties

Which CSS properties carry most of the inline styling. Where one property dominates, a single utility class can collapse many sites.

| Property | Count |
|---|---|
| `color` | 29 |
| `display` | 27 |
| `font-family` | 20 |
| `font-size` | 20 |
| `align-items` | 15 |
| `font-style` | 15 |
| `fill-rule` | 15 |
| `font-weight` | 14 |
| `fill` | 14 |
| `background` | 13 |
| `flex-shrink` | 12 |
| `gap` | 11 |
| `padding` | 10 |
| `border` | 9 |
| `width` | 9 |
| `opacity` | 7 |
| `letter-spacing` | 6 |
| `border-radius` | 6 |
| `justify-content` | 5 |
| `text-transform` | 5 |
| `margin-bottom` | 5 |
| `text-decoration` | 5 |
| `z-index` | 4 |
| `flex` | 4 |
| `margin-top` | 4 |

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
| 10 | Sort rosters by chosen key |
| 8 | Team logo helpers — load BEFORE player-panel.js so modal-hero badge works. |
| 5 | Close player-detail modal if open |
| 5 | Helpers |
| 5 | Total roster value |
| 5 | Trade Builder Modal — opens over the player detail modal (z-index 250) |
| 4 | PICKS BRANCH |
| 4 | Renders draft picks in the same visual layout as a position section so the |
| 4 | Stash render context on window so the sort buttons can re-render |
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
| 3760 | dynamic | `display:inline-flex;align-items:center;justify-content:center;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;...` |
| 3763 | dynamic | `display:inline-flex;align-items:center;justify-content:center;background:${c};color:#fff;font-family:'Kanit',sans-serif;font-we...` |
| 3767 | dynamic-context | `width:32px;height:32px;flex-shrink:0;display:inline-block;` |
| 3768 | js-composed | `width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0;` |
| 3773 | dynamic-context | `width:32px;height:32px;border-radius:50%;background:var(--surface2);display:inline-flex;align-items:center;justify-content:cent...` |
| 3774 | static | `display:block` |
| 3858 | static | `display:flex;align-items:center;gap:8px;margin-bottom:6px` |
| 3860 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5` |
| 3862 | static | `display:flex;align-items:center;gap:10px;min-height:24px` |
| 3863 | static | `display:none;margin-top:8px` |
| 3865 | static | `background:none;border:none;color:var(--muted);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;...` |
| 3869 | static | `font-size:8px;transition:transform .15s` |
| 3871 | static | `display:none;margin-top:8px;padding-top:8px;border-top:1px solid var(--border)` |
| 3905 | static | `display:flex;align-items:center;gap:10px;width:100%;padding:8px 12px;background:rgba(237,129,12,0.06);border:1px dashed var(--b...` |
| 3906 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted);font-style:italic;flex:1;min-width:0` |
| 3908 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3923 | static | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;color:var(--white);text-decoration:none;flex:1;min-width:0;overf...` |
| 3927 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;flex-shrink:0` |
| 3929 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3939 | static | `display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border)` |
| 3941 | static | `font-family:'Mulish',sans-serif;font-weight:700;font-size:12px;color:var(--white);text-decoration:none;flex:1;min-width:0;overf...` |
| 3945 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;flex-shrink:0` |

### RIGHT: player exposure sidebar (21)

| Line | Mode | Declaration |
|---|---|---|
| 3118 | static | `display:flex;align-items:center;gap:8px` |
| 3119 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);width:12px;text-align:center;flex-shrink:0;transition:transfo...` |
| 3125 | static | `display:none` |
| 3144 | static | `width:24px;flex-shrink:0` |
| 3145 | static | `flex:1` |
| 3160 | static | `fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;` |
| 3160 | static | `fill:#c33;` |
| 3160 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3160 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3160 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3160 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3160 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3160 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3160 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3160 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3160 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3160 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3160 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3160 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3160 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3162 | dynamic-context | `flex-shrink:0;vertical-align:middle;margin-right:4px` |

### Sort rosters by chosen key (10)

| Line | Mode | Declaration |
|---|---|---|
| 8100 | dynamic | `--bar-width:${w}%;--bar-color:${posColors[pos]}` |
| 8105 | dynamic | `--top-pos-color:${posColors[r.topScoringPos]}` |
| 8124 | dynamic | `--st-pos-color:${posColors.QB}` |
| 8125 | dynamic | `--st-pos-color:${posColors.RB}` |
| 8126 | dynamic | `--st-pos-color:${posColors.WR}` |
| 8127 | dynamic | `--st-pos-color:${posColors.TE}` |
| 8199 | dynamic | `margin-top:20px` |
| 8205 | dynamic | `border-left-color:var(--red)` |
| 8207 | dynamic | `color:var(--white);opacity:.7` |
| 8208 | dynamic | `${isMyPick?'color:var(--red)':''}` |

### Team logo helpers — load BEFORE player-panel.js so modal-hero badge works. (8)

| Line | Mode | Declaration |
|---|---|---|
| 2874 | static | `...` |
| 2931 | static | `...` |
| 3001 | static | `position:fixed;inset:0;background:var(--black);color:var(--white);display:flex;align-items:center;justify-content:center;font-f...` |
| 3002 | static | `background:var(--nav-bg);border-bottom:2px solid var(--red);position:sticky;top:0;z-index:100` |
| 3002 | static | `border:none;position:static` |
| 3005 | static | `fill-rule:evenodd;clip-rule:evenodd` |
| 3048 | static | `background:none;border:1px solid var(--border2);color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:it...` |
| 3077 | static | `display:none` |

### Close player-detail modal if open (5)

| Line | Mode | Declaration |
|---|---|---|
| 5174 | dynamic-context | `margin-top:14px;padding-top:14px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:8px;align-items:center` |
| 5176 | static | `display:inline-block;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:12px;color:var(--white);backgro...` |
| 5178 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-style:italic;text-align:center;line-height:1.5;max-width...` |
| 5192 | dynamic | `color:${diff>0?'var(--red)':diff<0?'var(--green)':'var(--white)'}` |
| 5252 | dynamic-context | `opacity:.5` |

### Helpers (5)

| Line | Mode | Declaration |
|---|---|---|
| 6975 | dynamic | `--cell-value-color:${valColor(r.value)}` |
| 6977 | dynamic | `--cell-proj-color:${seasonProjColor};--cell-proj-opacity:${seasonProjOpacity}` |
| 6978 | dynamic | `--cell-proj-color:${projColor};--cell-proj-opacity:${projOpacity}` |
| 6995 | dynamic | `--rp-stripe-color:${posColors[pos]}` |
| 6999 | dynamic | `--rp-total-color:${posColors[pos]}` |

### Total roster value (5)

| Line | Mode | Declaration |
|---|---|---|
| 7128 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:${_rankColor(rank)};padding:1px 6px;backg...` |
| 7132 | static | `display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px;padding:16px;background:var(--surface2);border:1px solid var(--border)` |
| 7133 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 7135 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 7138 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:var(--green)` |

### Trade Builder Modal — opens over the player detail modal (z-index 250) (5)

| Line | Mode | Declaration |
|---|---|---|
| 8383 | static | `z-index:250` |
| 8387 | static | `margin-right:8px` |
| 8394 | static | `z-index:260` |
| 8395 | static | `max-width:540px` |
| 8398 | static | `margin-right:8px` |

### PICKS BRANCH (4)

| Line | Mode | Declaration |
|---|---|---|
| 6512 | static | `background:var(--surface2);display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border)` |
| 6512 | static | `display:block` |
| 6514 | dynamic | `color:#9b91d4` |
| 6517 | dynamic | `color:${expoColor(p.exposure)}` |

### Renders draft picks in the same visual layout as a position section so the (4)

| Line | Mode | Declaration |
|---|---|---|
| 7042 | static | `--rp-stripe-color:var(--pos-pick-bg)` |
| 7079 | dynamic | `--cell-value-color:${valColor}` |
| 7089 | static | `--rp-stripe-color:var(--pos-pick-bg)` |
| 7093 | dynamic | `--rp-total-color:var(--pos-pick-bg)` |

### Stash render context on window so the sort buttons can re-render (4)

| Line | Mode | Declaration |
|---|---|---|
| 7996 | dynamic | `--mpx-color:${mpxColor}` |
| 8009 | dynamic | `--pos-color:${posColors[pos]}` |
| 8014 | dynamic | `--rank-color:${color}` |
| 8019 | dynamic | `--rank-color:${scoreColor}` |

### Ensure roster/users/players are loaded and stashed on window for the modal layer (3)

| Line | Mode | Declaration |
|---|---|---|
| 5870 | dynamic | `--pos-color:${color}` |
| 5872 | dynamic | `--rank-color:${rankColor}` |
| 5916 | dynamic | `display:none` |

### Group transactions by roster (3)

| Line | Mode | Declaration |
|---|---|---|
| 7639 | dynamic | `color:var(--red);font-size:10px;font-style:italic` |
| 7640 | dynamic | `color:var(--yellow)` |
| 7640 | dynamic | `color:var(--green)` |

### Sort state for the leagues list (2)

| Line | Mode | Declaration |
|---|---|---|
| 5664 | dynamic | `width:${w}%;background:${s.color}` |
| 5671 | dynamic-context | `opacity:.3` |

### Save current scoped IDs so the existing loadRoster / loadAllTrades can target them (2)

| Line | Mode | Declaration |
|---|---|---|
| 5997 | dynamic | `--archetype-bg:${mlArchetypeBg(archetype)};--archetype-fg:${mlArchetypeFg(archetype)}` |
| 6008 | dynamic | `--pos-chip-color:${color};--rank-chip-color:${rankColor}` |

### Color helpers (2)

| Line | Mode | Declaration |
|---|---|---|
| 6613 | dynamic | `color:${posColor(p.position)}` |
| 6616 | dynamic | `color:${expoColor(p.exposure)}` |

### Store per-league so multiple leagues can expand without collision (2)

| Line | Mode | Declaration |
|---|---|---|
| 7286 | static | `margin-bottom:12px` |
| 7287 | static | `display:none` |

### Aggregate per-roster (2)

| Line | Mode | Declaration |
|---|---|---|
| 7444 | dynamic | `width:${maxSpent ? (r.spent/maxSpent*100).toFixed(0) : 0}%` |
| 7446 | dynamic | `width:${budget ? (r.left/budget*100).toFixed(0) : 0}%` |

### Update section meta with archetype legend + league averages (2)

| Line | Mode | Declaration |
|---|---|---|
| 8041 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 8041 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |

### Columns: expandable league list (left) + player exposure (right) (1)

| Line | Mode | Declaration |
|---|---|---|
| 3099 | static | `display:none` |

### Archetype lookup for the owning team (1)

| Line | Mode | Declaration |
|---|---|---|
| 4214 | dynamic | `--archetype-bg:${mlArchetypeBg(r.ownerArchetype)};--archetype-fg:${mlArchetypeFg(r.ownerArchetype)}` |

### Render the current state of the suggestion pre-screener (1)

| Line | Mode | Declaration |
|---|---|---|
| 4581 | dynamic | `--archetype-bg:${mlArchetypeBg(archetype)};--archetype-fg:${mlArchetypeFg(archetype)}` |

### Render the current suggestion as a single card (1)

| Line | Mode | Declaration |
|---|---|---|
| 4711 | dynamic | `--balance-color:${balanceColor}` |

### Close modals on Escape (1)

| Line | Mode | Declaration |
|---|---|---|
| 5300 | dynamic | `color:${color};border-color:${color};background:${bg}` |
