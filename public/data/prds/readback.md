## Overview
Readback is a 3-4 player cooperative air-traffic game. One phone is the Controller; the rest are Pilots. The host screen is a shared radar scope. The catch is a two-way information split: the Controller can see where planes are but not who they are, and each Pilot knows who they are but not where. Only voice bridges the gap.

## Problem
The Spaceteam itch is asymmetric panic, but many riffs give everyone the same panel. Real ATC has a cleaner asymmetry: the person with the picture and the person with the controls are different people who must talk. This game makes that gap literal and unpassable with a single shared phone.

## How it works
Several blips drift across the radar toward a runway. Two aircraft on converging paths will collide unless one is turned in time.

PRIVATELY, the Controller's phone shows nothing but a "transmit" button and a scratchpad; they read the picture off the host radar. Each Pilot's phone PRIVATELY shows only their own aircraft: callsign (e.g. "Delta-Two"), current heading, and fuel — never their position. PUBLICLY, the host radar shows every blip's position and heading but labels them only with anonymous tags. So the Controller must call "the plane at the bottom turning north — Delta-Two, turn left heading 090," a Pilot must recognize their own callsign by ear, tap to execute the turn, and read it back aloud. Wrong-plane turns, unturned collisions, and fuel-outs all fail the round. The fun is the crosstalk when three planes converge and the Controller can't name any of them.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Aircraft{ id, callsign, x, y, heading, fuel }`, `Room{ controllerId, pilots[], aircraft[], phase }`. Server owns the physics tick (~10Hz): advances positions along headings, decrements fuel, runs pairwise collision proximity, and broadcasts position/heading to the host while sending each Pilot only their own aircraft's private fields. Pilot heading changes are commands validated server-side. The genuinely hard part isn't raw sync — the tick is slow — it's the fairness of the collision/turn-latency window: a turn tapped just before impact must resolve deterministically, so collisions are evaluated on server-authoritative post-command state with a small look-ahead, never on stale client positions. No mic processing needed; voice is human-to-human, which sidesteps speech-recognition risk.

## v1 scope
- 1 Controller + 2 Pilots, 2 aircraft, one round.
- One convergence event that requires exactly one turn to avoid.
- Fuel timer as a soft deadline; radar + anonymous tags on host.
- Pilot phone shows callsign/heading/fuel; Controller shows transmit + scratchpad.

## Out of scope
- Speech recognition / automated readback verification (players self-police).
- More aircraft, stacking/altitude, weather, multiple runways.
- Scoring, difficulty tiers, reconnect.

## Risks & unknowns
- Without the mic verifying readbacks, sloppy groups may skip the readback discipline that makes it tense.
- Anonymous-but-distinguishable radar tags are a fine line: too descriptive and the Controller doesn't need voice.
- Two-aircraft v1 may be too easy to prove the panic; may need three to feel real.

## Done means
Three phones join in Controller/Pilot roles, two planes converge on the host radar, and the round is won only when the Controller verbally identifies the threat, the correct Pilot recognizes their callsign and turns, and the collision is avoided — and lost if the wrong Pilot turns or nobody does.
