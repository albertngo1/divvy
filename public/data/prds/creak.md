## Overview
Creak is a cooperative heist for 4–6 players in one round. One phone is the **Ear** — it shows the full dark floor plan: loot, exit, blind burglars, and a sleeping guard. Everyone else is a **Burglar** whose phone shows only their own hand of moves. The Ear can see everything and warn nobody… except one player, once per tick, with a single private buzz. The room wins only if every burglar grabs loot and reaches the exit before the guard wakes and catches one.

## Problem
Blind-navigation co-op usually collapses into the sighted player barking a stream of instructions. The itch: choke the guidance channel down to almost nothing — one silent warning per turn — so the Ear must *triage* who to save, and burglars must move on faith, making the shared jeopardy genuinely tense instead of dictated.

## How it works
Each tick (5s), every Burglar privately commits a move: **tiptoe** (1 tile, quiet) or **dash** (2 tiles, loud). Moves resolve simultaneously. The **host screen** (TV) shows only fog: muffled footstep ripples and a growing 'NOISE' meter — no positions. The **Ear's phone** shows the true map: burglar dots, loot, exit, and the guard. Each tick the Ear may send ONE private FREEZE pulse to a single Burglar's phone (their screen flashes red = 'do not move next tick'). The guard accumulates noise; when the meter fills, it wakes and steps toward the noisiest recent tile each tick. Caught = whole room loses. All loot grabbed + everyone on the exit = win.

Per-phone is load-bearing on both sides: Burglars commit moves *simultaneously and privately* (no turn order to copy off), and the FREEZE warning lands on exactly one phone — if the map were passed around, there'd be no private channel and no reason to move blind at all.

## Technical approach
Authoritative WS server (PartyKit / Socket.IO over Tailscale Serve) holds `{grid, loot[], exit, burglars:{id,tile}, guard, noise}`. Ear subscribes to full state; each Burglar receives only `{myTile?, freeze:bool, ticksLeft}` — never the map or others' tiles. Moves are collected into a per-tick buffer and resolved server-side, then noise recomputed. The hard part is the tick barrier: all burglar commits + the Ear's one warning must lock in before resolution, with a fair countdown and graceful default (no-move) for anyone who doesn't submit — and the FREEZE must arrive *before* a warned player has committed, so warning and commit windows must be sequenced within the tick.

## v1 scope
- One 6×6 house, 2 loot, 1 exit, 1 guard, one round.
- 1 Ear + 3 Burglars; tiptoe/dash commits on 5s ticks.
- One FREEZE per tick; win/lose screen.

## Out of scope
- Multiple guards, doors/keys, burglar-private side goals, reconnect.

## Risks & unknowns
- Is one warning per tick too stingy (frustrating) or just right (tense)? Tune tick length and warning budget.
- Guard AI must feel fair, not random-punishing.

## Done means
4 phones join; 3 blind burglars commit simultaneous tiptoe/dash moves while the Ear rations single FREEZE buzzes; the guard wakes on accumulated noise, and the room reaches a clean win or a caught-you loss — with Burglars never seeing the map.
