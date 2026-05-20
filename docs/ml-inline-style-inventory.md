# my-leagues.html inline-style inventory

Generated from `my-leagues.html` (8157 lines).
Total `style="..."` occurrences: **197**.

This is a read-only audit. No code was changed. The goal is to make the
refactor safe to execute supervised by giving every occurrence a category,
a section assignment, and an actionability verdict.

---

## Mode breakdown

| Mode | Count | % | Refactorable to CSS class? |
|---|---|---|---|
| `dynamic` | 95 | 48.2% | Conditional - if the interpolated value is a discrete enum, use a modifier class (e.g. `.is-active`); otherwise leave inline |
| `static` | 90 | 45.7% | Yes - pure HTML attribute, drop into a class |
| `dynamic-context` | 7 | 3.6% | Conditional - inside a JS-built HTML string; refactor only if the declaration set is static |
| `js-composed` | 5 | 2.5% | No - imperatively set at runtime; leave as-is |

**Headline:** ~90 are directly refactorable, ~102 require case-by-case judgement, ~5 must stay inline (JS-set).

---

## Top 25 declaration properties

Which CSS properties carry most of the inline styling. Where one property dominates, a single utility class can collapse many sites.

| Property | Count |
|---|---|
| `color` | 71 |
| `font-size` | 50 |
| `font-family` | 47 |
| `display` | 46 |
| `font-style` | 31 |
| `align-items` | 30 |
| `font-weight` | 29 |
| `width` | 26 |
| `background` | 24 |
| `gap` | 23 |
| `opacity` | 22 |
| `flex-shrink` | 20 |
| `padding` | 16 |
| `border` | 15 |
| `fill-rule` | 15 |
| `margin-bottom` | 15 |
| `fill` | 14 |
| `letter-spacing` | 12 |
| `text-transform` | 11 |
| `height` | 11 |
| `border-radius` | 11 |
| `margin-top` | 10 |
| `justify-content` | 9 |
| `flex` | 7 |
| `min-width` | 7 |

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
| 2 | `color:var(--muted); font-family:'Mulish',sans-serif; font-size:10px; opacity:.5` |
| 2 | `color:var(--muted); flex-shrink:0; font-family:'Mulish',sans-serif; font-size:10px; opacity:.5` |
| 2 | `--archetype-bg:${mlArchetypeBg(archetype)}; --archetype-fg:${mlArchetypeFg(archetype)}` |
| 2 | `opacity:.5` |
| 2 | `opacity:.3` |
| 2 | `color:${expoColor(p.exposure)}` |
| 2 | `padding-right:8px; width:36px` |
| 2 | `color:var(--white)` |
| 2 | `color:var(--white); font-size:12px` |
| 2 | `align-items:center; display:flex; gap:10px` |
| 2 | `color:var(--muted); font-family:'Mulish',sans-serif; font-size:11px; opacity:.4` |
| 2 | `width:36px` |
| 2 | `background:var(--pos-pick-bg); flex-shrink:0; height:20px; width:4px` |
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
| 19 | Helpers |
| 15 | Renders draft picks in the same visual layout as a position section so the |
| 15 | Stash render context on window so the sort buttons can re-render |
| 14 | Aggregate per-roster |
| 14 | Build one side per roster_id |
| 12 | Temporarily assign global IDs so existing loadRoster can find them |
| 10 | Ensure roster/users/players are loaded and stashed on window for the modal layer |
| 10 | Sort rosters by chosen key |
| 8 | Team logo helpers — load BEFORE player-panel.js so modal-hero badge works. |
| 5 | Close player-detail modal if open |
| 5 | Total roster value |
| 5 | Trade Builder Modal — opens over the player detail modal (z-index 250) |
| 4 | PICKS BRANCH |
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
| 3524 | dynamic | `display:inline-flex;align-items:center;justify-content:center;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;...` |
| 3527 | dynamic | `display:inline-flex;align-items:center;justify-content:center;background:${c};color:#fff;font-family:'Kanit',sans-serif;font-we...` |
| 3531 | dynamic-context | `width:32px;height:32px;flex-shrink:0;display:inline-block;` |
| 3532 | js-composed | `width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0;` |
| 3537 | dynamic-context | `width:32px;height:32px;border-radius:50%;background:var(--surface2);display:inline-flex;align-items:center;justify-content:cent...` |
| 3538 | static | `display:block` |
| 3622 | static | `display:flex;align-items:center;gap:8px;margin-bottom:6px` |
| 3624 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5` |
| 3626 | static | `display:flex;align-items:center;gap:10px;min-height:24px` |
| 3627 | static | `display:none;margin-top:8px` |
| 3629 | static | `background:none;border:none;color:var(--muted);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;...` |
| 3633 | static | `font-size:8px;transition:transform .15s` |
| 3635 | static | `display:none;margin-top:8px;padding-top:8px;border-top:1px solid var(--border)` |
| 3669 | static | `display:flex;align-items:center;gap:10px;width:100%;padding:8px 12px;background:rgba(237,129,12,0.06);border:1px dashed var(--b...` |
| 3670 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted);font-style:italic;flex:1;min-width:0` |
| 3672 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3687 | static | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;color:var(--white);text-decoration:none;flex:1;min-width:0;overf...` |
| 3691 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;flex-shrink:0` |
| 3693 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3703 | static | `display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border)` |
| 3705 | static | `font-family:'Mulish',sans-serif;font-weight:700;font-size:12px;color:var(--white);text-decoration:none;flex:1;min-width:0;overf...` |
| 3709 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;flex-shrink:0` |

### RIGHT: player exposure sidebar (21)

| Line | Mode | Declaration |
|---|---|---|
| 2882 | static | `display:flex;align-items:center;gap:8px` |
| 2883 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);width:12px;text-align:center;flex-shrink:0;transition:transfo...` |
| 2889 | static | `display:none` |
| 2908 | static | `width:24px;flex-shrink:0` |
| 2909 | static | `flex:1` |
| 2924 | static | `fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;` |
| 2924 | static | `fill:#c33;` |
| 2924 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2924 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2924 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2924 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2924 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2924 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2924 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2924 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2924 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2924 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2924 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2924 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2924 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2926 | dynamic-context | `flex-shrink:0;vertical-align:middle;margin-right:4px` |

### Helpers (19)

| Line | Mode | Declaration |
|---|---|---|
| 6713 | dynamic | `color:var(--green);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 6714 | dynamic | `color:var(--red);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 6715 | dynamic-context | `opacity:.3` |
| 6720 | dynamic | `width:36px;padding-right:8px` |
| 6725 | dynamic | `display:inline-flex;align-items:center` |
| 6729 | dynamic | `color:var(--white)` |
| 6730 | dynamic | `color:var(--white);font-size:12px` |
| 6731 | dynamic | `color:${valColor(r.value)}` |
| 6732 | dynamic | `color:var(--white);font-size:12px` |
| 6733 | dynamic | `color:${r.seasonProj ? 'var(--white)' : 'var(--muted)'};opacity:${r.seasonProj ? '1' : '.3'}` |
| 6734 | dynamic | `color:${r.proj ? (r.proj >= 20 ? 'var(--green)' : r.proj >= 12 ? 'var(--white)' : 'var(--muted)') : 'var(--muted)'};opacity:${r...` |
| 6737 | dynamic | `color:var(--white)` |
| 6750 | static | `display:flex;align-items:center;gap:10px` |
| 6751 | dynamic | `width:4px;height:20px;background:${posColors[pos]};flex-shrink:0` |
| 6753 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);opacity:.4` |
| 6755 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:${posColors[pos]}` |
| 6757 | static | `overflow-x:auto;-webkit-overflow-scrolling:touch` |
| 6758 | static | `width:100%;border-collapse:collapse;min-width:430px` |
| 6760 | static | `width:36px` |

