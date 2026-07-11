## Overview
An asymmetric survival-horror party game for 4 players — three Survivors, one Killer — stealing Dead by Daylight's skill-check-and-hunt loop. The shared TV is the map; each phone is a private station. For groups who want console-horror dread without four controllers or a 20-minute match.

## Problem
1v4 asymmetric horror is thrilling but heavy: a TV, four gamepads, long matches, a learning curve. The party itch is the pounding "am I about to get caught" of a skill-check — and that panic is only real if only YOU can see your own needle. A single passed phone destroys the whole point.

## How it works
The host TV shows a simple top-down map: three generator icons, three survivor dots, a killer dot, and a pulsing terror-radius ring around the killer. Each Survivor's phone PRIVATELY shows a repair dial — a needle sweeps a circle; tap when it crosses the highlighted zone to add progress, and the zone shrinks as the gen nears completion (risk ramps). A MISS pings: the TV briefly flashes that survivor's dot and plays a stinger, revealing them to the Killer. The Killer's phone PRIVATELY shows a hunting view — coarse heat of which survivors are mid-skill-check (not exact coordinates) and a lunge button that, when the killer dot is adjacent to a survivor dot, downs them. Survivors move by dragging their own dot on their own phone (private intent); the killer chases on the TV. Win: all three gens done, or the killer downs all three. Load-bearing: three survivors running independent, simultaneous, private skill-checks IS the engine — pass one phone and the parallel panic collapses.

## Technical approach
Host + phone PWAs + authoritative WS (PartyKit / Durable Object). Model: `survivors:{id,x,y,genProgress,state}`, `killer:{x,y,cooldown}`, `gens:{id,progress}`, `skillChecks:{survivorId,phase,zoneWidth}`. The server owns skill-check timing so a client can't fake a hit: the phone sends `tapAt(t)`, the server validates against the authoritative needle phase within a latency grace window. Movement is drag-to-target; the server integrates positions at 10Hz and broadcasts. The killer receives a coarsened survivor-heat channel, never raw coordinates — the fog is server-enforced. Hard part: fair skill-check validation under 60-120ms phone latency (needs per-phone offset calibration, like a rhythm game) and tuning the miss→reveal→chase loop so it's tense, not unfair.

## v1 scope
- 4 players fixed: 3 survivors, 1 killer.
- One round, three gens, one shared map.
- Skill-check = single shrinking zone, tap timing only.
- Killer has one ability (lunge/down); one down = out.
- Emoji/text stingers, no art.

## Out of scope
- Multiple killers, perks, hooks/rescues, hiding lockers, sound design, 5+ players, tilt.

## Risks & unknowns
- Balance: is 1 killer vs 3 tappers tense or a stomp?
- Skill-check feel across varied phone latency.
- Coarse killer-heat: enough to hunt, not so much it's a laser?

## Done means
Three phones each run an independent, server-validated skill-check simultaneously; a missed check flashes only that survivor on the TV; the killer, using only coarse heat, downs a survivor by being adjacent — all in one sub-5-minute round.
