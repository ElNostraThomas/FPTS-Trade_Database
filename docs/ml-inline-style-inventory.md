# my-leagues.html inline-style inventory

Generated from `my-leagues.html` (7586 lines).
Total `style="..."` occurrences: **325**.

This is a read-only audit. No code was changed. The goal is to make the
refactor safe to execute supervised by giving every occurrence a category,
a section assignment, and an actionability verdict.

---

## Mode breakdown

| Mode | Count | % | Refactorable to CSS class? |
|---|---|---|---|
| `dynamic` | 157 | 48.3% | Conditional - if the interpolated value is a discrete enum, use a modifier class (e.g. `.is-active`); otherwise leave inline |
| `static` | 142 | 43.7% | Yes - pure HTML attribute, drop into a class |
| `dynamic-context` | 18 | 5.5% | Conditional - inside a JS-built HTML string; refactor only if the declaration set is static |
| `js-composed` | 8 | 2.5% | No - imperatively set at runtime; leave as-is |

**Headline:** ~142 are directly refactorable, ~175 require case-by-case judgement, ~8 must stay inline (JS-set).

---

## Top 25 declaration properties

Which CSS properties carry most of the inline styling. Where one property dominates, a single utility class can collapse many sites.

| Property | Count |
|---|---|
| `color` | 163 |
| `font-size` | 126 |
| `font-family` | 117 |
| `font-weight` | 76 |
| `display` | 70 |
| `font-style` | 62 |
| `padding` | 50 |
| `background` | 48 |
| `align-items` | 48 |
| `opacity` | 41 |
| `text-transform` | 40 |
| `width` | 39 |
| `flex-shrink` | 38 |
| `letter-spacing` | 37 |
| `margin-bottom` | 36 |
| `gap` | 35 |
| `border-radius` | 32 |
| `border` | 25 |
| `height` | 20 |
| `justify-content` | 18 |
| `margin-top` | 17 |
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

---

## Occurrences per region

Sorted by count - the busiest regions are the highest-leverage refactor batches.

| Count | Region (nearest banner-comment heading above the hit) |
|---|---|
| 33 | Save current scoped IDs so the existing loadRoster / loadAllTrades can target them |
| 29 | Render the current suggestion as a single card |
| 28 | Sort rosters by chosen key |
| 23 | Helpers |
| 22 | Render an archetype chip |
| 21 | RIGHT: player exposure sidebar |
| 21 | Renders draft picks in the same visual layout as a position section so the |
| 20 | Archetype lookup for the owning team |
| 18 | Stash render context on window so the sort buttons can re-render |
| 16 | Aggregate per-roster |
| 15 | Picks this roster RECEIVED |
| 13 | Temporarily assign global IDs so existing loadRoster can find them |
| 12 | Render the current state of the suggestion pre-screener |
| 10 | Ensure roster/users/players are loaded and stashed on window for the modal layer |
| 10 | Total roster value |
| 8 | Team logo helpers — load BEFORE player-panel.js so modal-hero badge works. |
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

### Save current scoped IDs so the existing loadRoster / loadAllTrades can target them (33)

