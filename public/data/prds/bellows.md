## Overview
Bellows is a concurrent-room synchrony game for 3-5 players about converging on a shared, slow breathing rhythm with no talking. Each phone is a private breath pacer; the room wins by breathing as one. For groups who liked fast tap-sync games but want something slower, bodily, and analog.

## Problem
Sync party games chase fast signals — beats you tap, pitches you slide. Nobody's done the slow, physical 3-6 second respiration cycle, where both *tempo* and *depth* matter and the feedback is a continuous waveform rather than a binary hit. It's a different, calmer flavor of convergence.

## How it works
On each phone you press-and-hold to "inhale": a circle swells and haptic intensity ramps up. Release to "exhale": the circle shrinks, haptic fades. You choose your own tempo and depth. Your phone shows ONLY your own circle and your own haptic — never anyone else's breath. The host TV shows every player's breath superimposed as a single translucent stacked waveform (a merged pulsing orb) plus a Coherence meter derived from phase alignment + period variance — no individual traces, no per-player numbers. The room must, by feel alone, drift into one shared breath (inhaling and exhaling together at the same rate) and hold ≥85% coherence for two full cycles. On lock, the merged orb glows and pulses as one.

Private (phone): your breath control + your private haptic. Shared (host): the merged waveform + Coherence meter only.

## Technical approach
PartyKit / Durable Object per room. Each phone derives an instantaneous breath phase (0..1 within its current cycle) + amplitude from hold/release timing and streams it at ~10Hz. Server computes the Kuramoto order parameter over phases and the coefficient of variation of recent periods → a single Coherence scalar, and broadcasts merged-waveform samples + coherence to the host. The genuinely hard part is defining a *phase* for an aperiodic, hand-driven signal in real time (estimate instantaneous period from the last hold+release durations) and smoothing coherence so it's responsive without jitter. Helpfully, latency tolerance is generous — breaths are slow, so network jitter barely matters.

## v1 scope
- 3 players, single 90s round, one win condition.
- Press-hold inhale / release exhale; basic haptic ramp.
- Host merged orb + Coherence meter; win at ≥85% held two cycles.

## Out of scope
- Mic-based real breath detection, guided-meditation content, multi-round, leaderboards, reconnection.

## Risks & unknowns
- Could read as "slow Flash Mob"; mitigant is the analog waveform + amplitude dimension + haptic, not binary taps.
- Players may not take slow breathing seriously in a rowdy party; needs the merged-orb payoff to feel earned.
- Phase estimation on irregular hand input could be flaky and needs real tuning.

## Done means
Three phones hold/release to breathe; the host Coherence meter rises as they align, reaches ≥85% and holds two full cycles when they breathe together, and the merged-orb celebration fires.
