## Overview
Off Register is a 4–6 player hidden-role party game for friends who love the *Spyfall* "someone here is subtly wrong" tension but hate that the imposter always knows. Shared host screen (TV) narrates and tallies; each phone privately holds a short fictional dossier — a heist plan, a wedding seating chart, a cursed recipe. All dossiers are identical but one, and the player holding the doctored copy is never told. The itch is watching someone confidently defend a fact that isn't true, and never being sure it's them and not you who misread.

## Problem
Most social-deduction games hand the traitor perfect information: they *know* they're lying and just have to bluff. That collapses the paranoia to one-directional acting. Off Register removes the imposter's self-knowledge, so honest players and the mole behave identically — everyone is sincerely defending their own reading. The deduction becomes forensic ("whose answer is impossible given the others?") rather than theatrical.

## How it works
Lobby: players join by QR; host assigns a scenario deck. PRIVATE on each phone: a 5-fact dossier (e.g. Time: 2:15 / Door: loading dock / Car: silver / Code: 4471 / Driver: Mara). One randomly chosen phone gets exactly ONE fact swapped for a plausible neighbor (Time: 2:45). No phone is flagged as the mole.

Round: the host poses six questions one at a time ("When does it start?", "What color is the car?"). Every phone answers SIMULTANEOUSLY and privately via multiple-choice or short text — you cannot see others answer, and you must commit before the reveal. The host then flips all answers face-up at once on the TV. Most questions produce unanimity; when a question hits the swapped fact, one answer stands alone. But players also misremember and mis-tap, seeding false positives. After six questions, everyone votes on their phone for the mole. Reveal: correct majority = table wins and the doctored fact is shown; wrong = the (oblivious) mole wins.

The PRIVATE phone view is the entire game — if answers weren't hidden until the synchronized flip, players would just copy the room.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server on PartyKit/Durable Object (one room object). Data model: Room{scenarioId, facts[], moleSeatId, swapIndex, swapValue, phase}; Seat{id, name, dossier[], answers[], vote}. Server generates dossiers by copying canonical facts, then mutating one field for the mole seat. Sync: server is source of truth for phase transitions; phones POST answers, server withholds broadcast until all seats submit (or timer), then emits a single reveal frame — this simultaneous-commit barrier is the genuinely hard part (late joiners, disconnects, one slow phone). Idempotent answer submission keyed by (seat, question) handles reconnects.

## v1 scope
- One hardcoded scenario deck (3 scenarios).
- Exactly one swapped fact, fixed 5-fact dossier, 6 questions.
- 4–6 players, one round, one vote, win/lose screen.
- Multiple-choice answers only (no free text).

## Out of scope
Free-text answers, multiple mologos per round, scoring across rounds, custom scenario authoring, spectators, reconnection grace beyond basic idempotency.

## Risks & unknowns
Does an oblivious mole actually create tension, or just confusion? Tuning swap subtlety so it's detectable in ~2 of 6 questions but not screaming. Mis-taps producing too many false leads. Whether text or multiple-choice reads better.

## Done means
Six strangers on six phones play one round; the swapped fact surfaces on the reveal of at least one question; the table votes; the correct outcome screen shows — and at least one honest player admits they briefly suspected they were the mole.
