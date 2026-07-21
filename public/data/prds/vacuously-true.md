## Overview
A single-player puzzle game about the sting in the xenaproject post 'human mathematicians are being outcounterexampled.' You author small universally-quantified claims over finite structures (graphs, integers mod n, small groups, posets); a deterministic adversarial solver races to find the *least* counterexample. Each level asks you to turn a false-looking statement into a true one — or a true-looking one into a tightly-scoped valid claim — using the fewest hypothesis edits. For puzzle players, recreational mathematicians, and anyone who loved TIS-100 but wanted proofs instead of assembly.

## Problem
Formal math tooling (Lean, model finders) is powerful but has zero on-ramp for play. Meanwhile the emotional hook — 'the machine found the case you missed' — is universally relatable. There's no game that makes the *adversary* the fun part.

## How it works
A level gives you a claim skeleton: `forall G in Graphs(n<=7): connected(G) -> hasCycle(G)`. You edit the antecedent/consequent from a palette of predicates. Press RUN and a solver enumerates the finite domain, returning the lexicographically-smallest witness that breaks your claim, animated as a highlighted structure. Your job: add/strengthen hypotheses (`|E| >= n`, `mindeg >= 2`) until no counterexample exists — scored on edit count and remaining domain size (broad-but-true beats narrow-but-true). A 'vacuously true' trap: over-constrain until the antecedent is unsatisfiable and you get a mocking zero-score win. Daily challenge with a shared seed and a leaderboard on edit-golf.

## Technical approach
Browser game, TypeScript + a small hand-written finite-model checker (no external solver needed for v1's tiny domains — brute-force enumeration with symmetry pruning via canonical graph labeling / nauty-style orbit hashing). Predicate palette compiles to closures over the structure. Domains are enumerated generators (all graphs up to 7 nodes ≈ 1044 iso classes, precomputed and shipped as a JSON pack). The genuinely hard part: making the *smallest* counterexample feel fair and legible — canonical ordering plus a rendering that visually explains *why* it breaks the claim. Deterministic seeds so daily puzzles are shareable Wordle-style.

## v1 scope
- One domain: simple graphs up to n=7, precomputed iso classes
- ~10 predicates (connected, hasCycle, bipartite, mindeg>=k, |E|, planar-ish)
- Brute-force checker returning canonical-smallest counterexample
- Edit-count + domain-size scoring, one daily seed, share string

## Out of scope
- Real proof assistant / Lean export
- Infinite or large domains, SAT/SMT backends
- Multiplayer, accounts

## Risks & unknowns
- Is 'edit-golf on hypotheses' actually fun or just fiddly? Needs playtest
- Legibility of counterexamples for non-mathematicians
- Domain size vs. brute-force latency (7 nodes is the ceiling before precompute balloons)

## Done means
A player loads the daily puzzle, edits a false claim, hits RUN, sees an animated smallest counterexample, iterates to a valid non-vacuous claim, and gets a shareable score string — all client-side, checker returning under 200ms on n<=7.
