## Overview
Off-Target is a daily browser puzzle about **selectivity** — the single hardest idea in drug and pesticide design — dressed up as a lock-and-key shape game. It's for people who like Wordle-adjacent daily brain teasers and secretly want to understand why a compound can kill a mite but not the bee it rides on. Sparked by the HN story on spider venom that's lethal to varroa mites yet harmless to honeybees.

## Problem
Most 'science games' either teach nothing or bury you in real chemistry. The genuinely beautiful concept of selectivity — exploiting a *tiny* structural difference between a pest target and a host target — never gets a playful surface. Meanwhile daily-puzzle fatigue is real; people want a fresh mechanic, not another word grid.

## How it works
Each day you're given two 'binding pockets' rendered as jagged 2D socket shapes: the PEST target (red) and the HOST target (blue). They're deliberately similar — maybe 80% overlapping contour — because in real biology homologous proteins are close cousins. You assemble a 'ligand' by snapping together a small budget of functional-group tiles (a bump, a hook, a charged nub, a hydrophobic blob). Scoring rewards a molecule that seats deeply in the PEST pocket (high fit) while *clashing* in the HOST pocket (must not fit). You get 4 attempts; each attempt reveals per-pocket fit/clash heatmaps, Mastermind-style, so you triangulate toward the one exploitable difference. Perfect selectivity = kill pest, spare host. Shareable emoji grid of your fit/clash trace.

## Technical approach
Pure client-side, no backend needed for v1. Stack: TypeScript + a Canvas/WebGL2 renderer. Pockets are procedurally generated as signed-distance-field polygons seeded by the UTC date (deterministic daily). Ligand = a small graph of tile primitives; 'fit' is computed as a 2D collision/penetration score: sample the SDF of the pocket at each ligand atom, reward negative distance (inside surface) up to a depth cap, penalize positive distance (steric clash). Selectivity score = fit(pest) − λ·fit(host), with a clash bonus when host penetration is positive. The genuinely hard part is *generating* daily puzzles that are solvable, unique-ish, and have exactly one narrow exploitable difference — a rejection-sampling loop that generates pocket pairs, brute-forces the tile solution space (small enough to enumerate), and keeps only seeds with a clean single-solution selectivity gradient.

## v1 scope
- One daily puzzle, deterministic by date
- ~6 tile types, budget of 4 tiles
- 4 guesses, fit/clash heatmap feedback
- Shareable result string
- LocalStorage streak counter

## Out of scope
- Real chemistry / actual PDB structures
- 3D docking, multiplayer, accounts
- Level editor

## Risks & unknowns
- Puzzle generator may produce trivially-easy or impossible days — needs a difficulty tuner
- 2D shape-fit may feel arbitrary without good juice/feedback
- Teaching selectivity without a tutorial that bores people

## Done means
A hosted page where opening it on two different dates yields two different solvable puzzles, a human can reach a perfect selectivity score within 4 guesses on an 'easy' seed, and the share string round-trips.
