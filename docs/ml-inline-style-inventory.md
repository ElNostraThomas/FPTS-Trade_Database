# my-leagues.html inline-style inventory

Generated from `my-leagues.html` (7607 lines).
Total `style="..."` occurrences: **293**.

This is a read-only audit. No code was changed. The goal is to make the
refactor safe to execute supervised by giving every occurrence a category,
a section assignment, and an actionability verdict.

---

## Mode breakdown

| Mode | Count | % | Refactorable to CSS class? |
|---|---|---|---|
| `dynamic` | 141 | 48.1% | Conditional - if the interpolated value is a discrete enum, use a modifier class (e.g. `.is-active`); otherwise leave inline |
| `static` | 131 | 44.7% | Yes - pure HTML attribute, drop into a class |
| `dynamic-context` | 13 | 4.4% | Conditional - inside a JS-built HTML string; refactor only if the declaration set is static |
| `js-composed` | 8 | 2.7% | No - imperatively set at runtime; leave as-is |

**Headline:** ~131 are directly refactorable, ~154 require case-by-case judgement, ~8 must stay inline (JS-set).

---

## Top 25 declaration properties

Which CSS properties carry most of the inline styling. Where one property dominates, a single utility class can collapse many sites.

| Property | Count |
|---|---|
| `color` | 136 |
| `font-size` | 103 |
| `font-family` | 100 |
| `display` | 68 |
| `font-weight` | 64 |
| `font-style` | 50 |
| `background` | 48 |
| `padding` | 47 |
| `align-items` | 45 |
| `width` | 39 |
| `flex-shrink` | 38 |
| `gap` | 35 |
| `letter-spacing` | 32 |
| `border-radius` | 32 |
| `text-transform` | 31 |
| `opacity` | 31 |
| `margin-bottom` | 28 |
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
| 20 | Archetype lookup for the owning team |
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
| 3898 | static | `display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)` |
| 3899 | dynamic | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:800;text-transform:uppercase;padding:2px 5px;border-radius:2px;${posS...` |
| 3900 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;font-weight:700;color:var(--white);flex:1;min-width:0;overflow:hidden;text-overf...` |
| 3901 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);flex-shrink:0` |
| 3908 | static | `display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)` |
| 3909 | dynamic | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:800;text-transform:uppercase;padding:2px 5px;border-radius:2px;backgr...` |
| 3910 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;font-weight:700;color:var(--white);flex:1;min-width:0;overflow:hidden;text-overf...` |
| 3911 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);flex-shrink:0` |
| 3922 | static | `padding:14px 18px` |
| 3925 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted)` |
| 3928 | static | `border:1px solid var(--border2);background:var(--surface2);padding:12px 14px;margin-bottom:14px` |
| 3929 | static | `margin-bottom:8px` |
| 3930 | static | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;color:var(--muted);letter-spacing:.06em;...` |
| 3932 | static | `display:flex;justify-content:space-between;padding-top:6px;font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted)` |
| 3933 | dynamic | `color:var(--white);font-weight:700` |
| 3936 | static | `border-top:1px solid var(--border);padding-top:8px;margin-top:6px` |
| 3937 | static | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;color:var(--muted);letter-spacing:.06em;...` |
| 3939 | static | `display:flex;justify-content:space-between;padding-top:6px;font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted)` |
| 3940 | dynamic | `color:var(--white);font-weight:700` |
| 3943 | dynamic | `margin-top:10px;padding-top:8px;border-top:1px solid var(--border);font-family:'Mulish',sans-serif;font-size:11px;color:${balan...` |
| 3946 | static | `display:flex;gap:10px;margin-bottom:10px` |
| 3948 | static | `flex:1;background:transparent;border:2px solid var(--red);color:var(--red);font-family:'Kanit',sans-serif;font-weight:800;font-...` |
| 3952 | static | `flex:1;background:var(--green);border:2px solid var(--green);color:var(--black);font-family:'Kanit',sans-serif;font-weight:800;...` |
| 3956 | static | `text-align:center;font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-style:italic` |
| 3966 | static | `padding:24px 20px;text-align:center` |
| 3967 | dynamic | `font-family:'Mulish',sans-serif;font-size:13px;color:var(--white);margin-bottom:6px;line-height:1.5` |
| 3968 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);margin-bottom:18px;line-height:1.5` |
| 3970 | static | `background:var(--red);border:none;color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size...` |

### Save current scoped IDs so the existing loadRoster / loadAllTrades can target them (27)

| Line | Mode | Declaration |
|---|---|---|
| 5234 | dynamic | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:2px 6px;bor...` |
| 5243 | dynamic-context | `display:inline-flex;align-items:center;gap:3px;padding:2px 6px;background:var(--surface2);border:1px solid var(--border);border...` |
| 5244 | dynamic | `color:${color};letter-spacing:.04em` |
| 5245 | dynamic | `color:${rankColor}` |
| 5250 | dynamic-context | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:9px;color:var(--white);background:var(--red);padding...` |
| 5256 | dynamic | `border:1px solid var(--border);background:var(--surface);margin-bottom:6px` |
| 5258 | static | `display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;user-select:none` |
| 5260 | static | `font-family:'Mulish',sans-serif;font-size:9px;color:var(--muted);width:14px;text-align:center;flex-shrink:0;transition:transfor...` |
| 5262 | dynamic | `width:28px;height:28px;border-radius:3px;object-fit:cover;background:var(--surface2);flex-shrink:0` |
| 5263 | dynamic | `width:28px;height:28px;border-radius:3px;background:var(--surface2);display:flex;align-items:center;justify-content:center;font...` |
| 5267 | dynamic | `font-family:'Mulish',sans-serif;font-weight:800;font-size:13px;color:var(--white);white-space:nowrap;overflow:hidden;text-overf...` |
| 5271 | static | `display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin-top:5px` |
| 5275 | static | `text-align:right;flex-shrink:0` |
| 5276 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:14px;color:var(--white)` |
| 5277 | static | `font-family:'Mulish',sans-serif;font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em` |
| 5280 | dynamic | `display:none;border-top:1px solid var(--border);background:var(--surface2);padding:10px 14px` |
| 5404 | static | `display:flex;align-items:center;justify-content:space-between;padding:6px 4px;border-bottom:1px solid var(--border2);margin-bot...` |
| 5405 | dynamic | `color:var(--muted);font-weight:700;margin-left:4px` |
| 5406 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-weight:700` |
| 5417 | static | `display:flex;align-items:center;padding:6px 4px;border-bottom:1px solid var(--border2);margin-bottom:2px` |
| 5418 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--muted);text-transform:uppercase;let...` |
| 5418 | dynamic | `margin-left:4px` |
| 5430 | static | `display:flex;align-items:center;justify-content:space-between;padding:6px 4px;border-bottom:1px solid var(--border2);margin-bot...` |
| 5431 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--pos-pick-bg,#9b91d4);text-transform...` |
| 5431 | dynamic | `color:var(--muted);font-weight:700;margin-left:4px` |
| 5432 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-weight:700` |
| 5442 | dynamic | `font-family:'Mulish',sans-serif` |

### Sort rosters by chosen key (24)

| Line | Mode | Declaration |
|---|---|---|
| 7300 | js-composed | `width:26px;height:26px;border-radius:50%;object-fit:cover;margin-right:8px;flex-shrink:0;` |
| 7301 | dynamic-context | `width:26px;height:26px;border-radius:50%;background:var(--border2);margin-right:8px;flex-shrink:0;` |
| 7306 | dynamic | `height:100%;width:${w}%;background:${posColors[pos]};flex-shrink:0;` |
| 7309 | dynamic | `${rowBg}` |
| 7310 | dynamic | `color:var(--muted);opacity:.3;width:28px` |
| 7314 | dynamic | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;${r.isMe?'color:var(--red)':''}` |
| 7315 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:9px;color:var(--red);border:1px solid var(--red);pad...` |
| 7317 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:9px;color:${posColors[r.topScoringPos]};border:1px s...` |
| 7319 | static | `height:4px;background:var(--border);margin-top:5px;border-radius:2px;overflow:hidden;display:flex` |
| 7323 | dynamic | `color:var(--white)` |
| 7325 | dynamic | `color:${posColors.QB}` |
| 7326 | dynamic | `color:${posColors.RB}` |
| 7327 | dynamic | `color:${posColors.WR}` |
| 7328 | dynamic | `color:${posColors.TE}` |
| 7329 | dynamic | `color:var(--green)` |
| 7330 | dynamic | `color:var(--white);opacity:.5` |
| 7331 | dynamic | `color:var(--white);opacity:.5` |
| 7337 | static | `overflow-x:auto;-webkit-overflow-scrolling:touch` |
| 7338 | static | `width:100%;border-collapse:collapse;min-width:560px` |
| 7340 | static | `width:28px` |
| 7400 | dynamic | `margin-top:20px` |
| 7406 | dynamic | `border-left-color:var(--red)` |
| 7408 | dynamic | `color:var(--white);opacity:.7` |
| 7409 | dynamic | `${isMyPick?'color:var(--red)':''}` |

