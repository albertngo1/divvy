## Overview
A no-server web app that measures your personal resonance frequency — the breathing rate at which your baroreflex loop rings loudest — by running a proper frequency sweep against a Bluetooth heart-rate strap, then paces you at *that* rate. For anyone doing HRV biofeedback who suspects the universal "6 breaths per minute" advice is a rounding error.

## Problem
Resonance-frequency breathing is a real, well-characterized phenomenon: the ~0.1 Hz baroreflex delay loop produces a sharp amplification peak in heart-rate oscillation. The clinical protocol (Lehrer/Gevirtz) *assesses* each person's peak, which ranges roughly 4.5–7.0 breaths/min and shifts with height and blood volume. Consumer apps skipped the assessment and hardcoded 6.0. If your peak is 5.0, you're training off-resonance and getting a fraction of the amplitude — and no app shows you the curve that would prove it either way.

## How it works
Pair a Polar H10 (or any BLE Heart Rate Service device that reports RR intervals). The app runs a 12-minute sweep: two minutes each at 6.5, 6.0, 5.5, 5.0, 4.5 breaths/min, paced by a smoothly expanding arc with a 2:3 inhale:exhale ratio and a 30 s discard at each transition. For each rate it computes three things from the RR series: peak-to-trough heart-rate amplitude, spectral power in a narrow band around the pacing frequency, and the phase lag between the pacer and the HR oscillation (resonance is where phase crosses zero, which is a far cleaner estimator than amplitude alone). Fit a Lorentzian to amplitude-vs-frequency → center frequency f₀ and a Q value. The payoff screen is a Bode-style plot of *your* loop with the peak marked, plus a permanent metronome locked to f₀ and a live coherence readout.

## Technical approach
Vanilla TS, Web Bluetooth (`navigator.bluetooth.requestDevice({filters:[{services:['heart_rate']}]})`, notifications on characteristic `0x2A37`, RR intervals in 1/1024 s units from the flags byte). All DSP in-page: ectopic-beat correction by a Kubios-style median filter (reject RR deviating >20% from a 5-beat median, cubic-spline interpolate), resample the tachogram to 4 Hz, Welch PSD with Hann windows, cross-spectrum against the pacer signal for phase. IndexedDB for sessions, no backend, no account. Camera-PPG fallback via `getUserMedia` (mean green channel, 0.7–3 Hz bandpass, parabolic-interpolated peak picking) for people without a strap. The hard part is estimator stability: two minutes at 5 bpm is only ten breaths, so the amplitude estimate is noisy — the phase-crossing estimator and a repeat-sweep confidence interval are what make the number trustworthy rather than astrology.

## v1 scope
- BLE strap only, no camera fallback
- Three rates (6.5 / 5.5 / 4.5), amplitude estimator only, no phase
- One output: a bar chart and a single number
- No storage — refresh loses the session

## Out of scope
- Multi-week coaching programs, streaks, cloud sync
- iOS Safari (no Web Bluetooth — desktop Chrome and Android only)
- Any claim about blood pressure, anxiety, or outcomes

## Risks & unknowns
Camera PPG likely lacks the beat-to-beat timing precision RSA analysis needs. Users drift off the pacer, which corrupts the sweep — needs a drift detector that infers actual breathing rate from the RSA phase and pauses. And the biggest risk is overclaiming: this must present as a *measurement instrument*, not a therapy.

## Done means
One person, two sessions a week apart, produces f₀ estimates within 0.25 breaths/min of each other, and the amplitude-vs-rate curve shows a single visible peak rather than a flat line — with the raw RR series exportable as CSV so the fit can be checked in R.
