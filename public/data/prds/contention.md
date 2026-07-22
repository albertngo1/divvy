## Overview
Contention is a 3–5 player concurrent-room game about a shared, scarce radio band. Each player is a transmitter with a private backlog of packets that MUST go out on specific channels. The room only wins by staggering their transmissions in time — because coordination (two people keying the same channel on the same tick) is exactly what destroys you. For friend groups who like Spaceteam-style panic but want it quiet and cerebral.

## Problem
Most 'cooperate' party games reward converging on the same choice. The itch here is the opposite: a distributed-scheduling puzzle where you and I need the SAME resource (a channel) but must never touch it simultaneously, and neither of us can see the other's plan. That blind, polite-but-competitive staggering is the whole hook.

## How it works
The host TV shows the shared spectrum: 5 channel columns × an 8-tick timeline, plus a running clock advancing one tick every ~2.5s. It shows ONLY the *history* — which channels lit up (green = clean, red = collided static) on past ticks. It never shows who transmitted or what's queued.

Each phone PRIVATELY shows that player's own packet queue: 3 packets, each stamped with a required channel (dealt asymmetrically, so channel demand overlaps between players). Each tick, a phone chooses: transmit its next packet on its required channel, or HOLD (skip this tick, safe). At tick resolution the server checks each channel: if exactly one player transmitted, the packet delivers (green); if 2+ transmitted on the same channel, all of them corrupt (red static) and stay in their queues.

Co-op win: every player empties their queue within 8 ticks. The tension is that when your required channel collides with someone's — invisible to you — you both must infer, from the red flashes on the TV, that you're stepping on each other, and one of you must HOLD to yield next time.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. Data model: `Room{ tick, channelHistory[][], players{ id, queue[{channel, delivered}] } }`. Sync: server owns the tick clock, broadcasts a `TICK_OPEN` with the deadline; phones submit `{action: transmit|hold}` before the deadline; server resolves atomically, marks deliveries/collisions, broadcasts `TICK_RESULT`. Late/no submit = auto-HOLD. Hard part: fair simultaneity — resolving all submissions for a tick as one atomic batch and handling stragglers deterministically so no client's lag advantages them. Instances are generated to be solvable but tight (channel-demand graph must be edge-colorable within 8 ticks).

## v1 scope
- 3 players, one game, one hardcoded solvable instance.
- 5 channels, 8 ticks, 3 packets each.
- TV: spectrum history grid + tick clock. Phone: queue + Transmit/Hold.
- Co-op win/lose screen only.

## Out of scope
- Competitive scoring, matchmaking, multiple rounds, accounts.
- Procedural instance generator (hand-author v1 instances).
- Reconnect/rejoin mid-game.

## Risks & unknowns
- Might be too abstract to feel visceral — needs juicy static SFX and screen-shake on collisions.
- If demand graphs are too loose it's trivial; too tight and it's frustrating. Needs playtest tuning.
- Reading intent purely from red flashes may be too thin; may need a subtle per-channel 'busy last tick' hint.

## Done means
Three phones join a room; each sees a distinct private queue; ticks advance on the TV; a same-channel same-tick submission produces red static and retains both packets; a clean instance is clearable within 8 ticks; the TV shows a win when all three queues empty.
