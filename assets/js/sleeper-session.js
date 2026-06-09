/* ============================================================================
 * sleeper-session.js  —  window.SLEEPER_SESSION
 * ----------------------------------------------------------------------------
 * A lean, self-contained Sleeper login + cross-league trade fetcher, written
 * for the trade calculator's "Find comparable real trades" feature.
 *
 * WHY THIS EXISTS (and why it does NOT just import my-leagues.html):
 *   The full login + cross-league trade machinery lives INLINE in
 *   my-leagues.html (~8000 lines, deeply coupled to ML.* / ML_ALL_LEAGUE_DATA /
 *   the exposure pipeline). Lifting it would be a destructive refactor of a
 *   working page. Instead this module re-implements only the slice the
 *   calculator needs — login, league discovery, the previous_league_id walk,
 *   and the transactions sweep — REUSING THE SAME localStorage keys so a
 *   session started on My Leagues (or live-draft) auto-restores here with no
 *   coordination. The duplicated surface is small and shallow.
 *
 *   FUTURE (non-blocking): if drift becomes a concern, my-leagues.html could be
 *   migrated to consume this module. Not required for the feature to ship.
 *
 * PUBLIC API (window.SLEEPER_SESSION):
 *   restore()                       -> {username,userId,displayName,avatar}|null  (no network)
 *   login(username)                 -> Promise<sessionObj>  (throws 'User not found')
 *   signOut()                       -> void
 *   avatarUrl(avatarId)             -> string  (CDN thumb url; null avatar -> placeholder)
 *   fetchMyTrades(userId[, opts])   -> Promise<{years, byYear:{year:[{t,ctx}]}, activeIdx}>
 *
 * fetchMyTrades returns the SAME shape my-leagues' mlEnsureMyTrades builds, so
 * each entry's { t, ctx } feeds a trade-card / normalizer unchanged. Result is
 * cached on window.CALC_MY_TRADES (clear it / pass {force:true} to rebuild).
 * ==========================================================================*/
