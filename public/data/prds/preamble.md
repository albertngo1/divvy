## Overview
Preamble is a browser head-to-head game for developers. Everyone complains that CLIs blow 33k tokens before reading your prompt — so make token thrift a sport. Given an identical broken task, players compete to craft the *smallest* context that still makes a frozen model emit a passing solution. Lowest winning token count takes the round.

## Problem
Prompt engineering is folklore — people hoard 'system prompt' pasta and never measure whether any of it earns its tokens. There's no feedback loop that rewards saying *less*. And 'read more / consume more' content (the token-overhead exposés) is passively nodded at, never competed over.

## How it works
A round loads a real, seeded task: a repo snippet with a failing unit test. Each player writes their own prompt + optional context excerpts in a Monaco pane; a live counter tallies tokens as they type. On submit, the server runs the *same* pinned model at temperature 0 against your prompt, executes the returned diff in a sandbox, and runs the hidden test. If it passes, your score = tokens used (lower better); if it fails, you're out that round. Best-of-five, Wordle-style shareable card (`🟩 412 tok`). A 'context store' panel lets you spend tokens to reveal file snippets — do you pay 300 tokens for the type definitions or gamble without them?

## Technical approach
Stack: SvelteKit + a Bun worker pool. Tasks are generated offline from small permissively-licensed repos: pick a function, mutate it to fail one test (AST edit via ts-morph / libcst), store the failing snapshot. Judging: one deterministic model call (Haiku-class for cost, temp 0, fixed seed) → parse fenced diff → apply in a Firecracker/Docker sandbox → run the single hidden test with a wall-clock cap. Token counting via the model's official tokenizer. The hard part is *determinism*: cache (prompt → completion) so the same prompt always scores identically, and design tasks with a unique passing behavior so players can't smuggle the answer in as a literal.

## v1 scope
- 20 hand-vetted Python tasks
- Single pinned model, temp 0, cached judging
- Live token counter + pass/fail sandbox
- Async duel: both see same seed, compare scores
- Shareable result card

## Out of scope
- Multiple languages/models, real-time lobby, ELO, anti-cheat beyond caching.

## Risks & unknowns
- Model nondeterminism despite temp 0 (mitigate with caching + retries-must-match).
- People golfing the *test* instead of the task (unique-behavior task design).
- Sandbox abuse — strict timeouts, no network.

## Done means
Two people load the same seed on different machines, each submit a prompt, the sandbox runs the pinned model, and the lower-token *passing* submission is declared winner with a reproducible token count.
