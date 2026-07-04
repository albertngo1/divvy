## Overview
A prediction-market party game about the room you're in. Each player, on their own phone, secretly writes a bold claim about what will happen in the next 3 minutes IRL — "Grace will check her phone before Marc," "Someone will mention the dog." Everyone else secretly bets yes/no. Reveal, verify, argue, score.

## Problem
Party prediction games (Wits & Wagers, Balderdash) never target the actual social dynamics of the room. Meanwhile "prediction market" as a genre is having a moment but is mostly nerds betting on world events. There's a gap: a light, social, hyper-local betting game that mines the vibes of the exact five people present. The reveal is the fun.

## How it works
4–6 players. Round starts: each phone privately prompts you to write one prediction about the next 3 minutes in this room, phrased as a yes/no proposition. A 30-second timer. Once all submitted, predictions appear one at a time on every phone — anonymized. Each player privately bets yes/no on each claim (a tap). Bets are locked. Then a 3-minute observation window begins with a shared countdown on every phone. Predictions display prominently on nobody's phone (they'd bias behavior) but the timer runs. At time-up, the author of each claim votes truthfully whether it came true, and everyone else can dispute. Correct bets score points; predictions that split the room 50/50 score the author a bonus (spicy claim).

## Technical approach
Socket.IO on the homelab. Server manages phases (write → bet → observe → resolve) with a single authoritative timer broadcast. Text prompts and bets are just JSON. No LLM needed for v1 — players supply all content. The per-phone architecture is completely load-bearing: predictions and bets are private during observation because knowing what's being bet on would ruin the game. If you saw "someone will mention the dog" on a shared TV, nobody would mention the dog. Hiding the propositions on each better's phone during the window is the entire mechanism. Verify-phase disputes handled by a majority-vote button.

## v1 scope
- 4–6 players (variable)
- One round: 30s write, 60s bet, 3-min observe, 60s resolve
- Each player writes exactly one prediction
- Yes/no bets only, no stake sizing
- Simple point tally at end, no persistence

## Out of scope
- Stake sizing / confidence bets (that's Fold's territory)
- Multiple rounds or matchmaking
- LLM-generated prediction prompts
- Camera/mic verification
- Cross-room leaderboards

## Risks & unknowns
- Predictions may be un-falsifiable ("someone will feel weird") — need light rules
- 3 minutes may feel like an eternity mid-conversation, or fly by
- Group of two players makes no sense; enforce ≥4
- People writing boring safe predictions — need social pressure or examples to prime spicier ones

## Done means
Five friends play one round, at least two predictions come true in a way that makes the room laugh, and someone asks to play again immediately.
