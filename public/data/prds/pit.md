## Overview
Pit is a 3-4 player cooperative rhythm game where the 'map' is a musical timeline instead of a floor plan. One player is the Conductor whose phone privately shows a scrolling score; everyone else is a section Player who can feel the beat but cannot read the music. It's for people who like Jackbox chaos and don't need to be musicians.

## Problem
Every 'one phone is the board' game so far treats the board as spatial. But a score is a board too — a timeline of when to act — and it's a perfect fit for asymmetric hiding: tempo is easy to share (haptics), but rhythm (which beats are notes vs rests) is exactly the thing only the conductor should see. The itch: make players nail a groove they've never seen, purely on shouted cues and body feel.

## How it works
The **Conductor's phone (the board)** privately shows a horizontally scrolling 8-bar score with a moving playhead and a colored lane per Player, notes and rests marked. Each **Player's phone** privately shows only a big tap-pad for their one instrument and delivers a **haptic pulse on every beat** (so everyone shares tempo) — but shows NO notes and NO rests. Players know WHEN a beat is; they don't know IF theirs is a note.
The Conductor cannot make the instrument sounds and cannot tap for anyone. They can only count and cue out loud: 'drums, hit on the next two... snare, rest... everybody, big one on four!' Players tap on the beats they're cued for. The **host TV** plays the resulting audio live and shows anonymized sparkles when a tap lands on-beat (green) or off (grey) — it never shows the score. A run is one 8-bar loop; the team's score is how many charted notes were hit within a ~120ms window with no extra (rest-beat) taps. It's frantic because the Conductor is reading ahead while narrating in real time.

## Technical approach
Host browser tab (audio playback via WebAudio + sparkle feed + final score) plus phone PWAs over an authoritative WebSocket server (PartyKit / Durable Object). Data model: `chart{bpm, bars, lanes:{playerId:[beatIndex...]}}`, `player{instrument, taps:[{beat, offsetMs}]}`. The server holds a synchronized clock; it broadcasts only `beatTick` to Players (drives haptics) and the full chart ONLY to the Conductor. Players send `tap{clientTime}`; server timestamps against the shared clock and grades. The genuinely hard part is clock sync and latency: haptic beats, tap grading, and TV audio must agree within ~50ms across phones, so the server distributes a beat epoch and each client compensates for its round-trip offset (NTP-style handshake on join).

## v1 scope
- 3 players: 1 Conductor, 2 section Players, plus host TV.
- One fixed 8-bar chart at one tempo, one round.
- Two instruments (kick, clap), a single tap-pad each.
- Score = notes-hit minus false-taps; shown once at the end.

## Out of scope
- Song library, pitch, multiple tempos, difficulty.
- Melodic input, more than 2 instruments, sight-reading tutorials.
- Persistent scores, reconnect handling, spectators.

## Risks & unknowns
- Latency/clock sync is the make-or-break; bad sync ruins grading.
- Whether shared-tempo-but-hidden-rhythm is enough info to succeed and still feel hard.
- Phone haptics vary wildly (iOS Safari restrictions) — may need audio-click fallback.

## Done means
Three phones + a TV join a room; the Conductor sees a scrolling score, Players see only a pad plus a buzz on each beat; the TV plays real audio and flashes green/grey per tap; a full 8-bar loop grades taps against the hidden chart within tolerance and reports one team score — demonstrable in a single live playthrough.
