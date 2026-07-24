## Overview
Deadman is a tiny local HTTP/HTTPS forward proxy that sits between your dev machine (and the coding agents running on it) and the internet. It watches outbound request patterns in real time and auto-trips a circuit breaker when it detects a runaway loop — before your script hammers a public host into the ground or burns $400 of tokens. For developers running LLM agents, scrapers, and CI-in-a-loop locally.

## Problem
The Simon Willison writeup of OpenAI's accidental crawl of Hugging Face is the nightmare made real: an automated system, meaning no harm, emits millions of requests and effectively attacks a service. On a smaller scale this happens constantly — an agent stuck in a retry loop, a `while true` that forgot its backoff, a test suite pointed at prod. You find out from an angry email, a rate-limit ban, or a billing alert the next morning. Nothing on your own machine is watching the *shape* of your egress.

## How it works
You run `deadman up` and export `HTTPS_PROXY=localhost:8899`. Every outbound request is tallied into a sliding-window sketch keyed by destination host + normalized path + method. Deadman computes three live signals: request rate per host, self-similarity (are the last N requests near-identical — a tight loop?), and error-response ratio (are you getting 429/5xx and *still* hammering?). When any host crosses a configurable trip threshold, Deadman returns synthetic `429`s locally, fires a desktop/ntfy alert, and writes a one-screen incident card: which process, which host, the offending request template, requests in last 60s. `deadman resume <host>` clears it. A `--paranoid` mode blocks-then-asks instead of trip-after-threshold.

## Technical approach
Go, using `goproxy` for MITM with a locally-trusted CA (generated on first run, installed into the system keychain). Per-host token-bucket + a count-min sketch for cheap rate/dedup at high volume. Self-similarity via SimHash over method+host+path+sorted-query, Hamming-distance clustering in a ring buffer. Process attribution on macOS/Linux by mapping the proxy's accepted socket back to a PID via `lsof`/`/proc/net`. Config in `~/.deadman.toml` with per-host overrides and an allowlist for hosts that are *supposed* to get 10k req/min. The genuinely hard part: distinguishing legitimate high-throughput bursts (batch embedding, paginated backfill) from pathological loops without nagging — SimHash self-similarity plus rising error ratio is the discriminator, and the thresholds need real-world tuning.

## v1 scope
- Forward proxy with local CA, HTTPS MITM
- Per-host rate + SimHash loop detection, single global trip threshold
- Synthetic 429 on trip + terminal incident card + ntfy webhook
- `deadman resume`, TOML allowlist

## Out of scope
- eBPF/transparent interception (proxy env var is fine for v1)
- Windows, mobile
- Team dashboards, historical analytics

## Risks & unknowns
- Cert-trust friction; some tools ignore `HTTPS_PROXY` or pin certs
- False trips on legit batch jobs — mitigated by allowlist + paranoid opt-in
- Attribution flaky under connection pooling

## Done means
A scripted agent stuck in a tight retry loop against a test server gets tripped to 429 within 60s and 500 requests, I get an ntfy alert naming the PID and host, and `deadman resume` restores flow — while a legit 300-request paginated backfill to an allowlisted host completes untouched.
