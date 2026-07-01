## Overview
Falsify is a daily browser puzzle about the actual skill of science: not gathering data, but designing the *decisive* experiment. Each day you face two plausible hypotheses about a hidden toy world and a small budget of measurements. You win by spending as little as possible to guarantee one hypothesis is refuted. For puzzle nerds, science teachers, and anyone who liked Zendo.

## Problem
People consume science passively as settled facts. The craft — designing an experiment whose outcome *distinguishes* competing theories — is invisible and never practiced. 'Claude Science'-style tools automate the search; Falsify makes the human feel the reasoning by making it a game.

## How it works
You're shown a scenario ('a hidden function maps inputs to outputs') and two hypotheses H1 and H2 that agree on most inputs but disagree somewhere. You have a menu of experiments, each with a cost (query a value, run a titration, measure at temperature T). You pick experiments; the world answers truthfully. The moment your observations are inconsistent with H1 *or* H2, you've falsified it — the puzzle is to reach that with minimum spend. A par score (the optimal-cost experiment set) is precomputed. Daily seed = same puzzle for everyone, with a shareable no-spoiler score grid.

## Technical approach
Stack: pure client-side TypeScript + Vite, no backend; daily seed derived from the date so everyone gets the same board. Each puzzle is a generated pair of hypotheses represented as small pure functions or truth tables over a finite input domain (e.g. Boolean circuits, monotone functions, or reaction rules). Generator: sample a hidden ground-truth model, derive H1=truth, then mutate it minimally to get H2 that agrees everywhere except a small 'discriminating set'. Experiments are queries into the domain with assigned costs. Par = solve the set-cover/min-cost problem 'cheapest experiment subset whose outcomes are guaranteed to separate H1 from H2' via brute force over the finite domain (the genuinely hard part: guaranteeing distinguishability worst-case, not just on the realized answer). Store nothing server-side; scores live in localStorage.

## v1 scope
- One puzzle family: hidden Boolean function of 3–4 variables, two candidate formulas
- Fixed per-query cost, min-query par precomputed by brute force
- Daily seed + shareable emoji score row

## Out of scope
- Accounts, streaks, global leaderboards
- Continuous/noisy experiments and statistics
- Multiple puzzle domains at launch

## Risks & unknowns
- Generating puzzles that are *interesting* (non-trivial, single clean insight) not just solvable
- Communicating 'guaranteed falsification' vs 'lucky answer' clearly in UI
- Difficulty curve tuning without playtesters

## Done means
Opening the page on two different days yields two different solvable puzzles; submitting the known par-optimal experiment set is accepted as a win, and a strictly cheaper set is proven impossible by the generator's checker.
