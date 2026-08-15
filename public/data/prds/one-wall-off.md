## Overview

A silent real-time rendezvous game for three people, one TV, three phones. Everyone is trying to walk their token into the same cell of a small maze. Every player has the maze on their own phone — but each phone's copy has exactly one wall wrong (one wall that isn't there, or one opening that's actually blocked). Nobody knows which of their walls is the lie. No talking.

## Problem

Convergence games usually make players match an abstract value — a number, a word, a color. That's cerebral and quiet in the wrong way. The itch: convergence you can *watch happen physically*, where the failure mode is visible slapstick. Three people walking toward each other and one of them keeps bouncing off nothing.

## How it works

A 5×5 grid maze. Three tokens start in different corners.

**Private on each phone:** your personal wall map (drawn walls), your own token's position, and a D-pad. You move continuously, in real time. When you push into a wall *your map says is there*, you don't move. The catch: movement is adjudicated against the **true** maze on the server, not your map — so sometimes you push into a wall you can see and slide right through it, and sometimes you walk confidently into an opening and stop dead. That is the moment you learn where your lie is.

**Public on the TV:** the three tokens moving on a completely blank grid. No walls, ever. Just three dots and a SPREAD number (sum of pairwise Manhattan distances).

So the room watches each other move through apparent empty space, and every stall, hesitation, and detour is a signal: *that player believes there's a wall between those cells, and they might be wrong.* You correct your model of the maze from other people's confusion. Win condition: all three tokens occupy the same cell simultaneously for 1.5 seconds.

## Technical approach

Host tab + phone PWAs on an authoritative WebSocket server (PartyKit / Durable Object per room). Server holds the single true maze as a wall bitmask, plus each player's private *perturbed* mask (true mask XOR one flipped wall). Phones send intent (`{dir, t}`) at ~15Hz; the server is the sole mover and runs the collision check against the true mask, then broadcasts positions at 15Hz to all phones and the host.

The genuinely hard part is that the phone renders a map the server does not obey. Client-side prediction against the local (wrong) map will mispredict exactly at the interesting moments, so the phone must render position purely from server echo, with a short interpolation buffer — no local prediction at all — or the lie gets smoothed away and the whole game evaporates. Second hard part: generating perturbations that are *reachable and load-bearing* (flipping a wall in a dead corner nobody visits is a wasted lie), so the generator scores candidate flips by whether they change any shortest path between start cells.

## v1 scope

- 3 players, 1 maze, 1 round, 4-letter room code
- Fixed hand-authored 5×5 maze, one perturbed wall per player, chosen by shortest-path impact
- Phone: wall map + D-pad; TV: three dots on a blank grid + SPREAD
- Win detection: same cell, all three, 1.5s hold. 90-second cap, then reveal all three maps side by side

## Out of scope

Multiple mazes, 4+ players, procedural generation, scoring, more than one lie per player, reconnect, spectators.

## Risks & unknowns

The maze may be too small for the lies to matter — a 5×5 might be solvable by ignoring your map entirely and beelining. Latency over Tailscale could make a legitimate stall look like a wall (fatal ambiguity). Unclear whether players read "stalled" as information or just as lag.

## Done means

Three phones join, each shows a visibly different wall map, tokens move against the true maze at 15Hz, at least one player audibly reacts to walking through a wall they can see, and the host declares WIN on a 1.5-second three-in-one-cell hold and shows the three maps with each lie highlighted.
