## Overview
Session is a 3-player concurrent-room music toy for friends who can't play instruments. Everyone overdubs one layer of a single 4-bar loop at the same moment, deaf to each other, and the payoff is hearing the stack collapse into an accidental groove you all get to keep.

## Problem
Collaborative music apps are turn-based: someone lays a beat, the next person hears it and reacts, and it ends up tidy and safe. The magic of a garage jam — everyone committing blind and discovering they locked in (or gloriously didn't) — never survives a phone passed around a room. There's also no artifact; you make a loop, close the app, and it's gone.

## How it works
The host TV is the studio wall: three empty track lanes, a 4-bar loop timeline, a tempo, and a big count-in. Server broadcasts a synchronized 'REC in 3-2-1' so all phones open the same loop window at once.

PRIVATE (each phone): you're assigned one instrument — Track 1 kick+bass, Track 2 chords, Track 3 lead — and get an 8-step × 4-pitch pad grid. During the record window you tap to place hits. Crucially, your phone plays back ONLY a click track plus your own part through your speaker. You never hear the other two while recording. You commit your layer blind, in the same loop as everyone else.

SHARED (TV): while recording, the TV shows only the metronome pulse and which tracks have 'locked in' — never the actual notes. On reveal, the server layers all three tracks and the TV plays the full loop with scrolling waveforms.

Optional anonymity flavor: each phone is secretly told to sneak one 2-hit 'signature lick' somewhere in its part; after playback each player privately guesses whose lick was whose, and you 'win' by being un-guessable. But the real win is the loop itself: the server bounces the three layers to a WAV the group downloads.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object) holds the room: `{tempo, bars, players:[{id, track, grid:[step][pitch]bool, lockedAt}]}`. Phones send small grid deltas as they tap; the server is the clock and issues one synchronized count-in timestamp so every phone's local Web Audio scheduler starts the same loop cycle. Audio is synthesized locally (tiny oscillator/sample kit) — we sync SCHEDULES, not audio streams, sidestepping the hard real-time-audio-transport problem. The genuinely hard part: keeping the count-in tight enough that a hit placed on step 5 on phone A lines up with step 5 on phone B — solved by NTP-style clock offset estimation per phone and scheduling everything to server time, not local time. The bounce is rendered offline (OfflineAudioContext) on the host from the three grids.

## v1 scope
- Exactly 3 players, 3 fixed instruments, one 4-bar loop, one fixed tempo (100 BPM)
- 8-step grid, tap-to-toggle, no velocity
- One synchronized record window, one reveal, one WAV download
- No signature-lick guessing yet

## Out of scope
- More instruments, swing, effects, multiple loops, song arrangement
- Live audio streaming between phones
- The anonymity mini-game

## Risks & unknowns
- Clock sync tight enough on mixed phones over local WiFi — biggest risk
- Is blind overdubbing fun or just chaotic noise? Needs playtest; grid quantization should keep it musical
- Web Audio autoplay/permission friction on iOS

## Done means
Three phones on one WiFi complete a synchronized record window, the TV plays back all three layers locked to the same beat, and the group downloads a WAV of the combined loop.
