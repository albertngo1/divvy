## Overview
Setun is a programming puzzle game (a 'zachlike') about balanced ternary. You write short concatenative stack programs to transform, pack, and unpack ternary data, optimizing for the fewest operations and shortest code. It's for people who love SpaceChem, Exapunks, and the itch of a leaderboard that says your solution was 3 ops too long.

## Problem
Two feed items collided: 'How to pack ternary numbers in 8-bit bytes' (3^5 = 243 < 256, so five trits fit in a byte) and a tutorial on Joy, a concatenative language. Bit-twiddling puzzles almost always live in binary; nobody makes you *think in threes*. Balanced ternary (digits -1/0/1) has gorgeous properties — negation is free, rounding is trivial — that never get a playground. The itch: give me a weird, self-consistent computer and dare me to be clever.

## How it works
Each level presents an input tape of balanced-ternary words and a target output tape. You write a program in a minimal concatenative language — words like `dup swap roll neg add mul3 trit-in byte-pack byte-unpack` operating on a data stack — that transforms input to output. The VM is balanced ternary end to end: registers hold trytes, arithmetic wraps in balanced-ternary, and the marquee puzzle family is packing/unpacking five trits per byte and back losslessly. Levels escalate: sign detection (free in ternary!), ternary-to-decimal display, a tiny ternary adder, run-length packing. You're scored on two axes — instructions executed (speed) and program length (size) — with histograms vs other solutions. A 'campaign' threads a light narrative of rebuilding the lost Setun mainframe.

## Technical approach
Browser game, TypeScript + a canvas/SVG board, no backend for v1. Core is a ~300-line balanced-ternary VM: values stored as arrays of {-1,0,1}, plus pack/unpack to the 0–242 byte encoding. The concatenative interpreter is a simple stack machine over ~25 words; each word has a cost. A deterministic simulator steps the program and diffs output against the target, animating the stack. Puzzles are hand-authored JSON (input tape, expected output, allowed word set, op/size par). The genuinely hard part is *validating* puzzles are solvable within the given word set and generating fair pars — done by writing a reference solution per level and computing pars from a small brute-force search over short programs.

## v1 scope
- Balanced-ternary VM + 25 words
- 8 hand-authored levels ending in five-trits-per-byte pack/unpack
- Stack animation + pass/fail diff
- Local op-count & length score, no cloud histogram

## Out of scope
- Multiplayer / global leaderboards
- Level editor
- Sound, story cutscenes
- Non-ternary bonus worlds

## Risks & unknowns
Audience is niche (zachlike ∩ ternary nerds). Concatenative programming has a learning curve — needs a gentle first three levels. Par-setting via brute force may be slow for larger word sets.

## Done means
A player can open the page, read the tutorial, and solve the pack-five-trits-into-a-byte level with a working program, seeing their op count and length scored against the par — all client-side.
