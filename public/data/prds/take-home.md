## Overview
Take-Home turns personal budgeting into a **factory-builder**. Your monthly take-home pay is a raw-resource node; you lay conveyor belts and splitters routing dollars into 'machines' (rent, groceries, subscriptions, debt) and 'storage' (emergency fund, investing). It borrows Satisfactory's core loop — throughput, ratios, belt balancers, bottlenecks — for people who bounce off spreadsheet budgeting but will happily min-max a factory.

## Problem
Envelope/spreadsheet budgeting is joyless and abstract, so people don't stick with it. The one thing budgeting and factory games share is **ratios under a throughput constraint** — factory games make that viscerally satisfying, budgeting apps make it a chore. Nobody has grafted the fun mechanic onto the boring one.

## How it works
- Import a month of transactions; each recurring category becomes a placeable **machine** with an input rate (its monthly cost) and a little animation that stalls when starved.
- You drag belts from the paycheck node and use **splitters** to allocate percentages — the game snaps to common ratios and can enforce a 50/30/20 target as three output pipes.
- If total machine demand exceeds supply, the line visibly **backs up and jams** at the lowest-priority machine (deficit), turning red. Surplus flows into the savings crate and fills a satisfying storage bar.
- 'What-if' mode: drag a subscription machine off the belt and instantly see the surplus increase downstream. A yearly view accretes into a factory that grew (or seized up) over 12 months.

## Technical approach
- Stack: React + PixiJS (or plain canvas) for the belt/machine layer; all local, no accounts.
- Data in: CSV export or Plaid sandbox; normalize into `{category, monthlyRate, priority}`; recurring-transaction detection via simple periodicity clustering on description+amount.
- Simulation: a static flow solver, not a physics sim — belts are edges in a directed graph, splitters distribute by weight, machines consume at fixed rate; solve max-flow / detect the min-cut bottleneck to decide *which* machine jams first (priority order = user-set).
- Rendering: tile-based belt animation whose speed maps to dollar throughput; a jam is just a queued-particle backpressure animation on a starved edge.
- Hard part: making the factory layout *auto-generate* sensibly from raw transactions so the user starts with a working line, not a blank grid.

## v1 scope
- CSV import, ~8 auto-placed machines, one paycheck node, one savings crate.
- Splitter ratios + a live jam/surplus indicator.
- 'Remove this subscription' what-if with instant downstream update.

## Out of scope
- Live bank sync, multi-account, investment growth modeling, mobile.
- Actual factory-game combat/exploration flavor.

## Risks & unknowns
- Could read as gimmick over utility if the factory metaphor obscures the numbers — keep real dollar labels on every belt.
- Recurring-transaction detection is noisy; may need manual category confirmation.

## Done means
Dropping in a real bank CSV auto-builds a running belt layout, over-spending visibly jams the lowest-priority machine red, and removing one subscription machine increases the savings-crate fill rate by exactly that subscription's monthly amount.
