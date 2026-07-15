## Overview
Creep is a 3–4 player party game — a private, desynchronized twist on Grandmother's Footsteps / red-light-green-light. The host TV is a shared racetrack; each phone is a private traffic light plus a motion sensor. Players physically creep across the room toward the TV.

## Problem
Red-light-green-light is a beloved classic, but it needs a caller and everyone shares one signal, so it collapses into reaction-copying: glance at the leader, move when they move, freeze when they freeze. There's no private tension and no reason for anyone to hold a phone.

## How it works
Everyone lines up at the far wall. The host TV shows one lane per player, each with a marker advancing toward a finish line at the screen. Each phone PRIVATELY shows a giant RED or GREEN panel on its OWN randomized cadence — your green might last 4s while your neighbor sits on red — plus a haptic buzz on every change. During your GREEN, walking toward the TV (detected as step-cadence accelerometer motion) advances your marker. During your RED, any acceleration above a jolt threshold means you're 'caught': your phone flashes and buzzes and knocks your marker back a step — and only your phone knows. Because the lights are desynchronized and private, there is no shared freeze to exploit; each player runs their own solo gauntlet. First marker to the finish wins.
The host screen shows only public state: each lane's progress and a flash when someone is caught. It never reveals anyone's light schedule.

## Technical approach
Host browser tab + phone PWAs + authoritative WS server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: Room {players[], phase}; Player {id, name, progress:0..100, lightState, nextFlipAt, caughtCount}. The phone reads DeviceMotion accelerationIncludingGravity, high-pass filters to motion magnitude, and classifies step cadence (peak counting) versus a single jolt spike. Each phone authoritatively runs its own light timer (seeded per player so the server can audit via replay) and its own motion classifier, emitting {progressDelta} or {caught} at ~5Hz; the server integrates and broadcasts lane progress to the host. Sync strategy: the phone is source of truth for its own motion and light (no per-step round trip), the server reconciles and blocks cheating by replaying the seeded schedule. Hard part: reliable step-vs-jolt classification across device models, iOS's requestPermission gesture for DeviceMotion, and thresholds so breathing-while-still doesn't read as 'caught.'

## v1 scope
- 3–4 players, one race, ~75 seconds.
- One hand-tuned accelerometer motion threshold.
- Private red/green panels with haptics; progress bars on the TV.
- Caught = knockback; first to finish wins.

## Out of scope
- Anti-cheat beyond seeded replay; direction sensing (players honor 'walk toward the TV').
- Multiple rounds, power-ups, teams.

## Risks & unknowns
- Per-phone iOS DeviceMotion permission gesture.
- Threshold fairness across phone models; hand vs pocket.
- Players gaming the classifier with rhythmic shaking.

## Done means
Three phones run their own desynchronized lights; a player who walks on green advances and one who twitches on red is knocked back, all reflected on the TV within ~300ms, and a full race completes with a clear winner.
