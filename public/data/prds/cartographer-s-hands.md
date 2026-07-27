## Overview

Cartographer's Hands is a 3-5 player cooperative game where exactly one player (the Cartographer) holds the room's only map on their phone, and the rest are Walkers whose phones show nothing but a heading dial and a vibration motor. The Cartographer is under a strict vow of silence. Everything they know must travel through buzzes. It's for groups who like the specific comedy of watching two people invent a private language under time pressure and get it slightly wrong.

## Problem

Most "one person knows the map" games (Spaceteam, Keep Talking) collapse into fast shouted English. The information asymmetry is real but the channel is fat, so the game becomes a reading-comprehension race. The itch: what if the guide's bandwidth were genuinely tiny — a few bits per second, felt not heard — so the *protocol* becomes the game and the room falls silent instead of loud?

## How it works

The host TV shows a 5x5 grid of fog: every cell grey, plus one goal tile glowing and a shared 3-minute clock. It never shows the maze walls or where anyone is standing.

The **Cartographer's phone** privately shows the full maze: walls, hazard tiles, the goal, and a live dot for each Walker with a colored ring. Their only controls are three send buttons — SHORT, LONG, DOUBLE — plus a Walker selector. No text field. No mic. The vow of silence is enforced socially and by a mic-level shame meter on the TV that flashes if the room gets loud.

Each **Walker's phone** shows a compass rose with four cardinal wedges and a big STEP button. Nothing else — no maze, no other Walkers, no goal. They feel a buzz pattern, interpret it however the group's improvised protocol says, turn their body (device orientation picks the wedge), and press STEP. Their move resolves on the server against the real maze. Walls block silently — the phone gives one dull thud, and the Cartographer sees the failed bump on their map. Hazard tiles cost the shared clock 15 seconds and are announced on the TV as a red flash, so everyone knows *someone* blundered but not who.

The crucial asymmetry: the Cartographer must address Walkers one at a time, so every buzz spent on Alice is a buzz not spent on Ben, and Ben is out there stepping into walls in the dark. Walkers cannot see each other's phones and get no confirmation their reading was right except the absence of a thud.

Win: all Walkers reach the goal tile before the clock dies.

## Technical approach

Host tab + phone PWAs + a PartyKit Durable Object per room. Data model: `Room { maze: bool[5][5][4] walls, goal, phase, clockMs }`, `Player { id, role, pos, heading }`. Client→server messages: `SEND_PULSE {targetId, pattern}` and `STEP {dir}`. Server→client: private `PULSE` to one Walker, private `MAP_STATE` to the Cartographer only, redacted `FOG_STATE` to the host.

The genuinely hard part is haptic fidelity. `navigator.vibrate` is unavailable on iOS Safari, so pulses must degrade to a full-screen flash plus a Web Audio click through the phone's speaker — which leaks to the room. v1 targets Android for true haptics and treats iOS as a documented downgrade. Second hard part: pulse ordering. If two pulses queue, they must not smear together; the server timestamps and the client plays them through a serialized queue with a forced 250ms gap.

## v1 scope

- 4 players: 1 Cartographer, 3 Walkers, one 5x5 maze, one 3-minute round
- Three pulse patterns only; no protocol UI, no cheat sheet — players negotiate before the round starts
- Walls block, hazards cost time, goal is a single tile
- No scoring beyond win/lose and time remaining

## Out of scope

- Multiple mazes, procedural generation, difficulty tiers
- Any text channel, emoji channel, or in-game protocol builder
- Cartographer rotation across rounds
- iOS haptics parity

## Risks & unknowns

- iOS vibration gap may halve the addressable room; the audio-click fallback partly breaks the silence premise
- Three patterns may be too few to express four directions — expect groups to invent timing-based encodings, which is either the best part or a frustration wall
- Device-orientation heading drifts; needs a "face the TV" zeroing step
- Enforcing silence is social, not technical, and one loud player ruins it

## Done means

Four phones join a room code. The Cartographer sees a maze the others provably cannot (verified by screen check). A pulse sent to Walker 2 fires on Walker 2's phone within 300ms and on no other phone. A Walker stepping into a wall gets a thud and does not move. All three Walkers reaching the goal before the clock ends triggers a win screen on the TV. One group completes a round without speaking.
