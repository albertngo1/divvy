## Overview
A browser-based (PWA, no app store) daily posturography test. Four twenty-second stands, phone at the waistband, and it returns not a score but a *sensory weighting*: how much you are leaning on vision vs. joint/skin feedback vs. your inner ear. Aimed at solo self-trackers, people rehabbing an ankle, and anyone over 40 who noticed that balance is the one fitness axis nobody measures.

## Problem
Balance is among the strongest all-cause-mortality correlates and it declines silently. The consumer version is a stopwatch and a pass/fail — far too coarse to show change in weeks. Real posturography lives on $15k force plates in clinics. And a single number is useless anyway: two people with identical sway times can have completely different causes, and the training that fixes one does nothing for the other.

## How it works
Each morning: four trials, 20s each — feet together eyes open, feet together eyes closed, single-leg eyes open, single-leg on a folded pillow eyes closed. The phone sits in your waistband at roughly L5. It counts you in, requires a 2s still period to fingerprint placement, then records. The eyes-closed/eyes-open ratio per stance pair is the classic Romberg quotient; the four-condition pattern (the modified Clinical Test of Sensory Interaction on Balance) resolves into three reliance weights that get plotted as a point in a triangle. Day over day the point drifts. Booze, four hours of sleep, and a hard leg day each push it in a distinct, visible direction.

## Technical approach
Vanilla TS + Vite PWA. `DeviceMotionEvent` at ~60Hz (iOS 13+ requires `requestPermission()` behind a tap). Orientation via complementary filter (α≈0.98) fusing `rotationRate` integration with the accelerometer tilt vector, then rotate raw accel into an earth frame and subtract gravity.

Do **not** double-integrate to displacement — drift dominates at 20s. Compute standard smartphone-posturography metrics straight off acceleration: RMS in anteroposterior and mediolateral axes, 95% confidence-ellipse area of the AP–ML scatter, mean sway velocity (jerk), and frequency-domain 95% power frequency + centroid from a Welch PSD. These are the ones validated against force plates in the literature.

Sensory weights: solve a 3-vector from the four condition ratios (non-negative least squares against the mCTSIB condition→system loading matrix), normalize to a simplex. All metrics z-scored against your own rolling 60-day median with MAD, so absolute calibration never matters — only your deltas do.

Hard part: placement variance swamps the biology. Mitigation is a placement fingerprint (gravity-vector orientation captured during the pre-trial still period); any trial more than 10° off your baseline orientation is rejected and re-prompted rather than silently scored. Storage: IndexedDB, raw traces kept locally, JSON export.

## v1 scope
- Two conditions only (feet-together EO/EC), 20s each
- RMS + ellipse area + Romberg quotient
- Placement gate, IndexedDB, one 30-day sparkline
- Big "stand near a counter" safety screen

## Out of scope
- Sensory triangle (v2), Apple Watch, HealthKit sync
- Fall prediction, any clinical claim, accounts/cloud

## Risks & unknowns
- Eyes-closed single-leg is a genuine fall hazard; gate it hard
- Browser IMU sample rates vary and throttle in background
- Daily adherence to a boring 90-second ritual is the real product risk

## Done means
Fourteen consecutive days logged; the EC/EO quotient reproduces within ±15% across two same-day sessions; and a deliberately sabotaged day (ten spins before the test, or two drinks) lands outside the 2-MAD band.
