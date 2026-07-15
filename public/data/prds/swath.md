## Overview
Swath is a mobile field app for agricultural drone-spray operators — the fast-growing crowd flying DJI Agras / XAG rigs (and the ArduPilot-derived open stacks) to apply pesticides and fertilizer. It turns the legally-required pesticide application record from a clipboard chore into a 30-second, GPS-and-weather-stamped tap.

## Problem
Under US federal rule and every state's ag department, each restricted-use pesticide application must be recorded: product + EPA registration number, rate, total applied, crop, field location, date/time, applicator, and — critically for drones — wind speed/direction at application (drift liability). Operators do this on paper or a spreadsheet at day's end from memory, which is error-prone, audit-risky, and a nightmare when a neighbor complains about drift. As drone spraying explodes, small custom applicators are getting regulatory scrutiny they've never had to handle.

## How it works
Before a job, the operator picks a field (draw/import a boundary or drop a pin) and a product from their chemical shelf. At each application they hit "Log Pass": the app grabs GPS, timestamps, and auto-fetches on-site wind from the nearest weather source, flags if wind exceeds the label's drift threshold, and lets them snap a photo of the tank mix / product label (OCR pre-fills EPA reg number). At day's end it compiles per-field application records into the state's required format as a signed PDF, ready to hand an inspector or the grower.

## Technical approach
Stack: React Native + SQLite for offline-first (fields have no signal), sync to a small Postgres/Supabase backend when back in range. Weather: Open-Meteo / NWS point forecast + optional pairing to the drone's or a handheld anemometer over BLE for real on-site wind. Chemical database seeded from the EPA Pesticide Product Label System (PPLS) so product name → EPA reg number → label drift/buffer constraints. Boundaries stored as GeoJSON; acreage from a spherical polygon area calc. Label OCR via on-device ML Kit. The hard part is the compliance mapping: each state has a different record layout and field set — a versioned per-state "record schema" JSON drives PDF generation so we add states without shipping new code.

## v1 scope
- One state's record format (start with a high-drone-adoption ag state)
- Manual product entry + EPA reg lookup from a bundled PPLS subset
- Log Pass with GPS + fetched wind + drift warning
- End-of-day per-field PDF export

## Out of scope
- Direct e-filing to state portals
- Flight-path/coverage telemetry import from the drone
- Multi-operator crew management, billing

## Risks & unknowns
- Compliance formats vary and change; wrong template is worse than paper.
- Fetched wind ≠ ground truth at the field; BLE anemometer support may be needed sooner than v2.
- Market is price-sensitive small operators.

## Done means
An operator logs three passes across two fields offline, and the app produces a valid, inspector-acceptable state pesticide application record PDF containing correct EPA reg numbers, acreage, and per-pass wind readings — with a drift warning fired on the pass logged above the label's wind limit.
