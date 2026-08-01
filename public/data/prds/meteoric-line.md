## Overview
A browser explorable of the water isotope landscape: a slow, gorgeous map of δ²H and δ¹⁸O in precipitation and tap water, plus an inverse mode where you type in a measured isotope ratio (hair, bottled water, whiskey, a lab sample) and the map recolors into a posterior probability surface of where that water plausibly fell as rain. For science-curious people, forensics nerds, and anyone who's ever wondered how a lab can tell where a body has been living.

## Problem
Isotope hydrology is one of the most quietly beautiful datasets in earth science — a continent-scale field where every value is the memory of a rainstorm — and it exists today as ugly ArcGIS screenshots in PDFs and a 2007 Fortran-era web calculator. The Global Meteoric Water Line (δ²H = 8·δ¹⁸O + 10) is a stunning fact about the planet that nobody has ever animated. Meanwhile the inverse problem (isotope assignment) is done routinely in forensics and food fraud but is completely opaque to the public.

## How it works
Three linked panes. **Map**: a continuous isoscape, coloured on a diverging ramp (depleted inland/high/cold → enriched coastal/low/warm), with a scrub bar for month-of-year so you watch the continental effect breathe seasonally. **Dual-isotope plot**: every grid cell as a point in δ¹⁸O/δ²H space; the Meteoric Water Line falls out of the cloud on its own, and brushing the scatter highlights geography — the payoff moment is seeing evaporated/arid regions peel off below the line as deuterium excess drops. **Assign**: enter a measurement (with a keratin→drinking-water regression applied if you pick "hair"), get a normalized likelihood surface, optionally multiplied by a population-density prior so the answer isn't "the Andes."

## Technical approach
Source rasters: waterisotopes.org / OIPC gridded precipitation isoscapes and Bowen's US tap-water isoscape (GeoTIFF, mean + SD bands), plus IAEA GNIP station observations via the WISER export for the scatter-plot ground truth and for showing real station error bars. Preprocess in Python (rasterio) → reproject to Web Mercator, quantize δ and σ into RG16 PNG tiles. Render in MapLibre GL with a custom raster shader so the colour ramp, the month blend, and the assignment math all run on the GPU: per-pixel posterior = exp(−(δ_obs − δ_cell)² / 2(σ_cell² + σ_meas²)), normalized by a one-pass sum readback. Priors as an extra texture (GPW population density). The genuinely hard part is honest uncertainty: raster σ, the measurement σ, and the tissue-to-water regression σ must compose, and the map must visibly refuse to be confident when it shouldn't — a wide posterior should look wide, not like a crime-drama pin drop.

## v1 scope
- Continental US tap-water δ²H only, annual mean, no seasonality
- Static tiles on a CDN, no backend
- One input slider + one "paste a number" box
- Dual-isotope scatter with the meteoric line drawn
- Shareable URL encoding the measurement

## Out of scope
Uploading spectrometer files, strontium/lead isotopes, multi-tissue travel-history reconstruction, mobile-optimized layout.

## Risks & unknowns
Raster licensing/attribution must be checked per source. Tissue regressions vary by study and diet (bottled-water drinkers break the model). Biggest risk is implying forensic certainty the data can't support — needs an explicit "this is a probability field, not a location" framing.

## Done means
Type −60‰ for hair, get a posterior surface over the US that visibly concentrates in the expected latitudinal band, with a legend showing the credible-region area in km², and the scatter pane reproduces the Meteoric Water Line slope within ±0.3 of 8.0.
