## Overview

A cooperative, no-talking-about-numbers game for 3 people, one host screen, and three phones. Each phone continuously measures how acoustically *enclosed* it is — open floor reads low, jammed into a corner or under a shelf reads high — and shows that number only to its owner. The table must then play three cards in strictly ascending order of enclosure. The twist that makes it a game rather than a measurement: you can change your own number at any moment by physically moving.

## Problem

Ascending-order cooperative games (the whole *The Mind* family) hand you a fixed number and ask you to feel the silence. It's a great engine attached to a dead input. Meanwhile, "phone sensor party game" almost always collapses to "walk until your meter hits the target band," which is a chore with a lock light on the end. Tight Corner uses the sensor to generate a *renegotiable* private ordinal: your number is a fact about where your body is right now, everyone can see you moving, and nobody can see what it did to your reading.

## How it works

**Calibration (20 s).** Standing in the middle of the room, each phone plays a 150 ms warbled burst (700–1400 Hz) through its speaker and records it with its own mic. Broadband RMS of that self-echo is your baseline, `0.0`. The TV says "stand in the open" and counts down.

**The chirp cycle.** The room now runs a 400 ms frame split into three 100 ms TDMA slots, one per phone, so only one device is ever chirping — no cross-talk, and the room fills with a soft cricket rhythm. Each phone measures only its own chirp. Boundary reinforcement is real physics: press the phone into a corner, under a table, against a bookcase, and the level rises several dB. Your private tightness value updates 2.5×/second.

**Each phone shows privately:** one large number (dB above your own baseline, ~0.0 to ~9.0), a 10-second sparkline of it, and a single PLAY button. Nothing else. Never anyone else's value.

**The host screen shows publicly:** three empty slots, and — critically — the *revealed value* of each card as it is played. Nothing before that.

**The loop.** Players roam. Someone crouches into the corner by the radiator; someone else drifts toward the middle of the rug. When you believe you are currently the lowest in the room, you tap PLAY. The TV reveals your number and fills slot 1. Everyone instantly recalibrates the scale — "oh, 1.2 was the floor" — and repositions so they're safely above it. Play out of order and the round dies immediately with a red flash. The tells are entirely physical: a player edging toward the bookshelf is telling you they think they're too low, and you have to decide whether to believe them.

## Technical approach

Host tab + phone PWAs + authoritative WebSocket server (PartyKit Durable Object, or Socket.IO over Tailscale Serve).

**Data model.** `Room { code, phase, frameEpochMs, slots[3], ladder[] }`. `Player { id, slotIndex, baselineRms, currentTightness, hasPlayed }`. `PlayEvent { playerId, tightness, tHostMs, ordinalOk }`.

**Audio.** WebAudio: an `OscillatorNode` + gain envelope for the chirp, an `AnalyserNode` + AudioWorklet computing banded RMS over a 128-sample hop. Raw audio never leaves the phone; only the scalar goes to the server, at 4 Hz, for the host's post-round replay.

**The genuinely hard part: slot sync.** Three phones must chirp in non-overlapping 100 ms windows with no shared clock. Each client estimates its offset to host time via WS ping/pong (median of lowest-RTT samples), then schedules chirps against `AudioContext.currentTime` anchored to `frameEpochMs`. ±20 ms accuracy is enough inside a 100 ms slot, but audio-output latency varies 40–200 ms across devices, so each phone additionally self-times its own chirp by cross-correlating its recording against its own emission envelope, and reports residual drift for the server to nudge. Second hard part: the ordinal referee. Values are noisy and drifting, so a PLAY is judged against the *server's* last-received value from every player, timestamped, with a 400 ms grace window — otherwise a laggy phone loses a round it actually won.

## v1 scope (humiliatingly small)

- 3 players, hard-coded. One ladder of three cards. Three minutes max.
- One calibration pass, no recalibration mid-round.
- Host screen: three slots, revealed values, red-flash failure, and a post-round line chart of all three tightness traces.
- Failure ends the round; tap to restart. No lives, no levels, no score.

## Out of scope

4+ players; multi-round campaigns; per-device speaker/mic normalization beyond the personal baseline; near-ultrasonic (inaudible) chirps; anything that maps tightness to an actual room position.

## Risks & unknowns

- **Signal may be too small.** If corner-vs-open is only 2–3 dB on typical phones, body-shadowing and hand-cupping noise will swamp it. Must be measured on 4 real handsets before anything else is built.
- **Cheating by cupping** — palming the mic spikes your number without moving. Might be fine (it's visible and funny) or might be the whole meta.
- Rooms with heavy soft furnishing may compress the range to nothing; a hard-floored kitchen may be ideal and a carpeted den unplayable.
- Three phones chirping for three minutes could be annoying rather than atmospheric.

## Done means

Three people in a real living room, having spoken no numbers, complete an ascending three-card ladder at least once in five attempts; the post-round chart shows at least one player's tightness moving more than 3 dB *before* they played; and at least one player, unprompted, physically relocates to change their number and says so out loud afterward.
