## Overview
Knockout is a roguelike deckbuilder about minimalism as a blood sport. You start with a fat, redundant synthetic genome and prune it gene by gene, chasing the smallest viable organism that can still replicate. It's for the deckbuilder crowd (Slay-the-Spire brains) who'd never open a biology textbook but will absolutely obsess over trimming a build to its razor edge. Directly sparked by the JCVI minimal-cell story: a cell built from scratch that grows and divides.

## Problem
No game captures the specific thrill-and-terror of biological minimalism — the moment you realize the gene you just deleted was the one keeping everything else alive. Deckbuilders are all about adding and upgrading; almost none are about the harder art of subtraction under hidden dependencies.

## How it works
Your 'deck' is a genome of ~60–200 gene cards grouped by pathway: replication, translation, membrane, energy, defense. Every gene carries an upkeep (metabolic cost). Each turn you knock out cards to drop upkeep below the division threshold — but the genome is a dependency graph, and pulling a keystone gene severs a pathway and the cell dies (run over). The catch: redundancy. Two genes may cover one function; drop either and you're fine, drop both and you flatline. Hit minimal viability and the cell divides — you advance a floor, the deck partially reshuffles with mutations, and the threshold tightens.

## Technical approach
Godot 4, 2D, card UI. Model the genome as a dependency DAG; essentiality is computed by reachability from a set of 'must-produce' metabolite nodes — a simplified pathway-completeness check, not a full flux-balance analysis. Gene cards carry synonyms and partial redundancy so that pruning is an emergent puzzle with hidden information rather than a lookup table. Flavor and structure are grounded loosely in the JCVI-syn3.0 essential gene set and KEGG pathway categories. Runs are seeded and shareable. The genuinely hard part is tuning the dependency graph so that pruning feels like a satisfying, legible puzzle — enough visible signal to reason, enough hidden redundancy to surprise — rather than trial-and-error save-scumming.

## v1 scope
- One cell type, one win condition (achieve division)
- ~60 gene cards across 4 pathways
- Reachability-based death/viability check
- Text + icon UI, seeded runs

## Out of scope
- Real flux-balance analysis / accurate kinetics
- Evolution meta-progression between runs
- Multiplayer

## Risks & unknowns
- Reads as edutainment/dry instead of tense
- Graph tuning is the whole game and it's fiddly
- Balancing 'hidden redundancy' vs. feeling unfair

## Done means
In a single 15-minute session a first-time playtester both (a) reaches a viable cell division at least once, and (b) separately kills a cell by over-pruning a keystone gene — and can articulate, unprompted, why each outcome happened.
