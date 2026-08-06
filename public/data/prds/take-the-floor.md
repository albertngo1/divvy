## Overview

A 3-4 player cooperative pressure-cooker for a living room with a TV and a phone per person. Everyone must get a private phrase out of their head and into the record by *saying it aloud* — but the room shares one airtime budget and one microphone floor, and stepping on someone else destroys both submissions. It is a game about queueing, done entirely without the ability to discuss the queue.

## Problem

Party games that "punish talking" usually just make speech a penalty, which flattens into everyone sitting still. The itch here is the opposite: speech is *mandatory and scarce*. The fun is the silent traffic-control problem — who goes now, who waits, who gets sacrificed — solved by eyebrows and pointing while a clock burns.

## How it works

PHONE (private, never on TV): your phrase, drawn from a deck with wildly asymmetric lengths — one player gets "Blue." and another gets a 14-word tongue-twister. A big PUSH TO TALK pad. Your own live transcript. A CORRUPTED stamp if you got stepped on.

HOST TV (public): a 100-second bar; four anonymous-ish lanes showing only OPEN / SPEAKING / DONE / BURNED; a red CLASH flash when two lanes are hot at once. No text, no word counts, no names against phrases. The TV never reveals how much airtime anyone still needs.

Hold your pad, say your phrase, release. If exactly one player is voiced during your utterance, the server accepts the transcript and locks it. If two are voiced with >400ms overlap, BOTH utterances burn and both phrases return to the queue, minus the wasted seconds. The room wins only if every phrase lands before the clock dies. Total clock is deliberately ~15% under the sum of everyone's needs, so somebody must be silently voted off the floor — and the long-phrase player cannot tell you they're long without spending the very airtime they need.

## Technical approach

Host tab + phone PWAs + authoritative WebSocket server (PartyKit Durable Object, one per room code). Phones run an AudioWorklet computing 20ms A-weighted RMS plus a zero-crossing voicing gate, and stream only `{t, rms, voiced}` at 50Hz — no audio leaves the device. Transcription is on-phone Web Speech API; only the final string is sent.

Data model: `Room{code, clockMs, phase}`, `Player{id, phrase, needMs, transcript, burned[]}`, `Floor{holderId|null, sinceT}`. Server keeps a 2-second ring buffer of every phone's voiced flags on a common timebase.

The genuinely hard part is clash adjudication. Clock skew between phones (NTP-ish ping offset estimation, re-sampled every 5s) plus mic bleed — your phone hears the person next to you — will false-positive constantly. Mitigation: per-phone noise-floor calibration during a 3-second lobby hush, a 6dB margin over that floor, and a rule that only the *argmax* phone by RMS in each 250ms window counts as voiced, with 400ms hysteresis so a laugh doesn't steal the floor.

## v1 scope

- 3 players, one 100-second round, one phrase deck of 12
- Push-to-talk pad, on-device ASR, exact-ish string match (normalized, 85% token overlap)
- TV: clock bar, three lanes, clash flash
- Win/lose screen listing which phrases landed

## Out of scope

Scoring across rounds, phrase authoring, spectators, iOS Safari ASR fallback beyond a manual "I said it" confirm, any voice identification.

## Risks & unknowns

Safari's Web Speech support is shaky — fallback is transcript-free, judging only "did you hold the floor clean for your needMs". Mic bleed in a small room may make clashes feel arbitrary. Players may just take turns clockwise and defuse the tension; the under-budget clock is the fix, and needs playtest tuning.

## Done means

Three phones join by code, each shows a different private phrase, one player speaking alone produces an accepted transcript within 1.5s, two speaking together burns both within 600ms and flashes the TV, and the round resolves win or lose at zero on the clock.
