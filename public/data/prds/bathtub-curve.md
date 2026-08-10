## Overview
A home-maintenance app that behaves like an actuary instead of a checklist. You photograph nameplates around the house; it decodes ages, fits a hazard curve to each component, and produces one calendar of failure probabilities plus a sinking-fund number. For homeowners who don't want a chore app — they want to know what's going to break and how much cash to hold.

## Problem
Every home-inventory app asks you to type an install date you don't know, then reminds you to change filters. Nobody tells you the thing that actually matters: this year, what's the chance something fails expensively, and which item? Deferred maintenance is a budgeting problem disguised as a chore problem. And "appliances last 10 years" is useless — a tank water heater in 16-grain water dies years before one in soft water, and a 9-year-old heater's risk is nothing like a 12-year-old's.

## How it works
1. Photograph a nameplate. OCR pulls brand + serial. A decoder table maps the serial to a manufacture date — Rheem, A.O. Smith, Carrier, Trane and most others encode year and week directly in the serial, so the app knows the age even when the owner doesn't. This is the onboarding magic trick.
2. The app geocodes your address to a water-hardness value and cooling-degree-day normal.
3. Each component gets a Weibull hazard curve, adjusted for those covariates.
4. Output: a hazard calendar ("water heater: 23% chance of failure this year, rising to 31% next"), a household headline ("41% chance of a >$1,500 failure in 2026"), a suggested monthly sinking-fund contribution, and a repair-vs-replace crossover line the next time something breaks.

## Technical approach
Next.js + Postgres; on-device OCR via the browser's Shape Detection API with a Tesseract fallback. Serial decoders are per-brand regex + rule modules — genuinely tedious, genuinely the moat. Priors: NAHB "Life Expectancy of Home Components" and InterNACHI charts give median life per class; fit λ from the median and pick shape k by failure mode (k≈2.5 for wear-out mechanical, k≈1.1 for electronics/control boards). Covariates enter as a proportional-hazards scale on λ: USGS national water-hardness grid > 10 gpg → λ × 0.8 for tank water heaters and dishwashers; NOAA CDD normals > 3000 → λ × 0.85 for compressors. Recall exposure is checked against the CPSC SaferProducts API by model number. Annual conditional failure probability is 1 − exp(((t/λ)^k) − (((t+1)/λ)^k)), summed across components with a Monte Carlo for the household headline and repair-vs-replace evaluated as repair cost versus (replacement cost × expected remaining life ÷ full expected life). Hard part is calibration: published lifespans are marketing-grade, so v1 must be honest about wide intervals and start collecting anonymized "it died at age N" reports to refit λ per class per region.

## v1 scope
- Six component classes: tank water heater, AC condenser, furnace, dishwasher, washer, roof
- Serial decoders for four brands
- Water hardness only (skip climate covariates)
- One page: hazard calendar + sinking-fund dollar figure

## Out of scope
Contractor booking, warranty claims, filter reminders, insurance integration, photo inventory for claims.

## Risks & unknowns
Garbage priors produce confident nonsense; the honest version shows intervals so wide users shrug. Serial formats change silently by brand and plant. Also: telling someone there's a 23% chance of a flood this year may just make them anxious rather than prepared.

## Done means
A photo of a real A.O. Smith water heater label returns the correct manufacture month, a 12-month failure probability that shifts measurably when the address changes from a soft-water to a hard-water zip, and a sinking-fund figure that reconciles with the summed expected annual replacement cost.
