"""
audit-ml-styles.py - one-shot analysis of inline style="..." occurrences in
my-leagues.html. Read-only. Outputs a categorized inventory to
docs/ml-inline-style-inventory.md.

Run once, then delete.
"""
from __future__ import annotations
import re
from collections import Counter, defaultdict
from pathlib import Path

REPO = Path(__file__).resolve().parent
ML_PATH = REPO / "my-leagues.html"
OUT_PATH = REPO / "docs" / "ml-inline-style-inventory.md"

src = ML_PATH.read_text(encoding="utf-8")
lines = src.splitlines()
N = len(lines)

STYLE_RE = re.compile(r'style="([^"]*)"')

# Walk the file and track "what region of the file are we in" via comment headers.
# Heuristic: if a line is one of these patterns, treat the FOLLOWING comment line
# as a section heading; else search the line itself for SECTION-CASE words.
section_at = ["(top)"] * (N + 1)
cur_section = "(top)"

# Patterns that mark the start of a new region (looked up by content rather than format).
NAMED_REGIONS = [
    "TOPNAV", "LOADER", "LEAGUE PICKER", "LEAGUE LIST", "LEAGUE IMPORT",
    "EXPOSURE", "ROSTER", "ROSTER TABLE", "ROSTER ROW",
    "TRADE SIMULATOR", "TRADE BUILDER", "TRADE CALC",
    "PLAYER DETAIL MODAL", "PLAYER PANEL", "CALCULATOR MODAL", "MODAL",
    "PICK EXPOSURE", "PICK PANEL", "PICK SIMULATOR",
    "ACCORDION", "HEATMAP", "FILTERS", "FILTER PANEL",
    "TOAST", "ARCHETYPE", "DRAFT BOARD",
    "DATA BOOTSTRAP", "BOOTSTRAP",
    "STATE", "STORE", "RENDER", "HELPERS",
]

def update_section(i: int, line: str):
    global cur_section
    stripped = line.strip()
    # HTML banner comment: <!-- ... TITLE ... -->
    m = re.match(r"^\s*<!--\s+(.*?)\s*-->\s*$", line)
    if m:
        title = m.group(1).strip()
        # only treat as section if it looks like a banner (uppercase or named)
        if re.match(r"^[A-Z][A-Z0-9 +\-_/&]{2,}$", title) or any(k in title.upper() for k in NAMED_REGIONS):
            cur_section = title
            return
    # JS banner comment: // ── HEADING ──── or // SECTION HEADING
    m = re.match(r"^\s*//\s*(?:[─=]{2,}\s*)?([A-Z][A-Za-z0-9 +\-_/&]{3,}?)\s*(?:[─=]{2,})?\s*$", line)
    if m:
        title = m.group(1).strip()
        if any(k in title.upper() for k in NAMED_REGIONS) or re.match(r"^[A-Z][A-Z ]+$", title):
            cur_section = title
            return
    # Block comment one-liner: /* HEADING */
    m = re.match(r"^\s*/\*\s*([A-Z][A-Za-z0-9 +\-_/&]{3,})\s*\*/\s*$", line)
    if m:
        title = m.group(1).strip()
        if any(k in title.upper() for k in NAMED_REGIONS):
            cur_section = title

for i, ln in enumerate(lines, start=1):
    update_section(i, ln)
    section_at[i] = cur_section


def classify(line: str):
    """Decide whether a style="..." in this line is refactorable or runtime-bound."""
    if "setAttribute" in line and "style" in line:
        return ("js-composed", "el.setAttribute('style', ...)")
    if re.search(r"\.style\.\w+\s*=", line):
        return ("js-composed", "element.style.X = ...")
    has_interp = "${" in line
    has_backtick = "`" in line
    in_js_string = bool(re.search(r"[\"']\s*<[a-z]", line))
    if has_interp:
        return ("dynamic", "${...} interpolation in the style value")
    if has_backtick:
        return ("dynamic-context", "inside a JS template literal")
    if in_js_string:
        return ("dynamic-context", "inside a JS string-literal HTML fragment")
    return ("static", "plain HTML attribute")


