## Overview
Moon Logic is a cooperative point-and-click ADVENTURE puzzle for 3 players on a host TV plus one PWA per phone. It steals the genre's infamous "use X on Y" inventory-combine logic and distributes the inventory across phones, turning single-player pixel-hunting into a loud negotiation over items nobody else can see.

## Problem
Adventure-game puzzles are solitary and notorious for moon logic — combine the rubber chicken with the pulley. That absurdity is actually funny when shared, but only if no single person can brute-force it alone. Split the inventory, and the puzzle becomes a social act.

## How it works
The TV shows one static scene with an obstacle: a rusted vending machine blocking the only door. Each PHONE privately holds a disjoint set of 2-3 inventory items (chewed gum, a magnet, a paperclip, a warm soda) plus a private combine "workbench." A player can privately combine their OWN two items to craft new ones (gum + paperclip = sticky hook). But the solution — a ~4-step chain culminating in "use magnet-on-a-string on the coin slot" — requires items partitioned across all three phones. You can't see anyone else's inventory; you can only describe it out loud ("who's got anything sticky?") and then TRANSFER an item to another player over the network. Everyone fiddles simultaneously. The TV updates the scene as correct actions land — the machine rattles, dispenses, the door creaks open.

Private vs shared: each phone shows its inventory grid, its combine workbench, and describe/transfer controls; the TV shows the scene, the obstacle's state, a hint counter, and a solved-steps log everyone can see.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `items{id,name,tags}`, `recipes{[a,b]->c}` as a DAG, per-player `inventory`, and a `scene` state machine. Sync is light — this is turn-ish, not twitch — so transfers are atomic server ops and simultaneous combine attempts are validated server-side. The genuinely hard part is content, not sync: designing a recipe DAG and starting partition that PROVABLY forces cross-player dependency (no single phone can reach the solution) while keeping the moon logic guessable enough to be funny, not rage-inducing.

## v1 scope
- 3 players, one scene, one obstacle
- ~8 items partitioned so the solution needs all 3 players
- One 4-step combine/transfer chain, no timer
- One puzzle, then a "door opens" win card

## Out of scope
- Multiple scenes/rooms, narrative, NPC dialogue
- Scoring, timers, procedural puzzle generation
- Real art beyond placeholder scene + item icons

## Risks & unknowns
- Moon logic can frustrate; needs a graceful hint system
- Partition must truly force interdependence, not just be solvable-by-one-with-effort
- One fixed solution = low replay (acceptable for v1)

## Done means
Three phones join and each receives a disjoint item set; players craft on their private workbenches and TRANSFER items across phones purely by describing hidden inventories; they complete the 4-step chain and the TV shows the door opening — an outcome impossible for any single phone alone, proving distributed inventory is the load-bearing mechanic.
