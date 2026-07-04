## Overview
Rebreather is a macOS/Linux menubar toy for knowledge workers who make consequential decisions in sealed rooms. It reads a cheap CO2 sensor and gates high-stakes actions — merging a PR, sending a long email, confirming a big purchase — when ambient ppm crosses a cognition-degradation threshold. It's a toy skin (a little diver icon that turns blue) wrapped around a genuinely useful nudge.

## Problem
The HN piece "the bottleneck might be the air in the room" makes the case that CO2 above ~1000ppm measurably degrades decision-making, and small offices/bedrooms hit 1500+ within an hour. Nobody opens a window mid-flow because the impairment is invisible — you feel fine while shipping your worst work. The itch: make the invisible cost of stale air arrive at the exact moment you're about to commit to something.

## How it works
A background daemon polls a CO2 sensor every 30s. The menubar shows live ppm and a diver 'depth' gauge. You register 'gated actions' — a git pre-push hook, a mailto-intercept, or a global hotkey. When you trigger one above your threshold (default 1100ppm), Rebreather interposes a 20-second modal: "Air is at 1450ppm. This is a rebreathe decision. Open a window or override." Every override is logged to a local ledger tagged with ppm, so you can later review "decisions made in bad air" against outcomes.

## Technical approach
Stack: Rust or Go daemon + a Tauri/SwiftBar menubar shell. Sensor: Aranet4 (BLE GATT, documented CO2 characteristic) or a $25 SCD41 breakout over USB-serial. BLE via `btleplug`; serial via a tiny SCD41 I2C-over-serial bridge on an ESP32. Git gating is a distributed `pre-push` hook that shells out to the daemon over a unix socket and blocks on exit code. mailto/purchase gating uses an OS-level URL-scheme handler + optional Stripe/bank-CSV nothing — just a hotkey wrapper. Ledger is a local SQLite table (ts, ppm, action, overridden). The genuinely hard part is graceful degradation when no sensor is present: fall back to a模estimated model from room volume + occupancy + time-since-window-open, clearly labeled 'estimated'.

## v1 scope
- Read one Aranet4 over BLE, show live ppm in menubar
- One gated action: git pre-push hook with override + logging
- SQLite ledger + a `rebreather log` CLI to dump overrides
- Configurable threshold

## Out of scope
- Estimated/sensorless mode
- Email/purchase interception
- Multi-sensor / multi-room, cloud sync, phone app

## Risks & unknowns
- BLE sensor pairing flakiness across OSes
- Is 1100ppm the right personal threshold? Needs per-user calibration
- Gating could feel like nagware — the 20s cool-down must feel earned, not punitive

## Done means
With an Aranet4 breathing on 1500ppm exhaled air, `git push` on a test repo blocks with the modal, an override is recorded in SQLite, and airing the room below threshold lets the next push through with no modal.
