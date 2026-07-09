## Overview
A cooperative real-time coordination game for 3-4 players. One player holds the host device as the **Tower** — an omniscient radar map. Every other player is a **Pilot** whose phone is a cockpit that shows almost nothing: just one arrow, some fuel, and a shudder. It is for groups who like the panic of Overcooked without the shared screen.

## Problem
'One phone is the board' games usually let the pieces peek — a glance at the map ruins the asymmetry. The itch here is *total* blindness: pilots must obey a controller they can't verify, and the controller must fan attention across several drifting planes at once. Voice alone can't carry three continuous heading corrections a second, so the private channel has to do the steering.

## How it works
The **host screen** shows a top-down radar: 2-3 plane blips creeping forward along their headings, a runway, and fuel rings. Planes auto-fly at constant speed; they only turn.

The **Tower** drags on a blip and flicks a direction — that sets a *target heading* pushed privately to that one plane. Nobody else's plane reacts.

Each **Pilot's phone** privately shows ONLY: a big steering dial, the tower's commanded arrow (relative to their current heading), a fuel bar, and a haptic 'proximity shudder' that buzzes harder when another plane is near — but never *which* plane or *where*. The pilot drags to swing their heading to match the arrow. They cannot see the map, the runway, or each other.

Talking is allowed and useless for precision: the tower can shout 'plane two, hard left!' but the actual turn only travels through plane two's private arrow. Land every plane on the runway, aligned, before anyone runs out of fuel — without two blips occupying the same cell.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object) holds the room: `{ planes: [{id, x, y, heading, targetHeading, fuel}], runway, controllerId }`. Fixed 20Hz tick advances each plane along `heading`, eases `heading` toward `targetHeading`, decrements fuel, runs grid collision + landing checks. Tower sends `setTarget(planeId, heading)`; server pushes each pilot a *minimal private slice* — their arrow delta, fuel, and a scalar proximity value (nearest-neighbor Chebyshev distance) — never coordinates. Host gets full state. The genuinely hard part is sub-150ms round-trip so the shudder and arrow feel live, plus reconciling pilot dial input against server-authoritative heading without rubber-banding.

## v1 scope
- 1 Tower + 2 Pilots, one round, ~90s.
- One straight runway, single approach heading.
- Fuel + collision as the only fail states.
- Steering dial + arrow + shudder; no altitude, no weather.

## Out of scope
- Altitude/stacking, holding patterns, multiple runways.
- Scoring, campaigns, difficulty tiers.
- Reconnect mid-flight.

## Risks & unknowns
- Is a purely-private arrow legible enough, or do pilots need a faint position hint?
- Latency shudder could feel mushy over consumer wifi.
- Two planes might be un-savable if the tower over-commits — needs a fuel/geometry tuning pass.

## Done means
Three phones join, the tower privately steers two blind planes to a shared runway, a genuine near-collision triggers shudders on exactly the two involved phones, and both land (or one crashes) inside 90 seconds with no pilot ever seeing the map.
