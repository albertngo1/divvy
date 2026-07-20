## Overview
Tilth turns Land Atlas-style agronomy into a Wordle-shaped daily puzzle for the dirt-curious: aspiring homesteaders, ag nerds, and anyone who's ever wondered if their backyard could grow anything. Each day you get one real soil profile drawn from public survey data and must pick which crop the ground actually supports.

## Problem
Soil suitability is buried in dense USDA reports and pro GIS tools. Land listings say 'great for farming!' with zero evidence. There's no low-stakes, fun way to build intuition for what a given dirt can and can't grow — the exact intuition that saves people from buying unfarmable land or planting doomed gardens.

## How it works
Each day presents a 'soil card': texture class, dominant horizons, pH, drainage class, available water capacity, slope — pulled from a real parcel (anonymized location). You're shown four candidate crops and pick the one that thrives; a second guess-mode lets you rank all four. On submit, the game grades against real agronomic thresholds and reveals *why* (e.g. 'blueberries want pH 4.5–5.5; this soil is 7.2 — too sweet'). Streaks, and an emoji share showing which soil traits you weighed. A 'My Address' mode lets you fetch your own parcel's profile and test crops against reality — the dangerously-useful turn.

## Technical approach
Static SPA. Data from USDA SDA (Soil Data Access) REST for US parcels and ISRIC SoilGrids REST for global fallback — both free, no key. Crop thresholds from FAO EcoCrop / USDA suitability ranges compiled into a static JSON table (`crop -> {pH range, drainage tolerance, texture prefs, min AWC}`). Daily puzzle generator (offline cron) samples a parcel, queries soil horizons, and picks four crops where exactly one clearly wins and one is a near-miss trap. Grading is a rules engine scoring each crop's fit across dimensions. Hard part: sourcing clean, contradiction-free soil records and tuning distractor crops so puzzles are learnable, not coin-flips.

## v1 scope
- 14 pre-generated daily puzzles from real SDA parcels
- Static crop-threshold table for ~20 common crops
- Single-pick answer, reveal-with-reasons, streak counter
- Emoji share of the trait you leaned on

## Out of scope
- Live 'My Address' fetch, climate/frost-date modeling, irrigation, yield simulation

## Risks & unknowns
- SSURGO data gaps/nulls in some parcels break puzzle generation
- Real agronomy is multi-factor; oversimplified thresholds may mislead
- Distractor balance — too easy or unfair without hand-tuning

## Done means
A player completes a daily puzzle, gets it graded against real USDA soil data with an agronomically correct explanation, and can share a spoiler-free emoji result.
