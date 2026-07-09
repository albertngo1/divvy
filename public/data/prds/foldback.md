## Overview
Foldback is a cooperative micro-jam for 3–5 friends — explicitly for non-musicians. Everyone becomes one instrument in a single looping bar of music, editing simultaneously on their own phone. There is no score. You win by making a thing: at the end the host bounces the loop to a shareable link (and later, a file) — a tiny piece of music that only this room, on this night, made.

## Problem
Group music-making tools are solo or strictly turn-based — one person drives GarageBand while everyone watches. The few 'jam' apps assume one device or serial hand-offs. The itch: let a whole room build one loop *at once*, each person half-blind to the others, and end with a keepsake instead of a leaderboard.

## How it works
The host TV shows a shared 8-step timeline and is the single loud audio source — the master mix plays out of the TV continuously. Each phone privately owns ONE instrument (kick, snare, bass, bell...) and shows only YOUR 8-cell step grid. Tap cells to toggle your hits; edits land on the next bar so the loop never stutters.

The twist — foldback: your phone quietly plays a private *monitor mix* of only your own track plus one assigned neighbor's track. So you build partially blind, feeling for a groove you can't fully hear. The complete mix exists only on the host and is only fully heard at the 'reveal' — the host plays the finished bar through twice and offers to seal it.

Private (phone): your step grid + your partial foldback monitor. Shared (host): the full timeline visualization + master audio + the final saved loop.

## Technical approach
Host browser tab + phone PWA clients + an authoritative WebSocket server (PartyKit / Cloudflare Durable Objects, or Socket.IO over Tailscale Serve). Data model: `room {bpm, steps:8, tracks:{playerId, instrument, cells:[bool×8]}}`. Sync: the server is the clock authority, broadcasting a bar-tick with `serverTime`; each client schedules its WebAudio playback against `AudioContext.currentTime` aligned to that tick, with a ~120ms lookahead window. Toggle ops are tiny and applied only at bar boundaries for determinism.

The genuinely hard part is phase: the host is the loud source, and phones' foldback monitors must stay roughly in phase or the room sounds smeared. Mitigation — keep phone monitors quiet (they're coaching aids, tolerant of small drift), measure RTT per client, and schedule audio ahead. Also: mobile WebAudio needs a user-gesture unlock on join.

## v1 scope
- 3 players, 3 fixed instruments, one 8-step bar, fixed tempo (90 BPM)
- Foldback simplified to 'your track + master' (skip per-neighbor routing)
- Continuous loop, edits apply next bar
- 'Seal' produces a shareable state link that reproduces the exact loop (no file export yet)

## Out of scope
- Pitched melodies, more than 3 instruments, tempo control
- WAV/stem export, per-neighbor monitor routing, song sections

## Risks & unknowns
- Mobile audio autoplay unlock friction
- Phase drift between host and phone monitors sounding confusing
- Whether 'foldback blindness' is fun tension or just frustrating
- No explicit win beat — does the reveal land emotionally?

## Done means
3 phones join, each toggles its own 8-step grid, the host plays a synced loop combining all three within a single bar, and pressing 'Seal' yields a shareable link that reproduces that exact loop for anyone who opens it.
