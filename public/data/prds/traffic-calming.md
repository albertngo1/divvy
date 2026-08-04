## Overview
A 4-player, 8-minute cooperative real-time maze for a living room with a TV and four phones. One player is the **Planner**, whose phone *is* the arena — the full map, plus three live dots with heading arrows. The other three are **Drivers**, whose phones show a black screen and a thumb pad. Drivers cannot see the map, cannot see each other, and do not know which way they are facing. The group wins by getting all three dots into the exit pen and holding it for 3 seconds.

## Problem
Every "one person has the map" game degenerates into turn-by-turn dictation: the map-holder reads coordinates aloud and everyone else transcribes. That's fine with one piece and dead with three, because **speech is a serial channel**. With three blind bodies moving simultaneously, the Planner physically cannot narrate fast enough. The itch: give the map-holder a *parallel* channel to the pieces — the terrain itself.

## How it works
Drivers use Asteroids-style controls: left thumb turns, right thumb throttles. Their on-map heading is randomized at start and never shown to them. They move continuously, all three at once, for a single 3-minute round.

The Planner's phone privately shows: the 12x8 arena, three live dots with heading arrows, a wall budget (14 segments), and a drag surface. Dragging a stroke for ~1.5s commits a **permanent** wall segment. Walls cannot be deleted. So the Planner herds — funnels a driver down a corridor, seals the wrong branch, builds the pen last — and every wall spent to steer someone is a wall unavailable to finish the pen.

A Driver's phone privately shows nothing but the pad, plus an edge flash and buzz on the side of *their own body* that just hit something. They learn the map only as a sequence of bruises.

The host TV shows the clock, the wall budget, and an anonymous THUD ticker — never the map, never the dots. The Planner may absolutely still talk, and will, to exactly one driver at a time, while the other two drift into whatever they drift into.

## Technical approach
Authoritative 20Hz sim on a PartyKit Durable Object. Room state: `{arena, walls[], drivers: {id, x, y, heading, vel}, budget, clock}`. Drivers send input intents at 30Hz (turn rate, throttle 0-1); the server integrates and broadcasts deltas. The Planner client dead-reckons dots between snapshots and reconciles on receipt.

The genuinely hard part is wall commit under latency. The Planner drags on a surface whose dots are moving *under their finger*, on a phone with 60-120ms RTT. A committed segment must be server-validated (no walls through a body, no sealing a driver into a zero-cell pocket), so the optimistic local preview can be rejected — requiring a snap-back animation and a rejection buzz that reads as feedback rather than as a bug. Collision uses swept-circle-vs-segment; drivers slide along walls rather than stopping dead, or blind driving is misery.

## v1 scope
- Exactly 4 players. No spectators, no lobby, no reconnect.
- One hand-authored 12x8 arena, one 3-minute round, win/lose only.
- 14 wall segments, additive only.
- Haptics + edge flash on collision. No audio, no music.

## Out of scope
Wall deletion, moving hazards, multiple rounds, procedural arenas, more than 3 drivers, rotating the Planner role, any scoring beyond survival.

## Risks & unknowns
Drivers may find blind driving frustrating rather than funny — mitigated by forgiving sliding collisions and short rounds. The Planner may just verbally serialize and win anyway; if a 3-minute clock doesn't kill that strategy, tighten to 2:15. iOS Safari haptics are unreliable, so the color flash must carry the signal alone.

## Done means
Four phones and a TV, cold group, no rules questions after a 30-second explainer, and a decided win or loss inside 3 minutes — and in the recording of that round, at least one moment where the Planner *fenced* a driver instead of telling them anything.
