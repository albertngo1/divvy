## Overview

**Twice for Left** is a 5-player cooperative party game for a living room with a TV. One player is the Cartographer: their phone holds the entire maze. The other four are Runners: their phones show four arrow buttons and absolutely nothing else — no position, no walls, no map. The Cartographer may not speak, type, gesture, or make a sound. Their only output channel is vibration: they drag their finger across a Runner's lane on their own screen and that Runner's phone buzzes. Long buzz, short buzz, double buzz. No code has been agreed on. They have four minutes.

## Problem

Maze-guiding party games collapse into one loud person shouting "LEFT! NO, YOUR LEFT!" The map-holder's advantage is total and the pieces are typists. The itch: make the map-holder's *bandwidth* the scarce resource, and make the pieces genuinely interpret rather than obey. Also — everyone has a vibration motor in their pocket and nearly nobody has built a party game where four different private haptic streams fire at once. That's a channel one passed-around phone physically cannot provide.

## How it works

A 9×9 maze with four tokens and four exits. Tokens move only when a Runner presses an arrow. A Runner pressing into a wall costs the team 3 seconds.

**Cartographer's phone (private):** the live maze, all four tokens, all four exits, and four horizontal "lanes" along the bottom — one per Runner. Tapping a lane sends a short buzz to that phone; press-and-hold sends a long one. Buzzes can overlap across lanes. There is no send-to-all button.

**Runner's phone (private):** four arrow buttons, a vibration motor, and a small dot that pulses when a buzz arrives so deaf/quiet phones still work. Nothing else. A Runner never learns where they are.

**Shared TV:** the explored-cells fog-of-war only — cells any token has visited, unlabeled as to who visited them. Plus the clock, the wall-bump penalty counter, and a live "buzzes sent" tally per Runner. Spectators watch the room converge on a language.

The comedy engine: Runners may talk to each other out loud ("two shorts means down, right? I got two shorts and hit a wall") while the Cartographer, forbidden to speak, listens to their code being misread and can only buzz harder. Codes drift per-Runner because the Cartographer is improvising four dialects simultaneously under pressure.

## Technical approach

Host browser tab + phone PWAs + a PartyKit room (single Durable Object) as authority. Room state: `{maze: uint8[81], tokens: {playerId: {x,y}}, exits, fog: Set<cell>, bumps, startedAt}`. Messages are tiny: `{t:'move',dir}` from Runners, `{t:'buzz',target,dur}` from the Cartographer. Server validates every move against the maze (never trust the client with walls), applies the bump penalty, and broadcasts fog deltas to the host only — Runner clients receive *nothing* about state, which makes their client trivially secure.

The genuinely hard part is haptics, not sync. `navigator.vibrate` is unavailable on iOS Safari; the fallback is a short sharp audio pulse through the phone's speaker at low volume plus a screen flash, which changes the game (audible to the room). v1 ships the audio-plus-flash fallback as the *default* so behavior is uniform across devices, and treats real vibration as a bonus. Second hard part: buzz latency must be under ~120ms or the Cartographer can't rhythm-code; use a persistent WebSocket, send buzz events with no server-side round-trip through game logic, and pre-arm the audio context on join.

## v1 scope

- Exactly 5 players: 1 Cartographer, 4 Runners. Hardcoded.
- One handmade 9×9 maze. Not generated.
- One round, four minutes, then a win/lose screen.
- Two buzz durations only (short, long). No patterns library, no code cheat-sheet.
- Audio-pulse-plus-flash haptic fallback everywhere; `navigator.vibrate` opportunistically.

## Out of scope

Multi-round campaigns, maze generation, rotating the Cartographer role, scoring/leaderboards, reconnect handling, a suggested code alphabet, spectator voting, more than 5 players.

## Risks & unknowns

The code-invention may be *too* hard and the team escapes zero mazes — mitigate with an absurdly forgiving maze and long timer for playtest one. iOS haptics are the biggest product risk and the fallback is a genuinely different game (the room hears the buzzes). The Cartographer's no-speaking rule is social, not enforced by software; a tabletop rule may not hold under excitement.

## Done means

Five phones join from a QR code on the TV. The Cartographer taps a Runner's lane and that Runner's phone — and only that one — pulses within 120ms. Four Runners can be buzzed within the same second, distinctly. A Runner pressing into a wall increments a visible penalty and does not move. Two independent groups of five play it cold, and at least one group gets all four tokens out before the clock, having invented a code that appears nowhere in the code.
