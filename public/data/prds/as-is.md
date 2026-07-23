## Overview
A single-player, browser-based management roguelike about the genuinely weird economics of the second-hand AI-compute market: nobody knows what a used GPU cluster is worth. You run a shady home inference farm, buying blind 'as-is, no returns' lots and turning uncertain silicon into rent.

## Problem
Tycoon games usually give you perfect information — a card lists exact stats. Real GPU arbitrage is fog-of-war: was this H100 mined on for two years, memory-degraded, firmware-locked, or a repainted dud? The fun, untapped mechanic is *appraisal under uncertainty plus a farming loop*, wrapped in a market that lurches with hype cycles. No game models the 'used cluster is worth ???' thesis as a core loop.

## How it works
Each run is ~30 in-game days. Phase 1 (auction): pallets appear with vague listings ('12× datacenter-pull, powers on, as-is'). You spend limited cash on lots seeing only noisy signals — seller reputation, a blurry photo, a suspicious price. Phase 2 (bench): you burn time and electricity stress-testing cards to reveal hidden condition (dead / throttled / abused / gem), each test trading time for information. Phase 3 (operate): healthy cards join your rack and earn passive rent by serving distributed inference jobs, but generate heat and draw power against a monthly utility cap that trips breakers if exceeded. A ticking market index (the 'bubble') swings resale and rent prices; a crash event can wipe your book, so do you flip fast or farm long? Permadeath on bankruptcy; meta-unlocks (better multimeter, a landlord who ignores the amp draw) carry across runs.

## Technical approach
TypeScript + a lightweight ECS, rendered in Canvas or plain React; state in a reducer so runs are deterministic from a seed (roguelike-friendly, shareable seeds). Each GPU is an entity with hidden fields (trueHealth, abuseHistory, firmwareLock) and revealed estimates that tighten as you spend test-actions — a simple Bayesian narrowing (prior from listing text, likelihood from each bench result). Market is a mean-reverting random walk with rare jump events. Power/heat is a small constraint solver: sum(draw) vs cap, heat accumulates and throttles rent. Hard part is economic tuning — making blind-buy variance feel skill-expressive, not a slot machine; needs playtesting so information-gathering has a clear positive expected value.

## v1 scope
- One seeded 30-day run, permadeath, cash score
- Auction → bench → operate loop with ~6 card archetypes and hidden condition
- Power cap + heat throttling; one market index with crash event
- Three meta-unlocks

## Out of scope
- Multiplayer/market vs other players, real GPU data feeds
- Art beyond icons, audio, save-cloud

## Risks & unknowns
- Variance tuning: blind buys must reward skill, not pure luck
- Theme may feel niche outside HN readers
- Balancing test-cost vs info gain is the whole design

## Done means
A player can complete a full seeded run end-to-end in the browser, the same seed reproduces identical lots and market swings, and a skilled player who benches before buying finishes with measurably higher median cash across 20 runs than one who buys blind — proving appraisal is a real edge.
