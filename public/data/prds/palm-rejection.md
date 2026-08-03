## Overview
A 90-second panic co-op for 4–5 people. One player is the **Cartographer**: their phone shows the entire maze, and nothing else in the room does. Everyone else is a **Runner** — a dot on that maze, walking forward forever, blind. The Cartographer's only addressed channel to a Runner is a fingertip pressed on that Runner's dot, and a fingertip on a 6-inch screen blots out a chunk of the map. Vision and control compete for the same glass.

## Problem
"One player has the map" games (Keep Talking, Spaceteam) make the map-holder an oracle with infinite bandwidth: they see everything, always, and just talk. The tension is in the listener. Nobody has made the *seeing* itself scarce. Real touchscreens have this problem built in and every designer treats it as a bug.

## How it works
Each Runner's avatar auto-walks at constant speed. The Runner's phone shows **only** a heading dial and a left/right steering slider — no map, no walls, no other Runners. They can steer, but they don't know toward what.

The Cartographer's phone shows the full top-down maze: walls, pits, the exit, and four labelled dots moving in real time. Pressing and holding a dot opens a **private channel** to that Runner: the Runner's phone lights up with a large arrow, and the Cartographer aims it by dragging. Release and the channel closes; the Runner keeps their last heading by memory. Two fingers = two channels = two blind patches. The dot under your finger is the one you can't watch.

Voice is allowed and is a *broadcast bus with no addressing* — "LEFT!" turns everyone who believes it. The finger is the only unicast.

The host TV deliberately does **not** show the maze. It shows a control-room panel: four heading dials, a timer, a strobe when a Runner is one tile from a pit, and a survivor count. On the buzzer it reveals the maze with all four traces drawn — the postmortem is the payoff.

## Technical approach
Authoritative sim on a PartyKit Durable Object at 20 Hz: `{runners: [{id, x, y, heading, alive}], maze: bitgrid, channels: {cartographerFingerId -> runnerId}}`. Runners send `steer(delta)`; the Cartographer sends `grab(runnerId)` / `aim(runnerId, theta)` / `release`. Server ticks position, resolves wall/pit collisions, and pushes each client only its own slice — Runners receive heading + arrow, never geometry, so a devtools-open Runner still can't cheat.

The hard part is not throughput, it's **perceived lag on the steering loop**: the Cartographer drags, the Runner turns, the Cartographer sees the correction. Two network hops of round trip at 30 fps feels like driving a boat. Runners render their own heading locally with client-side prediction and reconcile against the server's authoritative angle; the Cartographer's dots are rendered one tick behind with interpolation. Target sub-120 ms grab-to-arrow on LAN.

## v1 scope
- 1 Cartographer + 3 Runners, one 90-second maze, hand-authored 16×12 grid.
- Walls and pits only. No enemies, no items, no scoring beyond "how many got out."
- Single-finger channels only (multi-touch allowed but untuned).
- TV: dials, timer, death strobe, end-of-round trace reveal.

## Out of scope
Maze generation, multiple rounds, role rotation, spectators, reconnect flow, mobile-web audio.

## Risks & unknowns
Runners may feel like passengers if the arrow does all the work — the steering slider must be twitchy enough that following an arrow is a skill. Small phones may make the occlusion punishing rather than funny; tune tile size to thumb size. Voice may simply dominate and make the finger vestigial: mitigate by giving Runners no names on the Cartographer's screen, only colors they can't see.

## Done means
Four phones and a TV on one LAN; a Cartographer gets at least one Runner to the exit; and in playtest video the Cartographer visibly lifts a finger to check the map and immediately loses a Runner to a pit.
