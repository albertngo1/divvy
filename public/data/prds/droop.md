## Overview

Droop is a desktop live wallpaper / screensaver whose only input is the *electric network frequency* (ENF) of the outlet your machine is plugged into. Nominal is 60.000 Hz (50 in Europe), but the real number wanders by tens of millihertz all day: it dips when load exceeds generation, rises when it's oversupplied, and twitches when a big plant trips. Droop reads that wander off your own power wiring and renders it as a slow, never-repeating generative field. It's named for governor droop control — the mechanism by which generators sag under load.

For: people who like ambient screens that are *about* something real. Anyone who has ever wanted a window into infrastructure.

## Problem

Generative wallpapers are almost always driven by noise functions or a clock — beautiful but inert, because nothing is at stake. Meanwhile there's a genuine, continuously-varying physical signal running through every wall in the building that nobody looks at. ENF is well-known to audio forensics (it timestamps recordings) and invisible to everyone else.

## How it works

1. Capture 48 kHz audio from the mic or line-in. Mains hum leaks into every consumer ADC; a $3 coil pickup near the power brick makes it unmissable.
2. Bandpass 59–61 Hz (and the 120/180 Hz harmonics, which are often stronger than the fundamental), Hilbert-transform to the analytic signal, and estimate instantaneous frequency from the unwrapped phase slope over a 4–16 s window. A Kalman smoother on top gets ~±1 mHz — enough to see the evening peak.
3. Map to visuals: deviation above nominal → the field blooms outward, cools toward blue, strokes lengthen; below nominal → it compresses, warms, crowds. Rate-of-change (ROCOF) drives turbulence. Total harmonic distortion of the hum becomes grain — a dirty circuit literally looks dirtier.
4. A 24-hour ribbon along the bottom edge holds the day's trace, so the morning ramp and the 6pm peak are legible at a glance.
5. Optional audio: a sine locked to exactly 60.000 Hz plus the measured hum, an octave or three up. The beat frequency you hear *is* the grid error.

## Technical approach

Rust core (`cpal` for audio, `rustfft`, custom Hilbert via FFT) feeding a `wgpu` fragment shader; ships as a macOS `.saver` bundle and a Wallpaper Engine web scene. Estimator: quadratically-interpolated FFT peak for coarse lock, then phase-slope regression for fine. Fallback when the mic hears nothing: poll a public grid-frequency feed (gridradar.net, FNET/GridEye) and render from that with a "remote" badge. Store 30 days of 1 Hz samples in a flat ring-buffer file (~2.6 MB).

The genuinely hard part is the SNR: on a laptop on battery in a quiet room the hum can sit at −70 dBFS under fan noise, and USB-C chargers inject switching noise that masquerades as harmonics. Detecting "I have no real lock" and degrading honestly matters more than the shader.

## v1 scope

- macOS screensaver only, 60 Hz regions only
- One visual preset, one palette
- Mic capture + "no lock" fallback to a public feed
- The 24-hour ribbon

## Out of scope

Sonification, multi-region 50 Hz, Windows, comparing your reading to the regional feed to detect local wiring effects, alerting.

## Risks & unknowns

Many laptop mics high-pass aggressively above 80 Hz, killing the fundamental — the 120 Hz harmonic may be the only usable line. Always-on mic access for a screensaver is a hard sell; needs a very clear "audio never leaves the device" story. Grid deviations may be too small to read as *art* without exaggeration, and exaggerating is lying.

## Done means

Running on a wall outlet, Droop's measured frequency tracks the published regional ENF trace for the same hour with median absolute error under 5 mHz, and a naive observer watching the screensaver at 7pm can tell you the grid is loaded.
