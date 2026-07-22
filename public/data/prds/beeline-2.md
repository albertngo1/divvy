## Overview
Beeline is a 3-player cooperative convergence game (host TV + phones) about the *obvious* route. A tiny maze-ish grid with a start, a goal, and a few walls and 'mud' cells offers two or three tempting paths; each player secretly draws the one they believe the group will pick. Win when all three routes match exactly.

## Problem
Every shared map has a Schelling path — the shortcut everyone 'just knows.' But routes only feel obvious in your own head; the fun is discovering whether your beeline is the *room's* beeline, without a word or a peek. Pointing at a shared map ruins it; the choice has to be private and simultaneous.

## How it works
The host TV shows one grid (say 6×6): green **S**, red **G**, a couple of black walls, a couple of brown 'mud' cells (visually costlier, tempting a detour). During play the TV shows only an EDGE-HEAT overlay — each grid edge glows brighter the more players traversed it (1–3) — plus a lock counter. It never shows a single complete path or who drew what. Each phone PRIVATELY renders the same grid and lets the player finger-drag a continuous path of orthogonally-adjacent cells from S to G; the server validates connectivity and endpoints live, the phone shows only its own drawn line, then LOCK. Because each player sees only their own path, screen-mirroring gives nothing — you must actually predict the others. When all lock, the server checks whether all three cell-sequences are identical. Match → TV animates the agreed beeline lighting up S→G. Mismatch → the heat map lingers (you can *see* where you diverged as glowing forks) and one 30s redraw follows.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `Room { grid: cells[], start, goal, phase }`, `Player { id, path: cellId[], locked }`. Phones send the ordered `path` array on lock (and throttled partials for live edge-heat); the server aggregates edge-traversal counts and broadcasts ONLY those counts to the host, never a full path or identity, until the win/reveal event. The genuinely hard part is defining path equality and validity cheaply: server enforces each path is a simple connected S→G walk, then compares sequences byte-for-byte — allowing non-shortest paths is what makes the Schelling choice interesting (the mud detour is legal, just contested).

## v1 scope
- 3 players, one fixed hand-authored grid, one round (+ one redraw)
- Finger-drag path input with live validity check, single LOCK
- Host shows only edge-heat + lock count; reveal agreed path on win

## Out of scope
- Grid generation / difficulty tuning / multiple boards
- Scoring, streaks, >3 players
- Rotated/mirrored anti-mirror grids (nice later, not v1)

## Risks & unknowns
- If one path is *too* obvious it's a gimme; if three are equal it never converges. The single v1 grid must be tuned to ~2 tempting routes.
- Fat-finger path drawing on small phones — need forgiving cell snapping.
- Exact-sequence match may be too strict if two routes differ by one cell; playtest whether to require identity or allow a near-match.

## Done means
Three phones join, the same grid appears on every screen, each privately traces and locks a hidden S→G route, the host shows only anonymized edge-heat during play, and identical routes trip the win-and-reveal while any divergence does not.
