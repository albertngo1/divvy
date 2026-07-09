## Overview
A fast, tense party game for 3–6 people about the single most-hated act of cooperative driving: merging. The host screen is a top-down highway where everyone's lanes squeeze into one. Each phone is a car you drive by *deciding when to merge* — blind to everyone else's plan. It's for a living room that wants 60 seconds of shouting, groaning, and near-misses.

## Problem
Most "co-op" party games reward you for syncing up. Real merging is the opposite: if two drivers go for the same gap at the same moment, you *both* get punished. That everyday failure mode is the whole game — coordination is the crash, not the win.

## How it works
The host shows a shared single-lane road scrolling right, with numbered gaps between AI cars flowing through a merge point. Each player has their own on-ramp feeding that lane.

PRIVATE on each phone: your own ramp view, your current speed, and a big MERGE button plus a slider to pick your target gap number (1–8). Crucially, you can nudge speed up/down to change *when* you'll arrive at the merge. You see only your car and the gaps — never anyone else's chosen gap or timing.

SHARED on host: the merge point, the flowing gaps, and — only at resolution — every car diving in. If two (or more) players commit to the same gap within a 300 ms window, that's a collision: both spin out, score 0, and the host plays a satisfying crunch. Clean solo merges score by gap difficulty (tighter gap = more points). A round is ~45 seconds of continuously flowing gaps; you merge, respawn on your ramp, and go again until time.

## Technical approach
Host tab + phone PWAs + one authoritative WebSocket room (PartyKit / Durable Object). The server owns a single deterministic clock and the gap schedule (seeded, so host and phones render identical gap positions). Data model: `room{seed, tick, players[]}`, `player{id, ramp, speed, pendingMerge:{gap, committedTick}}`. Phones send only `setSpeed` and `commitMerge(gap)` events; the server timestamps commits against server ticks and detects collisions by bucketing commits per `(gap, tickBucket)`. Host and phones are pure renderers of server state; the server is the only judge. Hard part: perceived fairness under phone latency — a 150 ms lag shouldn't feel like a stolen gap. Solve by resolving collisions on *server-received tick* with a generous shared window, and echoing an authoritative "you committed at tick N" back so the phone can reconcile its animation.

## v1 scope
- One 45-second round, 3–4 players.
- 8 gaps, one merge point, AI traffic on rails.
- Speed nudge + gap-commit only; collisions zero you out.
- Host shows live score and a crash counter.

## Out of scope
- Multiple merge points, lane changes, power-ups.
- Persistent scoring across rounds, avatars, sound design polish.
- Reconnect/spectator handling.

## Risks & unknowns
- Latency fairness could feel unjust; needs the reconcile echo to feel honest.
- Is blind timing *readable* enough to feel skillful, not random? Playtest the gap-count and window size.
- Might be too frantic for 6 players; cap at 4 for v1.

## Done means
Four phones join a host URL, a 45s round runs, two players targeting the same gap both visibly crash and score 0 while clean merges bank points, and the final leaderboard renders on the host — all authoritative from the server with no phone able to fake a merge.
