## Overview
Negative Split is a short daily roguelike seeded entirely by your own physiology. Each morning your Garmin/Strava data generates a bespoke dungeon; the game only rewards a *negative split* — clearing the back half faster than the front — mirroring the running discipline. For runners, quantified-self people, and anyone who wants their wearable to *do* something.

## Problem
We drown in wearable data that mostly becomes a guilt dashboard. Meanwhile roguelikes use throwaway RNG seeds. Marrying them turns yesterday's training into today's level — a reason to open the app that isn't another readiness score you'll ignore.

## How it works
On launch, the game pulls last night's sleep, resting HR, HRV, and yesterday's activity. It maps them to run parameters: sleep score → starting HP; resting HR → enemy aggression; training load → dungeon length; steps → available currency. You descend a compact dungeon; the twist is the *pace gate* — the second half must be cleared in less real time than the first, or the exit locks. A well-recovered body yields a gentler dungeon; overtraining makes it brutal, which is the honest feedback loop.

## Technical approach
Local-first: this repo already has Garmin + Strava MCP servers exposing `get_sleep_data`, `get_rhr_day`, `get_hrv_data`, `get_training_load_trend`, and activity endpoints. A small backend (or a nightly job) snapshots these into a daily seed JSON. The roguelike is a browser game (TypeScript + canvas) whose procedural generator is a pure function of that seed, so the level is deterministic and replayable/shareable. Data model: `daily_seed -> {hp, aggression, length, currency, date}`. The hard part is a mapping that's *fair* — bad sleep should make it harder without making it hopeless, and the metrics must be normalized per-user (your resting HR baseline, not an absolute).

## v1 scope
- Pull four metrics for the current date into one seed
- A minimal 5-room dungeon generated from the seed
- The negative-split timer gate on the exit
- "Today's body" summary screen before you enter

## Out of scope
- Multiplayer / shared leaderboards
- Long meta-progression
- Any live heart-rate input during play

## Risks & unknowns
Wearable APIs are flaky and rate-limited; a missing night breaks the seed (need a graceful fallback). Per-user normalization needs a baseline window. Fun must not depend on the gimmick.

## Done means
On a given morning the game pulls your real metrics, generates a deterministic dungeon, and a worse night visibly produces a harder run than a good night — verifiable by replaying two different days' seeds.
