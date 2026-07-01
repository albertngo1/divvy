## Overview
Dialect is a browser game that makes Stroustrup's Rule playable: a shared toy programming language drifts across 'eras' as the community (or you, solo/async) votes each construct terser or more explicit, and every era you must solve a coding puzzle in whatever the language has become. For programmers who argue about syntax and language nerds.

## Problem
Stroustrup's Rule — 'for new features people want explicit syntax; for established ones they want terse' — is a great armchair observation nobody has ever *felt*. Dialect turns that tension into a knob you keep turning, and lets you live with the consequences.

## How it works
The language starts deliberately verbose (long keywords, mandatory braces, explicit types). Each round surfaces one construct and asks the player pool to vote: 'keep explicit' or 'make terse.' The winning vote mutates the grammar. Then comes a puzzle — write a short program that passes hidden tests *in the current grammar*. As the dialect drifts terser, readability degrades and old fossilized snippets stop parsing; you feel the tradeoff in your hands. A 'fossil record' timeline shows the language's whole evolutionary history.

## Technical approach
TypeScript + React. The core is a reconfigurable parser — a hand-rolled Pratt parser (or runtime-generated peggy grammar) with swappable token and rule tables, so grammar mutations are just data. A tiny tree-walking interpreter runs puzzle programs against test cases. State (current grammar + vote tallies) lives in localStorage for solo play, or a small server for shared eras. Data model: `Grammar {constructs: {id, form: 'explicit'|'terse', tokens[]}}`, `Fossil {era, grammarSnapshot, sampleProgram}`. The genuinely hard part is keeping the data-driven grammar unambiguous: every proposed mutation must be checked so it can't create a parse conflict, and ambiguity-inducing votes get rejected with an explanation.

## v1 scope
- Solo mode (localStorage)
- 8 mutable constructs (keyword length, optional semicolons, braces vs indent, explicit vs inferred types, etc.)
- 5 puzzles with a tree-walking interpreter
- Fossil-record timeline

## Out of scope
- Real multiplayer servers / live voting rooms
- Arbitrary user-defined syntax
- A type system or real compilation

## Risks & unknowns
- Grammar ambiguity from mutations is the central technical risk
- Niche appeal
- Puzzles must be fun, not syntactic busywork

## Done means
A player votes a construct terser, re-solves a puzzle written in the new syntax that passes its tests, and sees the change recorded in the fossil record; a mutation that would make the grammar ambiguous is detected and blocked with a readable reason.
