## Overview
Desire Path is a concurrent-room party game for 3–5 players. Every player privately draws a route from the same start dot to the same end dot across a shared field of obstacles. Nobody sees anyone else's line — the room must independently converge on ONE route, revealed only as an emergent 'trampled' heat trail. It's the desire-path phenomenon (where crowds wear their own shortcut into the grass) as a silent coordination puzzle.

## Problem
Route choice is a beautiful Schelling problem: there are many valid ways around the obstacles, and the room has to *feel out* which one everybody would pick. Existing blind-draw convergence games average freehand squiggles with no constraint; pinning both endpoints and dropping obstacles turns it into a genuine 'which of these paths is the obvious one' decision.

## How it works
The host screen shows the field: fixed start (S) and end (E) dots, a scatter of obstacle blobs, and a growing **trample heatmap** — the anonymized aggregate of everyone's strokes, darkest where the most lines overlap. Plus a big **Convergence %**.

Each **phone shows privately**: the same field, YOUR own drawn path (re-draggable), and a faint copy of the aggregate trample heat — but never any individual other player's line. That privacy is the whole game: if you could see Ana's exact route you'd just trace it. Instead you see a smudge of collective intent and have to commit to where you think the crowd is wearing the path.

Each tick, players redraw/nudge their route toward the darkening trail. Win: all pairwise routes are 'close enough' (grid-overlap above threshold) and hold for one tick — the heat trail snaps into a single crisp cowpath and the TV celebrates.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve).

Data model: `players[id] = {path: [{x,y}...]}` in normalized field coords. Phone captures a polyline on touchmove, downsamples to ~30 points, sends on release/drag-end. Server rasterizes each path onto a coarse grid (say 48×32), sums into a density grid = the trample heatmap, and broadcasts the grid (anonymized, no per-player attribution) to host + phones at ~5 Hz.

Convergence metric: pairwise grid-overlap / IoU of rasterized paths (cheap and latency-tolerant); win when the minimum pairwise overlap clears a threshold.

Sync strategy: last-write-wins per player path; server recomputes the heat grid + convergence on each update. Broadcasting only the aggregate grid (never individual paths) is what makes copying impossible and keeps the guessing honest.

Genuinely hard part: cheap real-time path-similarity for N players at interactive rates (grid IoU beats Fréchet distance here), and rendering the trample heat legibly enough to guide without exposing individuals.

## v1 scope
- 3 players, one round, one hand-authored field (S, E, 3 obstacles).
- Blind draw + aggregate trample heat only; no per-player reveal.
- Single fixed convergence threshold; win on one held tick.

## Out of scope
- Scoring, multiple maps, timers, teams.
- Fancy heat rendering, path animation, replay of the winning cowpath.
- Procedurally generated fields.

## Risks & unknowns
- Does the aggregate smudge give ENOUGH signal to converge, or too much (instant trivial agreement)? Obstacle placement is the tuning knob.
- Grid resolution vs. fairness: too coarse and distinct routes read as identical.
- Touch-draw feel on small phones near obstacle edges.

## Done means
Three phones on one LAN each draw a route S→E; the host trample heat thickens as routes align; when all three pairwise overlaps clear the threshold and hold a tick, the host fires the win and shows the single cowpath — reproducibly, with no phone ever having seen another player's raw line.
