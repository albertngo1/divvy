## Overview

A three-player real-time draft. Everyone holds a pack at the same time, on their own phone. The tedium of drafting — staring at the ceiling while one person agonizes — becomes the game's central pressure, because a held pack burns a card at random every six seconds.

## Problem

Booster draft's actual failure mode at a table is dead time. Three people wait while one reads fifteen cards, and the rules supply no reason to hurry beyond social embarrassment. Meanwhile the interesting part — reading what's being passed — depends on everyone privately remembering what they saw. Both problems dissolve when every pack is live on a different phone simultaneously and a server owns the clock.

## How it works

**Phone (private):** your pack of 5 ingredient cards. Your secret 3-item recipe ("salt, lemon, butter"). The cards you've already taken. A burn-risk ring that fills over six seconds. Tap a card to take it — the rest of the pack passes left instantly and your ring resets.

**Host TV (public):** never shows pack contents. It shows three lanes, one per seat, each with a hold-timer bar that grows while you deliberate; a running burn counter per seat; and a graveyard of every burned card, **attributed to whoever was holding when it died**. That attribution is the whole social engine.

Burns are random within the pack, so hesitating can incinerate exactly the card you were deciding about — and it definitely thins what your neighbor gets next. Two pick-and-pass rounds; then recipes flip and you score completion. Because the graveyard is public, late in the round you can compute which recipes are already impossible, including someone else's.

## Technical approach

Socket.IO over Tailscale Serve or a PartyKit room; either way the server is authoritative and ticks at 10Hz. Model: `Pack {id, cards[], holderSeat, burnDeadline}`, `Player {id, seat, recipe, taken[]}`. Pack ownership is a server-side token — a phone renders a pack only while it holds the token, so a desync can't put one pack on two screens.

The hard part is the collision at the tick boundary: a `pick` and a `burn` landing on the same card in the same 100ms window. The server resolves strictly by receive time, but the client must have optimistically animated the pick already. Losing that race silently — the card just becoming a different card — feels like cheating, so the phone needs a dedicated "that one turned to ash in your hand" animation. Clock display also needs a join-time offset handshake so every phone's ring and the TV's bar agree within ~100ms.

## v1 scope

- 3 players, 3 packs of 5, **2 passes** (one round)
- Fixed 6-second burn interval
- One hand-authored 12-ingredient pool, three fixed recipes
- Scoring = "did you complete it, yes/no"
- Room code, no accounts, no persistence

## Out of scope

4+ players, multiple packs/rounds, a dedicated hate-draft UI, sound, graveyard animations, recipe generation, rejoin-after-disconnect.

## Risks & unknowns

The burn interval is the entire tuning problem: at 6s nobody may read their pack at all; at 12s nothing ever burns and the pressure evaporates. Random burn selection may read as unfair rather than tense — the fallback is burning the card you've looked at least. And with 3 players and 5-card packs the draft may simply not be competitive enough for the pressure to matter.

## Done means

Three phones and a TV finish a round in under 3 minutes; burn events appear on the TV within 200ms of the server tick that caused them; no state exists where two phones believe they hold the same pack; and in playtest at least one player audibly blames another for a card that burned.
