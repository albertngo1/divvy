## Overview
A single-page explorable explanation where the reader trains, admires, and then demolishes a non-invasive "PPG → blood glucose" model. Audience: people who keep seeing wearable-glucose claims and can't tell why reviewers are unconvinced; students learning why leakage beats physics as an explanation for a good-looking result.

## Problem
There is a steady stream of papers and startups claiming glucose from a fingertip pulse waveform, and the standard evidence — a Clarke Error Grid with everything in Zone A, a MARD of 6% — looks unarguable. The failure isn't optics, it's evaluation: random train/test splits let a model memorize *which subject* a pulse belongs to, and per-subject label means are enough to score beautifully. That failure mode is invisible in every plot the field publishes.

## How it works
Three acts on one page.
**Act 1 — Collect.** Optional: hold a fingertip over the laptop camera for 60 s. Green-channel mean over a 100×100 ROI at 30 fps → bandpass 0.7–4 Hz → peak detection → 30 morphology features (rise time, width at 50%, dicrotic notch depth from the second derivative, HR, HRV, area ratios). Your samples join a bundled public dataset with subject IDs.
**Act 2 — Impress.** Train the standard recipe: random 80/20 split, 200-tree gradient boosting. Render the Clarke Error Grid, MARD, Bland–Altman. It looks publishable.
**Act 3 — Sabotage.** Four toggles re-render the *same* grid live: (a) subject-wise split instead of random; (b) shuffle labels within each subject; (c) replace the PPG features with Gaussian noise but keep each subject's label mean; (d) predict-the-global-mean baseline. The noise model and the mean baseline nearly match the "real" one; the honest subject-wise split collapses into Zones B and C.

## Technical approach
Static site, no server. TypeScript + `getUserMedia` for capture; biquad cascade for the bandpass; a hand-rolled 200-tree GBM in TS (fast enough on ~2k rows) so training runs client-side and instantly. Clarke grid as SVG from the published zone polygon boundaries; Bland–Altman with limits of agreement. Bundled data: a public PPG dataset that carries subject IDs (e.g. the PPG-BP set on figshare, or a Zenodo/Mendeley PPG-glucose collection) — licenses must be verified, with a documented synthetic generator as fallback that injects *only* subject-level leakage. The hard part is architectural: the honest and dishonest pipelines must share one code path, with the toggles changing three lines, and a visible diff panel showing exactly those three lines.

## v1 scope
- No camera; bundled dataset only
- Two toggles: random vs subject-wise split, real vs shuffled labels
- One Clarke Error Grid + one number (Zone A %)
- ~800 words of prose around it

## Out of scope
Any actual glucose claim, other biomarkers (BP, SpO₂, hemoglobin), mobile layout, a write-up for publication.

## Risks & unknowns
Dataset licensing and availability; if the bundled data lacks subject IDs the entire thesis is unprovable. Misreading risk — someone screenshots Act 2 as a working glucose meter, so Act 2 needs a permanent "this is the trap" banner. Feature extraction from a laptop camera may be too noisy to even reach Act 1.

## Done means
One page where flipping "subject-wise split" moves Zone A from >90% to <60% on the identical trained pipeline, and the pure-noise input still scores above 80% Zone A.
