## Overview
A macOS screensaver (or fullscreen idle app) that captures a few dozen samples of your own handwriting once, then uses every idle hour to evolve a generative motor model of *your hand*. On screen it looks like a plotter quietly practicing: a pen nib traces candidate signatures at true human speed, ghosting the best-so-far behind it. Each morning it hands you a card with six versions of your name, one of which you actually wrote.

## Problem
Ambient toys are almost all decorative — noise that never accrues. This one has a slow, personal arc with a daily verdict: it is measurably getting better at being you, and you can feel the exact night it passes you. Also, handwriting synthesis research (kinematic theory, robot trajectory learning) produces gorgeous motion that nobody ever renders for fun.

## How it works
1. **Enroll** (3 min): write one word or your signature 20 times on the trackpad. Capture at full rate with `PointerEvent.getCoalescedEvents()` (~120 Hz on Force Touch trackpads, plus pressure).
2. **Fit**: model each sample as a sequence of overlapping lognormal velocity strokes (Plamondon's Sigma-Lognormal / Kinematic Theory), each stroke parameterized by (D, t₀, μ, σ, θ_start, θ_end). Fit with CMA-ES minimizing signal-to-noise ratio between reconstructed and observed velocity profiles.
3. **Generate**: perturb fitted stroke parameters within your measured per-parameter variance to synthesize *new* instances — not replays.
4. **Adversary**: a small 1-D CNN over (velocity, curvature, pressure) sequences is trained on real-vs-synthetic. Nightly CMA-ES minimizes discriminator confidence plus kinematic priors (bell-shaped velocity profiles, minimum-jerk residual).
5. **Render**: canvas/Metal pen trace at real time-scale, ink bleed proportional to inverse pen speed, paper grain, the discriminator's score bleeding in as a faint number.

## Technical approach
Electron or a native `.saver` bundle wrapping a WKWebView. Storage: SQLite — `samples(id, points BLOB, ts)`, `fits(sample_id, strokes JSON, snr)`, `candidates(night, params JSON, disc_score, dtw_to_nearest_real)`, `tests(night, chose_real BOOL)`. Training is CPU-cheap (models are tiny; sequences are ~300 points).

The genuinely hard part is **collapse**: the generator's easiest win is reproducing a training sample. Fix by holding out 5 samples, and rejecting any candidate whose DTW distance to its nearest real sample falls below a floor calibrated from your own sample-to-sample DTW spread. The objective is fidelity *and* novelty, scored jointly.

## v1 scope
- One word, 10 samples, trackpad only, no pressure
- Dynamic Movement Primitives instead of Sigma-Lognormal (far easier to fit)
- No discriminator: score candidates by DTW distance to the sample cloud
- Renders one candidate per minute, black ink on white, no shaders
- Morning card: 6 images, one real, tally kept in a text file

## Out of scope
Stylus/tablet input, full sentences, exporting vector paths, any cloud sync.

## Risks & unknowns
It is, plainly, a signature-forgery practice rig — keep it strictly local, no SVG/path export in v1. DMPs may look robotically smooth without lognormal timing. Trackpad sampling jitter may swamp the kinematic signal.

## Done means
On night 1 you pick the real signature out of 6 with ~100% accuracy. By night 7 your accuracy is under 50%, measured over 7 daily cards, and no winning candidate is within the DTW floor of a training sample.
