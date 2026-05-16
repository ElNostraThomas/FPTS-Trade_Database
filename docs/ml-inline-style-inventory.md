# my-leagues.html inline-style inventory

Generated from `my-leagues.html` (7620 lines).
Total `style="..."` occurrences: **304**.

This is a read-only audit. No code was changed. The goal is to make the
refactor safe to execute supervised by giving every occurrence a category,
a section assignment, and an actionability verdict.

---

## Mode breakdown

| Mode | Count | % | Refactorable to CSS class? |
|---|---|---|---|
| `dynamic` | 144 | 47.4% | Conditional - if the interpolated value is a discrete enum, use a modifier class (e.g. `.is-active`); otherwise leave inline |
| `static` | 137 | 45.1% | Yes - pure HTML attribute, drop into a class |
| `dynamic-context` | 15 | 4.9% | Conditional - inside a JS-built HTML string; refactor only if the declaration set is static |
| `js-composed` | 8 | 2.6% | No - imperatively set at runtime; leave as-is |

**Headline:** ~137 are directly refactorable, ~159 require case-by-case judgement, ~8 must stay inline (JS-set).

---

## Top 25 declaration properties

Which CSS properties carry most of the inline styling. Where one property dominates, a single utility class can collapse many sites.

| Property | Count |
|---|---|
| `color` | 145 |
| `font-size` | 108 |
| `font-family` | 105 |
| `display` | 67 |
| `font-weight` | 67 |
| `font-style` | 53 |
| `background` | 48 |
| `padding` | 47 |
| `align-items` | 45 |
| `width` | 39 |
| `flex-shrink` | 38 |
| `gap` | 35 |
| `text-transform` | 34 |
| `letter-spacing` | 34 |
| `margin-bottom` | 33 |
| `border-radius` | 32 |
| `opacity` | 32 |
| `border` | 25 |
| `height` | 20 |
| `margin-top` | 17 |
| `justify-content` | 15 |
| `fill-rule` | 15 |
| `fill` | 14 |
| `cursor` | 12 |
| `flex` | 12 |

---

## Most-repeated declaration sets (>= 2 occurrences)

Each row below is a strong refactor candidate: same declaration set appearing N times -> create one class once, replace N sites.

| Count | Normalized declaration set |
|---|---|
| 13 | `fill-rule:nonzero; fill:var(--black)` |
| 4 | `display:none` |
| 3 | `display:block` |
| 3 | `margin-bottom:10px` |
| 3 | `color:var(--white)` |
| 3 | `margin-bottom:28px` |
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
| 2 | `color:var(--white); font-family:'Kanit',sans-serif; font-size:22px; font-style:italic; font-weight:800` |
| 2 | `width:30px` |
| 2 | `color:var(--red); font-size:10px; font-style:italic` |
| 2 | `color:var(--yellow)` |
| 2 | `flex:1; min-width:0` |
| 2 | `color:var(--muted); font-family:'Mulish',sans-serif; font-size:9px; letter-spacing:.06em; opacity:.4; text-transform:uppercase` |
| 2 | `color:var(--white); font-family:'Kanit',sans-serif; font-style:italic; font-weight:800` |
| 2 | `color:${posColors.QB}` |

---

## Occurrences per region

Sorted by count - the busiest regions are the highest-leverage refactor batches.

| Count | Region (nearest banner-comment heading above the hit) |
|---|---|
| 30 | Save current scoped IDs so the existing loadRoster / loadAllTrades can target them |
| 28 | Render the current suggestion as a single card |
| 28 | Sort rosters by chosen key |
| 22 | Render an archetype chip |
| 21 | RIGHT: player exposure sidebar |
| 20 | Archetype lookup for the owning team |
| 20 | Helpers |
| 17 | Renders draft picks in the same visual layout as a position section so the |
| 16 | Stash render context on window so the sort buttons can re-render |
| 14 | Aggregate per-roster |
| 14 | Picks this roster RECEIVED |
| 12 | Render the current state of the suggestion pre-screener |
| 12 | Temporarily assign global IDs so existing loadRoster can find them |
| 10 | Ensure roster/users/players are loaded and stashed on window for the modal layer |
| 8 | Team logo helpers — load BEFORE player-panel.js so modal-hero badge works. |
| 7 | Total roster value |
| 5 | Close player-detail modal if open |
| 5 | Trade Builder Modal — opens over the player detail modal (z-index 250) |
| 4 | PICKS BRANCH |
| 3 | Group transactions by roster |
| 2 | Sort state for the leagues list |
| 2 | Color helpers |
| 2 | Update section meta with archetype legend + league averages |
| 1 | Columns: expandable league list (left) + player exposure (right) |
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

