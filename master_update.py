"""
FPTS Dynasty - Data Updater v3
Fetches real data from FantasyCalc + Sleeper and injects into HTML files.

Usage:
  1. Place in same folder as index.html and trade-calculator.html
  2. pip install requests
  3. python master_update.py
"""

import json, re, sys, time, os, shutil
from pathlib import Path

try:
    import requests
except ImportError:
    print("ERROR: run 'pip install requests' first")
    sys.exit(1)

# ── Config ─────────────────────────────────────────────────────────────────
BASE      = Path(os.path.dirname(os.path.abspath(__file__)))
DB_FILE   = BASE / "index.html"
CALC_FILE = BASE / "trade-calculator.html"
SEASON    = "2025"
SEASON_FALLBACK = "2024"

# ── Helpers ────────────────────────────────────────────────────────────────
def log(msg): print(f"  {msg}")
def ok(msg):  print(f"  OK  {msg}")
def err(msg): print(f"  ERR {msg}")

def safe_get(url, label, params=None):
    try:
        r = requests.get(url, params=params, timeout=20)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        log(f"Failed [{label}]: {e}")
        return None

# ── Read/Write HTML ────────────────────────────────────────────────────────
def read_html(path):
    if not path.exists():
        err(f"{path.name} not found in {path.parent}")
        return None
    with open(path, encoding='utf-8', errors='ignore') as f:
        return f.read()

def write_html(path, content):
    with open(str(path), "w", encoding="utf-8") as f:
        f.write(content)

# ── Step 1: FantasyCalc ────────────────────────────────────────────────────
def fetch_fantasycalc():
    print("\n[1] Fetching FantasyCalc values...")
    sf = safe_get(
        "https://api.fantasycalc.com/values/current", "FC SF",
        params={"isDynasty":"true","numQbs":2,"ppr":1,"numTeams":12}
    )
    oneqb = safe_get(
        "https://api.fantasycalc.com/values/current", "FC 1QB",
        params={"isDynasty":"true","numQbs":1,"ppr":1,"numTeams":12}
    )
    if not sf or not oneqb:
        err("FantasyCalc failed"); return None

    ok(f"SF: {len(sf)} players · 1QB: {len(oneqb)} players")
    if sf:
        log(f"Entry keys:  {list(sf[0].keys())}")
        log(f"Player keys: {list(sf[0].get('player',{}).keys())}")

    data = {}
    for entry in sf:
        p    = entry.get("player", {})
        name = (p.get("name") or
                f"{p.get('firstName','')} {p.get('lastName','')}".strip())
        if not name: continue
        data[name] = {
            "sf_value":   entry.get("value",0) or entry.get("dynastyValue",0),
            "sf_rank":    entry.get("overallRank",0) or entry.get("rank",0),
            "sf_posrank": entry.get("positionRank",0),
            "sf_adp":     entry.get("overallPickAverage",0) or entry.get("adp",0),
            "auction":    entry.get("auctionValueAverage",0) or entry.get("auctionValue",0),
            "pos":        p.get("position",""),
            "team":       (p.get("maybeTeam","") or p.get("team","") or "").replace("None",""),
            "age":        p.get("maybeAge",0) or p.get("age",0) or 0,
            "trend":      entry.get("trend30Day") or entry.get("trend7Day") or 0,
            "sleeper_id": str(p.get("sleeperId","") or ""),
        }
    for entry in oneqb:
        p    = entry.get("player", {})
        name = (p.get("name") or
                f"{p.get('firstName','')} {p.get('lastName','')}".strip())
        if not name or name not in data: continue
        data[name]["oneqb_value"] = entry.get("value",0) or entry.get("dynastyValue",0)
        data[name]["oneqb_rank"]  = entry.get("overallRank",0) or entry.get("rank",0)
        data[name]["oneqb_adp"]   = entry.get("overallPickAverage",0) or entry.get("adp",0)
        if not data[name]["auction"]:
            data[name]["auction"] = entry.get("auctionValueAverage",0) or entry.get("auctionValue",0)

    # Normalize FC name mismatches to Sleeper/common names
    NAME_MAP = {
        "Brian Thomas":      "Brian Thomas Jr.",
        "Marvin Harrison":   "Marvin Harrison Jr.",
        "Michael Pittman":   "Michael Pittman Jr.",
        "Travis Etienne":    "Travis Etienne Jr.",
        "Ken Walker":        "Kenneth Walker III",
        "Amon-Ra St":        "Amon-Ra St. Brown",
        "DJ Moore":          "D.J. Moore",
        "Gabe Davis":        "Gabriel Davis",
        "Josh Palmer":       "Joshua Palmer",
    }
    normalized = {}
    for name, vals in data.items():
        fixed = NAME_MAP.get(name, name)
        normalized[fixed] = vals
    data = normalized

    ok(f"Built: {len(data)} players")
    return data

