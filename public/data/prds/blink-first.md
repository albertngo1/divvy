## Overview

A 3–5 player room game for a couch and a TV. A single short clip of mundane found footage plays once. Nobody is asked to "pay attention" — they're asked to time a bet. Each player privately holds one prop question about the clip and a side they were dealt, not chosen, and the only skill is deciding when to stop watching and cash a decaying multiplier.

## Problem

Watching something together is the lowest-stakes activity a group has. Existing "bet on the show" formats fail because everyone bets on the same question: the moment the answer becomes obvious, it's obvious to everyone simultaneously, and there is no game. The itch is a group activity where the same shared stimulus lands on each person differently.

## How it works

The host TV plays a 90s clip with one enormous number over it: a multiplier starting at 5.00× and decaying linearly to 1.00× at the end.

Each **phone privately** shows: one prop question ("Does anyone say a number out loud?", "Does the dog leave frame?", "Is the blue bowl used?"), a side already assigned to you (YES or NO — you don't pick), and one big LOCK button. No two players get the same question.

The **host TV publicly** shows: the clip, the multiplier, and a running feed of lock events with names — "Dana locked at 4.12×." It never shows anyone's question or side.

So other players' behaviour is loud but uninterpretable. Dana locking early might mean her answer already resolved — or she's out of nerve. Locking correct pays multiplier × 10; wrong pays 0; never locking defaults to 1.00×.

Each player also gets one **CALL** token: tap a rival's name to force them to lock instantly at the current multiplier. You do this blind. "Sam called Dana" appears on the TV. Getting called at 0:20 when your question resolves at 0:50 is a coin flip you didn't want.

After the clip, the host replays each question's decisive moment and scores the table.

## Technical approach

Host browser tab + phone PWAs + a PartyKit Durable Object per room (4-letter join code).

State: `{ clipTime, players: [{id, name, questionId, side, lockedAtMs, lockedMult, callUsed}] }`. Questions are hand-authored JSON with a hardcoded `truthAt` timestamp and boolean answer.

The host video element is the clock of record: it posts `currentTime` every 250ms; the server derives the multiplier from that, so a buffering stall doesn't silently rob everyone's payout. Phones interpolate locally between ticks for a smooth number but never compute their own payout.

The hard part is lock adjudication. A lock at 3.02× vs 2.98× is worth real points, and phone clocks are 80–300ms off over WiFi. Locks are stamped on server receipt, phones show an optimistic "LOCKED" and reconcile to the authoritative multiplier. CALL races (two players calling each other in the same tick) resolve in server arrival order; a CALL landing on an already-locked player refunds the token.

## v1 scope

- 3 players, one 90-second clip, one round
- 6 hand-authored questions with hardcoded ground truth
- Multiplier, LOCK, one CALL token each
- Join by code, no accounts, no reconnection

## Out of scope

- Player-uploaded clips, ML-generated questions, multiple rounds, spectators, audio cues, mobile-host mode.

## Risks & unknowns

Questions that resolve at 0:05 make locking trivial — every question needs to stay genuinely uncertain past the halfway mark. The room may end up staring at phones; mitigate by keeping phone text to one line and putting all evidence on the TV. CALL may feel purely random rather than spicy at 3 players.

## Done means

Three phones and a laptop, one clip: everyone locks or is called, the TV shows a per-player resolution card (question, side, lock multiplier, score), server-logged lock multipliers are strictly decreasing in time, and at least one playtester locks early purely because a rival did.
