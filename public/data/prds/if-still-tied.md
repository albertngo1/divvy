## Overview

A 4-player, 6-minute drafting game where the headline score never decides anything. Everyone finishes level; victory falls to a cascading tiebreaker chain, and each player secretly owns exactly one criterion in that chain. For board-game groups who have all lost a game to a rulebook line nobody read aloud.

## Problem

"If still tied, the player with the most unspent coins wins." Cascading tiebreakers are the most tedious paragraph in every rulebook: four people hunched over page 14 after the real game ended, recounting coins, arguing about whether step 2 applies. The criteria are invisible during play — exactly when knowing them would have been interesting. Nobody plays *toward* a tiebreaker, because nobody remembers it exists.

## How it works

Sixteen lots sit on the TV: each has a coin value, a color, and a letter. Snake draft, 3 picks each, 12 lots taken, 4 left over. Every pick is public and instant.

At setup the server deals each phone one private criterion from a pool of six — *most coins*, *fewest lots*, *most distinct colors*, *largest single-color group*, *owns the highest letter*, *lowest total coins* — then shuffles those four criteria into a hidden priority order 1–4. Nobody, including the owner, knows their own depth.

PRIVATE on each phone: your criterion, your live value on it, and your rank as one word — LEADING, TIED, BEHIND. Never anyone else's numbers.

PUBLIC on the TV: the board, who took what, and one integer that updates after every pick — **DECIDED AT LEVEL n**, the depth of the first criterion in the hidden order that currently has a unique leader. If all four are currently tied it reads UNDECIDED.

That integer is the whole game. Level jumping 1→3 means someone just tied up a shallow criterion. The perverse move is to deliberately tie your *own* criterion to push the cascade deeper — a pure gamble, because you don't know whether deeper helps you. At the end the TV walks the chain top-down and reveals whose criterion fired.

## Technical approach

PartyKit Durable Object as the authority; host tab and four phone PWAs over WebSocket. State: `lots[16]`, `picks[seat][]`, `criteria[seat]`, `priority[4]`, `turnCursor`. On each pick the room recomputes all four criterion values from scratch (pure function of picks), derives per-criterion leader sets, and finds the cascade depth. It then fans out one public snapshot plus four *divergent* private payloads. Private frames are padded to a fixed byte length and emitted in shuffled seat order so payload size and send order leak nothing. Reconnects replay from the authoritative log, never from client cache.

The genuinely hard part is not sync — it is tuning. The game dies if criteria rarely tie, because then the cascade sits at level 1 forever. Before shipping, run a Monte Carlo of 50k random and greedy playouts over candidate lot pools and keep only pools where cascade depth ≥2 in roughly half of mid-game positions.

## v1 scope

- Exactly 4 players, no lobby: four fixed seat codes printed on the host screen
- 16 lots, snake draft, 3 picks each, one round, hard 6 minutes
- Pool of 6 criteria, 4 dealt, no duplicates
- No peek tokens, no reconnect, no scoreboard across games
- Endgame reveal is a static top-down list, no animation

## Out of scope

Variable player counts, criterion drafting, multi-round matches, a second board type, spectator view, sound.

## Risks & unknowns

Players may not grasp that the level integer is information — needs one scripted demo pick during onboarding. Six criteria may be too few to stay fresh past two plays. A player holding a criterion nobody can influence has a boring six minutes.

## Done means

Four phones join, draft 12 lots, and the TV's level integer changes at least twice mid-draft in a real playtest; the final reveal names a winner every group agrees was determined by the chain, and no phone ever received another player's criterion value in any frame captured on the wire.
