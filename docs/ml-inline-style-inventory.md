# my-leagues.html inline-style inventory

Generated from `my-leagues.html` (7521 lines).
Total `style="..."` occurrences: **374**.

This is a read-only audit. No code was changed. The goal is to make the
refactor safe to execute supervised by giving every occurrence a category,
a section assignment, and an actionability verdict.

---

## Mode breakdown

| Mode | Count | % | Refactorable to CSS class? |
|---|---|---|---|
| `dynamic` | 195 | 52.1% | Conditional - if the interpolated value is a discrete enum, use a modifier class (e.g. `.is-active`); otherwise leave inline |
| `static` | 152 | 40.6% | Yes - pure HTML attribute, drop into a class |
| `dynamic-context` | 18 | 4.8% | Conditional - inside a JS-built HTML string; refactor only if the declaration set is static |
| `js-composed` | 9 | 2.4% | No - imperatively set at runtime; leave as-is |

**Headline:** ~152 are directly refactorable, ~213 require case-by-case judgement, ~9 must stay inline (JS-set).

---

## Top 25 declaration properties

Which CSS properties carry most of the inline styling. Where one property dominates, a single utility class can collapse many sites.

| Property | Count |
|---|---|
| `color` | 151 |
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
| `flex-shrink` | 38 |
| `margin-bottom` | 36 |
| `width` | 34 |
| `border-radius` | 32 |
| `border` | 25 |
| `height` | 20 |
| `${nums}color` | 20 |
| `justify-content` | 18 |
| `margin-top` | 17 |
| `cursor` | 16 |
| `text-align` | 16 |
| `flex` | 16 |

---

## Most-repeated declaration sets (>= 2 occurrences)

Each row below is a strong refactor candidate: same declaration set appearing N times -> create one class once, replace N sites.

| Count | Normalized declaration set |
|---|---|
| 18 | `${thS}` |
| 13 | `fill-rule:nonzero; fill:var(--black)` |
| 6 | `flex:1; min-width:0` |
| 6 | `text-align:right` |
| 4 | `display:none` |
| 4 | `cursor:pointer` |
| 4 | `color:var(--red); font-family:'Kanit',sans-serif; font-size:11px; font-style:italic; font-weight:800; letter-spacing:.06em; text-transform:uppercase` |
| 4 | `align-items:center; display:flex; flex-wrap:wrap; gap:6px` |
| 4 | `color:var(--muted); font-family:'Mulish',sans-serif; font-size:10px; opacity:.4` |
| 3 | `display:block` |
| 3 | `align-items:center; display:flex; justify-content:space-between; margin-bottom:10px` |
| 3 | `color:var(--muted); font-size:11px; font-style:italic; padding:8px` |
| 3 | `margin-bottom:10px` |
| 3 | `color:var(--white); font-family:'Mulish',sans-serif; font-size:14px; font-weight:900` |
| 3 | `${tdS}` |
| 3 | `${numS}color:var(--white)` |
| 3 | `margin-bottom:28px` |
| 3 | `color:var(--white); font-family:'Kanit',sans-serif; font-size:14px; font-style:italic; font-weight:800; text-transform:uppercase` |
| 3 | `color:var(--muted); font-family:'Mulish',sans-serif; font-size:10px; letter-spacing:.07em; opacity:.45; text-transform:uppercase` |
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
| 2 | `${tdS}width:36px; padding-right:8px` |
| 2 | `${numS}color:var(--white); font-size:12px` |
| 2 | `align-items:center; display:flex; gap:10px` |

---

## Occurrences per region

Sorted by count - the busiest regions are the highest-leverage refactor batches.

| Count | Region (nearest banner-comment heading above the hit) |
|---|---|
| 37 | Sort rosters by chosen key |
| 36 | Save current scoped IDs so the existing loadRoster / loadAllTrades can target them |
| 35 | Helpers |
| 30 | Render the current suggestion as a single card |
| 28 | Renders draft picks in the same visual layout as a position section so the |
| 24 | Aggregate per-roster |
| 23 | Render an archetype chip |
| 23 | Archetype lookup for the owning team |
| 22 | RIGHT: player exposure sidebar |
| 19 | Picks this roster RECEIVED |
| 18 | Stash render context on window so the sort buttons can re-render |
| 14 | Temporarily assign global IDs so existing loadRoster can find them |
| 13 | Render the current state of the suggestion pre-screener |
| 10 | Ensure roster/users/players are loaded and stashed on window for the modal layer |
| 10 | Total roster value |
| 6 | Team logo helpers — load BEFORE player-panel.js so modal-hero badge works. |
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

