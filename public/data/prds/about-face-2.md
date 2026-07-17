## Overview
About Face is a 3-4 player eyes-closed party game where your own body is a compass needle and the room's 360° is the board. Each player is given a secret compass heading. With eyes shut, holding the phone flat against the chest, you rotate your whole body in place; the phone guides you purely by haptics — buzz pulses get faster as you near your heading, then lock to a steady hum when you're on it. Every player has a DIFFERENT secret heading. When all of you hold your headings at once, the host reveals you've blindly arranged yourselves into a starburst.

## Problem
Compass games usually put an arrow on screen and let you watch it. That kills the magic. The itch: what if you had to find a direction you can't see, with your eyes closed, guided by nothing but a private tremor in your hand — and the delight is opening your eyes to discover the group formed a shape none of you could perceive while making it.

## How it works
Setup: everyone faces the TV to zero their compass (kills per-device offset). Host TV shows a title, a countdown, and 3-4 anonymized lock dots.
Each phone PRIVATELY does everything by feel: it holds your secret heading (e.g. 40°, 160°, 280° — evenly spread so bodies point outward) and drives the Vibration API. Far from target: slow single pulses. Getting warmer: pulses speed up. On heading (within ±8°): continuous hum. The SCREEN is dark/unused because eyes are closed — the private channel is haptic, not visual. Hold your heading steady for 3 seconds → your lock dot greens on the TV. All locked simultaneously (with a shared 2s overlap window) = win, and the TV animates the pinwheel the group unknowingly formed.
Load-bearing per-phone: each blind player needs their OWN continuous private haptic guide to their OWN distinct heading, in parallel. One phone passed around can guide exactly one blind spinner at a time; the simultaneous-distinct-headings-by-touch mechanic collapses instantly without a phone per player.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Sensor: deviceorientation `alpha` (webkitCompassHeading on iOS) sampled ~15 Hz locally; haptic logic runs ON the phone for zero latency (Vibration API pulse intervals mapped to angular error). Data model: Room{phase}, Player{id, targetHeading, lastError, locked}. Sync: phones send only lock/unlock state transitions and a coarse error value to the server; server enforces the 3s hold and the all-overlap win. Genuinely hard part: compass reliability and drift across cheap Android devices, plus iOS requiring a user gesture + permission prompt for both DeviceOrientation and Vibration — handled by the mandatory 'face the TV to calibrate' gesture that both unlocks sensors and zeroes heading. Magnetic interference (metal furniture, the TV itself) is a real threat; mitigate by using relative-to-calibration headings and generous ±8° lock bands.

## v1 scope
- 3 players, one round, three evenly-spread fixed headings.
- Face-TV calibration + permission unlock in one gesture.
- Haptic-only guidance (slow→fast→solid); dark phone screen.
- 3s hold, 2s simultaneous-overlap win check, pinwheel reveal.

## Out of scope
- Vibration on iOS Safari fallback (may need a soft audio-tick alternative) — v1 targets devices with Vibration API.
- Scoring, multiple rounds, custom shapes.
- Any on-screen arrow (defeats the point).

## Risks & unknowns
- iOS Vibration API support is limited; audio-click fallback may be needed and changes the feel.
- Compass drift/interference indoors could make locks flaky.
- Motion sickness / bumping into furniture with eyes closed — needs a 'clear a space' prompt.

## Done means
Three phones, eyes closed: each player, guided only by escalating buzzes, independently settles onto a different heading, all three lock within one overlap window, the TV reveals a clean three-way pinwheel, and demonstrating with a single shared phone shows you can only ever guide one spinner at a time.
