## Overview

A 90-second real-time trading brawl for three players. Everyone holds a private inventory and a private recipe they cannot fill alone. You may run three negotiations simultaneously — and you may back all three with goods you own only once. For people who enjoy being caught.

## Problem

Multilateral trading games — Bohnanza, Chinatown, Sidereal Confluence — contain the best negotiation engines in the hobby inside the worst possible interface. Everything funnels through one voice at a time, so five players sit idle while two haggle. Cubes get dropped, deals get misremembered, and the table appoints an unpaid clerk. The core constraint nobody names: **in person your mouth is single-threaded.** You physically cannot negotiate with two people at once.

## How it works

Each phone privately holds 6 cubes across 4 colors and one secret recipe ("3 blue + 2 red = 12"). Recipes are dealt so nobody can fill their own from their own stock. The window opens for 90 seconds.

Your phone shows **three lanes**, one per other player. You can have a live offer standing in every lane at once — "I give 2 blue, I want 1 red." Crucially, **your inventory is not reserved.** The same two blue cubes can back all three offers simultaneously. That's not a bug; it's the entire game.

The first acceptance settles atomically. The other two offers die instantly as **KILLED**, and the TV stamps a permanent public *phantom* mark against you. At the buzzer, recipes reveal, points score, phantoms subtract 2 each.

- **Phone (private):** your inventory, your recipe, the terms of every incoming and outgoing offer.
- **TV (public):** a settled-trade ticker in the abstract ("P2 → P3: 2 cubes"), each player's live phantom count, the clock. Recipes and inventories never appear.

The only way to trade fast enough is to double-book. The ledger of broken promises is the scoreboard.

## Technical approach

A Cloudflare Durable Object owns every inventory; clients render optimistically but never decide anything. Model: `players{id, inv:{color:int}, recipe}`, `offers{id, from, to, give, want, version}`, `ledger[]`. On ACCEPT the DO verifies both sides still hold the goods, swaps, bumps a global version, broadcasts a diff, then cancels *every other offer touching the spent cubes*.

Accepts carry the offer's version; a stale accept is rejected, and that rejection **is** the phantom event. The DO's single-threaded execution gives serialization for free.

The hard part isn't the race — it's the 5ms loser. Two accepts on overlapping cubes must produce exactly one fill and one clean kill, and the losing player's screen must explain *why*, in under 150ms, with an animation that reads as drama rather than a failed request. Get that wrong and the whole game feels broken.

## v1 scope

- Exactly 3 players, 4 colors, 6 cubes each
- One 90-second window, then reveal and score
- Offers are 1-for-1 or 2-for-1 only; accept or ignore, no counteroffers
- One recipe per player; phantom = −2
- Room code join, no chat, no lobby, no rematch

## Out of scope

Counteroffers, negotiation text, multi-round play, converter engines, more than 3 players, balance passes, spectators.

## Risks & unknowns

Three lanes may be too much to read on a phone under time pressure. 90 seconds may be either frantic or dead. The phantom penalty may successfully suppress the exact double-booking it exists to provoke — it likely needs to be small or purely reputational. Players may abandon the UI and just shout across the room; secret recipes are the mitigation, and they may not be enough.

## Done means

Three phones, one 90-second window. At least one trade settles atomically with both inventories updating, at least one competing accept is killed with a legible on-screen reason, the TV shows a phantom ledger, and final scores compute from the revealed recipes.
