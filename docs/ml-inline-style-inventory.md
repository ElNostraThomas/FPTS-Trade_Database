# my-leagues.html inline-style inventory

Generated from `my-leagues.html` (8309 lines).
Total `style="..."` occurrences: **149**.

This is a read-only audit. No code was changed. The goal is to make the
refactor safe to execute supervised by giving every occurrence a category,
a section assignment, and an actionability verdict.

---

## Mode breakdown

| Mode | Count | % | Refactorable to CSS class? |
|---|---|---|---|
| `static` | 73 | 49.0% | Yes - pure HTML attribute, drop into a class |
| `dynamic` | 65 | 43.6% | Conditional - if the interpolated value is a discrete enum, use a modifier class (e.g. `.is-active`); otherwise leave inline |
| `dynamic-context` | 6 | 4.0% | Conditional - inside a JS-built HTML string; refactor only if the declaration set is static |
| `js-composed` | 5 | 3.4% | No - imperatively set at runtime; leave as-is |

**Headline:** ~73 are directly refactorable, ~71 require case-by-case judgement, ~5 must stay inline (JS-set).

---

## Top 25 declaration properties

Which CSS properties carry most of the inline styling. Where one property dominates, a single utility class can collapse many sites.

| Property | Count |
|---|---|
| `color` | 42 |
| `display` | 39 |
| `font-family` | 33 |
| `font-size` | 33 |
| `align-items` | 24 |
| `font-weight` | 21 |
| `font-style` | 21 |
| `background` | 19 |
| `gap` | 18 |
| `flex-shrink` | 17 |
| `fill-rule` | 15 |
| `width` | 15 |
| `border` | 14 |
| `padding` | 14 |
| `fill` | 14 |
| `letter-spacing` | 11 |
| `border-radius` | 11 |
| `margin-bottom` | 11 |
| `text-transform` | 10 |
| `opacity` | 10 |
| `margin-top` | 9 |
| `justify-content` | 8 |
| `height` | 8 |
| `flex` | 7 |
| `min-width` | 5 |

---

## Most-repeated declaration sets (>= 2 occurrences)

Each row below is a strong refactor candidate: same declaration set appearing N times -> create one class once, replace N sites.

| Count | Normalized declaration set |
|---|---|
| 13 | `fill-rule:nonzero; fill:var(--black)` |
| 5 | `display:none` |
| 3 | `display:block` |
| 2 | `...` |
| 2 | `align-items:center; display:flex; gap:8px` |
| 2 | `flex:1` |
| 2 | `color:var(--muted); flex-shrink:0; font-family:'Mulish',sans-serif; font-size:10px; opacity:.5` |
| 2 | `--archetype-bg:${mlArchetypeBg(archetype)}; --archetype-fg:${mlArchetypeFg(archetype)}` |
| 2 | `color:${expoColor(p.exposure)}` |
| 2 | `--rp-stripe-color:var(--pos-pick-bg)` |
| 2 | `align-items:center; display:flex; gap:8px; margin-bottom:2px` |
| 2 | `flex:1; min-width:0` |
| 2 | `color:var(--white); font-family:'Kanit',sans-serif; font-style:italic; font-weight:800` |
| 2 | `margin-right:8px` |

---

## Occurrences per region

Sorted by count - the busiest regions are the highest-leverage refactor batches.

