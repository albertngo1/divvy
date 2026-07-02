## Overview
Sleeper Agent is a daily browser puzzle for programmers. Where a bounded model checker like CBMC proves code *correct*, Sleeper Agent asks you to do the mischievous opposite: given a working function and its passing test suite, insert the smallest, most innocent-looking mutation that breaks the real behavior while keeping the whole suite green. It's part Wordle, part 'this is why your tests are inadequate.'

## Problem
Every engineer has shipped a bug that sailed through a proud, all-green test suite. We rarely build intuition for *where tests are blind*. Mutation testing tools exist but are batch, boring, and CI-only — nobody plays with them. There's no fun, social artifact that trains the instinct for 'this test suite has a hole big enough to drive a truck through.'

## How it works
Each day you get one small function (10–25 lines) in JS/Python and its green test suite, both visible. You edit exactly one token — flip `<` to `<=`, change `+ 1` to `- 1`, swap `&&` for `||`, drop a `!`. Submit. The site runs the suite in-browser: if any test goes red, your mutation was too loud — try again. If it stays fully green *and* our hidden 'ground-truth' property tests catch that behavior actually changed, you win — you found a sleeper. You're scored on **subtlety** (character-distance of the diff) and **guesses**, with a Wordle-style shareable grid. A daily leaderboard ranks the sneakiest surviving mutation.

## Technical approach
Pure client-side. JS puzzles run in a Web Worker; Python runs via Pyodide. The daily puzzle is a signed JSON blob: source, the visible (weak) test suite, and a hidden property/oracle suite used only to confirm behavior *did* change. Mutations are validated by (a) tokenizing the diff to enforce the one-token rule, (b) running visible tests → must stay green, (c) running the hidden oracle → must go red. The hard part is authoring puzzles where a subtle surviving mutant provably exists — solved with an offline generator that runs a real mutation-testing pass (Stryker/mutmut style) and keeps only functions with at least one green-surviving, oracle-detectable mutant, ranked by author-set difficulty.

## v1 scope
- One JS puzzle per day, date-seeded
- In-worker test runner, one-token diff enforcement
- Hidden oracle check + subtlety score
- Shareable emoji result grid

## Out of scope
- Accounts, streaks, multiplayer duels
- Python/Pyodide (JS only at first)
- User-submitted puzzles

## Risks & unknowns
- Puzzle supply: generating fair, unique-surviving mutants daily is real work
- Some functions admit many trivial surviving mutants → low skill ceiling
- In-browser Pyodide is heavy if we add Python

## Done means
A player loads today's puzzle, edits one token, and the site correctly distinguishes a mutation that keeps visible tests green while the hidden oracle turns red — awarding a subtlety score and a shareable grid — for a bank of at least 14 hand-verified daily puzzles.
