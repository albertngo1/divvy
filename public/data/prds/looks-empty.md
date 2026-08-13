## Overview

A Jackbox-shaped stage-builder for 3–6 people. The host screen shows one short, deliberately plain 2D auto-runner level. Every phone is a secret level editor: you get exactly one invisible hazard to bury somewhere in that level. Then one player runs the level live, on the TV, with their phone as the D-pad — and discovers everyone's traps the hard way.

For groups who love Mario Maker troll levels but have never been able to make one *together, in the same room, in ninety seconds*.

## Problem

User-generated-level games are single-author and asynchronous: you build alone, someone plays it hours later, and the laugh happens to no one. The funniest part of a troll level is watching the victim's face at the exact frame the floor betrays them — and that requires everyone in one room, placing at once, blind to each other.

## How it works

**Shared TV:** one 40-tile side-scrolling level, drawn completely bare — flat ground, three gaps, two pipes. It looks trivially clearable. That's the joke.

**Each phone, privately:** a pinch-zoomable strip of the same level, and one hazard card drawn from a small deck (Invisible Block, Fake Floor, Spring, Ceiling Spike, Ghost Pipe). You drag it onto a tile. **You can see only your own placement.** You cannot see the other three.

**The dodge proof:** before your phone will accept the placement, it makes you swipe a path through your own trap that clears it. A server-side physics check runs your swipe. If your trap is unsurvivable, the phone rejects it. Nobody may plant a killer they can't beat.

**The run:** the TV picks a Runner. Their phone becomes a two-button controller (jump / hold-jump). The Runner has 3 lives. Every death, the TV freezes, replays the last 1.5s in slow motion, and *credits the trap by name* — "HANNAH'S FAKE FLOOR."

**Scoring:** +3 if your trap kills the Runner, +1 per other trap you happened to make deadlier by sitting next to it, **−4 if the Runner burns all 3 lives** (a level nobody can clear is a level nobody laughed at). The collision between "I proved mine is dodgeable" and "together we made it impossible" is the whole game.

## Technical approach

Host tab + phone PWAs over a PartyKit Durable Object per room.

- **Data model:** `Room {code, levelSeed, phase, runnerId}`, `Placement {playerId, hazardType, tileX, tileY, dodgePathHash}`, `RunFrame {t, x, y, vy, input}`. Placements live server-side only; the host receives them **only** at phase `RUN`, and even then renders each hazard as untriggered-invisible.
- **Sync:** placement phase is trivial (low-rate REST-ish messages over WS). The run is the hard part. The Runner's phone sends input events at 30 Hz with a client timestamp; the **server owns the physics** and broadcasts authoritative state at 20 Hz; the host tab interpolates. Deterministic fixed-step integration (1/60s) so the death replay is a re-simulation, not a recording.
- **Genuinely hard part:** input latency. Phone→server→host round trip of 90ms makes a precise jump feel broken. Mitigation: design the level around *forgiving* platforming (coyote time, 8-frame input buffer, generous hitboxes) and keep run speed low. The game is about the reveal, not execution — tune until 150ms of lag is still fair.

## v1 scope

- One hard-coded level, one round, one Runner, no rotation
- 4 players, exactly 1 hazard each, 3 hazard types
- Dodge-proof validation as a simple ballistic check, not a full solver
- Death replay: slow-mo + trap author's name
- Scores printed once at the end, no persistence

## Out of scope

Level rotation, multiple rounds, custom level drawing, hazard combos, spectator betting on which trap lands, mobile landscape support, saving levels.

## Risks & unknowns

- **Latency ruins platforming.** Biggest risk. Fallback: auto-run with jump-only, or convert to turn-based "commit 4 jump timings up front."
- Traps may cluster on the same tile — needs a stacking rule (later placement wins, first gets a consolation point).
- The dodge-proof may be too easy to satisfy, making everything trivially survivable.

## Done means

Four phones on one LAN place four hidden hazards in under 60s; the Runner attempts the level on the TV; at least one death fires a slow-mo replay naming the correct author within 500ms; final scores render; total round time under 4 minutes, and the room laughs at the first fake floor.
