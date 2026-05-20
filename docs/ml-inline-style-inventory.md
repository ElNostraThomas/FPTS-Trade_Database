# my-leagues.html inline-style inventory

Generated from `my-leagues.html` (8064 lines).
Total `style="..."` occurrences: **211**.

This is a read-only audit. No code was changed. The goal is to make the
refactor safe to execute supervised by giving every occurrence a category,
a section assignment, and an actionability verdict.

---

## Mode breakdown

| Mode | Count | % | Refactorable to CSS class? |
|---|---|---|---|
| `dynamic` | 103 | 48.8% | Conditional - if the interpolated value is a discrete enum, use a modifier class (e.g. `.is-active`); otherwise leave inline |
| `static` | 94 | 44.5% | Yes - pure HTML attribute, drop into a class |
| `dynamic-context` | 8 | 3.8% | Conditional - inside a JS-built HTML string; refactor only if the declaration set is static |
| `js-composed` | 6 | 2.8% | No - imperatively set at runtime; leave as-is |

**Headline:** ~94 are directly refactorable, ~111 require case-by-case judgement, ~6 must stay inline (JS-set).

---

## Top 25 declaration properties

Which CSS properties carry most of the inline styling. Where one property dominates, a single utility class can collapse many sites.

| Property | Count |
|---|---|
| `color` | 82 |
| `font-size` | 53 |
| `font-family` | 50 |
| `display` | 47 |
| `font-style` | 33 |
| `font-weight` | 32 |
| `width` | 32 |
| `align-items` | 30 |
| `background` | 27 |
| `opacity` | 26 |
| `gap` | 23 |
| `flex-shrink` | 23 |
| `padding` | 18 |
| `border` | 17 |
| `fill-rule` | 15 |
| `height` | 15 |
| `margin-bottom` | 15 |
| `fill` | 14 |
| `border-radius` | 14 |
| `letter-spacing` | 12 |
| `text-transform` | 11 |
| `margin-top` | 11 |
| `justify-content` | 9 |
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
| 2 | `--archetype-bg:${mlArchetypeBg(archetype)}; --archetype-fg:${mlArchetypeFg(archetype)}` |
| 2 | `opacity:.5` |
| 2 | `opacity:.3` |
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

### Sort rosters by chosen key (24)

