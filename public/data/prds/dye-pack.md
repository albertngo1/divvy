## Overview

A local daemon + Node loader that makes `.env` a **per-reader** file: each process that opens it receives a distinct set of honeytoken values. When those values are exfiltrated and used, the callback identifies the reader by name. For solo devs and small teams who run `npm install` on machines that also hold real credentials.

## Problem

Shai-Hulud-class worms slurp `process.env` and post it somewhere. Afterwards you know *that* you were hit — from a vendor blog, days later — but not which dependency read what, or whether the credential that leaked was the prod one or the throwaway. Standard honeytokens tell you a secret leaked; they do not tell you who read it. `.env` is read by dozens of processes a day and none of them are attributable after the fact.

## How it works

1. `dye init` scans your `.env`, keeps the real values in the daemon, and registers a canary domain per variable.
2. You run Node with `NODE_OPTIONS="--require dye/hook"`. The hook patches `fs.readFileSync`/`fs.promises.readFile` for paths ending in `.env` and also wraps `dotenv.config`.
3. On each read, the hook walks the V8 stack and `require.cache` to resolve the *calling package* (`@foo/bar@1.2.3`), mints a token for that reader, and returns a synthesized `.env` whose fake values embed the token: an AWS-key-shaped `AKIA...` from a zero-permission account, a Postgres URL whose host is `t-a1b2c3.dye.example`, a webhook URL on the same wildcard.
4. Your own app gets the real values — it is on an allowlist by resolved path.
5. When anything resolves that DNS name, hits that URL, or attempts an AWS call with that key ID, the daemon looks it up in a local SQLite ledger and shows: package, version, install context, timestamp, and the exact variable that walked out.

## Technical approach

- **Node hook:** `--require` preload; `Error.prepareStackTrace` to get raw call sites, map filename → nearest `package.json` → name@version. Handles the common `dotenv`, `dotenvx`, and hand-rolled `readFileSync('.env')` paths.
- **Non-Node readers** (python-dotenv, `docker compose`, shell `source`): a FUSE mount (libfuse on Linux, fuse-t on macOS) over a shadow directory; on `open()` FUSE gives the caller's PID, and we walk the ppid chain via `/proc/<pid>/stat` (Linux) or `libproc` `proc_pidinfo` (macOS) to get an argv-level identity.
- **Canary infrastructure:** an authoritative DNS server for `*.dye.example` (CoreDNS with a custom plugin, or `dnslib` in Python) logging every QNAME — this catches exfil even when the attacker only resolves and never connects. Plus an AWS account with a deny-all policy and CloudTrail on, since CloudTrail records the access key ID for *denied* calls.
- **Ledger:** SQLite, append-only, hash-chained so "package X read this at T" is defensible in an incident writeup.
- **Hard part:** PID ancestry is racy — a short-lived reader can exit before we read `/proc`, so we snapshot process metadata inside the FUSE handler synchronously and accept a per-open cost. Second hard part: token cardinality — a busy repo can mint thousands per day; we coalesce by (package, version, variable) with a rolling window.

## v1 scope

- Node only, no FUSE.
- One token type: DNS-callback subdomain.
- One allowlisted app path gets real values; everything else gets dye.
- `dye watch` prints a live line per read; `dye hits` lists callbacks.

## Out of scope

FUSE/other languages, AWS/GCP shaped tokens, team dashboards, blocking or killing the offending process, browser/bundler contexts.

## Risks & unknowns

A package that reads `.env` for legitimate config (some CLIs do) will break on fake values — needs a fast allowlist workflow. Sophisticated malware may fingerprint the honeytoken format. Stack-based attribution is defeatable by an attacker who reads the file via a worker or native addon.

## Done means

In a sandboxed VM, install a locally-published test package whose `postinstall` reads `.env` and DNS-resolves each value's host; within 60 seconds `dye hits` names that package, its version, and the specific variable — and the real credentials never left the daemon.
