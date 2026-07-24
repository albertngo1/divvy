## Overview

Iframe is a 3-4 player cooperative party game that steals the fighting-game genre's most sacred mechanic — the frame-perfect combo link — and shatters it across a room. The TV shows one fighter. Each player's phone privately controls exactly one limb of that fighter: left arm, right arm, legs, or head. Nobody controls the character. Everybody controls a quarter of it.

For groups who like Rock Band's "we all have to nail our part" tension but want it in 90 seconds with no instruments.

## Problem

Fighting games are the least party-friendly genre in existence: two players, twenty hours of execution practice, everyone else watches. The genre's actual pleasure — the ecstatic snap of a link connecting — is locked behind a skill wall. Iframe extracts that snap and makes it a group achievement, where the execution difficulty comes from coordinating humans, not from your own thumbs.

## How it works

A round is one combo of four beats. The TV shows the training-dummy opponent and a metronome bar sweeping left-to-right, one beat per 900ms.

Before the round, each phone privately receives a **move sheet**: 3 buttons labeled with that limb's available inputs (e.g. legs: LOW SWEEP / JUMP / STEP-IN). Critically, each phone also privately receives **one link requirement** — a condition about somebody else's limb it can't see, phrased in plain language: "Your sweep only connects if the head is NOT ducking on that beat." Four players, four requirements, no phone shows anyone else's sheet or requirement.

So the only way to build a legal 4-beat combo is to talk. Out loud. Fast. "Beat two, is anyone ducking?"

On each beat the metronome hits, every phone must have a button held down. The server samples all four phones at the beat and resolves: if all four inputs satisfy every private link requirement, the TV plays the hit animation, the combo counter ticks, and a satisfying crunch fires. If any requirement fails, the fighter whiffs, the combo drops to zero, and the TV shows *which limb whiffed* but never *why* — the group has to re-derive the constraint from the failure.

Beat timing tolerance is ±140ms. Miss the window and it's a whiff too, so the frantic verbal negotiation has to finish before the bar sweeps.

Phone shows privately: your 3 buttons, your link requirement, your own hit/whiff feedback.
TV shows publicly: the fighter, the metronome, combo counter, and which limb whiffed.

## Technical approach

PartyKit Durable Object per room. State: `{players: {id, limb, moveset[3], linkRule, currentInput}}`, `{beat: n, combo: n}`.

Phones send `{beat, buttonId, clientTs}` on press and release. The server maintains beat clock authority and broadcasts `beat_tick` with a server timestamp; phones estimate clock offset from WS ping/pong RTT so a phone can render its own metronome locally rather than waiting on network round trips.

Resolution: at each `beat_tick + 140ms` the server takes the last held input per player, evaluates the four link predicates (tiny DSL: `{subject: limb, forbids: moveId}` / `{requires: moveId}`), and broadcasts one authoritative `resolve` event. Only the server ever knows all four sheets.

Hard part: beat-window fairness. A player on flaky wifi shouldn't whiff for the group. Mitigation — the server accepts an input stamped with the phone's local beat number and offset-corrected timestamp, accepting late-arriving packets up to 400ms after the window as long as the *corrected* timestamp lands inside it.

## v1 scope

- 4 players exactly, one round, one 4-beat combo.
- 3 moves per limb, hardcoded. 4 link rules, hardcoded from a pool of 8.
- No characters, no health bars, no rounds — a training dummy and a combo counter.
- Whiff = restart the same combo from beat 1. Play until it lands or the group quits.
- Stick-figure SVG fighter; animation is 4 poses.

## Out of scope

Multiple combos, difficulty scaling, opponent AI, more than 4 limbs, spectator mode, scoring across rounds, any actual fighting-game license or aesthetic.

## Risks & unknowns

- 900ms/beat may be too fast for verbal negotiation and too slow for combo feel. Needs playtesting to find the tempo where talking is frantic but possible.
- Link rules may be trivially solvable after one whiff, killing the round in 30 seconds. May need rules that reference *previous* beats to create real state.
- Four simultaneous held buttons on four phones is a lot of unforgiving input; a single dead phone ruins it.

## Done means

Four phones join a room code. Each shows a different limb, 3 buttons, and one private link rule. The group talks, presses on-beat, and the TV either plays a 4-hit combo with a counter reaching 4, or whiffs and names the guilty limb. A round completes end-to-end in under 3 minutes with no manual intervention.
