## Overview
`lastonewins` is an open-source CLI plus a paid hosted CI service that finds places where a JSON document means different things to different parts of your stack. It is aimed at teams running polyglot services — a Go edge, a Java ledger, a Python analytics job, a Postgres `jsonb` column — where the wire format is assumed to be lossless and isn't.

## Problem
JSON has no int64, no decimal, no defined duplicate-key rule, and no key-order guarantee. So `{"amount": 9007199254740993, "fee": 0.1, "id": "a", "id": "b"}` is four separate landmines. JS silently rounds the amount. Postgres `jsonb` deduplicates `id` (keeping the last), reorders keys, and rejects `\u0000` in strings outright. Python parses `0.1` as a float but `Decimal` if you asked nicely. Go rejects `NaN`; Python accepts it. Nobody notices until a reconciliation report is off by a cent, or a webhook signature computed over re-serialized JSON stops verifying. Contract tests don't catch it because both sides pass their own tests.

## How it works
1. You point it at a corpus: OpenAPI `examples`, recorded traffic (HAR / VCR cassettes), or a grammar fuzzer seeded from your JSON Schema.
2. Each document is fed to N runtimes, each of which prints a **canonical normalized form** — a typed s-expression with exact decimal literals, byte-level string encoding, explicit key multiplicity, and preserved order.
3. Divergences are grouped into named classes (`int53-truncation`, `dupkey-resolution`, `decimal-widening`, `nul-in-string`, `key-order-loss`, `nonfinite`, `depth-limit`) and delta-debugged down to a minimal reproducer.
4. Output is a **lie map**: your schema, annotated per JSON-Pointer with which hops in your declared service graph are unsafe. `checkout(go) → ledger(java)` clean; `ledger(java) → analytics(js)` loses `/lines/*/amount`.
5. CI gate: fail the build if a new field lands on an unsafe hop.

## Technical approach
Rust CLI orchestrating pinned OCI images: Node 22 (`JSON.parse`), CPython (`json`, `orjson`), Go `encoding/json` + `json.Number`, Rust `serde_json` (arbitrary_precision on/off — those differ from each other), Java Jackson, Ruby, and Postgres 17 via `SELECT $1::jsonb`. Each image ships a ~60-line `canon` binary emitting the normal form on stdout. Diffing is a tree-walk over parallel canonical ASTs keyed by JSON Pointer, with multiplicity-aware keys for duplicates. Minimization is ddmin over the token stream. A checked-in quirks registry (YAML) documents known behaviors so a divergence renders as prose, not a diff dump. The hard part is the canonical form itself: it must be expressive enough to distinguish `1.0` from `1` from `1E0` without inventing differences that don't matter downstream — that calibration is the product.

Business: OSS core (devtools must be open source), paid CI runner with the prebuilt matrix, a maintained quirks registry, and an exportable "JSON contract report" that payments and B2B integration teams attach to partner onboarding. Buyers: fintech, healthcare EDI, anyone moving money as integers.

## v1 scope
- Three runtimes: Node, CPython, Postgres `jsonb`
- Five divergence classes, `int53` and `dupkey` first
- Input: a directory of `.json` files
- Output: a colored terminal table + `--json` for CI

## Out of scope
- Fuzzing from schemas (start with a real corpus)
- YAML, CBOR, MessagePack
- Auto-fix / codemods

## Risks & unknowns
- Container startup dominates runtime; needs a persistent worker per image
- Noise: over-reporting `1.0` vs `1` will get it uninstalled on day one
- Teams may already know and not care

## Done means
Run it over a corpus containing a >2^53 integer, a duplicate key, and a `\u0000` string; it reports exactly three divergences with minimal reproducers, names the affected JSON Pointers, and exits nonzero.
