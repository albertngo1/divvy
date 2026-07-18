## Overview
Idle Current grafts the idle/incremental genre onto your home's real electricity use. Each appliance Home Assistant knows about becomes an in-game 'worker' on a factory floor; a worker produces resources only while its real-world device is actually drawing power. For homelabbers and renters who want to *feel* their consumption instead of squinting at a kWh number.

## Problem
Power dashboards are dead numbers nobody checks. Meanwhile the genuinely useful insight — which devices are vampire/phantom loads that draw watts doing nothing — is buried. Renters especially can't put a smart plug on everything. Idle Current makes 'that thing is silently costing you' visceral: a worker that consumes upkeep but produces nothing is obviously, annoyingly wrong on screen.

## How it works
You map devices once (from HA power sensors, or estimate via powercalc for dumb devices). The floor shows each device as a little worker with an output rate. When a device is on and drawing power, its worker animates and mints 'Joules' (soft currency). Standby/phantom draw = a worker slumped at its station eating upkeep with zero output — a red 'freeloader' badge. You spend Joules on cosmetic upgrades, BUT the real progression loop is efficiency: turning off a phantom load permanently retires that freeloader and grants a lump 'reclaim' bonus scaled to the watts you eliminated. A weekly 'shift report' ranks your best and worst workers and shows real kWh + cost.

## Technical approach
Self-hosted add-on. Stack: a small Python/FastAPI service subscribing to Home Assistant via its WebSocket API (`/api/websocket`, `subscribe_events` on `state_changed`) for entities in `sensor.*_power`. For unmetered devices, integrate `homeassistant-powercalc` estimates. Data model: `device{id, label, kind}`, `sample{device_id, watts, ts}`, `worker_state{joules, retired, phantom_flag}`. Phantom detection = a simple duty-cycle/threshold classifier: if a device sits in a low-but-nonzero band (e.g. 1-8W) for >X% of a rolling window with no 'active' excursions, flag it. Frontend: a lightweight canvas/Pixi factory rendered from the live state stream. Ambient angle: it accretes a year-long consumption chronicle. Hard part: turning noisy watt streams into stable on/off/standby states without a per-device model — edge detection + hysteresis + per-device learned baselines.

## v1 scope
- Read HA power sensors, one worker per device, animate on/off
- Joules accrue from real wattage; simple standby-band phantom flag
- One manual 'retire this freeloader' action with a reclaim bonus
- Weekly text shift-report (best/worst device, kWh, $)

## Out of scope
- Real NILM disaggregation from a single whole-home meter
- Cosmetic upgrade tree / meta-progression
- Non-HA data sources

## Risks & unknowns
- Requires Home Assistant + some power sensing; narrows audience.
- Standby-band classifier will misfire on variable-load devices (fridges, laptops).
- Gamifying might trivialize into 'unplug everything' rather than nuanced behavior.

## Done means
With a live HA feed, toggling a real lamp makes its on-screen worker start/stop producing within a few seconds, and a genuinely idle phantom device gets auto-flagged as a freeloader that the weekly report names.