### Save current scoped IDs so the existing loadRoster / loadAllTrades can target them (30)

| Line | Mode | Declaration |
|---|---|---|
| 5297 | dynamic | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:2px 6px;bor...` |
| 5306 | dynamic-context | `display:inline-flex;align-items:center;gap:3px;padding:2px 6px;background:var(--surface2);border:1px solid var(--border);border...` |
| 5307 | dynamic | `color:${color};letter-spacing:.04em` |
| 5308 | dynamic | `color:${rankColor}` |
| 5313 | dynamic-context | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:9px;color:var(--white);background:var(--red);padding...` |
| 5319 | dynamic | `border:1px solid var(--border);background:var(--surface);margin-bottom:6px` |
| 5321 | static | `display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;user-select:none` |
| 5323 | static | `font-family:'Mulish',sans-serif;font-size:9px;color:var(--muted);width:14px;text-align:center;flex-shrink:0;transition:transfor...` |
| 5325 | dynamic | `width:28px;height:28px;border-radius:3px;object-fit:cover;background:var(--surface2);flex-shrink:0` |
| 5326 | dynamic | `width:28px;height:28px;border-radius:3px;background:var(--surface2);display:flex;align-items:center;justify-content:center;font...` |
| 5330 | dynamic | `font-family:'Mulish',sans-serif;font-weight:800;font-size:13px;color:var(--white);white-space:nowrap;overflow:hidden;text-overf...` |
| 5334 | static | `display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin-top:5px` |
| 5338 | static | `text-align:right;flex-shrink:0` |
| 5339 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:14px;color:var(--white)` |
| 5340 | static | `font-family:'Mulish',sans-serif;font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em` |
| 5343 | dynamic | `display:none;border-top:1px solid var(--border);background:var(--surface2);padding:10px 14px` |
| 5466 | static | `margin-bottom:10px` |
| 5467 | static | `display:flex;align-items:center;justify-content:space-between;padding:6px 4px;border-bottom:1px solid var(--border2);margin-bot...` |
| 5468 | dynamic | `color:var(--muted);font-weight:700;margin-left:4px` |
| 5469 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-weight:700` |
| 5479 | static | `margin-bottom:10px` |
| 5480 | static | `display:flex;align-items:center;padding:6px 4px;border-bottom:1px solid var(--border2);margin-bottom:2px` |
| 5481 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--muted);text-transform:uppercase;let...` |
| 5481 | dynamic | `margin-left:4px` |
| 5492 | static | `margin-bottom:10px` |
| 5493 | static | `display:flex;align-items:center;justify-content:space-between;padding:6px 4px;border-bottom:1px solid var(--border2);margin-bot...` |
| 5494 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--pos-pick-bg,#9b91d4);text-transform...` |
| 5494 | dynamic | `color:var(--muted);font-weight:700;margin-left:4px` |
| 5495 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-weight:700` |
| 5505 | dynamic | `font-family:'Mulish',sans-serif` |

### Render the current suggestion as a single card (28)

| Line | Mode | Declaration |
|---|---|---|
| 4049 | static | `display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)` |
| 4050 | dynamic | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:800;text-transform:uppercase;padding:2px 5px;border-radius:2px;${posS...` |
| 4051 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;font-weight:700;color:var(--white);flex:1;min-width:0;overflow:hidden;text-overf...` |
| 4052 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);flex-shrink:0` |
| 4059 | static | `display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)` |
| 4060 | dynamic | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:800;text-transform:uppercase;padding:2px 5px;border-radius:2px;backgr...` |
| 4061 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;font-weight:700;color:var(--white);flex:1;min-width:0;overflow:hidden;text-overf...` |
| 4062 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);flex-shrink:0` |
| 4073 | static | `padding:14px 18px` |
| 4076 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted)` |
| 4079 | static | `border:1px solid var(--border2);background:var(--surface2);padding:12px 14px;margin-bottom:14px` |
| 4080 | static | `margin-bottom:8px` |
| 4081 | static | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;color:var(--muted);letter-spacing:.06em;...` |
| 4083 | static | `display:flex;justify-content:space-between;padding-top:6px;font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted)` |
| 4084 | dynamic | `color:var(--white);font-weight:700` |
| 4087 | static | `border-top:1px solid var(--border);padding-top:8px;margin-top:6px` |
| 4088 | static | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;color:var(--muted);letter-spacing:.06em;...` |
| 4090 | static | `display:flex;justify-content:space-between;padding-top:6px;font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted)` |
| 4091 | dynamic | `color:var(--white);font-weight:700` |
| 4094 | dynamic | `margin-top:10px;padding-top:8px;border-top:1px solid var(--border);font-family:'Mulish',sans-serif;font-size:11px;color:${balan...` |
| 4097 | static | `display:flex;gap:10px;margin-bottom:10px` |
| 4099 | static | `flex:1;background:transparent;border:2px solid var(--red);color:var(--red);font-family:'Kanit',sans-serif;font-weight:800;font-...` |
| 4103 | static | `flex:1;background:var(--green);border:2px solid var(--green);color:var(--black);font-family:'Kanit',sans-serif;font-weight:800;...` |
| 4107 | static | `text-align:center;font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-style:italic` |
| 4117 | static | `padding:24px 20px;text-align:center` |
| 4118 | dynamic | `font-family:'Mulish',sans-serif;font-size:13px;color:var(--white);margin-bottom:6px;line-height:1.5` |
| 4119 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);margin-bottom:18px;line-height:1.5` |
| 4121 | static | `background:var(--red);border:none;color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size...` |

### Sort rosters by chosen key (28)

| Line | Mode | Declaration |
|---|---|---|
| 7317 | js-composed | `width:26px;height:26px;border-radius:50%;object-fit:cover;margin-right:8px;flex-shrink:0;` |
| 7318 | dynamic-context | `width:26px;height:26px;border-radius:50%;background:var(--border2);margin-right:8px;flex-shrink:0;` |
| 7323 | dynamic | `height:100%;width:${w}%;background:${posColors[pos]};flex-shrink:0;` |
| 7326 | dynamic | `${rowBg}` |
| 7327 | dynamic | `color:var(--muted);opacity:.3;width:28px` |
| 7331 | dynamic | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;${r.isMe?'color:var(--red)':''}` |
| 7332 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:9px;color:var(--red);border:1px solid var(--red);pad...` |
| 7334 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:9px;color:${posColors[r.topScoringPos]};border:1px s...` |
| 7336 | static | `height:4px;background:var(--border);margin-top:5px;border-radius:2px;overflow:hidden;display:flex` |
| 7340 | dynamic | `color:var(--white)` |
| 7342 | dynamic | `color:${posColors.QB}` |
| 7343 | dynamic | `color:${posColors.RB}` |
| 7344 | dynamic | `color:${posColors.WR}` |
| 7345 | dynamic | `color:${posColors.TE}` |
| 7346 | dynamic | `color:var(--green)` |
| 7347 | dynamic | `color:var(--white);opacity:.5` |
| 7348 | dynamic | `color:${r.mpxPct >= 90 ? 'var(--green)' : r.mpxPct >= 75 ? 'var(--white)' : r.mpxPct ? 'var(--red)' : 'var(--muted)'}` |
| 7354 | static | `overflow-x:auto;-webkit-overflow-scrolling:touch` |
| 7355 | static | `width:100%;border-collapse:collapse;min-width:560px` |
| 7357 | static | `width:28px` |
| 7361 | dynamic | `color:${posColors.QB}` |
| 7362 | dynamic | `color:${posColors.RB}` |
| 7363 | dynamic | `color:${posColors.WR}` |
| 7364 | dynamic | `color:${posColors.TE}` |
| 7417 | dynamic | `margin-top:20px` |
| 7423 | dynamic | `border-left-color:var(--red)` |
| 7425 | dynamic | `color:var(--white);opacity:.7` |
| 7426 | dynamic | `${isMyPick?'color:var(--red)':''}` |

