## Overview

A six-minute betting game for 4-6 people watching one deliberately mid video clip. Before playback each phone privately sets a line on **when the first person in the room will bail**, and privately names **who** it will be. During playback each phone shows one thing: a big secret **I'm out** button. The underlying asset is the room's own attention span, and you can move it.

## Problem

Group viewing dies quietly. Eight minutes in, everyone has checked out and nobody will say so, because the person who picked it is right there. The polite fiction costs the whole room forty minutes. This makes bailing legible, profitable, and — critically — something you want to hide rather than confess.

## How it works

1. Host plays the bundled clip on the TV. Pre-roll, each phone privately submits: a **bail line** (slider, 0:15-6:00, when the first bail happens) and a **first-bailer pick** (one other player's name).
2. Playback starts. Every phone goes dark except the I'm out button. Tapping is private, irreversible, and produces no sound, no vibration, no change on the TV at that instant.
3. The TV shows the clip plus a **bail meter delayed by 20 seconds** and quantized to whole players. So a bail becomes public knowledge as a fact — but detached from the moment and from any face, unless you were reading faces instead of watching.
4. House rule the game enforces in its copy: after you bail you must keep facing the screen. Bailers want to stay unattributed; everyone else is hunting the flinch.
5. Settle at clip end. Three payouts: proximity of your line to the true first-bail time; a bonus for correctly naming the first bailer; and a **stealth bonus** to the first bailer if a majority failed to name them.
6. Reveal: the TV replays a timeline of every bail, to the second, with names attached. That reveal is the payoff moment — the whole room's private boredom, finally on screen.

**Private per phone:** your line, your pick, your bail timestamp, your button. **Shared on TV:** the clip, the 20 s-lagged quantized meter, and the final named timeline.

## Technical approach

PartyKit Durable Object or Socket.IO over Tailscale Serve. The host is clock master and reports `clipMs` from `<video>.currentTime` on every 4 Hz tick, so a buffer stall freezes game time rather than desyncing it. The server stamps each bail with its own reconstructed clipMs.

Data model: `Room{code, phase, clipMs}`, `Player{id, name, line, accuse, bailMs}`, plus a server-side lagged aggregate.

The hard part is **anti-leak, not throughput** — traffic is a dozen events total. If any phone can see the bail meter, the game is dead: late bailers would just read the room off their own screen. So the lagged aggregate is published on a role-scoped channel the host socket alone subscribes to, enforced server-side at join time by role token, and phones receive a fixed-size null heartbeat so message timing itself carries no signal. Secondary hard part: reconstructing exact bail times across stalls and reconnects for a reveal timeline that has to be trustworthy to the second, since the whole endgame is people arguing about it.

## v1 scope

- 4 players, one bundled 6-minute clip, no clip picker
- One slider, one name pick, one button, one scoreboard
- Asset is **first bail time** only (a 50%-of-room line is too coarse at four players)
- 20 s lagged meter on TV; named timeline reveal at end
- Room-code join, no accounts, one round

## Out of scope

User-supplied clips; multiple rounds; un-bailing or re-engaging; camera or gaze-based attention sensing; a live trash-talk channel; scaling the line to room percentage.

## Risks & unknowns

The biggest risk is that the game asks people to watch something mediocre — six minutes is the cap for a reason, and it may still drag. Bail honesty is unverifiable: a player can tap at 0:20 purely to hit their own line, and the accusation market is the only counterweight; it may not be enough. It can read as mean toward whoever picked the clip. And a room that all bails in the first minute produces a degenerate, unfun round.

## Done means

Four phones join by code, all submit a line and a name pre-roll, the clip plays end to end, at least one bail is recorded, the TV meter provably lags 20 s ±1 s, no phone socket ever receives meter data (verified from the server log), and the end screen shows every bail time to the second with names — with scores matching a hand computation for one round.
