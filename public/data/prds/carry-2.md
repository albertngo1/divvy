## Overview
Carry is a browser puzzle game about the open question on HN's front page: nobody knows the fastest way to multiply. Each level hands you two numbers (or two small matrices) split into limbs and a scarce budget of *multiply* gates. You wire linear combinations of the inputs into each gate, then linear combinations of the products out to the answer digits. Win by computing the correct product using fewer multiplications than the schoolbook n². For puzzle-heads, math teachers, and anyone who liked SpaceChem.

## Problem
Fast-multiplication algorithms (Karatsuba's 3 sub-mults instead of 4, Strassen's 7 instead of 8, Gauss's 3-real-mult complex product) are taught as magic formulas you memorize. There's no place to *feel* the discovery — to fiddle until 4 multiplies collapse into 3 and understand *why*.

## How it works
The board is a dataflow DAG. Nodes: input limbs (a0,a1,b0,b1…), scalar-multiply, add/subtract, a limited pool of *multiply* nodes (the only expensive resource), and output taps. You drag wires; the answer digits must equal the true product. Par = the best known mult count. Beat par and you've literally derived a real algorithm. A daily seeded puzzle plus a campaign that climbs: 2-limb integers → complex numbers (Gauss) → 2×2 matrices (Strassen) → 3×3. Wordle-style shareable "solved in 3 mults 🟩".

## Technical approach
React + Vite, no backend. The genuinely hard part is *verifying* an arbitrary player circuit is correct for ALL inputs, not just examples. Solve it symbolically: treat each input limb as a formal indeterminate, evaluate the DAG as multivariate polynomials over ℤ, and check the output polynomials are identical to the target product polynomial. For speed, use Schwartz–Zippel: evaluate both over random points in a large prime field GF(p) a dozen times — mismatch means wrong, all-match means correct w.h.p. Data model: nodes {id,type,coeffs,inputs}, scored by count of type==multiply. Level defs are JSON (limb count, ring, par). Optional solver-checker validates that pars are actually achievable at authoring time.

## v1 scope
- Drag-wire DAG editor with the six node types
- Symbolic + finite-field correctness check
- 8 hand-authored levels ending at Strassen 2×2
- Mult-count score, par display, share string

## Out of scope
- Multiplayer / global leaderboard
- Continuous/real-coefficient rings (stick to integer/rational)
- Auto-solver that finds optimal circuits for you

## Risks & unknowns
- UI for wiring DAGs is notoriously fiddly; may need a snap-grid palette instead of freeform wires
- Strassen is genuinely hard — pacing must ramp or players bounce
- Finite-field check has tiny false-positive prob; mitigate with multiple primes

## Done means
A player can load the 2×2 matrix level, wire a 7-multiply solution, watch the checker confirm it against 20 random GF(p) trials, get a green share string — and the same board rejects any 6-multiply attempt as incorrect.
