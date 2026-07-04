# Pass The Volume

## Overview
Hot-potato game where the "potato" is held by whoever's speaking loudest. Each phone shows a shared timer + a small potato icon; the potato lives on the phone whose mic amplitude is currently highest. Players say anything — loud, sustained volume grabs it; whisper and you lose it to someone louder. When the timer expires, whoever's holding the potato loses the round. 5 rounds; least losses wins. Voice + mic amplitude sensor combined create real-time competitive volume dynamics.

## Problem
Voice-driven party games (Werewolf, Mafia) treat voice as a channel for discussion, not as a game mechanic itself. There's an untapped mechanical space in "who is speaking, at what volume" as continuous game state. Physically, "loudest voice grabs the potato" is unplayable — no scoring, no history, no fairness. Per-phone with real-time mic amplitude broadcast makes it playable and legible: everyone can see the potato move phone-to-phone in real time.

## How it works
Room code join, 3-8 players. Round starts: shared timer counts down from 15 seconds; potato icon appears on ALL phones with an indicator showing whose phone currently "holds" it. Each phone's mic amplitude is broadcast at ~5Hz; server assigns the potato to whichever player has the highest amplitude (with a small hysteresis to prevent flapping). Timer ticks down; players yell, sing, whistle, make noise — whoever's loudest at the exact moment the timer hits zero loses the round. Between rounds, 5-second rest with the eliminated round score. Best of 5 rounds. Explicit rule: silence = 0 amplitude = safe, but the loudest at zero loses. Meta-strategy: fake-outs, timing lulls, coordinated silence.

## Technical approach
PartyKit / Durable Objects with 100ms tick rate. Room state = `{potato_holder: player_id, amplitudes: {player_id: db}, timer_remaining, scores}`. Client mic amplitude via Web Audio API `AnalyserNode` computing RMS every 100ms, sent at 5Hz. Server computes rolling 200ms avg amplitude per player, assigns potato to max. Hysteresis: won't switch potato unless someone else is 15% louder than current holder for 500ms — prevents ping-ponging. Broadcast state to all clients at 5Hz for smooth potato animation.

## v1 scope
4-6 players, 5 rounds, 15-second timer per round, 100ms tick rate for amplitude sampling, simple hysteresis (15% delta over 500ms). Score = number of rounds NOT holding potato at timer end. No difficulty tiers, no volume caps, no fairness adjustments for quiet vs loud voices. Web only, mic permission at join gesture.

## Out of scope
Volume normalization per-player (quiet-voiced players are at a mechanical disadvantage in v1 — a wart to accept), custom timer lengths, freeze-frames or replay of the final second, tournament mode, team-vs-team, "shout topic" prompts, mic-input visualization beyond amplitude bar.

## Risks & unknowns
Volume-based scoring is inherently unfair to quiet players — no mechanical fix without complex normalization; may need "handicap mode" as a v2. Mic amplitude varies wildly by phone hardware and iOS aggressive noise cancellation may squish loud voices. Playtest question: is 15 seconds too long (everyone tires), too short (no meta strategy)? Probably need to tune. Room noise floor matters — a truly quiet room makes the game more about volume; a noisy party may make everyone constantly around the same amplitude and the potato flickers randomly. Consider adding "reference volume calibration" at round 0.

## Done means
4 friends open the room, grant mic permission, and play through 5 rounds of shouting. If at any point everyone falls silent to try to *pass* the potato, or someone screams and everyone else laughs, v1 shipped.