| Line | Mode | Declaration |
|---|---|---|
| 7757 | js-composed | `width:26px;height:26px;border-radius:50%;object-fit:cover;margin-right:8px;flex-shrink:0;` |
| 7758 | dynamic-context | `width:26px;height:26px;border-radius:50%;background:var(--border2);margin-right:8px;flex-shrink:0;` |
| 7763 | dynamic | `height:100%;width:${w}%;background:${posColors[pos]};flex-shrink:0;` |
| 7766 | dynamic | `${rowBg}` |
| 7767 | dynamic | `color:var(--muted);opacity:.3;width:28px` |
| 7771 | dynamic | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;${r.isMe?'color:var(--red)':''}` |
| 7772 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:9px;color:var(--red);border:1px solid var(--red);pad...` |
| 7774 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:9px;color:${posColors[r.topScoringPos]};border:1px s...` |
| 7776 | static | `height:4px;background:var(--border);margin-top:5px;border-radius:2px;overflow:hidden;display:flex` |
| 7780 | dynamic | `color:var(--white)` |
| 7782 | dynamic | `color:${posColors.QB}` |
| 7783 | dynamic | `color:${posColors.RB}` |
| 7784 | dynamic | `color:${posColors.WR}` |
| 7785 | dynamic | `color:${posColors.TE}` |
| 7786 | dynamic | `color:var(--green)` |
| 7787 | dynamic | `color:var(--white);opacity:.5` |
| 7788 | dynamic | `color:var(--white);opacity:.5` |
| 7794 | static | `overflow-x:auto;-webkit-overflow-scrolling:touch` |
| 7795 | static | `width:100%;border-collapse:collapse;min-width:560px` |
| 7797 | static | `width:28px` |
| 7857 | dynamic | `margin-top:20px` |
| 7863 | dynamic | `border-left-color:var(--red)` |
| 7865 | dynamic | `color:var(--white);opacity:.7` |
| 7866 | dynamic | `${isMyPick?'color:var(--red)':''}` |

### Render an archetype chip (22)

| Line | Mode | Declaration |
|---|---|---|
| 3439 | dynamic | `display:inline-flex;align-items:center;justify-content:center;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;...` |
| 3442 | dynamic | `display:inline-flex;align-items:center;justify-content:center;background:${c};color:#fff;font-family:'Kanit',sans-serif;font-we...` |
| 3446 | dynamic-context | `width:32px;height:32px;flex-shrink:0;display:inline-block;` |
| 3447 | js-composed | `width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0;` |
| 3452 | dynamic-context | `width:32px;height:32px;border-radius:50%;background:var(--surface2);display:inline-flex;align-items:center;justify-content:cent...` |
| 3453 | static | `display:block` |
| 3537 | static | `display:flex;align-items:center;gap:8px;margin-bottom:6px` |
| 3539 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5` |
| 3541 | static | `display:flex;align-items:center;gap:10px;min-height:24px` |
| 3542 | static | `display:none;margin-top:8px` |
| 3544 | static | `background:none;border:none;color:var(--muted);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;...` |
| 3548 | static | `font-size:8px;transition:transform .15s` |
| 3550 | static | `display:none;margin-top:8px;padding-top:8px;border-top:1px solid var(--border)` |
| 3584 | static | `display:flex;align-items:center;gap:10px;width:100%;padding:8px 12px;background:rgba(237,129,12,0.06);border:1px dashed var(--b...` |
| 3585 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted);font-style:italic;flex:1;min-width:0` |
| 3587 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3602 | static | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;color:var(--white);text-decoration:none;flex:1;min-width:0;overf...` |
| 3606 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;flex-shrink:0` |
| 3608 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:10px;color:var(--red);text-decoration:none;text-tran...` |
| 3618 | static | `display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border)` |
| 3620 | static | `font-family:'Mulish',sans-serif;font-weight:700;font-size:12px;color:var(--white);text-decoration:none;flex:1;min-width:0;overf...` |
| 3624 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5;flex-shrink:0` |

### RIGHT: player exposure sidebar (21)

| Line | Mode | Declaration |
|---|---|---|
| 2797 | static | `display:flex;align-items:center;gap:8px` |
| 2798 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);width:12px;text-align:center;flex-shrink:0;transition:transfo...` |
| 2804 | static | `display:none` |
| 2823 | static | `width:24px;flex-shrink:0` |
| 2824 | static | `flex:1` |
| 2839 | static | `fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;` |
| 2839 | static | `fill:#c33;` |
| 2839 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2839 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2839 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2839 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2839 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2839 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2839 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2839 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2839 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2839 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2839 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2839 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2839 | static | `fill:var(--black);fill-rule:nonzero;` |
| 2841 | dynamic-context | `flex-shrink:0;vertical-align:middle;margin-right:4px` |

### Helpers (19)

| Line | Mode | Declaration |
|---|---|---|
| 6628 | dynamic | `color:var(--green);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 6629 | dynamic | `color:var(--red);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 6630 | dynamic-context | `opacity:.3` |
| 6635 | dynamic | `width:36px;padding-right:8px` |
| 6640 | dynamic | `display:inline-flex;align-items:center` |
| 6644 | dynamic | `color:var(--white)` |
| 6645 | dynamic | `color:var(--white);font-size:12px` |
| 6646 | dynamic | `color:${valColor(r.value)}` |
| 6647 | dynamic | `color:var(--white);font-size:12px` |
| 6648 | dynamic | `color:${r.seasonProj ? 'var(--white)' : 'var(--muted)'};opacity:${r.seasonProj ? '1' : '.3'}` |
| 6649 | dynamic | `color:${r.proj ? (r.proj >= 20 ? 'var(--green)' : r.proj >= 12 ? 'var(--white)' : 'var(--muted)') : 'var(--muted)'};opacity:${r...` |
| 6652 | dynamic | `color:var(--white)` |
| 6665 | static | `display:flex;align-items:center;gap:10px` |
| 6666 | dynamic | `width:4px;height:20px;background:${posColors[pos]};flex-shrink:0` |
| 6668 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);opacity:.4` |
| 6670 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:${posColors[pos]}` |
| 6672 | static | `overflow-x:auto;-webkit-overflow-scrolling:touch` |
| 6673 | static | `width:100%;border-collapse:collapse;min-width:430px` |
| 6675 | static | `width:36px` |

