## Overview
A co-op party game that steals the roguelike's unidentified-item beat — drink the unknown potion and pray — and turns it into distributed science. 3–4 players, one shared boss on the TV, and every phone is a private test subject discovering a different truth at the same time.

## Problem
Roguelike item identification is a lonely spreadsheet: one character, one potion at a time, quietly logging "blue = poison." The genuine thrill (the gamble of the sip, the eureka of the mapping) never becomes a table activity. And the mechanic is naturally multi-phone — several testers, several simultaneous results — yet no party game exploits it.

## How it works
The host TV shows a shelf of 5 color-coded mystery potions and a boss with a hidden weakness (e.g., *weak to Poison*). A game seed fixes a secret color→effect mapping. Over 3 test rounds, **every phone is dealt one potion to quaff simultaneously**; the phone privately reveals that effect to *only* that player and applies private consequences — harmful potions dock that player's own HP bar, shown only on their phone.

**Private per phone:** the effect you just got, your HP. **Shared TV:** the shelf, boss HP + timer, and potions remaining. The party talks openly to assemble a shared color→effect table (secrecy is not the point). Once they deduce the boss's weakness color, two or more phones commit a synchronized **group-drink** of that color for a combined burst that damages the boss on the TV.

Per-phone is load-bearing through *simultaneous private testing*: N testers per round instead of 1, each seeing a different result. A single passed-around phone can only test serially and can't privately reveal a distinct truth to each drinker — and it can't perform the two-phone group-drink.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object). Data model: `Game{seed, colorMap{color→effect}, potionsRemaining{color→n}, boss{hp,weakness,timer}, partyHp}`, `Player{id, hp, lastEffect}`. Each round the server deals potions and resolves effects via *targeted* private messages (each phone gets its own truth). Boss damage lands only when ≥2 phones commit the same color inside a sync window. **Hard part:** per-phone divergent private state plus the synchronized group-drink commit, and balancing so the mapping is deducible in 3 rounds without being trivial.

## v1 scope
- 3 players, 4 colors, one boss with one weakness
- 3 test rounds + 1 group-drink, one fixed seed
- Talking allowed, no secrecy, one full round

## Out of scope
Multiple bosses, PvP, hidden traitor, dungeon movement, persistent runs, item crafting.

## Risks & unknowns
Clever players may solve too fast — tune colors vs. rounds. Harmful potions must genuinely bite (party-HP pressure) or testing has no cost. Group-drink sync window. Making distributed testing *feel* better than one-by-one.

## Done means
3 phones each privately receive and reveal a *different* potion effect in the same round, the party assembles a color→effect table from those private results, and a synchronized 2+ phone group-drink of the weakness color drops the boss to zero before the timer — verified that no single passed phone could gather 3 simultaneous private results.
