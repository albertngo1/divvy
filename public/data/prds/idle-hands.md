## Overview
Idle Hands is an incremental/idle game whose 'clicks' are your actual physical activity. Steps mine raw ore, time in heart-rate zones smelts and refines it, and — inverting the usual grind — rest and sleep days generate the highest passive yield. For fitness-trackers who want their real effort to *fund* a satisfying number-goes-up loop without gamifying themselves into overtraining.

## Problem
Step-count apps and idle games both live or die on the daily check-in dopamine, but neither respects rest. Most fitness gamification punishes days off, quietly nudging users toward burnout. The itch: I want the compounding, tickle-brain progression of an idle game, powered by data I'm already generating, that treats recovery as a *reward*, not a gap.

## How it works
Each synced day converts activity into resources: steps → ore, active minutes → smelting throughput, distinct workout types → new machine unlocks. Rest days and good sleep charge a 'foundry battery' that runs offline production overnight — so a genuine recovery day out-earns a mediocre junk-mile day. You spend accumulated metal on machines, prestige layers, and cosmetic factory upgrades. A weekly 'audit' shows which real habit drove the biggest gain.

## Technical approach
Stack: local web app (React + IndexedDB) or a small self-hosted service. Data source: Garmin Connect (via the garmin MCP endpoints already on the homelab — `get_daily_steps`, `get_stats`, `get_sleep_data`, `get_training_readiness`, `get_activities`) and/or Strava. Nightly job pulls yesterday's totals, maps them through a tunable production formula, and appends to an event log; game state is a pure fold over that log so it's replayable and tamper-evident. Idle math: standard incremental cost-curve (exponential building costs, prestige multipliers) with an offline-earnings integral capped by the 'battery' from sleep/readiness. Hard part: an economy balanced so a real human's ~6–12k steps/day feels rewarding but not trivially maxed, and so rest genuinely competes with activity without incentivizing sloth.

## v1 scope
- One resource (ore) + one refined good (ingots)
- Three buildings with exponential cost curves
- Daily Garmin steps + sleep pull → production + offline battery
- Single screen, numbers and a couple of factory sprites

## Out of scope
- Prestige layers, multiplayer, leaderboards
- Multiple trackers / OAuth for arbitrary users (hardcode one account)
- Mobile app

## Risks & unknowns
- Economy tuning is the whole game; easy to make boring or exploitable.
- Garmin sync latency/gaps → production stutters; need graceful backfill.
- 'Rest earns most' could feel unintuitive; UX must sell it.

## Done means
After a real week of synced data, the game shows measurably higher output on a well-slept rest day than on a low-effort active day, all state reconstructs correctly from the event log after a wipe, and I actually want to open it the next morning.
