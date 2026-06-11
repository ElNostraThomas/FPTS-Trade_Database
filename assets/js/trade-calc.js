/* ════════════════════════════════════════════════════════════════════════════
   trade-calc.js — the editable Trade Calculator (MLCALC) + Trade Builder pre-screener
   (MLTB). Moved verbatim from my-leagues.html; page-coupling concentrated in the
   adapter + init-config so the SAME module serves my-leagues.html and the standalone
   trade-calculator.html. Depends on window.SLEEPER, window.LC, window.TradeFinder
   (for the matching card renderer), window.FP_VALUES/SLEEPER_IDS/normalizePlayerName,
   and window.ML_ALL_LEAGUE_DATA. The #ml-calc-backdrop / #ml-ts-backdrop modal shells
   are provided as static HTML by each host page (mount points).
   ════════════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  // ── adapter: host-page hooks (TradeCalc.init) + shared-module shims ──
  var cfg = {};
  var CDN = 'https://sleepercdn.com';
  function _allLeagues(){ return cfg.allLeagues ? (cfg.allLeagues() || []) : []; }
  function _getLeague(id){ return _allLeagues().find(function (l) { return l && l.league_id === id; }) || {}; }
  function mlComputeLeagueValueData(id){ var d=(global.ML_ALL_LEAGUE_DATA||{})[id]; return d ? global.LC.computeLeagueValueData(d, _getLeague(id)) : null; }
  function mlBuildAssetPool(id, rid){ var d=(global.ML_ALL_LEAGUE_DATA||{})[id]; return d ? global.LC.buildAssetPool(d, rid, _getLeague(id)) : []; }
  function mlGenerateTradeSuggestions(a,t,arch,n){ return global.SLEEPER.generateTradeSuggestions(a,t,arch,n); }
  function mlValueKey(id){ return global.LC.valueKey(_getLeague(id)); }
  function mlFpValue(ktc, id){ return global.LC.fpValue(ktc, _getLeague(id)); }
  function mlGetValueByName(n){ return global.SLEEPER.getValueByName(n); }
  function mlArchetypeBg(k){ return global.LC.archetypeBg(k); }
  function mlArchetypeFg(k){ return global.LC.archetypeFg(k); }
  function normalizePlayerName(n){ return global.normalizePlayerName ? global.normalizePlayerName(n) : String(n==null?'':n).toLowerCase().replace(/[^a-z0-9]/g,''); }
  function closePlayerDetail(){ if (cfg.closeDetail) cfg.closeDetail(); }
  function mlGetHideUsernames(){ try { return localStorage.getItem('fpts-hide-usernames') === '1'; } catch(e) { return false; } }
  function _mlBuildSleeperLeagueUrl(leagueId){
    if (!leagueId) return '#';
    var isMobile = false;
    try { isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || ''); } catch (e) {}
    return isMobile ? ('https://sleeper.com/leagues/' + leagueId) : ('https://sleeper.com/leagues/' + leagueId + '/team');
  }

const MLTB = {
  targetSid: null,
  targetPlayer: null,
  leagueId: null,
  myRosterId: null,
  ownerRosterId: null,
  ownerName: '',
  archetype: null,
  leagueName: '',
  myAssetPool: [],
  ownerAssetPool: [],
  templates: [],
  currentIdx: 0,        // index into templates currently being shown
  reviewedAll: false,   // true after user has X'd through everything
};

// Open the trade builder modal (one-card-at-a-time pre-screener)
function openTradeSuggestModal(sleeperId, leagueId) {
  const sid = String(sleeperId);
  const data = (window.ML_ALL_LEAGUE_DATA || {})[leagueId];
  if (!data) return;
  const { rosters, users, myRosterId, players: lgPlayers } = data;

  // Find the target player + owning roster
  const owningRoster = rosters.find(r => {
    const ps = r.players || [];
    return ps.includes(sid) || ps.includes(Number(sid));
  });
  const lp = lgPlayers[sid];
  const targetName = lp ? (lp.full_name || `${lp.first_name || ''} ${lp.last_name || ''}`.trim()) : 'Unknown Player';
  const targetKtc = mlGetValueByName(targetName) || {};
  const targetValue = targetKtc.value || 0;
  const targetPos = lp ? lp.position : (targetKtc.posRank ? targetKtc.posRank.replace(/\d+/g, '') : '');

  // League name + owner info
  let leagueName = '';
  try {
    const allLeagues = _allLeagues();
    const league = allLeagues.find(l => l.league_id === leagueId);
    leagueName = league ? (league.name || `League ${leagueId}`) : `League ${leagueId}`;
  } catch(e) { leagueName = `League ${leagueId}`; }

  let ownerName = '';
  let archetype = null;
  if (owningRoster && String(owningRoster.roster_id) !== String(myRosterId)) {
    const u = users.find(x => x.user_id === owningRoster.owner_id);
    ownerName = (u && u.metadata && u.metadata.team_name) || (u && u.display_name) || `Team ${owningRoster.roster_id}`;
    const ld = mlComputeLeagueValueData(leagueId);
    if (ld) {
      const ownerTeam = ld.teams.find(t => t.rosterId === owningRoster.roster_id);
      if (ownerTeam) archetype = ownerTeam.archetype;
    }
  }

  // Reset state, populate fresh
  MLTB.targetSid = sid;
  MLTB.targetPlayer = targetValue ? { name: targetName, value: targetValue, pos: targetPos, sleeperId: sid, type: 'player', age: lp ? lp.age : null } : null;
  MLTB.leagueId = leagueId;
  MLTB.myRosterId = myRosterId;
  MLTB.ownerRosterId = owningRoster ? owningRoster.roster_id : null;
  MLTB.ownerName = ownerName;
  MLTB.archetype = archetype;
  MLTB.leagueName = leagueName;
  MLTB.myAssetPool = mlBuildAssetPool(leagueId, myRosterId);
  MLTB.ownerAssetPool = owningRoster ? mlBuildAssetPool(leagueId, owningRoster.roster_id) : [];
  MLTB.templates = (targetValue && owningRoster && String(owningRoster.roster_id) !== String(myRosterId))
    ? mlGenerateTradeSuggestions(MLTB.myAssetPool, targetValue, archetype, 5)
    : [];
  MLTB.currentIdx = 0;
  MLTB.reviewedAll = false;

  document.getElementById('ml-ts-title').textContent = `Trade Builder — ${targetName}`;
  mltbRender();
  document.getElementById('ml-ts-backdrop').classList.add('open');
}

function closeTradeSuggestModal() {
  document.getElementById('ml-ts-backdrop').classList.remove('open');
}

// Variant of openTradeSuggestModal for draft picks.
// season, round identify the pick. leagueId, ownerRosterId give the league + current owner.
function openTradeSuggestModalForPick(season, round, leagueId, ownerRosterId) {
  const data = (window.ML_ALL_LEAGUE_DATA || {})[leagueId];
  if (!data) return;
  const { rosters, users, myRosterId } = data;

  const targetValue = mlPickValue(String(season), Number(round), leagueId) || 0;
  const targetName = `${season} Round ${round}`;

  // League name + owner info
  let leagueName = '';
  try {
    const allLeagues = _allLeagues();
    const league = allLeagues.find(l => l.league_id === leagueId);
    leagueName = league ? (league.name || `League ${leagueId}`) : `League ${leagueId}`;
  } catch(e) { leagueName = `League ${leagueId}`; }

  const owningRoster = rosters.find(r => r.roster_id === ownerRosterId);

  let ownerName = '';
  let archetype = null;
  if (owningRoster && String(owningRoster.roster_id) !== String(myRosterId)) {
    const u = users.find(x => x.user_id === owningRoster.owner_id);
    ownerName = (u && u.metadata && u.metadata.team_name) || (u && u.display_name) || `Team ${owningRoster.roster_id}`;
    const ld = mlComputeLeagueValueData(leagueId);
    if (ld) {
      const ownerTeam = ld.teams.find(t => t.rosterId === owningRoster.roster_id);
      if (ownerTeam) archetype = ownerTeam.archetype;
    }
  }

  // Reset state, populate fresh
  MLTB.targetSid = null;
  MLTB.targetPlayer = targetValue ? {
    name: targetName, value: targetValue, pos: 'PICK', sleeperId: null,
    type: 'pick', season: String(season), round: Number(round), age: null
  } : null;
  MLTB.leagueId = leagueId;
  MLTB.myRosterId = myRosterId;
  MLTB.ownerRosterId = owningRoster ? owningRoster.roster_id : null;
  MLTB.ownerName = ownerName;
  MLTB.archetype = archetype;
  MLTB.leagueName = leagueName;
  MLTB.myAssetPool = mlBuildAssetPool(leagueId, myRosterId);
  MLTB.ownerAssetPool = owningRoster ? mlBuildAssetPool(leagueId, owningRoster.roster_id) : [];
  MLTB.templates = (targetValue && owningRoster && String(owningRoster.roster_id) !== String(myRosterId))
    ? mlGenerateTradeSuggestions(MLTB.myAssetPool, targetValue, archetype, 5)
    : [];
  MLTB.currentIdx = 0;
  MLTB.reviewedAll = false;

  document.getElementById('ml-ts-title').textContent = `Trade Builder — ${targetName}`;
  mltbRender();
  document.getElementById('ml-ts-backdrop').classList.add('open');
}

// Render the current state of the suggestion pre-screener
function mltbRender() {
  const body = document.getElementById('ml-ts-body');
  if (!body) return;

  const { targetPlayer, leagueName, ownerName, archetype, templates, currentIdx, reviewedAll, leagueId, myRosterId, ownerRosterId, targetSid } = MLTB;
  const hideNames = mlGetHideUsernames();
  const displayedOwnerName = hideNames && ownerName ? 'League Member' : ownerName;

  // Header strip — archetype chip's bg/fg come from CSS custom properties.
  const archChip = archetype
    ? `<span class="ml-tb-archchip" style="--archetype-bg:${mlArchetypeBg(archetype)};--archetype-fg:${mlArchetypeFg(archetype)}">${archetype}</span>`
    : '';
  const headerStrip = `
    <div class="ml-tb-headstrip">
      <div class="ml-tb-headstrip-row">
        ${targetSid ? `<img class="ml-tb-headstrip-thumb" src="https://sleepercdn.com/content/nfl/players/thumb/${targetSid}.jpg" onerror="this.style.visibility='hidden'">` : ''}
        <div class="ml-flex1">
          <div class="ml-tb-headstrip-name">${targetPlayer ? targetPlayer.name : 'Unknown'}</div>
          <div class="ml-tb-headstrip-meta">${targetPlayer ? (targetPlayer.pos + ' · Value ' + targetPlayer.value.toLocaleString()) : ''} · in ${leagueName}</div>
          ${ownerName ? `<div class="ml-tb-headstrip-owner">Owner: <span class="ml-pd-owner-name">${displayedOwnerName}</span>${archChip}</div>` : ''}
        </div>
      </div>
    </div>
  `;

  // Edge cases first
  if (!targetPlayer) {
    body.innerHTML = headerStrip + mltbCalcCtaBlock("No trade value available for this player. You can still build a custom trade in the calculator.");
    return;
  }
  if (!ownerRosterId) {
    body.innerHTML = headerStrip + `
      <div class="ml-tb-edge is-fa">
        <div class="ml-tb-edge-msg is-fa-body">This player is currently a free agent in this league.</div>
        <div class="ml-tb-edge-msg is-fa-sub">No trade is needed — claim them via waivers or free agency on Sleeper.</div>
        <a class="ml-tb-sleeper-link" href="${_mlBuildSleeperLeagueUrl(leagueId)}" target="_blank" rel="noopener">Go To Your Team On Sleeper ↗</a>
      </div>
    `;
    return;
  }
  if (String(ownerRosterId) === String(myRosterId)) {
    // For picks (which the user opens from their own roster), surface the
    // calculator CTA — useful for building a trade where the user offers
    // this pick. For players, the "you already own" message is correct.
    const ownLabel = targetPlayer && targetPlayer.type === 'pick'
      ? `This is your own pick. Open the trade calculator to build a custom trade with it.`
      : `You already own this player in this league.`;
    body.innerHTML = headerStrip + (targetPlayer && targetPlayer.type === 'pick'
      ? mltbCalcCtaBlock(ownLabel)
      : `<div class="ml-tb-edge is-own">${ownLabel}</div>`);
    return;
  }

  // No suggestions at all — jump straight to the "build it yourself" CTA
  if (!templates.length) {
    body.innerHTML = headerStrip + mltbCalcCtaBlock("We couldn't auto-generate matched packages. Use the trade calculator to build a custom offer with both rosters loaded.");
    return;
  }

  // After all suggestions reviewed
  if (reviewedAll || currentIdx >= templates.length) {
    body.innerHTML = headerStrip + mltbCalcCtaBlock(`You've reviewed all ${templates.length} suggested package${templates.length !== 1 ? 's' : ''}. Build a custom trade in the calculator with both rosters loaded.`);
    return;
  }

  // Render the current suggestion as a single card
  const t = templates[currentIdx];
  // The send/receive card is now rendered by mltbFinderCard (same design as the
  // sidebar finder); edge/value/need are computed inside mlTfCardHtml.
  const counterPos = (currentIdx + 1) + ' of ' + templates.length;

  // Build payload for the ✓ handler (encoded so we can stuff it in onclick)
  const acceptPayload = encodeURIComponent(JSON.stringify({ idx: currentIdx }));

  body.innerHTML = headerStrip + `
    <div class="ml-tb-card">
      <div class="ml-row-between">
        <span class="ml-section-head">Suggestion ${counterPos} — ${t.label}</span>
      </div>

      ${mltbFinderCard(t)}

      <div class="ml-tb-cta-row">
        <button type="button" class="ml-tb-cta is-skip" onclick="mltbReject()"
          title="Skip — show next suggestion">✗ Skip Next Suggestion</button>
        <button type="button" class="ml-tb-cta is-accept" onclick="mltbAccept('${acceptPayload}')"
          title="Open this offer in the trade calculator to edit">✓ Edit In Calculator</button>
      </div>
      <div class="ml-tb-cta-hint">
        ✓ opens our trade calculator with this package pre-loaded so you can edit. ✗ shows the next suggestion.
      </div>
    </div>
  `;
}

// Render a Trade-Builder suggestion using the FINDER's card design (mlTfCardHtml)
// so the modal and the sidebar Trade Finder look identical.
function mltbFinderCard(t){
  const tp = MLTB.targetPlayer || {};
  const tv = tp.value || 0;
  const totalSent = t.totalSent || (t.sending||[]).reduce((s,a)=> s + (a.value||0), 0);
  const edge = tv > 0 ? (1 - totalSent / tv) : 0;
  let need = null;
  try {
    const c = TradeFinder.leagueCtx(MLTB.leagueId);
    if (c){
      TradeFinder.ensurePosRanks(c);
      const ownerT = c.teamById[MLTB.ownerRosterId];
      const myNeed = TradeFinder.needSet(c.myTeam, c.nTeams);
      const ownerNeed = TradeFinder.needSet(ownerT, c.nTeams);
      const tPos = TradeFinder.posOf(tp.name);
      need = {
        fillsMyNeedPos: (tPos && myNeed[tPos]) ? tPos : null,
        myRankAtTarget: (c.myTeam && c.myTeam.posRanks) ? c.myTeam.posRanks[tPos] : null,
        ownerHelpPos: (t.sending||[]).map(a=>a.pos).find(p => p && ownerNeed[p]) || null,
        myThinSentPos: (t.sending||[]).map(a=>a.pos).find(p => p && myNeed[p]) || null,
        nT: c.nTeams
      };
    }
  } catch (e) {}
  let fmtLabel = '';
  try {
    const fmtKey = mlValueKey(MLTB.leagueId);
    const lg = _allLeagues().find(l => l.league_id === MLTB.leagueId);
    const tep = !!(lg && lg.scoring_settings && lg.scoring_settings.bonus_rec_te > 0);
    fmtLabel = (fmtKey === 'valueSf' ? 'SF' : '1QB') + (tep ? ' · TEP' : '');
  } catch (e) {}
  return TradeFinder.cardHtml({
    dir: 'for',
    ctx: { leagueId: MLTB.leagueId, fmtLabel },
    owner: { ownerUser: MLTB.ownerName || 'the owner' },
    target: tp.name,
    anchorVal: tv,
    sugg: { sending: t.sending, edge },
    mode: 'fit',
    need
  });
}

// Build the "open the calculator from scratch" CTA block (used when no/exhausted suggestions)
function mltbCalcCtaBlock(message) {
  return `
    <div class="ml-tb-edge">
      <div class="ml-tb-edge-msg">${message}</div>
      <div class="ml-tb-edge-msg is-sub">The calculator will open with both your roster and ${MLTB.ownerName ? MLTB.ownerName + "'s" : "the owner's"} roster as searchable pools so you can construct any package.</div>
      <button type="button" class="ml-tb-fullred-btn" onclick="mltbOpenCalculatorBlank()">Open Trade Calculator</button>
    </div>
  `;
}

// User skipped current suggestion — advance to next
function mltbReject() {
  MLTB.currentIdx++;
  if (MLTB.currentIdx >= MLTB.templates.length) {
    MLTB.reviewedAll = true;
  }
  mltbRender();
}

// User accepted a suggestion — open it in the calculator
function mltbAccept(payload) {
  let parsed;
  try { parsed = JSON.parse(decodeURIComponent(payload)); } catch(e) { return; }
  const idx = parsed && typeof parsed.idx === 'number' ? parsed.idx : MLTB.currentIdx;
  const t = MLTB.templates[idx];
  if (!t) return;

  // Close the suggestion modal first
  closeTradeSuggestModal();

  // For picks, pass the full asset; for players, the existing name-lookup path works
  const targetAsset = (MLTB.targetPlayer && MLTB.targetPlayer.type === 'pick') ? {
    name: MLTB.targetPlayer.name, value: MLTB.targetPlayer.value, pos: 'PICK',
    type: 'pick', season: MLTB.targetPlayer.season, round: MLTB.targetPlayer.round,
    sleeperId: null,
  } : null;
  // Open the trade calculator with the package pre-loaded + scoped to both rosters
  openCalcModal(MLTB.targetPlayer.name, MLTB.targetSid, {
    leagueId: MLTB.leagueId,
    ownerRosterId: MLTB.ownerRosterId,
    presetSendingAssets: t.sending.map(a => ({ name: a.name, value: a.value, pos: a.pos, type: a.type, season: a.season, round: a.round })),
    targetAsset,
  });
}

// "Open Trade Calculator" CTA — no preset offer, just both rosters as pools
function mltbOpenCalculatorBlank() {
  closeTradeSuggestModal();
  // Pass leagueId + ownerRosterId so calculator knows to scope its searches
  if (MLTB.targetPlayer) {
    const targetAsset = MLTB.targetPlayer.type === 'pick' ? {
      name: MLTB.targetPlayer.name, value: MLTB.targetPlayer.value, pos: 'PICK',
      type: 'pick', season: MLTB.targetPlayer.season, round: MLTB.targetPlayer.round,
      sleeperId: null,
    } : null;
    openCalcModal(MLTB.targetPlayer.name, MLTB.targetSid, {
      leagueId: MLTB.leagueId,
      ownerRosterId: MLTB.ownerRosterId,
      targetAsset,
    });
  } else {
    openCalcModal(null, null, {
      leagueId: MLTB.leagueId,
      ownerRosterId: MLTB.ownerRosterId,
    });
  }
}




function mlGetPlayerStatus(sleeperId) {
  const rosters = window.ML_ROSTERS || [];
  const users   = window.ML_USERS   || [];
  const myRid   = window.ML_MY_ROSTER_ID;
  const waivers = window.ML_WAIVERS || {};
  const w = waivers[sleeperId];
  const avgFaab = (w && w.bidCount > 0) ? Math.round(w.totalBid / w.bidCount) : null;
  const claims = w ? w.count : 0;
  // Find owning roster
  const owningRoster = rosters.find(r => (r.players || []).includes(String(sleeperId)) || (r.players || []).includes(sleeperId));
  if (!owningRoster) return { state: 'free', avgFaab, claims };
  if (String(owningRoster.roster_id) === String(myRid)) {
    return { state: 'mine', team: 'Your Roster' };
  }
  const u = users.find(x => x.user_id === owningRoster.owner_id);
  const teamName = (u && u.metadata && u.metadata.team_name) || (u && u.display_name) || ('Team ' + owningRoster.roster_id);
  return { state: 'taken', team: teamName, rosterId: owningRoster.roster_id, avgFaab, claims };
}

// ── CALCULATOR MODAL ──────────────────────────────────────────────────────
// State for the inline calculator
const MLCALC = {
  sides: { A: [], B: [] },
  searchTimer: null,
  // Scope: when set, restricts search pools to specific rosters in a specific league.
  // Set by openCalcModal when called from the trade builder's ✓ flow.
  scope: null,  // { leagueId, ownerRosterId } | null
  // League context for the Sleeper deep-link CTA. Set independently of scope so
  // pick-exposure flow (which has leagueId but no ownerRosterId) can still link.
  leagueId: null,
};

function openCalcModal(targetName, targetSleeperId, opts) {
  opts = opts || {};

  // League context for the Sleeper button (set whenever we know the league)
  MLCALC.leagueId = opts.leagueId || null;

  // Apply scope (used by trade builder ✓ flow to restrict search pools to two specific rosters)
  if (opts.leagueId && opts.ownerRosterId) {
    MLCALC.scope = {
      leagueId: opts.leagueId,
      ownerRosterId: opts.ownerRosterId,
    };
  } else {
    MLCALC.scope = null;
  }

  // Side A: preset assets if provided, otherwise empty
  if (opts.presetSendingAssets && opts.presetSendingAssets.length) {
    MLCALC.sides.A = opts.presetSendingAssets.map(a => ({
      name: a.name, value: a.value || 0, pos: a.pos || 'WR', type: a.type || 'player',
      sleeperId: a.sleeperId || null
    }));
  } else {
    MLCALC.sides.A = [];
  }

  // Side B: target asset (pick or player)
  if (opts.targetAsset) {
    // Pre-built target — use directly (covers picks)
    MLCALC.sides.B = [opts.targetAsset];
  } else {
    // Resolve via player name (existing behavior)
    const ktc = mlGetValueByName(targetName);
    if (ktc) {
      const pos = ktc.posRank ? ktc.posRank.replace(/\d+/g, '') : 'WR';
      MLCALC.sides.B = [{ name: targetName, value: mlFpValue(ktc, opts.leagueId), pos, type: 'player', sleeperId: targetSleeperId || null }];
    } else {
      MLCALC.sides.B = targetName ? [{ name: targetName, value: 0, pos: 'WR', type: 'player', sleeperId: targetSleeperId || null }] : [];
    }
  }

  // Close player-detail modal if open
  closePlayerDetail();
  // Title — include league context if scoped
  let title;
  if (MLCALC.scope) {
    const allLeagues = _allLeagues();
    const league = allLeagues.find(l => l.league_id === MLCALC.scope.leagueId);
    const lgName = league ? (league.name || 'league') : 'league';
    title = `Trade Builder — ${lgName}`;
  } else {
    const lgName = window.ML_LEAGUE ? window.ML_LEAGUE.name : 'your league';
    title = `Trade Builder — ${lgName}`;
  }
  document.getElementById('ml-calc-title').textContent = title;
  renderCalcModal();
  document.getElementById('ml-calc-backdrop').classList.add('open');
}

function closeCalcModal() {
  document.getElementById('ml-calc-backdrop').classList.remove('open');
  // Clear scope on close so next open of calc behaves normally
  MLCALC.scope = null;
}

function mlCalcSideTotal(side) {
  return side.reduce((sum, a) => sum + (a.value || 0), 0);
}

// Player headshot for a calc asset row. Assets don't always carry a sleeperId
// (search results are name-keyed), so fall back to SLEEPER_IDS / FP_VALUES.
// Returns a same-width spacer for picks / unknown players so rows stay aligned.
function _mlCalcThumb(a) {
  var sid = (a && a.sleeperId)
    || (window.SLEEPER_IDS && a && window.SLEEPER_IDS[a.name])
    || (window.FP_VALUES && a && window.FP_VALUES[a.name] && window.FP_VALUES[a.name].sleeperId)
    || null;
  if (!sid) return '<span class="ml-calc-asset-thumb ml-calc-asset-thumb-empty"></span>';
  return '<img class="ml-calc-asset-thumb" src="https://sleepercdn.com/content/nfl/players/thumb/'
    + sid + '.jpg" onerror="this.style.visibility=\'hidden\'">';
}

function renderCalcModal() {
  const totalA = mlCalcSideTotal(MLCALC.sides.A);
  const totalB = mlCalcSideTotal(MLCALC.sides.B);
  const diff = totalA - totalB;
  const absDiff = Math.abs(diff);
  const larger = Math.max(totalA, totalB) || 1;
  const pctOff = (absDiff / larger) * 100;
  let verdict, verdictText;
  if (totalA === 0 && totalB === 0) {
    verdict = ''; verdictText = 'Add players to compare';
  } else if (pctOff <= 5) {
    verdict = 'fair';
    verdictText = '✓ Fair Trade';
  } else if (pctOff <= 15) {
    verdict = 'unbalanced';
    verdictText = '~ Slightly Unbalanced';
  } else {
    verdict = 'heavy';
    verdictText = diff > 0 ? '⚠ Side A overpays' : '⚠ Side B overpays';
  }

  // Guru-approve any trade that's FAIR OR ABOVE for the user — i.e. you aren't
  // overpaying beyond the fair tolerance: diff <= 0 (even, or in your favor) OR the
  // imbalance is still inside the "fair" band (pctOff <= 5). Stamp Side A (You Send).
  const guruApprove = (totalA > 0 && totalB > 0 && (diff <= 0 || pctOff <= 5));
  const guruStamp = '<span class="ml-tf-guru ml-calc-guru" title="Guru Approved — this trade comes out in your favor"><img class="ml-tf-guru-img" src="assets/images/john-cartoon.png" alt="">Guru Approved</span>';
  const renderSide = (sideId, side, label, showGuru) => {
    const total = mlCalcSideTotal(side);
    const items = side.length ? side.map((a, i) => `
      <div class="ml-calc-asset-row">
        ${_mlCalcThumb(a)}<span class="ml-calc-asset-pos pos-${(a.pos || 'wr').toLowerCase()}">${a.pos}</span>
        <span class="ml-calc-asset-name">${a.name}</span>
        <span class="ml-calc-asset-val">${(a.value || 0).toLocaleString()}</span>
        <button class="ml-calc-asset-remove" onclick="mlCalcRemove('${sideId}',${i})">✕</button>
      </div>
    `).join('') : `<div class="ml-calc-empty">Search below to add assets</div>`;
    // Placeholder text varies based on scope mode
    let placeholder;
    if (MLCALC.scope) {
      placeholder = sideId === 'A' ? 'Add from your roster' : "Add from owner's roster";
    } else {
      placeholder = sideId === 'A' ? 'Add from your roster, or any player' : 'Add player or pick';
    }
    return `
      <div class="ml-calc-side">
        <div class="ml-calc-side-header">
          <span class="ml-calc-side-headL"><span class="ml-calc-side-label">${label}</span>${showGuru ? guruStamp : ''}</span>
          <span class="ml-calc-side-total ${total > 0 ? 'has-value' : ''}">${total > 0 ? total.toLocaleString() : '—'}</span>
        </div>
        <div class="ml-calc-assets">${items}</div>
        <div class="ml-calc-search-wrap">
          <input type="text" class="ml-calc-search-input" id="ml-calc-search-${sideId}"
            placeholder="${placeholder}"
            oninput="mlCalcSearch('${sideId}',this.value)"
            onfocus="mlCalcSearch('${sideId}',this.value)"
            onblur="setTimeout(()=>mlCalcHideResults('${sideId}'),150)"
            autocomplete="off">
          <div class="ml-calc-search-results" id="ml-calc-results-${sideId}"></div>
        </div>
      </div>`;
  };

  // Sleeper deep-link CTA — shown whenever we know which league this trade belongs to.
  // /trade is broken on Sleeper, so we link to /team which works.
  const sleeperCta = MLCALC.leagueId
    ? `<div class="ml-calc-sleeper-cta">
         <a class="ml-calc-sleeper-btn" href="${_mlBuildSleeperLeagueUrl(MLCALC.leagueId)}" target="_blank" rel="noopener">Open My Team On Sleeper ↗</a>
         <div class="ml-calc-sleeper-note">
           Sleeper doesn't expose a write API, so you'll need to re-enter the package in their trade builder. The link opens your team page where Sleeper's trade button lives.
         </div>
       </div>`
    : '';

  document.getElementById('ml-calc-body').innerHTML = `
    <div class="ml-calc-builder">
      ${renderSide('A', MLCALC.sides.A, 'You Send', guruApprove)}
      ${renderSide('B', MLCALC.sides.B, 'You Receive', false)}
    </div>
    <div class="ml-calc-balance">
      <div class="ml-calc-balance-row"><span class="ml-calc-balance-label">You Send</span><span class="ml-calc-balance-val">${totalA.toLocaleString()}</span></div>
      <div class="ml-calc-balance-row"><span class="ml-calc-balance-label">You Receive</span><span class="ml-calc-balance-val">${totalB.toLocaleString()}</span></div>
      <div class="ml-calc-balance-row diff"><span class="ml-calc-balance-label">Net</span><span class="ml-calc-balance-val" style="--net-color:${diff>0?'var(--red)':diff<0?'var(--green)':'var(--white)'}">${diff > 0 ? '−' : diff < 0 ? '+' : ''}${absDiff.toLocaleString()}</span></div>
      ${verdict ? `<div class="ml-calc-verdict ${verdict}">${verdictText}</div>` : ''}
    </div>
    ${sleeperCta}
  `;
}

function mlCalcSearch(sideId, query) {
  clearTimeout(MLCALC.searchTimer);
  MLCALC.searchTimer = setTimeout(() => {
    const resultsEl = document.getElementById(`ml-calc-results-${sideId}`);
    if (!resultsEl) return;
    const q = (query || '').trim().toLowerCase();
    const taken = new Set(MLCALC.sides[sideId].map(a => a.name));

    // Gap-targeting: when browsing (no text query) and THIS side is the lighter one,
    // surface the players whose value is closest to the amount still needed to
    // balance the trade — the "remaining value that is off" — instead of just the
    // highest-value players. With a query, fall back to value-desc (named search).
    const _thisTotal  = mlCalcSideTotal(MLCALC.sides[sideId]);
    const _otherTotal = mlCalcSideTotal(MLCALC.sides[sideId === 'A' ? 'B' : 'A']);
    const _need = _otherTotal - _thisTotal;        // value to add to THIS side to balance
    const _gapSort = (!q && _need > 0);
    const _cmp = _gapSort
      ? (a, b) => Math.abs((a.value || 0) - _need) - Math.abs((b.value || 0) - _need)
      : (a, b) => (b.value || 0) - (a.value || 0);

    let assets = [];

    // SCOPED MODE: when opened from the trade builder, both sides are restricted to
    // a specific roster's assets in a specific league.
    //   - Side A: user's roster + picks in MLCALC.scope.leagueId
    //   - Side B: owner's roster + picks (MLCALC.scope.ownerRosterId) in MLCALC.scope.leagueId
    if (MLCALC.scope) {
      const data = (window.ML_ALL_LEAGUE_DATA || {})[MLCALC.scope.leagueId];
      if (data) {
        const rid = sideId === 'A' ? data.myRosterId : MLCALC.scope.ownerRosterId;
        const pool = mlBuildAssetPool(MLCALC.scope.leagueId, rid);
        const isMineFlag = (sideId === 'A');
        assets = pool
          .filter(a => !taken.has(a.name))
          .filter(a => !q || a.name.toLowerCase().includes(q) || (a.pos || '').toLowerCase().includes(q))
          .sort(_cmp)
          .map(a => ({ name: a.name, value: a.value, pos: a.pos, type: a.type, isMine: isMineFlag }));
      }
    }
    // UNSCOPED MODE (existing behavior): Side A defaults to the active league's roster,
    // Side B falls back to all window.FP_VALUES.
    else if (sideId === 'A' && !q && window.ML_MY_PLAYER_IDS && window.ML_PLAYERS) {
      assets = window.ML_MY_PLAYER_IDS
        .map(pid => {
          const p = window.ML_PLAYERS[pid];
          if (!p) return null;
          const name = p.full_name || ((p.first_name||'') + ' ' + (p.last_name||'')).trim();
          const ktc = mlGetValueByName(name);
          if (!ktc) return null;
          return { name, value: mlFpValue(ktc, window.ML_LEAGUE_ID), pos: p.position, type: 'player', isMine: true };
        })
        .filter(Boolean)
        .filter(a => !taken.has(a.name))
        .sort(_cmp);
    } else {
      // All FP-tracked players + picks
      assets = Object.entries(window.FP_VALUES)
        .map(([name, d]) => ({ name, value: d.value, pos: d.posRank ? d.posRank.replace(/\d+/g,'') : 'WR', type: 'player' }))
        .filter(a => !taken.has(a.name))
        .filter(a => !q || a.name.toLowerCase().includes(q))
        .sort(_cmp)
        .slice(0, 60);
    }

    if (!assets.length) {
      resultsEl.innerHTML = `<div class="ml-calc-search-item ml-calc-search-empty">No matches</div>`;
      resultsEl.classList.add('open');
      return;
    }
    resultsEl.innerHTML = assets.map(a => `
      <div class="ml-calc-search-item" onmousedown="mlCalcAdd('${sideId}',${JSON.stringify(a).replace(/"/g,'&quot;')})">
        ${_mlCalcThumb(a)}<span class="ml-calc-asset-pos pos-${(a.pos || 'wr').toLowerCase()}">${a.pos}</span>
        <span class="ml-calc-asset-name">${a.name}${a.isMine ? ' <span class="ml-calc-yours-tag">YOURS</span>' : ''}</span>
        <span class="ml-calc-asset-val">${(a.value || 0).toLocaleString()}</span>
      </div>
    `).join('');
    resultsEl.classList.add('open');
  }, 80);
}

function mlCalcHideResults(sideId) {
  const el = document.getElementById(`ml-calc-results-${sideId}`);
  if (el) el.classList.remove('open');
}

function mlCalcAdd(sideId, asset) {
  MLCALC.sides[sideId].push({ name: asset.name, value: asset.value, pos: asset.pos, type: asset.type });
  const inp = document.getElementById(`ml-calc-search-${sideId}`);
  if (inp) inp.value = '';
  mlCalcHideResults(sideId);
  renderCalcModal();
}

function mlCalcRemove(sideId, idx) {
  MLCALC.sides[sideId].splice(idx, 1);
  renderCalcModal();
}

  // ── expose inline-handler / entry functions (modal HTML + cross-page calls use them) ──
  global.openCalcModal = openCalcModal;
  global.closeCalcModal = closeCalcModal;
  global.openTradeSuggestModal = openTradeSuggestModal;
  global.openTradeSuggestModalForPick = openTradeSuggestModalForPick;
  global.closeTradeSuggestModal = closeTradeSuggestModal;
  global.mlCalcSearch = mlCalcSearch;
  global.mlCalcHideResults = mlCalcHideResults;
  global.mlCalcAdd = mlCalcAdd;
  global.mlCalcRemove = mlCalcRemove;
  global.mltbReject = mltbReject;
  global.mltbAccept = mltbAccept;
  global.mltbOpenCalculatorBlank = mltbOpenCalculatorBlank;
  // The builder state object is read cross-page (e.g. _fptsXpageMlTsToDb hand-off).
  global.MLTB = MLTB;
  // Roster-ownership resolver — also used by My Leagues' player-panel status block
  // (_mlBuildStatusBlock), so it must be reachable from the host page too.
  global.mlGetPlayerStatus = mlGetPlayerStatus;

  // ── public API ──
  global.TradeCalc = {
    init: function (c) { cfg = c || {}; },
    openCalc: openCalcModal,
    closeCalc: closeCalcModal,
    openBuilder: openTradeSuggestModal,
    openBuilderForPick: openTradeSuggestModalForPick,
    closeBuilder: closeTradeSuggestModal
  };
})(window);
