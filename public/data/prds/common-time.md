## Overview

A silent three-player entrainment game. Each phone is a private metronome — felt, never heard — and each one is set to a different tempo. The room must tap in unison. Because the pulses conflict and nothing is audible, the only channel left is the human body: nodding, shoulder bounce, the twitch of a wrist. For people who like the idea of being coupled oscillators.

## Problem

Rhythm party games are all audio: everyone hears the same click and the challenge is motor accuracy. That's a skill test, not a convergence problem. Make the pulse private and conflicting, and suddenly the interesting question is social — who abandons their own beat, and how does a room agree on a tempo nobody was given, without a word?

## How it works

Each phone privately shows a small pulsing dot (held cupped, near your chest) plus haptic buzz where supported, at *your* secret tempo: 84, 97, or 110 BPM. You are not told yours is different. Below it, one big TAP pad. Nothing else — no other player's data ever reaches your phone.

Host TV: a single lamp. Its steadiness is the Kuramoto order parameter across the three tap phases — dim and shuddering when scattered, bright and calm as you lock. No numbers, no per-player anything.

The trap: half-tempo lock. If one player taps every other beat, the lamp goes bright but the win never fires. The room has to notice it's standing on a false summit and find the octave error, silently. 90-second cap.

Win: order parameter R > 0.9 across 8 consecutive beats *and* all three tap tempos within 4 BPM.

Reveal: host shows each player's private BPM and the tempo the room actually landed on — usually not the mean, usually whoever was most stubborn.

## Technical approach

Host tab + phone PWAs + one authoritative room object (PartyKit / Durable Object). Clock offset per phone via 10-round ping-pong on join, keeping the min-RTT sample; taps carry `performance.now()` and are converted to room time server-side. Server keeps a ring buffer of the last 6 taps per player, fits instantaneous phase and period, computes R = |mean(e^{iθ})|, and broadcasts only R at 15Hz to the host. Phones receive only their own pulse schedule (sent once, run locally against the synced clock).

Hard part: R is a noisy estimate from sparse, human-jittery taps. Touch-event latency varies 20–60ms across devices and is not measurable directly, so the lock threshold has to be loose enough to be humanly reachable and tight enough that half-tempo doesn't sneak through. Expect real tuning against real thumbs.

## v1 scope

- Exactly 3 players, one round, three hardcoded BPMs
- Screen-dot pulse; `navigator.vibrate` as a bonus, not a requirement
- Tap pad, lamp, 90s timer, win check, BPM reveal
- Join by room code, no lobby, no scoring

## Out of scope

Accelerometer bounce detection, 4+ players, tempo drift over a round, multiple rounds, audio of any kind, iOS haptics workarounds.

## Risks & unknowns

iOS Safari has no `navigator.vibrate`, so v1 leans on the private screen dot — which can leak to a neighbor glancing over. Playtest whether that ruins it or is just part of the game. The half-tempo trap may read as a bug rather than a puzzle. And 84 vs 110 may be too far apart to converge in 90s.

## Done means

Three phones joined, three different private tempos confirmed in logs; a fresh group reaches R > 0.9 for 8 beats within 90 seconds at least a third of the time, and the reveal correctly names each player's original BPM.
