## Overview
A cooperative real-time steering game for 3 players (v1). One player is the **Lighthouse Keeper**, whose phone is the full nautical map. The others are **Boats**, whose phones are near-black — they can steer but cannot see the rocks between them and the harbor. The keeper owns a single rotating beam that can only illuminate one bearing at a time, so the room's fun is a scarce, time-shared reveal.

## Problem
Most 'guide the blind player' party games collapse to one person shouting directions — a single phone passed around works just as well. The itch here: make the guidance channel a *physical scarcity* the keeper must ration, and give the blind players real steering agency so they're not puppets.

## How it works
The **Keeper's phone (PRIVATE)** shows a top-down sea: harbor, 3 rocks, and every boat's live dot, plus a beam — a clock-hand ray centered on the lighthouse. The keeper drags to rotate the beam.

Each **Boat's phone (PRIVATE)** is black except its own dot and a heading dial (drag to set course; the boat drifts forward slowly and continuously). It sees NO rocks — *until the beam's bearing sweeps across that boat's position*, at which point its phone flashes every rock within a radius for ~1 second, then fades. Because the beam is one ray, only one boat (one bearing) is lit at a time; the keeper chooses who gets a glimpse and when.

The **host TV (SHARED)** shows a stylized foggy seascape, boat pips, and a beam sweep for spectator drama — but never the rocks. Boats steer between glimpses on memory alone. Hit a rock: that boat sinks (out). All surviving boats reaching harbor before a 90s timer = win.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object over Tailscale Serve). Data model: `{ rocks:[{x,y,r}], harbor:{x,y,r}, beamAngle, boats:{id:{x,y,heading,alive}} }`. Boats send `heading` intents; server integrates positions at ~10Hz, checks rock collisions, and computes beam-boat angular intersection each tick. On intersection it emits a private `illuminate` event to that boat only, containing nearby rock geometry. Sync strategy: server-authoritative positions broadcast to host; boats receive only their own dot + transient reveals. The genuinely hard part is the illumination timing feeling fair at 10Hz with mobile latency — the beam sweep and the flash must correlate, so the server timestamps reveals and boats render a short client-side afterglow.

## v1 scope
- 1 keeper, 2 boats, one round, 90s
- 3 rocks, one harbor, fixed layout
- Beam = drag-to-rotate; boat = drag heading, constant speed
- Win/lose banner on TV

## Out of scope
- Currents, variable speed, multiple beams, boat-boat collision
- Reconnect handling, matchmaking, more than 2 boats

## Risks & unknowns
- Is memory-steering between glimpses frustrating or thrilling? Tune reveal radius/duration.
- Mobile drift accumulation on the boat dial.
- Keeper overwhelmed juggling 2 boats — may need beam cooldown.

## Done means
Three phones join via QR; keeper rotates a beam that privately flashes rocks on exactly the boat it crosses; both boats steer blind and can sink or dock; TV shows a rock-free seascape and a win/lose result.
