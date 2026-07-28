## Overview
A 5-minute talking game for 4–6 people. A dog is loose in a six-location neighborhood. You divide the search out loud, then everyone commits simultaneously. Two searchers at one location spooks the dog — both score zero and that location is burned. The catch: **every phone renders the same map under a different local naming scheme**, so the plan the room just agreed on is quietly wrong.

## Problem
Most "divide the work" games fail because dividing work is easy — you say six things and you're done. Here the failure is baked into language: you can negotiate perfectly, in good faith, out loud, and still collide, because "the old Rite Aid" and "Fifth and Pine" are the same building and nobody in the room knows it. Anti-coordination stops being a dice roll and becomes a comedy of mistranslation.

## How it works
Six canonical locations. Each phone privately shows a list of places it knows, named from **its own alias pool** — one player sees business names ("the bakery", "Rite Aid"), one sees cross-streets, one sees nostalgic names ("where the arcade was"), one sees landmarks ("the big flagpole"). Each phone knows only 4 of the 6 — two are blank gaps, so nobody can just enumerate.

Each phone also privately holds one **true feature clue** about the dog: *"not somewhere with a roof"*, *"somewhere with water"*. Features are the one shared vocabulary, which is exactly what makes people think they're communicating.

The TV runs a 90-second open negotiation timer — talk, argue, sketch in the air. Then a hard 15-second **lock**: no more talking, each phone picks one place from its private list. Locks are hidden until all are in.

Resolve: any canonical location picked by ≥2 players is spooked — zero for everyone on it. Unique picks score. If someone landed on the dog, big points. The payoff screen is the whole game: the TV finally draws the **true map**, each pin ringed with all the different names the phones were using for it, so the room watches its own confident plan fall apart.

## Technical approach
Socket.IO over Tailscale Serve (or a PartyKit room). Server holds truth: `{locations: [{id, features[], aliasesByPool}], players: {id, aliasPool, knownLocationIds[4], clue, lock?}}`. Phones only ever receive their own projected view — the alias mapping never crosses the wire to another client, so there's no client-side leak to inspect.

Sync is trivial (one commit per player); the hard parts are **content design and simultaneity**. Aliases must be ambiguous but fair — each pool needs at least one shared anchor name so the room isn't just lost. And locks must be atomic: buffer server-side, reveal only on the last submit, with a lock timer to kill stalling.

## v1 scope
- One round, six locations, 4–6 players, one dog
- Three alias pools, hand-authored, one neighborhood
- 90s talk timer + 15s blind lock
- Collision resolution and the alias-overlay reveal

## Out of scope
- Multiple rounds/neighborhoods, generated aliases, movement, a real map, scoring across games

## Risks & unknowns
- Aliases may be *too* transparent (room decodes them in 20s) or too opaque (nobody communicates at all)
- Six locations may be too few for 6 players — collisions become unavoidable rather than tragic
- Needs a talkative group; dead-quiet rooms get nothing

## Done means
A 5-player table plays one round, believes it has fully divided the neighborhood, and at least one collision occurs from two players using different names for the same location — confirmed by the reveal screen and by audible groaning.
