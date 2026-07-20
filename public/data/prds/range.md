## Overview
A two-player fighting duel that steals the *neutral game* of fighters — spacing, reach, whiff-punishing — instead of the usual combo strings. Two duelists play; the rest of the room spectates and heckles. Each phone is a private move deck; the TV is a single 1D lane where distance is everything.

## Problem
Every fighting-game party riff steals combos. But the real depth of a fighter lives in *footsies*: controlling space, baiting a whiff, punishing an overextension. That's simultaneous, hidden, and read-based — a perfect secret-commit toy, and almost nobody has stolen it. It only works if your commit is invisible until both reveal, which is exactly what private phones give you and a passed screen cannot.

## How it works
The TV shows two fighters on a 1D lane with a **distance gauge** and two stage edges. Each round is simultaneous, ~6 seconds. Your phone privately shows your **hand of move cards**:
- **Poke** — reach 1, fast
- **Sweep** — reach 2, slow (huge whiff punish window)
- **Throw** — reach 0 grab, beats block
- **Dash-in** — closes distance by 1
- **Backdash** — opens distance by 1
- **Block** — beats strikes, loses to throw

You pick one; it goes on cooldown and you redraw, so your *available* options quietly dwindle — a tiny private deck. On reveal the TV resolves by **reach vs. current gap and startup speed**: if your attack's reach ≥ the gap and it's faster than their action (or they whiffed / dashed into it), you land. A whiffed slow sweep gets punished. Dashes reset distance for next round; cornered players can't backdash. First to 2 hits wins; loser rotates out for the next challenger.

Private to each phone: your hand and cooldown state. Shared on TV: the lane, the distance, and each resolution. The whole game is reading the opponent's spacing intent, which collapses instantly if commits aren't secret and simultaneous.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server. State: `{ distance, players[2]: { hits, hand, cooldowns, cornered } }`. Both clients submit within the round window; the server resolves via a **priority table** (reach ≥ gap? startup compare; throw > block; block > strike; whiff → punishable) and broadcasts the outcome the TV animates. The hard part is a resolution table that is intuitive at a glance yet deep enough to reward reads, plus clean simultaneous-commit sync with a **timeout default** (no input = a neutral whiff, so a frozen phone can't stall the match).

## v1 scope
- 2 active players, room spectates
- 5 move types, distance 0–3, best-of-3 rounds, one match
- Hot-seat rotation: loser hands off to next challenger

## Out of scope
- Characters / distinct movelists, meter & supers, spectator betting
- 2D movement, actual combos/juggles, matchmaking

## Risks & unknowns
- Is 1D footsies legible and *fun to watch* for the room?
- Balancing reach vs. startup so it isn't thin RPS
- Commit-timeout feel; does depth emerge in a single best-of-3?

## Done means
Two phones privately commit a move each round, the TV resolves spacing correctly (a whiffed sweep is punished by a poke; a throw beats a block; a backdash into the corner is denied), the match ends at 2 hits, and no commit is ever visible to the opponent before reveal.
