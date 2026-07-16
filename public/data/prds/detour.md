## Overview
A cooperative maze-escape hidden-role game for 3–5 players. A shared TV shows a token in a fogged maze; every player's phone is a private local map and a private steering vote. One player is secretly the imposter, whose map is subtly wrong — and who may not even realize it.

## Problem
Hidden-role games recycle one idea: 'one player has no information.' Fresh angle: everyone has FULL information, but one person's copy is quietly false. And most social deduction is pure talk; Detour anchors every accusation in a shared spatial failure you all watched happen.

## How it works
The TV shows a 6×6 grid: a token at start, a marked exit, all walls HIDDEN. Each phone privately renders a fog-of-war mini-map — just the cells immediately around the token, with their true walls. The imposter's phone renders the same fog, but with 2–3 wall edges relocated.

Each turn (10s countdown): every player privately taps a direction (N/E/S/W) — their vote. The host tallies; the majority direction moves the token. Hit a wall → a crash: a strike is spent, the token stays, and the TV briefly flashes that wall. The team has a budget of 4 strikes to reach the exit in ~12 moves. Honest players, reading true walls, vote safe; the imposter, misreading them, votes into walls or away from the only opening. When the round ends (escape or bust), everyone privately taps who the imposter was. Imposter survives the vote → imposter wins; otherwise the team wins.

PRIVATE per phone: your fog map (imposter's corrupted) and your per-turn vote. SHARED on TV: token position, crashes, revealed walls, strike count, timer.

## Technical approach
Host browser tab + phone PWAs + authoritative WS server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{ maze:6×6 wall-bitmask, tokenPos, exitPos, strikes, phase, players[{id, role, voteThisTurn}], imposterMazeDelta }. Server holds the true maze plus a per-imposter perturbed copy. Each turn it pushes each phone ONLY its fog slice around tokenPos (true walls for honest, perturbed for the imposter) so the full maze never leaks. Sync is turn-based with a countdown, so real-time pressure is low and the server stays authoritative on tally + collision. The genuinely hard part is the perturbation: it must diverge only near the frontier (invisible early) yet bite mid-maze, and the base maze must offer real branch choices, not one forced corridor.

## v1 scope
- 3 players, 1 imposter
- one hand-authored 6×6 maze
- 4-strike budget, ~12 moves
- N/E/S/W private votes, majority moves
- haptic buzz on crash
- one-tap accusation + win/lose banner

## Out of scope
Procedural mazes, >5 players, multi-round scoring ladders, difficulty tuning, spectators, reconnection polish, animation beyond a token slide.

## Risks & unknowns
Perturbation tuning (too subtle = no signal, too gross = instant tell). Vote ties need a rule (no-move / re-vote). An imposter who realizes their map is wrong and plays coy — fun or collapse? Does 6×6 in 12 moves create enough branch drama? Can honest players distinguish sabotage from ordinary group misjudgment?

## Done means
3 phones + TV; the server deals exactly one corrupted map; a full round runs turn-by-turn with private votes and public crashes; the corrupted-map player demonstrably causes ≥1 crash the honest players avoided; the accusation phase resolves to a winner; and testers can articulate WHY a crash made them suspect someone.
