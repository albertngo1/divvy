## Overview
A browser puzzle game for programmers in which you play the symbol table of a single-pass C parser. Each level is a short token stream and a target parse tree; you win by choosing which identifiers are `typedef`'d types, because in C that single bit is what decides whether `(A) * b;` is a cast of a dereference or a multiplication, whether `foo(x);` declares a variable or calls a function, and whether `sizeof (A) - 1` groups the way you think. No backtracking: the parser commits at every fork, exactly like the real thing.

## Problem
C's type/identifier ambiguity — the "lexer hack" — is famous, weird, and taught only as trivia. It is also a genuinely great puzzle substrate: a tiny rule set, a huge combinatorial space, and an instant, unarguable win condition. Nobody has made a game out of the moment a compiler has to guess.

## How it works
Each level shows (a) a token stream lifted from real C, (b) a target AST drawn as nested boxes, and (c) a budget of typedef slots. You toggle identifiers between "type" and "value" and, in later levels, insert a `typedef` line at a chosen position so it only takes effect for tokens after it. Press Parse: an animated cursor walks the stream left-to-right with one token of lookahead, building boxes. Wrong shape, or a syntax error, and you see exactly which token forked the wrong way.

Run structure is light-roguelike: a run is a "translation unit" of 6–8 hunks. Clearing a hunk grants a card — a new typedef name, a `#define`, or a `#if 0` that lets you delete tokens. The last hunk of each run is a Twin: build a stream that produces two *different* valid ASTs depending on one typedef, and prove it.

## Technical approach
TypeScript + Canvas, no backend. Hand-written recursive-descent parser (~700 lines) over a C subset — declarations, declarators, casts, `sizeof`, calls, binary ops — with an explicit scoped symbol table and exactly one token of lookahead. That same parser is the game engine, the solution verifier, and the puzzle generator's oracle.

Puzzle generation runs offline: take snippets from real headers (musl, SQLite amalgamation, Lua) via tree-sitter-c to pick well-formed spans, enumerate the ≤2^n subsets of ambiguous identifiers, parse each with the engine, and keep spans where ≥3 distinct subsets yield distinct ASTs and the target requires a non-obvious combination. Ship the survivors as a static JSON level pack with a precomputed difficulty = minimum toggles to reach target.

Hard part: generating puzzles that are hard but fair. Most subsets produce parse errors, not interesting alternate trees; the yield from raw corpus mining will be low and needs a mutation pass (inserting `*`, parens, and `sizeof` around candidate spans) to manufacture forks.

## v1 scope
- 12 hand-authored levels, one mechanic: toggle identifiers as type/value
- Animated left-to-right parse with box-tree output
- Failure shows the forking token and both possible readings
- Share-a-level permalink (level encoded in URL hash)

## Out of scope
Preprocessor cards, scopes/shadowing, C++ most-vexing-parse levels, accounts, sound.

## Risks & unknowns
Audience is narrow (people who find `(a)*b` funny). Corpus mining may not yield enough levels, forcing hand-authoring. The parse animation must be readable at a glance or the puzzle feels arbitrary.

## Done means
A stranger who knows C can open the URL, clear all 12 levels without instructions, and correctly explain afterwards why `A * B;` is ambiguous.
