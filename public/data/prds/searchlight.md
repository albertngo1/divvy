## Overview
Searchlight steals the stealth genre (line-of-sight cones, patrol sweeps, getting spotted) and squeezes it into a Jackbox-shaped party game. One player is the Thief; everyone else is a Guard. It's for 3–5 people in a room who want a tense hide-and-seek that lives entirely on their phones plus a shared TV.

## Problem
Stealth games are single-player fantasies — you against dumb AI cones. The genuinely thrilling part (multiple guards with overlapping sightlines, one intruder threading between them) has never been a couch party experience because you can't share vision cones on one screen without spoiling the hidden position.

## How it works
The vault is a 6x6 node grid. The host TV shows the grid, the vault objective (a jewel node), an alarm meter, and every Guard's cone origin — but NEVER the Thief.

PRIVATE on the Thief's phone: their exact node, the jewel, and a faint memory of where cones last swept. Each tick (every 2.5s) they tap an adjacent node to move, silently.

PRIVATE on each Guard's phone: a first-person arc for their assigned sector. They drag to rotate their gaze cone (say 60°, 2-node range). Their phone buzzes and flashes a blip ONLY when the Thief is inside their current cone this tick. Guards can't see each other's cones or the Thief's position on their own screen — only on the shared TV do cone origins appear.

Guards must verbally coordinate — "he's near my left edge, cover the east door!" — to corner the Thief. Three confirmed spots (any guard taps ALARM while the Thief is in-cone) wins for the guards. The Thief wins by tapping the jewel node and surviving one tick.

Per-phone is load-bearing: private per-guard cones + private thief position mean a single passed-around phone collapses the hidden information instantly. Simultaneous sweeping by multiple guards is the whole tension.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `{room, tick, thiefNode, guards:[{id,originNode,coneAngle,coneDir,sector}], alarm}`. Server is the single source of truth; it ticks on a fixed 2.5s clock, resolves cone-intersection tests (is thiefNode within angle+range of each guard's current coneDir), and pushes each client ONLY its filtered view. The hard part is the real-time cone math staying authoritative while guard rotation input streams continuously — server samples each guard's latest coneDir at tick boundaries so a guard can't 'scrub' between ticks to brute-force scan; rotation is rate-limited server-side.

## v1 scope
- 3 players: 1 Thief, 2 Guards, fixed 2-sector split.
- One 6x6 board, one jewel, one round.
- Discrete 2.5s ticks; drag-to-rotate cones.
- Win/lose screen on TV.

## Out of scope
- Deployable distractions, guard movement, multiple thieves.
- Reconnect handling, matchmaking, cosmetics.
- Sound-based detection.

## Risks & unknowns
- Cone-rotation feel on phone may be fiddly; needs a big drag target.
- Two guards may fully cover 6x6 too easily — tune range/angle.
- Verbal-coordination fun depends on room energy, not tech.

## Done means
Three phones join a room code; the Thief moves invisibly, each Guard independently rotates a private cone that blips only on true intersection, three spots ends the round with a guard win and a jewel-grab ends it with a thief win — all resolved server-authoritatively across one tick clock.
