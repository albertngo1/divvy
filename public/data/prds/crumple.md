## Overview
Crumple is a concurrent-room party game for 3–5 players plus a shared host screen. Everyone is a driver trying to cross a small grid-intersection to reach their color-coded destination. The catch: every car moves in the *same instant*, nobody can see anyone else's chosen move, and a shared square touched by two cars at once destroys both. It's a blind simultaneous-movement puzzle where reading the room is the only skill and coordination is exactly what kills you.

## Problem
Movement party games are almost always turn-based or reflex-based. The itch Crumple scratches: the delicious dread of committing to a move *before* seeing what everyone else committed to — the split-second where you realize you and the red car both wanted the center tile. That feeling only exists if everyone acts privately and simultaneously.

## How it works
The host TV shows a 5×5 grid: every car's current position (colored token) and every car's *destination zone* (a matching-colored 1×1 goal, publicly visible to all). Because goals are public, collisions are *readable* — you can reason "green wants that corner, they'll cut left, so I'll wait."

Each phone PRIVATELY shows only a five-button D-pad (N/S/E/W/Wait) and a submit. Every tick (a ~6s window), all players secretly queue one move. When the window closes the server resolves *all moves simultaneously*: it applies every intended step, then checks for (a) two cars entering the same cell and (b) two cars swapping cells head-on. Any such pair is destroyed — both removed, both out. Survivors' new positions animate on the TV with a satisfying crunch. First car to land on its own goal wins the round; if everyone crumples, the room laughs and resets.

The phone never shows other players' queued moves — that hidden, simultaneous commitment is the entire game.

## Technical approach
Host browser tab + phone PWA clients + an authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). One Durable Object per room holds authoritative state: `{ tick, phase, grid, players: { id, color, pos:{x,y}, goal:{x,y}, queuedMove, alive } }`. Phones send `{tick, move}`; the server stores it privately and broadcasts only `phase`/countdown, never anyone's queued move. At window close (all-submitted OR timeout, default missing = Wait), the server runs one deterministic resolution pass and broadcasts the new authoritative snapshot.

The genuinely hard part is simultaneous conflict resolution: same-cell collisions are easy, but head-on swaps and chains (A→B's cell while B→A's cell) need a single-pass rule set that's provably order-independent, plus a rock-solid tick barrier that tolerates a disconnected or silent phone without stalling the room.

## v1 scope
- One round, one 5×5 grid, 3–4 players.
- Fixed start cells (edges) and fixed public goals.
- Same-cell + head-on collision detection only.
- 6s tick, missing submit = Wait.
- Host shows tokens, goals, and a crunch animation.

## Out of scope
- Obstacles, multi-cell cars, hazards, power-ups.
- Multiple rounds / scoring across games.
- Reconnection grace, spectators, animations beyond a crunch.

## Risks & unknowns
- Crashes may feel like luck rather than skill; public goals are the mitigation — playtest whether they make collisions predictable enough.
- 6s tick may drag with cautious players or feel rushed with bold ones.
- Grid may be too small (forced collisions) or too big (nobody ever meets).

## Done means
Four phones join a room, each sees only their private D-pad, the TV shows all tokens + goals, one full tick resolves all moves at once, a two-car same-cell entry visibly destroys both cars, and a surviving car reaching its goal ends the round — all with no phone ever revealing another's queued move.
