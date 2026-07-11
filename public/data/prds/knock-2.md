## Overview
Knock is a phone web app for shade-tree mechanics and curious drivers. Sparked by the browser combustion-engine simulator, it inverts the toy: instead of simulating an engine, it *listens* to a real one through the phone mic and diagnoses rough running — misfire, knock, exhaust leak — and, when it can, names the offending cylinder.

## Problem
A rough idle or a faint knock sends people to a shop or down a YouTube rabbit hole. OBD-II tells you a P0300 'random misfire' but not which cylinder without pricey tools. Your ear knows something's wrong; you just can't localize it. The information is literally in the sound.

## How it works
You enter the engine's cylinder count and idle RPM (or tap along to the beat / read it off a rev). The app records ~10s of audio, computes the fundamental firing frequency (RPM × cylinders / 2 / 60 for a 4-stroke), and looks for the tell-tales: a periodic amplitude dip at one firing slot = a dead/weak cylinder; sharp high-frequency transients advanced of TDC = knock/pre-ignition; a rhythmic tick/hiss = valve or exhaust leak. It maps the offending firing-event phase back to a cylinder using the entered firing order. Output: a confidence-scored verdict plus a waveform with the suspect event highlighted.

## Technical approach
Stack: pure client-side web — Web Audio API + a WASM FFT, no upload (privacy + latency). Core algorithm: envelope extraction, comb-filter / cepstral pitch detection to lock the firing fundamental, then per-firing-slot energy binning across many cycles to find the anomalous slot; knock detection via band-limited (5–8 kHz) transient onset relative to firing phase. Firing-order tables for common engines shipped as static JSON. The genuinely hard part is real-world robustness: exhaust/road noise, phone mic AGC clobbering transients, and the fact that mic placement changes which cylinder is loudest — so cylinder ID stays a hedged 'most likely.'

## v1 scope
- 4-cylinder inline engines at idle only
- Manual RPM + cylinder-count entry
- Misfire detection (dead-slot) with best-guess cylinder
- Waveform + confidence readout, all on-device

## Out of scope
- OBD-II integration
- V6/V8/rotary/boxer firing maps (v2)
- Under-load / drive-by recording
- Any repair advice beyond 'suspect cylinder N'

## Risks & unknowns
Mic AGC and wind can eat the exact transients we need; cylinder localization from a single external mic may not be reliable enough to trust. Needs a labeled clip corpus (misfire vs healthy) to validate — hard to source without real cars.

## Done means
Given a handful of recordings of engines with a known-dead cylinder (staged by pulling a plug wire), the app flags 'misfire' and names the correct cylinder on a majority of them, entirely on-device.
