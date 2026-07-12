## Overview
Round Trip is a browser tycoon-puzzle about *round-tripping*: the real accounting maneuver where Company A invests in Company B, B spends it buying A's product, and both book the same dollar as growth. You're the dealmaker weaving a web of GPU-cloud shells, inflating a paper empire while dodging the auditor. For anyone who read the Nvidia/CoreWeave/Nebius 'circular financing' story and thought *is this even legal?*

## Problem
The circular-financing boom is fascinating and nearly impossible to intuit from prose — the money loops are the whole point, and text flattens them. There's no toy that lets you *feel* how a valuation loop is built, why it looks like growth, and exactly how it unravels.

## How it works
Each level is a graph of company nodes with cash, revenue, and a valuation multiple. You draw directed edges: equity injections, prepaid contracts, vendor financing, GPU leases. Money flowing in a closed loop counts as revenue at every hop, so a $1B seed can inflate the ring's total valuation 5×. Your goal: hit a target aggregate market cap before the funding round closes. But every edge raises an **Audit Heat** meter; an auditor node periodically 'pulls a thread' — traces one dollar around the loop — and any edge whose only economic substance is the loop gets clawed back, cascading writedowns. Win by building loops with enough *real* external revenue mixed in to survive the trace. Daily seeded puzzle with a par 'peak valuation' and a Wordle-style share.

## Technical approach
Pure client-side: TypeScript + a force-directed graph (d3-force or Cytoscape.js) for the deal web. Core is a small deterministic economic simulator — a fixed-point solver that propagates cash through the edge graph each 'quarter' and recomputes valuations = revenue × multiple. The audit trace is a cycle-detection + flow-decomposition pass (find circulations with no external source/sink) that flags substance-free edges. Puzzles authored as JSON graph templates; a generator perturbs seed graphs and verifies solvability by search. The genuinely hard part is tuning the sim so loops feel powerful but a naive all-loop ring is always fatal on audit — a balance problem, not an engineering one.

## v1 scope
- 8 hand-authored levels + one daily seeded puzzle
- 4 edge types (equity, prepay, lease, vendor-financing)
- Audit Heat meter + single-thread trace with cascade animation
- Peak-valuation score + emoji share string

## Out of scope
- Multiplayer / real market data
- Persistent campaign, unlocks, monetization
- Any actual financial-modeling accuracy beyond 'directionally true'

## Risks & unknowns
- Balancing loops-are-strong vs. loops-are-fatal is the make-or-break
- Could read as endorsing fraud — deadpan satire framing matters
- Graph puzzles can get fiddly on mobile; needs generous hitboxes

## Done means
A stranger loads the daily puzzle, builds a financing ring, watches the auditor trace a dollar around it and trigger a writedown cascade, ends with a peak-valuation score and a shareable result — no tutorial needed.
