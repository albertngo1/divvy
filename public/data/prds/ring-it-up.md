## Overview

A 3-4 player, one-round pressure cooker for a living room with a TV and a lot of nervous energy. Every phone privately grows a meter that fills **only while the room is silent**. Cashing that meter in requires your phone to play a loud till-chime at full volume — a noise every mic in the room hears, which resets the room's silence streak and detonates everyone else's unbanked progress. Greed is audible. Everyone hears exactly who did it, and nobody can complain, because complaining is talking, and talking is also a reset.

## Problem

Silence games usually meter *your* talking against *your* score, which is a solo discipline test with an audience. The itch is a silence game where quiet is a genuine commons — where the tension isn't "can I shut up" but "can I shut up while somebody else is about to ruin it, and I can't ask them not to."

## How it works

The host TV shows exactly three things: a SILENCE STREAK clock counting up, a ROOM BONUS ladder (reach 60s unbroken and every player's next bank doubles), and an anonymous burst animation whenever *somebody* rings. No names, no meters, no scores until the end.

Each phone privately shows: your own meter, your own secret **rate card**, your banked total, a big RING button, and one **Hush** token. Rate cards are asymmetric and hidden — e.g. *Fast*: fills in 8s, caps at 6 points and spills over (wasted) after; *Slow*: fills in 45s, caps at 40. The fast player is structurally forced to ring every ten seconds or throw points away, which repeatedly guillotines the slow player's long climb. Hush banks your meter silently, once per round.

Any sound above the calibrated floor — speech, laughter, a chair, a chime — zeroes the streak and every unbanked meter. Four minutes, then highest banked total wins. Unbanked is worth nothing.

## Technical approach

Host tab + phone PWAs + one authoritative PartyKit / Durable Object room. Each phone runs an AudioWorklet computing A-weighted RMS with a voicing gate; **raw audio never leaves the device**. Phones emit only `onset{t, level}` events at ~20 Hz when they cross their lobby-calibrated noise floor. Server state: `{streakStartMs, players: {id, rateCard, meterStartMs, banked, hushUsed}}`. Meters are never streamed — they're derived from `now - meterStartMs` against the rate card, so the phone renders locally and the server recomputes on bank.

The hard part is *reset consistency*. A ring must zero everyone at the same instant despite 30-80 ms of jitter: onsets carry a client timestamp corrected by a periodic ping-based clock offset, and the server applies resets at event time, not arrival time. Also non-trivial: a ringing phone hears its own chime, so the ringer's mic is gated for 900 ms and the server dedupes the resulting onset storm from other phones into a single reset event.

## v1 scope

- 3 players, one 3-minute round
- Two rate cards only (Fast/low-cap, Slow/high-cap), dealt at random
- One Hush token each
- TV: streak clock, ring burst, final scores
- 10-second lobby noise-floor calibration

## Out of scope

Multiple rounds, more rate cards, speaker attribution, sabotage items, reconnect handling, any leaderboard.

## Risks & unknowns

Room acoustics may make a phone chime inaudible to a phone in a pocket. Constant laughter could make the streak never move — the ladder may need to be 30s, tuned live. The Fast player may feel purely victimized rather than deliciously villainous.

## Done means

Three phones in one room: a chime on phone A zeroes phones B and C's meters within 150 ms of each other, the streak survives 60 seconds of genuine silence and awards the doubler, and one honest playtest ends with at least one person laughing hard enough to break their own streak.
