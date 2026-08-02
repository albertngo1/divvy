## Overview

A CLI that stamps a per-recipient identifier into a prose document such that the stamp is still recoverable after the document has been rewritten by an LLM. For anyone who circulates confidential drafts to many parties — board memos, unreleased research, term sheets, embargoed press material — and wants to know which copy leaked.

## Problem

Every deployed text watermark dies to one attack that now takes eight seconds: paste into a chat model, say "rewrite this in your own words," copy out. Zero-width characters die. Whitespace encoding dies. Synonym substitution dies. Manual canary traps (giving each recipient a slightly different sentence) die too, because the sentence is exactly what gets rewritten. Meanwhile the *content* survives that attack almost perfectly — that's the whole point of paraphrase — and nobody encodes into content.

## How it works

Bits ride on semantic invariants: choices a faithful paraphrase preserves because changing them would change what the document says.

Carrier families in v1:
1. **List order** — the sequence of items in an unordered enumeration. A rewriter keeps all five items; it rarely reorders them. log2(5!) ≈ 6.9 raw bits per list.
2. **Exemplar choice** — where the doc says "for example, X," the encoder swaps in one of k pre-vetted equivalent examples.
3. **Numeric precision** — "41%" vs "about 40%" vs "roughly two in five." Survives rewrite as a fact.

Encoding: recipient ID → Reed–Solomon codeword → spread across all carriers with heavy repetition, because carriers get destroyed unpredictably. Each candidate edit is checked by a judge model for semantic equivalence and naturalness before it ships.

Decoding: extract the same features from the leaked text (paraphrased, truncated, reordered), compute a per-carrier posterior, soft-decode to a recipient plus a likelihood ratio and a p-value against a null model of "unmarked document." Output is "recipient 7, LR 340:1," never a bare accusation.

## Technical approach

Python. Carrier detection is deterministic (markdown AST for lists, spaCy for numerals and `e.g.` frames) — the LLM only proposes and verifies replacements, never locates carriers, so the decoder needs no model. `reedsolo` for the outer code. Attack harness runs each marked doc through: paraphrase at temp 0.3/0.7/1.0, round-trip translation via NLLB-200, 50% truncation, and summarize-then-expand.

The hard part is the capacity/detectability tradeoff. Surviving bits are expensive — realistically one per 120–200 words — so a 4-bit ID needs a real document, and pushing capacity makes the marked copies look edited. Second hard part: calibrating the null so false accusation rate is provably tiny.

## v1 scope

- Markdown in, markdown out, single file
- Three carrier families, 16 recipients (4 bits)
- `ownwords mark --recipient 7 doc.md` / `ownwords trace leaked.txt`
- One paraphrase attacker in the harness

## Out of scope

PDFs, images, code, legal admissibility, an adversary who has read this PRD.

## Risks & unknowns

A knowledgeable adversary strips it by sorting every list alphabetically. Short documents may carry no reliable bits at all. Judge model may approve a swap that quietly changes meaning — that's a real-world harm, not just a bug.

## Done means

Across 100 marked documents × 5 attacks, correct recipient recovered ≥90% of the time at a measured false-positive rate ≤1% against 1,000 unmarked control documents.
