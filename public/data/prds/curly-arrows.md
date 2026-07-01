## Overview
Curly Arrows is a browser deckbuilder for anyone who ever doodled reaction mechanisms in the margins of an orgo notebook. You start each run with a flask of a cheap feedstock and a deck of reagent cards; the game hands you a randomly-chosen target molecule and dares you to build it step by step before entropy (a dwindling yield meter) wins.

## Problem
Chemistry is taught as memorization, but real synthesis is a puzzle — a search through reaction space. There's no fun, low-stakes way to *feel* the shape of that search. Roguelike deckbuilders are exactly the genre for "build a chain of transformations under scarcity," yet nobody has grafted them onto actual reaction rules.

## How it works
The board shows your current molecule as a 2D structure. Each turn you play reagent cards (oxidize, reduce, Grignard, halogenate, protect/deprotect, aldol...) that transform the molecule. Every reaction costs "yield %"; side reactions add junk substituents you must later strip. Reach the target scaffold before yield hits zero. Between fights you draft new cards, buy catalysts (reusable, no yield cost), and unlock named-reaction relics (Wittig, Diels-Alder) that enable big one-shot bond formations. Bosses are notoriously hard total syntheses.

## Technical approach
Stack: React + TypeScript, RDKit-JS (the WASM build of RDKit) for all the chemistry. Molecules are SMILES strings; reactions are RDKit `ReactionFromSmarts` SMARTS templates applied via `runReactants`, so transformations are chemically real, not hand-faked. RDKit renders structures to SVG. The card pool is ~40 reaction SMARTS with cost/side-effect metadata in JSON. Target molecules are drawn from a curated SMILES list binned by difficulty (molecular weight + ring count as a rough proxy). The genuinely hard part is *reachability*: guaranteeing a randomly dealt deck can actually reach the target. I'll precompute solvability offline with a bounded BFS over reaction applications and only ship (deck, target) pairs with a known solution of length N, then hide that solution.

## v1 scope
- One feedstock, ~15 reaction cards, ~20 hand-picked targets
- Single run, no meta-progression, seedable RNG
- RDKit-JS rendering + SMARTS transforms working in-browser
- A yield meter and win/lose screen

## Out of scope
- Stereochemistry and reaction conditions (temp, solvent)
- Multiplayer, accounts, daily challenge
- Teaching mode / hints

## Risks & unknowns
RDKit-JS is a heavy (~10MB) WASM download — need lazy loading and a splash. SMARTS templates can fire in unintended positions on polyfunctional molecules; curation and canonicalization are essential. Difficulty balancing via molecular descriptors may feel arbitrary and need manual tuning.

## Done means
A player can load the page, be dealt a seeded target, play reagent cards that visibly and correctly transform an on-screen molecule via RDKit, and win or lose based on reaching the target before the yield meter empties — with at least 20 solvable targets shipped.