# ── Step 2: Sleeper players (id <-> name map) ──────────────────────────────
def fetch_sleeper_players():
    print("\n[2] Fetching Sleeper player list...")
    raw = safe_get("https://api.sleeper.app/v1/players/nfl", "players")
    if not raw:
        err("Failed"); return {}, {}
    ok(f"{len(raw)} total players")
    id_to_name, name_to_id, id_to_info = {}, {}, {}
    for pid, p in raw.items():
        if p.get("position") not in ["QB","WR","RB","TE"]: continue
        name = f"{p.get('first_name','')} {p.get('last_name','')}".strip()
        if not name: continue
        id_to_name[pid] = name
        name_to_id[name] = pid
        id_to_info[pid] = {
            "name": name, "pos": p.get("position",""),
            "team": p.get("team",""), "age": p.get("age",0),
            "years_exp": p.get("years_exp",0),
        }
    return id_to_name, name_to_id, id_to_info

# ── Step 3: Sleeper season stats (PPG + raw stats) ─────────────────────────
def fetch_sleeper_season_stats(id_to_name):
    print(f"\n[3] Fetching Sleeper {SEASON} season stats...")

    # Try the correct endpoint format (no v1)
    urls_to_try = [
        f"https://api.sleeper.app/stats/nfl/player/regular/{SEASON}",
        f"https://api.sleeper.app/v1/stats/nfl/player/regular/{SEASON}",
        f"https://api.sleeper.app/stats/nfl/regular/{SEASON}",
        f"https://api.sleeper.app/v1/stats/nfl/regular/{SEASON}",
        # week-by-week aggregation fallback handled separately
    ]

    bulk = None
    used_url = None
    for url in urls_to_try:
        result = safe_get(url, url.split("/")[-1])
        if result and isinstance(result, dict) and len(result) > 50:
            bulk = result
            used_url = url
            ok(f"Got stats from: {url}")
            break
        else:
            log(f"No data: {url}")

    # Week-by-week fallback
    if not bulk:
        log(f"Trying week-by-week for {SEASON}...")
        bulk = {}
        for week in range(1, 19):
            url = f"https://api.sleeper.app/v1/stats/nfl/regular/{SEASON}/{week}"
            wd = safe_get(url, f"wk{week}")
            if not wd or not isinstance(wd, dict): continue
            for pid, s in wd.items():
                if not isinstance(s, dict): continue
                if pid not in bulk:
                    bulk[pid] = {}
                # Accumulate
                for k, v in s.items():
                    if isinstance(v, (int, float)):
                        bulk[pid][k] = bulk[pid].get(k, 0) + v
            time.sleep(0.1)

    # Try 2024 if still nothing
    if not bulk:
        log(f"Trying {SEASON_FALLBACK} fallback...")
        for url in [
            f"https://api.sleeper.app/stats/nfl/player/regular/{SEASON_FALLBACK}",
            f"https://api.sleeper.app/v1/stats/nfl/regular/{SEASON_FALLBACK}",
        ]:
            result = safe_get(url, SEASON_FALLBACK)
            if result and isinstance(result, dict) and len(result) > 50:
                bulk = result
                ok(f"Using {SEASON_FALLBACK} fallback stats")
                break

    if not bulk:
        err("Could not fetch any stats")
        return {}

    ok(f"Stats for {len(bulk)} players")

    # Show sample stat keys
    sample_pid = next(iter(bulk))
    sample_s   = bulk[sample_pid]
    if isinstance(sample_s, dict):
        log(f"Stat keys sample: {list(sample_s.keys())[:12]}")

    # Build name -> stats dict
    player_stats = {}
    for pid, s in bulk.items():
        if not isinstance(s, dict): continue
        name = id_to_name.get(str(pid), "")
        if not name: continue

        pts_ppr = float(s.get("pts_ppr", 0) or s.get("pts_half_ppr", 0) or 0)
        gp      = int(s.get("gp", 0) or 0)
        if gp == 0:
            # count weeks if gp not present
            gp = sum(1 for k,v in s.items() if k == "pts_ppr" and float(v or 0) > 0)
            gp = max(gp, 1)

        ppg = round(pts_ppr / gp, 1) if gp > 0 and pts_ppr > 0 else 0

        player_stats[name] = {
            "ppg":      ppg,
            "gp":       gp,
            "pts_ppr":  round(pts_ppr, 1),
            # Passing
            "pass_yd":  int(s.get("pass_yd",0) or 0),
            "pass_td":  int(s.get("pass_td",0) or 0),
            "pass_att": int(s.get("pass_att",0) or 0),
            "pass_cmp": int(s.get("pass_cmp",0) or 0),
            "int":      int(s.get("pass_int",0) or s.get("int",0) or 0),
            # Rushing
            "rush_yd":  int(s.get("rush_yd",0) or 0),
            "rush_td":  int(s.get("rush_td",0) or 0),
            "rush_att": int(s.get("rush_att",0) or 0),
            # Receiving
            "rec":      int(s.get("rec",0) or 0),
            "rec_yd":   int(s.get("rec_yd",0) or 0),
            "rec_td":   int(s.get("rec_td",0) or 0),
            "targets":  int(s.get("rec_tgt",0) or s.get("targets",0) or 0),
        }

    ok(f"Processed {len(player_stats)} players with stats")
    if player_stats:
        top = sorted(player_stats.items(), key=lambda x: -x[1]["ppg"])[:5]
        for n, s in top:
            log(f"  {n}: {s['ppg']} ppg ({s['gp']} games)")
    return player_stats

