## Overview

A 60-second cooperative tower-defense wave for exactly 4 players. The TV shows one straight lane split into four zones; each player's phone is the turret console for exactly one zone. The genre steal is Kingdom Rush; the twist is that enemy identity is *private, local, and perishable* — you only know what a creep is while it is inside your zone, and it may change before it reaches your neighbor.

## Problem

Tower defense is a solitaire optimization game — no reason to talk. Co-op party games usually fake urgency with a timer. This one makes urgency structural: information physically travels the lane at walking speed, arriving late, arriving wrong, or not at all.

## How it works

Eight creeps spawn at the left and walk right through zones 1→4 over 60 seconds. A shared base HP bar sits at the right end.

**Shared (TV):** the lane, the four zone boundaries, the creeps as identical gray blobs with a health pip, the base HP, and the clock. Nobody watching the TV can tell an armored creep from a fast one.

**Private (each phone):** a list of only the creeps *currently inside your zone*, each labeled with its true type — ARMORED, SWARM, or SHIELDED — plus your turret's ammo selector with three settings. Correct ammo does full damage; wrong ammo does none. You can hold only one setting at a time, so a mixed group forces you to pick, kill what you can, and shout the rest downstream: "two armored coming, the second one's shielded."

The killer rule: at each zone boundary there is a chance a creep **mutates** into a different type. Your relayed intel was true when you said it and false when it arrived. Zone 4 has the least reaction time and the most-degraded information; zone 1 has perfect information and no one to help it.

Survive the wave with base HP above zero and the room wins together.

## Technical approach

Host browser tab + phone PWAs + an authoritative Socket.IO server behind Tailscale Serve (or a PartyKit room). The server owns the entire simulation at 20 Hz: `Creep {id, x, hp, type, mutatedAt[]}`, `Zone {ownerId, ammo}`, `Base {hp}`. It computes damage from `(creep.type === zone.ammo)` and broadcasts two different views — a full-position-but-type-stripped stream to the TV, and a per-player stream containing types for creeps whose `x` falls inside that player's zone bounds. **Type is never sent to a phone that shouldn't have it**, so a devtools-open player learns nothing extra.

The hard part is the reveal/conceal boundary: a creep crossing x=0.25 must gain a type on phone 2 and lose it on phone 1 in the same tick, with no flicker at ~150 ms of jitter. We handle it by tagging each visibility change with the server tick that caused it and having clients render one tick behind (~50 ms), so late packets fill in rather than pop. Mutation rolls happen server-side at crossing, seeded per-room for replayability.

## v1 scope

- Exactly 4 players, one 60-second wave, one lane
- 8 creeps, 3 types, 3 ammo settings, flat damage numbers
- One shared base HP bar, no towers to build or upgrade
- 20% mutation chance per boundary crossing
- Win/lose screen with a per-zone kill count

## Out of scope

Multiple lanes, tower placement or upgrades, bosses, difficulty scaling, more than 4 players, any text channel between phones (talking out loud is the game).

## Risks & unknowns

Four people shouting over each other may be noise rather than coordination — mutation rate is the tuning knob. Zone 4 may feel powerless. 60 seconds may be too short to establish a shared vocabulary; the fix is a 10-second unopposed practice trickle.

## Done means

Four phones on one Wi-Fi network: every phone shows types only for creeps inside its own zone, the TV shows none, boundary handoffs don't flicker under 150 ms of simulated jitter, mutations are visible in the post-round log, and a full wave resolves to a shared win or loss.
