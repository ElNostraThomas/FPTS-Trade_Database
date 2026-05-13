/* ════════════════════════════════════════════════════════════════════════
   FPTS data-bootstrap — shared data layer for every page.
   ════════════════════════════════════════════════════════════════════════

   PURPOSE
     Centralizes the data-fetch + window-mirror + payload-apply machinery
     that used to be hand-rolled in every page. New pages drop this script
     in and get every JSON in data/ pre-loaded, every shared module
     (player-panel, heatmap, mvs-extras, articles) auto-fed in lockstep.

   USAGE
     In <head>, before this script:
       <script>
         window.FPTS_CURRENT_PAGE = 'newpage';        // required
         window.FPTS_DATA_OPTS = { skip: [] };        // optional opt-outs
       </script>
       <script src="assets/js/data-bootstrap.js?v=..." defer></script>

     Page-specific code waits for the data:
       document.addEventListener('fpts:data-ready', () => {
         // window.FP_VALUES, window.PICK_VALUES, window.MVS_PAYLOAD, etc.
         // are all hydrated and ready to read.
       });

   WHAT IT POPULATES
     window.FP_VALUES              — { [name]: { value, age, team, pos, ... } }
     window.PICK_VALUES            — { [key]: { value, valueSf, value1qb, label } }
     window.SLEEPER_IDS            — { [name]: sleeperId } (auto-built from FP_VALUES if page didn't pre-seed it)
     window.ADP_PAYLOAD            — raw adp.json
     window.AUCTION_PAYLOAD        — raw auction.json
     window.MVS_PAYLOAD            — raw mvs.json
     window.PLAYER_ARTICLES        — { [name]: [articles] }
     window.PICK_AVAILABILITY      — { [sleeperId]: { matrix, dropoff, ... } }
     window.PICK_AVAILABILITY_META — { version, season, teamCount, topN } drives the heatmap "Data refreshed" stamp
     window.FPTS_DATA              — public API: { ready: Promise, version, _apply* helpers }

   OPT-OUTS (set in FPTS_DATA_OPTS.skip)
     'values' 'adp' 'auction' 'picks' 'mvs' 'articles' 'pick-availability'
     Default: fetch everything. Most pages should NOT opt out — the shared
     player-panel drawer depends on the full set being present.

   CONSISTENCY GUARANTEE
     adp.json, auction.json, and pick-availability.json are written in the
     same `sync-adp.py` invocation with identical `version` timestamps. The
     bootstrap fetches them as one Promise.all, so any page using this
     module gets all three in lockstep automatically. The heatmap "Data
     refreshed" stamp on every page will always equal the ADP refresh date.

   LOAD ORDER WITH team-helpers.js
     If a page also uses team-helpers.js (for team-logo badges + inline
     logos in place of "ATL"/"BUF" text), it MUST be loaded BEFORE
     player-panel.js — that module checks window.TeamHelpers when it
     renders the modal-hero avatar badge + team-text setter. data-bootstrap.js
     itself doesn't depend on team-helpers; the helpers are pure utilities
     and can load at any time relative to this script.
   ════════════════════════════════════════════════════════════════════════ */

