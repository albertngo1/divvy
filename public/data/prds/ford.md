## Overview
Ford is a cooperative blind river-crossing party game for 3-4 players: one Guide plus two or three Crossers. The board — a grid of safe stepping-stones over deadly water — exists on exactly one device: the Guide's phone. Nobody else, not even the shared TV, ever sees it. The Crossers are pieces who move only by voice-directed faith.

## Problem
Most 'escort' co-op games put the map on the shared TV, so everyone half-peeks and the whole point — 'I genuinely cannot see where I'm stepping, I only have your voice' — evaporates. The map living on a single private phone makes the blindness real and the Guide's job load-bearing.

## How it works
The Guide's phone renders a 6×6 grid: stones (safe) scattered over water (fatal). Each Crosser starts on the near bank; all must reach the far bank. A Crosser's phone shows almost nothing: a 4-direction D-pad, their token color, and one private status light — **dry** (on a stone), **wet** (in water, drifting), or **gasp** (swept back to bank). No coordinates, no neighbors, no map. The Guide sees every colored token live and narrates: 'Blue, one right, now up.' Two rules create tension: (1) a stone holds one Crosser — two on the same stone dunks both back to the bank; (2) every 8 seconds the current pushes each token one cell downstream, and anyone in water drifts twice as fast, so standing still is death. The Guide is juggling multiple blind people on a clock. Win: all Crossers reach the far bank within 90s.

The host TV is pure ambience — join QR, a timer, and an anonymized progress bar. Critically, it is NOT the map. That's the theme: the board is one player's private screen.

## Technical approach
Authoritative WebSocket room (PartyKit / Durable Object). State: `grid[]`, `tokens{id,color,r,c,state}`, `tick`. The server runs a fixed 4Hz tick: it drains queued `moveIntent` messages, resolves same-cell collisions, applies the current, and recomputes each token's state. The Guide's socket receives the full grid+tokens; each Crosser's socket receives ONLY its own `token.state` — the private channel is enforced server-side so map data can never leak to a piece. The genuinely hard part is simultaneous move resolution: two intents landing in the same tick on the same stone must both dunk deterministically, and the current must feel fair, not random, under ~150ms latency.

## v1 scope
- 1 Guide + 2 Crossers, one handcrafted 6×6 map
- D-pad + wet/dry/gasp light only on Crosser phones
- Same-stone collision dunk; 90s timer; single win screen
- Current optional/toggleable for the very first build

## Out of scope
- Procedural maps, multiple rounds, scoring/leaderboards
- Reconnection, spectator polish, more than 3 Crossers

## Risks & unknowns
- The Guide identifying which physical person is which token — needs fixed colors + spoken names, maybe a wiggle-to-flash.
- Collision rule may frustrate; two Crossers may make it trivially easy without the current.

## Done means
Three phones join; the Guide sees a map neither Crosser nor the TV can; Crossers move only via their pad; a same-stone step dunks both; and a run where both reach the far bank triggers a win — one round, no map data ever reaching a Crosser phone or the TV.
