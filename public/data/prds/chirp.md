## Overview
Chirp is a life-safety battery and device lifecycle tracker for multifamily property managers and facilities teams. It inventories every battery-powered or sealed-life device across a building portfolio — smoke/CO detectors, smart locks, thermostats, leak sensors, exit-sign packs — and tells you exactly what will die when, batching the swaps into one efficient sweep and spitting out the compliance paper trail an insurer or fire marshal will accept.

## Problem
A 200-unit building has 600+ battery-dependent life-safety devices. Today they're tracked on nobody's spreadsheet. Maintenance is reactive: a detector chirps at 3 a.m., a tenant rips it off the ceiling, and now the unit is out of compliance and the landlord is liable. Worse, the sealed 10-year detectors installed during the mid-2010s NFPA-72 adoption wave are hitting end-of-life *right now* (2026), all at once, and no one is counting them down.

## How it works
On install or first audit, a tech scans a QR sticker slapped on each device and picks its type from a template. Chirp knows each device class's battery chemistry and rated life (or sealed EOL date). It projects a replacement calendar per building, then clusters due-soon devices into an optimized walk route ('do all of Floor 3 while you're up there'). Each completed swap re-arms the clock and stamps a photo + timestamp into a per-unit compliance PDF. A weekly digest emails the PM: '14 detectors expire this quarter, here's the route.'

## Technical approach
Stack: Postgres + a React PWA (offline-first, since basements have no signal). Data model: `property → unit → device(type, install_date, rated_life_months, sealed_eol, last_serviced)`. QR codes are short opaque IDs resolving to device rows. Route optimization is a simple nearest-neighbor over unit numbers grouped by floor/stack — no need for real TSP at building scale. Compliance export is server-rendered PDF (WeasyPrint) pulling the device service log. The genuinely hard part is the device-knowledge pack: a versioned JSON catalog of detector/lock/sensor models mapping SKU → battery type → rated life → jurisdiction rules, curated by hand and community-extended.

## v1 scope
- QR-scan device intake for one device class (smoke/CO detectors)
- Per-building replacement calendar + due-soon list
- Photo+timestamp service log and a single compliance PDF export
- Weekly email digest

## Out of scope
- Real IoT/BLE battery telemetry (manual life projection only)
- Work-order billing, tenant portals, native apps
- Multi-language device catalog beyond US NFPA rules

## Risks & unknowns
Will PMs actually do the QR intake labor for 600 devices? Onboarding is the whole battle — may need a paid first-audit service. Jurisdiction compliance rules vary wildly and getting them wrong is a liability claim, so v1 states 'tracking aid, not legal advice.'

## Done means
A PM can scan 20 detectors in a demo unit, see a dated replacement calendar, mark 3 as serviced, and download a compliance PDF listing all 20 with service dates — offline, then synced.
