## Overview
Conveyor is a factory-automation game for people who bounce off spreadsheet budgeting. Your monthly income is raw ore entering on a conveyor belt; you build a factory of splitters, buffers, and machines that route every dollar to a destination. It's zero-based budgeting reskinned as Satisfactory — the thing budgeters are told to do, made into the thing factory-game players love to do.

## Problem
Budgeting apps show you the past as pie charts; they don't make the *allocation* itself feel like a system you're engineering. Factory builders nail the dopamine of "find the bottleneck, fix the flow" — but that intuition never gets pointed at the one throughput problem everyone actually has: where their money goes. A belt visibly backing up is a better "you're overspending" signal than a red bar in an app.

## How it works
You place a **Source** (monthly income) and route belts into **Sinks** (rent, groceries, debt, savings). **Splitters** divide flow by ratio or fixed amount; **Buffers** are sinking funds that fill over months and drain on a schedule (annual insurance, holidays). Run the sim forward: units flow at income cadence, and any Sink whose demand exceeds supply *starves* (red), while surplus with nowhere to go *overflows and piles on the floor* — your unallocated money, made physical. You redesign the layout until nothing starves and overflow lands in the Savings sink. A "stress test" injects a surprise $800 car repair and shows which belts choke.

## Technical approach
Browser game, TypeScript + a canvas/WebGL renderer (PixiJS). Core is a small **discrete-event throughput simulator** on a directed graph of nodes; each tick pushes integer "dollar packets" along edges with per-edge rate caps, backpressure when a downstream buffer is full, and starvation when upstream is dry — the same conservation-of-flow math a factory game uses, which conveniently is also double-entry accounting. State is a JSON graph (nodes, edges, ratios) in localStorage. The hard part is making backpressure *legible*: animating a belt visibly congesting so the player feels the bottleneck, not reads it. Later: import a bank CSV to auto-seed Source and label Sinks from transaction categories.

## v1 scope
- Source, Splitter (ratio + fixed), Buffer, Sink node types
- Hand-entered income and bills
- Forward sim with starvation/overflow visuals
- One "surprise expense" stress button
- localStorage save

## Out of scope
- Bank/Plaid sync
- Multi-account, investments, taxes
- Mobile layout, multiplayer

## Risks & unknowns
- Could feel like a toy, not a plan — needs the sim to map cleanly to a real month.
- Backpressure animation is the whole game feel; if it reads as noise, it fails.
- Fixed vs. ratio splitters interacting can create unsolvable graphs; need a solver hint.

## Done means
A user lays out their real income and five bills, runs the sim, sees exactly one Sink starve, adds a splitter to fix it, and the surprise-expense button visibly chokes the belt they'd expect.
