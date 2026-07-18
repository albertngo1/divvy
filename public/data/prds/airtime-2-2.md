## Overview
Airtime is a 3-player cooperative puzzle for people who love the tension of "who talks, and how little." The team shares one scarce resource — total speaking time — displayed as a draining bar on the host TV. Everything you need to win is split across three phones, so you *must* exchange information; the whole game is deciding what's worth saying out loud.

## Problem
Co-op party games reward the loudest, fastest talker. Airtime inverts it: the itch is the agony of rationing speech, choosing the two words that carry the most, and biting your tongue while a teammate figures it out. Silence is literally the currency.

## How it works
The host TV shows a 3-dial combination lock (each dial 0–9) and a communal **Airtime** bar starting at 12.0 seconds. Any time *any* phone's mic detects voice, the bar drains in real time; two voices overlapping drain at 2×. At 0.0 the mics "lock" — further detected speech costs a strike, and 3 strikes fails the round.

Each phone PRIVATELY shows a different slice of the constraints, and no phone shows the answer:
- Phone A: "Dial 1 is even. Dial 3 is prime."
- Phone B: "The three dials sum to 14."
- Phone C: "Dial 2 is exactly double Dial 1."
Only by pooling can the team deduce the unique code. Any player can silently drag the dials on their own phone (dial state is shared/authoritative); the round ends when all three lock in the same code and submit.

The host screen also shows a live per-seat mic ring so the room can *see* who's burning airtime — public accountability for the over-talker, which is half the comedy. Win = correct code before Airtime or strikes run out; the TV then replays a transcript of the (tiny) total number of words the team actually spoke.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. Data model: `Room{ airtimeMs, strikes, dials:[d1,d2,d3], seats:[{id, micActive, voiceMsSpent}] }`, plus per-seat private `clueText`. Sync: each phone runs WebAudio RMS + a short voice-activity gate on-device and streams a boolean `voiceActive` at ~10Hz; the server is the single clock, decrementing `airtimeMs` by elapsed × (number of active seats, ≥1 counts single, ≥2 doubles). Genuinely hard part: fair, low-latency voice-activity detection that doesn't false-trigger on the TV's own audio or a cough — needs a calibrated noise floor per phone at lobby start and a 200ms debounce so a single word ≈ a predictable, small cost. Dial state is last-writer-wins with server echo.

## v1 scope
- Exactly 3 players, one round, one 3-dial lock with one hand-authored clue triple.
- 12.0s shared budget, 3-strike fail, single win screen with word-count replay.
- Per-phone: private clue text + drag-a-dial + mic VAD.

## Out of scope
- Multiple puzzles, difficulty tiers, procedural clue generation.
- Speech transcription (v1 only needs voice/no-voice, not words).
- More than 3 seats, spectators, scoring across rounds.

## Risks & unknowns
- VAD robustness in a noisy living room; TV audio bleed into phone mics.
- Calibrating budget so it's tense but winnable with terse play.
- Players might mime/gesture around the mic — acceptable, even fun, but tune so speech is still the fast path.

## Done means
Three phones join, each shows a distinct clue, the shared bar visibly drains only while someone is speaking (2× on overlap), and a team that pools clues in under 12s of talk opens the lock and sees its word-count replay; running the bar to 0 locks mics and a 3rd strike fails the round.
