## Overview
A single-binary CLI that reads your config files, asks each program what it *actually* parsed, and prints a per-line verdict: LIVE, SHADOWED, DEFAULT, or GHOST. For anyone carrying a decade of accreted dotfiles and server configs.

## Problem
No parser tells you a line did nothing. `sshd` silently ignores keys in the wrong context, nginx ignores directives in the wrong block, `git config` will happily store `[core] autocrfl = true` forever. So bad advice from a 2019 Stack Overflow answer outlives the outage it was pasted for, and nobody can tell the load-bearing lines from the cargo cult. This is the same phenomenon as the JIS ghost characters — entries that entered a permanent standard through a transcription error and can never be removed because something might depend on them.

## How it works
`nso ~/.ssh/config /etc/nginx/nginx.conf ~/.gitconfig`
1. Parse your file into `(path, line, key, value)`.
2. Get ground truth from the program itself: `sshd -T -f <file>`, `ssh -G <host>`, `nginx -T`, `git config --list --show-origin`, `tmux show-options -A -g`, `systemd-analyze cat-config`.
3. Classify each line:
   - **GHOST** — key absent from the effective dump and unknown to the binary's option table. Typo, deprecated, or wrong file entirely.
   - **SHADOWED** — parsed, but a higher-precedence entry wins.
   - **DEFAULT** — value is byte-identical to the compiled-in default.
   - **LIVE** — actually changes behavior.
4. Archaeology: for each dead line, `git log -S'<line>' --diff-filter=A -1` gives the date, author, and commit message that introduced it. Output reads: `~/.ssh/config:41  GHOST  ServerAliveInterva 60  — inert since 2019-03-11 ('fix prod ssh timeouts')`.
5. `--fix` emits a patch commenting each ghost out with its verdict inline.

## Technical approach
Go or Rust, one binary. Each supported program is a *prober* plugin: `{dump_cmd, effective_parser, default_extractor, case_rules, precedence_rule}`. Defaults are extracted by running the binary against an empty config in a scratch `HOME`/prefix and diffing dumps — this beats hardcoded default tables, which rot with every point release. Value comparison needs normalization (`yes|on|1|true`, `30s` vs `30`, `~` expansion, path canonicalization).

The genuinely hard part is precedence, which is per-program and not generalizable: `ssh_config` is first-match-wins, parts of `sshd_config` are last-wins, nginx directives inherit into child blocks only when not redefined. Encode these as small explicit rules per prober rather than one clever generic engine.

## v1 scope
- Three probers: `ssh_config`, `sshd_config`, `gitconfig`
- Three verdicts only (GHOST / DEFAULT / LIVE) — skip SHADOWED
- Plain table output with `file:line`
- Introduction date on ghosts, no author or message
- Exit 1 if any ghost found (so it can go in CI)

## Out of scope
Auto-editing files, Windows, Kubernetes manifests, editor settings schemas, anything requiring root by default.

## Risks & unknowns
Dump-format drift across versions; `sshd -T` wants a resolvable host and sometimes root; `nginx -T` needs the whole config to already be valid. False DEFAULT verdicts on lines deliberately pinned against a future upstream default change — needs a `# nso: intentional` escape hatch.

## Done means
Run it on a real 200-line ssh config. For every line it calls GHOST, deleting that line produces a zero diff in `ssh -G host` output; for every LIVE line, deleting it produces a non-zero diff. 100% agreement, no exceptions.