### Renders draft picks in the same visual layout as a position section so the (15)

| Line | Mode | Declaration |
|---|---|---|
| 6712 | static | `display:flex;align-items:center;gap:10px;margin-bottom:10px` |
| 6713 | static | `width:4px;height:20px;background:var(--pos-pick-bg);flex-shrink:0` |
| 6716 | static | `font-size:13px;opacity:.4;padding:12px 0;font-family:'Mulish',sans-serif` |
| 6737 | dynamic | `border-bottom:1px solid var(--border)` |
| 6738 | dynamic | `width:36px;padding-right:8px` |
| 6742 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.5` |
| 6746 | dynamic | `color:${val > 3000 ? 'var(--green)' : val > 1000 ? 'var(--white)' : 'var(--muted)'}` |
| 6747 | dynamic | `color:var(--muted);opacity:.4;font-size:11px` |
| 6755 | static | `display:flex;align-items:center;gap:10px` |
| 6756 | static | `width:4px;height:20px;background:var(--pos-pick-bg);flex-shrink:0` |
| 6758 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);opacity:.4` |
| 6760 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:var(--pos-pick-bg)` |
| 6762 | static | `overflow-x:auto` |
| 6763 | static | `width:100%;border-collapse:collapse;min-width:520px` |
| 6765 | static | `width:36px` |

### Stash render context on window so the sort buttons can re-render (15)

| Line | Mode | Declaration |
|---|---|---|
| 7659 | static | `margin-bottom:24px` |
| 7660 | static | `display:flex;align-items:center;justify-content:space-between;margin-bottom:12px` |
| 7661 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;lette...` |
| 7662 | dynamic | `font-family:'Mulish',sans-serif;font-size:12px;color:var(--muted)` |
| 7662 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;color:${+myTeam.mpxPct>=90?'var(--green)':+myTeam.mpxPct>=75?'...` |
| 7662 | dynamic | `opacity:.5` |
| 7664 | static | `display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px` |
| 7675 | dynamic | `background:var(--surface2);border:1px solid var(--border);padding:12px 14px;border-left:3px solid ${posColors[pos]}` |
| 7676 | dynamic | `margin-bottom:6px` |
| 7677 | static | `display:flex;gap:12px;align-items:flex-end` |
| 7680 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:${color}` |
| 7683 | dynamic | `border-left:1px solid var(--border2);padding-left:12px` |
| 7685 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:${scoreColor}` |
| 7688 | dynamic | `border-left:1px solid var(--border2);padding-left:12px` |
| 7694 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.35;margin-top:4px` |

### Aggregate per-roster (14)

| Line | Mode | Declaration |
|---|---|---|
| 7085 | static | `width:30px` |
| 7105 | dynamic | `color:var(--red);font-size:10px;font-style:italic` |
| 7110 | dynamic | `color:var(--yellow)` |
| 7111 | dynamic | `width:${maxSpent ? (r.spent/maxSpent*100).toFixed(0) : 0}%` |
| 7112 | dynamic | `color:var(--green)` |
| 7113 | dynamic | `width:${budget ? (r.left/budget*100).toFixed(0) : 0}%` |
| 7115 | dynamic | `text-align:right;color:var(--muted)` |
| 7117 | dynamic | `text-align:right;color:var(--yellow)` |
| 7155 | static | `width:30px` |
| 7190 | dynamic | `font-size:12px` |
| 7190 | dynamic | `color:var(--red);font-style:italic` |
| 7238 | dynamic | `color:var(--muted);opacity:.4;font-size:10px` |
| 7241 | dynamic | `background:rgba(237,129,12,0.05)` |
| 7245 | dynamic | `opacity:.4` |

### Build one side per roster_id (14)

| Line | Mode | Declaration |
|---|---|---|
| 7425 | static | `display:flex;justify-content:space-between;align-items:center;margin-bottom:8px` |
| 7426 | dynamic | `margin-bottom:0` |
| 7432 | dynamic | `${s.isMe ? 'color:var(--red)' : ''}` |
| 7435 | static | `width:28px;height:28px;flex-shrink:0;display:inline-flex;align-items:center;` |
| 7437 | js-composed | `width:28px;height:28px;border-radius:50%;object-fit:cover;` |
| 7441 | static | `min-width:0;flex:1` |
| 7442 | static | `display:flex;align-items:center;gap:4px;flex-wrap:wrap` |
| 7446 | dynamic | `display:flex;gap:8px;margin-top:2px` |
| 7455 | static | `min-width:0;flex:1` |
| 7457 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.35;margin-left:4px` |
| 7458 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--pos-pick-bg);margin-top:2px` |
| 7462 | dynamic | `margin-top:4px` |
| 7463 | static | `width:28px;flex-shrink:0;` |
| 7464 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:12px;color:var(--green)` |

