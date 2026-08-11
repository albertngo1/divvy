## Overview

A four-player cooperative real-time game for people already sitting around a TV. One player (the Board) holds a phone that renders the entire marble maze; tilting that phone applies gravity to *every* marble in the game. The other three (Pieces) are marbles. They cannot see the maze. Each of them holds a single brake button and a secret they haven't told anyone: which goal pad is theirs.

## Problem

Map-holder games nearly always give the holder per-piece control — "you, go left" — which collapses into one person barking turn-by-turn directions while everyone else obeys. That's a chore, not a game. The itch: make the map-holder genuinely unable to move one person without moving everyone, so the room has to negotiate a shared trajectory instead of taking dictation.

## How it works

The Board's phone privately shows: an 8×8 walled maze, three pits, three colored goal pads, and all three marbles live. Their DeviceOrientation is the world's gravity vector — one tilt, everything rolls.

The shared TV shows only three moving dots on black plus a 90-second clock. No walls, no pits, no pads. The room watches motion and infers geometry from it.

Each Piece's phone privately shows three things: a fat BRAKE button (hold = high friction, drains a 4.0s budget that never refills), a one-line contact readout that updates live ("wall on your right", "open ahead", "edge"), and their own goal color. Critically, the Board does *not* know the assignment — they see three unlabeled pads and three marbles.

So play sounds like: Board says "there's a blue pad up and left of the pack, but a pit between here and it." A Piece says "blue is mine." Board tilts up-left; the other two burn brake to anchor while the blue marble rolls. Brake is scarce, so anchoring for someone else is a real gift.

Win condition: all three marbles rest on their own pad simultaneously for one full second before the clock runs out. Falling in a pit respawns you at the start with your brake budget unchanged — a time cost, not a wipe.

## Technical approach

Host browser tab + phone PWAs + an authoritative WebSocket server (PartyKit Durable Object, one per room code).

Data model: `Room { code, phase, seed, gravity: {x,y}, marbles: [{id, pos, vel, brakeLeft, padColor}], pads, walls, pits }`. Only the server owns marble state.

Sync: the Board's phone streams a smoothed gravity vector at 20 Hz (low-pass filtered, dead-zoned, calibrated to whatever "flat" means when they press Start). The server steps a 2D circle-vs-grid physics sim at 30 Hz and broadcasts positions. The Board renders interpolated state; Pieces render nothing spatial, only their derived contact string.

The genuinely hard part: brake must feel instant on the Piece's phone while physics stays server-authoritative. Brake presses are applied optimistically client-side for the local contact readout and simultaneously sent as timestamped intents; the server applies them at the received tick and the client reconciles. Rubber-banding on brake is the failure mode to tune for. Second hard part: tilt calibration — a phone held at a lazy 30° must read as neutral.

## v1 scope

- Exactly 4 players, roles assigned by join order (first = Board)
- One hand-authored maze, one layout, fixed pad colors
- 90-second timer, one round, then a Play Again button
- Brake, contact readout, goal color — nothing else on a Piece's phone
- Room code on the TV; no accounts, no lobby, no reconnect

## Out of scope

Multiple mazes, maze generation, more than 3 Pieces, rotating the Board role between rounds, scoring/leaderboards, spectators, sound design, any traitor variant.

## Risks & unknowns

Gyro drift over 90 seconds may make "level" wander. Three marbles under one gravity may be trivially solvable or completely impossible — the pit/pad layout needs playtesting, not theory. The contact readout may be too thin to be useful, or so useful that Pieces stop listening to the Board.

## Done means

Four phones join a code, the Board tilts, three marbles visibly move together on both the Board's phone and the TV within 150 ms, a held brake stops one marble while the others keep rolling, and a real group of four wins at least once and loses at least once across ten attempts.
