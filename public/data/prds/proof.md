## Overview
Proof is a shell wrapper (and optional git hook) for developers and homelab operators that deliberately *slows down* your most consequential commands. Instead of an instant `y/N` prompt you can muscle-memory past, a command must 'proof' — sit in a mandatory rise-time proportional to how much damage it could do — before it executes, cancelable the whole time.

## Problem
The fastest path to disaster is a reflex. `rm -rf`, `git push --force`, `terraform apply`, `DROP TABLE`, `docker system prune` — the confirm prompt is right there and your fingers hit enter before your brain catches up. Undo prompts train you to ignore them. What's missing isn't *information*, it's *time*: a window where you can still notice you're about to nuke prod. This riffs on the Lobsters 'Slow Software' and 'Proportional Web' pieces — latency, applied on purpose.

## How it works
You alias risky binaries through `proof`. When invoked, it scores the command's blast radius (0-100) from a rules table, computes a rise time (e.g. `sqrt(score) * base_seconds`), and shows a live progress bar: 'Proofing `git push --force origin main` — 22s'. During the rise you can hit `c` to cancel, `x` to abort, or read the rendered explanation of *why* it scored high (force-push to a protected branch, 3 collaborators active). When the timer completes it runs — no extra keypress needed. High scores also require you to type a short confirmation phrase mid-rise.

## Technical approach
- Go single binary, distributed as `proof <cmd> <args…>`; shims installed as shell functions.
- Blast-radius scorer: a YAML ruleset of regex/AST matchers per tool. `rm` → count of paths, presence of `-rf`, whether target is under `$HOME` vs `/`. `git` → parse subcommand, branch protection status via `gh api`, ahead/behind. `psql`/`mysql` → detect `DROP`/`TRUNCATE`/unqualified `UPDATE`/`DELETE`.
- Rise-time curve configurable; `PROOF_PANIC=1` env bypass for genuine emergencies (logged loudly).
- Ledger: append-only JSONL of every proofed command, cancel/complete, and score — so you can see what you almost did.
- Hard part: scoring *usefully* without being so annoying people set the bypass permanently. Calibration is the whole product.

## v1 scope
- Wrap exactly three commands: `rm`, `git push`, `psql -c`.
- Static YAML scorer, one rise-time formula.
- Progress bar + cancel + panic bypass.
- JSONL ledger and a `proof log` viewer.

## Out of scope
- Editor/IDE integration.
- Team-wide policy sync.
- ML-based scoring.

## Risks & unknowns
- Annoyance → everyone bypasses. Mitigate with tight default thresholds so 95% of commands proof instantly.
- Correctly parsing arbitrary shell quoting is fiddly.
- Some tools spawn interactively (psql REPL) and can't be pre-scored.

## Done means
Aliasing `rm` through Proof, `rm -rf ~/tmp/junk` proofs for <2s and runs, while `rm -rf ~/` proofs for 30s, demands a typed phrase, and can be canceled — with both attempts recorded in `proof log`.
