## Overview

Lubber Line is a 3–5 player living-room game where your **whole body is the controller**. To pick an answer you physically turn to face it. The room's 360° is the answer board — but each phone applies a secret rotation to that board, and exactly two players share the same rotation. Find your twin. For groups who like games that make people stand up and stare at each other.

## Problem

Party-game input is thumbs: silent, private, and invisible. Nothing happens in the room. Existing compass games are all "aim your phone at a thing." The itch here is the inversion: make the **input channel physically public** while its **meaning stays private**. Everyone can see which way you're facing; nobody knows what that means. The room becomes a slow, suspicious carousel of people rotating and squinting at each other's shoulders.

## How it works

**Setup (20s).** Everyone stands in a loose circle, phone flat in palm, faces the TV, taps ZERO. Each phone now measures heading relative to the screen (this absorbs magnetic declination and per-device offset). The server privately assigns each player a dial rotation — one of eight 45° multiples — and gives exactly two players the *same* one.

**Host TV (public):** the prompt and 8 options laid out as a compass rose, 12 o'clock = "toward the TV," plus a countdown. That's all. No arrows, no player state, no live readout.

**Phone (private):** a single line of text — the option your body is currently aimed at, under *your* dial. Turn 45° and it changes. There is no list view. You can only see one option at a time, and only by physically facing it. An 800ms dwell requirement and hysteresis stop it flickering between sectors.

**Round (45s).** Turn to your honest pick and hold. Because dials differ, agreement doesn't *look* like agreement — two players who both love option 3 may end up facing opposite walls. Your twin is the person who ends up where you are *when you agree*, so to disambiguate you may need to deliberately pick something unpopular — or face a lie to probe a suspect, which costs you your real answer.

**Lock.** At 0s each phone privately asks: "who is your twin?" The pair scores only if they name each other. Reveal on TV: every final heading, every secret rotation, and what each person was actually selecting.

## Technical approach

Host browser tab + phone PWAs + authoritative WS server (PartyKit / Durable Object, or Socket.IO behind Tailscale Serve over HTTPS — required for sensor permission).

Phones use `DeviceOrientationEvent` (`webkitCompassHeading` on iOS, `absolute:true` + `alpha` on Chrome), gated behind `requestPermission()` on a tap. Sample at 20Hz, low-pass with a circular-mean EMA (average sin/cos, never degrees — 359° and 1° must not average to 180°), send at 10Hz.

Data model: `Room { phase, prompt, options[8], players: { id, name, zeroOffsetDeg, dialRotationDeg (secret), headingDeg, sectorIdx, dwellMs, guessId } }`. Server is authoritative for sector assignment: `sector = floor(wrap(heading − zeroOffset + dialRotation) / 45)`. Phones render only `options[sector]` for themselves; the host renders nothing per-player until reveal.

**The genuinely hard part** is not sync — it's the sensor. Indoor compasses drift 5–15°, and a TV, a radiator, or a laptop will bend the field by tens of degrees within a metre. Mitigations: 45° sectors with ±8° hysteresis, a dwell timer, a mid-round "re-face the TV" re-zero beat, and a server-side sanity check that flags any player whose heading jitters more than 30° while their accelerometer says they're still.

## v1 scope

- 3 players, one prompt, one 45s round.
- Two of the three share a dial; the third is the odd one out.
- 8 options, hardcoded list. One prompt in a JSON file.
- Phone screen: giant option text + a "hold steady" dot. Nothing else.
- One private guess at the end; TV reveal screen.

## Out of scope

Multiple prompts, scoring across rounds, more than one twin pair, decoy rotations, lobby/avatars, reconnect handling, Android/iOS compass calibration UI, any anti-cheat beyond a house rule.

## Risks & unknowns

People can simply tilt their screen toward a neighbour — the leak is social, not technical; v1 relies on a house rule. Compass may be unusable near a large TV or steel-frame furniture; needs a real-room test before anything else. One prompt may not give enough signal for a confident twin guess (50% blind guess with 3 players) — that's fine for v1, since we're testing the *feel*, not the deduction depth. Players may not rotate far enough for the sector to change if they stand rooted.

## Done means

Three phones on one home Wi-Fi, one laptop on a TV. After a 20s zeroing step, each player can turn their body and watch their private option text change reliably at roughly the right angles, with no flicker while holding still for 10s. At lock, all three submit a twin guess, and the TV reveal correctly shows each player's rotation and final selection. One playtest group of three, unprompted, is observed turning in place and asking someone "why are you facing the bookshelf."
