## Overview
Rollover is a satirical idle/tycoon browser game about the AI capex bubble: you stack GPU floors into a tower that mints 'compute revenue,' but every floor is bought with debt you must perpetually roll over at a climbing interest rate. Bridges three HN threads — 'The Tower Keeps Rising,' the BIS bulletin on financing the AI boom with debt, and 'Financing the AI boom.' For finance-brained tinkerers and anyone who enjoys watching a leveraged number go up until it doesn't.

## Problem
Idle games abstract money into a frictionless resource that only grows. The real AI-datacenter story is the opposite — growth *is* leverage, and the tension is refinancing risk. No idle game models the thing that makes the current boom precarious: debt that must be rolled over into a rising-rate environment. The itch is to feel that tension in a five-minute loop.

## How it works
Core loop: each floor of GPUs produces compute/sec → sold for cash → but floors are financed by term loans that mature. When a tranche matures you must *roll it over* into a new loan at the prevailing rate. Cash flow servicing debt = fine; miss it and floors get repossessed (the tower literally shrinks, Jenga-style). A macro rate curve drifts and occasionally rate-shocks. Prestige mechanic: 'go public' (IPO) to reset with permanent multipliers, satirizing the exit. Idle accrual continues offline; you return to either a taller tower or a crater. Difficulty is entirely leverage discipline — over-build and a rate shock buries you; under-build and rivals (background AI) out-scale you.

## Technical approach
Pure client-side (TypeScript + canvas/Pixi), state in localStorage, offline accrual computed from elapsed time on load. Economic model: floors as an array with per-tranche principal, maturity, and rate; a discrete-time loop advances compute revenue, opex (power!), and debt service. Rate curve is a scripted stochastic process (mean-reverting Ornstein-Uhlenbeck-ish, seeded) with scheduled shock events; optionally modulated by a real signal — pull FRED's effective federal funds rate via API to set the baseline drift so each real week feels different. Collapse logic: when cash < debt service for N ticks, repossess highest-leverage floors. Hard part: balancing so the tower is *usually* survivable but leverage greed is genuinely punished — a tuning problem in the debt-service ratio.

## v1 scope
- Tower of floors, compute→cash→debt-service loop
- Debt tranches with maturities and a drifting rate curve
- One scripted rate-shock event; repossession on default
- Offline accrual; single IPO/prestige reset

## Out of scope
- Real FRED integration (scripted curve for v1)
- Competitors, multiplayer, real economics accuracy
- Monetization

## Risks & unknowns
- Idle-tycoon fatigue; needs the debt tension to actually bite
- Balance between 'always survivable' and 'greed kills you'
- Satire could read as either sharp or tired depending on execution

## Done means
A playable tower that rises via debt-financed floors, forces at least one rollover decision and survives-or-collapses a scripted rate shock, persists offline accrual across reloads, and offers one prestige reset.
