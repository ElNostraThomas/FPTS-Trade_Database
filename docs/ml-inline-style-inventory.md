# my-leagues.html inline-style inventory

Generated from `my-leagues.html` (7741 lines).
Total `style="..."` occurrences: **274**.

This is a read-only audit. No code was changed. The goal is to make the
refactor safe to execute supervised by giving every occurrence a category,
a section assignment, and an actionability verdict.

---

## Mode breakdown

| Mode | Count | % | Refactorable to CSS class? |
|---|---|---|---|
| `dynamic` | 133 | 48.5% | Conditional - if the interpolated value is a discrete enum, use a modifier class (e.g. `.is-active`); otherwise leave inline |
| `static` | 124 | 45.3% | Yes - pure HTML attribute, drop into a class |
| `dynamic-context` | 10 | 3.6% | Conditional - inside a JS-built HTML string; refactor only if the declaration set is static |
| `js-composed` | 7 | 2.6% | No - imperatively set at runtime; leave as-is |

**Headline:** ~124 are directly refactorable, ~143 require case-by-case judgement, ~7 must stay inline (JS-set).

---

## Top 25 declaration properties

Which CSS properties carry most of the inline styling. Where one property dominates, a single utility class can collapse many sites.

| Property | Count |
|---|---|
| `color` | 124 |
| `font-size` | 91 |
| `font-family` | 88 |
| `display` | 62 |
| `font-weight` | 58 |
| `font-style` | 45 |
| `background` | 43 |
| `padding` | 41 |
| `align-items` | 40 |
| `width` | 36 |
| `flex-shrink` | 31 |
| `gap` | 30 |
| `margin-bottom` | 28 |
| `letter-spacing` | 27 |
| `opacity` | 27 |
| `text-transform` | 26 |
| `border-radius` | 26 |
| `border` | 23 |
| `height` | 18 |
| `margin-top` | 16 |
| `fill-rule` | 15 |
| `justify-content` | 14 |
| `fill` | 14 |
| `flex` | 11 |
| `min-width` | 10 |

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
| 2 | `align-items:center; border-bottom:1px solid var(--border); display:flex; gap:8px; padding:6px 0` |
| 2 | `color:var(--white); flex:1; font-family:'Mulish',sans-serif; font-size:12px; font-weight:700; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap` |
| 2 | `color:var(--muted); flex-shrink:0; font-family:'Mulish',sans-serif; font-size:10px` |
| 2 | `color:var(--muted); font-family:'Mulish',sans-serif; font-size:9px; font-weight:700; letter-spacing:.06em; margin-bottom:2px; text-transform:uppercase` |
| 2 | `color:var(--muted); display:flex; font-family:'Mulish',sans-serif; font-size:10px; justify-content:space-between; padding-top:6px` |
| 2 | `color:var(--white); font-weight:700` |
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
| 28 | Render the current suggestion as a single card |
| 27 | Save current scoped IDs so the existing loadRoster / loadAllTrades can target them |
| 24 | Sort rosters by chosen key |
| 22 | Render an archetype chip |
| 21 | RIGHT: player exposure sidebar |
| 19 | Helpers |
| 15 | Renders draft picks in the same visual layout as a position section so the |
| 15 | Stash render context on window so the sort buttons can re-render |
| 14 | Aggregate per-roster |
| 14 | Build one side per roster_id |
| 12 | Render the current state of the suggestion pre-screener |
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

### Render the current suggestion as a single card (28)

