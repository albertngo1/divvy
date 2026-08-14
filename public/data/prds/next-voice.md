## Overview

A 4-player, 3-minute standoff where speaking is a *move* with a cost you can only estimate. The host TV holds a face-down "barrel" of Charges aimed at the next person to make a sound; every phone privately holds a hand of Charges and one sentence it is obligated to say aloud. For groups who enjoy watching four people sit in expensive, deliberate silence.

## Problem

"Don't talk" games are one-note: the loss condition is an accident. This one makes talking a *decision* with unknown expected value — sometimes the barrel is full of gifts — and then guarantees everyone must take it at least once, so nobody gets to sit the round out.

## How it works

The TV shows: the barrel's card count (faces hidden), a silence timer, four scores, and four obligation lights.

Every 5 seconds of unbroken room silence, the server adds a random Charge from a shared deck. Charges are mixed-sign: **+6**, **−8**, **steal 4 from the target**, **reveal one card of the target's hand**, **double the next barrel**.

Each phone privately shows:
- **Your hand** — 3 Charges. Once per barrel you may secretly load one. The TV's count ticks up; nobody learns whose or what.
- **Your Utterance** — a specific throwaway sentence ("the fridge is making that noise again") you must say aloud before the round ends, or take −20.

When the mics detect speech for >400 ms, the server attributes it to one player, discharges the entire barrel face-up onto them, and empties it. If what they said fuzzy-matches their Utterance, their obligation light goes green.

So: silence inflates the pot, but four obligations and a 3-minute clock mean somebody has to eat it. You know exactly one card in there — yours. If you loaded the −8, you want a rival to break first, and you cannot say so, because saying so *is* breaking first. Two people speaking at once is a CLASH: no discharge, and the barrel gains a card.

## Technical approach

Host tab + phone PWAs + authoritative PartyKit Durable Object. Phones run an AudioWorklet (RMS + voicing gate, 40 ms frames) and stream energy envelopes at 20 Hz — raw audio never leaves the phone. Utterance matching runs on-device via Web Speech; only a boolean crosses the wire.

Data model: `Room{barrel: Charge[], deck, silenceTimerStart, players:{id, hand, utterance, obligationMet, score}}`.

Hard part: attribution across four mics in one room. Mic bleed means all four hear everything. Approach: lobby noise-floor calibration per device, then argmax of smoothed relative-to-floor energy with 300 ms hysteresis and a lockout after each discharge; if the top two are within 3 dB, declare CLASH rather than guess. Misattribution is the game-ending failure mode, so the tie rule is deliberately trigger-happy.

## v1 scope

- Exactly 4 players, one 3-minute round
- 6-card deck, 3-card private hands, one load per barrel
- 4 hardcoded Utterances
- TV: barrel count, silence timer, 4 scores, 4 obligation lights, discharge reveal

## Out of scope

Multiple rounds, custom Utterances, per-charge targeting, non-speech sound handling (laughs count — that's the joke), spectators, rematch flow.

## Risks & unknowns

A laughing room discharges constantly and the standoff never forms. Utterances may be too easy to blurt at second one, deflating the endgame — the −20 may need to be a fraction of the pot instead. Attribution in a room with a TV playing sound is untested.

## Done means

Four phones in one living room finish a round; an observer scoring by ear agrees with the server's attribution on ≥9 of 10 discharges; the room holds at least one unbroken 20-second silence with a barrel of 4 or more.
