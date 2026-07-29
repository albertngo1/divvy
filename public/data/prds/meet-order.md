## Overview

A 3-player real-time dispatch game for a TV plus phones. One single-track line, three trains, no passing except at sidings. Two trains in the same segment at the same time is a head-on collision. Talking is encouraged. The catch, drawn from why Standard Railway Time had to be invented in 1883: every dispatcher's clock is set to their own town's local time, and nobody is told the offset. Verbal coordination doesn't merely fail — it produces confident, specific, wrong agreements.

## Problem

Most "don't collide" party games make talking hard (noise, silence rules, bandwidth limits). That's a tax on communication. This one leaves communication fully available and breaks the *units*, so the room's coordination attempts are the mechanism of its own destruction. You cannot solve it by talking louder.

## How it works

The TV shows the line: five segments, two sidings, three train icons, and a single clock in **true time**.

Each phone privately shows: (a) a clock offset by a private ±3 to ±11 minutes, never labeled as offset — it's just "the time"; (b) one train with a private origin, destination, and a departure window expressed in *your* time; (c) a dispatch pad — HOLD, DEPART NOW, or DEPART AT hh:mm (your time).

The server converts everything to true time. If two trains occupy a segment simultaneously in true time: both are destroyed, and that segment is **closed permanently** for the round, shrinking the line toward forced conflict. The TV announces "COLLISION — SEGMENT 3 — 8:22" in true time. That announcement is the only channel through which you can infer your own skew: you heard it, you glanced at your phone, it said 8:29. Education by wreckage.

Players talk constantly. "Hold until 8:20" is a real, actionable, and possibly fatal instruction.

## Technical approach

Host tab + phone PWAs + PartyKit room (or Socket.IO over Tailscale Serve). Server is the sole clock. Model: `segments[i] = {closed, occupant, enteredAt}`, `trains[p] = {pos, speed, offsetMs, orders[]}`, all times stored in true ms. Clients render `trueNow + offset[p]` and never receive another player's offset or true time.

The hard part isn't latency — trains move slowly. It's that every client UI is deliberately lying while the server adjudicates on truth, so *every* timestamp crossing the wire must be normalized at exactly one boundary or the bug is invisible during dev and catastrophic at the table. Second hard part: the reveal. At round end the TV must replay the wreck in true time with all three players' clocks ghosted alongside, or players just feel cheated instead of enlightened.

## v1 scope

- 3 players, one round, ~4 minutes, 5 segments, 2 sidings
- Hardcoded offsets (−7, 0, +5 minutes)
- Orders: DEPART NOW and DEPART AT only
- End-of-round replay with clock ghosts

## Out of scope

Multiple trains per player, freight priority, telegraph relay, discovering/publishing a standard time as a win condition, multi-round campaigns.

## Risks & unknowns

Offsets may read as "the game is broken" rather than "the game has a secret" — the replay carries all that weight. Too-large offsets make inference hopeless; too small and it's noise. Pacing must be slow enough to talk, fast enough to matter.

## Done means

Three phones dispatch on one line; a player who verbally agrees a meet time with another still causes a head-on collision; the closed segment persists; and the replay makes at least one person say "wait, your clock says WHAT?"
