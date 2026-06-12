/* ════════════════════════════════════════════════════════════════════════════
   trade-finder.js — the cross-league Trade Finder (window.TradeFinder).
   Moved verbatim from my-leagues.html; page-coupling concentrated in the adapter
   below + an init-config so the SAME module serves my-leagues.html and the
   standalone trade-calculator.html. Depends on window.SLEEPER (sleeper-helpers),
   window.LC (league-compute), window.FP_VALUES / SLEEPER_IDS / normalizePlayerName
   (data-bootstrap), and window.ML_ALL_LEAGUE_DATA / ML_EXPOSURE_DATA (host page).
   ════════════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  // ── adapter: host-page hooks (set via TradeFinder.init) + shared-module shims ──
  var cfg = {};
  var CDN = 'https://sleepercdn.com';
  const FLAME_ICON = `<svg class="ml-flame-icon" xmlns="http://www.w3.org/2000/svg" viewBox="413 0 95 90" width="14" height="14"><path d="M508.084,47.801l-8.983,41.534c0,0 -75.276,-0.036 -85.237,-0.002l0.015,-0.067c0,0 2.533,-17.352 5.641,-25.475c3.708,-9.689 16.604,-32.658 16.604,-32.658c12.902,8.212 8.658,21.025 7.099,27.21c11.719,-8.962 11.012,-17.186 11.003,-28.608c-0.006,-7.356 4.797,-23.375 17.858,-28.257c-4.305,14.678 3.971,24.95 7.333,30.494c6.362,10.492 1.397,21.17 1.397,21.17c0,0 9.268,-3.36 8.863,-15.254c-0.117,-3.424 -1.714,-14.283 8.012,-18.422c-0.754,9.397 5.495,18.682 10.395,28.336Z" fill="var(--red)"/></svg>`;
  function _getLeague(id){ return cfg.getLeague ? (cfg.getLeague(id) || {}) : {}; }
  function mlComputeLeagueValueData(id){ var d=(global.ML_ALL_LEAGUE_DATA||{})[id]; return d ? global.LC.computeLeagueValueData(d, _getLeague(id)) : null; }
  function mlBuildAssetPool(id, rid){ var d=(global.ML_ALL_LEAGUE_DATA||{})[id]; return d ? global.LC.buildAssetPool(d, rid, _getLeague(id)) : []; }
  function mlGenerateTradeSuggestions(a,t,arch,n){ return global.SLEEPER.generateTradeSuggestions(a,t,arch,n); }
  function mlValueKey(id){ return global.LC.valueKey(_getLeague(id)); }
  function mlFpValue(ktc, id){ return global.LC.fpValue(ktc, _getLeague(id)); }
  function mlArchetypeBg(k){ return global.LC.archetypeBg(k); }
  function mlArchetypeFg(k){ return global.LC.archetypeFg(k); }
  function normalizePlayerName(n){ return global.normalizePlayerName ? global.normalizePlayerName(n) : String(n==null?'':n).toLowerCase().replace(/[^a-z0-9]/g,''); }
  function openTradeSuggestModal(sid, id){ if (cfg.openBuilder) cfg.openBuilder(sid, id); }
  function openCalcModal(a, b, opts){ if (cfg.openCalc) cfg.openCalc(a, b, opts); }
  function mlExposureSetTab(t){ if (cfg.setTab) cfg.setTab(t); }
  function _mlExpandLeagueRow(id){ if (cfg.goToLeague) cfg.goToLeague(id); }
  function toggleLeagueExpand(id){ if (cfg.goToLeague) cfg.goToLeague(id); }

// ════════════════════════════════════════════════════════════════════════════
// TRADE FINDER (mlTf*) — cross-league "who has the players I want + what to offer"
// Ported from trade-calculator.html's _ws* finder, but reads the already-loaded
// ML_ALL_LEAGUE_DATA + mlComputeLeagueValueData (no duplicate fetch / archetype
// recompute). Results render as a manager → player(+rank) → leagues drill-down;
// clicking a league lazily builds the win-biased proposal + jumps to that league.
// ════════════════════════════════════════════════════════════════════════════
const ML_TF_WIN_BIAS = 0.93;   // AGGRESSIVE build target — offers ~7% in your favor (tunable)
// ── Suggestion-quality knobs (2026-06-11) — all curator-tunable. Fair mode is the default so the
//    surfaced offers are ones the COUNTERPARTY would actually accept, not lowballs tilted to you. ──
const ML_TF_FAIR_BIAS  = 0.99;  // FAIR (default) build target — near-even
let   ML_TF_FAIR_MODE  = true;  // default fair; aggressive mode uses ML_TF_WIN_BIAS (UI toggle = follow-up)
const ML_TF_RECIP_CAP  = 0.08;  // fair mode: don't surface offers that lowball the recipient past 8%
const ML_TF_OVERPAY_CAP = 0.15; // never surface offers where YOU overpay past 15%
const ML_TF_LOWBALL_PICKSHARE = 0.45; // anti-lowball: penalize packages where picks exceed this value share
const ML_TF_LOWBALL_PENALTY   = 0.5;  // strength of the pick-share-over-cap penalty (sort tie-breaker)
const ML_TF_WANTS = {
  rebuilder:{young:1.0,vet:0.3}, emergency:{young:0.6,vet:0.4},
  tweener:{young:0.5,vet:0.5}, contender:{young:0.3,vet:1.0}, dynasty:{young:0.7,vet:0.7}
};
let mlTfState = { targets:[], managers:[], archetypes:[], dir:'for' };
let mlTfCtxCache = {};
let mlTfRegistry = {};
let mlTfEditRegistry = {};

function mlTfEsc(s){ return String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function mlTfThumb(name){
  const sid = (typeof window.SLEEPER_IDS !== 'undefined') ? window.SLEEPER_IDS[name] : null;
  return sid
    ? `<span class="ml-tf-thumb"><img src="${CDN}/content/nfl/players/thumb/${sid}.jpg" onerror="this.style.display='none'"></span>`
    : `<span class="ml-tf-thumb"></span>`;
}

// Per-league finder context (cached) — teams with archetype + ownerUser + the
// roster's player ids, plus name→team and name→pid indexes for fast lookup.
function mlTfLeagueCtx(leagueId){
  if (mlTfCtxCache[leagueId]) return mlTfCtxCache[leagueId];
  const d = (window.ML_ALL_LEAGUE_DATA || {})[leagueId];
  if (!d) return null;
  let cv = null;
  try { cv = mlComputeLeagueValueData(leagueId); } catch (e) { return null; }
  if (!cv) return null;
  const league = _getLeague(leagueId);
  const fmtKey = mlValueKey(leagueId);
  const tep = !!(league.scoring_settings && league.scoring_settings.bonus_rec_te > 0);
  const fmtLabel = (fmtKey === 'valueSf' ? 'SF' : '1QB') + (tep ? ' · TEP' : '');
  const userById = {}; (d.users || []).forEach(u => userById[u.user_id] = u);
  const rosterById = {}; (d.rosters || []).forEach(r => rosterById[r.roster_id] = r);
  const nameToTeam = {}, nameToPid = {}, teamById = {};
  const teams = cv.teams.map(t => {
    const r = rosterById[t.rosterId] || {};
    const u = userById[r.owner_id];
    const ownerUser = u ? (u.display_name || u.username) : (t.name || ('Team ' + t.rosterId));
    const players = r.players || [];
    players.forEach(pid => {
      const p = d.players[pid]; if (!p) return;
      const nm = p.full_name || ((p.first_name||'') + ' ' + (p.last_name||'')).trim();
      if (!nm) return;
      const norm = normalizePlayerName(nm);
      nameToTeam[norm] = t.rosterId;
      nameToPid[norm]  = pid;
    });
    const tt = Object.assign({}, t, { ownerUser, owner_id:r.owner_id, players });
    teamById[t.rosterId] = tt;
    return tt;
  });
  const myTeam = teams.find(t => t.isMe) || null;
  const ctx = { leagueId, league, teams, teamById, myTeam, myRosterId:d.myRosterId, fmtKey, fmtLabel, nameToTeam, nameToPid, dPlayers:d.players };
  mlTfCtxCache[leagueId] = ctx;
  return ctx;
}

function mlTfFindOwner(ctx, targetName){
  const rid = ctx.nameToTeam[normalizePlayerName(targetName)];
  return (rid != null) ? ctx.teamById[rid] : null;
}
function mlTfPlayerVal(name, leagueId){ return mlFpValue(window.FP_VALUES[name], leagueId); }
function mlTfTeamWants(ctx, team, playerName){
  const pid = ctx.nameToPid[normalizePlayerName(playerName)];
  const p = pid ? ctx.dPlayers[pid] : null;
  const age = (p && p.age) ? p.age : 26;
  const w = ML_TF_WANTS[team.archetype] || ML_TF_WANTS.tweener;
  return (age <= 24 ? w.young : w.vet) >= 0.5;
}

// ── positional need (re-rank signal, not an engine change) ──
// window.FP_VALUES posRank → bare position ("WR8" → "WR").
function mlTfPosOf(name){
  const fp = window.FP_VALUES[name]; const pr = fp && fp.posRank;
  return pr ? pr.replace(/[0-9]/g,'').toUpperCase() : '';
}
// Rank EVERY team within the league at each position (1 = most value). Cached on ctx.
function mlTfEnsurePosRanks(ctx){
  if (ctx._posRanksDone) return;
  ['QB','RB','WR','TE'].forEach(pos => {
    const sorted = ctx.teams.slice().sort((a,b)=> ((b.posVals&&b.posVals[pos])||0) - ((a.posVals&&a.posVals[pos])||0));
    sorted.forEach((t,i)=> { (t.posRanks = t.posRanks || {})[pos] = i + 1; });
  });
  ctx.nTeams = ctx.teams.length;
  ctx._posRanksDone = true;
}
// A team's "needs" = positions where it ranks in the bottom ~40% of the league.
function mlTfNeedSet(team, nTeams){
  const need = {};
  if (!team || !team.posRanks || !nTeams) return need;
  ['QB','RB','WR','TE'].forEach(pos => {
    const r = team.posRanks[pos];
    if (r && r > nTeams * 0.6) need[pos] = r;
  });
  return need;
}
function mlTfAllManagers(){
  const counts = {};
  Object.keys(window.ML_ALL_LEAGUE_DATA || {}).forEach(leagueId => {
    const ctx = mlTfLeagueCtx(leagueId); if (!ctx) return;
    ctx.teams.forEach(t => { if (t.isMe) return; counts[t.ownerUser] = (counts[t.ownerUser]||0) + 1; });
  });
  return Object.keys(counts).map(name => ({ name, count:counts[name] }))
    .sort((a,b)=> b.count - a.count || a.name.localeCompare(b.name));
}

// ── pickers ──
function mlTfTargetSearch(q){
  const box = document.getElementById('ml-tf-target-results'); if (!box) return;
  q = (q||'').trim().toLowerCase();
  const away = mlTfState.dir === 'away';
  // AWAY: you can only move players YOU roster — source from your Exposure, and
  // make it browsable (small set). FOR: the whole player pool, needs ≥2 chars.
  const source = away
    ? Array.from(new Set((window.ML_EXPOSURE_DATA || []).map(p => p && p.name).filter(Boolean)))
    : Object.keys(window.FP_VALUES);
  if (!away && q.length < 2){ box.style.display='none'; box.innerHTML=''; return; }
  const names = source
    .filter(n => (!q || n.toLowerCase().indexOf(q) >= 0) && mlTfState.targets.indexOf(n) < 0)
    .sort((a,b)=> (((window.FP_VALUES[b]||{}).value)||0) - (((window.FP_VALUES[a]||{}).value)||0))
    .slice(0, away ? 12 : 8);
  if (!names.length){ box.style.display='none'; box.innerHTML=''; return; }
  box.innerHTML = names.map(n => {
    const pr = (window.FP_VALUES[n] && window.FP_VALUES[n].posRank) || '';
    return `<div class="ml-tf-opt" data-n="${mlTfEsc(n)}" onmousedown="event.preventDefault()" onclick="mlTfAddTarget(this.dataset.n)">${mlTfThumb(n)}<span class="ml-tf-opt-n">${mlTfEsc(n)}</span><span class="ml-tf-opt-r">${mlTfEsc(pr)}</span></div>`;
  }).join('');
  box.style.display='';
}
function mlTfAddTarget(name){
  if (!name || mlTfState.targets.indexOf(name) >= 0) return;
  mlTfState.targets.push(name);
  const inp = document.getElementById('ml-tf-target-input'); if (inp) inp.value='';
  const box = document.getElementById('ml-tf-target-results'); if (box){ box.style.display='none'; box.innerHTML=''; }
  mlTfRenderTargetChips(); mlTfRender();
}
function mlTfRemoveTarget(name){
  mlTfState.targets = mlTfState.targets.filter(n => n !== name);
  mlTfRenderTargetChips(); mlTfRender();
}
function mlTfRenderTargetChips(){
  const el = document.getElementById('ml-tf-target-chips'); if (!el) return;
  el.innerHTML = mlTfState.targets.map(n =>
    `<span class="ml-tf-chip">${mlTfThumb(n)}<span>${mlTfEsc(n)}</span><button class="ml-tf-chip-x" data-n="${mlTfEsc(n)}" onclick="mlTfRemoveTarget(this.dataset.n)">×</button></span>`
  ).join('');
}
function mlTfMgrSearch(q){
  const box = document.getElementById('ml-tf-mgr-results'); if (!box) return;
  q = (q||'').trim().toLowerCase();
  const list = mlTfAllManagers()
    .filter(m => (!q || m.name.toLowerCase().indexOf(q) >= 0) && mlTfState.managers.indexOf(m.name) < 0)
    .slice(0,12);
  if (!list.length){ box.style.display='none'; box.innerHTML=''; return; }
  box.innerHTML = list.map(m =>
    `<div class="ml-tf-opt" data-n="${mlTfEsc(m.name)}" onmousedown="event.preventDefault()" onclick="mlTfAddMgr(this.dataset.n)"><span class="ml-tf-opt-n">${mlTfEsc(m.name)}</span><span class="ml-tf-opt-r">${m.count} league${m.count>1?'s':''}</span></div>`
  ).join('');
  box.style.display='';
}
function mlTfAddMgr(name){
  if (!name || mlTfState.managers.indexOf(name) >= 0) return;
  mlTfState.managers.push(name);
  const inp = document.getElementById('ml-tf-mgr-input'); if (inp) inp.value='';
  const box = document.getElementById('ml-tf-mgr-results'); if (box){ box.style.display='none'; box.innerHTML=''; }
  mlTfRenderMgrChips(); mlTfRender();
}
function mlTfRemoveMgr(name){
  mlTfState.managers = mlTfState.managers.filter(n => n !== name);
  mlTfRenderMgrChips(); mlTfRender();
}
function mlTfRenderMgrChips(){
  const el = document.getElementById('ml-tf-mgr-chips'); if (!el) return;
  el.innerHTML = mlTfState.managers.map(n =>
    `<span class="ml-tf-chip tgt"><span>${mlTfEsc(n)}</span><button class="ml-tf-chip-x" data-n="${mlTfEsc(n)}" onclick="mlTfRemoveMgr(this.dataset.n)">×</button></span>`
  ).join('');
}
function mlTfHideSoon(id){ setTimeout(()=>{ const b=document.getElementById(id); if(b){ b.style.display='none'; } }, 130); }
function mlTfSetDir(d){
  if (mlTfState.dir === d) return;
  mlTfState.dir = d;
  const wrap = document.getElementById('ml-tf-dirs');
  if (wrap) wrap.querySelectorAll('.ml-tf-dir').forEach(b => b.classList.toggle('active', b.dataset.dir === d));
  const lab = document.getElementById('ml-tf-target-label');
  if (lab) lab.textContent = (d === 'away') ? "Players you'd move" : 'Players you want';
  const inp = document.getElementById('ml-tf-target-input');
  if (inp){ inp.value = ''; inp.placeholder = (d === 'away') ? "Search a player you roster…" : 'Add a player you want…'; }
  const box = document.getElementById('ml-tf-target-results'); if (box){ box.style.display='none'; box.innerHTML=''; }
  mlTfRenderTargetChips();
  mlTfRender();
}

// Do YOU roster this player in this league? Uses the SAME signal as Exposure
// (the league's myPlayerIds set, by sleeperId) so AWAY's league set matches
// your Exposure shares exactly — not name-matching, which can drift.
function mlTfMySidForName(name){
  const ex = (window.ML_EXPOSURE_DATA || []).find(p => p && p.name === name);
  return ex ? String(ex.sleeperId) : null;
}
function mlTfIOwnHere(leagueId, sid){
  if (!sid) return false;
  const d = (window.ML_ALL_LEAGUE_DATA || {})[leagueId];
  if (!d || !d.myPlayerIds) return false;
  const mp = d.myPlayerIds;
  if (typeof mp.has === 'function') return mp.has(sid) || mp.has(Number(sid));
  if (Array.isArray(mp)) return mp.indexOf(sid) >= 0 || mp.indexOf(Number(sid)) >= 0;
  return false;
}

// ── owner-lookup map (cheap, no proposal math) → sorted manager groups ──
function mlTfBuildMap(){
  const dir = mlTfState.dir;
  const byMgr = {};
  const ensure = (mgr) => byMgr[mgr] || (byMgr[mgr] = { ownerUser:mgr, leagues:{}, players:{} });
  const leagueIds = Object.keys(window.ML_ALL_LEAGUE_DATA || {});
  mlTfState.targets.forEach(target => {
    const mySid = (dir === 'away') ? mlTfMySidForName(target) : null;
    leagueIds.forEach(leagueId => {
      const ctx = mlTfLeagueCtx(leagueId); if (!ctx || !ctx.myTeam) return;
      if (dir === 'for'){
        const owner = mlTfFindOwner(ctx, target);
        if (!owner || owner.isMe) return;
        const e = ensure(owner.ownerUser); e.leagues[leagueId] = 1;
        (e.players[target] = e.players[target] || []).push({ leagueId, ctx, team:owner, target });
      } else {
        // Only leagues where YOU actually roster the player (same signal as
        // Exposure → the league set matches your Exposure shares exactly).
        if (!mlTfIOwnHere(leagueId, mySid)) return;
        ctx.teams.forEach(t => {
          if (t.isMe || !mlTfTeamWants(ctx, t, target)) return;
          const e = ensure(t.ownerUser); e.leagues[leagueId] = 1;
          (e.players[target] = e.players[target] || []).push({ leagueId, ctx, team:t, target });
        });
      }
    });
  });
  let mgrs = Object.keys(byMgr).map(k => byMgr[k]);
  if (mlTfState.managers.length) mgrs = mgrs.filter(m => mlTfState.managers.indexOf(m.ownerUser) >= 0);
  mgrs.forEach(m => { m.leagueCount = Object.keys(m.leagues).length; m.playerNames = Object.keys(m.players); });
  mgrs.sort((a,b)=> b.playerNames.length - a.playerNames.length || b.leagueCount - a.leagueCount || a.ownerUser.localeCompare(b.ownerUser));
  return mgrs;
}
function mlTfSlug(s){ return String(s).replace(/[^a-zA-Z0-9]/g,'').slice(0,24); }

function mlTfRender(){
  const out = document.getElementById('ml-tf-results'); if (!out) return;
  const dir = mlTfState.dir;
  if (!mlTfState.targets.length){
    out.innerHTML = `<div class="ml-tf-empty">${dir==='away'?"Add a player you'd move":'Add a player you want'} above — the finder scans every league you're in and ${dir==='away'?'lists managers who would want them.':'lists who rosters them + what to offer.'}</div>`;
    return;
  }
  if (!window.ML_ALL_LEAGUE_DATA || !Object.keys(window.ML_ALL_LEAGUE_DATA).length){
    out.innerHTML = `<div class="ml-tf-empty">Your leagues are still loading…</div>`;
    return;
  }
  mlTfRegistry = {}; mlTfEditRegistry = {};
  // Both modes are organized LEAGUE → people → ≤3 trades.
  //   AWAY: leagues YOU roster the player in → managers who'd want him.
  //   FOR:  leagues where someone ELSE rosters the player → that owner.
  if (dir === 'away') mlTfRenderAway(out);
  else mlTfRenderFor(out);
}

// Archetype display order: strongest (dynasty) → weakest (emergency).
const ML_TF_ARCH_ORDER = ['dynasty','contender','tweener','rebuilder','emergency'];
function mlTfArchRank(a){ const i = ML_TF_ARCH_ORDER.indexOf(a); return i < 0 ? 99 : i; }

// Small archetype chip (reuses My-Leagues archetype colors).
function mlTfArchChip(archetype){
  if (!archetype) return '';
  const bg = (typeof mlArchetypeBg === 'function') ? mlArchetypeBg(archetype) : 'var(--border)';
  const fg = (typeof mlArchetypeFg === 'function') ? mlArchetypeFg(archetype) : 'var(--white)';
  const txt = (window.SLEEPER && window.SLEEPER.archetypeLabel) ? window.SLEEPER.archetypeLabel(archetype) : archetype;
  return `<span class="ml-tf-arch" style="--archetype-bg:${bg};--archetype-fg:${fg}">${mlTfEsc(txt)}</span>`;
}

// Archetype filter — narrow results to managers of these team types (e.g. only
// shop a player to emergency teams, or only buy from rebuilders).
function mlTfToggleArch(a){
  const i = mlTfState.archetypes.indexOf(a);
  if (i >= 0) mlTfState.archetypes.splice(i, 1); else mlTfState.archetypes.push(a);
  mlTfSyncArchBtns();
  mlTfRender();
}
function mlTfSyncArchBtns(){
  const wrap = document.getElementById('ml-tf-arch-filter'); if (!wrap) return;
  wrap.querySelectorAll('.ml-tf-archbtn').forEach(b => {
    const on = mlTfState.archetypes.indexOf(b.dataset.arch) >= 0;
    b.classList.toggle('active', on);
    if (on && typeof mlArchetypeBg === 'function'){
      b.style.background = mlArchetypeBg(b.dataset.arch);
      b.style.color = mlArchetypeFg(b.dataset.arch);
      b.style.borderColor = mlArchetypeBg(b.dataset.arch);
    } else { b.style.background = ''; b.style.color = ''; b.style.borderColor = ''; }
  });
}

// FOR render: for each league where another manager rosters the player you want,
// list that owner, each expandable to up to 3 trade offers from your roster.
function mlTfRenderFor(out){
  const byLeague = {};
  const leagueIds = Object.keys(window.ML_ALL_LEAGUE_DATA || {});
  mlTfState.targets.forEach(target => {
    leagueIds.forEach(leagueId => {
      const ctx = mlTfLeagueCtx(leagueId); if (!ctx || !ctx.myTeam) return;
      const owner = mlTfFindOwner(ctx, target);
      if (!owner || owner.isMe) return;     // skip FAs + leagues where you already own him
      if (mlTfState.managers.length && mlTfState.managers.indexOf(owner.ownerUser) < 0) return;
      if (mlTfState.archetypes.length && mlTfState.archetypes.indexOf(owner.archetype) < 0) return;
      const g = byLeague[leagueId] || (byLeague[leagueId] = { leagueId, leagueName: ctx.league.name || ('League '+leagueId), fmtLabel: ctx.fmtLabel, myArchetype: (ctx.myTeam && ctx.myTeam.archetype) || null, holders: [] });
      g.holders.push({ ownerUser: owner.ownerUser, rosterId: owner.rosterId, target, archetype: owner.archetype });
    });
  });
  const groups = Object.keys(byLeague).map(k => byLeague[k]);
  if (!groups.length){
    out.innerHTML = `<div class="ml-tf-empty">No one rosters your ${mlTfState.targets.length>1?'players':'player'}${mlTfState.managers.length?' among the selected managers':''} in your leagues right now.</div>`;
    return;
  }
  groups.sort((a,b)=> b.holders.length - a.holders.length || a.leagueName.localeCompare(b.leagueName));
  const single = mlTfState.targets.length === 1;
  const head = single ? mlTfForShopHtml(mlTfState.targets[0], groups) : '';
  out.innerHTML = head + groups.map(mlTfForLeagueHtml).join('');
}

function mlTfForShopHtml(pn, groups){
  const fp = window.FP_VALUES[pn] || {};
  const pr = fp.posRank || '';
  const first = groups[0];
  const val = first ? Math.round(mlTfPlayerVal(pn, first.leagueId)).toLocaleString() : '';
  const mgrs = {}; groups.forEach(g => g.holders.forEach(h => { mgrs[h.ownerUser] = 1; }));
  const nM = Object.keys(mgrs).length;
  return `<div class="ml-tf-shop">${mlTfThumb(pn)}<div class="ml-tf-shop-main"><div class="ml-tf-shop-line1"><span class="ml-tf-shop-name">${mlTfEsc(pn)}</span>${pr?`<span class="ml-tf-shop-rank">${mlTfEsc(pr)}</span>`:''}${val?`<span class="ml-tf-shop-val">${val}</span>`:''}</div><span class="ml-tf-shop-sub">rostered in ${groups.length} of your league${groups.length>1?'s':''} · ${nM} manager${nM>1?'s':''}</span></div></div>`;
}

function mlTfForLeagueHtml(g){
  const rows = g.holders.slice().sort((a,b)=> mlTfArchRank(a.archetype) - mlTfArchRank(b.archetype)).map(h => {
    const pn = h.target;
    const last = String(pn).split(' ').slice(1).join(' ') || pn;
    const rid = 'mltf-' + mlTfSlug(g.leagueId) + '-' + mlTfSlug(pn) + '-' + mlTfSlug(h.ownerUser);
    mlTfRegistry[rid] = { leagueId:g.leagueId, rosterId:h.rosterId, target:pn, dir:'for' };
    return `<div class="ml-tf-lg">
        <button class="ml-tf-lg-btn" onclick="mlTfShowProposal('${rid}')">
          <span class="ml-tf-lg-go" id="${rid}-go">▸</span>
          <span class="ml-tf-lg-name">${mlTfEsc(h.ownerUser)}</span>
          ${mlTfArchChip(h.archetype)}
          <span class="ml-tf-lg-fmt">has ${mlTfEsc(last)}</span>
        </button>
        <div class="ml-tf-prop" id="${rid}"></div>
      </div>`;
  }).join('');
  return `<div class="ml-tf-mgr">
      <div class="ml-tf-mgr-head"><span class="ml-tf-mgr-name">${mlTfEsc(g.leagueName)}</span>${g.myArchetype?`<span class="ml-tf-you">you</span>${mlTfArchChip(g.myArchetype)}`:''}<span class="ml-tf-mgr-sub">${mlTfEsc(g.fmtLabel)}${g.holders.length>1?' · '+g.holders.length+' players':''}</span></div>
      <div class="ml-tf-mgr-body">${rows}</div>
    </div>`;
}

// AWAY render: for each league YOU roster the player in, list the managers who'd
// want him (your archetype-want parameters), each expandable to ≤3 trade offers.
function mlTfRenderAway(out){
  const groups = [];                 // { leagueId, target, leagueName, fmtLabel, buyers:[{ownerUser, rosterId}] }
  const leagueIds = Object.keys(window.ML_ALL_LEAGUE_DATA || {});
  mlTfState.targets.forEach(target => {
    const mySid = mlTfMySidForName(target);
    leagueIds.forEach(leagueId => {
      const ctx = mlTfLeagueCtx(leagueId); if (!ctx || !ctx.myTeam) return;
      if (!mlTfIOwnHere(leagueId, mySid)) return;     // ONLY leagues you roster him in
      let buyers = ctx.teams.filter(t => !t.isMe && mlTfTeamWants(ctx, t, target));
      if (mlTfState.managers.length) buyers = buyers.filter(t => mlTfState.managers.indexOf(t.ownerUser) >= 0);
      if (mlTfState.archetypes.length) buyers = buyers.filter(t => mlTfState.archetypes.indexOf(t.archetype) >= 0);
      if (!buyers.length) return;
      groups.push({
        leagueId, target,
        leagueName: ctx.league.name || ('League ' + leagueId),
        fmtLabel: ctx.fmtLabel,
        myArchetype: (ctx.myTeam && ctx.myTeam.archetype) || null,
        buyers: buyers.map(t => ({ ownerUser: t.ownerUser, rosterId: t.rosterId, archetype: t.archetype }))
      });
    });
  });
  if (!groups.length){
    out.innerHTML = `<div class="ml-tf-empty">No manager wants your ${mlTfState.targets.length>1?'players':'player'}${mlTfState.managers.length?' among the selected managers':''} in the leagues you roster ${mlTfState.targets.length>1?'them':'him'}.</div>`;
    return;
  }
  groups.sort((a,b)=> b.buyers.length - a.buyers.length || a.leagueName.localeCompare(b.leagueName));
  const single = mlTfState.targets.length === 1;
  const head = single ? mlTfAwayShopHtml(mlTfState.targets[0], groups) : '';
  out.innerHTML = head + groups.map(mlTfAwayLeagueHtml).join('');
}

function mlTfAwayShopHtml(pn, groups){
  const fp = window.FP_VALUES[pn] || {};
  const pr = fp.posRank || '';
  const first = groups[0];
  const val = first ? Math.round(mlTfPlayerVal(pn, first.leagueId)).toLocaleString() : '';
  const buyers = groups.reduce((s,g)=> s + g.buyers.length, 0);
  return `<div class="ml-tf-shop">${mlTfThumb(pn)}<div class="ml-tf-shop-main"><div class="ml-tf-shop-line1"><span class="ml-tf-shop-name">${mlTfEsc(pn)}</span>${pr?`<span class="ml-tf-shop-rank">${mlTfEsc(pr)}</span>`:''}${val?`<span class="ml-tf-shop-val">${val}</span>`:''}</div><span class="ml-tf-shop-sub">you roster in ${groups.length} league${groups.length>1?'s':''} · ${buyers} potential buyer${buyers>1?'s':''}</span></div></div>`;
}

function mlTfAwayLeagueHtml(g){
  const pn = g.target;
  const last = String(pn).split(' ').slice(1).join(' ') || pn;
  const buyers = g.buyers.slice().sort((a,b)=> mlTfArchRank(a.archetype) - mlTfArchRank(b.archetype)).map(b => {
    const rid = 'mltf-' + mlTfSlug(g.leagueId) + '-' + mlTfSlug(pn) + '-' + mlTfSlug(b.ownerUser);
    mlTfRegistry[rid] = { leagueId:g.leagueId, rosterId:b.rosterId, target:pn, dir:'away' };
    return `<div class="ml-tf-lg">
        <button class="ml-tf-lg-btn" onclick="mlTfShowProposal('${rid}')">
          <span class="ml-tf-lg-go" id="${rid}-go">▸</span>
          <span class="ml-tf-lg-name">${mlTfEsc(b.ownerUser)}</span>
          ${mlTfArchChip(b.archetype)}
          <span class="ml-tf-lg-fmt">wants ${mlTfEsc(last)}</span>
        </button>
        <div class="ml-tf-prop" id="${rid}"></div>
      </div>`;
  }).join('');
  return `<div class="ml-tf-mgr">
      <div class="ml-tf-mgr-head"><span class="ml-tf-mgr-name">${mlTfEsc(g.leagueName)}</span>${g.myArchetype?`<span class="ml-tf-you">you</span>${mlTfArchChip(g.myArchetype)}`:''}<span class="ml-tf-mgr-sub">${mlTfEsc(g.fmtLabel)} · ${g.buyers.length} buyer${g.buyers.length>1?'s':''}</span></div>
      <div class="ml-tf-mgr-body">${buyers}</div>
    </div>`;
}

function mlTfShoppingHtml(pn, mgrs){
  const fp = window.FP_VALUES[pn] || {};
  const pr = fp.posRank || '';
  const dir = mlTfState.dir;
  const first = mgrs[0] && mgrs[0].players[pn] && mgrs[0].players[pn][0];
  const val = first ? Math.round(mlTfPlayerVal(pn, first.leagueId)).toLocaleString() : '';
  const leagueSet = {}; mgrs.forEach(m => Object.keys(m.leagues).forEach(l => leagueSet[l] = 1));
  const nL = Object.keys(leagueSet).length;
  return `<div class="ml-tf-shop">${mlTfThumb(pn)}<div class="ml-tf-shop-main"><div class="ml-tf-shop-line1"><span class="ml-tf-shop-name">${mlTfEsc(pn)}</span>${pr?`<span class="ml-tf-shop-rank">${mlTfEsc(pr)}</span>`:''}${val?`<span class="ml-tf-shop-val">${val}</span>`:''}</div><span class="ml-tf-shop-sub">${mgrs.length} manager${mgrs.length>1?'s':''} · ${nL} league${nL>1?'s':''} ${dir==='away'?'would want them':'roster them'}</span></div></div>`;
}

function mlTfLeagueRowHtml(entry, m, pn, dir){
  const rid = 'mltf-' + mlTfSlug(m.ownerUser) + '-' + mlTfSlug(pn) + '-' + entry.leagueId;
  mlTfRegistry[rid] = { leagueId:entry.leagueId, rosterId:entry.team.rosterId, target:pn, dir };
  const lgName = entry.ctx.league.name || ('League ' + entry.leagueId);
  return `<div class="ml-tf-lg">
      <button class="ml-tf-lg-btn" onclick="mlTfShowProposal('${rid}')">
        <span class="ml-tf-lg-go" id="${rid}-go">▸</span>
        <span class="ml-tf-lg-name">${mlTfEsc(lgName)}</span>
        <span class="ml-tf-lg-fmt">${mlTfEsc(entry.ctx.fmtLabel)}</span>
      </button>
      <div class="ml-tf-prop" id="${rid}"></div>
    </div>`;
}

function mlTfMgrGroupHtml(m, single){
  const dir = mlTfState.dir;
  if (single){
    const pn = m.playerNames[0];
    const rows = m.players[pn].map(e => mlTfLeagueRowHtml(e, m, pn, dir)).join('');
    return `<div class="ml-tf-mgr">
        <div class="ml-tf-mgr-head"><span class="ml-tf-mgr-name">${mlTfEsc(m.ownerUser)}</span><span class="ml-tf-mgr-sub">${m.leagueCount} league${m.leagueCount>1?'s':''}</span></div>
        <div class="ml-tf-mgr-body">${rows}</div>
      </div>`;
  }
  const sub = (dir==='away')
    ? `wants ${m.playerNames.length} of your player${m.playerNames.length>1?'s':''} · ${m.leagueCount} league${m.leagueCount>1?'s':''}`
    : `has ${m.playerNames.length} player${m.playerNames.length>1?'s':''} you want · ${m.leagueCount} league${m.leagueCount>1?'s':''}`;
  const players = m.playerNames.map(pn => {
    const fp = window.FP_VALUES[pn] || {};
    const pr = fp.posRank || '';
    const entries = m.players[pn];
    const val = Math.round(mlTfPlayerVal(pn, entries[0].leagueId)).toLocaleString();
    const rows = entries.map(e => mlTfLeagueRowHtml(e, m, pn, dir)).join('');
    return `<div class="ml-tf-player">
        <div class="ml-tf-player-head">${mlTfThumb(pn)}<span class="ml-tf-player-name">${mlTfEsc(pn)}</span>${pr?`<span class="ml-tf-player-rank">${mlTfEsc(pr)}</span>`:''}<span class="ml-tf-player-val">${val}</span></div>
        ${rows}
      </div>`;
  }).join('');
  return `<div class="ml-tf-mgr">
      <div class="ml-tf-mgr-head"><span class="ml-tf-mgr-name">${mlTfEsc(m.ownerUser)}</span><span class="ml-tf-mgr-sub">${sub}</span></div>
      <div class="ml-tf-mgr-body">${players}</div>
    </div>`;
}

function mlTfShowProposal(rid){
  const el = document.getElementById(rid); if (!el) return;
  const go = document.getElementById(rid+'-go');
  if (el.dataset.open === '1'){ el.style.display='none'; el.dataset.open=''; if(go) go.textContent='▸'; return; }
  if (el.dataset.loaded !== '1'){ el.innerHTML = mlTfProposalHtml(mlTfRegistry[rid]); el.dataset.loaded='1'; }
  el.style.display='block'; el.dataset.open='1'; if(go) go.textContent='▾';
}

function mlTfProposalHtml(reg){
  if (!reg) return `<div class="ml-tf-note">Gone — re-run the search.</div>`;
  const ctx = mlTfLeagueCtx(reg.leagueId); if (!ctx) return `<div class="ml-tf-note">League data unavailable.</div>`;
  const owner = ctx.teamById[reg.rosterId];
  if (!owner || !window.SLEEPER) return `<div class="ml-tf-note">Couldn't build a proposal here.</div>`;
  try {
    mlTfEnsurePosRanks(ctx);
    const nT = ctx.nTeams;
    const myNeed = mlTfNeedSet(ctx.myTeam, nT);
    if (reg.dir === 'for'){
      const targetVal = mlTfPlayerVal(reg.target, reg.leagueId);
      if (!targetVal) return `<div class="ml-tf-note">No value on file for ${mlTfEsc(reg.target)}.</div>`;
      const pool = mlBuildAssetPool(reg.leagueId, ctx.myRosterId);
      if (!pool.length) return `<div class="ml-tf-note">You have no tradeable assets in this league.</div>`;
      const ownerNeed = mlTfNeedSet(owner, nT);
      const offers = mlTfPickOffers(pool, targetVal, owner.archetype, 'for', myNeed, ownerNeed);
      if (!offers.length) return `<div class="ml-tf-note">No realistic value match from your roster here.</div>`;
      const tPos = mlTfPosOf(reg.target);
      const targetSid = ctx.nameToPid[normalizePlayerName(reg.target)];
      const cards = offers.map((o, i) => {
        const need = {
          fillsMyNeedPos: (tPos && myNeed[tPos]) ? tPos : null,
          myRankAtTarget: (ctx.myTeam && ctx.myTeam.posRanks) ? ctx.myTeam.posRanks[tPos] : null,
          ownerHelpPos: (o.sugg.sending||[]).map(a=>a.pos).find(p => p && ownerNeed[p]) || null,
          myThinSentPos: (o.sugg.sending||[]).map(a=>a.pos).find(p => p && myNeed[p]) || null,
          nT
        };
        const editId = 'mltfedit-' + mlTfSlug(reg.leagueId) + '-' + mlTfSlug(reg.target) + '-' + i;
        mlTfEditRegistry[editId] = {
          targetName: reg.target, targetSid,
          leagueId: reg.leagueId, ownerRosterId: owner.rosterId,
          sending: (o.sugg.sending||[]).map(a => ({ name:a.name, value:a.value, pos:a.pos, type:a.type, season:a.season, round:a.round }))
        };
        return mlTfCardHtml({ dir:'for', ctx, owner, target:reg.target, anchorVal:targetVal, sugg:o.sugg, mode:o.mode, need, editId });
      }).join('');
      return mlTfOffersWrap(ctx, offers.length, cards, { dir:'for', leagueId:reg.leagueId, targetSid });
    } else {
      const playerVal = mlTfPlayerVal(reg.target, reg.leagueId);
      if (!playerVal) return `<div class="ml-tf-note">No value on file for ${mlTfEsc(reg.target)}.</div>`;
      const theirPool = mlBuildAssetPool(reg.leagueId, owner.rosterId);
      if (!theirPool.length) return `<div class="ml-tf-note">${mlTfEsc(owner.ownerUser)} has no tradeable assets here.</div>`;
      const myArch = (ctx.myTeam && ctx.myTeam.archetype) || 'tweener';
      const offers = mlTfPickOffers(theirPool, playerVal, myArch, 'away', myNeed, null);
      if (!offers.length) return `<div class="ml-tf-note">No fair return from ${mlTfEsc(owner.ownerUser)} here.</div>`;
      const cards = offers.map(o => {
        const need = { getsMyNeedPos: (o.sugg.sending||[]).map(a=>a.pos).find(p => p && myNeed[p]) || null, nT };
        return mlTfCardHtml({ dir:'away', ctx, owner, target:reg.target, anchorVal:playerVal, sugg:o.sugg, mode:o.mode, need });
      }).join('');
      return mlTfOffersWrap(ctx, offers.length, cards, { dir:'away', leagueId:reg.leagueId });
    }
  } catch(e){
    return `<div class="ml-tf-note">Couldn't build a proposal — ${mlTfEsc((e&&e.message)||String(e))}</div>`;
  }
}

// Build up to 3 DISTINCT offers spanning a range of edges. Merge archetype-tilted
// + neutral "value" candidates (the value fallback fills in when archetype-fit is
// thin), dedupe by package, order by favor, then spread the picks across the
// range so you see a high / mid / fair option — not three near-identical packages.
function mlTfPickOffers(pool, anchorVal, archetype, dir, myNeed, ownerNeed){
  const isFor = dir === 'for';
  const bias  = ML_TF_FAIR_MODE ? ML_TF_FAIR_BIAS : ML_TF_WIN_BIAS;
  const target = isFor ? anchorVal * bias : anchorVal / bias;
  // edge = YOUR favor. FOR: you send less than the target is worth. AWAY: you get back more.
  const edgeOf = (c) => isFor ? (1 - c.totalSent/anchorVal) : (c.totalSent/anchorVal - 1);
  const needAdj = (c) => {
    let adj = 0;
    (c.sending||[]).forEach(a => {
      if (a.pos && myNeed && myNeed[a.pos])       adj += isFor ? -0.05 : 0.05;
      if (a.pos && ownerNeed && ownerNeed[a.pos]) adj += 0.04;
    });
    return adj;
  };
  // E — anti-lowball: a package that reads as "fliers + a pick for my real player". Penalize by how
  // far the package's PICK share exceeds the cap (picks are the easiest sweetener to overvalue and
  // the least wanted by a win-now owner).
  const lowballPenalty = (c) => {
    const tot = c.totalSent || 0; if (tot <= 0) return 0;
    const pickVal = (c.sending||[]).filter(a => a.type === 'pick').reduce((s,a)=>s+(a.value||0),0);
    const share = pickVal / tot;
    return share > ML_TF_LOWBALL_PICKSHARE ? (share - ML_TF_LOWBALL_PICKSHARE) * ML_TF_LOWBALL_PENALTY : 0;
  };
  const seen = {}, uniq = [];
  const add = (arr, mode) => (arr||[]).forEach(c => {
    const sig = (c.sending||[]).map(a=>a.name).slice().sort().join('|');
    if (!sig || seen[sig]) return; seen[sig] = 1;
    c.edge = edgeOf(c); c.mode = mode; c.needAdj = needAdj(c);
    c.lowball = lowballPenalty(c);
    c.quality = c.needAdj - c.lowball;   // non-value tie-breaker (need-fit minus lowball)
    uniq.push(c);
  });
  add(mlGenerateTradeSuggestions(pool, target, archetype, 8), 'fit');
  add(mlGenerateTradeSuggestions(pool, target, 'tweener', 8), 'value');
  if (!uniq.length) return [];
  // D — fairness: in fair mode keep offers inside [−overpay cap, +recipient cap] of YOUR edge — so we
  // never surface offers that lowball the counterparty past the cap (or that wildly overpay) — and
  // show the THREE FAIREST distinct packages (closest to even first). Aggressive mode keeps the old
  // wide band + spread across the edge range.
  if (ML_TF_FAIR_MODE) {
    let list = uniq.filter(c => c.edge >= -ML_TF_OVERPAY_CAP && c.edge <= ML_TF_RECIP_CAP);
    if (list.length < 3) list = uniq.filter(c => c.edge >= -ML_TF_OVERPAY_CAP);
    if (list.length < 3) list = uniq.slice();
    list.sort((a,b) => (Math.abs(a.edge) - Math.abs(b.edge)) || (b.quality - a.quality));
    return list.slice(0, 3).map(c => ({ sugg:c, mode:c.mode }));
  }
  let list = uniq.filter(c => c.edge >= -0.15);     // aggressive: keep it realistic (no wild overpays)
  if (list.length < 3) list = uniq.slice();
  list.sort((a,b) => (b.edge - a.edge) || (b.quality - a.quality));
  return mlTfSpread(list, 3).map(c => ({ sugg:c, mode:c.mode }));
}

// Pick up to n items spread across a sorted list so the result spans the range.
function mlTfSpread(list, n){
  if (list.length <= n) return list.slice();
  const picks = [], used = new Set();
  for (let i = 0; i < n; i++){
    let idx = Math.round(i * (list.length - 1) / (n - 1));
    while (used.has(idx) && idx < list.length - 1) idx++;
    while (used.has(idx) && idx > 0) idx--;
    if (used.has(idx)) continue;
    used.add(idx); picks.push(list[idx]);
  }
  return picks;
}

function mlTfOffersWrap(ctx, count, cardsHtml, opts){
  opts = opts || {};
  const goLeague = `<button class="ml-tf-go" onclick="mlTfGoToLeague('${ctx.leagueId}')">Go to league ↗</button>`;
  let send;
  if (opts.dir === 'for' && opts.targetSid){
    // Open the existing My Leagues Trade Builder (editable + "Go To Sleeper").
    send = `<button class="ml-tf-go primary" onclick="mlTfEditOnSleeper('${opts.leagueId}','${opts.targetSid}')">Get suggestions ↗</button>`;
  } else {
    send = `<a class="ml-tf-go primary" href="${(typeof _mlBuildSleeperLeagueUrl==='function')?_mlBuildSleeperLeagueUrl(opts.leagueId||ctx.leagueId):'#'}" target="_blank" rel="noopener">Open on Sleeper ↗</a>`;
  }
  return `<div class="ml-tf-offers">
      <div class="ml-tf-offers-head"><span class="ml-tf-offers-n">${count} offer${count>1?'s':''} · best → fair</span><span class="ml-tf-offers-actions">${goLeague}${send}</span></div>
      ${cardsHtml}
    </div>`;
}

// Open the editable Trade Builder for this league's target (same modal the
// My-Leagues trade suggestions use — edit the package, then "Go To Sleeper").
function mlTfEditOnSleeper(leagueId, targetSid){
  try {
    if (typeof openTradeSuggestModal === 'function' && targetSid) { openTradeSuggestModal(targetSid, leagueId); return; }
  } catch (e) {}
  try { if (typeof _mlBuildSleeperLeagueUrl === 'function') window.open(_mlBuildSleeperLeagueUrl(leagueId), '_blank', 'noopener'); } catch (e) {}
}

// Edit THIS exact package — open the editable trade calculator pre-loaded with it.
function mlTfEditCard(editId){
  const p = mlTfEditRegistry[editId];
  if (!p) return;
  try {
    if (typeof openCalcModal === 'function'){
      openCalcModal(p.targetName, p.targetSid, {
        leagueId: p.leagueId,
        ownerRosterId: p.ownerRosterId,
        presetSendingAssets: p.sending,
        targetAsset: null
      });
      return;
    }
  } catch (e) {}
  try { if (typeof openTradeSuggestModal === 'function' && p.targetSid) openTradeSuggestModal(p.targetSid, p.leagueId); } catch (e) {}
}

function mlTfAssetRow(a){
  const isPick = a.type === 'pick';
  const sid = (!isPick && typeof window.SLEEPER_IDS !== 'undefined') ? window.SLEEPER_IDS[a.name] : null;
  const thumb = isPick
    ? `<span class="ml-tf-thumb pick">${(typeof FLAME_ICON !== 'undefined') ? FLAME_ICON : '◆'}</span>`
    : (sid ? `<span class="ml-tf-thumb"><img src="${CDN}/content/nfl/players/thumb/${sid}.jpg" onerror="this.style.display='none'"></span>` : `<span class="ml-tf-thumb"></span>`);
  return `<div class="ml-tf-asset">${thumb}<span class="ml-tf-asset-n">${mlTfEsc(a.name)}</span><span class="ml-tf-asset-v">${Math.round(a.value||0).toLocaleString()}</span></div>`;
}
function mlTfAnchorAsset(name, val){
  const sid = (typeof window.SLEEPER_IDS !== 'undefined') ? window.SLEEPER_IDS[name] : null;
  return `<div class="ml-tf-asset"><span class="ml-tf-thumb">${sid?`<img src="${CDN}/content/nfl/players/thumb/${sid}.jpg" onerror="this.style.display='none'">`:''}</span><span class="ml-tf-asset-n hot">${mlTfEsc(name)}</span><span class="ml-tf-asset-v">${Math.round(val||0).toLocaleString()}</span></div>`;
}

function mlTfNeedHtml(o){
  const n = o.need; if (!n) return '';
  const parts = [];
  if (o.dir === 'away'){
    if (n.getsMyNeedPos) parts.push(`✓ gets you ${n.getsMyNeedPos} help (you're thin there)`);
  } else {
    if (n.fillsMyNeedPos) parts.push(`✓ fills your ${n.fillsMyNeedPos} need${n.myRankAtTarget?` (${n.myRankAtTarget}/${n.nT})`:''}`);
    if (n.ownerHelpPos) parts.push(`sends ${mlTfEsc(o.owner.ownerUser)} ${n.ownerHelpPos} help`);
    if (n.myThinSentPos && n.myThinSentPos !== n.fillsMyNeedPos) parts.push(`⚠ gives up ${n.myThinSentPos} (you're thin)`);
  }
  return parts.length ? `<div class="ml-tf-need">${parts.join(' · ')}</div>` : '';
}
function mlTfCardHtml(o){
  const s = o.sugg, edge = s.edge, edgePct = Math.round(Math.abs(edge)*100);
  const win = edge >= 0.02, fair = !win && edge > -0.02;
  const isValue = o.mode === 'value';
  const pkg = (s.sending||[]).map(mlTfAssetRow).join('');
  const valueTag = isValue ? `<span class="ml-tf-tag" title="Value-based offer (no archetype tilt)">VALUE</span>` : '';
  const note = `${isValue?'Value-based offer · ':''}${mlTfEsc(o.ctx.fmtLabel)}`;
  const needHtml = mlTfNeedHtml(o);
  // Guru Approved — only when the trade is in your favor by 4%+.
  const guru = edge >= 0.04;
  const guruBadge = guru ? `<span class="ml-tf-guru" title="In your favor by 4%+ — Guru Approved"><img class="ml-tf-guru-img" src="assets/images/john-cartoon.png" alt="">Guru Approved</span>` : '';
  const editBtn = o.editId ? `<button class="ml-tf-edit" onclick="mlTfEditCard('${o.editId}')" title="Edit this exact package in the trade calculator">Edit ✎</button>` : '';
  if (o.dir === 'away'){
    const edgeBadge = win ? `<span class="ml-tf-edge win">You win ${edgePct}%</span>` : (fair ? `<span class="ml-tf-edge">Fair</span>` : `<span class="ml-tf-edge">−${edgePct}% light</span>`);
    return `<div class="ml-tf-card${guru?' win':''}">
        <div class="ml-tf-card-top">${guruBadge}${valueTag}${edgeBadge}${editBtn}</div>
        <div class="ml-tf-flow">
          <div class="ml-tf-side"><div class="ml-tf-side-lab">You send</div>${mlTfAnchorAsset(o.target, o.anchorVal)}</div>
          <div class="ml-tf-arrow">→</div>
          <div class="ml-tf-side"><div class="ml-tf-side-lab">You get back</div>${pkg}</div>
        </div>
        ${needHtml}
        <div class="ml-tf-note">${note}</div>
      </div>`;
  }
  const edgeBadge = win ? `<span class="ml-tf-edge win">You win ${edgePct}%</span>` : (fair ? `<span class="ml-tf-edge">Fair</span>` : `<span class="ml-tf-edge">+${edgePct}% over</span>`);
  return `<div class="ml-tf-card${guru?' win':''}">
      <div class="ml-tf-card-top">${guruBadge}${valueTag}${edgeBadge}${editBtn}</div>
      <div class="ml-tf-flow">
        <div class="ml-tf-side"><div class="ml-tf-side-lab">You send</div>${pkg}</div>
        <div class="ml-tf-arrow">→</div>
        <div class="ml-tf-side"><div class="ml-tf-side-lab">You get</div>${mlTfAnchorAsset(o.target, o.anchorVal)}</div>
      </div>
      ${needHtml}
      <div class="ml-tf-note">${note}</div>
    </div>`;
}

function mlTfGoToLeague(leagueId){
  // Open the league in a NEW tab (keeps the finder open in this one); the
  // ?league deep-link expands + scrolls to that league on load.
  try { window.open('my-leagues.html?league=' + encodeURIComponent(leagueId), '_blank', 'noopener'); }
  catch (e) { _mlExpandLeagueRow(leagueId); }
}
// Expand + scroll to a league row in THIS page (used by the ?league deep-link).
function _mlExpandLeagueRow(leagueId){
  const row = document.getElementById('lr-'+leagueId);
  if (!row) return;
  if (!row.classList.contains('expanded') && typeof toggleLeagueExpand === 'function') toggleLeagueExpand(leagueId);
  setTimeout(() => { try { row.scrollIntoView({ behavior:'smooth', block:'start' }); } catch (e) {} }, 150);
}

// ── admin gate (Trade Finder is hidden for everyone but the admin for now) ──
// True when signed in as the admin account, OR when ?admin=1 was used on this
// browser (persisted). ?admin=0 clears it.
function mlTfIsAdmin(){
  // Trade Finder went public in phase 6 — the admin gate is removed. Kept as a
  // function so the existing callers (mlExposureSetTab, the ?tab=finder handler,
  // applyAdminGate) need no changes.
  return true;
}
function mlTfApplyAdminGate(){
  try {
    const p = new URLSearchParams(location.search).get('admin');
    if (p === '1') localStorage.setItem('fpts-admin', '1');
    else if (p === '0') localStorage.removeItem('fpts-admin');
  } catch (e) {}
  const btn = document.getElementById('ml-tf-tab-btn');
  if (btn) btn.style.display = mlTfIsAdmin() ? '' : 'none';
}

// Open the Trade Finder with a player pre-loaded as a FOR target — used by the
// cross-page "Open in Trade Finder" handoffs + the My-Leagues player panel.
function mlTfOpenWithPlayer(name){
  mlTfState.dir = 'for';
  if (name && mlTfState.targets.indexOf(name) < 0) mlTfState.targets.push(name);
  const inp = document.getElementById('ml-tf-target-input'); if (inp) inp.placeholder = 'Add a player you want…';
  mlExposureSetTab('finder');   // admin-gated; mlEnsureFinder renders the result
}

function mlEnsureFinder(){
  const wrap = document.getElementById('ml-tf-dirs');
  if (wrap) wrap.querySelectorAll('.ml-tf-dir').forEach(b => b.classList.toggle('active', b.dataset.dir === mlTfState.dir));
  mlTfRenderTargetChips();
  mlTfRenderMgrChips();
  mlTfSyncArchBtns();
  mlTfRender();
}

  // ── expose inline-handler functions (rendered HTML + the #ml-finder-panel use them) ──
  global.mlTfShowProposal = mlTfShowProposal;
  global.mlTfAddTarget = mlTfAddTarget;
  global.mlTfRemoveTarget = mlTfRemoveTarget;
  global.mlTfTargetSearch = mlTfTargetSearch;
  global.mlTfHideSoon = mlTfHideSoon;
  global.mlTfMgrSearch = mlTfMgrSearch;
  global.mlTfAddMgr = mlTfAddMgr;
  global.mlTfRemoveMgr = mlTfRemoveMgr;
  global.mlTfSetDir = mlTfSetDir;
  global.mlTfToggleArch = mlTfToggleArch;
  global.mlTfEditCard = mlTfEditCard;
  global.mlTfGoToLeague = mlTfGoToLeague;
  global.mlTfEditOnSleeper = mlTfEditOnSleeper;

  // ── public API (host pages call these) ──
  global.TradeFinder = {
    init: function (c) { cfg = c || {}; },
    render: mlTfRender,
    ensure: mlEnsureFinder,
    openWithPlayer: mlTfOpenWithPlayer,
    isAdmin: mlTfIsAdmin,
    applyAdminGate: mlTfApplyAdminGate,
    cardHtml: mlTfCardHtml,
    // finder internals the Trade Builder (trade-calc.js / MLTB) reuses to render matching cards
    leagueCtx: mlTfLeagueCtx,
    ensurePosRanks: mlTfEnsurePosRanks,
    needSet: mlTfNeedSet,
    posOf: mlTfPosOf,
    resetCache: function () { mlTfCtxCache = {}; },
    reset: function () { mlTfState = { targets:[], managers:[], archetypes:[], dir:'for' }; mlTfCtxCache = {}; mlTfRegistry = {}; mlTfEditRegistry = {}; }
  };
})(window);
