## Overview

A browser sequencer built around a scarcity that no modern DAW has: total memory. You get 512KB of simulated Amiga chip RAM shared by all samples. Longer, cleaner, higher-rate samples eat the budget; adding a fifth instrument means somebody's kick drum drops to 8kHz and 5-bit. The composition and the timbre are the same decision. For anyone who likes constraint-art, chiptune, or the specific sound of things being not-quite-good-enough.

## Problem

Infinite tracks and unlimited sample libraries produce mush and paralysis. The demoscene's best work came from hard ceilings. Existing trackers emulate Amiga *playback* faithfully but hand you a modern disk — the constraint that actually shaped the music (a fixed pool of chip RAM) is the one nobody reimposes.

## How it works

- Four channels, Paula-style. You load or record samples; each one gets a slider strip for length, sample rate, bit depth, and loop points, with a live byte counter.
- A single fuel gauge across the top: bytes used / 524288. It is a hard wall, not a warning.
- When you add an instrument and blow the budget, the app doesn't refuse — it offers *tributes*: which existing sample gets truncated or downsampled to make room, with an A/B audition of the damage before you commit.
- Every edit re-renders through an honest Paula path so you hear the aliasing, not a clean preview of it.
- Export a real `.mod` file that plays in OpenMPT, milkytracker, and on actual hardware/UAE.

## Technical approach

Svelte + Web Audio with an AudioWorklet doing the mixing so timing isn't at the mercy of the main thread. The Paula model is the interesting part: no interpolation, playback rate derived from the PAL period table (`rate = 3546895 / period`), 8-bit signed samples, per-channel volume 0–64, and the fixed ~4.4kHz one-pole/Butterworth output filter as a toggle (A500 vs A1200). Downsampling deliberately does *not* apply a proper anti-alias filter — the folded harmonics are the aesthetic. Data model: a flat `ArrayBuffer` of 524288 bytes as the actual chip RAM, samples as offset/length slices into it, so "defragmenting after you delete an instrument" is a real operation the UI can show. Pattern data is standard 4-channel ProTracker: 64 rows, 31 instruments, effect column limited to arpeggio/slide/vibrato/volume. `.mod` export is a straightforward byte-layout writer. The genuinely hard part is loop-point handling — click-free looping at arbitrary byte boundaries after the user has just chopped 40% off the sample, which needs zero-crossing snapping and a visible loop-seam waveform.

## v1 scope

- 4 channels, 4 instruments max, one 64-row pattern
- Import WAV, auto-converted to 8-bit; no recording
- Length + sample-rate sliders only (bit depth fixed at 8)
- Live byte gauge and the tribute dialog
- Play in browser; `.mod` export

## Out of scope

Multiple patterns/song arrangement, effect commands beyond volume, sample drawing/synthesis, sharing or a gallery, AGA/8-channel modes, mobile.

## Risks & unknowns

AudioWorklet performance with naive nearest-neighbour resampling at 4 voices (should be fine, but the render-on-every-slider-drag path may need debouncing); whether the tribute mechanic reads as a fun tradeoff or as an obstacle; `.mod` files exported from browser-normalized samples sounding wrong on real hardware; the constraint may only be legible to people who already know what chip RAM was.

## Done means

A four-instrument loop built entirely in the browser exports a `.mod` under 512KB that opens in OpenMPT and sounds identical to the in-browser playback, and deleting one instrument visibly returns its bytes to the gauge and lets another sample be restored to full rate.
