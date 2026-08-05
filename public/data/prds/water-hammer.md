## Overview
A 90-second real-time cooperative panic game for 4. One phone is the board — a pipe network the Engineer alone can see. The other three phones are each a single valve: one lever, three numbers, zero context. Fill the tank before the clock runs out without bursting a line.

## Problem
Most "one player has the map" games are turn-based grids, which makes the pieces into keyboards. This makes the pieces *analog*. Three hands on three levers moving continuously and simultaneously is something a passed-around phone physically cannot do — and it makes the Engineer's blindness real, because the only telemetry in the system lives on the phones they can't read.

## How it works
**Engineer's phone (the board):** the full network — source → four junctions → tank — pipe capacities, which segments are already weak, and live burst locations. No gauges. They know the shape; they know nothing about the state.

**Each valve player's phone (private):** a drag lever (0–100% open), a pressure gauge, a flow needle, and a strain bar. No topology. They don't know if they're upstream of the tank or feeding a dead leg, and they can't see anyone else's numbers.

**Host TV (public):** the tank filling toward a line, the countdown, system pressure, burst count (2 = loss), and a very loud clang.

So the room becomes: "Valve B, what's your pressure?" "Sixty-one and climbing." "That's not B, that's the bypass — B, open to forty, slowly." The Engineer builds a mental map of readings-to-topology in real time while the numbers keep moving.

The title mechanic: closing a valve faster than ~30% per second while flow is high sends a shock through the network and bursts a weak segment somewhere the closer cannot see. Bursts leak — the tank fills slower and the clock doesn't stop. The Engineer watches the burst appear on their private map and has to re-route around it.

Win: tank hits the line before 0:00 with fewer than 2 bursts.

## Technical approach
PartyKit Durable Object (or Socket.IO over Tailscale Serve), 10Hz authoritative tick. State: `{nodes[], edges:[{a,b,conductance,weak,burst}], valves:[{playerId,edgeId,openPct}], tankVolume, bursts, t}`. Valve clients stream lever position at ~20Hz, throttled, last-write-wins; the server never trusts a client-computed rate. Each tick: iterative relaxation over the 7-node conductance graph → flows → per-valve pressure/flow/strain. Emit **per-socket redacted telemetry**: Engineer gets topology + tank; each valve gets exactly its own three scalars.

Hard part one is legibility — a naive linear solve oscillates and the gauges become noise. Needs first-order damping tuned so a valve change is visible at another valve within ~600ms and settles.

Hard part two is latency fairness: a lag spike must not read as a slam-shut. Measure Δposition server-side across the server's own tick window, apply hysteresis plus a 200ms grace after any gap in that client's samples.

## v1 scope
- Exactly 4 players, fixed roles, one round
- One hand-authored 7-node network, 3 valves, 2 pre-seeded weak segments
- 90-second clock, 2 bursts = loss
- Win/lose screen that finally shows everyone the network and the burst points
- No score, no rounds, no rematch flow beyond a reload

## Out of scope
Generated networks, pumps, more than 3 valves, rotating the Engineer, scoring, tutorials, mobile haptics beyond a single burst buzz.

## Risks & unknowns
The hydraulic sim may be unfun-opaque rather than tense — fallback is a simplified flow model with hand-tuned coupling constants that only *looks* like hydraulics. Voice traffic may saturate: three people reading numbers aloud at once is the fun, but may need gauge values rounded to whole numbers to stay sayable.

## Done means
Four phones join; the Engineer's socket never receives a gauge value and no valve socket ever receives an edge list (verified by payload inspection); moving one lever visibly moves another player's gauge within a second; a fast close produces a clang and a burst on the Engineer's map; and a first-time group both wins and loses at least once across a few attempts.
