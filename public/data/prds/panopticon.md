## Overview
Panopticon is a 4-player asymmetric cat-and-mouse. One player is the **Warden**, whose phone is the prison map and searchlight control. The other 2–3 are **Prisoners**, each with no map — their phone shows a single move pad and a vibration that intensifies as the Warden's beam nears them. Prisoners feel their way to the exit in the dark; the Warden hunts by sweeping light across positions only they can see. For groups who like hidden-movement games (Nuns on the Run) but want to *feel* the danger instead of reading a board.

## Problem
Digital hidden-movement usually means staring at a grid, doing bookkeeping. The itch: what if the hunted never see the board at all, and the only information channel is haptic dread? Proximity-as-vibration turns each phone into a private Geiger counter for danger — something a single passed-around phone physically cannot provide to three people at once.

## How it works
A 5×5 cell grid with one EXIT. Real-time ticks every 5s.

- **Warden phone (the map):** full grid, all prisoner dots, and a draggable searchlight cone. Each tick the Warden locks the beam onto one cell (plus its neighbors). Any prisoner lit at resolution is **caught**.
- **Prisoner phone (private, no map):** a 4-way move pad (N/E/S/W), a stamina of 3 caught-strikes shared, and a haptic proximity meter — the phone buzzes with amplitude scaled to how close the beam landed last tick and how close it's tracking. That's their *only* spatial sense. They commit one move simultaneously each tick.
- **Host TV (shared):** a pitch-black prison; the searchlight cone sweeps dramatically, caught prisoners flash red, and the EXIT glows faintly. No prisoner positions shown until lit.

Prisoners triangulate the beam purely by comparing this tick's buzz to last tick's — 'it got stronger, I'm walking into it.' The Warden reads movement patterns to predict cells. Prisoners win if any one reaches EXIT; Warden wins by catching all before then.

## Technical approach
Authoritative WS server holds `{ grid, exit, prisoners:[{cell, caught}], beamCell }`. Phones are PWA clients using the Vibration API for the proximity buzz (fallback: an on-screen pulsing dot for iOS Safari, which throttles vibration). Each tick: collect prisoner `move` commits and Warden `beam` lock, resolve simultaneously server-side, compute each prisoner's beam-distance, broadcast a per-prisoner `buzz(intensity)` plus caught flags. The genuinely hard part is **making haptics a usable navigation signal**: distance→amplitude curve must be legible through a phone motor, and iOS's vibration limits force a visual-pulse fallback that must feel equivalent without leaking the map.

## v1 scope
- 1 Warden + 3 Prisoners, single 5×5 grid, one EXIT.
- 5s ticks, 3 shared strikes, one round.
- Vibration buzz + on-screen pulse fallback.
- TV shows beam sweep + caught flashes + win/lose.

## Out of scope
- Multiple maps, walls/obstacles, multiple wardens.
- Prisoner special abilities, decoys, items.
- Matchmaking, reconnect, spectator mode.

## Risks & unknowns
- Haptic-only navigation may be too coarse to feel fair — may need a faint directional hint, risking making the map redundant.
- iOS vibration throttling could force most players onto the visual fallback, dulling the core hook.
- Warden may dominate on a tiny grid; tune beam radius and grid size.

## Done means
Four phones join, three prisoners navigate a grid they never see using vibration that measurably strengthens near the beam, the Warden sweeps a searchlight on their private map, and a playtest ends in either an escape or a full sweep — with at least one prisoner audibly reacting to their phone buzzing louder as the light closed in.
