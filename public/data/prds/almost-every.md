## Overview
Almost Every is a browser explorable that renders the unit interval [0,1] as a physical field of points and marks which of them are *nameable* — rational, algebraic, or expressible in a small closed-form grammar. It's for anyone who has been told "almost all real numbers are non-computable" and never once seen what that means. Half explorable explanation, half toy.

## Problem
The measure-theoretic facts are taught as sentences: the rationals are countable, the algebraics are countable, the computable numbers are measure zero. Every visualization of the number line shows the *nameable* points, because those are the only ones anyone can plot — which quietly teaches the exact opposite of the truth. Nobody has built the view where naming runs out.

## How it works
A horizontal canvas shows a window [a,b], starting at [0,1]. Layers, each toggleable:
- **Rationals** by denominator bound, enumerated with the Stern–Brocot tree so only in-window mediants are expanded.
- **Algebraics** of degree ≤ d and height ≤ H, isolated in-window by Sturm sequences over integer polynomials.
- **Named constants** — a curated library of ~60 (π/4, 1/e, γ, ζ(3)−2, Feigenbaum, Champernowne, Liouville, Thue–Morse, lower bounds on Chaitin's Ω) plus their images under a few simple maps.

Zoom with the scroll wheel. A HUD reports the honest statistic: **fraction of screen pixels containing at least one nameable point**. At [0,1] it's ~100%; by 10⁻⁹ it's a few percent; keep going and you hit a black screen with a plate reading *nothing in this window has a name*.

The toy layer: click any pixel. The app iterative-deepens over an expression grammar (integers, + − × ÷, √, exp, log, π, e) ordered by description length, evaluating each candidate as an **interval** and pruning when the interval misses your pixel. It returns the shortest expression that provably lands there and its bit-length — or a certified "no name under 40 bits." Adjacent pixels come back with wildly different name lengths, which is Kolmogorov complexity you can feel with a mouse.

## Technical approach
TypeScript + canvas2D/WebGL2 front end; Rust→WASM core for the number theory. Beyond ~2⁻⁵⁰ doubles die, so the core switches to big-float (`rug`/MPFR-in-WASM) and to interval arithmetic — soundness matters, since "does this expression land in this pixel" must be *decided*, not inferred from rounding luck. Subexpression intervals are memoized per zoom level. Algebraic isolation runs in a worker, cancelled on pan.

## v1 scope
- Rationals + degree ≤ 2 algebraics + 20 named constants
- Doubles only, zoom capped at 10⁻¹⁵
- Expression search: 4 operators, 6 atoms, depth ≤ 5
- One nameable-pixel percentage in the HUD

## Out of scope
Complex plane, mobile gestures, proving non-computability of anything, user-submitted constants.

## Risks & unknowns
It might read as pretty-but-shallow dust; interval arithmetic in WASM may be too slow for interactive pan; expression search blows up combinatorially past depth 6; the nameable-pixel statistic depends on your enumeration bounds and needs to be presented honestly as such.

## Done means
A URL encodes a zoom window; loading it plots labeled points with the nameable-pixel percentage, and clicking any pixel returns either an expression whose certified interval lies inside that pixel or a "none under budget" verdict — with at least one shareable window where the percentage is under 1%.
