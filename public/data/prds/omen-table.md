## Overview
Omen Table is a macOS menubar toy that reads your machine's own telemetry as divination. Every night at 03:00 it renders a single illuminated page — a serpent whose body traces the day's thermal curve, ringed by archaic prognostications drawn from the day's real anomalies. After 365 pages it imposes them into a printable, bindable codex. For people who like ambient artifacts that accrete, and secretly for anyone who wants a year-long record of when their laptop started behaving badly.

## Problem
Machine telemetry is either invisible or hostile: iStat menus, `powermetrics` dumps, Grafana dashboards you stop opening after a week. Nobody reviews their own machine's history, so "it's been running hot since roughly… May?" is the best diagnosis anyone can give. Meanwhile the desktop-toy genre is stuck on aquariums and clocks — nothing that grows into an object.

## How it works
A daemon samples ~8 channels every 60s. At night, each channel gets a robust z-score against a 28-day rolling median/MAD baseline, bucketed by hour-of-day so "hot at 2pm during builds" is normal and "hot at 4am" is not. Each (channel, sign, magnitude) triple maps into a hand-authored corpus of ~200 archaic clauses styled after the Persian Mâr-Nâmeh's omen tables: "If the serpent lies coiled to the left of the threshold at dusk, expect visitors" becomes "the fans rose thrice unbidden while the disk slept: expect a guest process." The clause is real signal; the register is augury. Marginalia print the actual numbers in small caps, so the page is auditable.

## Technical approach
Swift menubar app + a launchd-scheduled sampler. Channels: fan RPM and die temperature via SMC keys through IOKit, thermal pressure from `pmset -g therm`, `vm_stat` compressor/swap-in pages, disk latency from `iostat`, wifi RSSI via CoreWLAN, per-process peak RSS via `libproc`, wake count from `pmset -g log`. Storage: SQLite, one row per sample, ~500k rows/year — trivial. Render: SVG generated in Swift, no browser. The serpent is a Catmull-Rom spline through 24 hourly temperature points, thickness driven by load, scale pattern hatched by a seeded Poisson-disk fill; seed = SHA256(date + hardware UUID) so pages are deterministic and reproducible. Gold leaf is a two-stop gradient with a noise mask. Year-end binding: assemble SVGs into a PDF with signature imposition (4-up saddle stitch) via Core Graphics.

The genuinely hard part is layout that never collides — variable-length clauses, a variable-shape serpent, and fixed page furniture — solved with a simple constraint pass: reserve serpent bounding box, then greedily place text blocks into remaining rects, shrinking the clause corpus selection to whatever fits.

## v1 scope
- Three channels only: fan RPM, die temp, memory pressure
- One page template, one serpent generator, no gold leaf
- 40 hand-written omen clauses
- Writes `~/Documents/Omens/YYYY-MM-DD.svg` nightly
- Menubar icon = today's serpent glyph; click opens today's page

## Out of scope
Windows/Linux, iCloud sync, sharing, any prediction of the future that isn't a joke, LLM-written clauses (they'd sand off the voice).

## Risks & unknowns
SMC keys differ across Apple Silicon revisions and some report nothing on fanless Airs — need a capability probe and graceful channel dropout. Baselines are meaningless for the first 28 days; ship a "the serpent is still young" state. Charm may not survive page 30 if the clause corpus is too small.

## Done means
After 14 consecutive days a stranger can open the folder, see 14 distinct pages, and correctly point at the one day you ran a long compile — from the artwork alone, before reading the marginalia.
