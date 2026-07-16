## Overview
Family Style turns the most passive group ritual — staring at a menu deciding what to order together — into a secret betting market on the table's own appetite. For 3–6 people.

## Problem
Ordering shared food is already a half-played negotiation ("I could do Thai... whatever you guys want"). It's slow, indecisive, and nobody's rewarded for reading the table. A hidden game of predicting the group is already happening; Family Style just puts chips on it.

## How it works
The host TV shows a curated 8-dish menu (photos + names). Each phone does two simultaneous private actions: (1) your secret CRAVING vote — the one dish you personally want; (2) your BET — chips staked on which single dish you think the whole table will land on. Both are hidden. When all lock, the server tallies cravings into "the table's order" (the plurality dish; ties broken by total chips bet on them), then pays out: everyone who bet the winning dish shares the pool, and a contrarian bonus rewards you if few others backed it.

The delicious catch: your own craving vote is one of the inputs to the outcome you're wagering on. Do you vote your true craving, or steer the table toward a dish you've quietly loaded chips onto?

Per-phone load-bearing: cravings and bets are simultaneous and blind. If bets were visible everyone herds onto the leader and the market collapses; if you passed one phone you couldn't hold secret divergent votes. That's the whole game.

Host TV = the menu, a coarse "what the table's leaning" teaser (bucketed counts, no names, post-lock only), the winning dish, and the payout board. Phone (private) = your craving pick, your chip allocation, your bonus.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / DO, or Socket.IO over Tailscale Serve). Data model: Room{menu[8], phase, tally}, Player{chips, craving?, bet{dishId→amt}}. Sync: the server holds every craving and bet private until both are locked for all players, then atomically computes the plurality winner plus parimutuel + contrarian split and broadcasts one RESOLVED snapshot. Hard part isn't latency — it's the reveal: nothing about individual cravings or bets can leak through aggregate teasers early, or players reverse-engineer the leader and herd. Aggregates must be coarse and shown only post-lock.

## v1 scope
- 3 players, one menu, one round
- 8 hand-picked dishes with photos
- Plurality winner, flat 15-chip bets, contrarian bonus (payout × 1/backers)
- Host reveal screen: winning dish + who cashed

## Out of scope
- Real ordering integration, multi-course menus, dietary filters
- Multi-round bankrolls, custom menus, steering-detection analytics

## Risks & unknowns
- With 3 players, plurality ties are common — tie-breaks must feel fair
- "Steer vs. crave" tension may be too subtle to land in one round
- Menu curation quality drives replay

## Done means
Three phones each secretly cast a craving and stake chips; the server picks the table's dish by plurality and pays the pool to correct bettors with a contrarian bonus, with no craving or bet visible to anyone until the simultaneous reveal.
