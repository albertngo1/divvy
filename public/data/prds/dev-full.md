## Overview

`devfull` is a single-binary test harness for anyone who ships a command-line program. You point it at your CLI; it runs that CLI under a matrix of hostile-but-completely-ordinary environments and reports every place your tool stops behaving like a Unix citizen. For CLI authors in any language — the harness only observes stdout, stderr, exit codes and the pty byte stream.

## Problem

Every CLI is written and tested in exactly one environment: a wide, colorful, interactive terminal with infinite disk. Then a user pipes it to `head` and gets a Python `BrokenPipeError` traceback. Or redirects to a file on a full disk and the tool exits 0 having written nothing. Or runs it in CI and the log fills with ANSI garbage. Or hits Ctrl-C during a progress bar and their cursor is invisible for the rest of the session. These are the same five bugs, in every tool, forever, and nobody tests for them because writing the harness is more work than the bug seems to deserve.

## How it works

`devfull ./mytool --config x` runs the invocation ~12 times, each under one adverse condition, and prints a scorecard with a pass/fail and the offending bytes. Cases include: stdout to a closing pipe (`| head -1`); stdout to `/dev/full` (writes fail with ENOSPC); stdout to a plain pipe (color codes must vanish); `NO_COLOR=1` and `CLICOLOR_FORCE=1`; `TERM=dumb`; a pty resized to 20 columns; SIGINT delivered mid-output; stdin closed; `LC_ALL=C` with non-ASCII output; unknown flag (must exit non-zero with usage on **stderr**); `--help` (must exit 0 to a pipe); stderr closed.

Assertions are only the unambiguous invariants — no language traceback after SIGPIPE, no ANSI sequences on a non-TTY unless forced, non-zero exit when writes fail, no unbalanced terminal-mode escapes left behind. Everything softer is emitted as advisory, not failure.

## Technical approach

Rust, single static binary. Interactive cases run under a pty via `portable-pty`; non-TTY cases use plain pipes. Traceback detection is a small set of per-runtime regexes (`BrokenPipeError`, `panic:`, `Error: write EPIPE`, `thread '.*' panicked`). Terminal-state leakage is caught by a tiny escape-sequence state machine over the raw pty output tracking balance of `?1049h/l` (alt screen), `?25l/h` (cursor), and SGR resets at exit. `/dev/full` is Linux-native; on macOS ship `libfull.dylib`, a `DYLD_INSERT_LIBRARIES` interpose of `write()` that returns `ENOSPC` after N bytes (same shim as `LD_PRELOAD` on Linux for finer control). Config lives in `devfull.toml`: a list of invocations plus expected exit codes. Outputs: human scorecard, `--json`, `--junit` for CI, and an SVG badge. The genuinely hard part is the write-failure shim — you must fail writes to the *program's* fd 1 without breaking the harness's own bookkeeping, and detect that the program noticed.

## v1 scope

- Four checks: SIGPIPE-to-`head`, `/dev/full`, ANSI-on-pipe, unknown-flag exit code
- Linux only, `devfull.toml` with one invocation
- Human-readable scorecard + `--json`
- `LD_PRELOAD` write shim (~60 lines of C)

## Out of scope

Windows, fuzzing arguments, performance testing, checking help *content*, auto-fixing anything, an LSP.

## Risks & unknowns

False positives on tools that legitimately print diagnostics after SIGPIPE. Some languages (Go) handle EPIPE correctly by default, so the value concentrates in Python/Node/Rust tools. `/dev/full` semantics differ under buffering — a tool may pass only because libc buffered everything and `fclose` swallowed the error, which is itself the bug to report.

## Done means

Running `devfull` against three well-known CLIs (`rg`, `pip`, and a hand-written Python script) yields the expected outcome for each of the four checks, the Python script fails SIGPIPE and `/dev/full`, and CI can consume `--json` to fail a build.