| Line | Mode | Declaration |
|---|---|---|
| 4018 | static | `display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)` |
| 4019 | dynamic | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:800;text-transform:uppercase;padding:2px 5px;border-radius:2px;${posS...` |
| 4020 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;font-weight:700;color:var(--white);flex:1;min-width:0;overflow:hidden;text-overf...` |
| 4021 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);flex-shrink:0` |
| 4028 | static | `display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)` |
| 4029 | dynamic | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:800;text-transform:uppercase;padding:2px 5px;border-radius:2px;backgr...` |
| 4030 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;font-weight:700;color:var(--white);flex:1;min-width:0;overflow:hidden;text-overf...` |
| 4031 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);flex-shrink:0` |
| 4042 | static | `padding:14px 18px` |
| 4045 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted)` |
| 4048 | static | `border:1px solid var(--border2);background:var(--surface2);padding:12px 14px;margin-bottom:14px` |
| 4049 | static | `margin-bottom:8px` |
| 4050 | static | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;color:var(--muted);letter-spacing:.06em;...` |
| 4052 | static | `display:flex;justify-content:space-between;padding-top:6px;font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted)` |
| 4053 | dynamic | `color:var(--white);font-weight:700` |
| 4056 | static | `border-top:1px solid var(--border);padding-top:8px;margin-top:6px` |
| 4057 | static | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;color:var(--muted);letter-spacing:.06em;...` |
| 4059 | static | `display:flex;justify-content:space-between;padding-top:6px;font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted)` |
| 4060 | dynamic | `color:var(--white);font-weight:700` |
| 4063 | dynamic | `margin-top:10px;padding-top:8px;border-top:1px solid var(--border);font-family:'Mulish',sans-serif;font-size:11px;color:${balan...` |
| 4066 | static | `display:flex;gap:10px;margin-bottom:10px` |
| 4068 | static | `flex:1;background:transparent;border:2px solid var(--red);color:var(--red);font-family:'Kanit',sans-serif;font-weight:800;font-...` |
| 4072 | static | `flex:1;background:var(--green);border:2px solid var(--green);color:var(--black);font-family:'Kanit',sans-serif;font-weight:800;...` |
| 4076 | static | `text-align:center;font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-style:italic` |
| 4086 | static | `padding:24px 20px;text-align:center` |
| 4087 | dynamic | `font-family:'Mulish',sans-serif;font-size:13px;color:var(--white);margin-bottom:6px;line-height:1.5` |
| 4088 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);margin-bottom:18px;line-height:1.5` |
| 4090 | static | `background:var(--red);border:none;color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size...` |

### Save current scoped IDs so the existing loadRoster / loadAllTrades can target them (27)

| Line | Mode | Declaration |
|---|---|---|
| 5354 | dynamic | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:2px 6px;bor...` |
| 5363 | dynamic-context | `display:inline-flex;align-items:center;gap:3px;padding:2px 6px;background:var(--surface2);border:1px solid var(--border);border...` |
| 5364 | dynamic | `color:${color};letter-spacing:.04em` |
| 5365 | dynamic | `color:${rankColor}` |
| 5370 | dynamic-context | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:9px;color:var(--white);background:var(--red);padding...` |
| 5376 | dynamic | `border:1px solid var(--border);background:var(--surface);margin-bottom:6px` |
| 5378 | static | `display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;user-select:none` |
| 5380 | static | `font-family:'Mulish',sans-serif;font-size:9px;color:var(--muted);width:14px;text-align:center;flex-shrink:0;transition:transfor...` |
| 5382 | dynamic | `width:28px;height:28px;border-radius:3px;object-fit:cover;background:var(--surface2);flex-shrink:0` |
| 5383 | dynamic | `width:28px;height:28px;border-radius:3px;background:var(--surface2);display:flex;align-items:center;justify-content:center;font...` |
| 5387 | dynamic | `font-family:'Mulish',sans-serif;font-weight:800;font-size:13px;color:var(--white);white-space:nowrap;overflow:hidden;text-overf...` |
| 5391 | static | `display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin-top:5px` |
| 5395 | static | `text-align:right;flex-shrink:0` |
| 5396 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:14px;color:var(--white)` |
| 5397 | static | `font-family:'Mulish',sans-serif;font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em` |
| 5400 | dynamic | `display:none;border-top:1px solid var(--border);background:var(--surface2);padding:10px 14px` |
| 5524 | static | `display:flex;align-items:center;justify-content:space-between;padding:6px 4px;border-bottom:1px solid var(--border2);margin-bot...` |
| 5525 | dynamic | `color:var(--muted);font-weight:700;margin-left:4px` |
| 5526 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-weight:700` |
| 5537 | static | `display:flex;align-items:center;padding:6px 4px;border-bottom:1px solid var(--border2);margin-bottom:2px` |
| 5538 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--muted);text-transform:uppercase;let...` |
| 5538 | dynamic | `margin-left:4px` |
| 5550 | static | `display:flex;align-items:center;justify-content:space-between;padding:6px 4px;border-bottom:1px solid var(--border2);margin-bot...` |
| 5551 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--pos-pick-bg,#9b91d4);text-transform...` |
| 5551 | dynamic | `color:var(--muted);font-weight:700;margin-left:4px` |
| 5552 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-weight:700` |
| 5562 | dynamic | `font-family:'Mulish',sans-serif` |

### Sort rosters by chosen key (24)

| Line | Mode | Declaration |
|---|---|---|
| 7434 | js-composed | `width:26px;height:26px;border-radius:50%;object-fit:cover;margin-right:8px;flex-shrink:0;` |
| 7435 | dynamic-context | `width:26px;height:26px;border-radius:50%;background:var(--border2);margin-right:8px;flex-shrink:0;` |
| 7440 | dynamic | `height:100%;width:${w}%;background:${posColors[pos]};flex-shrink:0;` |
| 7443 | dynamic | `${rowBg}` |
| 7444 | dynamic | `color:var(--muted);opacity:.3;width:28px` |
| 7448 | dynamic | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;${r.isMe?'color:var(--red)':''}` |
| 7449 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:9px;color:var(--red);border:1px solid var(--red);pad...` |
| 7451 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:9px;color:${posColors[r.topScoringPos]};border:1px s...` |
| 7453 | static | `height:4px;background:var(--border);margin-top:5px;border-radius:2px;overflow:hidden;display:flex` |
| 7457 | dynamic | `color:var(--white)` |
| 7459 | dynamic | `color:${posColors.QB}` |
| 7460 | dynamic | `color:${posColors.RB}` |
| 7461 | dynamic | `color:${posColors.WR}` |
| 7462 | dynamic | `color:${posColors.TE}` |
| 7463 | dynamic | `color:var(--green)` |
| 7464 | dynamic | `color:var(--white);opacity:.5` |
| 7465 | dynamic | `color:var(--white);opacity:.5` |
| 7471 | static | `overflow-x:auto;-webkit-overflow-scrolling:touch` |
| 7472 | static | `width:100%;border-collapse:collapse;min-width:560px` |
| 7474 | static | `width:28px` |
| 7534 | dynamic | `margin-top:20px` |
| 7540 | dynamic | `border-left-color:var(--red)` |
| 7542 | dynamic | `color:var(--white);opacity:.7` |
| 7543 | dynamic | `${isMyPick?'color:var(--red)':''}` |