### Sort rosters by chosen key (37)

| Line | Mode | Declaration |
|---|---|---|
| 7218 | js-composed | `width:26px;height:26px;border-radius:50%;object-fit:cover;margin-right:8px;flex-shrink:0;` |
| 7219 | dynamic-context | `width:26px;height:26px;border-radius:50%;background:var(--border2);margin-right:8px;flex-shrink:0;` |
| 7224 | dynamic | `height:100%;width:${w}%;background:${posColors[pos]};flex-shrink:0;` |
| 7227 | dynamic | `${rowBg}` |
| 7228 | dynamic | `${numS}color:var(--muted);opacity:.3;width:28px` |
| 7229 | dynamic | `${tdS}` |
| 7230 | static | `display:flex;align-items:center;gap:6px;flex-wrap:wrap` |
| 7232 | dynamic | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;${r.isMe?'color:var(--red)':''}` |
| 7233 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:9px;color:var(--red);border:1px solid var(--red);pad...` |
| 7235 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:9px;color:${posColors[r.topScoringPos]};border:1px s...` |
| 7237 | static | `height:4px;background:var(--border);margin-top:5px;border-radius:2px;overflow:hidden;display:flex` |
| 7241 | dynamic | `${numS}color:var(--white)` |
| 7242 | dynamic | `${numS}color:var(--muted);opacity:.5` |
| 7243 | dynamic | `${numS}color:${posColors.QB}` |
| 7244 | dynamic | `${numS}color:${posColors.RB}` |
| 7245 | dynamic | `${numS}color:${posColors.WR}` |
| 7246 | dynamic | `${numS}color:${posColors.TE}` |
| 7247 | dynamic | `${numS}color:var(--green)` |
| 7248 | dynamic | `${numS}color:var(--white);opacity:.5` |
| 7249 | dynamic | `${numS}color:${r.mpxPct >= 90 ? 'var(--green)' : r.mpxPct >= 75 ? 'var(--white)' : r.mpxPct ? 'var(--red)' : 'var(--muted)'}` |
| 7255 | static | `overflow-x:auto;-webkit-overflow-scrolling:touch` |
| 7256 | static | `width:100%;border-collapse:collapse;min-width:560px` |
| 7258 | dynamic | `${thS}width:28px` |
| 7259 | dynamic | `${thS}` |
| 7260 | dynamic | `${thS}` |
| 7261 | dynamic | `${thS}` |
| 7262 | dynamic | `${thS}color:${posColors.QB}` |
| 7263 | dynamic | `${thS}color:${posColors.RB}` |
| 7264 | dynamic | `${thS}color:${posColors.WR}` |
| 7265 | dynamic | `${thS}color:${posColors.TE}` |
| 7266 | dynamic | `${thS}` |
| 7267 | dynamic | `${thS}` |
| 7268 | dynamic | `${thS}` |
| 7318 | dynamic | `margin-top:20px` |
| 7324 | dynamic | `border-left-color:var(--red)` |
| 7326 | dynamic | `color:var(--white);opacity:.7` |
| 7327 | dynamic | `${isMyPick?'color:var(--red)':''}` |

### Save current scoped IDs so the existing loadRoster / loadAllTrades can target them (36)

| Line | Mode | Declaration |
|---|---|---|
| 5192 | dynamic | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:2px 6px;bor...` |
| 5201 | dynamic-context | `display:inline-flex;align-items:center;gap:3px;padding:2px 6px;background:var(--surface2);border:1px solid var(--border);border...` |
| 5202 | dynamic | `color:${color};letter-spacing:.04em` |
| 5203 | dynamic | `color:${rankColor}` |
| 5208 | dynamic-context | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:9px;color:var(--white);background:var(--red);padding...` |
| 5214 | dynamic | `border:1px solid var(--border);background:var(--surface);margin-bottom:6px` |
| 5216 | static | `display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;user-select:none` |
| 5218 | static | `font-family:'Mulish',sans-serif;font-size:9px;color:var(--muted);width:14px;text-align:center;flex-shrink:0;transition:transfor...` |
| 5220 | dynamic | `width:28px;height:28px;border-radius:3px;object-fit:cover;background:var(--surface2);flex-shrink:0` |
| 5221 | dynamic | `width:28px;height:28px;border-radius:3px;background:var(--surface2);display:flex;align-items:center;justify-content:center;font...` |
| 5223 | static | `flex:1;min-width:0` |
| 5224 | static | `display:flex;align-items:center;gap:6px;flex-wrap:wrap` |
| 5225 | dynamic | `font-family:'Mulish',sans-serif;font-weight:800;font-size:13px;color:var(--white);white-space:nowrap;overflow:hidden;text-overf...` |
| 5229 | static | `display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin-top:5px` |
| 5233 | static | `text-align:right;flex-shrink:0` |
| 5234 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:14px;color:var(--white)` |
| 5235 | static | `font-family:'Mulish',sans-serif;font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em` |
| 5238 | dynamic | `display:none;border-top:1px solid var(--border);background:var(--surface2);padding:10px 14px` |
| 5271 | dynamic-context | `color:var(--muted);font-size:11px;padding:8px;font-style:italic` |
| 5275 | dynamic-context | `color:var(--muted);font-size:11px;padding:8px;font-style:italic` |
| 5361 | static | `margin-bottom:10px` |
| 5362 | static | `display:flex;align-items:center;justify-content:space-between;padding:6px 4px;border-bottom:1px solid var(--border2);margin-bot...` |
| 5363 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;lette...` |
| 5363 | dynamic | `color:var(--muted);font-weight:700;margin-left:4px` |
| 5364 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-weight:700` |
| 5374 | static | `margin-bottom:10px` |
| 5375 | static | `display:flex;align-items:center;padding:6px 4px;border-bottom:1px solid var(--border2);margin-bottom:2px` |
| 5376 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--muted);text-transform:uppercase;let...` |
| 5376 | dynamic | `margin-left:4px` |
| 5387 | static | `margin-bottom:10px` |
| 5388 | static | `display:flex;align-items:center;justify-content:space-between;padding:6px 4px;border-bottom:1px solid var(--border2);margin-bot...` |
| 5389 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--pos-pick-bg,#9b91d4);text-transform...` |
| 5389 | dynamic | `color:var(--muted);font-weight:700;margin-left:4px` |
| 5390 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-weight:700` |
| 5398 | dynamic-context | `color:var(--muted);font-size:11px;padding:8px;font-style:italic` |
| 5400 | dynamic | `font-family:'Mulish',sans-serif` |

### Helpers (35)

| Line | Mode | Declaration |
|---|---|---|
| 6168 | dynamic | `color:var(--green);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 6169 | dynamic | `color:var(--red);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 6170 | dynamic-context | `opacity:.3` |
| 6174 | js-composed | `cursor:pointer` |
| 6175 | dynamic | `${tdS}width:36px;padding-right:8px` |
| 6176 | dynamic | `${tdS}` |
| 6177 | static | `display:flex;align-items:center;gap:6px;flex-wrap:wrap` |
| 6179 | dynamic | `font-family:'Mulish',sans-serif;font-weight:900;font-size:14px;color:var(--white)` |
| 6180 | dynamic | `display:inline-flex;align-items:center` |
| 6180 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.4` |
| 6184 | dynamic | `${numS}color:var(--white)` |
| 6185 | dynamic | `${numS}color:var(--white);font-size:12px` |
| 6186 | dynamic | `${numS}color:${valColor(r.value)}` |
| 6187 | dynamic | `${numS}color:var(--white);font-size:12px` |
| 6188 | dynamic | `${numS}color:${r.seasonProj ? 'var(--white)' : 'var(--muted)'};opacity:${r.seasonProj ? '1' : '.3'}` |
| 6189 | dynamic | `${numS}color:${r.proj ? (r.proj >= 20 ? 'var(--green)' : r.proj >= 12 ? 'var(--white)' : 'var(--muted)') : 'var(--muted)'};opac...` |
| 6192 | dynamic | `${numS}color:var(--white)` |
| 6203 | static | `margin-bottom:28px` |
| 6204 | static | `display:flex;align-items:center;justify-content:space-between;margin-bottom:10px` |
| 6205 | static | `display:flex;align-items:center;gap:10px` |
| 6206 | dynamic | `width:4px;height:20px;background:${posColors[pos]};flex-shrink:0` |
| 6207 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:14px;color:var(--white);text-transform:uppercase` |
| 6208 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);opacity:.4` |
| 6210 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:${posColors[pos]}` |
| 6212 | static | `overflow-x:auto;-webkit-overflow-scrolling:touch` |
| 6213 | static | `width:100%;border-collapse:collapse;min-width:430px` |
| 6215 | dynamic | `${thS}width:36px` |
| 6216 | dynamic | `${thS}` |
| 6217 | dynamic | `${thS}` |
| 6218 | dynamic | `${thS}` |
| 6219 | dynamic | `${thS}` |
| 6220 | dynamic | `${thS}` |
| 6221 | dynamic | `${thS}` |
| 6222 | dynamic | `${thS}` |
| 6223 | dynamic | `${thS}` |

### Render the current suggestion as a single card (30)

| Line | Mode | Declaration |
|---|---|---|
| 3944 | static | `display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)` |
| 3945 | dynamic | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:800;text-transform:uppercase;padding:2px 5px;border-radius:2px;${posS...` |
| 3946 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;font-weight:700;color:var(--white);flex:1;min-width:0;overflow:hidden;text-overf...` |
| 3947 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);flex-shrink:0` |
| 3954 | static | `display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)` |
| 3955 | dynamic | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:800;text-transform:uppercase;padding:2px 5px;border-radius:2px;backgr...` |
| 3956 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;font-weight:700;color:var(--white);flex:1;min-width:0;overflow:hidden;text-overf...` |
| 3957 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);flex-shrink:0` |
| 3968 | static | `padding:14px 18px` |
| 3969 | static | `display:flex;align-items:center;justify-content:space-between;margin-bottom:10px` |
| 3970 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;lette...` |
| 3971 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted)` |
| 3974 | static | `border:1px solid var(--border2);background:var(--surface2);padding:12px 14px;margin-bottom:14px` |
| 3975 | static | `margin-bottom:8px` |
| 3976 | static | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;color:var(--muted);letter-spacing:.06em;...` |
| 3978 | static | `display:flex;justify-content:space-between;padding-top:6px;font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted)` |
| 3979 | dynamic | `color:var(--white);font-weight:700` |
| 3982 | static | `border-top:1px solid var(--border);padding-top:8px;margin-top:6px` |
| 3983 | static | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;color:var(--muted);letter-spacing:.06em;...` |
| 3985 | static | `display:flex;justify-content:space-between;padding-top:6px;font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted)` |
| 3986 | dynamic | `color:var(--white);font-weight:700` |
| 3989 | dynamic | `margin-top:10px;padding-top:8px;border-top:1px solid var(--border);font-family:'Mulish',sans-serif;font-size:11px;color:${balan...` |
| 3992 | static | `display:flex;gap:10px;margin-bottom:10px` |
| 3994 | static | `flex:1;background:transparent;border:2px solid var(--red);color:var(--red);font-family:'Kanit',sans-serif;font-weight:800;font-...` |
| 3998 | static | `flex:1;background:var(--green);border:2px solid var(--green);color:var(--black);font-family:'Kanit',sans-serif;font-weight:800;...` |
| 4002 | static | `text-align:center;font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-style:italic` |
| 4012 | static | `padding:24px 20px;text-align:center` |
| 4013 | dynamic | `font-family:'Mulish',sans-serif;font-size:13px;color:var(--white);margin-bottom:6px;line-height:1.5` |
| 4014 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);margin-bottom:18px;line-height:1.5` |
| 4016 | static | `background:var(--red);border:none;color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size...` |

### Renders draft picks in the same visual layout as a position section so the (28)

| Line | Mode | Declaration |
|---|---|---|
| 6251 | static | `margin-bottom:28px` |
| 6252 | static | `display:flex;align-items:center;gap:10px;margin-bottom:10px` |
| 6253 | static | `width:4px;height:20px;background:var(--pos-pick-bg);flex-shrink:0` |
| 6254 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:14px;color:var(--white);text-transform:uppercase` |
| 6256 | static | `font-size:13px;opacity:.4;padding:12px 0;font-family:'Mulish',sans-serif` |
| 6277 | dynamic-context | `border-bottom:1px solid var(--border)` |
| 6278 | dynamic | `${tdS}width:36px;padding-right:8px` |
| 6279 | dynamic | `${tdS}` |
| 6280 | static | `display:flex;align-items:center;gap:6px;flex-wrap:wrap` |
| 6281 | dynamic | `font-family:'Mulish',sans-serif;font-weight:900;font-size:14px;color:var(--white)` |
| 6282 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5` |
| 6285 | dynamic | `${numS}color:var(--muted);opacity:.5` |
| 6286 | dynamic | `${numS}color:${val > 3000 ? 'var(--green)' : val > 1000 ? 'var(--white)' : 'var(--muted)'}` |
| 6287 | dynamic | `${numS}color:var(--muted);opacity:.4;font-size:11px` |
| 6293 | static | `margin-bottom:28px` |
| 6294 | static | `display:flex;align-items:center;justify-content:space-between;margin-bottom:10px` |
| 6295 | static | `display:flex;align-items:center;gap:10px` |
| 6296 | static | `width:4px;height:20px;background:var(--pos-pick-bg);flex-shrink:0` |
| 6297 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:14px;color:var(--white);text-transform:uppercase` |
| 6298 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);opacity:.4` |
| 6300 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:var(--pos-pick-bg)` |
| 6302 | static | `overflow-x:auto` |
| 6303 | static | `width:100%;border-collapse:collapse;min-width:520px` |
| 6305 | dynamic | `${thS}width:36px` |
| 6306 | dynamic | `${thS}` |
| 6307 | dynamic | `${thS}` |
| 6308 | dynamic | `${thS}` |
| 6309 | dynamic | `${thS}` |

### Aggregate per-roster (24)

| Line | Mode | Declaration |
|---|---|---|
| 6602 | static | `width:30px` |
| 6608 | static | `text-align:right` |
| 6609 | static | `text-align:right` |
| 6610 | static | `text-align:right` |
| 6611 | static | `text-align:right` |
| 6617 | dynamic | `color:var(--muted);opacity:.5` |
| 6622 | dynamic | `color:var(--red);font-size:10px;font-style:italic` |
| 6627 | dynamic | `color:var(--yellow)` |
| 6628 | dynamic | `width:${maxSpent ? (r.spent/maxSpent*100).toFixed(0) : 0}%` |
| 6629 | dynamic | `color:var(--green)` |
| 6630 | dynamic | `width:${budget ? (r.left/budget*100).toFixed(0) : 0}%` |
| 6631 | dynamic | `text-align:right` |
| 6632 | dynamic | `text-align:right;color:var(--muted)` |
| 6633 | dynamic | `text-align:right` |
| 6634 | dynamic | `text-align:right;color:var(--yellow)` |
| 6672 | static | `width:30px` |
| 6689 | dynamic | `color:var(--muted);opacity:.5` |
| 6698 | dynamic | `color:var(--muted);opacity:.5;font-size:10px` |
| 6707 | dynamic | `font-size:12px` |
| 6707 | dynamic | `color:var(--red);font-style:italic` |
| 6751 | dynamic | `color:var(--muted);opacity:.5;font-size:10px` |
| 6755 | dynamic | `color:var(--muted);opacity:.4;font-size:10px` |
| 6758 | dynamic | `background:rgba(237,129,12,0.05)` |
| 6762 | dynamic | `opacity:.4` |

### Render an archetype chip (23)

| Line | Mode | Declaration |
|---|---|---|
| 2877 | dynamic | `display:inline-flex;align-items:center;justify-content:center;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;...` |
| 2880 | dynamic | `display:inline-flex;align-items:center;justify-content:center;background:${c};color:var(--black);font-family:'Kanit',sans-serif...` |
| 2884 | dynamic-context | `width:32px;height:32px;flex-shrink:0;display:inline-block;` |
| 2885 | js-composed | `width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0;` |
| 2890 | dynamic-context | `width:32px;height:32px;border-radius:50%;background:var(--surface2);display:inline-flex;align-items:center;justify-content:cent...` |
| 2891 | static | `display:block` |
| 2975 | static | `display:flex;align-items:center;gap:8px;margin-bottom:6px` |
| 2976 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;lette...` |
| 2977 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5` |
| 2979 | static | `display:flex;align-items:center;gap:10px;min-height:24px` |
| 2980 | static | `display:none;margin-top:8px` |
| 2982 | static | `background:none;border:none;color:var(--muted);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;...` |
| 2986 | static | `font-size:8px;transition:transform .15s` |
| 2988 | static | `display:none;margin-top:8px;padding-top:8px;border-top:1px solid var(--border)` |
| 3022 | static | `display:flex;align-items:center;gap:10px;width:100%;padding:8px 12px;background:rgba(237,129,12,0.06);border:1px dashed var(--b...` |
| 3023 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted);font-style:italic;flex:1;min-width:0` |
| 3025 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3040 | static | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;color:var(--white);text-decoration:none;flex:1;min-width:0;overf...` |
| 3044 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;flex-shrink:0` |
| 3046 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3056 | static | `display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border)` |
| 3058 | static | `font-family:'Mulish',sans-serif;font-weight:700;font-size:12px;color:var(--white);text-decoration:none;flex:1;min-width:0;overf...` |
| 3062 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;flex-shrink:0` |

### Archetype lookup for the owning team (23)

| Line | Mode | Declaration |
|---|---|---|
| 3315 | js-composed | `width:24px;height:24px;border-radius:3px;flex-shrink:0;background:var(--surface2)` |
| 3316 | dynamic-context | `width:24px;height:24px;border-radius:3px;flex-shrink:0;background:var(--surface2);display:inline-block` |
| 3330 | dynamic-context | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--green);text-transform:uppercase;let...` |
| 3336 | dynamic | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:1px 5px;bor...` |
| 3338 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--white);opacity:.85` |
| 3342 | static | `background:var(--red);border:none;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--w...` |
| 3351 | dynamic-context | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:#5b9bd5;text-transform:uppercase;letter-s...` |
| 3353 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3360 | dynamic | `display:flex;align-items:center;gap:10px;padding:8px 10px;border-bottom:1px solid var(--border);cursor:${rowCursor};border-radi...` |
| 3362 | static | `flex:1;min-width:0` |
| 3363 | dynamic | `font-family:'Mulish',sans-serif;font-weight:800;font-size:12px;color:var(--white);white-space:nowrap;overflow:hidden;text-overf...` |
| 3364 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.6;white-space:nowrap;overflow:hidden;text-overflow:e...` |
| 3366 | static | `display:flex;align-items:center;gap:8px;flex-shrink:0` |
| 3375 | dynamic | `margin-top:8px;font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;font-style:italic` |
| 3384 | static | `padding:0 18px;border-top:1px solid var(--border);background:var(--surface)` |
| 3386 | static | `display:flex;align-items:center;justify-content:space-between;padding:14px 0;cursor:pointer;user-select:none;gap:10px` |
| 3388 | static | `display:flex;align-items:center;gap:10px;flex:1;min-width:0` |
| 3389 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);width:14px;text-align:center;flex-shrink:0;transition:transfo...` |
| 3390 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;lette...` |
| 3391 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.7` |
| 3393 | static | `display:flex;align-items:center;gap:6px;cursor:pointer;font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);user-s...` |
| 3395 | dynamic | `cursor:pointer` |
| 3399 | dynamic | `${contentDisplay};padding-bottom:14px` |

### RIGHT: player exposure sidebar (22)

| Line | Mode | Declaration |
|---|---|---|
| 2207 | static | `cursor:pointer` |
| 2208 | static | `display:flex;align-items:center;gap:8px` |
| 2209 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);width:12px;text-align:center;flex-shrink:0;transition:transfo...` |
| 2215 | static | `display:none` |
| 2233 | static | `width:24px;flex-shrink:0` |
| 2234 | static | `flex:1` |
| 2249 | static | `fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;` |
| 2249 | static | `fill:#c33;` |
| 2249 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2249 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2249 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2249 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2249 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2249 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2249 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2249 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2249 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2249 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2249 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2249 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2249 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2251 | dynamic-context | `flex-shrink:0;vertical-align:middle;margin-right:4px` |

### Picks this roster RECEIVED (19)

| Line | Mode | Declaration |
|---|---|---|
| 6942 | static | `display:flex;justify-content:space-between;align-items:center;margin-bottom:8px` |
| 6943 | dynamic | `margin-bottom:0` |
| 6944 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.4` |
| 6949 | dynamic | `${s.isMe ? 'color:var(--red)' : ''}` |
| 6951 | dynamic | `cursor:pointer` |
| 6952 | static | `width:28px;height:28px;flex-shrink:0;display:inline-flex;align-items:center;` |
| 6954 | js-composed | `width:28px;height:28px;border-radius:50%;object-fit:cover;` |
| 6958 | static | `min-width:0;flex:1` |
| 6959 | static | `display:flex;align-items:center;gap:4px;flex-wrap:wrap` |
| 6963 | dynamic | `display:flex;gap:8px;margin-top:2px` |
| 6964 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--muted);opacity:.6` |
| 6965 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.4` |
| 6966 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.4` |
| 6972 | static | `min-width:0;flex:1` |
| 6974 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.35;margin-left:4px` |
| 6975 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--pos-pick-bg);margin-top:2px` |
| 6979 | dynamic | `margin-top:4px` |
| 6980 | static | `width:28px;flex-shrink:0;` |
| 6981 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:12px;color:var(--green)` |

### Stash render context on window so the sort buttons can re-render (18)

| Line | Mode | Declaration |
|---|---|---|
| 7125 | static | `margin-bottom:24px` |
| 7126 | static | `display:flex;align-items:center;justify-content:space-between;margin-bottom:12px` |
| 7127 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;lette...` |
| 7128 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted)` |
| 7128 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;color:${+myTeam.mpxPct>=90?'var(--green)':+myTeam.mpxPct>=75?'...` |
| 7128 | dynamic | `opacity:.5` |
| 7130 | static | `display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px` |
| 7141 | dynamic | `background:var(--surface2);border:1px solid var(--border);padding:12px 14px;border-left:3px solid ${posColors[pos]}` |
| 7142 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:${posColors[pos]};text-transform:uppercas...` |
| 7143 | static | `display:flex;gap:12px;align-items:flex-end` |
| 7145 | static | `font-family:'Mulish',sans-serif;font-size:9px;color:var(--muted);opacity:.4;text-transform:uppercase;letter-spacing:.06em` |
| 7146 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:${color}` |
| 7147 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--muted);opacity:.6` |
| 7149 | dynamic | `border-left:1px solid var(--border2);padding-left:12px` |
| 7150 | static | `font-family:'Mulish',sans-serif;font-size:9px;color:var(--muted);opacity:.4;text-transform:uppercase;letter-spacing:.06em` |
| 7151 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:${scoreColor}` |
| 7152 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--muted);opacity:.6` |
| 7155 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.35;margin-top:4px` |

