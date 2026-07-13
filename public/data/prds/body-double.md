## Overview
Body Double is a phone app that generates statistically realistic fake biometric streams — steps, heart rate, sleep stages — and writes them into Apple HealthKit / Android Health Connect, so mandatory workplace-wellness and insurance apps that read from those stores see a plausible, compliant human without surveilling the real one. It inverts the premise of "mandatory wearable sensing": instead of the black box watching you, you decide what it gets to see.

## Problem
Employer wellness programs and some insurers increasingly gate discounts on wearable data, effectively coercing continuous biometric surveillance. Opting out costs money; opting in leaks resting HR, sleep, and location-adjacent activity to third parties. There's no honest middle. Recent HCI work ("Living Inside the Black Box") documents workers already gaming these systems crudely (phone on a ceiling fan). Body Double does it *convincingly*.

## How it works
You set a persona ("sedentary desk worker," "casual walker," target daily steps, sleep schedule). Body Double simulates a realistic day and writes samples into the health store on the OS's normal cadence. The wellness app, reading HealthKit/Health Connect like any other, sees a coherent person: a circadian HR curve that dips in deep sleep and rises with simulated walks, step bursts clustered at commute/lunch times, occasional rest days.

## Technical approach
- **Stack:** Swift + HealthKit (`HKHealthStore.save`) on iOS; Kotlin + Health Connect (`insertRecords`) on Android. Local only; nothing leaves the device.
- **Generative model:** not noise — a layered simulator. Steps come from a Poisson-cluster process with day-part intensity; HR is a baseline circadian sinusoid + activity-coupled bumps + Ornstein-Uhlenbeck jitter; sleep is a semi-Markov stage sequence (awake→light→deep→REM) with realistic durations. Parameters sampled per-persona with day-to-day autocorrelation so Tuesday resembles Monday, not a fresh coin flip.
- **The hard part:** passing anomaly detection. Wellness backends flag physiologically impossible data (HR flat 24/7, 40k robotic steps). We fit generator params to public distributions (e.g. NHANES accelerometer summaries) and add cross-signal correlation — steps must co-move with HR — so the record survives naive plausibility checks.
- **Data model:** persona configs + a deterministic seed per day for reproducibility/debugging.

## v1 scope
- iOS HealthKit writer for steps + HR + sleep.
- 3 presets (low/medium/active) with editable daily targets.
- Backfill a chosen date range and a daily background scheduler.

## Out of scope
- Android (v2), live wearable spoofing over BLE, GPS/workout routes.
- Beating ML anomaly detectors specifically tuned to catch synthetic data.

## Risks & unknowns
- Legal/ToS: falsifying data to an employer/insurer may breach program terms — framed as a privacy-research/self-experimentation tool, not fraud advice.
- Some programs require a *paired hardware* wearable, which HealthKit injection can't satisfy.
- Detection arms race: correlated-but-synthetic data may still be flaggable.

## Done means
After running Body Double for a week, a third-party app reading HealthKit displays a full, coherent activity/sleep/HR history for those days that a human reviewer would accept as real, with no gaps, no flat lines, and steps and heart rate visibly correlated.
