## Overview
Homing is a cooperative telepathy word game for 3–6 friends — a phone-native riff on the party classic Mind Meld / Medium, where players try to "converge" on a shared word by repeatedly guessing the mental midpoint between two anchors. The shared TV is the arena and scoreboard; each phone is a sealed, simultaneous submission box.

## Problem
Mind Meld is pure magic when it works: two people blurt the same word out of thin air. But the whole trick depends on *simultaneous, secret* reveal. In person people leak — a flicker, a half-said syllable, someone going second. And you obviously can't pass one phone around: the moment I see your word, the telepathy is dead. The privacy has to be per-phone or the game evaporates.

## How it works
The host TV shows two unrelated anchor words, e.g. **FIRE** and **OCEAN**. Every phone *privately* types one word that sits "between" them (STEAM? LAVA? BOAT?), hidden from everyone, under a short timer. When all are in, the TV reveals every submission at once.
- **All identical → win.** The TV celebrates with a rounds-to-converge count (fewer = better telepathy).
- **Not identical →** the server picks the two most *different* submissions as the next round's anchors, and everyone aims for the new middle. Repeat until unanimous.
Each phone privately shows: the two current anchors and its own hidden text field. The host screen shows: the anchors, a "3/3 locked in" tally, the simultaneous reveal, and the new anchors. Nobody ever sees another player's word before the reveal — that blind simultaneity is the entire game.

## Technical approach
A PartyKit / Cloudflare Durable Object holds one authoritative room. Data model: `{ anchors:[w1,w2], round, phase, submissions:{playerId:word} }`. Phones POST their word; the server buffers all submissions and **never** broadcasts partial state — it only emits the reveal once every player is in or the timer fires. Matching uses a normalization pass (lowercase, trim, basic singular/plural fold) so STEAM/steam/steams all count; exact normalized equality only in v1 (no synonym graph). Next-anchor selection is deterministic (pick the two submissions with greatest edit/embedding distance, tie-broken by submission order). Genuinely hard part: keeping the reveal perfectly blind under flaky mobile sockets — a single leaked in-flight submission ruins the round — plus guaranteeing convergence terminates.

## v1 scope
- 3 players, one game played to convergence
- Two random seed words to start
- Blind simultaneous submit + all-at-once reveal
- Exact normalized-match win detection
- Win screen showing rounds-to-converge
- No accounts, no persistence

## Out of scope
- Synonym / semantic matching
- Teams, cross-game scoring, spectator mode
- Timer tuning, hints, categories

## Risks & unknowns
- Non-convergence / drift — cap at N rounds with a playful "you drifted apart" fail screen.
- Word-normalization disputes (color vs colour, plurals) shown transparently to avoid arguments.
- Groups of 3 may converge trivially fast; may need a larger anchor gap.

## Done means
Three phones join, two seed words appear on the TV, all three submit blind, the reveal fires simultaneously; if the words match the TV shows a win with the round count, otherwise two new anchors appear and the loop continues — and no phone ever displays another player's word before the reveal.
