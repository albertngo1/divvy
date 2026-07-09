## Overview
Overdub is a 3–5 player concurrent-room game where the group builds a single short multitrack recording — a bassline, a hum, a clap pattern, a spoken word line — without ever hearing each other while they record. The prize is not a score; it's the finished ~15-second track, exported so everyone leaves with the same keepsake audio file of the ridiculous thing they just made.

## Problem
Group music-making usually collapses into one loud person or endless takes. And the magic moment — hearing all the parts snap together for the first time — gets spoiled when you overdub serially and hear each layer accrete. Overdub protects the surprise: nobody hears the whole until the reveal.

## How it works
The host TV shows a shared 4-bar loop with a visible playhead and a metronome, plus a track list (Player 1: Low, Player 2: Rhythm, Player 3: Melody…). On a countdown, EVERY phone records simultaneously through its mic for exactly the loop length while the player hears ONLY a click track in their earbud/speaker — never anyone else's part. Each phone PRIVATELY shows: your assigned role card ("you're the low end — hum or thump"), a live input-level meter, and the click. The host screen PRIVATELY shows to no one the audio itself during recording — only role labels and a filling progress ring per player.

After the take, the server time-aligns all layers to the click and plays the mixed loop back on the host once. Optional: one more overdub pass where players, now having heard it, add a second layer — still blind to each other's new take. Then the host renders the final mix and pushes a download link to every phone. No winner, no points — the artifact is the point.

## Technical approach
Host tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room { loopMs, bpm, clickTrack, takeIndex, players[] }`, `Player { id, role, trackBlobId, status }`, `Take { playerId, blobId, offsetMs }`. Sync strategy: the server broadcasts a `START_AT(serverTs+3000ms)` timestamp; each phone schedules recording via WebAudio `AudioContext.currentTime` relative to a one-time clock-offset handshake (NTP-style ping) so all takes share a timeline within ~30ms. Phones capture with MediaRecorder, upload the blob post-take, and the host mixes by decoding each buffer and summing at its offset in an OfflineAudioContext, then exports WAV/MP3. The genuinely hard part is clock alignment across heterogeneous phones and mic latency; v1 leans on the shared click as the ground truth and lets players self-correct against it rather than chasing sub-10ms sync.

## v1 scope
- 3 players, one fixed 4-bar loop at one tempo, one blind take (no second pass).
- Three fixed roles with one-line prompts.
- Host mixes and offers a single download link.
- No trimming, no effects, no re-record.

## Out of scope
- Pitch correction, effects, per-track volume mixing.
- Choosing tempo/key, custom loops, more than one overdub pass.
- Persistent gallery of past tracks.

## Risks & unknowns
- Mic latency and clock drift may make takes feel loose; the click may not fully save alignment.
- Speaker bleed if players don't use earbuds could leak the click into recordings (acceptably lo-fi, or require earbuds in v1).
- Fun hinges on the reveal landing; a bad blind take can't be redone in v1.

## Done means
Three phones record simultaneously against a shared click, the host plays back a time-aligned mix within one loop of the take ending, and all three phones can download the identical rendered audio file.
