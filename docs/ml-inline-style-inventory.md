# my-leagues.html inline-style inventory

Generated from `my-leagues.html` (8261 lines).
Total `style="..."` occurrences: **172**.

This is a read-only audit. No code was changed. The goal is to make the
refactor safe to execute supervised by giving every occurrence a category,
a section assignment, and an actionability verdict.

---

## Mode breakdown

| Mode | Count | % | Refactorable to CSS class? |
|---|---|---|---|
| `dynamic` | 81 | 47.1% | Conditional - if the interpolated value is a discrete enum, use a modifier class (e.g. `.is-active`); otherwise leave inline |
| `static` | 80 | 46.5% | Yes - pure HTML attribute, drop into a class |
| `dynamic-context` | 6 | 3.5% | Conditional - inside a JS-built HTML string; refactor only if the declaration set is static |
| `js-composed` | 5 | 2.9% | No - imperatively set at runtime; leave as-is |

**Headline:** ~80 are directly refactorable, ~87 require case-by-case judgement, ~5 must stay inline (JS-set).

---

## Top 25 declaration properties

Which CSS properties carry most of the inline styling. Where one property dominates, a single utility class can collapse many sites.

| Property | Count |
|---|---|
| `color` | 55 |
| `display` | 42 |
| `font-size` | 41 |
| `font-family` | 39 |
| `font-style` | 27 |
| `align-items` | 26 |
| `font-weight` | 25 |
| `background` | 21 |
| `gap` | 20 |
| `width` | 17 |
| `flex-shrink` | 17 |
| `border` | 15 |
| `fill-rule` | 15 |
| `padding` | 15 |
| `fill` | 14 |
| `margin-bottom` | 14 |
| `opacity` | 14 |
| `letter-spacing` | 12 |
| `text-transform` | 11 |
| `border-radius` | 11 |
| `margin-top` | 10 |
| `justify-content` | 9 |
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
| 2 | `opacity:.5` |
| 2 | `color:${expoColor(p.exposure)}` |
| 2 | `--rp-stripe-color:var(--pos-pick-bg)` |
| 2 | `align-items:center; display:flex; gap:8px; margin-bottom:2px` |
| 2 | `width:30px` |
| 2 | `color:var(--red); font-size:10px; font-style:italic` |
| 2 | `color:var(--yellow)` |
| 2 | `color:var(--green)` |
| 2 | `flex:1; min-width:0` |
| 2 | `border-left:1px solid var(--border2); padding-left:12px` |
| 2 | `color:var(--white); font-family:'Kanit',sans-serif; font-style:italic; font-weight:800` |
| 2 | `margin-right:8px` |

---

## Occurrences per region

Sorted by count - the busiest regions are the highest-leverage refactor batches.

| Count | Region (nearest banner-comment heading above the hit) |
|---|---|
| 22 | Render an archetype chip |
| 21 | RIGHT: player exposure sidebar |
| 15 | Stash render context on window so the sort buttons can re-render |
| 14 | Aggregate per-roster |
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
| 3 | Group transactions by roster |
| 2 | Sort state for the leagues list |
| 2 | Save current scoped IDs so the existing loadRoster / loadAllTrades can target them |
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

### Render an archetype chip (22)

