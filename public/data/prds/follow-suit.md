## Overview
Follow Suit is a 3-player cooperative hand for a TV plus three phones, riffing on *The Crew*. Everyone plays five tricks in total silence. The twist that isn't in The Crew: **your task is secret**. You know the one card *you* must win; you do not know what your partners need. You must infer their goals from how they play and from the single public signal each player may spend.

## Problem
The Crew's tasks sit face-up on the table, so the puzzle is coordination under a communication ban. Hide the tasks and it becomes something better for a party: you are reading intent from card play, which is exactly the pleasure of trick-taking, compressed into ten minutes and made legible to non-card-players. That only works if hands *and goals* live on separate private screens — a physical version would need three screens anyway.

## How it works
Deck: 3 suits (Rust, Kelp, Bone) × ranks 1-5. Deal 5 cards each, 5 tricks, must follow suit, highest of the led suit wins, no trump.

Each phone privately shows: your hand, your **secret task** ("You must win the trick containing Kelp 3" — the card may be in anyone's hand), and one unspent SIGNAL token.

SIGNAL, once per hand, between tricks: tap one card in your hand plus a tag — HIGHEST, LOWEST, or ONLY (of its suit in your hand). The server verifies the claim is true and posts it permanently on the TV: "Ana: Kelp 4 is her only Kelp." Signals cannot lie. That is the entire communication channel; no talking, no gestures.

The TV shows the current trick, the trick history, the three signal badges, and three anonymous task chips (unrevealed). Nothing about anyone's hand or task.

All three tasks complete by the end of the hand = the group wins together. Then, as a coda, each phone privately guesses the other two players' tasks; correct guesses light up on the TV as a consolation score when the hand is lost.

## Technical approach
Authoritative WebSocket server (PartyKit Durable Object per room). State: `{deal: {playerId: Card[]}, tasks: {playerId: Card}, trick: Card[], leader, signals: Signal[], phase}`. The server maintains one **public projection** (played cards, signals, whose turn) broadcast to the TV and all phones, and three **private projections** (own hand, own task, legal-move mask) sent only on that player's socket. No private field ever enters the public payload — that's the correctness bar.

Sync is turn-based, so latency isn't the hard part. The hard part is **guaranteeing the deal is winnable**. With secret tasks, an unsolvable deal feels like the game cheated. Before dealing, the server brute-forces the perfect-information game tree (5 tricks, ≤5 branching, follow-suit pruning, memoized on hand-state) and rejects any deal with no line of play satisfying all three tasks. Second concern: reconnection — phones rehydrate private state from a signed player token, since a refresh must not resurface as a new seat.

## v1 scope
- Exactly 3 players, one hand, 15-card deck, no trump
- One task each, one signal token each, silence enforced socially
- Solvability check on deal
- Win/lose screen + private task-guess coda

## Out of scope
- Multi-hand campaign, difficulty ladder, trump suit, 4-5 players
- Ordered/sequenced tasks, distress signals
- Reconnect grace beyond token rehydration, spectator mode

## Risks & unknowns
- Secret tasks may make the hand feel luck-driven rather than deducible; the solver guarantees *a* line exists, not that humans can find it
- Silence is unenforceable — a table that talks breaks the game
- Trick-taking literacy: non-card-players may need the legal-move mask to carry more teaching weight than expected

## Done means
Three phones and a TV: each phone sees only its own hand and task, one player spends a signal and it appears verified on the TV, illegal cards are unplayable, the hand resolves to a win exactly when all three secret tasks completed, and the deal solver has rejected at least one unwinnable shuffle in testing.
