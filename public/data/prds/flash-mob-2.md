## Overview
Flash Mob is a concurrent-room party game for 3-6 people where the whole room tries to blink in unison. Each player taps a steady beat on their phone; the shared TV shows only the *superposition* of everyone's flashes. Nobody talks. The win is emergent synchrony — the firefly effect, gamified.

## Problem
Most 'sync' party games give a shared reference (a metronome, a leader). The itch here is the harder, stranger thing: converging on a beat *nobody chose*, using only blurry collective feedback. It scratches the same nerve as a stadium clap finding its groove.

## How it works
Each **phone shows PRIVATELY**: a full-screen dark tap pad. Every tap fires a flash + haptic *on your screen only*, plus a tiny 'your pulse' dot. You never see anyone else's taps, tempo, or phase.

The **shared host screen** shows one blooming glow that is the sum of all flashes, plus a coherence meter (0-100%). When players are scattered the glow is a muddy shimmer; as phases align it sharpens into a hard strobe. There is no target tempo — the room invents one. You infer 'am I early or late?' purely from whether the glow tightens or smears after you nudge your rhythm.

**Win:** hold coherence ≥ 85% for 3 continuous seconds. One 60-second round.

The delicious tension: the host glow tells the *room* how it's doing but never tells *you* who's off — so everyone must experiment simultaneously, and over-correcting shatters a near-lock.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve).

**Data model:** `player {id, tapTimes[], estPeriod, estPhase}`. On each tap the phone sends `{t_client}`; the server applies an NTP-style offset (measured at join) to map to server time.

**Sync strategy:** server estimates each player's instantaneous period (median inter-tap interval) and current phase, then computes the Kuramoto order parameter R = |mean(e^{iθ})| and mean phase. It broadcasts `{R, meanPhase, pulseTrigger}` to the host at 60fps; phones get nothing but an ack. Host renders the glow bloom on each `pulseTrigger` and its sharpness from R.

**Genuinely hard part:** estimating phase from sparse, jittery discrete taps fast enough that the host glow feels causally tied to fingers (<80ms tap-to-photon). Smoothing enough to be readable without lagging so much that correction feels dead. A short exponential window on inter-tap intervals plus phase-wrapping care is the crux.

## v1 scope
- 3 players, one 60-second round, single coherence goal.
- Tap pad + private flash; host glow + coherence meter.
- Win screen when R held high; timeout loss otherwise.
- No accounts, no tempo target, no scoring beyond win/lose.

## Out of scope
- >6 players, multiple rounds, difficulty tiers.
- Audio (a click track would defeat the point).
- Per-player 'you were the laggy one' callouts.

## Risks & unknowns
- Whether coherence feedback *without* individual info is enough to converge, or maddeningly random.
- Tap-latency variance across cheap phones.
- 85% threshold + 3s hold may need tuning to feel winnable-but-earned.

## Done means
Three phones on a real network reach and hold ≥85% coherence within 60s in playtests more often than not, and the host strobe visibly snaps from shimmer to crisp at the moment of lock.
