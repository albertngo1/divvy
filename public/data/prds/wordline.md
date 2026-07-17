## Overview
A grid-based engineering puzzle that dramatizes what a *memory compiler* actually does — tiling bitcells into an SRAM array and wiring the periphery — as escalating hand-solved levels. For the Zachtronics/`nand2tetris`/hardware-curious crowd who loved *Breadboard* and *Cache Line* but want to go one layer down into physical layout.

## Problem
The Lobsters post *"What a Memory Compiler Actually Means: From Bitcells to GDS Tiling"* reveals a beautiful, invisible process: memory arrays aren't designed, they're *tiled* from a few cells under brutal constraints. That knowledge lives in fab documentation and $$$ EDA tools. There's no approachable, tactile way to *feel* why memory is laid out the way it is — the abutment rules, the shared bitlines, the sense-amp pitch matching.

## How it works
Each level gives a target memory spec (e.g. 8×4 bits, one read port) and a palette of tiles: the 6T bitcell, wordline drivers, bitline precharge, sense amplifiers, column mux. You place tiles on a grid so that cells *abut* correctly (shared VDD/GND rails and bitline contacts must align — misalignment breaks the net), wordlines run in rows, bitlines in columns, and periphery pitch-matches the array. A checker simulates a read/write: assert a wordline, see if the addressed bit's value propagates through the bitline to a resolved sense-amp output. Constraints tighten across levels — minimize area (bounding box), then meet a "timing" budget modeled as bitline RC ∝ column height. Solved layouts export a stylized GDS-like SVG.

## Technical approach
Stack: TypeScript + Canvas/SVG, fully offline, JSON level defs. Data model: a tile grid where each tile exposes typed connection ports on its four edges (rail, wordline, bitline, control); abutment legality = matching port types on shared edges (constraint check, not full physics). "Simulation": build a graph from placed ports, run a logic pass — decode address → drive wordline → for each column evaluate the pass-transistor path from the selected cell to the sense amp; a bit reads correctly only if the path is continuous and no bitline is shorted. Scoring: area = bbox; timing proxy = max column cell-count × per-cell RC. Hard part: designing an abutment/port model that's *simple enough to be a game* yet teaches the real intuition (shared bitlines, pitch matching, why arrays are square-ish), plus authoring a difficulty ramp from a hand-built solver that can generate/verify reference solutions.

## v1 scope
- 6 tile types, edge-port abutment checker
- 5 hand-authored levels (1×1 up to 4×4 bits)
- Read/write logic verification + pass/fail with the failing net highlighted
- Area score shown per solve

## Out of scope
- Real SPICE/transistor sizing, actual GDSII export, DRC
- Multi-port RAM, DRAM/flash, procedural level generation
- Any real EDA file interop

## Risks & unknowns
- Abstraction could be too fiddly (real layout is brutal) or too shallow to feel meaningful
- Verifying arbitrary player layouts requires a robust net-tracer, not just pattern-match
- Audience is niche; needs strong onboarding to teach the vocabulary

## Done means
A player can place tiles to build a working 2×2-bit SRAM, run the checker to confirm all four addresses read/write their stored bit, see an area score, and fail informatively when a bitline is left unrouted — all in-browser with zero setup.