| Line | Mode | Declaration |
|---|---|---|
| 5263 | dynamic | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:2px 6px;bor...` |
| 5272 | dynamic-context | `display:inline-flex;align-items:center;gap:3px;padding:2px 6px;background:var(--surface2);border:1px solid var(--border);border...` |
| 5273 | dynamic | `color:${color};letter-spacing:.04em` |
| 5274 | dynamic | `color:${rankColor}` |
| 5279 | dynamic-context | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:9px;color:var(--white);background:var(--red);padding...` |
| 5285 | dynamic | `border:1px solid var(--border);background:var(--surface);margin-bottom:6px` |
| 5287 | static | `display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;user-select:none` |
| 5289 | static | `font-family:'Mulish',sans-serif;font-size:9px;color:var(--muted);width:14px;text-align:center;flex-shrink:0;transition:transfor...` |
| 5291 | dynamic | `width:28px;height:28px;border-radius:3px;object-fit:cover;background:var(--surface2);flex-shrink:0` |
| 5292 | dynamic | `width:28px;height:28px;border-radius:3px;background:var(--surface2);display:flex;align-items:center;justify-content:center;font...` |
| 5296 | dynamic | `font-family:'Mulish',sans-serif;font-weight:800;font-size:13px;color:var(--white);white-space:nowrap;overflow:hidden;text-overf...` |
| 5300 | static | `display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin-top:5px` |
| 5304 | static | `text-align:right;flex-shrink:0` |
| 5305 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:14px;color:var(--white)` |
| 5306 | static | `font-family:'Mulish',sans-serif;font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em` |
| 5309 | dynamic | `display:none;border-top:1px solid var(--border);background:var(--surface2);padding:10px 14px` |
| 5342 | dynamic-context | `color:var(--muted);font-size:11px;padding:8px;font-style:italic` |
| 5346 | dynamic-context | `color:var(--muted);font-size:11px;padding:8px;font-style:italic` |
| 5432 | static | `margin-bottom:10px` |
| 5433 | static | `display:flex;align-items:center;justify-content:space-between;padding:6px 4px;border-bottom:1px solid var(--border2);margin-bot...` |
| 5434 | dynamic | `color:var(--muted);font-weight:700;margin-left:4px` |
| 5435 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-weight:700` |
| 5445 | static | `margin-bottom:10px` |
| 5446 | static | `display:flex;align-items:center;padding:6px 4px;border-bottom:1px solid var(--border2);margin-bottom:2px` |
| 5447 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--muted);text-transform:uppercase;let...` |
| 5447 | dynamic | `margin-left:4px` |
| 5458 | static | `margin-bottom:10px` |
| 5459 | static | `display:flex;align-items:center;justify-content:space-between;padding:6px 4px;border-bottom:1px solid var(--border2);margin-bot...` |
| 5460 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--pos-pick-bg,#9b91d4);text-transform...` |
| 5460 | dynamic | `color:var(--muted);font-weight:700;margin-left:4px` |
| 5461 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-weight:700` |
| 5469 | dynamic-context | `color:var(--muted);font-size:11px;padding:8px;font-style:italic` |
| 5471 | dynamic | `font-family:'Mulish',sans-serif` |

### Render the current suggestion as a single card (29)

| Line | Mode | Declaration |
|---|---|---|
| 4015 | static | `display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)` |
| 4016 | dynamic | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:800;text-transform:uppercase;padding:2px 5px;border-radius:2px;${posS...` |
| 4017 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;font-weight:700;color:var(--white);flex:1;min-width:0;overflow:hidden;text-overf...` |
| 4018 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);flex-shrink:0` |
| 4025 | static | `display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)` |
| 4026 | dynamic | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:800;text-transform:uppercase;padding:2px 5px;border-radius:2px;backgr...` |
| 4027 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;font-weight:700;color:var(--white);flex:1;min-width:0;overflow:hidden;text-overf...` |
| 4028 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);flex-shrink:0` |
| 4039 | static | `padding:14px 18px` |
| 4040 | static | `display:flex;align-items:center;justify-content:space-between;margin-bottom:10px` |
| 4042 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted)` |
| 4045 | static | `border:1px solid var(--border2);background:var(--surface2);padding:12px 14px;margin-bottom:14px` |
| 4046 | static | `margin-bottom:8px` |
| 4047 | static | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;color:var(--muted);letter-spacing:.06em;...` |
| 4049 | static | `display:flex;justify-content:space-between;padding-top:6px;font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted)` |
| 4050 | dynamic | `color:var(--white);font-weight:700` |
| 4053 | static | `border-top:1px solid var(--border);padding-top:8px;margin-top:6px` |
| 4054 | static | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;color:var(--muted);letter-spacing:.06em;...` |
| 4056 | static | `display:flex;justify-content:space-between;padding-top:6px;font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted)` |
| 4057 | dynamic | `color:var(--white);font-weight:700` |
| 4060 | dynamic | `margin-top:10px;padding-top:8px;border-top:1px solid var(--border);font-family:'Mulish',sans-serif;font-size:11px;color:${balan...` |
| 4063 | static | `display:flex;gap:10px;margin-bottom:10px` |
| 4065 | static | `flex:1;background:transparent;border:2px solid var(--red);color:var(--red);font-family:'Kanit',sans-serif;font-weight:800;font-...` |
| 4069 | static | `flex:1;background:var(--green);border:2px solid var(--green);color:var(--black);font-family:'Kanit',sans-serif;font-weight:800;...` |
| 4073 | static | `text-align:center;font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-style:italic` |
| 4083 | static | `padding:24px 20px;text-align:center` |
| 4084 | dynamic | `font-family:'Mulish',sans-serif;font-size:13px;color:var(--white);margin-bottom:6px;line-height:1.5` |
| 4085 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);margin-bottom:18px;line-height:1.5` |
| 4087 | static | `background:var(--red);border:none;color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size...` |

### Sort rosters by chosen key (28)

| Line | Mode | Declaration |
|---|---|---|
| 7283 | js-composed | `width:26px;height:26px;border-radius:50%;object-fit:cover;margin-right:8px;flex-shrink:0;` |
| 7284 | dynamic-context | `width:26px;height:26px;border-radius:50%;background:var(--border2);margin-right:8px;flex-shrink:0;` |
| 7289 | dynamic | `height:100%;width:${w}%;background:${posColors[pos]};flex-shrink:0;` |
| 7292 | dynamic | `${rowBg}` |
| 7293 | dynamic | `color:var(--muted);opacity:.3;width:28px` |
| 7297 | dynamic | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;${r.isMe?'color:var(--red)':''}` |
| 7298 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:9px;color:var(--red);border:1px solid var(--red);pad...` |
| 7300 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:9px;color:${posColors[r.topScoringPos]};border:1px s...` |
| 7302 | static | `height:4px;background:var(--border);margin-top:5px;border-radius:2px;overflow:hidden;display:flex` |
| 7306 | dynamic | `color:var(--white)` |
| 7308 | dynamic | `color:${posColors.QB}` |
| 7309 | dynamic | `color:${posColors.RB}` |
| 7310 | dynamic | `color:${posColors.WR}` |
| 7311 | dynamic | `color:${posColors.TE}` |
| 7312 | dynamic | `color:var(--green)` |
| 7313 | dynamic | `color:var(--white);opacity:.5` |
| 7314 | dynamic | `color:${r.mpxPct >= 90 ? 'var(--green)' : r.mpxPct >= 75 ? 'var(--white)' : r.mpxPct ? 'var(--red)' : 'var(--muted)'}` |
| 7320 | static | `overflow-x:auto;-webkit-overflow-scrolling:touch` |
| 7321 | static | `width:100%;border-collapse:collapse;min-width:560px` |
| 7323 | static | `width:28px` |
| 7327 | dynamic | `color:${posColors.QB}` |
| 7328 | dynamic | `color:${posColors.RB}` |
| 7329 | dynamic | `color:${posColors.WR}` |
| 7330 | dynamic | `color:${posColors.TE}` |
| 7383 | dynamic | `margin-top:20px` |
| 7389 | dynamic | `border-left-color:var(--red)` |
| 7391 | dynamic | `color:var(--white);opacity:.7` |
| 7392 | dynamic | `${isMyPick?'color:var(--red)':''}` |

