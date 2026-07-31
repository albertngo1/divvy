## Overview
A browser roguelike deckbuilder where a run is a chemical synthesis. You start from a cheap feedstock with a hand of named reactions and must reach the boss molecule before your yield collapses. For people who like Slay the Spire and half-remember orgo, plus chemistry students who want a route-planning gym that isn't flashcards.

## Problem
Retrosynthesis is the most game-shaped thing in science — resource management, combinatorial search, punishing selectivity traps — and every tool that touches it is either a five-figure enterprise CASP suite or a quiz app. Meanwhile deckbuilders have run out of themes: another set of swords and curses. Nobody has made the *rules of the game* be actual chemistry.

## How it works
Cards are reaction templates: Suzuki coupling, Grignard addition, Wittig, Friedel–Crafts acylation, LiAlH4 reduction, Boc protection. Playing a card requires your current molecule to match the template's reactant SMARTS; the engine runs the transform and hands you the product. Illegal plays are literally unrepresentable — the rulebook is the chemistry.

Resources:
- **Yield = HP.** Each card rolls a yield from its distribution and multiplies your running total. Drop below 5% and the run ends.
- **Atom economy = gold.** MW(product)/ΣMW(reagents), spent in the between-floor shop.
- **Steps = turn limit.** Long linear routes lose.
- **Protecting groups = the block mechanic.** If a template matches multiple sites and you didn't mask the vulnerable one, the reaction fires on a random site and you eat the wrong product.

Bosses are real targets: floor 1 aspirin, floor 3 ibuprofen, floor 5 paracetamol, endgame a paclitaxel side chain. Shop pools and intermediates are sampled from a real template library, so no two runs share a route.

## Technical approach
React + RDKit-JS (official `@rdkit/rdkit` WASM build). Molecules are canonical SMILES; a card is `{name, rxnSmarts, yieldDist, cost, tags}` executed via `RunReactants`. Template library: extract ~150 high-frequency templates from USPTO-50k offline with RDChiral, hand-curate, ship as JSON. Depiction uses RDKit's SVG renderer with reacting atoms highlighted from the template's atom maps. The route is stored as a DAG of SMILES nodes; scoring uses RDKit descriptors (SA score for intermediate nastiness, exact MW for atom economy). Seeded RNG (mulberry32) makes runs shareable by seed.

The genuinely hard part is **template promiscuity**: a naive extracted template fires on twenty sites and yields garbage that no chemist would accept. Needs site-selectivity heuristics — Gasteiger partial charges, aromatic/ring filters, steric neighbor counts — plus a curated whitelist, so the game feels right without shipping a full neural CASP model.

## v1 scope
- 12 hand-written cards, no shop
- One linear floor, one boss: aspirin from phenol + acetic anhydride
- Yield-as-HP, step limit, SVG molecule rendering
- Seeded runs, run log export

## Out of scope
Stereochemistry, reaction conditions (solvent/temp/catalyst loading), convergent multi-component routes, mobile layout, any ML model.

## Risks & unknowns
Chemists may find the abstraction insulting; gamers may bounce off structures. Mitigate with a pictures-only UI, no SMILES typing ever, and a "why did this fail?" tooltip that names the offending functional group. RDKit-JS is a ~10 MB WASM payload — lazy-load behind the title screen.

## Done means
A player who has never taken orgo finishes an aspirin run in under five minutes without seeing a SMILES string, and a working chemist reading the exported run log calls every step chemically plausible.