### Renders draft picks in the same visual layout as a position section so the (15)

| Line | Mode | Declaration |
|---|---|---|
| 6797 | static | `display:flex;align-items:center;gap:10px;margin-bottom:10px` |
| 6798 | static | `width:4px;height:20px;background:var(--pos-pick-bg);flex-shrink:0` |
| 6801 | static | `font-size:13px;opacity:.4;padding:12px 0;font-family:'Mulish',sans-serif` |
| 6822 | dynamic | `border-bottom:1px solid var(--border)` |
| 6823 | dynamic | `width:36px;padding-right:8px` |
| 6827 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5` |
| 6831 | dynamic | `color:${val > 3000 ? 'var(--green)' : val > 1000 ? 'var(--white)' : 'var(--muted)'}` |
| 6832 | dynamic | `color:var(--muted);opacity:.4;font-size:11px` |
| 6840 | static | `display:flex;align-items:center;gap:10px` |
| 6841 | static | `width:4px;height:20px;background:var(--pos-pick-bg);flex-shrink:0` |
| 6843 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);opacity:.4` |
| 6845 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:var(--pos-pick-bg)` |
| 6847 | static | `overflow-x:auto` |
| 6848 | static | `width:100%;border-collapse:collapse;min-width:520px` |
| 6850 | static | `width:36px` |

### Stash render context on window so the sort buttons can re-render (15)

| Line | Mode | Declaration |
|---|---|---|
| 7744 | static | `margin-bottom:24px` |
| 7745 | static | `display:flex;align-items:center;justify-content:space-between;margin-bottom:12px` |
| 7746 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;lette...` |
| 7747 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted)` |
| 7747 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;color:${+myTeam.mpxPct>=90?'var(--green)':+myTeam.mpxPct>=75?'...` |
| 7747 | dynamic | `opacity:.5` |
| 7749 | static | `display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px` |
| 7760 | dynamic | `background:var(--surface2);border:1px solid var(--border);padding:12px 14px;border-left:3px solid ${posColors[pos]}` |
| 7761 | dynamic | `margin-bottom:6px` |
| 7762 | static | `display:flex;gap:12px;align-items:flex-end` |
| 7765 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:${color}` |
| 7768 | dynamic | `border-left:1px solid var(--border2);padding-left:12px` |
| 7770 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:${scoreColor}` |
| 7773 | dynamic | `border-left:1px solid var(--border2);padding-left:12px` |
| 7779 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.35;margin-top:4px` |

### Aggregate per-roster (14)

| Line | Mode | Declaration |
|---|---|---|
| 7170 | static | `width:30px` |
| 7190 | dynamic | `color:var(--red);font-size:10px;font-style:italic` |
| 7195 | dynamic | `color:var(--yellow)` |
| 7196 | dynamic | `width:${maxSpent ? (r.spent/maxSpent*100).toFixed(0) : 0}%` |
| 7197 | dynamic | `color:var(--green)` |
| 7198 | dynamic | `width:${budget ? (r.left/budget*100).toFixed(0) : 0}%` |
| 7200 | dynamic | `text-align:right;color:var(--muted)` |
| 7202 | dynamic | `text-align:right;color:var(--yellow)` |
| 7240 | static | `width:30px` |
| 7275 | dynamic | `font-size:12px` |
| 7275 | dynamic | `color:var(--red);font-style:italic` |
| 7323 | dynamic | `color:var(--muted);opacity:.4;font-size:10px` |
| 7326 | dynamic | `background:rgba(237,129,12,0.05)` |
| 7330 | dynamic | `opacity:.4` |

### Build one side per roster_id (14)

| Line | Mode | Declaration |
|---|---|---|
| 7510 | static | `display:flex;justify-content:space-between;align-items:center;margin-bottom:8px` |
| 7511 | dynamic | `margin-bottom:0` |
| 7517 | dynamic | `${s.isMe ? 'color:var(--red)' : ''}` |
| 7520 | static | `width:28px;height:28px;flex-shrink:0;display:inline-flex;align-items:center;` |
| 7522 | js-composed | `width:28px;height:28px;border-radius:50%;object-fit:cover;` |
| 7526 | static | `min-width:0;flex:1` |
| 7527 | static | `display:flex;align-items:center;gap:4px;flex-wrap:wrap` |
| 7531 | dynamic | `display:flex;gap:8px;margin-top:2px` |
| 7540 | static | `min-width:0;flex:1` |
| 7542 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.35;margin-left:4px` |
| 7543 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--pos-pick-bg);margin-top:2px` |
| 7547 | dynamic | `margin-top:4px` |
| 7548 | static | `width:28px;flex-shrink:0;` |
| 7549 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:12px;color:var(--green)` |

