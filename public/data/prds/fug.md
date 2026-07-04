## Overview
Fug ('a warm stale stuffy room') is a homelab dashboard that turns household air quality into a competition. Cheap CO2 sensors in each room stream parts-per-million to a central board that ranks rooms best-to-worst in real time and nudges (or roasts) the loser. Aimed at homelabbers, remote workers, and families with a competitive streak. Sparked by the HN post arguing the real bottleneck in a meeting is the CO2 in the room.

## Problem
CO2 above ~1000ppm measurably dulls decision-making, and most people have no idea their office/bedroom sits at 1500+ all afternoon. Passive readouts (a number on a sensor) get ignored. Air quality needs a *reason to act now* — and shame + rivalry is a great one.

## How it works
Each room has a sensor node publishing ppm every 30s. Fug's dashboard shows a live ranked list: greenest room on top, stuffiest at the bottom with a pulsing 'OPEN A WINDOW' badge. Score accrues over the day as time-under-1000ppm; a nightly rollup crowns 'Freshest Room' and 'Fug Zone of the Day.' Optional ntfy push when your room crosses threshold: 'The office is losing. 1240ppm.' Weekly household leaderboard for bragging rights.

## Technical approach
Hardware: **ESP32 + Sensirion SCD40/SCD41** true-CO2 sensors (~$15 each), one per room, flashed with **ESPHome** publishing over MQTT. Backend: a small Node/Python service subscribing to MQTT (Mosquitto), writing to **SQLite** (or InfluxDB if you already run one), computing per-room rolling time-under-threshold. Frontend: a single-page dashboard (SvelteKit) with a websocket for live ranks, plus a 24h sparkline per room. Ships as a Docker Compose stack to slot into an existing homelab; ntfy already runs here (port 8090). The hard part is honest cross-sensor calibration — SCD4x drift means room A vs room B comparisons need a shared baseline (auto-calibration + periodic 'all windows open' reference reading).

## v1 scope
- Two sensor nodes + Mosquitto + one dashboard page
- Live ranked list with color + a single threshold badge
- Daily 'freshest room' computed from time-under-1000ppm

## Out of scope
- Historical analytics beyond 24h; multi-home/cloud
- Automation (smart-vent triggering) — just inform and shame
- Temp/humidity/VOC (CO2-only for v1)

## Risks & unknowns
- Sensor calibration drift undermines fair room-vs-room ranking
- People with genuinely worse rooms (no window) always lose → demotivating; may need handicap scoring
- Hardware assembly is the real friction for adoption

## Done means
Two real sensors in two rooms drive a live board that reorders as ppm changes, fires an ntfy alert when a room passes 1000, and prints a correct 'freshest room' at end of day.