### Render an archetype chip (22)

| Line | Mode | Declaration |
|---|---|---|
| 3111 | dynamic | `display:inline-flex;align-items:center;justify-content:center;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;...` |
| 3114 | dynamic | `display:inline-flex;align-items:center;justify-content:center;background:${c};color:#fff;font-family:'Kanit',sans-serif;font-we...` |
| 3118 | dynamic-context | `width:32px;height:32px;flex-shrink:0;display:inline-block;` |
| 3119 | js-composed | `width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0;` |
| 3124 | dynamic-context | `width:32px;height:32px;border-radius:50%;background:var(--surface2);display:inline-flex;align-items:center;justify-content:cent...` |
| 3125 | static | `display:block` |
| 3209 | static | `display:flex;align-items:center;gap:8px;margin-bottom:6px` |
| 3211 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5` |
| 3213 | static | `display:flex;align-items:center;gap:10px;min-height:24px` |
| 3214 | static | `display:none;margin-top:8px` |
| 3216 | static | `background:none;border:none;color:var(--muted);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;...` |
| 3220 | static | `font-size:8px;transition:transform .15s` |
| 3222 | static | `display:none;margin-top:8px;padding-top:8px;border-top:1px solid var(--border)` |
| 3256 | static | `display:flex;align-items:center;gap:10px;width:100%;padding:8px 12px;background:rgba(237,129,12,0.06);border:1px dashed var(--b...` |
| 3257 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted);font-style:italic;flex:1;min-width:0` |
| 3259 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3274 | static | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;color:var(--white);text-decoration:none;flex:1;min-width:0;overf...` |
| 3278 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;flex-shrink:0` |
| 3280 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3290 | static | `display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border)` |
| 3292 | static | `font-family:'Mulish',sans-serif;font-weight:700;font-size:12px;color:var(--white);text-decoration:none;flex:1;min-width:0;overf...` |
| 3296 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;flex-shrink:0` |

### RIGHT: player exposure sidebar (21)

| Line | Mode | Declaration |
|---|---|---|
| 2469 | static | `display:flex;align-items:center;gap:8px` |
| 2470 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);width:12px;text-align:center;flex-shrink:0;transition:transfo...` |
| 2476 | static | `display:none` |
| 2495 | static | `width:24px;flex-shrink:0` |
| 2496 | static | `flex:1` |
| 2511 | static | `fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;` |
| 2511 | static | `fill:#c33;` |
| 2511 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2511 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2511 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2511 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2511 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2511 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2511 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2511 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2511 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2511 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2511 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2511 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2511 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2513 | dynamic-context | `flex-shrink:0;vertical-align:middle;margin-right:4px` |

### Helpers (19)

| Line | Mode | Declaration |
|---|---|---|
| 6305 | dynamic | `color:var(--green);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 6306 | dynamic | `color:var(--red);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 6307 | dynamic-context | `opacity:.3` |
| 6312 | dynamic | `width:36px;padding-right:8px` |
| 6317 | dynamic | `display:inline-flex;align-items:center` |
| 6321 | dynamic | `color:var(--white)` |
| 6322 | dynamic | `color:var(--white);font-size:12px` |
| 6323 | dynamic | `color:${valColor(r.value)}` |
| 6324 | dynamic | `color:var(--white);font-size:12px` |
| 6325 | dynamic | `color:${r.seasonProj ? 'var(--white)' : 'var(--muted)'};opacity:${r.seasonProj ? '1' : '.3'}` |
| 6326 | dynamic | `color:${r.proj ? (r.proj >= 20 ? 'var(--green)' : r.proj >= 12 ? 'var(--white)' : 'var(--muted)') : 'var(--muted)'};opacity:${r...` |
| 6329 | dynamic | `color:var(--white)` |
| 6342 | static | `display:flex;align-items:center;gap:10px` |
| 6343 | dynamic | `width:4px;height:20px;background:${posColors[pos]};flex-shrink:0` |
| 6345 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);opacity:.4` |
| 6347 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:${posColors[pos]}` |
| 6349 | static | `overflow-x:auto;-webkit-overflow-scrolling:touch` |
| 6350 | static | `width:100%;border-collapse:collapse;min-width:430px` |
| 6352 | static | `width:36px` |