### Render an archetype chip (22)

| Line | Mode | Declaration |
|---|---|---|
| 2982 | dynamic | `display:inline-flex;align-items:center;justify-content:center;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;...` |
| 2985 | dynamic | `display:inline-flex;align-items:center;justify-content:center;background:${c};color:var(--black);font-family:'Kanit',sans-serif...` |
| 2989 | dynamic-context | `width:32px;height:32px;flex-shrink:0;display:inline-block;` |
| 2990 | js-composed | `width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0;` |
| 2995 | dynamic-context | `width:32px;height:32px;border-radius:50%;background:var(--surface2);display:inline-flex;align-items:center;justify-content:cent...` |
| 2996 | static | `display:block` |
| 3080 | static | `display:flex;align-items:center;gap:8px;margin-bottom:6px` |
| 3082 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5` |
| 3084 | static | `display:flex;align-items:center;gap:10px;min-height:24px` |
| 3085 | static | `display:none;margin-top:8px` |
| 3087 | static | `background:none;border:none;color:var(--muted);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;...` |
| 3091 | static | `font-size:8px;transition:transform .15s` |
| 3093 | static | `display:none;margin-top:8px;padding-top:8px;border-top:1px solid var(--border)` |
| 3127 | static | `display:flex;align-items:center;gap:10px;width:100%;padding:8px 12px;background:rgba(237,129,12,0.06);border:1px dashed var(--b...` |
| 3128 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted);font-style:italic;flex:1;min-width:0` |
| 3130 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3145 | static | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;color:var(--white);text-decoration:none;flex:1;min-width:0;overf...` |
| 3149 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;flex-shrink:0` |
| 3151 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3161 | static | `display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border)` |
| 3163 | static | `font-family:'Mulish',sans-serif;font-weight:700;font-size:12px;color:var(--white);text-decoration:none;flex:1;min-width:0;overf...` |
| 3167 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;flex-shrink:0` |

### RIGHT: player exposure sidebar (21)

| Line | Mode | Declaration |
|---|---|---|
| 2313 | static | `display:flex;align-items:center;gap:8px` |
| 2314 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);width:12px;text-align:center;flex-shrink:0;transition:transfo...` |
| 2320 | static | `display:none` |
| 2338 | static | `width:24px;flex-shrink:0` |
| 2339 | static | `flex:1` |
| 2354 | static | `fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;` |
| 2354 | static | `fill:#c33;` |
| 2354 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2354 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2354 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2354 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2354 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2354 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2354 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2354 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2354 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2354 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2354 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2354 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2354 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2356 | dynamic-context | `flex-shrink:0;vertical-align:middle;margin-right:4px` |

### Archetype lookup for the owning team (20)

| Line | Mode | Declaration |
|---|---|---|
| 3420 | js-composed | `width:24px;height:24px;border-radius:3px;flex-shrink:0;background:var(--surface2)` |
| 3421 | dynamic-context | `width:24px;height:24px;border-radius:3px;flex-shrink:0;background:var(--surface2);display:inline-block` |
| 3435 | dynamic-context | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--green);text-transform:uppercase;let...` |
| 3441 | dynamic | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:1px 5px;bor...` |
| 3443 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--white);opacity:.85` |
| 3447 | static | `background:var(--red);border:none;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--w...` |
| 3456 | dynamic-context | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:#5b9bd5;text-transform:uppercase;letter-s...` |
| 3458 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3465 | dynamic | `display:flex;align-items:center;gap:10px;padding:8px 10px;border-bottom:1px solid var(--border);cursor:${rowCursor};border-radi...` |
| 3468 | dynamic | `font-family:'Mulish',sans-serif;font-weight:800;font-size:12px;color:var(--white);white-space:nowrap;overflow:hidden;text-overf...` |
| 3469 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.6;white-space:nowrap;overflow:hidden;text-overflow:e...` |
| 3471 | static | `display:flex;align-items:center;gap:8px;flex-shrink:0` |
| 3480 | dynamic | `margin-top:8px;font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;font-style:italic` |
| 3489 | static | `padding:0 18px;border-top:1px solid var(--border);background:var(--surface)` |
| 3491 | static | `display:flex;align-items:center;justify-content:space-between;padding:14px 0;cursor:pointer;user-select:none;gap:10px` |
| 3493 | static | `display:flex;align-items:center;gap:10px;flex:1;min-width:0` |
| 3494 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);width:14px;text-align:center;flex-shrink:0;transition:transfo...` |
| 3496 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.7` |
| 3498 | static | `display:flex;align-items:center;gap:6px;cursor:pointer;font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);user-s...` |
| 3504 | dynamic | `${contentDisplay};padding-bottom:14px` |

### Helpers (20)

| Line | Mode | Declaration |
|---|---|---|
| 6270 | dynamic | `color:var(--green);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 6271 | dynamic | `color:var(--red);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 6272 | dynamic-context | `opacity:.3` |
| 6277 | dynamic | `width:36px;padding-right:8px` |
| 6282 | dynamic | `display:inline-flex;align-items:center` |
| 6286 | dynamic | `color:var(--white)` |
| 6287 | dynamic | `color:var(--white);font-size:12px` |
| 6288 | dynamic | `color:${valColor(r.value)}` |
| 6289 | dynamic | `color:var(--white);font-size:12px` |
| 6290 | dynamic | `color:${r.seasonProj ? 'var(--white)' : 'var(--muted)'};opacity:${r.seasonProj ? '1' : '.3'}` |
| 6291 | dynamic | `color:${r.proj ? (r.proj >= 20 ? 'var(--green)' : r.proj >= 12 ? 'var(--white)' : 'var(--muted)') : 'var(--muted)'};opacity:${r...` |
| 6294 | dynamic | `color:var(--white)` |
| 6305 | static | `margin-bottom:28px` |
| 6307 | static | `display:flex;align-items:center;gap:10px` |
| 6308 | dynamic | `width:4px;height:20px;background:${posColors[pos]};flex-shrink:0` |
| 6310 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);opacity:.4` |
| 6312 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:${posColors[pos]}` |
| 6314 | static | `overflow-x:auto;-webkit-overflow-scrolling:touch` |
| 6315 | static | `width:100%;border-collapse:collapse;min-width:430px` |
| 6317 | static | `width:36px` |

### Renders draft picks in the same visual layout as a position section so the (17)

| Line | Mode | Declaration |
|---|---|---|
| 6353 | static | `margin-bottom:28px` |
| 6354 | static | `display:flex;align-items:center;gap:10px;margin-bottom:10px` |
| 6355 | static | `width:4px;height:20px;background:var(--pos-pick-bg);flex-shrink:0` |
| 6358 | static | `font-size:13px;opacity:.4;padding:12px 0;font-family:'Mulish',sans-serif` |
| 6379 | dynamic-context | `border-bottom:1px solid var(--border)` |
| 6380 | dynamic | `width:36px;padding-right:8px` |
| 6384 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5` |
| 6388 | dynamic | `color:${val > 3000 ? 'var(--green)' : val > 1000 ? 'var(--white)' : 'var(--muted)'}` |
| 6389 | dynamic | `color:var(--muted);opacity:.4;font-size:11px` |
| 6395 | static | `margin-bottom:28px` |
| 6397 | static | `display:flex;align-items:center;gap:10px` |
| 6398 | static | `width:4px;height:20px;background:var(--pos-pick-bg);flex-shrink:0` |
| 6400 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);opacity:.4` |
| 6402 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:var(--pos-pick-bg)` |
| 6404 | static | `overflow-x:auto` |
| 6405 | static | `width:100%;border-collapse:collapse;min-width:520px` |
| 6407 | static | `width:36px` |

