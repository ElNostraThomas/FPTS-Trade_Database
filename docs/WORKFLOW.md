# Fantasy Points Front Office — Workflow Reference

Operator's manual. Indexed by "**I want to do X**" so you can find your command fast.

All commands assume you're in the repo root:
`C:\Users\deons\Desktop\05_11_26 dynasty Tool\FPTS-Trade_Database`

---

## 🚀 The one command you'll run 90% of the time

```powershell
push.bat
```

**What it does**, in order:
1. **[1/4]** Pulls fresh data from the Fantasy Points API (6 endpoints) → rewrites `data/*.json`
2. **[2/4]** Pulls fresh data from your Google Sheet "New SF Tier System" → rewrites the `TIER_PLAYERS` block inside `tiers.html`
3. **[3/4]** Regenerates `docs/function-reference.pdf` from the source HTML
4. **[4/4]** Checks for changes — if nothing changed, **exits without prompting** (zero-friction no-op). Otherwise shows the diff, asks for a commit message (press **Enter** to accept the default `Update site + refresh data`), commits, pushes to GitHub Pages — site redeploys in ~2 minutes.

**If any sync step fails**, push.bat aborts before commit. You'll never accidentally ship a broken or stale site.

**Run this after any change.** Code edit, data edit, brand tweak — `push.bat` covers it all.

---

## Every workflow, ordered by frequency

### 1. Update tier rankings (most common)

**A. Hand-edit the Google Sheet** (small tweaks, single players moving tiers)

1. Open your Google Sheet "Fantasy Points Trade Tiers (03/19/26)".
2. Drag players between tier sections, edit any column.
3. Save (it auto-saves).
4. Run `push.bat` — `sync-tiers.py` reads the sheet and updates `tiers.html`.

**B. Bulk import a new TAT CSV** (whole new ranking cycle)