(function (global) {
  'use strict';

  // ─── Initialize window globals (idempotent — page pre-seeds preserved) ──
  if (!global.FP_VALUES)               global.FP_VALUES = {};
  if (!global.PICK_VALUES)             global.PICK_VALUES = {};
  if (!global.SLEEPER_IDS)             global.SLEEPER_IDS = {};
  if (!global.ADP_PAYLOAD)             global.ADP_PAYLOAD = null;
  if (!global.AUCTION_PAYLOAD)         global.AUCTION_PAYLOAD = null;
  if (!global.MVS_PAYLOAD)             global.MVS_PAYLOAD = null;
  if (!global.PLAYER_ARTICLES)         global.PLAYER_ARTICLES = {};
  if (!global.PICK_AVAILABILITY)       global.PICK_AVAILABILITY = {};
  if (!global.PICK_AVAILABILITY_META)  global.PICK_AVAILABILITY_META = null;

  // ─── Shared helpers ──────────────────────────────────────────────────────

  function normalizePlayerName(name) {
    if (!name) return '';
    return String(name)
      .trim()
      .toLowerCase()
      .replace(/\./g, '')         // strip periods ("D.J." vs "DJ", "Jr." vs "Jr")
      .replace(/\s+/g, ' ');      // collapse whitespace
  }

  function _indexByNorm(list) {
    const out = {};
    (list || []).forEach(p => {
      if (!p || !p.name) return;
      const key = normalizePlayerName(p.name);
      if (key) out[key] = p;
    });
    return out;
  }

  if (typeof global.normalizePlayerName !== 'function') {
    global.normalizePlayerName = normalizePlayerName;
  }

  // ─── Payload appliers (canonical implementations) ────────────────────────

  function _applyAdpPayload(j) {
    if (!j || !j.byMonth) return;
    global.ADP_PAYLOAD = j;
    const all = j.byMonth.ALL || {};
    const sfByKey  = _indexByNorm(all.startup_sf);
    const oneByKey = _indexByNorm(all.startup_1qb);
    if (global.ADP_DATA && typeof global.ADP_DATA === 'object') {
      Object.values(sfByKey).forEach(p => {
        global.ADP_DATA[p.name] = global.ADP_DATA[p.name] || {};
        global.ADP_DATA[p.name].sf = { overall: p.adp, posRank: p.posRank };
      });
      Object.values(oneByKey).forEach(p => {
        global.ADP_DATA[p.name] = global.ADP_DATA[p.name] || {};
        global.ADP_DATA[p.name].oneqb = { overall: p.adp, posRank: p.posRank };
      });
    }
    const FP = global.FP_VALUES;
    if (!FP) return;

    let _fmt = 'sf';
    try { const _v = localStorage.getItem('fpts-adp-format'); if (_v === '1qb' || _v === 'sf') _fmt = _v; } catch (e) {}

    const canonByKey = _fmt === '1qb' ? oneByKey : sfByKey;
    const fallByKey  = _fmt === '1qb' ? sfByKey  : oneByKey;
    const _monthlyKey = _fmt === '1qb' ? 'startup_1qb' : 'startup_sf';

    Object.entries(FP).forEach(([fpName, rec]) => {
      const key = normalizePlayerName(fpName);
      const p = canonByKey[key] || fallByKey[key];
      if (p) rec.adp = p.adp;
    });

    // ADP-derived trend: positive = player rising (ADP improved month-over-month).
    const months = Object.keys(j.byMonth).filter(m => m !== 'ALL').sort().reverse();
    if (months.length >= 2) {
      const perMonth = months.map(m => {
        const map = {};
        ((j.byMonth[m] || {})[_monthlyKey] || []).forEach(p => {
          if (p.name && p.adp != null) map[normalizePlayerName(p.name)] = p.adp;
        });
        return map;
      });
      const normToFp = {};
      Object.keys(FP).forEach(fpName => { normToFp[normalizePlayerName(fpName)] = fpName; });
      const recent = perMonth[0];
      for (const k in recent) {
        for (let i = 1; i < perMonth.length; i++) {
          const prev = perMonth[i][k];
          if (prev != null) {
            const fpName = normToFp[k];
            if (fpName && FP[fpName]) FP[fpName].trend = Math.round(prev - recent[k]);
            break;
          }
        }
      }
    }
  }

  function _applyAuctionPayload(j) {
    if (!j || !j.byMonth) return;
    global.AUCTION_PAYLOAD = j;
    const all = j.byMonth.ALL || {};
    const sfByKey  = _indexByNorm(all.startup_sf);
    const oneByKey = _indexByNorm(all.startup_1qb);
    function fmt(p) { return (p && p.med != null) ? ('$' + Math.round(p.med)) : null; }
    const FP = global.FP_VALUES;
    if (!FP) return;
    Object.entries(FP).forEach(([fpName, rec]) => {
      const key = normalizePlayerName(fpName);
      const one = oneByKey[key];
      const sf  = sfByKey[key];
      rec.auction   = fmt(one) || fmt(sf) || rec.auction || null;
      rec.auctionSf = fmt(sf)              || rec.auctionSf || null;
    });
  }

  function _applyMvsPayload(j) {
    if (!j || !j.players) return;
    global.MVS_PAYLOAD = j;

    let _fmt = 'sf';
    try { const _v = localStorage.getItem('fpts-adp-format'); if (_v === '1qb' || _v === 'sf') _fmt = _v; } catch (e) {}

    const FP = global.FP_VALUES;
    const PV = global.PICK_VALUES;

    if (FP) {
      const fpByNorm = {};
      Object.keys(FP).forEach(n => { fpByNorm[normalizePlayerName(n)] = n; });
      const overlaid = new Set();
      Object.entries(j.players).forEach(([name, mvs]) => {
        const fpName = FP[name] ? name : fpByNorm[normalizePlayerName(name)];
        const target = fpName ? FP[fpName] : (FP[name] = { sleeperId: mvs.sleeperId, pos: mvs.position });
        target.valueSf  = mvs.valueSf;
        target.value1qb = mvs.value1qb;
        target.value    = (_fmt === '1qb') ? mvs.value1qb : mvs.valueSf;
        target.baselineSf  = mvs.baseline;
        target.baseline1qb = mvs.baseline1qb;
        target.baseline    = (_fmt === '1qb') ? mvs.baseline1qb : mvs.baseline;
        target.trend       = (_fmt === '1qb') ? mvs.trend1qb : mvs.trend;
        target.tradesLastWeekSf  = mvs.tradesLastWeek;
        target.tradesLastWeek1qb = mvs.tradesLastWeek1qb;
        target.tradesLastWeek    = (_fmt === '1qb') ? mvs.tradesLastWeek1qb : mvs.tradesLastWeek;
        target.historySf  = mvs.history;
        target.history1qb = mvs.history1qb;
        target.history    = (_fmt === '1qb') ? mvs.history1qb : mvs.history;
        target.otcValue       = mvs.otcValue;
        target.otcDiff        = mvs.otcDiff;
        target.rankings       = mvs.rankings;
        target.recentTrades   = mvs.recentTrades;
        target.lastUpdated    = mvs.lastUpdated;
        overlaid.add(target);
      });
      // Wholesale replacement: zero out value for FP players MVS doesn't cover.
      Object.values(FP).forEach(rec => {
        if (overlaid.has(rec)) return;
        rec.value = 0; rec.valueSf = 0; rec.value1qb = 0;
      });
    }

    if (PV && j.picks) {
      Object.entries(j.picks).forEach(([key, rec]) => {
        PV[key] = {
          value:    (_fmt === '1qb') ? rec.value1qb : rec.valueSf,
          valueSf:  rec.valueSf,
          value1qb: rec.value1qb,
          valueTep: rec.valueSf,  // backward-compat alias
          label:    rec.label,
        };
      });
    }
  }

  // ─── Fetch + hydrate ─────────────────────────────────────────────────────

  const opts = global.FPTS_DATA_OPTS || {};
  const skip = new Set(opts.skip || []);
  const v = '?v=' + (global.__DATA_VERSION || Date.now());

  function _fetchJson(path) {
    return fetch(path + v).then(r => r.ok ? r.json() : null).catch(() => null);
  }

  function _maybe(name, path) {
    return skip.has(name) ? Promise.resolve(null) : _fetchJson(path);
  }

  const ready = Promise.all([
    _maybe('values',            'data/values.json'),
    _maybe('adp',               'data/adp.json'),
    _maybe('auction',           'data/auction.json'),
    _maybe('picks',             'data/picks.json'),
    _maybe('mvs',               'data/mvs.json'),
    _maybe('articles',          'data/articles.json'),
    _maybe('pick-availability', 'data/pick-availability.json'),
  ]).then(function (results) {
    const [values, adp, auction, picks, mvs, articles, pa] = results;

    // Apply in canonical order:
    //   1. values  — seeds FP_VALUES with all players
    //   2. adp     — overlays .adp and ADP-derived .trend onto FP_VALUES
    //   3. auction — overlays .auction and .auctionSf
    //   4. picks   — seeds PICK_VALUES with pick slot record-shapes
    //   5. mvs     — wholesale overlay of values/baseline/trend/history (runs AFTER values + picks)
    //   6. articles + pick-availability — informational; no overlay onto FP_VALUES
    if (values && values.players) Object.assign(global.FP_VALUES, values.players);
    if (adp)                       _applyAdpPayload(adp);
    if (auction)                   _applyAuctionPayload(auction);
    if (picks && picks.picks)      Object.assign(global.PICK_VALUES, picks.picks);
    if (mvs)                       _applyMvsPayload(mvs);
    if (articles && articles.players) global.PLAYER_ARTICLES = articles.players;
    if (pa && pa.players)          global.PICK_AVAILABILITY = pa.players;
    if (pa) global.PICK_AVAILABILITY_META = {
      version:    pa.version,
      season:     pa.season,
      teamCount:  pa.teamCount,
      topN:       pa.topN,
    };

    // Auto-populate SLEEPER_IDS from FP_VALUES if the page didn't pre-seed it.
    // Pages that ship a hand-curated SLEEPER_IDS dict (e.g. trade-calculator)
    // will skip this branch because the dict is non-empty before bootstrap runs.
    if (Object.keys(global.SLEEPER_IDS).length === 0) {
      Object.entries(global.FP_VALUES).forEach(function (entry) {
        const name = entry[0], rec = entry[1];
        if (rec && rec.sleeperId) global.SLEEPER_IDS[name] = String(rec.sleeperId);
      });
    }

    try {
      document.dispatchEvent(new CustomEvent('fpts:data-ready', {
        detail: {
          version: (adp && adp.version) || (pa && pa.version) || (values && values.version) || null,
          page:    global.FPTS_CURRENT_PAGE || null,
        },
      }));
    } catch (e) { /* CustomEvent unavailable in very old browsers — skip */ }
    return results;
  });

  // ─── Public API ──────────────────────────────────────────────────────────

  global.FPTS_DATA = {
    ready: ready,
    get version() {
      return (global.PICK_AVAILABILITY_META && global.PICK_AVAILABILITY_META.version)
          || (global.ADP_PAYLOAD && global.ADP_PAYLOAD.version)
          || null;
    },
    _applyAdpPayload:     _applyAdpPayload,
    _applyAuctionPayload: _applyAuctionPayload,
    _applyMvsPayload:     _applyMvsPayload,
    normalizePlayerName:  normalizePlayerName,
  };

})(typeof window !== 'undefined' ? window : globalThis);
