## Overview

A four-player commit-and-watch game for a living room. Everyone is a hotel guest on the same floor at 2am, in a bathrobe, with an errand they'd rather not explain. You privately plan five moves down the hallway, everyone locks in at once, and then the TV plays the whole night out as a silent film. Any two guests in the same spot at the same moment is an ENCOUNTER: freeze-frame, awkward caption, both errands ruined.

## Problem

Party games reward getting on the same page. This one punishes it. The itch is the specific social comedy of *near-misses* — the hallway shuffle, ducking back into your doorway — and no existing party game makes "stay away from each other" the whole win condition. It also fixes the dead air of planning games: your plan is committed blind, so there's no analysis paralysis, just a 15-second wreck you can't stop watching.

## How it works

The hallway is 6 unlabeled nodes in a line (elevator, vending, ice, laundry, stairs, linen closet). Each player starts at their own door.

**Private on your phone:** your errand ("get ice", "retrieve the thing you left at the vending machine"), one leaked fact about exactly one other player's errand (leaks form a directed cycle, so nobody knows who's watching them), and a five-step planner — each step is LEFT / STAY / RIGHT. You submit all five at once.

**Public on the TV:** the hallway, four bathrobed stick figures at their doors, a 60-second planning clock, and nothing else.

Talking is allowed and is the trap. Two of the four errands need the *same* node, capacity is one guest per node per tick, and promises are unenforceable — so cheap talk is exactly as reliable as the person making it. Your errand and your leak are never verified by the system.

Playback: five ticks, deterministic. Same node = encounter. Swapping past each other on an edge also counts. Encounters void both players' errands. You score by completing your errand and being back at your own door on tick 5; a clean-but-failed night is worth a consolation point, so a doomed player still has a reason not to burn the room down.

## Technical approach

PartyKit Durable Object per room code. Model: `Room{code, phase, seed, players[{id, name, door, errandNode, leaksAbout, plan[5], locked}]}`. Phases: lobby → brief (15s) → plan (60s) → playback → scoreboard.

Sync is deliberately trivial: the only client→server payload is a five-move array. The server validates adjacency, waits for all four locks (or the timer), simulates all five ticks once, resolves node collisions and edge swaps, and broadcasts one immutable timeline plus a start timestamp. Host and phones animate from the same array — no per-frame state, no lag compensation, no rollback. Plans are never echoed to other clients before playback.

The hard part is instance generation, not networking. You need seeds where a collision-free assignment exists but the *greedy* plan (shortest path to your errand and back) collides for at least two pairs. Each player has only ~15 errand-satisfying plans out of 243; enumerate those per player, take the 4-way product, and reject any seed where the greedy tuple is already clean, or where fewer than ~8 clean tuples exist (too tight reads as unfair).

## v1 scope

- Exactly 4 players, 1 round, 6-node straight hallway, 5 ticks
- One errand and one leak per player, hand-authored from a pool of 8
- Room code join, no accounts, no reconnect
- Stick-figure playback with a freeze-frame on encounter
- Final card: everyone's errand revealed, pass/fail each

## Out of scope

Multiple rounds or floors, branching maps, hiding in rooms, audio/voice detection, spectators, persistent stats, 5+ players, animation polish beyond squares sliding.

## Risks & unknowns

60 seconds of silent planning may be dead air — test 45s. A table of friends may just honestly declare errands and solve it in one pass; the two-players-need-one-node contention is the only thing stopping that, and it may need to be two *pairs* in contention. Griefing by an already-doomed player is a feature until it isn't.

## Done means

Four phones and a laptop complete a 3-minute session: private plans submitted, a 15-second playback that fires at least one encounter freeze-frame, and a reveal card. Replaying the same seed with the same plans produces a byte-identical timeline.
