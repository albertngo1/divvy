## Overview
A browser game that runs the classic visuomotor rotation paradigm — the workhorse of motor-learning labs — on your trackpad, and turns the resulting parameters into a character sheet you level up daily. For anyone curious how their own brain recalibrates; costs nothing, takes three minutes.

## Problem
Every quantified-self app measures physiology (HR, sleep, steps). Nobody measures *learning* — how fast your nervous system re-maps a broken sensorimotor relationship, how much it retains overnight, how the two competing internal processes (a fast one that learns and forgets, a slow one that lags and persists) trade off in you specifically. That is measurable at home with zero hardware, and the result is a genuinely personal number nobody else has.

## How it works
Center-out reaching: 8 targets on a ring, shoot the cursor out fast (<400 ms), endpoint-only feedback so you can't correct mid-flight.
- **Baseline** (24 trials): veridical cursor.
- **Perturbation** (80 trials): the cursor is silently rotated 30° about the start point. You miss, then over ~20 trials you stop missing.
- **Washout** (16 trials, *no cursor at all*): this is the score. You still aim ~12–18° off. That residual is the **aftereffect** — the implicit recalibration you cannot consciously switch off.
- **Clamp block** (optional): feedback pinned at a fixed 15° error regardless of where you aim, isolating pure implicit adaptation (Morehead-style).

The game shows only the aftereffect magnitude, decay half-life, and day-over-day **savings** (relearning is faster on re-exposure) as three character stats.

## Technical approach
Vanilla TS + Canvas. **Pointer Lock API** for raw `movementX/Y` — critical, because macOS pointer acceleration would otherwise corrupt the hand-angle measurement. Hand angle is taken at peak radial velocity, not endpoint, to exclude online correction.

Data model (IndexedDB, exportable CSV): `trials(session, idx, target_deg, rotation_deg, clamp, hand_angle_pv, rt_ms, mt_ms, peak_v)`.

Analysis: fit the **two-rate state-space model** (x_fast, x_slow with retention A and learning rate B each) by least squares over the trial series — four parameters that are your actual stats. Trials are rejected if MT > 400 ms, RT > 1 s, or the velocity profile is bimodal (a correction).

Hard part: a trackpad is not an arm. Wrist/finger reaching produces smaller, noisier adaptation than lab manipulanda, so the gating on kinematics and the peak-velocity angle extraction do all the work of keeping the effect visible.

## v1 scope
- One 30° abrupt rotation, 8 targets, ~120 trials total
- Aftereffect chart + a single number
- Local storage only, CSV export
- No clamp block, no aiming reports

## Out of scope
Explicit/implicit decomposition via aiming landmarks, gradual schedules, mobile touch, any account system.

## Risks & unknowns
Trackpad adaptation may be too small to separate from noise. Pointer Lock behaves inconsistently across browsers. Daily repetition induces savings that confound the aftereffect baseline — needs a rotation-direction randomizer.

## Done means
Across 3 different people, mean hand angle in the no-feedback washout block exceeds 8° in the direction opposite the rotation, with the two-rate fit converging (R² > 0.7), and a second session the next day shows faster relearning than the first.
