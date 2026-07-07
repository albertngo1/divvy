## Overview
Tiptoe is a cooperative, whole-room party game for 3–6 players on a shared host screen plus per-phone controllers. A meter on the TV — a sleeping dragon (or baby, or landlord) — creeps toward waking whenever the collective room noise rises. Each phone privately hands its owner a short list of physical chores to complete before time runs out. The twist: coordinating those chores normally requires talking, and talking is exactly what wakes the dragon. The room must plan and execute in silence, through gestures, pointing, and shoved phone screens.

## Problem
Co-op party games reward the loudest table; the person who shouts orders 'wins' the coordination. There's no popular game where *speaking is the failure state* and the fun is desperate silent negotiation. The itch: make a room of friends conspire wordlessly and watch the comedy of suppressed instructions.

## How it works
Each **phone privately shows** a personal task list — e.g. 'swap seats with whoever's on your left', 'hand your phone to someone wearing black', 'get everyone to point at the ceiling at once'. Some tasks require another player's cooperation, but you can't tell them out loud. The **host TV shows** the shared dragon meter, a countdown, and a team progress bar (X of N chores done) — never the individual task lists.

Every phone continuously reports its own local noise level. The server sums them into the dragon meter: quiet room = meter drains, chatter = meter spikes toward wake. Crucially, each phone also attributes noise to its owner — because your phone is physically closest to you, your voice is loudest on *your* mic. When a spike is attributed to you, your phone (and only yours) buzzes and flashes 'SHHH — that was you'. Wake the dragon and the round fails; finish all chores in silence and the team wins.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `Room{meter, threshold, deadline, choresDone}`, `Player{id, taskList, calibratedFloor, lastRms}`. Each phone samples WebAudio RMS at ~10Hz, subtracts a per-device calibrated room baseline, and streams a small level number. Server fuses levels into one meter and runs the 'loudest phone = culprit' attribution. Tasks complete via explicit phone taps (task owner marks done, a corroborating player confirms).

The genuinely hard part: fusing N unsynchronized, differently-tuned mics into one fair, non-jittery shared meter, and correctly blaming the right person when everyone's mic hears the same laugh. Solved with per-device calibration, relative-loudness attribution (nearest mic dominates), and server-side smoothing so one cough doesn't instantly wake the dragon.

## v1 scope
- 3–4 players, one 90-second round
- 3 chores per player from a fixed pool, ~6 total to clear
- One shared dragon meter with a single wake threshold
- Per-phone 'that was you' buzz on attributed spikes

## Out of scope
- Task packs, difficulty curves, multiple rounds
- Fancy attribution ML; simple loudest-mic heuristic only
- Any raw-audio capture

## Risks & unknowns
- Mic calibration drift across cheap phones making the meter unfair
- Attribution mis-blaming a quiet person next to a loud one
- Silent-coordination may stall if tasks are too interdependent for gestures

## Done means
Four phones join, each gets a distinct private chore list, the TV meter visibly rises when anyone speaks and drains during silence, a spike buzzes only the loudest speaker's phone, and the team either clears all chores before the timer or wakes the dragon — all computed server-side with no audio leaving any device.
