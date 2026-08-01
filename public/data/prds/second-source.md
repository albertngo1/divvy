## Overview

A 90-second cooperative panic for 3 players plus a host screen. You are the graveyard shift on a machine whose telemetry is unreliable. Each phone is an instrument readout; the shared TV is the machine itself, which refuses to display any number at all. The only way to keep it alive is to keep calling readings across the room and re-committing them — while the machine intermittently feeds one of you a corrupted value that you have no way to detect from your own screen.

## Problem

Spaceteam-lineage games assume every player's panel is *true* and the challenge is finding it fast. But the funniest real-world coordination failure isn't slowness — it's someone being confidently, sincerely wrong. Nothing in this genre makes disagreement itself the game loop. "Two-source rule" journalism and Byzantine fault tolerance are the same joke, and nobody has made a party game out of it.

## How it works

Three gauges (PRESSURE, FEED, BIAS). Values drift ±1 per second, so any number is stale in about four seconds.

**Privately, per phone:** live numeric readings for all three gauges, a number dial, and a COMMIT button. Every ~5 seconds the server silently corrupts one (player, gauge) pair — that phone's display is offset by 2–9 for a few seconds. The victim gets no indication. They will argue.

**On the host TV:** three gauge housings with dashes where the numbers should be, each gauge's last committed value, a rising alarm bar per gauge, and a klaxon. No live values, ever.

A gauge commits only when **two different phones submit the same value within a 4-second window**. Since the value must travel by air to get from one phone to another, the room fills with "FEED FORTY-FOUR — forty-four? I've got fifty-one — Marco, break the tie." Any gauge left uncommitted for 15 seconds fills its alarm bar; a full bar melts the machine.

## Technical approach

Host browser tab + phone PWAs + an authoritative server (PartyKit / Durable Object) over Tailscale Serve.

**Data model:** `Room{code, seed, tick, players[], gauges[3]{trueValue, drift, lastCommitTick, alarm}}`, `Corruption{playerId, gaugeId, offset, startTick, endTick}`, `Submission{playerId, gaugeId, value, clientTick}`.

**Sync:** server ticks at 10 Hz and broadcasts snapshots; phones interpolate between snapshots so needles look smooth. The genuinely hard part is *fairness under latency*: a player submits the number they saw 400 ms ago. Solution — every submission carries the client's last-received tick, and the server replays the deterministic (seed + corruption schedule) display log to check what that phone actually showed at that tick. Agreement is judged on displayed values, not wall-clock, so nobody is punished for a bad connection. Corruption schedule never leaves the server.

## v1 scope

- Exactly 3 players, 1 round, 90 seconds
- 3 gauges, integer values 0–99, fixed drift rate
- One corruption active at a time, 5-second dwell, uniform random
- Quorum = 2 matching submissions in 4 s; no partial credit
- Two endings: SURVIVED or MELTDOWN

## Out of scope

Scoring, multiple rounds, 4+ players, difficulty curve, a saboteur mode, any audio processing, reconnect handling.

## Risks & unknowns

Corruption may read as "the game cheated" instead of "Dana was wrong" — the post-round TV replay showing exactly who was fed what has to land the joke. Drift rate vs. quorum window is a narrow tuning band. Three gauges may be too few to force overlapping conversation.

## Done means

Three phones and a TV on one LAN; a full 90-second round runs; a corruption event provokes an audible argument in playtest; both endings are reachable; and afterward players correctly blame the machine, not each other.
