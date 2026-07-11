## Overview
Prop Bet is a content-agnostic betting layer for group TV — any show, any streaming service, no integration. For 3–5 people on the couch who'd otherwise half-watch while doomscrolling. Turns passive co-viewing into a private-wager competition over the exact same footage.

## Problem
Watching TV as a group is passive and the second screen in everyone's hand becomes a distraction, not a bond. There's no shared stake in the thing you're all looking at. Trivia apps require the show to be pre-authored; nothing works on the random thing you actually picked tonight.

## How it works
Each phone is dealt a PRIVATE hand of 5 generic prop cards — e.g. "someone lies," "a phone rings on screen," "two characters hug," "a named character dies," "a door slams." While the show plays, you secretly commit one card plus a wager (1–5 chips), predicting it happens within the next ~3 minutes. No one sees your hand or your bet. When you believe your bet hit, you tap CALL — the host flashes an anonymous "someone's calling a bet!" and the table adjudicates with a quick majority thumb-vote (did it happen?). Correct calls pay out scaled by the card's rarity (rarer card = deeper payout); a wrong call forfeits the wager.

The private hand is the whole engine: because everyone holds DIFFERENT cards, you're each scanning the same scene for different triggers, and hidden wagers let you bluff a call to bait a rival into a bad vote.

Private on each phone: your hand, chip stack, active bet, its timer. Public on host: chip leaderboard, an anonymized "live bets: 3" ticker, and the call/adjudication overlay. The show never pauses — you cannot pass one phone around and hold four hands as the footage rolls.

## Technical approach
A room Durable Object holds `{players:{id:{hand[], chips, activeBet}}, callState}`. The server deals hands from a fixed deck via a seeded shuffle, validates commits, runs the adjudication vote (each phone submits yes/no), and settles chips. Sync is mostly event-driven — commit, call, vote — so throughput is trivial. The genuinely hard part is fair adjudication without ground truth: solve with a majority thumb-vote, a per-player call cooldown to stop spam, and hidden caller identity until settlement to reduce bias.

## v1 scope
- One 15-card generic deck
- 3–4 players
- One ~10-minute session against any show the group picks
- Thumb-vote adjudication, flat rarity payouts

## Out of scope
- Syncing to specific shows/timestamps or auto-detecting events
- Streaming-service integration, content authoring
- Seasons, persistent bankroll, dispute appeals

## Risks & unknowns
Adjudication disputes ("that wasn't REALLY a lie") could sour it — needs a fast, low-stakes vote. Dead spots if cards don't fire during a slow scene. The generic deck must hit reliably across genres, which is a real design challenge.

## Done means
Four phones each receive a distinct private hand, place hidden wagers during a real, un-instrumented show, a CALL triggers a table thumb-vote, chips settle correctly, and the leaderboard reflects who read the room best — with zero content pre-authoring.
