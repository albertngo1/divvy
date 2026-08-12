## Overview
A local CLI and small static dashboard for people who already wear a Garmin/Oura/Apple Watch and keep trying N-of-1 experiments on themselves. Underpowered inverts the usual flow: instead of running a trial and reporting a result, it starts by quantifying how noisy *you personally* are on each metric, then publishes a blunt feasibility ledger — the minimum effect it could ever detect, per metric, per trial length. Most rows come back "not detectable in a year." That is the product.

## Problem
Self-experimentation is dominated by underpowered n=14 A/B splits interpreted as fact. A person compares 7 caffeine-free nights to 7 caffeine nights, sees HRV up 3 ms, and changes their life — when their own night-to-night HRV SD is 11 ms and the comparison had roughly 20% power. Nobody computes power first, because nobody knows their own variance. The data to compute it is already sitting in their account.

## How it works
1. **Pull.** Two years of daily metrics: resting HR, HRV (rMSSD), sleep duration and efficiency, steps, VO2max estimate, body battery.
2. **Decompose.** For each metric, strip the slow trend (STL or a 60-day loess) and the day-of-week seasonality, leaving residuals. Estimate residual SD `σ` and lag-1 autocorrelation `ρ`.
3. **Deflate.** Autocorrelated days are not independent days. Effective sample size `n_eff ≈ n·(1−ρ)/(1+ρ)` — for HRV with `ρ ≈ 0.4`, six weeks of data is worth about three.
4. **Report.** For each metric and each horizon (2, 4, 8, 12, 26, 52 weeks), compute the minimum detectable effect at 80% power for two designs: simple parallel blocks, and alternating ABAB crossover (which reclaims a lot against slow drift). Print it in the metric's own units *and* as "the published effect size of X is Y — you would need Z days."
5. **Then, and only then, randomize.** If a question clears the bar, the tool generates a blocked randomization schedule, emits it as an `.ics` calendar of daily assignments, writes a preregistration YAML (metric, design, horizon, primary endpoint, analysis method), and SHA-256s it into a local ledger so the analysis cannot be quietly retuned later.

## Technical approach
Python + `statsmodels` (STL, ARMA), `scipy.stats` for power, DuckDB as the local store, a static HTML report rendered with Jinja. Ingestion via `garminconnect` and the Strava API for activity streams; Apple Health via a one-off `export.xml` parse. Data model: `daily_metric(date, metric, value, source)` plus `trial(id, metric, design, horizon_days, preregistration_sha256, status)`.

The genuinely hard part is that the naive `n_eff` correction is optimistic for these signals: HRV residuals are closer to long-memory than AR(1), and the real killer is *confounding by trend* — an eight-week trial silently competes with seasonal drift in fitness and daylight. The crossover design and the block randomization exist specifically to beat that, and the power calc must use the crossover's within-block contrast variance, not the raw residual SD.

## v1 scope
- Garmin only, one command: `underpowered audit`.
- Three metrics: RHR, HRV rMSSD, sleep duration.
- One printed table: metric × horizon → minimum detectable effect.
- No trial runner, no randomizer, no dashboard.

## Out of scope
- Multi-user, cloud sync, effect-size library of published studies, Bayesian sequential designs, anything resembling medical advice.

## Risks & unknowns
- Device-derived HRV has its own measurement drift (strap position, firmware updates) that inflates `σ` and may make everything look hopeless — need a firmware-change detector.
- Carryover effects break the crossover assumption for anything with a long half-life (creatine, training load).
- The product's honest answer is often "don't bother," which is correct and commercially terrible.

## Done means
Running the audit on two years of real Garmin data prints a table where at least one row says the user's noise floor exceeds a commonly claimed effect, and re-running it on a synthetic series with a known injected effect and known noise recovers the correct minimum detectable effect within 15%.
