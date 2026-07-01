## Overview

Migration phase-shift clock plots each tracked animal species on a polar 12-month clock — the angle around the dial is the day of year, and a ring of marks shows when that species arrives, departs, breeds, or peaks in movement. Behind the current-decade ring sits a ghost overlay of the same species' historical baseline. Where the two rings drift apart, you're looking at climate-driven calendar shift: the bird that used to leave in October now leaves in November. The polar form makes the "clock running fast/slow" metaphor literal.

## Problem

Phenology drift (seasonal timing shifting with climate) is well documented in ecology, but the standard viz is a line chart of arrival-date-vs-year — undramatic. There's no polar radial clock that shows the *phase shift itself* as an angular gap, and none built directly off open animal-tracking data. The polar framing turns a slope into a visible rotation.

## How it works

Choose a species (or small multiples of many). Its movement data across the year is binned into a 365-slot polar histogram — a ring where mark density/radius encodes how much of the population is on the move on that day. The current-period ring is solid; the historical baseline is a faint ghost ring. An animated playhead sweeps the dial once per year. The angular offset between "peak movement now" and "peak movement then" is annotated in days. Small-multiples let you scan dozens of species and spot which ones drifted most.

## Technical approach — specific & technical

Stack: static site, Vite + TypeScript, D3 (`d3.arc`, radial scales) or plain Canvas for the polar rings and animated playhead.

Data sources by name:
- **Movebank** (`movebank.org`) — open animal-tracking database with GPS tracks and timestamps for thousands of study animals; access via the Movebank REST API or the **MoveApps** pipeline. Filter to studies with a Creative Commons / open license and multi-year coverage.
- Optional supplement: **GBIF** occurrence records (with `eventDate`) as a coarser phenology signal where a species lacks long Movebank tracks, and **eBird** status-and-trends for arrival/departure baselines.

Pipeline (offline, Python + `movebank` API + pandas): for each species/study, extract timestamped fixes → compute daily net displacement (great-circle distance between consecutive daily centroids) as a "migratory activity" signal → bin by day-of-year → produce a 365-length ring array per period. Split into a "baseline" period (earliest available years) and a "current" period (latest). Store both.

Data model: `species[{name, baseline_ring:[365 floats], current_ring:[365 floats], peak_shift_days}]`. `peak_shift_days` = circular difference between argmax of the two rings.

Key algorithm: circular statistics — the phase of each ring is the circular mean of day-of-year weighted by activity; the shift is the signed circular difference. Rendering: map day-of-year to angle (0°=Jan 1), activity to radius. The hard part is that Movebank studies are uneven — different species, tag counts, and time spans — so baselines are ragged; mitigate by requiring a minimum multi-year span and normalizing per-species.

## v1 scope (humiliatingly small)

- 6–12 species with clean multi-year Movebank tracks.
- One polar clock with baseline-ghost overlay + animated playhead.
- Precomputed ring arrays in JSON; no live API at runtime.
- Static annotation of peak-shift in days per species.

## Out of scope (for now)

- Full Movebank crawl, live data, user-selectable date windows.
- Statistical significance testing of the drift.
- Map view of the actual tracks (this is timing, not geography).

## Risks & unknowns

Prior-art verdict: **Open**. Phenology drift is documented but no polar radial clock viz built from Movebank exists. Unbuilt = the entire artifact. Risks: Movebank licensing varies per study — must filter to open/CC studies, which shrinks the pool; historical baselines may be too short to be a true "1990s baseline" (adjust the framing to "earliest vs latest available" honestly). Net-displacement as a migration proxy is crude — validate against a known migrant (e.g., a stork or crane study) before scaling.

## Done means

A polar clock for at least 6 species renders in-browser with a baseline ghost ring, an animated playhead, and a legible angular gap annotated in days — built entirely from open Movebank studies, data precomputed.
