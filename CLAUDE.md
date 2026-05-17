# CLAUDE.md — project conventions for Claude

Project conventions that aren't obvious from reading the code. Add to this file when you encounter a non-obvious rule or pattern that future sessions need to follow.

---

## Player panel: async fetches MUST guard against player switches

The shared `assets/js/player-panel.js` drawer reuses a single set of DOM containers (`#pp-stats-tab`, `#pp-exp-val`, etc.) across every player the user opens. The "+ Add player to compare" search lets the user swap players inside the open drawer.

**The bug class:** any `fetch(...).then(write to DOM)` started for player A will resolve at an unpredictable time. If the user has already switched to player B by then, A's late response overwrites B's DOM — both tabs end up showing the same (stale) data.

**The rule:** every async DOM write in the panel system must capture the target player at render time and bail at resolution time if the user has switched.

**The pattern** (see `player-panel.js:1306` `renderPlayerStats` and `player-panel.js:600` years-of-experience fetch for reference implementations):

```js
function renderSomething(containerId, player) {
  const targetName = player.label;            // capture at call time

  fetch(url).then(data => {
    const active = global._currentPanelPlayer;
    if (!active || active.label !== targetName) return;   // bail if switched
    el.innerHTML = render(data);
  }).catch(() => {
    const active = global._currentPanelPlayer;
    if (!active || active.label !== targetName) return;   // guard catch too
    el.innerHTML = 'Error';
  });
}
```

`global._currentPanelPlayer` is set inside `openPanelContent` (`player-panel.js:662`) on every player switch and is the source of truth for "who is the panel currently showing."

**When this applies:** any new panel tab or post-open hook that does a `fetch`, awaits a Promise, or schedules a `setTimeout` callback that writes player-specific data into a `#pp-*` element.

**When this does NOT apply:** synchronous renders that read from already-loaded globals (`FP_VALUES`, `ADP_PAYLOAD`, `MVS_PAYLOAD`, `PLAYER_ARTICLES`, `ML_ALL_LEAGUE_DATA`, etc.). Most existing renderers — `renderAgeCurve`, `renderTradeFinder`, `Heatmap.render`, `MvsExtras.buildHeader`, `PlayerArticles.mount`, `renderPlayerAvailability` — are synchronous and safe.

**One-time page-init fetches** (e.g. `loadPlayerArticles()` in `index.html:1546`) are also safe — they populate a global once, and per-render reads are synchronous.

**Cache bump:** any change to `player-panel.js` requires bumping `?v=...` on the `<script src>` tag in all 6 pages (index, trade-calculator, tiers, adp-tool, my-leagues, rankings) plus `templates/page-template.html`. Browsers cache the file hard and won't pick up changes otherwise.
