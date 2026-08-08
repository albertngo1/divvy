## Overview
A 3-player drafting game about the part of drafting nobody can see: the wheel. You pick items, but the real points come from a secret prediction that a specific item will *survive* the whole pack untouched. For groups who've drafted before and for groups who never have.

## Problem
Drafting is a great mechanic trapped in a terrible ritual — sequential picks, two-thirds of the table waiting and staring at nothing, and the one genuinely skillful act (predicting what wheels back to you) happening invisibly inside one person's head with no way to be rewarded or caught out. In person you cannot make everyone pick at once, and you cannot audit a prediction someone made silently three minutes ago.

## How it works
One pack of 9 items sits on the TV, named and face-up to everyone.

**Each phone privately shows** the same 9 items annotated with **your own secret value table** — a per-player mapping of item traits to points, so the identical pack reads as "gold mine" to you and "junk" to the person beside you.

Before any picking, every player locks one **wheel call**: the single item they bet will still be unclaimed when the pack is exhausted. Private, permanent, never shown until scoring.

Then three passes. In each pass all three players tap a pick simultaneously against a 20-second server clock. **Collision burns**: if two or more players tap the same item, nobody gets it, it is removed, and it is dead for wheel calls too. Non-colliding picks are claimed silently.

**The TV publicly shows** the shrinking pack, the burn flash, and after each pass an unattributed **heat strip** — how many total taps each remaining item drew — which is the only read anyone gets on what the others want.

**Scoring**: your own private values of the items you own, plus your wheel-call item ×3 if it survived all three passes, 0 if it was taken or burned. If two players called the same surviving item, both calls void.

## Technical approach
Host tab + phone PWAs + one authoritative Durable Object. State: `{pack[], claimed{}, burned[], calls{}, values{playerId: table}}`. Each socket receives the public pack plus only its own `values` row and its own call. Picks are buffered server-side and resolved atomically at the deadline — no client ever learns another's pick before resolution. The hard part is simultaneity that *feels* simultaneous: a single server-clock deadline with client-side interpolation for the countdown, rejection (not queueing) of frames arriving after the deadline, and pushing the burn result to all four screens inside ~150ms so the collision lands as a shared gasp rather than three staggered updates. Reconnect restores the private value table and any locked call.

## v1 scope
- Exactly 3 players, one 9-item pack, three passes
- One wheel call per player, locked before pass 1
- 12 authored items, 3 traits, hand-tuned value tables
- ~4 minutes end to end, no rematch, no persistence

## Out of scope
- Multiple packs, pack-passing direction, deck-building
- 4+ players, custom value tables, hate-draft callouts
- Art, sound, spectator view

## Risks & unknowns
- Degenerate wheel calls: if value tables barely overlap, calling the item nobody values is free points. Tables must share enough hot items to make the bet scary.
- Collision-burn may make everyone timid, producing a dull pack of safe picks.
- The heat strip could leak too much (picks become deterministic) or too little (calls become coin flips).
- The wheel concept may need one live example round before non-drafters get it.

## Done means
Three phones join by code; nine items resolve over three simultaneous passes; a deliberate double-tap burns the item on all four screens within 150ms; scoring reveals all three wheel calls at once; socket inspection confirms no phone ever receives another player's value table, pick, or call before resolution; and in playtest at least one wheel call per session both survives and pays off.
