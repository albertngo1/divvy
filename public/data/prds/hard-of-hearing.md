## Overview

A 4-player game where speaking aloud is literally a routing decision. Each phone measures what its own mic picked up; the server compares those envelopes and decides who was in earshot of whom. Say something and it is delivered — as private text — only to the phones that plausibly heard it. Volume is your addressing scheme. For groups willing to get up and cross a room.

## Problem

Party games say "whisper it to them" and then trust people. There is no *mechanism*. Meanwhile silence games usually just tax loudness. The itch: make loudness a **bandwidth vs. leakage tradeoff** the hardware actually adjudicates, so the punishment for talking is not a fine — it is that the wrong person now knows.

## How it works

Each player privately holds two CONSIGNMENTS: a short code phrase plus the name of exactly one intended recipient (e.g. `"BLUE OTTER" → Priya`). Recipients are assigned so nobody's two consignments share a target and nobody knows who is sending to them.

To deliver, you say the phrase aloud. The server then decides, per other phone, whether that phone *heard* it:
- Heard by the intended recipient only → +3, delivered.
- Heard by the recipient and others → +1 and each extra listener's phone privately gains a SPILL card naming the phrase (spill cards are worth points to *them* at scoring).
- Heard by nobody → nothing, and you have burned one of your four Utterances.

Host screen (public): a slowly filling DELIVERY BOARD of anonymous checkmarks and spill blots — how much got through and how much leaked, never who. Plus the Utterance counter per seat.

Phone (private): your two consignments, your Utterance count, a live EARSHOT bar showing how loud you currently register on your *own* phone, and an inbox of things other people delivered to you and things you merely overheard. Every phone's inbox is different — that asymmetry is the game and cannot survive one phone passed around.

Players end up standing, turning away, cupping hands, and timing deliveries for when someone else is talking as cover.

## Technical approach

Host browser tab + phone PWAs + PartyKit (or Socket.IO over Tailscale Serve). Phones run an AudioWorklet emitting 50 Hz `{t, dbfs, voiced}` frames — no raw audio ever leaves the device.

Heard-test: the server keeps a 3-second ring buffer of every phone's envelope. On an utterance (speaker = argmax dBFS with ≥6 dB lead), it computes normalized cross-correlation of each other phone's envelope against the speaker's over a ±400 ms lag window; a phone "heard" it if correlation ≥0.6 **and** its peak level clears its own calibrated room floor by ≥8 dB. Clock skew is handled with a three-sample ping/pong offset per client, re-estimated every 10 s.

Hard part: phone mic AGC destroys absolute levels. Mitigation: a 6-second calibration where each player speaks a fixed sentence at normal volume from their seat, giving a per-device gain and floor; plus the correlation test, which is gain-invariant and carries most of the decision.

## v1 scope

- 4 players, one 3-minute round, two consignments each.
- Four Utterances per player, hard-capped.
- Fixed phrase pool of 24 two-word phrases.
- Correlation threshold hard-coded; no per-room tuning.
- Scoring shown once at the end, with each phone's inbox revealed.

## Out of scope

Multi-round, phrase authoring, spill trading, whisper-to-a-group addressing, any visualization of the earshot graph during play.

## Risks & unknowns

A small, hard-surfaced room may make everyone hear everything, collapsing the game — needs a playtest at realistic living-room distances. Correlation can false-positive when two people talk at once. Players may find "the server decided you weren't heard" unfair; the per-phone inbox reveal at the end is the fairness receipt.

## Done means

Four phones calibrate and play; a deliberately quiet delivery lands in exactly one inbox while a normal-volume one lands in three; the end-of-round reveal shows each phone a different inbox; and at least one player changes physical position specifically to shrink their earshot.
