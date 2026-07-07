## Overview
Flock is a concurrent-room party game for 3–5 players using a shared host screen and each player's phone as a private motion controller. The room tries to converge on one shared physical gesture — with no talking and no pre-agreed target — by feeling out the emergent majority over successive pulses.

## Problem
Most "do it in sync" games converge on *timing* (tap together). Flock converges on *which action*, using motion the phone can only read for its own holder. It's silent murmuration: everyone adjusting to a group they can't see forming.

## How it works
The host screen emits a steady visual pulse every ~2 seconds. On each pulse, every player performs ONE of four gestures with their phone in hand — tilt-left, tilt-right, lift-up, or shake. The phone's accelerometer/gyro classifies what its own holder just did (window sampled around the pulse). No move is assigned; each player freely chooses.

After each pulse the host shows only the anonymous split of the flock — e.g. four little bird icons: "2 lifted, 1 shook, 1 tilted-left" — never who did what. Players read that spread and, without talking, drift toward the plurality. The flock LOCKS the instant a single pulse has everyone performing the identical gesture.

Privately, each phone shows: the four gesture options as icons, a live "we read your move as: SHAKE" confirmation right after the pulse (so you know your sensor registered correctly), and a private haptic buzz that's strong if you matched the plurality and soft if you were an outlier — a nudge only you feel. The host screen carries the pulse and the anonymous aggregate bird-split.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object). Data model: `room {phase, pulseSeq, pulseAt}`; `player {id, lastGesture, confidence}`. Each phone runs `devicemotion` locally, buffers ~600ms around the server's `pulseAt` timestamp (clock-offset corrected), runs a tiny threshold/peak classifier on-device, and sends only the resulting label + confidence. Server tallies labels per pulse, computes the plurality, and fans out the anonymous split plus a per-phone match bit for haptics. Hard part: reliable, low-latency gesture classification across wildly different phones and grips, plus aligning everyone's sampling window to the same pulse despite clock skew — misclassification reads as unfair to the player who "knows" what they did.

## v1 scope
- One room, 3 players, four fixed gestures.
- Server-driven pulse, on-device classifier, anonymous host bird-split.
- Private per-phone move confirmation + match/outlier haptic.
- Lock + celebrate on one unanimous pulse.

## Out of scope
- Custom gesture sets, calibration wizards, scoring across rounds.
- Handling phones set on a table (assume in-hand).
- Reconnect recovery, spectators, sound.

## Risks & unknowns
- Accelerometer classification reliability is the whole game; a flaky classifier kills trust.
- Four gestures may be too many for 3 players to converge silently — may need to start with two.
- Some phones throttle `devicemotion` without a user-gesture permission grant (iOS Safari).

## Done means
Three phones join, the host pulses on a shared clock, each phone independently classifies its own holder's gesture within the window, the host shows an anonymous split, private haptics fire correctly for plurality vs outlier, and the game locks the moment all three phones report the same gesture on one pulse.
