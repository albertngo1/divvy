## Overview

Splash Zone is a 3–5 player, single-round (about four minutes) in-person game where every phone is a microphone that meters its owner. Players hold private facts they must trade by physically speaking — and speech is the only thing in the game that costs money. For groups already sitting in one room who want the room itself to be the board.

## Problem

Party games treat talking as free and infinite, so the loudest, fastest talker wins and the quiet player spectates. "Quiet" games usually just mean "don't laugh." Nobody has priced speech as a metered utility and let a room negotiate around it — deciding whether a fact is worth broadcasting, worth walking across the carpet for, or worth nothing at all.

## How it works

**Calibrate (20 s).** Each phone records its own noise floor in silence, then one spoken name at normal volume, yielding a per-device floor and gain reference.

**Round (3:00).** The host screen shows a five-slot combination, all blank, and a rising water line. Each phone privately shows: (a) one FACT it owns ("slot 3 is the heron"), (b) an ANSWER CARD needing three slots it does *not* own, (c) a live soak meter in centiliters, (d) LOCK IN.

Facts move only through human speech. There is no chat, no tap-to-send, no way to show your screen without leaving your card visible. Meanwhile every phone integrates A-weighted energy above its own floor and charges that integral to its owner. The physics does the rest: your phone in your pocket hears you loudest, so talking is expensive *for you*, and anyone within a couple of meters pays a proximity share. Broadcasting to the room is a luxury purchase. Crossing the room to murmur to one person is cheap — but that person has to consent to lean in and get soaked, and they can refuse.

The host screen shows only the room-total water line and anonymous splash bursts at whichever phone is currently loudest — never a name. Score: +100 per correct slot on your own card, −1 per soak unit.

## Technical approach

One PartyKit Durable Object per room; host tab and phone PWAs both join over WebSocket. Phones run `getUserMedia` with `autoGainControl`, `echoCancellation`, and `noiseSuppression` all **off**, into an AudioWorklet: 20 ms frames → A-weighting biquad → RMS → dBFS. Phones ship 5 Hz summary packets `{seq, dbA, peak}` — never audio — which keeps bandwidth trivial and makes the privacy story honest.

Model: `Room{phase, t0, slots[5], splashLeader}`, `Player{id, floorDb, gainRef, soak, factId, cardId, locked}`. The server integrates energy from client packets and is authoritative on soak; only the aggregate goes to the host, private state goes as targeted messages.

The genuinely hard part is cross-device mic normalization. iOS applies gain shaping even with AGC disabled, and a phone face-down on a couch cushion reads 12 dB below one on a table. Mitigations: calibration offsets, score on relative rank rather than absolute dB, and cheat detection — a stream whose variance collapses below a plausible floor is flagged "mic covered" and charged a flat penalty rate.

## v1 scope

- 4 players, one round, one hardcoded five-slot puzzle with four fact/card pairs
- Calibration, soak metering, water line, splash bursts, lock-in, final scoreboard
- Host tab + phones on the same LAN via Tailscale Serve

## Out of scope

- Multiple rounds, puzzle generation, rejoin, spectators, sound effects, any transcription

## Risks & unknowns

- Soak may be so punishing nobody speaks and the round deadlocks — needs a price-per-unit tuning pass with real players
- Phones in pockets may be muffled enough to invert the intended "you pay most for your own voice"
- Room ambience (TV, dishwasher) drifting above the calibrated floor

## Done means

Four phones in one living room; a player crosses the room, murmurs a fact, and both their soak meters tick up while the host water line rises — and at least one player ends the round having correctly solved their card by buying information from exactly two people.
