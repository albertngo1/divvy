## Overview
An interactive physics toy (and optional screensaver) that simulates the growth of gypsum crystals the way the Cave of the Crystals actually made its 11-meter selenite beams: not decoration, but real solubility thermodynamics and crystal-growth kinetics. For anyone who saw the Wikipedia photo and wanted to know *why* those crystals are impossibly big and perfect.

## Problem
Every crystal-growth visual online is decorative fiction: pretty branching that ignores physics. The Naica story is far stranger and more teachable — the crystals are giant *because* they grew agonizingly slowly, at supersaturation so low it took hundreds of millennia. The counterintuitive lesson (slower = bigger and more perfect; faster = rubble) is exactly the kind of thing a hands-on toy conveys better than a paragraph.

## How it works
You control one dial: water temperature. The cave water sits near the gypsum↔anhydrite equilibrium (~58°C). Just *below* it, anhydrite slowly dissolves and reprecipitates as gypsum at razor-thin supersaturation → few nuclei, enormous slow single crystals. Drop the temperature hard and supersaturation spikes → a blizzard of tiny competing nuclei → cloudy fine-grained rubble. Go above 58°C and gypsum won't form at all. A live readout shows supersaturation ratio, nucleation rate, linear growth rate (the real estimate is famously ~1.4 fm/s), and "time to reach current size at this rate." A fast-forward slider is the mischief: speeding up forces higher effective supersaturation, and the crystal you get is visibly worse — perfection is uncheatable.

## Technical approach
Pure client-side: TypeScript + WebGL/Three.js. Solubility crossover from the van't Hoff relation using published gypsum/anhydrite equilibrium constants; supersaturation ratio S = IAP/Ksp(T). Nucleation via classical nucleation theory (rate ∝ exp(−B/ln²S)); growth via a screw-dislocation/BCF-style rate law where linear velocity scales with (S−1). Geometry: grow a monoclinic gypsum habit (elongated prisms with the characteristic swallowtail twin) by advancing faces at rates weighted by S and Miller-index-dependent surface energy — a lightweight kinetic Wulff construction rather than full phase-field. Hardest part: keeping it *both* physically honest and visually rewarding on a 60fps budget — real growth is 12 orders of magnitude too slow to watch, so the time-mapping must be explicit and shown, never silently faked.

## v1 scope
- One temperature dial, one crystal, real solubility crossover at ~58°C.
- Three visibly distinct regimes: giant clear beam / cloudy rubble / no growth.
- Live panel: S ratio, growth rate, real elapsed-time estimate.
- Fast-forward that provably degrades crystal quality.

## Out of scope
- Full 3D phase-field, multiple mineral species, fluid convection, actual cave rendering, mobile.

## Risks & unknowns
- Getting habit geometry recognizably "selenite" without a full phase-field solver.
- Balancing scientific honesty against a toy that's fun to poke for 5 minutes.
- Kinetic constants for gypsum are sparse; may need to fit plausible values and label them.

## Done means
Holding the dial 1–2°C below 58°C over a session yields a single large clear prism; a 10°C undercooling yields visibly cloudy polycrystalline growth; the elapsed-time readout correctly reports geological timescales; and every number on screen traces to a citable solubility/kinetics source in the README.
