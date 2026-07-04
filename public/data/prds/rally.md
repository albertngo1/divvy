## Overview
Rally is a cooperative rhythm game where one song's note track is chopped up and scattered across everyone's phones. The host laptop plays audio and shows a shared combo meter; each player is silently responsible for 2-3 notes per bar. Miss your notes and the group's combo drops. Nobody can win alone — the fun is that half the track is invisible to you until someone else nails their part.

## Problem
Rhythm games are single-player-flow experiences: one player, one screen, one input. Multiplayer rhythm games (Rock Band, JoyPixels co-op) require a living-room's worth of controllers and a TV setup. Party-game rhythm modes are almost always "everyone plays the same track in parallel and we compare scores" — parallel, not cooperative. No one has built a rhythm game where you literally can't complete the song without the person next to you.

## How it works
Lobby of 4-10 phones joins via room code. Host laptop is the audio + big-screen renderer. When the song starts, each note in the track is deterministically assigned to exactly one phone based on player index. Your phone shows a scrolling lane of only *your* notes; you tap them at the right moment. The shared combo counter on the host TV multiplies as long as *nobody* misses. Miss → combo resets → everyone groans. Songs are 60-90 seconds. Group completes the song, sees a final combo score, plays again.

## Technical approach
WebSocket clock-sync at millisecond precision — each phone runs a Cristian-style handshake with the host at join and every 10s to correct drift. The host emits a canonical `songStartAt` timestamp; phones schedule their note-track render against that timeline via `requestAnimationFrame` + Web Audio API `AudioContext.currentTime` for local metronome. HTML canvas draws each phone's private scrolling lane. Note assignment is a pure function `(songId, playerIndex, totalPlayers) → notes[]` so no runtime coordination is needed. Miss events broadcast to host, which recomputes the combo and pushes it back to all phones + the TV view.

## v1 scope
- 3 hand-authored songs, ~75s each, ~40 notes total per song
- Deterministic round-robin note assignment (no difficulty balancing)
- Tap-only input (no hold, no swipe)
- Combo counter + final score screen; no leaderboards, no unlocks

## Out of scope
- User-uploaded songs, MIDI import, generative note maps
- Difficulty tiers, per-player handicaps
- Cross-session leaderboards or accounts

## Risks & unknowns
- Clock drift on cheap Android browsers; may need ≥100ms tolerance windows
- Audio latency variance between iOS Safari and Chrome — could make "tap on the beat" feel unfair
- Distributed notes may feel *too* sparse for the phone-holder — need to tune notes-per-phone-per-second

## Done means
Six phones in one room join a lobby, the host plays a 75-second track, and every phone taps its unique subset of notes with the shared combo hitting at least 30 before the first missed note — verified against a scripted playthrough.
