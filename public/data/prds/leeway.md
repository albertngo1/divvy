## Overview
Leeway is a 3-player cooperative panic game. One player is the **Pilot**, whose phone is the entire board — a top-down shipping channel studded with mines. The other two are **boats** whose phones are steering wheels showing nothing at all. The Pilot must talk two drifting, blind boats across the channel, working from radar that is always a beat out of date.

## Problem
Most 'one person guides the blind' games (Keep Talking, Spaceteam) give the guide perfect, instant information — the tension is only vocabulary and time pressure. The itch here: what if the guide's own map is *stale*? Guidance stops being 'read the answer aloud' and becomes prediction — you must call where the boat will be, not where it is.

## How it works
Each boat drifts forward continuously with a slow sideways current. The boat player drags a rudder wheel (touch) to steer; their phone shows ONLY the wheel plus a haptic buzz that intensifies near a mine. No map, no position, no dot.

The Pilot's phone shows the channel, the mines, the far gate — and a **radar sweep line rotating once every ~4 seconds**. Each boat's blip only refreshes to its true position when the sweep passes over it, then slowly fades. So the Pilot is always steering boats by 0–4-second-old ghosts, and must lead them: 'Hard left NOW, you'll drift back center in three.'

The host TV (shared, ambient) shows the channel outline with **mines hidden**, only the glowing gate, blank boat wakes, big BOOM flashes on hits, and a 75-second timer — pure spectator drama.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object) at ~20 Hz. Data model: `channel` (static mine field + gate), and per-boat `{x, y, heading, drift, rudder}` integrated server-side. Boat clients send rudder deltas; server simulates motion authoritatively (clients never trust local physics). The Pilot client receives full boat state but **renders each blip against a locally-tracked sweep angle**, only committing a blip's rendered position when `sweepAngle` crosses that blip's bearing — the staleness is a rendering rule, not a data delay, so it stays deterministic and cheat-proof. Host client is a read-only subscriber. Hard part: tuning drift + sweep period so the Pilot feels *behind but not helpless* — too fast a sweep kills the fun, too slow is impossible; needs a couple of playtests to land.

## v1 scope
- 1 Pilot + 2 boats, one 75s crossing.
- One static mine layout, one gate.
- Rudder + haptic on boats; sweep radar on Pilot; timer + BOOM on host.
- Boom = respawn at last checkpoint line; count booms. Reach gate = win.

## Out of scope
- Multiple levels, moving mines, currents that shift.
- Boat-vs-boat collisions.
- Reconnect mid-round, matchmaking, accounts.

## Risks & unknowns
- Sweep staleness may frustrate rather than delight — needs the drift tuning above.
- Voice is essential; assumes players share a room. No in-app comms in v1.
- Two simultaneous boats on a Pilot's small phone screen may crowd; may cap at 2.

## Done means
Three people in a room, one crossing: the Pilot never sees live boat positions (only sweep-refreshed blips), each boat steers its own private wheel with no map, and the room can complete a crossing through voice-guided prediction. If a boat player can solo it without the Pilot, it fails.