hits = []
for i, ln in enumerate(lines, start=1):
    for m in STYLE_RE.finditer(ln):
        decl = m.group(1).strip()
        mode, why = classify(ln)
        hits.append({
            "line": i,
            "decl": decl,
            "mode": mode,
            "why": why,
            "section": section_at[i],
            "preview": ln.strip()[:140],
        })

mode_counts = Counter(h["mode"] for h in hits)
sec_counts = Counter(h["section"] for h in hits)

# Normalized declaration set for grouping
def norm_decl(d: str) -> str:
    d2 = re.sub(r"/\*.*?\*/", "", d)
    parts = sorted(s.strip() for s in d2.split(";") if s.strip())
    return "; ".join(parts)

decl_counts = Counter(norm_decl(h["decl"]) for h in hits)

prop_counts: Counter[str] = Counter()
for h in hits:
    for piece in h["decl"].split(";"):
        piece = piece.strip()
        if ":" in piece:
            prop = piece.split(":", 1)[0].strip().lower()
            if prop and not prop.startswith("/*"):
                prop_counts[prop] += 1

# Console summary
print(f"TOTAL style=... occurrences: {len(hits)}")
print(f"my-leagues.html: {N} lines")
print()
print("MODE BREAKDOWN")
for mode, n in mode_counts.most_common():
    pct = 100 * n / len(hits)
    print(f"  {mode:18s}  {n:4d}  ({pct:5.1f}%)")
print()
print("TOP 15 SECTIONS")
for sec, n in sec_counts.most_common(15):
    print(f"  {n:4d}  {sec[:80]}")
print()
print("TOP 20 REPEATED DECLARATION SETS (>= 2)")
for d, n in decl_counts.most_common(20):
    if n >= 2:
        short = d if len(d) < 130 else d[:127] + "..."
        print(f"  x{n:3d}  {short}")
print()
print("TOP 20 DECLARATION PROPERTIES")
for prop, n in prop_counts.most_common(20):
    print(f"  {n:5d}  {prop}")

# ── Write the full inventory doc ─────────────────────────────────────────
out = []
out.append("# my-leagues.html inline-style inventory")
out.append("")
out.append(f"Generated from `my-leagues.html` ({N} lines).")
out.append(f"Total `style=\"...\"` occurrences: **{len(hits)}**.")
out.append("")
out.append("This is a read-only audit. No code was changed. The goal is to make the")
out.append("refactor safe to execute supervised by giving every occurrence a category,")
out.append("a section assignment, and an actionability verdict.")
out.append("")
out.append("---")
out.append("")
out.append("## Mode breakdown")
out.append("")
out.append("| Mode | Count | % | Refactorable to CSS class? |")
out.append("|---|---|---|---|")
mode_refactor = {
    "static":          "Yes - pure HTML attribute, drop into a class",
    "dynamic":         "Conditional - if the interpolated value is a discrete enum, use a modifier class (e.g. `.is-active`); otherwise leave inline",
    "dynamic-context": "Conditional - inside a JS-built HTML string; refactor only if the declaration set is static",
    "js-composed":     "No - imperatively set at runtime; leave as-is",
}
for mode, n in mode_counts.most_common():
    pct = 100 * n / len(hits)
    out.append(f"| `{mode}` | {n} | {pct:.1f}% | {mode_refactor.get(mode, '-')} |")
out.append("")

# Refactorable share
refactorable = sum(n for m, n in mode_counts.items() if m == "static")
conditional = sum(n for m, n in mode_counts.items() if m in ("dynamic", "dynamic-context"))
js_only = sum(n for m, n in mode_counts.items() if m == "js-composed")
out.append(f"**Headline:** ~{refactorable} are directly refactorable, ~{conditional} require case-by-case judgement, ~{js_only} must stay inline (JS-set).")
out.append("")
out.append("---")
out.append("")
out.append("## Top 25 declaration properties")
out.append("")
out.append("Which CSS properties carry most of the inline styling. Where one property dominates, a single utility class can collapse many sites.")
out.append("")
out.append("| Property | Count |")
out.append("|---|---|")
for prop, n in prop_counts.most_common(25):
    out.append(f"| `{prop}` | {n} |")
