## Overview

Wheel Bid is a 4-player draft for a host TV and phone controllers. It takes the single most tedious ritual in tabletop gaming — booster draft, where one pack crawls around the table while three people stare at nothing — and collapses it into one simultaneous private action: everybody ranks the pack at the same time, and the server untangles the conflicts.

## Problem

Drafting is the best mechanic in games and the worst thing to do at a party. It is serial by construction: you cannot pick until the pack reaches you, so with 4 players and 8 cards you sit idle for 75% of the game. Every physical fix (draft-and-pass simultaneously, pick-two-pass-one) trades away the information game. The itch: keep the tension of "will my card wheel back to me" while nobody ever waits.

## How it works

The TV shows one pack of 8 absurd cards, publicly, all round: "Regional Manager Energy", "A Second Breakfast", "Unearned Confidence". Each card has a **public tag** (COLOR: red/blue/green) and a **hidden value** known only to whoever ends up holding it.

Every phone privately holds a **secret objective**: "score double for every red card" or "score for having exactly one of each color." Nobody knows anyone else's objective.

All four players simultaneously drag the 8 cards into their private preference order. 45-second timer. That ranking is the entirety of your input for the round.

The server then runs a **serial dictatorship with a rotating first pick**: a random turn order is drawn, and in that order each player is assigned their highest-ranked card still available. This repeats for two passes (each player ends with 2 cards). Because every player ranked everything, no one ever needs to be re-asked when their top choice is gone — the ranking *is* the answer to every counterfactual.

The TV then replays the resolution as a dramatic wheel animation: pick 1 goes out, card vanishes, next player's top surviving choice lights up. Watching your #1 get sniped and your #4 fall to you is the whole payoff, and it happens in 10 seconds of animation rather than 10 minutes of waiting.

Phone shows privately: your ranking UI, your secret objective, and a live "if the order breaks your way" preview. TV shows publicly: the pack, whose ranking is locked, then the resolution replay and final tableaux — but never anyone's objective until scoring.

## Technical approach

PartyKit Durable Object per room. State: `{pack: Card[8], players: [{id, name, objective, ranking: CardId[]|null, locked, awarded: CardId[]}], order, phase}`. Each socket gets a filtered view: full pack (public), own objective and ranking only, plus `locked: playerId[]`.

Sync: `LOBBY → RANK(45s, server deadline timestamp) → RESOLVE → REPLAY → SCORE`. Rankings are POSTed incrementally on every drag so a phone that dies mid-round still has its partial order; unranked cards fall back to pack order. The DO draws the turn order with a seeded PRNG *after* all rankings lock, so nobody can be accused of order-shopping, and it publishes the seed at reveal.

Hard part: it's not the algorithm (serial dictatorship over full rankings is a dozen lines) — it's the replay. The DO must emit the resolution as an ordered event list with per-step timestamps, and every client (TV plus 4 phones haptic-buzzing on their own picks) must animate off one shared clock so the room gasps together. Second hard part: a drag-to-rank list of 8 items on a small phone screen under a timer, with no scroll-jank and no accidental drops.

## v1 scope

- Exactly 4 players, one 8-card pack, two picks each
- Three hardcoded secret objectives, dealt without repeats
- 45-second simultaneous drag-to-rank; partial rankings accepted
- Seeded random turn order, revealed at replay
- One replay animation, one scoring screen, one winner

## Out of scope

Multiple packs, pack-passing direction, hate-drafting signals, reconnect, more than 4 players, card art, any deck beyond the hardcoded 12.

## Risks & unknowns

Ranking 8 cards may feel like homework rather than a decision — the fun depends on the pack being small and the cards being funny. Serial dictatorship rewards being early in the random order, which one round cannot smooth out. The replay might be the whole game, meaning v1 lives or dies on animation polish, which is exactly the thing a humiliatingly small scope wants to skip.

## Done means

Four phones join, each privately receives a different secret objective, all four rank 8 cards inside one 45s window, the server resolves 8 assignments with no duplicates and no player getting a card they didn't rank, the TV replays the picks in order with each phone buzzing on its own pick, and the final screen shows every tableau, every objective, and a correct winner.
