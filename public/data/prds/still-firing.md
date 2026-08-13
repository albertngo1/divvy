## Overview

A desktop/phone tool that records mechanomyogram (MMG) — the audible/vibratory 5–100Hz signal a contracting muscle actually emits — from a cheap piezo contact mic stuck to your quadriceps or biceps, and gives you a per-rep fatigue curve for a single set. It names the rep where your motor-unit recruitment pattern shifted, i.e. the point past which you were grinding rather than training. For lifters, rehab patients doing prescribed loading, and anyone who currently guesses "reps in reserve" from vibes.

## Problem

Everyone tracking strength training records load × reps and nothing about what the muscle did. The real variable — when a set crosses from productive to junk — is estimated by feel, or by bar-speed trackers that cost $300 and only work on a barbell. Lab-grade EMG needs gel electrodes, skin prep, and a $2k amp. MMG needs a contact mic and a sound card, and has been in the sports-science literature since the 1980s with essentially zero consumer implementations.

## How it works

1. Stick a piezo disc (with a foam standoff, taped over the muscle belly) into a mic input. One-time 10-second calibration: a max voluntary contraction sets your amplitude reference.
2. Hit record, do a set. The app streams a live scope: rectified MMG envelope on top, running median frequency underneath.
3. Reps are segmented automatically from the envelope's burst structure — each contraction is a distinct amplitude packet.
4. Per rep it reports two numbers: RMS amplitude (recruitment) and median power frequency (firing-rate proxy). Fatigue shows as MDF sliding down while RMS climbs or plateaus — the muscle recruiting harder to do the same work.
5. The verdict line: "rep 7 of 10 — MDF dropped 11% below your set baseline; reps 8–10 were compensation." Sets accumulate into a per-muscle history so you can see whether last week's deload actually changed the crossing point.

## Technical approach

Python + `sounddevice` for capture at 8kHz (MMG is entirely sub-100Hz, so this is luxurious), or a browser build via Web Audio for the phone. Signal chain: DC removal, 5–100Hz Butterworth bandpass, 50/60Hz notch (mains hum is the main enemy — and which notch you need is determinable from the recording itself), Hilbert transform for the envelope. Rep segmentation is threshold-crossing on the smoothed envelope with a minimum-duration guard, refined by a peak-prominence pass. MDF per rep is the frequency dividing the Welch PSD into equal halves. Motion artifact — the piezo thumping against clothing or the bench — is broadband and impulsive, and gets rejected by a kurtosis gate on 100ms windows. The genuinely hard part is placement repeatability: MMG amplitude is brutally sensitive to sensor position and pressure, so absolute values across sessions are meaningless. The fix is to make every metric *within-set relative* (normalized to that set's first three reps), which is also physiologically the right question.

## v1 scope

- One muscle, one set, one recording at a time
- Record → WAV on disk → offline analysis (no live scope)
- Manual rep count entry as ground truth; auto-segmentation validated against it
- Output: a single PNG with envelope, per-rep MDF bars, and the flagged rep
- No history, no accounts, no phone build

## Out of scope

Multiple sensors, EMG comparison, force estimation, exercise classification, wearable hardware, any clinical or injury claim.

## Risks & unknowns

Whether a $4 piezo through a laptop mic preamp has enough SNR at 10–40Hz; contact/adhesion holding through a real set; the MDF-drop threshold being wildly individual and needing per-user calibration; the possibility that isotonic (moving) exercise smears the signal badly enough that it only works for isometric holds — which would be a real narrowing, not a fatal one.

## Done means

A recorded set of 10 leg extensions to genuine failure shows a monotone-ish MDF decline of >10% by the final reps, the auto-segmenter finds exactly 10 reps, and a fresh set at 50% of that load over the same 10 reps shows no such decline — the tool distinguishes a hard set from an easy one without being told the weight.
