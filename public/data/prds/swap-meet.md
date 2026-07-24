## Overview
Swap Meet is a 3–4 player real-time trading game for one shared host screen and phone controllers. It takes the most gloriously chaotic tabletop mechanic — open-outcry resource trading (Bohnanza, Catan, Sidereal Confluence) where five people shout offers over each other and nobody can track who agreed to what — and makes it silent, simultaneous, and clean by giving every player a private offer desk.

## Problem
Around a real table, live trading is a mess: you can't broadcast three offers at once, you can't remember who wanted wheat, deals get renegotiated verbally and forgotten, and quiet players get steamrolled. The negotiation is fun; the bookkeeping and the shouting are not.

## How it works
Each phone privately holds: a **hand** of resource tokens (4 types, e.g. copper/glass/silk/spice), a **secret recipe** (a 3-token set you're racing to assemble), and an **offer composer**. You build offers — "GIVE 1 copper, WANT 1 silk" — and post them either targeted to a named player or open to the floor. You can have several live offers at once; the tokens you're offering are held in escrow so you can't double-spend.

The **host TV** shows only anonymized aggregate: a pulsing "market floor" (how many open GIVE/WANT offers exist per resource), a live ticker of *completed* trades ("a silk went for a spice"), and each player's completion bar. It never shows who wants what — that lives on phones.

The server continuously scans for **compatible offer pairs** (my GIVE matches your WANT and vice versa) and executes the trade atomically the instant both sides are live, buzzing both phones. First player to assemble their secret recipe hits CLAIM and wins; 90-second cap.

The per-phone privacy is load-bearing: hidden hands, hidden recipes, and *simultaneous secret offers* are the whole game. A single passed-around phone can't hold four people's concurrent private negotiations — the fun is that everyone is dealing at once and only the server sees the full graph.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `players[{id, hand:{copper,glass,silk,spice}, recipe, escrowed}]`, `offers[{id, from, to|null, give, want, ts}]`. Sync: phones send `postOffer`/`cancelOffer`/`claim`; server holds the only truth. **Hard part = atomic matching under contention** — token escrow on post, a single-threaded match loop so two offers can't both consume the same escrowed token, and idempotent trade execution so a double-tap can't fire a trade twice. All state deltas broadcast; the TV is a pure subscriber.

## v1 scope
- 3–4 players, 4 resource types, 3-token recipes, one round, 90s cap.
- Only two offer verbs: GIVE and WANT (1-for-1 swaps).
- Auto-match only; no multi-token or conditional offers.
- TV shows floor heat + trade ticker + completion bars.

## Out of scope
- Multi-item bundles, IOUs, brokered 3-way trades.
- Chat/emoji negotiation; scoring across multiple rounds.
- Reconnection recovery mid-trade.

## Risks & unknowns
- Auto-matching may feel *too* frictionless — might need a 1s "pending, confirm?" beat to preserve the thrill of accepting.
- Fast players could corner a scarce resource; needs starting-hand balancing.
- Escrow race conditions are the make-or-break correctness bug.

## Done means
Four phones join, each sees a private hand + recipe, post concurrent offers; the server executes a matched swap atomically (no double-spend across 100 rapid trades in a stress test), both phones update, the TV ticker logs it, and the first assembled recipe ends the round with a correct winner.
