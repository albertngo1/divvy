## Overview

A local CLI + report tool that measures traffic-analysis leakage in *your* HTTPS app. You define a set of labeled "classes" (which dashboard page loaded, which of 12 chat responses streamed, whether the user was logged in), it drives them repeatedly through a local proxy, and it tells you how well an adversary who sees only TLS record lengths and timings can tell them apart. Then it simulates padding policies and shows the accuracy-vs-bytes tradeoff. For anyone shipping SSE/websocket streaming, an autocomplete endpoint, or a "private" health/legal app.

## Problem

Everyone assumes TLS ends the conversation. It doesn't: token-by-token LLM streaming leaks response length and shape, autocomplete leaks keystrokes, and a 12-page admin panel is trivially fingerprinted by resource-size vectors. There is academic literature and zero developer tooling. Nobody knows if their own endpoint leaks, and "just pad it" has an unmeasured cost.

## How it works

1. Write a small YAML manifest: classes, and for each a driver (a `curl` line, a Playwright script, or a replayed request body).
2. `lengthonly capture` runs each class N=50 times through a `mitmproxy` addon that records, per flow, an ordered trace of `(direction, tls_record_size, delta_t_ms)` — no plaintext stored.
3. `lengthonly score` featurizes traces (total bytes, record-count, size histogram, first-20-record vector, burst boundaries by 50ms gap) and trains a gradient-boosted classifier with stratified 5-fold CV. It reports top-1 accuracy vs the 1/k baseline, a confusion matrix, and empirical mutual information in bits.
4. `lengthonly pad` replays captured traces through simulated policies — fixed 512B buckets, next-power-of-two, exponential padding (Nithyanand et al.), constant-rate cover with configurable dummy budget — and re-scores each, emitting a Pareto plot: attacker accuracy on the y-axis, bytes-and-latency overhead on the x-axis.

## Technical approach

Python. `mitmproxy` addon hooking `tls_data`/`tcp_message` for record-level granularity (HTTP-level hooks are too coarse — this is the detail everyone gets wrong). Storage: one Parquet file per run, schema `run_id, class, trial, seq, dir, size, t_us`. scikit-learn `HistGradientBoostingClassifier`; MI via the Kozachenko–Leonenko estimator on the feature space plus a simple discrete plug-in on quantized total-bytes. Padding simulation is a pure function over the trace — no re-capture needed, which is what makes the Pareto sweep cheap. Report is a single self-contained HTML file.

The hard part: making capture *reproducible*. Nagle, TLS record coalescing, HTTP/2 frame packing, and CDN buffering all reshape traces run to run. v1 pins HTTP/1.1 to a local origin and reports a stability metric (per-class variance) so users know when a result is noise.

## v1 scope

- 2 class drivers: raw `curl` command, and replay-a-JSON-body
- Capture, score, one HTML report
- Exactly two padding policies: fixed buckets and next-power-of-two
- Sizes only — timing features behind a flag

## Out of scope

HTTP/3/QUIC, real network captures (pcap), website-fingerprinting over Tor, automatic patching of your server, multi-page browsing sequences.

## Risks & unknowns

Capture noise swamping real signal on remote origins; over-claiming (a lab-perfect classifier is not a real adversary — the report must state the closed-world assumption loudly); mitmproxy TLS-record hooks may need a small patch.

## Done means

Against a demo server serving 8 fixed pages, `lengthonly` reports >90% top-1 accuracy with no padding, <20% after next-power-of-two padding, quantifies the byte overhead of that padding within 5% of ground truth, and produces the Pareto HTML in under 3 minutes on a laptop.
