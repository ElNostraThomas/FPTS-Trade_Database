# my-leagues.html inline-style inventory

Generated from `my-leagues.html` (7910 lines).
Total `style="..."` occurrences: **236**.

This is a read-only audit. No code was changed. The goal is to make the
refactor safe to execute supervised by giving every occurrence a category,
a section assignment, and an actionability verdict.

---

## Mode breakdown

| Mode | Count | % | Refactorable to CSS class? |
|---|---|---|---|
| `dynamic` | 118 | 50.0% | Conditional - if the interpolated value is a discrete enum, use a modifier class (e.g. `.is-active`); otherwise leave inline |
| `static` | 102 | 43.2% | Yes - pure HTML attribute, drop into a class |
| `dynamic-context` | 10 | 4.2% | Conditional - inside a JS-built HTML string; refactor only if the declaration set is static |
| `js-composed` | 6 | 2.5% | No - imperatively set at runtime; leave as-is |

**Headline:** ~102 are directly refactorable, ~128 require case-by-case judgement, ~6 must stay inline (JS-set).

---

## Top 25 declaration properties

Which CSS properties carry most of the inline styling. Where one property dominates, a single utility class can collapse many sites.

| Property | Count |
|---|---|
| `color` | 97 |
| `font-size` | 65 |
| `font-family` | 63 |
| `display` | 55 |
| `font-weight` | 44 |
| `font-style` | 38 |
| `align-items` | 37 |
| `width` | 35 |
| `background` | 34 |
| `flex-shrink` | 27 |
| `padding` | 26 |
| `gap` | 26 |
| `opacity` | 26 |
| `border` | 19 |
| `margin-bottom` | 19 |
| `letter-spacing` | 18 |
| `border-radius` | 18 |
| `height` | 17 |
| `text-transform` | 16 |
| `fill-rule` | 15 |
| `fill` | 14 |
| `justify-content` | 12 |
| `margin-top` | 12 |
| `min-width` | 8 |
| `flex` | 7 |

---

## Most-repeated declaration sets (>= 2 occurrences)

Each row below is a strong refactor candidate: same declaration set appearing N times -> create one class once, replace N sites.

| Count | Normalized declaration set |
|---|---|
| 13 | `fill-rule:nonzero; fill:var(--black)` |
| 5 | `display:none` |
| 3 | `display:block` |
| 3 | `color:var(--white)` |
| 3 | `color:var(--green)` |
| 2 | `...` |
| 2 | `align-items:center; display:flex; gap:8px` |
| 2 | `flex:1` |
| 2 | `color:var(--muted); font-family:'Mulish',sans-serif; font-size:10px; opacity:.5` |
| 2 | `color:var(--muted); flex-shrink:0; font-family:'Mulish',sans-serif; font-size:10px; opacity:.5` |
| 2 | `opacity:.5` |
| 2 | `opacity:.3` |
| 2 | `align-items:center; border-bottom:1px solid var(--border2); display:flex; justify-content:space-between; margin-bottom:2px; padding:6px 4px` |
| 2 | `color:var(--muted); font-weight:700; margin-left:4px` |
| 2 | `color:var(--muted); font-family:'Mulish',sans-serif; font-size:10px; font-weight:700` |
| 2 | `color:${expoColor(p.exposure)}` |
| 2 | `padding-right:8px; width:36px` |
| 2 | `color:var(--white); font-size:12px` |
| 2 | `align-items:center; display:flex; gap:10px` |
| 2 | `color:var(--muted); font-family:'Mulish',sans-serif; font-size:11px; opacity:.4` |
| 2 | `-webkit-overflow-scrolling:touch; overflow-x:auto` |
| 2 | `width:36px` |
| 2 | `background:var(--pos-pick-bg); flex-shrink:0; height:20px; width:4px` |
| 2 | `align-items:center; display:flex; gap:8px; margin-bottom:2px` |
| 2 | `width:30px` |
| 2 | `color:var(--red); font-size:10px; font-style:italic` |
| 2 | `color:var(--yellow)` |
| 2 | `flex:1; min-width:0` |
| 2 | `border-left:1px solid var(--border2); padding-left:12px` |
| 2 | `color:var(--white); font-family:'Kanit',sans-serif; font-style:italic; font-weight:800` |
| 2 | `color:var(--white); opacity:.5` |
| 2 | `margin-right:8px` |

