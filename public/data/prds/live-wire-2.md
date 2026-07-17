## Overview
A held-breath, SILENT cooperative crossing game for 3 players. One phone is a hidden maze of live wires laid over the real floor. The other two players stand on that floor and must reach their targets — but they can't see the wires, and the map-holder isn't allowed to speak. All guidance is private, per-phone, one step at a time.

## Problem
Most "guide the blind player" games are just shouting. Remove the voice and the whole thing changes: the map-holder must route multiple walkers through a hidden hazard using nothing but silent, private pulses — and can't broadcast one instruction to the room. That constraint only works if every walker holds their own phone.

## How it works
Imagine (or tape) a 4×4 grid on the floor.
- **Map-holder phone (THE MAP, private):** the full grid overlaid with live wires (deadly cells), each walker's current token, each walker's private goal cell, and a shrinking "surge" timer. The map-holder taps a direction toward a specific walker to route them.
- **Each walker phone (private):** almost nothing — a single big arrow (↑↓←→) that pulses with a haptic buzz when the map-holder sends their next step, and a "BRACE" button. The walker sees only their own cue, never the map, never the other walker's cue.
- **Host TV (shared):** tension theater only — anonymized tokens on a blank grid, the surge timer, and a heartbeat sound. No wires shown, ever.

On a buzz, a walker physically steps that direction and confirms. If the map-holder misread the maze and routed them onto a live wire, that walker's phone shrieks and they're sent back to start. A walker who distrusts a cue can hit BRACE to skip a step (costs time). Get both walkers onto their goal cells before the surge timer empties. Because the map-holder is silent and split across two walkers, it's a frantic, funny scramble of thumbs.

## Technical approach
Authoritative WebSocket server holds `grid: cell[]` (safe/wire), `walkers: {pos, goal}[]`, `surgeMs`. The map-holder's directional taps are the authoritative move commands — tapping ↑ for Walker A both advances A's token server-side AND pushes a private `{dir, buzz}` event to only A's socket. Server checks the destination: wire → emit fail-buzz + reset; goal → lock. Per-connection filtering ensures walker sockets receive ONLY their own arrow, never grid or peers. No positioning sensors — physical stepping is theater; the tap sequence is ground truth. Hard part: haptic reliability across phones (Vibration API is spotty on iOS Safari) — fall back to a full-screen color-flash + tone as the pulse.

## v1 scope
- 1 map-holder + 2 walkers.
- One 4×4 grid, ~4 wires, one round, 60-second surge timer.
- Arrow-pulse + buzz, BRACE-to-skip, win when both reach goals.
- No app voice; silence is enforced by house rule.

## Out of scope
- Larger grids, moving wires, scoring/leaderboards.
- Real floor-position sensing, more than 2 walkers.
- A traitor variant (map-holder who lies) — later.

## Risks & unknowns
- Haptics unreliable → the color-flash fallback must be unmistakable.
- Walkers with zero agency may feel passive; BRACE is the minimum counter-play and may need more.
- The silence rule is social, not enforceable in code.

## Done means
Three phones + a TV: a silent map-holder pulses private arrows and successfully threads two blind walkers to their goals across a hidden wire grid within 60s, and the round is unplayable if the walkers share one phone — proving simultaneous private per-phone cues are the point.
