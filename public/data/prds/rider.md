## Overview

*Rider* is a 4-player hidden-constraint deduction game for a TV plus phones — **Scattergories** crossed with **Zendo**. Everyone answers the same public categories; each player is privately bound by one absurd mechanical clause (the rock-star tour rider: no brown M&Ms). The game is guessing which clause each other person was signed to, while camouflaging your own.

## Problem

Scattergories has craft but no bluffing. Hidden-role games have bluffing but no craft — you lie with your mouth, not your work product. Nothing sits in between: a game where the deception is *in the artifact you produce*. And the clause pool has to be visible to everyone while assignments stay private, which is exactly what one phone per person buys you and a passed phone destroys.

## How it works

The TV shows the **CLAUSE BOARD** all game: 8 numbered clauses, public, e.g. *every answer contains the letter O*; *every answer is exactly two words*; *all three answers start with the same letter*; *your answers are in alphabetical order*; *every answer has an even letter count*; *every answer contains a double letter*; *each answer is longer than the last*; *no answer contains the letter E*. Four are dealt, four are decoys.

The TV then shows three categories: *a breakfast food · a movie title · something in a garage*. 90 seconds.

Each phone shows PRIVATELY: your one dealt clause in large type, three answer fields, and a live validity lamp per field that turns green when that answer satisfies *your* clause. Nothing else — you cannot see who else exists on the board.

Reveal: the TV builds a 4×3 grid of everyone's answers, with a red **VOID** stamp on any player whose answers failed their own clause (server-checked, no arguing).

Accusation: every phone privately drags clause numbers onto the other three players — one each, no repeats, submitted blind and simultaneously. Scoring: **+2** per correct assignment you make; **+1** per opponent who assigned you the wrong clause; VOID players forfeit all fooled-points. The whole strategy is picking answers that *also* satisfy two or three decoy clauses — "COFFEE" is a double letter, an O, and an even count at once.

## Technical approach

Host tab + phone PWAs + one authoritative Durable Object per room (PartyKit / Cloudflare), Socket.IO over Tailscale Serve as fallback. State: `{ phase, categories[3], clausePool[8], assignment: {pid: clauseId}, answers: {pid: [s,s,s]}, votes: {pid: {targetPid: clauseId}}, voided: Set }`.

Clauses are pure predicates in one shared ES module: `test(normalizedAnswers) -> bool`. The phone imports it for instant lamps; the DO imports the same file for the authoritative VOID ruling — one source, so client and server can never disagree. Normalization (lowercase, strip punctuation/accents, collapse spaces) also lives there.

Sync isn't latency-hard here; correctness is. The DO builds a **per-connection** snapshot and the invariant is that no snapshot contains another player's `assignment` or `answers` until `phase >= reveal`, and never contains another player's `votes`. Phase transitions are server-driven on submit-count or timer expiry, whichever first.

## v1 scope

- Exactly 4 players, one round, three categories
- 8 hardcoded, mechanically checkable clauses; deal 4
- 90s answer timer, then blind accusation, then scoreboard
- Room code, no accounts, no reconnect, no rematch

## Out of scope

Semantic clauses ("every answer is edible") and any LLM/human judging, multiple rounds, 5+ players, category authoring, spectators, sound, persistence.

## Risks & unknowns

Mechanical clauses may read as a word puzzle rather than social play; the validity lamps may flatten the craft into trial-and-error typing. Letter-shaped clauses can be trivially readable — the pool must be chosen so clauses overlap heavily and camouflage genuinely exists. A high VOID rate would be deflating; a lamp plus a live "clause satisfied" banner is the mitigation.

## Done means

Four phones each display a different private clause against a shared public board; a submission violating its owner's clause is VOIDed by the server without human input; the 4×3 grid and a full 3×3 accusation matrix resolve into a TV scoreboard; and a captured WS log shows no phone received another player's clause or answers before reveal.
