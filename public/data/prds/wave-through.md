## Overview
Wave Through is a phone-native riff on *Sheriff of Nottingham* for 3-5 friends: merchants secretly pack a sack of goods, declare something to the room, and try to smuggle valuable contraband past a rotating Sheriff — greasing palms with private bribes when the bluff gets thin.

## Problem
*Sheriff of Nottingham* is a superb bluffing game crippled by physical friction: a single Sheriff inspects merchants one at a time while everyone else waits, cards get fumbled behind hands, and the crucial bribes happen as awkward table-whispers everyone half-hears. Phones fix all three — sacks pack simultaneously and privately, and a bribe becomes a truly invisible channel.

## How it works
One player is Sheriff (host TV names them); everyone else is a Merchant. Each Merchant privately holds a hand of goods — some **legal** (bread, cheese) and some **contraband** (silk, pepper: worth more, illegal this market). Simultaneously and privately, each Merchant stuffs 1-3 cards into a sack and types a **declaration** ("2 loaves of bread") that posts to the TV — while the real sack contents stay hidden on their phone. Before the Sheriff rules, any Merchant can privately send the Sheriff a **bribe** (coins) from their phone. The Sheriff, on their own phone, sees the incoming bribe amounts (invisible to the room) and taps each Merchant to **INSPECT** or **WAVE THROUGH**. Waved through → sack counts, contraband scores. Inspected + truthful → Sheriff pays a penalty to the Merchant. Inspected + lying → Merchant dumps contraband and pays the Sheriff. Then the TV reveals every sack dramatically.

**Private (phone):** your hand, what you stuffed, bribes you send; if Sheriff, incoming bribe totals + inspect/wave toggles. **Shared (TV):** who's Sheriff, each public declaration, the reveal, running coins.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object). Data model: `Room{players, phase, sheriffId}`, `Player{hand[], sack[], coins, declaration}`, `Bribe{fromId, amount}`. Sync: server-authoritative; sack contents and bribe amounts are **never** broadcast — the sack is held server-side until the reveal event, and bribes are delivered only to the Sheriff's socket. Simultaneity: all Merchants lock their sacks before the Sheriff phase opens. The genuinely hard part is the private bribe channel plus guaranteeing no client ever receives another player's hidden sack before reveal.

## v1 scope
- 3-4 players, one round, one rotating Sheriff
- ~5 legal + 3 contraband card types, one fixed market
- Bribe = a single coin amount sent to the Sheriff
- Minimal reveal animation; integer coin payouts only

## Out of scope
- Multiple rounds / full goods-economy endgame
- Market cards that change what's legal
- Set-collection scoring, spectators, rejoin

## Risks & unknowns
- Bribery may feel awkward among strangers
- Penalty balance is fiddly; 3 players may be too few for real bluff tension
- Needs a big enough hand to make packing choices meaningful

## Done means
Three phones join; each privately packs a sack and declares; the Sheriff privately receives a bribe and inspects/waves; the TV reveal pays coins correctly per the truth; and network inspection confirms no client received another player's sack before reveal.
