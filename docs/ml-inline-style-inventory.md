# my-leagues.html inline-style inventory

Generated from `my-leagues.html` (8410 lines).
Total `style="..."` occurrences: **112**.

This is a read-only audit. No code was changed. The goal is to make the
refactor safe to execute supervised by giving every occurrence a category,
a section assignment, and an actionability verdict.

---

## Mode breakdown

| Mode | Count | % | Refactorable to CSS class? |
|---|---|---|---|
| `static` | 57 | 50.9% | Yes - pure HTML attribute, drop into a class |
| `dynamic` | 48 | 42.9% | Conditional - if the interpolated value is a discrete enum, use a modifier class (e.g. `.is-active`); otherwise leave inline |
| `dynamic-context` | 6 | 5.4% | Conditional - inside a JS-built HTML string; refactor only if the declaration set is static |
| `js-composed` | 1 | 0.9% | No - imperatively set at runtime; leave as-is |

**Headline:** ~57 are directly refactorable, ~54 require case-by-case judgement, ~1 must stay inline (JS-set).

---

## Top 25 declaration properties

Which CSS properties carry most of the inline styling. Where one property dominates, a single utility class can collapse many sites.

| Property | Count |
|---|---|
| `color` | 28 |
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
| `letter-spacing` | 6 |
| `border-radius` | 6 |
| `opacity` | 6 |
| `justify-content` | 5 |
| `text-transform` | 5 |
| `margin-bottom` | 5 |
| `text-decoration` | 5 |
| `z-index` | 4 |
| `flex` | 4 |
| `--st-pos-color` | 4 |

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
| 8 | Team logo helpers — load BEFORE player-panel.js so modal-hero badge works. |
| 6 | Sort rosters by chosen key |
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
| 3764 | dynamic | `display:inline-flex;align-items:center;justify-content:center;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;...` |
| 3767 | dynamic | `display:inline-flex;align-items:center;justify-content:center;background:${c};color:#fff;font-family:'Kanit',sans-serif;font-we...` |
| 3771 | dynamic-context | `width:32px;height:32px;flex-shrink:0;display:inline-block;` |
| 3772 | js-composed | `width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0;` |
| 3777 | dynamic-context | `width:32px;height:32px;border-radius:50%;background:var(--surface2);display:inline-flex;align-items:center;justify-content:cent...` |
| 3778 | static | `display:block` |
| 3862 | static | `display:flex;align-items:center;gap:8px;margin-bottom:6px` |
| 3864 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5` |
| 3866 | static | `display:flex;align-items:center;gap:10px;min-height:24px` |
| 3867 | static | `display:none;margin-top:8px` |
| 3869 | static | `background:none;border:none;color:var(--muted);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;...` |
| 3873 | static | `font-size:8px;transition:transform .15s` |
| 3875 | static | `display:none;margin-top:8px;padding-top:8px;border-top:1px solid var(--border)` |
| 3909 | static | `display:flex;align-items:center;gap:10px;width:100%;padding:8px 12px;background:rgba(237,129,12,0.06);border:1px dashed var(--b...` |
| 3910 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted);font-style:italic;flex:1;min-width:0` |
| 3912 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3927 | static | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;color:var(--white);text-decoration:none;flex:1;min-width:0;overf...` |
| 3931 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;flex-shrink:0` |
| 3933 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3943 | static | `display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border)` |
| 3945 | static | `font-family:'Mulish',sans-serif;font-weight:700;font-size:12px;color:var(--white);text-decoration:none;flex:1;min-width:0;overf...` |
| 3949 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;flex-shrink:0` |

### RIGHT: player exposure sidebar (21)

| Line | Mode | Declaration |
|---|---|---|
| 3122 | static | `display:flex;align-items:center;gap:8px` |
| 3123 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);width:12px;text-align:center;flex-shrink:0;transition:transfo...` |
| 3129 | static | `display:none` |
| 3148 | static | `width:24px;flex-shrink:0` |
| 3149 | static | `flex:1` |
| 3164 | static | `fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;` |
| 3164 | static | `fill:#c33;` |
| 3164 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3164 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3164 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3164 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3164 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3164 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3164 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3164 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3164 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3164 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3164 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3164 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3164 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3166 | dynamic-context | `flex-shrink:0;vertical-align:middle;margin-right:4px` |

### Team logo helpers — load BEFORE player-panel.js so modal-hero badge works. (8)

| Line | Mode | Declaration |
|---|---|---|
| 2878 | static | `...` |
| 2935 | static | `...` |
| 3005 | static | `position:fixed;inset:0;background:var(--black);color:var(--white);display:flex;align-items:center;justify-content:center;font-f...` |
| 3006 | static | `background:var(--nav-bg);border-bottom:2px solid var(--red);position:sticky;top:0;z-index:100` |
| 3006 | static | `border:none;position:static` |
| 3009 | static | `fill-rule:evenodd;clip-rule:evenodd` |
| 3052 | static | `background:none;border:1px solid var(--border2);color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:it...` |
| 3081 | static | `display:none` |

### Sort rosters by chosen key (6)

| Line | Mode | Declaration |
|---|---|---|
| 8104 | dynamic | `--bar-width:${w}%;--bar-color:${posColors[pos]}` |
| 8109 | dynamic | `--top-pos-color:${posColors[r.topScoringPos]}` |
| 8128 | dynamic | `--st-pos-color:${posColors.QB}` |
| 8129 | dynamic | `--st-pos-color:${posColors.RB}` |
| 8130 | dynamic | `--st-pos-color:${posColors.WR}` |
| 8131 | dynamic | `--st-pos-color:${posColors.TE}` |

### Close player-detail modal if open (5)

| Line | Mode | Declaration |
|---|---|---|
| 5178 | dynamic-context | `margin-top:14px;padding-top:14px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:8px;align-items:center` |
| 5180 | static | `display:inline-block;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:12px;color:var(--white);backgro...` |
| 5182 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-style:italic;text-align:center;line-height:1.5;max-width...` |
| 5196 | dynamic | `color:${diff>0?'var(--red)':diff<0?'var(--green)':'var(--white)'}` |
| 5256 | dynamic-context | `opacity:.5` |

### Helpers (5)

| Line | Mode | Declaration |
|---|---|---|
| 6979 | dynamic | `--cell-value-color:${valColor(r.value)}` |
| 6981 | dynamic | `--cell-proj-color:${seasonProjColor};--cell-proj-opacity:${seasonProjOpacity}` |
| 6982 | dynamic | `--cell-proj-color:${projColor};--cell-proj-opacity:${projOpacity}` |
| 6999 | dynamic | `--rp-stripe-color:${posColors[pos]}` |
| 7003 | dynamic | `--rp-total-color:${posColors[pos]}` |

### Total roster value (5)

| Line | Mode | Declaration |
|---|---|---|
| 7132 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:${_rankColor(rank)};padding:1px 6px;backg...` |
| 7136 | static | `display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px;padding:16px;background:var(--surface2);border:1px solid var(--border)` |
| 7137 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 7139 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 7142 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:var(--green)` |

### Trade Builder Modal — opens over the player detail modal (z-index 250) (5)

| Line | Mode | Declaration |
|---|---|---|
| 8387 | static | `z-index:250` |
| 8391 | static | `margin-right:8px` |
| 8398 | static | `z-index:260` |
| 8399 | static | `max-width:540px` |
| 8402 | static | `margin-right:8px` |

### PICKS BRANCH (4)

| Line | Mode | Declaration |
|---|---|---|
| 6516 | static | `background:var(--surface2);display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border)` |
| 6516 | static | `display:block` |
| 6518 | dynamic | `color:#9b91d4` |
| 6521 | dynamic | `color:${expoColor(p.exposure)}` |

