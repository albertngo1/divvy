## Overview
Payday Run reframes personal cash-flow as an extraction-shooter loop (à la Hunt: Showdown / PAYDAY). Money that lands in checking is 'loot on the ground'; your job each pay cycle is to *extract* it into savings, bills, and goal buckets before it gets eaten. For people who understand budgeting intellectually but never *feel* the cost of letting money idle.

## Problem
Spreadsheets and budgeting apps are passive ledgers — they report the past and generate zero urgency. The dangerous window is the days after payday when cash sits undirected in checking and quietly leaks into impulse buys. The itch: a loop that makes *moving money on time* feel like a run you can win or lose.

## How it works
Each pay cycle is a 'run.' Incoming pay drops as loot. You allocate (extract) it into fortified buckets: rent, savings, sinking funds, a goal. Every day cash sits unallocated in checking, 'spend gremlins' get stronger and nibble a small penalty; large discretionary transactions spawn a mini-boss you must consciously 'fight' (confirm/justify) to defeat. Successfully extracting the whole paycheck before the next deposit = a clean run and a streak reward. Missed extractions and overspend end the run early and dent your streak.

## Technical approach
Stack: local web app (SvelteKit + SQLite), read-only bank data via Plaid (or, homelab-friendly, a nightly CSV import from bank exports / an existing Actual/Firefly-III instance). Data model: `account`, `transaction(ts, amount, category)`, `bucket(name, target)`, `run(cycle_start, cycle_end)`. The game layer is a deterministic reducer over transactions: it classifies each as loot (income), extraction (transfer to a tracked bucket), or leak (discretionary), and computes gremlin strength = f(idle_balance × days_idle). Boss triggers on transactions above a percentile threshold. Hard part: reliable transfer/allocation detection from raw bank data — telling a real savings transfer from a shuffle between checking accounts — without manual tagging every line.

## v1 scope
- Manual CSV import of one checking account
- Define 3 buckets + one recurring pay amount/date
- Daily 'idle cash' penalty + end-of-cycle clean-run/streak scoring
- One screen: loot pile, buckets, streak counter

## Out of scope
- Live Plaid bank linking
- Multi-account, credit cards, investment tracking
- Actual money movement (it observes; it never transfers)

## Risks & unknowns
- Auto-classifying transfers vs. spends is genuinely hard and error-prone.
- Gamifying money can encourage bad optimization (hiding cash to win).
- Budgeting-app fatigue: crowded space, needs the game to actually feel fun.

## Done means
Importing a real month of checking CSV, the app correctly labels my paycheck as loot and my savings transfer as an extraction, applies an idle penalty for cash I left sitting, and reports whether that pay cycle was a clean run.
