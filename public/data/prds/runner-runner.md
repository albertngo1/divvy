## Overview
Runner-Runner is a single-player daily deckbuilder in the Balatro mold where your real Garmin/Strava metrics become playing cards. It's for quantified-self folks who are bored of closing rings and want their body data to be a game with actual strategy.

## Problem
Health dashboards are passive and streaks are shallow. "You slept 6h42m" is a number, not a decision. People want their biometrics to feed a real game loop — risk, luck, comebacks — without it turning into just another anxiety chart.

## How it works
Each morning the app pulls yesterday's metrics (sleep hours, HRV, resting HR, steps, stress, body battery). Each metric becomes a card whose rank comes from its percentile against your own 30-day baseline and whose suit is its metric family (sleep / cardio / activity / stress). You hold a rolling 7-day hand; each round you pick up to five cards to form a poker-style hand (pairs, straights, flushes across suits), scored Balatro-style as chips × mult, to beat an escalating blind. Jokers are earned by real behavior streaks — "3 nights over 7h sleep" grants a +mult joker. Fail the blind and the run ends with an emoji-grid share card.

## Technical approach
SvelteKit web app. Data via the Garmin Connect MCP (already running at :8003) and Strava MCP. A nightly job caches metrics to SQLite. Card mapping computes a rolling percentile/z-score per metric to assign rank 2–A. The scoring engine ports Balatro's chips+mult hand evaluation; blinds scale geometrically. Jokers are rules over metric history expressed in a tiny DSL. A deterministic daily seed (date hash) makes it a fair "daily" like Wordle. The genuinely hard part is a fair, non-punishing mapping: bad health days should matter but never make the game unwinnable, which needs baseline normalization, a reroll/mulligan economy earned by consistency, and anti-min-max guardrails so nobody sabotages their sleep to fish for a card.

## v1 scope
- Pull sleep + HRV + resting HR + steps for 7 days
- 4 suits, a basic poker-hand scorer
- 3 escalating blinds, 2 jokers
- Deterministic daily seed + emoji share card

## Out of scope
- Multiplayer / leaderboards
- Apple Health / Fitbit ingestion
- In-game shop economy and card upgrades
- Real-time / intraday play

## Risks & unknowns
Garmin sync latency and data gaps. Making it genuinely fun rather than a reskinned chart. The perverse-incentive risk of gaming health metrics. Percentile cold-start before a baseline exists.

## Done means
On a real Garmin account, opening the app produces today's 7 cards, lets you play a hand, scores it, and either advances a blind or ends the run with a shareable recap.
