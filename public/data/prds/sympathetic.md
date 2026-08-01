## Overview
A silent 4-player room game where phones talk to each other through wood, not air. Each phone is placed on a real surface — dining table, coffee table, couch cushion, bookshelf, floor — and transmits a private vibration code into that surface while listening for others with its accelerometer. Two phones sharing a surface couple strongly; a phone on a cushion is deaf. For groups who like physical, wordless, slightly absurd hunts.

## Problem
Every "find your secret partner" party game routes through speech or the network. The room's actual physical properties never matter. Meanwhile phones have a vibration motor and a 60Hz accelerometer that can genuinely hear each other through a shared table — an entire private channel nobody plays with. This makes the furniture the network topology.

## How it works
Four players, one 90-second round. The server deals each phone a 3-pulse code; exactly two phones share each code (two hidden pairs).

The server runs a TDMA clock: a 2s frame split into four 500ms slots, one per phone, shown on the host TV as a spinning ring of four colors. In your slot, your phone buzzes/plays your code into whatever it's resting on. In the other three slots it listens.

PRIVATE on each phone: your own 3-pulse code as three dots; a live "felt" bar; and three anonymous confidence meters labeled only by slot color — "something is coming through in RED" — never who, never their code. You physically carry your phone around the room, planting it on surfaces, watching which slot's meter lifts.

SHARED on the TV: the slot clock, the current speaker color, a countdown, and nothing else. At the end, both partners must independently press LOCK ON <color>; a pair scores only if both are right.

No talking during the hunt — codes would be spoken aloud instantly. The comedy is four adults crawling around pressing phones to shelves.

## Technical approach
Host browser tab + phone PWAs + PartyKit Durable Object as authority. Model: `{room, players[{id, color, code, surfaceGuesses}], frameStart, slotAssignments, locks}`. Slot timing needs only ±30ms, so a simple NTP-style WS ping/pong offset estimate suffices — far easier than TDOA work.

Transmit: `navigator.vibrate` where supported, else a face-down 70Hz speaker tone (iOS Safari has no Vibration API — this is the fallback, not a nicety). Receive: DeviceMotion at 60Hz, high-passed >15Hz, envelope-correlated against the expected on/off pattern, thresholded against a 3s noise-floor calibration.

The genuinely hard part: rejecting airborne leakage. A loud buzz is audible across the room and can fake a hit. Mitigation — each phone simultaneously samples its mic; a detection counts only when accel energy exceeds mic energy by a learned ratio. Contact coupling wins that ratio; air doesn't.

## v1 scope
- 4 phones, 2 pairs, one 90s round
- Fixed 4-slot TDMA frame, 3-pulse codes
- Accel envelope detector + mic veto
- Host TV: slot ring, timer, final conduction graph
- Android transmit path first; iOS tone fallback second

## Out of scope
- Scoring across rounds, more than 4 phones, surface classification, spectator view, sound design.

## Risks & unknowns
- iOS vibration absent; tone fallback may couple too weakly.
- Backgrounded PWAs throttle DeviceMotion — screen must stay on.
- Some rooms have only one hard surface, collapsing the puzzle; host prompt requires ≥3 distinct surfaces.

## Done means
Four phones on three surfaces: both pairs correctly lock on within 90s in 3 of 5 trials, and a phone on a couch cushion registers zero detections while a phone 60cm away on the same wooden table registers >90%.
