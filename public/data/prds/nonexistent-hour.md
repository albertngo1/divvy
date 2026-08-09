## Overview

A CLI that takes a test command you already have and re-executes a chosen subset of it under a matrix of hostile wall-clock situations — the 2:30 AM that doesn't exist, the 1:30 AM that happens twice, Lord Howe's 30-minute DST step, Samoa skipping December 30th entirely, Kathmandu's :45 offset, Iran abolishing DST mid-2022. For any backend/dev who has shipped a billing, scheduling, or reminders feature and privately hopes it holds up in March.

## Problem

Date arithmetic breaks in exactly two hours a year, in timezones you don't live in, and the bug reports arrive six months later as "the invoice was dated wrong." Nobody writes tests for DST gaps because nobody remembers which zones have interesting ones, and hand-picking `America/New_York` misses every genuinely weird case. The current state of the art is vibes plus one `TZ=UTC` in CI.

## How it works

`nh run --tests tests/test_billing.py -- pytest` executes the target once per hostile pair. Each run sets `TZ` and freezes the clock a few seconds before a transition. Failures are collected, then delta-debugged: the tool bisects offset direction, gap-vs-overlap, and freeze offset to report the smallest reproducer — "fails only when local time is inside a backward transition and the frozen instant is within the repeated hour: `TZ=Australia/Lord_Howe`, `2026-04-05T01:45:00`." A `--emit` flag writes those pairs out as a permanent parametrized test file, so the finding becomes a regression test rather than a terminal scrollback.

## Technical approach

Go binary, no runtime dependency on the tested language. The corpus is *generated*, not hardcoded: parse the compiled tzdata files under `/usr/share/zoneinfo` (TZif v2/v3 — transition times, type indexes, ttinfo records) directly, extract every transition for the next 24 months plus a slice of history, and classify each into buckets — forward gap ≥ 60 min, forward gap < 60 min, backward overlap, offset change with no DST flag change, sub-hour standard offsets, negative-DST zones (Ireland), zones with no transitions at all. Farthest-point-sample one representative per bucket to land at ~40 pairs. Clock freezing goes through `libfaketime`'s `LD_PRELOAD`/`DYLD_INSERT_LIBRARIES` with `FAKETIME` set; for interpreted stacks, an optional shim (`freezegun`, `@sinonjs/fake-timers`) is injected via env var so monotonic and wall clocks diverge realistically. The hard part is failure triage: tests that hardcode a UTC-shaped assertion fail under every pair and are noise, so a first pass tags any test failing on ≥80% of pairs as "timezone-naive test" and reports it separately from "timezone-naive code."

## v1 scope

- TZif parser + bucket classifier, corpus emitted as JSON
- `nh run -- <cmd>` with `TZ` matrix only (no clock freezing)
- Pass/fail table, sorted by weirdness of the zone
- `libfaketime` support behind a flag, Linux + macOS

## Out of scope

Static analysis of source, leap seconds, Julian/Gregorian history, Windows, parallel execution.

## Risks & unknowns

`libfaketime` on macOS needs SIP-sensitive injection and may silently no-op. Slow suites × 40 runs is brutal — mitigated by requiring a test selector. Some "failures" are legitimately unrepresentable times where throwing is correct behavior.

## Done means

On a seeded repo containing three real DST bugs (recurring-event expansion, midnight rollover, duration subtraction), `nh run` finds all three, and each minimal reproducer is a pair a human would not have guessed.
