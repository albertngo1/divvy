## Overview
Brush Pass is a turn-based blind-placement deduction game for 3–4 players on a shared TV with private phones. Each player is a spy trying to leave a message at a dead-drop somewhere on a shared city map. Collisions destroy messages — but they also secretly reveal information only to the colliding pair, turning the punishment into a deduction engine.

## Problem
Anti-coordination games usually give every player the same public feedback after a collision. Brush Pass hides the collision *signal* per-phone: when you clash, only you and your clashmate learn it happened to you specifically. That asymmetric leak is the whole game — and it's impossible to fake with one shared phone.

## How it works
The shared map shows ~8 numbered drop points (a park bench, a locker, a hollow tree…). Each phone PRIVATELY holds: one message to deliver, and a shortlist of 3 candidate drops it's tradecraft-cleared to use (asymmetric — shortlists overlap deliberately). All players secretly tap one drop, then reveal simultaneously.

**Resolution:** any drop chosen by 2+ spies is *burned* — every message there is intercepted (lost this round), and the drop turns red on the TV. A drop used by exactly one spy delivers successfully.

**The asymmetric leak — PRIVATE to each phone:** if you were burned, your phone whispers "someone else used your drop — they had it on their list too," and shows you a scrambled hint about them (e.g., "they also could reach drop #4"). Non-colliders and the host learn nothing beyond which drops went red. Over 3 attempts, the room must get every message delivered to a distinct drop. You use the private whispers to infer whose shortlist overlaps yours and route around them silently.

**Host screen:** the map, red-burned vs green-delivered drops, and a round counter. It never shows who chose what.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. **Data model:** `drops[8]`, `players[{id, message, shortlist:[dropIds], choice}]`, `round`. Instances are pre-generated so a distinct-drop solution provably exists but shortlists are tight (bipartite matching with forced overlaps). **Sync:** phones submit `choice`; server waits for all, resolves collisions authoritatively, then sends each phone a *tailored* payload — public burned/delivered set to everyone, plus a private leak object only to burned players. **Genuinely hard part:** the per-recipient message fan-out. The server must compute and route different truth to different phones every round without leaking the private hint into the public broadcast — one shared channel would collapse the deduction, so state diffing is strictly per-connection.

## v1 scope
- 3 players, 6 drops, shortlists of 3, up to 3 attempts.
- One hand-authored solvable instance.
- Blind tap → simultaneous reveal → private whisper → replan.
- Win screen when all three delivered to distinct drops.

## Out of scope
- Procedural instance generation, difficulty tiers, scoring/streaks.
- More than 4 players, richer leak hints, cosmetics.
- Reconnect beyond simple rejoin.

## Risks & unknowns
- Whether the scrambled leak gives *enough* signal to deduce without solving it outright.
- Balancing shortlist overlap so it's tense but not luck.
- Players ignoring whispers and brute-forcing.

## Done means
Three phones join; each sees only its own message and 3-drop shortlist; on simultaneous reveal, shared drops burn red on the TV while only the colliding phones receive a private whisper; the trio can replan and, within three attempts, deliver all messages to distinct drops for a win — verified on real devices with no private hint leaking to the host screen.
