## Overview

A 4-player, single-round game for people who like watching a group fail at coordination. The shared TV displays one enormous number: seconds of unbroken room silence. It resets to 0.00 the instant any mic hears anything. Each phone privately holds cards, and each card is worth points only if you say its word aloud *after* the silence clock has passed that card's required rest length. Saying the word is the act of scoring — and it resets the clock for everyone else.

## Problem

Silence mechanics almost always price *how much* you talk. Nobody has priced *when*. The unexplored resource is the shape of the pause: a game where the currency is a gap of a specific length that only one person needs and everyone else can destroy for free, without malice, just by living their life.

## How it works

Each player is dealt 3 cards. A card has a **rest value** (2s, 5s, or 9s; one 14s card exists in the deck) and a nonsense word ("BRISKET", "FLANGE"). To score a card, wait until the TV clock reads at least its rest value, then speak the word — your phone's on-device ASR confirms it, the server checks the clock, you bank points equal to the rest value, and the noise resets the clock to zero.

The geometry does the work. A 2s card is nearly free and can be harvested endlessly; a 9s card requires nine seconds during which nobody coughs, laughs, or cashes a 2. Cheap-card holders starve expensive-card holders simply by playing optimally. And the room cannot negotiate a truce, because negotiating is talking, which is a reset — the only way to plead for nine seconds is to sit there not getting them.

Host TV shows: the clock, a row of face-down card counts per player, a reset flash, and a scored-card banner. Phones show privately: your own cards and their rest values, a green WINDOW OPEN indicator when the live clock clears your best card, and your score. Three minutes; unplayed cards score zero.

## Technical approach

Host tab + phone PWAs + authoritative PartyKit / Durable Object. Phones run an AudioWorklet (RMS + voicing gate, lobby-calibrated floor) and emit `onset{clientTs, level}`; audio stays on-device. Word confirmation uses the Web Speech API on the phone, sending only a `claim{cardId, clientTs}` — never a transcript.

State: `{clockEpochMs, players:{id, hand:[{id, rest, word, played}], score}}`. Everything derives from `clockEpochMs`; there is no per-tick broadcast.

The hard part is that a claim and its own onset are the same physical event, judged against a clock that the onset destroys. The server timestamps by client clock corrected via periodic ping offsets, evaluates the claim against the clock value at `clientTs - 120ms`, then applies the reset. Phones render the clock locally from `clockEpochMs` plus their measured offset, with a 250 ms guard band before the window indicator turns green — so a player who trusts the light is never robbed by jitter.

## v1 scope

- 4 players, one 3-minute round
- Fixed deck: rest values 2/5/9 plus exactly one 14
- Speech-onset detection only; ASR word match with a fuzzy fallback tap-to-confirm
- TV: clock, reset flash, final scores

## Out of scope

Multiple rounds, speaker attribution, discarding, trading cards, penalties for accidental noise, reconnects.

## Risks & unknowns

Browser ASR latency may exceed the 120 ms window and force the tap fallback, which is less funny. Nine seconds of silence with four people in a room may simply never happen — the 14s card could be dead weight and need to become 11s. Coughs and background TV noise could make the whole thing feel arbitrary rather than tense.

## Done means

Four phones in one room: the TV clock resets within 150 ms of any speech, a 9s card scores exactly once in a real playtest, and at least one player audibly gives up on a long card because someone else kept cashing twos.
