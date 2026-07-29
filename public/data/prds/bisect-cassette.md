## Overview

Bisect Cassette is a tiny background recorder for local test runs. It watches your shell/editor test invocations, and for each one stores a row: `(commit_sha, worktree_dirty_hash, test_id, outcome, duration, ts)`. Weeks later, when someone reports "this broke sometime this month," you run `cassette blame test_foo` and it replays your own history and hands you the first commit where that test flipped red — usually with zero re-runs, because you already ran it on both sides at some point.

For: any programmer on a repo with a test suite and more than one person's worth of history.

## Problem

`git bisect run` is great and almost nobody uses it, because at the moment you need it you must (a) write a reliable reproducer script, (b) pay for ~log2(N) full builds, and (c) hope old commits still build with today's toolchain. Meanwhile you have *already executed* that test hundreds of times across dozens of commits this month. That signal is thrown away every single time. The papercut: you know the bug is recent, you know the test, and you still have to spend 20 minutes and 12 builds to learn a fact your own laptop already observed.

## How it works

1. `cassette install` drops a shell hook (zsh `preexec`/`precmd`, bash `DEBUG` trap) plus optional test-runner plugins.
2. On every matched command (`pytest`, `go test`, `cargo test`, `jest`, `mix test`), it wraps the invocation, captures machine-readable output, and writes per-test rows to a local SQLite DB keyed by repo root.
3. Dirty worktrees are recorded but marked untrusted (hash of `git diff` included) — only clean-tree runs count as bisect evidence.
4. `cassette blame <test>` walks `git rev-list --topo-order` and finds the earliest commit with a recorded FAIL whose nearest recorded-PASS ancestor exists. It prints the suspect *range*, plus the exact remaining commits with no evidence.
5. If the range isn't narrowed to one commit, it emits a ready-to-paste `git bisect start GOOD BAD` with all known-good/known-bad commits pre-marked via `git bisect good/bad` — so you only build the gaps.
6. `cassette timeline <test>` renders a per-commit red/green strip in the terminal.

## Technical approach

- Rust or Go single binary, SQLite (WAL) at `~/.local/share/cassette/<repo-id>.db`.
- Output parsing: prefer structured formats — `go test -json`, `pytest --report-log`, `cargo test --format json -Z unstable-options`, `jest --json`. Fall back to a per-runner regex adapter.
- Test identity is the hard part: renames and parametrized IDs (`test_x[case-3]`) break naive string keys. Store `(file_path, symbol_name, param_suffix)` separately and resolve renames by following `git log --follow` on the file plus a Levenshtein match on symbol names within the same file.
- The graph query: history is a DAG, not a line. Use the same first-bad-commit definition as `git bisect` — the earliest bad commit all of whose parents (transitively) are good — computed by a reverse topological walk over `git rev-list --ancestry-path GOOD..BAD`.
- Flake handling: a test with mixed outcomes on the *same* sha is marked FLAKY and excluded from evidence, with a `cassette flakes` report as a free byproduct.

## v1 scope

- zsh hook only.
- `pytest --report-log` and `go test -json` only.
- `cassette blame <test>`: prints suspect range + pre-seeded `git bisect` command.
- `cassette timeline <test>`: ASCII red/green strip.
- Clean-tree runs only count; dirty runs recorded but ignored.

## Out of scope

- Ingesting CI results (obvious v2, needs auth).
- Team-shared DB / server sync.
- Auto-running the missing gap builds.
- Non-test commands (lint, build).

## Risks & unknowns

- Coverage may be too sparse to ever narrow to one commit — mitigate by always emitting the pre-seeded bisect rather than claiming an answer.
- Shell hooks are invasive and fragile across zsh configs; must fail silently and never delay the prompt (>5ms is unacceptable).
- Rebase-heavy workflows orphan recorded shas; need `--fallback-to-patch-id` matching.

## Done means

On a repo where I ran the suite on 30 commits over two weeks, deliberately breaking one test at commit N, `cassette blame` names commit N with zero new test executions, in under 300ms. Prompt latency with the hook installed is under 5ms measured over 1000 commands.
