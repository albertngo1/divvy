## Overview

A 3-player, 90-second twitch game built entirely out of last-hitting: the MOBA chore where gold goes only to whoever lands the final point of damage. Each phone is a single FIRE button with a private cooldown and private damage number, and — the twist — a precise HP readout for exactly one of the three minions on screen. For people who want a party game with a skill ceiling and no writing.

## Problem

Last-hitting is the most quietly tense thing in games and it's wasted on solo laning practice. It's also perfectly party-shaped: it's ten seconds long, it's zero-sum, and the entire skill is prediction under bad information. Nothing in the party-game canon is a pure simultaneous timing contest where the *information*, not the reflex, is the asymmetry.

## How it works

Three minions walk left across the TV, each losing HP to ambient "turret" damage on a fixed curve. Their health bars render as five coarse blocks — you can see roughly-low, never exactly-low.

**Phone shows privately:** one big FIRE button; your damage value (fixed per round, rolled 6–11, different for each player); your 1.2s cooldown ring; and a numeric live HP readout for one assigned minion — yours alone. Nobody knows whose minion is whose.

**Host screen shows:** the three minions, their coarse bars, a gold counter per player, and a muzzle flash on each fire with no attribution. Kills are announced by name ("Priya").

The game is that your edge leaks. Sniping your own minion at exactly 1 HP is free gold — and it also tells the other two which minion you can read, so they crowd it next wave. Firing blind on someone else's minion is a coin flip that hides you. After the 45-second wave there's a 20-second guess phase: each phone taps which minion each opponent could see. Correct guesses pay as much as a kill, so the round's real currency is behavioral tells, and the TV replays the tape with the three private readouts finally overlaid.

## Technical approach

Host tab + phone PWAs + one authoritative sim in a Cloudflare Durable Object (or Socket.IO over Tailscale Serve).

Data model: `Wave { tick, minions: [{id, hp, decayRate}], assignments: {playerId → minionId}, players: {id, dmg, cooldownUntil, gold} }`. The server runs a fixed 30Hz tick and is the only authority on HP; clients never simulate damage.

Sync: the host renders ~120ms behind server time for smooth interpolation. Phones send `{fireAt: clientTs}` with a rolling RTT estimate; the server rewinds up to 150ms to place the shot in the tick the player actually saw, which is the genuinely hard part — without lag compensation the player on hotel wifi never lands a kill, and with too much of it players get sniped by shots fired "after" the minion died. Ties inside one tick go to the earlier compensated timestamp; simultaneous ties split the gold. Private HP feeds go out as per-socket messages at 10Hz, never in the broadcast frame.

## v1 scope

- Exactly 3 players, one 45-second wave, one guess phase
- 3 minions, linear HP decay, no lane, no towers, no map
- One button per phone, one damage roll, one fixed cooldown
- Gold total on the TV, highest wins, no persistence

## Out of scope

Multiple waves, denial mechanics, abilities, characters, matchmaking, ranked, any spatial movement, 4+ players.

## Risks & unknowns

Network fairness across mixed connections could make the game feel rigged; if lag compensation can't get variance under ~40ms the whole thing is unplayable. The tell may not exist — if players fire constantly, behavior carries no signal and the guess phase becomes a coin flip. Coarse bars might be so vague that blind fire dominates precise fire, which would invert the intended tension.

## Done means

Three phones on the same wifi play a full wave where every kill is attributed correctly by the server, and a logged replay confirms each kill went to the player whose compensated shot landed first. Median input-to-flash latency under 90ms. In five playtests, blind kills and assigned-minion kills each account for at least 25% of total kills, and guess-phase accuracy is above chance (>33%).
