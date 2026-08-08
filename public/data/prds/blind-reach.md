## Overview
A local web app that runs a 45-second daily visuomotor-rotation task and tracks one number almost nobody measures at home: your **motor adaptation rate**. For quantified-self people who have already maxed out HRV, sleep score, and step count and want an instrument pointed at their nervous system's plasticity rather than its autonomics.

## Problem
Every consumer self-tracking signal is autonomic (HRV, RHR, SpO2) or behavioral (steps, screen time). None of them measure how well your motor system *learns*. The visuomotor rotation task is a decades-old lab standard — perturb the cursor, watch the subject re-aim, measure the after-effect — and it's sensitive to sleep, alcohol, caffeine and fatigue. It needs no hardware beyond a trackpad, and yet nothing packages it as a daily instrument.

## How it works
Center-out reaching on trackpad or touchscreen, three blocks:
1. **Baseline, 10 trials.** A target flashes at one of 8 directions; the cursor disappears at movement onset; you shoot through the target. Yields constant error and trial-to-trial variability — your noise floor.
2. **Perturbation, 24 trials.** The cursor is rotated 30° (sign randomized daily, counterbalanced across the week) and shown only as an endpoint dot. Trial-by-trial error decay is fit to the Smith two-state model, giving retention `A` and learning rate `B` for a fast and a slow process.
3. **Washout, 10 trials.** Cursor removed entirely. Hand angle on the *first* washout trial is the after-effect — the implicit-learning readout, uncontaminated by conscious re-aiming.

Daily output is three numbers (baseline noise, fast learning rate, after-effect) on one chart, overlaid with Garmin sleep score, overnight HRV, and previous-day training load.

## Technical approach
TypeScript + canvas, Pointer Events with `getCoalescedEvents()` so trajectories are sampled at full device rate rather than at frame rate. Movement onset = first sample past 2% of target distance; hand angle taken at peak radial velocity (the standard, robust to online correction). Two-state fit by least squares over the error series using L-BFGS in a small Rust→WASM optimizer. Storage: SQLite behind a tiny Node server (IndexedDB in pure-client mode). Garmin pulled nightly via `python-garminconnect` into the same DB, joined on date.

The genuinely hard part is **savings**: you get better at adapting over weeks, so a monotone practice trend must be fit and removed before any claim about sleep survives. Second hard part: a trackpad is not a reaching arm — fixed screen-to-hand gain, an enforced consistent posture prompt, and treating every metric as strictly within-subject.

## v1 scope
- One fixed 30° rotation, 8 targets, 44 trials total
- Browser-only, local SQLite, no accounts
- One chart: after-effect vs date, plus CSV export
- Manual sleep-hours entry before any Garmin integration

## Out of scope
Webcam pose, phone accelerometer, multi-user comparison, anything resembling a clinical or neurological claim.

## Risks & unknowns
Practice effects may dominate the sleep signal entirely. Trackpad noise may exceed the effect size. Adherence: a task that gets skipped measures nothing.

## Done means
21 consecutive days logged; the two-state fit converges on ≥80% of sessions; a deliberately sleep-deprived or caffeine-free morning moves the after-effect outside the trailing 14-day interquartile range.
