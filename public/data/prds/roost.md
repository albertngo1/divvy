## Overview
Roost is a tiny virtual creature — menubar app or e-paper widget — whose wellbeing tracks your **Sleep Regularity Index (SRI)**, a published metric of how consistent your sleep/wake timing is night to night. It's for anyone who's tried a dozen sleep trackers that only nag about duration.

## Problem
The 2023 finding making the HN rounds: sleep *regularity* predicts mortality risk more strongly than sleep *duration*. Yet every consumer sleep app optimizes hours-in-bed and shames you for a short night. Nothing rewards the actually-protective behavior: going to bed and waking at the same time. Roost inverts the incentive, and does it as an ambient companion (a la Weathergotchi) rather than another dashboard you'll never open.

## How it works
- Each morning Roost pulls last night's sleep/wake timestamps and recomputes a rolling SRI over the trailing window.
- The pet's mood/health is a function of SRI *variance*, not total sleep: hit the same times → it perks up, feathers smooth, forages; drift your schedule → it gets ragged and sleepy-eyed.
- A short late night that keeps your *timing* consistent barely dents it; a wildly shifted bedtime — even a long one — hurts. This is the whole point.
- Gentle nudges: 'Roost gets restless around 10:40pm' rather than 'you need 8 hours.'
- A year-long strip shows the pet's mood band, quietly accreting into a regularity keepsake.

## Technical approach
Data source: Garmin Connect (already available via the Garmin MCP on this homelab) for per-night sleep start/end; Apple Health / Fitbit as alternates. Compute SRI as the standard formula — probability that any two points 24h apart are in the same state (asleep/awake), scaled 0–100 — over a 7–14 night window. Stack: a small Python daemon (cron nightly) writing SQLite; renderer is either a SwiftUI menubar item or an e-paper sprite sheet for a Pi/ESP32. Data model: `Night` (start, end, source), `SRI` (date, value, window), `PetState` (mood, streak). Pet art is a handful of frames blended by mood scalar. Hard part: mapping a statistical index to a *legible, fair* creature reaction — it must feel earned, not random, and handle missing nights gracefully (travel, no-wear) without unfair punishment.

## v1 scope
- Garmin-only ingest, nightly cron
- SRI over 7-night window, single 0–100 number
- 4 pet moods, menubar sprite + tooltip with next 'roost time'
- Local SQLite, no account

## Out of scope
- Multi-device merge, phone app, social/leaderboards
- Coaching plans or alarms
- Cloud sync

## Risks & unknowns
- Missing-night handling could make SRI jumpy and the pet feel unfair.
- Is a single index legible enough, or do users need the underlying 'you drifted 90 min' explanation?
- Charm ceiling: does anyone bond with a regularity pet vs. a cute-but-dumb tamagotchi?

## Done means
Given two weeks of real Garmin nights, Roost computes an SRI matching a reference implementation within ±2 points, and its pet visibly perks up on a fabricated week of consistent times and visibly sags on a week of same-duration-but-scattered times.