1. Save the new TAT CSV to your `Downloads` folder (filename starts with `TAT`).
2. Run:
   ```powershell
   python import-tat.py
   ```
   Auto-detects the newest `TAT*.csv` in Downloads, **merges** the new tier assignments into your Google Sheet (keeps Age/ADP/Auction/PPG/Buy-Sell/Priority/Contender/Notes you've already filled in).
3. Run `push.bat` to deploy.

**Modes** for `import-tat.py`:
- `python import-tat.py` — default merge (preserves your hand-filled columns)
- `python import-tat.py --dry-run` — preview what would change, no upload
- `python import-tat.py --replace path/to.csv` — full overwrite of the sheet (loses hand-filled data)
- `python import-tat.py --whoami` — print the service-account email if you need to re-share the sheet

### 2. Edit a page (HTML / CSS / JavaScript)

1. Open the relevant `*.html` file in your text editor.
2. Save.
3. Test locally first:
   ```powershell
   start.bat
   ```
   Opens `http://localhost:8000/index.html` in your browser. Click around, confirm nothing's broken.
4. Run `push.bat`.

The 4 main pages:
- `index.html` — Trade Database (hub)
- `my-leagues.html` — Sleeper League Importer
- `tiers.html` — Dynasty Trade Tiers (data is auto-synced; don't hand-edit the `TIER_PLAYERS` block)
- `trade-calculator.html` — Trade Calculator

### 3. Update the function reference doc (the printable PDF)

1. Edit `docs/function-reference.html` directly.
2. Run `push.bat`. `make-pdf.ps1` regenerates `docs/function-reference.pdf` automatically.

### 4. Refresh FP API data without pushing

If you want to see the latest API data locally without deploying:

```powershell
python sync-fp.py
```

Updates `data/*.json` in place. You can then `start.bat` to preview before pushing.

### 5. Refresh tier data without pushing

```powershell
python sync-tiers.py
```

Pulls from the Google Sheet and rewrites the `TIER_PLAYERS` block in `tiers.html`. Same standalone-test logic as above.

### 6. Regenerate the PDF only (without re-fetching anything)

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File make-pdf.ps1
```

Useful if you only edited `docs/function-reference.html` and want to preview the PDF without doing a full push.

### 7. Test the site locally

```powershell
start.bat
```

Opens `http://localhost:8000/index.html` in your default browser. The page hits `data/*.json` from your local filesystem — same as the deployed site. Useful for previewing changes before pushing.

To stop the server: close the PowerShell window that's running it, or press `Ctrl+C` in that window.

### 8. Rotate your FP API key

If someone gives you a new X-Source or Authorization value:

1. Open `sync-fp.config.json` in Notepad.
2. Replace the old `x_source` and/or `auth_token` values.
3. Save.
4. Test:
   ```powershell
   python sync-fp.py
   ```
5. Run `push.bat`.

### 9. Rotate the Google Sheets service account

1. Generate a new key from Google Cloud Console for the service account.
2. Save the JSON file to the repo root as `service-account.json` (overwrite the existing one).
3. If you changed which service account, re-share the Google Sheet with the new email (Editor access).
4. Test:
   ```powershell
   python sync-tiers.py
   ```
5. Run `push.bat`.

### 10. Add a new data source (future)

If FP adds new endpoints you want to use, or you want to add a new data input:

1. Open `sync-fp.py`, add another `fp_get(cfg, "/v2/your/new/endpoint")` call inside `main()`.
2. Build a new `data/your-new-data.json` write at the end of `main()`.
3. Open each HTML file that needs the new data, add a `fetch('data/your-new-data.json' + v)` line inside the existing `_fpBootstrap` block.
4. Reference the loaded data anywhere downstream.

---

## File inventory — what every file is for

### The site (always tracked in git, deploys to GitHub Pages)

| File | Purpose |
|---|---|
| `index.html` | Trade Database — the hub |
| `my-leagues.html` | Sleeper user/league importer |
| `tiers.html` | Dynasty trade tiers table (data auto-synced from Google Sheet) |
| `trade-calculator.html` | Trade calculator |
| `data/values.json` | Player trade values (auto-generated by `sync-fp.py`) |
| `data/adp.json` | Dynasty ADP per player (auto-generated) |
| `data/picks.json` | Rookie pick values (auto-generated) |
| `data/projections.json` | Weekly + season projections (auto-generated) |
| `data/articles.json` | Player → recent articles map (auto-generated) |
| `docs/function-reference.html` | Source of the function reference (hand-edited) |
| `docs/function-reference.pdf` | Generated from the HTML by `make-pdf.ps1` |
| `docs/WORKFLOW.md` | This file |
| `assets/fonts/` | Brand TTFs (Kanit, Mulish) |

### Local-only scripts (gitignored, never deploy)

| File | Purpose |
|---|---|
| `start.bat` | Run local dev server on `http://localhost:8000/` |
| `push.bat` | Full deploy pipeline (the command you run) |
| `make-pdf.ps1` | Headless-Chrome PDF generator |
| `sync-fp.py` | Fetch FP API → write `data/*.json` |
| `sync-tiers.py` | Fetch Google Sheet → write to `tiers.html` |
| `import-tat.py` | Upload TAT CSV → Google Sheet (merge mode) |

### Local-only secrets (gitignored, never deploy)

| File | Holds | Get from |
|---|---|---|
| `sync-fp.config.json` | FP API key (`x_source`, `auth_token`) | Your FP dev contact |
| `sync-tiers.config.json` | Google Sheet ID + tab name | The sheet URL |
| `service-account.json` | Google Cloud service account credentials | Google Cloud Console |

### Templates (tracked in git — used to seed a new local setup)

| File | Use |
|---|---|
| `sync-fp.config.example.json` | Copy → `sync-fp.config.json`, fill in your key |
| `sync-tiers.config.example.json` | Copy → `sync-tiers.config.json`, fill in your sheet ID |

---

## Common troubleshooting

### "401 Unauthorized" when running `sync-fp.py`

Your `sync-fp.config.json` has wrong or missing auth.
- Open the file in Notepad.
- Check that `x_source` is the letters value and `auth_token` is the numbers value (not swapped).
- Make sure there are no stray spaces or quotes around the values.
- Re-run `python sync-fp.py`.

### "Permission denied" when running `sync-tiers.py` or `import-tat.py`

The service account needs Editor access on the Google Sheet (not just Viewer).
1. Run `python import-tat.py --whoami` to get the service-account email.
2. Open the sheet → Share → find that email → set to **Editor** → Save.

### `push.bat` says "Tiers sync failed - aborting"

`sync-tiers.py` couldn't reach the Google Sheet. Most often:
- The sheet ID in `sync-tiers.config.json` is wrong.
- Your service account lost access to the sheet.
- Network blip — try again.

To debug: run `python sync-tiers.py` standalone, look at the error.

### Page on the live site shows "Data load failed"

The `data/*.json` files didn't make it to the deploy.
- Open DevTools → Network tab on the live site, look for 404s on `data/*.json`.
- Run `python sync-fp.py` locally, confirm data files are generated.
- Re-run `push.bat`.

### My local edits don't show up after `push.bat`

GitHub Pages takes ~2 minutes to redeploy. Wait, then hard-refresh with `Ctrl+Shift+R` to bypass browser cache.

### Page is missing player data temporarily

The `_fp-loading` overlay should show "Loading…" for ~100ms while `data/*.json` files load. If it stays forever:
- Hard-refresh.
- Open DevTools → Network → look for failed `data/*.json` requests.
- Confirm those files exist in the deployed repo (`git ls-files data/`).

---

## What the user-visible "Front Office" branding is

- Wordmark: `FANTASY POINTS` (the SVG logotype) + `FRONT OFFICE` (CSS text in Kanit Extrabold Italic 800).
- Accent color: `#ED810C` (dynasty orange), bound to the `--red` CSS variable for backward compatibility.
- Brand fonts: Kanit ExtraBold Italic + Mulish variable. Self-hosted from `assets/fonts/`.

If FantasyPoints rebrands to "Dynasty Points", the only change needed is:
- Swap the wordmark SVG in each HTML file's nav.
- The `FRONT OFFICE` span stays.
- The `<title>` prefix changes.

---

## One-time setup (if you ever start from a fresh machine)

1. Clone the repo: `git clone https://github.com/<your-account>/<repo>.git`
2. Copy `sync-fp.config.example.json` → `sync-fp.config.json`. Paste your FP API key fields.
3. Copy `sync-tiers.config.example.json` → `sync-tiers.config.json`. Paste your Google Sheet ID.
4. Put your service-account JSON file at `service-account.json` in the repo root.
5. Install Python dependencies:
   ```powershell
   python -m pip install requests google-api-python-client google-auth
   ```
6. Test the syncs:
   ```powershell
   python sync-fp.py
   python sync-tiers.py
   ```
7. Test locally:
   ```powershell
   start.bat
   ```
8. Deploy:
   ```powershell
   push.bat
   ```

---

## Quick command index

| Goal | Command |
|---|---|
| Deploy everything | `push.bat` |
| Preview locally | `start.bat` |
| Refresh FP data only | `python sync-fp.py` |
| Refresh tier rankings only | `python sync-tiers.py` |
| Upload TAT CSV to sheet | `python import-tat.py` |
| Dry-run TAT upload | `python import-tat.py --dry-run` |
| Service-account email | `python import-tat.py --whoami` |
| Rebuild PDF only | `powershell -NoProfile -ExecutionPolicy Bypass -File make-pdf.ps1` |
