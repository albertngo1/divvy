## Overview

A 4-player, one-round scramble where the host screen is both the board and a short-range broadcast tower. The TV is divided into a 3×3 grid of tiles; each tile carries a faint flicker pattern that a phone camera can decode only from close range and near-square-on. Each player's phone privately hands them a different sequence of tiles to read, so the fun is four people crowding one screen, ducking, reaching over, and physically blocking each other's line of sight — with their own bodies as the only obstacle in the game.

## Problem

"Room as board" games usually spread players out. Nobody has made the *host screen itself* a contested physical space. And the camera is treated as a scanner, never as a receiver of a channel that has real, felt, walk-around-able range limits.

## How it works

1. The TV shows a 3×3 grid of tiles, each with a big friendly picture (fox, anchor, kettle…). Superimposed on each tile is a subtle luminance flicker at a distinct rate (3, 4, 5, 6, 7.5, 10, 12, 15, 20 Hz) at ~4% contrast — invisible-ish to eyes, obvious to a camera.
2. Each phone privately shows: a target picture ('read the KETTLE'), a live camera preview with a small reticle, and a lock meter. Every player has a different 4-tile order, dealt by the server. Nobody sees anyone else's list.
3. To read a tile you must fill the reticle with it — which in practice means standing within ~1m of the TV and roughly on-axis. Only two people fit comfortably. The third and fourth are, unavoidably, in the way.
4. On a successful lock, the server sends that phone a private payload — one word of a shared password fragment — and privately assigns the next target.
5. Host TV shows only the grid plus four anonymous progress pips. It never shows targets, so nobody can plan around anyone else by watching the screen.
6. Win: all four phones complete their sequence within 90 seconds and the group speaks the assembled password aloud.

## Technical approach

Host tab renders tiles on a `requestAnimationFrame` loop, modulating each tile's overlay alpha as a square wave at its assigned rate; a 60Hz display cleanly produces 3–20Hz. Phones run `getUserMedia`, draw each frame to a 64×64 offscreen canvas, take the mean luminance of the reticle region, and run a 2-second sliding FFT (or Goertzel bank at the nine known frequencies) to find the dominant rate → tile ID. Server is a PartyKit Durable Object holding `{grid: tileId→freq, players: {id, sequence[], index, fragment}}`. The camera link only carries *addressing*; the private payload rides the WebSocket, so decoding never has to be reliable enough for data.

The genuinely hard part: camera auto-exposure. AE hunting fights a flickering scene and can null the signal outright; we clamp exposure via `applyConstraints` where supported and otherwise normalise by frame-to-frame ratio rather than absolute luminance. Second hard part: rolling shutter plus 30fps sampling aliases anything above 15Hz — hence the deliberately low, well-separated frequency set.

## v1 scope

- 4 players, one 90-second round, single 3×3 grid
- Four hard-coded per-player sequences of 4 tiles
- Lock = 2 seconds of stable dominant frequency
- Host TV: grid + four progress pips + timer
- No score, no lobby, no second round

## Out of scope

Multiple rounds, adversarial roles, tiles that move, projector support, phone-to-phone optical links, any tile count other than nine.

## Risks & unknowns

- Flicker may be visible enough to annoy, or invisible enough to be undecodable — the contrast level is a live tuning question.
- Bright rooms and glossy TVs may swamp a 4% modulation.
- Photosensitivity: 3–20Hz full-screen flashing is a genuine seizure risk; tiles must be small, low-contrast, and never all in phase. Needs an explicit warning screen.
- Crowding may become shoving rather than comedy with 4 adults; a taped floor line may be required.

## Done means

In a normally lit living room, a phone held 80cm from a 50" TV identifies the correct tile within 2 seconds on ≥9 of 10 attempts across three different phone models, and four players complete their sequences in one 90-second round without the host screen ever revealing anyone's target.
