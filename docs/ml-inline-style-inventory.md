# my-leagues.html inline-style inventory

Generated from `my-leagues.html` (7563 lines).
Total `style="..."` occurrences: **354**.

This is a read-only audit. No code was changed. The goal is to make the
refactor safe to execute supervised by giving every occurrence a category,
a section assignment, and an actionability verdict.

---

## Mode breakdown

| Mode | Count | % | Refactorable to CSS class? |
|---|---|---|---|
| `dynamic` | 171 | 48.3% | Conditional - if the interpolated value is a discrete enum, use a modifier class (e.g. `.is-active`); otherwise leave inline |
| `static` | 156 | 44.1% | Yes - pure HTML attribute, drop into a class |
| `dynamic-context` | 18 | 5.1% | Conditional - inside a JS-built HTML string; refactor only if the declaration set is static |
| `js-composed` | 9 | 2.5% | No - imperatively set at runtime; leave as-is |

**Headline:** ~156 are directly refactorable, ~189 require case-by-case judgement, ~9 must stay inline (JS-set).

---

## Top 25 declaration properties

Which CSS properties carry most of the inline styling. Where one property dominates, a single utility class can collapse many sites.

| Property | Count |
|---|---|
| `color` | 175 |
| `font-size` | 134 |
| `font-family` | 125 |
| `font-weight` | 80 |
| `display` | 74 |
| `font-style` | 66 |
| `align-items` | 52 |
| `padding` | 50 |
| `opacity` | 49 |
| `background` | 48 |
| `text-transform` | 44 |
| `letter-spacing` | 41 |
| `gap` | 39 |
| `width` | 39 |
| `flex-shrink` | 38 |
| `margin-bottom` | 36 |
| `border-radius` | 32 |
| `border` | 25 |
| `height` | 20 |
| `justify-content` | 18 |
| `margin-top` | 17 |
| `cursor` | 16 |
| `text-align` | 16 |
| `flex` | 16 |
| `fill-rule` | 15 |

---

## Most-repeated declaration sets (>= 2 occurrences)

Each row below is a strong refactor candidate: same declaration set appearing N times -> create one class once, replace N sites.

| Count | Normalized declaration set |
|---|---|
| 13 | `fill-rule:nonzero; fill:var(--black)` |
| 6 | `flex:1; min-width:0` |
| 6 | `text-align:right` |
| 4 | `display:none` |
| 4 | `cursor:pointer` |
| 4 | `color:var(--red); font-family:'Kanit',sans-serif; font-size:11px; font-style:italic; font-weight:800; letter-spacing:.06em; text-transform:uppercase` |
| 4 | `align-items:center; display:flex; flex-wrap:wrap; gap:6px` |
| 4 | `color:var(--muted); font-family:'Mulish',sans-serif; font-size:10px; opacity:.4` |
| 4 | `color:var(--muted); opacity:.5` |
| 3 | `display:block` |
| 3 | `align-items:center; display:flex; justify-content:space-between; margin-bottom:10px` |
| 3 | `color:var(--muted); font-size:11px; font-style:italic; padding:8px` |
| 3 | `margin-bottom:10px` |
| 3 | `color:var(--white); font-family:'Mulish',sans-serif; font-size:14px; font-weight:900` |
| 3 | `color:var(--white)` |
| 3 | `margin-bottom:28px` |
| 3 | `color:var(--white); font-family:'Kanit',sans-serif; font-size:14px; font-style:italic; font-weight:800; text-transform:uppercase` |
| 3 | `color:var(--muted); font-family:'Mulish',sans-serif; font-size:10px; letter-spacing:.07em; opacity:.45; text-transform:uppercase` |
| 3 | `color:var(--green)` |
| 3 | `color:var(--muted); font-size:10px; opacity:.5` |
| 3 | `color:var(--muted); font-family:'Kanit',sans-serif; font-size:11px; font-style:italic; font-weight:800; opacity:.6` |
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

---

## Occurrences per region

Sorted by count - the busiest regions are the highest-leverage refactor batches.

