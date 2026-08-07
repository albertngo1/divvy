## Overview

A cooperative listening game for 3–6 people in one room. The shared screen plays a 30-second bed of ambient "wild track" audio with a single faint anomaly hidden inside it. Every phone privately holds a *different* question about that anomaly. Nobody can hear the anomaly while anyone is talking — not as a scored penalty, but because the host tab mutes playback whenever the measured room level crosses a threshold. Silence is not a rule; it is the price of admission to the evidence.

## Problem

Party games about listening always lose to the room: someone narrates, someone laughs, the audio is decoration. And "be quiet" penalties feel like a nagging referee. This makes the quiet self-enforcing — the game withholds the thing you want the moment you open your mouth — and then makes silence *hard* by giving each player information the others need.

## How it works

1. Host screen: a level meter, a loop counter ("loops burned: 3"), and player avatars. It never displays anyone's question or answer options.
2. Playback gate: the host tab's mic computes short-window RMS. Under the threshold, the bed plays. Over it, audio cuts instantly, a red bar sweeps the screen, and that loop is voided and restarted.
3. Private on each phone: one assigned question and three options. Player A gets "which direction did it come from?" (L / center / R). Player B gets "how many times?" (1 / 2 / 3). Player C gets "what was underneath it?" (a hum / a tick / a voice). Phones never play audio — they are display and input only.
4. The sanctioned channel: five glyph buttons per phone (✓ ✗ ? ← →). Pressing one flashes it next to your avatar on the TV. That is the entire bandwidth for coordinating which loop to spend on what.
5. After three clean loops, phones lock in answers. Score = correct answers minus loops burned.

## Technical approach

Host browser tab + phone PWAs + a PartyKit Durable Object as authority. Room state: `{phase, loopIndex, cleanLoops, burned, players:{id, questionId, answer, glyph}}`. Audio lives entirely in the host tab (single decoded buffer, WebAudio gain node) so there is no cross-device audio sync problem at all — the hard sync is only *state*, which is coarse.

The genuinely hard part is the gate: `getUserMedia` → AnalyserNode → RMS at ~20 Hz, with the host's own playback subtracted. Since the host both plays and listens, naive gating self-triggers. Fix: calibrate a 3-second silent baseline at start, use an adaptive floor (rolling median + fixed offset in dB), and duck the gate's sensitivity by the known playback gain. Glyph presses round-trip in <150 ms over WebSocket, which is fine — they are punctuation, not gameplay timing.

## v1 scope

- One audio bed, one hidden anomaly, three hardcoded questions.
- 3–4 players, no lobby art, join by 4-letter code.
- Five glyphs, no chat, no text entry.
- Three clean loops then lock; one score screen.

## Out of scope

Multiple rounds, generated audio, per-phone filters, spectator mode, calibration UI, accounts.

## Risks & unknowns

Room acoustics vary wildly — the threshold may need a visible slider. Laptop speakers may not reproduce a −40 dBFS anomaly at all; the bed may need mastering to a narrower dynamic range. Hearing-impaired players are structurally excluded from the answer, though not from the glyph negotiation. Glyphs may collapse into meaningless spam rather than an emergent language.

## Done means

Four phones join by code, each shows a different question, the TV bed plays, one person says "wait, what?" out loud and audio cuts within 200 ms with the loop counter incrementing — and after three clean loops the score screen shows per-question correctness and loops burned.