### Temporarily assign global IDs so existing loadRoster can find them (12)

| Line | Mode | Declaration |
|---|---|---|
| 6081 | static | `display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--surface);border:1px solid var(--border);margin-bott...` |
| 6082 | static | `display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;flex-shrink:0;background:var(--surface2);b...` |
| 6082 | static | `display:block` |
| 6083 | static | `flex:1` |
| 6085 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);margin-top:3px` |
| 6088 | static | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px` |
| 6092 | js-composed | `display:flex;align-items:center;gap:12px;padding:11px 12px;background:var(--surface);border:1px solid var(--border);margin-bott...` |
| 6093 | js-composed | `width:30px;height:30px;border-radius:2px;flex-shrink:0` |
| 6093 | js-composed | `width:30px;height:30px;background:var(--surface2);border-radius:2px;flex-shrink:0` |
| 6095 | dynamic | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;color:var(--white);white-space:nowrap;overflow:hidden;text-overf...` |
| 6096 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.7;margin-top:1px` |
| 6098 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;lette...` |

### Ensure roster/users/players are loaded and stashed on window for the modal layer (10)

| Line | Mode | Declaration |
|---|---|---|
| 5634 | dynamic | `display:inline-flex;align-items:center;gap:6px;padding:6px 10px;background:var(--surface2);border:1px solid var(--border);borde...` |
| 5635 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:${color};text-transform:uppercase;letter-...` |
| 5636 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:14px;color:${rankColor}` |
| 5637 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.6` |
| 5647 | dynamic | `display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px` |
| 5659 | static | `display:flex;align-items:center;justify-content:space-between` |
| 5661 | static | `display:flex;align-items:center;gap:8px` |
| 5662 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em` |
| 5664 | static | `background:var(--surface2);border:1px solid var(--border2);color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;fo...` |
| 5681 | dynamic | `display:none` |

### Sort rosters by chosen key (10)

| Line | Mode | Declaration |
|---|---|---|
| 7851 | dynamic | `--bar-width:${w}%;--bar-color:${posColors[pos]}` |
| 7856 | dynamic | `--top-pos-color:${posColors[r.topScoringPos]}` |
| 7875 | dynamic | `--st-pos-color:${posColors.QB}` |
| 7876 | dynamic | `--st-pos-color:${posColors.RB}` |
| 7877 | dynamic | `--st-pos-color:${posColors.WR}` |
| 7878 | dynamic | `--st-pos-color:${posColors.TE}` |
| 7950 | dynamic | `margin-top:20px` |
| 7956 | dynamic | `border-left-color:var(--red)` |
| 7958 | dynamic | `color:var(--white);opacity:.7` |
| 7959 | dynamic | `${isMyPick?'color:var(--red)':''}` |

### Team logo helpers — load BEFORE player-panel.js so modal-hero badge works. (8)

| Line | Mode | Declaration |
|---|---|---|
| 2638 | static | `...` |
| 2695 | static | `...` |
| 2765 | static | `position:fixed;inset:0;background:var(--black);color:var(--white);display:flex;align-items:center;justify-content:center;font-f...` |
| 2766 | static | `background:var(--nav-bg);border-bottom:2px solid var(--red);position:sticky;top:0;z-index:100` |
| 2766 | static | `border:none;position:static` |
| 2769 | static | `fill-rule:evenodd;clip-rule:evenodd` |
| 2812 | static | `background:none;border:1px solid var(--border2);color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:it...` |
| 2841 | static | `display:none` |

### Close player-detail modal if open (5)

| Line | Mode | Declaration |
|---|---|---|
| 4938 | dynamic-context | `margin-top:14px;padding-top:14px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:8px;align-items:center` |
| 4940 | static | `display:inline-block;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:12px;color:var(--white);backgro...` |
| 4942 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-style:italic;text-align:center;line-height:1.5;max-width...` |
| 4956 | dynamic | `color:${diff>0?'var(--red)':diff<0?'var(--green)':'var(--white)'}` |
| 5016 | dynamic-context | `opacity:.5` |

