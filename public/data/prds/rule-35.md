## Overview
Rule 35 is an esolang puzzle game built entirely on a delightful fact from the lobsters front page: **Unicode's transliteration rules (UTS #35) are Turing-complete.** You play a 'linguistics engineer' who must transform input strings into target outputs by authoring ordered rewrite rules — and by the late game you'll have accidentally built an adder, then a counter, then a whole state machine, out of pure text substitution. For programmers and puzzle nerds who loved TIS-100, Exapunks, and A=B.

## Problem
Esolangs are fascinating but have no on-ramp; you read a blog post, go 'huh, neat', and never touch them. There's no guided, level-by-level game that turns 'string rewriting is Turing-complete' into a series of aha moments. Meanwhile the actual CLDR transliteration syntax is real, obscure, and genuinely powerful — perfect raw material nobody has gamified.

## How it works
Each level gives you a set of input→expected-output pairs. You write an ordered list of rules in a simplified CLDR-style syntax: `context { match } after → replacement ;` with support for variables, before/after context, and cursor repositioning. The engine applies rules top-to-bottom, repeatedly, until a fixed point — exactly like the real transliteration passes. Early levels are gentle (romanize a fake alphabet). Middle levels demand context sensitivity (double every 'b' but only between vowels). Endgame levels are computation in disguise: 'given a unary number of ●, output ● if even', which forces you to invent a two-state scanner using contexts as memory. A step-debugger shows each rule firing and the cursor walking the string. Solved with fewer rules / fewer passes = better score, leaderboard-style.

## Technical approach
Stack: TypeScript, browser-only. The core is a faithful-enough interpreter of a *subset* of UTS-35 transform rules: a tokenizer for the rule DSL, a rule table with variable expansion, and an application loop that does leftmost context-matched rewriting with explicit cursor semantics (the tricky part — real CLDR moves a conversion cursor and only re-scans forward, which is what makes it Turing-complete rather than mere regex-replace). Levels are static JSON with input/output pairs and a hidden held-out test set to prevent hard-coding. The genuinely hard part is designing the DSL subset: expressive enough to be Turing-complete and to make the computation levels solvable, but small enough that error messages are teachable. Validation runs the player's rules against held-out inputs in a Web Worker with a step/iteration cap to catch infinite loops.

## v1 scope
- Interpreter for ~5 rule features (match, replace, before/after context, one variable set, cursor)
- 10 hand-authored levels ending in one real 'computation' puzzle
- Step debugger + pass counter
- Held-out test validation

## Out of scope
- Full CLDR compliance, Unicode normalization edge cases
- User-authored levels, accounts, cloud leaderboard
- Actual Unicode scripts (use invented glyphs to avoid IME pain)

## Risks & unknowns
- Cursor semantics are subtle; a wrong interpreter breaks Turing-completeness claims
- Difficulty cliff between 'string edit' and 'computation' levels
- Niche audience — needs a killer first 3 minutes

## Done means
A player can solve level 1 in under two minutes, the final level genuinely requires an iterative rewrite that computes a function on unbounded input, and the interpreter passes a test suite proving the documented rule features behave as specified.