---

## Occurrences per region

Sorted by count - the busiest regions are the highest-leverage refactor batches.

| Count | Region (nearest banner-comment heading above the hit) |
|---|---|
| 27 | Save current scoped IDs so the existing loadRoster / loadAllTrades can target them |
| 24 | Sort rosters by chosen key |
| 22 | Render an archetype chip |
| 21 | RIGHT: player exposure sidebar |
| 19 | Helpers |
| 15 | Renders draft picks in the same visual layout as a position section so the |
| 15 | Stash render context on window so the sort buttons can re-render |
| 14 | Aggregate per-roster |
| 14 | Build one side per roster_id |
| 12 | Temporarily assign global IDs so existing loadRoster can find them |
| 10 | Ensure roster/users/players are loaded and stashed on window for the modal layer |
| 8 | Team logo helpers — load BEFORE player-panel.js so modal-hero badge works. |
| 5 | Close player-detail modal if open |
| 5 | Total roster value |
| 5 | Trade Builder Modal — opens over the player detail modal (z-index 250) |
| 4 | PICKS BRANCH |
| 3 | Group transactions by roster |
| 2 | Sort state for the leagues list |
| 2 | Color helpers |
| 2 | Store per-league so multiple leagues can expand without collision |
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

### Save current scoped IDs so the existing loadRoster / loadAllTrades can target them (27)

| Line | Mode | Declaration |
|---|---|---|
| 5523 | dynamic | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:2px 6px;bor...` |
| 5532 | dynamic-context | `display:inline-flex;align-items:center;gap:3px;padding:2px 6px;background:var(--surface2);border:1px solid var(--border);border...` |
| 5533 | dynamic | `color:${color};letter-spacing:.04em` |
| 5534 | dynamic | `color:${rankColor}` |
| 5539 | dynamic-context | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:9px;color:var(--white);background:var(--red);padding...` |
| 5545 | dynamic | `border:1px solid var(--border);background:var(--surface);margin-bottom:6px` |
| 5547 | static | `display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;user-select:none` |
| 5549 | static | `font-family:'Mulish',sans-serif;font-size:9px;color:var(--muted);width:14px;text-align:center;flex-shrink:0;transition:transfor...` |
| 5551 | dynamic | `width:28px;height:28px;border-radius:3px;object-fit:cover;background:var(--surface2);flex-shrink:0` |
| 5552 | dynamic | `width:28px;height:28px;border-radius:3px;background:var(--surface2);display:flex;align-items:center;justify-content:center;font...` |
| 5556 | dynamic | `font-family:'Mulish',sans-serif;font-weight:800;font-size:13px;color:var(--white);white-space:nowrap;overflow:hidden;text-overf...` |
| 5560 | static | `display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin-top:5px` |
| 5564 | static | `text-align:right;flex-shrink:0` |
| 5565 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:14px;color:var(--white)` |
| 5566 | static | `font-family:'Mulish',sans-serif;font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em` |
| 5569 | dynamic | `display:none;border-top:1px solid var(--border);background:var(--surface2);padding:10px 14px` |
| 5693 | static | `display:flex;align-items:center;justify-content:space-between;padding:6px 4px;border-bottom:1px solid var(--border2);margin-bot...` |
| 5694 | dynamic | `color:var(--muted);font-weight:700;margin-left:4px` |
| 5695 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-weight:700` |
| 5706 | static | `display:flex;align-items:center;padding:6px 4px;border-bottom:1px solid var(--border2);margin-bottom:2px` |
| 5707 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--muted);text-transform:uppercase;let...` |
| 5707 | dynamic | `margin-left:4px` |
| 5719 | static | `display:flex;align-items:center;justify-content:space-between;padding:6px 4px;border-bottom:1px solid var(--border2);margin-bot...` |
| 5720 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--pos-pick-bg,#9b91d4);text-transform...` |
| 5720 | dynamic | `color:var(--muted);font-weight:700;margin-left:4px` |
| 5721 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-weight:700` |
| 5731 | dynamic | `font-family:'Mulish',sans-serif` |

### Sort rosters by chosen key (24)

| Line | Mode | Declaration |
|---|---|---|
| 7603 | js-composed | `width:26px;height:26px;border-radius:50%;object-fit:cover;margin-right:8px;flex-shrink:0;` |
| 7604 | dynamic-context | `width:26px;height:26px;border-radius:50%;background:var(--border2);margin-right:8px;flex-shrink:0;` |
| 7609 | dynamic | `height:100%;width:${w}%;background:${posColors[pos]};flex-shrink:0;` |
| 7612 | dynamic | `${rowBg}` |
| 7613 | dynamic | `color:var(--muted);opacity:.3;width:28px` |
| 7617 | dynamic | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;${r.isMe?'color:var(--red)':''}` |
| 7618 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:9px;color:var(--red);border:1px solid var(--red);pad...` |
| 7620 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:9px;color:${posColors[r.topScoringPos]};border:1px s...` |
| 7622 | static | `height:4px;background:var(--border);margin-top:5px;border-radius:2px;overflow:hidden;display:flex` |
| 7626 | dynamic | `color:var(--white)` |
| 7628 | dynamic | `color:${posColors.QB}` |
| 7629 | dynamic | `color:${posColors.RB}` |
| 7630 | dynamic | `color:${posColors.WR}` |
| 7631 | dynamic | `color:${posColors.TE}` |
| 7632 | dynamic | `color:var(--green)` |
| 7633 | dynamic | `color:var(--white);opacity:.5` |
| 7634 | dynamic | `color:var(--white);opacity:.5` |
| 7640 | static | `overflow-x:auto;-webkit-overflow-scrolling:touch` |
| 7641 | static | `width:100%;border-collapse:collapse;min-width:560px` |
| 7643 | static | `width:28px` |
| 7703 | dynamic | `margin-top:20px` |
| 7709 | dynamic | `border-left-color:var(--red)` |
| 7711 | dynamic | `color:var(--white);opacity:.7` |
| 7712 | dynamic | `${isMyPick?'color:var(--red)':''}` |

