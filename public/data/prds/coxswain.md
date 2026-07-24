## Overview
Coxswain is a 4-player cooperative steering game built on a literal metaphor: rowers face the stern and cannot see where the boat is going. Three players are oars — each phone a single stroke button for one side of the boat — and the fourth, the Coxswain, holds their phone as the *only* forward-facing chart of the river ahead. One shared boat, distributed blind controls, one seer.

## Problem
Most "one phone is the map" designs give the pieces free independent movement, which invites passing a phone around. Coxswain forbids it structurally: there is one vehicle and each phone actuates a *different* control surface at the *same time*. You physically cannot play it with one phone — port and starboard must pull together, in rhythm, right now.

## How it works
The boat has position, heading, and velocity. Each oar-phone shows only a big PULL button and haptic stroke feedback — no river. Pulling applies forward thrust plus a turn toward the opposite side (port pull turns the bow starboard), so steering is a negotiation between the two sides while the third rower adds power. Only the Coxswain's phone renders the river: the current lines, the rocks ahead, the finish. The host TV shows a *stern camera* — the water already passed and the boat itself — so rowers can watch the boat without seeing upcoming hazards (they're facing the past, exactly like real rowing).

The Coxswain calls it: "Starboard, two hard! Port hold!" The river's current pushes the hull continuously; rocks that are hit cost a hull-crack (3 = sink). Reach the finish line intact to win. A 90-second course, one bend, three rocks.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Durable Object) running a 20Hz physics tick. Data model: `boat{x,y,heading,vel}`, `river` as a spline with `rocks[]` and a `current` field, `oars[]{id,side,lastPullTs}`. Oar phones send a `pull` event on tap; server applies impulse per side, integrates current + drag, resolves rock collisions, broadcasts **role-scoped views**: full river+rocks+boat to the Coxswain, oar-UI+stroke-ack to each rower, stern-view+boat to TV. The hard part is deterministic low-latency physics (a pull must feel instant despite the round-trip) plus airtight channel separation — one upcoming rock leaking to a rower's phone or the TV collapses the asymmetry the whole game rests on.

## v1 scope
- 1 Coxswain + 3 oars (2 port/starboard + 1 shared power), one 90s course
- Tap-to-stroke, continuous current, 3 rocks, 3-hit sink
- Three role-scoped WS views + TV stern camera
- Win (finish) / lose (sink) banner

## Out of scope
- Multiple courses, difficulty tiers, rotating roles, scoring
- Stroke-timing rhythm bonuses, waves, weather, sound design
- More than three oars / dynamic crew sizes

## Risks & unknowns
- Steering feel: two-sided oar coupling may be too twitchy or too sluggish — needs tuning.
- Whether voice alone conveys enough for tight rock-dodging at speed.
- Rowers peeking at the Coxswain's phone; seating/back-to-screen framing matters.

## Done means
Four phones join; each oar sees only its stroke button; the Coxswain sees the river; strokes move a shared boat in real time; hitting three rocks sinks it and crossing the line wins — and no oar phone or the TV ever renders an upcoming rock.
