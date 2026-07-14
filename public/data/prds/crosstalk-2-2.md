## Overview
Crosstalk is a real-time party game for 3–6 players. Everyone must get a private line of dialogue displayed on the shared TV, but only one line can occupy the single 'channel' at a time. It's a game of nerve and silence-reading: the failure mode is speaking together.

## Problem
Most party games reward the loudest, fastest thumb. Crosstalk inverts that — the itch it scratches is the delicious, escalating panic of a group that all needs to speak but can't schedule who goes when, without a word of out-of-band coordination.

## How it works
Each phone privately shows ONE assigned line (e.g. a punchy sentence, or a word the player must say to complete a shared story on the TV) plus a big SPEAK button and a private 'still unsaid' anxiety meter. The host TV shows a single subtitle bar — the channel — and a round timer.

Tapping SPEAK broadcasts your line to the subtitle bar, where it holds for ~2 seconds, occupying the channel exclusively. If two players' broadcasts overlap at all, both lines garble into visible static on the TV, both fail, and both must retry (your line is NOT revealed to others, so you can't just copy timing off content). Players space themselves purely by watching the shared bar: when it's clear and quiet, it's safe — but so does everyone else think. Win = every player's line displayed cleanly before the timer. Each collision also spends precious seconds.

The private line is the load-bearing secret: you can't see who still needs to go or how urgent their meter is, so you must gamble on the gaps.

## Technical approach
Host tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object). Data model: `Room {phase, timerEndsAt, channel: {occupantId, lineId, clearAt} | null}`; `Player {id, line, delivered: bool}`. On SPEAK, client sends `claim(playerId)`; the DO is the single arbiter — it accepts a claim ONLY if `channel == null AND now > previous.clearAt`. To detect collisions, the DO buffers claims within a ~120ms window: 0–1 claim → grant; ≥2 → reject all as garble. The genuinely hard part is fairness under phone-to-server latency jitter: a laggy player's tap must be judged by server-arrival time, not device time, and the ~120ms coalescing window must be tuned so honest near-simultaneous taps reliably collide (that's the fun) without punishing network noise. Broadcast authoritative channel state at 20Hz so every screen agrees on when it's clear.

## v1 scope
- One round, one timer, 3–4 players
- Fixed pre-authored line list (no generation)
- Text-only broadcast to TV subtitle bar; garble = shake + static overlay
- Win/lose screen; no scoring history

## Out of scope
- Actual mic/voice (text only for v1)
- Multi-round scoring, teams, categories
- Reconnect/spectator flows

## Risks & unknowns
- Coalescing window tuning: too tight = collisions feel random; too loose = every tap collides
- Fun may hinge on line content being worth waiting to read
- Latency asymmetry could feel unfair to a far player

## Done means
4 phones + a TV: all four lines can be delivered clean in a run, two simultaneous taps reliably garble both, and the room instinctively starts pausing to read the channel before speaking.
