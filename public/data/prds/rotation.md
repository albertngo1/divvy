## Overview
A co-op deckbuilder for 3-4 that steals the MMO "rotation" — the optimized ability sequence you drill for a boss — and distributes the deck across hidden hands, so the fun is negotiating your private synergies into the group's shared chain.

## Problem
Deckbuilders are solo engine puzzles; multiplayer usually means separate decks racing side by side. The itch is a deckbuilder where the cards live in different people's hands and the optimization has to happen out loud, under hidden information, before anyone locks in.

## How it works
The TV shows a boss with a "cast bar": N ordered empty slots, some pre-tagged (e.g. slot 3 = "Vulnerable — Fire x2"), a shared energy budget, and a damage threshold to clear. Each phone privately holds 3 ability cards — name, type icon, energy cost, and a hidden synergy line like "Combo: if cast right after a Stun, +50%." No one sees anyone else's hand.

Players negotiate aloud ("I've got a Fire that doubles after a Stun and a cheap Stun"), then each secretly assigns their card(s) to specific slots on their phone and locks in. When all are locked, the TV flips the timeline left-to-right, resolving synergies in slot order, and tallies damage vs the threshold — win or lose, with the full chain finally revealed.

Private vs shared: phone = your hand, your hidden synergy text, and your slot assignments before lock; TV = boss, slot tags, energy budget, and the resolved chain + score.

## Technical approach
Host tab + phone PWAs + authoritative WS. Turn-based, so real-time sync is a non-issue. Data model: `Room{boss{slots:[{idx,tag}], threshold, energy}, hands:{playerId:[card]}, assignments:{slot:{playerId,cardId}}, phase}`. The server deals hands privately (each phone receives only its own cards), collects lock-ins, then runs a deterministic resolver applying synergy rules in slot order and broadcasts the resolution animation to the TV. Slot conflicts (two players claim the same slot) are rejected server-side and those phones re-open. The genuinely hard part is not sync — it's tuning a card set whose synergies are legible enough to describe verbally yet combinatorial enough that hidden info actually matters; if the optimum is obvious, there's no negotiation and the game is dead.

## v1 scope
- 3 players, one boss, 4 cast-bar slots
- Hands of 3 cards from a hand-tuned 12-card set
- One synergy type (adjacency combo)
- Single round, score = damage vs threshold, pass/fail

## Out of scope
Persistent cross-boss deckbuilding, energy-curve balancing, multiple synergy types, card art, AI boss counter-moves, >4 players.

## Risks & unknowns
Could collapse into "just show each other your phones" (mitigated by the private-hand social norm plus simultaneous lock-in); card-set balance IS the whole game and is hard to tune; verbal negotiation may stall without a countdown timer.

## Done means
Three phones each privately dealt 3 distinct cards; players assign to shared slots and lock; the TV resolves in order applying one adjacency synergy; and a coordinated group can clear a threshold that no single-player greedy assignment reaches.
