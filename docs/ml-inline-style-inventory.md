# my-leagues.html inline-style inventory

Generated from `my-leagues.html` (8378 lines).
Total `style="..."` occurrences: **123**.

This is a read-only audit. No code was changed. The goal is to make the
refactor safe to execute supervised by giving every occurrence a category,
a section assignment, and an actionability verdict.

---

## Mode breakdown

| Mode | Count | % | Refactorable to CSS class? |
|---|---|---|---|
| `static` | 61 | 49.6% | Yes - pure HTML attribute, drop into a class |
| `dynamic` | 55 | 44.7% | Conditional - if the interpolated value is a discrete enum, use a modifier class (e.g. `.is-active`); otherwise leave inline |
| `dynamic-context` | 6 | 4.9% | Conditional - inside a JS-built HTML string; refactor only if the declaration set is static |
| `js-composed` | 1 | 0.8% | No - imperatively set at runtime; leave as-is |

**Headline:** ~61 are directly refactorable, ~61 require case-by-case judgement, ~1 must stay inline (JS-set).

---

## Top 25 declaration properties

Which CSS properties carry most of the inline styling. Where one property dominates, a single utility class can collapse many sites.

| Property | Count |
|---|---|
| `color` | 34 |
| `display` | 31 |
| `font-family` | 25 |
| `font-size` | 25 |
| `align-items` | 18 |
| `font-style` | 18 |
| `font-weight` | 17 |
| `background` | 15 |
| `fill-rule` | 15 |
| `gap` | 14 |
| `fill` | 14 |
| `padding` | 12 |
| `flex-shrink` | 12 |
| `border` | 11 |
| `letter-spacing` | 9 |
| `width` | 9 |
| `text-transform` | 8 |
| `opacity` | 8 |
| `border-radius` | 7 |
| `justify-content` | 6 |
| `margin-bottom` | 6 |
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
| 2 | `align-items:center; display:flex; gap:8px` |
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
| 10 | Ensure roster/users/players are loaded and stashed on window for the modal layer |
| 10 | Sort rosters by chosen key |
| 8 | Team logo helpers — load BEFORE player-panel.js so modal-hero badge works. |
| 5 | Close player-detail modal if open |
| 5 | Helpers |
| 5 | Total roster value |
| 5 | Trade Builder Modal — opens over the player detail modal (z-index 250) |
| 4 | PICKS BRANCH |
| 4 | Renders draft picks in the same visual layout as a position section so the |
| 4 | Stash render context on window so the sort buttons can re-render |
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
| 3731 | dynamic | `display:inline-flex;align-items:center;justify-content:center;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;...` |
| 3734 | dynamic | `display:inline-flex;align-items:center;justify-content:center;background:${c};color:#fff;font-family:'Kanit',sans-serif;font-we...` |
| 3738 | dynamic-context | `width:32px;height:32px;flex-shrink:0;display:inline-block;` |
| 3739 | js-composed | `width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0;` |
| 3744 | dynamic-context | `width:32px;height:32px;border-radius:50%;background:var(--surface2);display:inline-flex;align-items:center;justify-content:cent...` |
| 3745 | static | `display:block` |
| 3829 | static | `display:flex;align-items:center;gap:8px;margin-bottom:6px` |
| 3831 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5` |
| 3833 | static | `display:flex;align-items:center;gap:10px;min-height:24px` |
| 3834 | static | `display:none;margin-top:8px` |
| 3836 | static | `background:none;border:none;color:var(--muted);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;...` |
| 3840 | static | `font-size:8px;transition:transform .15s` |
| 3842 | static | `display:none;margin-top:8px;padding-top:8px;border-top:1px solid var(--border)` |
| 3876 | static | `display:flex;align-items:center;gap:10px;width:100%;padding:8px 12px;background:rgba(237,129,12,0.06);border:1px dashed var(--b...` |
| 3877 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted);font-style:italic;flex:1;min-width:0` |
| 3879 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3894 | static | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;color:var(--white);text-decoration:none;flex:1;min-width:0;overf...` |
| 3898 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;flex-shrink:0` |
| 3900 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3910 | static | `display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border)` |
| 3912 | static | `font-family:'Mulish',sans-serif;font-weight:700;font-size:12px;color:var(--white);text-decoration:none;flex:1;min-width:0;overf...` |
| 3916 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;flex-shrink:0` |

### RIGHT: player exposure sidebar (21)

| Line | Mode | Declaration |
|---|---|---|
| 3089 | static | `display:flex;align-items:center;gap:8px` |
| 3090 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);width:12px;text-align:center;flex-shrink:0;transition:transfo...` |
| 3096 | static | `display:none` |
| 3115 | static | `width:24px;flex-shrink:0` |
| 3116 | static | `flex:1` |
| 3131 | static | `fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;` |
| 3131 | static | `fill:#c33;` |
| 3131 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3131 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3131 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3131 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3131 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3131 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3131 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3131 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3131 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3131 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3131 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3131 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3131 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3133 | dynamic-context | `flex-shrink:0;vertical-align:middle;margin-right:4px` |

### Ensure roster/users/players are loaded and stashed on window for the modal layer (10)

| Line | Mode | Declaration |
|---|---|---|
| 5841 | dynamic | `display:inline-flex;align-items:center;gap:6px;padding:6px 10px;background:var(--surface2);border:1px solid var(--border);borde...` |
| 5842 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:${color};text-transform:uppercase;letter-...` |
| 5843 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:14px;color:${rankColor}` |
| 5844 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.6` |
| 5854 | dynamic | `display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px` |
| 5866 | static | `display:flex;align-items:center;justify-content:space-between` |
| 5868 | static | `display:flex;align-items:center;gap:8px` |
| 5869 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em` |
| 5871 | static | `background:var(--surface2);border:1px solid var(--border2);color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;fo...` |
| 5888 | dynamic | `display:none` |

### Sort rosters by chosen key (10)

| Line | Mode | Declaration |
|---|---|---|
| 8072 | dynamic | `--bar-width:${w}%;--bar-color:${posColors[pos]}` |
| 8077 | dynamic | `--top-pos-color:${posColors[r.topScoringPos]}` |
| 8096 | dynamic | `--st-pos-color:${posColors.QB}` |
| 8097 | dynamic | `--st-pos-color:${posColors.RB}` |
| 8098 | dynamic | `--st-pos-color:${posColors.WR}` |
| 8099 | dynamic | `--st-pos-color:${posColors.TE}` |
| 8171 | dynamic | `margin-top:20px` |
| 8177 | dynamic | `border-left-color:var(--red)` |
| 8179 | dynamic | `color:var(--white);opacity:.7` |
| 8180 | dynamic | `${isMyPick?'color:var(--red)':''}` |

### Team logo helpers — load BEFORE player-panel.js so modal-hero badge works. (8)

| Line | Mode | Declaration |
|---|---|---|
| 2845 | static | `...` |
| 2902 | static | `...` |
| 2972 | static | `position:fixed;inset:0;background:var(--black);color:var(--white);display:flex;align-items:center;justify-content:center;font-f...` |
| 2973 | static | `background:var(--nav-bg);border-bottom:2px solid var(--red);position:sticky;top:0;z-index:100` |
| 2973 | static | `border:none;position:static` |
| 2976 | static | `fill-rule:evenodd;clip-rule:evenodd` |
| 3019 | static | `background:none;border:1px solid var(--border2);color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:it...` |
| 3048 | static | `display:none` |

### Close player-detail modal if open (5)

| Line | Mode | Declaration |
|---|---|---|
| 5145 | dynamic-context | `margin-top:14px;padding-top:14px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:8px;align-items:center` |
| 5147 | static | `display:inline-block;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:12px;color:var(--white);backgro...` |
| 5149 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-style:italic;text-align:center;line-height:1.5;max-width...` |
| 5163 | dynamic | `color:${diff>0?'var(--red)':diff<0?'var(--green)':'var(--white)'}` |
| 5223 | dynamic-context | `opacity:.5` |

### Helpers (5)

| Line | Mode | Declaration |
|---|---|---|
| 6947 | dynamic | `--cell-value-color:${valColor(r.value)}` |
| 6949 | dynamic | `--cell-proj-color:${seasonProjColor};--cell-proj-opacity:${seasonProjOpacity}` |
| 6950 | dynamic | `--cell-proj-color:${projColor};--cell-proj-opacity:${projOpacity}` |
| 6967 | dynamic | `--rp-stripe-color:${posColors[pos]}` |
| 6971 | dynamic | `--rp-total-color:${posColors[pos]}` |

### Total roster value (5)

| Line | Mode | Declaration |
|---|---|---|
| 7100 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:${_rankColor(rank)};padding:1px 6px;backg...` |
| 7104 | static | `display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px;padding:16px;background:var(--surface2);border:1px solid var(--border)` |
| 7105 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 7107 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 7110 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:var(--green)` |

### Trade Builder Modal — opens over the player detail modal (z-index 250) (5)

| Line | Mode | Declaration |
|---|---|---|
| 8355 | static | `z-index:250` |
| 8359 | static | `margin-right:8px` |
| 8366 | static | `z-index:260` |
| 8367 | static | `max-width:540px` |
| 8370 | static | `margin-right:8px` |

### PICKS BRANCH (4)

| Line | Mode | Declaration |
|---|---|---|
| 6484 | static | `background:var(--surface2);display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border)` |
| 6484 | static | `display:block` |
| 6486 | dynamic | `color:#9b91d4` |
| 6489 | dynamic | `color:${expoColor(p.exposure)}` |