### Renders draft picks in the same visual layout as a position section so the (15)

| Line | Mode | Declaration |
|---|---|---|
| 6389 | static | `display:flex;align-items:center;gap:10px;margin-bottom:10px` |
| 6390 | static | `width:4px;height:20px;background:var(--pos-pick-bg);flex-shrink:0` |
| 6393 | static | `font-size:13px;opacity:.4;padding:12px 0;font-family:'Mulish',sans-serif` |
| 6414 | dynamic | `border-bottom:1px solid var(--border)` |
| 6415 | dynamic | `width:36px;padding-right:8px` |
| 6419 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5` |
| 6423 | dynamic | `color:${val > 3000 ? 'var(--green)' : val > 1000 ? 'var(--white)' : 'var(--muted)'}` |
| 6424 | dynamic | `color:var(--muted);opacity:.4;font-size:11px` |
| 6432 | static | `display:flex;align-items:center;gap:10px` |
| 6433 | static | `width:4px;height:20px;background:var(--pos-pick-bg);flex-shrink:0` |
| 6435 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);opacity:.4` |
| 6437 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:var(--pos-pick-bg)` |
| 6439 | static | `overflow-x:auto` |
| 6440 | static | `width:100%;border-collapse:collapse;min-width:520px` |
| 6442 | static | `width:36px` |

### Stash render context on window so the sort buttons can re-render (15)

| Line | Mode | Declaration |
|---|---|---|
| 7336 | static | `margin-bottom:24px` |
| 7337 | static | `display:flex;align-items:center;justify-content:space-between;margin-bottom:12px` |
| 7338 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;lette...` |
| 7339 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted)` |
| 7339 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;color:${+myTeam.mpxPct>=90?'var(--green)':+myTeam.mpxPct>=75?'...` |
| 7339 | dynamic | `opacity:.5` |
| 7341 | static | `display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px` |
| 7352 | dynamic | `background:var(--surface2);border:1px solid var(--border);padding:12px 14px;border-left:3px solid ${posColors[pos]}` |
| 7353 | dynamic | `margin-bottom:6px` |
| 7354 | static | `display:flex;gap:12px;align-items:flex-end` |
| 7357 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:${color}` |
| 7360 | dynamic | `border-left:1px solid var(--border2);padding-left:12px` |
| 7362 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:${scoreColor}` |
| 7365 | dynamic | `border-left:1px solid var(--border2);padding-left:12px` |
| 7371 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.35;margin-top:4px` |

### Aggregate per-roster (14)

| Line | Mode | Declaration |
|---|---|---|
| 6762 | static | `width:30px` |
| 6782 | dynamic | `color:var(--red);font-size:10px;font-style:italic` |
| 6787 | dynamic | `color:var(--yellow)` |
| 6788 | dynamic | `width:${maxSpent ? (r.spent/maxSpent*100).toFixed(0) : 0}%` |
| 6789 | dynamic | `color:var(--green)` |
| 6790 | dynamic | `width:${budget ? (r.left/budget*100).toFixed(0) : 0}%` |
| 6792 | dynamic | `text-align:right;color:var(--muted)` |
| 6794 | dynamic | `text-align:right;color:var(--yellow)` |
| 6832 | static | `width:30px` |
| 6867 | dynamic | `font-size:12px` |
| 6867 | dynamic | `color:var(--red);font-style:italic` |
| 6915 | dynamic | `color:var(--muted);opacity:.4;font-size:10px` |
| 6918 | dynamic | `background:rgba(237,129,12,0.05)` |
| 6922 | dynamic | `opacity:.4` |

### Build one side per roster_id (14)

| Line | Mode | Declaration |
|---|---|---|
| 7102 | static | `display:flex;justify-content:space-between;align-items:center;margin-bottom:8px` |
| 7103 | dynamic | `margin-bottom:0` |
| 7109 | dynamic | `${s.isMe ? 'color:var(--red)' : ''}` |
| 7112 | static | `width:28px;height:28px;flex-shrink:0;display:inline-flex;align-items:center;` |
| 7114 | js-composed | `width:28px;height:28px;border-radius:50%;object-fit:cover;` |
| 7118 | static | `min-width:0;flex:1` |
| 7119 | static | `display:flex;align-items:center;gap:4px;flex-wrap:wrap` |
| 7123 | dynamic | `display:flex;gap:8px;margin-top:2px` |
| 7132 | static | `min-width:0;flex:1` |
| 7134 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.35;margin-left:4px` |
| 7135 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--pos-pick-bg);margin-top:2px` |
| 7139 | dynamic | `margin-top:4px` |
| 7140 | static | `width:28px;flex-shrink:0;` |
| 7141 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:12px;color:var(--green)` |

