## Overview
Silent Sonar is a single-page web toy that turns your laptop into a short-range echolocation device. It plays a continuous ultrasonic tone out of the speakers, listens to the reflected sound with the microphone, and detects hand motion and presence in front of the screen — no camera, no extra hardware. For tinkerers who saw the mmWave material-classification radar on HN and thought "I want that, but for free."

## Problem
Gesture and presence sensing normally means a camera (creepy, permission-heavy) or exotic radar silicon (expensive, hard to get). Yet every laptop already ships a speaker and a mic — a transmitter and receiver sitting inches apart, unused as a sensor. Nobody thinks of them as radar because the interesting frequencies are above hearing.

## How it works
An oscillator emits a steady ~19–20 kHz sine (inaudible to most adults). Your hand moving toward the screen compresses the reflected wavefront, Doppler-shifting the echo up a few Hz; moving away shifts it down. The app watches the FFT bins just above and below the carrier: energy leaking into the upper sideband = approach, lower sideband = retreat. Total echo energy variance over a few seconds = presence. A calibration screen ("hold still 3s") learns the device's self-interference floor. Output: a live push/pull gesture and a "someone is here" meter you can wire to anything (auto-lock when you walk away, wave-to-dismiss a timer).

## Technical approach
Pure browser: WebAudio `OscillatorNode` → speakers, `getUserMedia` → `AnalyserNode` (FFT size 8192). Maintain a ring buffer of magnitude spectra; per frame, compute energy in carrier±Δf bins and a short-time variance. Doppler gesture detection follows the SoundWave (MS Research, 2012) approach — sideband energy asymmetry. Data structures: circular buffer of Float32 spectra, exponential-moving-average baseline per bin for background subtraction. The genuinely hard part is device variance: laptop speaker/mic frequency response rolls off hard near 20 kHz, the direct speaker→mic path dominates and must be subtracted, browsers often clamp mic sample rate to 44.1/48 kHz (Nyquist ~22–24 kHz leaves little headroom), and some ambient sources (CRTs, other electronics) pollute the band. Hence the mandatory calibration + adaptive carrier selection (sweep 18–21 kHz, pick the cleanest bin).

## v1 scope
- One binary gesture: hand approach vs. retreat, shown as an on-screen arrow.
- A presence meter (0–100) with a threshold event.
- A calibration button that picks the carrier frequency and baselines noise.

## Out of scope
- Distance/ranging (FMCW), multi-target tracking, material classification.
- Mobile browsers (speaker/mic geometry too variable for v1).
- Any persistence, accounts, or settings sync.

## Risks & unknowns
Mic sample-rate clamping may push the usable band into audible range for young ears or pets. Cheap speakers may not reproduce 20 kHz at all. Self-interference cancellation may be too fragile across devices. Some users will just hear an annoying whine.

## Done means
After running the calibration on three different laptops, waving a hand toward the screen from ~20 cm reliably flips the approach/retreat arrow, and walking out of frame drops the presence meter below threshold within 3 seconds — with the speaker tone inaudible to a 30-year-old tester in the room.
