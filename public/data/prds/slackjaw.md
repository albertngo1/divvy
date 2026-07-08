## Overview
Slackjaw is a browser-based idle biofeedback game for the millions of desk workers who unconsciously clench their jaws (bruxism / TMJ). A little plant grows on your screen the whole time your face is relaxed, and visibly droops the instant you tense up — turning an invisible bad habit into a soft, ambient nag you actually want to satisfy.

## Problem
Daytime clenching is unconscious: you only notice the headache or jaw ache hours later. Mouthguards address nighttime grinding but nothing gives you a cheap, real-time signal that you're bracing your face while doomscrolling or in a tense meeting. Sparked by arXiv's GlassTENG (self-powered jaw/facial sensing from glasses) — but nobody wants special hardware.

## How it works
On first run you calibrate: the app asks you to fully relax, then clench, capturing two facial-landmark distributions. Then a single potted plant grows continuously (idle-game accrual) while your measured tension sits below threshold, and wilts/loses growth points when you clench. It runs in a pinned background tab or menubar; a daily streak counter and a session tension timeline reward long relaxed stretches. Periodic gentle 'relax check' pulses prompt you to reset your face.

## Technical approach
Pure client-side web app (Vite + TypeScript). Face tracking via `@mediapipe/tasks-vision` FaceMesh (468 landmarks) at ~15fps. Jaw-tension proxy: combine (a) cheek/masseter-region width delta vs baseline, (b) lip-compression ratio, (c) micro-displacement variance of lower-face landmarks, normalized into a z-score against the calibrated relax/clench distributions, smoothed with an EMA. State (session timeseries, streaks, plant growth) in IndexedDB. No video ever leaves the device. The genuinely hard part: a closed-mouth clench barely moves visible landmarks — masseter bulge is subtle on webcam — so calibration + per-user thresholds + shadow/width cues are load-bearing, and false positives must be tuned down hard or the plant flickers annoyingly.

## v1 scope
- One plant, one calibration flow
- Live tension meter + wilt/grow response
- Single-session streak, no accounts, no cloud

## Out of scope
- EMG / hardware sensors, mobile front camera
- Multi-plant tycoon / garden progression
- Nighttime grinding (this is awake daytime only)

## Risks & unknowns
Webcam clench detection may be too noisy to feel fair; privacy optics of an always-on camera tab; awake-bruxism may not correlate with clinical grinding. Mitigate by scoping explicitly to daytime awareness and keeping all processing local.

## Done means
After calibration, deliberately clenching for 3 seconds makes the plant visibly wilt within ~1s, and relaxing regrows it; a 25-minute mostly-relaxed session produces clear net growth and a saved tension timeline.
