## Overview
Dwell is a blind duration-matching game for 3 players in one room. Everyone starts holding a button at the same instant; each player releases whenever they privately *feel* the right amount of time has passed. The goal isn't to match a clock — it's to release at the same duration as everyone else, using nothing but your own internal sense of time. Over a few silent rounds the room recalibrates until all three releases land within a hair of each other.

## Problem
Every timing party game matches a *moment* — tap on the beat, stop the sweeping bar. Nobody matches a *duration* with no reference. 'How long is a while?' is a question three people can never agree on out loud, and there's a specific delight in discovering your bodies quietly share (or wildly don't) a felt tempo.

## How it works
Host TV counts '3… 2… 1… HOLD.' Every phone vibrates and all three players press-and-hold **simultaneously**. Here's the crux: **your own phone shows no timer, no counter, nothing** — just a held-down glow. You cannot see your own elapsed time, and you obviously can't see anyone else's. You release on feel alone.

As each player lets go, their phone locks and shows only 'released — waiting.' The host shows nothing live except three anonymous 'still holding' dots winking out one by one. Once all three release, the host reveals a **horizontal timeline** with three anonymized release marks and a **spread bracket** (max − min). No absolute seconds are ever shown — only how far apart you were.

Players then silently recalibrate and go again. The room wins when all three releases fall within a 300ms bracket in a single round (or the game ends after 5 rounds showing the tightest bracket achieved). Because there's no shared clock and no visible timer, the only way to converge is for three internal metronomes to quietly agree.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server. The shared 'go' is a server-broadcast `t0` timestamp; each phone measures duration **locally** (`release_local − press_local`) to avoid network jitter, then reports `duration_ms`. Server collects all three, computes spread, and broadcasts only the bracket + anonymized relative marks. Data model: `{ roundId, t0, releases: [{playerId, durationMs}] }`. The genuinely hard part is fairness and privacy of timing: the press must feel simultaneous (haptic + audio 'go' aligned to `t0` with per-device latency compensation), and the client must never surface its own elapsed time in any form — no progress bar, no subtle animation that leaks tempo.

## v1 scope
- Exactly 3 players, up to 5 rounds or first sub-300ms convergence.
- Server `t0` 'go,' local duration measurement, spread bracket only.
- Zero on-screen timers anywhere; host shows anonymized relative marks.

## Out of scope
- Leaderboards, target-duration themes, tempo music.
- More than 3 players; per-player scoring.
- Absolute-time reveals.

## Risks & unknowns
- In-room audio leakage (a gasp or click on release) could break the blindness — lean into 'eyes closed' framing or accept it as charm.
- Internal clocks may never converge; the 5-round cap and 'tightest bracket' fallback keep it from dragging.
- 300ms threshold is a guess; needs tuning against real internal-clock variance.

## Done means
Three phones press on a synchronized 'go,' each releases blind with no visible timer, and the host displays only the anonymized spread — with a win declared the first round all three land inside 300ms.