### Temporarily assign global IDs so existing loadRoster can find them (14)

| Line | Mode | Declaration |
|---|---|---|
| 5511 | static | `display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--surface);border:1px solid var(--border);margin-bott...` |
| 5512 | static | `display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;flex-shrink:0;background:var(--surface2);b...` |
| 5512 | static | `display:block` |
| 5513 | static | `flex:1` |
| 5514 | dynamic | `font-family:'Mulish',sans-serif;font-weight:900;font-size:14px;color:var(--white)` |
| 5515 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);margin-top:3px` |
| 5518 | static | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px` |
| 5522 | js-composed | `display:flex;align-items:center;gap:12px;padding:11px 12px;background:var(--surface);border:1px solid var(--border);margin-bott...` |
| 5523 | js-composed | `width:30px;height:30px;border-radius:2px;flex-shrink:0` |
| 5523 | js-composed | `width:30px;height:30px;background:var(--surface2);border-radius:2px;flex-shrink:0` |
| 5524 | static | `flex:1;min-width:0` |
| 5525 | dynamic | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;color:var(--white);white-space:nowrap;overflow:hidden;text-overf...` |
| 5526 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.7;margin-top:1px` |
| 5528 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;lette...` |

### Render the current state of the suggestion pre-screener (13)

| Line | Mode | Declaration |
|---|---|---|
| 3866 | dynamic | `font-family:'Mulish',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:2px 6px;bor...` |
| 3869 | static | `padding:14px 20px;border-bottom:1px solid var(--border);background:var(--surface2)` |
| 3870 | static | `display:flex;align-items:center;gap:12px` |
| 3871 | js-composed | `width:48px;height:48px;border-radius:3px;object-fit:cover;background:var(--surface)` |
| 3872 | static | `flex:1;min-width:0` |
| 3873 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:18px;color:var(--white);text-transform:uppercase;lin...` |
| 3874 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);margin-top:2px` |
| 3875 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--white);opacity:.8;margin-top:2px` |
| 3888 | static | `padding:20px` |
| 3889 | static | `font-family:'Mulish',sans-serif;font-size:13px;color:var(--white);margin-bottom:8px` |
| 3890 | static | `font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted);margin-bottom:16px` |
| 3892 | static | `display:inline-block;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--white);backgro...` |
| 3898 | dynamic-context | `padding:24px;text-align:center;color:var(--muted);font-size:13px` |