### Temporarily assign global IDs so existing loadRoster can find them (12)

| Line | Mode | Declaration |
|---|---|---|
| 5996 | static | `display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--surface);border:1px solid var(--border);margin-bott...` |
| 5997 | static | `display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;flex-shrink:0;background:var(--surface2);b...` |
| 5997 | static | `display:block` |
| 5998 | static | `flex:1` |
| 6000 | dynamic | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);margin-top:3px` |
| 6003 | static | `font-family:'Mulish',sans-serif;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px` |
| 6007 | js-composed | `display:flex;align-items:center;gap:12px;padding:11px 12px;background:var(--surface);border:1px solid var(--border);margin-bott...` |
| 6008 | js-composed | `width:30px;height:30px;border-radius:2px;flex-shrink:0` |
| 6008 | js-composed | `width:30px;height:30px;background:var(--surface2);border-radius:2px;flex-shrink:0` |
| 6010 | dynamic | `font-family:'Mulish',sans-serif;font-weight:900;font-size:13px;color:var(--white);white-space:nowrap;overflow:hidden;text-overf...` |
| 6011 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.7;margin-top:1px` |
| 6013 | static | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:var(--red);text-transform:uppercase;lette...` |

### Ensure roster/users/players are loaded and stashed on window for the modal layer (10)

| Line | Mode | Declaration |
|---|---|---|
| 5549 | dynamic | `display:inline-flex;align-items:center;gap:6px;padding:6px 10px;background:var(--surface2);border:1px solid var(--border);borde...` |
| 5550 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;color:${color};text-transform:uppercase;letter-...` |
| 5551 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:14px;color:${rankColor}` |
| 5552 | dynamic | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);opacity:.6` |
| 5562 | dynamic | `display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px` |
| 5574 | static | `display:flex;align-items:center;justify-content:space-between` |
| 5576 | static | `display:flex;align-items:center;gap:8px` |
| 5577 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em` |
| 5579 | static | `background:var(--surface2);border:1px solid var(--border2);color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;fo...` |
| 5596 | dynamic | `display:none` |

### Team logo helpers — load BEFORE player-panel.js so modal-hero badge works. (8)

| Line | Mode | Declaration |
|---|---|---|
| 2553 | static | `...` |
| 2610 | static | `...` |
| 2680 | static | `position:fixed;inset:0;background:var(--black);color:var(--white);display:flex;align-items:center;justify-content:center;font-f...` |
| 2681 | static | `background:var(--nav-bg);border-bottom:2px solid var(--red);position:sticky;top:0;z-index:100` |
| 2681 | static | `border:none;position:static` |
| 2684 | static | `fill-rule:evenodd;clip-rule:evenodd` |
| 2727 | static | `background:none;border:1px solid var(--border2);color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:it...` |
| 2756 | static | `display:none` |

### Close player-detail modal if open (5)

| Line | Mode | Declaration |
|---|---|---|
| 4853 | dynamic-context | `margin-top:14px;padding-top:14px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:8px;align-items:center` |
| 4855 | static | `display:inline-block;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:12px;color:var(--white);backgro...` |
| 4857 | static | `font-family:'Mulish',sans-serif;font-size:10px;color:var(--muted);font-style:italic;text-align:center;line-height:1.5;max-width...` |
| 4871 | dynamic | `color:${diff>0?'var(--red)':diff<0?'var(--green)':'var(--white)'}` |
| 4931 | dynamic-context | `opacity:.5` |

### Total roster value (5)

| Line | Mode | Declaration |
|---|---|---|
| 6795 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:${_rankColor(rank)};padding:1px 6px;backg...` |
| 6799 | static | `display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px;padding:16px;background:var(--surface2);border:1px solid var(--border)` |
| 6800 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 6802 | dynamic | `display:flex;align-items:center;gap:8px;margin-bottom:2px` |
| 6805 | dynamic | `font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:22px;color:var(--green)` |

