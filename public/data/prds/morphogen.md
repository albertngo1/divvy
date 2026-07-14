## Overview
Morphogen is a Zachtronics-flavored puzzle game about *morphogenetic* computing: instead of hand-placing logic gates, you author local growth rules and a single seed, and the circuit grows itself on a grid until it stops. Then a deterministic tester checks whether the grown thing computes the target function. For programmers and puzzle nerds who've done every gate-placement game and want a genuinely different axis of difficulty.

## Problem
Every circuit/automation puzzle game — from TIS-100 to Turing Complete — is about *placement*: you put the pieces exactly where you want them. That's satisfying but well-mined. The HN 'MorphoHDL: growing circuits' post points at an unexplored space: what if you can't place anything, and must instead design the *rules that build the thing*? Indirect control is a fresh, brain-melting puzzle vocabulary that no game has really turned into levels.

## How it works
Each level gives a spec (a truth table, e.g. a 1-bit full adder) plus fixed input pads and output pads at grid edges. You write a small rule set: each rule is a local pattern → action (grow a wire/gate cell in a direction, differentiate a cell into AND/OR/NOT, halt) keyed on a cell's state and neighbors — like an L-system meets Conway. You press Grow; the seed replicates outward, cells differentiate, and after it stabilizes the resulting static circuit is simulated against the truth table. Success = all rows correct. Scoring rewards fewer rules, fewer cells, and faster growth — so mastery is finding the *minimal generative program* for a circuit, not the circuit itself.

## Technical approach
Browser game, TypeScript + Canvas/WebGL, no backend. Two engines: (1) a deterministic **growth CA** — synchronous rule application per tick with fixed conflict-resolution ordering so the same rules always yield the same organism; (2) a standard **combinational simulator** over the frozen cell graph to evaluate the truth table. Level format is JSON (spec + pad layout + cell-type palette). The hard parts: designing a rule language expressive enough to grow adders/multiplexers yet small enough to reason about, and **puzzle authorability** — guaranteeing each level is solvable and interesting, likely via a solver that BFS/beam-searches rule sets so I can certify a par solution exists before shipping a level.

## v1 scope
- Grid CA + rule editor (5–6 rule slots)
- ~8 hand-made levels: wire, NOT, AND, half-adder, 2:1 mux
- Deterministic grow → freeze → truth-table check with pass/fail
- Cell-count + rule-count score

## Out of scope
- Sequential/clocked circuits, feedback loops
- Level editor / sharing
- Sound, story, leaderboards

## Risks & unknowns
- Rule language might be too weak (nothing grows) or too fiddly (nothing intuitive) — needs playtesting the primitive set
- Non-determinism from tick ordering must be airtight
- Fun-to-difficulty curve of indirect control is unproven

## Done means
A player can solve the half-adder level using only growth rules (never placing a cell directly), the grown circuit passes all 4 truth-table rows deterministically on repeated grows, and the game reports a rule/cell score against a verified par.
