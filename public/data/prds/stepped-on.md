## Overview
`stepped-on` is a model-provenance auditor. Point it at any OpenAI-compatible base URL claiming to serve a frontier model, and it runs a battery of discriminative probes against a baseline fingerprint captured from the first-party API, then issues a verdict per axis: *same weights? quantized? sampling tampered? hidden preamble injected?* For developers buying capacity through relays, gateways, and marketplace resellers, and for anyone whose eval scores mysteriously sagged after switching providers.

## Problem
The token-relay economy has an obvious adverse-selection hole: an endpoint that promises Opus-class output can silently serve an int4 quant, a smaller sibling, a competitor's model, or the right model wrapped in a cost-saving system prompt that truncates reasoning. Buyers have no cheap instrument. Benchmarks are the wrong tool — they measure capability with huge variance, need thousands of tokens, and a 2-point MMLU drop proves nothing. What you want is a *fingerprint*, not a grade.

## How it works
Two modes. `stepped-on baseline --provider anthropic` spends a few dollars against the official API to record reference behavior; `stepped-on audit --base-url https://sketchy.relay/v1` compares. Probe families:
- **Greedy divergence**: ~60 fixed prompts at temperature 0; record the token index of first divergence from baseline and normalized edit distance.
- **Logprob shape**: where `logprobs` are exposed, KL divergence over top-5 distributions at each of ~200 fixed prefixes — the sharpest single detector of quantization.
- **Tokenizer boundary probes**: exact-repeat tasks over strings straddling odd BPE boundaries, mixed scripts, and long digit runs; failure *patterns* are tokenizer-specific.
- **Quantization stress**: tasks that degrade sharply under int4 — 6×6-digit multiplication, needle recall at 32k, rare-token verbatim recall, legal-move enumeration.
- **Wrapper detection**: prompts that surface an injected preamble, refusal-style probes, and max-token/stop-sequence behavior.
- **Timing**: TTFT and inter-token gap distributions, plus streaming chunk granularity.
A sequential probability ratio test decides *same* vs *different* as evidence accrues, so a blatant swap costs pennies and only ambiguous cases burn the full budget.

## Technical approach
Python, httpx with async fan-out, DuckDB for probe results, every raw response persisted as JSONL for audit. Probes are declarative YAML (`prompt`, `params`, `scorer`). Scorers: exact-match, first-divergence index, KL over top-k, regex extraction. Verdict layer uses Wald's SPRT with per-probe likelihood ratios calibrated from the baseline run.

The genuinely hard part is the null hypothesis. First-party APIs are *not* deterministic at temp 0 — MoE routing depends on batch composition — so the baseline run must include paired self-comparisons to establish a natural divergence floor, and the audit must clear that floor, not zero. Second confounder: a reseller silently setting `top_p=0.9` or a repetition penalty looks like different weights. Mitigate by sweeping declared sampling params and checking whether divergence collapses at any setting.

## v1 scope
- 25 probes across three families (greedy, quantization stress, wrapper)
- One provider baseline, one audit target
- Plaintext report card, no SPRT — fixed probe count
- Cost estimate printed before running

## Out of scope
Web dashboard, continuous monitoring, multi-tenant, non-OpenAI-shaped APIs, image models.

## Risks & unknowns
Providers legitimately update models, so "different from baseline" ≠ fraud; false accusations are the main harm, so every verdict must ship its evidence. Logprobs are increasingly unavailable, weakening the best detector.

## Done means
Against a deliberately rigged local proxy (swaps to a smaller model 30% of the time, injects a preamble, serves an int4 quant), v1 flags all three tampering modes and returns *clean* on an honest passthrough of the same API, for under $2 of tokens per audit.
