## Overview
A 3–4 player cooperative game where the room's ambient volume is a shared, contested resource. Some players' private tasks require yelling; others require the room to stay under a noise threshold for several unbroken seconds. Nobody can see anyone else's tasks, so the room must verbally negotiate when to be loud — and the negotiation costs noise.

## Problem
Every voice party game treats speech as free and unlimited: more shouting is always better. That flattens the fun into pure volume. The unexplored axis is speech as a **budget** — where the interesting decision is when *not* to talk, and where asking for quiet is self-defeating. Devils & the Details gets close with chore chaos, but noise is never the currency.

## How it works
**Host TV:** a large live NOISE METER driven by the host laptop's mic (single mic, so no cross-device audio sync), a QUIET LINE threshold, a shared job board showing only anonymous job pips (done / in progress / failed), and a mission clock.

**Each phone privately shows** two jobs drawn from two families:
- **LOUD jobs** — a call-and-response: your screen shows a phrase you must shout and a target you must get another named player to shout back. Both players tap CONFIRM; the server also requires the meter to have crossed a *high* line during the exchange, so whispering it doesn't count.
- **QUIET jobs** — a hold-to-charge bar that fills only while the room meter sits under the quiet line, and resets to zero on any spike. Your phone shows the bar and the seconds remaining; nobody else can see that you're mid-charge.

So the emergent play is scheduling: you have to tell the room "I need eight seconds" — which spends noise — and people invent hand signals, exaggerated mouthing, and phone-waving because the cheapest coordination is the silent kind. A LOUD job holder sitting on a 20-second deadline while someone else is at 6/8 seconds of charge is the whole game.

## Technical approach
PartyKit / Durable Object room; host tab and phone PWAs over WebSocket. The host tab runs Web Audio `AnalyserNode` on `getUserMedia`, computes RMS→dBFS at ~20Hz, and publishes a smoothed level to the server, which is authoritative for the quiet/loud thresholds and for charge accrual (`charge += dt` only while `level < quietLine`). Phones render their bars from server ticks at 10Hz, interpolating locally.

The hard part is **calibration**, not sync: rooms vary wildly in baseline noise, mic gain, and laptop placement. v1 opens with a 5-second CALIBRATE step ("everyone be quiet") to set the floor, then sets quietLine = floor + 6 dB and loudLine = floor + 20 dB. Second hard part: preventing a single cough from being unfairly fatal — a 250ms debounce before a spike breaks a charge.

## v1 scope
- 3 players, one 3-minute round, host-mic only.
- Two job types, four hand-authored jobs each.
- Calibration step, meter, charge bars, win/lose screen.
- Room code join; no reconnect, no scores across rounds.

## Out of scope
Per-phone mics; voice detection of *who* is speaking; sabotage/traitor roles; difficulty tiers; more than 4 players.

## Risks & unknowns
Does it degenerate into everyone silently staring? Mitigation: LOUD job deadlines are short enough that silence is never a stable equilibrium. Also unknown: whether laptop mics in a real room have enough dynamic range for a meaningful quiet line.

## Done means
Three phones, one laptop, real living room: a round where a quiet job completes only after the room deliberately organizes a silence window, and at least one charge bar is broken by someone shouting a loud job.
