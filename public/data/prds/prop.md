## Overview
Prop is a browser puzzle game where each level is a faithful, interactive recreation of a famous *fake* computer interface from film and TV — the spinning 3D 'It's a UNIX system' file browser, WarGames' WOPR dialing tones, Alien's MU/TH/UR terminal, the Nostromo's green CRT. You're dropped in with a goal ('unlock the lodge doors', 'find the raptor paddock', 'get WOPR to stop') and must figure out the diegetic UI's logic to solve it. It turns something people passively rewatch — cinema's gloriously impractical prop computers — into a timed competition.

## Problem
Movie prop UIs are cultural touchstones people love but only ever watch. There's a whole aesthetic (the Jurassic Park computers post is perennial catnip on Lobsters/HN) with zero interactivity. And there's no daily puzzle game with genuine *visual* variety — most are text or grid. Prop is a puzzle-room-a-day with a new fictional OS each time.

## How it works
1. Each day/week ships one reconstructed interface as an interactive room.
2. You explore it — click nodes, type commands, follow the (deliberately absurd) in-fiction logic — to reach the objective. No external hints; the UI teaches itself the way the movie implied.
3. A clear-time timer runs; solving reveals a shareable time + a trivia card on the real prop's production history.
4. Global leaderboard per interface; 'first-try no-hint' badge; optional speedrun mode.

## Technical approach
- **Frontend:** plain TypeScript + Canvas/WebGL per level (the JP file system is literally a 3D node graph — three.js; the CRT terminals are xterm.js with CRT shaders). Each level is a self-contained module implementing a common `Puzzle` interface (`init`, `onInput`, `isSolved`).
- **Content:** levels authored as data + a small state machine; no real OS, just convincing diegetic behavior. Parody/homage — reconstructions and pastiche, not asset rips.
- **Backend:** serverless leaderboard (times, device key), static hosting. The hard part is *authoring* — each interface is bespoke art + interaction design; the engine just standardizes timing, solve-detection, and sharing.

## v1 scope
- One level: the Jurassic Park 3D file browser, one objective, working navigation.
- Solve-detection + local timer + shareable result string.
- No accounts.

## Out of scope
- Global leaderboard and speedrun mode (v2).
- User-authored levels.
- Faithful audio/asset recreation — evoke, don't copy.

## Risks & unknowns
- Content-heavy: each level is a mini art project, so cadence is slow.
- IP/trademark tone — must stay clearly transformative parody; avoid logos and ripped assets.
- Difficulty tuning without hints is tricky; the UI must telegraph its own rules.

## Done means
A player who's never seen the puzzle can, using only in-interface cues, reach the Jurassic Park file browser's objective; their clear-time is recorded and the shareable string reproduces it exactly.
