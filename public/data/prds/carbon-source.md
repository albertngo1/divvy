## Overview
A browser roguelite deckbuilder for people who like Slay the Spire and have never once enjoyed a metabolism diagram. Your deck is a set of biochemical reactions; your creature is a bacterium; every score in the game is computed by a genuine linear program over a published stoichiometric model, not by fake HP.

## Problem
Metabolism is taught as an unreadable wall-poster and simulated only in research tools (COBRApy, Escher) that assume you already understand it. Meanwhile every "science game" fakes its math, so nothing you learn transfers. Deckbuilders are the best teaching format we have for constrained systems — resources in, resources out, one bad synergy kills you — and metabolism is literally that.

## How it works
A run is 8 generations. You start with ~20 starter reactions (partial glycolysis, a broken TCA). Each generation sets an environment: glucose aerobic, then acetate only, then anaerobic, then a drug that hard-blocks one reaction. You play reactions from hand into your genome, hit End Turn, and the game solves FBA — maximize biomass flux subject to Sv = 0 and the environment's uptake bounds. Growth rate is your score; below threshold, the run ends.

Between generations you draft (a new transporter, an alternate NADH dehydrogenase) or **remove** cards — deck thinning is gene knockout, and, exactly as in real metabolic engineering, deleting a reaction can raise your yield. Boss rounds ask for a product: maximize succinate flux while keeping growth ≥ 0.1/h. That is the actual industrial trade-off, unmodified.

## Technical approach
Card pool = BiGG Models `e_coli_core` (95 reactions, 72 metabolites) downloaded as JSON — conveniently deck-sized. S is a sparse 72×95 matrix; LPs are solved in-browser with highs-js (WASM); at this size each solve is ~2–5 ms, fast enough to preview a card's growth delta on hover. Environments are just lower bounds on exchange reactions (`EX_glc__D_e` −10 → 0, `EX_o2_e` → 0). Card text is generated from the reaction string plus gene name. Flux visualization reuses Escher's published `e_coli_core` map layout, edge width = |flux|.

The hard part is legibility of failure. An infeasible or zero-growth LP must read as a sentence, not a solver code — so on failure the game inspects shadow prices/duals and the blocking metabolite to emit "you have no way to reoxidize NADH." That translation layer is the whole design.

## v1 scope
- 8 fixed generations, no randomized environment order
- 30-card pool, text-only cards, no map
- One LP solve on End Turn; growth rate is the only feedback
- Fail state and a run-summary screen; no meta-progression

## Out of scope
Genome-scale models (iML1515, 2712 reactions), multi-species communities, dynamic FBA over time, save/resume, mobile layout.

## Risks & unknowns
LP feasibility is a cliff, not a curve — difficulty may feel arbitrary until bounds are hand-tuned. Biology-curious and deckbuilder-curious may be disjoint audiences. Escher map JSON licensing needs checking before shipping the layout.

## Done means
A full run is playable in under 10 minutes; at least one coherent winning line (anaerobic fermentation build) and one real trap (a drafted reaction that strands your NADH) exist; and every growth number the game prints matches COBRApy on the same model and bounds to within 1e-6.
