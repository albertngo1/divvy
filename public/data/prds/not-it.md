## Overview
A 4-player, two-minute crisis game for a TV and four phones. Devils & the Details' chore panic, restructured as a real-time labor market: work is unevenly dealt, only its holder can see how bad it is, and the only routing protocol is your mouth.

## Problem
Spaceteam gives everyone an identical panel and an identical load. Real chaos is *unequal*: someone is buried, someone is idle, and nobody can see across. The itch nobody has built into a party game is the delicious social act of shedding work — shouting "NOT IT" and meaning it.

## How it works
The host TV shows the FLOOR: eight job tiles with draining countdown bars, each tinted with the color of the phone currently holding it. That is *all* the TV reveals — no titles, no costs, no queue depths.

Your phone privately shows your queue (2–3 jobs). Each expands to a title (`BLEED THE COOLANT LOOP`), a mini-task (hold a slider at a value for six seconds, or tap a four-step sequence), and a cost badge of 1–5 wrenches that becomes visible **only once the job is in your hand**. You can work exactly one job at a time.

Any job can be THROWN by tapping a teammate's face: it lands on their phone instantly, arrives with a 3-second cold start, and its cost re-rolls within a band. A job thrown twice is WELDED — the third holder eats it, no escape. Queues cap at four; a throw into a full queue bounces straight back to the sender.

There is no chat, no in-app signaling. Since nobody can see anyone's load, routing is pure yelling — and the incentives are filthy, because you want to unload your 5-wrench monster before the room learns it's a 5. Round ends in ALL CLEAR or MELTDOWN, then a 15-second BLAME CARD: most thrown, most eaten, longest idle.

## Technical approach
Socket.IO over Tailscale Serve (or one PartyKit room). Model: `Job {id, title, cost, holderId, throwCount, progress, deadline, version}`, `Player {id, color, activeJobId}`, `Room {jobs, phase, meltdownAt}`.

Server is authoritative at 10 Hz and solely owns `holderId`. Clients send intents: `throw{jobId, toId, version}`, `work{jobId, tick}`. Throwing phones render optimistically and roll back on rejection.

The hard part is concurrent ownership races. A and B both throw to C in the same tick while C completes a job; someone throws a job at 95% progress specifically to dodge blame. Solve with a monotonic per-job `version` and compare-and-swap — a stale-version throw is rejected and the phone snaps back with a shake. Bounce-backs from full queues must resolve inside one server tick and echo in under 150 ms, or the shouting desyncs from the screens and the whole social layer dies.

## v1 scope
- Exactly 4 players, one 120-second round
- 8 jobs from a hardcoded list, 2 mini-task types total
- Throw limit 2, queue cap 4, cost re-roll ±1
- Host screen = tile grid + timer + meltdown bar
- Blame card with 3 stats. No voice capture at all — humans just talk.

## Out of scope
Multiple rounds, flexible player counts, difficulty curves, ASR or mic anything, persistent stats, cosmetics, spectator mode, reconnect handling.

## Risks & unknowns
It may collapse into "dogpile the quiet person" — the weld rule and queue cap are the intended brakes, unverified. Cost re-roll on throw may read as arbitrary rather than tense. Biggest design risk: if the TV leaks queue depth even implicitly (via tile color counts), talking stops being necessary and the game is dead — the tile grid must be verified non-informative.

## Done means
Four phones, one laptop, one 120-second round. A thrown job appears on the receiver's phone in under 150 ms and disappears from the thrower's. A twice-thrown job displays WELDED with a dead throw button. Two simultaneous throws into a full queue produce exactly one landing and one visible bounce-back. The round terminates in ALL CLEAR or MELTDOWN and the blame card names the genuinely most-thrown player.
