## Overview
Epicenter is a 4-6 player social-deduction game that turns the floor into a seismic sensor network. Every player places their phone flat on the ground at their own spot; one secret Stomper triggers a shockwave, and only by comparing how hard each private phone twitched can the group triangulate — and catch — the source. For groups on wood/joist floors who want deduction that runs on real physics instead of bluffing alone.

## Problem
Social deduction games are pure talk — nothing anchors the lie to the physical world. Meanwhile the accelerometer, when a phone rests on the floor, is a real vibrometer: a stomp propagates and decays with distance, so *where you're standing* becomes ground truth that a liar has to fight. Nobody uses the room's floor as the board.

## How it works
Players spread out and set phones flat on the floor, then step back to their own phone. The host TV shows a top-down room grid and a countdown. One phone is PRIVATELY told "you are the Stomper — stomp once, hard, when the meter goes green" while every other phone PRIVATELY says "you are Ground — stay still." On the go signal the Stomper stomps near their own phone. Each phone samples accelerometer magnitude for ~1.5s and computes its own peak jolt. Crucially, each phone shows ONLY its own needle reading privately ("you felt: 0.8g") — the host never reveals the map of readings. Players then talk: "mine barely moved," "mine spiked huge." The Stomper's phone read the biggest jolt (they're closest to their own stomp) so they must lie about their number. The group discusses room positions and votes who's at the epicenter. Room-as-board: physical spacing determines the decay gradient, so honest neighbors' reports geometrically corner the liar.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `Room{phase, stomperId, positions[]}`, `Phone{id, role, peakG, reported}`. Per-phone: `DeviceMotion` `accelerationIncludingGravity`, high-pass to drop the 1g rest bias, take peak L2 magnitude over the sample window. Server assigns exactly one Stomper, opens a synchronized ~1.5s capture window (server timestamp + client offset), collects each phone's private `peakG`, and withholds it from the host — only publishing the vote tally. Genuinely hard part: honest calibration and sync. Floors differ wildly, so each phone runs a 3s quiet baseline + one practice stomp to set a personal scale, and the capture window must be tightly time-aligned so a late stomp isn't mistaken for a different location.

## v1 scope
- 1 round, 4 players, all on the same floor
- One Stomper, one synchronized capture window
- Each phone shows only its own peak; host shows only the final vote
- Simple majority vote to accuse

## Out of scope
- Actual 2D trilateration / drawn heatmap on host
- Multiple stompers, multi-round scoring, roles beyond Stomper/Ground
- Carpet/slab auto-detection

## Risks & unknowns
- Concrete slabs may not transmit stomps far enough to create a usable gradient (best on wood/suspended floors) — needs playtest across floor types.
- Players lifting/bumping phones create false spikes; needs a "don't touch your phone" lock and outlier rejection.
- DeviceMotion needs HTTPS + iOS permission gesture; sampling rate varies by device.

## Done means
On a wood floor with 4 phones spaced ~1.5m apart, a stomp produces per-phone peak readings that monotonically decay with distance from the Stomper in at least 3 of 4 trials, each phone privately shows its own value, and the host tallies the group's accusation vote.
