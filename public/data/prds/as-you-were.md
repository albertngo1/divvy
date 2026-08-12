## Overview
A 3-player cooperative room game for people who like Keep Talking energy but are tired of the manual-reading shape. One player is the **Forecaster**, holding the only view of the board — rendered four seconds ahead of now. The other two are **Pieces** walking a dark maze they cannot see, each with a private heading dial. The Forecaster is a prophet who cannot see the present, and whose every prophecy invalidates itself.

## Problem
Map-holder games collapse into one person calmly reading coordinates aloud. The holder has strictly more information and no pressure of their own. The itch: give the holder a view that is *better* than everyone else's and *actively destroyed by their own speech*, so information and action become mutually exclusive resources.

## How it works
Pieces move continuously at one tile per second in whatever direction their dial is set. Their phone shows PRIVATELY: an 8-way heading dial, a STOP toggle, and a haptic tick on every tile crossed (their only dead reckoning). No map, no coordinates, no position.

The Forecaster's phone shows PRIVATELY: the full maze with both Piece dots and a sweeping hazard, all simulated forward 40 ticks (4s) assuming **no input changes** — "as you were." So they watch a collision that hasn't happened yet.

The catch: whenever any Piece changes their dial or STOP state, the forecast is invalid. The Forecaster's screen greys to static for 3 seconds while it re-resolves. Talking causes changes; changes cause blindness. The Forecaster must issue an order, go dark, and then get the next glimpse *after* the room has already committed.

The shared TV shows only the maze walls — no dots, no hazard, no positions. This gives the room shared vocabulary ("the T junction", "the long hall") without leaking state. It also shows the 90s clock and a near-miss counter.

Win: both Pieces standing on the two exit plates simultaneously before the clock runs out, without either touching the sweeper.

## Technical approach
Host browser tab + phone PWAs against a PartyKit Durable Object (one room object, authoritative). Server ticks at 10Hz. State: `{grid, pieces:[{id,pos,heading,moving}], sweeper, tick}`. Each tick the server deep-copies state and runs 40 deterministic forward steps with inputs frozen, emitting a `forecast` frame only to the Forecaster's socket. Piece sockets receive nothing but haptic-tick and pinned/free flags. The TV socket receives walls once plus scalar HUD data.

The genuinely hard part is forecast *stability*: recomputing every 100ms makes dots jitter as rounding cascades, which reads as noise instead of prophecy. Fix by snapping forecast positions to tile centers, only re-emitting when the forecast delta exceeds one tile, and cross-fading frames. Second hard part is tuning the blackout: 3s is guessed and must be play-tested against real speech latency (order → hear → thumb ≈ 1.2s).

## v1 scope
- Exactly 3 players: 1 Forecaster, 2 Pieces
- One hand-authored 12x12 maze, one sweeper, one 90s round
- Fixed 4s lookahead, fixed 3s blackout
- Join by 4-letter room code, no accounts, no lobby
- Win/lose card on the TV, then reload

## Out of scope
Multiple mazes, procedural generation, more than one hazard, spectator mode, scoring across rounds, hidden traitor Pieces, adjustable lookahead.

## Risks & unknowns
The Forecaster may sit silent to keep vision, stalling the game — the sweeper's forced advance should punish silence. The 4s horizon may be too long to reason about verbally. Pieces may find pure dial-turning inert without the haptic ticks landing crisply on mobile Safari.

## Done means
Three phones and a laptop on the same Wi-Fi complete a round in under 90 seconds; the Forecaster's screen provably greys within 150ms of any dial change; and in playtest, at least one round is lost because the Forecaster warned about a hazard and went blind to the dodge.
