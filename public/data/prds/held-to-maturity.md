## Overview

A 3–5 player concurrent-room game where staying quiet is an investment with a term structure. Every player privately owns a queue of "silence bonds" of different tenors and yields; the room simultaneously has to solve a puzzle that can only be solved by talking. For groups who like a pressure-cooker where the negotiation itself is the expensive resource.

## Problem

Most "be quiet" party games make silence a flat rate: every second is worth the same, so the only decision is whether to talk. That's a single binary repeated for three minutes. Real tension needs *unequal, private, time-shaped* stakes — the moment where one person is nine seconds from a huge payout and the room needs a sentence right now, and only they know it.

## How it works

A 3-minute round. On the TV: six shuffled items that must be put in the correct order. Each phone privately holds two pairwise constraints ("the kettle comes before the ladder"). No one phone has enough. Someone has to say theirs out loud.

Before the round each phone is dealt four bond cards (15s/2pts, 30s/6, 60s/18, 90s/40) and privately picks three, in an order — that's their ladder. Bonds run in sequence from GO. Hold silence for the full tenor and it matures and pays; the next one starts. If the server attributes ≥0.6s of voiced speech to you, the active bond breaks, pays nothing, and the next begins immediately. Talking always burns your longest remaining position.

PRIVATE on your phone: your ladder, the active bond's tenor, yield and live countdown, your matured total, your two constraints, one AMBER button ("I'm cheap right now — I'll talk").

SHARED on the TV: one lamp per player — green HOLDING, red flash on BREAK, amber if they volunteered — plus the room's combined matured total and the puzzle. The TV never shows tenors, countdowns or values. You can see that someone broke; you can never see what it cost them.

If the order is solved before time, every player's matured bonds double. So the group bonus fights the private ladder, and all coordination about who speaks must be paid for in speech.

## Technical approach

Host browser tab + phone PWAs + a PartyKit Durable Object as authority. Each phone runs an AudioWorklet computing 20ms frame RMS plus a zero-crossing voicing gate, and streams a 10Hz normalized voiced-energy scalar (raw audio never leaves the device). Lobby calibration captures each device's noise floor and gain.

Data model: `Room{code, phase, endsAt, puzzle, solved}`, `Player{id, ladder[{tenor,yield,state}], activeIdx, activeStartedAt, matured, constraints[]}`, `Mic{noiseFloor, gain}`.

The genuinely hard part is attribution: four phones on one table all hear everyone. The server runs argmax over calibrated energy in a 250ms window, requires the leader to beat second place by ~3dB (otherwise nobody is charged), and applies hysteresis so a speaker holds the floor for 800ms. Bond timers live server-side only.

## v1 scope

- 4 players, one 3-minute round, one fixed 6-item puzzle
- Fixed 4-card deal, pick 3 in order, no bond types beyond the four
- TV: lamps + puzzle + combined total. Nothing else
- Amber volunteer button, no cost, no limit
- Final screen: per-player matured total, solved yes/no

## Out of scope

Multiple rounds, callable/early-redemption bonds, ASR or transcripts, spectator mode, reconnect handling, any economy across rounds.

## Risks & unknowns

Attribution failures feel like cheating — a bond broken by someone else's laugh is rage-inducing, so the 3dB margin must fail *open*. Yields may be miscalibrated so that everyone just holds and the puzzle dies; the doubling bonus is the tuning knob. Also unknown: whether the room invents gestures fast enough to be fun in round one.

## Done means

Four phones on one table: when a single player whispers a full sentence, the server breaks that player's bond and no one else's on ≥9 of 10 trials; a full round runs end to end and the TV shows correct per-player matured totals plus the solved flag.