### Render the current state of the suggestion pre-screener (12)

| Line | Mode | Declaration |
|---|---|---|
| 3932 | dynamic | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:2px 6px;bor...` |
| 3935 | static | `padding:14px 20px;border-bottom:1px solid var(--border);background:var(--surface2)` |
| 3936 | static | `display:flex;align-items:center;gap:12px` |
| 3937 | js-composed | `width:48px;height:48px;border-radius:3px;object-fit:cover;background:var(--surface)` |
| 3939 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:18px;color:var(--white);text-transform:uppercase;lin...` |
| 3940 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);margin-top:2px` |
| 3941 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--white);opacity:.8;margin-top:2px` |
| 3954 | static | `padding:20px` |
| 3955 | static | `font-family:'Mulish',sans-serif;font-size:13px;color:var(--white);margin-bottom:8px` |
| 3956 | static | `font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted);margin-bottom:16px` |
| 3958 | static | `display:inline-block;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--white);backgro...` |
| 3972 | dynamic | `padding:24px;text-align:center;color:var(--muted);font-size:13px` |

### Temporarily assign global IDs so existing loadRoster can find them (12)

| Line | Mode | Declaration |
|---|---|---|
| 5673 | static | `display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--surface);border:1px solid var(--border);margin-bott...` |
| 5674 | static | `display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;flex-shrink:0;background:var(--surface2);b...` |
| 5674 | static | `display:block` |
| 5675 | static | `flex:1` |
| 5677 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);margin-top:3px` |
| 5680 | static | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px` |
| 5684 | js-composed | `display:flex;align-items:center;gap:12px;padding:11px 12px;background:var(--surface);border:1px solid var(--border);margin-bott...` |
| 5685 | js-composed | `width:30px;height:30px;border-radius:2px;flex-shrink:0` |
| 5685 | js-composed | `width:30px;height:30px;background:var(--surface2);border-radius:2px;flex-shrink:0` |
| 5687 | dynamic | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;color:var(--white);white-space:nowrap;overflow:hidden;text-overf...` |
| 5688 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.7;margin-top:1px` |
| 5690 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;lette...` |

### Ensure roster/users/players are loaded and stashed on window for the modal layer (10)

| Line | Mode | Declaration |
|---|---|---|
| 5228 | dynamic | `display:inline-flex;align-items:center;gap:6px;padding:6px 10px;background:var(--surface2);border:1px solid var(--border);borde...` |
| 5229 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:${color};text-transform:uppercase;letter-...` |
| 5230 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:14px;color:${rankColor}` |
| 5231 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.6` |
| 5241 | dynamic | `display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px` |
| 5253 | static | `display:flex;align-items:center;justify-content:space-between` |
| 5255 | static | `display:flex;align-items:center;gap:8px` |
| 5256 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em` |
| 5258 | static | `background:var(--surface2);border:1px solid var(--border2);color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;fo...` |
| 5275 | dynamic | `display:none` |

### Team logo helpers — load BEFORE player-panel.js so modal-hero badge works. (8)

| Line | Mode | Declaration |
|---|---|---|
| 2225 | static | `...` |
| 2282 | static | `...` |
| 2352 | static | `position:fixed;inset:0;background:var(--black);color:var(--white);display:flex;align-items:center;justify-content:center;font-f...` |
| 2353 | static | `background:var(--nav-bg);border-bottom:2px solid var(--red);position:sticky;top:0;z-index:100` |
| 2353 | static | `border:none;position:static` |
| 2356 | static | `fill-rule:evenodd;clip-rule:evenodd` |
| 2399 | static | `background:none;border:1px solid var(--border2);color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:it...` |
| 2428 | static | `display:none` |

### Close player-detail modal if open (5)

| Line | Mode | Declaration |
|---|---|---|
| 4532 | dynamic-context | `margin-top:14px;padding-top:14px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:8px;align-items:center` |
| 4534 | static | `display:inline-block;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:12px;color:var(--white);backgro...` |
| 4536 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-style:italic;text-align:center;line-height:1.5;max-width...` |
| 4550 | dynamic | `color:${diff>0?'var(--red)':diff<0?'var(--green)':'var(--white)'}` |
| 4610 | dynamic-context | `opacity:.5` |