### Stash render context on window so the sort buttons can re-render (16)

| Line | Mode | Declaration |
|---|---|---|
| 7224 | static | `margin-bottom:24px` |
| 7225 | static | `display:flex;align-items:center;justify-content:space-between;margin-bottom:12px` |
| 7226 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;lette...` |
| 7227 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted)` |
| 7227 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;color:${+myTeam.mpxPct>=90?'var(--green)':+myTeam.mpxPct>=75?'...` |
| 7227 | dynamic | `opacity:.5` |
| 7229 | static | `display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px` |
| 7240 | dynamic | `background:var(--surface2);border:1px solid var(--border);padding:12px 14px;border-left:3px solid ${posColors[pos]}` |
| 7241 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:${posColors[pos]};text-transform:uppercas...` |
| 7242 | static | `display:flex;gap:12px;align-items:flex-end` |
| 7244 | static | `font-family:'Mulish',sans-serif;font-size:9px;color:var(--muted);opacity:.4;text-transform:uppercase;letter-spacing:.06em` |
| 7245 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:${color}` |
| 7248 | dynamic | `border-left:1px solid var(--border2);padding-left:12px` |
| 7249 | static | `font-family:'Mulish',sans-serif;font-size:9px;color:var(--muted);opacity:.4;text-transform:uppercase;letter-spacing:.06em` |
| 7250 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:${scoreColor}` |
| 7254 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.35;margin-top:4px` |

### Aggregate per-roster (14)

| Line | Mode | Declaration |
|---|---|---|
| 6704 | static | `width:30px` |
| 6724 | dynamic | `color:var(--red);font-size:10px;font-style:italic` |
| 6729 | dynamic | `color:var(--yellow)` |
| 6730 | dynamic | `width:${maxSpent ? (r.spent/maxSpent*100).toFixed(0) : 0}%` |
| 6731 | dynamic | `color:var(--green)` |
| 6732 | dynamic | `width:${budget ? (r.left/budget*100).toFixed(0) : 0}%` |
| 6734 | dynamic | `text-align:right;color:var(--muted)` |
| 6736 | dynamic | `text-align:right;color:var(--yellow)` |
| 6774 | static | `width:30px` |
| 6809 | dynamic | `font-size:12px` |
| 6809 | dynamic | `color:var(--red);font-style:italic` |
| 6857 | dynamic | `color:var(--muted);opacity:.4;font-size:10px` |
| 6860 | dynamic | `background:rgba(237,129,12,0.05)` |
| 6864 | dynamic | `opacity:.4` |

### Picks this roster RECEIVED (14)

| Line | Mode | Declaration |
|---|---|---|
| 7044 | static | `display:flex;justify-content:space-between;align-items:center;margin-bottom:8px` |
| 7045 | dynamic | `margin-bottom:0` |
| 7051 | dynamic | `${s.isMe ? 'color:var(--red)' : ''}` |
| 7054 | static | `width:28px;height:28px;flex-shrink:0;display:inline-flex;align-items:center;` |
| 7056 | js-composed | `width:28px;height:28px;border-radius:50%;object-fit:cover;` |
| 7060 | static | `min-width:0;flex:1` |
| 7061 | static | `display:flex;align-items:center;gap:4px;flex-wrap:wrap` |
| 7065 | dynamic | `display:flex;gap:8px;margin-top:2px` |
| 7074 | static | `min-width:0;flex:1` |
| 7076 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.35;margin-left:4px` |
| 7077 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--pos-pick-bg);margin-top:2px` |
| 7081 | dynamic | `margin-top:4px` |
| 7082 | static | `width:28px;flex-shrink:0;` |
| 7083 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:12px;color:var(--green)` |

### Render the current state of the suggestion pre-screener (12)

| Line | Mode | Declaration |
|---|---|---|
| 3971 | dynamic | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:2px 6px;bor...` |
| 3974 | static | `padding:14px 20px;border-bottom:1px solid var(--border);background:var(--surface2)` |
| 3975 | static | `display:flex;align-items:center;gap:12px` |
| 3976 | js-composed | `width:48px;height:48px;border-radius:3px;object-fit:cover;background:var(--surface)` |
| 3978 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:18px;color:var(--white);text-transform:uppercase;lin...` |
| 3979 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);margin-top:2px` |
| 3980 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--white);opacity:.8;margin-top:2px` |
| 3993 | static | `padding:20px` |
| 3994 | static | `font-family:'Mulish',sans-serif;font-size:13px;color:var(--white);margin-bottom:8px` |
| 3995 | static | `font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted);margin-bottom:16px` |
| 3997 | static | `display:inline-block;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--white);backgro...` |
| 4003 | dynamic-context | `padding:24px;text-align:center;color:var(--muted);font-size:13px` |

### Temporarily assign global IDs so existing loadRoster can find them (12)

| Line | Mode | Declaration |
|---|---|---|
| 5616 | static | `display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--surface);border:1px solid var(--border);margin-bott...` |
| 5617 | static | `display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;flex-shrink:0;background:var(--surface2);b...` |
| 5617 | static | `display:block` |
| 5618 | static | `flex:1` |
| 5620 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);margin-top:3px` |
| 5623 | static | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px` |
| 5627 | js-composed | `display:flex;align-items:center;gap:12px;padding:11px 12px;background:var(--surface);border:1px solid var(--border);margin-bott...` |
| 5628 | js-composed | `width:30px;height:30px;border-radius:2px;flex-shrink:0` |
| 5628 | js-composed | `width:30px;height:30px;background:var(--surface2);border-radius:2px;flex-shrink:0` |
| 5630 | dynamic | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;color:var(--white);white-space:nowrap;overflow:hidden;text-overf...` |
| 5631 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.7;margin-top:1px` |
| 5633 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;lette...` |