### Renders draft picks in the same visual layout as a position section so the (4)

| Line | Mode | Declaration |
|---|---|---|
| 7014 | static | `--rp-stripe-color:var(--pos-pick-bg)` |
| 7051 | dynamic | `--cell-value-color:${valColor}` |
| 7061 | static | `--rp-stripe-color:var(--pos-pick-bg)` |
| 7065 | dynamic | `--rp-total-color:var(--pos-pick-bg)` |

### Stash render context on window so the sort buttons can re-render (4)

| Line | Mode | Declaration |
|---|---|---|
| 7968 | dynamic | `--mpx-color:${mpxColor}` |
| 7981 | dynamic | `--pos-color:${posColors[pos]}` |
| 7986 | dynamic | `--rank-color:${color}` |
| 7991 | dynamic | `--rank-color:${scoreColor}` |

### Group transactions by roster (3)

| Line | Mode | Declaration |
|---|---|---|
| 7611 | dynamic | `color:var(--red);font-size:10px;font-style:italic` |
| 7612 | dynamic | `color:var(--yellow)` |
| 7612 | dynamic | `color:var(--green)` |

### Sort state for the leagues list (2)

| Line | Mode | Declaration |
|---|---|---|
| 5635 | dynamic | `width:${w}%;background:${s.color}` |
| 5642 | dynamic-context | `opacity:.3` |

