## Overview
Simmer is a cooperative, silent convergence game for 3–6 people in a room. Everyone is trying to independently land on the *same* point of a shared spectrum — but nobody can see anyone else's choice. The only feedback is a collective 'temperature' on the host screen. It's blind simulated annealing, played with your thumbs, against a clock.

## Problem
Most 'get on the same page' games are one-shot (everybody locks a guess, then a reveal) or let you see others and just copy. The itch Simmer scratches is the *live, blind feedback loop* — the near-physical thrill of feeling the room heat up as you all silently zero in, never sure whether you're the outlier who should move or the anchor who should hold.

## How it works
The host TV shows a themed spectrum (e.g. 'RAW ←→ CHARCOAL: how do you like your convergence?'), a huge glowing thermometer, and a 45-second timer. Each **phone privately** shows one slider handle — *yours only*, 0–100 — plus a soft haptic when you nudge it. Crucially, your phone never tells you if you're 'right.'

Every 200 ms the server measures how tightly clustered all the hidden values are (standard deviation) and maps it to a single shared **heat** scalar, 0–100, broadcast to everyone. Tight cluster = blazing hot; scattered = cold. Players slide silently, no talking, hunting for the heat to peak. At the buzzer, if the final spread is under a threshold, the room wins — and the host reveals every handle at once for the laughs/agony.

**Private per-phone:** your slider position, your haptics. **Shared host:** spectrum label, thermometer/glow, timer, final reveal of all handles.

## Technical approach
Authoritative WebSocket room (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `room { phase, spectrumPrompt, deadline, players: { id: { value } } }`. Phones send throttled value updates (~10/s, coalesced). The server runs a fixed 5 Hz tick, recomputes spread, and broadcasts **only the heat scalar — never individual values** (leaking positions would let you reverse-engineer neighbors and kill the blindness).

The genuinely hard part: making heat feel *responsive but not jittery*. Raw stddev flickers; an exponential moving average smooths it but adds lag that muddies the gradient. Tuning that EMA so the room can actually feel 'warmer/colder' from small moves is the whole game.

## v1 scope
- Exactly 1 spectrum, hardcoded.
- 3–5 players, one 45s round.
- Single win/lose threshold, one final reveal.
- LAN only, no accounts, room code join.

## Out of scope
- Multiple rounds or cross-round scoring.
- Custom/generated spectra.
- Showing per-player deltas or 'you're the outlier' hints.
- PWA install polish, reconnection grace.

## Risks & unknowns
- May feel too abstract — the heat gradient could be too coarse to actually converge on.
- A griefer who sits still poisons the cluster; no v1 mitigation.
- Jitter vs. lag tuning could sink the whole feel.

## Done means
Four phones on one Wi-Fi join a room; all sliders move independently; the host thermometer visibly rises as the hidden values cluster and falls when they scatter; the 45s round ends with a correct win/lose verdict and a synchronized reveal of every handle.
