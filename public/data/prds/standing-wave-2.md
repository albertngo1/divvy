## Overview
A physical hunt-the-acoustic-spot game. The host TV plays a steady low sine tone through its speaker; reflections off walls create standing-wave nodes (quiet) and antinodes (loud) scattered around the real room. Each phone is privately assigned a target — 'find a QUIET pocket' or 'find a LOUD pocket' — and players wander the room reading only their own live mic level until everyone is simultaneously parked on the right kind of spot. For 3–4 people who'll happily crouch behind the couch chasing silence.

## Problem
Audio party games usually treat the room as one uniform loudness. But a real room with a pure tone is spatially *lumpy* — that lumpiness is a free, invisible board. The itch: you can't see the field, and your phone only knows what it hears *where you are right now*.

## How it works
Everyone taps 'ready'; the TV emits a fixed ~120–180Hz sine. Privately, each phone shows only:
- A big live loudness dial (mic RMS), and
- Its secret goal: NODE (get the dial below a low band) or ANTINODE (get it above a high band).
Players physically walk/crouch/reach to hunt their pocket. Because node and antinode locations are different physical spots, a NODE player and an ANTINODE player naturally scatter to opposite corners. When a phone holds in its target band for 3s it flips to 'HELD.' The host TV shows only anonymized held-lights (e.g. 4 dots turning green) — never anyone's actual level or location. Win = all phones HELD at once for 2s. The comedy is people slowly leaning into a wall gap hushing everyone.

## Technical approach
Host tab (WebAudio `OscillatorNode` → speaker) + phone PWAs + WS server. Data model: `Room{ tone:{hz}, phones:{ id:{goal:'node'|'anti', rms, held} } }`. Phones run `getUserMedia` → `AnalyserNode`, compute smoothed RMS locally, and stream only a boolean 'in-band' + held state (raw levels stay on-device for privacy and bandwidth). The hard part is per-mic calibration: phone mics have wildly different gains and AGC. Fix with a 3s calibration where each phone samples the tone at a neutral spot to set personal node/antinode thresholds relative to its own baseline, and disable AGC via `echoCancellation:false, autoGainControl:false` where supported.

## v1 scope
- 3 players, one fixed tone, one round.
- Two goal types (node/antinode), auto-assigned.
- 3s hold to latch, 2s all-held to win.
- TV: tone on/off + anonymized held dots only.

## Out of scope
- Tone sweeps, multiple rounds, scoring, teams, moving the speaker.

## Risks & unknowns
- A single small speaker in a soft room may not form strong standing waves; needs a hard-surfaced room and enough SPL. Fallback: swap to distance-from-speaker loudness bands if nodes are too weak.
- Mic AGC on iOS often can't be disabled, muddying absolute levels — the relative-to-baseline calibration is the hedge.
- Bodies absorb bass and shift the field as players move.

## Done means
On a real WS room in a normal living room, 3 phones calibrate, and players — guided only by their private dials — get all three lights green simultaneously for 2s within 90s at least twice in five tries.
