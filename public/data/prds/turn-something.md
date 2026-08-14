## Overview

A co-op crisis game for 3–5 players, one TV, one phone each. Spaceteam with the labels torn off and the wiring scrambled: the round is a live, verbal, controlled experiment. For groups who like the moment a room stops flailing and starts saying "okay — everybody stop. Priya, turn one thing."

## Problem

Every panel-shouting game hands you a labelled verb and asks you to route it to the right person. That's addressing, not coordination. Nothing makes a party room *discover* a causal map together under a clock, which is what actual emergencies feel like — and which is impossible alone because the evidence is scattered across bodies.

## How it works

Each phone privately shows: three unlabelled actuators (A/B/C, big, tap-to-nudge) and two named gauges with needles (e.g. COOLANT, CABIN). Every actuator is secretly wired to exactly one gauge — **never one of your own**. Wiring is reshuffled each game. Direction (up/down) is also secret.

The TV shows only the emergency: **CABIN PRESSURE FALLING — GET IT BACK IN THE GREEN**, plus a 60s hull timer and a coarse room-wide health bar. It never names a control, never shows a gauge, never says who is wired to whom.

Because your knobs never move your own needles, no single player can learn anything: every fact requires one mouth to announce an action and another mouth to report the result. The optimal play is a protocol the room invents in real time — one person acts at a time, everyone else watches and calls out. Panic play is everyone mashing, all gauges swinging, and nothing learnable.

The twist that keeps it from being pure science: two of the actuators are also *drifting* the target the wrong way if left untouched past 20s, so pure careful serial testing loses too. You must start acting on a half-built map.

Private per phone: your three actuators, your two gauges, your nudge cooldown (1.5s). Shared on TV: the objective, the timer, and — the only public signal — a single "SOMETHING MOVED" pulse whenever any gauge in the room changes, which tells you an experiment happened but not whose or where.

## Technical approach

Host tab + phone PWAs + authoritative room server (PartyKit / Durable Object; Socket.IO over Tailscale Serve locally). Model: `Wiring{actuatorId -> {gaugeId, sign, magnitude}}`, `GaugeState{value, drift}`, `Nudge{playerId, actuatorId, serverTs}`. Server ticks the physics at 20Hz and pushes per-player deltas — each phone receives only its own two gauge values, so the split is enforced server-side, not by UI.

Hard part: causal legibility under jitter. If a nudge's effect lands 400ms after the shout, players attribute it to the wrong action and the whole epistemics collapse. Fixes: server applies nudges on tick boundaries, phones render an optimistic "sent" tick mark on the actuator, and gauge deltas animate over a fixed 300ms ramp so a change is visually unmistakable and time-anchored. Wiring generation must guarantee solvability: the target gauge is reachable, and no two actuators on the same phone hit the same gauge.

## v1 scope

- One 60s round, 4 players, fixed 12-actuator / 8-gauge wiring generator
- One objective gauge; win = in green for 3 consecutive seconds
- Drift on two actuators, hand-tuned constants
- Text + needle SVG only, no art

## Out of scope

Mic/voice input, multiple emergencies, rewiring mid-round, sabotage roles, scoring, reconnect, mobile install prompts.

## Risks & unknowns

Could collapse into brute-force mashing that accidentally wins — mitigate by penalising overlapping nudges (concurrent nudges within 500ms produce no gauge motion, only noise). Uncertain whether 60s is enough for a room to find serial-testing discipline; may need 90s and a scripted first-10s "everyone stop" prompt on the TV.

## Done means

Four phones, one TV, wiring randomised per run. A playtest group solves it at least once in five attempts, and post-round the TV can print the true wiring map to audible reaction. Verified: no player's actuator ever touches their own gauge, and a single nudge produces visible needle motion on exactly one other phone within 350ms.
