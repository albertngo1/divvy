## Overview
A CLI that turns shell history into server tests. It reads your history database, finds the *verification* commands — `systemctl is-active caddy`, `curl -sf localhost:8096/health`, `zpool status | grep ONLINE`, `docker inspect -f '{{.State.Health.Status}}' sonarr` — replays them safely, learns which parts of their output are deterministic, and emits a goss YAML file plus a plain bash suite. For homelabbers and solo ops people who have never written a test for their own infrastructure and never will.

## Problem
The spec for a homelab exists only in muscle memory. You know the box is healthy because you know the six commands to run, and you run them from memory at 11pm during an outage. Writing that down as goss YAML or a monitoring config is a separate act of labor nobody does, so the knowledge dies when you forget it. Meanwhile the exact commands are already sitting in `~/.zsh_history` — the spec has been written, just in the wrong format.

## How it works
1. `retrace mine` reads history (atuin's sqlite, stinkpot, or plain `~/.zsh_history` / `~/.bash_history`) and segments it into sessions by idle gap (>20 min = new session).
2. Each command is classified **read-only** or **mutating** by a curated verb table plus light parsing: any `>`/`>>` redirect, `rm/mv/cp/chmod/chown`, package-manager verbs, `systemctl start|stop|restart`, `docker run|rm` are mutating; `status/is-active/inspect/ls/cat/curl -s/ss/dig/df/zpool status` are read-only.
3. The interesting pattern is the **tail of a mutating session**: the read-only commands you ran *after* the last mutating command. That's you confirming the fix. Those get ranked highest.
4. `retrace learn` replays each candidate three times, ~10s apart, and diffs the outputs to auto-derive a mask — the bytes that changed between runs (PIDs, uptimes, timestamps, byte counters) become `.*` in the assertion, the bytes that held become the golden pattern. This is the clever bit and it removes the entire flaky-assertion problem.
5. `retrace emit` writes `goss.yaml` (using goss's `command`, `http`, `port`, `service`, `file` resources where it can map, falling back to `command` + exit-status + stdout matcher) and a readable `checks.sh`.
6. `retrace check` runs it; `--since-last` diffs against the previous run so you see what drifted.

## Technical approach
Go (so it ships as one static binary next to goss, and can vendor goss's resource types). History parsing: atuin's `history.db` schema, zsh EXTENDED_HISTORY `: <ts>:<dur>;<cmd>` lines, bash with/without HISTTIMEFORMAT. Command classification via `mvdan.cc/sh/v3/syntax` to get a real AST — needed to handle pipelines, `sudo`, subshells, and to reject anything containing a mutating node anywhere in the tree (fail closed). Masking uses a token-level diff over 3 samples, promoting differing tokens to character-class regexes (`\d+`, hex, ISO8601) rather than blanket `.*`, so the assertion still has teeth.

The hard part is the fail-closed classifier: one misclassified `curl -X POST` and the tool nukes something during `learn`. Mitigation: a strict allowlist for the replay phase (only commands whose every AST node matches a known-safe form), a `--dry-run` that prints what it *would* replay, and a big scary confirm on first run.

## v1 scope
- zsh EXTENDED_HISTORY only, local machine only
- Allowlist of ~40 safe command shapes, everything else needs manual `--approve`
- 3-sample masking, exit-status assertions only (no stdout matching yet)
- Emit bash suite only; goss YAML in v2

## Out of scope
- Remote hosts / SSH history correlation
- Anything that writes to a monitoring system
- Learning from other people's history

## Risks & unknowns
Most people's history is 80% `cd`, `ls`, `vim`, and typos — signal density may be low enough that the output is 3 useful checks and 40 duds, making manual curation the real UX. Replaying commands is genuinely dangerous and the allowlist has to be conservative enough to be boring.

## Done means
On a real homelab box, `retrace mine && retrace learn && retrace check` produces ≥5 checks the operator agrees are meaningful, all 5 pass green three days running with zero flakes, and stopping one service turns exactly the right check red.
