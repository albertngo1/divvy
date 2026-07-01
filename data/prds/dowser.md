## Overview
Dowser is a weekend hardware+web project that turns a cheap 60GHz mmWave radar module into a wall-scanning 'divining rod.' The UI is deliberately mystical — a swinging dowsing pendulum, ley-line shimmer — but underneath it's doing honest signal classification to tell you what's behind the drywall. A serious sensing tool wearing a toy's costume, and genuinely useful.

## Problem
Hardware-store stud finders are cheap but dumb: they beep at density edges and can't tell a joist from a copper pipe from a moisture pocket. Real material classification (the HN mmWave radar post) is powerful but locked in research demos. Homeowners drilling into walls want a confident 'pipe, don't drill here' — not three ambiguous beeps.

## How it works
You slide the radar module (on a phone-mounted or handheld rig) across the wall. It emits FMCW chirps; reflections' amplitude, phase, and range-bin signatures differ by material permittivity (wood ~2, water ~80, metal = near-total reflection with phase flip). Dowser streams IQ frames to a browser dashboard over WebSerial/WebUSB, runs a lightweight classifier, and animates the dowsing rod: it 'dips' over pipes, 'twitches' over studs, glows over hidden water/moisture. A minimap paints a heat-strip of what you've swept so you can trace a pipe run.

## Technical approach
Stack: a Seeed MR60BHA1 or TI IWR6843 eval board (60GHz FMCW) → USB serial → browser via WebSerial. Range-FFT on the raw ADC frames (do it in a Web Worker with a small FFT lib) yields a range profile per chirp; features = peak reflectivity, range of first strong return, phase-flip presence, and inter-frame variance (moisture/air shifts differently than solids). Classifier v1: hand-tuned thresholds + a small logistic/kNN trained on labeled sweeps over known targets (a stud, a copper pipe, a filled water bottle behind cardboard). Data model: rolling buffer of range profiles keyed by swept-position (from an on-board IMU or manual distance ticks). Hard part: FMCW is noisy and permittivity classes overlap; getting reliable pipe-vs-stud separation without a huge training set is the real challenge, plus WebSerial framing/parsing the board's specific packet format.

## v1 scope
- One supported radar board over WebSerial
- Live range-profile plot + three-class verdict (wood / metal / water-ish)
- The dowsing-rod animation reacting to the top class
- Manual calibration on a known stud before scanning

## Out of scope
- Phone-native app (browser only), depth/thickness estimates
- Multi-board fusion, saved wall maps
- Any load-bearing structural claims

## Risks & unknowns
- Whether a $20 board has enough SNR through drywall for real classification
- WebSerial reliability and per-board packet parsing
- Overlap between wet-wood and pipe signatures causing false 'water' alarms

## Done means
Sweeping over a test wall with a known stud and a known copper pipe, Dowser correctly flips its verdict between 'wood' and 'metal' at the right positions in ≥8 of 10 passes, with the rod animation matching.
