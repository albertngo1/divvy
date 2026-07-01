## Overview
Deadmill is a treadmill-driven horror-escape game for anyone with a smart treadmill or cadence sensor. qdomyos-zwift bridges treadmills into wholesome virtual cycling; Deadmill bridges the exact same live pace data into a pitch-black facility where something is chasing you — and your real running speed is the only thing keeping it back.

## Problem
Treadmill running is monotonous and Zwift is pleasantly boring. Fear is one of the most powerful, least-tapped motivators in exercise. Nobody has weaponized the treadmill's own real-time pace stream against the runner.

## How it works
You're dropped in a procedurally generated dark facility. Your real cadence/speed maps to in-game movement. A stalker's distance behind you is the integral of (its speed − your speed): ease off and it closes, and a breathing/heartbeat audio cue swells as it nears. Occasional "sprint gates" demand a burst above threshold or you're caught — jump-scare, run restarts. Grab keys, reach the exit before your legs quit. Thresholds scale to your own recent pace so the terror is personally calibrated.

## Technical approach
Browser game (Three.js or Babylon.js) so it runs on a tablet propped on the console. Input: Bluetooth FTMS / running cadence via the Web Bluetooth API straight from the treadmill or a footpod; fallback is phone-accelerometer step detection. Entity AI is a simple pursuit model over the distance state; spatialized breathing via the Web Audio API panner. Corridors come from a seeded grid maze (recursive backtracker). Personalization pulls baseline pace from Garmin/Strava to set the chase thresholds, with runs stored locally. The hard part is robust, low-latency treadmill data over Web Bluetooth across flaky device implementations, plus tuning fear against exhaustion so it's genuinely scary yet finishable.

## v1 scope
- One 8-minute maze, one stalker entity
- Web Bluetooth cadence input + keyboard fallback
- Proximity breathing audio
- One jump-scare / sprint gate
- Exit-door win screen

## Out of scope
- Multiplayer co-op
- VR
- Incline/resistance control
- Leaderboards and story mode

## Risks & unknowns
Web Bluetooth device compatibility is fragile and inconsistent. Motion sickness from a screen while running. Safety — the game must never induce a trip; a hard "slow-to-safe" pause is mandatory.

## Done means
With a paired cadence sensor, running faster visibly opens distance on the entity while slowing lets it close and catch you, and reaching the exit within your pace budget triggers a win screen.
