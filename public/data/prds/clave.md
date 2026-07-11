## Overview
Clave turns a room of people into a distributed drum machine. The shared TV shows a slow looping bar with a moving playhead and a click track; each phone privately owns exactly one slot of that bar and privately coaches its own clapper using mic onset detection. For 3-4 players who like rhythm and a little coordinated chaos.

## Problem
Rhythm games are solo — one player, one controller. Group clapping collapses because nobody gets private, per-person feedback on whether *they* were early or late. And the room's acoustics — mic bleed, speed-of-sound delay to the far corner — are usually treated as bugs to hide rather than the game. The itch is a human beat where each person is one voice and can actually tell if their voice landed.

## How it works
The TV (public) shows BPM, a playhead sweeping an 8-slot bar, a click, the assembled pattern so far, and lock progress. Each phone shows PRIVATELY only the slot(s) that player is responsible for and a live early/on/late needle with a millisecond error, plus their streak. Players spread around the room so each phone's mic mostly hears its own owner. Clap in your slot; your phone times the transient and tells you privately how you did. The server folds every detected onset into the shared pattern on the TV. Land N consecutive clean loops with all claps in-window and the groove LOCKS — the TV plays the assembled beat back. Room-as-board: players must physically spread to isolate mics, and in a big room the delay from the TV speaker to a distant player is real, so far players learn to clap slightly ahead — feeling out their spot on the floor.

## Technical approach
Host tab plays the click and renders the playhead. Phone PWAs run WebAudio mic capture with a high-pass filter and onset detection (spectral-flux / energy transient) to timestamp each clap; getUserMedia is permission-gated. The genuinely hard part is clock sync: each phone runs an NTP-like ping/offset handshake against the server so clap timestamps are comparable to the shared bar phase. Data model: `room{bpm, barStartServerTime, players[{id, slots:[i], streak}], pattern[slotFilled]}`. Phones send `{slot, tOnsetServerClock}`; the server holds authoritative BPM + bar phase, computes each onset's phase error, gates by loudness + expected-slot window to reject a neighbor's bleed, updates lock state, and broadcasts. Reverberant false onsets and clock drift over WebSocket are the main foes.

## v1 scope
- 3 players, one 4-slot bar at 60 BPM.
- Each player owns exactly one slot.
- Lock = 4 consecutive clean loops.
- Win screen plays the assembled 4-clap loop back.
- Each phone shows only its slot + early/late needle.

## Out of scope
- Melodies/pitch, multiple slots per player.
- Tempo ramps, quantize-forgiveness settings.
- ML mic-bleed rejection, saving/sharing the groove.

## Risks & unknowns
- Clock-sync accuracy over WS may be too coarse at 60 BPM.
- Mic bleed between players standing close.
- Reverberant rooms triggering false onsets.
- Is human clap jitter actually within a lockable window? iOS permission friction.

## Done means
On three phones and a laptop, each player is assigned one of four slots, and by clapping in time while spread across the room they lock four consecutive loops — after which the TV plays back their assembled 4-beat pattern, each phone having shown only its own slot and early/late needle.
