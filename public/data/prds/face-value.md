## Overview
Face Value is a 3-5 player cooperative real-time game inverting The Mind, for groups who love wordless tension. The host TV is the shared ladder; each phone is a private, fogged view of the table.

## Problem
The Mind's magic — silent ascending play, pure nerve — is a phone-native gift, but a straight port is a known quantity. The fresh itch: what if the number you had to place in order was the one number you couldn't see? You'd read everyone *else* and the collective flinch of the room.

## How it works
The server deals each player one hidden value from a wide random range. The inversion: your phone shows every OTHER player's exact value as a clean number line — but your OWN card is a blurred bucket ("low third," "middle," "high"). So you know precisely where the others sit and only vaguely where you fall among them.

The goal, wordless and in real time: the group taps PLAY one card at a time so the shared TV ladder comes out in ascending order. When you PLAY, your true value snaps onto the host ladder for all to see, and everyone's private view updates (that player's card resolves from fuzzy to known for others). No talking, no gestures — only the shared silence and the timing of taps.

The load-bearing privacy: each phone shows a genuinely DIFFERENT board — everyone-but-me, exact-others plus fuzzy-self. One passed phone is useless; the asymmetric fog per device *is* the game. You infer: "the two lowest visible cards are already played, there's a gap before the next known value — is my fuzzy 'low third' actually the smallest left? Dare I tap?" A wrong-order play doesn't end it; the host scores the **longest correct ascending prefix**, so the room feels its collective read tighten each attempt.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object) — server holds the only ground truth. Data model: `Room{deck, played[], phase}`, `Player{id, value, bucket}`. Each client receives a *projected* view: others' exact values + own bucket only; the raw own-value never leaves the server until played. On any PLAY the DO validates ordering, appends to `played`, and broadcasts patched projections. Genuinely hard part: sub-150ms fairness on near-simultaneous taps — the server timestamps and serializes plays so two players lunging at the same rung get a deterministic, explained resolution rather than a race, and the TV animates who beat whom.

## v1 scope
- 3-5 players, ONE ladder, ONE round.
- One card each; random range; three fuzz buckets.
- Score = length of longest correct ascending prefix; no lives, no levels.

## Out of scope
- Multiple cards per hand, lives, escalating levels (The Mind's ladder).
- Themed magnitude decks, star/throwing-star powers.
- Any chat, emotes, or timing hints.

## Risks & unknowns
- Too-wide random ranges make self-inference pure luck; bucket granularity is the key tuning knob.
- Near-simultaneous taps must feel fair, not laggy — the hard sync problem.
- Could feel arbitrary with 3; 4-5 gives enough visible structure to read.

## Done means
Four phones join, each sees others' exact numbers and its own fuzzy bucket, the room plays cards in real time with no talking, the TV builds the ladder and resolves tap races deterministically, and the final screen reports the longest correct ascending run.
