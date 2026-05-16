/* Per-page legend content. Read by legend.js when the user opens the drawer.
   Each page's entry has { title, blurb, sections[] } where each section
   has { name, items[] } and each item documents one UI element / feature.

   Item schema:
     label   — the UI element's name as the user sees it
     what    — 2-3 sentences explaining the purpose & behavior
     source  — file/function/field/path the data comes from
     values  — how to interpret the displayed value, with thresholds/examples
     notes   — caveats, edge cases, or developer hints (function names, file:line, related code)

   When updating the site, please keep this file in sync — it's what developers
   will read to understand what each feature does and where its data lives.

   ──────────────────────────────────────────────────────────────────────
   GLOBAL DATA PIPELINE (high-level — same on every page)
   ──────────────────────────────────────────────────────────────────────
   data/values.json         FantasyPoints API + Sleeper join     sync-fp.py
     → FP_VALUES[name].{value, age, team, pos, posRank, ppg, sleeperId, injury}

   data/adp.json            sleeper_dynasty_adp parquet          sync-adp.py
     → ADP_PAYLOAD.byMonth.{YYYY-MM,ALL}.{picks,simple,rookies,startup}_{sf,1qb}
     → picks_sf records mix real players + ROOKIE_PICK_X.YY placeholders

   data/auction.json        Sleeper auction medians              sync-adp.py
     → AUCTION_PAYLOAD.byMonth.ALL.startup_{sf,1qb}

   data/picks.json          Pick values (legacy slot format)     sync-fp.py
     → PICK_VALUES["2026-1.01"] = { value, valueSf, valueTep }

   data/mvs.json            MVS canonical values (NEW)            sync-mvs.py
     → MVS_PAYLOAD.players + .picks  (overlays FP_VALUES wholesale)

   data/articles.json       FantasyPoints recent articles         sync-fp.py
     → PLAYER_ARTICLES[name] = [{ title, url, snippet, image }]

   data/pick-availability.json   Per-entity board heatmap        sync-adp.py
     → PICK_AVAILABILITY[sleeperId].{matrix, dropoff, expectedPick, draftsSampled}
     → Real players (300 most-drafted) + ROOKIE_PICK_X.YY entries (~77)
     → PICK_AVAILABILITY_META.{version, season, teamCount, topN}
       feeds the "Data refreshed" stamp on every heatmap render

   CONSISTENCY: adp.json, auction.json, and pick-availability.json carry
   identical `version` timestamps (same `now` value in sync-adp.py main()).
   Heatmap and ADP always reflect the same data snapshot.

   ──────────────────────────────────────────────────────────────────────
   TEAM LOGOS (assets/js/team-helpers.js)
   ──────────────────────────────────────────────────────────────────────
   Every surface that renders a player name next to a player image emits
   the NFL team logo to the right of the name. Standard chip-context call:
     window.TeamHelpers.logoImg(team, { size: 18 })
   Sleeper CDN backs the PNGs at sleepercdn.com/images/team_logos/nfl/.
   Parent flex container should use `align-items: center` for baseline.
   See team-helpers.js header for the full convention + fallback chain
   (plain text on no-helper-loaded; flame thumbnail for RDP placeholders).

   ──────────────────────────────────────────────────────────────────────
   HEADSHOT FALLBACK RULE (assets/css/brand.css)
   ──────────────────────────────────────────────────────────────────────
   When Sleeper's CDN returns 403/404 for a player thumbnail (common for
   incoming rookies whose photos haven't been uploaded yet), the page
   MUST show a neutral silhouette — NEVER the player's name initials.
   A canonical rule in brand.css covers every legacy fallback class
   (.hs-fallback, .card-hs-fallback, .pp-hs-fallback, .cc-hs-fallback,
   .ml-pd-avatar-initials) plus the generic .fpts-hs-fallback. The
   initials text stays in textContent (for screen readers / DOM
   introspection) but is hidden with color:transparent + font-size:0,
   and an inline SVG silhouette is painted as background. Any new
   headshot surface MUST emit class="fpts-hs-fallback" on its fallback
   element to opt into the rule.

   ──────────────────────────────────────────────────────────────────────
   SEASON ROLLOVER TRIGGER (sync-adp.py + team-helpers.js)
   ──────────────────────────────────────────────────────────────────────
   sync-adp.py auto-detects the season number: year if today.month >= 4
   else year - 1 (so the rollover happens with the NFL Draft each
   April). The config.json `season` field is optional — set explicitly
   only to test past seasons.

   All year-bearing labels drive from ADP_PAYLOAD.season:
     - ADP Tool tab titles (Dynasty Startup ADP {year} / Dynasty Rookie
       ADP {year}) via applyAdpYearLabel()
     - "With Rookies" startup subtitle (..."with the {year} rookie
       class in the pool") via _adpSeason() in adp-tool.html
     - "SEASON {year}" topnav badge across all 5 pages via
       window.applySeasonBadge(season) helper in team-helpers.js,
       called from each page's _applyAdpPayload()

   ──────────────────────────────────────────────────────────────────────
   125% LAYOUT ZOOM (assets/css/brand.css)
   ──────────────────────────────────────────────────────────────────────
   body { zoom: 1.25 } on every page (desktop). Mobile (<700px) + print
   render at 100%. Browser-native zoom — interactions work normally,
   getBoundingClientRect coordinates are unzoomed in Chrome. If anything
   feels mis-positioned, that's the first thing to check.

   ──────────────────────────────────────────────────────────────────────
   FLEX-COLUMN SCROLL CHAIN RULE  (overflow-scroll inside a sticky panel)
   ──────────────────────────────────────────────────────────────────────
   When a child element uses `flex:1; overflow-y:auto; min-height:0;` to
   scroll internally — common for sidebars / drawers / sticky aside
   panels — EVERY ancestor between the bounded outer container and the
   scrolling child MUST also be a flex container with `flex:1;
   min-height:0;`. A single intermediate `div` with no CSS (defaulting
   to display:block) breaks the chain: `flex:1` on the child becomes a
   no-op, the child's height resolves to its content height, and
   `overflow:auto` never fires because there's no overflow to trigger.
   The wheel event falls through to the page.

   Canonical pattern (used by My-Leagues Player Exposure aside):

     .panel { position:sticky; top:96px; max-height:calc(100vh - 110px);
              display:flex; flex-direction:column; overflow:hidden; }
     .panel-header { (content-sized — no flex needed) }
     .panel-body   { display:flex; flex-direction:column; flex:1;
                     min-height:0; overflow:hidden; }
     .panel-list   { overflow-y:auto; flex:1; min-height:0; }

   Note both .panel-body AND .panel-list have flex:1 + min-height:0.
   That's the chain. Skip either and scroll silently breaks.

   ──────────────────────────────────────────────────────────────────────
   PAGE SCAFFOLD (assets/js/data-bootstrap.js + brand.css + page-template.html)
   ──────────────────────────────────────────────────────────────────────
   New pages don't hand-roll the bootstrap above. They include
   assets/js/data-bootstrap.js which:
     - Fetches all 7 data/*.json files in a single Promise.all
     - Populates window.FP_VALUES / PICK_VALUES / SLEEPER_IDS / ADP_PAYLOAD
       / AUCTION_PAYLOAD / MVS_PAYLOAD / PLAYER_ARTICLES / PICK_AVAILABILITY
       / PICK_AVAILABILITY_META
     - Runs _applyAdpPayload + _applyAuctionPayload + _applyMvsPayload
     - Fires document.dispatchEvent('fpts:data-ready') when done

   See docs/WORKFLOW.md § "2b. Add a new page or tool" for the full flow.
   The existing 5 pages still inline their own bootstrap (pre-scaffold);
   they migrate when next touched.

   ──────────────────────────────────────────────────────────────────────
   DESIGN VOCABULARY  —  what we mean when we say "pill", "coin", "chip"…
   ──────────────────────────────────────────────────────────────────────
   pill  /  pos-pill  /  pos-badge
     The small colored rectangle showing a player's position (QB/RB/WR/
     TE/K/Pick). Classes: .pos-pill, .pos-badge, plus position variants
     .pos-qb / .pos-rb / .pos-wr / .pos-te / .pos-k / .pos-pick. Background
     comes from --pos-XX-bg vars; text color from --pos-XX vars. Trade-
     builder rows carry a min-width:30px override (.tf-asset .pos-badge in
     player-panel.css) so all letter combos render at uniform width.

   coin  /  team-logo coin
     Small circular backdrop wrapping an NFL team logo so the team color
     never clashes with the surface (pos-pill, drawer chrome) behind it.
     CSS: .team-logo--coin (translucent rgba(0,0,0,.22) dark wash, soft
     drop shadow, no border). Emit via TeamHelpers.logoImg(team,
     { size, coin: true }). Other coin variants in the codebase:
       .card-team-logo  (26px box-card coin, defined in adp-tool.html)
       .player-hs-team  (badge coin over a headshot's bottom-right,
                         uses var(--surface) — see team-helpers.js)

   chip
     Horizontal row laying out [thumbnail] [pos-pill] [name] [team-logo
     coin] [value] [...]. Used for trade-builder, recent trades, asset
     rows. Class families:
       .tc-asset       Trade Calculator main asset rows
       .tf-asset       Trade Finder rows (in drawer)
       .tc-nfl-team    name-adjacent team-logo holder span
       .ml-tc-team     My-Leagues trade-corpus chips
     The "trade-chip rule": every chip MUST emit the team-logo coin to the
     right of the player name via TeamHelpers.logoImg.

   card
     Larger rectangular surface with internal layout. Variants:
       .box-card       ADP Box view (player headshot bottom-right +
                       team coin bottom-left, mirrored 32px / 26px)
       .rank-card      MVS Most Traded Players row (with rank num + bar)
       .card-team-logo The 26px coin inside a .box-card

   row
     Taller-than-chip horizontal layout, typically with stacked text.
       .value-row              MVS Top Risers / Top Fallers
       .ml-team-roster-row     My-Leagues roster
       .rank-row-wrap          MVS Most Traded outer wrapper

   badge
     Small overlay/accent. Variants:
       .nav-badge         "SEASON 2026" topnav badge (brand orange bg)
       .player-hs-team    team logo overlaid on a player headshot
       .pos-badge         alias for pill in some contexts

   thumb  /  headshot
     Circular player photo from Sleeper CDN. Standard sizes by surface:
       22px  MVS Risers/Fallers row
       24px  Trade Finder add-search dropdown
       28px  MVS Most Traded Players
       32px  box-card mirrored bottom-right
       40px  list-view row
       80px  drawer player-panel hero
       96px  full-screen modal hero
     Generic CDN-miss fallback class: .fpts-hs-fallback (see Headshot
     Fallback Rule section above).

   flame  /  RDP thumb
     The Rookie Draft Pick placeholder thumbnail — brand-orange flame
     icon used wherever a player headshot would otherwise sit for a
     synthetic ROOKIE_PICK_X.YY entity. Defined via pickThumb() in
     player-panel.js + an inline SVG path.

   page-title  /  section-hdr  /  sub-hdr
     Three levels of in-page heading typography (Kanit ExtraBold Italic,
     descending size). page-title is the top-of-page descriptor,
     section-hdr divides tabs/areas (e.g. "Most Traded Players"),
     sub-hdr labels groupings within a section.

   ── DESIGN TOKENS  (canonical CSS variables in assets/css/brand.css) ──

   --red          #ED810C  brand orange — wordmark, nav-badge, icon-btn
                           active, trend-down, section labels. The single
                           accent color across the site; do not invent
                           new accents.
   --surface      page chrome bg          (#1a1a1a dark / #e8e8e8 light)
   --surface2     elevated chrome bg      (#222 dark / #dedede light)
   --border       subtle dividers         (#2a2a2a dark / #cccccc light)
   --border2      component outlines      (#333 dark / #bbb light)
   --black        baseline ink            (#111 dark / #f0f0f0 light — inverts)
   --white        baseline paper          (#fff dark / #111 light — inverts)
   --pos-XX-bg    position pill background (see "pill" above)
   --pos-XX       position pill text color
   --green        positive trend / value-up (#4caf6e)
   --yellow       neutral / caution (#f0c040)

   RULE OF REUSE: when adding a new UI element, pick whichever class
   family above matches its role and reuse the tokens — don't invent new
   colors, sizes, or class names. New conventions get an entry here
   FIRST, then the code follows.

   ──────────────────────────────────────────────────────────────────────
   ADP SCRAPE-COUPLING RULE  (UI filters ↔ scrape dimensions)
   ──────────────────────────────────────────────────────────────────────
   Every filter dimension exposed in the ADP Tool (adp-tool.html STATE.*
   + STATE.filters.*) MUST have a corresponding aggregation dimension in
   the data-factory scrape pipeline at
     C:\Users\deons\Desktop\sleeper_dynasty_adp\scripts_or_notebooks\01_ingest_historical.py
   Without that, the filter has nothing to slice and the UI silently
   shows empty results for any year/combo where the dimension isn't
   captured. Coupling is BIDIRECTIONAL — if a Sleeper API change ever
   drops a column a UI filter depends on, the filter MUST be deprecated
   in the UI before shipping. Silent "no results" is worse than a
   missing toggle.

   Current bidirectional mapping (UI filter → scrape column):

     STATE.source            ←→  dynasty_class          (01_ingest_historical.py:49, KEEP_DYNASTY_CLASSES)
     STATE.mode              ←→  bucket classifier      (sync-adp.py classify_startup_drafts())
     STATE.qbFormat          ←→  is_superflex           (01_ingest_historical.py groupby)
     STATE.year              ←→  season                 (01_ingest_historical.py SEASONS list)
     STATE.teamCount         ←→  st_teams               (01_ingest_historical.py)
     STATE.rounds            ←→  st_rounds              (01_ingest_historical.py)
     STATE.filters.positions ←→  md_pos                 (per-pick column)
     STATE.filters.rounds    ←→  round                  (per-pick column)
     STATE.filters.teams     ←→  draft_slot             (per-pick column)
     date range              ←→  start_month            (per-draft column)

   When adding a NEW filter to adp-tool.html, you MUST also:
     1. Add the dimension to compute_adp_time_series() groupby in
        01_ingest_historical.py (~line 466) AND the analogous groupby
        in build_adp / build_format_adp in sync-adp.py.
     2. Surface the dimension on the per-draft / per-pick parquet
        records so the existing aggregators can pick it up.
     3. Re-run 01_ingest_historical.py to rescrape with the new
        dimension captured (~30 min × seasons in SEASONS).
     4. Then re-run sync-adp.py to regenerate the year-stamped JSONs.

   POSITION EXCLUSION (frontend-side filter, all pages)
     EXCLUDED_POSITIONS in adp-tool.html drops the following from the
     board: K (used as pick-as-asset placeholders in picks bucket), DEF /
     P / FB (not really playable in dynasty), and the IDP positions
     LB / DE / DT / S / CB / DB / DL / EDGE / NT / IDP (only show up in
     pre-2023 datasets where IDP-league drafts were more common in the
     corpus — excluded so past-year boards stay offense-only matching
     2026's convention). If you ever surface IDP intentionally (e.g. as
     a separate "IDP ADP" tab), remove the relevant positions from this
     set rather than working around it.

   Highest-ROI dimensions NOT yet scraped (candidates for expansion):
     - PPR / Half-PPR / Non-PPR scoring  (md_scoring_type currently
                                          captured as raw string;
                                          needs a parser)
     - TE Premium / IDP                  (also embedded in md_scoring_type)
     - Injury status at draft time       (would require external
                                          player-health snapshot +
                                          merge by date)
     - Post-draft trade liquidity        (requires /league/{lid}/traded_picks
                                          endpoint, not currently called)

   See docs/WORKFLOW.md § "Adding a new ADP filter" for the operator
   checklist.
   ──────────────────────────────────────────────────────────────────────
*/

