## Overview
Show of Hands is a compass-driven social-deduction game for 4-6 players seated in a circle around a host TV. Every player answers a prompt not by tapping a name but by physically aiming their phone across the room at a real person. One player was secretly given a slightly DIFFERENT prompt; when the TV reveals the arrow graph, the group hunts the answer that doesn't fit.

## Problem
Voting-by-name in party games is bloodless. Pointing at a real human across a room is charged and funny — but no phone game turns the compass into a literal act of accusation, and no game uses the seating circle itself as the input space.

## How it works
Players sit roughly evenly around the room; the TV knows the seating order and assigns each seat an angle. Calibration: each phone shows 'aim at the TV and hold' to zero its compass to a shared reference, so all headings share an origin. Each phone PRIVATELY displays a prompt — 'point at who'd survive longest in a zombie apocalypse.' Crucially, exactly one player's phone shows a DIFFERENT prompt ('point at who's the tallest'). On a countdown everyone raises their phone and aims at a person; at zero, each phone captures its compass heading (screen hidden the whole time). The server maps each heading to the nearest seat angle → a target person. The SHARED TV then draws the full directed arrow graph — who pointed at whom — with no names on prompts. Players debate which arrow reflects a mismatched question, then vote on the imposter. The imposter's phone privately knows its role and tries to blend.

## Technical approach
Host tab + phone PWAs + WebSocket server (PartyKit / Socket.IO over Tailscale Serve). Sensor: `deviceorientation` compass heading (`webkitCompassHeading` on iOS, `alpha` on Android). Data model: `game{ seats:[{playerId,angle}], prompts:{normal,odd}, imposterId, captures:{playerId:heading} }`. Sync strategy: server runs a synchronized 3-2-1 countdown; each phone captures a single heading sample at the tick and posts it; server resolves target = argmin angular-distance to a seat angle, then broadcasts the graph to the TV. The genuinely hard part is compass reliability — drift, magnetic interference, per-device offset. Mitigations: the 'aim at TV' zeroing gives a shared origin; seats are angularly far apart (a 5-person circle = 72° buckets), so coarse bucketing tolerates ±20° error; discard captures with high sensor variance and re-prompt that player.

## v1 scope
- 4 players, fixed circle, one prompt pair, one imposter
- Single simultaneous aim + capture, one reveal, one vote
- Manual seat order entry on the TV

## Out of scope
- Auto-detecting seat positions
- Multiple rounds / scoring across rounds
- Standing/moving players, non-circular arrangements

## Risks & unknowns
- Compass drift near laptops, speakers, steel furniture
- Players seated too close = ambiguous adjacent-seat aiming
- Whether the 'different prompt' tell is legible enough to deduce

## Done means
Four seated players each aim once; the TV correctly attributes each arrow to the intended target seat for all four, and in a playtest the group identifies the odd-prompt player better than chance across several rounds.
