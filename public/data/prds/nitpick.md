## Overview
Nitpick is a daily browser puzzle for people who like being *contrarian on purpose*. Each day presents one plausible-sounding, universally-quantified claim ("for every graph with property X, Y holds") and challenges you to construct a single object that shatters it. It's the front page's "human mathematicians are being outcounterexampled" headline turned into a toy: instead of proving things, you spend three minutes hunting for the one weird case where the beautiful pattern dies.

## Problem
Math games reward *proving* or *computing*; almost none reward the sharp, delicious skill of disproof — finding the minimal ugly example that ruins a tidy generalization. Meanwhile the news is full of AI finding counterexamples humans missed. There's an itch to play on that same field, at human scale, daily and shareable.

## How it works
You're shown a conjecture in a small, decidable domain (integers mod n, finite graphs, integer sequences, low-degree polynomials over GF(2)). A structured builder lets you assemble a candidate object — drag vertices/edges, punch in numbers, place lattice points. An in-browser verifier evaluates the predicate live and turns red the instant your object makes it false: you win. Score = minimality (description length of your counterexample) × speed. In the corner, "the Oracle" (a bounded solver) searches in parallel; beat it or at least find a *smaller* example for bonus. Wordle-style emoji share ("broke it in 2, size 7, Oracle needed size 11").

## Technical approach
Pure client-side TypeScript, no backend for gameplay. A tiny typed predicate AST is evaluated in the browser against the candidate. Conjecture bank is hand-authored around real "looks-true-but-false" gems, scaled down: Euler's sum-of-powers, Pólya's conjecture, Fermat pseudoprimes, Seifert/graph reconstruction traps, Borwein integrals. The Oracle is z3 compiled to WASM (or a bounded brute-force for small domains) racing on a web worker. Daily seed derives which conjecture + parameter window is served. Minimality metric = serialized description length, so "elegant" small breaks win. The genuinely hard part is *authoring*: statements must be false, non-obvious, decidable within a browser budget, and have a smooth difficulty curve.

## v1 scope
- 20 hand-authored conjectures across 2 domains (integers, small graphs)
- Live in-browser verifier + minimality scoring
- One daily puzzle, deterministic seed, local streak storage
- Emoji share card

## Out of scope
- User-submitted conjectures
- Global accounts/leaderboard server
- Formal proof of "looks true" (curated, not machine-guaranteed)

## Risks & unknowns
z3-in-WASM race may be too fast/slow — may need difficulty tiers. Authoring good conjectures is the real labor; bank could run dry. Domain UI (graph builder) must be genuinely fun, not fiddly.

## Done means
A stranger can open the page, read today's conjecture, build an object that flips the verifier red, see a size+time score versus the Oracle, and share a spoiler-free result — all offline, in under five minutes.
