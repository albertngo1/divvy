## Overview

A cooperative four-player game about scheduling speech under a shrinking channel. The TV shows one bar: the room's legal volume ceiling, dropping in four steps from conversational to whisper over four minutes. Each phone privately holds three messages that must be spoken aloud to a specific other player and confirmed by that player's phone. Long messages only survive at high volume. Nobody can see anyone else's queue.

## Problem

Silence-themed party games treat quiet as a scoring rule. This one treats it as *bandwidth* — a resource that is finite, shrinking, and unfairly distributed. The interesting decision isn't whether to talk, it's what to say first, and that decision is itself the most expensive thing you could say.

## How it works

**Calibration (10s):** each player reads a fixed sentence at normal volume. That becomes their private baseline. A loud talker gets less headroom at every tier than a soft talker — and nobody else is told.

**Private on each phone:** your three dispatches, each showing payload phrase, named recipient, and minimum tier. A live headroom meter (green → amber → over) reading *your* current level against *your* calibrated ceiling. When you are the recipient of an attempt, four minimal-pair decoys appear and you tap what you heard.

**Public on the TV:** the ceiling bar and its countdown to the next drop, a delivered/burned tally with no names, and the blackout timer.

**Tiers:** the ceiling steps 68 → 60 → 52 → 44 dBA. A six-word tongue-twister is tier 1 only; a single digit survives tier 4. You learn your own tiers instantly and the room's collective problem never.

**Breach:** any phone's 400ms A-weighted RMS above the current ceiling triggers a 15-second global blackout — every phone locks, no dispatch can be attempted, and the clock keeps running. The person who breached is not named on the TV.

**Win:** ten of twelve dispatches confirmed before the clock ends.

## Technical approach

Host tab plus phone PWAs against a Socket.IO server over Tailscale Serve. Each phone computes A-weighted RMS in an AudioWorklet and reports a 400ms sliding maximum at 5Hz; raw audio never leaves the device. The server owns the ceiling schedule, blackout state, and dispatch ledger — `{id, ownerId, recipientId, tier, payload, decoys[4], state}` — and broadcasts ceiling and blackout transitions to all clients.

The hard part is dB calibration across wildly different phone microphones and AGC. Fix: never compare absolute levels between devices. Every ceiling is expressed as an offset from that phone's own baseline, and iOS AGC is defeated by requesting `autoGainControl: false` with a fallback that recalibrates mid-round if the noise floor drifts more than 6dB.

## v1 scope

- 4 players, 12 dispatches, one 4-minute round, one fixed tier schedule.
- Payloads drawn from a hand-written list of 30 minimal-pair phrases.
- Recipient confirmation = tap one of four decoys. No transcription.
- Blackout is a full-screen lock on every phone. No penalty accounting.
- No accounts, no lobby, no scores between rounds.

## Out of scope

Attributing breaches to a player. Variable tier schedules. Adversarial or hidden roles. Speech-to-text verification. More than four players.

## Risks & unknowns

A genuinely loud-voiced player may be unable to speak at all by tier 3 — funny once, miserable twice; may need a floor on headroom. Rooms with a hard noise floor (fan, street) could make tier 4 physically impossible. Decoy sets that are too easy make the whisper tier pointless.

## Done means

Four phones, four players, one room: the group reaches tier 4 with at least eight dispatches confirmed, blackouts fire on genuine shouting and not on ambient noise, and at least one player is observed sitting on a long dispatch through tier 1 because someone else's was louder-urgent.
