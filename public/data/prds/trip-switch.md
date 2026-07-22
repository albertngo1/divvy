## Overview
A cozy co-op night-maze for 3–5 players. One player is the **Fusebox** — the only person who can see the floor plan. The others are **Sleepers**, fumbling through a dark house trying to reach their own beds. The twist that makes it more than a seer-directs-blind-mice game: *both* sides are half-blind. The Fusebox knows the global structure but no local detail; each Sleeper knows only the inch in front of their face.

## Problem
Most "one player has the map" games hand the seer total information, so they just narrate a solution and the pieces obey. There's no dialogue, just dictation. The itch here is a *mutual* information gap that forces real back-and-forth: the Sleeper describes what their torch reveals, the Fusebox matches it to the plan.

## How it works
**Fusebox phone (private):** the full grid — walls, furniture, and every Sleeper as an *identical grey dot* plus that Sleeper's assigned bed cell. Crucially it does NOT render the torch-revealed detail the Sleepers see.
**Each Sleeper phone (private):** a black screen. Drag to sweep a torch that reveals only a 1-cell radius of immediate surroundings (adjacent wall / table / open floor); tap-hold a direction to step one cell. No full plan, no view of other players.
**Host TV (shared):** deliberately useless as a map — just a 90s timer and a "2 of 3 home" counter, preserving the asymmetry.
Voice is allowed. Because dots are anonymous, the Fusebox must first *identify* who's who ("I see a wall on my right, a table ahead" → matches the dot in the northeast corner), then route each Sleeper home while they handle micro-navigation around furniture with their torch. Win = all Sleepers on their beds within 90s.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Cloudflare Durable Object). Data model: `grid[W][H]` cell types; `players{id,pos,facing,bedCell}`. Sleepers send step intents; server validates (no walking through walls), updates position, and broadcasts a *per-recipient filtered viewport* (only cells within that Sleeper's torch radius) plus an anonymized dot layer to the Fusebox at ~10Hz. The genuinely hard part is server-side view filtering: each Sleeper must receive a different visible-cell set and the global map must never appear in their payload — leaking one cell breaks the whole premise. Movement is near-turn-based, so latency is forgiving.

## v1 scope
- 3 players: 1 Fusebox + 2 Sleepers
- One hardcoded 8×8 grid with fixed furniture
- One 90s round, voice over the actual room (no in-app audio)
- Win screen: "everyone's in bed"

## Out of scope
- Scoring, multiple rounds, in-app voice chat
- Randomized/dynamic maps, more players, torch "physics"

## Risks & unknowns
- Mutual half-blindness could tip from tense to frustrating
- The identification sub-game may stall if two dots look alike
- Torch sweep UX on small screens

## Done means
On 3 phones + a TV, two blind Sleepers each independently sweep torches; the Fusebox identifies both by their spoken descriptions and routes both to their beds within 90s — and a payload inspection confirms no Sleeper phone ever received a cell outside its torch radius.
