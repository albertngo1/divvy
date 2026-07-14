## Overview
Pilot is a real-time cooperative party game for 3–5 people: one **Pilot** and 2–4 **Rowers**. The Pilot holds the map; the Rowers are blind boats that must be talked into harbor before the tide smashes them.

## Problem
Blind-navigation games (guide-sees-all, pieces-see-nothing) get one-directional fast: the sighted player narrates, the blind players obey, and the blind players are basically joysticks. The itch is a guide game where *both* sides are half-blind, so the conversation is a genuine two-way negotiation instead of dictation.

## How it works
The truth is split three ways.
- **Pilot's phone (the map):** a top-down chart — every boat as a colored dot with its heading, the harbor mouth, and each boat's assigned berth. Crucially, **no rocks are drawn.**
- **Rower phones (the pieces):** a tiny keyhole — a compass rose plus a short cone of water ahead that reveals rocks within ~1.5 boat-lengths, and a tilt-to-steer / tap-to-throttle control. **No overview, no berth, no other boats.**
- **Host TV (shared):** just the tension board — a 90-second clock, total hull integrity, and a "1/2 docked" counter.

A gentle current nudges every boat each second, so no one can park and wait their turn — the Pilot juggles all boats live. A Rower shouts "rock dead ahead, hard right?" and the Pilot answers "no — your berth is behind you, come about." Neither can navigate alone.

## Technical approach
Host browser tab + phone PWA clients + an authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `room { boats[{id,x,y,heading,vel,hull}], rocks[], berths[], current, clock }`. The server runs the physics sim at ~20 Hz, integrates each Rower's tilt/throttle inputs, and **broadcasts per-client filtered state**: each Rower gets only its own fog-culled cone, the Pilot gets a positions-only snapshot with rocks stripped server-side. The genuinely hard part is real-time filtered sync — 20 Hz authoritative state, client-side interpolation of your own boat, reconciliation against server truth, all over jittery phone links — while guaranteeing the cull happens on the server so no client can sniff hidden layers.

## v1 scope
- 1 Pilot + 2 boats, one channel, 4 rocks.
- Gentle constant current; tilt to steer, tap to throttle.
- 90-second clock, 3 hull hits = fail, dock both berths = win.
- TV shows only clock + hull + docked count.

## Out of scope
- More channels, cargo/draft mechanics, a saboteur, wind.
- Any TV cinematics beyond text; sound design; reconnection polish.

## Risks & unknowns
- Tilt steering: calibration drift and motion sickness on phones.
- Whether asymmetric blindness reads as delightful tension or just frustration — must playtest the exact info split.
- iOS `deviceorientation` permission friction; server-side fog-cull cost at 20 Hz.

## Done means
From three phones, a Pilot and two blind Rowers dock both boats using only their voices; the server never sends rocks to the Pilot or positions to the Rowers; a hull collision registers on the TV and the round fails at three hits.