### Render an archetype chip (22)

| Line | Mode | Declaration |
|---|---|---|
| 2986 | dynamic | `display:inline-flex;align-items:center;justify-content:center;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;...` |
| 2989 | dynamic | `display:inline-flex;align-items:center;justify-content:center;background:${c};color:#fff;font-family:'Kanit',sans-serif;font-we...` |
| 2993 | dynamic-context | `width:32px;height:32px;flex-shrink:0;display:inline-block;` |
| 2994 | js-composed | `width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0;` |
| 2999 | dynamic-context | `width:32px;height:32px;border-radius:50%;background:var(--surface2);display:inline-flex;align-items:center;justify-content:cent...` |
| 3000 | static | `display:block` |
| 3084 | static | `display:flex;align-items:center;gap:8px;margin-bottom:6px` |
| 3086 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5` |
| 3088 | static | `display:flex;align-items:center;gap:10px;min-height:24px` |
| 3089 | static | `display:none;margin-top:8px` |
| 3091 | static | `background:none;border:none;color:var(--muted);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;...` |
| 3095 | static | `font-size:8px;transition:transform .15s` |
| 3097 | static | `display:none;margin-top:8px;padding-top:8px;border-top:1px solid var(--border)` |
| 3131 | static | `display:flex;align-items:center;gap:10px;width:100%;padding:8px 12px;background:rgba(237,129,12,0.06);border:1px dashed var(--b...` |
| 3132 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted);font-style:italic;flex:1;min-width:0` |
| 3134 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3149 | static | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;color:var(--white);text-decoration:none;flex:1;min-width:0;overf...` |
| 3153 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;flex-shrink:0` |
| 3155 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3165 | static | `display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border)` |
| 3167 | static | `font-family:'Mulish',sans-serif;font-weight:700;font-size:12px;color:var(--white);text-decoration:none;flex:1;min-width:0;overf...` |
| 3171 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;flex-shrink:0` |

### RIGHT: player exposure sidebar (21)

| Line | Mode | Declaration |
|---|---|---|
| 2345 | static | `display:flex;align-items:center;gap:8px` |
| 2346 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);width:12px;text-align:center;flex-shrink:0;transition:transfo...` |
| 2352 | static | `display:none` |
| 2370 | static | `width:24px;flex-shrink:0` |
| 2371 | static | `flex:1` |
| 2386 | static | `fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;` |
| 2386 | static | `fill:#c33;` |
| 2386 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2386 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2386 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2386 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2386 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2386 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2386 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2386 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2386 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2386 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2386 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2386 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2386 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2388 | dynamic-context | `flex-shrink:0;vertical-align:middle;margin-right:4px` |

### Archetype lookup for the owning team (20)

| Line | Mode | Declaration |
|---|---|---|
| 3418 | js-composed | `width:24px;height:24px;border-radius:3px;flex-shrink:0;background:var(--surface2)` |
| 3419 | dynamic-context | `width:24px;height:24px;border-radius:3px;flex-shrink:0;background:var(--surface2);display:inline-block` |
| 3433 | dynamic-context | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--green);text-transform:uppercase;let...` |
| 3439 | dynamic | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:1px 5px;bor...` |
| 3441 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--white);opacity:.85` |
| 3445 | static | `background:var(--red);border:none;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--w...` |
| 3454 | dynamic-context | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:#5b9bd5;text-transform:uppercase;letter-s...` |
| 3456 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3463 | dynamic | `display:flex;align-items:center;gap:10px;padding:8px 10px;border-bottom:1px solid var(--border);cursor:${rowCursor};border-radi...` |
| 3466 | dynamic | `font-family:'Mulish',sans-serif;font-weight:800;font-size:12px;color:var(--white);white-space:nowrap;overflow:hidden;text-overf...` |
| 3467 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.6;white-space:nowrap;overflow:hidden;text-overflow:e...` |
| 3469 | static | `display:flex;align-items:center;gap:8px;flex-shrink:0` |
| 3478 | dynamic | `margin-top:8px;font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;font-style:italic` |
| 3487 | static | `padding:0 18px;border-top:1px solid var(--border);background:var(--surface)` |
| 3489 | static | `display:flex;align-items:center;justify-content:space-between;padding:14px 0;cursor:pointer;user-select:none;gap:10px` |
| 3491 | static | `display:flex;align-items:center;gap:10px;flex:1;min-width:0` |
| 3492 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);width:14px;text-align:center;flex-shrink:0;transition:transfo...` |
| 3494 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.7` |
| 3496 | static | `display:flex;align-items:center;gap:6px;cursor:pointer;font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);user-s...` |
| 3502 | dynamic | `${contentDisplay};padding-bottom:14px` |

### Helpers (19)

| Line | Mode | Declaration |
|---|---|---|
| 6171 | dynamic | `color:var(--green);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 6172 | dynamic | `color:var(--red);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 6173 | dynamic-context | `opacity:.3` |
| 6178 | dynamic | `width:36px;padding-right:8px` |
| 6183 | dynamic | `display:inline-flex;align-items:center` |
| 6187 | dynamic | `color:var(--white)` |
| 6188 | dynamic | `color:var(--white);font-size:12px` |
| 6189 | dynamic | `color:${valColor(r.value)}` |
| 6190 | dynamic | `color:var(--white);font-size:12px` |
| 6191 | dynamic | `color:${r.seasonProj ? 'var(--white)' : 'var(--muted)'};opacity:${r.seasonProj ? '1' : '.3'}` |
| 6192 | dynamic | `color:${r.proj ? (r.proj >= 20 ? 'var(--green)' : r.proj >= 12 ? 'var(--white)' : 'var(--muted)') : 'var(--muted)'};opacity:${r...` |
| 6195 | dynamic | `color:var(--white)` |
| 6208 | static | `display:flex;align-items:center;gap:10px` |
| 6209 | dynamic | `width:4px;height:20px;background:${posColors[pos]};flex-shrink:0` |
| 6211 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);opacity:.4` |
| 6213 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:${posColors[pos]}` |
| 6215 | static | `overflow-x:auto;-webkit-overflow-scrolling:touch` |
| 6216 | static | `width:100%;border-collapse:collapse;min-width:430px` |
| 6218 | static | `width:36px` |

### Renders draft picks in the same visual layout as a position section so the (15)

| Line | Mode | Declaration |
|---|---|---|
| 6255 | static | `display:flex;align-items:center;gap:10px;margin-bottom:10px` |
| 6256 | static | `width:4px;height:20px;background:var(--pos-pick-bg);flex-shrink:0` |
| 6259 | static | `font-size:13px;opacity:.4;padding:12px 0;font-family:'Mulish',sans-serif` |
| 6280 | dynamic | `border-bottom:1px solid var(--border)` |
| 6281 | dynamic | `width:36px;padding-right:8px` |
| 6285 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5` |
| 6289 | dynamic | `color:${val > 3000 ? 'var(--green)' : val > 1000 ? 'var(--white)' : 'var(--muted)'}` |
| 6290 | dynamic | `color:var(--muted);opacity:.4;font-size:11px` |
| 6298 | static | `display:flex;align-items:center;gap:10px` |
| 6299 | static | `width:4px;height:20px;background:var(--pos-pick-bg);flex-shrink:0` |
| 6301 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);opacity:.4` |
| 6303 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:var(--pos-pick-bg)` |
| 6305 | static | `overflow-x:auto` |
| 6306 | static | `width:100%;border-collapse:collapse;min-width:520px` |
| 6308 | static | `width:36px` |

