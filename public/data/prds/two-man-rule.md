## Overview
Two-Man Rule is a 3–4 player cooperative voice game for a shared TV + phone controllers. The room staffs a launch console clearing a queue of orders; each order can only be authorized when its two keyholders turn their keys together. It's for people who loved the two-key nuclear trope and want the frantic 'who's got a key for this?!' scramble.

## Problem
Spaceteam-style games make you shout commands *at* people. The itch here is the inverse: the console tells you an order is ready, but the room has to *discover by voice* which two humans are even allowed to act on it — then land a synchronized turn — before the clock runs out.

## How it works
The **host screen** shows one active order at a time from a short queue (e.g. `AUTHORIZE: RED SILO`) plus a countdown and a shared 3-2-1 TURN ticker.

Each **phone privately** shows a KEYRING: the list of order names this player is authorized to co-sign, and a hold-to-turn KEY button that only unlocks for the active order if it's on their ring. Rings are built so every order has exactly two matching keyholders — but no phone can see anyone else's ring. So when `RED SILO` lights up, the two holders must out themselves ('I've got RED SILO!'), find each other, and on a shared verbal 'three, two, one' both press-and-turn within a ~300ms window. Off-window, solo turn, or an unauthorized player mashing their (locked) key = MISFIRE, order resets. One trap order per game has only one real keyholder and must be aborted by the room shouting ABORT and tapping SKIP. Win = clear the queue with zero live misfires.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object) over Tailscale Serve. Data model: `orders: [{name, keyholders:[id,id], type:'pair'|'trap'}]`, `activeIdx`, per-phone `keyring: string[]`. Phones send `TURN{orderId, clientTs}` on release; server RTT-normalizes each client's timestamp against a rolling ping estimate and checks whether both designated keyholders' normalized turns fall inside the window. The hard part is fair simultaneity detection across heterogeneous phone latency — the turn must be judged on normalized action-time, and the shared 3-2-1 ticker must render at the same wall-clock moment on every device (server-driven countdown with client clock-offset correction) so 'turn on zero' is fair.

## v1 scope
- 3–4 players, one queue of ~5 orders, exactly-two keyholders each, one trap.
- Hand-authored rings; hold-and-release key with server window check.
- Host: active order, countdown, misfire/win banners.

## Out of scope
- Speech recognition, scoring, escalating difficulty, decoy false-positive rings, multiple queues/rounds.

## Risks & unknowns
- Partner-discovery may drag with 3 players (rings overlap a lot); tune ring sizes.
- Sync-turn fairness under bad wifi is the make-or-break.

## Done means
Four phones clear a scripted queue: a matched pair turning within 300ms authorizes an order, a mismatched or unauthorized turn misfires, the trap order forces an ABORT, and clearing the queue flips the host to LAUNCH CONFIRMED.
