/* ════════════════════════════════════════════════════════════════════════
   ADMIN-TIERS — device-local tier + Buy/Sell/Hold editor (Tier 1 scope)
   ════════════════════════════════════════════════════════════════════════

   What this is
   ------------
   A scratchpad for the admin to override the tier / B/S/H / trending fields
   stored in data/tiers.json (the FPTS Google Sheet mirror) WITHOUT round-
   tripping through the Sheet sync. Overrides live in this device's
   localStorage only — other devices and regular site visitors see nothing.

   Workflow
   --------
   1. Visit any page with `?admin=1` once. The flag becomes sticky in
      localStorage (`fpts-admin-mode=true`); the URL param is then removed
      via history.replaceState so the link looks clean.
   2. Open `tiers.html`. The admin banner appears at the top, plus a small
      ✎ pencil next to every tier badge in the table.
   3. Click any pencil → small popover with tier dropdown / B/S/H dropdown
      / trending text field. Save mutates window.TIERS_DATA in place AND
      writes the override to localStorage (`fpts-tier-overrides`).
      data-bootstrap.js re-applies overrides on every future page load.
   4. Compare.html (and any future TIERS_DATA consumer) shows the overridden
      tier/B/S/H badge on subsequent visits — the merge happens inside
      data-bootstrap.js after fetching tiers.json.
   5. When ready to publish: click "Copy as JSON" in the banner, paste into
      Google Sheet. After the next push.bat run regenerates data/tiers.json,
      clear local overrides via the banner button.
   6. Disable admin mode by visiting `?admin=0` or clicking "Disable admin"
      in the banner.

   Security model
   --------------
   This is security-through-URL-obscurity: anyone who guesses or shares
   `?admin=1` can edit on their own device. No tampering with what other
   visitors see (overrides are device-local). For a personal-tool static
   site, this is the right tradeoff vs adding a backend.

   Hard guarantee: when admin mode is OFF (default), this module renders
   nothing. The data-bootstrap.js override-merge step still runs but is a
   no-op when no overrides exist in localStorage.
   ════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var STORAGE_KEY_MODE      = 'fpts-admin-mode';
  var STORAGE_KEY_OVERRIDES = 'fpts-tier-overrides';
  // GitHub publish settings (Phase 1b). PAT lives in localStorage on this
  // device only. Repo / branch / path can be edited via the Settings panel
  // and default to elnostrathomas/FPTS-Trade_Database main + the canonical
  // tier CSV path. Token security: localStorage is per-origin (only this
  // site can read), token is sensitive — if the device is shared, clear it
  // via the Settings panel's "Clear token" button.
  var STORAGE_KEY_GH_TOKEN  = 'fpts-admin-gh-token';
  var STORAGE_KEY_GH_REPO   = 'fpts-admin-gh-repo';
  var STORAGE_KEY_GH_BRANCH = 'fpts-admin-gh-branch';
  var STORAGE_KEY_GH_PATH   = 'fpts-admin-gh-path';
  var DEFAULT_GH_REPO   = 'elnostrathomas/FPTS-Trade_Database';
  var DEFAULT_GH_BRANCH = 'main';
  var DEFAULT_GH_PATH   = 'data/source/tiers/tiers.csv';

  var TIERS = ['S++','S+','S','A+','A','A-','B+','B','B-','C+','C','C-','D+','D','D-','E+','E','E-','F+','F','F-'];
  // 5 + empty for Buy/Sell/Hold (mirrors bshChipHtml in tiers.html)
  var BSHS  = ['', 'buying', 'checking', 'selling', 'shopping', 'hold'];
  // 5 priority levels — Top Target = active acquire, Avoid = active divest.
  // Saved as the exact display label so priorityChipHtml renders without
  // mapping.
  var PRIORITIES = ['', 'Top Target', 'High', 'Medium', 'Low', 'Avoid'];
  // 5 team-archetype buckets, same vocabulary as my-leagues' team archetype
  // classifier (mlGetArchetype) for cross-page consistency.
  var CONTENDERS = ['', 'Dynasty', 'Contender', 'Tweener', 'Rebuilder', 'Emergency'];
  // Trending field: 3 states (none / up / down). Saved as codes 'up'/'down'
  // so the renderer can swap between the avatar PNG (up) and a CSS chevron
  // (down) without parsing emoji. Legacy values (📈/📉/Rookie/etc. from
  // TAT imports) auto-map to up/down/empty at read time — see
  // _trendingNormalize().
  var TRENDINGS = ['', 'up', 'down'];
  var TRENDING_LABELS = { '': '— none —', 'up': 'Trending Up ↑', 'down': 'Trending Down ▼' };

  // Map any legacy trending value to the canonical code. Anything not
  // recognized -> ''. Keeps the dropdown's "selected" state correct when
  // older data was stored as 📈 / 📉 / freeform text.
  function _trendingNormalize(v) {
    if (!v) return '';
    var s = String(v).trim();
    if (s === 'up'   || s === '📈' || s === '↑' || s === '▲') return 'up';
    if (s === 'down' || s === '📉' || s === '↓' || s === '▼') return 'down';
    return '';   // unrecognized (Rookie/Sophomore/etc.) drops to none
  }

  // ── Password gate ───────────────────────────────────────────────────────
  // SHA-256 hex of the admin password. Generated via the ?admin=hash setup
  // flow. Empty string = no password configured (admin mode CANNOT be
  // activated until you set one). Stored in committed source so only the
  // repo owner can change it. Anyone reading the public JS sees this hash
  // but can't trivially reverse it — pick a strong password (12+ chars,
  // mixed) and dictionary attacks are infeasible. The "real" security
  // boundary is the GitHub PAT (when Path B publish ships in Phase 1b);
  // this gate's job is preventing public visitors from even seeing the
  // editor UI.
  var PASSWORD_HASH = 'f59049ad3f53ad49c66101ef8c1b295d9dc8cd431cfcdbc7236c341e81054de9';

  async function hashPassword(pw) {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error('WebCrypto unavailable — admin mode requires HTTPS (or localhost).');
    }
    var bytes = new TextEncoder().encode(String(pw == null ? '' : pw));
    var buf = await window.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(buf))
      .map(function (b) { return b.toString(16).padStart(2, '0'); })
      .join('');
  }

  // ── Activation handling ────────────────────────────────────────────────
  // URL flags:
  //   ?admin=1    -> prompt for password; on match, sticky-activate
  //   ?admin=0    -> disable + clear localStorage flag (no password needed)
  //   ?admin=hash -> setup helper. Prompts for a NEW password, computes
  //                  SHA-256, displays it for you to paste into the
  //                  PASSWORD_HASH constant above. One-time setup.
  async function _handleUrlParam() {
    var url;
    try { url = new URL(window.location.href); } catch (e) { return; }
    var p = url.searchParams.get('admin');
    if (!p) return;
    // Always strip the param from the visible URL so the secret never sits
    // in the address bar / history / screenshots.
    url.searchParams.delete('admin');
    try { history.replaceState(null, '', url.toString()); } catch (e) {}

    if (p === '0') {
      try { localStorage.removeItem(STORAGE_KEY_MODE); } catch (e) {}
      return;
    }

    if (p === 'hash') {
      var pw = window.prompt('Enter a NEW admin password to hash:\n\n(The hash will be displayed for you to paste into\nassets/js/admin-tiers.js PASSWORD_HASH constant.)');
      if (!pw) return;
      try {
        var hex = await hashPassword(pw);
        // window.prompt with a 2nd-arg default pre-fills the input box,
        // making it trivially copyable on every platform.
        window.prompt(
          'Paste this hex into admin-tiers.js PASSWORD_HASH (then push.bat):',
          hex
        );
      } catch (e) {
        window.alert('Hash failed: ' + e.message);
      }
      return;
    }

    if (p === '1') {
      // Already-active sessions skip the prompt (sticky localStorage).
      if (isActive()) return;
      if (!PASSWORD_HASH) {
        window.alert('Admin mode is not yet set up.\n\nVisit any page with ?admin=hash to generate a password hash, paste it into assets/js/admin-tiers.js PASSWORD_HASH, then push.bat.');
        return;
      }
      var entered = window.prompt('Admin password:');
      if (entered === null) return;
      try {
        var enteredHash = await hashPassword(entered);
        if (enteredHash === PASSWORD_HASH) {
          try { localStorage.setItem(STORAGE_KEY_MODE, 'true'); } catch (e) {}
        } else {
          window.alert('Wrong password.');
        }
      } catch (e) {
        window.alert('Auth failed: ' + e.message);
      }
    }
  }

  function isActive() {
    try { return localStorage.getItem(STORAGE_KEY_MODE) === 'true'; } catch (e) { return false; }
  }

  // ── Override read/write ─────────────────────────────────────────────────
  function _readOverrides() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY_OVERRIDES);
      return raw ? (JSON.parse(raw) || {}) : {};
    } catch (e) { return {}; }
  }
  function _writeOverrides(map) {
    try {
      if (!map || !Object.keys(map).length) {
        localStorage.removeItem(STORAGE_KEY_OVERRIDES);
      } else {
        localStorage.setItem(STORAGE_KEY_OVERRIDES, JSON.stringify(map));
      }
    } catch (e) {}
  }
  function _overrideCount() {
    return Object.keys(_readOverrides()).length;
  }

  // Apply a single-player override + mutate live TIERS_DATA so the page
  // reflects the change without a reload. Fires 'fpts:tiers-overrides-changed'
  // so consumers (tiers.html, compare.html when open in another tab) can
  // re-render.
  function saveOverride(name, patch) {
    if (!name || !patch) return;
    var map = _readOverrides();
    var existing = map[name] || {};
    var merged = Object.assign({}, existing, patch);
    // Trim empty-string fields so the stored override stays compact.
    Object.keys(merged).forEach(function (k) {
      if (merged[k] === '' || merged[k] == null) delete merged[k];
    });
    if (Object.keys(merged).length === 0) {
      delete map[name];
    } else {
      map[name] = merged;
    }
    _writeOverrides(map);
    _applyOverrideToLive(name, merged);
    _fireChanged();
    _refreshBanner();
  }

  function clearOverride(name) {
    var map = _readOverrides();
    if (!(name in map)) return;
    delete map[name];
    _writeOverrides(map);
    // Restore live TIERS_DATA[name] from the original tiers.json. Since we
    // don't keep a clean copy, simplest restore = page reload. Alternative:
    // re-fetch tiers.json. Reload is the honest path.
    _fireChanged();
    _refreshBanner();
  }

  function clearAllOverrides() {
    _writeOverrides({});
    _fireChanged();
    _refreshBanner();
  }

  function _applyOverrideToLive(name, merged) {
    if (!window.TIERS_DATA) return;
    var base = window.TIERS_DATA[name] || {
      tier: '', trending: '', buySell: '', priority: '', contender: '', notes: '',
    };
    window.TIERS_DATA[name] = Object.assign({}, base, merged, { _override: true });
    if (window.TIERS_BY_NORM && typeof window.normalizePlayerName === 'function') {
      window.TIERS_BY_NORM[window.normalizePlayerName(name)] = window.TIERS_DATA[name];
    }
  }

  function _fireChanged() {
    try {
      document.dispatchEvent(new CustomEvent('fpts:tiers-overrides-changed', {
        detail: { count: _overrideCount() },
      }));
    } catch (e) {}
  }

  // ── Export ──────────────────────────────────────────────────────────────
  function exportToClipboard() {
    var map = _readOverrides();
    var lines = ['Tier overrides (paste into Google Sheet):', ''];
    Object.keys(map).sort().forEach(function (n) {
      var rec = map[n];
      var bits = [];
      if (rec.tier)     bits.push('tier=' + rec.tier);
      if (rec.buySell)  bits.push('buySell=' + rec.buySell);
      if (rec.trending) bits.push('trending=' + rec.trending);
      lines.push('  ' + n + ' → ' + bits.join(' · '));
    });
    lines.push('');
    lines.push('--- Raw JSON ---');
    lines.push(JSON.stringify(map, null, 2));
    var text = lines.join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { _flashBanner('Copied ' + Object.keys(map).length + ' overrides to clipboard.'); },
        function () { _fallbackCopy(text); }
      );
    } else {
      _fallbackCopy(text);
    }
  }
  function _fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); _flashBanner('Copied (fallback).'); }
    catch (e) { _flashBanner('Copy failed — see console.'); console.log(text); }
    document.body.removeChild(ta);
  }

  // ══════════════════════════════════════════════════════════════════════
  // Phase 1b — Settings panel + Publish to GitHub
  // ══════════════════════════════════════════════════════════════════════

  // ── GitHub Settings storage ─────────────────────────────────────────────
  function _ghSettings() {
    function _get(k, fallback) {
      try { return localStorage.getItem(k) || fallback; } catch (e) { return fallback; }
    }
    return {
      token:  _get(STORAGE_KEY_GH_TOKEN,  ''),
      repo:   _get(STORAGE_KEY_GH_REPO,   DEFAULT_GH_REPO),
      branch: _get(STORAGE_KEY_GH_BRANCH, DEFAULT_GH_BRANCH),
      path:   _get(STORAGE_KEY_GH_PATH,   DEFAULT_GH_PATH),
    };
  }
  function _ghSettingsSave(token, repo, branch, path) {
    try {
      if (token) localStorage.setItem(STORAGE_KEY_GH_TOKEN, token);
      else       localStorage.removeItem(STORAGE_KEY_GH_TOKEN);
      localStorage.setItem(STORAGE_KEY_GH_REPO,   repo   || DEFAULT_GH_REPO);
      localStorage.setItem(STORAGE_KEY_GH_BRANCH, branch || DEFAULT_GH_BRANCH);
      localStorage.setItem(STORAGE_KEY_GH_PATH,   path   || DEFAULT_GH_PATH);
    } catch (e) {}
  }
  function _ghReady() {
    var s = _ghSettings();
    return !!(s.token && s.repo && s.branch && s.path);
  }

  // ── CSV generation (Sheet-format, 7 cols, overrides baked in) ──────────
  // Walks live TIERS_DATA (already merged with localStorage overrides via
  // data-bootstrap) and emits a Sheet-format CSV that sync-tiers.py parses
  // via the header-aware map_rows path. Matches the same columns the user
  // would export from the Google Sheet.
  function _buildOverriddenCsv() {
    var TIER_ORDER = ['S++','S+','S','A+','A','A-','B+','B','B-','C+','C','C-','D+','D','D-','E+','E','E-','F+','F','F-'];
    function tierRank(t) { var i = TIER_ORDER.indexOf(t); return i >= 0 ? i : 99; }
    function esc(v) {
      var s = (v == null) ? '' : String(v);
      if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    }
    var headers = ['Tier','Player','Trending','Buy/Sell/Hold','Priority Level','Contender/Rebuild','Player Notes'];
    var data = window.TIERS_DATA || {};
    var names = Object.keys(data).filter(function (n) { return data[n] && data[n].tier; });
    names.sort(function (a, b) {
      var ta = tierRank(data[a].tier), tb = tierRank(data[b].tier);
      if (ta !== tb) return ta - tb;
      return a.toLowerCase().localeCompare(b.toLowerCase());
    });
    var lines = [headers.map(esc).join(',')];
    names.forEach(function (n) {
      var r = data[n];
      lines.push([
        esc(r.tier || ''),
        esc(n),
        esc(r.trending || ''),
        esc(r.buySell || ''),
        esc(r.priority || ''),
        esc(r.contender || ''),
        esc(r.notes || ''),
      ].join(','));
    });
    return lines.join('\r\n') + '\r\n';
  }

  // ── GitHub Contents API ────────────────────────────────────────────────
  // UTF-8-safe base64 (btoa alone breaks on multi-byte chars like emojis).
  function _utf8Btoa(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }
  function _ghHeaders(token) {
    return {
      'Authorization': 'Bearer ' + token,
      'Accept':        'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
  }
  // Fetch current file → returns { sha, content } or throws with a
  // human-readable error keyed off the HTTP status.
  function _ghGetFile(s) {
    var url = 'https://api.github.com/repos/' + s.repo + '/contents/' + encodeURI(s.path) + '?ref=' + encodeURIComponent(s.branch);
    return fetch(url, { headers: _ghHeaders(s.token) }).then(function (r) {
      if (r.status === 404) {
        // File doesn't exist yet — PUT will create it. Return null SHA.
        return { sha: null, content: '' };
      }
      if (!r.ok) {
        return r.json().then(function (j) {
          throw new Error('GitHub GET ' + r.status + ': ' + (j && j.message ? j.message : r.statusText));
        }, function () {
          throw new Error('GitHub GET ' + r.status + ' ' + r.statusText);
        });
      }
      return r.json().then(function (j) { return { sha: j.sha, content: j.content || '' }; });
    });
  }
  function _ghPutFile(s, csvContent, currentSha, commitMessage) {
    var url = 'https://api.github.com/repos/' + s.repo + '/contents/' + encodeURI(s.path);
    var body = {
      message: commitMessage,
      content: _utf8Btoa(csvContent),
      branch:  s.branch,
    };
    if (currentSha) body.sha = currentSha;
    return fetch(url, {
      method: 'PUT',
      headers: Object.assign({ 'Content-Type': 'application/json' }, _ghHeaders(s.token)),
      body:    JSON.stringify(body),
    }).then(function (r) {
      if (!r.ok) {
        return r.json().then(function (j) {
          var msg = (j && j.message) ? j.message : r.statusText;
          if (r.status === 401) msg = 'Invalid PAT (401). Re-paste your token in Settings.';
          else if (r.status === 403) msg = 'PAT missing Contents: write permission (403). Regenerate with fine-grained scope on this repo.';
          else if (r.status === 404) msg = 'Repo or file path not found (404). Check Settings.';
          else if (r.status === 409) msg = 'File changed on server (409). Reload page to fetch the latest, then re-publish.';
          else if (r.status === 422) msg = 'GitHub rejected the PUT (422): ' + msg;
          throw new Error(msg);
        }, function () {
          throw new Error('GitHub PUT ' + r.status + ' ' + r.statusText);
        });
      }
      return r.json();
    });
  }

  // ── Publish flow ───────────────────────────────────────────────────────
  function publishToGitHub() {
    var s = _ghSettings();
    if (!_ghReady()) {
      window.alert('GitHub PAT not configured. Click the ⚙ Settings button in the admin banner first.');
      return Promise.resolve(null);
    }
    var n = _overrideCount();
    var commitMessage = 'admin: tier edits via web UI (' + n + ' override' + (n === 1 ? '' : 's') + ')';
    var csv = _buildOverriddenCsv();

    _publishSetState('publishing');
    return _ghGetFile(s).then(function (existing) {
      return _ghPutFile(s, csv, existing.sha, commitMessage);
    }).then(function (commit) {
      var commitUrl = (commit && commit.commit && commit.commit.html_url) || '';
      // Auto-clear localStorage overrides — they're now baked into the
      // canonical file. Page reloads after publish so the next render
      // reads the fresh data without stale-override merges.
      _writeOverrides({});
      _flashBanner('Published! ' + (commitUrl ? 'View commit · ' : '') + 'GitHub Pages rebuilds in ~30-60s.');
      _publishSetState('idle');
      // Brief delay so the user sees the success message, then reload.
      setTimeout(function () { window.location.reload(); }, 1500);
      return commit;
    }).catch(function (err) {
      console.error('[admin-tiers] publish failed:', err);
      window.alert('Publish failed:\n\n' + err.message);
      _publishSetState('idle');
      return null;
    });
  }
  function _publishSetState(state) {
    var btn = document.getElementById('fpts-admin-banner-publish');
    if (!btn) return;
    if (state === 'publishing') {
      btn.disabled = true;
      btn.textContent = 'Publishing…';
      btn.style.opacity = '.65';
    } else {
      btn.disabled = false;
      btn.textContent = 'Publish ⬆';
      btn.style.opacity = '1';
    }
  }

  // ── Settings modal ─────────────────────────────────────────────────────
  function _openSettings() {
    var s = _ghSettings();
    var backdrop = document.createElement('div');
    backdrop.id = 'fpts-admin-settings-backdrop';
    Object.assign(backdrop.style, {
      position: 'fixed', inset: '0', zIndex: '220',
      background: 'rgba(0,0,0,.65)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    });
    var modal = document.createElement('div');
    Object.assign(modal.style, {
      background: 'var(--surface)', border: '2px solid var(--red)',
      padding: '20px', minWidth: '420px', maxWidth: '560px',
      fontFamily: "'Mulish', sans-serif", fontSize: '12px',
      color: 'var(--white)', boxShadow: '0 8px 32px rgba(0,0,0,.6)',
    });
    var inputStyle = "width:100%;margin-top:4px;background:var(--surface2);color:var(--white);border:1px solid var(--border);padding:7px;font-family:'Mulish',sans-serif;font-size:12px";
    modal.innerHTML = ''
      + '<div style="font-family:\'Kanit\',sans-serif;font-weight:800;font-style:italic;font-size:16px;color:var(--red);text-transform:uppercase;letter-spacing:.04em;margin-bottom:14px">GitHub Publish Settings</div>'
      + '<div style="font-size:11px;opacity:.65;margin-bottom:14px;line-height:1.4">PAT scope needs <b>Contents: Read &amp; write</b> on this repo only. <a href="https://github.com/settings/tokens?type=beta" target="_blank" style="color:var(--red)">Create fine-grained token →</a></div>'
      + '<label style="display:block;margin-bottom:12px">GitHub Personal Access Token'
      +   '<input id="fpts-adm-gh-token" type="password" autocomplete="off" placeholder="github_pat_..." value="' + (s.token || '').replace(/"/g, '&quot;') + '" style="' + inputStyle + '">'
      + '</label>'
      + '<label style="display:block;margin-bottom:12px">Repository (<code style="font-family:monospace">owner/name</code>)'
      +   '<input id="fpts-adm-gh-repo" type="text" value="' + s.repo + '" style="' + inputStyle + '">'
      + '</label>'
      + '<label style="display:block;margin-bottom:12px">Branch'
      +   '<input id="fpts-adm-gh-branch" type="text" value="' + s.branch + '" style="' + inputStyle + '">'
      + '</label>'
      + '<label style="display:block;margin-bottom:16px">File path'
      +   '<input id="fpts-adm-gh-path" type="text" value="' + s.path + '" style="' + inputStyle + '">'
      + '</label>'
      + '<div style="display:flex;gap:8px">'
      +   '<button type="button" id="fpts-adm-settings-save" style="flex:1;background:var(--red);color:#111;border:none;padding:8px;font-family:\'Kanit\',sans-serif;font-weight:800;font-style:italic;font-size:12px;text-transform:uppercase;letter-spacing:.06em;cursor:pointer">Save</button>'
      +   '<button type="button" id="fpts-adm-settings-clear-token" style="background:transparent;color:var(--white);border:1px solid var(--border2);padding:8px 12px;font-family:\'Kanit\',sans-serif;font-weight:800;font-style:italic;font-size:11px;text-transform:uppercase;letter-spacing:.06em;cursor:pointer">Clear token</button>'
      +   '<button type="button" id="fpts-adm-settings-cancel" style="background:transparent;color:var(--white);border:1px solid var(--border2);padding:8px 12px;font-family:\'Kanit\',sans-serif;font-weight:800;font-style:italic;font-size:11px;text-transform:uppercase;letter-spacing:.06em;cursor:pointer">Cancel</button>'
      + '</div>'
      + '<div style="margin-top:12px;font-size:10px;opacity:.55;line-height:1.4">Token stored in this device\'s localStorage only. Public site visitors don\'t see it. Clear via the button if the device is shared or you suspect leakage.</div>';
    backdrop.appendChild(modal);
    document.documentElement.appendChild(backdrop);

    function close() { if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop); }
    document.getElementById('fpts-adm-settings-cancel').addEventListener('click', close);
    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) close(); });
    document.getElementById('fpts-adm-settings-clear-token').addEventListener('click', function () {
      if (!confirm('Clear the saved GitHub token? (Other settings stay.)')) return;
      try { localStorage.removeItem(STORAGE_KEY_GH_TOKEN); } catch (e) {}
      document.getElementById('fpts-adm-gh-token').value = '';
      _refreshBanner();
      _flashBanner('Token cleared.');
    });
    document.getElementById('fpts-adm-settings-save').addEventListener('click', function () {
      var token  = document.getElementById('fpts-adm-gh-token').value || '';
      var repo   = document.getElementById('fpts-adm-gh-repo').value || '';
      var branch = document.getElementById('fpts-adm-gh-branch').value || '';
      var path   = document.getElementById('fpts-adm-gh-path').value || '';
      _ghSettingsSave(token.trim(), repo.trim(), branch.trim(), path.trim());
      close();
      _refreshBanner();
      _flashBanner('Settings saved.');
    });
  }

  // ── Banner ──────────────────────────────────────────────────────────────
  var _banner = null;
  function _mountBanner() {
    if (_banner || !document.body) return;
    _banner = document.createElement('div');
    _banner.id = 'fpts-admin-banner';
    Object.assign(_banner.style, {
      position: 'fixed',
      top: '0', left: '0', right: '0',
      zIndex: '200',
      background: 'var(--red)',
      color: '#111',
      padding: '6px 14px',
      fontFamily: "'Mulish', sans-serif",
      fontSize: '12px',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,.35)',
      borderBottom: '2px solid #111',
    });
    var btnStyle    = "background:transparent;color:#111;border:1px solid #111;padding:4px 10px;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:11px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer";
    var publishStyle = "background:#111;color:var(--green);border:1px solid #111;padding:4px 12px;font-family:'Kanit',sans-serif;font-weight:800;font-style:italic;font-size:12px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer";
    _banner.innerHTML = ''
      + '<span style="font-family:\'Kanit\',sans-serif;font-style:italic;font-weight:800;font-size:13px;letter-spacing:.04em;text-transform:uppercase">ADMIN MODE</span>'
      + '<span id="fpts-admin-banner-count" style="opacity:.85"></span>'
      + '<span id="fpts-admin-banner-flash" style="margin-left:auto;font-style:italic;opacity:0;transition:opacity .2s"></span>'
      + '<button type="button" id="fpts-admin-banner-publish" style="' + publishStyle + '" title="Commit your overrides to data/source/tiers/tiers.csv via GitHub API. Publishes for everyone.">Publish ⬆</button>'
      + '<button type="button" id="fpts-admin-banner-settings" style="' + btnStyle + '" title="GitHub PAT + repo settings">⚙ Settings</button>'
      + '<button type="button" id="fpts-admin-banner-export" style="background:#111;color:var(--red);border:none;padding:4px 10px;font-family:\'Kanit\',sans-serif;font-weight:800;font-style:italic;font-size:11px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer">Copy as JSON</button>'
      + '<button type="button" id="fpts-admin-banner-clear" style="' + btnStyle + '">Clear all</button>'
      + '<button type="button" id="fpts-admin-banner-disable" style="background:transparent;color:#111;border:1px solid #111;padding:4px 10px;font-family:\'Kanit\',sans-serif;font-weight:800;font-style:italic;font-size:11px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer">Disable</button>';
    document.body.appendChild(_banner);
    // Push the page content down so the banner doesn't cover the topnav.
    document.body.style.paddingTop = (_banner.offsetHeight) + 'px';

    document.getElementById('fpts-admin-banner-export').addEventListener('click', exportToClipboard);

    // "Publish ⬆" — one-click commit to data/source/tiers/tiers.csv via the
    // GitHub Contents API. Reads PAT/repo/branch/path from localStorage
    // (set via the Settings modal). Auto-clears overrides on success +
    // reloads so the page reflects the canonical state.
    document.getElementById('fpts-admin-banner-publish').addEventListener('click', function () {
      var n = _overrideCount();
      if (!n) { _flashBanner('No overrides to publish.'); return; }
      if (!_ghReady()) {
        window.alert('GitHub PAT not configured. Click ⚙ Settings to set it.');
        return;
      }
      if (!confirm('Publish ' + n + ' override' + (n === 1 ? '' : 's') +
                   ' to data/source/tiers/tiers.csv via GitHub?\n\n' +
                   'This commits + pushes immediately. GitHub Pages rebuilds in ~30-60s.')) return;
      publishToGitHub();
    });

    document.getElementById('fpts-admin-banner-settings').addEventListener('click', _openSettings);

    // "Clear all" — wipes overrides AND auto-reloads so the user sees the
    // restored TAT-default tiers immediately. The prior "reload required"
    // warning text was confusing (the action was incomplete-feeling without
    // a manual reload).
    document.getElementById('fpts-admin-banner-clear').addEventListener('click', function () {
      var n = _overrideCount();
      if (!n) { _flashBanner('No overrides to clear.'); return; }
      if (confirm('Clear all ' + n + ' tier override' + (n === 1 ? '' : 's') +
                  ' on this device?\n\n' +
                  'This reloads the page so every player snaps back to the ' +
                  'TAT-default tier. Admin mode stays ON.')) {
        clearAllOverrides();
        window.location.reload();
      }
    });

    // "Disable" — turns off admin mode. Asks separately whether to also
    // clear overrides because the two are distinct intents:
    //   - keep overrides: your tier edits stay live on this device; only
    //     the editor UI hides. Use this if you're done editing for now
    //     but want your changes to still show on the page.
    //   - clear overrides: full revert. Page snaps back to TAT-default for
    //     everyone (on this device). Most common "I'm done" path.
    document.getElementById('fpts-admin-banner-disable').addEventListener('click', function () {
      var n = _overrideCount();
      if (!confirm('Disable admin mode on this device?')) return;
      var clearToo = false;
      if (n > 0) {
        clearToo = confirm(
          'You have ' + n + ' saved tier override' + (n === 1 ? '' : 's') +
          ' on this device.\n\n' +
          'OK = clear them too (page reverts to TAT-default tiers)\n' +
          'Cancel = keep them saved (your edits stay applied; only the ' +
          'editor UI hides)'
        );
      }
      if (clearToo) {
        clearAllOverrides();
      }
      try { localStorage.removeItem(STORAGE_KEY_MODE); } catch (e) {}
      window.location.reload();
    });
    _refreshBanner();
  }
  function _refreshBanner() {
    if (!_banner) return;
    var n = _overrideCount();
    var label = (n === 0) ? 'No overrides yet' : (n + ' override' + (n === 1 ? '' : 's') + ' on this device');
    var el = document.getElementById('fpts-admin-banner-count');
    if (el) el.textContent = '· ' + label;
    // Publish button visual state — dim when there's nothing to publish
    // OR when PAT isn't configured (clicking it shows a helpful message
    // either way, but the dimming sets correct expectations).
    var pub = document.getElementById('fpts-admin-banner-publish');
    if (pub) {
      var enabled = n > 0 && _ghReady();
      pub.style.opacity = enabled ? '1' : '.5';
      pub.title = enabled
        ? ('Publish ' + n + ' override(s) to data/source/tiers/tiers.csv via GitHub API.')
        : (n === 0 ? 'No overrides to publish.' : 'GitHub PAT not configured. Click ⚙ Settings first.');
    }
  }
  function _flashBanner(msg) {
    var el = document.getElementById('fpts-admin-banner-flash');
    if (!el) return;
    el.textContent = msg;
    el.style.opacity = '1';
    setTimeout(function () { el.style.opacity = '0'; }, 2200);
  }

  // ── Per-row edit pencil + popover ───────────────────────────────────────
  // Returns the HTML for an inline edit pencil. Consumers (tiers.html row
  // template) include this string adjacent to the tier badge. Returns ''
  // when admin mode is off so the row is unchanged for regular visitors.
  function editButtonHtml(playerName) {
    if (!isActive()) return '';
    var safe = String(playerName || '').replace(/"/g, '&quot;');
    return '<button type="button" class="fpts-adm-edit-btn" data-player="' + safe +
           '" title="Edit tier / B-S-H for ' + safe + '"' +
           ' style="background:transparent;border:none;color:var(--red);cursor:pointer;font-size:13px;padding:0 4px;margin-left:4px;line-height:1">✎</button>';
  }

  var _popover = null;
  function _ensurePopoverMounted() {
    if (_popover) return _popover;
    _popover = document.createElement('div');
    _popover.id = 'fpts-adm-popover';
    Object.assign(_popover.style, {
      position: 'absolute',
      zIndex: '210',
      background: 'var(--surface)',
      border: '2px solid var(--red)',
      padding: '12px',
      minWidth: '260px',
      boxShadow: '0 6px 24px rgba(0,0,0,.5)',
      display: 'none',
      fontFamily: "'Mulish', sans-serif",
      fontSize: '12px',
      color: 'var(--white)',
    });
    document.body.appendChild(_popover);
    document.addEventListener('click', function (e) {
      if (_popover.style.display === 'none') return;
      if (_popover.contains(e.target)) return;
      if (e.target.closest && e.target.closest('.fpts-adm-edit-btn')) return;
      _popover.style.display = 'none';
    });
    return _popover;
  }

  function _openPopover(triggerEl, playerName) {
    _ensurePopoverMounted();
    var rec = (window.TIERS_DATA && window.TIERS_DATA[playerName]) || {};
    var overrides = _readOverrides();
    var hasOverride = !!overrides[playerName];
    var tierOpts = TIERS.map(function (t) {
      return '<option value="' + t + '"' + (t === rec.tier ? ' selected' : '') + '>' + t + '</option>';
    }).join('');
    var bshOpts = BSHS.map(function (b) {
      var label = b ? b.charAt(0).toUpperCase() + b.slice(1) : '— none —';
      return '<option value="' + b + '"' + (b === (rec.buySell || '') ? ' selected' : '') + '>' + label + '</option>';
    }).join('');
    var priorityOpts = PRIORITIES.map(function (p) {
      var label = p || '— none —';
      return '<option value="' + p + '"' + (p === (rec.priority || '') ? ' selected' : '') + '>' + label + '</option>';
    }).join('');
    var contenderOpts = CONTENDERS.map(function (c) {
      var label = c || '— none —';
      return '<option value="' + c + '"' + (c === (rec.contender || '') ? ' selected' : '') + '>' + label + '</option>';
    }).join('');
    var selStyle = 'width:100%;margin-top:3px;background:var(--surface2);color:var(--white);border:1px solid var(--border);padding:5px;font-family:\'Kanit\',sans-serif;font-weight:800;font-style:italic';
    _popover.innerHTML = ''
      + '<div style="font-family:\'Kanit\',sans-serif;font-weight:800;font-style:italic;font-size:13px;color:var(--red);text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">' + playerName + '</div>'
      + '<label style="display:block;margin-bottom:8px">Tier'
      +   '<select id="fpts-adm-tier" style="' + selStyle + '">'
      +     '<option value="">— none —</option>' + tierOpts
      +   '</select>'
      + '</label>'
      + '<label style="display:block;margin-bottom:8px">Buy / Sell / Hold'
      +   '<select id="fpts-adm-bsh" style="' + selStyle + '">'
      +     bshOpts
      +   '</select>'
      + '</label>'
      + '<label style="display:block;margin-bottom:8px">Priority Level'
      +   '<select id="fpts-adm-priority" style="' + selStyle + '">'
      +     priorityOpts
      +   '</select>'
      + '</label>'
      + '<label style="display:block;margin-bottom:8px">Contender / Rebuild'
      +   '<select id="fpts-adm-contender" style="' + selStyle + '">'
      +     contenderOpts
      +   '</select>'
      + '</label>'
      + '<label style="display:block;margin-bottom:10px">Trending'
      +   '<select id="fpts-adm-trending" style="' + selStyle + '">'
      +     TRENDINGS.map(function (t) {
              var current = _trendingNormalize(rec.trending);
              return '<option value="' + t + '"' + (t === current ? ' selected' : '') + '>' + TRENDING_LABELS[t] + '</option>';
            }).join('')
      +   '</select>'
      + '</label>'
      + '<div style="display:flex;gap:6px">'
      +   '<button type="button" id="fpts-adm-save" style="flex:1;background:var(--red);color:#111;border:none;padding:6px;font-family:\'Kanit\',sans-serif;font-weight:800;font-style:italic;font-size:11px;text-transform:uppercase;letter-spacing:.06em;cursor:pointer">Save</button>'
      +   (hasOverride
        ? '<button type="button" id="fpts-adm-reset" style="background:transparent;color:var(--white);border:1px solid var(--border2);padding:6px 10px;font-family:\'Kanit\',sans-serif;font-weight:800;font-style:italic;font-size:11px;text-transform:uppercase;letter-spacing:.06em;cursor:pointer">Reset</button>'
        : '')
      +   '<button type="button" id="fpts-adm-cancel" style="background:transparent;color:var(--white);border:1px solid var(--border2);padding:6px 10px;font-family:\'Kanit\',sans-serif;font-weight:800;font-style:italic;font-size:11px;text-transform:uppercase;letter-spacing:.06em;cursor:pointer">Cancel</button>'
      + '</div>'
      + '<div style="margin-top:8px;font-size:10px;opacity:.55">Saved on this device only. Use "Copy as JSON" in the banner to export.</div>';

    // Position below the trigger.
    var rect = triggerEl.getBoundingClientRect();
    var bodyZoom = (function () {
      var v = parseFloat(getComputedStyle(document.body).zoom);
      return (isFinite(v) && v > 0) ? v : 1;
    })();
    _popover.style.display = 'block';
    _popover.style.left = ((rect.left + window.scrollX) / bodyZoom) + 'px';
    _popover.style.top  = ((rect.bottom + window.scrollY + 4) / bodyZoom) + 'px';

    document.getElementById('fpts-adm-save').addEventListener('click', function () {
      var tier      = document.getElementById('fpts-adm-tier').value || '';
      var buySell   = document.getElementById('fpts-adm-bsh').value || '';
      var priority  = document.getElementById('fpts-adm-priority').value || '';
      var contender = document.getElementById('fpts-adm-contender').value || '';
      var trending  = document.getElementById('fpts-adm-trending').value || '';
      saveOverride(playerName, {
        tier: tier, buySell: buySell, priority: priority,
        contender: contender, trending: trending,
      });
      _popover.style.display = 'none';
      _flashBanner('Saved ' + playerName + '.');
    });
    document.getElementById('fpts-adm-cancel').addEventListener('click', function () {
      _popover.style.display = 'none';
    });
    var resetBtn = document.getElementById('fpts-adm-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        clearOverride(playerName);
        _popover.style.display = 'none';
        _flashBanner('Reset ' + playerName + ' (reload to see original).');
      });
    }
  }

  // Delegated click handler for any [data-player] edit button on the page.
  function _wireDelegatedClicks() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('.fpts-adm-edit-btn');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      var name = btn.getAttribute('data-player');
      if (name) _openPopover(btn, name);
    });
  }

  // ── Init ────────────────────────────────────────────────────────────────
  // Async because the password gate needs WebCrypto.subtle.digest (returns
  // a Promise). DOMContentLoaded fires init synchronously but doesn't wait
  // on the returned Promise — that's fine; the async work proceeds in the
  // background and the banner mounts when the gate resolves.
  async function init() {
    await _handleUrlParam();
    if (!isActive()) return;
    _mountBanner();
    _wireDelegatedClicks();
  }

  // Public surface (used by tiers.html row template + console helpers).
  window.AdminTiers = {
    isActive:           isActive,
    editButtonHtml:     editButtonHtml,
    saveOverride:       saveOverride,
    clearOverride:      clearOverride,
    clearAllOverrides:  clearAllOverrides,
    exportToClipboard:  exportToClipboard,
    overrideCount:      _overrideCount,
    // Exposed for console-driven setup: `await AdminTiers.hashPassword('mypw')`
    // returns the SHA-256 hex you'd paste into PASSWORD_HASH. The ?admin=hash
    // URL helper does the same via a prompt UI; this is the dev-friendly path.
    hashPassword:       hashPassword,
    // Phase 1b — GitHub publish surface for console + automation:
    publish:            publishToGitHub,
    openSettings:       _openSettings,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
