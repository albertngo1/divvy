## Overview
A background daemon plus a wallpaper/screensaver that continuously measures the frequency of the AC power grid you are plugged into, and paints one thin band per day into a slowly accreting year-long artifact. For anyone who likes the idea that the wall socket is a live physical signal shared by a hundred million people, and that their laptop can read it.

## Problem
Grid frequency is the most dramatic continuously-varying number in your immediate physical environment and nobody ever sees it. It sags when a generator trips in the next state; it wobbles on a windy afternoon; it snaps back on a timescale set by the literal spinning mass of every turbine on the interconnect. Meanwhile ambient desktop art is either noise seeded by nothing or a weather API. This is a real signal, free, and yours to measure.

## How it works
A cheap 9V **AC** wall transformer (never mains contact) feeds a resistor divider into a USB audio input. The daemon samples continuously, tracks the fundamental to sub-millihertz, and writes one frequency estimate per second to SQLite forever. The wallpaper renders the archive: each day is a horizontal band, x = time of day, color = deviation from nominal (blue = under-frequency, amber = over), with off-nominal excursions beyond ±50 mHz flaring visibly. A year in, you have a poster where you can see the daily load ramp, weekends, holidays, and a handful of bright scars that were real generator trips.

The mischievous second mode: drop any audio or video file on the wallpaper. It extracts that file's own ENF trace from mains hum bleed and cross-correlates it against your local archive to guess when it was recorded. This is a real forensic technique; it will work on your own phone videos.

## Technical approach
Swift/Rust daemon; CoreAudio or PortAudio at 8 kHz mono. Estimate frequency via a 16-second Hann-windowed FFT on the 120 Hz harmonic (usually stronger and cleaner than 60 Hz), zero-padded 8×, with quadratic peak interpolation → ~1 mHz resolution at 1 Hz output rate. Optional Kalman smoother across windows. Storage: SQLite, one row/sec, ~30 MB/year. Rendering: Metal compute shader writing a desktop picture, or a WebGL screensaver. Cross-validate against a public reference feed — UK National Grid ESO publishes 1-second system frequency openly; FNET/GridEye covers North America — so you can prove your own capture is correct. ENF matching uses normalized cross-correlation of a 5-minute query trace over the archive, with a confidence score from the correlation peak's prominence.

Hard part: consumer mic inputs high-pass aggressively and the hum harmonic is buried; getting clean sub-10-mHz resolution without a transformer tap is the real engineering, and the transformer path needs careful, documented, low-voltage-only wiring.

## v1 scope
- Capture loop → SQLite, one frequency estimate per second
- Static PNG wallpaper regenerated hourly, last 30 days only
- A wiring page with photos and explicit safety instructions
- Sanity check against one public reference feed

## Out of scope
- ENF matching (v2), multi-interconnect maps, phone app, mains-direct hardware

## Risks & unknowns
Anyone building the tap wrong is a safety issue — low-voltage AC adapter only, loudly. Some laptop power supplies inject enough hum that a bare mic works; most won't. Grid frequency is boring in a healthy interconnect for weeks at a time.

## Done means
A week of continuous capture whose trace matches the public reference feed within 5 mHz RMS, rendered as a wallpaper that visibly differs between a Tuesday and a Sunday.
