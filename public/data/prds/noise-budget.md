## Overview

*Noise Budget* is a browser puzzle game about computing on data you are forbidden to see. You are handed encrypted inputs and a small palette of gates — ADD, MULT, ADD-CONST, MULT-CONST, ROTATE — and must build a circuit that produces the right encrypted answer. You never see a value. You never branch on one. For programmers, puzzle-game players, and anyone who has read a homomorphic-encryption paper and bounced off the math.

## Problem

Every puzzle game about programming teaches the same lesson: sequence, loop, branch. FHE inverts that lesson and nobody has made it playable. Under encryption, `if` does not exist, comparison does not exist, and *depth* — not instruction count — is the scarce resource. That constraint is a genuinely fresh puzzle grammar, and right now it lives only in cryptography papers.

## How it works

Each level states a goal in plaintext terms: "return the maximum of these 4 secret numbers," "return 1 if the secret is even," "sort 8 secrets." You wire a dataflow graph on a canvas. Two meters run while you build:

- **Noise**: every gate inflates the ciphertext error. ADD is nearly free; MULT roughly squares it. When noise crosses the threshold, decryption returns garbage and the level fails *silently* — you see a wrong answer, not an error.
- **Depth**: multiplicative depth is the level's par. Beat par and you unlock the *bootstrap* gate, which resets noise but costs a huge amount of the level's time budget.

The forced discoveries are the fun: comparison must become a polynomial; `if a>b` becomes `a*s + b*(1-s)` where `s` is a selector you computed obliviously; a sort becomes a fixed sorting network because a data-dependent one is impossible. Late levels add SIMD slot packing — one ciphertext holds 8 values, ROTATE is the only way to move between slots, and the elegant solutions are all log-depth rotate-and-fold reductions.

## Technical approach

Svelte + TypeScript, canvas node editor, no backend. The simulator does *not* need real FHE: model each ciphertext as `{plaintextValue, noiseLog2}` and apply the BFV/BGV noise-growth rules (add → max+1 bit; mult → sum of noise bits + a scale term tied to ring dimension). Plaintext values are computed in the clear internally and simply never rendered — the fiction is enforced by the UI, which is what makes it fast and deterministic. A verifier runs the player's circuit over ~200 randomized input vectors, so hardcoded answers fail.

Hard part: level design that teaches the polynomial-selector trick without a wall of text, plus calibrating noise constants so "correct but too deep" is a *frequent, legible* failure rather than a mystery.

## v1 scope

- 10 levels: identity, sum, dot product, is-zero, max-of-two, max-of-four, parity, select-by-index
- 5 gates, no bootstrapping, no SIMD packing
- Noise + depth meters, randomized verifier, par-depth badge
- Solutions shareable as a URL-encoded graph

## Out of scope

Real lattice crypto, key switching, multi-party, level editor, mobile layout.

## Risks & unknowns

The polynomial-selector leap may be too steep for non-cryptographers — mitigate with a scripted tutorial level. Silent noise failure could read as a bug; a post-mortem replay showing where noise crossed the line fixes it. Risk that fake noise feels arbitrary; publish the real BFV formulas in an appendix panel.

## Done means

A player who has never heard of FHE completes max-of-four using an oblivious selector, under par depth, without reading external material — and the shared URL replays their exact circuit.
