## Overview
Loanword is a browser puzzle game for programmers and language nerds. Each level hands you an input string and a target string; you must transform one into the other by authoring an ordered ruleset in a stripped-down dialect of Unicode's UTS-35 transliteration syntax (`a > b;`, context brackets `{ }`, before/after anchors, variables). The twist the whole game rests on: this rule language is Turing-complete, so early levels feel like find-and-replace and late levels are you hand-building a binary incrementer, a tape machine, or a parity checker out of nothing but rewrite rules.

## Problem
Zachtronics-likes are beloved but rare, and almost none use a *real* substrate — they invent a fake ISA. Meanwhile the lobsters post 'Unicode's Transliteration Rules Are Turing-Complete' is a jaw-dropper nobody can *do* anything with. Loanword turns that trivia into a playable computer.

## How it works
Core loop: read the spec, write rules in the left editor, hit Run. A deterministic engine applies rules top-to-bottom, re-scanning from the top after any match (classic rewriting semantics), and animates each rewrite as a highlight sweep across the string so you watch your 'program' execute. You win when output equals target across ALL hidden test strings, not just the shown one — forcing general solutions. Scored on rule count and total rewrite steps, with per-puzzle histograms Zachtronics-style. A 'transliterate a made-up script' campaign teaches the syntax; a 'compute' campaign (increment, reverse, sort three tokens, match balanced brackets) is the meat.

## Technical approach
Stack: TypeScript + a hand-written rule interpreter (do NOT shell out to ICU — you need step instrumentation and sandboxing). Model a rule as `{before, from, after, to, revisit}`; the engine is a fixed-point loop with a step budget to kill infinite loops. Editor is CodeMirror 6 with a custom grammar + lint. Puzzles are JSON: `{input, hiddenTests[], goal, ruleBudget}`. The genuinely hard part is (a) designing a rule subset that's expressive enough to be Turing-complete yet teachable, and (b) an anti-cheese test-set generator so players can't hardcode the visible case. Solution verification = run player rules against all hidden tests under the step cap.

## v1 scope
- 12 hand-made puzzles across 2 campaigns
- Rule editor with syntax highlight + run/step/reset
- Animated rewrite visualization
- Rule-count + step-count scoring, local best
- Shareable solution permalink (rules encoded in URL)

## Out of scope
- Full UTS-35 conformance (transforms, filters, ID reversal)
- Global leaderboards / accounts
- User-authored puzzle sharing
- Mobile editing

## Risks & unknowns
- Rewriting semantics can be confusing; needs a crisp mental model or players bounce
- Difficulty cliff between 'replace' and 'compute' is real — needs a gentle ramp level
- Infinite-loop detection UX (show budget exhausted, not a freeze)

## Done means
A fresh player can solve the first 3 puzzles unaided, the 'binary increment' puzzle is solvable and its intended solution passes all hidden tests, and a shared permalink reconstructs someone else's ruleset exactly.
