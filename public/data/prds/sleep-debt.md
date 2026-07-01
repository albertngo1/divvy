## Overview
Sleep Debt is a one-run-a-day deckbuilding roguelike where your actual overnight sleep is the seed *and* the stakes. For quantified-self people who ignore their sleep score and Slay-the-Spire players who want a daily with skin in the game.

## Problem
Sleep trackers hand you a number you can't act on, and roguelike dailies use arbitrary seeds nobody has a relationship with. Make the night you actually had into the deck you actually play — one hand, no rerolls.

## How it works
Each morning the app pulls last night's sleep stages. Deep-sleep minutes mint strong Focus/Vigor cards; REM mints Insight (card draw); light and awake time mint Fog — dead-weight curse cards shuffled in. Your rolling sleep *debt* (deficit vs your personal baseline) becomes the boss modifier: more debt, tougher encounter. You play a ~10-minute run; winning "pays down" the debt cosmetically, losing leaves a scar on your log. Exactly one hand per real night.

## Technical approach
Data via the Garmin Connect MCP already running in the homelab (:8003), or an Apple HealthKit export; a nightly job snapshots `{deep, rem, light, awake, hrv}`. The day's run is deterministic: `seed = hash(date + sleepVector)` feeds a mulberry32 PRNG, so the deck and encounter are fixed once the night is recorded. Card generation is a pure mapping from the sleep vector to a card multiset; combat is a Slay-the-Spire-lite resolver (energy/block/attack). Stack: React, seeded PRNG, local persistence. The hard part is a fair mapping when data is missing or weird (naps, travel, a dead watch battery) and stopping reroll-cheese — hence snapshotting the night server-side so editing the file can't rewind fate.

## v1 scope
- Pull one night, generate a ~10-card deck
- One 3-enemy encounter, deterministic seed
- Debt → boss modifier
- No meta-progression

## Out of scope
- Multi-day campaigns, real health advice
- Android, any PvP

## Risks & unknowns
Garmin auth/rate limits. The emotional trap: "bad sleep = you lose" reads as blame — keep it playful and always winnable, just harder. Missing-data days need a graceful default hand.

## Done means
Two different nights produce two different, reproducible decks; the same night always reproduces the exact same run.
