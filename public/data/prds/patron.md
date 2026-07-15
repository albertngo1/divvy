## Overview
Patron is a 4-6 player pick-and-pass drafting party game with one inversion: you never draft for yourself. Each phone is secretly assigned one other player — your *ward* — and every card you keep is planted, face-down, into their tableau. Your own tableau is being quietly built by an anonymous benefactor you can't identify. For groups who love Sushi Go / 7 Wonders but hate the passing shuffle and the accidental peeking.

## Problem
Pick-and-pass drafts are elegant on paper and tedious in person: physically passing hands, waiting on the slowest picker, guarding cards from prying eyes, and the whole hidden-objective layer collapses because you can plainly see what your neighbor keeps. The secret-benefactor twist is literally impossible with shared physical cards — you can't build someone else's pile without them watching you do it.

## How it works
The host screen shows the round timer, the shrinking pack sizes, and the face-down tableaux (card backs only) growing at each seat. Each phone privately shows three things: your current hand (the pack you hold), the identity of YOUR ward ("You are building for Sam"), and Sam's secret goal card ("Sam scores for sets of matching colors"). You never learn who is building for YOU.

Each tick, everyone simultaneously picks one card from their hand; the chosen card drops face-down into your ward's tableau on the host screen; remaining hands rotate one seat. Repeat ~6 times until hands empty. Then the reveal: every tableau flips up at once. Your score = the value of the tableau someone else built for you, scored against your own secret goal. Gratitude and betrayal ensue as everyone learns who served them well and who dumped garbage.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, one room). Data model: Room{players[], packs: Map<seat,Card[]>, tableaux: Map<seat,Card[]>, wardOf: Map<seat,seat> (a derangement), goals: Map<seat,Goal>}. Server holds all hidden state; each phone receives only its own pack + its ward's goal, never the inverse of wardOf. On each simultaneous pick, clients send {cardId}; server validates ownership, appends to the ward's tableau, rotates packs, and broadcasts only card-back counts to the host plus new hands privately. Hard part: enforcing fair simultaneity (lock picks until all are in, with a short auto-pick-random fallback for stragglers) and guaranteeing the pairing is a derangement with no 2-cycles, to maximize the "who built mine?" mystery.

## v1 scope
- 4 players, one round, one pack rotation of 6 cards
- Fixed single-cycle derangement (A→B→C→D→A)
- 3 goal types (color sets, runs, pairs), simple scoring
- Host reveal animation + final scores; no persistence

## Out of scope
- Dual scoring (rewarding good patronage), 5-6 players, multiple rounds, reconnect grace, custom decks, share images.

## Risks & unknowns
- Swinginess: your fate rests in a stranger's hands and may feel unfair — mitigate with simple goals so most patrons can serve competently. Whether the reveal lands as delight vs. confusion. Straggler handling under forced simultaneity.

## Done means
4 phones join, each sees only its own hand + ward goal, six simultaneous picks plant cards into the correct hidden tableaux, the reveal flips all four and computes each player's score against their own goal, and no player could name their patron before the reveal.
