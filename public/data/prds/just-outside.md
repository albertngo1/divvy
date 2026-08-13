## Overview
A four-player, eight-beat game that steals *footsies* — the spacing layer of fighting games, before any combo happens. The TV shows a single horizontal lane with four dots, positions fully public. Each phone secretly holds one number: your reach, 1–4 tiles. You never learn anyone else's; they never learn yours except by watching you swing and miss.

## Problem
Every fighting-game party riff so far grabs the flashy layer (combos, timing windows, inputs). The layer that actually makes fighting games deep is quieter: two people standing still, each guessing whether they're inside the other's range. That's a pure hidden-information game and it maps onto a shared screen beautifully — but only if each range lives on a separate device.

## How it works
One round, eight beats, 4 seconds per beat. Each beat, every phone privately commits one of: LEFT, RIGHT, STAND, SWING. All commits lock, then resolve simultaneously:

1. Moves apply (collisions push, nobody stacks).
2. Swings resolve: your swing hits every player whose post-move tile is within your secret reach, either side.
3. A hit costs a life (2 lives). A swing that hits nobody is a WHIFF.

The TV then animates the beat and — critically — marks whiffs publicly with a big red X and shows the distance to the nearest player at that instant. That's the information engine: a whiff at distance 3 tells the room your reach is under 3; a hit at distance 3 tells them it's at least 3. You leak your own stat by using it. You have only 3 swings all round, so fishing for information is expensive.

PHONE (private): your reach as a shaded band drawn around your dot, your remaining swings and lives, the four commit buttons, and one scouting card — the true reach of exactly one opponent, chosen by the server, unknown to them.

TV (public): the lane, four dots with positions and lives, whiff X's, and the beat clock. Never any reach.

Last fighter standing wins; if two survive eight beats, the one who whiffed less wins.

## Technical approach
PartyKit / Cloudflare Durable Object, one object per room. State: `{beat, phase, players: {id, tile, reach, lives, swingsLeft, commit}}`. Commit-then-reveal per beat: phones POST a commit, server holds it, server resolves at the beat boundary and broadcasts a public delta to the host plus a private frame per socket (your reach, your scouting card). No client-side simulation of anyone else's reach — the client literally cannot render information it was never sent.

The genuinely hard part is the beat boundary under mobile flakiness: a phone that backgrounds and reconnects must land in the right beat with its commit either accepted or defaulted to STAND, and the host animation must stay ahead of no phone. Server clock is authority; phones display a countdown reconciled by round-trip offset, and late commits inside a 300 ms grace window still count.

## v1 scope
- 4 players, one round, 8 beats, 9-tile lane
- Reaches drawn from {1,2,3,4} without replacement
- 2 lives, 3 swings, one scouting card each
- TV shows the lane, whiff X's, and a post-round reveal of all four reaches

## Out of scope
- Blocking, throws, facing direction, health bars
- Multiple rounds, character select, rematch tuning
- Any real-time (non-beat) input

## Risks & unknowns
- Reach 4 on a 9-tile lane may be flatly dominant; may need reach-scaled swing cost.
- Simultaneous-commit games stall if players deliberate; the 4-second beat must be hard.
- Four players in one lane may be chaotic enough that deduction never happens — a 3-player variant is the fallback.

## Done means
Four phones complete an eight-beat round where the TV's whiff markers let at least one player correctly name another's reach in the post-round reveal, and no beat resolves with a missing or duplicated commit.
