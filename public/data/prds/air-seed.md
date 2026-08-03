## Overview

A desk toy and micro-instrument for one person and one plant. Plants under drought stress emit real ultrasonic clicks — xylem water columns snap under tension when air is pulled through a pit membrane ("air seeding"), producing a broadband acoustic transient at 20–100 kHz. Air Seed listens, rejects the noise, pitch-shifts survivors eight octaves down, and gives you a live click-rate meter. Your fern becomes audibly thirsty.

## Problem

The itch isn't "my plant is dying" — soil moisture probes solve that badly and boringly. The itch is that a *genuinely audible physical process* is happening in a room you sit in, at frequencies you were born unable to hear, and nobody has made a nice small thing that lets you hear it. Every existing plant gadget measures a proxy. This one listens to the actual event.

## How it works

1. Piezo contact disc taped to the main stem (or an ultrasonic air mic 10 cm from the plant), into a 192 kHz-capable USB interface.
2. Stream at 192 kHz → Nyquist 96 kHz, covering most of the reported click band.
3. High-pass at 18 kHz, detect transients by short-time energy over a rolling median floor.
4. Classify each transient: cavitation clicks are ~0.3–1.5 ms, sharp attack, broadband peak 30–60 kHz. Handling bumps, HVAC, keyboards, and pot expansion look different (longer, lower-centroid, or correlated with the room mic).
5. Survivors are resampled ÷256 and played through your speakers as dry pops, plus logged. A menubar readout shows clicks/hour and a 24h strip chart.

## Technical approach

- **Hardware:** Dodotronic Ultramic 192K (~$300) or a 192 kHz USB ADC + $2 piezo disc with a JFET buffer. Piezo contact is far cheaper and far less noisy than airborne — start there.
- **Software:** Python, `sounddevice` callback at 192 kHz mono, `numpy`/`scipy` for filtering, ring buffer of 2 s. Menubar via `rumps` (macOS).
- **Detection:** Butterworth HP 18 kHz → Hilbert envelope → adaptive threshold at median + 6·MAD. For each hit, extract features: duration at −10 dB, spectral centroid, peak freq, rise time, kurtosis. Ship a small logistic-regression / SVM trained on ~200 hand-labeled clicks (drought-stressed basil vs. a watered control vs. deliberate noise sessions).
- **Noise gating:** second cheap mic in the room; any transient whose envelope correlates >0.7 within ±2 ms is a room event, discarded. This single trick removes most false positives.
- **Grounding:** Khait et al., *Cell* 2023, "Sounds emitted by plants under stress are airborne and informative" — reports ~35–50 clicks/hr for drought-stressed tomato vs. <1/hr hydrated. That contrast is the whole toy: the meter should be flat and boring for a healthy plant.
- **Hard part:** false positives. A piezo on a stem hears the pot, the desk, your chair, and the radiator. Getting a healthy plant to read <2 clicks/hr for 24 hours straight is the real engineering.

## v1 scope

- One input device, hardcoded 192 kHz
- Threshold detector only, no classifier — just duration + centroid gates
- Pitch-shift playback (naive ÷256 resample) and a printed clicks/minute counter in the terminal
- One CSV log file

## Out of scope

Multi-plant, species profiles, watering recommendations, soil sensors, cloud sync, phone app, any claim of diagnosing plant disease.

## Risks & unknowns

- Consumer 192 kHz interfaces often have brutal anti-alias rolloff above 60 kHz; band may be narrower than hoped.
- Piezo coupling to a soft green stem is poor — may need a small clip and it may injure the plant.
- The effect may be too rare to be entertaining without deliberately underwatering something.

## Done means

Side-by-side basil pots, one watered and one dry for four days, run overnight: the dry pot logs at least 10× the click rate of the wet one, and the pitch-shifted playback is unmistakably a series of pops rather than hiss.
