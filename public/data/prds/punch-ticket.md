## Overview
Punch Ticket is a browser tool that designs at-a-glance status encodings by *measuring* how fast you can read them, not by how nice they look. You declare your states (`ok / degraded / down / stale / paused`), and it evolves a family of small SVG marks — color, guilloché line frequency, punch-hole position, notch shape — then drills you with 120ms flashes until it knows which family your visual system separates fastest. For anyone who keeps a wall dashboard, homelab TV, NOC screen, or car-mounted status display.

## Problem
Monthly transit passes were once redesigned by hand every month specifically so a conductor could accept or reject one in a fraction of a second, from three feet away, in bad light. Modern dashboards abandoned that constraint: they're read at leisure, in a browser tab, by someone already looking. So the ambient display in the hallway that you glance at for 200ms encodes state in a 12px hue difference that fails at that distance. Nobody tests dashboards the way a conductor was tested.

## How it works
1. Define states and pick a starting *idiom* (guilloché rosette, punch-card, ticket stub, semaphore bar).
2. The generator emits N=24 candidate icon sets by sampling a parameter vector: base hue, secondary hue, line frequency (cycles/deg at your declared viewing distance), rosette winding number, punch position, aspect, stroke weight.
3. A cheap surrogate scores every pair in a set: CIEDE2000 distance under normal + deutan/protan/tritan simulation (Viénot–Brettel–Mollon matrices), plus distance between the log-polar power spectra of the rasterized marks. Bottom half is culled before a human ever sees it.
4. Survivors go to the drill: fixation cross → 120ms flash of one icon at your real pixel size → 200ms pattern mask (so afterimages can't be scanned) → you press a key. A 1-up/2-down staircase adapts the flash duration to find your threshold per set.
5. Trials build a confusion matrix. Fit a Bradley–Terry-ish pairwise-discriminability model, feed it back as fitness, mutate, repeat.
6. Export: SVG sprite sheet + CSS custom properties + a JSON confusion report naming your worst pair.

## Technical approach
Vanilla TS + Vite, no framework. Icons are generated as parametric SVG paths (guilloché = hypotrochoid sampling, cheap and gorgeous). Rasterize via OffscreenCanvas for the surrogate metrics; the spectrum distance is a 2D FFT (fft.js) collapsed to log-polar bins. Timing uses `requestAnimationFrame` deltas with a measured-refresh calibration step; reject trials whose frame timing drifted >1 frame. Search is a plain (μ+λ) evolution strategy over a 9-dim vector — CMA-ES is overkill at this budget. Results in IndexedDB.

The genuinely hard part is trial economy: honest psychophysics wants hundreds of trials, and a user will give you sixty. The surrogate has to do most of the culling, and the human trials must be spent only on pairs the surrogate says are *close* — active sampling, not uniform.

## v1 scope
- One idiom (guilloché rosette), 4 states, fixed 120ms flash
- Deutan simulation only
- 24 candidates, 3 generations, ~60 trials total
- Export as a single SVG sprite file

## Out of scope
- Eye tracking, real peripheral (off-fovea) testing
- Motion/animation encodings, sound
- Multi-user norms or a shared leaderboard

## Risks & unknowns
Monitor calibration is a lie — no gamma control, no known viewing distance, so absolute thresholds are meaningless (relative rankings still hold). Sixty trials may not separate the top 3 candidates at all; the report must say "tied" rather than fake a winner. Guilloché at small sizes may alias into moiré that helps or hurts unpredictably.

## Done means
Starting from the same 4 states, two full runs a day apart pick icon sets whose worst-pair discriminability agrees within the model's stated confidence interval, and the exported sprite sheet drops into an existing dashboard with one CSS import.
