## Overview
Murmur is a 3-6 player cooperative synchrony game where each phone is a private color tuning fork. The room's goal is for everyone's color to converge to a single hue — but nobody can see the whole room. It's for people who like the eerie satisfaction of a flock turning as one, rendered as an emergent averaging protocol you play with your thumb.

## Problem
Most synchrony games give everyone the SAME global feedback (a shared meter, a shared beat). Real emergent consensus in nature — flocks, fireflies, neurons — comes from purely LOCAL matching: each unit only reacts to a neighbor. That mechanic is impossible with one passed-around phone, because every player must simultaneously see a DIFFERENT private slice of the room. Murmur is built entirely around that asymmetry.

## How it works
The server secretly wires all players into a directional ring (A watches B watches C watches A). Each phone PRIVATELY shows two things: a big swatch you tune with a hue wheel (your own color), and a small swatch showing the live color of the ONE neighbor you were assigned to watch. You don't know who watches you, and you never see the whole ring. You simply try to match your neighbor. Because everyone chases their forward-neighbor, values gossip around the loop and average toward consensus. Circular hue adds delicious instability: the ring can get 'twisted' (half the room drifting clockwise around the wheel, half counter) and stall in two camps — the tension is escaping that. The shared host TV shows every swatch laid out as a ring plus a live spread number; the room WINS when the maximum pairwise hue distance stays under threshold for 3 seconds.

## Technical approach
Authoritative WebSocket server (PartyKit / Cloudflare Durable Object) over Tailscale Serve. Data model: `players[{id, hue, neighborId}]` plus the ring assignment. Each phone streams `hue` on change (throttled ~15/s). The server holds all hues and pushes each connection ONLY its neighbor's current hue — a per-connection filtered broadcast. The genuinely hard part is threefold: (1) low-latency targeted fan-out where every client receives a different slice; (2) convergence detection on a CIRCULAR quantity (compute distances on the hue wheel, handle wraparound); (3) tuning the twisted-ring stall so it's a recoverable challenge, not a dead end — a gentle 'warmer/colder' haptic on total ring-spread nudges players out of local minima.

## v1 scope
- 3 players, ring of exactly 3
- Hue-only (single 1D color wheel)
- One round, win or 90s timeout
- Host ring view + spread number; phone shows self + one neighbor

## Out of scope
- Labeled/named colors, saturation/brightness dimensions
- Multiple or reconfiguring rings
- Scoring, rounds, reconnection grace, leaderboards

## Risks & unknowns
- May never converge under a twist; needs the anti-stall haptic tuned
- Circular topology may confuse first-timers
- Screen/perception variance in hue rendering across phones

## Done means
On a LAN, 3 phones join, the server assigns a hidden ring, each phone's small swatch tracks exactly its assigned neighbor (verified by inspection), sliders update live, and in a real playthrough the host ring collapses to one hue and fires WIN within 90 seconds.