### Ensure roster/users/players are loaded and stashed on window for the modal layer (10)

| Line | Mode | Declaration |
|---|---|---|
| 5067 | dynamic | `display:inline-flex;align-items:center;gap:6px;padding:6px 10px;background:var(--surface2);border:1px solid var(--border);borde...` |
| 5068 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:${color};text-transform:uppercase;letter-...` |
| 5069 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:14px;color:${rankColor}` |
| 5070 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.6` |
| 5080 | dynamic | `display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px` |
| 5092 | static | `display:flex;align-items:center;justify-content:space-between` |
| 5094 | static | `display:flex;align-items:center;gap:8px` |
| 5095 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em` |
| 5097 | static | `background:var(--surface2);border:1px solid var(--border2);color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;fo...` |
| 5113 | dynamic | `display:none` |

### Total roster value (10)

| Line | Mode | Declaration |
|---|---|---|
| 6335 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:${_rankColor(rank)};padding:1px 6px;backg...` |
| 6339 | static | `display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px;padding:16px;background:var(--surface2);border:1px solid var(--border)` |
| 6340 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 6340 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);opacity:.45` |
| 6341 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:var(--white)` |
| 6342 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 6342 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);opacity:.45` |
| 6343 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:var(--white)` |
| 6344 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);opacity:.45` |
| 6345 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:var(--green)` |

### Team logo helpers — load BEFORE player-panel.js so modal-hero badge works. (6)

| Line | Mode | Declaration |
|---|---|---|
| 2098 | static | `position:fixed;inset:0;background:var(--black);color:var(--white);display:flex;align-items:center;justify-content:center;font-f...` |
| 2099 | static | `background:var(--nav-bg);border-bottom:2px solid var(--red);position:sticky;top:0;z-index:100` |
| 2099 | static | `border:none;position:static` |
| 2102 | static | `fill-rule:evenodd;clip-rule:evenodd` |
| 2141 | static | `background:none;border:1px solid var(--border2);color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:it...` |
| 2167 | static | `display:none` |

### Close player-detail modal if open (5)

| Line | Mode | Declaration |
|---|---|---|
| 4460 | dynamic-context | `margin-top:14px;padding-top:14px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:8px;align-items:center` |
| 4462 | static | `display:inline-block;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:12px;color:var(--white);backgro...` |
| 4464 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-style:italic;text-align:center;line-height:1.5;max-width...` |
| 4478 | dynamic | `color:${diff>0?'var(--red)':diff<0?'var(--green)':'var(--white)'}` |
| 4538 | dynamic-context | `opacity:.5` |

