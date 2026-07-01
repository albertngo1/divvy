## Overview
Passage is a browser roguelike deckbuilder where each run is a cell lineage. You draft genes, run a metabolism, and must accumulate enough membrane and a duplicated genome to *divide* before toxins or starvation kill the line. For biology-curious players and Slay-the-Spire fans who want their deck to mean something.

## Problem
The synthetic-cell headline (a from-scratch cell that grows and divides) is thrilling but abstract. No game makes the razor's-edge economy of a minimal living cell — import a nutrient, spend ATP, copy DNA, split — feel tense and legible. Metabolism is a graph; graphs are cards; nobody's built the deck.

## How it works
You start with a bare protocell: a handful of gene cards. Each turn is one metabolic cycle: draw genes, import metabolites from the medium, fire reactions that convert substrates to products, and pay a per-turn entropy/repair cost. Genes are cards like `{enzyme, substrate, product, atp_cost}`. To divide you must bank enough membrane lipid AND a full genome copy; dividing keeps your deck but drops you into a harsher medium (less glucose, more toxin). Each division rolls a mutation: add, upgrade, or lose a gene. Permadeath ends the lineage; meta-progress unlocks alternate starting genomes.

## Technical approach
TypeScript, plain reactive state, canvas/SVG render, localStorage for meta — no backend in v1. Card + medium data as JSON. The core loop is a tiny flux resolver: given available metabolites, greedily (or via a small LP) decide which reactions fire, bounded by ATP. Flavor and card names seed from the JCVI-syn3.0 minimal-genome list and KEGG/BiGG pathway snippets. The genuinely hard part is balance: the metabolic graph must be simple enough to read at a glance yet deep enough for combo discovery (e.g. a salvage pathway that turns your own toxin into fuel).

## v1 scope
- 15 gene cards, one starting medium
- The divide-or-die turn loop with ATP + entropy
- 3 possible mutations on division
- localStorage record of deepest lineage

## Out of scope
- Multiplayer / leaderboards
- Importing real genome files
- 3D or animated cell rendering

## Risks & unknowns
The metabolism sim can collapse into either trivial (always divide) or incomprehensible (spreadsheet hell). Card balance is the whole game. Making reaction chains feel like *decisions* rather than bookkeeping is unproven.

## Done means
A player can start a run, survive at least two divisions, die to starvation or toxin, and see their lineage depth recorded — with at least one non-obvious gene combo that measurably extends survival.
