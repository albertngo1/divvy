## Overview
Pin Drop is a cooperative 3–4 player room game where *silence is the key that unlocks information*. Each phone holds a private clue that is legible only while its owner's microphone reads near-total quiet. The group must collectively hush the room long enough for everyone to read, memorize, and combine their fragments into one answer — with no talking allowed, because a single voice re-scrambles everyone's screen.

## Problem
Most "quiet" party games treat silence as a penalty condition bolted onto a talking game. Nobody's fun is *made of* silence. Pin Drop makes achieving genuine, shared, sustained quiet the literal win condition — the rare game where holding your breath together is the whole mechanic, not a rule you're punished for breaking.

## How it works
The host TV shows a locked 4-symbol combination puzzle and four empty slots (one per player). Each phone PRIVATELY shows one clue — e.g. "the third symbol is the one shaped like your slot color" — but rendered as heavy visual static/blur. Legibility is driven live by that phone's own mic RMS: dead quiet → razor sharp; any sound above the floor → instantly scrambled. Crucially, clues only *stay* readable if the phone holds silence ~2s, so a quick lull isn't enough.

Because each player's clue references others' slots, no one can solve alone. They must all be silent *at once* to read simultaneously, then coordinate entering symbols — but talking is forbidden (it blanks the room). Players input their chosen symbol via their own phone into the shared host lock, using gestures and eye contact only. The shared host screen shows the aggregate room "noise floor" as a trembling meter and the combination slots filling in; it never shows any clue text.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room { puzzle, slots[4], floorMeter }`, `Player { id, slotColor, clueText, micRMS, legible:bool }`. Each phone runs WebAudio AnalyserNode, computes smoothed RMS locally, and gates clue opacity on-device (no audio leaves the phone — privacy + latency). Phones stream only a scalar RMS at ~5Hz to the server, which aggregates the room floor meter. Symbol inputs are authoritative on the server. Hard part: per-device mic calibration (phone mics and ambient rooms vary wildly) — solve with a 3s "baseline" step at start that sets each phone's personal floor, then thresholds are relative to baseline, not absolute.

## v1 scope
- 3 players, one puzzle, one round
- One 4-symbol combination lock
- Per-phone RMS-gated clue legibility + calibration step
- Shared floor meter + slot inputs on host

## Out of scope
- Multiple rounds, scoring/leaderboards
- Audio watermarking or real steganography (just RMS-gated blur)
- Timers, difficulty tiers, rejoins

## Risks & unknowns
- Rooms are never truly silent (HVAC, street) — relative calibration must be forgiving
- Whether "read in silence, then input silently" is thrilling or just tense-annoying
- Cheating by muting via cupped hand — acceptable, it's co-op

## Done means
Three phones, each showing a distinct clue that sharpens under ~2s of that player's silence and scrambles on any sound; the group achieves simultaneous quiet, reads all clues, and enters the correct 4-symbol combination on the host without speaking.