| Count | Region (nearest banner-comment heading above the hit) |
|---|---|
| 36 | Save current scoped IDs so the existing loadRoster / loadAllTrades can target them |
| 30 | Render the current suggestion as a single card |
| 30 | Sort rosters by chosen key |
| 26 | Helpers |
| 24 | Aggregate per-roster |
| 23 | Render an archetype chip |
| 23 | Archetype lookup for the owning team |
| 23 | Renders draft picks in the same visual layout as a position section so the |
| 22 | RIGHT: player exposure sidebar |
| 19 | Picks this roster RECEIVED |
| 18 | Stash render context on window so the sort buttons can re-render |
| 14 | Temporarily assign global IDs so existing loadRoster can find them |
| 13 | Render the current state of the suggestion pre-screener |
| 10 | Ensure roster/users/players are loaded and stashed on window for the modal layer |
| 10 | Total roster value |
| 7 | Team logo helpers — load BEFORE player-panel.js so modal-hero badge works. |
| 5 | Close player-detail modal if open |
| 5 | Trade Builder Modal — opens over the player detail modal (z-index 250) |
| 4 | PICKS BRANCH |
| 4 | Group transactions by roster |
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

### Save current scoped IDs so the existing loadRoster / loadAllTrades can target them (36)

| Line | Mode | Declaration |
|---|---|---|
| 5240 | dynamic | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:2px 6px;bor...` |
| 5249 | dynamic-context | `display:inline-flex;align-items:center;gap:3px;padding:2px 6px;background:var(--surface2);border:1px solid var(--border);border...` |
| 5250 | dynamic | `color:${color};letter-spacing:.04em` |
| 5251 | dynamic | `color:${rankColor}` |
| 5256 | dynamic-context | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:9px;color:var(--white);background:var(--red);padding...` |
| 5262 | dynamic | `border:1px solid var(--border);background:var(--surface);margin-bottom:6px` |
| 5264 | static | `display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;user-select:none` |
| 5266 | static | `font-family:'Mulish',sans-serif;font-size:9px;color:var(--muted);width:14px;text-align:center;flex-shrink:0;transition:transfor...` |
| 5268 | dynamic | `width:28px;height:28px;border-radius:3px;object-fit:cover;background:var(--surface2);flex-shrink:0` |
| 5269 | dynamic | `width:28px;height:28px;border-radius:3px;background:var(--surface2);display:flex;align-items:center;justify-content:center;font...` |
| 5271 | static | `flex:1;min-width:0` |
| 5272 | static | `display:flex;align-items:center;gap:6px;flex-wrap:wrap` |
| 5273 | dynamic | `font-family:'Mulish',sans-serif;font-weight:800;font-size:13px;color:var(--white);white-space:nowrap;overflow:hidden;text-overf...` |
| 5277 | static | `display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin-top:5px` |
| 5281 | static | `text-align:right;flex-shrink:0` |
| 5282 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:14px;color:var(--white)` |
| 5283 | static | `font-family:'Mulish',sans-serif;font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em` |
| 5286 | dynamic | `display:none;border-top:1px solid var(--border);background:var(--surface2);padding:10px 14px` |
| 5319 | dynamic-context | `color:var(--muted);font-size:11px;padding:8px;font-style:italic` |
| 5323 | dynamic-context | `color:var(--muted);font-size:11px;padding:8px;font-style:italic` |
| 5409 | static | `margin-bottom:10px` |
| 5410 | static | `display:flex;align-items:center;justify-content:space-between;padding:6px 4px;border-bottom:1px solid var(--border2);margin-bot...` |
| 5411 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;lette...` |
| 5411 | dynamic | `color:var(--muted);font-weight:700;margin-left:4px` |
| 5412 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-weight:700` |
| 5422 | static | `margin-bottom:10px` |
| 5423 | static | `display:flex;align-items:center;padding:6px 4px;border-bottom:1px solid var(--border2);margin-bottom:2px` |
| 5424 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--muted);text-transform:uppercase;let...` |
| 5424 | dynamic | `margin-left:4px` |
| 5435 | static | `margin-bottom:10px` |
| 5436 | static | `display:flex;align-items:center;justify-content:space-between;padding:6px 4px;border-bottom:1px solid var(--border2);margin-bot...` |
| 5437 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--pos-pick-bg,#9b91d4);text-transform...` |
| 5437 | dynamic | `color:var(--muted);font-weight:700;margin-left:4px` |
| 5438 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-weight:700` |
| 5446 | dynamic-context | `color:var(--muted);font-size:11px;padding:8px;font-style:italic` |
| 5448 | dynamic | `font-family:'Mulish',sans-serif` |

### Render the current suggestion as a single card (30)

| Line | Mode | Declaration |
|---|---|---|
| 3992 | static | `display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)` |
| 3993 | dynamic | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:800;text-transform:uppercase;padding:2px 5px;border-radius:2px;${posS...` |
| 3994 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;font-weight:700;color:var(--white);flex:1;min-width:0;overflow:hidden;text-overf...` |
| 3995 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);flex-shrink:0` |
| 4002 | static | `display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)` |
| 4003 | dynamic | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:800;text-transform:uppercase;padding:2px 5px;border-radius:2px;backgr...` |
| 4004 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;font-weight:700;color:var(--white);flex:1;min-width:0;overflow:hidden;text-overf...` |
| 4005 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);flex-shrink:0` |
| 4016 | static | `padding:14px 18px` |
| 4017 | static | `display:flex;align-items:center;justify-content:space-between;margin-bottom:10px` |
| 4018 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;lette...` |
| 4019 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted)` |
| 4022 | static | `border:1px solid var(--border2);background:var(--surface2);padding:12px 14px;margin-bottom:14px` |
| 4023 | static | `margin-bottom:8px` |
| 4024 | static | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;color:var(--muted);letter-spacing:.06em;...` |
| 4026 | static | `display:flex;justify-content:space-between;padding-top:6px;font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted)` |
| 4027 | dynamic | `color:var(--white);font-weight:700` |
| 4030 | static | `border-top:1px solid var(--border);padding-top:8px;margin-top:6px` |
| 4031 | static | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;color:var(--muted);letter-spacing:.06em;...` |
| 4033 | static | `display:flex;justify-content:space-between;padding-top:6px;font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted)` |
| 4034 | dynamic | `color:var(--white);font-weight:700` |
| 4037 | dynamic | `margin-top:10px;padding-top:8px;border-top:1px solid var(--border);font-family:'Mulish',sans-serif;font-size:11px;color:${balan...` |
| 4040 | static | `display:flex;gap:10px;margin-bottom:10px` |
| 4042 | static | `flex:1;background:transparent;border:2px solid var(--red);color:var(--red);font-family:'Kanit',sans-serif;font-weight:800;font-...` |
| 4046 | static | `flex:1;background:var(--green);border:2px solid var(--green);color:var(--black);font-family:'Kanit',sans-serif;font-weight:800;...` |
| 4050 | static | `text-align:center;font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-style:italic` |
| 4060 | static | `padding:24px 20px;text-align:center` |
| 4061 | dynamic | `font-family:'Mulish',sans-serif;font-size:13px;color:var(--white);margin-bottom:6px;line-height:1.5` |
| 4062 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);margin-bottom:18px;line-height:1.5` |
| 4064 | static | `background:var(--red);border:none;color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size...` |

### Sort rosters by chosen key (30)

| Line | Mode | Declaration |
|---|---|---|
| 7260 | js-composed | `width:26px;height:26px;border-radius:50%;object-fit:cover;margin-right:8px;flex-shrink:0;` |
| 7261 | dynamic-context | `width:26px;height:26px;border-radius:50%;background:var(--border2);margin-right:8px;flex-shrink:0;` |
| 7266 | dynamic | `height:100%;width:${w}%;background:${posColors[pos]};flex-shrink:0;` |
| 7269 | dynamic | `${rowBg}` |
| 7270 | dynamic | `color:var(--muted);opacity:.3;width:28px` |
| 7272 | static | `display:flex;align-items:center;gap:6px;flex-wrap:wrap` |
| 7274 | dynamic | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;${r.isMe?'color:var(--red)':''}` |
| 7275 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:9px;color:var(--red);border:1px solid var(--red);pad...` |
| 7277 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:9px;color:${posColors[r.topScoringPos]};border:1px s...` |
| 7279 | static | `height:4px;background:var(--border);margin-top:5px;border-radius:2px;overflow:hidden;display:flex` |
| 7283 | dynamic | `color:var(--white)` |
| 7284 | dynamic | `color:var(--muted);opacity:.5` |
| 7285 | dynamic | `color:${posColors.QB}` |
| 7286 | dynamic | `color:${posColors.RB}` |
| 7287 | dynamic | `color:${posColors.WR}` |
| 7288 | dynamic | `color:${posColors.TE}` |
| 7289 | dynamic | `color:var(--green)` |
| 7290 | dynamic | `color:var(--white);opacity:.5` |
| 7291 | dynamic | `color:${r.mpxPct >= 90 ? 'var(--green)' : r.mpxPct >= 75 ? 'var(--white)' : r.mpxPct ? 'var(--red)' : 'var(--muted)'}` |
| 7297 | static | `overflow-x:auto;-webkit-overflow-scrolling:touch` |
| 7298 | static | `width:100%;border-collapse:collapse;min-width:560px` |
| 7300 | static | `width:28px` |
| 7304 | dynamic | `color:${posColors.QB}` |
| 7305 | dynamic | `color:${posColors.RB}` |
| 7306 | dynamic | `color:${posColors.WR}` |
| 7307 | dynamic | `color:${posColors.TE}` |
| 7360 | dynamic | `margin-top:20px` |
| 7366 | dynamic | `border-left-color:var(--red)` |
| 7368 | dynamic | `color:var(--white);opacity:.7` |
| 7369 | dynamic | `${isMyPick?'color:var(--red)':''}` |

### Helpers (26)

| Line | Mode | Declaration |
|---|---|---|
| 6213 | dynamic | `color:var(--green);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 6214 | dynamic | `color:var(--red);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 6215 | dynamic-context | `opacity:.3` |
| 6219 | js-composed | `cursor:pointer` |
| 6220 | dynamic | `width:36px;padding-right:8px` |
| 6222 | static | `display:flex;align-items:center;gap:6px;flex-wrap:wrap` |
| 6224 | dynamic | `font-family:'Mulish',sans-serif;font-weight:900;font-size:14px;color:var(--white)` |
| 6225 | dynamic | `display:inline-flex;align-items:center` |
| 6225 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.4` |
| 6229 | dynamic | `color:var(--white)` |
| 6230 | dynamic | `color:var(--white);font-size:12px` |
| 6231 | dynamic | `color:${valColor(r.value)}` |
| 6232 | dynamic | `color:var(--white);font-size:12px` |
| 6233 | dynamic | `color:${r.seasonProj ? 'var(--white)' : 'var(--muted)'};opacity:${r.seasonProj ? '1' : '.3'}` |
| 6234 | dynamic | `color:${r.proj ? (r.proj >= 20 ? 'var(--green)' : r.proj >= 12 ? 'var(--white)' : 'var(--muted)') : 'var(--muted)'};opacity:${r...` |
| 6237 | dynamic | `color:var(--white)` |
| 6248 | static | `margin-bottom:28px` |
| 6249 | static | `display:flex;align-items:center;justify-content:space-between;margin-bottom:10px` |
| 6250 | static | `display:flex;align-items:center;gap:10px` |
| 6251 | dynamic | `width:4px;height:20px;background:${posColors[pos]};flex-shrink:0` |
| 6252 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:14px;color:var(--white);text-transform:uppercase` |
| 6253 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);opacity:.4` |
| 6255 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:${posColors[pos]}` |
| 6257 | static | `overflow-x:auto;-webkit-overflow-scrolling:touch` |
| 6258 | static | `width:100%;border-collapse:collapse;min-width:430px` |
| 6260 | static | `width:36px` |

### Aggregate per-roster (24)

| Line | Mode | Declaration |
|---|---|---|
| 6647 | static | `width:30px` |
| 6653 | static | `text-align:right` |
| 6654 | static | `text-align:right` |
| 6655 | static | `text-align:right` |
| 6656 | static | `text-align:right` |
| 6662 | dynamic | `color:var(--muted);opacity:.5` |
| 6667 | dynamic | `color:var(--red);font-size:10px;font-style:italic` |
| 6672 | dynamic | `color:var(--yellow)` |
| 6673 | dynamic | `width:${maxSpent ? (r.spent/maxSpent*100).toFixed(0) : 0}%` |
| 6674 | dynamic | `color:var(--green)` |
| 6675 | dynamic | `width:${budget ? (r.left/budget*100).toFixed(0) : 0}%` |
| 6676 | dynamic | `text-align:right` |
| 6677 | dynamic | `text-align:right;color:var(--muted)` |
| 6678 | dynamic | `text-align:right` |
| 6679 | dynamic | `text-align:right;color:var(--yellow)` |
| 6717 | static | `width:30px` |
| 6734 | dynamic | `color:var(--muted);opacity:.5` |
| 6743 | dynamic | `color:var(--muted);opacity:.5;font-size:10px` |
| 6752 | dynamic | `font-size:12px` |
| 6752 | dynamic | `color:var(--red);font-style:italic` |
| 6796 | dynamic | `color:var(--muted);opacity:.5;font-size:10px` |
| 6800 | dynamic | `color:var(--muted);opacity:.4;font-size:10px` |
| 6803 | dynamic | `background:rgba(237,129,12,0.05)` |
| 6807 | dynamic | `opacity:.4` |

### Render an archetype chip (23)

| Line | Mode | Declaration |
|---|---|---|
| 2925 | dynamic | `display:inline-flex;align-items:center;justify-content:center;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;...` |
| 2928 | dynamic | `display:inline-flex;align-items:center;justify-content:center;background:${c};color:var(--black);font-family:'Kanit',sans-serif...` |
| 2932 | dynamic-context | `width:32px;height:32px;flex-shrink:0;display:inline-block;` |
| 2933 | js-composed | `width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0;` |
| 2938 | dynamic-context | `width:32px;height:32px;border-radius:50%;background:var(--surface2);display:inline-flex;align-items:center;justify-content:cent...` |
| 2939 | static | `display:block` |
| 3023 | static | `display:flex;align-items:center;gap:8px;margin-bottom:6px` |
| 3024 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;lette...` |
| 3025 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5` |
| 3027 | static | `display:flex;align-items:center;gap:10px;min-height:24px` |
| 3028 | static | `display:none;margin-top:8px` |
| 3030 | static | `background:none;border:none;color:var(--muted);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;...` |
| 3034 | static | `font-size:8px;transition:transform .15s` |
| 3036 | static | `display:none;margin-top:8px;padding-top:8px;border-top:1px solid var(--border)` |
| 3070 | static | `display:flex;align-items:center;gap:10px;width:100%;padding:8px 12px;background:rgba(237,129,12,0.06);border:1px dashed var(--b...` |
| 3071 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted);font-style:italic;flex:1;min-width:0` |
| 3073 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3088 | static | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;color:var(--white);text-decoration:none;flex:1;min-width:0;overf...` |
| 3092 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;flex-shrink:0` |
| 3094 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3104 | static | `display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border)` |
| 3106 | static | `font-family:'Mulish',sans-serif;font-weight:700;font-size:12px;color:var(--white);text-decoration:none;flex:1;min-width:0;overf...` |
| 3110 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;flex-shrink:0` |

### Archetype lookup for the owning team (23)

| Line | Mode | Declaration |
|---|---|---|
| 3363 | js-composed | `width:24px;height:24px;border-radius:3px;flex-shrink:0;background:var(--surface2)` |
| 3364 | dynamic-context | `width:24px;height:24px;border-radius:3px;flex-shrink:0;background:var(--surface2);display:inline-block` |
| 3378 | dynamic-context | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--green);text-transform:uppercase;let...` |
| 3384 | dynamic | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:1px 5px;bor...` |
| 3386 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--white);opacity:.85` |
| 3390 | static | `background:var(--red);border:none;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--w...` |
| 3399 | dynamic-context | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:#5b9bd5;text-transform:uppercase;letter-s...` |
| 3401 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3408 | dynamic | `display:flex;align-items:center;gap:10px;padding:8px 10px;border-bottom:1px solid var(--border);cursor:${rowCursor};border-radi...` |
| 3410 | static | `flex:1;min-width:0` |
| 3411 | dynamic | `font-family:'Mulish',sans-serif;font-weight:800;font-size:12px;color:var(--white);white-space:nowrap;overflow:hidden;text-overf...` |
| 3412 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.6;white-space:nowrap;overflow:hidden;text-overflow:e...` |
| 3414 | static | `display:flex;align-items:center;gap:8px;flex-shrink:0` |
| 3423 | dynamic | `margin-top:8px;font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;font-style:italic` |
| 3432 | static | `padding:0 18px;border-top:1px solid var(--border);background:var(--surface)` |
| 3434 | static | `display:flex;align-items:center;justify-content:space-between;padding:14px 0;cursor:pointer;user-select:none;gap:10px` |
| 3436 | static | `display:flex;align-items:center;gap:10px;flex:1;min-width:0` |
| 3437 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);width:14px;text-align:center;flex-shrink:0;transition:transfo...` |
| 3438 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;lette...` |
| 3439 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.7` |
| 3441 | static | `display:flex;align-items:center;gap:6px;cursor:pointer;font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);user-s...` |
| 3443 | dynamic | `cursor:pointer` |
| 3447 | dynamic | `${contentDisplay};padding-bottom:14px` |

### Renders draft picks in the same visual layout as a position section so the (23)

| Line | Mode | Declaration |
|---|---|---|
| 6296 | static | `margin-bottom:28px` |
| 6297 | static | `display:flex;align-items:center;gap:10px;margin-bottom:10px` |
| 6298 | static | `width:4px;height:20px;background:var(--pos-pick-bg);flex-shrink:0` |
| 6299 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:14px;color:var(--white);text-transform:uppercase` |
| 6301 | static | `font-size:13px;opacity:.4;padding:12px 0;font-family:'Mulish',sans-serif` |
| 6322 | dynamic-context | `border-bottom:1px solid var(--border)` |
| 6323 | dynamic | `width:36px;padding-right:8px` |
| 6325 | static | `display:flex;align-items:center;gap:6px;flex-wrap:wrap` |
| 6326 | dynamic | `font-family:'Mulish',sans-serif;font-weight:900;font-size:14px;color:var(--white)` |
| 6327 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5` |
| 6330 | dynamic | `color:var(--muted);opacity:.5` |
| 6331 | dynamic | `color:${val > 3000 ? 'var(--green)' : val > 1000 ? 'var(--white)' : 'var(--muted)'}` |
| 6332 | dynamic | `color:var(--muted);opacity:.4;font-size:11px` |
| 6338 | static | `margin-bottom:28px` |
| 6339 | static | `display:flex;align-items:center;justify-content:space-between;margin-bottom:10px` |
| 6340 | static | `display:flex;align-items:center;gap:10px` |
| 6341 | static | `width:4px;height:20px;background:var(--pos-pick-bg);flex-shrink:0` |
| 6342 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:14px;color:var(--white);text-transform:uppercase` |
| 6343 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);opacity:.4` |
| 6345 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:var(--pos-pick-bg)` |
| 6347 | static | `overflow-x:auto` |
| 6348 | static | `width:100%;border-collapse:collapse;min-width:520px` |
| 6350 | static | `width:36px` |

### RIGHT: player exposure sidebar (22)

| Line | Mode | Declaration |
|---|---|---|
| 2255 | static | `cursor:pointer` |
| 2256 | static | `display:flex;align-items:center;gap:8px` |
| 2257 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);width:12px;text-align:center;flex-shrink:0;transition:transfo...` |
| 2263 | static | `display:none` |
| 2281 | static | `width:24px;flex-shrink:0` |
| 2282 | static | `flex:1` |
| 2297 | static | `fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;` |
| 2297 | static | `fill:#c33;` |
| 2297 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2297 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2297 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2297 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2297 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2297 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2297 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2297 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2297 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2297 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2297 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2297 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2297 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2299 | dynamic-context | `flex-shrink:0;vertical-align:middle;margin-right:4px` |

### Picks this roster RECEIVED (19)

| Line | Mode | Declaration |
|---|---|---|
| 6987 | static | `display:flex;justify-content:space-between;align-items:center;margin-bottom:8px` |
| 6988 | dynamic | `margin-bottom:0` |
| 6989 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.4` |
| 6994 | dynamic | `${s.isMe ? 'color:var(--red)' : ''}` |
| 6996 | dynamic | `cursor:pointer` |
| 6997 | static | `width:28px;height:28px;flex-shrink:0;display:inline-flex;align-items:center;` |
| 6999 | js-composed | `width:28px;height:28px;border-radius:50%;object-fit:cover;` |
| 7003 | static | `min-width:0;flex:1` |
| 7004 | static | `display:flex;align-items:center;gap:4px;flex-wrap:wrap` |
| 7008 | dynamic | `display:flex;gap:8px;margin-top:2px` |
| 7009 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--muted);opacity:.6` |
| 7010 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.4` |
| 7011 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.4` |
| 7017 | static | `min-width:0;flex:1` |
| 7019 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.35;margin-left:4px` |
| 7020 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--pos-pick-bg);margin-top:2px` |
| 7024 | dynamic | `margin-top:4px` |
| 7025 | static | `width:28px;flex-shrink:0;` |
| 7026 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:12px;color:var(--green)` |

### Stash render context on window so the sort buttons can re-render (18)

| Line | Mode | Declaration |
|---|---|---|
| 7167 | static | `margin-bottom:24px` |
| 7168 | static | `display:flex;align-items:center;justify-content:space-between;margin-bottom:12px` |
| 7169 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;lette...` |
| 7170 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted)` |
| 7170 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;color:${+myTeam.mpxPct>=90?'var(--green)':+myTeam.mpxPct>=75?'...` |
| 7170 | dynamic | `opacity:.5` |
| 7172 | static | `display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px` |
| 7183 | dynamic | `background:var(--surface2);border:1px solid var(--border);padding:12px 14px;border-left:3px solid ${posColors[pos]}` |
| 7184 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:${posColors[pos]};text-transform:uppercas...` |
| 7185 | static | `display:flex;gap:12px;align-items:flex-end` |
| 7187 | static | `font-family:'Mulish',sans-serif;font-size:9px;color:var(--muted);opacity:.4;text-transform:uppercase;letter-spacing:.06em` |
| 7188 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:${color}` |
| 7189 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--muted);opacity:.6` |
| 7191 | dynamic | `border-left:1px solid var(--border2);padding-left:12px` |
| 7192 | static | `font-family:'Mulish',sans-serif;font-size:9px;color:var(--muted);opacity:.4;text-transform:uppercase;letter-spacing:.06em` |
| 7193 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:${scoreColor}` |
| 7194 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--muted);opacity:.6` |
| 7197 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.35;margin-top:4px` |

