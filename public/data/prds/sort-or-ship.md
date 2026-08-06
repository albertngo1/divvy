## Overview
A phone/tablet web app for non-ferrous scrap yards and small recyclers. It turns handheld XRF alloy-analyzer readings into a sorting-economics decision: which grades to separate out of a mixed bin, in what order, and when to stop. Buyer is the yard owner or the buyer at the scale — the person who currently decides this by gut and is wrong a few thousand dollars a month.

## Problem
A yard buys mixed aluminum or red-metal loads by the pound at a blended rate and sells to a mill by grade. The spread between "mixed low copper" and clean 6061 or C110 moves weekly and sometimes inverts. Labor to sort is real: one worker, one gun, ~60–200 pieces an hour depending on piece size. Nobody computes the crossover. Yards over-sort cheap loads and under-sort expensive ones, and the guns — $25k Olympus/Bruker/Hitachi units — already produce the exact composition data needed, then dump it into a CSV nobody opens.

## How it works
1. Set up your yard once: labor cost/hour, your buyer's grade sheet (what they pay for each grade, with penalties/deductions), typical freight per load.
2. Start a bin. Shoot pieces with the gun as usual; readings arrive over the analyzer's Bluetooth/CSV/network export.
3. After ~30 shots, the app shows a live **composition mixture estimate** for the bin and a ranked table: *separating 6061 from the 3xxx here is worth $X/hr of sorting; separating cast from wrought is worth $Y/hr; everything below your labor line is red.*
4. A running "stop sorting" line: as the profitable material comes out, marginal value per shot drops. When it crosses your loaded labor rate, the app says stop and prints the ship ticket with per-grade weights.
5. Weekly email: what you left on the table, what your realized grade recovery was vs. the mill's assay on the settled load.

## Technical approach
- Next.js PWA + Postgres. Offline-first (yards have terrible signal): IndexedDB queue, sync on reconnect.
- **Ingest**: most handhelds export CSV/XML per reading over USB, SMB share, or vendor cloud API; v1 ships a watched-folder desktop agent plus manual CSV upload. Normalize to `{timestamp, element_pcts, matched_grade, confidence}`.
- **Grade matching**: nearest-neighbor in composition space against a local copy of the aluminum/copper alloy registries (AA Teal Sheets, UNS/ASTM ranges) with per-element tolerance boxes rather than Euclidean distance — an alloy is a hyperrectangle, not a point.
- **Mixture estimate**: the shot sequence is a sample from an unknown bin composition; Dirichlet-multinomial posterior over grade fractions gives credible intervals, so the app can say "probably 30±9% 6061" from 30 shots instead of pretending it knows.
- **Decision**: for each candidate sort split, expected $ = (fraction × weight × grade spread) − (pieces/hr × labor rate). Rank splits by $/hr; greedy is optimal enough here.
- Price layer: LME/COMEX settle plus a user-entered local buyer spread. Public LME data is delayed and licensing is restrictive — v1 makes the yard type in their own buyer sheet, which is more accurate anyway.
- **Hard part**: piece weight. Composition is measured; mass isn't. v1 asks for average piece weight per bin; v2 estimates it from scale tickets by regression.

## v1 scope
- CSV upload of a day's XRF readings
- Aluminum only, ~15 common grades
- Manual buyer grade sheet entry
- One screen: bin mixture estimate + ranked sort-value table

## Out of scope
Live Bluetooth ingest, ferrous, batteries/e-scrap, inventory or accounting integration, mill settlement reconciliation.

## Risks & unknowns
Sales motion is hard — yards are relationship businesses that don't buy software. Coated/painted material and thin gauges give bad XRF reads. Vendor cloud APIs may be closed, forcing the desktop-agent path.

## Done means
One real yard runs a week of loads through it, and for at least one load the app's stop-sorting call is validated against the mill's settlement assay within 5% grade recovery.
