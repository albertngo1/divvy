## Overview
An ambient audio-visual toy (browser or screensaver) that turns real, live lightning into the sound a VLF radio receiver would hear: whistlers. For anyone who likes generative ambience with a physical source of truth, plus space-weather and radio hobbyists.

## Problem
Generative ambient art is almost always noise dressed as meaning — a Perlin field with reverb on it. Meanwhile there is a genuinely gorgeous natural phenomenon most people have never heard: energy from a lightning stroke couples into the plasmasphere, rides a geomagnetic field line to the opposite hemisphere, and arrives dispersed, high frequencies first, as a two-second falling glissando. Hearing it requires a VLF antenna far from power lines. Nobody has one.

## How it works
A live lightning feed drives a physics-derived synthesizer:
1. Ingest stroke events (time, lat/lon, energy).
2. For each stroke compute geomagnetic latitude and the L-shell of the field line it sits on: L ≈ 1/cos²λ_m. Only L ≈ 2–4 produces the classic audible whistler; everything else is rejected or turned into a dry click (a sferic).
3. Compute the dispersion constant D by integrating plasma density along the field line using a diffusive-equilibrium plasmasphere profile anchored to IRI electron densities, scaled by local time (nightside ducts better).
4. Synthesize: instantaneous frequency f(t) = (D/(t − t₀))², bandlimited 500 Hz–8 kHz, amplitude from stroke energy and receiver distance, rendered as a phase-integrated chirp. Add a 1/f hiss bed and 60 Hz hum so it sounds like a receiver, not a synth patch.
5. Visual: a spectrogram panel where the hooks are visible, and a globe with the field-line arc from stroke to conjugate point.

## Technical approach
Data: NOAA GOES-16/19 Geostationary Lightning Mapper L2 (`s3://noaa-goes16/GLM-L2-LCFA/`), free, no key, 20-second NetCDF granules with flash lat/lon/energy — that public bucket is the arbitrage. Parse with a small Python worker (xarray/netCDF4), thin to a selected stroke stream, push over WebSocket as JSON. Frontend: WebAudio, phase-accumulator chirp written into an AudioBuffer per event; canvas spectrogram via an AnalyserNode; three.js globe. Model constants in a small table; L-shell and D math is ~50 lines. The genuinely hard part is *curation*: GLM sees thousands of flashes a minute, so a naive mapping is a firehose of mud. Needs a scheduler that caps voices (~1 whistler per 2s), prefers high-D strokes (longer, prettier sweeps), and enforces stereo/pitch spacing so overlapping whistlers stay legible.

## v1 scope
- One archived hour of GLM granules, replayed offline. No live feed.
- Whistler synth + spectrogram canvas. No globe.
- Fixed nightside dispersion profile — one D per L-shell bucket, no IRI call.
- Runs as a webpage that you leave open.

## Out of scope
Real VLF hardware, chorus/hiss emissions, Southern Hemisphere conjugate audio, mobile.

## Risks & unknowns
GLM detects optical flashes, not the stroke current that actually drives a whistler, so amplitudes are approximations. Physics accuracy vs listenability will fight; listenability should win, with the fudge documented. GOES covers the Americas only.

## Done means
A rendered spectrogram of the output shows the characteristic 1/√f hooks, an amateur VLF listener says it sounds right, and 20 minutes of it is pleasant to leave running.