# ── Step 4: Build KTC_DATA — ALL players from FC + Sleeper ────────────────
def build_ktc_data(fc_data, player_stats, id_to_info, js):
    # Use ALL players from FantasyCalc as the master list
    # supplemented by any in player_stats not in FC
    all_names = set(fc_data.keys()) | set(player_stats.keys())
    
    # Filter to skill positions only
    valid_pos = {"QB","WR","RB","TE","K"}
    filtered  = set()
    for name in all_names:
        fc  = fc_data.get(name, {})
        ps  = player_stats.get(name, {})
        pos = fc.get("pos","") or ps.get("pos","")
        if pos in valid_pos or name in fc_data:
            filtered.add(name)
    
    # Sort by SF value descending
    sorted_names = sorted(filtered,
        key=lambda n: fc_data.get(n, {}).get("sf_value", 0),
        reverse=True
    )
    
    lines   = []
    matched = 0
    for name in sorted_names:
        fc  = fc_data.get(name, {})
        ps  = player_stats.get(name, {})
        ppg = ps.get("ppg", fc.get("ppg", 0))

        if fc:
            matched += 1
            value   = fc.get("sf_value", 0)
            rank    = fc.get("sf_rank", 0)
            pos     = fc.get("pos", "")
            posrank = f"{pos}{fc.get('sf_posrank',0)}" if pos else ""
            team    = fc.get("team","")
            age     = fc.get("age", 0) or 0
            yoe     = fc.get("yoe", 0) or 0
            trend_r = fc.get("trend", 0) or 0
            trend   = f"+{trend_r}" if trend_r >= 0 else str(trend_r)
            adp     = round(fc.get("sf_adp", 0), 1)
            auction = round(fc.get("auction", 0))
        else:
            # In Sleeper stats but not FC — include with minimal data
            value=500; rank=999; posrank=""; team=""; age=0; trend="0"; adp=999.0; auction=1

        pad = max(1, 28 - len(name))
        lines.append(
            f'  "{name}":{" "*pad}{{ value:{value}, rank:{rank},  posRank:"{posrank}",  '
            f'team:"{team}", age:{age}, exp:{yoe},  trend:"{trend}",  '
            f'ppg:{ppg}, adp:{adp},  auction:{auction} }}'
        )

    ok(f"KTC_DATA: {len(sorted_names)} total players ({matched} with FC values)")
    return "const KTC_DATA = {\n" + ",\n".join(lines) + "\n};"

