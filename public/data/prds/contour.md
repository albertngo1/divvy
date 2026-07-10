## Overview
Contour is a quiet cooperative party game for 3–4 players. One player's phone secretly holds a hidden route (a 'contour') drawn across a grid. Every other player is a blind bead that must come to rest exactly on that line. The mapkeeper is a *bandwidth-limited oracle*: they can only guide one player at a time. The shared TV shows nothing but a blank frame that fills in as the line gets traced.

## Problem
Warm/cold guessing is fun but usually one seeker at a time. The itch: make several people converge on the same hidden shape simultaneously, and force the person who knows the shape to ration their attention — so the drama is *who do I help right now* while the others drift.

## How it works
The mapkeeper's phone shows a 10×10 grid with a hidden multi-cell line they draw at the start of the round. Each blind player sees only their own bead on an otherwise black grid — no line, no other beads. Players drag their bead anywhere, continuously. The mapkeeper's only tool: tap one player to 'illuminate' them, which tints THAT player's screen along a red→green gradient by distance to the nearest line cell. Only one player can be lit at once; unlit players go dark and must hold or guess from memory. When every bead simultaneously rests on a line cell for 1.5s, the contour is 'traced' and the full line reveals on the TV. The fun is the mapkeeper juggling attention while beads slide off the line the moment they're ignored.

## Technical approach
Authoritative WebSocket server (PartyKit Durable Object, or Socket.IO over Tailscale Serve) holds `{line: Set<cell>}` and `{beadId: {x,y}}`. Beads stream drag positions at ~15Hz. The server computes each lit bead's distance-to-line and sends ONLY that bead's gradient value to that bead's phone; the mapkeeper sees all bead positions plus the line. Win check = all beads within tolerance of a line cell for 1.5s continuous, server-authoritative. Hard part: the gradient must update smoothly under latency without leaking the line's shape — send a single scalar (distance band), never neighboring-cell truth, so a player can't reverse-engineer the line from one reading.

## v1 scope
- 3 players: 1 mapkeeper + 2 beads
- One 10×10 grid, one hand-drawn 5-cell straight-ish line
- One-at-a-time illumination; red→green gradient only
- Single round; TV reveals the traced line on win

## Out of scope
- Curved/branching contours, multiple lines, scoring across rounds
- Simultaneous multi-player illumination, hint budgets
- Reconnect handling, accounts, lobby polish

## Risks & unknowns
- Two beads may be too easy; may need 3+ to make rationing bite
- Gradient might leak the shape over repeated peeks — needs tuning of band granularity
- 'Hold still while dark' may feel passive rather than tense

## Done means
Three phones join; mapkeeper draws a hidden line; each bead sees only its own dot; illuminating one bead tints only that phone by distance; all beads resting on the line for 1.5s reveals the full contour on the TV as a win.