### Trade Builder Modal — opens over the player detail modal (z-index 250) (5)

| Line | Mode | Declaration |
|---|---|---|
| 8041 | static | `z-index:250` |
| 8045 | static | `margin-right:8px` |
| 8052 | static | `z-index:260` |
| 8053 | static | `max-width:540px` |
| 8056 | static | `margin-right:8px` |

### PICKS BRANCH (4)

| Line | Mode | Declaration |
|---|---|---|
| 6192 | static | `background:var(--surface2);display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--border)` |
| 6192 | static | `display:block` |
| 6194 | dynamic | `color:#9b91d4` |
| 6197 | dynamic | `color:${expoColor(p.exposure)}` |

### Group transactions by roster (3)

| Line | Mode | Declaration |
|---|---|---|
| 7306 | dynamic | `color:var(--red);font-size:10px;font-style:italic` |
| 7307 | dynamic | `color:var(--yellow)` |
| 7307 | dynamic | `color:var(--green)` |

### Sort state for the leagues list (2)

| Line | Mode | Declaration |
|---|---|---|
| 5343 | dynamic | `width:${w}%;background:${s.color}` |
| 5350 | dynamic-context | `opacity:.3` |

### Save current scoped IDs so the existing loadRoster / loadAllTrades can target them (2)

| Line | Mode | Declaration |
|---|---|---|
| 5677 | dynamic | `--archetype-bg:${mlArchetypeBg(archetype)};--archetype-fg:${mlArchetypeFg(archetype)}` |
| 5688 | dynamic | `--pos-chip-color:${color};--rank-chip-color:${rankColor}` |

### Color helpers (2)

| Line | Mode | Declaration |
|---|---|---|
| 6293 | dynamic | `color:${posColor(p.position)}` |
| 6296 | dynamic | `color:${expoColor(p.exposure)}` |

### Store per-league so multiple leagues can expand without collision (2)

| Line | Mode | Declaration |
|---|---|---|
| 6953 | static | `margin-bottom:12px` |
| 6954 | static | `display:none` |

### Update section meta with archetype legend + league averages (2)

| Line | Mode | Declaration |
|---|---|---|
| 7707 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |
| 7707 | dynamic | `color:var(--white);font-family:'Kanit',sans-serif;font-weight:800;font-style:italic` |

### Columns: expandable league list (left) + player exposure (right) (1)

| Line | Mode | Declaration |
|---|---|---|
| 2778 | static | `display:none` |

### Archetype lookup for the owning team (1)

| Line | Mode | Declaration |
|---|---|---|
| 3893 | dynamic | `--archetype-bg:${mlArchetypeBg(r.ownerArchetype)};--archetype-fg:${mlArchetypeFg(r.ownerArchetype)}` |

### Render the current state of the suggestion pre-screener (1)

| Line | Mode | Declaration |
|---|---|---|
| 4260 | dynamic | `--archetype-bg:${mlArchetypeBg(archetype)};--archetype-fg:${mlArchetypeFg(archetype)}` |

### Render the current suggestion as a single card (1)

| Line | Mode | Declaration |
|---|---|---|
| 4390 | dynamic | `--balance-color:${balanceColor}` |

### Close modals on Escape (1)

| Line | Mode | Declaration |
|---|---|---|
| 4979 | dynamic | `color:${color};border-color:${color};background:${bg}` |
