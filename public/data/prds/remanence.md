## Overview
Remanence is a small browser puzzle game about memory remanence and cold-boot attacks, for people who read the LUKS-key-in-RAM thread and thought 'wait, keys just *sit* there?'. You play a forensic analyst dumping a powered-down chip, reconstructing a key from a fading bit-grid.

## Problem
Cold-boot attacks and key remanence are counterintuitive and taught only in dense papers. Meanwhile the HN front page is arguing about whether suspend wipes keys and how tokens get stolen. There's no playful, tactile way to internalize why a key persists in RAM, decays predictably, and can be reconstructed from redundancy.

## How it works
Each level shows a grid of RAM cells that were holding an AES key schedule. The moment you 'cut power', cells begin flipping toward their ground state on a per-region half-life (real DRAM decays toward a known 0/1 bias per region). You spend limited 'probe' actions to read cells; the key schedule has structural redundancy (round keys derive from the master key), so you reconstruct missing bytes by solving the key-expansion constraints. Beat the clock and you recover the key; too slow and it's unrecoverable. Later levels add a defender mode: you place scrub passes to destroy the key before an attacker's probes land — the LUKS-suspend argument, playable.

## Technical approach
Pure client-side: TypeScript + a canvas grid, no server. Core model is a `Cell{value, groundBias, halfLifeMs}`; a fixed-timestep loop flips cells stochastically-but-deterministically using a seeded PRNG so daily puzzles are fair and shareable. The reconstruction engine implements real AES-128 key expansion as a constraint solver: known round-key bytes propagate backward/forward through Rcon and SubWord to fill unknowns; a byte is 'recovered' when enough of its dependency chain is observed. Daily mode seeds the grid, decay schedule, and probe budget from the date. The hard part is tuning difficulty so the key-expansion constraints make some puzzles solvable-with-thought and others genuinely lost — a nice search/solvability check offline.

## v1 scope
- One decay model, one grid size, AES-128 reconstruction
- ~8 handmade levels + a date-seeded daily
- Wordle-style shareable result (recovered %, time left)

## Out of scope
- Defender mode, multiplayer, real memory dumps
- Other ciphers or realistic error-correction beyond key expansion

## Risks & unknowns
- Key-expansion-as-puzzle may be too abstract to feel fun vs educational
- Balancing 'solvable' vs 'lost' needs an offline solver to certify puzzles
- Risk of reading as a real attack tool (it isn't — simulated data only)

## Done means
Playing the daily, I can probe cells, watch regions decay on schedule, reconstruct a partial key via the expansion solver, and get a shareable score — with an offline check confirming the seed's puzzle is solvable within the probe budget.