window.LegendContent = {

  // ════════════════════════════════════════════════════════════════════════
  'index': {
    title: 'Trade Database',
    blurb: 'Aggregated dynasty trade observations with per-player insights. ' +
           'Master TRADES array is built at page load from data/mvs.json player.recentTrades (deduplicated ' +
           'by transaction_id, ~1,405 unique trades). Player values come from data/mvs.json (wholesale ' +
           'overlay on data/values.json). Visit any other page from a player\'s panel via the cross-page handoff buttons.',
    sections: [
      {
        name: 'Topnav',
        items: [
          { label: 'Wordmark + Front Office Tag', what: 'Brand identity in the top-left. SVG asset that swaps light/dark when the theme toggle changes.', source: 'Inline SVG; light variant defined in WORDMARK_LIGHT constant', values: '—', notes: 'Same wordmark across all 5 pages; if it ever diverges, run a regression check.' },
          { label: 'Nav Links (Calculator / User Importer / Tiers / ADP / Rankings)', what: 'Cross-page navigation. Current page\'s own link is omitted from its own nav.', source: 'Hardcoded <a class="nav-link"> markup in each page\'s topnav', values: 'Rankings opens FantasyPoints.com externally', notes: 'Order is identical across pages — verify if you add a new page (commit 2d88de2 verified consistency).' },
          { label: 'Theme Toggle (#theme-toggle)', what: 'Toggles between dark and light variants of the brand palette.', source: 'Click handler reassigns CSS var values via document.documentElement.setAttribute("data-theme", ...)', values: 'dark (default) / light', notes: 'CSS in :root vs [data-theme="light"] block; wordmark SVG also swaps. Persisted in localStorage as "fpts-theme".' },
        ],
      },
      {
        name: 'Filter Panel',
        items: [
          { label: 'Filter Collapsible (mobile)', what: 'On phone widths the filter panel collapses behind a toggle button to save real estate.', source: 'toggleMobileFilters() at index.html ~L7550; #filter-toggle-btn + #filter-collapsible-body', values: '—', notes: 'Desktop view always shows filters expanded.' },
          { label: 'QB Format Filter (#f-qb)', what: 'Filter trade list to Superflex / 1QB / All. Matched against t.qb (set from CSV recent_trades.format).', source: 'applyFilters() at L2904; checks t.qb === fqb', values: 'all (default) / sf / 1qb', notes: 'qb field IS in the CSV (100% coverage) so this filter is fully functional.' },
          { label: 'Teams Count Filter (#f-teams)', what: 'Filter trades by league size. Currently null-safe (CSV does not carry teams_count per trade), so any pick except All matches every trade with null.', source: 'applyFilters() L2925: (ftm==="all"||t.teams_count==null||t.teams_count===parseInt(ftm))', values: '8 / 10 / 12 / 14 / All', notes: 'Awaiting CSV schema extension — see data/source/REQUEST-csv-schema-extension.md.' },
          { label: 'Starters Filter (#f-starters)', what: 'Filter by lineup starter count. Null-safe (data not in CSV yet).', source: 'applyFilters() L2924', values: '8 / 9 / 10 / 11 / 12 / 13 / All', notes: 'Schema-extension pending.' },
          { label: 'TEP Filter (#f-tep)', what: 'Filter by tight-end-premium bonus. Null-safe.', source: 'applyFilters() L2926', values: 'none / 0.25 / 0.5 / 0.75 / 1.0 / All', notes: 'Schema-extension pending.' },
          { label: 'PPR Filter (#f-ppr)', what: 'Filter by points-per-reception variant. Null-safe.', source: 'applyFilters() L2927', values: '1 (Full PPR) / 0.5 (Half) / 0.25 (PPC) / 0 (Standard) / All', notes: 'Schema-extension pending.' },
          { label: 'PPC Filter (#f-ppc)', what: 'Separate PPC slot — currently a duplicate of PPR. Both check t.ppr in applyFilters.', source: 'applyFilters() L2928', values: '—', notes: 'May be redundant; consider removing once CSV schema extends.' },
          { label: 'Pass-TD Filter (#f-passtd)', what: 'Filter by points-per-passing-touchdown. Null-safe.', source: 'applyFilters() L2932', values: '4 / 6 / All', notes: 'Schema-extension pending.' },
          { label: 'FAAB Filter (#f-faab)', what: 'Trades that include FAAB on either side. Null-safe in current data.', source: 'applyFilters() L2929', values: 'yes / no / All', notes: 'Schema-extension pending.' },
          { label: 'Roster Size Filter (#f-roster)', what: 'Cap roster size (bench depth). Null-safe.', source: 'applyFilters() L2934', values: '20 / 22 / 25 / 30 / 35 / 40 / All', notes: 'Schema-extension pending.' },
          { label: 'Date Range (#f-date-from, #f-date-to)', what: 'Constrain trades to a date window. Always functional since CSV provides ISO dates.', source: 'applyFilters() L2930-2931', values: 'YYYY-MM-DD strings; empty = no constraint', notes: 'See setDatePreset() at L2921 for the preset chips.' },
          { label: 'Asset Count Filter (#f-assets)', what: 'Cap total assets per trade (players + picks combined).', source: 'applyFilters() L2933 with totalAssets computed inline', values: '≤2 / ≤3 / ≤4 / ≤5 / All', notes: 'Useful for finding 1-for-1 vs blockbuster trades.' },
          { label: 'Rookie Pick Builder (#f-rookie-picks)', what: 'Builder UI to filter for trades that include specific rookie picks (year + round, optional slot).', source: 'getSelectedPicks() returns array of {year, round, slot}; applyFilters() L2937 checks intersection', values: 'Multi-select chips per pick', notes: 'Used heavily by rookie-pick-hunting users.' },
          { label: 'Active Filter Chips Row', what: 'Visual readout of which non-default filters are currently applied. Click X to clear that filter.', source: 'Built inside applyFilters() L2962 onwards', values: 'Color-tinted chips per active filter', notes: 'Hidden when all filters are at default (All / empty).' },
          { label: 'Reset Filters Button', what: 'One-click reset of every filter back to All / empty / default.', source: 'resetFilters() at L2965', values: '—', notes: 'Does not clear the Side A/B trade search — only the dropdowns + dates.' },
        ],
      },
      {
        name: 'Trade Search (Two-Sided)',
        items: [
          { label: 'Side A / Side B Search Inputs (#search-a, #search-b)', what: 'Find trades that include specific assets on each side. Both sides must match for a trade to appear.', source: 'tradeSearch.a + tradeSearch.b arrays of {type,label}; matched in applyFilters() L2939', values: 'Player names or pick labels like "2026 1st"', notes: 'Sides are symmetric — A and B can be swapped without affecting results.' },
          { label: 'Search Result Dropdown (.pp-search-results)', what: 'Live autocomplete of players + picks as user types. Selecting a result adds it as a chip on that side.', source: 'Filters FP_VALUES keys + known pick labels by input substring; rendered inline below input', values: 'Tiny HS + pos pill + name per result', notes: 'See .pp-search-result CSS at L1795-1801.' },
          { label: 'Side Tags (search-tags-a / search-tags-b)', what: 'Chips representing the user\'s active search asset selections.', source: 'tradeSearch[side] array; rendered after each pick', values: 'Click X to remove the chip', notes: 'Both sides cleared by clearMainSearch() at L7558.' },
          { label: 'Filter Count Badge', what: 'Shows "X trades" matching the current Side A + B search.', source: '#player-filter-count text content; updated in applyFilters()', values: 'Numeric count', notes: 'Hidden until a search is active.' },
        ],
      },
      {
        name: 'Sections 01-04 (the main page content)',
        items: [
          { label: '01 — Recent Trades List', what: 'Time-ordered list of trade cards matching all active filters.', source: 'renderRecent() at L2979; reads filtered array (TRADES filtered by applyFilters)', values: 'Up to 100 trades shown per page; sorted newest first by date', notes: '~1,405 total trades after dedup; trade card template at L7525.' },
          { label: 'Trade Card (.trade-card)', what: 'Anatomy: date + format chip on top, two sides (A/B) with each asset row showing HS + pos badge + name + NFL team, dotted divider between sides, format/league chips below.', source: 'tradeCardHtml() near L7470', values: 'Asset rows render players + picks; picks open pick modal on click', notes: 'Chips conditionally render based on data availability (commit 8e60ee8).' },
          { label: '02 — Most Traded Players', what: 'Top 10 players appearing most in the filtered TRADES list. Bar chart of relative trade frequency.', source: 'renderTopPlayers() at L3047; aggregates filtered.flatMap(t => t.players)', values: 'Bar = trade count relative to max; click row to expand inline trade list', notes: 'Expanded rows use toggleExpandPlayer() at L2997.' },
          { label: '03 — Most Traded Rookie Picks', what: 'Top 10 picks (year + round combined) appearing most in filtered trades.', source: 'renderTopPicks() at L3063', values: 'Bar chart of relative pick movement', notes: 'Aggregates picks regardless of slot — "2026 R1" counts all 1.01-1.12.' },
          { label: '04 — Assets Traded by Type (position distribution)', what: 'Distribution of all assets in the filtered trade list, grouped by position + a PICKS bucket.', source: 'renderPositions() at L3107', values: 'QB / RB / WR / TE / PICKS bars in position colors', notes: 'PICKS uses purple (--pos-pick-bg). Click a row to expand asset detail.' },
          { label: 'Section Tabs (Recent / Top Players / Top Picks / Positions)', what: 'Switch between sections 01-04 on narrow screens. Desktop shows all simultaneously.', source: 'showTab() at L3123', values: 'recent / top-players / top-picks / positions', notes: 'Tab UI is mobile-first; desktop visibility is overridden via CSS.' },
        ],
      },
      {
        name: 'Value Tracker (Risers / Fallers)',
        items: [
          { label: 'Risers Panel (#value-risers)', what: 'Top 10 players whose ADP has improved the most (rising up draft boards) over the past 30 days.', source: 'renderValueTracker() at L3129; uses FP_VALUES[name].trend (positive = rising)', values: 'Each row: HS + pos badge + name + value + green ▲ trend amount', notes: 'Trend populated by _applyAdpPayload from month-over-month ADP deltas (commit 892b2ad).' },
          { label: 'Fallers Panel (#value-fallers)', what: 'Top 10 players whose ADP has worsened the most.', source: 'Same source as Risers, filtered to negative trend; sorted ascending', values: 'Each row: HS + pos + name + value + red ▼ trend amount', notes: 'Trend convention: positive trend = ADP improved; negative = ADP fell.' },
          { label: 'Trend Outline (.trend)', what: 'Visual treatment for trend arrows so they\'re legible over any background color (position-colored rows).', source: 'Shared CSS rule applied across all pages via assets utilities', values: 'text-shadow 8-direction + -webkit-text-stroke 0.5px #000', notes: 'Trend up = #66dd84 (green); down = var(--red) #ED810C.' },
        ],
      },
      {
        name: 'Player Panel (slide-in)',
        items: [
          { label: 'Open Trigger', what: 'Click any player name in any rank card, trade asset, or value-row → panel slides in from right.', source: 'openPanel(name) at L7000+; transformed via .open class on #player-panel', values: '—', notes: 'Cross-page handoff also auto-opens it on load if ?fpts-handoff in URL.' },
          { label: 'Close Button + Backdrop Click', what: 'Two ways to close: ✕ button at top-right of panel, or click outside the panel onto the dimmed backdrop.', source: 'closePanel() at L7062', values: '—', notes: 'Escape key also closes (handler on document).' },
          { label: 'Cross-page Action Bar (top)', what: '"Open in Calculator / ADP / My Leagues" buttons. Each writes player name to localStorage via _fptsWriteHandoff with 60s TTL, then opens the destination page in a new tab.', source: 'L1991-2012; uses window.open(url, "_blank", "noopener")', values: '—', notes: 'Destination page reads via _fptsReadHandoff and auto-opens that player.' },
          { label: 'Player Profile (.pp-profile)', what: 'Header section: 96px circular HS, position pill + NFL team, 32px Kanit name, inline stats row, right-floating Fantasy Points value.', source: 'Markup at L1881-1887, CSS overrides at L1440-1453', values: 'Stats row: Age, Pos Rank, Overall Rank, PPG, Dynasty ADP, Auction', notes: 'Visual unification commit fce350f matched this to adp-tool/tiers patterns.' },
          { label: 'Fantasy Points Value (#pp-value-val)', what: 'Right-floating canonical player value. The headline number the entire site reads as "this player\'s value".', source: 'FP_VALUES[name].value, which is now MVS-overlaid (commit 019ca4e). SF or 1QB per toggle.', values: 'Number range ~1 to ~10,500 in MVS units', notes: 'Toggle SF↔1QB on adp-tool to switch which format shows here. Persists in localStorage fpts-adp-format.' },
          { label: 'Trade Stats Row (#pp-stats-left)', what: '4-column grid showing how often this player appears in trades + average context per trade.', source: 'Computed in openPanel from playerTrades = TRADES.filter(t => has player)', values: 'Times Traded (red) / Avg Pick Included / Avg Added Value Needed / Avg Assets Moved', notes: 'Recomputes whenever the global TRADES filter changes.' },
          { label: 'MVS Extras: OTC Value', what: 'OnTheClock cross-check value with delta vs current MVS. Helps identify if MVS is in line with the secondary market.', source: 'FP_VALUES[name].otcValue from CSV otc_value column', values: 'Format: "9,000 (+1,452 vs MVS)". Positive = MVS above OTC.', notes: 'Hidden when CSV row lacks otc_value. Rendered by MvsExtras.buildOtcRankings.' },
          { label: 'MVS Extras: Baseline', what: 'Pre-market formula baseline value + percentage delta vs current MVS. Indicates whether the market is paying a premium (hype) or discount (sell signal) vs the formula\'s expected value.', source: 'FP_VALUES[name].baseline (toggle-aware between baselineSf / baseline1qb)', values: 'Positive % (green) = market above baseline; negative % (red) = below', notes: 'Toggle-aware via _applyMvsPayload — uses baseline_1qb when fmt=1qb (commit 1aaa21e).' },
          { label: 'MVS Extras: Trade Volume (7d)', what: 'Number of distinct trades this player has been involved in across the dynasty scrape over the past 7 days. Real-time liquidity signal.', source: 'FP_VALUES[name].tradesLastWeek (toggle-aware between tradesLastWeekSf / 1qb)', values: 'Hot ≥200 (red badge) / Active ≥50 (orange) / Quiet >0 (grey) / No trades', notes: 'High volume means more reliable price discovery — the market is actively assessing this player.' },
          { label: 'MVS Extras: Contributor Rankings', what: 'Individual ranker positions from the FantasyPoints contributor team plus the aggregated Main consensus.', source: 'FP_VALUES[name].rankings.{main, jax, jay, joe, trav} (CSV: *_rankings columns)', values: 'Lower number = higher rank (1 = best). Main is the aggregate; named contributors are individuals.', notes: 'When ranker disagreement is wide (e.g. Jax 50 vs Trav 200), the player is contentious.' },
          { label: 'MVS History Sparkline', what: 'Inline SVG line chart of the player\'s MVS value over the past 14 days. No charting library — pure SVG path.', source: 'FP_VALUES[name].history (toggle-aware history / historySf / history1qb), each entry {mvs, date}', values: 'Green line = value rose since start; red = fell; white = flat. Footer: min · delta · current · max', notes: 'Color of stroke matches trend direction. Footer text shows specific delta number.' },
          { label: 'Recent Trades Widget', what: 'Last 3 most recent actual trade observations involving this specific player. Shows both sides + each asset\'s MVS at trade time.', source: 'FP_VALUES[name].recentTrades (CSV recent_trades JSON, trimmed to 3 most recent)', values: 'Each card: date + format badge + side A vs side B with asset list + side totals', notes: 'Focus player\'s name is highlighted red so users can spot them in multi-asset packages. Asset .mvs reflects trade-time value, not current.' },
          { label: 'MVS Data Refreshed (footer)', what: 'Timestamp showing when the MVS CSV was last regenerated (per the upstream data run).', source: 'FP_VALUES[name].lastUpdated from CSV last_updated column', values: 'Format: "MVS data refreshed YYYY-MM-DD HH:MM"', notes: 'All players share the same lastUpdated per CSV run, so it\'s a global freshness marker.' },
          { label: 'Tabs Row (.pp-tabs)', what: 'Tab switcher for the bottom pane: Trades, Player Stats, Age Curve, Trade Finder.', source: 'ppShowTab() at L7574', values: '4 tabs; last-selected persisted in ppLastTab variable so reopening the panel restores it', notes: 'ppLastTab is cleared on closePanel() so a fresh open starts on Trades.' },
          { label: 'Tab: Trades (#pp-trades-tab)', what: 'Full list of trades involving this player. Same trade card template as the main 01 Recent Trades list. Respects active filters.', source: 'sorted = playerTrades; rendered via tradeCardHtml(t)', values: '—', notes: 'If no trades match, shows "No trades found".' },
          { label: 'Tab: Player Stats (#pp-stats-tab)', what: '2025 fantasy season stats: PPG, games played, pass/rush/rec yards + TDs, targets.', source: 'PLAYER_STATS_DATA hardcoded block near L3134', values: 'Big stat blocks for QB (pass yds/td), RB (rush yds/td), WR/TE (rec/yds/td/tgt)', notes: 'Currently hardcoded — could be replaced with a Sleeper /stats endpoint or sync-fp.py output.' },
          { label: 'Tab: Age Curve (#pp-age-curve-tab)', what: 'Position-relative value projection across the player\'s career arc. Visualizes when value typically peaks for their position.', source: 'renderAgeCurve() computes from FP_VALUES[name].age + posKey + per-position curve constants', values: 'Curves: RB peak 24, WR 26, TE 27, QB 28', notes: 'Curve constants in `curves` object at L6612; heuristic, not regression-fitted.' },
          {
            label: 'Tab: Trade Finder (#pp-finder-tab)',
            what: 'Combinatorial trade suggestion engine. Given an "anchor" asset on one side (the open player) and the gap between sides, generates ranked single-asset suggestions whose values fill that gap. Optional search filter narrows the candidate pool by name.',
            source: 'Shared module assets/js/player-panel.js — _drawTradeFinder() builds the UI; populated from FP_VALUES + PICK_VALUES.',
            values: 'Each suggestion row: asset (player or pick) + value + delta vs gap. Up to 8 suggestions per side slot.',
            inputs: 'gap: |sideA.value − sideB.value| (the imbalance the suggestion needs to close). query: optional substring to filter candidates by name/label. excluded: any asset already on either side of the trade.',
            formula: 'candidates = (all FP_VALUES players + all PICK_VALUES picks) filtered to !excluded. If query is set: filter where label.toLowerCase().includes(query). Then sort by Math.abs(asset.value − gap) ascending. Take first 8. A suggestion is flagged "fair" when absDiff < 300 (rendered green).',
            output: 'Up to 8 suggestion chips per slot. Clicking a chip writes it into the trade-calculator handoff and opens that page with the suggestion pre-filled.',
            example: 'Side A = Justin Jefferson (value 9,800). Side B empty. gap = 9,800. Top candidates near 9,800: De\'Von Achane 9,650 (Δ150 ✓fair), Bijan Robinson 9,920 (Δ120 ✓fair), Drake London 9,440 (Δ360), Jahmyr Gibbs 10,100 (Δ300 ✓fair). Sorted by absDiff → Bijan, Achane, Gibbs, London, …',
            codeRef: 'assets/js/player-panel.js:1096-1282 (_drawTradeFinder)',
            notes: 'When gap < 100 (sides already balanced) the suggester returns nothing — there is no imbalance to fill. Single-asset only; the engine does NOT combinatorially try player+pick bundles to hit exact value.'
          },
        ],
      },
      {
        name: 'Pick Panel (separate slide-in for picks)',
        items: [
          { label: 'Open Trigger', what: 'Click any pick label in any trade card → opens the pick panel (similar to player panel but for draft picks).', source: 'openPickPage(year, round) at L7409', values: '—', notes: 'Distinct panel #pick-panel — separate from #player-panel.' },
          { label: 'Pick Profile Header', what: '"Pick {Year} R{Round}" identity, plus trade stats showing how often this pick has moved.', source: 'pickTrades = TRADES.filter(t => t.picks.includes year+round)', values: 'Times Traded, Avg Players Included, Avg Picks Included, etc.', notes: 'Mirrors player-panel structure for visual consistency.' },
          { label: 'Related Rounds + Years', what: 'Sidebar showing other rounds for the same year + other years for the same round (so you can pivot to adjacent picks).', source: 'otherRounds / otherYears arrays computed inline', values: 'Click any to navigate to that pick', notes: 'Helps users compare 2026 R1 vs 2026 R2, or 2026 R1 vs 2027 R1.' },
        ],
      },
      {
        name: 'Cross-page Handoff System',
        items: [
          {
            label: '_fptsWriteHandoff(payload, destUrl) — the producer',
            what: 'Universal one-way handoff. Writes a JSON payload to localStorage key "fpts-handoff" tagged with the current timestamp, then opens destUrl in a new tab. Every "Open in Calculator / ADP / My Leagues" button on this page is a thin wrapper around this function.',
            source: 'index.html ~L757-763 (also duplicated on each page that emits handoffs)',
            values: '—',
            inputs: 'payload: { source: string, primaryPlayer?: string, players?: string[], trade?: {sideA, sideB} }. destUrl: page-relative URL like "trade-calculator.html" or "my-leagues.html#auto-import".',
            formula: 'localStorage.setItem("fpts-handoff", JSON.stringify({ ts: Date.now(), ...payload })); window.open(destUrl, "_blank", "noopener,noreferrer")',
            output: 'A localStorage key the destination page consumes within 60 seconds, OR garbage that expires silently.',
            example: 'On panel button click: _fptsWriteHandoff({ source: "index", primaryPlayer: "Justin Jefferson" }, "trade-calculator.html"). Calculator opens, reads the handoff, auto-fills Jefferson into Side A.',
            codeRef: 'index.html:757 (_fptsWriteHandoff)',
            notes: 'No transactional safety — if user closes the destination tab before page load completes, the handoff is still consumed (and lost). This is acceptable because the source data lives in the player panel and can be re-opened.'
          },
          {
            label: '_fptsReadHandoff() — the consumer',
            what: 'Reads, validates, and CLEARS the handoff key. Returns the payload only if it is younger than the 60-second TTL; otherwise returns null and deletes the stale key. Consume-once semantics — a single payload cannot be read twice.',
            source: 'index.html ~L764-773 (and on every destination page)',
            values: 'Returns the payload object or null',
            inputs: 'None — reads localStorage["fpts-handoff"].',
            formula: 'raw = localStorage.getItem("fpts-handoff"); if (!raw) return null; parsed = JSON.parse(raw); localStorage.removeItem("fpts-handoff"); if (Date.now() − parsed.ts > 60000) return null; return parsed;',
            output: '{ ts, source, primaryPlayer?, players?, trade? } or null.',
            example: 'On trade-calculator.html bootstrap: const h = _fptsReadHandoff(); if (h && h.primaryPlayer) { addToSideA(h.primaryPlayer); } if (h && h.trade) { restoreFullTrade(h.trade); }',
            codeRef: 'index.html:764 (_fptsReadHandoff). Destination consumers: trade-calculator.html, adp-tool.html, my-leagues.html, tiers.html — each inside its bootstrap routine.',
            notes: 'The 60s TTL exists because users sometimes click a handoff button, get distracted, and re-open the destination 10 minutes later. Without TTL the stale handoff would fire unexpectedly. Removal-before-validation prevents the stale-key persisting in localStorage.'
          },
          {
            label: 'Floating Calc/ADP/Leagues buttons (panel)',
            what: 'Visible action bar at top of player panel. Each writes a player-name handoff and opens the destination.',
            source: '_fptsXpageOpenCalcFromPanel() etc. at L1991-2012',
            values: '—',
            notes: 'Trade-Finder tab has its own variant: _fptsXpageOpenCalcFromFinder pushes the full trade package (sideA + sideB asset arrays) instead of a single primaryPlayer.'
          },
        ],
      },
      {
        name: 'Data Pipeline (MVS overlay)',
        items: [
          {
            label: 'FP_VALUES base layer',
            what: 'The starting player dictionary. Built from data/values.json (the FantasyPoints-sourced sync-fp.py output). Has the static profile fields every page needs: sleeperId, age, team, pos, posRank, ppg, injury.',
            source: 'data-bootstrap.js — loaded once and exposed as window.FP_VALUES',
            values: 'FP_VALUES[playerName] = { sleeperId, age, team, pos, posRank, ppg, injury, value (initial), ... }',
            codeRef: 'sync-fp.py (data factory) → data/values.json → data-bootstrap.js loadValues()',
            notes: 'FP_VALUES is keyed by display name (e.g. "Justin Jefferson"). After MVS overlay runs, the .value field is replaced; the profile fields (age, team, pos) stay from FP_VALUES.'
          },
          {
            label: 'MVS overlay — _applyMvsPayload',
            what: 'Replaces every value-bearing field on FP_VALUES with MVS data when data/mvs.json is present. Format-aware: reads localStorage.fpts-adp-format (sf or 1qb) and picks the matching MVS subfield. Profile fields (age, team, pos, posRank, ppg, sleeperId, injury) fall back to FP_VALUES — MVS does NOT overwrite those.',
            source: 'data-bootstrap.js:153-207 — _applyMvsPayload(payload, format)',
            values: 'Wholesale replacement: value / valueSf / value1qb / baseline / trend / history / otcValue / otcDiff / rankings / recentTrades / lastUpdated',
            inputs: 'payload: parsed data/mvs.json. format: "sf" (default) or "1qb" — read from localStorage.fpts-adp-format. If a player exists in FP_VALUES but NOT in MVS, their .value is forced to 0 (MVS-uncovered players are deliberately zeroed so they sort to the bottom of value lists rather than carrying stale FP values).',
            formula: 'for each playerName in payload.players: FP_VALUES[name].value = (format === "1qb" ? p.value_1qb : p.value_sf); FP_VALUES[name].baseline = (format === "1qb" ? p.baseline_1qb : p.baseline_sf); FP_VALUES[name].history = (format === "1qb" ? p.history_1qb : p.history_sf); ... // profile fields untouched.',
            output: 'A mutated window.FP_VALUES that downstream code reads as if MVS were the source of truth.',
            example: 'localStorage.fpts-adp-format = "sf". User opens Jefferson panel. FP_VALUES["Justin Jefferson"].value === 9,800 (MVS valueSf). FP_VALUES["Justin Jefferson"].age === 26 (from FP_VALUES — MVS did not override). User toggles to 1QB on adp-tool: localStorage updates, then _applyMvsPayload re-runs with format="1qb", and FP_VALUES["Justin Jefferson"].value becomes 7,200 (MVS value1qb).',
            codeRef: 'assets/js/data-bootstrap.js:153-207 (_applyMvsPayload). Toggle handler that re-invokes it lives in adp-tool.html.',
            notes: 'Precedence order is: MVS wins for values, FP wins for profile. When debugging "why does this player\'s value look wrong" — check mvs.json first, then values.json. If a player suddenly has value=0, they were dropped from the MVS coverage list.'
          },
          {
            label: 'Format toggle persistence (sf vs 1qb)',
            what: 'A single user setting determines which MVS subfield shows everywhere. The toggle is exposed on adp-tool but persisted globally — every page reads it on load.',
            source: 'localStorage key "fpts-adp-format"',
            values: '"sf" (default) or "1qb"',
            inputs: 'User click on the SF/1QB tab in adp-tool.html.',
            formula: 'on toggle change: localStorage.setItem("fpts-adp-format", newFormat); then re-run _applyMvsPayload(MVS_PAYLOAD, newFormat) and re-render the visible page.',
            output: 'Every value-displaying surface across the site reflects the chosen format.',
            example: 'User on tiers.html sees Jefferson at 9,800 (SF). Opens adp-tool.html, clicks 1QB. Returns to tiers.html → Jefferson now shows 7,200. No data re-fetched; only the overlay was re-applied with the other format.',
            codeRef: 'adp-tool.html toggle handler (search "fpts-adp-format"); data-bootstrap.js:153 reads the key on load.',
            notes: 'Single-key design is intentional: separate Superflex/1QB visits to different pages would be jarring. Trade-off: a user who actively plays both formats has to toggle each time.'
          },
        ],
      },
      {
        name: 'Interactions & Conventions (quick reference)',
        items: [
          { label: 'Position Colors', what: 'Every position has a brand color used as bar/stripe/background.', source: 'CSS vars --pos-{qb,rb,wr,te,k,pick}-bg', values: 'QB red #e05252 / RB green #4caf6e / WR blue #5b9bd5 / TE orange #e09a30 / K + PK purple #9b91d4', notes: 'Light theme variants are darker for contrast on light backgrounds.' },
          { label: 'Brand Red (--red)', what: 'Single accent color across the whole site. Section labels, active states, important badges, sell-signal trend.', source: 'CSS var --red = #ED810C (orange-toned red despite the name)', values: 'Used for the wordmark, sticky topnav border, "PAGE LEGEND" label, etc.', notes: 'Legacy name from earlier brand spec; current spec is orange but variable stays --red.' },
          { label: 'Keyboard: Escape', what: 'Closes any open player panel / pick panel / legend drawer / cross-page modal.', source: 'Document-level keydown listeners scattered across modules', values: '—', notes: 'Some modals also support Escape; legend drawer specifically wired in legend.js.' },
          { label: 'Click vs Hover', what: 'Player rows are click-to-open (no hover behavior). Trade card chips are clickable: clicking a player name opens panel, clicking a pick opens pick modal.', source: 'Click handlers throughout render templates', values: '—', notes: 'No drag-and-drop on this page — drag is reserved for the Trade Simulator on my-leagues.' },
          { label: 'Mobile View Threshold', what: 'Filters collapse behind a toggle button below 700px. Player panel becomes full-width.', source: '@media (max-width: 700px) blocks throughout CSS', values: '—', notes: 'Test in dev tools at 375×667 (iPhone SE size) for the tightest case.' },
          { label: 'localStorage Keys Used', what: 'Persistent state keys touched by this page.', source: 'localStorage.{getItem,setItem} calls', values: 'fpts-handoff (60s TTL cross-page) / fpts-adp-format (sf|1qb) / fpts-theme (dark|light) / fpts-imported-league (read-only peek)', notes: 'Clear localStorage to reset all UI state.' },
          { label: 'Cache-busting URL Param', what: 'Every data/*.json fetch appends ?v=<timestamp> to bypass browser cache.', source: 'window.__DATA_VERSION at bootstrap (L7144); appended in fetch() calls', values: '?v=1737485042000 (ms epoch)', notes: 'Ensures users get fresh data after each push.bat deploy.' },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════
  'adp-tool': {
    title: 'ADP Tool',
    blurb: 'Real Sleeper dynasty draft ADP rendered as a box-card board or sortable list. ' +
           'Two top-level tabs: Dynasty Startup ADP (Picks / Simple / With Rookies variants of full startups) ' +
           'and Dynasty Rookie ADP (rookie-only drafts, ≤6 rounds). ' +
           'Data from data/adp.json — the sleeper_dynasty_adp pipeline scrapes completed drafts, ' +
           'classifies them, and aggregates pick-weighted ADP for SF + 1QB formats. ' +
           'Source + variant + QB-format + date range combine to select which aggregate fills the board.',
    sections: [
      {
        name: 'Page Header',
        items: [
          { label: 'Source Tabs (.adp-tab[data-source])', what: 'Top-level switch between Dynasty Startup ADP and Dynasty Rookie ADP. Each tab keeps its OWN qbFormat, dates, view, snake, filters, sort, rounds, teamCount. Switching tabs parks the inactive tab\'s state and restores the other\'s.', source: 'STATE.source (default "startup"); buttons in .adp-source-tabs; setSource() in adp-tool.html', values: 'startup (Picks/Simple/With-Rookies startup variants) / rookie (rookie-only drafts, ≤6 rounds)', notes: 'Year suffix ("2026") pulled dynamically from ADP_PAYLOAD.season via applyAdpYearLabel(). Active tab has orange --red bottom-border. Per-tab state stored in localStorage keys fpts-adp-startup-state + fpts-adp-rookie-state; active tab in fpts-adp-active-source. URL hash gains source= param for shareable links.' },
          { label: 'Sub-mode Descriptor (#page-title)', what: 'Smaller line below the tab strip describing the current sub-view (e.g. "Sub-view: Picks-as-assets startups" / "Rookie-only drafts (≤6 rounds)").', source: 'renderAll() reads MODE_TO_LABEL[STATE.mode].title (startup tab) or ROOKIE_LABEL.title (rookie tab)', values: 'e.g. "Sub-view: Vet-only startups (simple)"', notes: 'Repurposed from the prior 36px page-title to a 20px descriptor when the tabs took over the page-header. Kanit italic.' },
          { label: 'Page Subtitle (#page-subtitle)', what: 'Dynamic subtitle describing the current view, including QB format.', source: 'lbl.subTpl(qbFormatLabel())', values: 'e.g. "Real Sleeper rookie-draft positions — Superflex / 2QB rookie drafts, incoming class only."', notes: 'Format label flips between "Superflex / 2QB" and "1QB" per STATE.qbFormat. Rookie tab pulls from ROOKIE_LABEL.subTpl.' },
        ],
      },
      {
        name: 'Controls Bar',
        items: [
          { label: 'Variant Buttons (#variant-group, data-mode)', what: 'Toggle between Picks / Simple / With Rookies variants WITHIN the startup source. Each maps to a different draft-subset aggregate. HIDDEN when source=rookie (rookie tab has no sub-variants).', source: 'STATE.mode (default "picks"); buttons inside #variant-group; setMode(); _applySourceUiConstraints() hides the row when source=rookie', values: 'picks (real players + RDP placeholders from K-as-pick startups) / simple (vet-only, no rookies/kickers) / rookies (incl. 2026 rookies; UI label is "With Rookies" but data key is rookies_*)', notes: 'Picks bucket: sync-adp.py classify_startup_drafts identifies startups with K in rounds 1-4, then relabel_picks_K_to_rdp rewrites K player_ids to ROOKIE_PICK_X.YY before aggregation — so the board shows real top-of-board players AND rookie pick slots intermixed. Trend index rebuilds on every mode switch. The "Rookies"→"With Rookies" rename happened when the rookie-source tab was added (2026-05-13) to avoid label clash.' },
          { label: 'QB Format Buttons (data-qb)', what: 'Toggle between Superflex/2QB and 1QB player pools. The 1QB button is HIDDEN while on Picks mode (only 4 qualifying 2026 picks-as-K 1QB drafts; below min_drafts).', source: 'STATE.qbFormat (default "sf"); buttons at L554-557; setQbFormat() at L1255; _applyPicksOneQbConstraint() hides/shows the 1QB button per STATE.mode', values: 'SF or 1QB; persists in localStorage "fpts-adp-format"', notes: '1QB sample is ~half SF size on Simple/Rookies — wider confidence intervals on deep ADP. Toggle hide is purely visual; setQbFormat("1qb") still works programmatically. Toggle also affects DB age/value chart on index page via cross-page persistence (commit eeefe91).' },
          { label: 'Date Range (#date-from, #date-to)', what: 'Constrain ADP aggregation to a date window.', source: 'STATE.dateFrom + dateTo; getActiveBucket() at L892', values: 'YYYY-MM-DD; both empty = byMonth.ALL aggregate', notes: 'aggregateBuckets() walks per-month buckets and re-aggregates pick-weighted ADP for the window.' },
          { label: 'Date Presets (data-preset)', what: 'Quick buttons for 7d / 30d / 90d / All.', source: 'applyPreset() at L2936', values: '7 / 30 / 90 / all', notes: 'Auto-populates the date inputs and triggers a re-aggregate.' },
          { label: 'View Toggle (data-view)', what: 'Switch board between Box (card grid) and List (sortable table with CSV download).', source: 'STATE.view; setView() at L1237', values: 'box (default) / list', notes: 'Box view forced to List on phones (<700px). Disabled box button shown greyed.' },
          { label: 'Snake Toggle (#snake-toggle)', what: 'Enable/disable snake order for the visual board layout. Doesn\'t affect ADP values themselves.', source: 'STATE.snake (default true)', values: 'On = round 2 reverses; Off = linear', notes: 'Affects only visual layout.' },
          { label: 'Sample Badge', what: 'Number of distinct drafts feeding the current view.', source: 'maxDrafts(softList) at L1037', values: 'Hundreds to ~1000+ depending on filters', notes: 'Larger sample = more reliable ADP. Bigger drops on filter combinations.' },
        ],
      },
      {
        name: 'Search + Position Filter',
        items: [
          { label: 'Search Box (#search-input)', what: 'Live filter the board by player name.', source: 'STATE.search; isSoftMatch() filters', values: 'Substring match (case-insensitive)', notes: 'Search clear (×) button revealed when input non-empty.' },
          { label: 'Position Chips (#pos-breakdown)', what: 'Toggle chips for QB / RB / WR / TE / K to filter board by position(s).', source: 'STATE.filters.positions Set', values: 'Multi-select — click each to toggle', notes: 'Chip shows count of players in soft-filtered set per position.' },
          { label: 'Settings Drawer (.drawer)', what: 'Hamburger drawer with advanced controls: team count (8/10/12/14), rounds (1-30), pos breakdown toggles.', source: 'syncSettingsUi() at L1430; saveSettings/loadSettings persist to localStorage', values: '#team-count / #rounds inputs', notes: 'Team count + rounds affect board layout (rows × cols) for box view.' },
        ],
      },
      {
        name: 'Board (Box View)',
        items: [
          { label: 'Box Card (.box-card)', what: 'One per player slot. Top row: pick number / pos rank / ADP. Below: stacked first-name + last-name. Bottom-right: circular HS or brand flame thumbnail (RDP rows).', source: 'renderBoard() L1100+; box-card markup; isRookiePick(p) routes RDP rows to flameThumb()', values: 'Background = position color (QB red, RB green, WR blue, TE orange, K/RDP purple)', notes: 'Click to open the player modal with trend, history, articles, heatmap. RDP rows (synthetic sleeperId "ROOKIE_PICK_X.YY") open a modal with the orange flame avatar + "RDP" pos chip + the new RDP heatmap.' },
          { label: 'Pick Number', what: 'Overall pick position in the draft (1-N).', source: 'Computed from team × round + slot per snake or linear order', values: 'Integer 1 through (teams × rounds)', notes: 'Snake order reverses every other round; linear is sequential.' },
          { label: 'Position Rank', what: 'Rank within the player\'s position (WR1, RB12, etc.).', source: 'p.posRank from ADP payload', values: 'String "QB1", "WR12"', notes: 'Computed in sync-adp.py from the pick-weighted aggregate.' },
          { label: 'ADP Value', what: 'Pick-weighted average draft position across all drafts in the bucket.', source: 'p.adp from adp.json[bucket]', values: 'Decimal, e.g. 14.3', notes: 'Lower = drafted earlier. Min sample threshold = 5 drafts in sync-adp.py.' },
          { label: 'Trend Arrow (formula)', what: 'Shows how much a player\'s ADP moved over the past 7 days. After each Monday scrape, sync-adp.py rotates the prior week\'s adp.json into adp-prev.json; the board fetches both and computes delta on render.', source: 'rebuildTrendIndex() at adp-tool.html L1588. Primary path: window.ADP_PAYLOAD vs window.ADP_PAYLOAD_PREV. Fallback: month-over-month walkback through byMonth buckets when prev snapshot is missing.', values: 'delta = current.adp − previous_week.adp.  Negative delta → ADP IMPROVED (drafted earlier) → green ▲ + |delta| shown.  Positive delta → ADP WORSENED (drafted later) → red ▼ + |delta|.  Zero → flat white —.  Number displayed is |delta| rounded to 1 decimal (e.g. "▲ 4.1" = improved 4.1 ADP spots).', notes: 'Arrow gets a 0.5px text-stroke + 8-direction text-shadow for readability over any position-color background. To tweak the formula, edit rebuildTrendIndex() in adp-tool.html — the function header documents the sign convention.' },
        ],
      },
      {
        name: 'Board (List View)',
        items: [
          { label: 'Sortable Columns', what: 'Click any column header to sort ascending/descending.', source: 'STATE.sort.{col, dir}', values: 'Rank, Player, Pos, NFL Draft (year + round combined), Times Drafted', notes: 'List view exposes more detail per row than box cards.' },
          { label: 'Tiny HS (.hs)', what: '28px circular thumbnail per row.', source: 'thumbUrl() builds Sleeper CDN URL from sleeperId', values: '—', notes: 'Falls back to initial letter on CDN 404.' },
          { label: 'Download CSV Button (#export-csv)', what: 'Export the currently filtered list as a CSV download.', source: 'Generated client-side from rendered rows', values: 'Filename: "adp-{mode}-{from}-{to}.csv"', notes: 'No server round-trip — entirely in browser.' },
        ],
      },
      {
        name: 'Player Modal',
        items: [
          { label: 'Modal Backdrop (.modal-backdrop)', what: 'Centered modal that overlays the page when a player card is clicked.', source: 'openModal(sleeperId) at L1850+', values: 'Closed via × button, Escape key, or click outside the modal', notes: 'Same backdrop pattern reused by trade-calculator + my-leagues modals.' },
          { label: 'Top Bar (.pp-top-bar)', what: 'Modal header: PLAYER PROFILE label (red Kanit) + xpage action buttons + ✕ Close.', source: 'Static markup', values: 'Open in Database / Open in Calculator / Open in My Leagues / ✕ Close', notes: 'xpage buttons write _fptsWriteHandoff and open destination in new tab.' },
          { label: 'Player Profile (.pp-profile)', what: 'Hero with 96px circular HS, position pill + NFL team, 32px Kanit name, inline stats grid, right-floating Fantasy Points value.', source: 'CURRENT_MODAL_PLAYER + inline stat lookups', values: 'Stats: Age, Pos Rank, Overall Rank, PPG, Dynasty ADP, Auction', notes: 'Visual contract identical to DB + Calc + My Leagues modals.' },
          { label: 'Articles Section (.pp-articles-section)', what: 'Recent FantasyPoints articles mentioning this player.', source: 'PLAYER_ARTICLES[name] from data/articles.json', values: 'Dropdown preview of titles; click "Show N more" to expand; "Sign in to FantasyPoints" link', notes: 'Match logic in sync-fp.py build_articles_map(): title match OR ≥2 body mentions.' },
          { label: 'Pick-Availability Heatmap', what: 'Probability cells showing the chance this player (or rookie pick) is still available at each pick slot, by round. Renders for real startup players, ROOKIE_PICK_X.YY placeholders, and (when opened from the Dynasty Rookie ADP tab) real rookies in their rookie-draft context.', source: 'data/pick-availability.json — generated by sync-adp.py via three builders: build_pick_availability (top 300 startup players), build_rdp_pick_availability (~77 RDP slots from picks-bucket startups), build_rookie_draft_pick_availability (~470 rookies from rookie-class drafts). assets/js/heatmap.js Heatmap.render picks the right map via window.PICK_AVAILABILITY_SOURCE — "rookie" reads from PICK_AVAILABILITY_ROOKIE (the rookiePlayers section), default reads from PICK_AVAILABILITY (the players section).', values: 'Cells 0%-100% orange-alpha gradient (darker = more likely available). Rookie-draft matrix is 6 rounds × 12 slots. Jeremiyah Love R1.01 = 100% across 8,883 sampled rookie drafts.', notes: 'Shown on every page that opens the player panel (DB / Calc / ML / Tiers / ADP). The ADP Tool flips PICK_AVAILABILITY_SOURCE between "startup" and "rookie" on every setSource() call so the heatmap context matches the active tab. The "Data refreshed" stat cell pulls from window.PICK_AVAILABILITY_META.version — guaranteed identical to adp.json + auction.json versions because all three are written in the same sync-adp.py invocation.' },
          { label: 'Compare Mode (compare-grid)', what: 'Add up to 3 other players via the search input on the modal to compare side-by-side.', source: 'compareState + compare-grid rendering', values: 'Each column: stats, value, trend, articles', notes: 'Stripped down to ADP-relevant comparison; reuses .pp-stat / .pp-fp visual style.' },
        ],
      },
      {
        name: 'URL Hash Persistence',
        items: [
          { label: 'Shareable URL (?source=...&mode=...&qb=...&view=...)', what: 'Active tab\'s source + mode + QB format + view + filters round-trip through URL hash params so views can be bookmarked or shared. The hash represents the ACTIVE tab — switching tabs replaces the hash. The inactive tab\'s state is persisted only via localStorage.', source: 'buildHashString() / loadStateFromHash() in adp-tool.html', values: 'source (non-default = rookie), mode (only when source=startup), qb (1qb if non-default), view (list if non-default), from/to, q, pos, tc, rd', notes: 'Defaults are omitted from the URL to keep it short. Default rounds differ per tab: 20 for startup, 5 for rookie — so the rd= param is only emitted when it differs from the active tab\'s default.' },
          { label: 'localStorage — per-tab state', what: 'Each tab (startup / rookie) keeps its own complete UI state in a JSON blob. The active source is remembered separately so refresh returns to the same tab.', source: 'TAB_STATE_KEYS = { startup: "fpts-adp-startup-state", rookie: "fpts-adp-rookie-state" }; ACTIVE_SOURCE_KEY = "fpts-adp-active-source"; saveTabState() / loadTabState()', values: 'JSON shape: { mode, qbFormat, view, dateFrom, dateTo, snake, search, rounds, teamCount, filters:{positions,rounds,teams}, sort:{col,dir} }', notes: 'Saved on every renderAll() via writeHashFromState() → persistActiveTab(). URL hash takes precedence over localStorage when both present. The rookie tab forces qbFormat=sf on FIRST-EVER load (no saved state); after that it tracks user choice. Legacy "fpts-adp-format" key is still written by setQbFormat() and read on init only when no per-tab state exists.' },
        ],
      },
      {
        name: 'Data Pipeline (Picks-as-Assets)',
        items: [
          {
            label: 'Why "Picks-as-Assets" exists',
            what: 'Sleeper has no native concept of "future rookie pick" in startup drafts. League managers communicate "this slot is actually next year\'s 1st" by drafting a Kicker in a position they would otherwise never draft a kicker (rounds 1-4). The picks-bucket pipeline reverse-engineers those K placeholders back into ROOKIE_PICK_X.YY synthetic entities so the ADP board can show real players AND rookie picks intermixed.',
            source: 'sync-adp.py classify_startup_drafts() flags startups with K in early_rounds≤4. relabel_picks_K_to_rdp() rewrites those K rows.',
            values: 'When you see "ROOKIE_PICK_1.05" on the board, that\'s a relabeled K that was actually drafted at pick 5 in round 1 of a "picks-as-assets" startup.',
            codeRef: 'sync-adp.py:367-445 (relabel_picks_K_to_rdp); classify_startup_drafts upstream of it.',
            notes: 'Only applies to the "Picks" sub-variant of the Startup tab. Simple and With-Rookies variants exclude K-as-pick drafts entirely.'
          },
          {
            label: 'The relabel algorithm — relabel_picks_K_to_rdp',
            what: 'For each picks-bucket startup, walks the K-position draft rows in pick-order. Each K becomes a ROOKIE_PICK_X.YY where X is the synthetic round and YY is the slot within that round. Round/slot are computed from a draft-level counter, NOT from the K\'s original Sleeper pick number, so picks across multiple drafts line up consistently.',
            source: 'sync-adp.py:367-445',
            values: 'Output: player_id rewritten to "ROOKIE_PICK_{round}.{pir:02d}". Position changed from "K" to "PICK". Name set to "{round}.{pir:02d}".',
            inputs: '_k_seq: 0-indexed counter of K-drafted positions within this single startup draft. st_teams: team count of the draft (10 / 12 / 14 etc.).',
            formula: 'round = (_k_seq // st_teams) + 1\npir = (_k_seq % st_teams) + 1\nlabel = f"{round}.{pir:02d}"\nplayer_id = f"ROOKIE_PICK_{label}"',
            output: 'Mutated draft-row records that look like normal Sleeper picks but with synthetic pick IDs. Downstream aggregation treats them identically to real players.',
            example: '12-team draft. K-position rows appear at overall picks 24, 48, 72, 96, 120 (every team takes one). _k_seq goes 0, 1, 2, 3, 4.\n  _k_seq=0 → round=(0//12)+1=1, pir=(0%12)+1=1  → "ROOKIE_PICK_1.01"\n  _k_seq=1 → round=(1//12)+1=1, pir=(1%12)+1=2  → "ROOKIE_PICK_1.02"\n  _k_seq=2 → round=(2//12)+1=1, pir=3          → "ROOKIE_PICK_1.03"\n  _k_seq=3 → round=1, pir=4                    → "ROOKIE_PICK_1.04"\n  _k_seq=4 → round=1, pir=5                    → "ROOKIE_PICK_1.05"\nIf the league had taken 13 Ks instead of 5, _k_seq=12 would roll over to "ROOKIE_PICK_2.01".',
            notes: 'The counter is per-draft, not global — every startup independently produces 1.01 → 1.12 → 2.01 etc. Aggregation across many drafts gives each synthetic pick a real ADP just like a real player.'
          },
          {
            label: 'Heatmap coverage for synthetic picks',
            what: 'data/pick-availability.json carries ~77 ROOKIE_PICK_X.YY entries in addition to ~300 real players. Each synthetic pick has its own per-team-count availability matrix exactly as if it were a real Sleeper player ID.',
            source: 'data/pick-availability.json — built by sync-adp.py during the same run that produces adp.json',
            values: 'PICK_AVAILABILITY["ROOKIE_PICK_1.05"] = { matrix, dropoff, expectedPick, draftsSampled }',
            codeRef: 'sync-adp.py heatmap-build block (search "pick-availability")',
            notes: 'Real players + synthetic picks share the same version timestamp, so the heatmap and the ADP board always reflect the same data snapshot.'
          },
        ],
      },
      {
        name: 'Interactions & Conventions (quick reference)',
        items: [
          { label: 'Sample Size Floor', what: 'A bucket needs at least 5 drafts to render an ADP. Players below threshold are hidden.', source: 'sync-adp.py min_drafts=5 in build_format_adp()', values: 'Min 5 drafts; sample size shown in #sample-size badge', notes: 'Narrow date windows can drop bucket sizes below threshold — widen the range.' },
          { label: 'Pick Heatmap Color Bands', what: 'Modal heatmap cells colored by availability probability.', source: 'data/pick-availability.json + .hm-cell styling', values: 'Green ≥80% likely available / Yellow 50-80% / Orange 25-50% / Red <25%', notes: 'Only rendered for picks mode where pick-as-asset placeholders exist.' },
          { label: 'Date Preset → Range', what: '7d / 30d / 90d / All buttons set both date inputs and trigger re-aggregate.', source: 'applyPreset() at L2936', values: '7d = today minus 7 days; "All" clears both inputs', notes: 'Active preset has .active class; auto-detected from current date range on UI restore.' },
          { label: 'Keyboard: Escape', what: 'Closes the player modal / settings drawer.', source: 'document.keydown handlers', values: '—', notes: 'Modal also closes on backdrop click.' },
          { label: 'Mobile Behavior', what: 'Below 700px width: box view forced to list view; settings drawer covers full screen.', source: 'enforceMobileView() L1267; @media queries in CSS', values: '—', notes: 'Box button shows as disabled with explanation tooltip on mobile.' },
          { label: 'localStorage Keys', what: 'Persistent state keys used by adp-tool.', source: 'localStorage.{get,set}Item', values: 'fpts-adp-startup-state / fpts-adp-rookie-state / fpts-adp-active-source / fpts-adp-format (legacy) / fpts-theme / fpts-adp-settings / fpts-handoff (transient)', notes: 'Per-tab state blobs added 2026-05-13 with the Rookie ADP tab. Legacy fpts-adp-format is still written by setQbFormat() but only read on first-ever load (when no per-tab blob exists).' },
          { label: 'CSV Export Filename', what: 'Downloaded list view filename pattern.', source: 'Built client-side in export handler', values: 'adp-{mode}-{from}-{to}.csv on startup tab (e.g. adp-picks-2026-04-12-2026-05-12.csv); adp-rookie-{qb}-{from}-{to}.csv on rookie tab (e.g. adp-rookie-sf-all.csv)', notes: 'Uses ALL when date range is open-ended.' },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════
  'trade-calculator': {
    title: 'Trade Calculator',
    blurb: 'Build and value dynasty trades. Pull players + picks onto Side A, B (and optional C), see a real-time ' +
           'balance bar based on the MVS canonical values. All values come from data/mvs.json (overlaid on ' +
           'data/values.json metadata). Format settings (SF/1QB, PPR, TEP) apply multipliers to each asset.',
    sections: [
      {
        name: 'Format Settings (top of page)',
        items: [
          { label: 'QB Format Picker (SF / 1QB)', what: 'Switch between Superflex (2QB) and Single-QB value scales. Persists cross-page via localStorage.', source: 'tradeState.qb → toggles which value (valueSf vs value1qb) FP_VALUES asset values read', values: 'sf (default) / 1qb', notes: 'localStorage key: fpts-adp-format. Switching also re-hydrates FP_VALUES.adp + trend for the chosen format.' },
          { label: 'TEP (Tight End Premium)', what: 'Boost TE values by an additional points-per-reception bonus. Multiplier applied per asset at render time.', source: 'tradeState.tep → getMultiplier(pos) at L2156', values: 'none / 0.25 / 0.5 / 0.75 / 1.0', notes: 'Multiplier formula: 1 + (tep × 0.12) — only applied to TE. Other positions ignore.' },
          { label: 'PPR Variant', what: 'Standard / Half / Full PPR scoring. WR and RB values shift slightly based on PPR.', source: 'tradeState.ppr → getMultiplier(pos) at L2146-2154', values: '0 / 0.5 / 1', notes: 'WR: full PPR = 1.0×, half = 0.96×, std = 0.90×. RB: full = 1.04×, half = 1.0×, std = 0.93×.' },
          { label: '3-Team Toggle', what: 'Add a third side (Side C) for three-way trades.', source: 'tradeState.threeTeam boolean; toggles .builder-wrap.three-sides class', values: 'On / Off', notes: 'Balance bar logic handles 3-side fairness; threshold is broader.' },
        ],
      },
      {
        name: 'Side Cards (A / B / C)',
        items: [
          { label: 'Side Header (.side-header)', what: 'Top of each side: label + running total. Total goes red when value exceeds the other side significantly.', source: 'sideTotal(side) at L2167', values: '"Side A" / "Side B" / "Side C" + value sum', notes: 'has-value class added when total > 0.' },
          { label: 'Asset Chip (.asset-row)', what: 'A single player or pick on a side. Renders as a full-color position bar with stacked first/last name, MVS value, and X to remove.', source: 'renderAll() builds via template at L2208; data-pos attribute drives bg color', values: 'Solid position-color (QB red, RB green, WR blue, TE orange, K purple, PK purple). Stacked name: first 9px Mulish, last 14px Kanit ExtraBoldItalic.', notes: 'Click chip (not the X) opens the calc player modal. Asset values respect SF/1QB + PPR/TEP multipliers.' },
          { label: 'FAAB Slider', what: 'Add FAAB (waiver budget dollars) to one side as part of the trade.', source: 'side.faab; multiplied by 10 in sideTotal()', values: '$0 to $200 (steps of $5)', notes: 'FAAB-to-value ratio of 10 is heuristic; users in mixed leagues may want to ignore.' },
          { label: 'Asset Remove (.asset-remove)', what: '✕ button on each asset chip to remove it from the side.', source: 'Click handler on .asset-remove; calls removeAsset(side, idx)', values: '—', notes: 'Stops event propagation so chip click doesn\'t open modal.' },
        ],
      },
      {
        name: 'Balance Bar / Verdict',
        items: [
          { label: 'Verdict Chip', what: 'Plain-text balance assessment colored by severity.', source: 'Computed from |sideA - sideB| / max(sideA, sideB)', values: 'Fair trade (within 5%) green / Slight edge (5-15%) yellow / Big imbalance (>15%) red', notes: 'Color uses --green and --red brand tokens.' },
          { label: 'Visual Bar', what: 'Horizontal bar showing each side\'s share of total value. Filled left from side A, right from side B.', source: 'side A% + side B% drive width of bar segments', values: 'Left = A%, right = B%; midpoint is fair', notes: 'Drag-to-imbalance is purely visual; user can\'t drag values.' },
        ],
      },
      {
        name: 'Search + Pick Selector',
        items: [
          { label: 'Side Search Input', what: 'Type a player name; autocomplete dropdown appears. Pressing Enter or clicking adds to the side.', source: 'Autocomplete against FP_VALUES keys; renders .pp-search-result rows', values: 'HS thumbnail + position pill + name per result', notes: 'Search is per-side — Side A search adds to Side A, etc.' },
          { label: 'Pick Selector', what: 'Add rookie / future picks (2026-2028) via a dropdown of available pick keys.', source: 'PICK_VALUES keyed by "YYYY-R.SS" or generic "YYYY-R"', values: 'Specific slots (2026-1.01 through 2026-4.12) + generics (2027-1, 2028-1)', notes: 'Pick fallback to generic key when specific slot missing.' },
        ],
      },
      {
        name: 'Player Modal (calc-pp-...)',
        items: [
          { label: 'Open Trigger', what: 'Click any asset chip (not the X) → calc-modal-backdrop opens.', source: '_openCalcPlayerModal() at L3068', values: '—', notes: 'Same backdrop component (.modal-backdrop) reused on every page.' },
          { label: 'Top Bar Actions', what: '"Open in Database / ADP / My Leagues" buttons.', source: '_calcXpageToDb / _calcXpageToAdp / _calcXpageToLeagues at L3117+', values: '—', notes: 'Cross-page handoff via _fptsWriteHandoff (60s TTL).' },
          { label: 'Profile + Stats', what: 'HS + name + position + stats row (same anatomy as DB and my-leagues modals).', source: 'fp = FP_VALUES[playerName]', values: 'Age, Pos Rank, Overall Rank, PPG, Dynasty ADP, Auction', notes: 'Stats hidden when value missing.' },
          { label: 'MVS Extras (OTC + Baseline + Volume + Rankings)', what: 'Auto-fit row showing OTC value, baseline delta, 7-day trade volume, contributor rankings.', source: 'window.MvsExtras.buildAll(playerName)', values: '1-4 cells based on data availability', notes: 'Shared module assets/js/mvs-extras.js.' },
          { label: 'History Sparkline + Recent Trades', what: 'Below extras: 14-day MVS history line + last 3 trades involving this player.', source: 'window.MvsExtras.buildSparkline / buildRecentTrades', values: 'Toggle-aware: uses history1qb when fmt=1qb', notes: 'Focus player highlighted red in each recent trade card.' },
          { label: 'Escape Key Close', what: 'Pressing Escape closes the calc modal.', source: 'document.addEventListener("keydown") at L3136', values: '—', notes: 'Only triggers if .modal-backdrop is .open.' },
        ],
      },
      {
        name: 'Trade State Persistence',
        items: [
          { label: 'tradeState object', what: 'In-memory state holding sideA, sideB, sideC arrays + format settings.', source: 'Top of script', values: '{ sideA: [], sideB: [], sideC: [], qb, ppr, tep, threeTeam, ... }', notes: 'Currently not persisted to localStorage — refresh clears the trade. Cross-page handoff brings a trade in via _fptsReadHandoff.' },
          { label: 'Cross-page Handoff', what: 'When user clicks "Open in Calculator" from another page, this page reads the handoff and populates Side A.', source: 'Listener at L3049-3065', values: 'ho.trade.sideA / sideB lists', notes: 'Re-renders via renderAll() after applying.' },
        ],
      },
      {
        name: 'Interactions & Conventions (quick reference)',
        items: [
          { label: 'Fairness Thresholds', what: 'How the balance verdict picks Fair / Slight Edge / Big Imbalance.', source: 'Computed in renderBalance from |a - b| / max(a, b)', values: '<5% diff = Fair (green) / 5-15% = Slight Edge (yellow) / >15% = Big Imbalance (red)', notes: 'Color comes from --green / --yellow / --red brand tokens.' },
          { label: 'PPR Multiplier Table', what: 'Per-position value adjustments by PPR setting.', source: 'getMultiplier(pos) at L2146-2154', values: 'WR: Full 1.0× / Half 0.96× / Std 0.90×. RB: Full 1.04× / Half 1.0× / Std 0.93×. QB/TE: unaffected by PPR.', notes: 'TE additionally multiplied by (1 + tep × 0.12).' },
          { label: 'FAAB-to-Value Formula', what: 'FAAB dollars added to a side\'s total at the configured ratio.', source: 'sideTotal() at L2167: side.faab × 10', values: '$1 FAAB = 10 MVS units (heuristic)', notes: 'Adjustable in code but no UI to change it.' },
          { label: 'Click Behaviors', what: 'Asset chip body click → open modal. X button click → remove from side.', source: 'asset-row onclick + event.target.closest(.asset-remove) check', values: '—', notes: 'No drag-and-drop on this page; chips are click-only.' },
          { label: 'Keyboard: Escape', what: 'Closes the player modal.', source: 'L3136 keydown listener', values: '—', notes: '—' },
          { label: 'Mobile Behavior', what: 'Side cards stack vertically below 700px. Search input width fills the side card.', source: '@media (max-width: 700px) in CSS', values: '—', notes: '3-team mode adds Side C below Side B on mobile (vertically stacked).' },
          { label: 'localStorage Keys', what: 'Persistent state used by this page.', source: 'localStorage.{get,set}Item', values: 'fpts-adp-format (sf|1qb) / fpts-theme / fpts-handoff (transient inbound trade)', notes: 'Trade state itself is not currently persisted — refresh clears the trade.' },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════
  'my-leagues': {
    title: 'User Importer',
    blurb: 'Import your Sleeper dynasty leagues and explore your rosters, exposure, trade opportunities, ' +
           'and per-league standings. League + roster data is pulled live from the Sleeper API on import. ' +
           'Player metadata + values come from FP_VALUES with MVS overlay applied.',
    sections: [
      {
        name: 'Sleeper Login',
        items: [
          { label: 'Username Input', what: 'Enter your Sleeper handle to fetch all your dynasty leagues for the selected season.', source: 'Sleeper /v1/user/{username} → /v1/user/{user_id}/leagues/nfl/{season}', values: 'Case-insensitive Sleeper username string', notes: 'No password — Sleeper exposes user→leagues read-only via username. Cached in localStorage as fpts-sleeper-user.' },
          { label: 'Season Selector', what: 'Choose which NFL season to pull leagues from.', source: 'ML.selectedSeason; default = current Sleeper state.season', values: '2024 / 2025 / 2026 (rolling)', notes: 'Off-season uses last completed season as default.' },
          { label: 'Import Button', what: 'Triggers the parallel league-data fetch for every league found.', source: 'Calls ML_BUILD_ALL_LEAGUE_DATA which Promise.all\'s per-league fetches', values: '—', notes: 'Per-league: rosters + users + traded_picks + drafts (added in commit e37ad5b for completed-draft filtering).' },
        ],
      },
      {
        name: 'Sleeper API Coupling',
        items: [
          {
            label: 'apiFetch(url) — the wrapper',
            what: 'Thin wrapper around fetch() used everywhere on my-leagues. No retry logic, no rate-limiting; on non-2xx it throws "HTTP {status}". Callers wrap with .catch(() => []) where graceful degradation is expected.',
            source: 'my-leagues.html:2889-2892',
            values: 'Returns parsed JSON on success; throws Error on non-2xx',
            codeRef: 'my-leagues.html:2889 (async function apiFetch(url))',
            notes: 'Sleeper is generous with rate limits; we have not had to add backoff. If 429s start appearing in console, wrap this with exponential backoff.'
          },
          {
            label: 'Sleeper endpoints used (full list)',
            what: 'Every Sleeper /v1 endpoint hit by my-leagues. Base URL: https://api.sleeper.app/v1.',
            inputs: 'username (text input), userId (from previous call), leagueId (from leagues list), season (selector), week (from /state/nfl).',
            formula: '/players/nfl (full player DB, cached once per session) · /user/{username} → user_id · /user/{userId}/leagues/nfl/{season} → leagues array · /league/{id}/rosters · /league/{id}/users · /league/{id}/traded_picks · /league/{id}/drafts · /state/nfl (current week + season) · /projections/nfl/regular/{year} · /stats/nfl/regular/{year} · /league/{id}/transactions/{week} (waivers + trades).',
            output: 'JSON objects/arrays specific to each endpoint. See Sleeper docs at https://docs.sleeper.com/.',
            codeRef: 'my-leagues.html:2851 (const API = "https://api.sleeper.app/v1"); calls scattered: 4745 / 4764 / 4806 / 4862-4866 / 5980 / 6019 / 6043 / 3286',
            notes: 'No authenticated endpoints — Sleeper exposes everything read-only by username. No password ever required. /players/nfl is ~5 MB and gets cached on window.MLPlayersCache for the session.'
          },
          {
            label: 'Error handling pattern',
            what: 'Most calls wrap .catch(() => []) so partial failures degrade gracefully — a missing /traded_picks just means "no traded picks" rather than crashing the whole league load.',
            source: 'Per-call .catch(...) chains around apiFetch',
            values: '—',
            example: 'apiFetch(`${API}/league/${id}/traded_picks`).catch(() => [])  →  returns [] if Sleeper 404s the endpoint',
            notes: 'Required for: traded_picks (some leagues have none) and drafts (some leagues never created one). Not used for /rosters or /users since those are required for the page to render anything.'
          },
        ],
      },
      {
        name: 'Leagues List',
        items: [
          { label: 'League Card', what: 'One card per imported league with name, season, your team + record, total roster value.', source: 'ML_ALL_LEAGUE_DATA[leagueId] populated on import', values: 'Big total value (red), W-L-T record, league size', notes: 'Leagues where you\'re not a roster owner are auto-skipped (nonOwnerLeagueIds set in import logic).' },
          { label: 'Open League Button', what: 'Click to drill into the full roster + standings + simulator for that league.', source: 'loadRoster(leagueId, season) at L5607', values: '—', notes: 'Fetches additional data: NFL state (week), drafts, projections for the current display week.' },
          { label: 'Trade Suggestions Button', what: 'Click to surface trade suggestions across your portfolio against this league\'s rosters.', source: 'mlBuildTradeSuggestions etc.', values: '—', notes: 'Uses FP_VALUES + MVS for the matching logic.' },
        ],
      },
      {
        name: 'Roster Expansion (within a league)',
        items: [
          { label: 'Position Sections (QB / RB / WR / TE / Other)', what: 'Players grouped by position with a section header showing count + total value.', source: 'mlBuildTeamRosterHtml() at L5034+ groups by position', values: 'Each section: Quarterbacks / Running Backs / Wide Receivers / Tight Ends / Other', notes: 'Other contains K/DEF/FB if rostered.' },
          { label: 'Team Roster Row (.ml-team-roster-row)', what: 'One row per player. Avatar / pos pill / name + NFL team / age / pos rank / MVS value, plus left-edge position-color stripe.', source: 'renderPlayerRow() at L5089', values: 'Stripe colors: QB red, RB green, WR blue, TE orange, K + PK purple', notes: 'Click opens player detail modal.' },
          { label: 'Draft Picks Section', what: 'Owned picks for current + next 2 seasons. Computed natural picks + acquired - traded-away.', source: 'mlGetOwnedPicks() at L2949', values: 'Per-season per-round with value lookup', notes: 'Filters out completedDraftSeasons (Sleeper draft status="complete") so spent picks don\'t double-show.' },
          { label: 'Pick Value Lookup', what: 'Median value of the round, falling back to generic round key for far-future picks.', source: 'mlPickValue() at L2938 + pickValue() at L6008', values: 'Round midpoint slot value (e.g. 1.06 in a 12-team) or generic round if no slots priced', notes: 'Generic fallback ("2027-1", "2028-1") added in commit e37ad5b for years where MVS only prices generics.' },
        ],
      },
      {
        name: 'Standings + Position Rankings',
        items: [
          { label: 'Standings Table', what: 'All teams sorted by user-selected criterion (value / wins / max points / etc.).', source: 'Computed in mlBuildStandings; rosterValues with archetype', values: 'W-L-T, Total Value, MPX (max-point efficiency %), Average Age', notes: 'MPX = your fpts / your max possible fpts × 100. Below 75% = leaving points on the bench.' },
          { label: 'Position Rankings (your team)', what: '"Where does YOUR team rank per position?" 4 grid cells with rank + total value at each position.', source: 'rosterValues.sort by posVals[pos]; findIndex(isMe)', values: 'Rank within the league for QB/RB/WR/TE', notes: 'Shows MPX efficiency next to your record.' },
          {
            label: 'Archetype Scoring (dynasty / contender / tweener / rebuilder / emergency)',
            what: 'Every roster gets ONE of five archetype tags. Drives the colored chip next to team names, the sort order in the standings table, and which rosters the trade-suggestion engine targets when looking for a fair counterparty.',
            source: 'mlGetArchetype(avgAge, totalValue, pickValue, projValue, leagueAvg) — called per-roster during mlComputeLeagueValueData. leagueAvg medians are computed via the median() helper across all rosters in the same league.',
            values: 'dynasty (high value + young) / contender (high value, any age) / tweener (mid value, mid age) / rebuilder (low value, OR mid value + young) / emergency (low value + old, OR mid value + old)',
            inputs: 'avgAge: median age of skill-position players on the roster. totalValue: sum of FP_VALUES[name].value across roster (MVS-overlaid). pickValue: sum from PICK_VALUES for owned picks. projValue: sum of season projections (Sleeper /projections). leagueAvg: per-league medians { age, value, pickValue, proj }.',
            formula: 'composite = 0.6 × (totalValue / leagueAvg.value) + 0.2 × (pickValue / leagueAvg.pickValue) + 0.2 × (projValue / leagueAvg.proj); valueHigh = composite > 1.10; valueLow = composite < 0.90; ageYoung = avgAge < (leagueAvg.age − 0.6); ageOld = avgAge > (leagueAvg.age + 0.6). 9-cell mapping selects the tag in order: dynasty → contender → emergency → rebuilder → tweener fallback.',
            output: 'Single archetype string consumed by mlArchetypeBg() / mlArchetypeFg() / mlArchetypeChip() helpers for color + label rendering.',
            codeRef: 'my-leagues.html:2937-2958 (mlGetArchetype)',
            example: 'Team: avgAge 24.2, totalValue 8,500, pickValue 1,200, projValue 400. League medians: age 26.5, value 7,000, pickValue 800, proj 350. composite = 0.6 × 1.214 + 0.2 × 1.5 + 0.2 × 1.143 = 1.257. valueHigh (>1.10) ✓. ageYoung (24.2 < 25.9) ✓. → "dynasty".',
            notes: 'Returns "tweener" as fallback if leagueAvg is missing or has zero medians. Weighting (60/20/20) and thresholds (1.10, 0.90, ±0.6) are heuristics tuned for 12-team dynasty leagues — adjust in-place at my-leagues.html:2937 if real leagues consistently misclassify.'
          },
        ],
      },
      {
        name: 'Cross-League Exposure',
        items: [
          { label: 'Exposure List (.ml-exposure-row)', what: 'Players you own across multiple leagues, sortable by shares / value / exposure %.', source: 'ML_BUILD_EXPOSURE_LIST; counts player presence across all leagues', values: 'Each row: HS + pos rank + name + shares (count of leagues) + value + exposure %', notes: 'Pos rank colored per position; exposure % colored by threshold (50%+ green, 25%+ yellow, <25% grey).' },
          { label: 'Search Filter', what: 'Type to filter exposure list. Players not currently owned but found via FP_VALUES also surface.', source: 'mlFilterExposureList()', values: 'Substring match on name', notes: 'Non-owned players appear with 0 shares so user can decide to trade for them.' },
          { label: 'Position Filter Pills', what: 'QB / RB / WR / TE / All — limit exposure list to one position.', source: 'STATE.exposureFilter', values: 'Five buttons', notes: 'Independent of search filter.' },
        ],
      },
      {
        name: 'Trade Simulator (per-league)',
        items: [
          { label: 'Two Sides + Drag/Drop', what: 'Drag any player or pick from any team onto Side A or Side B to test a trade.', source: 'mlCalcAddAsset; drag/drop event handlers', values: '—', notes: 'Same valuation pipeline as Trade Calculator (FP_VALUES + PICK_VALUES + multipliers).' },
          { label: 'Balance Bar', what: 'Identical to Trade Calculator — visual + verdict + side totals.', source: 'mlCalcTotal()', values: 'Fair / Slight Edge / Big Imbalance', notes: '—' },
        ],
      },
      {
        name: 'Player Detail Modal',
        items: [
          { label: 'Hero (96px circular HS + 32px Kanit name)', what: 'Standard PP-style header with position badge + NFL team underneath.', source: 'openPlayerDetail(sleeperId) at L4007', values: '96×96 circle HS; 32px Kanit ExtraBoldItalic name', notes: 'Falls back to initials if Sleeper CDN 404s.' },
          { label: 'Stats Grid (.ml-pd-stats)', what: 'Trade Value / Pos Rank / Age / EXP / PPG 2025 / Dynasty ADP / Auction.', source: 'FP_VALUES[name] joined to Sleeper player.years_exp', values: 'EXP renders "Rookie" for yoe=0, else "Xyrs"', notes: 'Each cell hidden when underlying data missing — graceful.' },
          { label: 'MVS Extras', what: 'OTC + Baseline + Volume + Rankings (auto-fit grid).', source: 'window.MvsExtras.buildAll() from assets/js/mvs-extras.js', values: '1-4 cells based on data availability', notes: 'Same module + look as DB + Calc modals.' },
          { label: 'History Sparkline + Recent Trades', what: '14-day MVS history line + last 3 trades involving this player.', source: 'Toggle-aware history; recentTrades trimmed to 3', values: '—', notes: 'Focus player highlighted red in each trade.' },
          { label: 'Articles Section', what: 'FantasyPoints recent articles for this player.', source: 'PLAYER_ARTICLES[name] via mountPlayerArticles()', values: 'Dropdown preview + "Sign in" link', notes: 'Shared mount function used by all pages.' },
          { label: 'Status Block', what: 'Cross-league status: on your roster / on another team / available.', source: 'Cross-league lookup of player ID against ML_ALL_LEAGUE_DATA', values: '★ On Your Roster (mine) / On {Team Name} (taken) / Available — Waivers/FA (free)', notes: 'Different CTAs per state: Trade For / Send Offer / Claim.' },
          { label: 'Availability Mount', what: 'Sleeper-style "Availability in Other Leagues" panel.', source: 'mlBuildAvailabilityHtml()', values: 'Per-league row: your roster ID, FAAB history, owner', notes: 'Helps users decide which league to make the move in.' },
          { label: 'Waiver / FAAB History', what: 'Prior FAAB claims on this player in the league: count + average $ bid.', source: 'fetchAndCacheWaivers() at L2998', values: '"X prior claims · avg $Y"', notes: 'Pulls all weekly /transactions endpoints and counts type==="waiver" + bid amount.' },
        ],
      },
      {
        name: 'Weekly Projections',
        items: [
          { label: 'Season Projection Column', what: 'Sleeper season-long projected points for the player.', source: 'projections[sleeperId].pts_ppr or pts_half_ppr based on league scoring', values: 'Decimal points (e.g. 245.5)', notes: 'Fetched once per league via /projections/nfl/regular/{year}.' },
          { label: 'Weekly Projection Column', what: 'Projected points for the current NFL week.', source: 'projections[sleeperId][nflState.display_week]', values: 'Decimal', notes: 'NFL state fetched alongside roster data on league open.' },
        ],
      },
      {
        name: 'Interactions & Conventions (quick reference)',
        items: [
          { label: 'Status Badge Colors', what: 'Player status block in the modal indicates ownership state in your portfolio.', source: 'ml-pd-status class variants', values: 'mine = gold/yellow border ★ / taken = neutral grey / free = green (Available — Waivers/FA)', notes: 'Different CTAs per state: Trade For / Send Offer / Claim on Sleeper.' },
          { label: 'MPX Efficiency Thresholds', what: 'Max Point Index — your actual fpts ÷ max possible fpts. Indicates lineup management quality.', source: 'mlBuildStandings computes per-roster MPX', values: '≥90% green / ≥75% white / <75% red', notes: 'Below 75% = leaving points on the bench regularly.' },
          { label: 'Exposure % Color Bands', what: 'How exposed you are to a player across your portfolio.', source: 'expoColor() in cross-league exposure render', values: '≥50% green (heavy exposure) / ≥25% yellow / <25% grey (light)', notes: 'Helps identify over- or under-exposure to specific players.' },
          { label: 'Sleeper Player Cache', what: 'Sleeper /players/nfl is ~5 MB. Cached per page-load via getPlayers() promise to avoid re-fetching for each league.', source: 'getPlayers() returns a memoized Promise', values: 'Shared across all leagues in the same session', notes: 'Cleared on page refresh; not localStorage-persisted (too large).' },
          { label: 'API Rate Limiting', what: 'apiFetch() wraps fetch with a per-second cap to be polite to Sleeper.', source: 'apiFetch() function definition near top of script', values: 'Self-throttled — large league imports may take 10-30s', notes: 'Spinners shown via showSpinner/hideSpinner during fetches.' },
          { label: 'Keyboard: Escape', what: 'Closes any open modal (player detail / trade simulator / availability).', source: 'document.keydown handlers', values: '—', notes: '—' },
          { label: 'Mobile Behavior', what: 'Roster columns collapse to 2-col grid; standings table horizontally scrolls.', source: '@media (max-width: 700px) blocks in CSS', values: '—', notes: 'Player detail modal becomes full-screen on phone widths.' },
          { label: 'localStorage Keys', what: 'Persistent state used by my-leagues.', source: 'localStorage.{get,set}Item', values: 'fpts-sleeper-user (username) / fpts-imported-league (last selected) / fpts-adp-format / fpts-theme / fpts-handoff (transient)', notes: 'Username persists so you don\'t re-enter on every visit.' },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════
  'tiers': {
    title: 'Tier Sheet',
    blurb: 'Tiered rankings managed in a Google Sheet, synced via sync-tiers.py. ' +
           'Each row is overlaid at page-load with current data from values.json + adp.json + auction.json + mvs.json. ' +
           'The sheet is the source of truth for tier groupings + editorial notes; data overlays provide live numbers.',
    sections: [
      {
        name: 'Tier Source Pipeline',
        items: [
          { label: 'sync-tiers.py', what: 'Reads the Google Sheet via service account credentials, replaces the TIER_PLAYERS array in tiers.html atomically between // TIERS:START and // TIERS:END markers.', source: 'sync-tiers.py + sync-tiers.config.json (spreadsheet ID + tab name) + service-account.json', values: 'TIER_PLAYERS array of objects with all sheet columns mapped to internal fields', notes: 'Aliases in HEADER_ALIASES handle sheet variations. Runs as step [3/5] in push.bat.' },
          { label: 'TIER_PLAYERS Array', what: 'In-memory tier list — generated by sync-tiers.py.', source: 'Inline in tiers.html, refreshed by sync', values: 'Each row: tier, name, age, pos, posRank, team, ppg2025, ppg2024, trending, buySell, priority, contender, notes. (ADP and auction columns are overlay-owned — see Column Overlays below.)', notes: 'Edited in the sheet, not in code.' },
          { label: 'Tier Number', what: 'The tier bucket. Lower = more elite.', source: 'Sheet "Tier" column', values: 'Integer 1+', notes: 'Players within the same tier are considered roughly equivalent.' },
        ],
      },
      {
        name: 'Column Overlays (live data on top of sheet)',
        items: [
          { label: 'Value Column', what: 'Current MVS value, replacing any value column from the sheet. Wholesale overlay.', source: 'mvs.json overlay at L5275-5290 in tiers.html', values: 'Number ~1-10,500 in MVS units; SF or 1QB per format toggle, with fallback to other format if missing', notes: 'Toggle-aware (commit 1aaa21e applied here too).' },
          { label: 'ADP 2026 Column', what: 'Current dynasty startup ADP — overlay-owned.', source: 'data/adp.json startup_sf or startup_1qb based on format toggle, with the other format as fallback', values: 'Decimal ADP', notes: 'Same source the ADP page renders at year=2026.' },
          { label: 'ADP 2025 Column', what: 'Prior-season dynasty startup ADP — overlay-owned.', source: 'data/adp-2025.json — the year-stamped historical file the ADP page year-picker loads at year=2025', values: 'Decimal ADP', notes: 'Honors the same SF/1QB toggle. Fetched locally by tiers.html (not in data-bootstrap).' },
          { label: 'ADP Prior Column', what: 'Prior-week dynasty startup ADP snapshot — overlay-owned.', source: 'data/adp-prev.json — the weekly-rotated snapshot sync-adp.py emits', values: 'Decimal ADP', notes: 'Honors the same SF/1QB toggle. Fetched locally by tiers.html.' },
          { label: 'Auction Column', what: 'Real dynasty auction median price.', source: 'auction.json — 1QB price first, SF fallback', values: 'Dollar string (e.g. "$15")', notes: 'Intentional 1QB-first because dynasty auctions are overwhelmingly SF — 1QB bucket is sparse.' },
          { label: 'PPG 2025 Column', what: 'Last season\'s actual fantasy points-per-game.', source: 'FP_VALUES[name].ppg via values.json (from Sleeper /stats)', values: 'Decimal PPG; blank if rookie or no games played', notes: 'Updated yearly post-Week-18 by sync-fp.py.' },
          { label: 'PPG 2024 Column', what: 'Prior season\'s actual fantasy points-per-game (sibling of PPG 2025).', source: 'FP_VALUES[name].ppgPrior via values.json (from Sleeper /stats/nfl/regular/{year-1})', values: 'Decimal PPG; blank if rookie or no games played that season', notes: 'Driven by SLEEPER_STATS_PRIOR_SEASON in sync-fp.py; auto-rolls each season.' },
          { label: 'PPG 2024 Column', what: 'Two-seasons-ago PPG — sheet-managed.', source: 'Sheet column "PPG 2024"', values: 'Decimal', notes: 'Sheet is canonical; pipeline doesn\'t carry multi-year stats.' },
          { label: 'Age + Team + Pos + PosRank Columns', what: 'Player attributes overlaid from FP_VALUES (which sources from Sleeper).', source: 'values.json overlay at L5219-5235', values: 'Age = decimal years; Team = NFL abbr (LAR / SF / etc.); Pos = QB/RB/WR/TE/K; PosRank = "WR12"', notes: 'Sheet values are fallbacks if values.json doesn\'t have the player.' },
        ],
      },
      {
        name: 'Editorial / Annotation Columns',
        items: [
          { label: 'Trending Column', what: 'Editorial trend annotation — sheet-managed.', source: 'Sheet column "Trending"', values: 'Free-text (e.g. "↑ rising on rookie hype")', notes: 'Sheet is canonical.' },
          { label: 'Buy / Sell Column', what: 'Editorial buy-or-sell guidance.', source: 'Sheet column "Buy / Sell"', values: 'Free-text (e.g. "BUY at this price")', notes: 'Sheet is canonical.' },
          { label: 'Priority Column', what: 'Manager priority annotation.', source: 'Sheet column "Priority"', values: 'Free-text', notes: 'Sheet is canonical.' },
          { label: 'Contender Column', what: 'Whether this player is a "contender add" — useful for win-now rosters.', source: 'Sheet column "Contender"', values: 'Free-text', notes: 'Sheet is canonical.' },
          { label: 'Notes Column', what: 'Free-form editorial commentary per player.', source: 'Sheet column "Notes"', values: 'Free-text', notes: 'Sheet is canonical.' },
        ],
      },
      {
        name: 'Tier Display',
        items: [
          { label: 'Tier Group Header (.tier-group-letter)', what: 'Section heading per tier (e.g. "Tier 1", "Tier 2", ...).', source: 'Rendered per group from TIER_PLAYERS grouped by .tier', values: '—', notes: 'Branded with Kanit ExtraBoldItalic + red accent.' },
          { label: 'Tier Row (.tier-row)', what: 'One row per player within a tier. Shows name, pos, team, value, ADP, auction, PPG, editorial notes.', source: 'TIER_PLAYERS array iterated', values: 'Each row clickable to open player modal (cross-page nav)', notes: 'Visual style matches the new design system (Kanit display, Mulish body, position-color stripes).' },
          { label: 'Player Click → Database', what: 'Click any row → opens the Trade Database in a new tab with that player\'s panel pre-opened.', source: '_fptsWriteHandoff with primaryPlayer + opens index.html', values: '—', notes: 'Standard cross-page handoff pattern.' },
        ],
      },
      {
        name: 'Interactions & Conventions (quick reference)',
        items: [
          { label: 'Editing Workflow', what: 'Tiers are managed in the Google Sheet, not in code. Edit the sheet → run push.bat → sync-tiers.py regenerates the inline TIER_PLAYERS block → git commit + push.', source: 'sync-tiers.py + sync-tiers.config.json + service-account.json', values: 'Workflow: Sheet edit → push.bat step [3/5] → GitHub Pages redeploy', notes: 'No live API call to the sheet from the browser — the array is baked into the HTML at sync time for fast page load.' },
          { label: 'Mobile Column Behavior', what: 'On phones, low-priority columns (PPG 2024, ADP Prior, editorial notes) hide via CSS to keep tier rows readable.', source: '@media (max-width: 700px) hides .tier-col-{prior,ppg24,notes} etc.', values: '—', notes: 'Value + ADP + Auction columns always visible.' },
          { label: 'Theme Toggle', what: 'Standard dark/light toggle on the topnav. All overlays + sheet colors honor the active theme.', source: 'Shared theme-toggle handler', values: 'dark (default) / light', notes: 'Persists in localStorage as fpts-theme.' },
          { label: 'Position Color Stripe', what: 'Each tier row has a left-edge stripe in the player\'s position color.', source: 'CSS .tier-row.pos-{qb,rb,wr,te} { border-left: 4px solid var(--pos-X-bg) }', values: 'QB red / RB green / WR blue / TE orange', notes: 'Same convention as DB rank rows + my-leagues roster rows.' },
          { label: 'localStorage Keys', what: 'Persistent state used by tiers.', source: 'localStorage.{get,set}Item', values: 'fpts-theme / fpts-adp-format (affects which ADP overlays) / fpts-handoff (transient outbound to DB)', notes: 'Tiers page is mostly read-only — no per-page state worth persisting.' },
        ],
      },
    ],
  },
};
