## Overview

A 3-player cooperative crisis game where the constraint isn't time or bandwidth — it's **which words your mouth is allowed to make**. Devils & the Details' mundane-chaos energy, routed through a circumlocution puzzle that only exists because each phone hides a different list.

## Problem

Voice party games treat speech as a pipe: too narrow (one mic), too loud, too slow. Almost none treat the *lexicon* as the scarce resource. And the classic taboo mechanic is competitive and turn-based — one describer, everyone guessing. Nobody has made taboo **concurrent, cooperative, and asymmetric**, where four people are all simultaneously unable to say different things and have to route around each other.

## How it works

The TV shows a failing ship: 6 subsystem tiles (all amber), a 4-minute countdown, and "4 ORDERS REMAINING." It never shows a single word of anyone's order.

Each phone privately shows three things:
1. **Your order** — "GREEN: purge the coolant."
2. **Your banned list** — 5 words in red, pinned to the top. Your order's key word (`coolant`) is always one of them. Nobody else sees your list.
3. **Your panel** — 12 near-identical controls; only you can press yours.

The rule: Green's COOLANT control stays locked until the word *coolant* is spoken aloud by someone who isn't banned from it. Green doesn't know which control to press anyway — her phone shows twelve, unlabelled by urgency. So you have to get a third party to produce the word without being able to say it yourself: *"Bea — the green stuff, in the engine, the thing that stops it melting, what's it called?"*

Banned lists deliberately overlap, so sometimes exactly one person in the room may legally say a given word — and none of you knows who. If **you** say one of your own banned words, your phone buzzes, your panel locks for 10 seconds, and the TV throws a red slash. That penalty, not the software, is what makes the room lean in and start describing things badly.

## Technical approach

PartyKit Durable Object (or Socket.IO over Tailscale Serve). Host tab + phone PWAs.

Data model: `Room {phase, endsAt, vocabulary[18], players[], orders[]}`; `Player {pid, banned[5], panel[12], lockedUntil}`; `Order {id, fromPid, toPid, controlId, keyWord, state}`.

Detection is split, deliberately: the **host laptop's mic** runs the recognizer for the round's 18-word closed vocabulary (Web Speech API, continuous, interim results, filtered to the vocabulary) — one decent mic instead of three bad ones. Attribution of *who* said it comes from the phones: each phone runs an AudioWorklet computing RMS + a voicing gate at 10 Hz and streams ~40 bytes/tick. Raw audio never leaves any phone. On a word hit at time T, the server takes argmax RMS over the 400ms window around T; if the top two are within 3 dB, it's a jumble — no attribution, no credit, say it again.

The hard part is exactly this attribution, not the recognition: two phones on the same coffee table hear the same room. Lobby calibration (5 seconds of silence for per-device noise floor, then each player says their name once for a per-device gain reference) is required, and the 3 dB tie rule has to fail *closed* or the banned-word penalty fires on the wrong person and the game stops being funny.

Spelling a word out loud defeats the detector. That's a house rule on the rules card, enforced by the other players — which is very much the genre.

## v1 scope

- 3 players, one 4-minute round, 6 orders total.
- Hand-authored 18-word vocabulary; 5 banned words each, overlaps hand-seeded.
- Host-mic recognition only; phones do RMS attribution only.
- TV: 6 tiles, timer, orders remaining, red slash on violation.
- Room code join. No accounts, no reconnect, no rematch.

## Out of scope

On-phone ASR, iOS Safari speech parity, 4+ players, generated vocabularies, per-player scoring, difficulty tiers, replay/highlight reel.

## Risks & unknowns

- Web Speech continuous recognition is unreliable on some browsers and needs network; a closed-vocabulary local spotter may be required sooner than v1 admits.
- False-positive banned-word penalties are the game-killer. Confidence threshold and the tie rule need real-room tuning.
- Players may converge on pointing and miming, bypassing voice entirely. Controls being unlabelled-by-urgency on the target's phone is the counter-pressure; unproven.

## Done means

Three phones and a TV join by code. A player says their own banned word and gets a buzz, a 10-second panel lock, and a TV slash within 700ms. A player says someone *else's* banned key word and that subsystem tile flips green. One full round completes with all 6 orders resolved or the timer expiring, and no observed misattribution across a 4-minute round.
