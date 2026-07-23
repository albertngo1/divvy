## Overview
Carom is a competitive last-ship-standing bullet-hell (danmaku) for 3–4 players. The genre theft is danmaku's core tension — thread the needle through a wall of bullets — but the bullet field is PRIVATE to each phone, and you survive by deflecting your own incoming fire into someone else's private field. For people who liked Ikaruga but wanted to be mean about it.

## Problem
Bullet-hell is a solo flow state — beautiful, isolating, un-social. And a shared screen full of everyone's bullets is unreadable chaos. The itch: keep danmaku's dodge-thrill but make it interpersonal, where the bullets you survive become the bullets you gift to a friend.

## How it works
Each player holds a phone tilted flat as a controller. **Private (phone):** your phone shows a top-down arena with only YOUR ship and only the bullets currently hunting YOU. You tilt (accelerometer) to slide your ship and dodge. When a bullet is near, a tap inside a short timing window **deflects** it — its new heading is the direction you're currently leaning, aimed at a chosen rival — and that bullet vanishes from your field and materializes as a fresh threat on THAT rival's phone a beat later. **Shared (TV):** the host screen shows abstracted ship positions, each player's hit-count/lives, and a "heat" glow when someone's field is overloaded — but never the actual bullets. So no one can see the storm bearing down on anyone but themselves; you only learn you've been targeted when your own phone lights up. Server periodically injects neutral bullets so fields never go quiet. Last ship with lives remaining wins.

## Technical approach
Host tab + phone PWAs over an authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO via Tailscale Serve). **Data model:** Room holds `Player{shipPos, lives, tiltVector}` and a global `Bullet{id, ownerField, pos, vel, spawnTick}` list partitioned by which field it's in. **Sync:** server runs bullet physics at 30–60Hz and streams to each phone ONLY the bullets whose `ownerField == thisPlayer` (bandwidth-cheap, naturally private). Phones send tilt vectors (throttled) and deflect events (`{bulletId, aimVector, tick}`). Server validates the deflect window server-side, retargets the bullet, and reassigns its field — the reassignment is the whole game. **Genuinely hard part:** deflect fairness across latency — the client sees a bullet at a rendered position, but the server must judge "was it really in range at that tick?" using client-timestamped input plus a server-estimated clock offset, or players near the edge feel robbed. Tilt calibration (a "hold flat, tap to zero") also matters so couch postures don't bias drift.

## v1 scope
- 3–4 players, one arena, one elimination round.
- 3 lives each; tilt to move, tap to deflect at nearest rival (auto-target the lowest-life opponent for v1 — no aim yet).
- Neutral bullet drip so no field idles.
- TV shows only lives + heat glow.

## Out of scope
- Manual deflect-aiming, bombs, power-ups, ship variety.
- Teams, spectators, best-of-N match flow.
- Fancy particle art; primitive shapes are fine.

## Risks & unknowns
- Accelerometer dodging may feel imprecise vs. touch — needs a sensitivity/deadzone pass.
- Deflect-window latency validation could feel unfair; may need generous windows early.
- Not seeing rivals' fields might feel arbitrary rather than tense — the TV heat glow must telegraph enough.

## Done means
Four phones join, each dodges a bullet field invisible to everyone else via tilt, and a successful tap-deflect provably removes a bullet from one player's phone and spawns it on the auto-targeted rival's phone, ending with exactly one ship alive.
