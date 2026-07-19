## Overview
Cuckoo is a CI-attachable harness for engineering leads and toolsmiths that lays plausible bug-'eggs' into pull requests and tracks whether your review process catches them. Where ESLint finds and fixes problems, Cuckoo *manufactures* them — realistically — to turn 'is our code review actually working?' from vibes into a catch-rate number. It's a direct answer to the lobsters thesis that reviewing AI-generated code isn't a viable safety argument: prove it, or measure it.

## Problem
Everyone claims review catches bugs, but nobody measures reviewer sensitivity. As AI reviewers and AI-authored PRs proliferate, teams have zero calibration on their true miss rate. Mutation testing measures your *test suite*; nothing measures your *reviewers*. And 'Setup Complete, Now You Are Compromised' showed how much slips past human attention when it looks routine.

## How it works
On an opt-in 'drill' branch, Cuckoo takes a clean diff and produces a shadow diff with one planted defect: an off-by-one, a flipped boolean, a swapped error branch, a silently dropped await, a widened permission check. Mutations are style-matched (same identifiers, same formatting) so they read as natural. The planted PR goes through your normal review — a human reviewer, or an AI reviewer bot. Cuckoo records the verdict: did the review flag the exact planted line? It builds a per-reviewer, per-bug-class catch-rate dashboard and a leaderboard of blind spots ('your team catches 90% of off-by-ones but 20% of dropped awaits').

## Technical approach
Core is an AST mutation engine (tree-sitter for language-agnostic parsing; per-language mutation operators) that only emits mutations passing the type-checker and, ideally, the existing test suite — a bug that breaks CI is a bad egg. Ground truth is the planted line range. A GitHub App posts the drill PR and diffs the review comments/AI-bot output against the planted range to score a catch. Data model: `drill(id, repo, base_sha, operator, planted_range, reviewer, verdict, latency)`. The hard part is generating mutations that are *subtle but real* (survive typecheck+tests yet are genuine defects) without being trivially detectable — plus airtight guardrails so eggs never merge to main (branch protection, auto-close, signed 'this is a drill' labels).

## v1 scope
- tree-sitter mutation engine, 5 operators, JS/TS only
- CLI: `cuckoo plant <diff>` → mutated diff + planted-range manifest
- Typecheck+test gate so eggs compile and pass CI
- Scoring script that diffs review comments vs planted range
- Local catch-rate report

## Out of scope
- GitHub App / auto-PR automation
- Multi-language support
- Live AI-reviewer integrations beyond parsing their comments

## Risks & unknowns
- Ethics/safety: an escaped egg is a real bug — needs bulletproof isolation
- Generating mutations subtle enough to matter but not adversarially unfair
- Reviewers gaming the drill once they know it exists

## Done means
Run `cuckoo plant` on a real repo diff, get a compiling, test-passing PR with one planted defect and a manifest; feed a reviewer's comments to the scorer; and read a report stating whether the planted line was caught, by bug class.
