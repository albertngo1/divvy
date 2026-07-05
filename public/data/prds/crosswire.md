## Overview
Crosswire is a cooperative navigation party game for 4–6 people: one **Navigator** whose phone is the only place the maze exists, plus 3–5 blind **Pieces**. The Navigator can see the whole board and everyone's position; the Pieces see nothing but a swipe pad. The catch: every Piece's directional controls are secretly rotated (and never the same as their neighbor's), so guiding the room is a comedy of miscalibration under a timer.

## Problem
Blind-guide games ("go left, no your other left") get stale because the guide's mental model is trivially correct. Crosswire breaks the guide's intuition on purpose: "north" out of your mouth is not "north" out of a Piece's thumb, and each Piece is wrong in a *different direction*. The itch is the dawning realization — "Anna, to go up you have to swipe *right*" — repeated per person, live.

## How it works
The **Navigator's phone** shows the full 6×6 grid: walls, the exit gate, and a live dot per Piece with their name. Each **Piece's phone** shows only a big swipe pad and a private "bump" flash when they hit a wall — no map, no other Pieces. Each Piece is silently assigned a rotation (0/90/180/270°). When a Piece swipes "up," the server rotates the intent by their secret angle before moving them. The Navigator watches the dots drift the wrong way, infers each Piece's offset, and shouts corrected instructions ("Ben, swipe *down* to go up"). Room wins when every Piece reaches the gate before time runs out. The **host TV** shows only a blurred fog grid with moving dots, a bump counter, and the countdown — tension for spectators, no map leak.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{code,phase,timer}`, `Board{w,h,walls[],gate,spawns[]}` (server-authoritative, mirrored only to the Navigator), `Piece{id,name,pos,rotation,secret}`. Sync: Piece emits a swipe vector; server applies `rotation`, attempts the move, and either updates `pos` (broadcast to Navigator + host) or emits a private `bump` to that Piece. Messages are tiny, resolved immediately, no lockstep tick needed. The genuinely hard part is *gesture reliability + fairness*: normalizing swipe direction across phone sizes/orientations, and debouncing so a laggy bump doesn't feel like a phantom wall. Tuning the number of simultaneous scrambles a single Navigator can juggle (2–3 before overload) is the balance knob.

## v1 scope
- Single fixed 6×6 maze, one gate
- 4 players: 1 Navigator + 3 Pieces
- Rotations only (0/90/180/270°), no mirroring
- 3-minute timer, win = all 3 Pieces reach the gate
- Host shows fog dots + timer + win/lose card

## Out of scope
- Mirror/flip transforms, drifting scrambles
- Multiple rounds, scoring beyond win/lose
- Hazards, moving walls, procedural maze generation

## Risks & unknowns
- Swipe detection inconsistency across devices could feel unfair
- One Navigator tracking 3 different scrambles may be too hard — may need 2 Pieces in v1
- Whether players talk over each other productively or just chaotically

## Done means
Four phones + a host screen: three Pieces swipe blind with distinct secret rotations, the Navigator (seeing the map on their phone) talks all three to the gate within 3 minutes, and the host plays a win animation.