### Stash render context on window so the sort buttons can re-render (15)

| Line | Mode | Declaration |
|---|---|---|
| 7202 | static | `margin-bottom:24px` |
| 7203 | static | `display:flex;align-items:center;justify-content:space-between;margin-bottom:12px` |
| 7204 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;lette...` |
| 7205 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted)` |
| 7205 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;color:${+myTeam.mpxPct>=90?'var(--green)':+myTeam.mpxPct>=75?'...` |
| 7205 | dynamic | `opacity:.5` |
| 7207 | static | `display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px` |
| 7218 | dynamic | `background:var(--surface2);border:1px solid var(--border);padding:12px 14px;border-left:3px solid ${posColors[pos]}` |
| 7219 | dynamic | `margin-bottom:6px` |
| 7220 | static | `display:flex;gap:12px;align-items:flex-end` |
| 7223 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:${color}` |
| 7226 | dynamic | `border-left:1px solid var(--border2);padding-left:12px` |
| 7228 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:${scoreColor}` |
| 7231 | dynamic | `border-left:1px solid var(--border2);padding-left:12px` |
| 7237 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.35;margin-top:4px` |

### Aggregate per-roster (14)

| Line | Mode | Declaration |
|---|---|---|
| 6628 | static | `width:30px` |
| 6648 | dynamic | `color:var(--red);font-size:10px;font-style:italic` |
| 6653 | dynamic | `color:var(--yellow)` |
| 6654 | dynamic | `width:${maxSpent ? (r.spent/maxSpent*100).toFixed(0) : 0}%` |
| 6655 | dynamic | `color:var(--green)` |
| 6656 | dynamic | `width:${budget ? (r.left/budget*100).toFixed(0) : 0}%` |
| 6658 | dynamic | `text-align:right;color:var(--muted)` |
| 6660 | dynamic | `text-align:right;color:var(--yellow)` |
| 6698 | static | `width:30px` |
| 6733 | dynamic | `font-size:12px` |
| 6733 | dynamic | `color:var(--red);font-style:italic` |
| 6781 | dynamic | `color:var(--muted);opacity:.4;font-size:10px` |
| 6784 | dynamic | `background:rgba(237,129,12,0.05)` |
| 6788 | dynamic | `opacity:.4` |

### Build one side per roster_id (14)

| Line | Mode | Declaration |
|---|---|---|
| 6968 | static | `display:flex;justify-content:space-between;align-items:center;margin-bottom:8px` |
| 6969 | dynamic | `margin-bottom:0` |
| 6975 | dynamic | `${s.isMe ? 'color:var(--red)' : ''}` |
| 6978 | static | `width:28px;height:28px;flex-shrink:0;display:inline-flex;align-items:center;` |
| 6980 | js-composed | `width:28px;height:28px;border-radius:50%;object-fit:cover;` |
| 6984 | static | `min-width:0;flex:1` |
| 6985 | static | `display:flex;align-items:center;gap:4px;flex-wrap:wrap` |
| 6989 | dynamic | `display:flex;gap:8px;margin-top:2px` |
| 6998 | static | `min-width:0;flex:1` |
| 7000 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.35;margin-left:4px` |
| 7001 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--pos-pick-bg);margin-top:2px` |
| 7005 | dynamic | `margin-top:4px` |
| 7006 | static | `width:28px;flex-shrink:0;` |
| 7007 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:12px;color:var(--green)` |

