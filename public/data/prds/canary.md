## Overview
Canary is a cooperative, **no-talking** party game for 3–4 players plus a shared TV. One player is the **Foreman**, who alone sees the mine map; the others are **Miners** stumbling in the dark, able to move only where the Foreman's silent lamp-signals point. It's for groups who like tense, wordless coordination and triage against a timer.

## Problem
"Guide the blind" games almost always let the guide talk freely, so they devolve into one person narrating the solution. The itch is to starve that channel down to nearly nothing — a single blink per miner — and add an attention bottleneck so the guide physically can't help everyone at once. That only works if each miner has a *private* lamp view and receives *private* signals simultaneously; a passed-around phone can't do either.

## How it works
The **Foreman**'s phone shows the mine grid: safe tunnels, gas cells, the ore vein (goal), and every miner's live position. Each **Miner**'s phone is nearly black — just their own headlamp (current cell) and a d-pad; no map, no sight of others. No talking is allowed (the drift is deafening / ear defenders — enforced as a rule, Foreman seated facing away). Rounds are simultaneous. Before each move the Foreman sends each miner one private signal on their phone: a glowing directional arrow (N/E/S/W). Everyone steps at once. A miner entering a gas cell is out — their lamp winks out dramatically on the TV. Two miners landing on one cell bounce and waste the move. The team wins if all surviving miners reach the vein before the canary-cage timer empties. The **host TV** shows the mine as bobbing lamp-lights over pure black plus the canary timer, so spectators watch miners drift toward gas they can't see.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Board{ grid[][], vein, hazards[] }`, `Miner{ id, cell, alive }`, `Round{ signals: {minerId: dir} }`. Turn-based, so sync is easy: Foreman submits signals → server pushes each privately to the correct miner → miners submit moves within a window → server resolves simultaneously (collisions, gas), updates the TV. The genuinely hard part isn't latency but the **signal UX**: making a one-arrow-per-miner channel legible, and routing distinct private signals to several phones at once in a way that stays fair and readable on the Foreman's small screen.

## v1 scope
- 3 players: 1 Foreman, 2 Miners.
- One 5×5 grid, one gas cell, one vein.
- Signal = a single N/E/S/W arrow per miner (no "hold," Foreman may signal both).
- 6-round canary timer; win = both miners reach the vein.

## Out of scope
- Attention bottleneck (signal only 2 of 3 miners), red "hold" signal, rockfall, multiple hazards.
- More players, larger maps, multi-round matches, scoring.
- In-app enforcement of the no-talking rule.

## Risks & unknowns
- Is a single arrow enough signal or just maddening? Tune grid size vs. hazard count.
- Silence is socially hard to enforce; may need white-noise on the TV or a penalty honor-rule.
- Without the 2-of-3 bottleneck, two miners may be trivially guidable — v1 could feel easy until the third miner (and the triage) is added.

## Done means
Three people in a room, no talking: the Foreman blinks arrows, two blind miners cross a 5×5 mine, at least one hits gas in testing (winks out on the TV), and the team either reaches the vein or the canary dies — one round, and testers feel the itch to signal a third miner they couldn't reach.
