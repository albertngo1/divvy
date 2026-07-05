## Overview
Ballast is a concurrent-room party game: a shared TV shows a ship (a bubble in a spirit level) that must stay level, while every player's phone is a physical trim weight. Four to six players each hold a phone flat and tilt in real space to keep the vessel balanced — except one secret Ballast whose phone is dead weight pulling the wrong way. For crews who like cooperative panic with a whodunit baked in.

## Problem
Accelerometer party games are almost always solo (racing, "don't drop the phone"). Nobody pools tilt into one shared physical instrument. And traitor games are usually verbal; here the tell lives in your hands and posture — the itch is reading a wobble across a physical room, not reading a face.

## How it works
The host shows a horizon with a listing ship; its list angle is the running AVERAGE of everyone's phone pitch. Keep the average flat and a "hull integrity" bar fills; let it list too far and it drains.

PRIVATE on each phone: your own small bubble to keep centered, plus your secret role. Most players read "TRIM — keep level." One reads "BALLAST — the ship must SINK; add tilt without getting caught." The Ballast has to sneak bias in — lean when others lean, over-correct on the recovery — because the host publishes nobody's individual tilt, only the collective list.

SHARED on the host: the ship, the integrity bar, and a 60s timer. Everyone physically tilts, watches the horizon fight back, and eyeballs each other's hands. At time-up, if the crew kept the hull alive they win — unless they then fail to finger the Ballast in one quick vote; if the ship sank, the Ballast wins.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Durable Object). Each phone reads DeviceOrientation beta/gamma, low-pass filters, and streams a signed scalar "trim" (degrees) at ~20Hz. Server keeps room {roles, trims:{playerId→deg}, integrity}. The list = mean(trims) each tick; the server integrates integrity and broadcasts ONLY the aggregate — never per-player trim, or the Ballast is trivially exposed. Sync strategy: server is authoritative on integrity at 20Hz, host renders the smoothed value. Genuinely hard part: tuning the average so honest wobble reads as noise but sustained sabotage reads as a deliberate "pull" — hiding one saboteur inside 4–6 noisy signals without the aggregate feeling random.

## v1 scope
- 4 players, one hidden Ballast, one 60s round
- Flat-hold calibration to zero each phone at start
- Aggregate list + integrity bar on the host
- One post-round vote, win/lose screen

## Out of scope
- Multiple rounds; roles beyond Trim/Ballast
- Per-player tilt reveals or replay
- Score tuning across player counts
- Anti-cheat (setting the phone down flat)

## Risks & unknowns
Can a single saboteur meaningfully move a 4-way average without being obvious — or is it either invisible or blatant? Sensor drift on flat-hold; whether people can hold a level phone for 60s; iOS motion-permission gesture.

## Done means
Four phones can hold a shared bubble level on the TV, one secret Ballast can measurably drag the integrity bar down over 60s, and the crew can win-or-lose then vote — with at least one playtest where the wobble genuinely made someone suspect the right person.
