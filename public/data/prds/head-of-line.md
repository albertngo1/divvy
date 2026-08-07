## Overview
A browser puzzle/sim for one player who has read exactly one blog post about vLLM. You are the scheduler of a single GPU serving an LLM. A deterministic trace of requests arrives; you decide, tick by tick, who gets prefilled, who decodes, who gets evicted, and who waits. The scoreboard is a Pareto chart, not a high score.

## Problem
Inference-serving internals (paged KV cache, continuous batching, chunked prefill, preemption-by-recompute) are genuinely fun constrained-optimization, but they're locked inside 6000-word systems posts. Nobody has made the intuition playable. Also: every game reduces skill to one scalar, when the real lesson is that you cannot have both p99 TTFT and tokens/sec — you can only pick a point.

## How it works
The screen is two panels. Left: a KV-cache memory map — a grid of fixed-size blocks (16 tokens each), colored by owning request, filling raggedly like a parking lot. Right: the request queue, each row showing arrival time, prompt length, and a *probability bar* for output length (you never know the true length until it emits EOS).

Each tick is one decode step. You get a compute budget per tick. Actions: admit a request (allocate blocks), start or continue a chunked prefill (eats budget proportional to chunk size, and steals it from every decoding request — this is the head-of-line blocking the title names), or preempt a request (free its blocks now, pay full recompute later). Blocks are finite; over-admit and you deadlock into a preemption cascade.

After the trace ends you get two numbers — p99 time-to-first-token and mean output tokens/sec — plotted as a dot. Three baseline schedulers (FCFS, oracle shortest-job-first, a continuous-batching heuristic) are pre-plotted. Your run is only "good" if it's non-dominated.

## Technical approach
TypeScript + Canvas, single static page, no backend. Discrete-event sim: decode cost modeled roofline-style (memory-bandwidth bound, cost ≈ constant + α·batch_size), prefill cost ≈ β·chunk_tokens with a small quadratic attention term. Arrival times and prompt/output length distributions are fitted offline from the public Azure LLM inference trace (AzureLLMInferenceTrace_conv) and baked in as parameters; runtime traces come from a seeded sfc32 PRNG so a seed is a shareable level code. Data model: `Request{id, arrival, promptLen, trueOutLen, hintDist}`, `Block{owner, tokenCount}`, `SchedState{running[], waiting[], swapped[]}`. Pareto set computed by O(n log n) non-dominated sort over all runs stored in localStorage.

Hard part: sim fidelity vs. legibility. If the cost model is too crude the winning strategy is degenerate (admit everything); too rich and the player is doing arithmetic. Tuning target: the continuous-batching baseline must beat FCFS decisively, and a skilled human must beat it only by exploiting the output-length hint.

## v1 scope
- One GPU config, one 30-request trace, ~3 minutes to play
- Preemption = recompute only (no CPU swap)
- Three baselines pre-plotted
- Pareto chart with your dots persisted locally

## Out of scope
Multi-GPU, tensor parallelism, MoE, speculative decoding, LoRA, any real model weights, online leaderboards.

## Risks & unknowns
Could read as homework. Mitigation: the memory map must feel physical — blocks snap, evictions flash red, a stalled decode visibly starves. Second risk: the Pareto framing confuses players who want to "win"; mitigate with a ghost line showing the theoretical frontier from a brute-forced small trace.

## Done means
I can play seed 1234 in under three minutes; my run lands as a labeled dot; an FCFS-imitating play is strictly dominated by the continuous-batching baseline; and beating that baseline requires deliberately deferring a long prefill at least once.
