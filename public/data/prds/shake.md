## Overview

Every phone in the room becomes a different instrument in a band — kick drum, hi-hat, cowbell, bass note, hand-clap. When a player shakes or taps their phone, that instrument fires. The whole group performs a song together in real-time, following a scrolling score on a shared display (TV or the host's laptop) or just jamming free-form. Per-phone is load-bearing because each phone is a physically distinct instrument you can only trigger by moving *that* device — you cannot play the kick and the hat simultaneously with one device.

## Problem

Group music games (Rock Band, JackBox's Drawful-adjacent stuff) always route through a single shared screen and one input at a time. Real music is *simultaneous* — a drummer, a bassist, a percussionist all playing at once. There's no browser party game that gives every player a real-time instrument they perform with their body. Per-phone accelerometers plus Web Audio unlock that: everyone plays at once, the group is the band.

## How it works

Room code join, 3-8 players. Server assigns each phone an instrument (kick, snare, hat, clap, cowbell, bassline root, chord stab). Each phone shows a big colored button with the instrument name and — critically — responds to shake gestures via accelerometer. Optional: hosts can pick a song and a scrolling score appears on the room's shared screen showing which instrument should fire when. Or free-form jam mode. When any phone triggers its instrument, the server broadcasts to a shared output (host laptop / TV via room URL) which plays the sample. Round ends, group listens to the recording.

## Technical approach

`DeviceMotionEvent` accelerometer for shake detection (magnitude threshold + debounce ~80ms). Tap-to-fire also supported for phones without motion permission. WebSocket broadcasts `{player_id, instrument, velocity, t}` events. A single "conductor" client (the host laptop pointed at a TV) subscribes to all trigger events and plays the corresponding sample via Web Audio buffers. Latency budget: ~100ms end-to-end feels acceptable for a rhythm game; anything over 200ms breaks the groove. Samples are pre-loaded WAV/OGG in the conductor client. Song scores stored as `[{instrument, beat}]` arrays; scrolling display just walks the beat.

## v1 scope

3-6 players, 5 instruments (kick, snare, hat, clap, cowbell), 2 songs with scrolling scores + a free-jam mode, shake OR tap to fire, host-laptop-as-conductor is the audio output, 30-second songs, no scoring in v1 (just play and listen back).

## Out of scope

Recording/export, custom instruments, custom songs, multi-room jam, live scoring/accuracy metrics, video sync, MIDI export, latency compensation beyond a fixed offset, waveform visualizers.

## Risks & unknowns

WebSocket + browser audio latency is the whole gamble — if it's 250ms+ the group will be out of time and the game will feel broken. Need to prototype latency on Tailscale before writing anything else. iOS motion permissions again. Shake threshold tuning: too sensitive = false triggers when someone gestures while talking; too dull = arms get tired. May need a big tap-button fallback that always works. Free-form jam may be more fun than the scored mode, in which case scoring is over-designed.

## Done means

Four friends stand in a kitchen shaking phones through a 30-second rendition of "We Will Rock You" that is recognizably that song. Someone shouts "again, but faster." If the group instinctively falls into a groove without instruction, v1 shipped.
