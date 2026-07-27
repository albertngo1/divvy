## Overview
A macOS menubar player that turns your local music library into physical cassettes. Not a tape-emulation *effect* — a tape emulation with *state*. The tape you made in March sounds worse in July because you played it, and you can hear what used to be on it.

## Problem
Every tape plugin on earth applies a static wow-and-flutter curve and calls it warmth. The tape never actually degrades, so nothing is ever at stake. Meanwhile streaming has no scarcity at all: infinite pristine copies, nothing you own gets old, no artifact accumulates the evidence of having been loved. Also, cassettes had a specific and beautiful failure mode nobody simulates.

## How it works
Create a tape — C60 or C90. Drag tracks onto Side A until the minutes run out. The app tells you how much is left and, if a seven-minute track won't fit in four minutes, it records what fits and cuts off mid-song. Playback is linear: no skipping, FF/RW scrubs at 8× with the squeal. Side A ends and stops; you flip it by hand from the menubar.

Every full pass increments wear on the *exact minute range played* — the song you loop dies first. Wear deepens HF rolloff, hiss, dropouts, and wow/flutter. Tape over an old recording and the new audio writes in, but the previous generation survives as **print-through**: a low-passed, heavily attenuated copy of the erased song leaking in ahead of loud transients. Your old mixtape haunts the new one.

## Technical approach
Swift + AVAudioEngine with a custom `AVAudioSourceNode` DSP chain. State in SQLite: `tape(id, length_min)`, `segment(tape_id, t_start, t_end, plays, wear)`, `layer(tape_id, generation, source_file, offset)`.

Per-sample chain:
- Pitch modulation via a fractional delay line — wow at 0.6 Hz ±0.3%, flutter at 8–14 Hz ±0.05%, both scaled by wear
- One-pole lowpass with cutoff 16 kHz · exp(−k·wear)
- Pink hiss floor rising from −66 dB
- Dropouts as Poisson-timed 30–80 ms gain notches, rate λ ∝ wear
- Soft saturation, plus azimuth error as an HF-only L/R phase shift

Print-through is the fun one: keep the previous generation's decoded PCM, delay by the reel-wrap period τ = layer circumference / tape speed, lowpass at 3 kHz, mix at −48 dB. Because the take-up radius grows through the side, τ drifts from about 2.4 s at the start to 1.1 s at the end — that drift is the detail that will make an audio person grin.

Hard part: doing all of this click-free in real time, and tuning the wear curve so twenty plays sounds *loved* rather than *broken*.

## v1 scope
- One tape, Side A only, local m4a/mp3 via AVAsset
- Wear + hiss + HF rolloff only — no dropouts, no print-through
- Menubar UI with a four-digit tape counter and a flip button
- Wear persists across restarts

## Out of scope
Streaming services, iOS, sharing tapes, Dolby B emulation, any kind of library browser.

## Risks & unknowns
Deliberately degrading someone's listening experience may just be irritating; needs an escape hatch (a bulk eraser that costs you the whole tape — mischievous, not merciful). DRM'd libraries are unplayable. Real risk: novelty dies in week two and it becomes a screenshot, not a habit.

## Done means
Play one track twenty times on a tape, then A/B pass 1 against pass 20 — a blind listener reliably picks the older one — and the wear state survives an app restart intact.
