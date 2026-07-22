## Overview
Cold Spot is a self-hosted diagnostic tool disguised as a ghost-hunting game, for homelabbers and small-team SREs chasing flaky, hard-to-repro failures. It reframes triage as a paranormal investigation: the intermittent bug is a *ghost*, symptoms are *evidence*, and you deduce its *type* from a bestiary of failure archetypes.

## Problem
Grafana dashboards are great at showing you a spike and useless at telling you what it *means*. Intermittent failures — a nightly cron collision, a DNS resolver flaking, a slow memory leak, a connection-pool exhaustion — leave scattered, correlated traces across metrics and logs that a tired human struggles to assemble into a hypothesis. Diagnosis is pattern-matching against experience most homelabbers don't have yet.

## How it works
You point Cold Spot at your Prometheus + a log source and pick a suspect window. It presents an **evidence board**: a set of togglable observations it detected (error-rate 'EMF' surge, a service that went unreachable = 'cold spot', repeating stack-trace 'whispers', a temperature/CPU spike, correlated restart of a neighbor). As in the game, no single ghost shows all evidence. You confirm which readings you actually see; Cold Spot narrows the **bestiary** — Memory Wraith (RSS creep + OOM restart), Poltergeist (cron-collision resource contention), Doppelgänger (DNS/round-robin flapping), Deadlock Revenant (mutual-wait latency cliff) — each with a description and suggested first probe. Getting it right closes the 'contract' and logs a mini post-mortem card.

## Technical approach
Stack: Go backend + a lightweight web TUI (or Textual). It queries PromQL for a curated symptom library (rate-of-change on error counters, saturation on pool gauges, restart counters, per-service reachability) and scans logs (Loki/journald) for burst clustering and repeated fingerprints via SimHash. Each 'ghost' is a declarative rule: `{name, required_evidence[], excluded_evidence[], probe_cmd}`. The board→bestiary narrowing is straightforward constraint satisfaction over evidence bitsets — the fun is in the framing and a well-authored archetype library grounded in real failure modes. Hard part: authoring evidence detectors that fire reliably across heterogeneous homelab stacks without drowning in false positives.

## v1 scope
- Prometheus + journald ingestion for one window
- ~8 hand-authored ghost archetypes
- Evidence board with manual confirm toggles
- Bestiary narrowing + suggested probe command
- A saved 'contract' card per solved incident

## Out of scope
- Auto-remediation
- Multiplayer co-op hunts (fun later)
- Alerting/paging

## Risks & unknowns
Gimmick could wear thin if it doesn't actually shorten real triage. Evidence detectors are the whole game and are stack-specific. Line between 'delightful' and 'unserious for real ops' is thin.

## Done means
Given a homelab with a deliberately injected fault (e.g. a leaking service + a colliding cron), a user who's never seen the code reaches the correct ghost archetype and its suggested probe within five minutes using only the evidence board.
