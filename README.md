# Fantasy Points Front Office — Session Handoff

A static fantasy-football site deployed via GitHub Pages from `main`.
Four HTML pages: `index.html` (trade DB), `trade-calculator.html`, `tiers.html`, `my-leagues.html`.

Full operator manual: [`docs/WORKFLOW.md`](docs/WORKFLOW.md). This file is the
**resume-where-we-left-off** doc.

---

## State as of last session (2026-05-11)

**Architecture**
- `sync-fp.py` pulls both Fantasy Points **and** Sleeper in one run, merges them
  per-player, writes `data/*.json`. FP owns value/rank/ADP/auction/picks/articles/trend.
  Sleeper owns age/team/pos/injury/PPG/projections.
- `tiers.html` overlays Sleeper attributes onto Google-Sheet tier rows at page load.
- All four pages bootstrap-fetch `data/*.json` at runtime; no embedded player data.

**Recently shipped (in this session)**
- Hybrid FP + Sleeper sync (`sync-fp.py` rewrite).
- `data/values.json` gained `age`, `injury`, `sleeperId`, real `ppg` from 2025 stats.
- `data/projections.json` reshaped to Sleeper format (keyed by `sleeper_id`).
- Articles fix: absolute URLs to `fantasypoints.com`, `date` field name corrected.
- Apostrophe-escape bug fixed at 12 call sites in `index.html` / `trade-calculator.html`
  (players like Ja'Marr Chase, D'Andre Swift now clickable in dropdowns).
- Player Exposure search in `my-leagues.html` now surfaces non-rostered players
  at 0% so Josh Allen etc. show up even when not on your rosters.
- `KNOWN_PLAYERS` arrays emptied; FP_VALUES (~947 players) is now the comprehensive
  player universe everywhere.

**Pending (you'll do these)**
- [ ] **Run `push.bat` to deploy** — there are uncommitted changes on disk
      (10 files including `sync-fp.py`, all four HTML pages, and regenerated
      `data/*.json`). GitHub Pages redeploys ~2 minutes after push.
- [ ] After deploy, smoke-test:
  - Trade DB / Trade Calculator: search "ja'marr" — Ja'Marr Chase should be
    clickable; search "josh allen" — should appear and be clickable.
  - my-leagues Player Exposure: search "josh allen" — should appear at 0%
    if you don't own him in any league.
  - tiers.html: ages/teams/PPG should reflect Sleeper data (refresh after
    `data/values.json` deploys).
- [ ] Annual rotation reminder: `SLEEPER_STATS_SEASON = "2025"` near the top of
      `sync-fp.py` needs to flip to `"2026"` after Week 18 of the 2026 season
      closes out (early 2027). Stats and PPG will be stale otherwise.

---

## How to start the next Claude Code session

When you open the new session, paste this as your first message:

```
Read README.md to see where we left off. Confirm the deploy went through
by running `git log --oneline -5` and `git status`. Then wait for my next
instruction.
```

That's it — Claude will load the memory files automatically (architecture,
brand, escape-pitfall, etc.) and `README.md` will tell it about the
in-progress work. From there, just describe what you want next.

If you want Claude to also re-pull fresh data before you work:
```
Read README.md, confirm clean tree, then run `python sync-fp.py` so we're
on the latest Sleeper + FP data before I tell you what's next.
```

---

## Top commands

| What | Command |
|---|---|
| Deploy everything (the 90% command) | `push.bat` |
| Preview locally | `start.bat` → opens http://localhost:8000/ |
| Refresh FP+Sleeper data without pushing | `python sync-fp.py` |
| Refresh tier rankings from Google Sheet | `python sync-tiers.py` |
| Bulk-import a new TAT CSV | `python import-tat.py` |
| Service-account email (Google Sheets perms) | `python import-tat.py --whoami` |

Full reference: `docs/WORKFLOW.md`.

---

## File map (the ones you'll touch)

- **`index.html`** — trade database (largest, ~8500 lines; use Grep/offsets, never read in full)
- **`trade-calculator.html`** — trade value calculator
- **`tiers.html`** — dynasty trade tiers (data auto-synced from Google Sheet + Sleeper overlay)
- **`my-leagues.html`** — Sleeper user/league importer
- **`sync-fp.py`** — pulls FP + Sleeper, writes `data/*.json` (local-only, gitignored)
- **`sync-tiers.py`** — pulls Google Sheet, rewrites `tiers.html` TIER_PLAYERS block
- **`import-tat.py`** — uploads TAT CSV to Google Sheet (local-only)
- **`push.bat`** — runs syncs → rebuilds PDF → commits + pushes (local-only)
- **`docs/WORKFLOW.md`** — full operator manual
- **`docs/function-reference.html`** + **`.pdf`** — printable function reference
