/* Per-page legend content. Read by legend.js when the user opens the drawer.
   Each page's entry has { title, blurb, sections[] } where each section
   has { name, items[] } and each item documents one UI element / feature.

   Item schema:
     label   — the UI element's name as the user sees it
     what    — 1-2 sentence description of its purpose
     source  — file/field/path the data comes from
     values  — how to interpret the displayed value (when applicable)
     notes   — caveats, edge cases, or developer hints (optional)

   When updating the site, please keep this file in sync — it's what developers
   will read to understand what each feature does and where its data lives. */

window.LegendContent = {

  // ════════════════════════════════════════════════════════════════════════
  'index': {
    title: 'Trade Database',
    blurb: 'Aggregated dynasty trade observations with per-player insights. ' +
           'All trade data is sourced from data/mvs.json (player_market_mvs CSV ' +
           '→ sync-mvs.py). Player metadata (age, team, ppg) is from data/values.json ' +
           '(FantasyPoints API → sync-fp.py).',
    sections: [
      {
        name: 'Filter Panel',
        items: [
          { label: 'QB Format Filter', what: 'Filter trade list to Superflex / 1QB / All.', source: 'recent_trades.format from CSV', values: 'SF / 1QB / All', notes: 'Picking a non-"all" value with no other filter shows all trades for that QB format.' },
          { label: 'Teams Count Filter', what: 'Filter trades by league size (8/10/12/14).', source: 'NOT in current CSV — filter is null-safe (wildcard match)', values: '8 / 10 / 12 / 14 / All', notes: 'Awaiting CSV schema extension (see data/source/REQUEST-csv-schema-extension.md).' },
          { label: 'Starters Filter', what: 'Filter by lineup starter count.', source: 'NOT in current CSV — null-safe wildcard', values: '8 / 9 / 10 / 11 / 12 / 13 / All', notes: 'Schema-extension pending.' },
          { label: 'TEP Filter', what: 'Filter by tight-end-premium bonus.', source: 'NOT in current CSV — null-safe wildcard', values: 'none / 0.25 / 0.5 / 0.75 / 1.0 / All', notes: 'Schema-extension pending.' },
          { label: 'PPR Filter', what: 'Filter by points-per-reception variant.', source: 'NOT in current CSV — null-safe wildcard', values: 'Full PPR / Half PPR / PPC / Standard / All', notes: 'Schema-extension pending.' },
          { label: 'FAAB Filter', what: 'Show only trades that include FAAB budget.', source: 'NOT in current CSV — null-safe wildcard', values: 'Includes FAAB / No FAAB / All', notes: 'Schema-extension pending.' },
          { label: 'Date Range', what: 'Constrain trade list to a date window.', source: 'recent_trades.date from CSV (YYYY-MM-DD)', values: 'Empty = no constraint', notes: 'Always available since date is in the CSV.' },
          { label: 'Asset Count Filter', what: 'Cap total assets per trade (players + picks).', source: 'Computed from trade.players + trade.picks lengths', values: '≤2 / ≤3 / ≤4 / ≤5 / All', notes: 'Useful for finding 1-for-1 vs blockbuster trades.' },
          { label: 'Rookie Pick Builder', what: 'Filter trades that include specific rookie picks.', source: 'recent_trades.sides[].assets where isPick=true', values: 'Select pick year/round to filter', notes: 'Picks are deduplicated by transaction_id across all player recentTrades.' },
        ],
      },
      {
        name: 'Trade Search (Side A / Side B)',
        items: [
          { label: 'Side A / Side B Search', what: 'Find trades that include specified assets on each side. Both sides must match.', source: 'Combines player + pick autocompletes against TRADES array', values: 'Multiple chips per side allowed', notes: 'Search is symmetric — A and B sides can be swapped without affecting results.' },
          { label: 'Trade Cards', what: 'Each card shows one observed trade with both sides, asset MVS values, and date.', source: 'TRADES array (built from data/mvs.json player.recentTrades)', values: 'Format chip = SF or 1QB; other chips render only when data exists', notes: 'There are ~1,405 unique real trades after dedup by transaction_id.' },
        ],
      },
      {
        name: 'Most Traded Players / Picks',
        items: [
          { label: 'Most Traded Players (02)', what: 'Top 10 players who appear most in the filtered trade list.', source: 'Aggregated count of player.name across filtered TRADES', values: 'Bar chart shows relative count', notes: 'Click a row to expand the player\'s individual trades inline.' },
          { label: 'Most Traded Rookie Picks (03)', what: 'Top 10 picks (year + round) appearing most in filtered trades.', source: 'Aggregated count of pick.year + pick.round across filtered TRADES', values: 'Bar chart, grouped by year-round', notes: 'Picks parsed from CSV labels like "2026 1.01" → {year:2026, round:1, slot:1}.' },
        ],
      },
      {
        name: 'Value Tracker (Risers / Fallers)',
        items: [
          { label: 'Risers', what: 'Top 10 players with the largest positive ADP change over the past 30 days.', source: 'FP_VALUES[name].trend, populated by _applyAdpPayload from monthly ADP deltas', values: 'Positive trend = ADP improved (rising); higher = bigger move', notes: 'Replaced the previous FP-API scalar trend in commit 892b2ad — now uses ADP-derived month-over-month movement.' },
          { label: 'Fallers', what: 'Top 10 players with the largest negative ADP change over the past 30 days.', source: 'Same as Risers, filtered to negative trend', values: 'Negative trend = ADP got worse (falling); lower = bigger drop', notes: 'Sorted ascending (most negative first).' },
        ],
      },
      {
        name: 'Position Distribution',
        items: [
          { label: 'Assets Traded by Type (04)', what: 'Distribution of all assets in the filtered trade list, grouped by position.', source: 'Counted from filtered TRADES.players[].pos + count of picks bucket', values: 'PICKS row uses purple, position rows use brand position-color', notes: 'Click an asset-type row to expand individual trades involving that asset class.' },
        ],
      },
      {
        name: 'Player Panel (slide-in)',
        items: [
          { label: 'Player Profile Header', what: 'Top section with circular headshot, position pill, NFL team, large player name, and inline stats.', source: 'FP_VALUES[name] for stats; headshot URL built from sleeperId via sleepercdn.com', values: 'Stats row shows Age, Pos Rank, Overall Rank, PPG, Dynasty ADP, Auction', notes: 'Headshot falls back to first-letter initial if Sleeper CDN 404s.' },
          { label: 'Fantasy Points Value', what: 'Right-floating canonical player value.', source: 'FP_VALUES[name].value (= MVS overlay; SF or 1QB based on toggle)', values: 'Number range ~1 to ~10,500 (MVS units)', notes: 'Toggle SF↔1QB on adp-tool to switch which format this shows. Persists in localStorage.' },
          { label: 'Trade Stats Row (4 columns)', what: 'Aggregated stats across all trades involving this player.', source: 'Computed from TRADES.filter(t => t.players.some(p => p.name === playerName))', values: 'Times Traded, Avg Pick Included, Avg Added Value Needed, Avg Assets Moved', notes: 'Updates live as filters change (only trades matching active filters count).' },
          { label: 'MVS Extras — OTC Value', what: 'On-The-Clock value with delta vs MVS.', source: 'FP_VALUES[name].otcValue (CSV: otc_value column)', values: 'Format: "9,000 (+1,452 vs MVS)"; positive diff = MVS higher than OTC', notes: 'Hidden when CSV row lacks otc_value.' },
          { label: 'MVS Extras — Baseline', what: 'Pre-market formula baseline + % delta vs current MVS.', source: 'FP_VALUES[name].baseline (CSV: baseline_sf / baseline_1qb)', values: 'Positive % = market priced above baseline (hype); negative % = below (sell signal)', notes: 'Toggle-aware: uses baseline_1qb when format=1qb.' },
          { label: 'MVS Extras — Trade Volume (7d)', what: 'Number of times this player was in an observed trade in the past 7 days.', source: 'FP_VALUES[name].tradesLastWeek (CSV: trades_last_week_sf / trades_last_week_1qb)', values: 'Hot ≥200 / Active ≥50 / Quiet >0 / No trades', notes: 'Liquidity signal — high volume means more reliable price discovery.' },
          { label: 'MVS Extras — Contributor Rankings', what: 'Per-contributor consensus rankings.', source: 'FP_VALUES[name].rankings.{main, jax, jay, joe, trav} (CSV: *_rankings columns)', values: 'Lower number = higher consensus rank (1 = best)', notes: 'Main is the aggregated consensus; the four named contributors are individual rankers.' },
          { label: 'MVS History Sparkline', what: '14-day MVS value history.', source: 'FP_VALUES[name].history (CSV: history_sf or history_1qb, last 14 entries)', values: 'Green line = value rose; red = fell; white = flat; footer shows min · delta · current · max', notes: 'Toggle-aware: shows 1QB history when format toggle is 1QB.' },
          { label: 'Recent Trades Widget', what: 'Last 3 actual observed trades involving this player.', source: 'FP_VALUES[name].recentTrades (CSV: recent_trades JSON column, trimmed to 3 most recent)', values: 'Each card: date, format badge, both sides with assets + MVS, side totals', notes: 'Focus player\'s name is highlighted red so you can spot them in multi-asset packages.' },
          { label: 'Tabs', what: 'Switch the bottom pane between Trades, Player Stats, Age Curve, Trade Finder.', source: 'ppShowTab() with state preserved in ppLastTab variable', values: '4 tab options', notes: 'Reopening the panel restores the last-selected tab so users don\'t lose their place.' },
          { label: 'Trades Tab', what: 'Full list of trades involving this player (not just last 3).', source: 'TRADES array filtered by playerName, sorted by date desc', values: 'Each row is the same trade card as the main Recent Trades list', notes: 'Respects the global filter chips selected at the top of the page.' },
          { label: 'Player Stats Tab', what: '2025 season fantasy stats (passing, rushing, receiving, PPG).', source: 'PLAYER_STATS_DATA hardcoded block (large embedded array)', values: 'PPG, games played, pass/rush/rec yards + TDs', notes: 'Currently hardcoded — could be replaced with Sleeper /stats endpoint for live data.' },
          { label: 'Age Curve Tab', what: 'Position-relative value projection across the player\'s career arc.', source: 'Computed from FP_VALUES[name].age, value, posKey + per-position curve constants', values: 'Curve peaks at position-appropriate age (RB 24, WR 26, TE 27, QB 28)', notes: 'Curves are heuristics, not regression-fitted.' },
          { label: 'Trade Finder Tab', what: 'Suggest fair trade packages on either side using FP_VALUES.', source: 'Combinatorial search over FP_VALUES + PICK_VALUES within a value tolerance', values: 'Each suggestion shows asset list + total value', notes: 'Uses MVS value as the matching target — so swaps reflect real market data.' },
          { label: 'Cross-page Action Bar', what: 'Buttons to send the current player to Calculator / ADP / My Leagues.', source: '_fptsWriteHandoff() writes player name to localStorage; destination page reads on load', values: '60-second TTL on the handoff payload', notes: 'Single-tab UX — opens in a new tab.' },
          { label: 'MVS Data Refreshed Footer', what: 'Timestamp showing when the MVS CSV was last regenerated.', source: 'FP_VALUES[name].lastUpdated (CSV: last_updated column)', values: 'Format: "MVS data refreshed YYYY-MM-DD HH:MM"', notes: 'Per-player timestamp, but all players in one CSV share the same update time.' },
        ],
      },
      {
        name: 'Cross-page Navigation',
        items: [
          { label: 'Topnav Links', what: 'Sticky red-bordered top bar with links to Calculator, User Importer, Tiers, ADP, Rankings.', source: 'Hardcoded nav-link list (consistent across all 5 pages)', values: 'Current page\'s link is omitted from its own nav', notes: 'Wordmark on the left is the brand identity SVG, swaps for light theme.' },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════
  'adp-tool': {
    title: 'ADP Tool',
    blurb: 'Real Sleeper dynasty draft ADP rendered as a box-card board or a sortable list. ' +
           'Data is sourced from data/adp.json — the sleeper_dynasty_adp pipeline scrapes ' +
           'Sleeper completed startup drafts, classifies them, and aggregates pick-weighted ADP.',
    sections: [
      {
        name: 'Controls Bar',
        items: [
          { label: 'Mode Toggle (Picks / Simple / Rookies)', what: 'Selects which subset of startup drafts the board reflects.', source: 'STATE.mode → MODE_TO_SOURCE → adp.json buckets', values: 'Picks = drafts with kickers as pick placeholders; Simple = vet-only (no rookies/kickers); Rookies = startups including the 2026 rookie class', notes: 'Bucket classification done upstream in sync-adp.py classify_startup_drafts().' },
          { label: 'QB Format Toggle (SF / 1QB)', what: 'Switch between Superflex/2QB and Single-QB league pools.', source: 'STATE.qbFormat → getSourceKey() → "{mode}_{sf|1qb}" in adp.json', values: 'SF default; persists in localStorage as fpts-adp-format', notes: '1QB sample is ~half the size of SF — wider confidence intervals on deep ADP.' },
          { label: 'Date Range', what: 'Constrain the ADP aggregation to a date window.', source: 'STATE.dateFrom / .dateTo → aggregateBuckets() walks adp.json.byMonth', values: 'Defaults to byMonth.ALL (full history) when both empty', notes: 'Presets (7d / 30d / 90d / All) auto-populate the date inputs.' },
          { label: 'View Toggle (Box / List)', what: 'Switch board between card grid and tabular list.', source: 'STATE.view; List view exposes CSV download', values: 'Box default; forced to List on phone widths (<700px)', notes: 'Box view is disabled (visibly grey) on mobile.' },
          { label: 'Snake Toggle', what: 'Enable/disable snake draft order on the board layout.', source: 'STATE.snake', values: 'On = round 2 reverses, round 3 forwards (standard snake); Off = linear', notes: 'Affects only the visual board layout, not ADP values themselves.' },
        ],
      },
      {
        name: 'Position Breakdown',
        items: [
          { label: 'Position Chips (QB/RB/WR/TE)', what: 'Filter the board to one or more positions.', source: 'STATE.filters.positions Set; recomputed via isSoftMatch()', values: 'Multi-select — click to toggle each', notes: 'Counts show how many players in the filtered set are at each position.' },
          { label: 'Sample Badge', what: 'Total number of distinct drafts feeding the current view.', source: 'maxDrafts(softList) sums per-player drafts and takes max', values: 'Hundreds to ~1000+ depending on filters', notes: 'Larger sample = more reliable ADP.' },
        ],
      },
      {
        name: 'Board (Box View)',
        items: [
          { label: 'Box Card', what: 'One card per player slot showing pick number, position rank, ADP, name, and headshot.', source: 'getActiveBucket() returns the active aggregate; positions assigned via snake or linear', values: 'Top row: pick / pos rank / ADP; bottom: stacked first/last name; corner: circular HS', notes: 'Background color matches position. Click to open player modal.' },
          { label: 'Trend Arrow', what: 'Month-over-month ADP movement.', source: 'TREND_INDEX built by rebuildTrendIndex() from per-month ADP deltas', values: 'Green up = ADP improved; red down = ADP got worse; flat white = no change', notes: 'Outlined with 8-direction text-shadow for readability over any background color.' },
        ],
      },
      {
        name: 'Board (List View)',
        items: [
          { label: 'Sortable Columns', what: 'Click any column header to sort ascending/descending.', source: 'STATE.sort.{col, dir}', values: 'Rank, Player, Pos, NFL Draft (year + round), Times Drafted', notes: 'Last column NFL Draft combines year + round into one display.' },
          { label: 'Download CSV', what: 'Export the currently filtered list as CSV.', source: 'Generated client-side from the rendered rows', values: 'Filename includes the mode + date range', notes: 'No server round-trip — runs entirely in browser.' },
        ],
      },
      {
        name: 'Player Modal',
        items: [
          { label: 'Top Bar', what: 'Modal header with PLAYER PROFILE label + cross-page xpage buttons + close.', source: 'Static markup; xpage buttons use _fptsWriteHandoff()', values: 'Open in Database / Open in Calculator / Open in My Leagues / ✕ Close', notes: 'Same pattern across all player modals on the site (visual unification).' },
          { label: 'Articles Section', what: 'Recent FantasyPoints articles mentioning this player.', source: 'PLAYER_ARTICLES[name] (data/articles.json from sync-fp.py)', values: 'Dropdown preview of titles; "Sign in to FantasyPoints" link', notes: 'Match logic: article title contains player name OR article body has ≥2 player-name mentions.' },
          { label: 'Pick-availability Heatmap', what: 'Probability of this player being available at each pick number, by round.', source: 'data/pick-availability.json — generated by sync-adp.py', values: '0%-100% per cell; bands of green (likely available) to red (rarely available)', notes: 'Only shown for picks mode where pick-as-asset placeholders are used.' },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════
  'trade-calculator': {
    title: 'Trade Calculator',
    blurb: 'Build and value dynasty trades. Pull players + picks onto Side A, B (and optional C), ' +
           'see a real-time balance bar based on the MVS canonical values. ' +
           'All values come from data/mvs.json (overlaid on data/values.json metadata).',
    sections: [
      {
        name: 'Format Settings',
        items: [
          { label: 'QB Format Picker (SF / 1QB)', what: 'Switch between Superflex and Single-QB value scales.', source: 'tradeState.qb → toggles which value the calc reads from FP_VALUES', values: 'SF default; Saves to localStorage fpts-adp-format (cross-page)', notes: 'Affects all values on the page, including pick values.' },
          { label: 'TEP (Tight End Premium)', what: 'Boost TE values by 0%/25%/50%/75%/100%.', source: 'tradeState.tep → multiplied into getMultiplier(pos) for TE only', values: 'none / 0.25 / 0.5 / 0.75 / 1.0', notes: 'Multiplier formula: 1 + (tep * 0.12) for TE position.' },
          { label: 'PPR Variant', what: 'Standard / Half / Full PPR scoring.', source: 'tradeState.ppr → getMultiplier(pos) applies position-specific multipliers', values: '0 (Standard) / 0.5 (Half) / 1.0 (Full)', notes: 'WR and RB multipliers shift based on PPR — Full PPR favors RBs slightly more than Half.' },
        ],
      },
      {
        name: 'Side Cards',
        items: [
          { label: 'Side A / Side B (/ C optional)', what: 'Each side is a card holding the trade assets going to one team.', source: 'tradeState.sideA, .sideB, .sideC arrays', values: '2-team default; 3-team available via header toggle', notes: 'Total at top of each card sums asset values + FAAB × 10.' },
          { label: 'Asset Chip', what: 'A single player or pick on a side, shown as a colored mini-card.', source: 'Each asset has {name, pos, value, type}; visual color from position', values: 'Solid position-color bg, dark TE pill, stacked first/last name, value right, X to remove', notes: 'Click chip (not the X) opens the player modal. Asset values respect SF/1QB toggle and PPR/TEP multipliers.' },
          { label: 'FAAB Slider', what: 'Add FAAB (waiver budget) to one side as part of the trade.', source: 'side.faab — multiplied by 10 in sideTotal()', values: '$0 to $200 (steps of $5)', notes: 'FAAB-to-value ratio (10) is heuristic; users in mixed leagues may want to ignore this.' },
        ],
      },
      {
        name: 'Balance Bar',
        items: [
          { label: 'Verdict Bar', what: 'Visual balance indicator showing side-A vs side-B value.', source: 'sideTotal(A) vs sideTotal(B)', values: '"Fair trade" (within 5%), "Slight edge" (5-15%), "Big imbalance" (>15%)', notes: 'Color: green for fair, brand red for big imbalance.' },
          { label: 'Side Totals', what: 'Sum of adjusted asset values per side.', source: 'sideTotal() = side.assets.reduce(s + adjVal(a)) + faab*10', values: 'Whole-number sum in MVS units', notes: 'adjVal() applies the format multiplier per asset based on tep/ppr.' },
        ],
      },
      {
        name: 'Search + Pick Picker',
        items: [
          { label: 'Side Search', what: 'Type a player name to find and add to a side.', source: 'Autocomplete against FP_VALUES keys (player names)', values: 'Dropdown shows matches with HS + pos + name', notes: 'Pressing Enter or clicking a result appends to the side.' },
          { label: 'Pick Selector', what: 'Add rookie / future picks (2026-2028) to a side.', source: 'PICK_VALUES keyed by "YYYY-R.SS" or generic "YYYY-R"', values: 'Specific slots (2026-1.01 through 2026-4.12) + generics (2027-1, 2028-1)', notes: 'Specific slot values come from CSV; generic fallback used for far-future picks.' },
        ],
      },
      {
        name: 'Player Modal (calc)',
        items: [
          { label: 'Top Bar Actions', what: 'Cross-page handoff buttons.', source: '_calcXpageToDb / _calcXpageToAdp / _calcXpageToLeagues', values: 'Open in Database / ADP / My Leagues / ✕ Close', notes: 'Same pattern as other modals; uses 60-second localStorage TTL.' },
          { label: 'MVS Extras Row', what: 'Shows OTC value, baseline delta, trade volume, contributor rankings (when present).', source: 'window.MvsExtras.buildAll(playerName) from assets/js/mvs-extras.js', values: 'Auto-fit grid 1-4 cells per row based on width', notes: 'Hidden cells when the CSV row lacks that data; modal still renders the rest.' },
          { label: 'MVS History Sparkline', what: '14-day SVG line chart of MVS value movement.', source: 'FP_VALUES[name].history (toggle-aware)', values: 'Green = rose; Red = fell; white = flat', notes: 'No charting library — inline SVG path.' },
          { label: 'Recent Trades', what: 'Last 3 actual trades involving this player.', source: 'FP_VALUES[name].recentTrades (from CSV recent_trades, trimmed to 3)', values: 'Each card: date, format, both sides with asset MVS', notes: 'Focus player highlighted red in each trade.' },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════
  'my-leagues': {
    title: 'User Importer',
    blurb: 'Import your Sleeper dynasty leagues and explore your rosters, exposure, ' +
           'and trade opportunities. Player metadata + values come from FP_VALUES / MVS overlay; ' +
           'league + roster data is pulled live from the Sleeper API on import.',
    sections: [
      {
        name: 'Sleeper Login',
        items: [
          { label: 'Username Input', what: 'Enter your Sleeper handle to fetch all your dynasty leagues.', source: 'Sleeper /v1/user/{username} then /v1/user/{user_id}/leagues/nfl/{season}', values: 'String — case-insensitive Sleeper handle', notes: 'No password — Sleeper exposes this read-only via username lookup.' },
          { label: 'Season Selector', what: 'Choose which NFL season to pull leagues from.', source: 'ML.selectedSeason → loops API call', values: 'Recent seasons; default = current Sleeper state.season', notes: 'Off-season uses last completed season as default.' },
        ],
      },
      {
        name: 'League List',
        items: [
          { label: 'League Cards', what: 'One card per imported league with quick stats.', source: 'ML_ALL_LEAGUE_DATA[leagueId] populated on import', values: 'Total roster value, your record, league size, scoring', notes: 'Leagues where you\'re not a roster owner are auto-skipped.' },
        ],
      },
      {
        name: 'Roster + Trade Sim',
        items: [
          { label: 'Team Roster Row', what: 'A player or pick on a team\'s roster.', source: 'Sleeper roster.players (player IDs) joined to data/players cache + FP_VALUES', values: 'Avatar / pos pill / name + NFL team / age / pos rank / MVS value', notes: 'Position stripe on left edge matches QB/RB/WR/TE/K/PK color.' },
          { label: 'Roster Expansion', what: 'Click a team to expand its full roster grouped by position + picks section.', source: 'mlBuildTeamRosterHtml(leagueId, rosterId)', values: 'QB / RB / WR / TE / Other / Draft Picks groups', notes: 'Lazy-loaded — first click triggers render, subsequent clicks toggle visibility.' },
          { label: 'Owned Picks Logic', what: 'Computes the picks each roster currently owns.', source: 'mlGetOwnedPicks() = natural picks - traded-away + acquired-via-trade; skips completedDraftSeasons', values: 'Per-season per-round, sorted', notes: 'Filters out seasons whose Sleeper draft has status "complete" — those picks are spent.' },
          { label: 'Trade Simulator', what: 'Drag-and-drop simulator to test trades within a league.', source: 'Reuses FP_VALUES + PICK_VALUES for valuations', values: 'Side balance bar identical to Trade Calculator', notes: 'Picks fall back to generic round key (2027-1) when no specific slot is priced.' },
        ],
      },
      {
        name: 'Cross-League Exposure',
        items: [
          { label: 'Exposure Row', what: 'Players you own across multiple leagues with how exposed you are.', source: 'Computed by ML_BUILD_EXPOSURE_LIST: counts of you-own / total leagues per player', values: 'Player / pos rank / shares / value / exposure %', notes: 'Helps identify which players you\'re over- or under-exposed to across portfolio.' },
          { label: 'Position Filter', what: 'Filter exposure list by position.', source: 'STATE filter (QB/RB/WR/TE/All)', values: 'Five-position pill bar', notes: 'Independent of the per-league filter.' },
        ],
      },
      {
        name: 'Player Detail Modal',
        items: [
          { label: 'Hero (96px circular HS + Kanit name)', what: 'Standard PP-style header.', source: 'Sleeper player.full_name + sleeperId for CDN thumbnail', values: '96×96 circle headshot; 32px Kanit ExtraBoldItalic name', notes: 'Falls back to initials if Sleeper CDN doesn\'t have a photo.' },
          { label: 'Stats Grid', what: 'Trade value, pos rank, age, EXP, PPG 2025, Dynasty ADP, Auction.', source: 'FP_VALUES[name] joined to Sleeper player.years_exp', values: 'EXP shows "Rookie" for yoe=0, else "Xyrs"', notes: 'Hidden cells when data missing.' },
          { label: 'MVS Extras', what: 'OTC + Baseline + Volume + Rankings cells.', source: 'window.MvsExtras.buildAll() from assets/js/mvs-extras.js', values: 'Same row layout as DB + Calc modals', notes: 'Cell visibility per-data — auto-fit grid.' },
          { label: 'Articles Section', what: 'FantasyPoints recent articles for the player.', source: 'PLAYER_ARTICLES[name]', values: 'Dropdown preview; click "Sign in" to read full article', notes: 'Reuses the shared mount used on DB + ADP modals.' },
          { label: 'Status Block', what: 'Whether the player is on your roster, on another team, or available.', source: 'Cross-league lookup of player ID against ML_ALL_LEAGUE_DATA', values: '★ On Your Roster / On {team} / Available — Waivers/FA', notes: 'Different action buttons per state (Trade For / Send Offer / Claim).' },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════
  'tiers': {
    title: 'Tier Sheet',
    blurb: 'Tiered rankings managed in a Google Sheet, synced via sync-tiers.py. ' +
           'Each row is overlaid with current data from values.json + adp.json + mvs.json.',
    sections: [
      {
        name: 'Tier Source',
        items: [
          { label: 'TIER_PLAYERS Array', what: 'The canonical tier list — managed in a Google Sheet, synced into the page.', source: 'sync-tiers.py replaces TIER_PLAYERS block between // TIERS:START and // TIERS:END markers', values: 'Each row: tier, name, age, pos, posRank, team, ADP fields, auction, PPG, trending, buySell, priority, contender, notes', notes: 'Sheet headers map to internal fields via HEADER_ALIASES in sync-tiers.py.' },
          { label: 'Tier Number', what: 'Bucket number — lower = more elite tier.', source: 'Sheet column "Tier"', values: 'Integer 1+', notes: 'Players within the same tier are considered roughly equivalent value.' },
        ],
      },
      {
        name: 'Column Overlays (live data)',
        items: [
          { label: 'Value Column', what: 'Player\'s current MVS value (replaces sheet-managed value).', source: 'mvs.json overlay → TIER_PLAYERS[i].value (SF or 1QB per format toggle)', values: 'Number ~1-10,500 in MVS units', notes: 'Wholesale-replaces sheet value; sheet column kept for fallback.' },
          { label: 'ADP 2026 Column', what: 'Current dynasty startup ADP (overlays sheet value).', source: 'adp.json → startup_sf or startup_1qb based on toggle, fallback to other format', values: 'Decimal ADP (lower = drafted earlier)', notes: 'Was 1QB-only hardcoded; now respects SF/1QB toggle (commit 892b2ad).' },
          { label: 'Auction Column', what: 'Real dynasty auction median price.', source: 'auction.json → 1QB price first, SF fallback', values: 'Dollar string like "$15+"', notes: 'Intentional 1QB-first because dynasty auctions are overwhelmingly SF — 1QB bucket is sparse.' },
          { label: 'PPG 2025 Column', what: 'Last season\'s actual fantasy PPG.', source: 'FP_VALUES[name].ppg (from Sleeper /stats endpoint via sync-fp.py)', values: 'Decimal PPG; blank if rookie/no games', notes: 'Updated yearly post-Week-18.' },
        ],
      },
      {
        name: 'Row Annotations',
        items: [
          { label: 'Trending / Buy-Sell / Priority / Contender / Notes', what: 'Editorial commentary from the sheet.', source: 'Google Sheet columns', values: 'Free-text annotations', notes: 'Edited in the sheet; sync-tiers.py refreshes them in tiers.html.' },
        ],
      },
    ],
  },
};
