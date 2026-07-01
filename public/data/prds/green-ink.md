## Overview
Green Ink is a 1v1 competitive coding match for developers and CS students. It inverts the humble coverage report — normally a lonely quality metric — into a live territory battle. Given the same small, deliberately buggy JavaScript library, two players race to write tests; every source line their tests actually execute gets 'inked' in their color. Most territory at the buzzer wins.

## Problem
Code coverage is the most passively-consumed number in software: a percentage nobody looks at twice, a CI gate to clear and forget. Meanwhile, writing tests is a chore people avoid. Green Ink smuggles genuine test-writing skill (reaching branches, hitting edge cases, killing dead code) inside a competitive game where covering the tricky uncovered line is the whole thrill.

## How it works
Both players open the same ~150-line library (say, a tiny date parser or expression evaluator) in a split editor. A 90-second round runs. As you type tests, an instrumented runner re-executes on every save and streams back which line numbers your suite hit. Each hit line lights up your color in a shared gutter minimap. Lines you both cover are 'contested' and awarded to whoever covered them with fewer total assertions — rewarding surgical tests over blunt ones. Uncovered lines stay grey and are worth bonus points to whoever claims them first. A live scorebar shows territory split.

## Technical approach
Stack: Vite + React front end, a Node worker backend. Test execution runs in an isolated `worker_threads` sandbox (or `isolated-vm`) per player to prevent one player's `while(true)` from freezing the match. Coverage comes from `nyc`/istanbul's JSON output (`coverageData.statementMap` + `s` hit counts) or V8's built-in `Profiler.takePreciseCoverage` for speed. The server diffs each player's covered statement set, computes contested-line ownership by comparing assertion counts (parsed from the test AST via `@babel/parser` — count `expect(...)` calls), and pushes deltas over WebSocket. The genuinely hard part is sandboxing safely and fast: re-running an arbitrary test suite in <200ms while blocking filesystem/network and enforcing a CPU-time cap, so the ink feels real-time.

## v1 scope
- Single hardcoded target library, local hotseat (two editors, one screen)
- istanbul line coverage only; ink the gutter
- 90s timer, simple territory count, no contested-line tiebreak yet
- Vitest as the runner, no sandbox hardening beyond a timeout

## Out of scope
- Online matchmaking, accounts, ELO
- Branch/function coverage, multiple languages
- Anti-cheat against players who just paste the source into a string

## Risks & unknowns
- Sandbox escapes and infinite loops are the core danger; a naive timeout may not cover event-loop starvation
- The 'fewer assertions wins' rule may be gameable (one giant assertion); needs playtesting
- Coverage recompute latency could make ink feel laggy on large files

## Done means
Two people on one machine can play a full 90-second match on the bundled library, watch lines flip to their color in real time as they save tests, and see a correct final territory percentage — with a malicious `while(true)` test failing that player's round instead of hanging the app.
