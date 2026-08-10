## Overview

A 90-second silent cooperative game for exactly three people in one room with a TV. Everyone holds one vertical dial (0–100). The room wins when all three dials sit within ±4 of each other for three continuous seconds. Nobody may speak, gesture, or show a screen. For groups who like the *Spaceteam*/*Hold Still* register: a physical, twitchy, all-at-once puzzle rather than a writing prompt.

## Problem

Convergence games almost always give you a full view of the group state and ask you to average toward it — solvable in one sweep, boring by round two. The interesting failure mode of real coordination isn't ignorance, it's **feedback delay**: everyone reacting to a stale picture of everyone else, overcorrecting, and ringing forever. No party game makes you feel that.

## How it works

The server wires the three players into a directed ring (A watches B, B watches C, C watches A). Nobody is told the direction or who they're watching.

**Each phone shows PRIVATELY:** a big drag-anywhere vertical pad with your own live value, and a second ghost marker showing *one other player's value delayed by 2.0 seconds* — unlabeled. That's it. You never see the third player at all.

**The host TV shows PUBLICLY:** a single spread bar (max − min) as a wobbling horizontal line, a 90s clock, and a lock meter that fills while spread ≤ 4. No names, no values, no per-player marks.

The dial rate-limits to ~30 units/sec, so you cannot teleport to a value — movement takes time and is therefore *visible* to your watcher. This creates the only communication channel in the game: modulating your own dial. Holding perfectly still says "I'm the anchor, come to me." A triple pulse says "follow me." Both cost you — pulsing pushes the spread up, and your watcher sees it 2s late. Groups that all chase simultaneously oscillate visibly on the TV bar; the room only converges when someone silently commits to stop moving and the other two ratchet in behind them.

On round end the TV replays all three traces overlaid, which is where the laugh lives: you finally see the standing wave you were all trapped in.

## Technical approach

Host browser tab + phone PWAs + authoritative Socket.IO server behind Tailscale Serve (or a PartyKit room).

Data model: `Room {code, phase, tick, players[3]}`, `Player {id, value, watchTargetId, history: RingBuffer<value, 3s @ 20Hz>}`.

Phones send drag deltas; the server clamps rate of change and is the sole authority on `value`. At 20Hz the server emits a **per-socket personalized payload** — each phone receives a different number (`history[t−40]` of its own target). This is the load-bearing bit: there is no broadcastable room state, so the naive "emit room snapshot to everyone" architecture is impossible by construction.

Hard part: making the 2.0s delay feel like *delay* rather than lag. Client-side interpolation of the ghost marker at 60fps from 20Hz samples, and drift correction if a phone's clock skews. Network jitter must not add uncontrolled delay on top of the designed delay.

## v1 scope

- Exactly 3 players, one 90-second round, no lobby beyond a 4-letter room code
- Fixed ring, fixed 2.0s delay, fixed ±4 window, 3s lock
- TV: spread bar, clock, lock meter, end-of-round three-line replay
- Win or timeout. No score, no second round, no reconnect handling

## Out of scope

More than three players, variable delay, adversarial roles, sound, persistence, mobile-web install polish.

## Risks & unknowns

The delay/rate-cap pair is the whole game and needs playtesting — too little delay and it's trivial, too much and it's unsolvable noise. Players may cheat by glancing at a neighbor's screen; seating matters. Touch dials are imprecise; the pad may need a fine-drag mode.

## Done means

Three phones on a LAN, no talking: a round ends in either a green LOCK with the replay drawn, or a timeout — and across five test rounds, at least one shows sustained visible ringing on the spread bar before someone anchors.
