## Overview
A co-op party game that squeezes the metroidvania — the joy of "which ability opens *this* door" — into a shared-screen, per-phone shape. 3–4 players collectively pilot one runner through a small locked map, but each phone is a private ability deck, and no one sees the whole keyring.

## Problem
Metroidvania backtracking is solitaire: one player, one keyring, one brain routing the whole map. The genre's best beat — realizing *you* hold the thing that unlocks the next room — never becomes social. And the moment you pass one phone around a table, every ability is exposed and the routing puzzle collapses into a checklist.

## How it works
The host TV shows a 9-room map wired together by colored gates, plus a corruption "flood" that creeps one room per few seconds. A single shared runner token auto-parks at the junction the party steers it toward.

**Each phone privately shows:** its 2–3 ability charges (colors), its own live charge/cooldown counts, and a mini-map that highlights *only the gates that phone can open*. **The shared TV shows:** the map, runner position, the flood front, and which gates are currently open vs. locked.

When the runner sits at a gate, the holder taps **Open** to spend a charge. Double-outlined **combo gates** require two *different* phones to fire within a 1.2s window. The party talks, routes, and rations charges to reach the exit before the flood swallows the runner.

Per-phone is load-bearing not through secrecy but through *simultaneity of action*: multiple phones must be watching their own gate and firing in real time as the runner moves, and combo gates are physically impossible for one passed-around phone to trigger.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object). Data model: `Game{seed, rooms[], gates[{id,color,combo,open}], runnerPos, floodFront, timer}`, `Player{id, abilities[{color,charges,cooldownUntil}]}`. Server ticks ~10Hz; phones send `openGate(gateId, ts)`; server validates adjacency + charge, and for combo gates buffers events in a receipt-timestamped grace window before echoing a lock animation to the TV. **Hard part:** the combo-gate window across variable phone latency (server-receipt timing + small grace), plus tuning flood pace so the seed is solvable but tense.

## v1 scope
- 3 players, one fixed 9-room seed, single exit
- 2 normal gate colors + exactly 1 combo gate
- 90-second flood, one round, no progression
- Abilities do nothing but open/combo

## Out of scope
Multiple maps, enemies, PvP, ability upgrades, saves/continues, matchmaking.

## Risks & unknowns
Open talking weakens hidden info — fun must rest on simultaneity + charge economy, not secrecy. Latency on the combo window. Map may tune trivial or impossible.

## Done means
3 phones join by QR, each gets a distinct private ability map, the party opens ≥1 normal gate and ≥1 combo gate (two phones inside the window) and reaches the exit before flood on the fixed seed — and one passed-around phone provably cannot fire the combo gate alone.
