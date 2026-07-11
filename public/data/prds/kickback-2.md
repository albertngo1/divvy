## Overview
Kickback is a 4-player hidden-role game disguised as a budgeting exercise. The room has a fixed budget and a menu of items on the TV, but the *prices* live only on each phone. Three players share an honest price sheet; the imposter (the one 'on the take') sees a doctored one. As the group argues aloud about how to fill the cart to exactly the budget, the imposter's numbers keep clashing — and everyone hunts for whose math is corrupt. For groups who like haggling and light deduction over pure lying.

## Problem
Most deduction games hide *identity*; few hide *shared arithmetic*. When four people negotiate off the same numbers they converge fast — but if one player is quietly computing from different prices, their advocacy looks subtly irrational, and that friction is a naturally arising tell that no single passed-around phone could ever produce. The private per-phone price sheet is the whole game.

## How it works
Host TV shows a $100 budget, a 2:30 timer, and six item tiles (name + image, NO prices). Each phone PRIVATELY shows the same six items WITH prices and a live running total of whatever the group has verbally 'added' to the cart. Three phones carry identical honest prices; one phone (imposter) has two prices altered and a card: 'You're on the Kickback. Your sheet is cooked. Get the cart to $100 — and don't get made.'

Players debate aloud: 'add the drill, that's $40'; someone taps to nominate items, which the server adds to a canonical cart. Because the imposter's tiles show different prices, their running total diverges from everyone else's — so when an honest player says 'we're at $92,' the imposter's phone says $86, and they must fudge or deflect. After the timer, everyone privately votes the suspect; the TV reveals the tally, the true Kickback, and the two doctored prices.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `Room{code, budget, phase, cart[], timerEnds}`, `Item{id, name, honestPrice}`, `Player{id, priceSheet(map itemId→price), role, vote}`. Server owns the canonical cart and honest prices; each phone renders totals from its OWN sheet, so the imposter's client naturally shows a different number with no special-casing. Sync: cart adds/removes and phase/timer broadcast to all; price sheets pushed once at role assignment. Low bandwidth, low latency — the hard part is content design, not sync: prices must be pickable enough that a doctored pair meaningfully shifts a $100 target without being a giveaway.

## v1 scope
- 4 players, exactly 1 Kickback
- Six items, one honest price table, one doctored pair
- 2:30 timer, verbal nomination, one private vote
- TV reveal of tally + the two cooked prices

## Out of scope
- Multiple imposters, multi-round scoring, real product catalogs
- Automatic 'catch the math' assist (kills the deduction)
- In-app text chat — negotiation is meant to be out loud

## Risks & unknowns
- Non-mathy players may not track totals well enough to notice divergence.
- Doctored prices too small = invisible, too big = obvious; needs calibration.
- One dominant talker can railroad the cart before the tell surfaces.

## Done means
Four phones join with per-phone price sheets (three identical, one doctored), the group verbally builds a cart against a live private total, a 2:30 timer runs, all four vote privately, and the host reveals the tally plus the exact prices the Kickback was reading.
