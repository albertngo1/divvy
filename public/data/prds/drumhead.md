## Overview

Drumhead is a 3-player competitive game for one hard table (wood, laminate — not glass, not cloth). All phones lie face-down in the middle of the table. The table itself is the network: phones transmit by emitting a low-frequency click train through their speakers, and receive with their accelerometers. Players race to claim slots on a shared ledger, but two transmissions in the same window superpose into an unattributable smear and burn the slot for everyone. For groups who like tactile, slightly absurd hardware games (Spaceteam crowd) and don't mind putting their phone down.

## Problem

Phone party games route everything through a server, so "collision" is always a fiction the server declares. Nobody feels it. Meanwhile the physical room is a genuinely shared, genuinely contended medium — and a table full of phones is an unused carrier-sense network sitting right in front of everyone.

## How it works

One round = 8 transmit windows of 600ms, metronomed on the TV. Six ledger slots are worth 1–5 points each; each player holds 3 claim tokens and a **private rhythm signature** (e.g. `..—`, `.—.`, `—..`).

To claim slot 4, you press-and-hold slot 4 on your phone during a window. Your phone emits your signature as a ~200Hz click train. Every *other* phone's accelerometer records it. The server correlates the received envelopes:

- **One emitter** → clean signature recovered by peers → slot claimed silently.
- **Two emitters** → overlapping envelopes, no signature recoverable → slot BURNED permanently, both tokens gone.
- **Muffled emitter** (phone in your hand, on a napkin, someone's palm flat on the table damping it) → nobody hears you → token wasted.

The two load-bearing private bits: **you are deaf while you transmit** (your own emission saturates your own sensor), and **the TV never shows live slot state** — only a running table-energy bar and the final ledger. Your phone's own scrolling seismograph is your only record of the round. Three players finish the round holding three genuinely different histories of what happened on the same table, and argue about it out loud.

PHONE (private): your token count, your signature, your live seismograph trace, greyed-out slots *you* believe are gone. TV (public): metronome, energy bar, final ledger reveal.

## Technical approach

PartyKit Durable Object per room. Phones stream a 50Hz accelerometer-magnitude envelope over WebSocket, timestamped against a server clock offset computed NTP-style (median of 7 ping/pongs) so windows are fair across devices. Room state: `{window, slots[{id,value,state}], players[{id,sig,tokens}], traces{}}`.

The genuinely hard part is detection, not sync. iOS caps DeviceMotion near 60Hz, so spectral discrimination is impossible — which is exactly why signatures are **temporal rhythms, not tones**. The server thresholds each peer envelope, extracts inter-onset intervals, and matches against the three known patterns; a window resolves CLEAN only if ≥2 peer phones independently recover the same single signature. Emission uses Web Audio (not `navigator.vibrate`, which iOS Safari doesn't support at all).

## v1 scope

- 3 players, 1 round, 8 windows, 6 slots, 3 tokens each
- One hard table, phones face-down, no reconnect logic
- 15-second calibration: everyone emits once, server confirms mutual audibility or refuses to start
- Ledger reveal + scores on TV, then it's over

## Out of scope

Multiple rounds, >4 players, table-material auto-detection, TDoA localization of emitters, spectator mode, persistent scores.

## Risks & unknowns

Coupling varies enormously by table material — a soft or wobbly table kills the game (calibration must hard-fail, not degrade). Phone speakers roll off badly below ~300Hz. iOS DeviceMotion needs a permission prompt behind a user gesture. Biggest unknown: whether one loud close emitter is reliably distinguishable from two distant ones.

## Done means

Three phones on a wood table complete one round in which (a) a solo claim is confirmed by both peer phones' recovered signatures, (b) a deliberate double-press burns a slot and both colliders' seismographs show the smear, and (c) at least two players end the round disagreeing out loud about which slot burned — and the TV's final ledger settles it.
