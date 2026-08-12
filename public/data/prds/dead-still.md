## Overview

A three-minute race for 4 players in a room with at least two surfaces. Each phone holds one private line of evidence toward a puzzle on the TV. The catch: a phone only develops its line while it is lying face-up and perfectly still — which is also the only state in which everyone else can read it. Progress and secrecy are physically the same dial, turned opposite ways.

## Problem

Phone party games treat the private screen as free and permanent. It isn't: a phone is a physical object in a room with other people's eyes in it. And the accelerometer's most reliable, least-used reading isn't shake — it's the noise floor. A phone in a human hand has ~0.01 g of tremor; a phone on a table is dead flat. That distinction is trivially measurable and nobody has made it cost anything.

## How it works

The TV shows four suspects and a crime. Four private evidence lines exist; any three of them eliminate three suspects. Everyone starts holding exactly one.

Each phone reads its accelerometer at 50 Hz and derives two things: the gravity vector (face-up vs. face-down) and rolling variance over a 1.5 s window (resting vs. held). That yields three mutually exclusive states, and this is the whole game:

- **Face-up, motionless on a surface** → your line develops (0→100% in ~25 s) and is drawn in large type at whatever fraction is complete. Readable from four feet by anyone who leans.
- **In your hand** → readable by you alone, but development is frozen.
- **Face-down** → safe and frozen. Nothing happens.

You cannot make progress without being exposed. To win you need three lines: yours, plus two read off other people's tables.

Touching a phone that isn't yours is forbidden and self-enforcing — the pickup jolt is unmistakable in the variance signal, so the phone buzzes, blanks for 5 s, loses 20% development, and the TV flashes an anonymous TAMPER. So reading is done by leaning, hovering, and blocking sightlines with your body. Standing over someone's coffee table is loud, social, and completely legal.

**Private per phone:** your own line, your development meter, your answer pad. **Public on the TV:** the suspects, the clock, and a single number — how many phones are currently developing. Never whose.

First correct submission takes 5 points, second takes 2, everyone else zero. A wrong submission locks you out for the rest of the round, so the room's biggest danger is a confident reader who misheard one word across the room.

## Technical approach

Host tab + phone PWAs + authoritative Durable Object (or Socket.IO over Tailscale Serve).

`Room { code, puzzle, phase, deadline, players[{id, devPct, state: 'developing'|'held'|'facedown'|'tampered', locked}] }`. Phones classify state locally from `devicemotion` (iOS needs `requestPermission()` on tap) and send state transitions plus a 4 Hz heartbeat with `devPct`; the server owns the clock and integrates development server-side from state transitions, so a phone that lies about its state still can't award itself fill it didn't earn.

The genuinely hard part is the stillness classifier, not the sync. A phone on a couch cushion next to a bouncing leg reads as held; a phone gripped very steadily on a knee reads as resting. Fix with a 4-second lobby calibration that records each phone's own resting noise floor on the surface it will actually use, then threshold at 6× that floor with a 1.5 s debounce in both directions. Face-up/face-down comes free from `gravity.z` sign and is unambiguous.

## v1 scope

- 4 players, one 3-minute round, one hard-coded puzzle with four evidence lines.
- Three states, one development meter, one submit pad.
- Anonymous "N developing" counter on the TV.
- Lobby calibration screen. Nothing else.

## Out of scope

- Multiple rounds, generated puzzles, teams.
- Any camera, mic, or proximity use.
- Stealing, trading, or in-app messaging — all negotiation is out loud.

## Risks & unknowns

- Type size vs. room size: if lines aren't readable from four feet, the theft half of the game evaporates. Needs a font-size dial in playtest.
- Rooms with only one table collapse the geometry; may need a minimum-two-surfaces rule in setup.
- Everyone might just cooperate and pool all four phones. The first-submit prize should be enough to break it, but that's the top playtest question.

## Done means

One 3-minute round, four phones, a real living room: at least two players read a line off someone else's table, at least one player is caught mid-lean and loudly accused, and the winner submits before the clock ends. Zero false TAMPER flags across the round on all four phones.
