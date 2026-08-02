## Overview

A 4-player cooperative panic game for a living room with a TV. One player is the **Driver**: their phone is the only screen in the room that can show the maze. The other three are **Layers** — each privately owns one visual stratum of that maze (Walls, Pits, Exit) and can project it onto the Driver's phone by holding a button. Layers never see the maze. They are, literally, parts of a board that cannot look at itself.

## Problem

"One person has the map" games collapse into one person narrating and everyone else obeying. The blind players have no agency — they're joysticks. Acetate inverts it: the blind players control *what the sighted player is allowed to see*, so the map-holder becomes the one begging for information.

## How it works

Host TV (public): a single dot on a black field, its breadcrumb trail, a move counter, and three draining battery bars labeled WALLS / PITS / EXIT. No terrain, ever. The room watches a dot wander in the dark while three batteries die.

Driver's phone (private): the dot plus a swipe pad. Terrain renders **only while a Layer is holding their button** — hold WALLS and the maze geometry fades in for as long as the thumb stays down.

Each Layer's phone (private): their layer name, one giant hold-to-emit button, and their own remaining battery (12 seconds per Layer, per round). Nothing else. They never see the maze they are emitting.

The contention rule is the game: if two Layers hold simultaneously, the Driver's phone garbles (both layers render as noise) and **both** batteries drain anyway. So the room must verbally sequence itself — the Driver shouts "walls, walls, walls — off — exit!" while three people fight for the same channel and burn budget on collisions.

One swipe = one tile of movement, resolved instantly. Stepping on a Pit teleports the dot to the start (trail intact — public humiliation). Win: reach the Exit within 40 moves before all three batteries hit zero.

## Technical approach

PartyKit Durable Object per room; host tab and four phone PWAs on one WebSocket room. Server is authoritative and holds: `maze` (10x10 tile grid with wall bitmasks, ~6 pits, 1 exit), `dot`, `trail[]`, and `layers: {walls|pits|exit: {battery_ms, holding: bool}}`.

Phones send `HOLD_DOWN` / `HOLD_UP`; the server ticks at 20 Hz, decrements battery for every holding layer, computes `activeLayers`, and broadcasts a **per-role diff**: the Driver gets the tile payload for exactly the currently-held layer (or a `GARBLE` flag if `activeLayers.length > 1`), the Layers get only their own battery number, the host gets dot + trail + three battery numbers. Role-scoped payloads matter — never ship the maze to a client that shouldn't have it, because View Source is the whole exploit.

Hard part: hold/release latency. A 200 ms round trip makes a 400 ms flash feel stolen. Fix: optimistic local battery countdown on the Layer phone reconciled to server ticks, and server-side grace — the first 150 ms of an overlap doesn't count as a collision, so a handoff isn't punished but hogging is.

## v1 scope

- Exactly 4 players, exactly 1 maze, 1 round
- Hard-coded 10x10 maze, three layers, 12 s batteries, 40 moves
- Four-arrow swipe pad, no diagonals, no undo
- Host screen: dot, trail, 3 battery bars, win/lose card
- Room code join, no accounts, no reconnect

## Out of scope

Multiple rounds, generated mazes, more layers, Driver rotation, scoring/leaderboards, spectators, sound design, mobile haptics.

## Risks & unknowns

The collision rule may read as "broken" rather than "tense" — needs a loud, unmistakable garble visual. Battery budget is untuned: 12 s may be trivially generous or brutal. The Driver may just memorize the maze in one long hold, defeating the layering — mitigate by putting Pits on a layer that can only be checked *before* stepping, and by making walls redraw shifted if held over 3 s continuously.

## Done means

Four phones join a room code; the Driver's maze is invisible until a Layer holds; two simultaneous holds visibly garble and double-drain; the dot resets on a pit; the round ends in a win or a battery-out loss; and at no point does any Layer phone or the host TV ever receive maze tile data over the wire.
