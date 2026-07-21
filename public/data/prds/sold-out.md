## Overview
A fast, free-for-all autobattler for 3–5 players, stealing the shop-and-board loop of autochess/TFT/Super Auto Pets and squeezing it into a single living-room round. The shared TV is the shop and the arena; each phone is a private wallet, bench, and battle plan.

## Problem
Autobattlers have the best tension in gaming — the panicked shop scramble and the blind read on your opponent's board — but they're locked inside solo grindy matchmaking. Nobody plays one at a party. The itch: capture *just* the snipe-the-shop and hide-your-order thrill in ninety seconds with friends in the room.

## How it works
The TV shows a shared shop of 6 face-up units (each has attack, health, and one keyword: *goes first*, *poison*, *shielded*). A 30-second **buy phase** opens. Every phone shows the same 6 units — but tapping **Claim** is authoritative first-come: the server assigns the unit to the first tapper, greys it out for everyone instantly, and refreshes that slot from the deck. Claimed units fall into your **private bench**, where you drag to set battle **order** (front-to-back). Opponents never see your bench or ordering. Coins cap you at ~3 buys, so every claim is a contested decision. When the timer ends, the TV runs a deterministic round-robin: each pair of boards fights left-to-right, animated for the room, private boards revealed only now. Most pairwise wins takes the round. The fun is contention (grab the *poison* unit before the person across the couch) plus blind-order yomi (did they front-load their tank?).

**Privately per phone:** your coins, your bench, your unsniped claims in flight, your secret front-to-back order. **On the TV:** the live shop pool, sold-out greyouts, and the final battle animation.

## Technical approach
Host tab + phone PWAs + an authoritative WebSocket server (PartyKit / Cloudflare Durable Object). Data model: `Room{shopSlots[6], deck[], phase, timerEnd}`; `Player{coins, bench[], order[]}`. Each shop claim is a single-writer DO transaction — first write wins by server timestamp, then broadcasts slot invalidation. Phones grey out optimistically on tap and roll back if they lost the race. Battle resolution is computed server-side from a fixed seed and streamed as an event log the TV animates. The genuinely hard part is sub-100ms claim arbitration so "it vanished from under me" always feels fair on flaky home wifi, not laggy or arbitrary.

## v1 scope
- 3 players, one deck of ~20 units (8 templates, 3 keywords)
- 3 buys each, one 30s buy phase
- One round-robin, one winner declared
- No econ, no leveling, no reconnect

## Out of scope
Multiple rounds and gold scaling, 3-of-a-kind unit upgrades, items/synergy tribes, reconnection, 6+ players.

## Risks & unknowns
Claim-race fairness can feel bad on high latency; 30s may be too tight to buy *and* order; the auto-battle must read clearly on a TV across the room; one round may not deliver enough drama (best-of-3?).

## Done means
Three phones join, all see one shop, a unit claimed on one phone greys on the others within a beat, each player arranges a hidden bench, and the TV animates three pairwise battles and crowns a winner.
