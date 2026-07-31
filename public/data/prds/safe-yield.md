## Overview
A single-player, turn-based management sim set in one real California groundwater subbasin. You run the Groundwater Sustainability Agency: each turn is a water year, you set pumping allocations and site recharge projects, and you try to survive until 2040 without going broke or dry. For sim/tycoon players and anyone who liked the slow doom of Frostpunk's ratchets.

## Problem
Resource-management games almost universally model reservoirs as tanks: draw down, refill, no memory. The one physical fact that makes real aquifers terrifying is missing — inelastic compaction. When the water table drops below the historical low, clay layers collapse, the land subsides, and the pore space is *destroyed*. The basin doesn't just get emptier, it gets permanently smaller. That's a game mechanic nobody has built, and it's the actual reason parts of the Central Valley may have crossed a point of no return.

## How it works
A hex board over the real subbasin, each hex holding head level, crop mix, and two storage compartments: elastic (recoverable) and inelastic (once gone, gone). The HUD headline reads "Basin storage: 78%" — a percentage *of current capacity*. Overpump a hex past its preconsolidation head and capacity silently drops, so the number can go *up* while you're losing the basin. The true capacity curve lives on a second panel most players won't open until turn 25.

Each turn: draw a water year from block-bootstrapped historical precipitation (so droughts cluster the way they really do), set per-hex allocations, optionally fund recharge basins or fallowing buyouts. Allocations must pass a seven-member NPC board whose private acreage and crop portfolios you can inspect; each votes its expected profit, so passing cuts means trading recharge siting for votes. Endgame scoring reveals cumulative capacity destroyed — a number that was never on the dashboard.

## Technical approach
TypeScript + Vite, deck.gl H3 hex layer, Zustand state, all client-side. Hydrology is a single-layer explicit finite-difference solve of the 2D groundwater flow equation on the hex grid (5-neighbor Laplacian, transmissivity per hex), plus a compaction rule: if `head < preconsolidation_head`, apply inelastic specific storage `Sske` and lower `preconsolidation_head` permanently. Real inputs, baked into a static JSON at build time: DWR Periodic Groundwater Level Measurements and the SGMA Data Viewer for head history, JPL/TRE-Altamira InSAR subsidence rasters for calibrating compaction, USDA CropScape CDL for crop acreage, CIMIS ETo for demand, PRISM/NOAA for the precipitation record.

The hard part is legibility: a ratchet that unfolds over 40 turns is only dramatic if the player can reconstruct, at the end, exactly which three decisions did it. So the sim keeps a per-hex causal log and the game-over screen is a scrubber — replay any hex's head trace with your decisions annotated.

## v1 scope
- One subbasin, 12 hexes, 20 turns
- Pumping allocation + one recharge action, no board politics
- Elastic/inelastic storage with the deceptive percentage HUD
- End screen revealing destroyed capacity and the decision replay

## Out of scope
Surface water imports and Delta politics, multi-layer aquifers, water markets/trading, campaign across basins, mobile.

## Risks & unknowns
Calibration is a research project in itself; v1 should be plausibly-parameterized rather than predictive, and say so. The deceptive-HUD trick can read as unfair rather than tragic if the second panel isn't discoverable. Tuning difficulty against a stochastic hydrology draw is fiddly.

## Done means
A playtester finishes a 20-turn run, is surprised by the end screen, immediately replays — and on the second run deliberately keeps heads above preconsolidation, losing money but preserving capacity.
