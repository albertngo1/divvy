## Overview

A 2-minute real-time allocation game for 4 people. Each player has a private sentence they must say aloud to score, but their permitted loudness is granted live by the other three from a shared, finite pool of "air." Everything left in the pool at the end pays out to the room. Silence is literally the dividend.

## Problem

Every mic-as-constraint game so far sets the threshold in software: the designer decides how quiet is quiet enough. That's a rule, not a dilemma. Nobody has handed the threshold to the other players and made them pay for their own generosity — which turns "be quiet" from a rule you obey into a favour you have to beg for, in real time, while everyone watches your level meter climb.

## How it works

**Calibrate (20s).** Each phone records 3s of room noise floor and 3s of its owner counting at normal conversational volume. Two anchors map that device's dBFS to shared "air units" 0–180.

**Round (120s).** Privately, your phone shows: your sentence (drawn from a deck — some are 4 words, some are 14, and nobody knows whose is which), your live level meter, your current ceiling, and three sliders — your 60 units of air to distribute among the *other* three players. Your ceiling is the sum of what the other three grant you. Grant nobody anything and they are frozen out.

Your phone banks your sentence when on-device speech recognition fuzzy-matches it AND your peak stayed under your ceiling for the whole utterance. Blow the ceiling and the phone flashes VOID, the attempt dies, and the TV publicly shows "P2 OVER by 22" — telling every granter you're being greedy.

The TV shows four columns: ceiling bar, live level, banked/not, and the pool. Never the sentences. So you watch someone strain into a whisper and cannot tell whether they genuinely have a fourteen-word sentence or are milking you.

**Scoring.** Banking = 3. Bonus = (180 − your ceiling at bank time) / 20, so the quietest banker wins. Unspent air at the end is split among everyone who banked. Generosity is real cost; stinginess loses you the split.

## Technical approach

Host tab + phone PWAs on a PartyKit Durable Object. State: `{budgetPool, grants: {from → {to: units}}, players[{id, sentence, ceiling, banked, bonus}]}`. Slider moves are throttled to 5Hz and are last-write-wins per (from,to) edge; the server recomputes ceilings and broadcasts a 10Hz delta. Levels stream as 100ms RMS buckets.

Hard part, again, is attribution: your phone hears the room. The server runs a per-bucket argmax across clock-corrected device envelopes (ping/pong offset, median of 20) and only counts buckets your device wins by ≥5dB against your ceiling — otherwise a granted whisper gets voided by a neighbour's laugh. Second hard part is calibration validity: phone-to-mouth distance drifts, so the mapping has to be recalibrated silently from each player's own running quantiles.

## v1 scope

- 4 players, one 120s round
- Fixed deck of 8 sentences, varied length
- Sum-of-grants ceilings, 60 units each, no floor
- One bank per player, then scores

## Out of scope

Multiple rounds, sabotage cards, min-of-grants ceilings, custom sentences, ceilings on non-speech sound, more than 4 players.

## Risks & unknowns

Speech recognition at whisper volume is exactly where it's worst — may need phoneme-count fallback rather than transcript match. A frozen-out player may just be miserable rather than funny. Sum-of-grants might be too forgiving; min-of-grants is crueler but risks deadlock.

## Done means

Four phones, one 120s round: all four sentences can be banked by a cooperating room, at least one player is visibly forced down to a whisper, the TV pool always equals 180 minus total grants, and no bank or VOID is ever triggered by someone else's voice across ten trials.
