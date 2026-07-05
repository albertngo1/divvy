## Overview
A real-time cooperative evacuation game for 4-6 players. One player is **Dispatch**, whose phone is the live floor plan (the board). Everyone else is a blind **Occupant** who can only see a single directional cue Dispatch beams to their phone. It's for party groups who like sweaty, wordless coordination under a timer.

## Problem
Most "one phone is the map" games let the map-holder just talk — so the phone is decoration and one screen passed around would work fine. The itch here: force the map-holder to communicate through many private channels at once, so the fun is genuinely in the per-phone plumbing, and the silence.

## How it works
The host screen shows only a smoky fog-of-war: occupant dots and a slowly spreading hazard, but **no walls** — the layout is secret to everyone except Dispatch. Dispatch's phone shows the full plan: walls, exits, hazard front, and every occupant's true position. Dispatch has a control panel — one dial per occupant — and each tick sets that occupant's private cue: an arrow (N/E/S/W), STAY, or a red STOP pulse. Crucially, **Dispatch may not speak or gesture.** Each Occupant's phone shows ONLY their own current cue and a tick countdown; they never see the map, the walls, or anyone else's cue. On each 4-second tick, all occupants step simultaneously in whatever direction their cue last showed. Walk into a wall and you waste the tick; step into hazard and you're down. The room wins if everyone reaches an exit before the hazard fills the floor. Dispatch is juggling 5 private conversations at once with no words — that's the whole game.

## Technical approach
Host tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object holding one room). Data model: `Room { grid: Cell[][], hazardFront, tick, occupants: {id, pos, alive, cue}[], dispatchId }`. Only the Durable Object holds `grid`; the host receives a masked projection (dots + hazard, no walls), each Occupant receives just `{cue, tickEndsAt}`, Dispatch receives the full state. Sync: server owns a fixed tick clock; Dispatch's dial changes are buffered and applied at tick boundaries so nobody moves mid-tick. The genuinely hard part is fairness of the tick — every phone must render its cue and the countdown with the same deadline despite latency, so the server timestamps `tickEndsAt` and clients interpolate locally rather than trusting round-trips.

## v1 scope
- One fixed 8x8 map, one hazard that spreads one cell/tick from a corner
- 1 Dispatch + 3 Occupants, one round, ~90s
- Cues limited to 4 arrows + STOP; simultaneous stepping
- Win/lose screen showing who got out

## Out of scope
- Multiple maps or a map editor, doors/keys, difficulty tuning
- Reconnection grace, spectators, scoring across rounds

## Risks & unknowns
- Dispatch cognitive overload with 5+ dials may tip from tense to miserable — needs playtest to find the occupant count sweet spot.
- Silence rule is only enforceable socially; may need a host "comms down" framing to hold.
- Tick length balance: too fast is chaos, too slow is boring.

## Done means
On one host + 4 phones over LAN, Dispatch privately steers 3 blind occupants around walls to an exit before hazard fill, every occupant only ever sees their own arrow, and the host correctly declares win or loss.
