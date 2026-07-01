## Overview

Piano in Pascals renders all 88 keys of a Steinway model D with their real physics attached: each key's true string length, string tension, fundamental frequency, and sound pressure level at 1 meter at mezzo-forte. Click a key and three things happen at once — you hear the recorded note, you see that string vibrate at its true frequency (slowed 100× so the eye can follow), and a pressure wave radiates outward scaled to the note's real SPL. The bass strings are absurdly long and slack and loud; the treble strings are short, taut, and quiet. It makes the instrument's hidden physics visible key by key.

## Problem

Animated keyboards exist and string-wave sims exist, but separately — none tie all 88 keys to the *true* string physics of a real concert grand (length, tension, SPL) with audio. The famous instrument gets the obvious "click to hear a note" treatment everywhere; nobody has grounded it in the measured mechanics. The physics is published (Yamaha/piano-acoustics papers) and the tuning is standard; the fused artifact is missing.

## How it works

A full 88-key keyboard. Click or play a key: it plays the note (sampled recording), draws that key's string above the keyboard vibrating in its fundamental (and a couple of overtones) at frequency slowed 100× so 27 Hz becomes a visible wiggle, and emits an expanding pressure-wave ring whose radius/opacity encodes SPL at 1 m. A side readout shows the key's string length (cm), tension (N), frequency (Hz), and SPL (dB). Sweep the keyboard and watch strings shorten and tighten and quiet down as you climb. A toggle shows the real cross-over from wound bass strings to plain treble strings.

## Technical approach — specific: stack, real data sources/APIs, data model, key algorithms, the hard part

Stack: static site, Vite + TypeScript, Canvas/WebGL for the vibrating string + wave rings, Web Audio API for sample playback. No backend.

Data sources by name:
- **MIDI piano data** — the standard 88-key note/frequency mapping (A0 27.5 Hz → C8 4186 Hz), equal temperament.
- **Yamaha / piano-acoustics physics papers** — measured string lengths, tensions, and SPL-at-1m figures for a concert grand; where a paper gives only endpoints, interpolate the scaling curve across the range.
- Piano note **samples** (e.g. Salamander Grand / University of Iowa MIS) for the actual audio.

Data model: `keys[{midi, name, freq_hz, string_len_cm, tension_N, spl_db, wound:bool, sample_url}]`.

Key algorithms: (1) string render — a standing-wave y(x,t) = A·sin(nπx/L)·cos(2πf't) with f' = f/100 for visibility, amplitude/thickness scaled by string length; (2) SPL → ring — expanding circle radius and fade timed to the note envelope, radius mapped from dB (log); (3) length/tension scaling — fit measured endpoints to the smooth curve so intermediate keys are physically plausible.

The hard part: sourcing consistent per-key length/tension/SPL for one instrument. Papers rarely give all 88; most report endpoints plus scaling laws. Reconstructing a believable per-key table from partial measurements (and being honest that intermediate keys are interpolated) is the real work — plus keeping 88 audio samples + a live vibration animation smooth in-browser.

## v1 scope (humiliatingly small)

- 88 keys with interpolated length/tension/SPL from published endpoints.
- Click a key → sample plays + string vibrates at f/100 + SPL ring.
- Side readout of the four physical numbers.
- Precomputed `keys.json` + a sample set (or a lightweight synth fallback).

## Out of scope (for now)

- Multiple pianos / other instruments.
- Real inharmonicity, hammer dynamics, damper/pedal behavior.
- Chords, MIDI-file playback, dynamics beyond mezzo-forte.

## Risks & unknowns

Prior-art verdict: **Partial**. Animated keyboards and wave sims exist separately; none tie 88 keys to true string physics with audio. Fresh angle = the fusion (physics + sound + true frequency) on the whole keyboard. Risks: (1) per-key physical data is incomplete in the literature — mitigate by interpolating from measured endpoints and labeling it; (2) 88 audio samples + live animation may stutter — lazy-load samples, cap simultaneous animations; (3) sample licensing — use an openly licensed piano sample set or synth fallback.

## Done means

A visitor clicks a bass key and hears it while a long slack string wobbles visibly and a big SPL ring blooms; clicks a treble key and gets a short taut fast string and a small quiet ring; reads the four physical numbers per key; and sweeps the keyboard to see the physics change. Deployed static, smooth on a laptop.
