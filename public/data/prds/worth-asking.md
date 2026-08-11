## Overview

Worth Asking measures which inputs actually move a model's output. Point it at a prompt template plus a corpus of real filled-in records — support tickets, quoting forms, triage intakes, RFP responses — and it returns a per-field influence score: how much the answer changes when that field is removed. For ops and product people who own a form or a prompt and suspect half of it is ritual.

## Problem

When a required field is missing, an LLM does not hesitate; it confidently fills the gap from priors. That has two consequences nobody measures. First, forms keep fields that never change any downstream answer, so users abandon them. Second, the fields that *do* matter fail silently — the model produces an equally fluent answer without them, so the pipeline never signals "I guessed the load-bearing fact."

## How it works

Upload a prompt template with `{{field}}` slots and a CSV of past records. The tool runs, per record: a baseline answer, then leave-one-out ablations with each field blanked. It samples k answers per condition and scores divergence against baseline — cosine distance on embeddings for free text, total-variation distance for categorical or numeric outputs. Output is a ranked table: fields sorted by mean influence, with the tail flagged **deletable** and the head flagged **load-bearing — and silently guessable**, meaning the model produced a confident answer without it. Live mode flips this into an adaptive intake: ask the highest-expected-influence question first, condition on the answer, re-rank, and stop when the next question's expected influence falls below a threshold. Typical result: a 23-field form collapses to six.

## Technical approach

Python + FastAPI, Claude API for generation (Haiku 4.5 for the ablation sweep, Sonnet 5 for the baseline), a local embedding model for divergence scoring, SQLite for runs. Cost control matters: a 20-field, 200-record sweep at k=8 is ~32k short calls, so batch with prompt caching on the shared template prefix and cache-key on `(record, ablation set)` — the sweep is embarrassingly parallel and idempotent. The genuinely hard part is **correlated fields**: if `zip_code` is present, ablating `state` looks harmless, so pure leave-one-out understates both. v1 mitigates with greedy forward selection — start from empty, add the field with the largest marginal divergence reduction, repeat — which gives an honest minimal sufficient set, and reports the LOO/forward gap as a redundancy warning between field pairs. Live mode's question chooser is greedy value-of-information: sample plausible answers to each unasked field from the model itself, marginalize, pick argmax expected divergence. Confidence calibration is measured too: baseline-vs-ablated self-reported certainty, so "answered just as confidently without it" is a first-class column.

## v1 scope

- CLI: template file + CSV in, ranked influence table out
- Leave-one-out only, k=5, free-text outputs only
- One redundancy warning per correlated pair
- Printed cost estimate before the run starts

## Out of scope

Web UI, live adaptive intake, categorical output scoring, non-Claude providers, anything that edits your actual form.

## Risks & unknowns

Embedding distance may be too blunt for outputs whose meaningful variation is a single number. Small corpora give noisy scores. The uncomfortable finding — "your compliance-required field is statistically inert" — is true but not always actionable, and users may not want to hear it.

## Done means

Run it on a real 20-field intake template with 100 records; it names a specific field whose removal changes nothing, and removing that field from the live form produces byte-comparable answers on a held-out set of 20 records.
