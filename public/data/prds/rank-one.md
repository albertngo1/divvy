## Overview
Rank One is a daily browser puzzle about the open question the Scientific American piece raised—nobody knows the fastest way to multiply. Each day you're handed a small bilinear product (e.g. 2×2 matrix multiply, or a specific integer/polynomial product) and must cover its multiplication tensor using as few rank-1 'multiply gadgets' as possible. For puzzle-heads who liked the 'design the circuit' feel of Zachtronics but want real mathematical bite.

## Problem
The idea that '2×2 matrix multiply needs only 7 multiplications, not 8' (Strassen) is one of the most delightful facts in CS, and almost nobody has felt it. Existing 'math games' are arithmetic drills. There's no toy that lets you rediscover bilinear-complexity tricks yourself, with a par to beat.

## How it works
The target is a 3-tensor T (the matrix-multiplication tensor, shown as a small grid of which output entries are sums of which input products). You build a solution by adding 'terms': each term is (a linear combination of A's entries) × (a linear combination of B's entries), and you assign it (via a third linear combination) into the outputs. Each term = one real multiplication; the linear combos are 'free' additions. You place terms one at a time; the board live-shows the residual—what's still uncovered—so you get feedback like a nonogram. Solve when residual is zero. Score = number of terms used; daily par is the known optimum (7 for 2×2). A 'you beat the naive 8!' celebration, streaks, and a share grid à la Wordle.

## Technical approach
Fully client-side, date-seeded daily puzzle (no server needed; deploy static). Represent everything over GF(2) for v1—coefficients are just 0/1, so a term is three bitmasks (which A-entries, which B-entries, which outputs) and verification is XOR of outer products against T, exact and fast with no floating-point pain. Data structure: T and the residual are bit-packed arrays; adding a term computes the induced rank-1 contribution (`for each output bit set, XOR in a_mask⊗b_mask`) and XORs into residual. UI in vanilla TS + canvas/SVG. The genuinely hard part is puzzle authoring: guaranteeing a stated par is actually achievable and ideally optimal—for tiny cases you can brute-force/ILP the minimal rank offline and bake the number in; over GF(2) the search space is bounded enough for a solver to certify small instances.

## v1 scope
- One puzzle type: 2×2 matrix multiply over GF(2)
- Add/remove terms, live residual, win detection
- Static par baked in (7), move counter, win screen
- Deterministic daily seed picking among a handful of hand-verified boards

## Out of scope
- Rings beyond GF(2) / real coefficients
- Arbitrary user-defined tensors
- Leaderboards / accounts

## Risks & unknowns
- Onboarding: explaining 'rank-1 term = one multiplication' to non-experts is the make-or-break
- Difficulty cliff—2×2 optimum (7) is hard to find cold; may need a tutorial ladder (2×2 with fewer entries first)
- Is GF(2) satisfying, or do players expect 'real' numbers?

## Done means
A playable daily board where a solver can input 8 naive terms and win, then find a 7-term solution and see a distinct 'beat par' state, with the whole thing certified correct by an offline check that the 7 terms XOR-reconstruct the 2×2 multiplication tensor exactly.
