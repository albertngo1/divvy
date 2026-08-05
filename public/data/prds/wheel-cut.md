## Overview

Wheel Cut is a 4-player, one-pack draft game for people who love the *tension* of booster drafting but hate the twenty minutes of card-reading, table-waiting, and "whose turn is it?" A pack of 8 abstract cards is drafted in simultaneous rounds on a shared TV, and each phone privately holds one asymmetric piece of foreknowledge: the card you have been *promised* will wheel back to you.

## Problem

In-person drafting is the most elegant multiplayer mechanic ever invented and the most tedious to execute. Everyone reads at different speeds, the pack physically travels, and the entire skill of "reading the wheel" — predicting which card survives a full lap — is invisible because nobody can see anyone else's pick until it's too late to matter. It's a game of private information that's played almost entirely in silence and confusion.

## How it works

One pack of 8 cards, 4 players, 2 laps of 4 picks. Cards are simple scoring shapes: a color (red/blue/green) and a number 1–4. Your final score is the largest single-color set you assemble, times its total value — so you want to commit to a lane, but so does everyone else.

**Host TV shows publicly:** the 8-card pack laid out as a fan, a 12-second pick timer, and after each simultaneous pick, which cards *left* the pack (but not who took what, until the lap ends).

**Each phone shows privately:** (1) your current picks, (2) your live projected score, and (3) THE PROMISE — at deal time the server privately tells each player one specific card that is guaranteed to still be in the pack when it wheels back to them. That promise is true. It's also load-bearing: knowing that the Blue 4 will survive means you can safely take the Green 3 now. Two players may hold promises about *different* cards, and one player's promise is deliberately a card nobody else wants, which is its own information.

All four players pick at the same instant, every pick. Collisions — two players tapping the same card — are resolved by pick-order seat priority, and the loser gets an instant "SNIPED" haptic and must re-pick in 5 seconds. That collision moment is the whole game's heartbeat.

## Technical approach

PartyKit Durable Object per room. State: `{pack: Card[], seats: Seat[], lap, pickDeadline, promises: Record<playerId, cardId>}`. Server is authoritative on all pick resolution; phones send `{intent: cardId, clientTs}` and never mutate local pack state optimistically. Promises are computed at deal time by the server simulating a worst-case draft to guarantee truthfulness, then delivered only over each player's own socket — never broadcast.

The hard part is the simultaneous-pick barrier. The server opens a pick window, buffers all intents until the deadline or all-in, then resolves atomically and broadcasts one diff. Late/dropped clients get an auto-pick (highest value remaining) so one bad phone can't stall the room. Re-pick after a collision runs as a nested 5s micro-window with the same barrier logic.

## v1 scope

- Exactly 4 players, 1 pack, 8 cards, 2 laps
- 3 colors × values 1–4, no card text, no abilities
- One promise per player, generated at deal
- 12s pick timer, 5s re-pick on collision
- Final screen: everyone's 4 cards + score + whether their promise held

## Out of scope

Multiple packs, real card art, card abilities, signalling chat, rematch/persistent decks, more than 4 seats, spectators.

## Risks & unknowns

The promise may be too strong — if it always resolves, the tension deflates. Mitigation: promise guarantees the card survives the *lap*, not that you get it (someone may re-pick into it during a collision). Simultaneous picking may feel chaotic rather than tense; the 12s window and the visible "cards left the pack" reveal are the calibration knobs.

## Done means

Four phones join via room code, complete 8 simultaneous picks across 2 laps with at least one collision/re-pick resolved correctly, and the TV shows final scores where each player's promise card is verifiably where the server said it would be.
