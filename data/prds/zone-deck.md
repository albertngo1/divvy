## Overview
Zone Deck is a Slay-the-Spire-style roguelike deckbuilder whose cards are minted from your *real* training log. Each run pulls your last ~30 days from Strava (or Garmin), turns every activity into a card, and sends you into turn-based encounters. For quantified-self athletes whose months of data currently just sit behind graphs.

## Problem
Fitness apps hoard your effort behind inert charts. You generate rich data every week and it *does* nothing. Deckbuilders, meanwhile, are one of the stickiest loops in games. Graft that loop onto the log you already produce, and consistency becomes deck synergy.

## How it works
Every real activity becomes a card. A long slow run → a high-block defense card; intervals → a burst-damage card; a PR → a rare card; a rest day → a scarce, powerful heal/energy card — so overtraining genuinely thins your healing. You draft ~10 cards from your recent pool and fight encounters. Skipped weeks leave dead slots; a well-varied training block builds real synergy. Next week's actual workouts refresh the pool, so the metagame *is* your training.

## Technical approach
Local web app (TypeScript). Data via Strava API `/athlete/activities` or the Garmin Connect MCP already running at :8003, normalized to `{type, duration, HR_zones, distance, PR?}`. A deterministic card-minting function maps activity features → card stats (zone-time → damage curve, TRIMP → energy cost). Combat is a simple turn-based state machine with seeded RNG for enemies; runs persist in IndexedDB. The hard part is a minting formula that is *fair and legible* — players must feel "my tempo run made THIS card" — while staying balanced across wildly different athletes. Solve it by normalizing per-user against their own baseline rather than absolute distances.

## v1 scope
- Connect Strava, import last 30 days
- Fixed-rule card minting, ~10-card deck
- One enemy, one encounter
- Rest-day heal card present and visibly scarce

## Out of scope
- Full roguelike map, relics, live sync, Garmin path (Strava first), multiplayer

## Risks & unknowns
OAuth friction; balancing across user fitness levels; sparse-data athletes get thin decks (seed with a few starter cards). Making the mapping feel *earned* not arbitrary.

## Done means
I connect Strava, my last 30 days become a playable deck, I fight and finish one encounter, and I can point to at least one rest day that appears as a heal card in my hand.
