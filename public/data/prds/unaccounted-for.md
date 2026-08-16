## Overview
A web app that replaces the AWWA "Free Water Audit Software" Excel workbook for small and mid-size water utilities (under ~50k connections), and adds the thing the spreadsheet structurally cannot do: uncertainty, and a ranked list of what to measure next.

## Problem
California (SB 555), Texas (TCEQ), Georgia and others require an annual validated water-loss audit. In practice one person in Operations spends two weeks in a locked-down Excel workbook, guesses at the 1–10 "validity grade" for each of ~32 inputs, and produces a single ILI number with no confidence interval. Nobody can act on it, so it goes in a drawer. Consultants charge $5–15k to do the same thing with a better poker face.

## How it works
Upload 12 monthly production totals (SCADA totalizer CSV) and a billing export. The app builds the standard water balance: system input volume → authorized consumption (billed metered / billed unmetered / unbilled metered / unbilled unmetered) → apparent losses (meter under-registration, data-handling error, unauthorized use) → real losses. Instead of a grade lookup table, each input is graded through a plain-English interview ("Are production meters calibrated annually by a third party?").

Those grades become distributions. A Monte Carlo run propagates them into a Sankey where band width is the 90% CI — so you finally see that your "real losses" bar is half error. Then the payoff: for each input, simulate raising its grade by two and report expected CI narrowing per dollar of the intervention. Output is a ranked worklist — *"Test 40 large meters, ~$6k, cuts your ILI band 38%"* — which is the only page anyone actually needs.

## Technical approach
SvelteKit + Postgres. An audit is a versioned JSON document of 32 inputs, each `{value, unit, grade, note, source}`. The grade→uncertainty mapping follows M36's published grade bands (grade 1 ≈ ±25–50%, grade 10 ≈ ±1%) as lognormal relative SDs; 50k trials run in a Web Worker. ILI = CARL/UARL with UARL = (5.41·Lm + 0.15·Nc + 7.5·Lp)·P. Rendering via d3-sankey with a custom band-width pass. Billing ingest targets CSV exports from Tyler Incode, Springbrook, and Muni-Link.

Hard part: units and time alignment. Volumes arrive as MG, acre-feet, m³, CCF, and gal/connection/day, and the billing cycle never aligns with the production month — so proration and a period-reconciliation step must exist before any math, and must show its work when a utility disputes the total.

## v1 scope
- One utility, manual CSV upload, no integrations
- 12 of the 32 inputs (the ones that dominate variance)
- One Sankey with CI bands, one ranked VOI list
- Magic-link auth, no roles

## Out of scope
Acoustic leak detection, GIS pipe layers, AMI/hourly ingest, multi-year trending, generating the state's official PDF form.

## Risks & unknowns
Utilities buy on annual budget cycles, usually through the consultant who currently does the audit — that consultant is the channel or the enemy. AWWA publishes grade *guidance*, not distributions, so the uncertainty model is defensible but arguable and must be documented openly. Free entrenched Excel is a hard price to beat.

## Done means
Fed the inputs from a publicly published municipal water audit, the app reproduces that utility's stated ILI within 2%, and additionally prints a confidence interval and a ranked next-measurement list the spreadsheet cannot produce.
