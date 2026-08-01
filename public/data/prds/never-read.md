## Overview

A CLI plus a tiny runtime shim that records which environment variables a process genuinely reads at runtime, then produces a truthful, evidence-backed env schema. For anyone maintaining a `.env` or a Kubernetes secret block that nobody has dared prune in three years.

## Problem

Env config only accretes. Someone copies prod's env to staging, a service gets thirty secrets it never touches, and now your blast radius is thirty secrets wide for no benefit. Declaration files (`secretspec`, `env.example`) describe intent, not reality — they're written once and rot. Nobody deletes an env var because nobody can prove it's dead.

## How it works

`neverread run -- npm start`. The command runs normally; on exit you get a receipt:

- **READ (12)** — name, read count, first-read stack frame, whether the value was empty
- **DECLARED, NEVER READ (32)** — present in the environment, no code ever asked for it
- **READ WHILE UNSET (3)** — the scary bucket: code asked, got `undefined`, and carried on
- **READ AFTER BOOT** — lazily read on some request path, not at startup

Runs merge. Point it at your whole test suite or a week of CI and you get coverage-style confidence: "`SMTP_PASS` was read in 1 of 340 runs, only on the password-reset path." `neverread diff .env` then proposes a minimal env, annotated with how much evidence backs each deletion. It never deletes anything itself.

## Technical approach

Node: `NODE_OPTIONS=--require` a shim that replaces `process.env` with a `Proxy` trapping `get` and `has`. Attribution comes from `new Error().stack` frame 2, captured with sampling (`Error.stackTraceLimit = 3`) because stack capture in a hot loop is brutal. Python: `sitecustomize.py` on `PYTHONPATH` swaps `os.environ` for a `MutableMapping` subclass and wraps `os.getenv`. Compiled binaries: `LD_PRELOAD` / `DYLD_INSERT_LIBRARIES` shim over `getenv`/`secure_getenv`, resolving the real symbol with `dlsym(RTLD_NEXT)`.

Storage: one JSONL per run in `.neverread/runs/`, folded into SQLite `var(name, first_seen, read_count, runs_read, runs_total, frames JSON)`. Secret triage cross-references names against a pattern list *and* Shannon entropy of the value, so the report can surface "high-entropy value, 40 chars, never read in 340 runs, injected into 9 services."

Two genuinely hard parts. **(1) Laundering:** `dotenv`, `viper`, and friends snapshot the entire environment at import, which looks like a read of everything and destroys the signal. The shim tags frames belonging to known config libraries and suppresses those reads, then attributes the *derived* key access on the returned config object instead — library-specific and fiddly. **(2) Go static binaries** never call libc `getenv`; the runtime copies environ at startup. Fallback is static extraction of `os.Getenv("…")` string literals via `go/ast`, reported in a separate, explicitly unverified column. Absence of evidence is not evidence of absence, and the UI has to say so loudly or the tool becomes an outage generator.

## v1 scope

- Node only, `neverread run -- <cmd>`
- The four-bucket receipt table, `--json` output
- Run merging into SQLite, `neverread diff .env`

## Out of scope

Go/Rust/Ruby, k8s admission controller, secret rotation, web UI, auto-editing any file.

## Risks & unknowns

Proxy overhead on `process.env` in hot paths; native addons that read `environ` directly bypass the Proxy entirely and go uncounted; a confident "unused" verdict on a var read only during disaster recovery is an incident waiting to happen.

## Done means

On a real Express app, running its test suite produces a receipt whose READ set exactly matches a manual grep audit, and the proposed minimal `.env` — with ≥50% fewer variables — boots the app and passes the same suite.
