## Overview
Backoff is a real-time party game about a single shared radio channel that only carries a message when exactly one person transmits. 4–6 players, one host screen (the channel), phones as private transmitters. It's a game where the crowd's instinct to grab an opening is precisely what jams it — coordination is the failure mode.

## Problem
Most party games reward reading the room and piling in. Backoff punishes it: the moment two people reach for the same empty slot, both lose it to collision. There's no talking, no coordinating — the failure is blind, frantic, and always shared. It scratches the itch of contention: everyone wants the same airtime and wanting it together destroys it.

## How it works
The host shows a channel — a horizontal track of ~40 time slots that fills left-to-right over 60 seconds, one slot lighting every ~1.5s with a visible countdown. Each phone PRIVATELY holds a queue of packets (say 6), some high-value. To deliver a packet you TRANSMIT it in a slot where NO other player transmits. Your phone shows only: your packet queue, a big TRANSMIT button, and your private delivered/jammed history. It never shows whether others are about to transmit. Per slot the server collects all taps: exactly one → delivered, points to that player, host plays a clean beep + green blip; two or more → COLLISION, all colliding packets bounce back into their owners' queues, host plays harsh static + red blip; empty slot → wasted airtime. The meta-game: high-value packets tempt everyone to grab the same early slots, so you learn to hang back — to 'back off' — and snipe quiet slots, while the final slots turn desperate as queues must clear. Most points delivered wins.

Per-phone is load-bearing: each player owns a private queue and private timing intent; the entire tension is that you cannot see or coordinate others' taps. One phone passed around would collapse the game.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{code, slotIndex, players[]}; Player{id, queue:[{value}], delivered:[], score}; a per-slot transmits map {playerId→packetId}. Sync: the SERVER owns the slot clock, firing every ~1.5s and broadcasting slotStart{index}; phones send transmit(packetId), buffered until slot close; at close the server resolves collisions and broadcasts a public slotResult to the host plus private results to each phone. The genuinely hard part: slot-boundary fairness under real phone latency — adjudicate by server receive-time within the open slot, show clients a synced countdown so late taps aren't surprising, and grant a small grace window keyed to slot-open time so a laggy phone isn't unfairly jammed.

## v1 scope
- One 60s channel, ~40 slots.
- 4 players, 6 packets each (2 high-value, 4 low).
- One TRANSMIT button, private queue, clean/static audio, green/red host blips.
- Single winner screen.

## Out of scope
- Multiple channels or rounds, exponential-backoff power-ups, teams, spectating, reconnection polish.

## Risks & unknowns
- Is blind timing fun or just luck? Needs the queue-value tension + visible countdown to feel skillful.
- Slot-boundary fairness under real phone latency.
- 1.5s cadence may be too fast/slow — must tune live.

## Done means
Four phones join via room code; over 60s each transmits packets; simultaneous taps in a slot audibly jam and return to queues; solo taps deliver and score; the host shows a live channel and a final ranking. Playable start-to-finish in one round.
