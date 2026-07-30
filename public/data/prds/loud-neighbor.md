## Overview

A 4-player concurrent-room game where every phone is assigned, secretly, to *monitor a different player's* noise. You never learn who is watching you, and you can never bust yourself. For groups of 4 who like games where the punishment arrives from an unknown direction.

## Problem

Every silence game so far uses your own mic as your own jailer, which makes the loop solitary: you shut up, your phone rewards you. The itch is that *silence is socially enforced* in real life — someone else glares at you. Nobody has built the glare into the hardware. Self-metering also makes cheating trivial (muffle your own phone) and makes the room's tension purely internal rather than between people.

## How it works

One 3-minute round. The host TV shows a 12-tile grid of face-down word tiles and a shared **Quiet Bank** counter that ticks up 1/sec whenever *nobody* is currently flagged.

Each phone privately shows three things: (1) your own two secret tiles you must get flipped, (2) the name of exactly one other player — your **ward** — whom your mic is watching, and (3) a live meter of your ward's estimated loudness *as measured by your device*. Wards form a random directed cycle: A watches B, B watches C, C watches D, D watches A.

To flip a tile you must physically point your phone at the TV and hold — a 4-second commit. But the only way to tell someone which tile to flip for you is to make noise, and noise near your watcher trips them. When your phone's mic exceeds its threshold *and* your ward is the nearest plausible source, you tap **FLAG**. Flagging is silent, anonymous, and immediately freezes the Quiet Bank for 8s and voids your ward's in-progress commit. Crucially: flagging a *silent* ward (a false flag) costs you one of your own tiles.

Because the watch graph is a cycle, punishing the person who's making useful noise for you often means your own tile never flips. The round ends when all 12 tiles are flipped or the clock dies; score is Quiet Bank + 3 per own-tile flipped.

## Technical approach

PartyKit Durable Object as authoritative room. Data model: `Room {tiles[12], bank, freezeUntil, wardCycle}`, `Player {id, secretTiles[2], wardId, threshold, commitProgress}`. Phones run a PWA; each computes 50ms A-weighted RMS locally via Web Audio `AnalyserNode` and sends only a 5-bit level + timestamp at 20Hz — never audio.

The hard part is **source attribution without audio**. We never know who spoke; we only have four correlated level streams. Fix: a 10s calibration where each player says their name alone, giving a per-device gain matrix (how loud is player j on device i). At runtime the server solves a tiny 4×4 least-squares for the most-likely source and hands each phone a *ward-filtered* estimate. It will be wrong sometimes — that's designed in, since false flags cost the flagger, so ambiguity becomes a gamble rather than a bug. Clock sync via server-stamped ticks; flags resolve server-side against a 400ms window.

## v1 scope

- Exactly 4 players, one 3-minute round
- 12 tiles, 2 secret tiles each
- Fixed random ward cycle, no reassignment
- Name-calibration step, 10 seconds
- Flag button, 8s freeze, one false-flag penalty
- Host TV: grid + bank + anonymous freeze flash

## Out of scope

- More than 4 players; ward re-shuffles mid-round
- Any audio recording, upload, or speech recognition
- Multiple rounds, scoring across games, cosmetics
- Reconnect recovery beyond a 5s grace

## Risks & unknowns

Attribution may collapse in a small room where all four phones hear everyone equally — mitigate by requiring 1.5m spacing and by widening the ambiguity band. Players may discover a degenerate strategy of never flagging; the Quiet Bank freeze on genuine noise must be painful enough that ignoring your ward loses. Phone-to-TV pointing needs no real sensor in v1 (just a hold button) but feels flimsy.

## Done means

Four phones join by code; each privately shows a different ward name and its own two tiles. One player speaks at conversational volume; within 600ms only their watcher's phone shows a raised meter, and the other two do not. A flag freezes the TV bank visibly. A flag on a silent ward removes one of the flagger's tiles. One full round completes and the TV shows final scores.
