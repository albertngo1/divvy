## Overview

A three-player, ninety-second co-op where a single token on the TV is driven by everyone's thumbs at once — but a direction only moves the token if **exactly one** phone is holding it. Get seconded and your motion dies. For groups that want a physical, shouty, no-reading real-time game.

## Problem

Every shared-avatar party game sums inputs, so the safe play is always "everyone push the same way." That means the game's failure mode is chaos and its success mode is agreement — which is the least interesting shape for a room of people. Invert it: make agreement *nullify*. Now the group's rehearsed instinct ("UP! everyone UP!") is the trap, and the skill is live division of labor without ever seeing what anyone else's thumbs are doing.

## How it works

The TV shows a 7×7 maze, one token, one exit, a 90-second clock. Nothing else.

Each phone shows **only four big hold-buttons** — up/down/left/right. No map. Players must look up at the TV, which means their thumbs are working blind.

Every 100ms tick, the server computes the token's velocity: a direction contributes +1 cell/sec **only if exactly one phone is currently holding it**. Held by two or three phones → contributes zero. Held by nobody → zero. So forward progress requires the room to partition directions live, by voice, and re-partition every time the corridor turns.

The exit sits behind a diagonal corridor, which requires two *different* singleton holds simultaneously — you can't win by having one person drive while everyone else lets go.

**Private per-phone asymmetry:** every 2 seconds, exactly one of your four buttons lights an amber pip meaning *at least one other phone is on this button right now*. Which button gets the pip rotates independently per phone. So each player holds a rotating sliver of the room's true congestion state and the only way to use it is to yell it. Nobody ever sees the full picture; nobody can be sure who is doubling them.

**TV shows publicly:** token, maze, clock. Deliberately no per-player indicators — if the TV showed who was pressing what, the game would be solved.

## Technical approach

PartyKit Durable Object per room, phones as PWA clients over WSS via Tailscale Serve. Phones send only `hold{dir, up|down, clientTs}`; the server is the sole authority on hold-state, position, and pip assignment.

Because the phones render *no map*, there is nothing to predict and no rollback layer — the entire client-side prediction / reconciliation problem is designed out. The TV is a thin renderer of authoritative 10Hz position frames, interpolated.

The genuinely hard part is **hold-state truth under jitter**: a released button whose `up` packet is delayed keeps a direction falsely doubled and the room grinds for 300ms with no explanation, which feels like a bug rather than a rule. Mitigation: hold packets are heartbeated every 250ms and any hold without a heartbeat inside 400ms is dropped server-side; a lost connection releases all holds immediately.

## v1 scope

- Exactly 3 players. One hard-coded maze. 90 seconds. Win or lose, no score.
- The exactly-one-holder rule and the diagonal exit corridor.
- The rotating amber pip.
- Phones: four buttons and a connection dot. That's the whole UI.

## Out of scope

- Multiple mazes, player counts other than 3, obstacles, enemies, scoring, rematch flow, lobby, sound design.

## Risks & unknowns

- May be *too* punishing: a room that never partitions gets a token that never moves for 90 seconds, which reads as broken hardware. Might need a visible "seconded" flash on the TV as a teaching signal.
- The amber pip may be too slow to be actionable at 2s rotation.
- Sustained thumb-holding on a phone for 90 seconds may simply be uncomfortable.

## Done means

Three phones on a LAN; hold-to-move RTT measured under 120ms; holding the same direction on two phones produces visibly zero movement while a single holder moves the token; a lost connection releases holds within 400ms; and a fresh trio that has never played wins at least once in three attempts inside the 90-second clock.