| Count | Region (nearest banner-comment heading above the hit) |
|---|---|
| 22 | Render an archetype chip |
| 21 | RIGHT: player exposure sidebar |
| 14 | Build one side per roster_id |
| 12 | Temporarily assign global IDs so existing loadRoster can find them |
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
| 3662 | dynamic | `display:inline-flex;align-items:center;justify-content:center;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;...` |
| 3665 | dynamic | `display:inline-flex;align-items:center;justify-content:center;background:${c};color:#fff;font-family:'Kanit',sans-serif;font-we...` |
| 3669 | dynamic-context | `width:32px;height:32px;flex-shrink:0;display:inline-block;` |
| 3670 | js-composed | `width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0;` |
| 3675 | dynamic-context | `width:32px;height:32px;border-radius:50%;background:var(--surface2);display:inline-flex;align-items:center;justify-content:cent...` |
| 3676 | static | `display:block` |
| 3760 | static | `display:flex;align-items:center;gap:8px;margin-bottom:6px` |
| 3762 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5` |
| 3764 | static | `display:flex;align-items:center;gap:10px;min-height:24px` |
| 3765 | static | `display:none;margin-top:8px` |
| 3767 | static | `background:none;border:none;color:var(--muted);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;...` |
| 3771 | static | `font-size:8px;transition:transform .15s` |
| 3773 | static | `display:none;margin-top:8px;padding-top:8px;border-top:1px solid var(--border)` |
| 3807 | static | `display:flex;align-items:center;gap:10px;width:100%;padding:8px 12px;background:rgba(237,129,12,0.06);border:1px dashed var(--b...` |
| 3808 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted);font-style:italic;flex:1;min-width:0` |
| 3810 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3825 | static | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;color:var(--white);text-decoration:none;flex:1;min-width:0;overf...` |
| 3829 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;flex-shrink:0` |
| 3831 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3841 | static | `display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border)` |
| 3843 | static | `font-family:'Mulish',sans-serif;font-weight:700;font-size:12px;color:var(--white);text-decoration:none;flex:1;min-width:0;overf...` |
| 3847 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;flex-shrink:0` |

### RIGHT: player exposure sidebar (21)

| Line | Mode | Declaration |
|---|---|---|
| 3020 | static | `display:flex;align-items:center;gap:8px` |
| 3021 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);width:12px;text-align:center;flex-shrink:0;transition:transfo...` |
| 3027 | static | `display:none` |
| 3046 | static | `width:24px;flex-shrink:0` |
| 3047 | static | `flex:1` |
| 3062 | static | `fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;` |
| 3062 | static | `fill:#c33;` |
| 3062 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3062 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3062 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3062 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3062 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3062 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3062 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3062 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3062 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3062 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3062 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3062 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3062 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3064 | dynamic-context | `flex-shrink:0;vertical-align:middle;margin-right:4px` |

### Build one side per roster_id (14)

| Line | Mode | Declaration |
|---|---|---|
| 7661 | static | `display:flex;justify-content:space-between;align-items:center;margin-bottom:8px` |
| 7662 | dynamic | `margin-bottom:0` |
| 7668 | dynamic | `${s.isMe ? 'color:var(--red)' : ''}` |
| 7671 | static | `width:28px;height:28px;flex-shrink:0;display:inline-flex;align-items:center;` |
| 7673 | js-composed | `width:28px;height:28px;border-radius:50%;object-fit:cover;` |
| 7677 | static | `min-width:0;flex:1` |
| 7678 | static | `display:flex;align-items:center;gap:4px;flex-wrap:wrap` |
| 7682 | dynamic | `display:flex;gap:8px;margin-top:2px` |
| 7691 | static | `min-width:0;flex:1` |
| 7693 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.35;margin-left:4px` |
| 7694 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--pos-pick-bg);margin-top:2px` |
| 7698 | dynamic | `margin-top:4px` |
| 7699 | static | `width:28px;flex-shrink:0;` |
| 7700 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:12px;color:var(--green)` |

### Temporarily assign global IDs so existing loadRoster can find them (12)

| Line | Mode | Declaration |
|---|---|---|
| 6219 | static | `display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--surface);border:1px solid var(--border);margin-bott...` |
| 6220 | static | `display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;flex-shrink:0;background:var(--surface2);b...` |
| 6220 | static | `display:block` |
| 6221 | static | `flex:1` |
| 6223 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);margin-top:3px` |
| 6226 | static | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px` |
| 6230 | js-composed | `display:flex;align-items:center;gap:12px;padding:11px 12px;background:var(--surface);border:1px solid var(--border);margin-bott...` |
| 6231 | js-composed | `width:30px;height:30px;border-radius:2px;flex-shrink:0` |
| 6231 | js-composed | `width:30px;height:30px;background:var(--surface2);border-radius:2px;flex-shrink:0` |
| 6233 | dynamic | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;color:var(--white);white-space:nowrap;overflow:hidden;text-overf...` |
| 6234 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.7;margin-top:1px` |
| 6236 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;lette...` |

