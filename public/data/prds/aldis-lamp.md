## Overview

A 4-player cooperative game for a dimmed living room. Each phone becomes a naval-style signal lamp: the screen flickers a private identity frequency while the front camera, facing the same direction, watches for other people's flicker. You hold it outward, so you cannot see your own screen. The room's geometry — walls, couches, bodies — is the board, because the game runs entirely on line of sight.

## Problem

Every phone party game asks you to *look at your phone*, which drags four faces down into four glowing rectangles and kills the room. Aldis Lamp inverts that: your phone's face is pointed away from you almost the whole time, and the single most costly action in the game is looking at your own screen.

## How it works

Setup: lights down. Everyone stands, holds a phone at chest height with the screen facing *away* from them. The TV shows a 90-second timer and a count of completed locks.

The server assigns a no-fixed-point permutation — a single 4-cycle. Each player has a **mark** and is, unknowingly, someone else's mark. You are shown your mark's name only while **peeking**: turning the phone to face you. Peeking is detected by `deviceorientation` (screen normal swings past ~90° toward the holder) and while peeking your phone **stops emitting and stops receiving**. You are off the network exactly when you are informed.

Hunting: aim your outward-facing screen at your mark. Your screen flickers at your assigned frequency (2, 3, 5, or 7 Hz, full-screen black/white). Their front camera sees a bright rectangle pulsing at that rate, and a small per-region FFT over frame luminance at ~20fps identifies *your* frequency. Three continuous seconds of detection = lock. Your phone emits a rising tone as your lock builds — audible to the whole room, so four hunters produce a chaotic aviary of chirps that everyone can hear but nobody can attribute.

Private vs shared: the phone privately holds your mark's identity, your live lock progress, and its own camera feed (never transmitted). The TV shows only *N of 4 locks complete* and the timer. At the end, the TV animates the full sightline graph — who found whom, who kept blundering at the wrong person.

Win: all four locks within 90 seconds.

## Technical approach

Host tab + phone PWAs + PartyKit/Durable Object authority. Data model: `Player{id, freqHz, markId, peeking, locked}`, `Round{deadline, locks[]}`. Detection is fully client-side: `getUserMedia` front camera → 160×120 canvas → 4×3 luminance grid → 40-sample Goertzel per cell per target frequency. Client reports only `{sawFreq, confidence}` at 5Hz; the server owns lock timers so a client cannot self-report a lock.

The hard part is optical, not networked. Front-camera auto-exposure fights a flickering source, rolling shutter aliases high frequencies, and 20fps caps usable frequencies below ~8Hz. Mitigation: keep frequencies low and well-separated, use luminance *variance* rather than absolute brightness, and require sustained detection so a passing reflection cannot trigger a lock. Screen wake lock and max brightness are mandatory.

## v1 scope

- Exactly 4 players, one 4-cycle, one 90-second round
- Four hard-coded flicker frequencies
- Peek detection by orientation only
- Win/lose, plus the final sightline graph

## Out of scope

More than 4 players, teams, decoy phones, jamming, torch/LED emission, scoring history, bright-room mode.

## Risks & unknowns

Bright rooms may destroy contrast entirely. Two players standing close may cross-detect. Older phones may not sustain 20fps camera processing plus a flickering canvas. The chirping may be more annoying than fun.

## Done means

In a room at ~30 lux, two phones 3 metres apart and aimed at each other reach a lock in under 4 seconds with zero false locks across a 5-minute idle test, and a 4-player round completes end to end.