### Render an archetype chip (22)

| Line | Mode | Declaration |
|---|---|---|
| 3287 | dynamic | `display:inline-flex;align-items:center;justify-content:center;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;...` |
| 3290 | dynamic | `display:inline-flex;align-items:center;justify-content:center;background:${c};color:#fff;font-family:'Kanit',sans-serif;font-we...` |
| 3294 | dynamic-context | `width:32px;height:32px;flex-shrink:0;display:inline-block;` |
| 3295 | js-composed | `width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0;` |
| 3300 | dynamic-context | `width:32px;height:32px;border-radius:50%;background:var(--surface2);display:inline-flex;align-items:center;justify-content:cent...` |
| 3301 | static | `display:block` |
| 3385 | static | `display:flex;align-items:center;gap:8px;margin-bottom:6px` |
| 3387 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5` |
| 3389 | static | `display:flex;align-items:center;gap:10px;min-height:24px` |
| 3390 | static | `display:none;margin-top:8px` |
| 3392 | static | `background:none;border:none;color:var(--muted);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;...` |
| 3396 | static | `font-size:8px;transition:transform .15s` |
| 3398 | static | `display:none;margin-top:8px;padding-top:8px;border-top:1px solid var(--border)` |
| 3432 | static | `display:flex;align-items:center;gap:10px;width:100%;padding:8px 12px;background:rgba(237,129,12,0.06);border:1px dashed var(--b...` |
| 3433 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted);font-style:italic;flex:1;min-width:0` |
| 3435 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3450 | static | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;color:var(--white);text-decoration:none;flex:1;min-width:0;overf...` |
| 3454 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;flex-shrink:0` |
| 3456 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3466 | static | `display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border)` |
| 3468 | static | `font-family:'Mulish',sans-serif;font-weight:700;font-size:12px;color:var(--white);text-decoration:none;flex:1;min-width:0;overf...` |
| 3472 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;flex-shrink:0` |

### RIGHT: player exposure sidebar (21)

| Line | Mode | Declaration |
|---|---|---|
| 2645 | static | `display:flex;align-items:center;gap:8px` |
| 2646 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);width:12px;text-align:center;flex-shrink:0;transition:transfo...` |
| 2652 | static | `display:none` |
| 2671 | static | `width:24px;flex-shrink:0` |
| 2672 | static | `flex:1` |
| 2687 | static | `fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;` |
| 2687 | static | `fill:#c33;` |
| 2687 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2687 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2687 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2687 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2687 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2687 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2687 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2687 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2687 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2687 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2687 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2687 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2687 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2689 | dynamic-context | `flex-shrink:0;vertical-align:middle;margin-right:4px` |

### Helpers (19)

| Line | Mode | Declaration |
|---|---|---|
| 6474 | dynamic | `color:var(--green);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 6475 | dynamic | `color:var(--red);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 6476 | dynamic-context | `opacity:.3` |
| 6481 | dynamic | `width:36px;padding-right:8px` |
| 6486 | dynamic | `display:inline-flex;align-items:center` |
| 6490 | dynamic | `color:var(--white)` |
| 6491 | dynamic | `color:var(--white);font-size:12px` |
| 6492 | dynamic | `color:${valColor(r.value)}` |
| 6493 | dynamic | `color:var(--white);font-size:12px` |
| 6494 | dynamic | `color:${r.seasonProj ? 'var(--white)' : 'var(--muted)'};opacity:${r.seasonProj ? '1' : '.3'}` |
| 6495 | dynamic | `color:${r.proj ? (r.proj >= 20 ? 'var(--green)' : r.proj >= 12 ? 'var(--white)' : 'var(--muted)') : 'var(--muted)'};opacity:${r...` |
| 6498 | dynamic | `color:var(--white)` |
| 6511 | static | `display:flex;align-items:center;gap:10px` |
| 6512 | dynamic | `width:4px;height:20px;background:${posColors[pos]};flex-shrink:0` |
| 6514 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);opacity:.4` |
| 6516 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:${posColors[pos]}` |
| 6518 | static | `overflow-x:auto;-webkit-overflow-scrolling:touch` |
| 6519 | static | `width:100%;border-collapse:collapse;min-width:430px` |
| 6521 | static | `width:36px` |