### Trade Builder Modal — opens over the player detail modal (z-index 250) (5)

| Line | Mode | Declaration |
|---|---|---|
| 7498 | static | `z-index:250` |
| 7502 | static | `margin-right:8px` |
| 7509 | static | `z-index:260` |
| 7510 | static | `max-width:540px` |
| 7513 | static | `margin-right:8px` |

### PICKS BRANCH (4)

| Line | Mode | Declaration |
|---|---|---|
| 5704 | static | `background:var(--surface2);display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border)` |
| 5704 | static | `display:block` |
| 5706 | dynamic | `color:#9b91d4` |
| 5709 | dynamic | `color:${expoColor(p.exposure)}` |

### Group transactions by roster (4)

| Line | Mode | Declaration |
|---|---|---|
| 6813 | dynamic | `color:var(--muted);opacity:.5;font-size:10px` |
| 6823 | dynamic | `color:var(--red);font-size:10px;font-style:italic` |
| 6824 | dynamic | `color:var(--yellow)` |
| 6824 | dynamic | `color:var(--green)` |

### Sort state for the leagues list (2)

| Line | Mode | Declaration |
|---|---|---|
| 4879 | dynamic | `width:${w}%;background:${s.color}` |
| 4886 | dynamic-context | `opacity:.3` |

### Color helpers (2)

| Line | Mode | Declaration |
|---|---|---|
| 5794 | dynamic | `color:${posColor(p.position)}` |
| 5797 | dynamic | `color:${expoColor(p.exposure)}` |

### Update section meta with archetype legend + league averages (2)

| Line | Mode | Declaration |
|---|---|---|
| 7168 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 7168 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |

### Columns: expandable league list (left) + player exposure (right) (1)

| Line | Mode | Declaration |
|---|---|---|
| 2189 | static | `display:none` |

### Close modals on Escape (1)

| Line | Mode | Declaration |
|---|---|---|
| 4586 | dynamic | `color:${color};border-color:${color};background:${bg}` |