### Ensure roster/users/players are loaded and stashed on window for the modal layer (10)

| Line | Mode | Declaration |
|---|---|---|
| 5772 | dynamic | `display:inline-flex;align-items:center;gap:6px;padding:6px 10px;background:var(--surface2);border:1px solid var(--border);borde...` |
| 5773 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:${color};text-transform:uppercase;letter-...` |
| 5774 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:14px;color:${rankColor}` |
| 5775 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.6` |
| 5785 | dynamic | `display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px` |
| 5797 | static | `display:flex;align-items:center;justify-content:space-between` |
| 5799 | static | `display:flex;align-items:center;gap:8px` |
| 5800 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em` |
| 5802 | static | `background:var(--surface2);border:1px solid var(--border2);color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;fo...` |
| 5819 | dynamic | `display:none` |

### Sort rosters by chosen key (10)

| Line | Mode | Declaration |
|---|---|---|
| 8003 | dynamic | `--bar-width:${w}%;--bar-color:${posColors[pos]}` |
| 8008 | dynamic | `--top-pos-color:${posColors[r.topScoringPos]}` |
| 8027 | dynamic | `--st-pos-color:${posColors.QB}` |
| 8028 | dynamic | `--st-pos-color:${posColors.RB}` |
| 8029 | dynamic | `--st-pos-color:${posColors.WR}` |
| 8030 | dynamic | `--st-pos-color:${posColors.TE}` |
| 8102 | dynamic | `margin-top:20px` |
| 8108 | dynamic | `border-left-color:var(--red)` |
| 8110 | dynamic | `color:var(--white);opacity:.7` |
| 8111 | dynamic | `${isMyPick?'color:var(--red)':''}` |

### Team logo helpers — load BEFORE player-panel.js so modal-hero badge works. (8)

| Line | Mode | Declaration |
|---|---|---|
| 2776 | static | `...` |
| 2833 | static | `...` |
| 2903 | static | `position:fixed;inset:0;background:var(--black);color:var(--white);display:flex;align-items:center;justify-content:center;font-f...` |
| 2904 | static | `background:var(--nav-bg);border-bottom:2px solid var(--red);position:sticky;top:0;z-index:100` |
| 2904 | static | `border:none;position:static` |
| 2907 | static | `fill-rule:evenodd;clip-rule:evenodd` |
| 2950 | static | `background:none;border:1px solid var(--border2);color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:it...` |
| 2979 | static | `display:none` |

### Close player-detail modal if open (5)

| Line | Mode | Declaration |
|---|---|---|
| 5076 | dynamic-context | `margin-top:14px;padding-top:14px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:8px;align-items:center` |
| 5078 | static | `display:inline-block;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:12px;color:var(--white);backgro...` |
| 5080 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-style:italic;text-align:center;line-height:1.5;max-width...` |
| 5094 | dynamic | `color:${diff>0?'var(--red)':diff<0?'var(--green)':'var(--white)'}` |
| 5154 | dynamic-context | `opacity:.5` |

### Helpers (5)

| Line | Mode | Declaration |
|---|---|---|
| 6878 | dynamic | `--cell-value-color:${valColor(r.value)}` |
| 6880 | dynamic | `--cell-proj-color:${seasonProjColor};--cell-proj-opacity:${seasonProjOpacity}` |
| 6881 | dynamic | `--cell-proj-color:${projColor};--cell-proj-opacity:${projOpacity}` |
| 6898 | dynamic | `--rp-stripe-color:${posColors[pos]}` |
| 6902 | dynamic | `--rp-total-color:${posColors[pos]}` |

### Total roster value (5)

| Line | Mode | Declaration |
|---|---|---|
| 7031 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:${_rankColor(rank)};padding:1px 6px;backg...` |
| 7035 | static | `display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px;padding:16px;background:var(--surface2);border:1px solid var(--border)` |
| 7036 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 7038 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 7041 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:var(--green)` |

### Trade Builder Modal — opens over the player detail modal (z-index 250) (5)

| Line | Mode | Declaration |
|---|---|---|
| 8286 | static | `z-index:250` |
| 8290 | static | `margin-right:8px` |
| 8297 | static | `z-index:260` |
| 8298 | static | `max-width:540px` |
| 8301 | static | `margin-right:8px` |

### PICKS BRANCH (4)

| Line | Mode | Declaration |
|---|---|---|
| 6415 | static | `background:var(--surface2);display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border)` |
| 6415 | static | `display:block` |
| 6417 | dynamic | `color:#9b91d4` |
| 6420 | dynamic | `color:${expoColor(p.exposure)}` |

