## Overview
Hung Jury is a CI-installable differential conformance harness for wire formats. You point it at a JSON Schema, OpenAPI spec, or a directory of recorded payloads, and it re-parses each one under the actual runtimes your services use — CPython `json`, Go `encoding/json`, Node `JSON.parse`, Rust `serde_json`, Java Jackson, Ruby, `jq`, and PostgreSQL `jsonb` — then reports every field where the jury hangs. Built for teams whose data crosses a language boundary: payments, claims, IoT telemetry, anything where a silently truncated integer becomes an incident report.

## Problem
JSON is not one format, it is eight approximately-compatible formats with a shared syntax. `{"amount": 9007199254740993}` survives Go and Python and quietly becomes `...992` in Node. Duplicate keys: last-wins in JS, first-wins in some C parsers, error in others. `-0`, `1E400`, lone surrogates, leading `+`, `1.0` vs `1`, key ordering, 2 GB nesting depth — each has a divergence table and nobody has read it. These bugs surface in production as a one-cent discrepancy or a corrupted patient ID, months after the deploy, and they are invisible to every schema validator because every payload is *valid*.

## How it works
1. Config declares boundaries: `orders-api (go) -> billing (python) -> warehouse (node)`.
2. Corpus = your recorded payloads (VCR cassettes, HAR files, a Kafka sample) plus generated adversarial values derived from your schema: for each `integer` field it injects 2^53±1, 2^63−1, `-0`; for each `string`, lone surrogates, NFC/NFD pairs, BOM, `\u0000`; for each `number`, `1E400`, `0.1+0.2` reprs, 40-digit decimals.
3. Each payload runs through every runtime in a container, normalized to a canonical trace: `path -> (kind, exact_bytes_of_value, error?)`.
4. Diff the traces pairwise along declared boundaries only — so you get "Go→Node loses precision at `$.order.id`", not 400 irrelevant pairs.
5. Output: a Markdown table in the PR, a JUnit XML gate, and a persisted baseline so newly-introduced disagreements fail while known ones stay accepted.

## Technical approach
Rust CLI orchestrating per-runtime probe binaries (~60 lines each) over stdin/stdout NDJSON, shipped as one OCI image with all eight runtimes. Canonical trace format encodes numbers as exact decimal strings plus the runtime's own re-serialization, so precision loss is observable without trusting a float compare. Adversarial generation walks the JSON Schema AST and attaches a per-type mutator bank. Baseline diffing keys on `(json_pointer, disagreement_class)` so line noise doesn't churn. Hard part: distinguishing *legitimate* representational difference (key order) from *semantic* loss (2^53 truncation) — that classification is the whole product, and it needs a hand-curated severity taxonomy, not a generic diff.

## v1 scope
- Three runtimes: Python, Node, Go.
- Input: a folder of `.json` files. No schema generation.
- One output: a Markdown table, exit 1 on any new disagreement.
- Number precision + duplicate keys only.

## Out of scope
YAML, protobuf, CSV, XML. Custom serializer hooks. Fixing anything.

## Business
$29/mo indie, $299/mo team for the hosted GitHub App with baseline history and a severity dashboard; the CLI is MIT. Buyers are fintech and health-integration teams who already pay for schema registries and have a postmortem with the words "float precision" in it.

## Risks & unknowns
May find zero disagreements on well-behaved corpora — dead product. Container image will be enormous. Runtime version matrix (Node 18 vs 22) multiplies the jury.

## Done means
A repo with a payload containing `9007199254740993` and a duplicate key fails CI with a table naming both fields, the two runtimes that disagree, and the exact values each produced.
