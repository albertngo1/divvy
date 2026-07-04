## Overview
Stack Effect is a lightweight idle/incremental city-builder for people who work at a desk all day, where in-game productivity is coupled to your actual indoor air quality. It runs in a menubar/desktop window and reads a cheap CO2 sensor sitting next to you.

## Problem
Indoor CO2 routinely climbs past 1,000–1,500 ppm in a closed room, measurably degrading decision-making and focus (the recurring "the bottleneck is the air in the room" thesis). People own CO2 sensors and ignore them — a number ticking up in ppm is easy to tune out. A game economy you *care about* stalling is not.

## How it works
You tend a tiny procedurally-grown settlement. Each tick, workers produce wood/food/coin. Their per-tick yield is scaled by a `focus` multiplier derived from live CO2: ~1.0x at <650 ppm, degrading toward 0.2x past ~1,400 ppm, with a short lag so it feels like the room "filling up." High CO2 also spawns visible malaise — workers slump, a haze tints the map. Ventilating (opening a window/door, stepping out) drops ppm; the sensor sees it within a minute and the settlement visibly perks up, often with a burst-bonus for a *rapid* drop (the titular stack effect — cool fresh air rushing in). Overnight the game runs at baseline so you wake to modest progress, rewarding a well-ventilated bedroom.

## Technical approach
Stack: Tauri (Rust core + web UI) or an Electron menubar app. Sensor: Sensirion SCD40/SCD41 (~$25, true NDIR-ish photoacoustic) over a USB serial bridge, or an Aranet4 read via BLE (GATT current-reading characteristic), or any sensor already publishing to Home Assistant/MQTT — a pluggable `Source` interface with `poll() -> ppm`. Game state is a plain reducer over ticks persisted to SQLite; the only external input is the ppm reading. Key algorithm: an EMA-smoothed ppm with a derivative term to detect ventilation events for the burst bonus, plus a calibration step (baseline outdoor ~420 ppm). The genuinely hard part is making the coupling *feel fair* across wildly different rooms/sensors — auto-calibrating each user's personal floor/ceiling so a naturally leaky office and a sealed bedroom both get a satisfying curve.

## v1 scope
- One resource, one settlement, tick loop with focus multiplier
- Support exactly one sensor path (Aranet4 over BLE) plus a `--demo` synthetic ppm feed
- Visible haze + worker-slump state at high ppm
- Ventilation burst-bonus on rapid drops
- Local save, menubar ppm readout

## Out of scope
- Multiplayer/leaderboards, temperature/humidity/VOC, mobile app, cloud sync, prestige/meta layers.

## Risks & unknowns
- Sensor lag + placement noise could make the coupling feel arbitrary; needs the auto-calibration to land.
- People without a sensor can't play (mitigate with demo mode + a clear BOM).
- Guilt-mechanics can feel nagging; tune toward reward-for-fresh-air, not punishment.

## Done means
With an Aranet4 nearby, breathing on the sensor (or closing the room) visibly stalls production within ~90s, and opening a window recovers it with a burst bonus within ~2 min — verified by a screen-recording showing ppm, focus multiplier, and resource rate moving together.
