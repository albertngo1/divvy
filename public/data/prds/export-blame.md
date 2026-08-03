## Overview
A CLI, `envblame`, that answers "where did this environment variable come from?" with file and line numbers. `envblame PATH` prints an ordered timeline of every mutation your shell startup performed, marks the winner, and flags duplicates. For anyone who has more than one dotfile.

## Problem
This is a 20-minute papercut that recurs weekly. `NODE_OPTIONS` is set by something and you can't find what. Your PATH has 41 entries and 11 duplicates and you cannot tell which of `.zshrc`, `.zprofile`, `path_helper`, nvm, conda, direnv, or a Homebrew shellenv snippet contributed each one. You edit a dotfile and nothing changes because a later file overrides it. The current debugging technique is grepping six files and guessing.

## How it works
- `envblame PATH` — git-blame-style output: one line per mutation, in execution order, each with `file:line`, the operation (set / prepend / append / unset), the value delta, and the surviving final value highlighted.
- `envblame --dupes PATH` — every duplicated entry with the file that added it a second time.
- `envblame --pid 4711 JAVA_HOME` — diffs a live process's environment against a fresh login shell to catch app-level injection (dotenv loaders, launchd plists, IDE run configs).
- `envblame --diff login interactive` — which vars only exist under one kind of shell, the classic ssh-vs-terminal mystery.

## Technical approach
Rust or Go, single static binary. The core trick is shell xtrace with a location-bearing prompt. For zsh: spawn `zsh -i -c exit` with `PS4='+%N:%i>'` and XTRACE redirected to a private fd, then parse the trace stream for assignments, `export`, `typeset -x`, and array forms (`path=(...)`). For bash: `PS4='+${BASH_SOURCE}:${LINENO}>'` with `BASH_XTRACEFD`. Reconcile the reconstructed final env against a real `env` dump; anything unexplained is labeled `inherited (launchd/ssh/parent)` rather than silently dropped. Platform sources layered on top: `launchctl getenv`, `/etc/paths` + `/etc/paths.d/*` (attributed to `path_helper`), `/proc/<pid>/environ` on Linux and `KERN_PROCARGS2` via sysctl on macOS for `--pid`, `direnv export json` walked up the directory tree, and `docker inspect --format '{{json .Config.Env}}'` plus `docker history --no-trunc` for layer attribution.

Data model: `Mutation { var, op, value, source: File{path,line} | Launchd | DockerLayer | Inherited, order }`. Rendering is a fold over that list.

The hard part is opaque hooks: nvm, conda, and `path_helper` rewrite the whole variable inside a function, so per-line attribution is meaningless. These need detection and collapsing into a single blamed unit ("nvm.sh:2412 replaced PATH entirely"). Second hard part: running your real init without side effects leaking — everything must happen in a subshell with a private fd and a scratch cwd.

## v1 scope
- zsh only, macOS only
- One variable per invocation, no `--pid`, no docker, no direnv
- Direct assignments and `export` only; functions collapse to their call site
- Plain text output, no color config

## Out of scope
fish, nushell, Windows, editing dotfiles for you, a TUI, CI integration.

## Risks & unknowns
xtrace output for arrays and parameter expansion is gnarly to parse across zsh versions. Slow init files (conda) make every invocation take seconds. Some users' configs are genuinely non-idempotent and running them twice may misattribute.

## Done means
On a machine where `NODE_OPTIONS` is set in three different files, `envblame NODE_OPTIONS` names all three with correct `file:line` and marks the winner; `envblame --dupes PATH` lists every duplicate entry with the file that re-added it.
