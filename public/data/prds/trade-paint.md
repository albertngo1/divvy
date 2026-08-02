## Overview

A 3–4 player real-time hidden-movement game on a 24-cell ring. Every player drives a token nobody else can see. Collisions are the only thing that ever becomes public — and each one is a permanent, timestamped confession of where you just were. For groups that want a Battleship-flavored bluffing game that runs at 10Hz instead of in turns.

## Problem

Hidden-movement games (Scotland Yard, Fury of Dracula) are slow, turn-based, and need a moderator. Real-time party games, meanwhile, give everyone full information on one screen. Nobody has built the obvious hybrid: continuous simultaneous movement where the shared screen shows almost nothing, and the map fills in only with the record of your mistakes.

## How it works

The host screen shows a 24-cell ring, empty. That's it. No tokens.

Each phone privately shows three things: **your cell index** (you always know where you are), **your target cell**, and two big hold-to-move thumb zones, clockwise and counter-clockwise. Holding moves you one cell per 250ms. Crucially, all four targets are dealt inside the same 8-cell arc — the destinations genuinely conflict, so you cannot avoid crossing each other.

If two tokens land on the same cell — or swap through each other — on the same server tick, both **crash**: each is thrown 4 cells backward in the direction it came from, and the host screen permanently paints a skid mark on that cell with a timestamp and the two players' colors. That mark never fades. Everyone now knows two specific players were at cell 17 at t=31s, and can reason forward.

You win by **parking**: sitting motionless on your target for 3 consecutive seconds. A parked token still collides, so parking early is an aggressive act of roadblocking, not a safe retirement. The first two players to park score; last place eats the loss.

Talking is encouraged and unverifiable. "I'm at 4, going clockwise, stay off the low numbers" is a completely normal sentence to say when you are in fact at 19. The skid marks are the only evidence the room ever gets, which means causing a crash is informationally expensive for you too — you can bleed out your position by being clumsy.

## Technical approach

Host tab + phone PWAs + authoritative Socket.IO server over Tailscale Serve.

Data model: `Room { tick, ring: 24, skids: Skid[], players: Player[] }`; `Player { id, color, cell, target, heldDir, parkedSince }`; `Skid { cell, tick, playerIds[2] }`. Phones send only `{heldDir: -1|0|1}` on change — never positions. The server runs a fixed 10Hz tick: apply held directions, resolve collisions, advance park timers, then emit two different payloads — a **private** packet per socket containing only that player's cell/target/park state, and a **public** broadcast to the host containing only skids and park flags. The privacy is enforced by fan-out shape, not by client-side hiding, so a curious player opening devtools learns nothing.

The genuinely hard part is **collision resolution under input latency**. A hold that arrives 180ms late means a player crashes into someone they had already turned away from. Mitigation: clients timestamp hold-state transitions, the server maintains a rolling clock offset per socket and applies each transition at its intended tick with a 2-tick (200ms) rollback buffer, re-simulating if a late input lands in the past. Swap-collisions (A→B while B→A) must be detected explicitly or tokens pass through each other and the game silently breaks.

## v1 scope

- One round, 3 players, 24-cell ring, 90-second cap
- Targets dealt into one 8-cell arc
- Hold-to-move, 250ms per cell, no speed control
- Crash = 4-cell knockback + permanent skid mark on host
- Park = 3s motionless on target; first two parkers win
- Host screen: ring, skids, park flags, timer

## Out of scope

Multiple laps or rounds, 2-D maps, obstacles, power-ups, damage/health, scoring history, reconnect handling, animation polish, any spectator view.

## Risks & unknowns

Biggest risk is that an empty screen feels dead for the first 20 seconds before the first crash — a slow start may need a scripted opening collision or a shrinking ring. Whether 24 cells and 3 players produces enough forced contact is unproven; the 8-cell target arc is the tuning knob. Knockback may also feel arbitrary rather than punishing if players can't tell which direction they were thrown. Phones held sideways with two thumb zones may misfire on small screens.

## Done means

Three phones join, each sees only its own cell and target, the host ring shows no tokens; two players driven into the same cell both get knocked back within one tick and a permanent colored skid mark appears on the host screen at that cell; a player holding still on their target for 3 seconds raises a park flag on the host and the round ends when the second player parks.
