## Overview
Torn Write is a loadable SQLite VFS shim plus a test harness. It runs your existing test suite against a disk that fails realistically and deterministically, then tells you the minimal sequence of I/O faults that breaks your durability assumptions. For anyone shipping SQLite as a production datastore — Electron apps, edge servers, embedded devices, homelab services — who has never actually tested what happens when the machine loses power at the wrong microsecond.

## Problem
"SQLite is crash-safe" is true about SQLite and false about *your app*. WAL mode plus `synchronous=NORMAL` means a power cut can roll back committed transactions; a filesystem that lies about fsync (plenty do) breaks the ordering the journal depends on; a torn write to the WAL header is recoverable but a torn write to your application-level invariants is not. Testing this today means dm-flakey, a VM, and a weekend. So nobody does, and the corruption reports arrive from users instead.

## How it works
`tornwrite run --seed 41 -- pytest tests/` loads the shim VFS ahead of the unix VFS and counts every `xWrite`/`xSync`/`xTruncate`/`xOpen`. A seeded PRNG picks a *fault schedule*: at op #N inject one of — hard crash (`_exit`, page cache discarded), torn write (only the first 512B of a 4096B write lands), silent no-op fsync, reordered unsynced writes flushed in reverse, `SQLITE_IOERR_WRITE`, `ENOSPC`, delayed-then-dropped sync. After the crash, the harness reopens the database directory as-is, runs `PRAGMA integrity_check`, then runs *your* invariant script (`tornwrite.check.sql` — e.g. "every order has a payment row and the balances sum to zero").
On failure it delta-debugs: ddmin over the fault schedule, re-running with the same seed until it finds the one- or two-fault minimal witness, and emits a replayable `schedule.json` plus a plain-English narration: "op 214: fsync of `app.db-wal` returned success without flushing; op 219: process died. Transaction #88 was reported committed and is now absent."

## Technical approach
The VFS is ~600 lines of C registered via `sqlite3_vfs_register`, wrapping the default unix VFS and delegating everything except the injected fault — distributed as a loadable extension, so no rebuild of SQLite. The harness is Rust or Go: it snapshots the db directory (hard-link copy) before each trial, sets `TORNWRITE_SEED`/`TORNWRITE_OP`, forks the test command, and classifies the postmortem. Determinism is the crux — the op counter is only stable if I/O ordering is stable, so v1 requires single-connection, single-threaded tests and refuses (loudly) otherwise. Realistic crash semantics is the other hard part: a true power-loss model must discard everything not fsynced, which means buffering writes in the shim rather than trusting the kernel page cache.

## v1 scope
- Two fault types only: no-op fsync, and hard crash at op N
- Linux + macOS, single-threaded, WAL mode only
- Linear scan over N (not ddmin) to find the first failing op
- Output: the failing op index and which invariant broke

## Out of scope
Multi-process/WAL2, network filesystems, Windows, non-SQLite databases, filesystem-level (dm-flakey) fidelity.

## Risks & unknowns
Nondeterministic apps make the op counter useless — how big is the population of tests that are actually single-threaded? Some faults SQLite is genuinely immune to, so most schedules will pass and the tool will feel boring until it isn't. Buffering writes in userspace may itself be a source of false positives.

## Done means
On a deliberately-wrong demo app (`synchronous=OFF`, a two-statement "transaction" outside BEGIN), Torn Write finds and minimizes a fault schedule that produces a durability violation in under 60 seconds, and the same schedule reproduces byte-identically from `schedule.json` on a second machine.
