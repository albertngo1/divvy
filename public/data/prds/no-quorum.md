## Overview

A CLI (`noquorum`) that takes a JSON document and runs it through many real parsers in their real runtimes, then reports where they disagree about what the document *means*. For backend engineers who move JSON across language boundaries — Python producer, Go service, Postgres `jsonb` column, JS client — and keep getting bitten at 2am.

## Problem

JSON is not one format, it's a dozen mutually-incompatible dialects wearing a trench coat. `9007199254740993` round-trips through Go and dies in JavaScript. Duplicate keys are last-wins in Python, first-wins in some parsers, an error in others. Postgres `jsonb` silently drops key order and duplicate keys. `-0`, lone surrogates (`\uD800`), `1e400`, `\u0000` inside a key, 200-deep nesting — each has a different victim. Today you discover this from a production diff, not from a tool.

## How it works

`noquorum check payload.json --witnesses py,node,go,rust,jq,postgres`

Each *witness* is a ~40-line program that reads bytes on stdin, parses with its native library, and emits a **canonical typed tree**: newline-delimited `path\ttype\trepr` where numbers are emitted as exact decimal strings, strings as escaped codepoint sequences, and key multiplicity is preserved. The runner hashes each witness's canonical output and groups witnesses into equivalence classes. Output is a matrix plus a plain-English hazard line per split:

```
$.order.id   int64-overflow   node, python(float) ≠ go, rust, postgres
$.tags       dup-key-policy   postgres(last) ≠ python(last) ≠ jq(last) ≠ rust(error)
```

`noquorum shrink` delta-debugs the payload down to the minimal fragment that causes the split. `noquorum guard fixtures/*.json --profile py,go,postgres` is the CI mode: exit nonzero if any fixture leaves the equivalence class your actual stack forms.

## Technical approach

Runner in Go (single static binary, no runtime deps). Witnesses live in one prebuilt multi-stage Docker image (~600MB) so nothing is installed on the host; a `--native` mode uses whatever's on `PATH`. Witnesses: CPython `json`, Node `JSON.parse`, Go `encoding/json` into `interface{}`, Rust `serde_json` (with and without `arbitrary_precision`), `jq`, Postgres `SELECT $1::jsonb`, Jackson, `System.Text.Json`, PHP, Ruby, simdjson.

The genuinely hard part is the canonical form: it must surface *semantic* differences while ignoring cosmetic ones. Go's map iteration order is not a real difference; Postgres discarding key order is. So the canonical form records key order only as a flag (`order-preserved: yes/no`) rather than in the tree, and numbers are normalized to exact decimal via each language's highest-fidelity path so "lossy" is detectable rather than hidden. Hazard classification is a rule table matched against the shape of the split, not an LLM.

## v1 scope

- Four witnesses: Python, Node, Go, Postgres
- One command: `noquorum check file.json` → matrix + hazard names
- Canonical form spec, ~80 lines, documented
- Hand-written corpus of 25 pathological payloads as the test suite

## Out of scope

Schema validation. JSON5/YAML. Fixing anything. Streaming/huge files. A web UI.

## Risks & unknowns

Witness fidelity — a sloppy canonicalizer manufactures fake disagreements and destroys trust; every hazard needs a regression fixture. Docker image size may push people to `--native`. Unclear whether people run this proactively or only after being burned (CI mode is the answer, if the fixtures exist).

## Done means

On a payload containing a 2^53+1 integer and a duplicate key, `noquorum check` splits Node from Go with hazard `int64-overflow`, splits Postgres from Python on `order-preserved`, and `noquorum shrink` reduces a 4KB document to the 30-byte fragment that causes it.