# ── Step 5: Build ADP_DATA — ALL FC players ───────────────────────────────
def build_adp_data(fc_data, js):
    # Use all FC players sorted by SF ADP
    names = sorted(fc_data.keys(),
        key=lambda n: fc_data[n].get("sf_adp", 999) or 999
    )
    lines = []
    for name in names:
        fc     = fc_data.get(name, {})
        sf_adp = round(fc.get("sf_adp", 0), 1)
        oq_adp = round(fc.get("oneqb_adp", 0) or sf_adp, 1)
        pos    = fc.get("pos","")
        sf_pos = f"{pos}{fc.get('sf_posrank',0)}" if pos else ""
        oq_pos = f"{pos}{fc.get('oneqb_rank',0)}" if pos else sf_pos
        pad    = max(1, 28 - len(name))
        lines.append(
            f'  "{name}":{" "*pad}{{ sf:{{ overall:{sf_adp},  posRank:"{sf_pos}"  }}, '
            f'oneqb:{{ overall:{oq_adp},  posRank:"{oq_pos}"  }}}}'
        )
    ok(f"ADP_DATA: {len(names)} players")
    return "const ADP_DATA = {\n" + ",\n".join(lines) + "\n};"

# ── Step 6: Build PLAYER_STATS_DATA (for panel) ────────────────────────────
def build_player_stats_data(player_stats, js):
    """Build a new PLAYER_STATS_DATA constant with real Sleeper stats"""
    lines = []
    for name, s in sorted(player_stats.items()):
        pad = max(1, 25 - len(name))
        lines.append(
            f'  "{name}":{" "*pad}{{ ppg:{s["ppg"]}, gp:{s["gp"]}, '
            f'passYd:{s["pass_yd"]}, passTd:{s["pass_td"]}, passAtt:{s["pass_att"]}, '
            f'passCmp:{s["pass_cmp"]}, ints:{s["int"]}, '
            f'rushYd:{s["rush_yd"]}, rushTd:{s["rush_td"]}, rushAtt:{s["rush_att"]}, '
            f'rec:{s["rec"]}, recYd:{s["rec_yd"]}, recTd:{s["rec_td"]}, tgt:{s["targets"]} }}'
        )
    block = "const PLAYER_STATS_DATA = {\n" + ",\n".join(lines) + "\n};"

    # Replace existing if present, otherwise insert before KTC_DATA
    if 'const PLAYER_STATS_DATA' in js:
        js = re.sub(r'const PLAYER_STATS_DATA\s*=\s*\{[\s\S]*?\};', block, js, count=1)
    else:
        js = js.replace('const KTC_DATA', block + '\n\n  const KTC_DATA', 1)
    return js

# ── Step 7: Inject ─────────────────────────────────────────────────────────
def inject(html, new_ktc, new_adp, new_stats_js=None, new_sleeper_ids=None):
    html = re.sub(r'const KTC_DATA\s*=\s*\{[\s\S]*?\};', new_ktc, html, count=1)
    html = re.sub(r'const ADP_DATA\s*=\s*\{[\s\S]*?\};', new_adp, html, count=1)
    if new_sleeper_ids:
        html = re.sub(r'const SLEEPER_IDS\s*=\s*\{[\s\S]*?\};', new_sleeper_ids, html, count=1)
    if new_stats_js:
        html = re.sub(r'(<script>)([\s\S]*?)(</script>)',
                      lambda m: m.group(1) + new_stats_js + m.group(3),
                      html, count=1)
    return html

