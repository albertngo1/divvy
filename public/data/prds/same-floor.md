## Overview
Same Floor is a 3–4 player cooperative real-time game for a shared host screen plus per-phone controllers. Each player privately pilots one elevator in a shared high-rise; the room must silently divide the labor of serving passengers, because converging on the same call is the failure mode.

## Problem
Dividing work without talking is a real coordination skill, and most party games reward everyone rushing the same objective. This punishes it: two elevators sent to the same floor means a wasted trip and angry passengers. The itch is the tension of 'someone's got that one, right?' with no way to ask.

## How it works
The host TV shows a cutaway of an N-floor building with call buttons lighting up on random floors (each with a patience meter ticking down) — but it does NOT show which car is heading where. It shows only the building, the pending calls, and a shared LOBBY PATIENCE bar that drains whenever a call goes unanswered or a wasted trip occurs.

Each PHONE is one elevator's private control panel: it shows only YOUR car's current floor, YOUR direction, and YOUR onboard passengers and their destinations. You tap a floor to send your car there. Crucially, you cannot see where the other players are sending their cars.

When a car arrives at a floor with a waiting passenger, it picks them up (patience for that call resolves). But if two cars are dispatched to the same call and one arrives to find it already served, that's a COLLISION: a wasted trip, the arriving player's car is stuck one cycle, and lobby patience takes a hit. So players must silently carve the building into implicit zones — 'I'll take the top half' — read only from watching which calls resolve, and never double-serve. Win = deliver every passenger before lobby patience empties.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Building { floors, calls:[{floor,dest,patience}], lobbyPatience }`, `Car { playerId, floor, target, riders:[dest] }`. Phones send `dispatch(floor)`; the server simulates car movement at a fixed tick, resolves pickups, and detects wasted trips (a car reaching a call already served). It broadcasts to the host ONLY the aggregate view (calls, patience, car positions rendered without owner identity) and to each phone ONLY its own car's private state. The genuinely hard part is real-time movement sync with a single authoritative simulation so two phones can't both 'win' the same passenger — pickups are resolved server-side on arrival order by server clock, and the loser is explicitly told 'empty landing' so the punishment is legible.

## v1 scope
- 3 players, one 6-floor building, ~8 passengers over 90 seconds.
- Simple up/down car movement, one rider capacity irrelevant — just pick-up-and-drop.
- Host shows building + calls + one shared patience bar; phones show own car only.
- Win/lose screen.

## Out of scope
- Rider capacity limits, express floors, multiple buildings, difficulty tiers, accounts, leaderboards, elaborate art.

## Risks & unknowns
- Is 'watch which calls resolve' enough to divide zones, or do wasted trips feel random? Tune call spawn rate and building height.
- Balancing collision penalty vs. the base difficulty of just serving everyone.
- Real-time car-position rendering on the host must stay readable without revealing ownership.

## Done means
Three phones join via QR and each sees only its own elevator; calls light on the TV; dispatching a car to a served call visibly produces an 'empty landing' wasted trip that docks shared patience; a run where players divide floors cleanly clears all passengers into a win, and a run of double-serving drains patience into a loss — all from one server-authoritative simulation, reproducible twice.