### Render the current state of the suggestion pre-screener (12)

| Line | Mode | Declaration |
|---|---|---|
| 3812 | dynamic | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:2px 6px;bor...` |
| 3815 | static | `padding:14px 20px;border-bottom:1px solid var(--border);background:var(--surface2)` |
| 3816 | static | `display:flex;align-items:center;gap:12px` |
| 3817 | js-composed | `width:48px;height:48px;border-radius:3px;object-fit:cover;background:var(--surface)` |
| 3819 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:18px;color:var(--white);text-transform:uppercase;lin...` |
| 3820 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);margin-top:2px` |
| 3821 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--white);opacity:.8;margin-top:2px` |
| 3834 | static | `padding:20px` |
| 3835 | static | `font-family:'Mulish',sans-serif;font-size:13px;color:var(--white);margin-bottom:8px` |
| 3836 | static | `font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted);margin-bottom:16px` |
| 3838 | static | `display:inline-block;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--white);backgro...` |
| 3852 | dynamic | `padding:24px;text-align:center;color:var(--muted);font-size:13px` |

### Temporarily assign global IDs so existing loadRoster can find them (12)

| Line | Mode | Declaration |
|---|---|---|
| 5553 | static | `display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--surface);border:1px solid var(--border);margin-bott...` |
| 5554 | static | `display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;flex-shrink:0;background:var(--surface2);b...` |
| 5554 | static | `display:block` |
| 5555 | static | `flex:1` |
| 5557 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);margin-top:3px` |
| 5560 | static | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px` |
| 5564 | js-composed | `display:flex;align-items:center;gap:12px;padding:11px 12px;background:var(--surface);border:1px solid var(--border);margin-bott...` |
| 5565 | js-composed | `width:30px;height:30px;border-radius:2px;flex-shrink:0` |
| 5565 | js-composed | `width:30px;height:30px;background:var(--surface2);border-radius:2px;flex-shrink:0` |
| 5567 | dynamic | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;color:var(--white);white-space:nowrap;overflow:hidden;text-overf...` |
| 5568 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.7;margin-top:1px` |
| 5570 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;lette...` |

### Ensure roster/users/players are loaded and stashed on window for the modal layer (10)

| Line | Mode | Declaration |
|---|---|---|
| 5108 | dynamic | `display:inline-flex;align-items:center;gap:6px;padding:6px 10px;background:var(--surface2);border:1px solid var(--border);borde...` |
| 5109 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:${color};text-transform:uppercase;letter-...` |
| 5110 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:14px;color:${rankColor}` |
| 5111 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.6` |
| 5121 | dynamic | `display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px` |
| 5133 | static | `display:flex;align-items:center;justify-content:space-between` |
| 5135 | static | `display:flex;align-items:center;gap:8px` |
| 5136 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em` |
| 5138 | static | `background:var(--surface2);border:1px solid var(--border2);color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;fo...` |
| 5155 | dynamic | `display:none` |

### Team logo helpers — load BEFORE player-panel.js so modal-hero badge works. (8)

| Line | Mode | Declaration |
|---|---|---|
| 2101 | static | `...` |
| 2158 | static | `...` |
| 2228 | static | `position:fixed;inset:0;background:var(--black);color:var(--white);display:flex;align-items:center;justify-content:center;font-f...` |
| 2229 | static | `background:var(--nav-bg);border-bottom:2px solid var(--red);position:sticky;top:0;z-index:100` |
| 2229 | static | `border:none;position:static` |
| 2232 | static | `fill-rule:evenodd;clip-rule:evenodd` |
| 2275 | static | `background:none;border:1px solid var(--border2);color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:it...` |
| 2304 | static | `display:none` |

### Close player-detail modal if open (5)

| Line | Mode | Declaration |
|---|---|---|
| 4412 | dynamic-context | `margin-top:14px;padding-top:14px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:8px;align-items:center` |
| 4414 | static | `display:inline-block;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:12px;color:var(--white);backgro...` |
| 4416 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-style:italic;text-align:center;line-height:1.5;max-width...` |
| 4430 | dynamic | `color:${diff>0?'var(--red)':diff<0?'var(--green)':'var(--white)'}` |
| 4490 | dynamic-context | `opacity:.5` |

