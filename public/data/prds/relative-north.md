## Overview
Relative North is a 4-player cooperative room game for a living room with furniture in it. One player (the Pivot) plants their feet in the middle of the room and holds their phone flat; it becomes the only compass in existence. The other three (Runners) each privately hold a single bearing — a direction in a coordinate frame that only the Pivot's phone can read — and must physically end up standing in that direction, using nothing but the Pivot's narrated sweep.

## Problem
Compass party games almost always reduce to 'point your phone at the thing and hold.' That makes the phone a solitary hot/cold meter and makes cross-device magnetometer disagreement the central engineering headache. The itch: a room game where a heading is a scarce public utterance rather than a private readout, where the instrument is a person, and where the comedy comes from three people wanting the same instrument aimed three different ways at once.

## How it works
Setup (15s): the Pivot faces the TV and taps ZERO. That heading becomes 0 degrees — an arbitrary north nobody else can perceive.

Round (90s): each Runner's phone privately shows one number, e.g. 182, and the rule NEVER SAY YOUR NUMBER. The Pivot's phone privately shows a live heading in the zeroed frame and nothing else. The Pivot rotates slowly in place, reading aloud: 'one-forty... one-fifty... one-sixty...' Runners may only shout MINE, SLOWER, or BACK. When a Runner hears their number, they sight down the Pivot's outstretched arm and walk that way until they hit furniture or wall, then plant themselves. Three Runners need three bearings, the Pivot can only face one way at a time, and everyone is yelling.

Scoring (20s): the TV prompts the Pivot to aim at each Runner in turn and hold 1s. The server compares the captured bearing to that Runner's secret target. The TV shows three needles and a pass band of plus/minus 12 degrees.

Crucially the shared TV NEVER shows the live heading — only a phase banner, timer, and an abstract sweep animation. If the TV showed the number, the Pivot's voice would be redundant and the game would evaporate.

## Technical approach
Host browser tab plus phone PWAs over HTTPS (Tailscale Serve), authoritative PartyKit / Durable Object per room. Heading comes from webkitCompassHeading on iOS (gated behind DeviceOrientationEvent.requestPermission on a tap) and deviceorientationabsolute alpha elsewhere. Only the Pivot's phone streams heading, at 20Hz, as rel = (heading - heading0 + 360) % 360. Server state: {phase, pivotId, targets: {playerId: bearing}, capture: {playerId: bearing}}. Runner phones are pure private-card renderers plus three shout buttons.

Because every bearing in the game originates from one device, inter-phone calibration is a non-problem — the elegant trick. The genuinely hard parts are (a) magnetometer drift and hard-iron distortion near a TV and speakers over a 2-minute round, handled by a re-zero facing the TV before scoring and linear drift interpolation across the round, and (b) a stable 1s capture: median of the 20 samples in the hold window, rejected and retried if the interquartile spread exceeds 8 degrees.

## v1 scope
- Exactly 4 players, 1 Pivot, 1 round, no lobby beyond a 4-letter room code
- Bearings drawn as 3 random values separated by at least 60 degrees
- Three shout buttons, no chat, no text entry
- Pass/fail per Runner, no cumulative score

## Out of scope
- Distance or step counts; direction only
- Rotating the Pivot role, multiple rounds, sabotage roles
- Android/iOS heading normalization beyond the two code paths above
- Any room mapping or floor plan

## Risks & unknowns
- Phones with weak or uncalibrated magnetometers may need the figure-8 wave; needs an onboarding nudge
- The Pivot moving their feet ruins parallax; enforced socially in v1
- 12-degree pass band may be too tight in a small room where 12 degrees is one sofa cushion

## Done means
Four phones join by code; the Pivot zeroes; three Runners each receive a distinct hidden bearing; the Pivot's narration alone gets all three standing in different parts of the room; the aim-and-hold scoring pass produces three bearings whose error versus target is displayed on the TV, and a rerun with the Pivot deliberately misreading numbers produces failures.
