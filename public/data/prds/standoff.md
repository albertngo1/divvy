## Overview
Standoff steals the simultaneous-turn tactics genre (Frozen Synapse, Worms-with-commitment) and squeezes it into a 3-player free-for-all party duel. The shared TV is a top-down gridded room; each phone is the private planning desk for that player's lone gunslinger. It's for a small group that likes bluffing and "I KNEW you'd juke left" table-talk.

## Problem
Hot-seat simultaneous-tactics games are agonizing: you pass one device, hide your eyes, and plan sequentially — which leaks *who's still thinking* and kills the whole point of simultaneity. Party games rarely offer the delicious mind-game of committing a plan blind against opponents committing theirs at the exact same moment.

## How it works
Three gunslingers start on a shared grid (visible to all on the TV). Each 20-second planning phase, **every phone privately shows only that player's own unit**, a draggable move-path (up to 3 tiles), and a facing/aim wedge. You cannot see anyone else's plan — the TV during planning shows only anonymized "thinking / locked" lamps. When all three lock (or the timer expires), the server resolves all three plans on a shared clock: units glide their paths, and at each sub-tick a unit fires along its facing wedge. If an enemy occupies your firing line at that tick, they're hit. Ties and mutual kills resolve by simultaneity — double-KO is a real, funny outcome. The TV plays the 4-second resolution as a single choreographed reveal. Last one standing (or most hits over 3 rounds) wins.

The genre theft is the *plan-blind, resolve-together* loop; the party twist is that all the trash talk happens in the gap while everyone bluffs about where they're headed.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object). Data model: `Room{ grid, phase, roundClock }`, `Plan{ playerId, path:[tile], aimVec, locked }`. During planning the server holds each Plan privately and broadcasts only lock-state booleans. On resolution the server steps a deterministic simulation (fixed 8-subtick timeline), computes line-of-fire hits, and emits one authoritative `resolutionLog` that host and phones replay identically. Hard part: the deterministic sim must be server-only and frame-exact so every screen shows the same reveal — no client prediction, no divergence. Facing-wedge hit detection (Bresenham line + wedge angle) must be unambiguous at tile granularity.

## v1 scope
- 3 players, one gunslinger each, one room map
- One 20s planning phase → one resolution → repeat to last-standing
- Move up to 3 tiles + one fixed-length aim wedge; no cover, no reloads
- Anonymized think/lock lamps on TV during planning

## Out of scope
- 2v2 teams, cover tiles, grenades, multi-unit squads
- Reconnection mid-round, spectators, matchmaking
- Animations beyond a single glide+muzzle-flash replay

## Risks & unknowns
- Is 20s enough tension without being fiddly on a phone drag?
- Double-KO frequency: fun chaos or unsatisfying stalemate?
- Grid granularity may make aim wedges feel coarse or unfair.

## Done means
Three phones can each privately plot a move+aim, all lock independently, and the host TV replays one server-authoritative resolution where a correctly-aimed wedge scores a hit and a mutual line-up produces a double-KO — with no phone ever seeing another's plan before reveal.