| Line | Mode | Declaration |
|---|---|---|
| 3615 | dynamic | `display:inline-flex;align-items:center;justify-content:center;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;...` |
| 3618 | dynamic | `display:inline-flex;align-items:center;justify-content:center;background:${c};color:#fff;font-family:'Kanit',sans-serif;font-we...` |
| 3622 | dynamic-context | `width:32px;height:32px;flex-shrink:0;display:inline-block;` |
| 3623 | js-composed | `width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0;` |
| 3628 | dynamic-context | `width:32px;height:32px;border-radius:50%;background:var(--surface2);display:inline-flex;align-items:center;justify-content:cent...` |
| 3629 | static | `display:block` |
| 3713 | static | `display:flex;align-items:center;gap:8px;margin-bottom:6px` |
| 3715 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5` |
| 3717 | static | `display:flex;align-items:center;gap:10px;min-height:24px` |
| 3718 | static | `display:none;margin-top:8px` |
| 3720 | static | `background:none;border:none;color:var(--muted);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;...` |
| 3724 | static | `font-size:8px;transition:transform .15s` |
| 3726 | static | `display:none;margin-top:8px;padding-top:8px;border-top:1px solid var(--border)` |
| 3760 | static | `display:flex;align-items:center;gap:10px;width:100%;padding:8px 12px;background:rgba(237,129,12,0.06);border:1px dashed var(--b...` |
| 3761 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted);font-style:italic;flex:1;min-width:0` |
| 3763 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3778 | static | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;color:var(--white);text-decoration:none;flex:1;min-width:0;overf...` |
| 3782 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;flex-shrink:0` |
| 3784 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3794 | static | `display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border)` |
| 3796 | static | `font-family:'Mulish',sans-serif;font-weight:700;font-size:12px;color:var(--white);text-decoration:none;flex:1;min-width:0;overf...` |
| 3800 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;flex-shrink:0` |

### RIGHT: player exposure sidebar (21)

| Line | Mode | Declaration |
|---|---|---|
| 2973 | static | `display:flex;align-items:center;gap:8px` |
| 2974 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);width:12px;text-align:center;flex-shrink:0;transition:transfo...` |
| 2980 | static | `display:none` |
| 2999 | static | `width:24px;flex-shrink:0` |
| 3000 | static | `flex:1` |
| 3015 | static | `fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;` |
| 3015 | static | `fill:#c33;` |
| 3015 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3015 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3015 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3015 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3015 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3015 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3015 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3015 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3015 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3015 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3015 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3015 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3015 | static | `fill:var(--black);fill-rule:nonzero;` |
| 3017 | dynamic-context | `flex-shrink:0;vertical-align:middle;margin-right:4px` |

### Stash render context on window so the sort buttons can re-render (15)

| Line | Mode | Declaration |
|---|---|---|
| 7848 | static | `margin-bottom:24px` |
| 7849 | static | `display:flex;align-items:center;justify-content:space-between;margin-bottom:12px` |
| 7850 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;lette...` |
| 7851 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted)` |
| 7851 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;color:${+myTeam.mpxPct>=90?'var(--green)':+myTeam.mpxPct>=75?'...` |
| 7851 | dynamic | `opacity:.5` |
| 7853 | static | `display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px` |
| 7864 | dynamic | `background:var(--surface2);border:1px solid var(--border);padding:12px 14px;border-left:3px solid ${posColors[pos]}` |
| 7865 | dynamic | `margin-bottom:6px` |
| 7866 | static | `display:flex;gap:12px;align-items:flex-end` |
| 7869 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:${color}` |
| 7872 | dynamic | `border-left:1px solid var(--border2);padding-left:12px` |
| 7874 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:${scoreColor}` |
| 7877 | dynamic | `border-left:1px solid var(--border2);padding-left:12px` |
| 7883 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.35;margin-top:4px` |

### Aggregate per-roster (14)

| Line | Mode | Declaration |
|---|---|---|
| 7274 | static | `width:30px` |
| 7294 | dynamic | `color:var(--red);font-size:10px;font-style:italic` |
| 7299 | dynamic | `color:var(--yellow)` |
| 7300 | dynamic | `width:${maxSpent ? (r.spent/maxSpent*100).toFixed(0) : 0}%` |
| 7301 | dynamic | `color:var(--green)` |
| 7302 | dynamic | `width:${budget ? (r.left/budget*100).toFixed(0) : 0}%` |
| 7304 | dynamic | `text-align:right;color:var(--muted)` |
| 7306 | dynamic | `text-align:right;color:var(--yellow)` |
| 7344 | static | `width:30px` |
| 7379 | dynamic | `font-size:12px` |
| 7379 | dynamic | `color:var(--red);font-style:italic` |
| 7427 | dynamic | `color:var(--muted);opacity:.4;font-size:10px` |
| 7430 | dynamic | `background:rgba(237,129,12,0.05)` |
| 7434 | dynamic | `opacity:.4` |

### Build one side per roster_id (14)

| Line | Mode | Declaration |
|---|---|---|
| 7614 | static | `display:flex;justify-content:space-between;align-items:center;margin-bottom:8px` |
| 7615 | dynamic | `margin-bottom:0` |
| 7621 | dynamic | `${s.isMe ? 'color:var(--red)' : ''}` |
| 7624 | static | `width:28px;height:28px;flex-shrink:0;display:inline-flex;align-items:center;` |
| 7626 | js-composed | `width:28px;height:28px;border-radius:50%;object-fit:cover;` |
| 7630 | static | `min-width:0;flex:1` |
| 7631 | static | `display:flex;align-items:center;gap:4px;flex-wrap:wrap` |
| 7635 | dynamic | `display:flex;gap:8px;margin-top:2px` |
| 7644 | static | `min-width:0;flex:1` |
| 7646 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.35;margin-left:4px` |
| 7647 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--pos-pick-bg);margin-top:2px` |
| 7651 | dynamic | `margin-top:4px` |
| 7652 | static | `width:28px;flex-shrink:0;` |
| 7653 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:12px;color:var(--green)` |

### Temporarily assign global IDs so existing loadRoster can find them (12)

| Line | Mode | Declaration |
|---|---|---|
| 6172 | static | `display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--surface);border:1px solid var(--border);margin-bott...` |
| 6173 | static | `display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;flex-shrink:0;background:var(--surface2);b...` |
| 6173 | static | `display:block` |
| 6174 | static | `flex:1` |
| 6176 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);margin-top:3px` |
| 6179 | static | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px` |
| 6183 | js-composed | `display:flex;align-items:center;gap:12px;padding:11px 12px;background:var(--surface);border:1px solid var(--border);margin-bott...` |
| 6184 | js-composed | `width:30px;height:30px;border-radius:2px;flex-shrink:0` |
| 6184 | js-composed | `width:30px;height:30px;background:var(--surface2);border-radius:2px;flex-shrink:0` |
| 6186 | dynamic | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;color:var(--white);white-space:nowrap;overflow:hidden;text-overf...` |
| 6187 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.7;margin-top:1px` |
| 6189 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;lette...` |

### Ensure roster/users/players are loaded and stashed on window for the modal layer (10)

| Line | Mode | Declaration |
|---|---|---|
| 5725 | dynamic | `display:inline-flex;align-items:center;gap:6px;padding:6px 10px;background:var(--surface2);border:1px solid var(--border);borde...` |
| 5726 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:${color};text-transform:uppercase;letter-...` |
| 5727 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:14px;color:${rankColor}` |
| 5728 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.6` |
| 5738 | dynamic | `display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px` |
| 5750 | static | `display:flex;align-items:center;justify-content:space-between` |
| 5752 | static | `display:flex;align-items:center;gap:8px` |
| 5753 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em` |
| 5755 | static | `background:var(--surface2);border:1px solid var(--border2);color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;fo...` |
| 5772 | dynamic | `display:none` |

### Sort rosters by chosen key (10)

| Line | Mode | Declaration |
|---|---|---|
| 7955 | dynamic | `--bar-width:${w}%;--bar-color:${posColors[pos]}` |
| 7960 | dynamic | `--top-pos-color:${posColors[r.topScoringPos]}` |
| 7979 | dynamic | `--st-pos-color:${posColors.QB}` |
| 7980 | dynamic | `--st-pos-color:${posColors.RB}` |
| 7981 | dynamic | `--st-pos-color:${posColors.WR}` |
| 7982 | dynamic | `--st-pos-color:${posColors.TE}` |
| 8054 | dynamic | `margin-top:20px` |
| 8060 | dynamic | `border-left-color:var(--red)` |
| 8062 | dynamic | `color:var(--white);opacity:.7` |
| 8063 | dynamic | `${isMyPick?'color:var(--red)':''}` |

### Team logo helpers — load BEFORE player-panel.js so modal-hero badge works. (8)

| Line | Mode | Declaration |
|---|---|---|
| 2729 | static | `...` |
| 2786 | static | `...` |
| 2856 | static | `position:fixed;inset:0;background:var(--black);color:var(--white);display:flex;align-items:center;justify-content:center;font-f...` |
| 2857 | static | `background:var(--nav-bg);border-bottom:2px solid var(--red);position:sticky;top:0;z-index:100` |
| 2857 | static | `border:none;position:static` |
| 2860 | static | `fill-rule:evenodd;clip-rule:evenodd` |
| 2903 | static | `background:none;border:1px solid var(--border2);color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:it...` |
| 2932 | static | `display:none` |

### Close player-detail modal if open (5)

| Line | Mode | Declaration |
|---|---|---|
| 5029 | dynamic-context | `margin-top:14px;padding-top:14px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:8px;align-items:center` |
| 5031 | static | `display:inline-block;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:12px;color:var(--white);backgro...` |
| 5033 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-style:italic;text-align:center;line-height:1.5;max-width...` |
| 5047 | dynamic | `color:${diff>0?'var(--red)':diff<0?'var(--green)':'var(--white)'}` |
| 5107 | dynamic-context | `opacity:.5` |