### Temporarily assign global IDs so existing loadRoster can find them (14)

| Line | Mode | Declaration |
|---|---|---|
| 5559 | static | `display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--surface);border:1px solid var(--border);margin-bott...` |
| 5560 | static | `display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;flex-shrink:0;background:var(--surface2);b...` |
| 5560 | static | `display:block` |
| 5561 | static | `flex:1` |
| 5562 | dynamic | `font-family:'Mulish',sans-serif;font-weight:900;font-size:14px;color:var(--white)` |
| 5563 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);margin-top:3px` |
| 5566 | static | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px` |
| 5570 | js-composed | `display:flex;align-items:center;gap:12px;padding:11px 12px;background:var(--surface);border:1px solid var(--border);margin-bott...` |
| 5571 | js-composed | `width:30px;height:30px;border-radius:2px;flex-shrink:0` |
| 5571 | js-composed | `width:30px;height:30px;background:var(--surface2);border-radius:2px;flex-shrink:0` |
| 5572 | static | `flex:1;min-width:0` |
| 5573 | dynamic | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;color:var(--white);white-space:nowrap;overflow:hidden;text-overf...` |
| 5574 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.7;margin-top:1px` |
| 5576 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;lette...` |

### Render the current state of the suggestion pre-screener (13)

| Line | Mode | Declaration |
|---|---|---|
| 3914 | dynamic | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:2px 6px;bor...` |
| 3917 | static | `padding:14px 20px;border-bottom:1px solid var(--border);background:var(--surface2)` |
| 3918 | static | `display:flex;align-items:center;gap:12px` |
| 3919 | js-composed | `width:48px;height:48px;border-radius:3px;object-fit:cover;background:var(--surface)` |
| 3920 | static | `flex:1;min-width:0` |
| 3921 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:18px;color:var(--white);text-transform:uppercase;lin...` |
| 3922 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);margin-top:2px` |
| 3923 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--white);opacity:.8;margin-top:2px` |
| 3936 | static | `padding:20px` |
| 3937 | static | `font-family:'Mulish',sans-serif;font-size:13px;color:var(--white);margin-bottom:8px` |
| 3938 | static | `font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted);margin-bottom:16px` |
| 3940 | static | `display:inline-block;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--white);backgro...` |
| 3946 | dynamic-context | `padding:24px;text-align:center;color:var(--muted);font-size:13px` |

### Ensure roster/users/players are loaded and stashed on window for the modal layer (10)

| Line | Mode | Declaration |
|---|---|---|
| 5115 | dynamic | `display:inline-flex;align-items:center;gap:6px;padding:6px 10px;background:var(--surface2);border:1px solid var(--border);borde...` |
| 5116 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:${color};text-transform:uppercase;letter-...` |
| 5117 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:14px;color:${rankColor}` |
| 5118 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.6` |
| 5128 | dynamic | `display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px` |
| 5140 | static | `display:flex;align-items:center;justify-content:space-between` |
| 5142 | static | `display:flex;align-items:center;gap:8px` |
| 5143 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em` |
| 5145 | static | `background:var(--surface2);border:1px solid var(--border2);color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;fo...` |
| 5161 | dynamic | `display:none` |

### Total roster value (10)

| Line | Mode | Declaration |
|---|---|---|
| 6380 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:${_rankColor(rank)};padding:1px 6px;backg...` |
| 6384 | static | `display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px;padding:16px;background:var(--surface2);border:1px solid var(--border)` |
| 6385 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 6385 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);opacity:.45` |
| 6386 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:var(--white)` |
| 6387 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 6387 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);opacity:.45` |
| 6388 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:var(--white)` |
| 6389 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);opacity:.45` |
| 6390 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:var(--green)` |

