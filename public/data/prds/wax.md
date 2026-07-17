## Overview
Wax is a 3–6 player party keepsake game about disappearing into a crowd. Everyone answers one confessional prompt out loud into their own phone; the server anonymizes every voice to a common timbre, sequences the clips into a single looping "record" that plays on the shared TV, and hands the group a downloadable audio file. The twist: after listening, each player secretly tries to attribute every clip — and you win by staying unidentified.

## Problem
Group voice memos are hilarious in the moment and then lost forever. And the honest, funny confessions never come out, because your voice gives you away instantly. Wax removes the risk (anonymized timbre) and keeps the artifact (a pressed record), turning "who said that?" into the whole game.

## How it works
The host TV shows one prompt ("an unpopular opinion you'd defend to the death"). Every phone PRIVATELY shows a big record button, your own live waveform, an 8-second timer, and a private **Anonymity Meter** — a quick client-side pitch/energy fingerprint that estimates how recognizable your processed clip will be, nudging you to re-record more flatly if you're too exposed. Recording is simultaneous and private; no phone ever plays another's raw clip. The host screen shows only an anonymized groove animation and a count of clips received — never who submitted what.
When all clips are in (or the timer fires), the server presses them into one continuous record with short crossfades and plays it on the TV — this is the keepsake. Then a private guess phase: each phone lists the clips and you secretly attribute each to a player. Win = your clip is NOT majority-correctly attributed ("you vanished into the wax"). No leaderboard — just a reveal of who stayed a ghost, plus an mp3 download.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `room { players, prompt, clips[{ id, ownerId, rawBlob, processedBlob, guesses{} }], phase }`. Capture via `MediaRecorder` (opus/webm), upload to server. Anonymization: server-side ffmpeg + rubberband for a fixed pitch/formant shift plus loudness normalization, then concatenate to one ogg/mp3. Sync: recording is async per phone gated by an all-in-or-timeout barrier; playback is host-authoritative (host broadcasts a clock); guesses are private submissions tallied at reveal. The genuinely hard part is anonymization that's strong enough that voices aren't trivially ID'd yet still intelligible, produced fast on homelab-scale hardware, plus robust mobile mic capture.

## v1 scope
- 3 players, one prompt, 8-second clips.
- Single fixed pitch-shift anonymize; concatenated playback on TV.
- One private guess round; reveal of who stayed anonymous.
- Downloadable mp3 of the pressed record.

## Out of scope
- Multiple rounds, per-player selectable voices, music bed, video, saved history/scoring.

## Risks & unknowns
- iOS Safari `MediaRecorder` permission/format quirks.
- Anonymization too weak (recognizable) or too strong (garbled).
- Blob upload bandwidth on a homelab server; social awkwardness of recording aloud in a room.

## Done means
Three phones record simultaneously and privately; within ~5s of the last upload the TV plays one continuous anonymized record; each phone privately submits attributions; the app names who stayed anonymous and offers an mp3 download.
