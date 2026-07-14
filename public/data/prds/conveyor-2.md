## Overview
Conveyor is a self-hosted observability dashboard that renders a background-job system as a factory-automation game board, à la Satisfactory. It's for backend engineers who run queue workers and find Grafana line charts hopelessly abstract when a queue is misbehaving at 2am.

## Problem
Job queues are deceptively tricky (per the Lobsters post): backpressure, poison messages, uneven fan-out, starved priorities, and retry storms are all invisible in a scalar "depth: 4,213" gauge. You can't *see* that one slow worker is starving a belt, or that retries are looping a job back to the front. Humans read spatial flow far faster than time-series overlays.

## How it works
Each queue is a conveyor belt; enqueued jobs are items sliding along it at a speed proportional to arrival rate. Workers are machines that pull items, glow while processing (duration = animation length), and emit finished/failed items down output belts. Backpressure is literal: when a worker can't keep up, items pile and the belt visibly congests and turns red. Retries route a bad item back onto a loop belt with a counter above it — a poison message becomes an obviously spinning object. Fan-out jobs split a belt into merge/splitter nodes. You can click any item to see its payload and history, and click a machine to see its worker's current job and p95.

## Technical approach
Stack: a Node/TypeScript backend polling the queue's native introspection (BullMQ exposes jobs + states over Redis directly; Sidekiq via its Redis keys; Celery via the events stream). It diffs queue state every ~500ms into a stream of `{item_id, from, to, state}` transitions pushed over WebSocket to a Canvas/WebGL front end (PixiJS) that interpolates item positions between snapshots. Data model mirrors a factory graph: `Belt(queue)`, `Machine(worker/consumer group)`, `Item(job)` with a small ring buffer of recent transitions for the loop/animation. The genuinely hard part is faithful-but-cheap layout: mapping a dynamic queue topology to a stable spatial graph without items teleporting when workers scale, plus keeping the animation honest under high throughput (sample/aggregate belts above N items/sec so it stays legible, and *say* you're sampling).

## v1 scope
- BullMQ + Redis only
- Read-only view: belts, worker machines, in-flight items, congestion color
- Poison/retry loop belt with retry counter
- Click an item to inspect payload + state history

## Out of scope
- Sidekiq/Celery adapters
- Any control actions (retry/kill from the UI)
- Historical playback / recording

## Risks & unknowns
- 500ms polling may miss short-lived jobs; may need native event hooks
- Very high throughput could overwhelm rendering — sampling must degrade gracefully
- "Cute" risk: must stay a real diagnostic, not just an animation

## Done means
Running against a live BullMQ instance, Conveyor shows items flowing into worker machines in real time, and when I `sleep()` one worker the belt visibly congests and reddens within two seconds — matching the actual queue depth.
