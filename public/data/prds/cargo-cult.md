## Overview

Cargo Cult is a small CLI that reads your existing shell-history database and learns your personal repair rituals: for each command that fails, what did you type next that made it succeed? It turns thousands of rows of ambient history into a ranked, evidence-backed answer to "okay, what did I do last time?" For anyone with more than a year of shell history and a memory that doesn't extend past last Tuesday.

## Problem

The daily papercut isn't the failure — it's the *rediscovery*. `pod stuck in ImagePullBackOff`, `error: externally-managed-environment`, a stale gradle daemon, an expired SSO token. You have solved each of these four times. The fix lives in your history, six thousand lines back, unsearchable because you can't remember the fix's text — only the failure's. Existing history tools (fzf, atuin, stinkpot) search *commands*; nobody indexes the causal edge from failure to repair.

## How it works

`cult why` looks at your last failed command, normalizes it to a template, and prints:

```
$ pip install pandas   → exit 1  (seen failing 9×)
  1. pipx install <PKG>                 7/7 followed by success   lift 4.2×
  2. python -m venv .venv && source ...  3/4                      lift 2.1×
  3. (bare retry)                        1/6  ← baseline
```

The baseline row is the point: it shows how often just *retrying* fixes it, so you can tell a real repair from a network flake. `cult explain 1` dumps the actual dated history rows that support the claim.

## Technical approach

- **Rust CLI, read-only over an existing SQLite history DB** — Atuin's `~/.local/share/atuin/history.db` already stores command, cwd, exit code, duration, session id, and timestamp, which is exactly the schema needed. Ship an importer for zsh's `EXTENDED_HISTORY` too (no exit codes there — degrade to timing-only heuristics and say so).
- **Templating:** shell-lex each command, then abstract arguments into typed placeholders (`<PATH>`, `<GITSHA>`, `<PKG>`, `<URL>`, `<NUM>`, `<FLAG>`) via a Drain-style fixed-depth token tree, keeping the first two tokens (`git rebase`, `kubectl apply`) verbatim as the template key.
- **Episode mining:** a *recovery episode* is template T failing at t₀ in session S, then the same T succeeding at t₁ where t₁ − t₀ < 20 min, same cwd, with ≤ 8 intervening commands. Those intervening templates are repair candidates.
- **Ranking by lift, not count:** score = P(T succeeds | R occurred in the gap) / P(T succeeds | gap is empty). This is the whole design — the bare-retry baseline is what separates a real fix from post-hoc superstition, and computing it correctly per-template is the genuinely hard part. Confounders abound: two repairs in one gap, background state changes, and success that arrives because the user gave up and changed the arguments (which templating hides). v1 handles multi-repair gaps by crediting all and discounting by gap length, and flags low-support rules rather than suppressing them.
- Storage: a derived `repairs` table, rebuilt by `cult index` in one pass.

## v1 scope

- Read-only, Atuin DB only. No shell hooks, no daemon, no writes to history.
- Two commands: `cult index`, `cult why [command]`.
- Plain-text output with the baseline row always shown.
- `cult explain <n>` printing supporting rows with dates.

## Out of scope

Executing the suggested fix. Team/shared rule sharing. Any network call or LLM. Fish/nushell importers. A TUI.

## Risks & unknowns

The honest failure mode is that most gaps are noise and the top suggestion is garbage — mitigated by refusing to print rules below a support threshold, and by making the baseline row unmissable. Templating is where it lives or dies: too aggressive and `ssh prod` merges with `ssh laptop`; too timid and nothing generalizes. Privacy: history contains secrets in argv, so output must never leave the machine and `explain` should redact anything matching high-entropy token patterns.

## Done means

Run `cult index` on a real ≥50k-row history, then hand-pick 10 commands the user knows they've repeatedly fixed; for at least 6 of them the correct repair appears in the top 3 with lift > 1.5, and no suggestion is printed for commands whose only real fix was a bare retry.
