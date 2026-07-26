## Overview
A single-player browser roguelike-tycoon about running an unlicensed FM station in a real city. Each run is one station's lifespan: you start legal — a fraction of a watt under FCC Part 15 rules, audible for a block — and every upgrade past that is a bet that your audience grows faster than your heat. The run ends in a Notice of Unlicensed Operation, a seized transmitter, a fine you can't pay — or the win condition, which is unglamorous and perfect: you get an actual LPFM license and become legitimate.

## Problem
Heat-and-territory management sims (the Schedule I lineage) are always about contraband, and the physics is always fake. Radio is the same loop with *real* physics underneath: coverage isn't a circle you buy, it's a function of antenna height, terrain shadowing, and which licensed station you're stepping on. That makes the strategy legible and teachable in a way an invented drug-market sim never is. Nobody has made the good version of this.

## How it works
The map is a real metro (Providence, Oakland, Pittsburgh — anywhere with terrain). Three interlocking dials:

**Site.** Attic, church steeple, water tower, a friend's third-floor walkup. Each has height above ground, monthly rent (cash or favors), an eviction risk if the landlord notices the coax, and a *return path* — how many blocks you must walk carrying gear when you need to move fast.

**Frequency.** The real enforcement trigger isn't a scanner sweep, it's complaints. Park near an incumbent's channel and their engineer files; park in a genuine local gap and you can run for months. Second- and third-adjacent interference, IF images at ±10.7 MHz, and the aviation band above 108 all matter.

**Power.** More watts = more listeners = more donations = more people who notice.

Heat accrues per complaint. Field agents respond by taking bearings; each bearing narrows a visible cone on your map over several in-game days. You can see the cone tighten and choose: cut power, go dark for a week, move the site, or run a studio-transmitter link so the raid finds an unattended box in an empty attic instead of you.

## Technical approach
TypeScript, MapLibre GL + deck.gl, no backend. Terrain: Copernicus GLO-30 or USGS 3DEP tiles, decoded from terrain-RGB PNGs. Propagation: not full ITM — a tractable approximation. Cast ~360 radial profiles from the transmitter, sample the DEM along each, compute free-space path loss plus single knife-edge diffraction (Fresnel-Kirchhoff parameter ν, Deygout method for the dominant obstacle), add a clutter loss term from a land-cover raster. Result is a field-strength polygon, computed once per site/power change in a Web Worker, cached. Listeners = ∫ (population raster ∩ coverage) × a taste-match factor for your programming choices; population from Census block-group or WorldPop GeoTIFF. Incumbent stations come from the FCC FM Query facility export (call sign, freq, ERP, HAAT, coordinates) — real neighbors, real gaps, in your real city.

Direction-finding is the fun sim: each agent observation is a true bearing plus Gaussian error inflated by multipath in dense terrain; the displayed cone is the posterior intersection, so hiding in a valley genuinely degrades their fix.

## v1 scope
- One city, hardcoded DEM + population tiles
- Five sites, twelve legal frequencies, three power tiers
- Free-space + single knife-edge only, no clutter layer
- Weekly turn loop: set power, choose programming, pay rent, resolve complaints
- One loss state (raid) and one win state (LPFM at 60 weeks with clean heat)

## Out of scope
- Audio, actual music, DMCA anything
- Multiplayer, rival pirates
- AM/shortwave, digital modes
- City editor

## Risks & unknowns
The propagation model must be fast enough to feel interactive (target <300 ms per recompute at 360×200 samples) while still being *wrong in interesting ways* rather than uniformly circular — if flat cities produce circles, the whole strategy layer collapses and site choice stops mattering. Tuning heat so that going dark feels like a real, costly option rather than a dominant one is the balance problem. FCC facility data licensing is public domain; DEM/population tile hosting costs need checking.

## Done means
A 60-week run is playable start to finish in one sitting; two different site choices in the same city produce visibly different coverage polygons for identical power; and I can lose a run specifically because I chose a frequency two channels from a licensed station and the complaint cone found me before I moved.
