## Overview
A CLI + one-shot report for teams paying five figures a month to ship logs. It ranks every log *template* by news-bits per dollar and emits a Vector/Fluent Bit config that drops or samples the dead weight — then shows you what you would have lost.

## Problem
Everyone knows most of their log spend is waste; nobody cuts it, because the fear is asymmetric. Deleting the wrong line costs you a 3am incident. So teams either pay, or apply uniform 1-in-10 sampling — which is the worst possible policy, since it preferentially destroys the rare lines and preserves the chatty ones. The missing tool is not a volume dashboard. It is a defensible argument, per template, that a cut is safe.

## How it works
1. Point it at 24h of raw logs (file, S3 archive, or a `vector tap`).
2. Drain3 clusters lines into templates: `user %s logged in from %s` etc.
3. Each variable slot gets typed: **opaque** (UUID, timestamp, request-id, hash), **categorical** (status codes, enum-ish strings), **numeric**, **freeform**.
4. Scoring. A template's value is *novelty against a 30-day baseline*, not Shannon entropy. This is the whole idea: a UUID is maximally random and carries zero diagnostic bits, while `pool=exhausted` appearing after 30 days of `pool=ok` is one line worth the month's bill. Score = arrival rate × KL(current window ‖ baseline) over categorical/numeric slots, opaque slots contribute nothing.
5. Cost. Bytes/hour × your rate card (Datadog ingest + retention tier, Loki chunk cost, S3+Athena) = dollars/hour per template.
6. Output: a ranked ledger, plus a generated transform config — head-drop for constant templates, floor-sampled with a `keep-if-novel` escape hatch, full retention for the long tail.
7. **Counterfactual replay.** Pull incident windows from the PagerDuty or incident.io API, replay the proposed config over the raw logs from those windows, and diff: which lines an on-call actually grepped (from saved queries / Slack pastes) would have survived. This is the section that gets the change approved.

## Technical approach
Python for the offline analyzer (drain3, numpy), Rust or Go if it needs to run inline later. Data model: `template_id, regex, slots[type], baseline_hist (count-min sketch per categorical slot), bytes_total, rate`. Baselines stored as sketches so 30 days fits in megabytes. Novelty uses a per-slot Dirichlet-smoothed KL so a single new enum value spikes without dividing by zero. The hard part is the opaque-vs-categorical classifier: mis-typing a slot as opaque silently blinds you to a real signal, so it needs a conservative default (anything under ~2000 distinct values in 30 days is categorical, not opaque) and a human review step in the report.

## v1 scope
- Reads a local newline-JSON or plaintext file.
- Drain3 + slot typing + one hardcoded rate card (Datadog).
- Markdown ledger: top 25 templates by dollars, bottom 25 by news-bits.
- No config generation — just a copy-pasteable drop list.

## Out of scope
Live inline enforcement, trace sampling, metrics, anything that touches the production pipeline.

## Risks & unknowns
Drain3 struggles with multiline stack traces and JSON blobs. Novelty scoring may over-value flapping templates. Convincing anyone to trust an automated cut is a social problem, hence the replay section.

## Done means
On one real 24h log dump, the tool identifies templates worth ≥30% of the bill, and the incident replay shows zero lines lost from at least three past incidents' query history.
