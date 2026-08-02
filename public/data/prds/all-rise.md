## Overview
A 60-second cooperative constraint puzzle for 4 people and whatever seating a real room has. No taps, no typing: the only input is standing up and sitting down, detected by each phone's accelerometer. Each player privately holds one rule about their own posture; the rules reference each other; the room must satisfy all four simultaneously for 5 seconds.

## Problem
"Room as board" games usually mean walking around. But the most contested physical resource in any living room is **seats** — a couch that fits three, one armchair, one ottoman nobody wants. Sit/stand is a crisp, unmistakable accelerometer signal that almost no game reads, and it turns furniture scarcity into a mechanic instead of set dressing.

## How it works
1. **Calibrate (15s).** TV: "Stand up and sit down, twice." Each phone fits a per-device threshold on the vertical-accel transient (upward spike then settle for standing; a downward thump for sitting). A manual tap fallback exists but the TV publicly marks anyone using it.
2. **Private deal.** Each phone shows ONE rule card and its own live posture chip (SEATED / STANDING). Example rules: *"You must be seated whenever Dana is standing."* / *"You may never stand for more than 4 seconds at a time."* / *"Exactly one other person must be standing while you are."* / *"You must be seated, and not on the couch."* Your rule is yours alone; nobody sees whether yours is currently satisfied.
3. **Play (60s).** The host TV shows only a big anonymous number: **how many people are standing right now**, plus a countdown and a 5-second lock meter. It never shows names, never shows rules, never shows who is satisfied.
4. **Talk.** Discussing your rule out loud is legal and necessary — the comedy is four people negotiating incompatible seating while physically popping up and down. Rules are guaranteed jointly satisfiable but only in one arrangement.
5. **Win.** All four rules true simultaneously for 5 continuous seconds.

## Technical approach
Socket.IO server behind Tailscale Serve; host browser tab + phone PWAs.

Data model: `Room {phase, tStart, holdMs, standingCount}`, `Player {id, name, thresh, posture, postureSince, ruleId, ruleArgs, satisfied}`. Rules are pure predicates evaluated server-side over the full posture snapshot each tick.

Sync: phones read `devicemotion` at 60Hz locally, run a debounced state machine (500ms refractory, so a shuffle isn't a stand), and emit only **posture-change events** with a client timestamp. The server converts to server time using a per-socket offset from ping/pong, holds the authoritative posture vector, evaluates all four predicates at 10Hz, and runs the 5s hold timer. Only the server may declare a win.

Hard part: false positives. A big laugh, a lean forward, or picking up a drink all look like a stand. The debounce plus a per-device calibrated threshold plus requiring a sustained 400ms orientation/height change is the mitigation, and the duration-based rules are deliberately forgiving (4s, not 1s) to absorb 200ms of detection lag.

## v1 scope
- 4 players, one 60s round, one hand-authored rule set of exactly 4 cards.
- Phone held in hand only (no pocket mode).
- TV shows: standing count, countdown, lock meter. Nothing else.
- Rules hardcoded, satisfiability verified by hand.

## Out of scope
Rule generation, difficulty tiers, pocket/table detection, scoring, more than 4 players, rounds, replays.

## Risks & unknowns
- Sit/stand detection on a phone held loosely may be too noisy; fallback is a two-hand "hold phone at chest while standing" posture rule, which is uglier but reliable.
- Rooms with fewer seats than players change the puzzle unpredictably — may need a "count your seats" setup prompt.
- Someone with a bad knee is excluded; needs an explicit tap-only accessible mode.

## Done means
Four phones, one couch and two chairs: after calibration each phone shows a different rule, the TV's standing count tracks real bodies within 500ms, and the lock meter fills and declares a win only when the group physically finds the single seating arrangement that satisfies all four private rules.
