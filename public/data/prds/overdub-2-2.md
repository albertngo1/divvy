## Overview
Overdub is a 3–5 player concurrent-room music toy. Each player privately programs one instrument track of a shared 8-step loop — hearing only their own part — and the group only discovers what they built together when the host plays all tracks at once. The exported loop is the keepsake; there is no scoring. It's for friends who can't play instruments but want to make one dumb, delightful beat together.

## Problem
Collaborative music apps demand everyone hear the full mix live, so the loudest opinion drives the result and shy players lurk. There's no party-shaped music game where the *blindness* is the fun — where the group's beat is an emergent surprise nobody fully authored, and the artifact outlasts the round.

## How it works
The **host TV** shows only a tempo, a key/scale, a big countdown, and a locked PLAY button — never the patterns being built.

Each **phone privately** is a step-sequencer for *one assigned instrument* (kick, hi-hat, bass, lead, chord stab). It shows an 8-step grid; tapping toggles hits. Crucially, **your phone plays only your own track through its speaker/headphones** as you edit, quantized to the shared tempo. You cannot hear anyone else. Everyone sequences simultaneously for ~90 seconds. All notes are constrained to one shared scale so any combination stays roughly consonant.

When the timer ends, phones fall silent and the **host TV** takes over: it plays the full assembled loop out loud for the first time — five blind parts colliding into one beat. The reveal *is* the game. The host exports the loop as a downloadable WAV (or MIDI) **keepsake**; optionally a shareable "cover" card with the auto-generated band name.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Room state: `{bpm, scale, tracks: {playerId: {instrument, steps[8]}}}`. Phones own audio locally via the **Web Audio API** (short sample buffers, scheduled against `AudioContext.currentTime`); the server never streams audio, only the tiny `steps[]` arrays. Each phone runs its own clock during compose (only its own track, so drift is invisible). The genuinely hard part is the **reveal playback**: the host must assemble all tracks and play them tightly in sync — solved by the host being the single audio authority at reveal (it holds all samples, schedules every track off one `AudioContext`), so cross-device latency never matters because only one device makes sound. Instruments assigned round-robin on join.

## v1 scope
- 3 players, one loop, one round.
- 8 steps, 3 fixed instruments (kick/hat/bass), one scale/tempo.
- Blind compose → host reveal playback → WAV export.

## Out of scope
- Per-step velocity, swing, effects, multiple bars.
- Instrument picking, sample uploads, overdubbing rounds.
- Persistent track library or social sharing feed.

## Risks & unknowns
- Mobile Safari Web Audio autoplay/unlock quirks.
- Blind combos may sound like noise, not a groove.
- WAV render/export reliability across phones (do it host-side).

## Done means
Three phones each program a blind 8-step track hearing only themselves, the host plays the synced combined loop out loud on one device, and any player can download the resulting loop as an audio file.
