## Overview
Open Outcry is a 3-player semi-cooperative pit-trading game: chaotic simultaneous shouting toward a shared goal, with private greed layered underneath. It's for a loud group that wants Spaceteam's noise but with negotiation instead of button-calling.

## Problem
Voice-coordination games are almost always cooperative and same-page. The itch here is *conflicting private incentives spoken out loud*: you all need to fill one ship, but you each also want your own bonus, so every offer you yell is half-honest — and a passed-around phone can't model two people holding two secret hands.

## How it works
Each **phone privately** holds a hand of commodity tokens (e.g. 3 CORN, 1 OIL) and a **secret order card** ("end holding 4 OIL"). The room shares one **export ship** that needs a public mix (e.g. 2 CORN, 2 OIL, 2 STEEL) filled within 90 seconds — that's the cooperative win. Individually, completing your secret order earns a bonus, so hoarding tempts you.

Trading is pure open outcry: you shout across the room — "Two corn for one oil!" The phone does **not** route offers. To execute, both parties tap each other's avatar and each confirms the quantities on their own screen; the server does an atomic swap only if both phones commit *compatible* terms within a ~2-second window and both hands actually hold the goods. Anyone can, at any time, tap 'load ship' to donate tokens toward the public need.

The **host TV** shows the ship's remaining requirements, a running market ticker of recent clears, and the timer. The tension: if one player corners a commodity the ship needs, the room fails and nobody's bonus counts — pure greed loses.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object per room) owns every hand and the ship. Data model: `{players: {id: {hand, order}}, ship: {need, filled}, pending: {offerId, from, give, get, ts}}`. Each phone gets only its own hand + order + the public ship state. A trade is a two-phase commit: phone A posts an offer, phone B posts a matching accept; the server validates inventory and timestamps within window, then swaps atomically and broadcasts a ticker event. The hard part is atomic two-phone confirmation without double-spend when three people trade at once — the server must lock both hands for the swap and reject stale offers, all fast enough to feel like a handshake.

## v1 scope
- 3 players, 3 commodity types
- One ship needing 6 tokens total, one 90-second round
- One secret order per player; flat token values (no dynamic prices)
- Win = ship filled before timer

## Out of scope
- Dynamic pricing, market manipulation events
- More than 3 commodities, multi-round sessions
- Scoreboards, spectator betting

## Risks & unknowns
- Atomic swap races with 3 simultaneous traders — needs tight locking
- The 2-second commit window may feel finicky or too loose
- Balancing so the room *can* fail from hoarding but usually squeaks through

## Done means
Three people shout trades across a room, clear deals only by both tapping matching terms, fill (or barely miss) a shared ship, and argue about who hoarded the steel.