### Helpers (23)

| Line | Mode | Declaration |
|---|---|---|
| 6236 | dynamic | `color:var(--green);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 6237 | dynamic | `color:var(--red);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 6238 | dynamic-context | `opacity:.3` |
| 6243 | dynamic | `width:36px;padding-right:8px` |
| 6247 | dynamic | `font-family:'Mulish',sans-serif;font-weight:900;font-size:14px;color:var(--white)` |
| 6248 | dynamic | `display:inline-flex;align-items:center` |
| 6252 | dynamic | `color:var(--white)` |
| 6253 | dynamic | `color:var(--white);font-size:12px` |
| 6254 | dynamic | `color:${valColor(r.value)}` |
| 6255 | dynamic | `color:var(--white);font-size:12px` |
| 6256 | dynamic | `color:${r.seasonProj ? 'var(--white)' : 'var(--muted)'};opacity:${r.seasonProj ? '1' : '.3'}` |
| 6257 | dynamic | `color:${r.proj ? (r.proj >= 20 ? 'var(--green)' : r.proj >= 12 ? 'var(--white)' : 'var(--muted)') : 'var(--muted)'};opacity:${r...` |
| 6260 | dynamic | `color:var(--white)` |
| 6271 | static | `margin-bottom:28px` |
| 6272 | static | `display:flex;align-items:center;justify-content:space-between;margin-bottom:10px` |
| 6273 | static | `display:flex;align-items:center;gap:10px` |
| 6274 | dynamic | `width:4px;height:20px;background:${posColors[pos]};flex-shrink:0` |
| 6275 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:14px;color:var(--white);text-transform:uppercase` |
| 6276 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);opacity:.4` |
| 6278 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:${posColors[pos]}` |
| 6280 | static | `overflow-x:auto;-webkit-overflow-scrolling:touch` |
| 6281 | static | `width:100%;border-collapse:collapse;min-width:430px` |
| 6283 | static | `width:36px` |

### Render an archetype chip (22)

| Line | Mode | Declaration |
|---|---|---|
| 2948 | dynamic | `display:inline-flex;align-items:center;justify-content:center;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;...` |
| 2951 | dynamic | `display:inline-flex;align-items:center;justify-content:center;background:${c};color:var(--black);font-family:'Kanit',sans-serif...` |
| 2955 | dynamic-context | `width:32px;height:32px;flex-shrink:0;display:inline-block;` |
| 2956 | js-composed | `width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0;` |
| 2961 | dynamic-context | `width:32px;height:32px;border-radius:50%;background:var(--surface2);display:inline-flex;align-items:center;justify-content:cent...` |
| 2962 | static | `display:block` |
| 3046 | static | `display:flex;align-items:center;gap:8px;margin-bottom:6px` |
| 3048 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5` |
| 3050 | static | `display:flex;align-items:center;gap:10px;min-height:24px` |
| 3051 | static | `display:none;margin-top:8px` |
| 3053 | static | `background:none;border:none;color:var(--muted);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;...` |
| 3057 | static | `font-size:8px;transition:transform .15s` |
| 3059 | static | `display:none;margin-top:8px;padding-top:8px;border-top:1px solid var(--border)` |
| 3093 | static | `display:flex;align-items:center;gap:10px;width:100%;padding:8px 12px;background:rgba(237,129,12,0.06);border:1px dashed var(--b...` |
| 3094 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted);font-style:italic;flex:1;min-width:0` |
| 3096 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3111 | static | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;color:var(--white);text-decoration:none;flex:1;min-width:0;overf...` |
| 3115 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;flex-shrink:0` |
| 3117 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3127 | static | `display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border)` |
| 3129 | static | `font-family:'Mulish',sans-serif;font-weight:700;font-size:12px;color:var(--white);text-decoration:none;flex:1;min-width:0;overf...` |
| 3133 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;flex-shrink:0` |