### Renders draft picks in the same visual layout as a position section so the (4)

| Line | Mode | Declaration |
|---|---|---|
| 6945 | static | `--rp-stripe-color:var(--pos-pick-bg)` |
| 6982 | dynamic | `--cell-value-color:${valColor}` |
| 6992 | static | `--rp-stripe-color:var(--pos-pick-bg)` |
| 6996 | dynamic | `--rp-total-color:var(--pos-pick-bg)` |

### Stash render context on window so the sort buttons can re-render (4)

| Line | Mode | Declaration |
|---|---|---|
| 7899 | dynamic | `--mpx-color:${mpxColor}` |
| 7912 | dynamic | `--pos-color:${posColors[pos]}` |
| 7917 | dynamic | `--rank-color:${color}` |
| 7922 | dynamic | `--rank-color:${scoreColor}` |

### Group transactions by roster (3)

| Line | Mode | Declaration |
|---|---|---|
| 7542 | dynamic | `color:var(--red);font-size:10px;font-style:italic` |
| 7543 | dynamic | `color:var(--yellow)` |
| 7543 | dynamic | `color:var(--green)` |

### Sort state for the leagues list (2)

| Line | Mode | Declaration |
|---|---|---|
| 5566 | dynamic | `width:${w}%;background:${s.color}` |
| 5573 | dynamic-context | `opacity:.3` |

### Save current scoped IDs so the existing loadRoster / loadAllTrades can target them (2)

| Line | Mode | Declaration |
|---|---|---|
| 5900 | dynamic | `--archetype-bg:${mlArchetypeBg(archetype)};--archetype-fg:${mlArchetypeFg(archetype)}` |
| 5911 | dynamic | `--pos-chip-color:${color};--rank-chip-color:${rankColor}` |

### Color helpers (2)

| Line | Mode | Declaration |
|---|---|---|
| 6516 | dynamic | `color:${posColor(p.position)}` |
| 6519 | dynamic | `color:${expoColor(p.exposure)}` |

### Store per-league so multiple leagues can expand without collision (2)

| Line | Mode | Declaration |
|---|---|---|
| 7189 | static | `margin-bottom:12px` |
| 7190 | static | `display:none` |

### Aggregate per-roster (2)

| Line | Mode | Declaration |
|---|---|---|
| 7347 | dynamic | `width:${maxSpent ? (r.spent/maxSpent*100).toFixed(0) : 0}%` |
| 7349 | dynamic | `width:${budget ? (r.left/budget*100).toFixed(0) : 0}%` |

### Update section meta with archetype legend + league averages (2)

| Line | Mode | Declaration |
|---|---|---|
| 7944 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 7944 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |

### Columns: expandable league list (left) + player exposure (right) (1)

| Line | Mode | Declaration |
|---|---|---|
| 3001 | static | `display:none` |

### Archetype lookup for the owning team (1)

| Line | Mode | Declaration |
|---|---|---|
| 4116 | dynamic | `--archetype-bg:${mlArchetypeBg(r.ownerArchetype)};--archetype-fg:${mlArchetypeFg(r.ownerArchetype)}` |

### Render the current state of the suggestion pre-screener (1)

| Line | Mode | Declaration |
|---|---|---|
| 4483 | dynamic | `--archetype-bg:${mlArchetypeBg(archetype)};--archetype-fg:${mlArchetypeFg(archetype)}` |

### Render the current suggestion as a single card (1)

| Line | Mode | Declaration |
|---|---|---|
| 4613 | dynamic | `--balance-color:${balanceColor}` |

### Close modals on Escape (1)

| Line | Mode | Declaration |
|---|---|---|
| 5202 | dynamic | `color:${color};border-color:${color};background:${bg}` |