### Total roster value (5)

| Line | Mode | Declaration |
|---|---|---|
| 6880 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:${_rankColor(rank)};padding:1px 6px;backg...` |
| 6884 | static | `display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px;padding:16px;background:var(--surface2);border:1px solid var(--border)` |
| 6885 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 6887 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 6890 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:var(--green)` |

### Trade Builder Modal — opens over the player detail modal (z-index 250) (5)

| Line | Mode | Declaration |
|---|---|---|
| 8134 | static | `z-index:250` |
| 8138 | static | `margin-right:8px` |
| 8145 | static | `z-index:260` |
| 8146 | static | `max-width:540px` |
| 8149 | static | `margin-right:8px` |

### PICKS BRANCH (4)

| Line | Mode | Declaration |
|---|---|---|
| 6277 | static | `background:var(--surface2);display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border)` |
| 6277 | static | `display:block` |
| 6279 | dynamic | `color:#9b91d4` |
| 6282 | dynamic | `color:${expoColor(p.exposure)}` |

### Group transactions by roster (3)

| Line | Mode | Declaration |
|---|---|---|
| 7391 | dynamic | `color:var(--red);font-size:10px;font-style:italic` |
| 7392 | dynamic | `color:var(--yellow)` |
| 7392 | dynamic | `color:var(--green)` |

