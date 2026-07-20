## Overview
Contact is a get-off-the-couch party game for 3–4 players in one room. Every phone is both a weapon and a sense of touch: you hunt a secret target and score by physically bumping your phone against theirs, which the system detects as two accelerometer jolts landing in the same millisecond. The shared TV is the scoreboard; the room is the arena.

## Problem
Most Jackbox-shaped games are sedentary — everyone stares at the TV and thumbs text. Nobody is *using the room*. Meanwhile the accelerometer is the most tactile sensor in the phone and almost every party game wastes it on tilt-a-ball. Contact makes physical contact between two specific people the entire mechanic, so bodies move, and the phone becomes the nerve ending that says 'you touched the right person.'

## How it works
Each phone PRIVATELY shows one thing: your current secret target (a colored avatar) and your score. On the host's 'GO,' a 60-second timer starts. You roam the room and try to fist-bump your phone against your target's phone. When two phones knock together, both register a sharp acceleration spike within a few milliseconds; the server pairs those two spikes. If one of the pair is *your* assigned target, you score, your phone buzzes, and you're handed a fresh target. Simultaneously someone else (whose identity you never learn) is hunting you.

The host TV shows ONLY anonymized state: a live 'contacts made' ticker, a bright pulse each time any legal bump lands, the countdown, and the final leaderboard. It never reveals who is hunting whom — that asymmetry lives entirely on the private phones.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object over Tailscale Serve). Data model: `players[{id, avatar, targetId, score}]`, plus a rolling `spikeBuffer` of `{playerId, magnitude, serverArrivalTs}`. Phones request DeviceMotion permission (iOS gesture), then locally threshold on jerk (d|accel|/dt) to emit a `SPIKE` event, tagged with a per-device clock offset established via an NTP-style ping handshake at join. The server buffers spikes and, every ~40ms, pairs any two spikes within a tight coincidence window. The genuinely hard part is disambiguation and clock sync: if exactly two phones spike in-window it's a clean pair; if three-plus spike, the event is voided and players re-bump. Cheat mitigation: require a minimum magnitude AND a matching magnitude on both phones (a real knock is felt symmetrically; setting a phone down is not).

## v1 scope
- 3 players only, targets fixed in a cycle A→B→C→A
- One 60-second round
- Bump your target = +1, new target assigned, most points wins
- Host = ticker + pulse + timer + leaderboard

## Out of scope
- Decoys, power-ups, elimination/last-man-standing, teams
- Rematch flow, avatars beyond color chips

## Risks & unknowns
- >2 simultaneous spikes in a crowded huddle → ambiguity; mitigated by voiding and small player count
- iOS DeviceMotion permission friction and clock-offset drift over 60s
- Griefing by shaking a phone near someone without real contact (magnitude-symmetry check helps)

## Done means
With 3 phones, a real fist-bump between the correct hunter→target pair scores within 300ms and updates the host tally, while a bump against a non-target or a solo shake does not score — demonstrated live across ten consecutive bumps.
