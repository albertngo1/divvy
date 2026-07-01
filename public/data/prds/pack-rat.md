## Overview
Pack Rat is a browser puzzle game where you compress data by hand. UPX (trending) shrinks executables automatically; Pack Rat makes you do the shrinking yourself, turning LZ-style compression into a spatial hunt for patterns. Each level is a block of bytes/text; your job is to describe it more briefly than it describes itself. For programmers, CS students, and puzzle folk who like Zachtronics-flavored 'do the algorithm by hand' games.

## Problem
Compression is foundational and invisible — everyone uses gzip, nobody feels it. Existing explainers are static diagrams. Pack Rat gives you the *aha* of spotting a repeat and reusing it, and the competitive itch of trying to beat gzip's ratio with human pattern-recognition.

## How it works
A level shows a string like `ABABABCABABABC`. You have two tools: (1) Dictionary — select a substring, promote it to a reusable token; every occurrence collapses into a colored chip. (2) Back-reference — LZ77-style, point a run at an earlier identical run ('copy 6 bytes from 8 back'). Your 'size' is tokens + dictionary cost + literals, shown live. The goal is to get under a par size; a stretch goal beats the ratio a real gzip pass achieves on the same input. Later levels add costs that force tradeoffs (long dictionary entries are expensive, so short frequent patterns win) and inputs where the greedy choice is a trap.

## Technical approach
Pure frontend, TypeScript + canvas/DOM. Model: input as `byte[]`; player edits produce a `Program[]` of ops `{Literal(bytes) | Dict(id) | BackRef(dist,len)}`; a scorer computes encoded size with an explicit cost model (dict entries amortized). A verifier *decodes* the program and asserts it reconstructs the input exactly — non-negotiable correctness gate, and the genuinely hard/fun part is a clean, honest cost model that mirrors real LZ so 'beat gzip' means something. Ship a real gzip baseline via the browser `CompressionStream('gzip')` API to compute the target ratio per level. No backend; levels are static JSON, progress in localStorage.

## v1 scope
- Two tools: dictionary token + back-reference
- Live size counter + par threshold
- Decoder-verifier ensuring lossless reconstruction
- ~8 hand-designed levels + gzip baseline via CompressionStream

## Out of scope
- Huffman/entropy-coding stage (v2)
- Binary file import
- Leaderboards / accounts
- Auto-solver hints

## Risks & unknowns
- Cost model must feel fair, not arbitrary — key design risk
- Hand-compression may get tedious on large inputs; keep levels small
- 'Beat gzip' may be impossible on some inputs — tune targets to be reachable

## Done means
A player can compress all 8 levels, the decoder verifies every solution reconstructs the original exactly, the live size counter matches the decoder's accounting, and at least 3 levels are solvable to under the displayed gzip baseline.
