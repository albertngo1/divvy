## Overview
Deferral is a single-page tool for frequent whole-blood and double-red donors. You enter your donation history, sex, weight, and any ferritin lab values you have; it simulates your body iron stores forward in time and shows you when you are *actually* recovered — usually far past the eligibility date your donation center will happily book you for.

## Problem
Each whole-blood donation removes roughly 200–250 mg of iron. The gut absorbs on the order of 1–2 mg/day net, more when stores are depleted. That arithmetic says months, not eight weeks — and the RISE study found a large fraction of frequent donors sitting in iron-depleted territory with perfectly passing hemoglobin, because Hgb is a lagging indicator and the copper-sulfate fingerstick is a supply-side gate, not a health readout. Donors are told "you're eligible!" and feel inexplicably flat for a year. There is no consumer tool that models this; there is a wall of PDFs.

## How it works
A two-compartment ODE toy you can scrub through time:
- **Stores** (ferritin-proxy, mg) and **Circulating** (hemoglobin iron, mg).
- A donation is an impulse: instantaneous loss from Circulating, plus the erythropoietic rebuild that then drains Stores.
- Absorption is state-dependent — the classic inverse relationship between stores and fractional absorption — modulated by your diet profile (omnivore / vegetarian / supplementing, with a heme vs non-heme absorption split and a vitamin-C toggle).
- Output: two curves over 18 months, a shaded "depleted" band, your center's eligibility ticks, and one honest headline — *your next donation is safe on this date, not that one.*
- If you enter measured ferritin values, the model fits your personal absorption rate to them by least squares and re-projects. Two labs is enough to make it yours.

## Technical approach
Pure client-side: TypeScript + a hand-rolled RK4 integrator (the system is tiny and stiff-free), Observable Plot or raw SVG for the curves, everything in localStorage — health data never leaves the browser, which is the point. Parameters seeded from published literature: donation iron loss by donation type, RBC lifespan ~120d, EPO-driven rebuild time constant, absorption-vs-ferritin curve. Fitting: Levenberg–Marquardt over 2–3 free parameters (absorption scale, baseline stores, loss per donation) against user lab points. Ship a `params.json` with every constant and its citation, visible in the UI. The genuinely hard part is honest uncertainty: publish a Monte Carlo band over parameter priors so the answer reads as a range, never a false-precision date, and refuse to give a number at all if inputs are outside the modeled population.

## v1 scope
- Whole blood only, adult, one sex-based parameter set
- Manual donation dates, no ferritin fitting
- One chart, one date, one paragraph of plain-English explanation
- Prominent "this is a model, not medical advice; ask for a ferritin test" banner

## Out of scope
Apheresis/platelet, pediatric, pregnancy, hemochromatosis (inverted use case), any account system, any donation-center API integration.

## Risks & unknowns
Medical-advice framing must stay firmly educational. Population parameters vary enormously between individuals. There's a real possibility the tool discourages donation — mitigate by framing it as *donate more sustainably, for more years*, and by surfacing that many centers will run a ferritin test if you ask.

## Done means
Entering four real donations over the past year produces a curve whose shape a hematology paper would recognize, and adding one measured ferritin value visibly bends the projection toward that point.
