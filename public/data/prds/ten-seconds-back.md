## Overview

A 4–6 player couch game where a short video clip plays only as fast as the room's betting lets it. Every player secretly owns a slice of the clip and is paid for the seconds the group actually spends watching that slice. For friend groups who already fight over the remote — this makes the fight the game.

## Problem

Watching a clip together is a zero-agency activity: one person holds the remote, everyone else is a passenger. Existing "bet on the show" formats bet on the *content* (what happens next), which needs an oracle and a writer. Nobody has made the *timeline itself* the contested object.

## How it works

Host screen: the clip, a playhead, a nameless tug-of-war bar (forward pull vs. back pull), and the total coins burned this tick. That's all — no names, no scores, no windows.

Each phone privately shows: (1) your secret 8-second **window**, drawn as a band on your own mini-timeline; (2) your coin balance (100 to start); (3) your accrued points; (4) an order pad — a direction toggle and a stake slider.

Every 2 seconds the server resolves a tick. Forward stakes F and back stakes B are summed; the playhead moves toward the heavier side by `1 + 2·|F−B|/(F+B)` seconds. It is an **all-pay** auction: every coin staked is burned, winners and losers alike, so bluffing has a real price. You score 1 point per second the playhead spends inside your window. Windows overlap unpredictably, so two players may be silent allies who can never say so, and a player who pulls the same direction three ticks running has advertised where their window is — the room can then park the playhead in the dead zone out of pure spite. The clip runs on a 3-minute wall clock (~90 ticks), then the TV overlays all six windows on the timeline: a visual record of exactly where the money fought.

## Technical approach

Host browser tab + phone PWAs + a PartyKit Durable Object as the authoritative clock and playhead model. Data model: `Room {clipId, playheadMs, tick, phase}`, `Player {id, coins, windowStartMs, points}`, `Order {playerId, tick, dir, stake}` (sealed, never broadcast). Server ticks on its own `setInterval`, accrues points from *its* playhead model — never from video events — and broadcasts `{playheadMs, tugRatio, burned}` at 10 Hz.

Only the host tab holds a `<video>`; phones never play media, which sidesteps multi-device A/V sync entirely. The genuinely hard part is making the host's playback obey a jittery server target without looking broken: backward moves are hard `currentTime` jumps (visually fine — a rewind reads as intentional), forward moves ramp `playbackRate` to 1.3–3× across the tick instead of seeking, so forward motion stays smooth. The host reconciles drift >250 ms with a silent seek.

## v1 scope

- 4 players, one hardcoded 90-second local MP4
- Fixed set of 6 non-random 8-second windows, dealt at join
- One 3-minute session, one tick cadence, no rounds
- Coins burn; no earning, no top-ups
- Final screen: windows overlaid + point totals

## Out of scope

Clip library or YouTube import, spectators, per-round rebuys, audio ducking, reconnect handling, mobile host.

## Risks & unknowns

The playhead may oscillate into unwatchable seizure-scrubbing — needs a per-tick move cap and possibly a 1-tick cooldown after a reversal. Coin economy may resolve in 20 ticks (everyone broke, clip just plays out); tune starting coins by playtest. All-pay burning may feel punishing rather than tense.

## Done means

Four phones join by QR, each sees a different private window, and over a 3-minute session the host clip visibly lurches under contested bidding with no phone showing another's window or stake; final screen shows six windows and a scoreboard, and at least one playtest group tries to bankrupt a specific player rather than maximize their own score.
