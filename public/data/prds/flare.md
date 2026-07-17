## Overview
Flare is a 3-5 player cooperative party game for a shared host screen plus phone controllers. One player is the **Spotter**, whose phone shows the full board. Everyone else is a **Walker** whose phone is a pane of black glass. For groups who like sweaty, verbal, trust-the-caller co-op — Keep Talking and Nobody Explodes energy, but the map is a physical spatial thing you cannot describe fast enough.

## Problem
Most "one person navigates the blind" games collapse the instant someone glances at the screen — the private view is decorative. And pure verbal guidance ("up, up, left") is boring because the caller has infinite bandwidth. Flare's itch: the caller has *too little* bandwidth for too many people at once, so guidance becomes a rationing problem, not a description problem.

## How it works
The host TV shows only a title, a countdown, and anonymized status lights (who's alive, who's home). It never shows the map.

**Spotter's phone (private):** a fully-lit top-down grid — safe tiles, pits/mines, and every Walker's live position as a colored dot. A rising "flood line" advances one row every few seconds; a Walker caught below it is out.

**Each Walker's phone (private):** all black except a 4-way move-pad and a tiny heartbeat that quickens near danger (no direction, just dread). Walkers move **simultaneously in real time**.

The Spotter's only reveal tool: tap any Walker to pop a **flare** — for 2 seconds, a small radius around *that Walker* lights up *on that Walker's phone only*. Flares are limited (e.g. 8 total for the round). The Spotter can also talk, but with 3 walkers moving at once verbal bandwidth is saturated — flares parallelize what a mouth can't. Win = all Walkers reach the top row before the flood or the flares run out.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, one room object per game; Socket.IO over Tailscale Serve as fallback). Data model: `Room { grid: Tile[][], floodRow, flaresLeft, players: {id, role, pos, alive} }`. The DO holds authoritative state; Walker move taps are intents validated server-side (no client trusts its own legality — a pit tap kills you). Server ticks the flood at fixed interval and broadcasts. The genuinely hard part is **fair real-time movement at ~10Hz across phones on hotel wifi**: use small delta messages, server-authoritative position, and interpolate Walker dots on the Spotter's phone; flare events are one-shot broadcasts with a server timestamp so the 2s window is consistent. Keep the grid small (8x8) so state fits one packet.

## v1 scope
- 1 Spotter + 2 Walkers, one 8x8 board, one round.
- Pits only (no moving hazards), fixed flood speed, 8 flares.
- No accounts, no lobby beyond a room code; refresh = rejoin by seat.
- One win/lose screen, no scoring or streaks.

## Out of scope
- Multiple rounds, difficulty curve, board editor.
- Moving enemies, fog that regrows, powerups.
- Spectator view, replays, cosmetics.

## Risks & unknowns
- Does verbal guidance trivialize it at 2 walkers? Tune walker count / flood speed so mouths saturate.
- Latency fairness — a lagged Walker dying feels unfair; may need input buffering.
- Black-screen phones feel like nothing is happening; the heartbeat haptic must sell tension.

## Done means
Three phones join a room code; two Walkers cross a shared board they cannot see using only the Spotter's talk plus ≤8 flares that light only the targeted Walker's own screen; the game ends in a clear win (both home) or loss (flood/flares out) with no console errors across a full round.