### RIGHT: player exposure sidebar (21)

| Line | Mode | Declaration |
|---|---|---|
| 2279 | static | `display:flex;align-items:center;gap:8px` |
| 2280 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);width:12px;text-align:center;flex-shrink:0;transition:transfo...` |
| 2286 | static | `display:none` |
| 2304 | static | `width:24px;flex-shrink:0` |
| 2305 | static | `flex:1` |
| 2320 | static | `fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;` |
| 2320 | static | `fill:#c33;` |
| 2320 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2320 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2320 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2320 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2320 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2320 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2320 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2320 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2320 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2320 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2320 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2320 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2320 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2322 | dynamic-context | `flex-shrink:0;vertical-align:middle;margin-right:4px` |

### Renders draft picks in the same visual layout as a position section so the (21)

| Line | Mode | Declaration |
|---|---|---|
| 6319 | static | `margin-bottom:28px` |
| 6320 | static | `display:flex;align-items:center;gap:10px;margin-bottom:10px` |
| 6321 | static | `width:4px;height:20px;background:var(--pos-pick-bg);flex-shrink:0` |
| 6322 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:14px;color:var(--white);text-transform:uppercase` |
| 6324 | static | `font-size:13px;opacity:.4;padding:12px 0;font-family:'Mulish',sans-serif` |
| 6345 | dynamic-context | `border-bottom:1px solid var(--border)` |
| 6346 | dynamic | `width:36px;padding-right:8px` |
| 6349 | dynamic | `font-family:'Mulish',sans-serif;font-weight:900;font-size:14px;color:var(--white)` |
| 6350 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5` |
| 6354 | dynamic | `color:${val > 3000 ? 'var(--green)' : val > 1000 ? 'var(--white)' : 'var(--muted)'}` |
| 6355 | dynamic | `color:var(--muted);opacity:.4;font-size:11px` |
| 6361 | static | `margin-bottom:28px` |
| 6362 | static | `display:flex;align-items:center;justify-content:space-between;margin-bottom:10px` |
| 6363 | static | `display:flex;align-items:center;gap:10px` |
| 6364 | static | `width:4px;height:20px;background:var(--pos-pick-bg);flex-shrink:0` |
| 6365 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:14px;color:var(--white);text-transform:uppercase` |
| 6366 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);opacity:.4` |
| 6368 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:var(--pos-pick-bg)` |
| 6370 | static | `overflow-x:auto` |
| 6371 | static | `width:100%;border-collapse:collapse;min-width:520px` |
| 6373 | static | `width:36px` |

### Archetype lookup for the owning team (20)

| Line | Mode | Declaration |
|---|---|---|
| 3386 | js-composed | `width:24px;height:24px;border-radius:3px;flex-shrink:0;background:var(--surface2)` |
| 3387 | dynamic-context | `width:24px;height:24px;border-radius:3px;flex-shrink:0;background:var(--surface2);display:inline-block` |
| 3401 | dynamic-context | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--green);text-transform:uppercase;let...` |
| 3407 | dynamic | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:1px 5px;bor...` |
| 3409 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--white);opacity:.85` |
| 3413 | static | `background:var(--red);border:none;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--w...` |
| 3422 | dynamic-context | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:#5b9bd5;text-transform:uppercase;letter-s...` |
| 3424 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3431 | dynamic | `display:flex;align-items:center;gap:10px;padding:8px 10px;border-bottom:1px solid var(--border);cursor:${rowCursor};border-radi...` |
| 3434 | dynamic | `font-family:'Mulish',sans-serif;font-weight:800;font-size:12px;color:var(--white);white-space:nowrap;overflow:hidden;text-overf...` |
| 3435 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.6;white-space:nowrap;overflow:hidden;text-overflow:e...` |
| 3437 | static | `display:flex;align-items:center;gap:8px;flex-shrink:0` |
| 3446 | dynamic | `margin-top:8px;font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;font-style:italic` |
| 3455 | static | `padding:0 18px;border-top:1px solid var(--border);background:var(--surface)` |
| 3457 | static | `display:flex;align-items:center;justify-content:space-between;padding:14px 0;cursor:pointer;user-select:none;gap:10px` |
| 3459 | static | `display:flex;align-items:center;gap:10px;flex:1;min-width:0` |
| 3460 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);width:14px;text-align:center;flex-shrink:0;transition:transfo...` |
| 3462 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.7` |
| 3464 | static | `display:flex;align-items:center;gap:6px;cursor:pointer;font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);user-s...` |
| 3470 | dynamic | `${contentDisplay};padding-bottom:14px` |

### Stash render context on window so the sort buttons can re-render (18)

| Line | Mode | Declaration |
|---|---|---|
| 7190 | static | `margin-bottom:24px` |
| 7191 | static | `display:flex;align-items:center;justify-content:space-between;margin-bottom:12px` |
| 7192 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;lette...` |
| 7193 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted)` |
| 7193 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;color:${+myTeam.mpxPct>=90?'var(--green)':+myTeam.mpxPct>=75?'...` |
| 7193 | dynamic | `opacity:.5` |
| 7195 | static | `display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px` |
| 7206 | dynamic | `background:var(--surface2);border:1px solid var(--border);padding:12px 14px;border-left:3px solid ${posColors[pos]}` |
| 7207 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:${posColors[pos]};text-transform:uppercas...` |
| 7208 | static | `display:flex;gap:12px;align-items:flex-end` |
| 7210 | static | `font-family:'Mulish',sans-serif;font-size:9px;color:var(--muted);opacity:.4;text-transform:uppercase;letter-spacing:.06em` |
| 7211 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:${color}` |
| 7212 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--muted);opacity:.6` |
| 7214 | dynamic | `border-left:1px solid var(--border2);padding-left:12px` |
| 7215 | static | `font-family:'Mulish',sans-serif;font-size:9px;color:var(--muted);opacity:.4;text-transform:uppercase;letter-spacing:.06em` |
| 7216 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:${scoreColor}` |
| 7217 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--muted);opacity:.6` |
| 7220 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.35;margin-top:4px` |

