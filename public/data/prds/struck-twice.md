## Overview
An interactive origin-of-life sandbox. You tune a random chemistry, hit run, and watch the reaction network light up as the solver finds self-sustaining autocatalytic cores inside it. The score is not "did life appear" but **how many disjoint cores appeared** — for the science-curious, students, and anyone who read that life on Earth may have arisen twice and wanted to poke at it.

## Problem
Abiogenesis writing is all prose and hand-waving. The actual formalism — Kauffman's binary polymer model and the Hordijk–Steel RAF (Reflexively Autocatalytic and Food-generated) algorithm — is elegant, polynomial-time, and completely invisible to non-specialists. There is no toy where you can *feel* the phase transition at which catalysis probability makes life inevitable.

## How it works
- **Set the soup.** Sliders: max polymer length `n` (2–12), food set (monomers + dimers), catalysis probability `p` that any given molecule catalyses any given reaction, and a seed.
- **Generate.** All ligation/cleavage reactions over binary strings up to length `n` are enumerated; each (molecule, reaction) pair becomes a catalysis arc with probability `p`.
- **Solve.** The RAF algorithm runs: repeatedly prune reactions that lack a catalyst or lack reachable reactants, until a fixed point. What survives is the maximal RAF.
- **The hook.** The maximal RAF is then decomposed into **irreducible RAFs**, and the app checks which irrRAFs share no reactions. Two disjoint irrRAFs in one soup = two independent origins. The headline number is that count, plotted against `p` as you drag the slider, so you watch the classic sigmoid phase transition emerge live — and a second, later transition where *second* genesis becomes likely.
- **Look at it.** Force-directed graph: food molecules as squares, reactions as edges, each disjoint core tinted its own hue, everything outside every RAF greyed to near-invisible.

## Technical approach
TypeScript + Vite, no backend. Molecules as integers (binary strings packed into a `Uint32`), reactions in typed arrays; the RAF pruning loop is a bitset fixpoint over reaction indices — fast enough for `n=10` (~2,000 molecules, ~20,000 reactions) at interactive rates in a Web Worker. Rendering via a canvas force layout (d3-force in the worker, transferable positions). The genuinely hard part is irrRAF enumeration: the maximal RAF can contain exponentially many irreducible subsets, so v1 samples them — repeatedly remove a random reaction, re-run RAF on the remainder, keep minimal survivors — and reports a lower bound on disjoint-core count, labelled honestly as a lower bound.

## v1 scope
- Binary polymer model, `n ≤ 8`, food = all strings of length ≤ 2
- Maximal RAF via the pruning fixpoint
- Sampled irrRAF decomposition, disjointness check by reaction-set intersection
- One canvas graph + one live `p` vs P(RAF) curve
- Shareable seed in the URL fragment

## Out of scope
Realistic chemistry (SMILES, thermodynamics), spatial/compartment models, kinetics or concentrations, mobile layout.

## Risks & unknowns
irrRAF sampling may badly undercount disjoint cores. Force layout gets hairball-ugly past ~1,500 nodes. Disjoint-in-reactions vs disjoint-in-molecules is a real modelling choice that changes the headline number — must be a visible toggle, not a hidden assumption.

## Done means
Dragging `p` from 0 to 0.01 reproduces the published sigmoid for P(RAF exists), and at least one seed is findable that shows two reaction-disjoint cores rendered in different colours.
