## Overview
A blind spatial party puzzle for 3–5 players. The host TV is a circuit board; each phone is a private trace-router. You each get one hidden wire to lay, and success depends on guessing where everyone else will route so your paths never touch.

## Problem
Co-op puzzles almost always reward talking and explicit coordination. There's an unfilled itch for a *blind* spatial game where reading the room wrong isn't just a missed point — it's a literal short circuit. The whole tension is that the obvious, efficient route is the one everyone else also wants.

## How it works
The host TV shows a grid of pads (e.g. 6×6) with several anonymous terminal dots. Each phone is *privately* assigned exactly one terminal pair — your two pins glow only on your own screen; on the TV they're indistinguishable from everyone else's. During a 30-second window each player drags/taps a contiguous path cell-by-cell from their source pin to their destination pin on their own copy of the board. You see YOUR trace live. You do NOT see anyone else's trace or which pins belong to whom.

At lock/timeout, all traces reveal *simultaneously* on the TV: non-crossing traces light green and score; any two traces that share a cell (or swap across an edge) spark red and both are voided. If the whole room routes clean, the board fully lights for a collective bonus. The trap: people gravitate to the short central route — the Schelling path — so hugging the middle is death. You must take a weird detour to stay unique. Optional live leak: the TV shows a faint aggregated 'congestion' heat on the most-used cells, with no identities.

PRIVATE per phone: your assigned endpoints, your in-progress route, a private 'clear so far?' self-check. SHARED on TV: the anonymous board, the countdown, and the simultaneous spark reveal.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object). Data model: `Board {gridW, gridH, terminals:[{id, owner, srcCell, dstCell}]}` and per-player `Trace {playerId, cells:[{x,y}]}`. Sync: phones stream trace deltas at ~10Hz; the server just stores each player's latest path and deliberately does NOT broadcast others' traces during play — that secrecy is the game. At timeout the server runs collision detection: build an occupancy map `cell → [playerIds]`, add an edge-swap check for diagonal crossings, and void any player sharing a cell. Broadcast one reveal payload to the TV. The genuinely hard part is fair, unambiguous collision detection (cells + edges) plus server-side validation that each submitted path is contiguous and actually connects the player's real endpoints (anti-cheat). Latency-tolerant, because the only synchronized moment is the single reveal barrier.

## v1 scope
- 3 players, one 6×6 board, one round
- One terminal pair per phone, tap-to-extend path (no fancy drag)
- Server-side contiguity + collision check
- TV simultaneous reveal with red spark / green light

## Out of scope
- Multiple rounds, obstacles, multi-pin nets
- Scoring history / leaderboards
- Drag polish, animations beyond the spark

## Risks & unknowns
Is guessing others' routes actually fun or just random? The Schelling-path pull must be strong — bias rewards toward the center so greed reliably collides. Very small boards can make collisions unavoidable; tune size. Reveal-only feedback may feel swingy without the congestion-heat leak.

## Done means
Three phones join via QR, each receives a private endpoint pair, all route blind within 30s, the TV reveals simultaneously and correctly sparks any shared-cell traces red while lighting clean traces green, and at least one playtest shows a mid-board pileup eliminating two players who both took the obvious route.
