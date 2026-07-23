## Overview
Outward is a 3-player cooperative card game that ports the exquisite pain of *Hanabi* to phones. The table is trying to build a single rising firework — cards numbered 1→5 — but the cruel rule is that **you can see every hand except your own**. Each phone renders the other two players' cards face-up and your own hand as blank backs. You play cards blind, on faith, guided only by the stingy clues your friends can afford to give you.

## Problem
Hanabi is one of the best cooperative games ever made, but in physical form it demands you hold your cards *backwards* facing the table — awkward, cheat-prone, and impossible to enforce. The information asymmetry (see others, not self) is the entire game, and it is exactly the thing a passed-around single phone cannot reproduce. Every player needs a *different simultaneous private view*. That is the load-bearing case for per-phone architecture.

## How it works
The host TV shows the shared board: the firework stack built so far (top card), the count of remaining **clue tokens** (start: 8) and **fuse charges** (start: 3), and a public log of every clue given. Nothing about anyone's hand lives on the TV.

Each **phone shows privately**: the *other* players' full hands (color + number, face-up) and your *own* hand as anonymous backs annotated only with clues you've received ("card 2 = a 3", "card 4 = red"). On your turn you may (a) spend a clue token to tell one teammate — broadcast to the TV log — either all the positions of one number OR one color in their hand; (b) discard a card to regain a clue token; or (c) play a card blind onto the stack. A correct next-in-sequence card advances the firework; a wrong one burns a fuse. Three burns and the fireworks fizzle.

The agony: you can *see* that your friend is about to misfire but may be out of tokens to warn them.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. Data model: `deck[]` (shuffled server-side), `hands: {playerId: cardId[]}`, `stack`, `clueTokens`, `fuses`, `clueLog[]`. **The server never transmits a player their own card identities** — each client receives a redacted game state where `hands[self]` is replaced with `{received_clues}` only. This makes cheating architecturally impossible, not merely discouraged. Sync is turn-based and trivial: one authoritative `applyMove` reducer, broadcast redacted snapshots. The genuinely hard part is the redaction diff — every state push must be per-client filtered — plus a clean mobile UI for annotating your own blank cards with accumulated clue hints.

## v1 scope
- 3 players, exactly one firework color, cards 1–5 (single suit).
- 8 clue tokens, 3 fuses, 4-card hands.
- Clue = reveal one number's positions OR (trivially, single-suit) skip color clues.
- Win = complete 1→5. Lose = 3 burns.

## Out of scope
- Multiple suits/colors, rainbow cards, variant rule sets.
- Reconnection mid-game, spectators, scoring beyond win/lose.

## Risks & unknowns
- Single-suit may be too easy — may need to ship 2 suits to feel real.
- Annotating your own hidden hand on a small screen could be fiddly.
- Turn pacing: without a timer, an over-thinker stalls the room.

## Done means
Three phones each show the two other hands and their own as backs; a clue given on one phone appears in the TV log and as an annotation on the recipient's phone only; playing the correct card advances the stack on the TV; three wrong plays ends the game — all with no client ever able to inspect its own cards.
