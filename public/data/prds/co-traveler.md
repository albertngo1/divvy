## Overview
A 4-player, 3-minute competitive round for a living room with a TV and four phones. Every phone is a private partner card and a private mic sensor. You score for *co-silence*: seconds where you and one secret other player were both quiet. The catch is that co-silence is a public pattern, drawn live on the host screen, so the thing that pays you is also the thing that convicts you.

## Problem
Silence games treat quiet as a resource you spend. Nobody has made quiet a *signal of alignment*. And hidden-partner games are always decided by what people say — here the incriminating evidence is when you don't say anything, which is far harder to fake and much funnier to watch someone try.

## How it works
1. Lobby: each phone does an 8-second noise-floor calibration. Server secretly splits four players into two pairs; each phone privately shows only "Your co-traveler: NAME."
2. Round runs 180 seconds. Each phone's mic classifies its *own owner* every 250 ms as SPEAKING or QUIET. For each tick where both members of a pair are QUIET, that pair's edge gets +1. Your score is your own pair's edge total.
3. Host TV (public): four nodes, all six edges, thickening live with names attached. Plus a ROOM QUOTA bar — the room must collectively accumulate 60 seconds of speech, or everyone takes −40 at the buzzer.
4. Talking costs you −1 point per second and zeroes every edge you're in for those ticks. So the quota is a public-goods problem: somebody has to burn points filling it, and you'd rather it wasn't you or your partner. But if you both sit quiet to protect your edge, your edge glows brightest on the TV.
5. Phone private: partner name, your live edge count, your seconds spoken. Nobody else's private state is derivable from the graph alone.
6. Endgame: 20 seconds of silent accusation on phones — tap the two names you think are a pair. Correct: +25 to you, −25 to that pair.

Per-phone is load-bearing: partner identity differs per device, and per-person speech attribution requires one mic per person, simultaneously.

## Technical approach
PartyKit Durable Object per room; host tab and phone PWAs both WebSocket clients. Phone: `getUserMedia` → AudioWorklet computing A-weighted RMS over 20 ms frames, two-threshold hysteresis gate (open at floor+9 dB, close at floor+5 dB, 300 ms hangover) so laughs count and the fridge doesn't. Phones send state transitions plus a 1 Hz heartbeat, each stamped with a synced clock (3-sample offset handshake, EWMA). Server bins into 250 ms authoritative ticks and drops frames older than 750 ms.

Model: `Room{phase, tick, quotaMs}`, `Player{id, name, floorDb, spokenMs, pairId}`, `Edges: Map<pairKey, ticks>`. TV subscribes to a 4 Hz diff stream.

Hard part: cross-talk. One loud voice lights all four mics and would erase every edge at once. Fix: per-tick argmax — only the loudest phone more than 4 dB over its own floor is marked SPEAKING; near-ties mark both. Raw audio never leaves the phone.

## v1 scope
- Exactly 4 players, one 180 s round, two fixed pairs
- Host screen is one SVG: 4 nodes, 6 edges, quota bar
- One accusation tap per player, then final scores
- No reconnect, no persistence, no lobby chat, no sound effects

## Out of scope
5–8 players, multi-round matches, free-agent/traitor roles, spectators, any audio recording or upload, score history.

## Risks & unknowns
Degenerate strategy where everyone talks nonstop to flatten all edges (mitigated by the −1/s cost and the capped quota). The graph may make pairs trivially readable — fallback is quantizing edges into four visual bands and refreshing only every 15 s. Bluetooth mics with AGC break calibration; require the built-in mic. Three minutes of near-silence may drag; 90 s is the fallback length.

## Done means
Four phones plus a TV on one LAN; after a round the host shows true pairs, edge totals, seconds spoken and accusation results — and in playtest at least one player is observed talking deliberate nonsense purely to dim their own edge.
