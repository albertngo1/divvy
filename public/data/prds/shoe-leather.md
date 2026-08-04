## Overview

A 4-player co-op round for people standing in one room. The TV posts five errands that reference real furniture. Every phone silently meters its own holder's physical motion against a private, unlabeled budget — and the budgets are secretly up to 3× different. When yours hits zero your phone goes dark and any errand still needing it is dead. 100 seconds.

## Problem

Every motion-sensor party game treats movement as free and infinite, so the game becomes "flail harder." Making motion a *scarce, private, unverifiable currency* flips it: the interesting question stops being who can move and becomes who should, and whether the person insisting they're fine actually is. The accelerometer is the auditor nobody can argue with.

## How it works

Each phone accumulates "wear" = the time-integral of |‖a‖ − g| above a small deadband, sampled from `devicemotion` at ~60 Hz. Walking costs. Gesticulating while explaining your plan costs about as much — which is the cruelest and funniest part.

Private on your phone: an unlabeled fuel gauge (a shrinking column, no numbers, no units, no scale) and one **CLAIM** button. Nothing else.

Public on the TV: the five errands ("touch the front door," "two phones within arm's reach of the couch, together," "put a phone flat on the floor for 3 seconds"), a 100-second clock, and a single **aggregate** fuel bar summing all four budgets. The room can see the team is running dry; nobody can see whose tank it is. So negotiation runs on claims, and claims can't be checked.

An errand completes when the claiming phone is held still (below the deadband) for 2 seconds and CLAIM is pressed — verification is social, because everyone is standing right there watching.

Because budgets are asymmetric and unlabeled, no one has a reference frame: the player who feels rich may be the poorest. Dying quiet, unspent players are the team's real reserve, and the whole game is getting them to admit it.

## Technical approach

Phone PWA: `DeviceMotionEvent.requestPermission()` behind a join tap (iOS requires it), `wakeLock` to keep sampling alive, integrate locally, push `{wear, still}` at 5 Hz over WebSocket.

Durable Object holds `{roomId, t0, players:{id: {budget, wear, alive}}, errands:[{id, text, claimedBy}]}`. The server is authoritative: it decides death, claim validity, and the aggregate bar. Phones can only report; they never see another player's number.

The hard part is calibration, not sync. Raw accelerometer noise floors differ per device (and a phone in a loose pocket reads wildly high), so v1 forces phones in hand and runs a 4-second "everyone hold still" pass to set a per-device deadband at noise-floor × 1.5. Second hazard: mobile browsers throttle `devicemotion` when the screen dims — hence wake lock plus a visible "screen stays on" gate before start.

## v1 scope

- 4 players, one 100-second round, one fixed errand list, hardcoded room nouns
- Budgets drawn from a fixed set {1.0×, 1.4×, 2.2×, 3.0×}, assigned at random
- Death = phone goes black with one word: STALLED
- TV shows errands, clock, aggregate bar. No per-player anything
- Win/lose only — no points, no rematch flow

## Out of scope

Refueling or resting mechanics, per-errand costs, traitor roles, sensor-verified location proof, pocket/bag carry, multi-round campaigns, custom errand editing.

## Risks & unknowns

A claim is trust-based and cheatable — acceptable in a co-op game where the room is watching, but it caps this at friends-only. The wear metric may not discriminate well: if crossing the room costs the same as one emphatic hand gesture the tension flattens, so the deadband and integration constant need real tuning on 3–4 handset models. Android sample rates vary and may need normalization by actual delta-t rather than assumed 60 Hz.

## Done means

Four phones join, calibrate, and show a full gauge. Walking the length of the room visibly drains the gauge; standing still does not drain it at all for 30 seconds. One player's phone reaches zero and goes STALLED mid-round while the TV's aggregate bar drops correspondingly with no indication of who died — and the other three can be observed arguing about whose tank it was.
