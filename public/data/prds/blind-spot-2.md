## Overview
A competitive-cooperative stealth heist that steals the vision-cone genre (Metal Gear, Commandos) and shatters its omniscient top-down view into private, per-phone fog. 3-4 players are burglars in the same museum, racing to grab the loot and escape while unseen guards sweep. For groups who love tense "wait for the cone to pass" beats and a dash of betrayal.

## Problem
Stealth tension is a solo pleasure, and a shared-screen version would ruin itself — if everyone sees every guard cone, there's no dread and no secrets. The fun only survives if knowledge is *partial and private*. That's exactly what a room of phones can do and a single passed screen cannot.

## How it works
The host TV shows only the museum outline, the loot in the center, and the exits — no guards, no clear player dots. Each phone privately shows a **fog-limited view** centered on its own burglar: you see a guard's vision cone only when it's within your flashlight radius, and you see teammates only when adjacent. You tap-to-step (one tile per tap, short move cooldown). Walk into a cone → spotted → frozen 5 seconds. First to grab the loot AND reach an exit wins.

The knife-twist: you can watch a cone bearing down on a rival who can't see it. Do you shout a warning — keeping them alive to beat you to the loot — or stay silent and let them freeze? You must cooperate to survive the guards but compete to win.

**Load-bearing privacy:** every phone's fog is unique and partial; the complete map exists only across all phones plus live voice. A single passed phone erases the entire premise.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server. The server owns ground truth: guard patrol loops, player positions, loot state. Data model: `room {guards[{path, t, coneDeg}], loot, exits}`, `players[{id, x, y, frozenUntil, hasLoot}]`. Each ~100ms tick, the server computes per-player fog and transmits ONLY what that player can see — visibility culling happens server-side so a snooping client can't read hidden cones off the wire. The hard part is cheap per-player cone-intersection + visibility tests every tick, plus fair simultaneous move resolution. The TV renders a deliberately redacted overview.

## v1 scope
- 3 players, one small hand-made map
- 2 guards on fixed patrol loops, 1 loot, 2 exits
- Spotted = 5s freeze; win = first to loot + exit
- Phone UI = fog view + tap-to-step controls
- Room-code join only

## Out of scope
Multiple maps, guard alert/chase AI, gadgets, disguises, teams, ranked play, more than 2 guards.

## Risks & unknowns
Per-tick server-side fog cost with several players. Whether tap-to-step feels tactical or fiddly. Readability of a tiny fog map on a phone. Social tension could collapse into everyone staying silent every round.

## Done means
Three phones each render a distinct fog view, guard cones move server-side, stepping into a cone visibly freezes that player on all screens, and grabbing the loot then reaching an exit triggers a win for that player.