### Renders draft picks in the same visual layout as a position section so the (15)

| Line | Mode | Declaration |
|---|---|---|
| 6558 | static | `display:flex;align-items:center;gap:10px;margin-bottom:10px` |
| 6559 | static | `width:4px;height:20px;background:var(--pos-pick-bg);flex-shrink:0` |
| 6562 | static | `font-size:13px;opacity:.4;padding:12px 0;font-family:'Mulish',sans-serif` |
| 6583 | dynamic | `border-bottom:1px solid var(--border)` |
| 6584 | dynamic | `width:36px;padding-right:8px` |
| 6588 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5` |
| 6592 | dynamic | `color:${val > 3000 ? 'var(--green)' : val > 1000 ? 'var(--white)' : 'var(--muted)'}` |
| 6593 | dynamic | `color:var(--muted);opacity:.4;font-size:11px` |
| 6601 | static | `display:flex;align-items:center;gap:10px` |
| 6602 | static | `width:4px;height:20px;background:var(--pos-pick-bg);flex-shrink:0` |
| 6604 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);opacity:.4` |
| 6606 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:var(--pos-pick-bg)` |
| 6608 | static | `overflow-x:auto` |
| 6609 | static | `width:100%;border-collapse:collapse;min-width:520px` |
| 6611 | static | `width:36px` |

### Stash render context on window so the sort buttons can re-render (15)

| Line | Mode | Declaration |
|---|---|---|
| 7505 | static | `margin-bottom:24px` |
| 7506 | static | `display:flex;align-items:center;justify-content:space-between;margin-bottom:12px` |
| 7507 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;lette...` |
| 7508 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted)` |
| 7508 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;color:${+myTeam.mpxPct>=90?'var(--green)':+myTeam.mpxPct>=75?'...` |
| 7508 | dynamic | `opacity:.5` |
| 7510 | static | `display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px` |
| 7521 | dynamic | `background:var(--surface2);border:1px solid var(--border);padding:12px 14px;border-left:3px solid ${posColors[pos]}` |
| 7522 | dynamic | `margin-bottom:6px` |
| 7523 | static | `display:flex;gap:12px;align-items:flex-end` |
| 7526 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:${color}` |
| 7529 | dynamic | `border-left:1px solid var(--border2);padding-left:12px` |
| 7531 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:${scoreColor}` |
| 7534 | dynamic | `border-left:1px solid var(--border2);padding-left:12px` |
| 7540 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.35;margin-top:4px` |

### Aggregate per-roster (14)

| Line | Mode | Declaration |
|---|---|---|
| 6931 | static | `width:30px` |
| 6951 | dynamic | `color:var(--red);font-size:10px;font-style:italic` |
| 6956 | dynamic | `color:var(--yellow)` |
| 6957 | dynamic | `width:${maxSpent ? (r.spent/maxSpent*100).toFixed(0) : 0}%` |
| 6958 | dynamic | `color:var(--green)` |
| 6959 | dynamic | `width:${budget ? (r.left/budget*100).toFixed(0) : 0}%` |
| 6961 | dynamic | `text-align:right;color:var(--muted)` |
| 6963 | dynamic | `text-align:right;color:var(--yellow)` |
| 7001 | static | `width:30px` |
| 7036 | dynamic | `font-size:12px` |
| 7036 | dynamic | `color:var(--red);font-style:italic` |
| 7084 | dynamic | `color:var(--muted);opacity:.4;font-size:10px` |
| 7087 | dynamic | `background:rgba(237,129,12,0.05)` |
| 7091 | dynamic | `opacity:.4` |

### Build one side per roster_id (14)

| Line | Mode | Declaration |
|---|---|---|
| 7271 | static | `display:flex;justify-content:space-between;align-items:center;margin-bottom:8px` |
| 7272 | dynamic | `margin-bottom:0` |
| 7278 | dynamic | `${s.isMe ? 'color:var(--red)' : ''}` |
| 7281 | static | `width:28px;height:28px;flex-shrink:0;display:inline-flex;align-items:center;` |
| 7283 | js-composed | `width:28px;height:28px;border-radius:50%;object-fit:cover;` |
| 7287 | static | `min-width:0;flex:1` |
| 7288 | static | `display:flex;align-items:center;gap:4px;flex-wrap:wrap` |
| 7292 | dynamic | `display:flex;gap:8px;margin-top:2px` |
| 7301 | static | `min-width:0;flex:1` |
| 7303 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.35;margin-left:4px` |
| 7304 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--pos-pick-bg);margin-top:2px` |
| 7308 | dynamic | `margin-top:4px` |
| 7309 | static | `width:28px;flex-shrink:0;` |
| 7310 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:12px;color:var(--green)` |

