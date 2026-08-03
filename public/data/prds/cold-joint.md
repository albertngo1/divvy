## Overview

A 3-minute co-op for 3 players and one TV. The host screen is a microscope view of a circuit board: a molten bead of solder must be dragged from pad A to pad B down a narrow corridor without touching the traces on either side. Nobody can see the corridor. Everyone can hear it.

## Problem

"Be quiet" is a rule, and rules in party games are enforced by the most annoying person in the room. This makes silence a physical property of the simulation: the mic is not a scorekeeper, it is the shaking hand. Nobody has to shush anyone, because the bead does it.

## How it works

Each phone owns exactly one degree of freedom of the tip — P1 drags X, P2 drags Y, P3 controls advance/retract. Inputs are continuous and simultaneous.

**Private, per phone:** only the obstacles along your own axis, as a 1-D clearance bar — the X-phone reads "3.1mm right, 0.4mm left" and nothing else; the Y-phone reads the vertical corridor; the advance phone reads how far the bead can travel before the next bend. No phone can see the shape of the track. Also private: your own live tremor contribution.

**Shared host screen:** the tip, the bead, and a wobble — but not the traces, and not the clearances. The room must reconstruct the corridor out loud from three numeric slices.

**The constraint:** server-side tremor amplitude scales with room loudness above each phone's calibrated floor. At a whisper, tremor is sub-pixel. At conversational volume, tremor exceeds the corridor width, so a crash is arithmetic, not bad luck. A ring around each player's avatar on the TV shows who is currently contributing the shake — public blame, no one has to speak it.

Touch a trace or run the 90s clock out and you get a cold joint. Clean run wins.

## Technical approach

PartyKit Durable Object per room, 20 Hz authoritative tick. Phones send `{axisDelta, micDbfs}` as a 6-byte binary frame; the server computes `pos += Σaxis + tremor(seed, tick, roomDb)` from a seeded PRNG so host and phones render identical jitter. Host interpolates 20 Hz snapshots to 60 fps.

Mic level is computed on-device with a Web Audio `AnalyserNode`; only a smoothed dBFS scalar crosses the wire, never audio. Room level is the max across phones, not the sum, or one speaker gets counted three times.

The genuinely hard part is making decibels comparable across devices. iOS Safari applies automatic gain control that silently erases the whisper/talk gap, so `getUserMedia` must request `{autoGainControl:false, noiseSuppression:false, echoCancellation:false}` and each phone needs a 3-second room-silence calibration to set its own floor. Everything downstream is relative to that floor.

## v1 scope

- Exactly 3 players, one 90-second joint, one corridor with two bends
- 4-letter room code on the TV, no accounts, no lobby
- Pass/fail only — no score, no rounds, no rematch button
- Per-phone silence calibration, then straight into play

## Out of scope

Multiple rounds, difficulty curve, 4+ players, reconnect handling, spectator view, sound effects, saved replays.

## Risks & unknowns

Cheap Android mics and pocketed phones may calibrate badly. The room may go fully silent and try to gesture the clearances — mitigated by making the private data numeric and to one decimal place, which hands cannot convey. Holding the phone to your mouth to whisper spikes your own meter; that is the joke, not a bug.

## Done means

Three phones and one host tab, one attempt: speaking at normal volume smears the bead within 3 seconds, a whispering trio can finish the corridor, and the end card shows who shook it and when.
