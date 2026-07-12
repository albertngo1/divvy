## Overview
Split Second is a real-time reflex party game for 3-5 players, one shared host screen (TV/laptop) and a phone each. Over a single ten-second sweep, every player must plant one "flag" in time. You score for the empty space around your flag — but if two flags land within the same narrow window, both players collide and score zero. It's a temporal Schelling game played blind: you're not trying to match the room, you're trying to be alone in a moment.

## Problem
Most timing minigames are you-vs-the-clock. There's no cheap, social game about *reading when everyone else will jump* — the delicious paralysis of "if I wait for the empty gap, so will they." Anti-coordination in the time domain is almost unexplored.

## How it works
The host screen shows a single second-hand (or a filling bar) sweeping 0→10s with an audible metronome tick. Each phone PRIVATELY shows the same live sweep, a big TAP button, and nothing about anyone else — no other players' cursors, no counts. You tap once to plant your flag; you can't move or un-tap it. When the sweep ends, the host reveals every flag at once on the timeline. Your score = distance to your nearest neighbor's flag. Any two flags inside a 400ms collision window both turn red and score zero, with a satisfying klaxon. The private phone is the whole point: if the sweep were visible to a passed-around device you'd just place flags in the visible gaps; the fun is committing blind while imagining where three other thumbs are hovering.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Round { t0, flags: {playerId, tLocalTap, tNormalized}[] }`. The genuinely hard part is *fair timing across devices*. On join, each phone runs a 5-ping clock-sync handshake to estimate its offset from server time. At round start the server broadcasts `t0` (server clock). A phone tap sends `performance.now()`-derived local timestamp; the server converts to normalized round-time using that phone's offset. Collision detection and scoring are computed server-side only after all flags are in (or the sweep expires), so no phone can react to another's tap. Sync tolerance: ±30ms is fine given a 400ms collision window.

## v1 scope
- 3 players, one 10-second sweep, one round.
- Fixed 400ms collision window.
- Score = nearest-neighbor distance; collisions = 0.
- Host reveal animation + winner.

## Out of scope
- Multiple accelerating rounds, tournaments.
- Variable collision windows or power-ups.
- Persistent accounts/leaderboards.

## Risks & unknowns
- Clock-sync accuracy on flaky phone Wi-Fi; may need to widen the window.
- Is one sweep deep enough, or does it need best-of-three to feel like a game?
- Collision fairness perception when two taps are genuinely near-simultaneous.

## Done means
Three phones join, the sweep runs, all three tap, and the host correctly reveals flags with at least one deliberate collision scoring both players zero — reproducibly, within ±50ms of hand-measured tap times.
