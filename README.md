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
run, then calls `claude -p` to riff N ideas + PRDs, dedupes against existing ideas (exact
title **and** embedding similarity — see *Novelty gate* below), and writes `public/data/ideas.json` + `public/data/prds/<slug>.md`. Scoring uses a **calibrated
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

### Novelty gate (semantic dedup)
Both generators run a **two-pass** novelty check. Pass 1 is the old exact-title dedup
(`normTitle` in `lib.mjs`) — free, catches literal repeats. Pass 2 is semantic: every
candidate is embedded (`title + hook + first 200 words of PRD`) with **all-MiniLM-L6-v2**
running on-device via `@xenova/transformers`, and rejected if its cosine against any existing
idea is **>= 0.82** (`DIVVY_NOVELTY_MAX`).

The threshold is measured, not borrowed. Over all 3,360,528 pairs of the 2,593-idea corpus:

| cosine | pairs | ideas with such a neighbour |
|---|---|---|
| >= 0.95 | 0 | 0 (0.00%) |
| >= 0.90 | 0 | 0 (0.00%) |
| >= 0.85 | 90 | 103 (3.97%) |
| >= 0.82 | 377 | 339 (13.07%) |
| >= 0.80 | 788 | 545 (21.02%) |
| >= 0.75 | 3,618 | 1,188 (45.82%) |

Per-idea nearest-neighbour cosine: p50 0.742, p90 0.828, p99 0.870, max 0.897 — so nothing in
the corpus is a verbatim clone, but the tail is dense. **Duplication is almost entirely a
party-game problem**: 740 of the 788 pairs at >= 0.80 are party-vs-party, 48 are
non-party-vs-non-party, and *zero* cross the boundary. Party ideas have a p50 NN of 0.776
(475 of 1,482 have a >= 0.80 twin) against 0.640 for everything else (70 of 1,111).
0.82 is the knee: hand-inspecting random pairs, ~half of `[0.795, 0.815)` are genuinely
distinct ideas, while ~85% of `[0.820, 0.835)` are the same idea renamed (*Footsie*/*Footsies*,
*Duty Free*/*Wave Through*, *Mixup*/*Hitstop*, *Face Out*/*Outward*). Re-run the measurement
any time with `node scanner/embed-corpus.mjs --all --report`.

The same embeddings power a **retrieved avoid-list**: instead of showing the model 300 random
existing titles, `scan.mjs` embeds the run's feed digest and `party.mjs` embeds each agent's
theme, then injects the `DIVVY_AVOID_K` (default 40) nearest existing ideas *with their hooks*
— same token budget, aimed at the region the model is about to generate into.

`scanner/embed-corpus.mjs` builds the index into `public/data/embeddings.{bin,json}` (raw
Float32 + a slug list, ~4MB). Both are **gitignored** — a rebuildable local cache, not source;
committing them would churn ~4MB per 3-hourly commit. `run.sh` refreshes it incrementally
(~1s) before each run; `--all` rebuilds from scratch (~2min for 2.6k ideas). Model weights
(~90MB) live in `~/.cache/huggingface`, never in the repo.

**Everything here fails soft.** Missing index, corrupt index, missing package, model that
won't load — each logs one line, disables the gate, and falls back to exact-title dedup plus
the old sampled avoid-list. The generators still run and still commit. Force that path with
`DIVVY_NO_EMBED=1` to test it.

- Needs `CLAUDE_CODE_OAUTH_TOKEN` (whitespace-stripped from `~/.happy/claude-token.txt`).
- `scanner/run.sh` runs **both** generators (feed scan, then the parallel party fan-out),
  then commits+pushes once; wired to the `com.divvy-scanner` LaunchAgent (every 3h,
  `DIVVY_N=3`). Either generator can fail without blocking the other's commit.
  `scanner/overnight-burst.sh` grows to a target.

  **The timer is currently STOPPED** (2026-08-16) — `launchctl bootout` +
  `launchctl disable gui/501/com.divvy-scanner`, so it stays off across logins.
  The plist is still at `~/Library/LaunchAgents/com.divvy-scanner.plist`; the
  scanner itself is unchanged and still runs by hand
  (`scanner/run.sh`, or `overnight-burst.sh`). To turn the timer back on:

  ```sh
  launchctl enable gui/501/com.divvy-scanner
  launchctl bootstrap gui/501 ~/Library/LaunchAgents/com.divvy-scanner.plist
  ```

## Deploy — Cloudflare Pages
Connected to this repo: build command **`npm run build`**, output directory **`dist`**.
Every push to `main` (including the scanner's idea commits) auto-builds and deploys.
`wrangler.toml` (D1 + DO bindings) and `public/_headers` (no-cache) are set up.
