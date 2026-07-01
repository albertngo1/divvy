## Overview
Knock is a browser app that identifies materials by the sound of tapping them. The mmWave material-classification radar on HN needs custom RF hardware; Knock does a cheeky, lo-fi version with the microphone everyone already carries. It's for the curious tinkerer, the renter hanging a shelf, and the person at the grocery store thumping watermelons.

## Problem
Material radar is a serious, expensive, hardware-bound tool. Meanwhile everyday material questions are trivial but annoying: is there a stud here, is this wall hollow, is this table solid oak or veneered particleboard, is this melon ripe? A stud finder is a single-purpose gadget you own one of and lose. Your phone can hear the difference — nobody's shipped the toy that makes it dangerously useful.

## How it works
You open the page, grant mic access, and tap an object twice. Knock detects the transient "knock," extracts its acoustic fingerprint, and shows a confidence bar across a small set of classes (wood / metal / glass / hollow / stud-behind-drywall). A "scan mode" lets you knock across a wall every few inches and draws a strip showing where hollow flips to solid — a poor-man's stud finder.

## Technical approach
Stack: vanilla JS + Web Audio API. `getUserMedia` → `AudioContext` → onset detection via a rolling energy threshold on the time-domain buffer to catch the tap transient. For each detected knock, compute features: spectral centroid, spectral rolloff, decay time (RT of the ringdown), and a coarse MFCC vector via an FFT + mel filterbank. Classifier: start with a hand-tuned kNN over ~200 labeled taps stored as JSON (no training pipeline needed); graduate to a tiny TensorFlow.js MLP if kNN plateaus. Data model: `sample{features[], label, device}`. The genuinely hard part is cross-device variance — phone mics, AGC, and ambient noise shift the fingerprint, so v1 ships a 3-tap self-calibration ("tap this table you know is solid") to normalize features per session.

## v1 scope
- Mic capture + reliable single-tap onset detection
- Feature extraction (centroid, decay, rolloff, MFCCs)
- kNN over a bundled labeled set for 4 classes
- Confidence-bar UI + a "tap again" retry
- Per-session calibration tap

## Out of scope
- The wall-strip scan visualization (nice-to-have, not v1)
- Fruit-ripeness model (fun demo, later)
- Native app / offline packaging

## Risks & unknowns
- Hollow-vs-stud through drywall may be too subtle for phone mics
- AGC on some browsers clips transients unpredictably
- Labeled data collection is tedious; small set may overfit to one room

## Done means
On a laptop or phone, tapping a wooden table, a metal pan, and a glass cup yields the correct top-1 label at least 8 of 10 times each after calibration, with the result rendered in under 300ms.
