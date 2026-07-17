## Overview
Updraft is a 3-player cooperative flight game: one balloon, one foggy canyon on the host TV, and three phones that each drive a single thruster with the player's voice. For groups who want continuous real-time voice control instead of discrete shout-and-tap.

## Problem
Voice party games almost always reduce voice to a trigger — a shout, a keyword, a moment of timing. Sustained, continuous voice-as-control is nearly unused, and it creates a delicious tension: if your voice is your throttle, then every second you spend *warning* a teammate is a second you aren't *flying*. Updraft builds the whole game on that conflict.

## How it works
Host screen (shared): the balloon, the scrolling canyon, a hull bar (3 hits = crash), distance-to-goal — but hazards are hidden under FOG. The TV alone can't be flown from.

Each phone PRIVATELY shows two things: (1) YOUR THRUSTER — a hold-to-hum control (P1 = altitude, P2 = left push, P3 = right push); while you hold the button and sustain a tone, mic amplitude drives thrust, release lets it drift; (2) YOUR RADAR — a strip revealing upcoming hazards of ONE layer only (spikes / left-wall snags / right-wall snags), assigned so you almost never control the axis needed to dodge what you can see. So the person who spots the spike must shout "DROP NOW" to the altitude player — who has to stop humming (stop climbing) to answer clearly. Voice is engine and comms on the same breath.

Per-phone is load-bearing: three simultaneous continuous controls plus three disjoint private hazard views. One passed phone can't hum three thrusters or hold three radars at once.

## Technical approach
Host + phone PWAs + authoritative WS server running the physics sim (~20Hz tick): it integrates the three throttle inputs, moves the balloon, checks collisions against a canyon + hazard map deterministically generated from a seed, and broadcasts snapshots. Phones send a continuous throttle value (0-1 from mic amplitude while button held, sampled ~10Hz) and render their private radar from the shared seed. Host interpolates snapshots for smooth 60fps. Data model: Room{seed, phase, balloon{x,y,vx,vy,hull}, t}; Player{axis, layer, throttle}. The hard part: mic-amplitude→throttle that feels responsive under 80-150ms round-trip, forgiving physics, and a canyon authored so the seeing player never controls the dodging axis — forcing cross-talk.

## v1 scope
- Exactly 3 players, one ~45s canyon run, one fixed seed.
- Amplitude-based throttle (NOT pitch — more robust), button-gated.
- 3-hit hull; reach the end = win; per-phone one-tap calibration for baseline loudness.

## Out of scope
- Pitch-based control; variable player counts; multiple canyons or difficulty tiers; fancy audio permission handling beyond one prompt.

## Risks & unknowns
- Mic amplitude varies wildly by phone and room noise — calibration tap may not be enough.
- Cross-talk/room roar could bleed into throttle (button-gating helps).
- Latency can make steering feel mushy.
- Players may just spam max volume — hazards must punish overshoot to force restraint.

## Done means
Three phones join, each gets a distinct thruster + a distinct private hazard layer, the host renders one balloon steered solely by their combined voice throttles, and a playtest confirms the run is winnable with coordinated warnings but reliably crashes when players stay silent.