### Total roster value (5)

| Line | Mode | Declaration |
|---|---|---|
| 6472 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:${_rankColor(rank)};padding:1px 6px;backg...` |
| 6476 | static | `display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px;padding:16px;background:var(--surface2);border:1px solid var(--border)` |
| 6477 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 6479 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 6482 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:var(--green)` |

### Trade Builder Modal — opens over the player detail modal (z-index 250) (5)

| Line | Mode | Declaration |
|---|---|---|
| 7718 | static | `z-index:250` |
| 7722 | static | `margin-right:8px` |
| 7729 | static | `z-index:260` |
| 7730 | static | `max-width:540px` |
| 7733 | static | `margin-right:8px` |

### PICKS BRANCH (4)

| Line | Mode | Declaration |
|---|---|---|
| 5869 | static | `background:var(--surface2);display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border)` |
| 5869 | static | `display:block` |
| 5871 | dynamic | `color:#9b91d4` |
| 5874 | dynamic | `color:${expoColor(p.exposure)}` |

### Group transactions by roster (3)

| Line | Mode | Declaration |
|---|---|---|
| 6983 | dynamic | `color:var(--red);font-size:10px;font-style:italic` |
| 6984 | dynamic | `color:var(--yellow)` |
| 6984 | dynamic | `color:var(--green)` |

### Sort state for the leagues list (2)

| Line | Mode | Declaration |
|---|---|---|
| 5022 | dynamic | `width:${w}%;background:${s.color}` |
| 5029 | dynamic-context | `opacity:.3` |

### Color helpers (2)

| Line | Mode | Declaration |
|---|---|---|
| 5970 | dynamic | `color:${posColor(p.position)}` |
| 5973 | dynamic | `color:${expoColor(p.exposure)}` |

### Store per-league so multiple leagues can expand without collision (2)

| Line | Mode | Declaration |
|---|---|---|
| 6630 | static | `margin-bottom:12px` |
| 6631 | static | `display:none` |

### Update section meta with archetype legend + league averages (2)

| Line | Mode | Declaration |
|---|---|---|
| 7384 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 7384 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |

### Columns: expandable league list (left) + player exposure (right) (1)

| Line | Mode | Declaration |
|---|---|---|
| 2450 | static | `display:none` |

### Archetype lookup for the owning team (1)

| Line | Mode | Declaration |
|---|---|---|
| 3565 | dynamic | `--archetype-bg:${mlArchetypeBg(r.ownerArchetype)};--archetype-fg:${mlArchetypeFg(r.ownerArchetype)}` |

### Close modals on Escape (1)

| Line | Mode | Declaration |
|---|---|---|
| 4658 | dynamic | `color:${color};border-color:${color};background:${bg}` |
