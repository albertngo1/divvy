## Overview
A 3–4 player standoff for a shared TV plus phone controllers. Everyone privately needs specific words spoken aloud; nobody wants to be the one who speaks them. It is a volunteer's dilemma with a decibel meter attached, and the entertainment is watching who cracks first.

## Problem
Mic party games usually punish talking with a flat penalty, which makes the room quiet and then makes the game die. The penalty has to compete with something. Free Rider gives silence a real payoff — other people's speech is free to you — so shutting up is genuinely the optimal move and the deadlock itself becomes the show.

## How it works
**Host TV (public):** a POOL of 12 nouns; a live TRANSCRIPT TICKER where every recognized word lands, in order, with no attribution; a room-total SPEND meter; a 120s clock.

**Each phone (private):** your ORDER — four pool words that must appear in the transcript in that relative order (not adjacent); your FINE PRINT — one of those four that costs double if *you* are the one who says it; your running BILL; a checkmark cursor showing how far your order has advanced.

Orders are dealt so every pair of players shares at least two words, and at least one pair is inverted — you need PLUM before RADIO, they need RADIO before PLUM. Repeats are legal: a word said twice satisfies both orders and bills the speaker twice.

Speaking costs. Your own phone meters your voiced audio; each recognized word attributed to you debits 12 (24 for your Fine Print). Completing your order pays 100. Decoy words in the pool that nobody needs cost exactly the same. Because bills and orders are private, the room cannot tell whether your silence is patience or a finished card.

A word too quiet to clear your calibrated threshold is billed to nobody and shown as "(free)" — so whispering dodges the meter, but the recognizer may not catch it at all.

## Technical approach
Host tab runs one continuous Web Speech API recognition stream over the room. Phones (PWA) stream 10 Hz A-weighted RMS plus an on-device VAD flag over WebSocket to a PartyKit Durable Object holding authoritative state: `Room {pool[12], transcript[{word, tMs, chargedTo}], totalSpend}`, `Player {order[4], finePrint, cursor, bill, threshold}`.

Each recognized word is stamped and attributed to the phone with maximum energy in a ±250 ms window, with hysteresis and a 400 ms per-speaker lockout so one utterance isn't double-billed. Order matching is a monotone cursor walked over the transcript on every append.

Hard part: attribution in a room that is deliberately near-silent. Energy argmax is unreliable at whisper level, which is why sub-threshold words are explicitly free rather than guessed at — turning the failure mode into a mechanic.

## v1 scope
- 3 players, one 120s round, fixed 12-word pool
- 4-word orders, one inverted pair, one Fine Print word each
- 20s calibration: each player reads one sentence to set their threshold
- TV: ticker, spend meter, clock. Endgame: bills and orders revealed side by side

## Out of scope
Multiple rounds, scoring across games, custom pools, more than 4 players, any anti-collusion rule.

## Risks & unknowns
ASR may mangle isolated single words spoken flatly — pool words must be phonetically distant. The standoff could stall into 120s of nothing; the endgame reveal has to be funny enough that a 0–0–0 round still lands. Attribution errors feel unfair when a bill is wrong.

## Done means
Three phones on a table, one TV. A word spoken by player A advances player B's private order without B paying anything, B's phone shows the checkmark, A's phone shows the debit, and the final screen makes the room laugh at whoever paid most.
