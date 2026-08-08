## Overview

A 5-player, 6-minute draft game about denial. Everyone secretly wants three things from a shared pool of fifteen. Your phone — and only your phone — glows on the cards other people want. Whether you drafted for yourself or purely to ruin someone stays hidden until the Grudge Report.

## Problem

Hate-drafting is the most satisfying move in any draft and the least playable one at a table. It needs hidden wishlists (paper, and someone to police them), it needs a scorekeeper, and worst of all the payoff is invisible — you deny someone their card and they never know, or they read it off your face immediately. In person, rotisserie drafting is also just slow: eight people watching one person think.

## How it works

1. The TV shows 15 absurd items for a hypothetical road trip: "the aux cord", "a cousin who knows a guy", "one working headlamp".
2. **Privately, each phone** shows a randomly dealt 3-item WISHLIST. Nobody else ever sees it.
3. Snake draft, 3 picks each, 15 seconds per pick. The TV shows the remaining pool and everyone's public haul — what you took is always public.
4. **Privately, your phone overlays HEAT on the pool:** a small glyph on each item showing how many *other* players wishlisted it (0, 1, 2+). Heat is computed from the initial wishlists and never updates — it tells you demand, not urgency.
5. Once per game you may spend a WHO token to learn one heat-marked item's exact wanter.
6. Scoring, revealed only at the end: +3 per wishlist item you got; +2 per item you took that was on exactly one other player's list and that they finished without. The Grudge Report animates arrows between players — who denied whom, and how much of your score was pure spite. One-tap vote for Biggest Jerk.

The fork is the whole game: a hot card you don't want is worth 2 if you deny, 0 if you pass and someone else takes it anyway. The table watches you take a headlamp you clearly don't need and cannot tell whether you're greedy, spiteful, or bluffing a wishlist you don't have.

## Technical approach

PartyKit Durable Object per room. `Room{pool[], pickOrder[], cursor, deadline}`, `Player{id, wishlist[], haul[], whoToken}`. Wishlists live server-side only; each phone receives a per-player projection containing its own wishlist plus a `heat[itemId]` vector computed by the server excluding that player's own wants. The host tab is sent a projection with no wishlist or heat fields at all — the private layer must never transit the host socket, since the TV is the one screen everyone can see.

Sync is turn-based and forgiving, so the hard part isn't latency — it's the pick deadline. A 15-second timer must expire identically on the server and all six clients, with auto-pick on timeout and no double-pick when a slow tap lands 200ms after expiry. Server owns the clock, broadcasts `deadlineAt`, clients render drift-corrected countdowns, and late taps are rejected with a visible "too slow".

## v1 scope

- 5 players, one snake draft, 3 picks each, 15 items, exactly one round.
- Heat as 0 / 1 / 2+ glyphs, computed once at deal.
- One WHO token per player.
- Grudge Report screen + Biggest Jerk vote.

## Out of scope

Multiple packs, noisy or decaying heat, trading picks, item synergies, custom item packs, disconnect recovery.

## Risks & unknowns

With 15 items and 15 picks everyone gets 3 things, so denial may be too easy to achieve accidentally — the pool may need to be larger than the picks. Heat could be so informative that play becomes mechanical; noise or thresholds may be required. Random wishlists carry no personality, and the humor may have to come entirely from the item copy.

## Done means

Five phones, one TV. A player passes over their own wishlist item to take a 2+ heat card, and the end-of-game Grudge Report correctly draws the arrow to the person they denied — with that player's face confirming they had no idea.
