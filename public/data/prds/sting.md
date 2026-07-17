## Overview
Sting is a 3–5 player co-composition party game that produces one short musical *ident* — think TV station sting or a household doorbell theme — as a saveable keepsake. It's for a room of friends or family who want to make one small THING together, not rack up points.

## Problem
Group music-making almost always collapses to one person hogging the aux, and layering apps (loopers, GarageBand jams) turn into mush nobody can reproduce or keep. You spend an evening making sound and walk away with nothing. Sting gives the room a tiny, coherent artifact — a twelve-note signature — that it authored blind, together.

## How it works
Players are seated in a ring. The host TV shows a shared staff of N empty slots (one bar per player), a big PLAY button, and a live "bars committed" tally — but never the actual notes until reveal.

Each phone shows a tiny five-key pitch pad plus a four-step sequencer: you compose exactly four notes, *your* bar. The load-bearing twist: before you write anything, your phone privately plays you ONLY the last note (the "tail") of the player positioned before you in the ring. You are blind to everyone else's bars and to the whole. You tap out four notes that follow that single tail. Everyone composes simultaneously.

When all bars commit, the host stitches them in ring order and plays the full sting aloud, then exports it as a WAV plus a printed "score" card — the keepsake. There is no scoring; the fun is the surprise coherence (or glorious chaos) of a melody nobody could hear while building it.

**Private (phone):** your four-note pad, your predecessor's single tail note (different for every phone), your in-progress bar preview. **Shared (TV):** the slot timeline, the commit tally, and the final playback + score.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `room { players[], ringOrder[], bars: {playerId: Note[4]}, phase }`, `Note { pitch, step }`. On `phase=compose`, the server computes each player's predecessor tail and pushes ONLY that note to that phone. Bars commit independently; the server holds every bar secret until all are in, then broadcasts the assembled sequence to the host for Web Audio / Tone.js playback. Genuinely hard part: making any stitch sound tolerable — solved by fixing tempo and constraining to a pentatonic scale so consecutive bars can't clash. No cross-device audio streaming: phones preview locally, the host is the only speaker, so latency never matters.

## v1 scope
- 3 players, one ring, four notes each
- Fixed pentatonic scale + fixed BPM
- Host-only playback
- WAV + PNG "score" export

## Out of scope
- Chords, multiple instruments, tempo/scale choice
- More than one round; a saved library
- Playing other players' bars on phones

## Risks & unknowns
- Pentatonic may make every sting sound samey.
- A single tail note may be too little context to feel connected to your neighbors.
- Twelve notes might be too short to feel like a real keepsake.

## Done means
Three phones each commit four notes after hearing only their predecessor's tail; the host plays one continuous twelve-note sting and exports a WAV + score PNG the group can replay.
