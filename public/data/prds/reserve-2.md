## Overview
Reserve turns the passive pleasure of appraisal TV — Antiques Roadshow "guess the value," The Price Is Right, "guess the rent," "how much did this house sell for" — into a private staking market. 3–6 players watch the same item on the TV and privately commit both a guess AND a wager before the reveal. For groups who love shouting numbers at the screen.

## Problem
Everyone already plays guess-the-price passively, but it's structureless: the loudest confident person dominates, there's no cost to a wild guess, and no memory of who's actually calibrated. Nothing rewards *knowing when you know* versus bluffing on a hunch.

## How it works
The host TV shows an item — a photo, a short clip, a description — with the true value hidden. A countdown runs. Each phone PRIVATELY shows an input: a number dial (your appraisal) and a stake slider drawing from your dwindling bankroll. You lock in before the timer expires; nobody sees anyone's number or stake.

Resolution uses the Price-Is-Right rule with a betting twist: among players who did NOT overshoot the true value, the closest wins the pot; overshooters forfeit their stake into it. Your stake multiplies your winnings, so the tension is: how sure am I, and how much do I shove? A confident lowball that's dead-on and heavily staked cleans house; a greedy overshoot with a big stake feeds everyone else.

Reveal: host shows the true value, everyone's locked guess laddered against it (with the overshooters greyed), the pot flow, and updated bankrolls.

Private simultaneous locking is load-bearing: pass one phone around and later players anchor on earlier numbers and the hidden-stake bluff evaporates; the whole betting texture depends on committing blind at the same moment.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `room{itemQueue, currentItem{trueValue}, players[{bankroll}]}`, each phone submitting `{guess, stake}` held server-side until the timer fires. Sync strategy: server owns the timer and the truth; phones never receive the true value or others' submissions until resolution, closing the peek vector. The genuinely hard part is the content pipeline — a curated deck of items with verified real values and good spread — plus fair tie handling (split the pot) and a bankroll economy that stays fun over a handful of items without runaway leaders.

## v1 scope
- 3 players, one hardcoded deck of ~5 items with known values.
- Number dial + stake slider, fixed starting bankroll.
- Closest-without-going-over resolution, ties split.
- Reveal ladder + bankroll update. No accounts, one game.

## Out of scope
- User-uploaded items or live web sourcing of values.
- Multi-round tournaments, persistent stats, comeback mechanics.
- Fuzzy "within X%" scoring modes.

## Risks & unknowns
- Content: sourcing items with genuinely surprising, verifiable values is the real work.
- Overshoot rule can feel punishing; may need a floor payout to keep players in.
- Runaway-leader bankroll dynamics over only 5 items.

## Done means
Three phones privately lock a guess+stake per item on a 5-item deck; the host reveals each true value; the TV correctly awards the pot to the closest non-overshooter, scaled by stake, and shows updated bankrolls with overshooters visibly forfeited.