### Helpers (5)

| Line | Mode | Declaration |
|---|---|---|
| 6831 | dynamic | `--cell-value-color:${valColor(r.value)}` |
| 6833 | dynamic | `--cell-proj-color:${seasonProjColor};--cell-proj-opacity:${seasonProjOpacity}` |
| 6834 | dynamic | `--cell-proj-color:${projColor};--cell-proj-opacity:${projOpacity}` |
| 6851 | dynamic | `--rp-stripe-color:${posColors[pos]}` |
| 6855 | dynamic | `--rp-total-color:${posColors[pos]}` |

### Total roster value (5)

| Line | Mode | Declaration |
|---|---|---|
| 6984 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:${_rankColor(rank)};padding:1px 6px;backg...` |
| 6988 | static | `display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px;padding:16px;background:var(--surface2);border:1px solid var(--border)` |
| 6989 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 6991 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 6994 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:var(--green)` |

### Trade Builder Modal — opens over the player detail modal (z-index 250) (5)

| Line | Mode | Declaration |
|---|---|---|
| 8238 | static | `z-index:250` |
| 8242 | static | `margin-right:8px` |
| 8249 | static | `z-index:260` |
| 8250 | static | `max-width:540px` |
| 8253 | static | `margin-right:8px` |

### PICKS BRANCH (4)

