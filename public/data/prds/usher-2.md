## Overview
A co-op navigation party game for 4 people (1 Usher + 3 patrons). One player's phone is the theater floor map; the others are patrons fumbling to their seats in the dark, blind to everything. For groups who like Keep-Talking-and-Nobody-Explodes tension but want it physical and silent.

## Problem
"One phone is the board" games usually collapse into the map-holder just reading coordinates aloud. That's a walkie-talkie, not a game. The itch: make the guide's *bandwidth* the puzzle, and make the pieces genuinely, simultaneously blind so the guide has to triage panic in real time.

## How it works
Setting: a dark theater between acts. The **Usher** holds the only map.

- **Usher's phone (PRIVATE map):** a 4×4 seat block with aisles, a live dot per patron, and each patron's assigned seat shown in that patron's color. House rule: the Usher **may not speak**. Their only tool is a single penlight — they tap a patron's dot, flick a direction, and a colored arrow flashes on *that one patron's* phone for ~1 second. One signal per beat; three patrons stumbling at once means constant triage.
- **Each patron's phone (PRIVATE, no map):** a big 4-way step pad (forward/back/left/right), their seat color, and nothing else. They queue one step. On a shared metronome beat (every 3s) all patrons step **simultaneously**. Hitting a seat/wall buzzes only *that* phone.
- **Host TV (SHARED):** a closed curtain and a beat metronome during play — no positions, no help. At round end it lifts the curtain and replays the whole stumble as a top-down animation.
- **Win:** all three patrons seated in their assigned seats before the 2-minute house lights.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). **Data model:** `Room{grid, seats[], beat}`, `Patron{id,color,pos,facing,assignedSeat,lastBump}`, server-owned. **Sync:** server emits a `beat` tick; movement is server-authoritative — it collects queued steps, resolves collisions (blocked = no move + private bump), broadcasts only each patron their own private state, sends the Usher the full board, and sends the TV nothing until reveal. Penlight signals are Usher→server→single target, never broadcast. **Genuinely hard part:** the simultaneous-beat resolution loop feeling fair and tight under phone latency — queued moves must lock at a server deadline (~300ms before the tick) so a laggy patron doesn't desync the beat, and the metronome must stay phase-locked across four devices.

## v1 scope
- Exactly 4 players: 1 Usher, 3 patrons.
- One hand-authored 4×4 seat block, one assigned seat each.
- One 2-minute round, penlight + step-pad + beat, TV reveal replay.
- Bump buzz via `navigator.vibrate`.

## Out of scope
- Multiple rounds, scoring ladder, rotating who ushers.
- Larger theaters, obstacles, moving props.
- Any Usher-to-patron channel other than the single penlight.

## Risks & unknowns
- Is one penlight-per-beat too starved to ever seat 3 patrons? Tunable via beat interval and grid size.
- Blind step-pad orientation (relative vs absolute facing) may disorient — needs playtest.
- Metronome drift across phones on flaky wifi.

## Done means
Four phones join, the Usher silently penlights three blind patrons into their correct colored seats within one round, the TV reveals the replay, and at least one tester says the triage-under-pressure was the fun part.
