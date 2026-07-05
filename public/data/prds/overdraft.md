## Overview
Overdraft grafts the bullet-heaven / auto-battler mechanic (Vampire Survivors, Brotato) onto your real recurring charges. You import a bank/credit CSV; the app extracts recurring subscriptions and bills, and each becomes an enemy type in a top-down survival run whose damage-per-tick equals its real monthly cost. You survive 'the month' by dodging, and you win permanent upgrades by actually canceling subscriptions in real life. It's a mischievous quantified-self roguelite that makes subscription bloat viscerally, arcade-ly annoying.

## Problem
Subscription creep is invisible and boring; budgeting apps show a list and a total that induces guilt, not action. Nobody feels the $14.99 draining every month. Turning each recurring charge into a relentless little monster that literally hurts you reframes 'cancel your dead subscriptions' as clearing a boss.

## How it works
Import CSV → a recurrence detector clusters transactions by normalized merchant + near-constant amount + monthly-ish cadence. Each recurring merchant becomes an enemy: sprite tinted by category, size ∝ dollar amount, spawn rate ∝ frequency. A run is 60 seconds = one billing month; enemies deal contact damage scaled to cost while your 'balance' HP drains. Your auto-firing weapon = your income. Between runs you get a real 'cancel checklist'; marking a sub canceled removes that enemy permanently and grants a meta-upgrade (more HP = savings buffer). Annual charges are rare elite mobs; free trials are enemies with a delayed detonation timer.

## Technical approach
Stack: TypeScript + a lightweight canvas engine (Kaplay/Phaser) or plain 2D canvas; fully local, CSV parsed in-browser with PapaParse — no financial data leaves the device (privacy is the selling point). Recurrence detection: group by fuzzy-matched merchant string (token-normalize, strip store IDs), then detect cadence via median inter-transaction gap + amount stddev threshold; classify monthly/annual/weekly. Data model: Subscription{merchant, amount, cadence, firstSeen, category} → EnemySpec{hp, dps, spawnRate, sprite}. Bullet-heaven core is a standard entity pool + spatial-hash collision. Hard part: robust recurrence extraction from messy real-world CSVs with varying merchant strings and irregular dates, without a Plaid-style API — pure heuristic matching that doesn't over/under-count.

## v1 scope
- Drag-drop one CSV, in-browser parse
- Heuristic recurring-charge detector with a manual confirm/edit list
- One survival run: WASD dodge, auto-fire, HP = starting balance
- Enemies generated from your real subs; end screen shows monthly bleed total
- Cancel-checklist that removes enemies next run

## Out of scope
- Bank API/Plaid integration, multi-account, live sync
- Meta-progression tree, weapons shop, boss design depth
- Mobile, accounts, cloud saves

## Risks & unknowns
- Recurrence heuristic accuracy on diverse CSV formats
- Fun ceiling: is one 60s run enough loop before upgrades feel needed?
- People may be squeamish loading finances even fully local — needs loud privacy framing

## Done means
I load my own credit-card CSV, the app correctly surfaces ≥80% of my real subscriptions as enemies with cost-scaled damage, I play a full 60-second run, and canceling one in the checklist visibly removes it from the next run's swarm — all offline.