### Temporarily assign global IDs so existing loadRoster can find them (12)

| Line | Mode | Declaration |
|---|---|---|
| 5842 | static | `display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--surface);border:1px solid var(--border);margin-bott...` |
| 5843 | static | `display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;flex-shrink:0;background:var(--surface2);b...` |
| 5843 | static | `display:block` |
| 5844 | static | `flex:1` |
| 5846 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);margin-top:3px` |
| 5849 | static | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px` |
| 5853 | js-composed | `display:flex;align-items:center;gap:12px;padding:11px 12px;background:var(--surface);border:1px solid var(--border);margin-bott...` |
| 5854 | js-composed | `width:30px;height:30px;border-radius:2px;flex-shrink:0` |
| 5854 | js-composed | `width:30px;height:30px;background:var(--surface2);border-radius:2px;flex-shrink:0` |
| 5856 | dynamic | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;color:var(--white);white-space:nowrap;overflow:hidden;text-overf...` |
| 5857 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.7;margin-top:1px` |
| 5859 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;lette...` |

### Ensure roster/users/players are loaded and stashed on window for the modal layer (10)

| Line | Mode | Declaration |
|---|---|---|
| 5397 | dynamic | `display:inline-flex;align-items:center;gap:6px;padding:6px 10px;background:var(--surface2);border:1px solid var(--border);borde...` |
| 5398 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:${color};text-transform:uppercase;letter-...` |
| 5399 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:14px;color:${rankColor}` |
| 5400 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.6` |
| 5410 | dynamic | `display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px` |
| 5422 | static | `display:flex;align-items:center;justify-content:space-between` |
| 5424 | static | `display:flex;align-items:center;gap:8px` |
| 5425 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em` |
| 5427 | static | `background:var(--surface2);border:1px solid var(--border2);color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;fo...` |
| 5444 | dynamic | `display:none` |

### Team logo helpers — load BEFORE player-panel.js so modal-hero badge works. (8)

| Line | Mode | Declaration |
|---|---|---|
| 2401 | static | `...` |
| 2458 | static | `...` |
| 2528 | static | `position:fixed;inset:0;background:var(--black);color:var(--white);display:flex;align-items:center;justify-content:center;font-f...` |
| 2529 | static | `background:var(--nav-bg);border-bottom:2px solid var(--red);position:sticky;top:0;z-index:100` |
| 2529 | static | `border:none;position:static` |
| 2532 | static | `fill-rule:evenodd;clip-rule:evenodd` |
| 2575 | static | `background:none;border:1px solid var(--border2);color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:it...` |
| 2604 | static | `display:none` |

### Close player-detail modal if open (5)

| Line | Mode | Declaration |
|---|---|---|
| 4701 | dynamic-context | `margin-top:14px;padding-top:14px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:8px;align-items:center` |
| 4703 | static | `display:inline-block;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:12px;color:var(--white);backgro...` |
| 4705 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-style:italic;text-align:center;line-height:1.5;max-width...` |
| 4719 | dynamic | `color:${diff>0?'var(--red)':diff<0?'var(--green)':'var(--white)'}` |
| 4779 | dynamic-context | `opacity:.5` |

