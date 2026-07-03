## Overview
A deterministic, hand-crafted puzzle game about distributed-systems concurrency — Exapunks meets Postgres transactions meets FoundationDB's actor model. You program the message-passing schedule for a small cluster of nodes so they satisfy a consistency invariant, then watch it survive an adversarial network. For programmers who love TIS-100/Exapunks and anyone who's ever been humbled by a race condition.

## Problem
Distributed consistency is taught with dense papers and hand-wavy whiteboard arrows. Nobody *feels* why two-phase commit blocks, why quorum reads work, or how reordering breaks naive protocols — until they've been paged at 3am. There's a whole genre of programming puzzle games, but none has claimed the richest, most notoriously counterintuitive corner of CS: concurrency under partial failure.

## How it works
Each level gives you N nodes, each holding a tiny register, and a goal invariant (e.g. 'all nodes agree on a committed value' or 'no node commits unless a majority acknowledged'). You author a small per-node program in a tiny message-passing DSL: SEND, WAIT, ACK, COMMIT, ABORT, guarded by local state. Then you press RUN and a scheduler replays your protocol under an adversary that can delay, reorder, duplicate, or drop messages and briefly crash nodes. You win only if the invariant holds across *every* adversarial schedule the level throws (a fixed, curated set — deterministic and replayable). Optimize for fewest messages / lowest latency to climb the leaderboard, Zachtronics-style.

## Technical approach
Pure client-side TypeScript, no backend for v1. Core is a deterministic discrete-event simulator: a priority queue of (delivery_time, message) events, an adversary that enumerates a bounded set of reorderings/drops per level (seeded, so histograms are reproducible). The node DSL parses to a tiny bytecode VM stepped by the event loop. Rendering: Canvas/SVG nodes with animated message packets; a histogram panel scores message-count and latency like Zachtronics. The genuinely hard part is *designing levels* whose intended solution really is a clean protocol (2PC, quorum, Lamport clocks) and whose adversary schedule set is small enough to brute-check yet large enough to reject cheese.

## v1 scope
- Deterministic event-sim VM + 8-instruction node DSL
- 5 hand-built levels culminating in a 3-node commit
- Adversary that drops + reorders on a seeded schedule set
- Pass/fail across all schedules + a message-count score
- Shareable score string

## Out of scope
- Multiplayer, online leaderboards, level editor
- Byzantine faults (crash-fault only in v1)
- Real-network execution — it's a sim, always

## Risks & unknowns
- Level design is expensive and easy to make unfair or cheese-able.
- Adversary schedule enumeration can blow up combinatorially — must bound it carefully.
- Onboarding: the DSL must click in 90 seconds or players bounce.

## Done means
A player can open the browser, complete the tutorial and a 3-node commit level, have their solution verified against the full adversarial schedule set (correctly failing a naive no-quorum attempt), and see a shareable message-count score — all with zero server calls.
