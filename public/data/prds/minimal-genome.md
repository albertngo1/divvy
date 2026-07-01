## Overview
Minimal Genome is a browser idle/optimization game about building the smallest viable cell. You start with a bloated genome and shave genes away; each cut speeds replication if the gene was dead weight, or cripples/kills the cell if it was essential. The goal: the fewest genes that still grow and divide — echoing the real 'cell built from scratch that divides' milestone.

## Problem
Synthetic biology is fascinating and almost never made playful. Idle games are usually about numbers-go-up with no grounding. There's an itch for an idle game whose core loop teaches something real — here, gene essentiality and metabolic dependency — while still delivering that satisfying optimization dopamine.

## How it works
Core loop: your cell divides on a timer; division rate = f(genome). You spend 'division ticks' to run experiments: knock out a gene and observe. Non-essential knockouts trim upkeep and speed replication; essential ones stall growth (you can restore them). Synthetic-lethal pairs mean two genes are each fine alone but fatal together — the puzzle depth. Prestige: reach a viable minimal set, 'transplant' the genome, and restart with new modifiers. Ambient, numbers-tick, mildly educational.

## Technical approach
Stack: TypeScript + a canvas/DOM idle framework, all client-side, localStorage saves. Data model: `gene(id, name, category, upkeep_cost, essential_bool, synthetic_lethal_with[])`, `genome = Set<geneId>`, replication_rate computed from summed upkeep and pathway-completeness. Seed the gene list loosely from real minimal-genome research (JCVI-syn3.0's ~473 genes, essentiality categories) — abstracted, not a simulator. Core algorithm: a dependency/pathway graph where 'viable' requires every essential pathway to have a complete gene set; knockouts recompute viability + rate via graph traversal. The genuinely hard part is tuning the essentiality/synthetic-lethal graph so it's a real puzzle (meaningful trade-offs, non-obvious lethal pairs) rather than trivial trimming.

## v1 scope
- ~40 genes across 6 pathways, hand-authored essentiality
- Divide-on-timer loop with knockout/restore experiments
- Win state: reach a defined minimal viable genome
- localStorage save

## Out of scope
- Real biochemistry simulation or accurate kinetics
- Multiplayer / leaderboards
- Prestige/meta layer (add post-v1)

## Risks & unknowns
- Balancing so trimming feels like a puzzle, not a slog
- Keeping it educational without being a lecture
- Idle pacing: too slow bores, too fast removes the optimization tension

## Done means
A player can knock out genes, see replication rate change, discover at least one synthetic-lethal pair the hard way, and reach a labeled 'minimal viable genome' win state — all persisting across a page reload.