### Ensure roster/users/players are loaded and stashed on window for the modal layer (10)

| Line | Mode | Declaration |
|---|---|---|
| 5172 | dynamic | `display:inline-flex;align-items:center;gap:6px;padding:6px 10px;background:var(--surface2);border:1px solid var(--border);borde...` |
| 5173 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:${color};text-transform:uppercase;letter-...` |
| 5174 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:14px;color:${rankColor}` |
| 5175 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.6` |
| 5185 | dynamic | `display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px` |
| 5197 | static | `display:flex;align-items:center;justify-content:space-between` |
| 5199 | static | `display:flex;align-items:center;gap:8px` |
| 5200 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em` |
| 5202 | static | `background:var(--surface2);border:1px solid var(--border2);color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;fo...` |
| 5218 | dynamic | `display:none` |

### Team logo helpers — load BEFORE player-panel.js so modal-hero badge works. (8)

| Line | Mode | Declaration |
|---|---|---|
| 2101 | static | `...` |
| 2144 | static | `...` |
| 2203 | static | `position:fixed;inset:0;background:var(--black);color:var(--white);display:flex;align-items:center;justify-content:center;font-f...` |
| 2204 | static | `background:var(--nav-bg);border-bottom:2px solid var(--red);position:sticky;top:0;z-index:100` |
| 2204 | static | `border:none;position:static` |
| 2207 | static | `fill-rule:evenodd;clip-rule:evenodd` |
| 2246 | static | `background:none;border:1px solid var(--border2);color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:it...` |
| 2272 | static | `display:none` |

