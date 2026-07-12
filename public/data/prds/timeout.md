## Overview
A tiny local daemon for developers that is "fail2ban, but for you." It watches your shell/test loop, detects when you're thrashing — re-running near-identical failing commands — and puts you in a brief timeout with a forced pause before you can retry.

## Problem
Everyone has debugging death spirals: run test, tweak one character, run again, sixteen times in four minutes, tunnel-visioned. The "reaction" daemon auto-acts on repeated output patterns to defend servers; nobody does it for the human at the keyboard. A 30-second forced breath often surfaces the fix faster than the 16th blind retry — echoing the lobsters theme of *not* frantically understanding your codebase and just stopping to look.

## How it works
The daemon tails your shell history (or a wrapped command runner). It fingerprints each command plus exit status and keeps a sliding window. When it sees N near-duplicate commands (normalized, high similarity) failing within T seconds, it "trips": the next invocation is intercepted and you get a full-screen 20-second interstitial — a breathing timer, plus an auto-generated one-line note on what actually changed between your last three attempts ("you've only edited line 42; the error is on line 88"). When the timer ends, the command runs.

## Technical approach
- Stack: a single Go/Rust binary; a shell hook (zsh `preexec`, bash `DEBUG` trap, or a `tim <cmd>` wrapper) emits `command + exit` to a Unix socket.
- Similarity: normalize commands (strip whitespace/numbers), then token-set or Levenshtein ratio to cluster the recent window.
- Trip logic: configurable N (default 4) similar failing commands within T (default 120s) → cooldown of D seconds; exponential backoff on repeat trips.
- Interstitial: a bubbletea TUI breathing timer; optional local diff (`git diff` since last attempt) to summarize what changed.
- Hard part: not being infuriating — precision of "thrash" detection, an always-available escape hatch, and low-friction integration across zsh/bash/fish.

## v1 scope
- zsh `preexec` hook + daemon over a socket
- Detect 4 similar failing commands in 2 minutes → 20-second breathing timer
- `--bail` env var / escape hatch to disable instantly

## Out of scope
- LLM-generated diff summaries (v2)
- fish/bash and Windows support
- Team analytics or streak gamification

## Risks & unknowns
- Annoyance → users disable it; it lives or dies on great defaults
- False trips on legitimately-similar commands (deploy retries, flaky-test reruns)
- Hard to measure whether it actually helps vs. just interrupts

## Done means
Deliberately thrash a failing test 4× in under 2 minutes and the 5th invocation is blocked by a 20-second breathing timer that then releases and runs the command normally.
