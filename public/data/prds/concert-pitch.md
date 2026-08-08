## Overview
A year-long ambient science instrument for one curious person in one building. A cheap accelerometer (or just a spare phone on a windowsill) records ambient sway 24/7, extracts the structure's fundamental vibration mode, and renders a slowly-growing wallpaper: a ring spectrogram where the building's fundamental frequency drifts up in winter and sags in summer heat. At the end of the year you print it.

## Problem
Every building has a resonant frequency in the 0.5–10 Hz band, excited constantly by wind, traffic, and HVAC. Structural engineers measure this with ambient-vibration modal analysis; everyone else lives inside the resonator and never hears the note. The measurement needs no shaker, no permission, and no expensive hardware — only patience, which is exactly what an ambient artifact is good at. Nothing consumer-facing turns that into something you can watch change.

## How it works
1. A sensor sits on a floor near a wall, ideally the top floor, undisturbed.
2. Every 10 minutes it captures a 5-minute window of 3-axis acceleration.
3. The window is Welch-averaged into a power spectral density; peaks in 0.3–12 Hz are candidate modes.
4. Peaks are tracked across windows as trajectories; the strongest persistent one is declared f0.
5. f0 is joined against local temperature/wind from Open-Meteo by timestamp.
6. A menubar item shows today's f0 in Hz and cents relative to the year's median, plus a one-click sonification: f0 pitch-shifted up 7 octaves so you can literally hear the building go flat.
7. The wallpaper regenerates nightly — one radial slice per day, 365 slices closing a circle.

## Technical approach
Sensor: ESP32 + ADXL345 at 400 Hz over USB serial, or zero-hardware v1 using a parked phone running a DeviceMotion web page at ~60 Hz (Nyquist 30 Hz — plenty for building modes) POSTing batches. Ingest and analysis in Python: SciPy `welch` (Hann, 50% overlap, ~0.01 Hz resolution), peak-picking with prominence gating, damping estimated by half-power bandwidth. With two or more channels, upgrade to Frequency Domain Decomposition — SVD of the cross-power spectral density matrix per frequency bin — which separates closely-spaced modes that peak-picking merges. Storage: SQLite, one row per window (ts, f0, amplitude, damping, temp, wind, top-5 peaks as JSON). Render with matplotlib/Cairo to a 6K PNG.

The genuinely hard part is telling a structural mode from a machine. HVAC fans, fridges, and pumps produce sharp, temperature-independent lines at motor RPM harmonics; footfall is transient and broadband. The discriminator: a real mode's frequency correlates with outdoor temperature (typically a fraction of a percent to a few percent per 10 °C) and its amplitude scales with wind, while a fan's line sits at a fixed frequency regardless. Score each tracked peak on temperature coherence over the first two weeks and lock onto the winner.

## v1 scope
- Phone web page + local Flask collector, one axis, one room
- 10-minute duty cycle, SQLite, no auth
- Welch PSD + peak-picking, single f0, no damping
- One static PNG chart: f0 vs. day, temperature on the second axis
- A `sonify` CLI that plays the last hour shifted into hearing range

## Out of scope
Multi-sensor mode shapes, earthquake detection, alerting, cloud sync, comparing buildings with strangers.

## Risks & unknowns
Phone accelerometers may be too noisy below 1 Hz for a stiff low-rise; the mode may be buried under HVAC. Sensor drift or someone moving the phone breaks continuity. Temperature effect may be swamped by humidity in wood-framed homes.

## Done means
After 30 days of continuous recording, a single tracked peak exists whose frequency correlates with outdoor temperature at |r| > 0.5, and the wallpaper renders that drift legibly without hand-tuning.
