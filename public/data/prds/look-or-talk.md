## Overview

A 4-6 player co-op for a living room with a TV. One player is the **Cartographer**: their phone holds the only map of a maze. Three to five **Runners** each drive a token they can barely see. The gimmick: the Cartographer's map renders only while their phone's microphone hears silence. Speak, and the screen goes black.

## Problem

Every "one player reads the map" party game collapses into one confident person narrating a screen for four minutes while everyone else waits to be told what to do. The map-holder has too much bandwidth. Cutting their channel — not their information — is what makes the room actually cooperate.

## How it works

**Cartographer's phone (private):** the full top-down maze — walls, the exit, everyone's tokens. A local VAD watches the mic: RMS over threshold for 200ms blacks the screen, and it stays black for 1.2s after silence returns. You cannot look and talk. You get a look, hold ~4 seconds of geometry in your head, then describe it to a black rectangle.

**Each Runner's phone (private, and different per phone):** a thumb-stick, plus a "keyhole" — only the wall segments immediately adjacent to *their own* token, drawn as they touch them, plus a haptic bump on collision. Runner A's accumulated keyhole is not Runner B's; neither has ever seen the maze.

**Host TV (shared):** anonymous dots on a black field — everyone's position, no walls, no exit — the countdown, and a big lamp that lights whenever the Cartographer is talking, so the room can see them blinding themselves.

Win: all Runners on the exit tile within 3 minutes. The comedy is reliable — someone starts "okay, there's a gap two left of the—" and watches their own map die mid-sentence.

## Technical approach

Host browser tab + phone PWAs + a PartyKit Durable Object as the authoritative sim at 20Hz. Runners send intent vectors (dx, dy) at 15Hz; the server integrates, resolves collisions, and — critically — **filters views server-side**: each Runner socket receives only its own pose plus a 3x3 adjacency mask, so the maze is not in any Runner's payload to be inspected. The Cartographer receives the full grid once at join; the mic gate is client-side rendering, with the gate's boolean broadcast so the TV lamp and the sim agree.

Hard parts: (1) VAD in a room with a TV and four shouting people. Calibrate per device — 2s of room noise at join sets threshold = noise floor + 9dB — and use asymmetric hysteresis so a cough doesn't cost 1.2s. (2) Making "blind" feel fair rather than broken: at 2 tiles/sec, no client prediction is needed, but bumps must be haptic within ~80ms or the keyhole feels like lag, not geometry.

## v1 scope

- One hardcoded 12x12 maze, one exit
- 1 Cartographer + 3 Runners, no lobby beyond a 4-letter room code
- 3-minute timer, win/lose card, no scoring or rounds
- Mic gate, keyhole, TV dots, blind lamp. Nothing else

## Out of scope

Multiple mazes, maze generation, pressure plates or two-player puzzles, rematch flow, role rotation, mobile-web audio-permission polish beyond one working browser, spectators, whisper detection.

## Risks & unknowns

VAD may fire on the TV's own audio (mitigate: mute the host tab in v1). The Cartographer role may be miserable rather than funny if 4s of memory isn't enough — tune the black-out release, not the maze. Runners may find the keyhole so sparse that they stop trying.

## Done means

Four humans in one room play a full round. The Cartographer's map blacks within 300ms of normal-volume speech and returns within 1.5s of silence, measured on two different phones. A WebSocket payload dump from a Runner client contains no wall data outside its own 3x3. At least one of the first three playtest groups reaches the exit, and at least one group loses because someone talked too much.
