## Overview
Six Second Hum is a browser instrument that plays the Earth's secondary microseism: a continuous ~6-second-period ground vibration generated where opposing ocean swells collide, thousands of kilometers offshore. Pitched up into hearing range, it becomes a slow, breathing drone that is different every single time you open it — because the weather making it is different. For people who like ambient generative pieces, and for anyone who's never been told the ground is always ringing.

## Problem
Seismic sonification demos exist, and they all do the same thing: play an earthquake. Earthquakes are events — dramatic, over in seconds, and fundamentally a recording. The microseism is the opposite: it's *always on*, it's the loudest thing on every seismometer on Earth, it is literally the sound of distant weather, and almost nobody has heard it. The angle here isn't sonification; it's **direction** — turning three stations into an ear that points at a storm you cannot see.

## How it works
Open the page: a dark globe, three glowing station dots, and a drone fades in. The drone's pitch tracks the dominant microseism period (5–8 s → 500–800 Hz at 600× speedup), its amplitude tracks swell energy, and its **stereo/binaural position tracks the computed back-azimuth to the source**. Over an hour of listening, a North Atlantic storm crossing toward Europe audibly slides from left to center. A second, lower layer is the *primary* microseism (~14 s) mixed underneath. A small readout says "source bearing 312°, ~4,100 km — matches Storm off Newfoundland."

## Technical approach
Vanilla JS + WebAudio + a tiny Node proxy for CORS.

Data: the IRIS/EarthScope FDSN `dataselect` web service (`service.iris.edu/fdsnws/dataselect/1/query`) pulling BHZ/LHZ channels from a triangle of broadband stations (e.g. IU.HRV, IU.KONO, II.BFO), 30-minute chunks with ~10-minute latency, decoded from miniSEED in the browser via a WASM build of libmseed (or server-side to plain Float32 if that fights back).

Pipeline per chunk: detrend → taper → bandpass 0.1–0.35 Hz → Welch PSD (FFT via `fft.js`) to find the spectral peak period and RMS energy. Sound generation is **not** naive playback: resampling 0.15 Hz to audio yields a buzz, so the drone is a bank of 6–10 sine partials whose frequencies are set by the top PSD peaks and whose amplitudes are envelope-followed from the band-limited signal — the spectrum drives a synth, giving something musical that's still honest to the data.

Direction: cross-correlate the three stations' band-passed envelopes to get inter-station lag, then solve the plane-wave back-azimuth from lags and station geometry (the classic three-element array beamformer). Map azimuth → HRTF pan via WebAudio `PannerNode`.

The genuinely hard part is the beamformer: microseism sources are diffuse and multiple, so lags are noisy and the azimuth will jitter wildly. Needs heavy temporal smoothing (30–60 min exponential) plus a coherence gate that mutes the pan (centers it) when inter-station correlation drops below ~0.4. Cross-check the answer against NOAA WaveWatch III significant-wave-height fields for a sanity overlay.

## v1 scope
- Three hardcoded stations, one hemisphere
- Fetch 30-min chunk, PSD, drive an 8-partial additive drone
- Amplitude and pitch from data; pan fixed center
- Globe with three dots and a live spectrum strip

## Out of scope
- User-selectable stations, earthquake detection, recording/export, mobile audio, real HRTF beyond stock panning

## Risks & unknowns
FDSN latency and rate limits may force a 1-hour-behind mode. miniSEED-in-WASM may be a slog. Station outages need graceful fallback. Biggest risk: after smoothing, the azimuth may simply not be stable enough to be audible as motion — in which case the piece survives as pitch+amplitude only, which is still worth shipping.

## Done means
The page loads real data less than 90 minutes old from three stations, produces a continuous drone whose spectrum visibly tracks the seismic PSD, and — over a 6-hour recorded session during a documented North Atlantic storm — the computed back-azimuth stays within ±30° of the NOAA wave-height maximum for at least 70% of samples.
