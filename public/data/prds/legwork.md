## Overview
Legwork is a browser/desktop factory-builder idle game where the single input resource — the ore on your first conveyor belt — is your real-world step count, pulled from Apple Health or Garmin. It's for people who love Satisfactory/Factorio pacing but resent that the games reward sitting for eight hours straight.

## Problem
Incremental factory games are gloriously addictive and completely sedentary. Meanwhile step-goal apps are moralizing progress bars you close and forget. Neither has stakes that connect. Legwork makes walking the literal throughput bottleneck of a base you actually care about optimizing.

## How it works
Every 1,000 steps drops N units of "Ore" onto your factory's input node. You build smelters, assemblers, and belts to refine Ore → Ingots → Components → research, unlocking better machines. Crucially, machines consume Ore *continuously*, so a sedentary day means the factory idles and buffers drain — you come back to a stalled base, not a punishment popup. Streaks of active days unlock "overclock" modules; a big hike floods the intake and lets you finally afford that stuck blueprint. The optimization loop is real factory logic (ratios, throughput, bottlenecks) gated by a resource you can only earn by moving.

## Technical approach
Stack: TypeScript + a small ECS (bitecs) rendering to Canvas/PixiJS, persisted to IndexedDB. Data source: Apple HealthKit via a thin iOS/Shortcuts export, or Garmin Connect `get_daily_steps` on the homelab pushing a daily JSON. Steps map to Ore via a tunable curve (diminishing returns past ~15k so marathoners don't trivialize progression). Factory sim is a fixed-timestep tick over a directed graph of machine nodes with input/output buffers; the genuinely hard part is offline reconciliation — computing what the factory *would* have produced during hours the app was closed, bounded by whatever Ore your steps actually delivered, without letting players game timestamps.

## v1 scope
- One factory grid, 4 machine types (miner-substitute intake, smelter, assembler, research lab)
- Steps ingested via a daily manual CSV/JSON import (no live API yet)
- Ore→Ingot→Component→research tech tree with ~8 unlocks
- Offline catch-up sim capped by delivered Ore

## Out of scope
- Live HealthKit/Garmin auto-sync
- Multiplayer / shared factories
- Fancy 3D; it's a 2D top-down grid

## Risks & unknowns
- Cheating step counts is trivial; fine for a solo toy, fatal if there's ever a leaderboard
- Balancing so a normal 6–8k-step day feels rewarding but not trivial
- HealthKit export friction may kill the daily habit before live sync exists

## Done means
I import a day with 7,412 steps, the factory receives the matching Ore, produces components while I watch, and correctly shows a stalled/drained state after a day I imported as 900 steps.