### Aggregate per-roster (16)

| Line | Mode | Declaration |
|---|---|---|
| 6670 | static | `width:30px` |
| 6690 | dynamic | `color:var(--red);font-size:10px;font-style:italic` |
| 6695 | dynamic | `color:var(--yellow)` |
| 6696 | dynamic | `width:${maxSpent ? (r.spent/maxSpent*100).toFixed(0) : 0}%` |
| 6697 | dynamic | `color:var(--green)` |
| 6698 | dynamic | `width:${budget ? (r.left/budget*100).toFixed(0) : 0}%` |
| 6700 | dynamic | `text-align:right;color:var(--muted)` |
| 6702 | dynamic | `text-align:right;color:var(--yellow)` |
| 6740 | static | `width:30px` |
| 6766 | dynamic | `color:var(--muted);opacity:.5;font-size:10px` |
| 6775 | dynamic | `font-size:12px` |
| 6775 | dynamic | `color:var(--red);font-style:italic` |
| 6819 | dynamic | `color:var(--muted);opacity:.5;font-size:10px` |
| 6823 | dynamic | `color:var(--muted);opacity:.4;font-size:10px` |
| 6826 | dynamic | `background:rgba(237,129,12,0.05)` |
| 6830 | dynamic | `opacity:.4` |