### Total roster value (5)

| Line | Mode | Declaration |
|---|---|---|
| 6641 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:${_rankColor(rank)};padding:1px 6px;backg...` |
| 6645 | static | `display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px;padding:16px;background:var(--surface2);border:1px solid var(--border)` |
| 6646 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 6648 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 6651 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:var(--green)` |

### Trade Builder Modal — opens over the player detail modal (z-index 250) (5)

| Line | Mode | Declaration |
|---|---|---|
| 7887 | static | `z-index:250` |
| 7891 | static | `margin-right:8px` |
| 7898 | static | `z-index:260` |
| 7899 | static | `max-width:540px` |
| 7902 | static | `margin-right:8px` |

### PICKS BRANCH (4)

| Line | Mode | Declaration |
|---|---|---|
| 6038 | static | `background:var(--surface2);display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border)` |
| 6038 | static | `display:block` |
| 6040 | dynamic | `color:#9b91d4` |
| 6043 | dynamic | `color:${expoColor(p.exposure)}` |

### Group transactions by roster (3)

| Line | Mode | Declaration |
|---|---|---|
| 7152 | dynamic | `color:var(--red);font-size:10px;font-style:italic` |
| 7153 | dynamic | `color:var(--yellow)` |
| 7153 | dynamic | `color:var(--green)` |

### Sort state for the leagues list (2)

| Line | Mode | Declaration |
|---|---|---|
| 5191 | dynamic | `width:${w}%;background:${s.color}` |
| 5198 | dynamic-context | `opacity:.3` |

### Color helpers (2)

| Line | Mode | Declaration |
|---|---|---|
| 6139 | dynamic | `color:${posColor(p.position)}` |
| 6142 | dynamic | `color:${expoColor(p.exposure)}` |

### Store per-league so multiple leagues can expand without collision (2)

| Line | Mode | Declaration |
|---|---|---|
| 6799 | static | `margin-bottom:12px` |
| 6800 | static | `display:none` |

### Update section meta with archetype legend + league averages (2)

| Line | Mode | Declaration |
|---|---|---|
| 7553 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 7553 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |

### Columns: expandable league list (left) + player exposure (right) (1)

| Line | Mode | Declaration |
|---|---|---|
| 2626 | static | `display:none` |

### Archetype lookup for the owning team (1)

| Line | Mode | Declaration |
|---|---|---|
| 3741 | dynamic | `--archetype-bg:${mlArchetypeBg(r.ownerArchetype)};--archetype-fg:${mlArchetypeFg(r.ownerArchetype)}` |

### Render the current state of the suggestion pre-screener (1)

| Line | Mode | Declaration |
|---|---|---|
| 4108 | dynamic | `--archetype-bg:${mlArchetypeBg(archetype)};--archetype-fg:${mlArchetypeFg(archetype)}` |

### Render the current suggestion as a single card (1)

| Line | Mode | Declaration |
|---|---|---|
| 4238 | dynamic | `--balance-color:${balanceColor}` |

### Close modals on Escape (1)

| Line | Mode | Declaration |
|---|---|---|
| 4827 | dynamic | `color:${color};border-color:${color};background:${bg}` |