(function (global) {
  'use strict';

  var API = 'https://api.sleeper.app/v1';
  var CDN = 'https://sleepercdn.com';
  var CURRENT_YEAR = new Date().getFullYear();

  // Shared with my-leagues.html + live-draft.html — DO NOT rename.
  var LS = {
    USERNAME: 'fpts-sleeper-username',
    USER_ID:  'fpts-sleeper-user-id',
    DISPLAY:  'fpts-sleeper-display-name',
    AVATAR:   'fpts-sleeper-avatar',
  };

  function apiFetch(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function _lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function _lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function _lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }

  function avatarUrl(avatar) {
    return avatar ? (CDN + '/avatars/thumbs/' + avatar)
                  : (CDN + '/avatars/thumbs/avatar_null');
  }

  // Read the cached session without any network round-trip. Mirrors
  // mlAutoRestoreSession's gate: username + userId are the minimum required.
  function restore() {
    var username = _lsGet(LS.USERNAME);
    var userId   = _lsGet(LS.USER_ID);
    if (!username || !userId) return null;
    return {
      username: username,
      userId: userId,
      displayName: _lsGet(LS.DISPLAY) || username,
      avatar: _lsGet(LS.AVATAR) || null,
    };
  }

  // Resolve a Sleeper username -> user, persist, return the session object.
  function login(username) {
    username = (username || '').trim();
    if (!username) return Promise.reject(new Error('Enter a Sleeper username'));
    return apiFetch(API + '/user/' + encodeURIComponent(username)).then(function (user) {
      if (!user || !user.user_id) throw new Error('User not found');
      _lsSet(LS.USERNAME, user.username || '');
      _lsSet(LS.USER_ID,  user.user_id || '');
      _lsSet(LS.DISPLAY,  user.display_name || user.username || '');
      if (user.avatar) _lsSet(LS.AVATAR, user.avatar); else _lsDel(LS.AVATAR);
      return {
        username: user.username,
        userId: user.user_id,
        displayName: user.display_name || user.username,
        avatar: user.avatar || null,
      };
    });
  }

  function signOut() {
    _lsDel(LS.USERNAME); _lsDel(LS.USER_ID); _lsDel(LS.DISPLAY); _lsDel(LS.AVATAR);
    global.CALC_MY_TRADES = null;
  }

  // ── Players DB (lazy, cached once per page) ──────────────────────────────
  var _playersCache = null, _playersPromise = null;
  function getPlayers() {
    if (_playersCache) return Promise.resolve(_playersCache);
    if (_playersPromise) return _playersPromise;
    _playersPromise = apiFetch(API + '/players/nfl').then(function (data) {
      _playersCache = data || {};
      return _playersCache;
    });
    return _playersPromise;
  }

  // Current-season dynasty leagues for this user (active only). Mirrors
  // my-leagues' loadLeaguesForSeason filter.
  function _loadLeagues(userId, year) {
    return apiFetch(API + '/user/' + userId + '/leagues/nfl/' + year).then(function (leagues) {
      var active = (leagues || []).filter(function (l) { return (l.status || '') !== 'complete'; });
      var dynasty = active.filter(function (l) {
        return l.season_type === 'dynasty'
          || (l.settings && l.settings.type === 2)
          || (l.name && l.name.toLowerCase().indexOf('dynasty') >= 0);
      });
      return dynasty.length ? dynasty : active;
    }).catch(function () { return []; });
  }

  // ── Cross-league "My Trades" — every trade the user was a side of ────────
  // Self-contained port of mlEnsureMyTrades (my-leagues.html ~8140). Returns
  // { years, byYear:{ season: [{ t, ctx }] }, activeIdx } and caches it on
  // window.CALC_MY_TRADES.
  var _tradesPromise = null;
  function fetchMyTrades(userId, opts) {
    opts = opts || {};
    if (global.CALC_MY_TRADES && !opts.force) return Promise.resolve(global.CALC_MY_TRADES);
    if (_tradesPromise && !opts.force) return _tradesPromise;

    _tradesPromise = (function () {
      var playersP = getPlayers();
      var leaguesP = _loadLeagues(userId, opts.currentYear || CURRENT_YEAR);

      return Promise.all([playersP, leaguesP]).then(function (res) {
        var players = res[0], leagues = res[1];

        // 1) Build (leagueId, season, name) nodes by walking each current
        //    league's previous_league_id chain (<=10 back, season >= 2017).
        var nodes = [];
        var seen = {};
        return Promise.all(leagues.map(function (lg) {
          var baseName   = lg.name || 'League';
          var baseSeason = String(lg.season || (opts.currentYear || CURRENT_YEAR));
          if (!seen[lg.league_id]) { seen[lg.league_id] = 1; nodes.push({ leagueId: lg.league_id, season: baseSeason, name: baseName }); }
          var prevId = lg.previous_league_id;
          var prevSeason = parseInt(baseSeason, 10) - 1;
          var guard = 0;
          function step() {
            if (!prevId || prevSeason < 2017 || guard >= 10) return Promise.resolve();
            return apiFetch(API + '/league/' + prevId).then(function (prev) {
              if (!prev) return;
              if (!seen[prevId]) {
                seen[prevId] = 1;
                nodes.push({ leagueId: prevId, season: String(prev.season || prevSeason), name: prev.name || baseName });
              }
              prevId = prev.previous_league_id;
              prevSeason = parseInt(prev.season || prevSeason, 10) - 1;
              guard++;
              return step();
            }).catch(function () { /* stop the chain */ });
          }
          return step();
        })).then(function () {

          // 2) For each node fetch rosters/users + all-week transactions,
          //    keep only trades the user's roster was a side of.
          var byYear = {};
          return Promise.all(nodes.map(function (node) {
            return Promise.all([
              apiFetch(API + '/league/' + node.leagueId + '/rosters').catch(function () { return []; }),
              apiFetch(API + '/league/' + node.leagueId + '/users').catch(function () { return []; }),
            ]).then(function (ru) {
              var rosters = ru[0] || [], users = ru[1] || [];
              var myRoster = rosters.find(function (r) { return String(r.owner_id) === String(userId); });
              if (!myRoster) return; // user wasn't in this historic league
              var myRosterId = myRoster.roster_id;

              var rosterToTeam = {};
              rosters.forEach(function (r) {
                var u = users.find(function (u) { return u.user_id === r.owner_id; });
                rosterToTeam[r.roster_id] = u
                  ? ((u.metadata && u.metadata.team_name) || u.display_name || u.username)
                  : ('Team ' + r.roster_id);
              });
              var userToName = {};
              users.forEach(function (u) { userToName[u.user_id] = (u.metadata && u.metadata.team_name) || u.display_name || u.username; });

              var weeks = [];
              for (var w = 1; w <= 18; w++) {
                weeks.push(apiFetch(API + '/league/' + node.leagueId + '/transactions/' + w).catch(function () { return []; }));
              }
              return Promise.all(weeks).then(function (weekData) {
                var trades = [].concat.apply([], weekData).filter(function (t) {
                  return t && t.type === 'trade' && t.status === 'complete'
                    && (t.roster_ids || []).indexOf(myRosterId) >= 0;
                });
                if (!trades.length) return;
                var ctx = { players: players, rosters: rosters, rosterToTeam: rosterToTeam, userToName: userToName, myRosterId: myRosterId, leagueId: node.leagueId, leagueName: node.name };
                (byYear[node.season] = byYear[node.season] || []).push.apply(byYear[node.season], trades.map(function (t) { return { t: t, ctx: ctx }; }));
              });
            }).catch(function () { /* skip node */ });
          })).then(function () {
            Object.keys(byYear).forEach(function (y) {
              byYear[y].sort(function (a, b) { return b.t.status_updated - a.t.status_updated; });
            });
            var years = Object.keys(byYear).sort(function (a, b) { return Number(b) - Number(a); });
            global.CALC_MY_TRADES = { years: years, byYear: byYear, activeIdx: 0 };
            return global.CALC_MY_TRADES;
          });
        });
      }).catch(function (e) {
        if (global.console && console.warn) console.warn('SLEEPER_SESSION.fetchMyTrades failed', e);
        global.CALC_MY_TRADES = { years: [], byYear: {}, activeIdx: 0 };
        return global.CALC_MY_TRADES;
      }).then(function (out) { _tradesPromise = null; return out; });
    })();

    return _tradesPromise;
  }

  global.SLEEPER_SESSION = {
    restore: restore,
    login: login,
    signOut: signOut,
    avatarUrl: avatarUrl,
    getPlayers: getPlayers,
    fetchMyTrades: fetchMyTrades,
  };
})(window);
