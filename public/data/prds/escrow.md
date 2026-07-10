## Overview
Escrow is a 3-5 player simultaneous barter market. Each player holds a private hand of resource cards and a secret collection goal; the host TV is the trading floor. Nobody speaks a trade — you post standing offers on your phone, and an authoritative matcher clears them in ticks. It's for people who love the *deal* in Catan/Bohnanza but hate the sequential, shout-over-each-other tedium of real-table trading.

## Problem
Table trading is the best part of many games and also the worst-run: one negotiation at a time, everyone waiting, information leaking across the table, and three-way trades ("I'll give you wood if you give her clay if she gives me ore") almost never happen because no human can hold the loop in their head. The itch: keep the wheeling-and-dealing, kill the queue and the shouting.

## How it works
Each phone PRIVATELY shows: your hand (e.g. 7 cards across 5 resource types), your secret goal ("collect 3 Ore + 2 Silk"), and an offer composer. You post any number of standing offers — "GIVE 1 Wood, WANT 1 Clay." You never see anyone's hand or goal.

The shared host screen shows only anonymized market signal: a live heatmap of what's being offered vs. demanded (Clay glowing red = wanted, Wood blue = flooded), plus a ticker of *anonymous* executed trades ("a 3-way loop just cleared"). No identities, no hands.

Every ~2 seconds the server runs a clearing pass: it finds mutually-satisfying pairs AND cycles (A→B→C→A) among live offers, executes them atomically, and removes consumed cards/offers. You feel your hand change and re-strategize. After a 3-minute market, hidden goals are revealed on the host screen and scored.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object, one room object). Data model: `players[{id, hand:{res:count}, goal, offers:[{give, want}]}]`, `market` (derived). Sync: phones send `postOffer`/`cancelOffer`; server is source of truth for hands and never leaks them — each phone only receives its own private state plus the anonymized market aggregate. The genuinely hard part is the matcher: pairwise matching is easy, but detecting and atomically executing *cycles* (bounded to length ≤3 in v1) each tick without double-spending a card, fairly ordering simultaneous eligible matches, and doing it in <50ms. Model offers as a directed multigraph (nodes=resources-per-owner) and search for short satisfiable cycles greedily, locking consumed cards before commit.

## v1 scope
- One 3-minute market, 3-4 players, 5 resource types.
- One secret goal per player, scored simply (goal met = win, ties by leftover cards).
- Pairwise + 3-cycle matching only.
- Host heatmap + anonymous trade ticker; phone hand + composer.

## Out of scope
- Multi-round games, partial/quantity haggling, chat, reputations, longer cycles, reconnection polish, spectators.

## Risks & unknowns
- Does invisible trading feel *fun* or just abstract? The host heatmap must make the market feel alive.
- Cycle matching could feel like magic (good) or unfair/opaque (bad) — need a clear post-trade "why this cleared" animation.
- Balancing so goals are reachable but contested.

## Done means
4 phones + a TV; each player sees only their hand and goal; posting offers clears real pairwise and 3-way trades within one tick with zero card duplication or loss; at time-up the host reveals goals and declares a winner.
