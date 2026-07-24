## Overview
Dead Time is a local, offline analysis tool that treats you as a feedback control loop with **transport delay**. It estimates the lag between each lever you pull (bedtime, caffeine cutoff, training load, alcohol, steps) and each outcome you track (HRV, resting HR, sleep score, subjective mood), then diagnoses whether your own day-to-day corrections are stable or oscillating. For one person with a year of wearable data and a habit of over-tuning.

## Problem
Every habit and recovery app assumes same-day feedback: you did the thing, here's your score. Physiology doesn't work that way. Training load hits HRV days later. A bad sleep week shows up in mood after the week. So you judge yesterday's lever with today's number, correct too hard, get whipsawed, and end up chasing noise — the shower-dial problem, where the water is always too hot or too cold because the pipe is long. Nothing in the quantified-self stack names this failure mode, let alone measures it.

## How it works
1. **Ingest**: 6–12 months of daily series from a Garmin export (or Apple Health `export.xml`) plus your own three-tap manual logs.
2. **Find the lag**: for each (lever, outcome) pair, AR-pre-whiten both series, then compute cross-correlation at lags 0–14 days. Report the peak lag, effect size, and a **moving-block bootstrap** CI. Benjamini–Hochberg across all pairs, because dozens of comparisons on ~300 samples will otherwise hand you a beautiful lie.
3. **Fit the plant**: for surviving pairs, fit a first-order-plus-dead-time model (gain K, time constant τ, dead time θ) via `scipy.optimize.curve_fit`. This yields a step-response card per lever: *"cut caffeine after 2pm → sleep score responds with θ≈1 day, τ≈3 days, +6 points at steady state."*
4. **Measure your own gain** — the mischievous part. Regress your *next-day lever change* on the prior day's outcome deviation. That's your controller gain K_c. Combine with the measured loop delay θ and check the stability margin: if K_c·K·θ exceeds roughly the Ziegler–Nichols ultimate-gain threshold, the report says plainly: **"you are oscillating. Your training-load loop has ~4 days of dead time and you are correcting every day. Halve the correction or wait."**
5. **Show it**: a 90-day phase-plane plot (outcome vs. rate of change) where a stable loop spirals inward and an over-tuned one orbits — you can see your own hunting.

## Technical approach
Python, pandas, `statsmodels` (CCF, AR pre-whitening), `scipy` for FOPDT fitting, static HTML report via Jinja + matplotlib. `garminconnect` for pull, or file-drop for the Apple Health XML (streaming parse with `lxml.iterparse` — that file is gigabytes).

The genuinely hard part is epistemic, not numerical. Autocorrelated daily series make naive CCF significance wildly optimistic; pre-whitening plus block bootstrap is mandatory, not optional. And everything is observational — you train harder *because* you slept well, so causality runs both directions through every arrow. So the report never says "causes." It says "candidate lag," and its final section auto-generates a **two-week randomized self-experiment**: coin-flip the lever nightly, here's the power calculation, here's how many days until you can claim anything. That honesty is the product.

## v1 scope
- One CSV in: `date, lever_value, outcome_value`
- Pre-whitened CCF at lags 0–14 with a block-bootstrap CI
- One PNG: lag profile plus a phase-plane spiral
- Printed one-line verdict: peak lag ± CI, and stable / oscillating

## Out of scope
Wearable API auth, multi-lever models, any LLM narration, coaching prescriptions, mobile app, sharing.

## Risks & unknowns
One person's ~300 daily samples may simply not contain enough signal, and the honest answer will often be "no detectable lag," which is scientifically correct and commercially fatal. The controller-gain estimate assumes your lever changes are deliberate corrections rather than dictated by work and weather. Overclaiming here shades into medical advice.

## Done means
Fed a synthetic series with a known injected 4-day lag plus realistic noise and autocorrelation, the tool recovers 4±1 days with a CI excluding zero — and fed pure noise, it reports no detectable lag rather than inventing one.
