## Overview
Malpractice inverts react-doctor ('your agent writes bad React, this catches it'). Instead of catching bad code, you *author* it — the goal is to introduce the most damaging real anti-pattern into a component while keeping it green under an automated reviewer. A game for frontend devs who want to learn, viscerally, what linters and AI reviewers *miss*.

## Problem
Developers over-trust green checkmarks. AI reviewers catch the obvious (missing keys, stale closures) but wave through subtler rot — effects that double-fire, memo that lies, context that re-renders the world. There's no fun way to build intuition for the gap between 'passes review' and 'actually fine'.

## How it works
Each round hands you a small, correct component and a scoring reviewer. You edit it to inject a bug or anti-pattern. Two graders run: (1) the **Doctor** — an AI/lint pass that must say 'looks good'; (2) the **Coroner** — a hidden oracle (property tests + a rubric) that scores how *harmful* your change actually is (perf cliff, subtle incorrectness, memory leak). Max score = maximally harmful *and* undetected. A leaderboard of the sneakiest diffs; a 'reveal' panel explains why each survivor slipped through. Reverse mode: play the Doctor and try to catch community-submitted sabotage.

## Technical approach
Static export (Vite + React). The Doctor is a two-stage grader: eslint-plugin-react-hooks + a Claude call scoring the diff for 'would a reviewer approve this?' The Coroner runs the component headless in a jsdom/React Testing Library harness with instrumented render counts, effect-fire counters, and property assertions per puzzle — harm score derived from measured render blowups, assertion failures under specific prop sequences, etc. Puzzles are JSON: base component, prop-sequence fuzzer, harm rubric. Hardest part: making the AI Doctor stable and non-gameable — cache verdicts, constrain diffs to a small edit budget, and pin the model/prompt so scores are reproducible across players.

## v1 scope
- 6 curated components with harm rubrics + prop fuzzers
- Doctor grader (lint + one pinned LLM verdict, cached)
- Coroner harm score with a reveal explanation
- Local leaderboard of highest harm-that-passed

## Out of scope
- Reverse (play-the-Doctor) mode
- User-submitted puzzles / accounts
- Frameworks beyond React

## Risks & unknowns
- LLM grader nondeterminism could make scores feel unfair — caching + pinning is essential
- Cost per LLM verdict; may need a cheap heuristic pre-filter
- Narrow audience (React devs); replay value depends on puzzle quality

## Done means
A player opens a puzzle, edits the component, gets a green Doctor verdict but a high Coroner harm score, and reads a reveal explaining exactly which anti-pattern they smuggled past review — all reproducible on reload.
