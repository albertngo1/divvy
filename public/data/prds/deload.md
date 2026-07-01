## Overview
Deload is a Vampire-Survivors-style bullet-heaven whose entire daily run is deterministically generated from your real overnight biometrics. It's for the Garmin/Whoop-wearing gamer who checks a 'recovery score' every morning and shrugs — this turns that number into a run you play and rank.

## Problem
Recovery metrics (HRV, resting HR, sleep stages, body battery) are passively consumed: a number, a color, forgotten by lunch. There's no stakes, no comparison, no reason to care about the trend. Meanwhile the daily-seeded roguelike (Slay the Spire's daily climb, Balatro-likes) proves people love competing over one shared seed.

## How it works
Each morning the app pulls last night's stats and derives today's run seed + modifiers. Good HRV/sleep = a 'well-rested' run: fewer elites, +10% XP, an extra reroll. Poor recovery = 'overtrained': denser waves, enemies with more armor, fewer heals — but a higher score multiplier if you survive, so grinding through a rough day is worth bragging about. The core loop is 15 minutes of auto-attacking, weapon-picking, and dodging. Because everyone with the app gets a run tuned to their own body, the leaderboard ranks *performance-vs-your-own-baseline* (percentile of survival time given your recovery band), so a tired player can still top a fresh one. One run per day; streaks matter.

## Technical approach
Stack: TypeScript + a lightweight canvas engine (Kaboom.js or bare 2D canvas with a fixed timestep + spatial hash for thousands of projectiles). Data source: the local Garmin Connect MCP (`get_hrv_data`, `get_sleep_data`, `get_training_readiness`, `get_body_battery`, `get_rhr_day`) — already running on the mac-mini at :8003. A morning cron hits those endpoints, normalizes each metric to a z-score against a rolling 30-day personal baseline, and packs them into a seed struct. The PRNG (mulberry32) is seeded from `hash(date + userId)` so the map/wave layout is fair and shareable; the *difficulty modifiers* come from the biometric z-scores, not the RNG. Data model: Seed{date, layoutSeed, mods{density, armor, xpMult, scoreMult}}. Hard part: making recovery→difficulty mapping feel fair and legible, not punitive — and preventing 'game the game by sleeping', which is arguably a feature.

## v1 scope
- One weapon, one enemy type, one 10-minute survival map
- Pull a single metric (HRV) from Garmin MCP and map it to enemy density
- Deterministic seed from date + local high-score table

## Out of scope
- Online leaderboards / baseline percentiles
- Multiple weapons/relics, meta-progression
- Whoop/Oura/Apple Health adapters

## Risks & unknowns
- Garmin sync latency in the morning; missing-data fallback
- Balancing so 'bad recovery' is spicy, not miserable
- Privacy of shipping biometric-derived seeds if leaderboards go online

## Done means
On two mornings with measurably different HRV, the game generates two runs whose enemy density visibly differs, both fully deterministic on re-launch, ending in a score screen tagged with that morning's recovery band.
