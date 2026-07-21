## Overview
A cooperative real-time metroidvania for exactly 3 players who share a single on-screen avatar. It steals the genre's soul — ability-gated traversal and the "oh, THIS is where the dash goes" click — and distributes one movement power to each phone so no one person can see or solve the route alone.

## Problem
Metroidvania traversal puzzles (dash-gaps, cling-walls, double-jump gates) are pure single-player pleasure: one brain, all abilities. That's exactly why they never become party games. The itch: turn the sequence-break "aha" into a talk-out-loud group scramble under a clock.

## How it works
The TV shows one side-scrolling avatar in a small chamber with a locked exit and a **hazard rising** every few seconds (lava/gas) — hard time pressure. Three abilities exist: **DASH**, **DOUBLE-JUMP**, **WALL-CLING**, each bound to exactly one phone. Any phone can grab the **control token** (it passes to whoever taps *Take Control*), but a phone can only execute *its* ability plus basic walking. Crucially, each phone privately renders overlay markers showing only where ITS ability is usable: dash-gaps glow *only* on the dasher's screen, cling-walls *only* on the clinger's, jump-ledges *only* on the jumper's. Nobody sees the full route. Players narrate — "clinger, there's a wall right of the avatar, take it!" — then hand off control mid-motion. Reaching the exit before the hazard = win.

**Privately per phone:** your ability, your control status, and your ability-specific affordance overlay. **On the TV:** the shared avatar, the chamber, and the rising hazard — with no overlays at all.

## Technical approach
Host tab runs the authoritative platformer sim and renders the clean world. Phones are thin controllers plus a private overlay layer. WS server (PartyKit / Durable Object) holds avatar state, the control-token owner, and hazard height. Data model: `World{avatarPos, vel, hazardY, exit, tiles[]}` where each tile is tagged with which ability it affords; `Player{ability, hasControl}`. Server streams `avatarPos` at ~30Hz to the TV and pushes each phone a *filtered* tile set matching its ability. Control token is a single-owner lock granted on tap (~50ms handoff). The hard part is control handoff mid-jump without desync — buffer inputs, keep position server-authoritative — plus keeping overlays legible on small screens.

## v1 scope
- Exactly 3 players, 3 fixed abilities
- One hand-authored chamber solvable ONLY by a dash → cling → double-jump handoff
- One rising hazard, one win/lose
- No enemies, no combat, no health

## Out of scope
Combat, exploration/backtracking beyond the one room, ability upgrades, more abilities or players, procedural levels, reconnection.

## Risks & unknowns
Handoff latency could make platforming feel floaty; the overlay-narration loop may confuse before it clicks; a single room might resolve too fast — the hazard speed needs tuning; tap-to-jump precision on phones.

## Done means
Three phones each bound to one ability see distinct private overlays, control passes cleanly on tap, the avatar clears the chamber via a genuine 3-way handoff before the hazard reaches it — and the same room is provably unsolvable with fewer than three people.
