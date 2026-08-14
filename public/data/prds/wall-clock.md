## Overview

Wall Clock is a two-part desktop tool for one person: a always-on **reference logger** that records the Electrical Network Frequency (ENF) of your local power grid, and a **matcher** that takes any audio or video file and tells you when — to within a minute or two — it was recorded, and whether its timeline is continuous. For journalists, insurance adjusters, HOA/legal disputes, and anyone who gets handed a "security camera clip" and has to decide whether to believe it.

## Problem

Mains hum is smeared into almost every indoor recording ever made. The grid's frequency isn't exactly 60.000 Hz — it wanders ±20 mHz as load and generation slosh around, and that wander is a signature unique in time across an entire interconnect. Labs do ENF forensics routinely. You can't, because the capability is not the algorithm — it's the **archive**. Matching requires a continuous reference of grid frequency covering the moment the clip was made, and nobody sells you yesterday's. The arbitrage: a $12 audio interface and a spare Mac generate that archive for free, starting today, and it appreciates every night you leave it running.

## How it works

1. Plug a cheap AC-AC wall transformer (or a coil of wire near a power strip) into a USB audio input. Logger runs as a launchd agent, sampling at 1 kHz forever.
2. Every second it estimates instantaneous grid frequency and appends `(unix_ts, freq_hz, snr)` to a SQLite table. Storage is ~50 MB/year.
3. You drop a file on the app. It extracts the ENF trace from the recording's hum, then cross-correlates that trace against the whole archive.
4. Output: a correlation-vs-time plot with a spike at the true recording time, a confidence number, and a **splice map** — segments whose ENF doesn't join continuously to the neighbors, i.e. cuts, loops, or re-encodes.

## Technical approach

Stack: Python + `sounddevice` for capture, SQLite for the archive, a small Tauri or Textual front end.

Reference extraction: bandpass 59.5–60.5 Hz, then per-second frequency estimate by quadratically-interpolated peak of a 16k-point FFT (Zoom-FFT around the nominal), plus a phase-unwrap estimator for a tighter number. Store both.

Clip extraction: same, but the hum may be weak and live on a harmonic — search 60/120/180/240 Hz, pick the band with best SNR. Downmix video audio via `ffmpeg`.

Matching: normalized cross-correlation of the clip's mean-removed frequency series against the archive series. For a year of 1 Hz reference, brute force is 31M lags — fine via FFT-based correlation in chunks. Report peak-to-sidelobe ratio as confidence.

Hard part: clips with terrible hum SNR (outdoors, battery-powered mics, aggressive noise suppression on phones) simply have no signal, and you must say "no answer" rather than the plausible-looking wrong peak. Calibrate a rejection threshold from synthetic clips of known time and varying injected SNR.

## v1 scope

- Logger writing one SQLite row per second, launchd-managed, survives sleep with gap rows.
- CLI: `wallclock match clip.mp4` → best timestamp, confidence, correlation PNG.
- Splice detection: sliding 30 s windows, flag windows whose independent best-lag disagrees.
- Rejection: print `INCONCLUSIVE` below threshold, refuse to guess.

## Out of scope

- Multi-grid / other interconnects, 50 Hz Europe, geolocation by interconnect.
- Any web upload or shared archive. Local only.
- Cameras' rolling-shutter ENF from video pixels (real, cool, later).

## Risks & unknowns

- Archive has zero value for anything recorded before you start; the tool is worthless on day one and good in year two.
- Cheap USB inputs may have DC-blocking or AGC that mangles 60 Hz; may need the transformer trick with a resistor divider.
- False positives are the whole risk — a confident wrong timestamp is worse than nothing.

## Done means

I record a 4-minute clip on my phone in the kitchen, do not tell the tool when, and it returns the true start time within ±90 seconds with PSR > 6. Then I concatenate two clips recorded 3 hours apart and it flags the seam at the correct offset.
