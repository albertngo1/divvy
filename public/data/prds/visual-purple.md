## Overview

A macOS menubar app that runs a real photochemical model of *your* dark adaptation, driven by the light your display and room are actually throwing at you. It answers one question continuously: **if you stepped outside this second, what could you see?** Expressed as a limiting stellar magnitude, a countdown to your rod-cone break, and a live star-field thumbnail rendered at your current threshold rather than at full dark-adapted vision.

For amateur astronomers, night-shift people, insomniacs, and anyone who has ever walked out to a telescope straight off a bright monitor and seen nothing.

## Problem

Dark adaptation takes ~30 minutes and is destroyed in ~5 seconds by a white screen, but it's completely invisible to introspection — you feel fine, you just can't see. Every astronomy guide says "use red light and wait", nobody tells you *where you currently are on the curve*. Meanwhile the machine that keeps ruining your night vision is the same machine that could measure the damage.

## How it works

1. Sample the light hitting your eyes once per second: mean display luminance plus the Mac's ambient light sensor.
2. Integrate a bleaching/regeneration ODE for rod and cone photopigment separately.
3. Convert unbleached fraction to a log absolute threshold via the Hecht relation, then to a limiting visual magnitude for your location's sky brightness.
4. Menubar shows one number (mag 3.1 → 5.9) and a filling arc. Click for the adaptation curve for the last hour, with the rod-cone break marked, plus a rendered patch of tonight's real sky with only the stars you'd currently detect.
5. A "going out" button dims and red-shifts the display via a gamma table so you can keep working without resetting the clock.

## Technical approach

Swift menubar app. Luminance from `CGDisplayStream` scaled to 1×1 (or a 16×16 grid, so a dark app with one white panel is weighted by area), gamma-linearized and converted to cd/m² using the display's reported nits; ambient lux from the AppleLMU sensor over IOKit. Screen luminance → retinal trolands needs pupil diameter, so run the Watson–Yellott unified pupil formula on the adapting field.

Core model: dp/dt = (1 − p)/τ − p·I/(Q·τ), with τ ≈ 400 s for rods, ~120 s for cones, solved with RK4 at 1 Hz; separate pools per photoreceptor class weighted by the display's spectrum (rods peak at 507 nm, so blue light is disproportionately destructive — the app should visibly punish a blue-white screen more than an amber one). Threshold elevation from unbleached fraction via the Rushton log relation, calibrated so a fully dark-adapted observer lands at mag 6.5 under Bortle 1.

Sky: Hipparcos bright-star catalog + local zenith sky brightness from the VIIRS-derived light pollution atlas for the user's lat/lon; render with a simple stereographic projection.

Hard part: calibration. The ODE is textbook; mapping "pixels on a specific MacBook at 42% brightness" to trolands is guesswork. Ship a 60-second self-calibration: show a fading spot, user clicks when it disappears, fit a personal scale factor.

## v1 scope

- Menubar number + arc, rods only, no cones
- Display luminance only (skip the ambient sensor)
- Hardcoded Bortle class from a dropdown
- One-hour adaptation history graph
- No star rendering

## Out of scope

Windows/Linux, per-eye modeling, iOS, actual photometric certification, glare/afterimage modeling.

## Risks & unknowns

Screen-capture permission may spook users (state clearly: never leaves the process, 1×1 downsample). Calibration may be too personal to be meaningful — fallback is showing *relative* recovery percentage instead of absolute magnitude. Display luminance is a poor proxy when you're not looking at the screen.

## Done means

With the app open, turning the screen white for 10 seconds then black produces a visible threshold spike and a recovery curve whose rod-cone break lands between 7 and 12 minutes, and the predicted limiting magnitude after 30 minutes of darkness matches a naked-eye star count within one magnitude on a clear night.
