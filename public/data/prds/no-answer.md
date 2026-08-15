## Overview
A 90-second hidden-information game for 4 people sitting on the same couch. It riffs on Two Rooms and a Boom's card-sharing handshake but deletes the second physical room: the partition exists only inside the phones, nobody is told which side they're on, and the only way to learn anything is to try a handshake and see whether it lands.

## Problem
Two Rooms needs two physical spaces, a timekeeper, and constant migration. Worse, most hidden-role games make a failed interaction legible — you can see who refused you. The itch: build a game where **silence is genuinely ambiguous**, so a non-response carries no information at all, and the whole round is spent trying to distinguish "you're not in my room" from "you didn't press."

## How it works
The server secretly splits 4 players 2/2 into Room A and Room B. **Nobody is told their own room letter.** Each phone shows only your card: one Bomb, one President, two Blanks.

Privately on your phone: your card, plus the other three names, each a HOLD button.

Publicly on the TV: the four names, a 90-second clock, and a lamp that pulses whenever any player *attempts* a share — attempts are public, outcomes are private.

A share resolves when two players hold on each other with at least 400ms of overlap. Exactly 1500ms after your hold began, your phone shows either the other person's card, or the words NO ANSWER. Same-room means reveal; different rooms means NO ANSWER — and so does them simply never pressing back. The two are indistinguishable by content and by timing.

At 90 seconds every phone privately answers "who is in your room?" The President has one extra, decisive choice: name a player as *my roommate and safe*, or tap EVACUATE meaning *my roommate is the Bomb*. The room wins if the President names their true roommate and that roommate isn't the Bomb, or evacuates when it truly is. Otherwise the Bomb wins. Everyone else's roommate guess is bragging rights on the reveal screen.

Because nobody knows their own letter, every verbal claim is unverifiable cheap talk, and the Bomb's whole game is generating attempt-pulses at the President that can never land.

## Technical approach
PartyKit room = one Durable Object. State: `{phase, partition:{pid:'A'|'B'}, cards:{pid:card}, holds:{pid:{target, serverStart}}, attempts[]}`. Phones send `holdStart`/`holdEnd`; the server stamps its own receive time and ignores client clocks entirely.

The genuinely hard part is that **NO ANSWER must be a perfect null**. The server may not resolve early on a known miss — every hold resolves on a fixed 1500ms timer from server-stamped start, success or failure, or the latency difference becomes an oracle telling you the partition. Attempt-pulses to the TV go out on the same fixed delay, so pulse timing can't be correlated with outcome either. Payload sizes for reveal and no-answer frames get padded to equal length.

## v1 scope
- Exactly 4 players, fixed 2/2 split, one 90-second round
- Three card types: Bomb, President, Blank×2
- Hold-to-share handshake, TV attempt lamps, TV clock
- One President decision (name / EVACUATE) and a reveal screen

## Out of scope
- 6+ players, hostage swaps, multiple rounds, room-changing
- Reconnect handling, spectators, chat, scoring history
- Any role beyond the three cards

## Risks & unknowns
- 4 players may be too thin: only three candidates and one roommate. 6 is probably the real game; 4 is the proof.
- Players will read each other's screens. Hold-to-show at least keeps reveals brief and deniable.
- If the room converges on "everyone handshake everyone immediately," 90 seconds may fully solve the partition. May need a per-player attempt budget.

## Done means
Four phones and a TV: a cross-room handshake and an unanswered handshake produce byte-identical-length frames at identical 1500ms latency (verified in a capture), the TV pulses for both, and the President's EVACUATE call resolves the round correctly on the reveal screen.