out.append("")
out.append("---")
out.append("")
out.append("## Most-repeated declaration sets (>= 2 occurrences)")
out.append("")
out.append("Each row below is a strong refactor candidate: same declaration set appearing N times -> create one class once, replace N sites.")
out.append("")
out.append("| Count | Normalized declaration set |")
out.append("|---|---|")
for d, n in decl_counts.most_common(40):
    if n >= 2:
        short = d if len(d) < 200 else d[:197] + "..."
        short = short.replace("|", "\\|")
        out.append(f"| {n} | `{short}` |")
out.append("")
out.append("---")
out.append("")
out.append("## Occurrences per region")
out.append("")
out.append("Sorted by count - the busiest regions are the highest-leverage refactor batches.")
out.append("")
out.append("| Count | Region (nearest banner-comment heading above the hit) |")
out.append("|---|---|")
for sec, n in sec_counts.most_common():
    out.append(f"| {n} | {sec} |")
out.append("")
out.append("---")
out.append("")
out.append("## Recommended phased refactor plan")
out.append("")
out.append("Each phase is one short, supervised session. Verify in-browser between phases.")
out.append("")
out.append("**Phase A - low-risk batch refactors** (target: the top 5-10 most-repeated declaration sets above)")
out.append("- For each declaration set with count >= 4: add one CSS class to `body.fpts-ml-page` scope, then sweep-replace the matching `style=\"...\"` attributes with `class=\"<new-class>\"`.")
out.append("- Skip occurrences inside JS template literals (mode `dynamic-context`) until Phase C - their host strings rebuild on every render so they're trickier to edit.")
out.append("- Verify: open my-leagues, walk through League Importer -> Roster table -> Exposure list -> Trade Builder -> Heatmap. Spot-check visual diffs.")
out.append("")
out.append("**Phase B - static template attributes** (target: the remaining `static` occurrences not covered by Phase A)")
out.append("- These are the long tail of one-off inline declarations. For each region, decide: keep inline (one-off), promote to a `.ml-<region>-<purpose>` utility class, or absorb into an existing class.")
out.append("- Where the declaration is truly unique to one element, **leaving it inline is fine** - the goal is reducing duplication, not zero-inline-styles.")
out.append("")
out.append("**Phase C - dynamic-context occurrences inside JS template literals**")
out.append("- Look at each `dynamic-context` occurrence. If the declaration set is static (no `${...}`), the only reason it's tagged dynamic is the surrounding backtick. Replace the inline style with a class in the JS template - same edit, just inside a string.")
out.append("- Where the style contains `${...}` (mode `dynamic`), apply the modifier-class pattern when the interpolated value comes from a small enum (e.g. position color, status flag). Where the value is truly continuous (e.g. computed pixel widths), leave inline.")
out.append("")
out.append("**Phase D - JS-set styles**")
out.append("- The `js-composed` count above. **Do not refactor these.** They're imperative DOM mutations; moving them to CSS requires a logic refactor, not a style refactor. Leave them.")
out.append("")
out.append("**Phase E - cleanup**")
out.append("- Re-run `audit-ml-styles.py`. If total occurrences dropped by >70% and the remaining are mostly `js-composed` + truly-one-off, declare the task done.")
out.append("")
out.append("---")
out.append("")
out.append("## All occurrences (by region, with line numbers)")
out.append("")
out.append("Every hit, grouped under the nearest banner-comment heading above it. Use this to find specific lines while refactoring.")
out.append("")
by_section: dict[str, list[dict]] = defaultdict(list)
for h in hits:
    by_section[h["section"]].append(h)
for sec, items in sorted(by_section.items(), key=lambda kv: -len(kv[1])):
    out.append(f"### {sec} ({len(items)})")
    out.append("")
    out.append("| Line | Mode | Declaration |")
    out.append("|---|---|---|")
    for h in items:
        d = h["decl"]
        if len(d) > 130:
            d = d[:127] + "..."
        d = d.replace("|", "\\|")
        out.append(f"| {h['line']} | {h['mode']} | `{d}` |")
    out.append("")

OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
OUT_PATH.write_text("\n".join(out), encoding="utf-8")
print()
print(f"Inventory doc written to: {OUT_PATH}")
print(f"Doc size: {OUT_PATH.stat().st_size:,} bytes")
