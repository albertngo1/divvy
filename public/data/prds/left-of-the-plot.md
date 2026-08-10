## Overview
A Mac menubar agent plus screensaver that records nothing but timestamps of your activity, and slowly renders one picture: the log-log power spectral density of you. Nature is full of 1/f noise — heartbeats, Nile floods, loudness in music — and the fitted slope β says whether your life is white (β≈0, purely reactive, no structure above the day), pink (β≈1, scale-free, the healthy human default), or brown (β≈2, drifting in long slow tides). For anyone who has bounced off habit trackers because "7-day streak" is the wrong unit of analysis.

## Problem
Every quantified-self tool answers "how much, this week." None answer "at what timescales does my behavior have structure?" — which is the question that distinguishes a bad Tuesday from a six-month slide. And the low-frequency answer is genuinely unpurchasable: to resolve a 4-month cycle you must have lived 8 months of logging. That's a feature no subscription can shortcut, and it makes the artifact worth keeping running.

## How it works
Install, then forget it. Once a second the agent stores one byte: active/idle (from `CGEventSourceSecondsSinceLastEventType`), plus a frontmost-app id (NSWorkspace notifications) and lock/unlock events. Optional HealthKit pull for step counts and sleep onset. The screensaver draws the periodogram with axes fixed from 10⁻⁷ to 10⁻² Hz; points illuminate only once you've earned the resolution, so the plot grows leftward across the year, and the app celebrates a "spectral birthday" the day a new decade lights up (day ~12, ~4 months, ~3.3 years). A fitted slope with a confidence band crawls across it, and reference spectra — a heartbeat, a Bach cello suite, the Nile — can be overlaid faintly for scale.

## Technical approach
Swift + Metal. Storage is a flat mmap'd `uint8` array, one sample per second: 31.5 MB per year, so no database. Estimation uses a multitaper (Slepian) periodogram for the display and Detrended Fluctuation Analysis for the headline exponent (α from DFA, β = 2α − 1), since DFA tolerates nonstationarity far better than raw FFT. Gaps — vacations, laptop closed — are handled by Lomb–Scargle rather than zero-filling, which would fake a slope. The genuinely hard part: human activity has enormous deterministic peaks at 1/86400 Hz and 1/604800 Hz plus harmonics, and if you regress across them you get a meaningless β. So the pipeline notches the circadian/weekly comb (fit and subtract a periodic mean profile first), then fits the slope on the residual across the surviving decades, and reports the fit's R² so a bad estimate shows as a wide band instead of a confident lie.

## v1 scope
- Menubar agent recording the single active/idle bit, nothing else
- One screensaver view: log-log points, fitted slope, decade markers
- Circadian comb removal + DFA exponent
- Bootstrapping demo mode that renders a synthetic prior year so day one isn't blank

## Out of scope
HealthKit, app-level breakdowns, cross-device sync, any social comparison, any advice.

## Risks & unknowns
β may be uninterpretable for most people — the honest outcome is a beautiful plot with no actionable meaning, which is fine for a toy and fatal for a product. Idle-bit sampling may be too coarse; multi-machine users get a punctured record.

## Done means
After 30 days of real logging on one Mac, the screensaver renders the spectrum from 1/60 Hz down to 1/(30 days) with the daily peak suppressed, and the β estimated from the first half agrees with the second half within ±0.1.
