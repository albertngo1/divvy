## Overview
Standing Room is a 3-4 player concurrent-room party game where the physical acoustics of your living room ARE the board. The host TV emits a single sustained low-frequency sine tone through whatever speakers are handy. Standing waves make that tone genuinely louder in some spots and dead-quiet in others. Each phone privately assigns its player a target — hunt for a NODE (a quiet null) or an ANTINODE (a loud peak) — and players physically wander the room, each phone listening only to its own local sound field, until everyone is locked in their assigned kind of spot at once.

## Problem
Sensor party games mostly reduce the phone to a button or a tilt-stick. Almost nothing uses the fact that a room is a real acoustic instrument with a physical loudness landscape you can walk through. The itch: make people feel a wave with their body, and discover that the quiet corner and the loud corner are personal, private targets — not something everyone shares.

## How it works
Host TV: shows a big frequency readout, a countdown, and 3-4 anonymized lock lights (grey → green). It never shows anyone's target or reading. It plays the tone (say 80-120 Hz) steadily.
Each phone PRIVATELY shows: (1) your secret assignment — 'Find SILENCE' or 'Find a ROAR' — and (2) a single live bar of your own mic RMS at the tone's frequency (band-passed), plus a warmer/colder nudge. Because half the players want a minimum and half want a maximum, they physically drift to opposite parts of the room. When a phone holds its target condition (below the low threshold, or above the high threshold, relative to its own recent rolling range) for 3 continuous seconds, its lock light goes green. All lights green within the round = win.
The load-bearing part: each phone is a simultaneous, independent probe of a different physical location. One phone passed around measures one spot at a time and destroys the whole 'everyone occupies a different acoustic pocket at once' mechanic.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{toneHz, phase}, Player{id, assignment: 'node'|'antinode', locked, lastRms}. Sync: phones stream a smoothed RMS-at-frequency value (~5 Hz) computed locally via WebAudio AnalyserNode + a narrow band-pass around toneHz; server tracks each phone's own rolling min/max and evaluates its threshold crossing and 3s hold. Genuinely hard part: robustness of the physical effect. Nulls are real for bass but depend on room reflectivity and volume; calibrate per-phone using each device's own observed range (relative, not absolute dB) so mic-gain differences and cheap speakers don't break it. A 5-second 'sweep the room' calibration pass establishes each phone's personal min/max before targets go live.

## v1 scope
- 3 players, one round, one fixed tone.
- Assignments hard-split (e.g. 2 node, 1 antinode).
- Relative per-phone thresholding; 3s hold to lock.
- Text-only assignment card + one live bar + warmer/colder arrow.

## Out of scope
- Multiple tones / frequency sweeps / competitive scoring.
- Absolute SPL calibration.
- Any leaderboard or multi-round meta.

## Risks & unknowns
- Small or heavily furnished rooms may not produce crisp nulls; needs playtesting for tone choice.
- Phone mic AGC could flatten the signal — may need to hint players to disable, or lean fully on relative ranges.
- Neighbors and sustained bass at party volume.

## Done means
Three phones, one bass tone: players who were handed 'silence' end up standing in physically different, quieter spots than the 'roar' player, all three lock lights turn green within one 90s round, and swapping to a single passed phone visibly makes the game impossible.
