## Overview
Splice is a browser puzzle-sim where you assemble a minimal synthetic genome from a palette of gene 'parts,' then press GO and watch your cell try to metabolize, grow, and divide in a simulated medium. It's genome-golf: the fewest genes that still yields a viable, dividing cell wins. For tinkerers, bio-curious gamers, and anyone who read about the first from-scratch dividing cell and thought "I want to try."

## Problem
Synthetic biology is thrilling but locked behind wet labs and jargon. There's no low-stakes sandbox where you can *feel* the brutal trade-off of a minimal genome — cut too much and the cell dies; keep too much and you're just copying nature.

## How it works
Each level gives a nutrient medium and a win condition ("divide twice within N ticks"). You drag genes — encoding transporters, enzymes, replication machinery, membrane synthesis — onto a genome track. The sim runs a simplified flux/resource model: genes produce enzymes, enzymes convert metabolites, metabolites fund growth and DNA replication, and at a size threshold the cell divides. Missing a pathway starves it; redundant genes cost 'upkeep.' Score = viability × (1 / gene count). A daily seeded medium creates a shared puzzle with a leaderboard.

## Technical approach
Stack: TypeScript + a small ECS, rendered on Canvas/WebGL (no heavy deps). Core is a discrete-time metabolic simulator: a directed graph of metabolites and gene-catalyzed reactions solved each tick with simple mass-action kinetics (concentration deltas, no full FBA needed for v1). Data model: `Gene {id, produces, catalyzes, upkeep}`, `Metabolite`, `CellState {volume, pools, dna}`. Division fires when volume ≥ threshold and DNA is fully replicated. The hard part is *tuning* the reaction constants so the puzzle space is fair-but-tight — every removable gene should matter — which I'll do by evolving reference genomes with a small search to validate each level is solvable near the intended gene count.

## v1 scope
- ~8 genes, ~6 metabolites
- One reaction-kinetics tick loop with visible cell growth + a single division
- 5 hand-tuned levels
- Gene-count score + local best

## Out of scope
- Real biology accuracy / actual gene sequences
- Multiplayer / global daily leaderboard (v2)
- Mutation/evolution mechanics
- 3D rendering

## Risks & unknowns
The sim could be either trivial or inscrutable — tuning is everything. Educational-vs-fun balance is delicate. Metabolic modeling can rabbit-hole; must stay abstracted.

## Done means
A player can complete a level by placing genes, watch the cell grow and visibly divide, get a gene-count score, and — critically — removing any one gene from the winning genome causes a visible failure (proving the puzzle is tight).
