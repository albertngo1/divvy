## Overview
Pressure Drop is a cooperative voice-relay panic game for 3-4 players in one room, each on their phone as a single coupler on a fire hose. It lives squarely in the Spaceteam lineage: the fun is precise numbers shouted across a room under a buzzer, and the terror of mishearing 'fifteen' for 'fifty.'

## Problem
Relay/telephone games are usually loose and lossy for laughs. Almost nothing forces a group to relay *exact numeric state* down a chain in real time, where each hop transforms the value unpredictably so you can't precompute and must actually listen every single pass.

## How it works
A pump injects a starting PSI into the line. Water flows player 1 → 2 → 3 → nozzle. The catch: **only the phone currently holding the water shows the live PSI.** Everyone else is blind.

Each phone privately owns a SECRET coupler transform (e.g. `+35`, `halve then +10`, `reverse the two digits`). When water reaches your phone it buzzes and shows the INCOMING PSI and, after auto-applying your transform, your OUTGOING PSI. You must **announce the outgoing number aloud**. The next player, hearing it, dials their intake gauge to that value and taps ARM. When the holder taps RELEASE, the coupling seals *only if the armed value equals the true outgoing value*. Mismatch = burst pipe: a leak counter ticks, the timer bleeds, water stays put until they re-arm correctly. The nozzle player must land on a TARGET PSI shown on the TV.

PRIVATE per phone: your secret transform, and (only while holding water) the incoming + outgoing PSI and the shout prompt; when you're next-in-line, the intake dial to arm. SHARED TV: the hose diagram, which coupler holds water, the leak count, the timer, and the nozzle target.

## Technical approach
A PartyKit / Durable Object room holds authoritative state: `tokenPosition`, `currentPSI`, `players[]` each with `{transform, armedValue}`, `leaks`, `targetPSI`. Handshake logic: on RELEASE, server computes `outgoing = transform(currentPSI)`; if `nextPlayer.armedValue === outgoing`, advance token and set `currentPSI = outgoing`; else emit a `leak` event. Latency is forgiving (no simultaneity window), but arrival buzz/haptic must be crisp. The genuinely hard part is *content design*: transform sets that keep values in a fun, mishearable 2-3 digit band, never go negative or absurd, and a per-play randomized start PSI so nobody memorizes the chain.

## v1 scope
- 3 players, fixed linear order, 3 couplers
- Integer PSI 0-300, one target, 90-second timer
- Buzz-on-arrival + ARM/RELEASE handshake + leak-on-mismatch
- Single win screen when nozzle hits target

## Out of scope
- Branching hoses or choosing pass order
- Multiple simultaneous lines
- Difficulty tiers, scoring, rematch flow

## Risks & unknowns
- Deterministic chain could feel dry — the mishearing/handshake tension must carry it; audio polish is load-bearing.
- Leaks might frustrate rather than delight; needs a forgiving re-arm.
- Open question: is the arm-then-release handshake satisfying or fiddly at speed?

## Done means
Three phones join, water starts at a random PSI, each player receives → announces → the next arms → passes, a deliberate mishear produces a visible leak, and a correct run lights the nozzle at target with a WIN on the TV.
