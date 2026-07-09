## Overview
Headway turns a transit system's live vehicle-position feed into a generative ambient soundscape, and quietly records it into a year-long, ever-growing album. For transit nerds, ambient-music fans, and anyone who wants their city's rhythm as background sound.

## Problem
Yamanote.fun is a gorgeous *fixed* composition for one Tokyo line. Nothing lets you sonify your own local system from live data, and — the real gap — nothing captures the *year*: how a February blizzard thins the network, how a marathon Sunday reroutes everything, how weekday rush differs from a holiday. That accreted rhythm is invisible.

## How it works
You choose a transit agency. Each active vehicle becomes a voice: pitch keyed to its line, stereo pan to its position along the route, and overall texture density to how many trains are moving. Rush hour becomes a thick chord; 2am collapses to a lonely drone. A background recorder samples 30 seconds every hour and crossfades the clips into one continuously growing OGG that, by New Year's, is a multi-hour portrait of the year.

## Technical approach
Source: GTFS-Realtime `VehiclePositions` protobuf, polled every 20–30s from a public agency feed (BART, MTA, TfL, etc.), plus the static GTFS bundle for route shapes. Audio via Tone.js / Web Audio in an Electron menubar app so it can run all year. For each vehicle, project lat/lng onto the nearest point of its route `shape` to get a 0..1 position → pan/pitch parameter. Nightly job renders the day's stems and appends via ffmpeg to the master timeline. The hard part is musicality: mapping noisy, bursty real positions to parameters that stay coherent instead of turning into cacophony, and handling feed gaps/overnight silence gracefully (fade to drone, not to dead air).

## v1 scope
- One hardcoded agency
- Live sonification only, 4 voices
- No recording/accretion yet
- Runs in a browser tab

## Out of scope
- Multi-agency mixing UI
- Mobile app
- User-editable instrument mapping

## Risks & unknowns
- Feed rate limits or auth requirements per agency
- Whether the output is actually pleasant vs novelty
- Overnight silence making long stretches boring

## Done means
Opening the app during evening rush produces an audibly denser, busier texture than at 2am, and the stereo panning visibly tracks real trains moving along their lines.
