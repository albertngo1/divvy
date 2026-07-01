# Divvy

**An idea cloud that grows itself.** Each bubble is an idea; click it for a full PRD. An
autonomous scanner reads several public feeds on a timer — Hacker News, trending GitHub repos,
and the most-played Steam games — cross-pollinates them into fresh weekend-project and
video-game ideas, writes a PRD for each, and pushes them into the cloud so it grows between
visits. Sources are modular (`src*` functions in `scan.mjs`); add more freely.

## v1 goal (not allowed to expand until shipped)
A static GitHub Pages site that renders a bubble cloud from `data/ideas.json` and shows
`data/prds/<slug>.md` when you click a bubble. A local scanner generates the data and pushes it.

**Explicitly out of v1:** voting, friends, per-person work assignment, progress bars.

## How it works
```
Mac mini (private)                         GitHub Pages (public)
  scanner/run.sh  (LaunchAgent, timer)       albertngo1.github.io/divvy
   -> scan.mjs: scrape HN+GitHub+Steam         static bubble cloud (d3)
   -> claude -p: cross-pollinate ideas+PRDs git fetch data/ideas.json
   -> write data/ + git push  ───────push───▶  click bubble -> PRD md
```
No backend, no accounts, no secrets in the repo — the scanner runs locally where the token lives.

## Layout
- `index.html`, `style.css`, `app.js` — the static front-end (d3 force cloud + PRD panel).
- `data/ideas.json` — the bubbles.
- `data/prds/<slug>.md` — one PRD per idea.
- `scanner/scan.mjs` — scrape HN, call `claude -p`, merge ideas, write PRDs.
- `scanner/run.sh` — run the scan, commit, push. Wire to a LaunchAgent when ready.

## Run locally
```bash
# serve the static site
python3 -m http.server 8080     # then open http://localhost:8080

# run one scan by hand (needs `claude` on PATH)
DIVVY_N=3 node scanner/scan.mjs
```

## Live
- Site: **https://albertngo1.github.io/divvy/** (GitHub Pages, `main` / root).
- Repo: `albertngo1/divvy` (public). Develop with plain `git push`.

## Autonomous timer (`com.divvy-scanner`)
A LaunchAgent runs the scanner on a schedule so the cloud grows hands-off.
- Plist: `~/Library/LaunchAgents/com.divvy-scanner.plist`
- Cadence: `StartInterval` 10800s (3h); `DIVVY_N=3` ideas/run (~24/day). Tune in the plist.
- Logs: `scanner/launchd.log` (launchd) + `scanner/scan.log` (per-run detail).

```bash
# load / reload after editing the plist
launchctl bootout gui/501/com.divvy-scanner 2>/dev/null
launchctl bootstrap gui/501 ~/Library/LaunchAgents/com.divvy-scanner.plist

# run once now, or stop the timer
launchctl kickstart -k gui/501/com.divvy-scanner
launchctl bootout   gui/501/com.divvy-scanner
```
