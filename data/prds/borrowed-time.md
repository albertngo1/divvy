## Overview
A browser puzzle game that teaches Rust's ownership and borrowing rules as a spatial heist, for programmers who've been beaten up by the borrow checker and for curious non-coders. Sparked by the Ante post (blending borrowing and reference counting) — instead of reading the rules as compiler errors, you *feel* them as keys, copies, and closing doors.

## Problem
The borrow checker is famously unintuitive because it's only ever experienced as red text after the fact. Learners never build a physical intuition for "one mutable borrow XOR many shared borrows" or for lifetimes. The rules are simple and spatial; the teaching is abstract and punitive.

## How it works
Each level is a grid of nested rooms — rooms are scopes. You own glowing resource objects. To open a door you present a key derived from an object: either the single **master key** (a mutable borrow) OR any number of **photocopies** (shared borrows) — but never both against the same object at once. Objects carry a lifetime bracket tied to the scope that created them; when that scope closes, any copy still in play becomes a **dangling** key and the level fails ("use after free"). You can also *move* an object to a new owner, after which the previous owner can't touch it. Route all keys to their exits before scopes collapse.

## Technical approach
TypeScript with a deterministic entity model; levels authored in JSON. Each object is `{id, ownerScope, lifetimeScope, borrows: [{kind: 'mut'|'shared', holder}]}`. A tiny rule engine — literally a miniature borrow checker — evaluates the win/lose condition every tick: enforce aliasing-XOR-mutation and lifetime containment. Render as a DOM/Canvas grid (Pixi if it grows). The genuinely hard part is *level design*: crafting boards whose only solution requires the real borrow rules, so the game teaches the concept rather than merely decorating it.

## v1 scope
- 8 hand-authored levels
- One mechanic: master key vs. photocopies
- Lifetime countdown per scope with visible collapse
- Win/lose + a one-line "why you failed" (aliasing conflict vs. dangling)

## Out of scope
- Move semantics as its own mechanic (later)
- Level editor, multiplayer, threads/Send+Sync, generic lifetimes

## Risks & unknowns
Might instill a subtly wrong mental model. Puzzle design is the true workload and is hard to get "only-one-solution" clean. Classic fun-vs-pedagogy tension.

## Done means
A player who has never written Rust clears all 8 levels and, in a post-game prompt, correctly explains why you can't hold a photocopy and the master key of the same object simultaneously.
