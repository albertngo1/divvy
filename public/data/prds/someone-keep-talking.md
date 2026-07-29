## Overview

Someone Keep Talking is a 3-player cooperative panic game on a TV plus phone controllers. Two relief valves in a failing plant are held open by continuous human voicing — literally, your phone's mic. Only the one player *not* holding a valve may touch a control. For groups who want a Spaceteam-shaped game whose difficulty is physical rather than informational.

## Problem

Voice party games treat speech as a message channel: content matters, continuity doesn't. Nobody has made the *act* of speaking a load-bearing resource — where the cost isn't what you say, it's that you cannot stop, cannot think, cannot pause to read, and cannot hand your obligation off without an overlap.

## How it works

Each phone is in exactly one of two private modes and shows nothing of the other:

- **VALVE mode**: a pressure gauge, a HOLD pad, and any instruction cards dealt to you.
- **PANEL mode**: a 9-control grid you can actually tap. Your cards go dark.

A valve stays open while its phone reports HOLD pressed *and* near-field voicing. An 800 ms gap slams it: pressure spike, one strike, three strikes ends the round. Two of three phones must be in valve mode at all times, so exactly one operator exists. Swapping requires an overlap — the incoming holder must be voicing for 500 ms before the outgoing releases — so handoffs are negotiated out loud while both people are already talking.

The TV shows the fault, a step counter 1–5 with every unrevealed step redacted ("STEP 3: ▮▮▮▮▮"), the pressure gauge, strikes, and a live voice bar per valve so the room can watch someone about to run out of breath. It never shows card text.

When step N unlocks, its full instruction card is dealt privately to a random *valve-holding* phone — never the operator's. The only path to knowing step 3 is for someone mid-sustain to read it aloud, accurately, without pausing. Two of the five steps are keyed to a specific phone's panel, forcing a specific person to become the operator and dumping their valve on someone else.

## Technical approach

One Durable Object per room. Phones send 100 ms RMS frames (no audio uploaded, no ASR — content is irrelevant). Server computes `margin = ownRMS − max(peerRMS)` and requires HOLD plus margin > 8 dB against a per-phone threshold captured in a 5 s lobby calibration (speak / stay silent).

Hard part one is cross-talk: a valve holder standing beside a shouter reads as voicing. The relative-margin test plus phone-to-mouth discipline is the mitigation, and it may not survive a genuinely loud room. Hard part two is slam adjudication under jitter: slams are evaluated on server time from client-timestamped, RTT-offset frames, and a slam only fires when a frame arriving ≥800 ms after the last good one confirms silence — total frame absence is a disconnect and pauses the round instead. Card dealing holds until at least one valve phone is actively voicing.

## v1 scope

- Exactly 3 players, 2 valves, one hand-authored 5-step fault, 4-minute cap
- 3 strikes, one win/lose screen, fixed room code
- Energy-only detection; no speech recognition anywhere
- Identical panels except two phone-keyed controls

## Out of scope

- 4+ players, multiple faults, difficulty scaling
- Anti-cheat against playing music into the mic (v2: voicedness/spectral-flatness check)
- Reconnect beyond a hard pause, scoring, leaderboards

## Risks & unknowns

- Real vocal fatigue — 4 minutes is the safety cap, not a design choice
- iOS PWA mic permission and background audio suspension
- If near-field discrimination fails, the fallback is HOLD-only on the honor system, which loses half the point

## Done means

Three players in one room complete all five steps with three or fewer slams; on video review every slam corresponds to an actually audible pause; and at least one overlap handoff ("I've got it — go") happens spontaneously without a rules prompt.
