## Overview
Toom is a Zachtronics-flavored daily puzzle about the open question behind the headline "mathematicians still don't know the fastest way to multiply." You build bilinear multiplication schemes (Karatsuba, Toom-Cook, and your own weirder inventions) and are scored on the one thing that actually matters asymptotically: the count of scalar multiplications. For programmers who like their games to be uncomfortably close to real research.

## Problem
Most people read the "fastest multiplication" article passively and move on. But the mechanic — trade cheap additions for expensive multiplications by splitting and interpolating — is a beautiful, hands-on puzzle almost nobody has ever played with. There's no toy that lets you *feel* why Karatsuba beats grade-school, let alone try to beat Karatsuba.

## How it works
You're given two numbers as base-B digit-polynomials of degree n (today's n is the daily target). You lay out a plan on a node canvas: (1) form linear combinations of the input coefficients (free), (2) declare a set of *pointwise products* — each one costs a point, (3) form linear combinations of those products to reconstruct every output coefficient (free). The engine verifies your scheme actually computes the product for all inputs, then scores you by product count. Grade-school for n=2 uses 4; find Karatsuba's 3 and the puzzle lights up; the leaderboard shows how deep the day's crowd got. Streaks, an emoji-share of your product count vs. the known optimum.

## Technical approach
Pure browser (TypeScript, no backend for play; serverless KV for the leaderboard). Inputs and outputs are polynomials over a field; a bilinear scheme is three matrices (A: input→left factors, B: input→right factors, C: products→outputs). Verification: the scheme is correct iff, for all i,j, the required coefficient of the convolution equals Σ_k C[out,k]·A[k,i]·B[k,j] — a finite set of polynomial identities. Check them exactly over the rationals, with a Schwartz–Zippel random-evaluation fast-path to reject broken schemes instantly before the exact confirm. Score = number of rows in the product stage (the pointwise multiplications). The genuinely hard part is a forgiving-but-sound authoring UI: let players express arbitrary interpolation points / linear combos without hand-writing matrices, while keeping verification exact and fast.

## v1 scope
- Fixed n=2 and n=3 daily puzzles
- Node UI: linear-combo builder → product declarations → output combiner
- Exact bilinear-correctness verifier + product counter
- Known-optimum reveal and emoji share

## Out of scope
- FFT/Schönhage–Strassen (large-n regimes)
- Carrying/actual big-integer arithmetic (stay symbolic)
- Multiplayer real-time

## Risks & unknowns
- The authoring model may be too abstract for non-mathematicians — needs a gentle tutorial (rediscover Karatsuba by hand).
- Verification edge cases over finite vs. rational fields.
- Small design space at low n may get "solved" by the community quickly; needs an n-ladder to stay fresh.

## Done means
A player can, in-browser, construct the 3-multiplication Karatsuba scheme for n=2, have the verifier confirm it's correct and score it 3, and see it beat the default grade-school 4 on the leaderboard.
