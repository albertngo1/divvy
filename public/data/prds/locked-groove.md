## Overview

An offline tool for one person that takes a year of personal time-series data — Apple Health export, or any daily CSV — and emits two files: a WAV of a generative drone piece, and an STL of a resin-printable phonograph record whose grooves *are* that WAV. One revolution equals one day. You print it, drop a needle on it, and hear your year through a real stylus.

## Problem

Personal data lives in a graph you glance at once and an export.zip that rots on a drive. Sonification projects mostly end as a browser tab. The interesting move is making the data into a physical object with an obligate playback ritual — something that can be scratched, warped, handed to someone, and worn out.

## How it works

1. Parse `export.xml` from the Apple Health export into a daily feature vector: sleep duration, resting HR, step count, workout minutes.
2. Synthesize one revolution per day. At 45 rpm a revolution is 1.333 s; a year is ~8 minutes. Resting HR maps to a drone fundamental, sleep to a lowpass cutoff, steps to a shaker density, workouts to struck bells. The piece is composed *for* the medium: band-limited to ~4.5 kHz, quantized to ~6 bits, heavily limited.
3. Convert audio to geometry. Generate an Archimedean spiral path at constant groove pitch; modulate laterally, amplitude ∝ sample value, cut as a 90° V-groove sized for a conical stylus (~40 µm depth, ~70 µm width). Emit a triangle mesh.
4. Close the final revolution on itself — a true locked groove. The last day of the year loops until you lift the arm.

## Technical approach

Python, numpy, and a hand-rolled streaming binary-STL writer (the mesh is 10–40 M triangles; trimesh will not hold it). Print on a 22–50 µm XY resin printer (Form 4, Saturn-class) at 25 µm layers.

The real engineering is the groove itself, and it's the same problem a real lathe has. Groove displacement for constant-velocity cutting scales as amplitude/frequency, so bass excursion is enormous and will punch straight through into the neighbouring groove. You need either brutal pre-emphasis or, better, **variable pitch**: look one revolution ahead, compute peak lateral excursion, and widen the spiral locally so grooves never collide. That lookahead scheduler is the interesting algorithm. Second hard part is that printer XY resolution caps you around 4–5 kHz sample rate with a punishing noise floor, so the composition must be designed for it rather than sound like a broken MP3.

## v1 scope

- 30 days, not 365.
- 7" disc at 45 rpm, fixed conservative pitch, no lookahead.
- Mono, no RIAA equalization at all.
- One synth voice.
- Ship the WAV alongside so failure is diagnosable.

## Out of scope

Stereo (45/45 cutting), RIAA curves, 12"/33⅓ full-year discs, metal mastering, selling anyone a record.

## Risks & unknowns

Printed records historically sound rough — expect a loud noise floor and heavy wow. Resin is brittle and abrasive; use a stylus you're willing to destroy and say so loudly in the README. Layer-line periodicity may beat against the audio and produce a tone at the layer frequency, which is either a bug or the best part.

## Done means

Print one disc. Play it on a cheap turntable, record the output with a phone, time-align it, and get cross-correlation > 0.5 against the source WAV — and be able to hear, unprompted, where one day ends and the next begins.
