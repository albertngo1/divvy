## Overview
Bounce is a cooperative 3–4 player collaborative-loop maker. Each phone is a private single-instrument step sequencer; the shared host TV is the tape deck playing the combined 4-bar loop out loud. You build your part mostly blind to the others, and the payoff is an exported audio loop the room keeps — a tiny song you all made. For friends who like making dumb beats together.

## Problem
Making music together needs gear and skill, and jam apps let everyone hear the same mush while editing, so people just copy the loudest player. There's no lightweight "everyone adds one part, blind, then we bounce it to a keepsake" party toy where the object you make is the whole reward.

## How it works
The server sets a tempo (e.g., 96 BPM) and a shared 16-step, 4-bar grid. Each player is assigned one instrument: kick, snare/clap, bass, or lead/blip.
- PRIVATE (phone): a 16-step toggle grid for YOUR instrument only. Crucially, while editing you hear your own track LOUD and the others faint/muted, so you build by feel rather than copying. A tiny private "energy" hint nudges density.
- SHARED (host TV): a scrolling playhead over all four lanes stacked, playing the FULL mix through the TV speakers — the only place the real blend is audible in balance.
Everyone edits simultaneously for ~2 minutes over a looping click. The fun is the gap between your private mono view and the full mix on the TV. At the end you hit "Bounce": the host renders the loop to an audio file the room downloads/AirDrops — the keepsake. No scores, no winner; you just made a thing.

## Technical approach
Host tab (holds the master clock + WebAudio graph + speakers) + phone PWAs + authoritative WS server (PartyKit/DO or Socket.IO over Tailscale Serve).
Data model: `Room { code, bpm, steps:16, phase, tracks{ playerId: bool[16] } }`.
Sync: phones send `stepToggle {track, index, on}`; the DO applies it and fans out the full `tracks` map. The HOST is the single audio source of truth — it runs the transport clock and schedules WebAudio samples; phones only render a local preview of their own track, so inter-phone drift is irrelevant (only the host mix is authoritative and recorded).
Genuinely hard part: keeping the host's audio scheduling glitch-free while step data mutates live — use a look-ahead scheduler and quantize edits to the next bar boundary so toggles never click mid-note — plus the "Bounce" render via OfflineAudioContext to a WAV/webm blob.

## v1 scope
- 3 players, 3 instruments (kick, snare, bass), 16 steps, one fixed tempo, one loop.
- Host-only real audio; phones show grid + local preview beep.
- Bounce = 2 loops rendered to a downloadable WAV.
- Room-code join, no accounts.

## Out of scope
- Melody/pitch editing, more instruments, per-phone full-mix audio, saving projects, effects, song arrangement, app-store build.

## Risks & unknowns
- Is blind building fun or just frustrating? Playtest the mono-preview idea.
- Host WebAudio scheduling under live edits; sample latency.
- Downloading audio on iOS Safari (blob handling).

## Done means
3 phones join, each toggles a distinct instrument grid while hearing mostly its own track, the host TV plays the live combined loop through speakers, and pressing Bounce produces one downloadable WAV of the loop.