### Total roster value (7)

| Line | Mode | Declaration |
|---|---|---|
| 6437 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:${_rankColor(rank)};padding:1px 6px;backg...` |
| 6441 | static | `display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px;padding:16px;background:var(--surface2);border:1px solid var(--border)` |
| 6442 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 6443 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:var(--white)` |
| 6444 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 6445 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:var(--white)` |
| 6447 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:var(--green)` |

### Close player-detail modal if open (5)

| Line | Mode | Declaration |
|---|---|---|
| 4565 | dynamic-context | `margin-top:14px;padding-top:14px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:8px;align-items:center` |
| 4567 | static | `display:inline-block;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:12px;color:var(--white);backgro...` |
| 4569 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-style:italic;text-align:center;line-height:1.5;max-width...` |
| 4583 | dynamic | `color:${diff>0?'var(--red)':diff<0?'var(--green)':'var(--white)'}` |
| 4643 | dynamic-context | `opacity:.5` |

### Trade Builder Modal — opens over the player detail modal (z-index 250) (5)

| Line | Mode | Declaration |
|---|---|---|
| 7597 | static | `z-index:250` |
| 7601 | static | `margin-right:8px` |
| 7608 | static | `z-index:260` |
| 7609 | static | `max-width:540px` |
| 7612 | static | `margin-right:8px` |

### PICKS BRANCH (4)

| Line | Mode | Declaration |
|---|---|---|
| 5809 | static | `background:var(--surface2);display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border)` |
| 5809 | static | `display:block` |
| 5811 | dynamic | `color:#9b91d4` |
| 5814 | dynamic | `color:${expoColor(p.exposure)}` |

### Group transactions by roster (3)

| Line | Mode | Declaration |
|---|---|---|
| 6925 | dynamic | `color:var(--red);font-size:10px;font-style:italic` |
| 6926 | dynamic | `color:var(--yellow)` |
| 6926 | dynamic | `color:var(--green)` |

### Sort state for the leagues list (2)

| Line | Mode | Declaration |
|---|---|---|
| 4984 | dynamic | `width:${w}%;background:${s.color}` |
| 4991 | dynamic-context | `opacity:.3` |

### Color helpers (2)

| Line | Mode | Declaration |
|---|---|---|
| 5899 | dynamic | `color:${posColor(p.position)}` |
| 5902 | dynamic | `color:${expoColor(p.exposure)}` |

### Update section meta with archetype legend + league averages (2)

| Line | Mode | Declaration |
|---|---|---|
| 7267 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 7267 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |

### Columns: expandable league list (left) + player exposure (right) (1)

| Line | Mode | Declaration |
|---|---|---|
| 2294 | static | `display:none` |

### Close modals on Escape (1)

| Line | Mode | Declaration |
|---|---|---|
| 4691 | dynamic | `color:${color};border-color:${color};background:${bg}` |