### Sort state for the leagues list (2)

| Line | Mode | Declaration |
|---|---|---|
| 5428 | dynamic | `width:${w}%;background:${s.color}` |
| 5435 | dynamic-context | `opacity:.3` |

### Save current scoped IDs so the existing loadRoster / loadAllTrades can target them (2)

| Line | Mode | Declaration |
|---|---|---|
| 5762 | dynamic | `--archetype-bg:${mlArchetypeBg(archetype)};--archetype-fg:${mlArchetypeFg(archetype)}` |
| 5773 | dynamic | `--pos-chip-color:${color};--rank-chip-color:${rankColor}` |

### Color helpers (2)

| Line | Mode | Declaration |
|---|---|---|
| 6378 | dynamic | `color:${posColor(p.position)}` |
| 6381 | dynamic | `color:${expoColor(p.exposure)}` |

### Store per-league so multiple leagues can expand without collision (2)

| Line | Mode | Declaration |
|---|---|---|
| 7038 | static | `margin-bottom:12px` |
| 7039 | static | `display:none` |

### Update section meta with archetype legend + league averages (2)

| Line | Mode | Declaration |
|---|---|---|
| 7792 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 7792 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |

### Columns: expandable league list (left) + player exposure (right) (1)

| Line | Mode | Declaration |
|---|---|---|
| 2863 | static | `display:none` |

### Archetype lookup for the owning team (1)

| Line | Mode | Declaration |
|---|---|---|
| 3978 | dynamic | `--archetype-bg:${mlArchetypeBg(r.ownerArchetype)};--archetype-fg:${mlArchetypeFg(r.ownerArchetype)}` |

### Render the current state of the suggestion pre-screener (1)

| Line | Mode | Declaration |
|---|---|---|
| 4345 | dynamic | `--archetype-bg:${mlArchetypeBg(archetype)};--archetype-fg:${mlArchetypeFg(archetype)}` |

### Render the current suggestion as a single card (1)

| Line | Mode | Declaration |
|---|---|---|
| 4475 | dynamic | `--balance-color:${balanceColor}` |

### Close modals on Escape (1)

| Line | Mode | Declaration |
|---|---|---|
| 5064 | dynamic | `color:${color};border-color:${color};background:${bg}` |
