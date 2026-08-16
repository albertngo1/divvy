## Overview
A browser puzzle game about subtractive synthesis. Every level starts with the same wall of seeded noise and a target sound you must reach using only removal — filters, notches, gates, mutes. You may never add an oscillator, never raise a gain above 1.0. For musicians who want their ears trained and for people who like a constraint that turns out to be true.

## Problem
Subtractive synthesis is how most synths actually work, and almost nobody internalizes it, because every tutorial teaches it as "start with a saw and turn knobs." The insight — that a full-spectrum source already contains every sound you want and shaping *is* deletion — is a real conceptual unlock buried under UI. Meanwhile spectral editors (RX, Photosounder) let you erase a spectrogram but have no goal, no score, and no reason to be clever about it.

## How it works
A spectrogram fills the screen: 8 seconds of pinkish noise from a fixed seed. Above it plays the target — a sine, then a triad, then a snare pattern, then a spoken vowel. You paint on the spectrogram to erase. Each brush stroke is quantized into a real removal op (a biquad notch of some Q and center, a band-pass, a spectral gate threshold, a time-domain mute) and appears in an op list on the right, like a diff. Ops cost budget. Par for the level is shown; beating par unlocks the next. The rendered result plays instantly, A/B against the target, with a score bar that fills as spectral distance shrinks. Late levels remove the spectrogram and give you only the ops list and your ears.

## Technical approach
Svelte + Web Audio. Determinism is the whole foundation: the noise bed comes from a seeded xorshift128 PRNG written into an AudioBuffer, and every render happens in an `OfflineAudioContext` so the same op list always yields byte-identical audio and therefore an identical score. Ops compile to a node graph — `BiquadFilterNode` chains for notch/bandpass, a custom `AudioWorkletProcessor` for the spectral gate (2048-point FFT, hop 512, zero out bins below a per-bin threshold), gain automation for mutes.
Scoring: render both target and attempt to mono 22.05 kHz, take a 40-band mel spectrogram, and compute L1 distance on log magnitudes plus a separate onset-envelope term so rhythmic levels don't score well just by matching average timbre. The hard part is making that loss *musically* honest — raw spectral L1 rewards killing everything (silence scores suspiciously well against a quiet target), so the loss needs a floor penalty for over-erasure and perceptual band weighting. Second hard part is guaranteeing levels are solvable inside par: a greedy offline solver fits the target's spectral peaks with notch/bandpass ops and its op count sets par, so no level ships unverified.

## v1 scope
- One fixed noise seed, 8 seconds
- Three ops: notch, band-pass, spectral gate
- Five levels: sine, fifth, major triad, kick+snare loop, sustained "ah"
- Brush-to-op quantizer and the op-list diff view
- Score bar, par counter, A/B toggle

## Out of scope
Saving/sharing solutions, custom targets, mic input, a level editor, mobile, any additive op ever.

## Risks & unknowns
A vowel may simply not be reachable from a noise bed within a sane op budget — the solver will tell us early. Brush-to-filter quantization may feel mushy or arbitrary; may need visible op ghosts under the cursor. Web Audio worklet latency on Safari.

## Done means
A player with no synthesis background clears the triad level under par without help, and the solver confirms all five shipped levels are solvable at their stated par — with silence scoring worse than a genuine partial solution on every one.
