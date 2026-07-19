## Overview
A 3-5 player co-op timing puzzle. One player's phone is the **radar map** (the Controller); everyone else is a blind pilot on final approach who can only see a throttle. The joke and the whole game is that the Controller can see *where* every plane is but not *who* is flying it.

## Problem
Every "guide the blind pieces" party game collapses into one bossy person narrating a map while everyone obeys. The itch here: make the guide's information genuinely incomplete in a way that forces the blind players to actively out themselves — turning navigation into a scramble of mutual identification, the real texture of ATC radio.

## How it works
Three to four planes descend fixed approach lanes that all funnel onto ONE runway. Two planes in the same lane-segment at the same tick = a go-around (fail). Players must land all planes cleanly inside ~90s.

- **Host screen (shared TV):** the radar — anonymous blips crawling down their lanes, the runway, a countdown. No names, no labels.
- **Controller's phone:** the same radar, plus the only interactive controls: they can *nothing* to the planes directly — they can only talk out loud and press a per-lane "cleared to land" gate.
- **Each pilot's phone (PRIVATE):** NO map at all. Just a big throttle (SPEED UP / HOLD / SLOW), their current lane name whispered only to them, and a glowing **IDENT** button.

Because blips are unlabeled, the Controller can't say "Alice, slow down." They must describe motion — "the plane that just sped up in the north lane, ident!" — and the pilot who recognizes themselves taps IDENT, flashing their blip gold for 2s on the radar and TV. Every ident costs precious seconds, so good crews learn to self-identify preemptively.

## Technical approach
Authoritative WebSocket server (PartyKit / Cloudflare Durable Object) holding one Room object: `{ planes: [{id, lane, position, speed, identUntil}], runwayFree, clock }`. The server ticks planes forward at fixed 4Hz using each pilot's last throttle input, detects lane collisions and runway conflicts server-side, and broadcasts radar state to Controller + TV. Pilot phones receive ONLY their own `lane` string and a throttle-ack — never positions — so the asymmetry is enforced by what the server sends, not by client trust. The genuinely hard part is latency fairness: a pilot's SLOW must apply on the same tick the Controller sees, so inputs are timestamped and applied at the next server tick with a 250ms input-buffer; ident flashes are server-scheduled so TV and Controller see them synchronized.

## v1 scope
- 3 planes, 3 straight lanes merging to 1 runway, one round, 90s.
- Throttle = 3 discrete speeds; no steering.
- Ident = 2s gold flash, unlimited presses.
- Win = all 3 landed; lose = any go-around or timeout.

## Out of scope
- Steering/heading control, curved lanes, weather.
- Score, multi-round, difficulty ramps.
- Reconnection grace, spectators.

## Risks & unknowns
- Does anonymized radar create fun scramble or just confusion? Needs playtest; mitigate with lane names as coarse anchors.
- 3 planes may be too easy — tune lane length / merge geometry.
- Voice is the real channel; works only co-located (fine for party).

## Done means
Three phones join via QR, one becomes Controller automatically, three anonymous blips descend, a pilot pressing IDENT flashes the correct blip within 300ms on both TV and Controller, and a room can land all three planes using only voice + throttle + ident.
