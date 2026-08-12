## Overview
A browser tool (everything local, nothing uploaded) that extracts the *electrical* fingerprint hiding inside an ordinary indoor photograph. Almost every LED and fluorescent lamp pulses at twice the mains frequency — 100 Hz in Europe/Asia, 120 Hz in the Americas — and a CMOS phone camera exposes one row at a time, so that pulsing is smeared across the frame as faint horizontal banding. Fifty or Sixty recovers that banding and reports a continent-level provenance claim, a per-luminaire flicker signature, and a "no flicker detected" verdict that is itself interesting. For journalists, OSINT hobbyists, trust-and-safety reviewers, and anyone who wants to check a listing photo against the story attached to it.

## Problem
Image provenance tooling is stuck on EXIF (trivially forged, usually stripped) and C2PA manifests (almost nobody signs). Meanwhile a physical, hard-to-fake channel is sitting in the pixels of every indoor shot and there is no approachable tool to read it. Audio ENF forensics is a mature field; the visual equivalent lives in a handful of papers and zero usable apps.

## How it works
1. Load the full-resolution JPEG into a canvas, apply EXIF orientation, and undo the sRGB transfer curve so you are working in linear light.
2. Collapse each sensor *row* (the readout axis, not necessarily the image's top-to-bottom) to a mean luma, giving a 1-D signal of length = image height.
3. Kill scene content with a Savitzky–Golay high-pass: subtract a wide smooth of the row profile, leaving only the fast periodic ripple.
4. Welch-average the periodogram of that residual (zero-padded real FFT, Hann windows over overlapping row blocks). A genuine flicker shows as one sharp peak plus a weak second harmonic.
5. Convert peak period (in rows) to Hz using the device's line readout time, then classify 100 vs 120 Hz with a likelihood ratio and a confidence band.

## Technical approach
Vanilla TypeScript + a small WASM FFT (`kissfft` or hand-rolled radix-4); no server. Data model: `{deviceModel, lineTimeNs, lineTimeSigma, source}` in a crowdsourced JSON table, plus a per-image `FlickerReport {peakRows, snrDb, hz, hypothesisLR, sincSuppression}`.

The genuinely hard part: line readout time is unknown per phone and unpublished. Three attacks, all shipped. (a) A calibration mode — record 3 s of video of any lamp on a *known* grid and the tool solves for `lineTimeNs`, seeding the public table. (b) Exposure-time gating: banding contrast is multiplied by `sinc(f · t_exp)`, and `t_exp` is in EXIF, so exposures at integer multiples of 1/100 s null 100 Hz but not 120 Hz — sometimes the null alone decides it. (c) Constrain to the plausible readout range (roughly 5–40 µs/row) and reject hypotheses that imply impossible hardware.

Stretch: multi-frame video yields a frequency-vs-time trace matchable against published grid frequency logs (Statnett, National Grid, FNET/GridEye) for minute-level timestamp verification.

## v1 scope
- Single still image, drag-and-drop, one output line: `120 Hz (SNR 14 dB, LR 31:1)`.
- Row-profile plot and PSD plot side by side, so the user sees the peak, not just a verdict.
- Calibration recorder for one phone model; table checked into the repo.
- Honest "inconclusive" state whenever SNR < 6 dB.

## Out of scope
- Grid-log timestamp matching, video, deepfake claims, C2PA integration, mobile app.

## Risks & unknowns
- Modern phones apply multi-frame HDR and per-frame denoise that can average banding away entirely; expect a high inconclusive rate on flagship computational-photography pipelines.
- Aggressive JPEG quantization erases low-contrast ripple at 8×8 block scale.
- Overclaiming is the real hazard: "no flicker" means daylight, DC-driven LED, or heavy processing — *not* "synthetic". The UI must say this louder than the verdict.

## Done means
Given 30 test photos (15 shot in a 60 Hz country, 15 in a 50 Hz country, mixed devices, EXIF stripped), the tool classifies ≥ 80% of the conclusive subset correctly with zero confident-and-wrong calls, and the PSD peak is visible to the eye in the plot for every correct call.
