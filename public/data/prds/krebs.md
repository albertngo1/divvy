## Overview
Krebs is an idle/management factory game where the plant you're building is a single cell's energy metabolism, and its raw-material throughput is fed by your actual movement pulled from Garmin/Apple Health. It's for people who love Satisfactory-brand belt-optimizing but want the loop wired to their real body — and for anyone unsettled by the HN finding that sedentary people show early decline in cellular energy production.

## Problem
Fitness apps nag with rings and streaks; factory games are pure escapism disconnected from life. Neither turns "I sat all day" into a felt, mechanical consequence. Krebs makes activity the ONLY renewable input to a system you've emotionally invested in optimizing — so a lazy day isn't a guilt notification, it's your beautifully-tuned Krebs cycle grinding to a halt for lack of substrate.

## How it works
You build a metabolic factory: glucose intake → glycolysis → the citric-acid (Krebs) cycle → electron-transport chain → ATP output, laid out as connected modules with buffers between them. Each day's steps/active-energy convert to "substrate" delivered to the intake. ATP output powers cell upkeep (a constant drain) plus upgrades you buy to widen bottlenecks. Move a lot and buffers overflow — you must expand downstream capacity. Sit for days and buffers drain, modules idle, and a "decline" debuff dims the plant until you re-feed it. It's an idle game whose idle resource is you.

## Technical approach
Stack: web app (Svelte + Canvas/PixiJS) so it runs anywhere; state in IndexedDB. Data source: Apple HealthKit via a thin native wrapper, or Garmin/Google Fit; MVP can start with a manual/HealthKit CSV import and a mocked feed. Sim: a discrete tick loop moving units through a directed graph of modules, each with rate + buffer capacity — essentially a min(rate, upstream_supply, buffer_space) flow solved per tick, the same math Factorio-likes use. Balancing = choosing conversion constants so a realistic 6-8k steps sustains a mid-game plant. Hard part: making a fundamentally slow, real-time-gated economy still fun minute-to-minute — solve with an offline-catch-up resolver that fast-forwards the flow sim from last-open to now and shows a satisfying "while you were away" report.

## v1 scope
- Fixed linear pathway (4 modules) with buffers
- Manual daily step entry OR single HealthKit read
- Substrate feed, ATP output, upkeep drain, decline debuff
- Buy 3 upgrade types (rate, buffer, efficiency)
- Offline catch-up report on open

## Out of scope
- Branching pathways, multiple cell types
- Real-time wearable streaming
- Social/leaderboards
- Scientific accuracy beyond flavor

## Risks & unknowns
- HealthKit permissions/native wrapper friction on web
- Punishing inactivity could feel like health-shaming — tune decay to be recoverable, never a wipe
- Getting the fun/step-rate balance right will need real playtesting

## Done means
With a day's step count entered, substrate flows through all four modules, ATP accrues above upkeep, buying a rate upgrade visibly speeds the line, and entering zero steps for a simulated three days triggers the decline debuff and buffer drain — all correctly reproduced by the offline catch-up resolver.
