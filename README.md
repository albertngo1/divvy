# Divvy

**An idea cloud that grows itself.** Each bubble is an idea; click it for a full PRD.
An autonomous scanner reads several public feeds on a timer — Hacker News, trending
GitHub repos, and popular Steam games — cross-pollinates them into fresh weekend-project
and video-game ideas, writes a PRD for each, and pushes them into the cloud so it grows
between visits.

Live (Cloudflare Pages): **https://divvy-9ol.pages.dev/**

## Stack
- **React + TypeScript + Vite** front-end (`src/`). The bubble cloud is a d3 force
  layout in a typed imperative module (`src/cloud.ts`) driven by a React component; the
  rest of the UI (controls, tag dropdown, PRD panel, tooltip) is React components.
- **color = score** (cool blue → warm amber); bubbles nestle cohesively and drift; same-tag
  ideas are linked into faint **constellations**; pan/zoom, search, multi-select tag filter.
- Data is static JSON in `public/data/` (served at the site root) — no backend.

## Develop
```bash
npm install
npm run dev        # local dev server (HMR)
npm run build      # type-check + build to dist/
npm run preview    # serve the production build
```

## Scanner (the "grows itself" engine)
`scanner/scan.mjs` scrapes HN + GitHub + Steam, calls `claude -p` to riff N ideas +
PRDs, dedupes against existing titles, and writes `public/data/ideas.json` +
`public/data/prds/<slug>.md`. `scanner/run.sh` runs it and commits+pushes.
- Needs `CLAUDE_CODE_OAUTH_TOKEN` (whitespace-stripped from `~/.happy/claude-token.txt`).
- Wired to the `com.divvy-scanner` LaunchAgent (every 3h, `DIVVY_N=3`).
- `scanner/overnight-burst.sh` is a one-off detached loop to grow to a target count.

## Deploy — Cloudflare Pages
Connected to this repo: build command **`npm run build`**, output directory **`dist`**.
Every push to `main` (including the scanner's idea commits) auto-builds and deploys.
`wrangler.toml` + `public/_headers` (cache-control, so no hard-refresh needed) are set up.
This is also the on-ramp to a future backend — Pages Functions / D1 / Durable Objects — for
the planned multiplayer-voting v2.

## Out of v1 (deliberately)
Voting, friends, per-person work assignment — that's "Social Divvy" v2 (multiplayer voting
sessions; likely PartyKit / Cloudflare Durable Objects).
