# Divvy

**An idea cloud that grows itself.** Each bubble is an idea; click it for a full PRD.
An autonomous scanner reads an arbitrary subset of several trusted public feeds on a timer
— Hacker News, Lobsters, trending GitHub repos, popular Steam games, Product Hunt, and
recent arXiv (HCI/graphics) — cross-pollinates them into fresh weekend-project and
video-game ideas, writes a PRD for each, and pushes them into the cloud so it grows
between visits. A handful of friends can then browse it together in real time and vote
ideas up or down.

Live (Cloudflare Pages): **https://divvy-9ol.pages.dev/**

## Stack
- **React + TypeScript + Vite** front-end (`src/`). The bubble cloud is a d3 force
  layout rendered to a single **`<canvas>`** in a typed imperative module (`src/cloud.ts`)
  driven by a React component — canvas (not SVG-DOM) so it stays smooth as the idea count
  grows; interactions use canvas-level hit-testing, and the ambient wobble idle-stops (0
  fps) when nothing's happening. The rest of the UI (controls, tag dropdown, PRD panel,
  tooltip, scoreboard) is React.
- **Cloudflare Pages** hosting + **Pages Functions** (`functions/api/*`) for the API.
- **D1** (serverless SQLite) stores votes; a **Durable Object** Worker (`realtime/`)
  powers live presence over WebSockets.

## The cloud
- **Galaxies.** Ideas cluster by *domain* (games, data viz, dev & ops, ai & ml, …). Each
  galaxy is a big central **sun** labeled with its domain; the ideas orbit it in a ring
  with a clear gap (Saturn-style), and a faint spoke links each idea to its sun.
- **color = heat.** Hue is AI score **+ votes** (votes weighted heavily), spread by
  percentile rank so the full cool→warm spectrum is used (raw AI scores cluster high).
  Upvotes warm and **grow** a bubble; downvotes cool and shrink it.
- **Navigation.** Pan/zoom (scroll/drag, **WASD / arrow keys**, or the on-screen zoom /
  pan / fit controls bottom-right, with a **?** keyboard-and-mouse legend), search,
  multi-select tag filter (consolidated vocabulary, `src/tags.ts`), and a **🏆 scoreboard**
  of top ideas. The hottest bubbles bloom; the labeled glassy look holds at every zoom.
- **Deep links.** `?idea=<slug>` opens that idea's panel; a *copy link* button shares it.

## Votes (D1)
`functions/api/votes.ts` (GET counts + your votes) and `functions/api/vote.ts` (POST
`{slug, dir}`) back the up/down votes. Signed rows in `vote_rows(slug, voter, val)`;
`count = SUM(val)` (can go negative). Identity is an anonymous `divvy_uid` httpOnly
cookie, so it's idempotent per browser and the client can't inflate counts. The table
auto-creates on first request (`db/schema.sql` is reference only).

One-time setup (authenticated `wrangler`):
```bash
npx wrangler d1 create divvy            # paste database_id into wrangler.toml
# table self-bootstraps; no seed needed
```
The D1 binding (`DB`) is configured in `wrangler.toml`.

## Realtime presence (`realtime/`)
A separate **`divvy-realtime`** Worker hosts a `PresenceRoom` **Durable Object** (WebSocket
Hibernation API) that relays **live cursors**, join/leave, and instant **vote broadcasts**.
`functions/api/room.ts` routes the WS upgrade (`/api/room`) to the DO, which is bound to
the Pages project as `ROOM`. The client (`src/presence.ts`) reconnects with backoff and
degrades silently if the Worker isn't deployed.

One-time setup (you can't define a DO inside a Pages project — it lives in its own Worker):
```bash
cd realtime && npm install && npx wrangler deploy   # deploys divvy-realtime + PresenceRoom
```
The DO binding (`ROOM` → `divvy-realtime` / `PresenceRoom`) is in the root `wrangler.toml`.

## Develop
```bash
npm install
npm run dev        # local dev server (HMR)
npm run build      # type-check + build to dist/
npm run preview    # serve the production build
```
Votes/presence need the deployed Functions + Worker; on a bare local build they degrade
to no-op (counts show 0, no peer cursors).

## Scanner (the "grows itself" engine)
`scanner/scan.mjs` draws a **random subset** (default 4) of a pool of 6 trusted feeds — HN,
Lobsters, GitHub, Steam, Product Hunt, arXiv (cs.HC/cs.GR) — so no single feed anchors every
run, then calls `claude -p` to riff N ideas + PRDs, dedupes against existing titles, and
writes `public/data/ideas.json` + `public/data/prds/<slug>.md`. Scoring uses a **calibrated
rubric** (be stingy, spread the scores) and tags come from a **controlled vocabulary**
aligned to the galaxy domains. (`DIVVY_SOURCES` sets how many feeds per run.)

`scanner/party.mjs` is the **party-game half** of the same worker: it spawns
`DIVVY_PARTY_AGENTS` (default 3) `claude` agents **in parallel**, each handed a different
theme (imposter, synchrony, sensor+room, LLM-entropy, "coordination as the failure mode",
etc.) and asked for `DIVVY_PARTY_N` (default 2) concurrent-room party games — a host TV +
phones as private controllers, under two hard rules (per-phone privacy must be load-bearing;
v1 humiliatingly small). Winners merge into `ideas.json` with `source: "party"`. Shared
helpers for both generators live in `scanner/lib.mjs`. `DIVVY_DRY=1` calls the agents but
writes nothing (verification).

- Needs `CLAUDE_CODE_OAUTH_TOKEN` (whitespace-stripped from `~/.happy/claude-token.txt`).
- `scanner/run.sh` runs **both** generators (feed scan, then the parallel party fan-out),
  then commits+pushes once; wired to the `com.divvy-scanner` LaunchAgent (every 3h,
  `DIVVY_N=3`). Either generator can fail without blocking the other's commit.
  `scanner/overnight-burst.sh` grows to a target.

## Deploy — Cloudflare Pages
Connected to this repo: build command **`npm run build`**, output directory **`dist`**.
Every push to `main` (including the scanner's idea commits) auto-builds and deploys.
`wrangler.toml` (D1 + DO bindings) and `public/_headers` (no-cache) are set up.
