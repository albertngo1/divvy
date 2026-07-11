## Overview
Foley is a 3-5 player concurrent-room party game where the group performs a single Foley sound scene — a rainstorm at a bus stop, a haunted kitchen — with their voices and bodies, and walks away with the finished audio clip as a keepsake. It's for friends who like being silly out loud, not competitive strategists. There is no score.

## Problem
Group audio games usually mean one person performing while everyone watches, or karaoke where talent wins. The itch: a way for *everyone* to make a sound at the same time and be surprised, together, by the mess they built — and to keep it.

## How it works
The host TV shows the scene title, a 3-2-1 countdown, and a shared 15-second timeline scrubber. Each phone PRIVATELY shows ONE assigned sound layer and a cue card: e.g. 'YOU ARE: distant thunder — perform low rumbles, peak around second 8' or 'YOU ARE: dripping faucet — steady, whole clip.' Phones never reveal each other's assignment.

On the countdown, every phone records mic audio simultaneously for 15 seconds. Crucially, no phone plays back the mix while recording — you perform BLIND, guessing where others are in the scene, which is the whole comedy (your thunder lands on top of someone's giggle). The server time-aligns all clips to the shared countdown timestamp, normalizes and layers them, and plays the composite on the TV. The artifact is a downloadable/QR-shareable WAV the group keeps. An optional second take lets them try to actually sync.

## Technical approach
Stack: host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room { code, sceneId, phase, players[] }`, `Player { id, layerId, cueText, clipBlobRef, recordStartOffsetMs }`. Sync strategy: the server broadcasts a single `START_AT` wall-clock timestamp; each phone schedules `MediaRecorder.start()` against `performance.now()` corrected by a lightweight NTP-style offset ping (median of 5 round-trips) so all recordings share a common t=0. Phones upload their 15s Opus blob on stop. The genuinely hard part is alignment: mic latency and recorder-start jitter vary per device, so the server trims each clip to the corrected offset and cross-correlates against the shared countdown 'beep' (recorded by every phone) to nudge sub-100ms drift out before mixing with Web Audio `OfflineAudioContext`.

## v1 scope
- 1 hardcoded scene with 4 fixed layers (thunder, drips, footsteps, door creak)
- 3-4 players, one round, one take
- Blind simultaneous 15s record + server layer + TV playback
- Downloadable WAV via QR

## Out of scope
- Scene library, custom scenes, difficulty
- Live monitoring / hearing others while recording
- Per-layer volume mixing UI, effects, reverb
- Reconnection mid-record, spectators

## Risks & unknowns
- iOS Safari MediaRecorder / mic-permission quirks and Opus support
- Clock-offset accuracy across a noisy home WiFi may leave audible drift
- Room echo / phones picking up *each other's* live performance muddies layers (may need players to spread out)
- 'Blind' timing might feel frustrating rather than funny if scenes are too structured

## Done means
Three phones on the same WiFi join a room, each shows a different private cue, all record on one countdown, and within 5 seconds of the last upload the TV plays a single mixed 15-second clip where all four layers are audible and roughly aligned, with a working QR to download the WAV.
