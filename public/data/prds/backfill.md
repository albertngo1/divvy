## Overview
A single-player puzzle game about the secret art of batch scheduling. Each level hands you a stream of incoming jobs — each with CPU/memory requests, a priority class, a deadline, and sometimes a gang requirement (all-or-nothing co-scheduling) — and a cluster of nodes with finite capacity. You author placement and eviction rules to maximize throughput without missing deadlines. Directly inspired by kubernetes-sigs/kueue.

## Problem
Real schedulers (Kueue, YARN, Slurm) encode deep, counterintuitive tradeoffs — backfilling short jobs into gaps, preempting low-priority pods, avoiding gang-scheduling deadlock — that almost nobody outside infra teams appreciates. There's no fun on-ramp to that intuition, and 'ops as a puzzle genre' (à la the Quorum protocol game) is proven but underexplored.

## How it works
Each level presents a node grid (capacity bars) and a timeline of arriving jobs. You place jobs into node slots; jobs occupy space for a duration then free it. Tools unlock across levels: **backfill** (slot a short job into a gap ahead of a blocked big job without delaying it), **preemption** (evict a running low-priority job — it re-queues, costing points), **gang-scheduling** (a 4-pod job runs only if all 4 fit simultaneously — reserve carefully or deadlock). Later levels shift from hand-placement to writing a small rule DSL (`if job.priority > 2 and node.free >= job.req: place`) that a deterministic scheduler executes, and a solution is scored on jobs completed, deadlines hit, and eviction waste.

## Technical approach
Stack: TypeScript + a canvas/DOM renderer, no backend. Core is a deterministic discrete-event simulator: a priority queue of (time, event) advancing job arrivals, completions, and your scheduler's decisions — fully replayable/seedable so daily puzzles and shareable solutions work. Data model: `Job{req, dur, prio, deadline, gangId}`, `Node{capacity, running[]}`, `Level{jobStream, nodes, objective}`. The rule DSL parses to a tiny AST interpreted each tick. Hard part: hand-designing levels with a real difficulty curve where backfill/preemption/gang mechanics each become *necessary*, plus a fair deterministic tie-break so the same rules always yield the same score.

## v1 scope
- Hand-placement only (no DSL yet), ~8 levels introducing packing → backfill → preemption → gang.
- Deterministic sim + score (completed, deadlines-hit, waste).
- Emoji-grid shareable result for a daily seed.

## Out of scope
- The rule DSL editor (v2), multiplayer/leaderboard.
- Realistic autoscaling, network topology, affinity/taints.

## Risks & unknowns
- Making scheduling *feel* tactile rather than like homework.
- Balancing so backfill/preemption are clearly rewarding, not fiddly.
- Onboarding non-infra players to the vocabulary without a wall of tutorial text.

## Done means
A player completes the 8-level v1, encounters at least one level unsolvable without backfill and one unsolvable without preemption, and two players running the same daily seed with identical placements get identical scores.
