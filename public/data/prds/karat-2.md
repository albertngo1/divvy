## Overview
Karat is a browser puzzle game for people who love Zachtronics-y optimization and half-remember that multiplication has a rich algorithmic underbelly. Each level hands you two large numbers to multiply and a canvas of wiring blocks; you win by producing the correct product, then keep grinding to minimize the number of *scalar* (single-digit-block) multiplications used.

## Problem
The Scientific American piece 'mathematicians still don't know the fastest way to multiply' points at a gorgeous, under-toyed space: Karatsuba, Toom-Cook, Schönhage–Strassen. Nobody has made you *feel* why splitting a number into limbs and reusing partial products is clever. Schoolbook long multiplication is O(n²) busywork; the beautiful part is hidden behind notation.

## How it works
A number is drawn as a row of base-B limbs. You place SPLIT nodes (cut a number into high/low halves), ADD/SUB nodes, SHIFT nodes (multiply by B^k, free), and MUL nodes (the only scored operation — each consumes two limb-width values and costs 1). Wires carry limb-vectors. The schoolbook solution needs n² MULs; if you discover that (a·B+b)(c·B+d) can be done with three MULs instead of four by computing (a+b)(c+d) and subtracting, you've hand-built Karatsuba and the level's par drops. Later levels have three-way splits (Toom-3), forcing you to invent the interpolation trick. A daily seeded puzzle with a par score and an emoji share ('Karat ▮▮▯ 5 MULs, par 5').

## Technical approach
Pure client-side TypeScript + a canvas/SVG node editor (React Flow or hand-rolled). The core is a small dataflow interpreter over BigInt limb-vectors: each node is a pure function, the graph is topologically evaluated, MUL nodes increment a counter. Correctness is checked against `a * b` in BigInt. The genuinely hard part is *level design that teaches*: generating operand sizes and base B so that the intended trick (2-way, 3-way, negative-coefficient interpolation) is the natural optimum, plus a validator that the player's graph is acyclic and actually general (test against several random operand pairs of that shape, not just the displayed one, so hardcoding fails). Par scores precomputed offline by a small search over known decompositions.

## v1 scope
- Node editor with SPLIT / SHIFT / ADD / SUB / MUL, BigInt evaluation
- 8 hand-authored levels ramping schoolbook → Karatsuba → Toom-3
- MUL counter, par display, win check against multiple random operand pairs
- Date-seeded daily + emoji share string

## Out of scope
- Schönhage–Strassen / FFT multiplication (way too big for a node graph)
- Multiplayer, accounts, mobile-optimized touch editing
- Continuous-value or floating-point arithmetic

## Risks & unknowns
- Node-graph UX can feel fiddly; may need snap-to-grid and auto-routing
- Teaching interpolation (Toom-3's evaluate/pointwise/interpolate) without a wall of math is the real design risk
- 'Multiply by shift is free' framing must be airtight or optimal-MUL scoring breaks

## Done means
A player can open the daily, drag nodes to correctly multiply two 4-limb numbers, and independently reach the 3-MUL Karatsuba solution; the validator rejects a graph that only works for the displayed operands; par and share string render.
