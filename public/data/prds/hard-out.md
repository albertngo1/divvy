## Overview

A 4-player game built on top of three minutes of audio the room would otherwise half-listen to — a podcast segment, a talk-radio interview, an oral history clip. Everyone hears the same thing. Everyone is listening for something different, and nobody knows what anyone else is listening for.

## Problem

Background audio is the most passively consumed thing at any gathering. Prediction games about it usually fail because they demand you look at a screen, which kills the listening. This one wants your ears on the room and one thumb on a button.

## How it works

**Each phone (private):** one secret **trigger** — "the first laugh," "the first time they talk over each other," "the first sponsor mention," "the first time someone says a year," "the first pause longer than three seconds." Below it: your stake, starting at 100 and ticking down 1/second from clip start. Below that: one big **HARD OUT** button.

You bank your current value only if you press *before* your trigger fires. Press after, you take zero.

**Host TV:** waveform + playhead, elapsed clock, and a public exit ticker — name and timestamp, each time someone bails. Nothing about anyone's trigger.

The ticker is the game. Dana bailing at 0:12 means her trigger is imminent — and two of the four players are secretly dealt the *same* trigger, so there is a real chance she just heard yours coming. Riding to 2:40 for 20 points looks brave until you learn everyone else banked at 0:40 for a reason. You may not speak about your trigger, but groaning is legal.

**Reveal:** the host replays each trigger's true moment with the waveform scrubbed to it, so the room hears exactly how close each bail was.

## Technical approach

Socket.IO over Tailscale Serve; server authoritative. Model: `Room{code, clipId, startTs, phase}`, `Player{id, triggerId, bankedAtPlayheadMs, score}`, `Trigger{id, text, trueFireMs}` from a **hand-annotated table baked into the clip asset**.

Only the host plays audio, so there is exactly one clock. Host emits playhead ticks at 10Hz with server timestamps; phones extrapolate locally for the countdown display, but the server independently recomputes the playhead at press time and that number is the one that counts. **The hard part is press-latency fairness:** phone→server RTT plus tick granularity gives ~150ms of fuzz, so annotations carry a 400ms grace band and the comparison fails *open* — a press within the band is safe. Losing to network jitter would be unforgivable; losing to nerve is the point.

## v1 scope

- 4 players, one bundled 3-minute clip, one round
- 5 hand-annotated triggers, exactly one duplicated across two players
- Linear 1pt/sec decay, single press, no undo
- Host waveform + exit ticker + scrubbed reveal

## Out of scope

User-uploaded audio, automatic trigger detection (ASR/diarization), multiple rounds, betting against other players' exits, live radio.

## Risks & unknowns

Annotation is manual and doesn't scale — v1 dodges this, v2 can't. A clip where all triggers cluster early collapses to a coin flip. Untested whether the exit ticker generates enough tension for people who bailed at 0:15 and now have nothing to do for 2:45 (mitigation: they still get to watch others sweat).

## Done means

Four phones join, each shows a different trigger text (with one deliberate duplicate), stakes decay in visible lockstep, the host ticker posts exits within 300ms of the press, and the final reveal scrub lands within 400ms of each annotated moment.