### Team logo helpers — load BEFORE player-panel.js so modal-hero badge works. (7)

| Line | Mode | Declaration |
|---|---|---|
| 2101 | static | `...` |
| 2146 | static | `position:fixed;inset:0;background:var(--black);color:var(--white);display:flex;align-items:center;justify-content:center;font-f...` |
| 2147 | static | `background:var(--nav-bg);border-bottom:2px solid var(--red);position:sticky;top:0;z-index:100` |
| 2147 | static | `border:none;position:static` |
| 2150 | static | `fill-rule:evenodd;clip-rule:evenodd` |
| 2189 | static | `background:none;border:1px solid var(--border2);color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:it...` |
| 2215 | static | `display:none` |

### Close player-detail modal if open (5)

| Line | Mode | Declaration |
|---|---|---|
| 4508 | dynamic-context | `margin-top:14px;padding-top:14px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:8px;align-items:center` |
| 4510 | static | `display:inline-block;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:12px;color:var(--white);backgro...` |
| 4512 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-style:italic;text-align:center;line-height:1.5;max-width...` |
| 4526 | dynamic | `color:${diff>0?'var(--red)':diff<0?'var(--green)':'var(--white)'}` |
| 4586 | dynamic-context | `opacity:.5` |

### Trade Builder Modal — opens over the player detail modal (z-index 250) (5)

| Line | Mode | Declaration |
|---|---|---|
| 7540 | static | `z-index:250` |
| 7544 | static | `margin-right:8px` |
| 7551 | static | `z-index:260` |
| 7552 | static | `max-width:540px` |
| 7555 | static | `margin-right:8px` |

### PICKS BRANCH (4)

| Line | Mode | Declaration |
|---|---|---|
| 5752 | static | `background:var(--surface2);display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border)` |
| 5752 | static | `display:block` |
| 5754 | dynamic | `color:#9b91d4` |
| 5757 | dynamic | `color:${expoColor(p.exposure)}` |