### Renders draft picks in the same visual layout as a position section so the (4)

| Line | Mode | Declaration |
|---|---|---|
| 7046 | static | `--rp-stripe-color:var(--pos-pick-bg)` |
| 7083 | dynamic | `--cell-value-color:${valColor}` |
| 7093 | static | `--rp-stripe-color:var(--pos-pick-bg)` |
| 7097 | dynamic | `--rp-total-color:var(--pos-pick-bg)` |

### Stash render context on window so the sort buttons can re-render (4)

| Line | Mode | Declaration |
|---|---|---|
| 8000 | dynamic | `--mpx-color:${mpxColor}` |
| 8013 | dynamic | `--pos-color:${posColors[pos]}` |
| 8018 | dynamic | `--rank-color:${color}` |
| 8023 | dynamic | `--rank-color:${scoreColor}` |

### Ensure roster/users/players are loaded and stashed on window for the modal layer (3)

| Line | Mode | Declaration |
|---|---|---|
| 5874 | dynamic | `--pos-color:${color}` |
| 5876 | dynamic | `--rank-color:${rankColor}` |
| 5920 | dynamic | `display:none` |

### Group transactions by roster (3)

| Line | Mode | Declaration |
|---|---|---|
| 7643 | dynamic | `color:var(--red);font-size:10px;font-style:italic` |
| 7644 | dynamic | `color:var(--yellow)` |
| 7644 | dynamic | `color:var(--green)` |

