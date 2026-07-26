## Overview
All Hands is a 3-4 player, one-round cooperative shouting game for a TV plus phones. Each phone privately holds a queue of shipboard jobs. Each job names a physical *handle* (THE WINCH, THE BILGE COCK, THE SPANNER) and a crew size: 1, 2, or 3. A job only completes if exactly that many *different phones* are physically holding that handle's button at the same moment. Not fewer. Not more.

## Problem
Spaceteam-likes make you shout nouns at people. They rarely make your own hands a scarce, contested resource. Here, helping someone costs you the thumb you needed for your own job, and an eager fourth volunteer actively breaks the thing. That converts "read your panel aloud" into "negotiate a labor market in nine seconds."

## How it works
Private on each phone: your job queue (2 visible at a time, each with handle name, crew size, a burning TTL bar), and *your handle rack* — the 4-6 handles this phone can physically grip. Handles are distributed so no phone holds every handle it is assigned jobs for; the winch on your job card may exist only on two other phones. Nothing tells you who has what. You find out by yelling.

To work a job you press and hold its handle. Holding is exclusive: one thumb, one handle. So a 3-crew job with three players means every person abandons their own burning job simultaneously — a full-room sync moment that has to be counted down out loud. Over-crewing (a fourth hand on a 3-crew handle) fails the job instantly with a splintering sound, which is why the verbal protocol the room invents is always "TWO ONLY — Priya off, Priya OFF."

Shared TV: the ship's list angle, water level, a completed/failed tally, and a live lamp per handle showing *how many hands are on it right now* — but never which phone, and never what any job requires. The TV is the count; the phones are the intent.

## Technical approach
PartyKit / Durable Object room, one authoritative sim at 10 Hz. Model: `Room{code, phase, tick, players[], handles[], jobs[]}`, `Job{id, handleId, crew, ownerId, ttlMs, state}`, plus `holds: Map<handleId, Map<playerId, lastHeartbeatTick>>`.

Holds are streamed, not edged: a gripping phone sends a heartbeat every 100 ms with a client timestamp; the server converts it via a per-connection clock offset measured by a ping/pong exchange at join, and treats a hold as live for 300 ms past its last heartbeat so one dropped packet doesn't drop your grip. Completion requires `crew` distinct live holders continuously for 1.2 s with zero over-crew ticks.

The genuinely hard part is fairness under asymmetric latency: a player on flaky Wi-Fi must not be blamed for a phantom release, and a fourth hand arriving 40 ms late must count as over-crew rather than silently succeeding. Everything resolves on server ticks; phones render optimistic grip state with a server-corrected confirm ring.

## v1 scope
- 3 players, one 90-second round, one ship
- 8 handles, 12 hand-authored jobs, crew sizes 1-3
- Grip button, TTL bar, job queue of 2; nothing else on the phone
- TV: list angle, hand-count lamps, tally, win/lose card
- Join by 4-letter room code, no accounts

## Out of scope
Multiple rounds, difficulty ramp, sound design beyond three SFX, spectators, reconnect-mid-round, 5+ players, any procedural job generator.

## Risks & unknowns
Crew-3 jobs with exactly 3 players may be too punishing or too trivial. Over-crew failure could read as a bug rather than a rule — needs loud, unmistakable feedback. Job distribution must guarantee solvability without accidental serialization (a queue where every job needs everyone is just a metronome).

## Done means
Three phones and a TV in one room, code-joined in under 20 seconds, run a 90-second round where at least one crew-3 job completes, at least one job fails from over-crewing, and the server log shows no completion granted without 1.2 s of verified simultaneous distinct holds.
