## Overview
Runway is a 3-player concurrent-room game about tiling a single shared resource in time without ever talking. The host screen is one airport runway; each phone is an airline with a private, awkward departure schedule. The room wins only if every plane completes its takeoffs inside a short window and no two planes are ever on the runway simultaneously.

## Problem
Most "take turns" games make the order obvious or assign it. The itch here is the opposite: you must silently interleave with people whose workloads you can't see, inferring how much runway everyone still needs from nothing but watching the tarmac. Coordination is the failure mode — the instant two of you commit to the same moment, you both crash.

## How it works
The host shows ONE runway strip with a live state: CLEAR (green) or OCCUPIED (red, with a plane sliding down it), plus a 25-second countdown bar. Nothing else — no queue, no names, no intentions.

Each phone PRIVATELY shows that player's schedule: a list of takeoffs of specific hold-durations, e.g. Airline A = two 2s flights, B = one 5s flight, C = three 1s flights. To occupy the runway you press-and-hold your GO button; while held, your plane occupies the strip for exactly that flight's duration, then you release and the next queued flight arms.

The rule: if the runway is occupied and a second player presses, both are on the tarmac at once — COLLISION. The host flashes a crash, that round fails. Players must therefore watch the shared strip, wait for CLEAR, and grab a gap long enough for their next flight — while others are doing the same, blind to each other's remaining workload. You learn "someone keeps needing tiny slots" or "someone's hogging 5 seconds" purely from occupancy, and adapt.

Because durations and counts differ and are hidden, you cannot just alternate: a naive rhythm collides the moment two players' next-flight lengths mismatch.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object over Tailscale Serve). Data model: `room{state: CLEAR|OCCUPIED, occupantId, occupiedUntil, deadline}`, `player{queue:[durations], idx}`. The server is the sole arbiter of the runway: a GO message is accepted only if state==CLEAR; it then sets OCCUPIED for the flight duration and broadcasts. The genuinely hard part is the collision window: two GO messages arriving within network jitter must both be judged against the same authoritative state. The server timestamps arrivals and treats any two GOs landing while state was CLEAR within a ~120ms coalescing window as a mutual collision (not first-wins) — otherwise low-latency phones always win and the game becomes a ping contest. Phones render optimistic "pressing" locally but only the server's OCCUPIED broadcast is truth.

## v1 scope
- Exactly 3 players, one fixed hard-coded schedule triple, one 25s round.
- Runway strip + countdown on host; GO button + private schedule on phone.
- Server-arbitrated occupancy with the 120ms mutual-collision window.
- Win = all flights completed, zero collisions; lose otherwise. Reveal all schedules after.

## Out of scope
- Matchmaking, >3 players, difficulty tiers, scoring/leaderboards, animations beyond a sliding plane, crosswind/weather modifiers, mobile install polish.

## Risks & unknowns
- Latency fairness: the coalescing window is the whole game; too tight and jitter causes phantom crashes, too loose and it's mushy.
- Is inferring hidden workload actually fun or just frustrating? Needs the reveal to feel earned.
- Schedule balance: some triples may be trivially or impossibly packable.

## Done means
Three phones on a LAN join a room, each sees a different private schedule, and a round provably ends in either a synchronized clean sweep or a crash caused by two GOs inside the window — reproducible on demand by having two players press together.
