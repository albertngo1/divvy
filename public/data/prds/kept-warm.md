## Overview
A macOS menubar toy and screensaver: a small colony of synthetic crickets kept in a virtual gourd, whose entire climate is your computer's own thermal telemetry. For people who leave a machine running all day and want ambient, non-visual awareness of what it's doing — plus anyone charmed by the Chinese tradition of keeping singing crickets in tuned gourds.

## Problem
Ambient machine-state toys are all visual (menubar graphs, CPU meters) and get ignored the moment you look away. Sound is the right channel for background state, but every audio implementation is either an alarm or a novelty that gets muted in a day. Separately, Dolbear's law — crickets chirp faster when it's warmer, precisely enough to read temperature off them — is a genuinely lovely fact that nothing lets you play with.

## How it works
Read the SoC/package temperature. Map that range onto 55–100°F, the band where Dolbear's law holds, and drive chirp rate directly: T_F = 50 + (chirps_per_60s − 40) / 4, inverted. A cold idle machine gives you one lonely chirp every few seconds; a compile pegs all cores and the terrarium erupts. Fan RPM becomes wind that damps and detunes the chorus. On battery it's dusk, on AC it's night. Three to nine crickets each have slightly detuned harps and their own phase; they entrain into a chorus when temperature is stable, and the chorus visibly falls apart during thermal thrash. You choose a gourd shape, which is a resonator filter, so the colony has a timbre you picked. Run the machine hot for hours and crickets stop singing.

## Technical approach
Swift + AVAudioEngine. Sensors via IOKit: `AppleSMC` keys (TC0P, F0Ac) on Intel, `IOHIDEventSystemClient` thermal sensor matching on Apple Silicon, with `powermetrics --samplers smc` as a fallback shim. Synthesis is modal, not sampled: stridulation is a scraper crossing ~4–5 file teeth, so each chirp is a 3–5 pulse burst at 2–5 kHz; render an impulse train through a bank of 2-pole resonators whose modal frequencies and Qs come from a cheap Helmholtz-plus-first-modes model of the chosen gourd geometry. Chorus synchrony uses Mirollo–Strogatz pulse-coupled oscillators with a cricket-shaped phase-response curve — a one-line update per chirp received. Visuals are a dark SwiftUI/Metal terrarium where each chirp is a faint light pulse.

The genuinely hard part is not annoying people: silence hysteresis, a −40 dBFS ceiling, do-not-disturb awareness, and a rate limiter so a runaway process can't produce a swarm.

## v1 scope
- Three crickets, one gourd, one temperature sensor
- Dolbear mapping and chirp synthesis, no chorus sync
- Menubar on/off and volume, no visuals
- Apple Silicon only

## Out of scope
Windows/Linux, breeding or genetics, real outdoor weather, recording/export, multiple species.

## Risks & unknowns
Apple Silicon sensor access is undocumented and moves between OS releases. Audio fatigue is the real killer. Dolbear's band is narrow, so the CPU-temp mapping is a designed lie that must still feel physical.

## Done means
With all cores pegged for 60 seconds, measured chirps-per-minute rises and matches the Dolbear prediction for the mapped temperature within 5%, and an idle machine stays under 40 dB SPL at one meter.
