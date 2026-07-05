## Overview
Squelch is a 3–4 player co-op party game about radio discipline. The room shares exactly ONE voice channel — a single push-to-talk token — and must relay a chain of coded messages before the timer runs out. The host screen is the net; each phone is a handset.

## Problem
Spaceteam-style games flood you with commands but quietly assume everyone can shout simultaneously. Real crews can't — a radio net has one channel. The comedy nobody has mined: coordinating *who talks when*, when the only tool you have to coordinate IS the channel you're all fighting over.

## How it works
Host screen (shared): one big CHANNEL indicator — GREEN/idle or RED with the callsign of whoever's currently keyed up; a TRAFFIC LOG of successfully relayed messages; a COLLISION counter; the timer.
Each phone (private): your callsign (e.g. "BRAVO"), a hold-to-talk KEY bar, and — when the relay reaches you — a MESSAGE CARD: a code phrase plus a recipient callsign ("To DELTA: 'Kingfisher-7'"). Every phone holds different cards; you only ever see yours.
Loop: the server grants the PTT token to exactly one phone at a time. You key up, read your card aloud, name the recipient. That recipient hears it and taps the matching code on their private RECEIVED list (each list is scrambled and salted with decoys). A correct tap logs the message and advances the chain to the next sender. If two phones key simultaneously → COLLISION: both transmissions void, a penalty, and everyone's key locks for 2 seconds. You must take turns — but you can't discuss turn order without using the channel, so you improvise hand signals, eye contact, and dead air.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / one Durable Object per room, or Socket.IO over Tailscale Serve). Data model: `Room {code, players[], channelToken: playerId|null, chain: [{from,to,code,status}], collisions, deadline}`. Key-up sends REQUEST_PTT; server grants only if `channelToken` is null, else emits COLLISION to both keyers. Sync: server is sole owner of the token and chain and broadcasts channel state on every change. Genuinely hard part: collision fairness under latency — two near-simultaneous key-ups must resolve deterministically (server-timestamp + a small grant window), and the RED indicator must feel instantaneous or players double-key by reflex. No audio processing needed — real voices carry across the room; the server only arbitrates the token and matches taps.

## v1 scope
- 1 round, 90s, 3–4 players
- One linear chain of 5 messages
- PTT token + collision penalty + 2s lockout
- Private message card + scrambled received-list tap-to-confirm
- Host: channel light, traffic log, collision count, timer
- Win = all 5 relayed; lose = timer expires

## Out of scope
- Speech recognition / audio verification
- Multiple channels, branching chains, multi-round scoring
- Reconnect handling, spectators

## Risks & unknowns
- Is fighting over one channel fun or just frustrating? The collision penalty must stay gentle.
- Latency on token grant could cause "unfair" collisions that feel cheap.
- It might collapse into a dull strict round-robin — the chain must jump unpredictably between players so timing stays contested.

## Done means
Four phones join a room code, a 5-message chain completes via real spoken relay with the host log filling in order, a deliberate double-key registers a visible COLLISION on the host screen, and the round ends in a clean win or a timeout.
