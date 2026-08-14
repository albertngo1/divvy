## Overview
A 4-player cooperative game (one Reader, three blind Walkers) for a laptop/TV plus phones. The Reader holds the only map — except the map is almost entirely black. A radius-1 disc of terrain illuminates around whichever Walker moved most recently, and fades within seconds. The Reader is not a guide with a map; they are a guide whose map is *powered by the walking they're asking for*.

## Problem
In every map-holder game the holder is omniscient and the pieces are hands. The interesting asymmetry — that knowledge is expensive and someone has to pay for it with risk — never shows up, because the holder gets the whole board for free at t=0. Invert it: the pieces control the camera of a map they will never see.

## How it works
A 5×5 grid, one exit, two pit tiles, three Walkers starting in known corners. Moves are serialized: the Reader calls a name and a direction aloud; that Walker taps their pad; the server resolves one move per ~2 seconds.

**Reader's phone (private):** the map, 95% black. On each resolved move, the 8 tiles around the mover flash bright for 6 seconds, then decay to a dim "remembered" gray that the Reader may or may not trust — hazards don't move, but the Reader's own memory of what they glimpsed does. Nothing is labeled with coordinates; the Reader must build the map in their head as it strobes.

**Walker phones (private, and this is the load-bearing part):** each Walker sees only a directional pad, a one-line body-frame sensation after each step ("solid underfoot", "draft from the left"), and — privately — their own **step battery**: a secret number of moves left, drawn from 6–11 and hidden from everyone including the TV. A Walker who runs out is frozen in place, and a frozen Walker can no longer light anything. Nobody knows whose battery is short unless that player volunteers it, and volunteering burns the 4-minute clock and reveals to the room that the Reader has been spending their best flashlight.

**Host TV:** three anonymous lamps (MOVED / STILL / SPENT), the clock, and a running count of total moves made — no terrain, ever.

The strategy that emerges: the Reader must decide between scouting moves (send someone into blackness purely to light terrain) and progress moves, while blind to their own scan budget. Walkers start shouting "use me, not her" without being able to say why.

## Technical approach
Socket.IO over Tailscale Serve, or a PartyKit room; one authoritative room object. State: `{grid, walkers: [{pos, battery, spent}], lastMover, litUntil, phase}`. Server owns batteries and never ships them to any client but the owning socket. Lighting is computed server-side and pushed as a diff (`{tiles:[{x,y,state}], expiresAt}`) so the Reader's client cannot reconstruct unlit terrain from the payload — the wire format is the security boundary.

Hard part is less sync than pacing: a strict move-serialization queue with a 2-second resolve tick, plus fair handling of two Walkers tapping in the same window (first server-timestamp wins, loser gets a "not you" buzz and does not lose battery).

## v1 scope
- 4 players, one round, 4 minutes, one hand-authored 5×5 map
- One exit, two pits, batteries randomized 6–11
- Text-only sensations from a fixed 5-phrase table
- Win = all three Walkers on the exit tile; lose = timer or all frozen

## Out of scope
- Map generation, multiple rounds, scoring, moving hazards
- Reader rotation, reconnect handling, spectators

## Risks & unknowns
- The map may light too slowly to ever feel navigable; fade duration and disc radius are the tuning knobs
- Serialized moves could feel sluggish with only three Walkers
- Hidden batteries may just read as arbitrary punishment rather than tension

## Done means
Three phones move on command, the Reader's screen visibly strobes only around the mover and decays, a Walker hits zero battery and freezes without the TV ever naming them, and one playtest group reaches the exit. Success condition for the design: a Walker says "spend me, I'm fine" while lying, or the Reader says "I need someone to go look at the top-left and I don't know what's there."
