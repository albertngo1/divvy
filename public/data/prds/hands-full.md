## Overview

Hands Full is a 3–5 player cooperative panic game for a TV plus phones. The room operates one absurd machine on the shared screen against a 90-second clock. The catch: each phone continuously listens to its own owner, and while you are audibly speaking, *your* controls are locked. Speech is the only channel for the private information the room needs, and it is paid for in hands.

## Problem

Spaceteam-likes degenerate into whoever shouts loudest and fastest; volume is free, so the game becomes a yelling contest with no economy. Hands Full makes the mouth and the hands compete for the same body. Silence is productive but blind; speech is informative but paralyzing. The room has to *invent* a division of labor under time pressure, and nobody assigned it.

## How it works

**Host screen (public):** the Machine — 6 labelled controls with their current values, a stability bar, the timer, and one lamp per player that turns red the instant that player's voice gates them. Everyone can see *who is spending their hands*, and for how long.

**Each phone (private):** the 2 controls you personally own — only your phone knows their absurd names and only your phone can move them — plus 2 Orders naming controls owned by *someone else* ("MEDIAN THE GRUMBLER"). You never learn who owns what. Orders can only be fulfilled by telling somebody.

**The gate:** the phone runs on-device VAD. When you cross threshold, your widgets grey out immediately and stay locked 1.5s after you stop. **Handoff:** one tap throws a control to another player. So the winning move is usually to strip your own controls, become the room's designated mouth, and let the mutes actuate — but electing that person requires talking, which freezes whoever proposes it.

## Technical approach

Authoritative room state in a PartyKit/Durable Object: `controls[{id,name,value,ownerId,version}]`, `orders[playerId]`, `playerState{speaking,lockedUntil}`. Phones send only VAD edges and energy samples (~5 msg/s), never audio. Control writes carry the expected version and are rejected server-side if `lockedUntil > now` — the phone grey-out is optimistic, the server is truth.

The genuinely hard part is **cross-talk attribution**: one loud player trips every phone's VAD. The server buffers energy reports in a 250ms window and gates only the argmax phone, with hysteresis so a laugh doesn't chatter the lamps. That needs a shared clock — a ping-based offset estimate per phone, refreshed every 5s. Lock feedback must land under ~150ms or the mechanic feels broken, so grey-out is local-first and reconciled.

## v1 scope

- 3 players, one 90-second round, 6 controls (2 each), 3 orders in flight
- One machine, one order verb set, no themes or persistence
- 3-second calibration on join, fixed threshold above measured floor
- Handoff included — it is the point
- Host screen: values, lamps, timer, win/lose

## Out of scope

ASR or word recognition, multiple rounds, reconnect grace, spectators, 6+ players, host audio (it would trip VAD), difficulty ramps.

## Risks & unknowns

Players will discover whispering; the floor must scale with room baseline or the game dissolves. Phones in pockets or paired earbuds break VAD. Laughter is speech to a VAD and that may be funny or may be ruinous. And the honest risk: strip the gate and this is just Spaceteam.

## Done means

Three phones and a laptop. A player says one word; within 150ms both their controls grey on their phone and their lamp reds on the TV. A handoff transfers ownership in under 200ms. A silent room provably cannot win (all orders are cross-owned), a constantly-talking room runs out of hands, and in playtest at least one group spontaneously elects a talker without being told the strategy exists.