### Picks this roster RECEIVED (15)

| Line | Mode | Declaration |
|---|---|---|
| 7010 | static | `display:flex;justify-content:space-between;align-items:center;margin-bottom:8px` |
| 7011 | dynamic | `margin-bottom:0` |
| 7017 | dynamic | `${s.isMe ? 'color:var(--red)' : ''}` |
| 7020 | static | `width:28px;height:28px;flex-shrink:0;display:inline-flex;align-items:center;` |
| 7022 | js-composed | `width:28px;height:28px;border-radius:50%;object-fit:cover;` |
| 7026 | static | `min-width:0;flex:1` |
| 7027 | static | `display:flex;align-items:center;gap:4px;flex-wrap:wrap` |
| 7031 | dynamic | `display:flex;gap:8px;margin-top:2px` |
| 7032 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--muted);opacity:.6` |
| 7040 | static | `min-width:0;flex:1` |
| 7042 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.35;margin-left:4px` |
| 7043 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--pos-pick-bg);margin-top:2px` |
| 7047 | dynamic | `margin-top:4px` |
| 7048 | static | `width:28px;flex-shrink:0;` |
| 7049 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:12px;color:var(--green)` |

### Temporarily assign global IDs so existing loadRoster can find them (13)

| Line | Mode | Declaration |
|---|---|---|
| 5582 | static | `display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--surface);border:1px solid var(--border);margin-bott...` |
| 5583 | static | `display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;flex-shrink:0;background:var(--surface2);b...` |
| 5583 | static | `display:block` |
| 5584 | static | `flex:1` |
| 5585 | dynamic | `font-family:'Mulish',sans-serif;font-weight:900;font-size:14px;color:var(--white)` |
| 5586 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);margin-top:3px` |
| 5589 | static | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px` |
| 5593 | js-composed | `display:flex;align-items:center;gap:12px;padding:11px 12px;background:var(--surface);border:1px solid var(--border);margin-bott...` |
| 5594 | js-composed | `width:30px;height:30px;border-radius:2px;flex-shrink:0` |
| 5594 | js-composed | `width:30px;height:30px;background:var(--surface2);border-radius:2px;flex-shrink:0` |
| 5596 | dynamic | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;color:var(--white);white-space:nowrap;overflow:hidden;text-overf...` |
| 5597 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.7;margin-top:1px` |
| 5599 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;lette...` |

### Render the current state of the suggestion pre-screener (12)

| Line | Mode | Declaration |
|---|---|---|
| 3937 | dynamic | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:2px 6px;bor...` |
| 3940 | static | `padding:14px 20px;border-bottom:1px solid var(--border);background:var(--surface2)` |
| 3941 | static | `display:flex;align-items:center;gap:12px` |
| 3942 | js-composed | `width:48px;height:48px;border-radius:3px;object-fit:cover;background:var(--surface)` |
| 3944 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:18px;color:var(--white);text-transform:uppercase;lin...` |
| 3945 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);margin-top:2px` |
| 3946 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--white);opacity:.8;margin-top:2px` |
| 3959 | static | `padding:20px` |
| 3960 | static | `font-family:'Mulish',sans-serif;font-size:13px;color:var(--white);margin-bottom:8px` |
| 3961 | static | `font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted);margin-bottom:16px` |
| 3963 | static | `display:inline-block;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--white);backgro...` |
| 3969 | dynamic-context | `padding:24px;text-align:center;color:var(--muted);font-size:13px` |

### Ensure roster/users/players are loaded and stashed on window for the modal layer (10)

| Line | Mode | Declaration |
|---|---|---|
| 5138 | dynamic | `display:inline-flex;align-items:center;gap:6px;padding:6px 10px;background:var(--surface2);border:1px solid var(--border);borde...` |
| 5139 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:${color};text-transform:uppercase;letter-...` |
| 5140 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:14px;color:${rankColor}` |
| 5141 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.6` |
| 5151 | dynamic | `display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px` |
| 5163 | static | `display:flex;align-items:center;justify-content:space-between` |
| 5165 | static | `display:flex;align-items:center;gap:8px` |
| 5166 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em` |
| 5168 | static | `background:var(--surface2);border:1px solid var(--border2);color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;fo...` |
| 5184 | dynamic | `display:none` |

### Total roster value (10)

| Line | Mode | Declaration |
|---|---|---|
| 6403 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:${_rankColor(rank)};padding:1px 6px;backg...` |
| 6407 | static | `display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px;padding:16px;background:var(--surface2);border:1px solid var(--border)` |
| 6408 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 6408 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);opacity:.45` |
| 6409 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:var(--white)` |
| 6410 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 6410 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);opacity:.45` |
| 6411 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:var(--white)` |
| 6412 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);opacity:.45` |
| 6413 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:var(--green)` |

