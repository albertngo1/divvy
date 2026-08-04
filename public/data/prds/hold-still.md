## Overview
A 4-player, 6-minute cooperative navigation game for a TV plus four phones. One **Surveyor** holds the map; three blind **Walkers** hold drag pads. The map is rendered as a long exposure: it resolves into a sharp, readable image only while every Walker is motionless, and smears into unreadable mush the instant anyone moves. Win condition: all three Walkers standing on their three colored pads at the same time, inside 2 minutes.

## Problem
Asymmetric map games usually make information *scarce* (fog, budgets, handoffs). This one makes it **conditional on other people's behavior**, and — the load-bearing part — the people whose behavior controls it cannot observe the thing they're ruining. A Walker fidgeting on their pad has no signal that they are blinding the Surveyor. That gap is the entire comedy engine, and it only exists because each phone is a separate, private, simultaneously-live surface.

## How it works
Each Walker's phone privately shows: a black screen, a full-width drag pad, and a small private counter of how many steps they've taken since the last time the room was still. That's it. No map, no heading, no teammates. Finger down and moving = walking. Finger lifted = still. A tremor deadzone means resting a finger is safe.

The Surveyor's phone privately shows the maze, the three colored goal pads, and three live dots — rendered through a blur whose radius tracks the room's *aggregate* motion over the last 800ms. Total stillness resolves the image over ~1 second. One person twitching keeps it illegible. The Surveyor never learns *who* is moving; they only see mud.

A **shutter budget** of 20 seconds meters legibility: the clock burns budget while the image is sharp. When it hits zero the map never resolves again and the endgame is played from the Surveyor's memory and the Walkers' step counts.

The host TV shows the clock, the shutter budget draining, and a blurred silhouette of what the Surveyor is currently seeing — enough for the room to feel the failure, not enough to navigate by.

## Technical approach
PartyKit Durable Object, 20Hz authoritative tick. State: `{maze, walkers: {id, x, y, stepsSinceStill}, motionEnergy, shutterRemaining}`. Walker clients send pad-delta intents at 30Hz; the server integrates position and accumulates a per-tick `motionEnergy` from the sum of all walker displacements, exponentially decayed.

The hard part is that blur is a *global* function of three clients' inputs, so it must be computed server-side and broadcast as one scalar — but it also has to feel instantaneous to the Walker who caused it, and the Surveyor sees it ~70ms late. Naive rendering makes stillness feel unrewarded. Fix: the server sends `motionEnergy` with the tick it was computed for, and the Surveyor client interpolates blur toward it over ~150ms, so the resolve reads as a camera focusing rather than a network stutter. Blur itself is a cheap two-pass canvas downsample, not a CSS filter (which stutters badly on mid-range Android).

## v1 scope
- Exactly 4 players, one hand-authored maze, one 2-minute round.
- 20-second shutter budget, hard zero.
- Win/lose only. No scoring, no rematch flow, no reconnect.
- Walker phone renders three things: pad, step count, wall-bump flash.

## Out of scope
Multiple rounds, per-Walker blur attribution, hazards, Surveyor rotation, procedural mazes, audio cues, any spectator view.

## Risks & unknowns
The blur may read as "broken screen" rather than "long exposure" — needs a visible grain/exposure treatment to sell it. If total stillness turns out to be trivially achievable once the group discovers "everyone lift up on three," the game collapses into turn-based play; countermeasure is charging shutter budget in real time so coordinated freezes are expensive. Walker boredom during long freezes is a real risk at 4 players and worse at 5.

## Done means
One cold group, one TV, four phones: they either stand on all three pads inside 2 minutes or they don't, nobody asks how the blur works twice, and at least one round ends with the Surveyor out of shutter budget navigating from memory.
