## Overview

A B2B monitoring service that finds **timezone-database drift across a company's own stack** and turns it into a dated forecast of breakage. Buyers: anyone whose product schedules things for humans in other countries — airlines, telehealth and clinic booking, payroll/HRIS, field-service dispatch, cross-border logistics, calendar SaaS.

## Problem

Governments change DST rules with as little as two weeks' notice (Lebanon 2023, Iran abolishing DST 2022, Chile, Morocco's Ramadan shifts, Egypt's 2023 reinstatement). IANA ships a tzdata release; then every runtime updates on its own schedule — or never. Your Java service bundles `tzdb.dat` from its JRE build, Postgres uses the OS `/usr/share/zoneinfo`, Node uses ICU baked into the binary, and the mobile app uses whatever the phone has. Nobody owns "what tzdata version is running in production," so the failure surfaces as a support ticket six months later: an appointment booked at 09:00 fires at 10:00, or a job lands inside a local hour that does not exist.

## How it works

1. Customer runs three one-liner probes (a `SELECT` against Postgres, a Node snippet, a shell `cat` of the zoneinfo `+VERSION`) — or installs a 5MB agent that reports per-host.
2. We collect the *set* of tzdb versions live in their fleet, plus their traffic's top 20 IANA zones (from a CSV or their CDN logs).
3. For each pair of versions present, we diff compiled TZif binaries and emit every instant in the next 400 days where the two disagree on UTC offset.
4. Output: a **disagreement calendar** — "2026-10-30 00:00 Africa/Cairo: Postgres (2025b) and Node (2026a) differ by 60 min. Also: 3 nonexistent local times and 2 ambiguous ones in your booking window." Plus a fuzz harness that replays their staging booking API at exactly those poisoned instants with `TZ` and clock faked.
5. Subscription value: when tz-announce posts a new rule, subscribers get the impact diff within an hour, before the release even lands in their base images.

## Technical approach

- TZif v2/v3 parser in Go (transition times, local time types, leap seconds) reading directly from `data.iana.org/time-zones/releases/*.tar.gz`; we compile every release since 2018 with `zic` and store transitions in Postgres as `(zone, version, transition_utc, offset_secs, is_dst)`.
- Diff = merge-walk of two sorted transition lists → interval list of disagreement, intersected with the customer's zone set. Nonexistent/ambiguous local times fall out of the same walk (gap = spring-forward, fold = fall-back).
- Version fingerprinting when no agent is allowed: probe a public endpoint that echoes a converted timestamp for ~30 discriminating (zone, instant) pairs; the response vector maps to a small set of tzdb versions — a classifier over a precomputed lookup table.
- Fuzz harness: ephemeral containers with `TZ` set and `libfaketime` pinned to each poisoned instant, hitting the customer's staging OpenAPI spec.
- Hard part: fingerprinting through APIs that never expose local-time conversion, and keeping the discriminating-probe table correct as releases accumulate.

## v1 scope

- Three copy-paste probe commands; paste output into a web form.
- 40 most-populated IANA zones, tzdata 2018a → present.
- One output: a PDF/HTML disagreement calendar for the next 400 days.
- Email alert on new tz-announce release, hand-triggered.

## Out of scope

Agent, CI integration, the fuzz harness, mobile/ICU fingerprinting, non-IANA (Windows CLDR) mapping.

## Risks & unknowns

May be a one-time audit rather than a subscription — the tz-announce alert feed is what makes it recurring. Some fleets are uniform and get a clean bill of health; that report still needs to feel worth paying for. Big shops may consider this an internal SRE task.

## Done means

Given a fleet with Postgres on tzdata 2022g and Node on 2026a, the tool outputs the exact UTC instant and zone of the first disagreement, and a hand-check against `zdump -v` for that zone confirms it to the second.
