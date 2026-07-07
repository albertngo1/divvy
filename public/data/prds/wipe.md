## Overview
Wipe steals the MMO raid-mechanic genre (FFXIV / WoW savage raids) — the part where each player privately gets a debuff and must resolve it spatially without colliding with everyone else's. The TV is the boss; each phone is your private assignment card; the living room floor is the arena. For 3-4 people who want cooperative panic without any gaming skill, just fast reading and faster feet.

## Problem
Raid mechanics are secretly a party game already: 'you have the bomb, run away from the group; you're tethered to Alex, stay close; you have the tower, go stand on it' — all HIDDEN, all simultaneous, all resolved by bodies moving in space. That only works if each player sees a different secret instruction at the same moment. One shared screen ruins it instantly.

## How it works
Set up 4 numbered floor spots (chairs, tape, cushions). The **host TV** shows the boss, a filling cast bar (~8s), and the cast name ("Doom Spiral"). When a cast begins, each **phone privately** shows one assignment: a target spot number ("→ Spot 3"), a relative rule ("STACK with whoever else is stacking"), or an anti-rule ("SPREAD — be alone on a spot"). Assignments are deliberately interlocking: two players told to stack + one told to spread means the spread player must read the room and avoid them — so people shout, point, and scramble. Before the bar fills, each phone taps the spot number they physically stand on. The server checks every private constraint at once; all satisfied → boss takes damage; any violated → the TV plays a wipe animation. Survive 3 casts to kill the boss.

## Technical approach
PartyKit/Socket.IO Durable Object is authoritative and owns the cast timeline. Data model: `cast{id, name, deadline, assignments{playerId → constraint}}`, `positions{playerId → spotId}`. The server generates each cast by sampling a constraint set proven solvable (a tiny CSP solver checks a valid assignment exists before dealing it). Phones subscribe to their OWN assignment only; the TV subscribes to the cast timeline and aggregate result. Sync is soft-real-time: a shared server clock drives the cast bar, and position taps just need to land before `deadline`. The **hard part is generating interlocking-but-satisfiable constraint sets** and adjudicating them fairly on honor-system taps (no sensors in v1).

## v1 scope
- 3 players, 4 numbered floor spots
- One boss, exactly 3 scripted casts, one enrage on failure
- Three constraint types: go-to-spot, stack, spread
- Position by tapping a spot number; no sensor verification

## Out of scope
- Real position sensing (compass/UWB), tethers as physical lines
- Boss HP tuning, multiple bosses, difficulty tiers
- Reconnect, more than 4 spots, animation polish

## Risks & unknowns
- Honor-system taps let cheaters/mistakers claim spots they aren't on — fine for laughs, bad for competition.
- 8s may be too long or short; needs playtest tuning per group size.
- Constraint generator could deal unsolvable or trivially-solvable sets.

## Done means
Three phones join, each receives a DIFFERENT private assignment on each cast, players physically move and tap their spot before the bar fills, the server validates all constraints simultaneously, the TV shows damage or a wipe accordingly, and clearing 3 casts kills the boss.
