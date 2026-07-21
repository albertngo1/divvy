## Overview
Quaff is a cooperative roguelike party game for 3-5 players stealing NetHack's most delicious loop: unidentified items. A boss looms on the shared TV with a rotating elemental weakness. Every player privately holds a bag of unlabeled, color-coded potions — but nobody knows what any color *does*. The party must experiment, narrate results out loud, and build a shared identification table fast enough to exploit the boss's weakness before it drains the party's shared HP. Permadeath: one round, live or die together.

## Problem
The joy of roguelike identification — the gamble of quaffing a mystery potion, the eureka of pinning down a color — is deeply single-player. It's begging to be socialized: turn 'what does the blue potion do?' into a table-wide argument. And it only works if knowledge is *distributed*, so the room must talk.

## How it works
At setup the server randomizes a hidden `color → effect` map (shared across the party) and deals each player a **different private inventory** of ~4 potions. **Privately on each phone:** your own bag of colored potions (no labels), your remaining HP contribution, and — the private spice — one secret pre-identified 'hunch' (a scroll of identify was used on one of your colors at start; only you know it). **On the shared TV (public):** the boss, its current HP, its telegraphed weakness for this turn ('VULNERABLE: COLD'), the shared party HP bar, and a running IDENTIFIED table that fills in as effects are revealed.

Each turn, on a synchronized timer, players choose to **quaff** (drink — effect hits you) or **throw** (splash the boss). Any use publicly reveals that color's effect and writes it to the TV table forever. Throw a COLD potion while the boss is cold-weak = big damage; quaff a poison by mistake = you bleed the shared bar. The tension: the right potion for this turn's weakness may sit in *someone else's* private bag, so the party must coordinate who throws what — and decide when to stop identifying and start gambling. Kill the boss before shared HP hits zero.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Turn-based, so real-time sync is trivial — the server is fully authoritative over the hidden map, inventories, boss state, and shared HP, pushing per-player private views and one public TV view. Data model: `Room{code, colorMap(hidden), boss{hp, weaknessSchedule}, partyHP, identified[]}`; `Player{id, bag[], hunch}`. Each `useAction(playerId, potionId, mode)` resolves server-side, mutates state, and broadcasts a public reveal + private inventory updates. The genuinely hard part isn't sync — it's **information design**: tuning inventory overlap, weakness cadence, and HP so identifying-vs-gambling stays a live dilemma, plus a legible TV table that makes deduction feel earned.

## v1 scope
- 3 players, one boss, one run (permadeath)
- 5 potion colors, 5 effects (2 damage-typed, 1 heal, 2 harmful)
- Each player: 4 private potions + 1 secret hunch
- Boss weakness rotates each turn; shared HP; ~8-turn clock
- TV shows boss, weakness, shared HP, growing identified table

## Out of scope
- Multiple floors, scrolls beyond the starting hunch, inventory trading
- Character classes, procedural boss variety, scoring/leaderboards

## Risks & unknowns
- Could collapse into solved bookkeeping if effects are too few — needs a curse/mimic color to keep gambling risky.
- Turn pacing: without a timer players may over-deliberate; tune the clock.
- Making the shared TV table readable enough that deduction feels like the party's, not the server's.

## Done means
Three phones each show a distinct private potion bag and secret hunch; using a potion reveals its effect publicly and updates the TV table; correctly throwing into the boss's current weakness deals bonus damage; the party either kills the boss or hits zero shared HP, and the TV shows the correct win/loss within one run.
