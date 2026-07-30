## Overview

A one-round, four-player riff on *Wavelength* for a couch group with a TV and four phones. Two Psychics, two Guessers. The spectrum is public. The target is not — and it isn't one number, it's two, and neither Psychic knows the other's.

## Problem

Wavelength's clue-giving is a solo agony act: one person stares at a card while three people watch them think. And the guessing half collapses into whoever is loudest turning the one physical dial. Both halves of the game are single-player experiences performed in front of an audience. The itch: give the clue-giver a hidden partner who is quietly pulling the other way, and make the guessers commit independently instead of anchoring on the first person to speak.

## How it works

TV (public): a spectrum card — *Overrated ↔ Underrated* — above an unmarked 0–100 dial.

Phones (private): Psychic P1's phone shows **31**. Psychic P2's shows **74**. Neither sees the other's number, the gap, or even which side of the dial the other sits on.

**Clue phase.** Strictly alternating, four words total (P1, P2, P1, P2). Each locked word appears on the TV instantly, so each Psychic adapts to the other in real time — but only through the phrase itself. No talking. The phrase becomes a visible negotiation: *"canned" → "soup" → "hotel" → "breakfast."*

**Guess phase.** Both Guessers' phones show the same spectrum with a draggable needle. They may argue aloud, but they lock **simultaneously** — the TV shows only a checkmark per locked Guesser, never a position.

**Scoring.** For each hidden target, measure the distance to the *nearer* of the two needles. Team score is the **worse** of those two distances (10 / 6 / 3 / 0 points by band). Reveal drops both targets and both needles onto the dial at once.

The consequence is the whole game: a Psychic who yanks the phrase toward their own number scores nothing if the other target is stranded. Guessers who both aim at the same spot get destroyed by a split pair; Guessers who spread wide get destroyed by a tight pair. Reading whether the phrase is a *compromise* or a *consensus* is the entire guessing skill.

## Technical approach

PartyKit Durable Object, one authoritative actor per room. State: `{phase, spectrum, targets:{p1,p2}, clue:[{by,word,idx}], needles:{g1,g2}, locks:Set}`. All outbound patches go through a single `projectFor(playerId, state)` serializer that strips `targets` and unrevealed `needles` — so a leak is one function's bug, not a scattered audit. Phones join by room code; roles dealt at start; `playerId` in localStorage for reconnect.

Clue phase uses turn tokens keyed by `idx`: a word submitted by the wrong player, or a double-tap from a laggy phone, is rejected idempotently rather than burning two slots. Guess phase is commit-then-reveal: each phone sends its needle value only on lock, the server holds both and broadcasts after the second arrives — so a slow connection can't be read as a tell. The genuinely hard part is resisting the obvious: **do not stream the drag.** Live needle telemetry would leak intent to the host screen and destroy the simultaneity. Only the lock event crosses the wire.

## v1 scope

- Exactly 4 players, fixed roles, one round
- 8 hardcoded spectrum cards
- Targets drawn at least 25 apart (guarantees tension)
- 4-word clue, 45s soft timer per word
- One reveal screen, one score, no persistence

## Out of scope

Three or more Psychics, variable player counts, multi-round scoreboards, clue-word censorship, spectator mode, audio, matchmaking.

## Risks & unknowns

Two targets may make clue-building feel hopeless — mitigate with the 25-point minimum gap and possibly a 60-point maximum. Psychics may just blurt their number aloud; this is a social rule, unenforceable, and probably fine. "Worse of two" may feel punishing enough to kill the mood — the points curve is the tuning knob. Four words may be too few to negotiate with, or too many to stay tense.

## Done means

Four phones and a TV run one full round. Inspecting WebSocket frames on a Guesser's phone reveals neither Psychic's number. Needles stay hidden until both locks land. The reveal shows both targets, both needles, and the computed worse-distance score. The room immediately argues about whose fault it was.
