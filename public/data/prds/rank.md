## Overview
Rank is a browser puzzle game about thinking in whole arrays instead of loops. Each day you're given a small starting grid of numbers and a target grid, and a minimal set of array operators (reverse, rotate, scan, fold, filter, reshape, transpose). You write the shortest expression that turns one into the other. For programmers curious about k/q/APL but scared off by the syntax.

## Problem
Array languages (k, q, APL, BQN) are famously powerful and famously opaque; every intro post like "a new runtime for k and q" draws a crowd who want to learn but bounce off the terse glyphs. There's no low-stakes, gamified way to build the mental model of tacit, whole-array thinking. Meanwhile puzzle-golf fans (Zachtronics crowd) want fresh daily brain candy with a shareable score.

## How it works
The board shows source and target grids side by side. You compose a pipeline from a palette of ~10 operators, each with a friendly name and its array-language glyph shown beside it. The expression evaluates live, animating the intermediate grids so you *see* what `transpose∘reverse` does. Solve it, and you're scored on token count against a precomputed par. A date-seeded daily puzzle gives everyone the same board; you get a Wordle-style share string (`Rank #142 · 7 tokens · par 5`). Practice mode has unlimited random puzzles by difficulty.

## Technical approach
Pure client-side, no backend for v1. A tiny array interpreter in TypeScript over a single value type (nested numeric arrays) implementing ~10 primitives with correct rank/broadcasting semantics — this is the interesting core and the main bug surface. Puzzles are generated offline by a solver that applies random operator chains to a seed grid, records the result as the target, and BFS/IDDFS over the operator set to find the minimum-token solution (that's the par). Only puzzles with a unique-ish short solution and no trivial one-op answer are kept. Daily seed = hash of the date → deterministic puzzle. Rendering is plain canvas/SVG with a step-through animator. The hard part is (a) getting broadcasting/rank rules right so the interpreter matches real array-language intuition, and (b) tuning the generator so puzzles are elegant, not brute-forcey.

## v1 scope
- 8 operators, integer grids up to 4×4
- Live eval + step animation
- One date-seeded daily puzzle with par + share string
- Local-storage streak tracking

## Out of scope
- Accounts, global leaderboard server
- Float/character/nested-depth beyond 2
- Custom user-authored puzzles

## Risks & unknowns
- Generator may produce puzzles with multiple equally-short solutions, muddying "par."
- Too-terse operators could alienate the very beginners it targets; naming/labeling is delicate.
- Difficulty curve is hard to auto-tune.

## Done means
A new player solves three consecutive daily puzzles, the interpreter's output matches a reference k session on 50 random expressions, and the share string copies a spoiler-free result.
