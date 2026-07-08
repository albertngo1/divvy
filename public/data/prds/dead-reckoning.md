## Overview
Dead Reckoning is a hidden-role cooperative-navigation party game for 4-6 players on a shared host TV plus a phone each. The group collectively steers one token toward an exit; one player's private map is subtly wrong—and the twist is that it might be yours without you knowing.

## Problem
The itch: a saboteur who isn't malicious. Most traitor games ask you to secretly work against the group. Here the "traitor" is genuinely trying to help, navigating faithfully from a doctored map, and the quiet horror is realizing you may be the one steering everyone wrong.

## How it works
The host shows a 5x5 grid with the token at a start tile and NO exit marked. Each phone PRIVATELY shows the same maze with the exit marked on it—except one random player (the Drifter), whose exit sits one tile off (or has a single added wall that reroutes the best path). Every phone is told: "One map here is doctored. It might be yours." Each turn, all players SIMULTANEOUSLY and privately tap a direction (N/S/E/W). The server moves the token by majority vote and shows the result on the host, along with an anonymized TALLY ("3 north, 1 east")—never who voted what. Over ~6 turns, whoever keeps landing in the minority is steering toward a different exit—but honest players fumble too, so the signal is noisy. A player who notices they're perpetually the dissenter has to wonder if their own map is the fake. When the token reaches an exit (true or false) or turns run out, everyone casts one private vote. Town wins if the token reaches the TRUE exit and they vote out the Drifter; the Drifter wins if the token reaches their false exit or they escape the vote.

## Technical approach
Host + phone PWAs + authoritative WS server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: Room{maze, trueExit, drifterId, driftExit, tokenPos, turn, submissions{playerId:dir}, tally[], votes}. The server holds each phone's map variant and streams only that variant. Per turn: collect private submissions, reveal only when all are in or the deadline fires (atomic—leaking a live vote lets players herd and ruins the deduction), apply majority, broadcast new tokenPos plus the anonymized tally. The genuinely hard part is real-time simultaneous secret submission with a hard per-turn deadline and clean tie/among-equals resolution, plus tuning the map delta so the Drifter diverges often enough to be findable but not on turn one.

## v1 scope
- 4 players
- One 5x5 maze; Drifter's exit offset by exactly one tile
- 6 turns; majority-move; anonymized tally
- One final private vote; server declares winner

## Out of scope
Larger mazes, the added-wall doctoring variant, multiple rounds, cross-game scoring, reconnection, movement animation, ties beyond a fixed rule.

## Risks & unknowns
Four players make majority swingy (2-2 ties common)—may need odd counts or weighted resolution; the Drifter can be obvious by turn 2 or invisible if maps barely differ; the "is it me?" paranoia loop is the fun but could stall a group into indecision.

## Done means
Four phones join, each renders its own maze variant, the Drifter's exit differs, every turn all submit secretly with no live leak, the token moves by majority, tallies stay anonymous, the group votes, and the server declares the true exit reached plus the Drifter and the winner.
