## Overview
Cache Line is a browser puzzle game about memory layout. Each level hands you a struct's fields (types, sizes, and which threads touch them) and a goal; you drag and reorder fields to minimize total size, eliminate wasted padding, and prevent false sharing between concurrently-mutated fields. It's a tiny, mean, educational Zachtronics-alike for systems programmers.

## Problem
Field ordering, alignment padding, and false sharing are exactly the kind of low-level performance lore that engineers read about (the '128-byte alignment', 'signed by default', Odin-1.0 systems chatter) but rarely get to *feel*. There's no playful way to build intuition for why `struct { bool; u64; bool; }` wastes bytes or why two hot atomics on the same cache line tank throughput.

## How it works
1. A level shows a memory ruler divided into 64-byte cache lines and a palette of fields with sizes and alignment requirements.
2. You place fields in order; the game live-renders padding gaps, straddle penalties, and total footprint.
3. Fields are tagged by which thread writes them; if two different-thread hot fields land on the same cache line, a 'false sharing' meter lights up and your simulated throughput score drops.
4. Levels escalate: cache-line-aligned hot fields, packing cold fields together, respecting alignment while minimizing size. Par scores and a shareable result string per daily puzzle.

## Technical approach
Stack: pure client-side TypeScript + a canvas/SVG board, no backend for v1. Core is a deterministic layout simulator: given an ordered field list, compute offsets by applying each type's alignment, sum padding, count straddled cache lines, and evaluate a false-sharing cost = (pairs of cross-thread hot fields sharing a line). The 'throughput' number is a simple analytic model, not a real benchmark — enough to be legible and gameable. Daily puzzles are date-seeded from a generator that samples field sets with a known optimal packing (solved by a small branch-and-bound so we can compute par). The genuinely hard part is authoring puzzles whose optimum is non-obvious but provable, so the par score is honest.

## v1 scope
- 12 hand-tuned levels + layout simulator
- Padding + size scoring with live board feedback
- False-sharing meter for two-thread levels
- Shareable result string

## Out of scope
- Real compiler/ABI accuracy across platforms
- Multiplayer or global leaderboard
- Actual benchmark execution
- Union/bitfield puzzles

## Risks & unknowns
- Balancing realism vs. fun — real ABIs are fiddly; simplify honestly
- Teaching value depends on clear feedback, not just numbers
- Narrow audience (systems programmers); needs to be genuinely delightful to spread

## Done means
A player can complete a level by reordering fields to hit par size with zero false sharing, the simulator's offsets match a hand-computed C-struct layout for the same fields, and a daily puzzle produces a shareable result.
