## Overview
Karat is a browser puzzle game for programmers and math-curious tinkerers that turns 'how do you actually multiply two numbers fast' into a hand-built circuit you optimize. Sparked by the HN piece on how mathematicians *still* don't know the fastest way to multiply, it makes the open problem tactile: you don't read about Karatsuba, you discover it by shaving a multiply off a wiring diagram.

## Problem
Multiplication complexity (schoolbook O(n²) → Karatsuba O(n^1.585) → Toom-Cook → Schönhage-Strassen) is one of CS's most beautiful ladders, but it lives in textbooks as opaque algebra. There's no place to *feel* why splitting numbers and reusing partial products wins. Zachtronics proved people will grind optimization puzzles for hours; nobody has pointed that engine at arithmetic itself.

## How it works
Each level gives you two multi-'digit' operands (in some base) and a canvas of nodes: single-digit MULTIPLY blocks, ADD blocks, SHIFT (place-value) blocks, and wires. You assemble a network whose output must equal the true product for *all* test inputs. A verifier runs your circuit against randomized operands; pass and you unlock the histogram: your solve is scored on (a) number of MULTIPLY blocks used and (b) total gates. The schoolbook solution for 2-digit×2-digit needs 4 multiplies; the game quietly waits for you to find the 3-multiply Karatsuba trick, then congratulates you against a global leaderboard. Later levels scale digit counts and introduce recursion tokens so Toom-Cook becomes reachable.

## Technical approach
Pure client-side: React + a canvas/SVG node editor (React Flow works). The 'CPU' is a tiny dataflow interpreter over the node graph, evaluated on BigInt operands so correctness checking is exact. Verification = differential testing: run the player's graph and a reference multiplier on ~500 random operand pairs plus edge cases (zeros, max-digit carries); all must match. Op-count is a static graph traversal. Levels and their reference decompositions are authored as JSON; the genuinely hard part is designing the block set so the *optimal* known algorithm is expressible but not the obvious first thing you'd wire, and making place-value/carry handling feel like SHIFT+ADD rather than bookkeeping. Emoji share string (à la Wordle): `🔩🔩🔩 3/4 mults`.

## v1 scope
- Node editor with MULTIPLY/ADD/SHIFT blocks + wiring
- BigInt differential verifier
- 6 hand-authored levels ending at 3-multiply Karatsuba
- Per-level op-count histogram (local only)
- Wordle-style share

## Out of scope
- Recursion tokens / Toom-Cook / FFT levels
- Global leaderboard backend
- Non-integer or modular arithmetic

## Risks & unknowns
- Making SHIFT/carry intuitive without drowning players in place-value plumbing
- Whether the 'aha' of Karatsuba lands from the block set alone or needs a nudge
- Graph-editor UX on touch devices

## Done means
A player can wire a correct 2×2-digit multiplier, the verifier passes it on all test inputs, the op-count shows 4 multiplies, and after experimentation they can submit a passing 3-multiply solution and see it beat their prior score.
