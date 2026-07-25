## Overview

A four-player, three-minute co-op where one phone is a tilting labyrinth and the other three phones are geological forces. The **Cartographer** holds the only screen showing the map and the marble rolling on it. The three **Faults** each hold a phone with one enormous button, privately labelled with a single world-transform: `ROTATE ↻`, `MIRROR ⇄`, or `SHOVE ROW`. They cannot see the board. The Cartographer cannot see who holds which verb.

## Problem

Every blind-maze game makes the pieces move themselves — the sighted player is a remote control and the pieces are servos. Nobody's ever handed the blind players *the physics instead of the position*. The itch: what if the people who can't see the world are the only ones who can change it, and each of them owns exactly one verb they can't describe well and can't use twice cheaply?

## How it works

A 5×5 tilted tray, one marble, walls, and a drain. The world runs on a metronome: 3-second **beats**, twelve of them.

Within a beat each Fault may press their button once, secretly. At beat end the server applies every pressed transform (in fixed verb order), then gravity settles the marble exactly one cell downhill. The Cartographer watches this happen on their phone and narrates aloud — *"it's stuck in the top-right pocket, I need the whole thing turned, not flipped"* — and the Faults have to work out from that whether their own verb is the one being asked for.

Contention is the joke. If two or more verbs fire in the same beat, the board takes a **crack**: a new wall spawns at the marble's cell. So "somebody do something!" is actively dangerous, and the group has to develop a spoken protocol for *who is claiming this beat* without anyone ever naming their verb outright.

**Privately on a Fault's phone:** the beat countdown, one button with their verb glyph, and after the beat, whether their press landed and whether it collided with someone else's. Nothing about the marble. **Privately on the Cartographer's phone:** the tray, the walls, the cracks, the marble, the drain. **Host TV:** the metronome pulse, beats remaining, and an unattributed effects ticker — `THE WORLD TURNED`, `THE WORLD FLIPPED`, `THE WORLD CRACKED` — so the room feels consequences without seeing causes. On win or timeout the TV replays all twelve beats with the board visible and every press attributed.

## Technical approach

PartyKit Durable Object; host tab plus three phone PWAs over WebSocket. State: `{ tray: Cell[25], marble: {x,y}, cracks: [], verbs: {connId → 'rot'|'mir'|'shove'}, beat, presses: {connId → true} }`.

The server owns the metronome — phones never schedule beats locally, they render a countdown interpolated from a server `beatStartedAt` plus a per-connection latency estimate from WS ping/pong. Presses are timestamped server-side on arrival and bucketed into the current beat; a press arriving in the last ~150ms of a beat is the hard case, and v1 resolves it by hard server-side cutoff with immediate `TOO LATE` feedback rather than by rollback. The other hard part is the same as any asymmetric room: a `viewFor(connId)` projection so the map is only ever serialized to one socket.

## v1 scope

- Exactly 4 players. First to join is Cartographer; next three get one verb each.
- One hand-authored 5×5 tray, one marble, one drain.
- Twelve 3-second beats. Win = marble reaches the drain.
- Three verbs only: rotate CW, mirror left-right, shove top row down (cyclic).
- Collision penalty = one crack. That is the entire failure model.
- TV: metronome, beats left, unattributed ticker, end replay.

## Out of scope

More verbs, verb reassignment, multiple marbles, generated trays, reconnect, scoring across games, tilt/accelerometer input of any kind.

## Risks & unknowns

The biggest unknown is whether three verbs are *expressive enough* to actually solve a tray — the level must be hand-solved on paper first, and it may turn out only one solution path exists, which makes the Cartographer a dictator again. Mitigation: design the tray with two viable routes. Second risk: 3-second beats may be too fast for the Cartographer to narrate a rotated board they're still parsing; beat length needs to be a tunable constant from beat one.

## Done means

Four devices join, one renders a maze the other three provably cannot fetch, and a full twelve-beat game runs on a server-owned clock with no drift over the round. Two simultaneous presses reliably produce exactly one crack, the TV ticker never reveals who pressed, and the end replay reconstructs the identical board history from the event log.
