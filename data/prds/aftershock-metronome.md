## Overview

Every magnitude-5-and-above earthquake since 1900 rendered as a single tick on a circular clock that completes one full revolution per century. As the clock spins, ticks accumulate and fade, and the temporal clustering of global seismicity becomes a visible, pulsing heartbeat — a metronome you can watch and (optionally) hear.

## Problem

Earthquake timelines are everywhere, almost all of them linear: a horizontal axis of years with dots or a scrolling ticker. The linear form buries the thing that is actually interesting — the *rhythm* of clustering, the way aftershock sequences bunch and swarms punctuate quiet stretches. A polar clock where one revolution equals a century makes rhythm the primary encoding: dense arcs read as fast heartbeats, sparse arcs as calm. The polar-century rotation is the one genuinely fresh wrinkle on a saturated subject.

## How it works

A circular dial fills the frame. A sweeping radial hand advances through time; each M5+ event drops a tick at its angular position (angle = fraction of the current century elapsed), radius jittered slightly to avoid overlap, size scaled to magnitude. Ticks glow on arrival then fade over a few seconds, so the eye sees the *live density* rather than a static scatter. A century counter increments each revolution (1900s → 1910s → …). Optional audio: each tick fires a short click, so clusters become audible drum-rolls. Pause, scrub to a decade, or filter by magnitude band.

## Technical approach — specific

Stack: static site, Vite + TypeScript, Canvas 2D (not SVG — thousands of fading ticks per revolution need the raster path) with a small requestAnimationFrame loop; optional WebAudio for the metronome clicks. Data source: USGS ANSS Comprehensive Catalog (ComCat) — free CSV/GeoJSON export via the FDSN event query API, filter `minmagnitude=5`, `starttime=1900`. Data model: prebaked array of `{time_epoch, mag, lat, lon}` sorted ascending, ~tens of thousands of rows, shipped as a compact typed-array binary or gzipped JSON. Key algorithms: map each event's timestamp to `angle = ((t - century_start) / century_length) * 2π`; maintain a fade buffer keyed on time-since-emitted; radius jitter via hashed index for determinism. The hard part is honest density perception — catalog *completeness* improves over time (pre-1960 misses many M5s), so the apparent "heartbeat quickening" is partly an instrumentation artifact; needs a visible completeness disclaimer or a magnitude-threshold that holds roughly constant over the era.

## v1 scope (humiliatingly small) — bullets

- Global M5+ only, single prebaked dataset
- One clock, one century-per-revolution mapping, autoplay + pause
- Magnitude → tick size, fade-out trail
- No audio in v1 (visual heartbeat first)
- Desktop canvas; screen recording is the shareable

## Out of scope (for now)

- Audio metronome (v2)
- Regional filtering / map linkage
- Aftershock-sequence clustering algorithms (ETAS)
- Completeness correction beyond a text disclaimer

## Risks & unknowns — prior-art verdict: Partial

Many "M5+ since 1900" animations already exist; only the polar-century-rotation framing is fresh, per the audit. This is the prettiest Round-3 idea but the weakest on novelty, so the whole bet rides on the rotation reading as a *heartbeat* and not a gimmick. Risk: catalog completeness bias makes early centuries look artificially quiet; risk: at century speed the ticks may blur into an undifferentiated ring — pacing and fade tuning are the make-or-break.

## Done means — concrete, testable

- Clock plays 1900→present, one revolution per century, ticks appearing at correct angular positions.
- Tick size maps to magnitude; ticks fade within a fixed window.
- Pause and decade-scrub work.
- Runs entirely from a prebaked dataset, no runtime API.
- A completeness disclaimer is visible; a 10-second screen recording legibly shows clustering.
