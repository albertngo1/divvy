## Overview
Doubling Time is a minimalist idle/tycoon game inspired by the first from-scratch cell that grew and divided. You start with a bare synthetic chassis and a near-empty genome; you spend accumulated biomass to slot in genes, each shortening your doubling time or unlocking new metabolism. The core dopamine loop is watching a number of cells go from 1 → 2 → 4 → 8 while you tune the machinery that makes doubling faster.

## Problem
Idle games are usually themed around dragons or cookies — arbitrary flavor bolted to an exponential curve. But *cell division is literally an exponential process*, so the genre and the subject are a perfect, honest match. There's a satisfying game hiding in the actual constraints of building a minimal genome.

## How it works
A single cell sits on screen. Biomass accrues continuously; on each doubling it splits (visibly) and doubling time is recomputed. You spend biomass in a gene shop: ribosome copies (faster synthesis), transporters (unlock a new nutrient → new income stream), DNA repair (reduce a mutation tax that randomly disables genes), and "essential" genes that gate progress. Prestige = "speciation": reset the colony for permanent trait points. Random "stress events" (heat, osmotic shock) force trade-off decisions.

## Technical approach
Stack: vanilla TypeScript + Canvas, no framework, one HTML file. State is a plain object persisted to localStorage; the sim runs on a fixed-timestep accumulator so offline progress is computed from `Date.now()` deltas on load. Doubling time is a function `t = base / Π(gene multipliers)` with diminishing returns per gene tier. Cell rendering is cheap: draw up to ~200 sprites, then switch to a single "colony density" heat blob past that to keep it 60fps. The interesting structure is a small dependency DAG of genes (some genes require others) and a mutation model where each division has a small chance to knock out a random non-redundant gene unless repair is bought — creating genuine tension between growth and stability.

## v1 scope
- ~12 genes across 3 tiers with a dependency DAG
- Doubling loop with visible split animation up to a density cap
- One prestige layer (speciation)
- Offline progress + localStorage save

## Out of scope
- Real biochemistry accuracy, named genes, pathways
- Accounts, leaderboards, cloud save
- Multiple cell types / ecosystems

## Risks & unknowns
Idle balancing is notoriously fiddly — the exponential can trivialize or wall the player fast. The mutation tax could feel punishing rather than tense. Keeping the division animation performant at scale needs the density-blob fallback to actually feel good.

## Done means
Starting fresh, a player can slot at least one gene, watch doubling time drop and cells visibly divide, close the tab, reopen it and see correctly-computed offline growth, and reach the first speciation prestige within a single sitting.
