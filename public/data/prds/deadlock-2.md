## Overview
Deadlock is a concurrent-room party game for 3-6 players. The shared host screen is a tiny rail network with one shared bottleneck segment; every player's phone privately drives one train toward a private destination. The room becomes a silent right-of-way standoff where the whole fun is *not* moving at the same moment as everyone else.

## Problem
Most co-op games reward you for lining up your actions. The itch here is the opposite: the thing everyone instinctively wants to do — all surge forward together — is exactly the thing that punishes you. There's no chat, no turn order, only a shared board and the dread of a collision you can't see coming.

## How it works
The host TV shows a small directed graph: a few spur nodes feeding into ONE shared middle segment, then out to exit nodes. Occupied segments light up publicly (so everyone sees *where* trains are) but never *who intends to move next*.

Each phone PRIVATELY shows: your own train's current node, your goal node, your legal next moves, and a single ADVANCE / HOLD toggle. Every ~1.5s tick the server resolves all committed moves simultaneously. If two trains would occupy the same segment on the same tick, both derail (crash animation on the TV, both players score a big penalty). Reach your goal cleanly and you bank points. Deadlock — everyone HOLDing forever as the clock runs out — costs everyone.

The shared screen shows collisions and positions; the private phone hides intent. That gap is the entire game: you must read the public board and *guess* whether the other trains will yield or barge.

## Technical approach
Host tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Game { tick, segments: {id -> occupantTrainId|null} }`, `Train { id, playerId, node, goalNode, committedMove }`. Sync: phones send `commit(move)` before a tick deadline; the server snapshots all commits, resolves conflicts (same target segment -> derail both), broadcasts the new authoritative state, advances tick. The genuinely hard part is fair simultaneity: late/duplicate commits, and making the tick deadline feel tight but forgiving under phone-network jitter. Use server-authoritative ticks with a short grace window; a missing commit defaults to HOLD.

## v1 scope
- Exactly 3 trains, one shared middle segment, ~5 nodes total.
- One round, ~10 ticks, first-to-goal + no-crash scoring.
- ADVANCE/HOLD only — no branching route choices.
- Host screen: board + crash flash + score line.

## Out of scope
- Multiple bottlenecks, junction switching, longer trains.
- Reconnection, lobbies, avatars, sound design.
- More than one round or a scoreboard across rounds.

## Risks & unknowns
- Games could stall into permanent mutual HOLD; a shrinking clock + hold-penalty must force action.
- Tick pacing: too fast feels twitchy, too slow feels dead.
- Whether 3 trains generates enough tension or needs 4.

## Done means
3 phones join a host, each sees only its own train + goal, and in one ~10-tick round two trains committing ADVANCE into the shared segment on the same tick both visibly derail with a penalty, while a clean solo pass banks points.
