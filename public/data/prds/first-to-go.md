## Overview

A one-round game for 4–5 players, TV plus phones. Each phone privately holds four secret items. Speech does not cost points — speech **publishes**. Every three cumulative seconds your own mic hears you, the top item of your pile is read out on the TV forever. You choose the burn order in advance; you do not choose when the fuse advances.

## Problem

Enforced-silence party games punish talking with a scoreboard, which is abstract and never scary. Make the punishment *disclosure of things you picked yourself* and the pressure becomes physical: you can feel your own stack getting shallower while you're mid-sentence, and you shut up mid-word.

## How it works

1. **Deal.** Each phone gets four items — a color, a number, a symbol, a word. One is privately flagged **Fatal**: if it ever reaches the TV you score zero personally, regardless of anything else.
2. **Commit (30s).** You drag the four into burn order. Locked in, never editable. Obviously the Fatal one goes last — but the pile is only four deep.
3. **Demands.** The TV posts three public orders, e.g. *"a number over 30 must be in the record"*, *"two different colors must be in the record"*. Team points only come from satisfying demands, and the only way anything enters the record is someone talking long enough to burn it.
4. **Dirt.** Each phone also privately shows the *category* of one other named player's Fatal item ("Priya's fatal item is a word"). So you can bait Priya into talking — but baiting requires you to talk, which burns yours. Every attack is self-funded.
5. **End (5 min or all demands met).** Score = team demand points, halved for anyone who burned Fatal, plus a bonus for anyone still holding three or more items.

**TV (shared):** the demands, the running public record of leaked items with who leaked them, and a public *depth* meter per player (how many items burned) — depth public, contents private until burned.

**Phone (private):** your ordered pile with a live "next to leak" preview, your speech-seconds accumulator ticking, your Fatal flag, and your one piece of dirt.

## Technical approach

Phone PWA: `getUserMedia` with AGC/NS/AEC disabled, 100 ms RMS frames → WebSocket. Authoritative PartyKit Durable Object holds `{piles[p][], burned[p], speechMs[p], demands, record[]}`; it alone decides burns, so a hostile client cannot stall its own fuse. Host tab renders from broadcast state; per-phone private state goes on a dedicated channel.

**Hard part:** attributing speech in a room where every mic hears everyone. Same competitive normalization as any per-phone VAD game — noise floor and gain fitted per device during a 20 s calibration, softmax across phones per frame, winner-takes-frame above a confidence threshold, nobody-takes-frame below it. Second hard part is *fairness perception*: a burn triggered by a cough or a laugh feels like a bug even when the model is right. Mitigations: a 300 ms minimum voiced run, and a phone-side one-second countdown ring before each burn commits, so the burn is always something you watched coming.

## v1 scope

- 4 players, one 5-minute round, 3 hardcoded demands
- 4 items per phone, drag-to-order commit screen, one Fatal flag
- Fixed 3 s of voiced speech per burn, TV record feed, depth bars
- Flat scoring, printed at the end. No lobby, no avatars, no rematch.

## Out of scope

Demand generation, multi-round play, reconnects, whisper detection, any item semantics beyond string matching against a demand.

## Risks & unknowns

The dominant strategy might be total silence and a zero-zero draw — demand payouts must exceed the hold-three bonus. Four items may be too shallow (or exactly right); this is the tuning question. Dirt may be too weak to drive baiting.

## Done means

One live round, four phones: at least one player burns a Fatal item on the TV to the room's audible delight, at least one demand is satisfied, and at least one player finishes with three items unburned by simply refusing to speak.