### Save current scoped IDs so the existing loadRoster / loadAllTrades can target them (2)

| Line | Mode | Declaration |
|---|---|---|
| 5969 | dynamic | `--archetype-bg:${mlArchetypeBg(archetype)};--archetype-fg:${mlArchetypeFg(archetype)}` |
| 5980 | dynamic | `--pos-chip-color:${color};--rank-chip-color:${rankColor}` |

### Color helpers (2)

| Line | Mode | Declaration |
|---|---|---|
| 6585 | dynamic | `color:${posColor(p.position)}` |
| 6588 | dynamic | `color:${expoColor(p.exposure)}` |

### Store per-league so multiple leagues can expand without collision (2)

| Line | Mode | Declaration |
|---|---|---|
| 7258 | static | `margin-bottom:12px` |
| 7259 | static | `display:none` |

### Aggregate per-roster (2)

| Line | Mode | Declaration |
|---|---|---|
| 7416 | dynamic | `width:${maxSpent ? (r.spent/maxSpent*100).toFixed(0) : 0}%` |
| 7418 | dynamic | `width:${budget ? (r.left/budget*100).toFixed(0) : 0}%` |

### Update section meta with archetype legend + league averages (2)

| Line | Mode | Declaration |
|---|---|---|
| 8013 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 8013 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |

### Columns: expandable league list (left) + player exposure (right) (1)

| Line | Mode | Declaration |
|---|---|---|
| 3070 | static | `display:none` |

### Archetype lookup for the owning team (1)

| Line | Mode | Declaration |
|---|---|---|
| 4185 | dynamic | `--archetype-bg:${mlArchetypeBg(r.ownerArchetype)};--archetype-fg:${mlArchetypeFg(r.ownerArchetype)}` |

### Render the current state of the suggestion pre-screener (1)

| Line | Mode | Declaration |
|---|---|---|
| 4552 | dynamic | `--archetype-bg:${mlArchetypeBg(archetype)};--archetype-fg:${mlArchetypeFg(archetype)}` |

### Render the current suggestion as a single card (1)

| Line | Mode | Declaration |
|---|---|---|
| 4682 | dynamic | `--balance-color:${balanceColor}` |

### Close modals on Escape (1)

| Line | Mode | Declaration |
|---|---|---|
| 5271 | dynamic | `color:${color};border-color:${color};background:${bg}` |
