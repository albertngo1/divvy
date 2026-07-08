## Overview
Toe-Off is a phone app that turns a 10-second video of someone walking into a readable gait report. Aimed at pediatric physical therapists, worried parents, and recreational runners, it runs pose estimation on-device and flags common, screenable gait deviations without any wearable sensors or a lab.

## Problem
Formal instrumented gait analysis lives in a handful of hospital motion labs — expensive, backlogged, and inaccessible for a first-pass "should we even worry?" question. Meanwhile the underlying capability (skeletal pose from ordinary video) is now free. There's a real arbitrage between what a lab charges and what a phone can already estimate for a screening-grade look.

## How it works
1. Prop the phone at hip height; subject walks across the frame twice (toward and away, plus one side pass).
2. The app tracks joints per frame and segments gait cycles at heel-strike/toe-off events.
3. It computes cadence, step-time symmetry (left vs. right), stance/swing ratio, knee/ankle range of motion, base of support, and a toe-walking indicator (persistent forefoot initial contact).
4. Output is a traffic-light report: green (typical), yellow (asymmetry worth a clinician's eye), plus a labeled stick-figure overlay and shareable PDF the parent can hand to a PT.

## Technical approach
Stack: React Native + on-device MediaPipe/BlazePose (or Apple Vision body pose) for 2D joint tracking at 30–60fps. Gait-event detection uses ankle/heel vertical velocity zero-crossings; cycles are normalized to 0–100% and compared left/right via a symmetry index. Camera geometry is roughly corrected using the subject's known height for scale. The genuinely hard part is robustness: perspective distortion, loose clothing, and single-camera 2D ambiguity mean the app must (a) reject bad captures with a quality gate and (b) only report metrics stable enough for screening, never diagnosis. Reference bands come from published pediatric/adult normative gait ranges baked in as lookup tables.

## v1 scope
- Single side-view walk capture with quality gate
- Cadence + left/right step-time symmetry + toe-walking flag
- Stick-figure overlay video
- One-page shareable PDF

## Out of scope
- 3D/multi-camera reconstruction
- Any diagnostic claim or medical-device positioning
- Longitudinal tracking dashboards
- Running economy/coaching metrics

## Risks & unknowns
- 2D single-cam accuracy vs. clinical ground truth needs validation
- Regulatory line: must stay firmly "screening/educational"
- Pediatric subjects move unpredictably; capture UX is hard
- Liability of false reassurance

## Done means
On a set of recorded walks including a deliberately asymmetric gait and a toe-walking sample, the app correctly flags the abnormal ones as yellow and typical walks as green, and outputs a legible overlay + PDF, all processed on-device.
