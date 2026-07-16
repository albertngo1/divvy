## Overview
Concord is a cooperative concurrent-room party game for 3 players built around acoustic beating. Each phone secretly controls the pitch of one sustained tone; the host TV is the *only* speaker and plays all three tones superimposed. Players slide their private pitch until the audible wah-wah 'beats' between mistuned tones disappear and the three voices lock into perfect unison. For anyone who's tuned a guitar by ear — turned into a three-person telepathy trust-fall.

## Problem
Audio convergence games (rhythm, sequencers) are visual-grid-driven. Real musical *intonation* — hearing two nearby pitches beat against each other and nudging them together — is a pure by-ear convergence with zero visual anchor, and it's magical in a room. It's impossible to fake with one shared phone: each player needs their own hidden pitch to tune.

## How it works
Each **phone** shows a full-screen vertical **glide bar** — drag up/down to bend your tone continuously across a ~2-octave range. There is **no note name, no number, no reference pitch** on your screen. Your tone plays *only* out of the host, mixed with the others'. When two tones are close but not equal you hear slow beating (a pulsing volume wobble); the closer you get, the slower the beat, until it flatlines into a pure sustained tone.

The **host screen** shows only an abstract **'ring' meter** — a waveform that visibly shudders when tones beat and smooths as they converge — plus a hold-timer. No pitch values, no per-player indicators. Players silently hunt: someone anchors, others chase the beat to zero, all three converging on a single frequency (not any prescribed note — wherever the room settles). Win = all three fundamental frequencies within ~5 cents of each other, held clean for 3 seconds. On win, the host swells the pure unison and reveals the three glide positions snapping together.

## Technical approach
Host tab + phone PWA clients + authoritative WebSocket server (Socket.IO over Tailscale Serve, or PartyKit). **Data model:** room = { players: { id → freqHz }, phase, holdStartTs }. Phones stream freq (throttled ~20/s). **Sync strategy:** the host is the single audio sink — it runs a Web Audio graph with one oscillator per player, each oscillator's frequency driven by incoming values with a short `setTargetAtTime` glide to avoid zipper noise. Phones emit no local audio, sidestepping cross-device latency entirely. Server computes max-pairwise-cents spread, runs the hold timer, declares the win. **Genuinely hard part:** perceptual tuning of the beat cue — pitches must be spaced so beats are *audible but not harsh*, and the win threshold generous enough to be reachable by non-musicians yet tight enough that random sliding doesn't trip it.

## v1 scope
- 3 players, one round
- Single glide bar per phone → one oscillator each on host
- Host-only audio mix + shudder/ring meter + 3s hold timer
- Win on ≤5-cent pairwise spread held clean
- Snap-together reveal

## Out of scope
- Target chords / intervals (unison only)
- Multiple rounds, scoring, timbres
- Phone-side audio playback
- Microphone input / real-instrument tuning

## Risks & unknowns
- Beating is subtle on tinny TV speakers; may need a low warm timbre and volume floor.
- Non-musical players might not perceive beats — needs an onboarding 'listen for the wobble' moment.
- 3-way beating is muddier than pairwise; may cap thresholds or stagger tones.
- Room noise could mask the cue.

## Done means
Three phones join, each drives one host oscillator via its private glide bar with no on-screen pitch reference, the host mixes all three and shows only the shudder meter, and when all three tones sit within 5 cents for 3 seconds the host resolves to a clean unison and reveals the converged positions.
