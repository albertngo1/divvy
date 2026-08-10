## Overview
A 4-player cooperative real-time escape game for a living room with a TV and four phones. One player is the **Spotter**, whose phone holds the only view of the house. Three players are **Runners**, whose phones are nothing but a d-pad and a whisper of what they can feel. One round runs four minutes.

## Problem
Every map-holder party game makes the holder omniscient, so the only tension is translation: the holder knows everything and fumbles the words. That gets old in two rounds. The itch is a holder who is *starved for attention* rather than starved for vocabulary — who has to choose, second by second, which of their friends they are willing to stop watching.

## How it works
A 9x9 dark house sits on the server. Three Runners start in a corner; each has a private exit tile somewhere on the perimeter. One Patroller moves a tile every 1.5s; touching a Runner freezes that Runner for 10 seconds.

**Spotter's phone (private):** a 3x3 window of the grid — walls, any Runner dots inside it, the Patroller if it is inside it. Tapping a new center starts a 2.0-second pan during which the screen is pure static. Nothing else. No minimap, no zoom-out, ever.

**Each Runner's phone (private):** four arrows, plus one line of local sense refreshed every move — "wall on your left", "draft ahead", "the floor is warm" — plus their own exit hint ("your exit is on the north wall"), different per Runner so the Spotter cannot solve it alone.

**Host TV (shared):** the fog of tiles Runners have physically touched, unattributed; the freeze counters; the clock. It never shows walls, the Patroller, or the Spotter's window. The room's only channel is voice.

The game is the Spotter's triage. Watching the Runner nearest the Patroller means the other two walk into walls in silence.

## Technical approach
Host browser tab plus phone PWAs against one PartyKit Durable Object per room. Server owns the whole sim at a 10Hz tick: `{grid, runners[{id,pos,frozen,exit}], patroller, spotter:{center,panUntil}, tEnd}`. Clients send intents only (`move:dir`, `pan:cell`); the server rejects a pan mid-pan and rejects moves during freeze. Critically, the server computes a **per-client view slice** and sends only that — the Spotter's socket literally never receives a tile outside its window, so cheating by inspecting the WebSocket is impossible by construction.

Hard part: latency honesty. A Runner's arrow tap must appear on the Spotter's phone in under 200ms or the Spotter blames the wrong person. Use client-side prediction for the Runner's own dot only, server reconciliation on the next tick, and a fixed 2.0s pan timer held server-side so nobody's laggy phone gets a cheaper pan.

## v1 scope
- One hand-authored 9x9 map, one Patroller, one four-minute round
- Exactly 4 players, fixed roles chosen at join, four-letter room code
- Win = all three Runners on their exits; lose = clock
- Eight canned local-sense strings; no art beyond squares and text

## Out of scope
Multiple maps or generation, role rotation, rematch flow, reconnect, haptics, audio, spectators, scoring or leaderboards, more than one Patroller.

## Risks & unknowns
The Spotter may just narrate continuously and never pan — tune pan cost and Patroller speed until standing still is fatal. Local-sense strings may be too vague to act on. 9x9 may be too large for four minutes; be ready to drop to 7x7.

## Done means
Four phones and a TV on the same LAN: three Runners reach their exits inside four minutes in at least one of five playtest rounds, at least one freeze happens per round, and a packet capture of the Spotter's socket contains no tile outside their current window.
