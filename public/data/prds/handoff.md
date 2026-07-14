## Overview
Handoff is a 3–4 player cooperative real-time party game in the Spaceteam / Devils & the Details lineage. The host TV is a shared radar scope; each player's phone is a private controller strip for one airspace sector. Planes drift across the scope continuously, and the only way to keep one alive as it crosses a sector boundary is a spoken, protocol-correct verbal handoff. For groups who like Spaceteam but want the *readback* — real radio discipline under overload.

## Problem
Most voice party games use voice as flavor. Real air-traffic coordination is voice-*load-bearing*: the controller giving up a plane has data the receiving controller literally cannot see, and a wrong readback kills the aircraft. That asymmetry has never been the core of a Jackbox-shaped game.

## How it works
**Host screen (shared):** a radar scope with anonymous blips crossing 3 wedge-shaped sectors, a countdown, and a lives counter. Blips show position and a callsign tag only — no altitude, no heading.

**Each phone (private):** your sector's flight strip. For every plane currently in *your* wedge you see callsign, altitude, heading, and a required pre-handoff action (e.g. "descend to 4,000 before boundary"). Crucially, a plane approaching your sector from a neighbor shows you its callsign but its altitude/heading are BLANK until you accept it.

**The loop:** when your plane nears the boundary you (a) tap to complete its required action, then (b) press GO LIVE and voice the handoff: callsign + altitude + heading. The receiving player taps ACCEPT and reads back the numbers they heard; their phone checks the readback against the true value. Correct → the plane is theirs, data populates. Wrong readback, or accepting before you've spoken, or nobody accepting before the plane crosses the line → a "deal," lose a life. Overload comes free: you're handing off and receiving simultaneously as planes stack up.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). **Data model:** `Room{planes[], sectors{}, lives}`; `Plane{id, callsign, alt, hdg, x, y, vx, sectorId, requiredAction, actionDone}`. Server ticks plane positions ~15 Hz and broadcasts blip coordinates to the host and *redacted* strips to phones (each phone gets full data only for planes it owns). **Sync strategy:** boundary-crossing is server-arbitrated — the accept/readback handshake is a state transition, not a timing race, so latency mostly affects feel, not fairness. **Genuinely hard part:** readback validation. Speech-to-text on numbers is unreliable, so v1 skips STT: the receiver taps the altitude/heading they heard on a private number pad, and the server compares taps to truth. The design tension is keeping that fast enough to feel like radio, not data entry.

## v1 scope
- 3 players, 3 fixed sectors arranged as a triangle
- One 90-second wave, ~5 planes total, one required-action type (altitude change)
- Handoff = voice callsign+altitude, receiver taps it back on a number pad
- 3 lives, win = survive the wave

## Out of scope
- Speech-to-text readback; heading actions; conflicting-traffic (collision) rules; 4+ sectors; difficulty ramp; reconnection.

## Risks & unknowns
- Number-pad readback may feel clerical rather than radio-fast; may need a 3-choice "which did you hear" instead.
- Redaction must be airtight — one leaked altitude and voice becomes optional.
- Boundary timing windows need playtest tuning so late accepts feel tense, not unfair.

## Done means
On three phones + one host, a plane spawned in sector A can be verbally handed to sector B: B's strip stays blank until B taps ACCEPT and correctly enters the spoken altitude, at which point data populates and the plane continues; a wrong entry or an un-accepted boundary crossing decrements the shared lives counter on the host.
