## Overview
A browser puzzle game where you physically route "loans" of a resource through a warehouse without violating aliasing rules. For programmers who bounced off Rust's borrow checker and want intuition, plus people who just like tight logic puzzles.

## Problem
The borrow checker is taught as red compiler text, not as a feeling. People memorize "one mutable XOR many shared" and still get surprised, because they never built a spatial gut-sense of exclusivity and lifetimes. Sparked sideways by the Ante borrow-checking + RC post and time-rs on the GitHub feed.

## How it works
Each level is a grid. A crate (an owned value) sits somewhere. Workers (functions) each need access with a demand: `{mutability, duration, deadline}`. You draw conveyor paths (references) from crate to worker. Rule enforced every tick: a crate may be touched by **one red (mutable) path OR any number of blue (shared) paths** — never red-plus-anything at once. You stagger worker start times and path lengths so the exclusivity invariant holds through all ticks. A "move" tile relocates the crate (ownership transfer); afterward the old cell is dead, and any path still pointing there is a dangling reference that fails the level — with the *actual* rustc error shown as flavor text.

## Technical approach
Static site: TypeScript, a tiny ECS, SVG/canvas rendering. A level is JSON: grid, crate spawns, worker demands. Core algorithm is a discrete-tick simulator that checks two invariants — the XOR aliasing rule (interval-scheduling with mutual exclusion) and lifetime containment (no reference outlives its crate's move). The genuinely hard part is **level design**: mapping real lessons (reborrows, non-lexical lifetimes, split borrows of struct fields) onto satisfying spatial puzzles with a real difficulty ramp. Reward hook: each solved level transpiles to the minimal Rust snippet it represents, shown as "here's the code you just proved."

## v1 scope
- 8 hand-authored levels
- Tick simulator + XOR/lifetime validator
- Win/lose with the rustc-error flavor on dangling fails
- Post-win reveal of the equivalent Rust snippet

## Out of scope
- Level editor, procedural generation
- Mobile/touch tuning
- Other languages or ownership models

## Risks & unknowns
Might teach a caricature rather than the real checker. Interval-scheduling puzzles risk feeling dry — needs juice (data race = sparks and an explosion). Unknown whether the Rust→puzzle mapping stays honest past reborrows.

## Done means
A fresh player finishes levels 1–8 in under 20 minutes, and the final level's reveal snippet compiles clean under `rustc --edition 2021`.
