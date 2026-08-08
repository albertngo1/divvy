## Overview

A three-player cooperative search game, ~4 minutes, for a room with a TV. One hiker is lost on a 36-cell hillside and you have twelve flashlight sweeps before dawn. If two of you sweep the same cell on the same tick, that's one cell searched and two sweeps gone. The whole game is deciding whether the hot spot is yours to take.

## Problem

Cooperative party games train you to converge — same guess, same target, same page. Real search-and-rescue fails the opposite way: everyone walks toward the same obvious ridge and the hiker is in the gully nobody covered. Divvy has plenty of "secretly match me" games and almost nothing where duplicated effort is the loss condition. The itch is the feeling of deliberately searching where *you* think it's cold, because you're betting a teammate has the hot spot handled.

## How it works

**Public on the TV:** an abstract, deliberately unlabeled terrain map — no grid coordinates, no letters, no place names, just shapes. Plus the nightfall clock, the sweeps remaining, and (after each tick) which cells got swept and whether anything was found.

**Private on your phone:** the same map with *your* sensor's heat overlay, and your sensor's blind spots greyed out. One player is thermal (useless over water), one has the dog (useless on bare rock), one has the drone (useless under canopy). You know your own blind spots. You do not know theirs.

Four ticks. Each tick: 20 seconds of enforced silence, everyone taps one cell, locks. The server resolves. If two players picked the same cell, the TV throws up two overlapping flashlight cones and "BOTH OF YOU WERE THERE" — one cell searched, two sweeps burned. Between ticks there's a 15-second debrief where the only shared vocabulary is what the TV displays, and the map has no names, so "the bright bit near the middle" is as precise as language gets.

The generator is the game. Heatmaps are built so they're *positively correlated by construction*: a shared bias term dominates the private noise, so all three argmaxes land on the same cell roughly half the time. Your instinct is literally the collision. The only edge is asymmetry — a cell that's hot for you *and* inside someone else's blind spot is uniquely yours, and that inference is the actual skill.

## Technical approach

PartyKit Durable Object (or Socket.IO over Tailscale Serve) per room. Model: `Game{seed, truthCell, terrain[36], sweeps, players[{id, sensor, heat[36], blind[], pick, locked}]}`. Heat arrays are computed server-side and pushed only to their owner; the host socket never receives them.

Sync is easy — one integer per player per 20s tick, server-authoritative lock, no pick echoed until the tick resolves. The hard part is calibration. Generate as: sample `truthCell` from a terrain prior `p`; draw one shared bias field `b`; set each player's displayed heat to `normalize(p^α · exp(b + ε_i))` with `Var(b) >> Var(ε_i)`. Then tune α and the blind-spot masks against a bot harness: three greedy bots that always pick their own argmax should collide on ≥60% of ticks and win <15% of games, while a "take it only if it's uniquely mine" policy should win ~50%. Without that harness you are shipping a coin flip.

## v1 scope

- Exactly 3 players, 3 fixed sensors, one 6×6 map, 4 ticks, 12 sweeps
- One round, win or lose, no scoring beyond that
- Silence enforced only by an on-screen countdown and a mute icon (honor system)
- Room code join, no accounts, no reconnect

## Out of scope

Multiple rounds, variable player counts, moving hiker, weather, sensor upgrades, real terrain data, a talking/radio layer, mobile app packaging.

## Risks & unknowns

An unlabeled map may be too unlabeled — players may just point at the TV, which nothing prevents. Twenty seconds may be too short to read a heatmap on a phone. The correlation knob is the whole game and there's no way to know the right value without ~20 live playtests; a bot harness gets you close but not to "feels fair".

## Done means

Three phones and a host laptop finish a game in under 5 minutes; at least one duplicate-cell collision fires with the full overlapping-cone treatment; the bot harness reports greedy-argmax collision rate ≥60% and greedy win rate <15% on 500 seeded runs.