### Total roster value (5)

| Line | Mode | Declaration |
|---|---|---|
| 6338 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:${_rankColor(rank)};padding:1px 6px;backg...` |
| 6342 | static | `display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px;padding:16px;background:var(--surface2);border:1px solid var(--border)` |
| 6343 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 6345 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 6348 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:var(--green)` |

### Trade Builder Modal — opens over the player detail modal (z-index 250) (5)

| Line | Mode | Declaration |
|---|---|---|
| 7584 | static | `z-index:250` |
| 7588 | static | `margin-right:8px` |
| 7595 | static | `z-index:260` |
| 7596 | static | `max-width:540px` |
| 7599 | static | `margin-right:8px` |

### PICKS BRANCH (4)

| Line | Mode | Declaration |
|---|---|---|
| 5746 | static | `background:var(--surface2);display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border)` |
| 5746 | static | `display:block` |
| 5748 | dynamic | `color:#9b91d4` |
| 5751 | dynamic | `color:${expoColor(p.exposure)}` |

### Group transactions by roster (3)

| Line | Mode | Declaration |
|---|---|---|
| 6849 | dynamic | `color:var(--red);font-size:10px;font-style:italic` |
| 6850 | dynamic | `color:var(--yellow)` |
| 6850 | dynamic | `color:var(--green)` |

### Sort state for the leagues list (2)

| Line | Mode | Declaration |
|---|---|---|
| 4902 | dynamic | `width:${w}%;background:${s.color}` |
| 4909 | dynamic-context | `opacity:.3` |

### Color helpers (2)

| Line | Mode | Declaration |
|---|---|---|
| 5836 | dynamic | `color:${posColor(p.position)}` |
| 5839 | dynamic | `color:${expoColor(p.exposure)}` |

### Store per-league so multiple leagues can expand without collision (2)

| Line | Mode | Declaration |
|---|---|---|
| 6496 | static | `margin-bottom:12px` |
| 6497 | static | `display:none` |

### Update section meta with archetype legend + league averages (2)

| Line | Mode | Declaration |
|---|---|---|
| 7250 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 7250 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |

### Columns: expandable league list (left) + player exposure (right) (1)

| Line | Mode | Declaration |
|---|---|---|
| 2326 | static | `display:none` |

### Close modals on Escape (1)

| Line | Mode | Declaration |
|---|---|---|
| 4538 | dynamic | `color:${color};border-color:${color};background:${bg}` |