### Team logo helpers — load BEFORE player-panel.js so modal-hero badge works. (8)

| Line | Mode | Declaration |
|---|---|---|
| 2101 | static | `...` |
| 2144 | static | `...` |
| 2169 | static | `position:fixed;inset:0;background:var(--black);color:var(--white);display:flex;align-items:center;justify-content:center;font-f...` |
| 2170 | static | `background:var(--nav-bg);border-bottom:2px solid var(--red);position:sticky;top:0;z-index:100` |
| 2170 | static | `border:none;position:static` |
| 2173 | static | `fill-rule:evenodd;clip-rule:evenodd` |
| 2212 | static | `background:none;border:1px solid var(--border2);color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:it...` |
| 2238 | static | `display:none` |

### Close player-detail modal if open (5)

| Line | Mode | Declaration |
|---|---|---|
| 4531 | dynamic-context | `margin-top:14px;padding-top:14px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:8px;align-items:center` |
| 4533 | static | `display:inline-block;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:12px;color:var(--white);backgro...` |
| 4535 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-style:italic;text-align:center;line-height:1.5;max-width...` |
| 4549 | dynamic | `color:${diff>0?'var(--red)':diff<0?'var(--green)':'var(--white)'}` |
| 4609 | dynamic-context | `opacity:.5` |

### Trade Builder Modal — opens over the player detail modal (z-index 250) (5)

| Line | Mode | Declaration |
|---|---|---|
| 7563 | static | `z-index:250` |
| 7567 | static | `margin-right:8px` |
| 7574 | static | `z-index:260` |
| 7575 | static | `max-width:540px` |
| 7578 | static | `margin-right:8px` |

### PICKS BRANCH (4)

| Line | Mode | Declaration |
|---|---|---|
| 5775 | static | `background:var(--surface2);display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border)` |
| 5775 | static | `display:block` |
| 5777 | dynamic | `color:#9b91d4` |
| 5780 | dynamic | `color:${expoColor(p.exposure)}` |

### Group transactions by roster (4)

| Line | Mode | Declaration |
|---|---|---|
| 6881 | dynamic | `color:var(--muted);opacity:.5;font-size:10px` |
| 6891 | dynamic | `color:var(--red);font-size:10px;font-style:italic` |
| 6892 | dynamic | `color:var(--yellow)` |
| 6892 | dynamic | `color:var(--green)` |

### Sort state for the leagues list (2)

| Line | Mode | Declaration |
|---|---|---|
| 4950 | dynamic | `width:${w}%;background:${s.color}` |
| 4957 | dynamic-context | `opacity:.3` |

### Color helpers (2)

| Line | Mode | Declaration |
|---|---|---|
| 5865 | dynamic | `color:${posColor(p.position)}` |
| 5868 | dynamic | `color:${expoColor(p.exposure)}` |

### Update section meta with archetype legend + league averages (2)

| Line | Mode | Declaration |
|---|---|---|
| 7233 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 7233 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |

### Columns: expandable league list (left) + player exposure (right) (1)

| Line | Mode | Declaration |
|---|---|---|
| 2260 | static | `display:none` |

### Close modals on Escape (1)

| Line | Mode | Declaration |
|---|---|---|
| 4657 | dynamic | `color:${color};border-color:${color};background:${bg}` |
