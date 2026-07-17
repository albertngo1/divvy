## Overview
A CLI + container harness that simulates a *negative* leap second against your services, so ops teams can find what breaks before the real one lands. For sysadmins, SREs, and anyone running time-sensitive infra (schedulers, TLS, Kafka, financial batch jobs). Think 'Y2K checker' for the never-before-tested case of a clock that skips backward by one second.

## Problem
Every leap second so far has been *positive* (a repeated 23:59:60). A negative leap second — deleting 23:59:59 so 23:59:58 → 00:00:00 — has never happened, and the IERS is voting in October 2026 to potentially schedule the first one (Earth's rotation is speeding up). Vast amounts of code assume time is monotonic and that every second exists. Nobody can test their stack against an event that has literally never occurred. I can manufacture that event cheaply in a sandbox; the niche can't.

## How it works
1. `leapback run --at 2026-12-31T23:59:58Z ./docker-compose.yml` spins your services up inside a fake-clock namespace.
2. The harness drives a virtual clock that reaches 23:59:58, then jumps straight to 00:00:00 (the deletion), optionally testing both the 'step' and 'smear' handling strategies (Google-style linear smear vs. hard step).
3. It probes reactions: fires the cron scheduler across the boundary, forces a TLS handshake (cert notBefore/notAfter math), pokes NTP clients, and runs user-supplied assertion scripts.
4. Report: a timeline of every service's behavior across the discontinuity, flagging negative `time.Since()` results, doubled/skipped cron fires, assertion failures, and panics.

## Technical approach
Stack: Go CLI. Clock virtualization via `libfaketime` injected with `LD_PRELOAD` into each container, plus a controller that advances `FAKETIME` on a scripted curve (including the backward step). For kernel-time consumers, run under a time namespace (`CLONE_NEWTIME`) where possible. Scenario definitions in YAML: boundary timestamp, smear vs step, list of probes. Assertion runner executes user hooks and captures stdout/exit. Data source: IERS Bulletin C for the real candidate date once announced, pre-seeded so the countdown is live. Hard part: faithfully modeling the *variety* of how systems handle a non-existent second — libfaketime doesn't natively express 'this second does not exist', so the controller has to synthesize the discontinuity and detect where the OS silently clamps vs. steps.

## v1 scope
- Single-container mode: `leapback run --image myapp --at <ts>`.
- libfaketime step across a deleted second + one built-in probe (cron fire count).
- Text report of anomalies + exit code.

## Out of scope
- True kernel/NTP-daemon-level simulation across a cluster.
- Windows / non-libfaketime runtimes.
- Auto-fixing anything.

## Risks & unknowns
- libfaketime can't perfectly emulate a second that never existed; some bugs only show at the syscall/kernel layer.
- The vote may not even schedule one — but the tool is still the definitive 'are we ready' checker and rides the news.
- Distinguishing real bugs from libfaketime artifacts.

## Done means
Run a toy service with a cron that fires at 23:59:59 UTC through `leapback`; the report correctly shows that fire was skipped and flags a negative-duration measurement in the app log, with a clean pass on a service that handles the step gracefully.
