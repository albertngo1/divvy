## Overview
Light Lag is a 3-player, one-round cooperative landing game. One phone is the PILOT and holds every control. Two phones are MISSION CONTROL and hold no controls at all — but they are the only devices in the room showing the world as it actually is, right now. The pilot's screen, and the shared TV, show the same feed four seconds stale.

## Problem
Voice-coordination games usually split *information*. This one splits *time*. The dramatic core of every real spacecraft anomaly — the ground already knows you're dead, and is telling you so — has never been the mechanic of a party game. It produces a specific, teachable panic: the pilot must stop believing their own screen.

## How it works
A 90-second powered descent to a landing pad.

PILOT (private): throttle slider, two attitude buttons, and a rendered viewport of the surface — all drawn from world state at t-4s. Their altimeter is stale too. Their inputs, however, apply *immediately*.

NAV (private): a live top-down map — terrain, boulders, the pad, and the lander's true position and drift vector. No fuel, no attitude.

SYSTEMS (private): live fuel remaining, true tilt angle, descent rate, and hull stress warnings. No map at all.

Neither controller can see what the other sees, and neither can touch anything. The pilot cannot see the truth. So the whole round is two people talking over each other in a room while a third tries to decide whose sentence to obey, knowing that the crater on their own screen already happened.

SHARED TV: the delayed feed, played as a broadcast — same four-second lag, big and cinematic, with a LIVE/DELAYED badge. Deliberately not a god view; spectators feel the lag with the pilot. On touchdown the TV replays the last ten seconds with the live path ghosted over the delayed one.

## Technical approach
Authoritative sim at 20 Hz in a PartyKit / Durable Object room. Server keeps an 80-frame ring buffer of `WorldState{pos, vel, tilt, fuel, contacts}`. Each tick it pushes frame `n` to the two controller sockets and frame `n-80` to the pilot socket and the host socket. Pilot inputs are applied to frame `n` on arrival — controls are live, perception is not.

Model: `Room{code, phase, tick, seed, roles}`, `Lander{...}`, `Terrain{heightmap, hazards[]}` generated from `seed` so all clients render identically from state alone.

The hard part is that the lag must feel like physics, not lag: per-connection RTT is measured at join and *subtracted* from the 4 s budget so a slow phone doesn't get 4.4 s of delay, and the pilot's render interpolates between delayed frames so the stale view is smooth rather than stuttery. Second hard part is terrain tuning — the map must be unlandable by a pilot flying on their own viewport and comfortably landable by a pilot who obeys voice. That is a level-design problem, solved by hand, not procedurally.

## v1 scope
- 3 players, fixed roles, one hand-authored terrain seed, one 90-second descent
- Fixed 4-second delay, no difficulty options
- Two outcomes: landed on pad, or crashed/out of fuel
- TV: delayed feed, fuel-free, plus the ghosted replay

## Out of scope
Role rotation, multiple terrains, variable lag, tilt/gyro control, more than 3 players, scoring beyond pass/fail, reconnect.

## Risks & unknowns
Four seconds may be past the point of learnability — 2.5 s might be the real number, and only playtesting decides. Co-location means the pilot could crane at a controller's phone; the delay must be fun enough that cheating feels boring. Rendering a legible viewport on a phone is the biggest art risk.

## Done means
Three phones and a TV, one 90-second descent, where the recorded session shows the pilot's screen displaying clear sky at the same instant Nav's phone shows contact with a boulder — and a successful landing achieved with the pilot's viewport dark for the final eight seconds.
