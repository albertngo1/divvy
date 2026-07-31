## Overview

Belay My Last is a 90-second co-op shift for 3–4 players on one shared machine. Every player is simultaneously a dispatcher reading orders aloud and an operator whose fingers own controls nobody else can touch. The itch it scratches is specific and, as far as we can tell, unclaimed: in this game your teammates' *obedience* is the hazard.

## Problem

Spaceteam-likes fail in exactly one direction — too slow. Everybody shouts, everybody taps as fast as their thumbs allow, and the only skill on offer is throughput. There is never a reason to hesitate, so nobody ever has to decide whether to trust a callout. We want a cooperative voice game where speed and caution are genuinely opposed, and where the room has to invent radio discipline out loud, mid-shift, because it's bleeding.

## How it works

**Host screen (TV):** a rig with 12 labeled controls (VENT A, PURGE 2, TRIM WHEEL, STANDPIPE…), a job bar, a SCRAP counter, a 90-second clock. Nothing player-specific ever appears here.

**Each phone, privately:** you own 3–4 of those controls as big buttons. Only your phone can press them; no other phone renders them at all.

Orders arrive on phones one at a time, roughly every 4 seconds. Your phone shows: **ORDER — "PURGE 2"** and a 6-second TTL bar. The control named is never one of yours. So you say it out loud; the owner finds it on their own panel and taps. Completed: +1 job. Expired: +1 scrap.

The twist: between 1.5s and 3.0s after an order appears, about a third of them flip to **RECALLED** — on the issuer's phone only, red banner and buzz. The owner's phone shows nothing, ever. Your only instrument is your mouth: *"BELAY PURGE TWO."* If they already tapped, +2 scrap. If they hold until it expires, clean.

Operators are punished for hesitating; dispatchers are punished for their teammates being quick. Within thirty seconds a room starts building protocol on its own — a deliberate one-beat pause before tapping, a HOT/CLEAR prefix, a verbal ack. That improvised protocol *is* the game, and it exists only because the recall is private to one phone.

## Technical approach

Host tab + phone PWAs + one authoritative PartyKit Durable Object per room (Socket.IO over Tailscale Serve is a drop-in). Clients render; they never decide.

Model: `room {phase, clockMs, jobs, scrap}`, `players[{id, name, controls[]}]`, `orders[{id, issuerId, controlId, issuedAt, ttlMs, recalledAt|null, state}]`.

Sync: server pushes redacted views on a 100ms tick — the host gets counters and the rig, each phone gets only its own controls and its own orders. A recall is a message addressed to exactly one socket.

The hard part is adjudication *fairness*, not throughput. A tap arrives as `{controlId, clientTs}`; the server matches it to the oldest live order on that control and resolves against server state. The race here is human (can you finish saying "belay" before a thumb lands?), so we don't need RTT normalization — but we do need a grace window: if a recall was issued less than ~400ms before the tap arrived, it is forgiven, because nobody could physically have heard it. Tuning that grace is the entire feel of the game. Order generation guarantees an issuer never names a control they own.

## v1 scope

- 3 players, one 90-second shift, one hand-drawn machine layout
- 12 controls, static per-player ownership assigned at start
- 12 scripted orders, 4 of them recalled — no difficulty curve, no RNG
- Two counters on TV: JOBS and SCRAP. No stars, no leaderboard, no end screen beyond the counters
- 4-letter room code; no accounts, no reconnect

## Out of scope

Reinstatement ("belay my belay"), multiple rounds or shifts, extra machines, any audio capture at all (the belay is human-to-human; the server never listens), spectators, matchmaking, difficulty tiers, sound design beyond a single recall buzz.

## Risks & unknowns

- The ~400ms forgiveness grace is a guess. Too generous and recalls never bite; too tight and it reads as a cheat. Needs log-driven playtest tuning.
- A 1-in-3 recall rate may teach players to simply stop tapping, deadlocking the shift into mutual hesitation. Mitigation lever is a harsher expiry cost.
- Control names must survive a loud room: phonetically distinct, no VENT A / VENT 8 collisions.
- With 3 players each owning 4 controls, does a panel feel like a panel or a menu?

## Done means

Three phones and a TV in one room: a shift runs start to finish with no desync; within that single shift at least one recall is beaten by voice (order cleared, no tap) and at least one is lost (tap lands, SCRAP increments); and the server's adjudication log matches what all three players believed happened.
