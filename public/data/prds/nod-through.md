## Overview
A review-vigilance harness for solo developers who review far more agent-authored code than they write. It occasionally salts an agent's diff with one plausible defect before you read it, then tells you whether you caught it, and builds a long-run measurement of your own supervision quality.

## Problem
Bainbridge's *Ironies of Automation* (1983): the better the automation, the worse the human gets at monitoring it, and the more consequential their rare interventions become. That is now the daily condition of using coding agents. Diff #40 of the day gets a glance and a merge. Nobody has any instrument for their own review attention — the only feedback signal is a bug that surfaces in production three months later, long past the point where you could attribute it to the review that waved it through.

## How it works
Register `nod` as the viewer for agent-authored changes. With probability p (default 1 in 6), before rendering the diff it applies exactly one seeded mutation to the agent's own added lines. You review normally and respond either `y` (looks good) or a `file:line` claim. It then reveals what it did.

The mutant never lands. It exists only inside a throwaway git worktree; the real branch is never touched, and a pre-commit hook refuses to commit while a mutant session is unresolved.

The log accumulates into the number you actually want: not raw catch rate, but **review half-life** — the diff size at which your catch probability crosses 50%. Also catch rate per defect class, so you learn you reliably spot inverted conditionals and never once notice a dropped `await`.

## Technical approach
TypeScript CLI. Mutations are applied with tree-sitter, restricted to lines the agent added, so the result reads like a model error rather than sabotage: swap two adjacent same-typed arguments, `<` → `<=`, drop an `await`, negate a guard, off-by-one on a slice bound, swap two similarly-named in-scope identifiers, mutate one character of an env var name, delete a `throw` from an error branch.

Two filters make a mutant *fair*: it must still parse, and it must survive `tsc --noEmit` (a compiler-caught mutant is a free catch and worthless as a test). Running the existing test suite against the mutant is optional but valuable — a mutant your tests kill isn't measuring you, and "tests caught it" is a genuinely interesting separate statistic about your suite.

Data model, SQLite: `reviews(id, ts, repo, diff_bytes, hunks, agent, mutated, operator, caught, seconds_open)`. Half-life comes from a logistic fit of `caught ~ log(diff_bytes)`.

Hard part one: plausibility. A stupid mutant teaches nothing. Hard part two: the isolation guarantee — this must be provably incapable of writing a mutation to a real branch, and that needs a test, not a promise.

## v1 scope
- TypeScript only, 4 operators
- `nod review <sha>` prints a possibly-mutated diff to your pager
- You answer `y` or `file:line`; it reveals immediately
- Appends JSONL, prints a running "caught 7/11"
- No menubar, no logistic fit, no stats page

## Out of scope
Multi-language, GitHub PR integration, team leaderboards, gating merges on your catch rate.

## Risks & unknowns
If p is too high the tool costs more than it teaches and gets uninstalled in a week. Catch rate is confounded by diff difficulty. People will learn to always claim a bug — mitigated by requiring a `file:line` and logging false claims separately. And injecting defects anywhere near a shared branch would be genuinely harmful, so worktree isolation is load-bearing.

## Done means
After 20 real reviews it prints a catch rate and a plausible half-life in bytes, and `git reflog` on the real repo shows zero trace that any mutation ever existed.
