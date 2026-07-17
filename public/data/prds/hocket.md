## Overview
A co-op rhythm party game for 3-4 players that steals the note-highway of Guitar Hero / a drumline and splits ONE groove across the room via *hocket* — the medieval trick of handing consecutive notes to different players so a melody exists only in the ensemble, never in any one part.

## Problem
Rhythm games put players in side-by-side solo lanes: you could unplug your neighbor and your score wouldn't change. The itch is a rhythm game with real interdependence — where the beat is not audible until the room plays as a single instrument.

## How it works
The host TV shows the shared groove: a looping 4-beat bar, a pulsing metronome, a grid of 16 sixteenth-note slots that light as hits land, and a combo meter. Each phone privately shows ONLY the slots assigned to that player, as pads that glow ~1 beat ahead (a short scrolling "your turn" cue). You never see anyone else's pads. The pattern is authored so consecutive slots rotate owners (the hocket), meaning no single phone ever holds a legible run of the melody.

Tap your pad inside its window = clean hit. Tap outside your window, or during a slot that belongs to someone else, = a *flam* (red flash, combo reset). The full groove only becomes audible and fully lit on the TV when everyone nails their interleaved parts across 4 escalating bars.

Private vs shared: phone = your upcoming cues + your own hit/miss feedback only; TV = the shared audio, metronome, aggregate emerging pattern, and combo meter.

## Technical approach
Host browser tab + phone PWAs + authoritative WS (PartyKit / Cloudflare Durable Objects). Clock sync: on join each phone runs a handful of ping round-trips to estimate its offset to the server clock (NTP-lite). The metronome then runs LOCALLY off that synced clock, so there is no per-beat network dependency. Data model: `Room{bpm, bars, pattern:[{slot,ownerId,type}], playersById}`; each phone receives only its own slots. Judging happens on-device against the phone's known schedule (window ±80ms), emitting `{slot, tapDelta, ownerId, t}`; the server buffers ~200ms and forwards to the TV for aggregate display + audio. The genuinely hard part is perceived simultaneity: local clock sync + local judging avoid round-trip latency, the TV is the sole audio source (phones stay silent to dodge mobile AudioContext lag), and each loop re-corrects drift.

## v1 scope
- 3 players, one 4-beat loop at 90bpm, 4 bars
- One hand-authored hocket pattern
- Tap-only pads (no swipes/holds)
- Flam = red flash + combo reset
- Single round, score = clean-hit %

## Out of scope
Song library, difficulty tiers, custom kits, accelerometer strumming, >4 players, matchmaking, saved scores.

## Risks & unknowns
Network jitter breaking felt timing; Bluetooth-speaker output lag on the TV; players disoriented by seeing only a fragment (intended, but needs a 10-second onboarding); whether ±80ms windows feel fair across cheap Android phones.

## Done means
Three phones on one Wi-Fi, TV showing the groove; each phone lights only its own pads a beat ahead; a clean run reconstructs the full audible groove on the TV with a rising combo meter; and a mistimed or poached tap registers a flam within ~100ms of felt latency.
