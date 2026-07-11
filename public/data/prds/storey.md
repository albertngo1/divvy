## Overview
Storey is a 3–4 player cooperative party game built around the phone's barometric pressure sensor — the most underused sensor on modern phones. The shared host screen (TV/laptop) shows a growing skyscraper silhouette; each player's phone is a private altimeter reading its own height above the room's floor. The 'board' is the room's vertical space: floor, couch, chair, countertop.

## Problem
Every sensor party game reaches for compass, mic, or tilt. Nobody uses the barometer, and nobody uses the room's *vertical* dimension. Storey turns crouching and climbing into the entire interface — a physical comedy of people at different heights trying not to collapse the tower.

## How it works
At round start each phone privately zeroes its barometer against a shared 'everyone crouch on the floor' calibration beat (the host counts down; all phones snapshot baseline pressure simultaneously). Each phone is then privately assigned one **storey band** — e.g. 0.0–0.4 m (floor), 0.5–0.9 m (sitting), 1.0–1.4 m (standing), 1.5 m+ (on a chair). Bands are always distinct, so no two players share a height.

PRIVATE (each phone): a single vertical meter with a live 'you are here' marker and a soft target zone; haptic pulse when you enter your band. It never shows anyone else's band.

SHARED (host screen): a skyscraper being assembled floor by floor. Each floor lights only while its owner is inside their band. The tower is complete — and stays lit for a 3-second hold — only when ALL players occupy their distinct bands simultaneously. Because barometers drift and people wobble, the group renegotiates in real time: 'I'm slipping, someone hold steady.'

## Technical approach
Phone PWA reads `barometer`/`RelativePressure` (Generic Sensor API on Android; iOS exposes altitude via a small native shim or falls back to `devicemotion`-integrated height — a documented risk). Host tab + phone clients connect to an authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve).

Data model: `Room { players: [{id, band:[lo,hi], baselinePa, currentAltitudeM, inBand}], holdTimerMs }`. Sync: each phone streams a smoothed altitude (EWMA, ~10 Hz) as delta-from-baseline; server computes `inBand` per player and broadcasts only aggregate floor-lit states to the host, plus per-player private target to each phone. Hard part: barometric noise (~0.1–0.3 m) and slow drift across heterogeneous devices — mitigated by the shared crouch-calibration, wide bands, and a 3 s hold that averages out jitter.

## v1 scope
- 3 players, one round, one 3-floor tower.
- Three fixed bands (floor / sitting / standing).
- Shared crouch calibration + 3 s all-in-band hold to win.
- Host screen = tower with 3 floors; phones = one vertical meter each.

## Out of scope
- iOS parity beyond the fallback, scoring, multiple rounds, 5+ players, animated skylines, difficulty curves that shrink bands.

## Risks & unknowns
- iOS barometer access is the biggest unknown; band resolution may be too coarse if sensor noise exceeds ~0.4 m.
- HVAC/door pressure gusts could shift baselines mid-round (re-calibration beat as mitigation).

## Done means
Three phones calibrate on the floor, players physically settle at three distinct heights, the host tower lights all three floors and holds green for 3 seconds — and passing a single phone between people cannot win because three simultaneous distinct altitudes are required.