### Sort state for the leagues list (2)

| Line | Mode | Declaration |
|---|---|---|
| 5668 | dynamic | `width:${w}%;background:${s.color}` |
| 5675 | dynamic-context | `opacity:.3` |

### Save current scoped IDs so the existing loadRoster / loadAllTrades can target them (2)

| Line | Mode | Declaration |
|---|---|---|
| 6001 | dynamic | `--archetype-bg:${mlArchetypeBg(archetype)};--archetype-fg:${mlArchetypeFg(archetype)}` |
| 6012 | dynamic | `--pos-chip-color:${color};--rank-chip-color:${rankColor}` |

### Color helpers (2)

| Line | Mode | Declaration |
|---|---|---|
| 6617 | dynamic | `color:${posColor(p.position)}` |
| 6620 | dynamic | `color:${expoColor(p.exposure)}` |

### Store per-league so multiple leagues can expand without collision (2)

| Line | Mode | Declaration |
|---|---|---|
| 7290 | static | `margin-bottom:12px` |
| 7291 | static | `display:none` |

### Aggregate per-roster (2)

| Line | Mode | Declaration |
|---|---|---|
| 7448 | dynamic | `width:${maxSpent ? (r.spent/maxSpent*100).toFixed(0) : 0}%` |
| 7450 | dynamic | `width:${budget ? (r.left/budget*100).toFixed(0) : 0}%` |

### Update section meta with archetype legend + league averages (2)

| Line | Mode | Declaration |
|---|---|---|
| 8045 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 8045 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |

### Columns: expandable league list (left) + player exposure (right) (1)

| Line | Mode | Declaration |
|---|---|---|
| 3103 | static | `display:none` |

### Archetype lookup for the owning team (1)

| Line | Mode | Declaration |
|---|---|---|
| 4218 | dynamic | `--archetype-bg:${mlArchetypeBg(r.ownerArchetype)};--archetype-fg:${mlArchetypeFg(r.ownerArchetype)}` |

### Render the current state of the suggestion pre-screener (1)

| Line | Mode | Declaration |
|---|---|---|
| 4585 | dynamic | `--archetype-bg:${mlArchetypeBg(archetype)};--archetype-fg:${mlArchetypeFg(archetype)}` |

### Render the current suggestion as a single card (1)

| Line | Mode | Declaration |
|---|---|---|
| 4715 | dynamic | `--balance-color:${balanceColor}` |

### Close modals on Escape (1)

| Line | Mode | Declaration |
|---|---|---|
| 5304 | dynamic | `color:${color};border-color:${color};background:${bg}` |
