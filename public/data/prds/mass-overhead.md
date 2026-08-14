## Overview

Mass Overhead is a phone app plus a desktop analyzer that uses a camera sensor as a cheap particle detector, then does something nobody does with it: rather than just counting cosmic rays for the novelty, it turns the **ratio** of counts between two locations into an estimate of the mass of material between them and the sky. For the person who wants to know how much concrete is actually over their parking-garage office, whether their basement is a decent radiation shelter, or how thick that 1920s floor slab really is — measured, not guessed from drawings nobody has.

## Problem

Muon radiography is real science (it found the void in Khufu's pyramid) and the detector in your pocket costs nothing extra. But every phone cosmic-ray app stops at "you caught 14 particles, share on social" — a party trick with no quantity attached. Meanwhile the actual useful number, *how much mass is overhead*, is invisible: as-built drawings are wrong or missing, and hiring anyone to core-sample a slab costs more than the answer is worth.

## How it works

1. Kill the lights, tape the phone lens-down to the floor with electrical tape over the camera. Start a run.
2. The app captures raw frames continuously at low ISO for 6–10 hours, discarding frames until the sensor is thermally settled, and logs every pixel cluster above threshold with its shape, energy, and timestamp.
3. Move to the next floor. Repeat the next night. Same phone, same orientation, similar temperature.
4. The desktop analyzer masks that phone's persistent hot pixels, classifies clusters (dots = gammas/noise, tracks = muons), computes rate per hour, and converts the between-location rate ratio into meters-water-equivalent of overburden with an uncertainty band.

## Technical approach

Capture: Android CameraX with `RAW_SENSOR` (Bayer, no denoise, no JPEG) — this is why v1 is Android; iOS won't hand over unprocessed frames cheaply. 10 fps, minimum exposure long enough to integrate, ISO pinned low.

On-device triage: run a threshold at (per-pixel running median + k·MAD) so we upload event crops, not video. Each event stored as a 32×32 crop + centroid + sum-ADU + eccentricity + frame index.

Hot-pixel masking is the make-or-break step: build a per-device mask from a 30-minute pre-run, and additionally reject any pixel firing in >0.1% of frames during the run itself. Thermal noise scales viciously with temperature, so log battery temp per frame and refuse to compare runs more than ~4 °C apart.

Classification: muon tracks are elongated multi-pixel streaks with energy roughly proportional to path length; noise and gammas are single-pixel or round blobs. A hand-tuned cut on (eccentricity, pixel count, total ADU) beats a model here and is auditable — v1 uses cuts and reports how many events each cut removed.

Overburden: sea-level vertical muon flux is ~1 cm⁻²min⁻¹; attenuation vs depth follows a well-measured curve (Groom/PDG tables) in meters-water-equivalent. Fit the observed ratio to that curve with Poisson errors. Sensor active area is ~0.2 cm², so a 10-hour run is a few hundred events — statistics, not the physics, is the hard part, and the honest output is a wide band.

## v1 scope

- Android capture service: raw frames, threshold, write events to a local SQLite file.
- Hot-pixel mask from a 30-minute dark pre-run.
- Python analyzer: cluster classification cuts, rate/hour with Poisson error bars, event gallery so you can eyeball real tracks.
- Two-run comparison producing a single number: overburden in m.w.e. ± error.

## Out of scope

- iOS. Directional/angular reconstruction. Real tomographic imaging.
- Any cloud or shared database of runs.

## Risks & unknowns

- Statistics may be too thin for one-floor differences (a 20 cm slab is only a few percent attenuation) — the tool may only honestly resolve basement-vs-roof.
- Temperature-driven noise could swamp the signal if runs aren't thermally matched.
- Phone sleep/thermal-throttle killing a 10-hour capture.

## Done means

A roof run and a basement run on the same phone yield rates whose difference is >3σ, and the derived overburden agrees within error with a hand estimate from the building's floor count and typical slab density.