| Line | Mode | Declaration |
|---|---|---|
| 6368 | static | `background:var(--surface2);display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border)` |
| 6368 | static | `display:block` |
| 6370 | dynamic | `color:#9b91d4` |
| 6373 | dynamic | `color:${expoColor(p.exposure)}` |

### Renders draft picks in the same visual layout as a position section so the (4)

| Line | Mode | Declaration |
|---|---|---|
| 6898 | static | `--rp-stripe-color:var(--pos-pick-bg)` |
| 6935 | dynamic | `--cell-value-color:${valColor}` |
| 6945 | static | `--rp-stripe-color:var(--pos-pick-bg)` |
| 6949 | dynamic | `--rp-total-color:var(--pos-pick-bg)` |

### Group transactions by roster (3)

| Line | Mode | Declaration |
|---|---|---|
| 7495 | dynamic | `color:var(--red);font-size:10px;font-style:italic` |
| 7496 | dynamic | `color:var(--yellow)` |
| 7496 | dynamic | `color:var(--green)` |

### Sort state for the leagues list (2)

| Line | Mode | Declaration |
|---|---|---|
| 5519 | dynamic | `width:${w}%;background:${s.color}` |
| 5526 | dynamic-context | `opacity:.3` |

### Save current scoped IDs so the existing loadRoster / loadAllTrades can target them (2)

| Line | Mode | Declaration |
|---|---|---|
| 5853 | dynamic | `--archetype-bg:${mlArchetypeBg(archetype)};--archetype-fg:${mlArchetypeFg(archetype)}` |
| 5864 | dynamic | `--pos-chip-color:${color};--rank-chip-color:${rankColor}` |

### Color helpers (2)

| Line | Mode | Declaration |
|---|---|---|
| 6469 | dynamic | `color:${posColor(p.position)}` |
| 6472 | dynamic | `color:${expoColor(p.exposure)}` |

### Store per-league so multiple leagues can expand without collision (2)

| Line | Mode | Declaration |
|---|---|---|
| 7142 | static | `margin-bottom:12px` |
| 7143 | static | `display:none` |

### Update section meta with archetype legend + league averages (2)

| Line | Mode | Declaration |
|---|---|---|
| 7896 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 7896 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |

### Columns: expandable league list (left) + player exposure (right) (1)

| Line | Mode | Declaration |
|---|---|---|
| 2954 | static | `display:none` |

### Archetype lookup for the owning team (1)

| Line | Mode | Declaration |
|---|---|---|
| 4069 | dynamic | `--archetype-bg:${mlArchetypeBg(r.ownerArchetype)};--archetype-fg:${mlArchetypeFg(r.ownerArchetype)}` |

### Render the current state of the suggestion pre-screener (1)

| Line | Mode | Declaration |
|---|---|---|
| 4436 | dynamic | `--archetype-bg:${mlArchetypeBg(archetype)};--archetype-fg:${mlArchetypeFg(archetype)}` |

### Render the current suggestion as a single card (1)

| Line | Mode | Declaration |
|---|---|---|
| 4566 | dynamic | `--balance-color:${balanceColor}` |

### Close modals on Escape (1)

| Line | Mode | Declaration |
|---|---|---|
| 5155 | dynamic | `color:${color};border-color:${color};background:${bg}` |
