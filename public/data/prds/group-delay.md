## Overview

A three-player, no-talking convergence game about agreeing on a target *and* discovering that your own hands are lying to you. Host TV plus three phones, one round, about ninety seconds.

## Problem

Most sync games ask everyone to hit the same instant, and the only skill is reflexes. What's missing is the far weirder social problem: converging when each person's instrument is miscalibrated by a different unknown amount, so "we disagree" and "I am broken" look exactly the same from the inside.

## How it works

Each phone privately shows a wheel of twelve symbols (moon, key, anchor…) with a needle sweeping one revolution per second. There is no assigned target. The room must simply land on the *same* symbol.

Each phone is assigned a hidden input delay — 0 ms, ~220 ms, ~450 ms — held constant all round. So when you tap on MOON, you actually land two or three symbols past it. You are not told this.

After each attempt:
- **Your phone privately** tells you where *you* landed. Only you see it. Over attempts you can learn your own bias — "I aimed at MOON, I got ANCHOR, again."
- **The host TV** shows the multiset of the three landing symbols, unlabeled and sorted — three pips on the wheel, no names, no aim, no delay. The room sees the spread; nobody sees whose is whose.

The result is a two-layer silent negotiation. You must simultaneously correct your own offset and infer which symbol the room is drifting toward, using only anonymous pips. The dead moment where all three pips sit on ANCHOR, KEY and KEY and everyone silently decides who is going to move is the whole game.

Five attempts. Room wins when all three landings are the same symbol.

## Technical approach

Host tab + phone PWAs + authoritative PartyKit room.

The wheel never actually runs on the client as truth. The server owns a monotonic phase clock; clients render `phase(now)` locally. On join, each phone runs a short NTP-style offset handshake (8 pings, take the min-RTT sample) so client render clocks agree to within ~15 ms.

A tap sends `{clientTapTimeMs}`. The server converts to room time, **adds that player's hidden delay**, and snaps to the symbol under the needle at that adjusted moment. Landing is computed server-side and never derived on the phone — otherwise the delay would be visible in the client bundle.

State: `{ phaseEpoch, symbols[12], delays: Record<PlayerId, ms>, attempt, taps: Record<PlayerId, {roomTime, landed}> }`.

The hard part is that the delay must be *indistinguishable from network jitter and from your own bad reflexes*. Real RTT variance on home wifi is 20–80 ms; the smallest injected delay must sit well above that (220 ms) so the signal is learnable, while the wheel must be slow enough (1 rev/s over 12 symbols = 83 ms per symbol) that a 220 ms delay is a clean ~3-symbol offset rather than noise. Getting that ratio right is the tuning problem, and it's the one thing that can't be fixed in the UI.

Secondary hard part: the barrier again — all three taps buffer, host publishes the sorted multiset in one broadcast, private landings go out on the same tick.

## v1 scope

- Exactly 3 players, one round, five attempts
- Fixed delay assignment: 0 / 220 / 450 ms, randomly permuted across players
- Twelve fixed symbols, fixed 1 rev/s sweep
- Host: wheel + three anonymous landing pips + attempt counter
- Phone: wheel, sweeping needle, big tap target, private landing readout
- Win screen that finally reveals each player's hidden delay

## Out of scope

- Variable or drifting delays, more players, scoring, audio ticks, difficulty tiers, reconnect handling, animation polish.

## Risks & unknowns

- If phones are visibly side by side, a neighbor could compare needle positions and spot the lag directly; the sweep speed makes this awkward but not impossible.
- The 450 ms player may find the round simply unwinnable rather than funny — may need to cap at 300 ms.
- Learning your own offset in five attempts might be too hard without a private "aimed vs landed" history strip; v1 should include the last three aims.

## Done means

Three phones join, each gets a different hidden delay, taps resolve to landings on the server, the TV shows three unlabeled pips per attempt while each phone shows only its own landing, and a round where all three landings match ends in a win screen that reveals who was running late.
