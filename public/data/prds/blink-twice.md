## Overview

Blink Twice is a 3-player, one-attempt cooperative synchrony game for a dark-ish living room. Everyone taps their phone at a self-chosen tempo; the phones flash. The catch: your screen never shows your own flash, and it shows the flashes of exactly ONE assigned neighbour — arranged in a cycle (A watches B, B watches C, C watches A). Nobody has a global view. The room wins when all three settle into the same tempo *and* the same phase, like fireflies on a riverbank.

## Problem

Sync games usually give everyone the same reference signal (a metronome, a host beat) — at which point "syncing" is just reaction time. Real emergent synchrony is interesting precisely because information is *local*: you entrain to who you can see, and global order has to propagate around a loop. No party game has made the observation graph itself the toy.

## How it works

- Host TV (shared): a black field with one soft glow whose brightness is the room's coherence, smoothed over ~2s. Deliberately sluggish and coarse — it tells you "warmer/colder," never a beat you could copy. No dots, no names, no per-player anything.
- Each phone (private): full-screen black + tap-anywhere. Your own tap gives haptic feedback only — **no visual self-flash**. A soft bloom appears when *your assigned neighbour* taps. Since every phone renders the bloom identically, peeking at someone else's screen shows you the wrong node's signal — peeking actively misleads.
- Win: all three tap periods within 10% and all pairwise phase offsets under ~12% of a period, sustained 4 seconds. Payoff: the TV and all three phones flash together, three times, in real unison.

## Technical approach

Host browser tab + phone PWAs + PartyKit Durable Object (or Socket.IO over Tailscale Serve) as authority.

Data model: `{ roomId, phase: 'lobby'|'run'|'won', graph: {A:['B'],B:['C'],C:['A']}, offsets: {playerId: clockOffsetMs}, taps: [{playerId, tShared}] }`.

Clock sync: NTP-style round trips on connect and every 5s; keep the min-RTT sample; convert each phone's `performance.now()` tap stamp to a shared server timeline. Server appends taps and fans each one out only to that player's watchers.

The genuinely hard part is latency *asymmetry*, not latency. A flash rendered late poisons entrainment, and if A→B is 30ms while C→A is 90ms, the cycle acquires a phase bias and the room locks into a rotating wave instead of unison. Fix: render every neighbour flash at a *uniform* artificial delay D=120ms on the shared clock, dropping any packet that arrives too late to hit its slot. A constant delay on every edge is symmetric, so the loop still converges to unison — it just converges to a slightly stretched period, which is invisible to players. Coherence (a Kuramoto order parameter over each player's last 4 taps) is computed server-side every 100ms.

## v1 scope

- Exactly 3 players, fixed cycle graph, one 90-second attempt.
- Tap-anywhere; haptics for self, bloom for neighbour.
- One coherence glow on the TV; one win animation.
- Room code join, no accounts, no scores, no rematch button (reload the tab).

## Out of scope

Accelerometer/shake input, audio, 4+ players, alternate graph topologies, per-player tempo handicaps, rounds, leaderboards.

## Risks & unknowns

- The TV glow may leak a usable beat despite smoothing — needs tuning, possibly removal.
- Bright screens in a small room could let players read each other's timing directly.
- 3 nodes in a cycle may converge trivially fast; a 4th node is where it gets hard.

## Done means

Three phones + one host tab on the same LAN; measured cross-device tap-time error under 25ms; a room of strangers reaches the 4-second lock at least once in three sittings, and no player can state who they were watching.
