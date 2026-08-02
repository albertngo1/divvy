## Overview
Rod Break is a solo, ten-minute home test that measures your own dark-adaptation curve — the recovery of visual sensitivity after a bright light — and extracts the two numbers clinicians care about: the *rod-cone break* (when rod photoreceptors overtake cones, normally ~7-10 min) and the *rod intercept time* (when you cross a fixed sensitivity criterion). For astronomers, night drivers, night-shift workers, and anyone over 50 curious about a signal that degrades years before visual acuity does.

## Problem
Dark adaptometry is a real, well-validated measurement performed by a $10k+ clinical instrument that almost nobody has access to. Meanwhile the everyday version of the question is universal and unanswered: *how long after I put my phone down can I actually see the sky / the road / the stairs?* People trade folklore ("twenty minutes", "use red light") with zero personal data. And the one thing everyone does — glancing at a screen mid-adaptation — has a cost nobody has ever seen quantified for themselves.

## How it works
Dark room, phone face-up on a stand at a marked distance, headphones in.
1. **Bleach**: full-screen white at max brightness for 45s, fixation cross in the middle. This photobleaches a known fraction of rhodopsin.
2. **Track**: every ~20 seconds the app runs a fast staircase. A dim circular target flashes for 200ms in one of four quadrants at 12° eccentricity (rod-rich, off the fovea); you tap the quadrant you saw. Correct → dimmer next time; miss → brighter. A 2-down-1-up staircase converges on your ~71% threshold.
3. **Curve**: thresholds are plotted in log units against time. The app fits the classic biphasic model — a fast exponential cone branch and a slower rod branch — and reports the break point, the rod recovery time constant, and your final plateau.
4. **The mischief**: an optional "Just One Look" mode interrupts you at minute six with three seconds of bright screen, then keeps measuring. You watch, on your own curve, the twelve minutes you just threw away.

## Technical approach
Native iOS/Android (or Capacitor) — you need `UIScreen.brightness` / `Settings.System.SCREEN_BRIGHTNESS` locked and the ambient-light auto-brightness disabled. Stimulus luminance is driven by two dials stacked: system brightness plus a 10-bit grayscale value rendered on a wide-gamut display, giving roughly 4.5 log units of usable range on a modern OLED — measured, not assumed. Calibration is the crux: a one-time per-device profile derived from published panel gamma plus an in-app matching task (adjust patch until it just disappears against a reference dither pattern), and a device allowlist so unknown phones get relative-only results. Data model: one session = ordered `(t_seconds, log_threshold, quadrant, correct)` trials; fit via scipy-style Levenberg-Marquardt on-device (or a tiny Nelder-Mead in TS) to `S(t) = min(cone_branch, rod_branch)` with a hinged two-line fit as the robust fallback. Store locally, export CSV. The genuinely hard parts: (a) OLED black-level and per-pixel dimming behavior makes very dim patches unreliable — dithered gray at moderate levels beats true near-black; (b) attention and blink artifacts corrupt staircases, so include catch trials with no stimulus and discard sessions with >20% false-positive taps.

## v1 scope
- One test, 10 minutes, one eccentricity, four-alternative forced choice.
- Single hardcoded device profile (the developer's phone) plus a big "relative results only" banner for everything else.
- Output: the raw curve plus a hinge-fit break time. No health claims.
- Local storage, CSV export, no account.

## Out of scope
- Any diagnostic or AMD-screening claim, per-eye testing, mesopic contrast sensitivity, cloud sync, comparison against population norms.

## Risks & unknowns
- Absolute luminance calibration without a photometer may simply not be good enough; the honest fallback is within-person relative tracking, which is still the useful thing.
- A phone screen may not bleach enough rhodopsin to produce a textbook curve — needs a pilot against a known bright source.
- Ten minutes of tapping in the dark is a big ask; the payoff has to be the curve itself, drawn live as it forms.

## Done means
The same person tests three nights running and the fitted rod-cone break lands within ±90 seconds each time — and the Just One Look session visibly, reproducibly resets the curve.
