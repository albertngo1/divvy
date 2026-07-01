## Overview
Cordon is a browser puzzle game that turns the Kubernetes scheduler into a falling-block challenge: pods of varying CPU/memory 'shape' descend and you place them onto a row of nodes without overcommitting, chasing affinity bonuses and surviving node failures. For infra people who'll never touch a real scheduler for fun but feel the pain in their bones — sparked by 'I ported Kubernetes to the browser.'

## Problem
Bin-packing under constraints is the actual daily job of a cluster, and it's genuinely game-shaped — yet it's invisible, buried in a control loop. There's no toy that makes the *tension* of scheduling (this pod needs a GPU node, that one can't co-locate, this node just died and evicted everything) felt and fun. Cordon exposes the puzzle that Kubernetes hides.

## How it works
The board is 3–5 node columns, each a bucket with a CPU height and a memory width. Pods fall one at a time as blocks whose dimensions = their requests; you slide them left/right and drop them onto a node that has room. Fit tightly and you clear pressure; overcommit and the node OOM-kills, cascading evictions (blocks fly out, score penalty). Twists escalate: pods with `nodeAffinity` glow and only score on matching nodes; anti-affinity pairs explode if co-located; a random node gets `cordon`ed (grayed, no new pods) or `drain`ed (dumps its pods back into the falling queue). You survive as long as you keep utilization high without tipping any node over. Speed ramps like Tetris.

## Technical approach
Pure front-end: TypeScript + a canvas renderer (or PixiJS), no backend. Core data structures: each node is `{cpu_cap, mem_cap, cpu_used, mem_used, taints[]}`; each pod `{cpu_req, mem_req, affinity, anti[]}`. The placement check is a literal miniature scheduler predicate (fits + tolerates taints + satisfies affinity) reused as both the *game rule* and the *legal-move highlighter*. A deterministic seeded RNG (`mulberry32`) drives the pod queue so daily-challenge seeds are shareable and reproducible. Scoring rewards packing efficiency (sum of node utilization each tick) minus eviction penalties. The genuinely hard part is *tuning the difficulty curve and pod distribution* so the game is tense but winnable — too many affinity pods and it's unplayable, too few and it's plain Tetris; this needs playtesting and a parameterized generator.

## v1 scope
- 3 nodes, pods with CPU+memory only (no affinity yet)
- slide/drop controls, OOM-kill on overcommit, cascading eviction
- score = cumulative utilization, game-over when queue overflows
- one shareable daily seed

## Out of scope
- affinity/anti-affinity/taints (v2 twists)
- real kubeconfig import or actual cluster interaction
- multiplayer, accounts

## Risks & unknowns
Does the CPU-height/memory-width 2D block metaphor read intuitively, or confuse? Difficulty tuning is unproven. Risk it feels like reskinned Tetris unless the eviction cascade is genuinely distinct and satisfying.

## Done means
You can play a full session in-browser: pods fall, you pack three nodes, overcommitting a node visibly OOM-kills and evicts its pods back into play, the score reflects packing efficiency, and replaying the same daily seed produces the identical pod sequence.