# ── Step 8: Validate ───────────────────────────────────────────────────────
def validate(html, name):
    js_m = re.search(r'<script>([\s\S]*?)</script>', html)
    if not js_m:
        err(f"{name}: no script tag"); return False
    js  = js_m.group(1)
    par = sum(1 if c=='(' else -1 if c==')' else 0 for c in js)
    if par != 0:
        err(f"{name}: unbalanced parens ({par:+d})"); return False
    ok(f"{name}: valid")
    return True

# ── MAIN ───────────────────────────────────────────────────────────────────
def main():
    print("=" * 52)
    print("  FPTS Dynasty - Data Updater v3")
    print("=" * 52)

    print(f"\n[0] Reading files from:\n    {BASE}")
    db_html   = read_html(DB_FILE)
    calc_html = read_html(CALC_FILE)
    if not db_html or not calc_html:
        print("\nMake sure index.html and trade-calculator.html are in the same folder.")
        sys.exit(1)
    ok(f"index.html {len(db_html)//1024}KB")
    ok(f"trade-calculator.html {len(calc_html)//1024}KB")

    # Fetch all data
    fc_data      = fetch_fantasycalc()
    id_to_name, name_to_id, id_to_info = fetch_sleeper_players()
    player_stats = fetch_sleeper_season_stats(id_to_name)

    if not fc_data:
        print("\nFantasyCalc failed - cannot update. Exiting.")
        sys.exit(1)

    # Build data blocks
    print("\n[4] Building data blocks...")
    db_js   = re.search(r'<script>([\s\S]*?)</script>', db_html).group(1)
    new_ktc = build_ktc_data(fc_data, player_stats, id_to_info, db_js)
    new_adp = build_adp_data(fc_data, db_js)

    if not new_ktc or not new_adp:
        print("Build failed. Exiting.")
        sys.exit(1)

    # Build SLEEPER_IDS dynamically from all FC players
    sleeper_id_lines = []
    for name, fc in sorted(fc_data.items()):
        sid = fc.get("sleeper_id","")
        if sid and sid != "None" and sid != "0":
            sleeper_id_lines.append(f'  "{name}": "{sid}"')
    if sleeper_id_lines:
        new_sleeper_ids = "const SLEEPER_IDS = {\n" + ",\n".join(sleeper_id_lines) + "\n};"
        ok(f"SLEEPER_IDS: {len(sleeper_id_lines)} players")
    else:
        new_sleeper_ids = None
        log("No Sleeper IDs from FC — keeping existing")

    # Build player stats JS for index.html panel
    if player_stats:
        new_db_js = build_player_stats_data(player_stats, db_js)
        ok(f"PLAYER_STATS_DATA: {len(player_stats)} players")
    else:
        new_db_js = None
        log("No stats data - skipping PLAYER_STATS_DATA")

    # Inject
    print("\n[5] Injecting...")
    new_db   = inject(db_html,   new_ktc, new_adp, new_db_js,   new_sleeper_ids)
    new_calc = inject(calc_html, new_ktc, new_adp, None, new_sleeper_ids)

    # Validate
    print("\n[6] Validating...")
    if not validate(new_db, "index.html") or not validate(new_calc, "trade-calculator.html"):
        print("Validation failed - files NOT written.")
        sys.exit(1)

    # Backup + write
    print("\n[7] Writing files...")
    shutil.copy2(str(DB_FILE),   str(DB_FILE)   + ".bak")
    shutil.copy2(str(CALC_FILE), str(CALC_FILE) + ".bak")
    ok("Backups created (.bak)")

    write_html(DB_FILE,   new_db)
    write_html(CALC_FILE, new_calc)
    ok(f"index.html written: {len(new_db)//1024}KB")
    ok(f"trade-calculator.html written: {len(new_calc)//1024}KB")

    print("\n" + "=" * 52)
    print("  DONE - push both files to GitHub")
    print("  To revert: rename .html.bak back to .html")
    print("=" * 52)

if __name__ == "__main__":
    main()
