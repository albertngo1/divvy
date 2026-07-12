## Overview
Lighthouse is a 3-4 player cooperative real-time party game. One player is the Keeper, whose phone is a top-down harbor chart. Everyone else is a Skipper piloting their own boat home through rocks in the dark. The shared host TV shows an atmospheric night sea where almost nothing useful is readable.

## Problem
Co-op "one person guides the blind" games usually collapse into a single map-reader narrating while everyone else sits passive. Lighthouse gives every blind player an active, private, simultaneous piloting job — and deliberately starves the guide of bandwidth so they can't just spoon-feed everyone.

## How it works
**Host TV (public):** black water, drifting fog, faint boat-lights, wave motion — no rock positions, no channel.
**Keeper phone (private map):** the full top-down chart — every rock, the safe channel, each boat's live position and heading, and distance-to-harbor. The Keeper drags a finger to aim the lighthouse BEAM, a ~40° wedge that sweeps across the water.
**Each Skipper phone (private, first-person):** a dark cockpit — a big heading wheel to rotate, a throttle to commit a short forward move, a compass, and a fuel/time gauge. Normally shows nothing ahead. BUT when the Keeper's beam sweeps across that boat, the phone flashes a ~1-second local glimpse: rocks within ~2 cells, rendered relative to that boat's own heading. The beam has a limited charge/cooldown, so the Keeper physically cannot keep light on everyone.
Loop: Skippers rotate and nudge forward continuously; the Keeper sweeps to hand out brief private glimpses and shouts verbal vectors. All boats must reach the harbor mouth before a 90s tide timer. Hitting a rock is a strike; 2 strikes sinks a boat and the round is lost.

Load-bearing: each glimpse is private and heading-relative, boats move at once, and the beam is a shared rationed resource. One passed phone can't pilot three simultaneous boats.

## Technical approach
Host tab + phone PWA + authoritative WS server (PartyKit / Durable Object over Tailscale Serve).
Data model: `Room{ boats:[{id,x,y,heading,strikes,fuel}], rocks:[{x,y}], harbor, beam:{angle,charge}, tideTimer }`.
Sync: server authoritative at ~15Hz. Boats send heading/throttle intents; server integrates positions, checks rock collisions, computes which boats fall inside the beam wedge, and pushes each one a private glimpse packet (only its local rocks). Keeper streams beam angle. Host renders interpolated boat-lights only.
Hard part: fair private glimpses under latency — the glimpse must reflect the boat's position at beam-cross time, so reveal/collision is computed server-side (not on the Keeper's drag), using server timestamps and a short reveal window so wedge membership feels crisp despite ~100ms RTT.

## v1 scope
- 3 players: 1 Keeper, 2 Skippers.
- One harbor, ~8 fixed rocks, one roughly straight channel.
- 90s tide timer; 2 strikes = sink.
- Beam: 40° wedge, 2s charge / 1s cooldown.
- In-room verbal comms allowed.
- Win/lose screen, no meta scoring.

## Out of scope
More boats/keepers, multiple rounds, procedural harbors, currents/weather, matchmaking, saved stats, spectator mode.

## Risks & unknowns
- Is a 1s glimpse enough to act on, or maddening? Tune duration/radius.
- Reveal-timing fairness under latency.
- Beam-drag ergonomics on a small screen.
- Free verbal comms might trivialize it — a later beam-only mode may be needed.

## Done means
3 phones join; 2 blind Skippers pilot boats steered only from their private cockpits; the Keeper's beam produces per-boat private rock glimpses; and a playtest can be both won (both boats docked) and lost (a boat sinks) inside 90s.
