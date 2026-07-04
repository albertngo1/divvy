## Overview
Cut & Choose is a fair-division party game for 3–5 players. Each round one player (the Divvyer) secretly splits a pile of goodies into one bundle per player on their phone; then everyone simultaneously and privately picks the bundle they want. Any bundle two or more people both grab gets voided — so the Divvyer is squeezed into making every share equally tempting. Rotate the Divvyer, tally points, done.

## Problem
"I cut, you choose" is the most elegant fairness rule in game design and utterly miserable to run for more than two people. You shuffle physical tokens into piles, players telegraph their pick by staring at a stack, and "we picked at the same time!" fights erupt every round. The two things that make it magical — hidden composing and true simultaneity — are exactly what a physical table cannot enforce.

## How it works
A pile of N item-cards (each with a visible point value) appears. The Divvyer's phone privately shows all items and lets them tap each into one of N bundles (N = player count). Nobody else sees the bundles form. When the Divvyer locks in, all bundles are revealed on the host screen — but which bundle each chooser wants is picked PRIVATELY on their phone, all at once. Reveal: a bundle picked by exactly one player goes to them; a bundle picked by 2+ is "contested" and nobody gets it this round; the Divvyer receives every un-picked bundle. The incentive is the whole point — if the Divvyer stuffs one juicy bundle, everyone dogpiles it and it voids, so their best play is genuinely equal shares. Most points wins.

Private vs shared: Shared = the item pile, the revealed bundles, who ended with what. Private = the Divvyer composing bundles, and every chooser's simultaneous locked pick.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: Round { divvyerId, items[], bundles[[itemId]], picks{playerId->bundleIdx}, phase }. Phases: COMPOSE (only Divvyer active) → CHOOSE (choosers lock hidden picks) → RESOLVE. Sync is turn-gated and easy: the server holds bundles secret until COMPOSE locks, pushes them to all clients, then collects picks and reveals nothing until every pick is in (or a timer fires). The hard part isn't latency — it's making the contested/void rule feel fair and legible. The reveal animation must make "you both grabbed bundle 2, it's gone" instantly obvious, and the Divvyer's incentive must be teachable in a single onboarding screen.

## v1 scope
- 1 round, 4 players, one Divvyer
- 8 item-cards with visible point values, tap-assign into 4 bundles
- Simultaneous hidden pick + contested-void resolution
- Result screen showing each player's haul

## Out of scope
- Rotating multi-round scoring, hidden/asymmetric item values
- Tiebreak-token economy, negotiation/trading
- Reconnect handling

## Risks & unknowns
- Does "contested = voided" feel punishing or delicious? May need the softer "highest hidden tiebreak token wins the bundle" variant.
- Divvyer assigning 8 items into 4 bundles on a phone could feel fiddly — needs a dead-simple tap-to-assign interaction, no drag.

## Done means
4 phones join, the Divvyer privately composes 4 bundles unseen by others, all 3 choosers lock hidden picks simultaneously, collisions void correctly, the Divvyer collects the leftovers, and a correct point tally displays.
