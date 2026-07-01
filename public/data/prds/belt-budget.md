## Overview
Belt Budget is a cashflow planner that models your money as a Satisfactory-style factory. Income is raw ore dumped onto an input conveyor; bills and subscriptions are machines that consume it; savings and investments are the finished product piling up in storage. You balance belt throughput until nothing is starved. It's for people who bounce clean off spreadsheets but happily sank 200 hours into optimizing production ratios.

## Problem
Budgeting apps are ledgers. They tell you what already happened, in rows. They never show your money as a *flowing system* with a bottleneck you can find and tune. Factory-game brains don't want a transaction history — they want to see which machine is starved and by how much.

## How it works
You drag nodes onto a canvas. A Miner (income source) outputs $/month onto a belt. Belts split into Constructors (fixed bills), Refineries (variable spend), and a Storage container (savings). Every machine has a demand rate. If a machine's input is below its demand it flashes "starved"; if a belt overflows, you're leaking money somewhere. You tune the split percentages until the factory runs balanced. A monthly "tick" advances the sim using your recurring items: overproduction fills savings storage, underproduction shows red backpressure at exactly the machine that's short.

## Technical approach
React web app with React Flow for the node-graph belt canvas. Data model: a directed graph — nodes {type, rate, period}, edges {sharePct}. Throughput is solved with a topological pass computing $/month per edge, the same ratio math Satisfactory players do by hand; starvation is any node where demand > supplied input. Recurring items import from a bank CSV export (Plaid sandbox optional later), auto-classified into miners vs constructors by transaction sign and recurrence detection. A "clock speed" slider models savings-rate scenarios. The hard part is turning messy real transactions into stable machine rates (recurrence detection), and keeping the flow solver stable across splits, merges, and debt-payoff cycles.

## v1 scope
- Manual node entry only
- One income miner, N bill machines, one savings container
- Static ratio solve + starvation highlight

## Out of scope
- Bank import / Plaid
- Scenario clock-speed slider
- Debt cycles, mobile layout

## Risks & unknowns
The cute metaphor could obscure the actual dollars — every belt must map cleanly to a real $/month figure. The graph solver has nasty edge cases around splits, merges, and loops.

## Done means
Enter your income and five recurring bills; the belts display exact $/month; when bills exceed income the precise starved machine and its shortfall are highlighted, and whatever's left flows visibly into savings storage.
