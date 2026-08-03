## Overview
A git hook and TUI for developers shipping large volumes of model-written code. It turns each staged diff into a short cloze exercise over exactly the tokens that carry information, then records a per-file *reproducibility debt* score. For solo devs and small teams who notice they can no longer explain their own codebase.

## Problem
Manually retyping LLM-generated code works as a comprehension check, but retyping the whole thing is absurd — 90% of a diff is boilerplate your fingers already know, and typing it teaches nothing. The information lives in a handful of places: the one non-obvious flag, the off-by-one bound, the identifier that doesn't follow repo convention, the error branch. Those are also precisely the tokens you'll be unable to defend in review three weeks later. Nobody measures which parts of a codebase are un-reproducible by the people who own it.

## How it works
1. `git commit` fires the hook. Staged hunks are parsed with tree-sitter into a syntax tree.
2. Every token gets a surprisal score: `-log P(token | left context)` from a small local code model, computed once per hunk. Candidate blanks are restricted to *semantic* node types (identifiers, literals, operators, keyword arguments) so you never get asked to retype half of `sizeof`.
3. The top-k surprisal tokens (default k = 6, capped at ~40 keystrokes total) become blanks. A TUI shows the diff with `▁▁▁▁` in place of them and you type them in, in order.
4. Wrong or skipped answers do **not** block the commit. They increment that file's debt counter in `.git/dictation.db`.
5. `dictation report` renders the repo as a ranked list: files where the recall rate is lowest are the ones you're carrying blind. A CI comment surfaces it on PRs touching high-debt files.

## Technical approach
Rust CLI. tree-sitter for grammars (start with TS, Python, Go). Scoring via `llama.cpp` server logprobs against a 1–3B code model, or — offline fallback — a repo-local KenLM-style n-gram over the existing tree so "surprising" means *surprising for this repo*, which is often the better signal and needs no GPU. Storage: SQLite keyed by (path, blob_sha, token_span) with a rolling per-file recall rate that decays over 90 days. The hard part is blank selection: naive top-k surprisal picks string literals and UUIDs, which are memorization busywork. Filter by node type, penalize tokens whose exact form appears elsewhere in the diff, and require that the blank be *predictable in principle* — if the model's top-1 given full bidirectional context still misses it, it's noise, not knowledge.

## v1 scope
- One language (TypeScript).
- n-gram scorer only, no model dependency.
- Fixed k = 5 blanks, single-line hunks.
- Ratatui screen with pass/fail, no report command.

## Out of scope
Blocking commits, team leaderboards, IDE plugin, multi-file exercises, spaced repetition.

## Risks & unknowns
Developers may disable the hook on day three — the debt report has to be more useful than the drill is annoying. Surprisal on generated code may correlate with formatting noise. Unclear whether recall rate predicts anything real (does low recall actually precede bugs?); worth checking against `git blame` on subsequent fix commits.

## Done means
On a 5k-line TypeScript repo, committing a 40-line model-written diff produces five blanks that a reviewer independently agrees are the load-bearing tokens, the drill takes under 25 seconds, and `dictation report` ranks the file the author least understands at the top.
