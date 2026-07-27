## Overview
`again` is a single-binary CLI wrapper for the innermost loop of programming: run command, read 300 lines of output, find the 3 that changed. For anyone who runs the same test, build, plan, or curl forty times an hour.

## Problem
Your eyes are doing the diffing, badly. `watch -d` only works for fast non-interactive commands. `diff <(cmd) /tmp/prev` drowns you in noise: elapsed times, timestamps, PIDs, temp paths, and content hashes all change every run even when *nothing* changed. So you scroll, squint, and miss the one line that matters — or worse, you re-read the whole thing and lose the thread of what you were doing.

## How it works
`again cargo test` runs the command normally and streams output live. When it exits, you get a header — `exit 1 → 0 · 8.2s → 3.1s · 11 lines changed` — and a delta view: unchanged runs collapsed to `⋯ 41 unchanged`, additions green, removals red, and a third neutral style for "same line, only volatile parts differ." `again -q` skips the live stream and shows the delta alone.

The trick is **learned volatility**. After three or more runs of the same key, `again` compares tokens at the same slot across history and masks the ones that always differ: `finished in 12.3s` vs `13.1s` becomes `finished in ⟨dur⟩` and is not a change. Escape hatches: `--unmask` for one run, `--mask '/\d+ms/'` for manual rules, `--since 5` to diff against five runs ago, `--log` to list history. A footer always states how many lines differed *only* in masked regions, so nothing is silently hidden.

## Technical approach
Rust, static binary. Run the child under a PTY via `portable-pty` — critical, because `cargo`, `pytest` and friends change their output format the moment they detect a pipe. ANSI-aware: strip SGR for comparison, reapply for display.

Storage is SQLite in WAL mode at `~/.local/state/again/` with a real `busy_timeout` set (short-lived readers genuinely can get locked out otherwise). Tables: `run(id, key, argv, cwd, exit, started, dur_ms)` and `line(run_id, idx, raw_zstd, masked)`, keyed on hashed argv+cwd, retaining the last 20 runs per key.

Masking: tokenize each line into literal / integer / float / hex / uuid / iso8601 / duration / path tokens. Build a per-key profile keyed by *line signature* (the line with all values stripped) mapping token position → variability counter. Mask any position with ≥3 observations and a variability ratio > 0.6. Diff the masked forms with patience diff over line hashes, falling back to Myers.

The genuinely hard part is alignment when output is interleaved by a parallel test runner — line order is nondeterministic, so a naive diff reports everything as changed. Solution: an `--unordered` mode doing multiset diff within sections, where sections are detected from indentation and blank-line boundaries.

## v1 scope
- `again <cmd>`, `again -q`, `again --log`
- PTY passthrough, ANSI-safe
- Numeric/duration/timestamp/hex masking only
- Ordered diff only; last 10 runs retained

## Out of scope
Shell integration and completions, CI/remote diffing, an interactive TUI, structured JSON-aware diffing.

## Risks & unknowns
Masking can hide the exact change you cared about — the footer and `--unmask` are load-bearing. Multi-megabyte outputs need streaming, not buffering. Interactive commands (anything reading stdin) need a bypass path.

## Done means
Running `again cargo build` twice with no source edits prints `⋯ 0 changed`. Running `again pytest -q` on a suite where one test newly fails surfaces exactly that test as the first changed line, with zero timestamp or duration noise in the delta.
