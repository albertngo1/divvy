## Overview

A 4-player drafting game for anyone who has ever sat through a physical booster draft and thought "this is 40 minutes of card-passing to produce 15 seconds of interesting decisions." Here the passing is instant, the pack is public, and the *information about what's gone* is the thing that's private — and deliberately unreliable.

## Problem

Physical drafting is slow because the pack is the token: you can't pick until it arrives, so the table runs at the speed of its slowest reader. Meanwhile the actual skill — signal reading, guessing what others are cutting — is nearly invisible and impossible to verify. Digital drafts fix the speed and accidentally delete the signal reading with it.

## How it works

One shared pack of 24 items on the TV, drawn from a silly domain (road trip supplies, apartment amenities, superpowers). All four players pick **simultaneously**, every round, from the same pack. Rounds last 12 seconds.

The twist: when two or more players pick the same item, **nobody gets it** — it's burned off the pack, publicly, with a collision flash on the TV. So the whole game is dodging your rivals.

Each phone privately holds two things. First, a **secret set-collection goal** ("you need 3 things that plug in", "you need 2 things that are red") — different per player, so tastes genuinely diverge. Second, a **spy window**: a private ticker showing you the last pick of exactly ONE other player, chosen by a hidden directed cycle, delayed by one round. Player A watches B, B watches C, C watches D, D watches A — and nobody knows who watches them.

One of the four spy windows is **inverted**: it shows a plausible item that player did NOT pick. The server picks which window lies, and never tells anyone. So your private information is a resource you must weigh against the possibility that you are the mark.

Public on TV: the pack, remaining items, collision flashes, round timer, everyone's pick COUNT but not contents. Private on phone: your goal, your spy feed, your collected items, your 12-second pick.

## Technical approach

PartyKit Durable Object. State: `{pack: Item[], taken: Map<playerId, Item[]>, burned: Item[], goals: Map, watchGraph: Map<playerId, playerId>, liarId, round}`. Each round: collect picks into a buffer, resolve at the deadline (server clock is authoritative — a pick arriving after the tick is dropped, and the phone shows a hard "locked" state at T-0 to make that legible).

Spy feeds are computed server-side and pushed only to their one recipient — the item never touches another client, so nothing leaks through devtools. The liar's feed samples from items still in the pack that plausibly match the watched player's revealed goal signals.

The genuinely hard part: simultaneous resolution feels unfair if a laggy phone loses a pick. Solution is a 250ms grace window past the deadline plus optimistic client-side lock, and a visible "pick received" checkmark before the timer expires.

## v1 scope

- Exactly 4 players, one 24-item pack, 4 rounds of 12 seconds
- 3 hardcoded goal types, one item domain
- Fixed watch cycle, exactly one liar
- No trading, no rerolls, no undo
- TV scoreboard at end revealing goals, burns, and who was lied to

## Out of scope

Multiple packs, wheeling, variable player counts, item balancing, any goal generation beyond a hardcoded table, letting players guess who watched them.

## Risks & unknowns

Burn-on-collision may be too punishing with only 4 rounds — the pack might not thin fast enough to matter. The one-round-delayed spy feed may be too weak to act on. Biggest unknown: whether the liar feels like a delicious twist or an arbitrary tax, since the victim never gets to know in the moment.

## Done means

Four phones each show a different goal and a different spy feed, all four pick within the same 12-second window, at least one collision burns an item live on the TV, and the reveal screen correctly names which player had the inverted feed.