### Group transactions by roster (4)

| Line | Mode | Declaration |
|---|---|---|
| 6858 | dynamic | `color:var(--muted);opacity:.5;font-size:10px` |
| 6868 | dynamic | `color:var(--red);font-size:10px;font-style:italic` |
| 6869 | dynamic | `color:var(--yellow)` |
| 6869 | dynamic | `color:var(--green)` |

### Sort state for the leagues list (2)

| Line | Mode | Declaration |
|---|---|---|
| 4927 | dynamic | `width:${w}%;background:${s.color}` |
| 4934 | dynamic-context | `opacity:.3` |

### Color helpers (2)

| Line | Mode | Declaration |
|---|---|---|
| 5842 | dynamic | `color:${posColor(p.position)}` |
| 5845 | dynamic | `color:${expoColor(p.exposure)}` |

### Update section meta with archetype legend + league averages (2)

| Line | Mode | Declaration |
|---|---|---|
| 7210 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 7210 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |

### Columns: expandable league list (left) + player exposure (right) (1)

| Line | Mode | Declaration |
|---|---|---|
| 2237 | static | `display:none` |

### Close modals on Escape (1)

| Line | Mode | Declaration |
|---|---|---|
| 4634 | dynamic | `color:${color};border-color:${color};background:${bg}` |
