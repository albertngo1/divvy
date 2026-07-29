## Overview
Upstage is a 3-player, lights-off movement game where the host TV is the only light source in the room and each phone's front camera is a private light meter. Every player is secretly assigned one color; you score by physically standing where your camera drinks in your color, brightly and unobstructed. Bodies block light, so walking in front of a rival is a legal and devastating move. For groups with a big TV, a dark living room, and a tolerance for shoving.

## Problem
"Room as board" games usually treat the room as an empty coordinate grid — you walk to a spot, the spot is neutral. Here the room is an optical system, and the other players are opaque objects in it. The board changes because someone stepped. Nobody has to be told to be adversarial; the physics does it.

## How it works
Lights off. The TV goes full-screen and paints three vertical bands: RED (left third), GREEN (middle), BLUE (right third), each additionally pulsing at a distinct slow rate (2Hz / 3Hz / 5Hz) for disambiguation.

PRIVATE, per phone: your secret color, one big signal meter (0–100) for THAT color only, and a LOCKED indicator when you hold above threshold. You never see anyone else's color, meter, or lock state. Hold the phone flat, front camera toward the TV, and walk until your meter climbs.

SHARED, on the TV: the color bands themselves — that IS the board — plus three unlabeled, shuffled lock lamps along the bottom edge and a 60-second timer. So the room knows how many people are currently scoring, never who.

Each phone banks locked-seconds; highest total at 60s wins. Talking is allowed and lying about your color is the entire meta, because the moment someone knows your band they can plant themselves in your light path. The sweet spots for red and blue are cones near the TV that force players into each other's shadows.

## Technical approach
Host tab + phone PWAs + one Durable Object per room over WSS via Tailscale Serve.

Each phone runs `getUserMedia` on the front camera at 320×240, draws to an offscreen canvas every 100ms, and computes mean R/G/B over the central 50% crop. Signal = (my channel ÷ (R+G+B)) × a luminance term, so auto-exposure gain — which scales all channels together — largely cancels. A Goertzel filter over a 3s luminance history detects the 2/3/5Hz pulse as a tiebreak when two bands bleed together.

Data model: `Room { phase, colors{playerId}, signal{playerId}, lockedSince{playerId}, banked{playerId:ms} }`. Phones push a signal report at 5Hz; the SERVER decides lock state and banks time against its own clock, so a client can't fake seconds. The TV subscribes only to the anonymized lamp array.

The hard part isn't sync — traffic is tiny and 200ms latency is invisible at walking speed. It's photometric calibration: a Pixel and an iPhone report wildly different white balance for the same wall. v1 opens with a 10-second calibration where all players stand on a marked spot facing a full-white TV; the server stores per-device channel gains and normalizes every later reading against them.

## v1 scope
- 3 players, 3 colors, ONE 60-second round
- Three static vertical bands, no motion, no zone shuffling
- White-screen gain calibration, then go
- TV shows bands + 3 anonymous lamps + timer; winner line at the end

## Out of scope
More than three zones, moving or shrinking zones, multi-round scoring, phone-flashlight countermeasures, seated-play accessibility mode, spectators, reconnection.

## Risks & unknowns
The room must be genuinely dark; a dim panel at 4m may not drive usable separation. Aggressive auto-white-balance on some Androids can chase the dominant band and flatten the ratio — fall back to `applyConstraints({whiteBalanceMode:'manual'})` where supported, otherwise lean harder on the flicker frequency. iOS requires HTTPS plus a gesture for camera access and shows a persistent recording indicator. A dark room full of moving people is a genuine trip hazard; the pre-round screen says clear the floor.

## Done means
In a dark living room with a 55" TV, three calibrated phones report clearly separable per-color signals from 2–4m; a player stepping into another's light path drops that player's signal by ≥40% within 500ms; and one full 60-second round completes with server-banked times and a winner shown on the TV.
