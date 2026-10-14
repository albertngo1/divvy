## Overview
A browser sandbox that simulates coastal sediment transport in one-line shoreline form. For geography nerds, people who watch Cities: Skylines terraforming videos, and anyone who has stood on an eroding beach and wondered why the beach next door is growing.

## Problem
Longshore drift is the classic counterintuitive system: every coastal defence moves the problem somewhere else. It's taught with one static arrow diagram. Nobody gets to build a seawall and watch the consequence arrive 30 years and 5 km later.

## How it works
- Sketch a coastline, or load a real one: Holderness, Outer Banks, the Gold Coast.
- Set a wave climate: dominant swell angle, height and storm frequency, or import a real buoy rose.
- Press play. Time runs at about one year per second. Sand moves along the shore, spits grow, embayments fill, river mouths deflect.
- Place structures from a budget: groynes, breakwaters, seawalls, harbour jetties, beach nourishment drops. Each comes with a cost and a 'property at risk' layer behind the beach.
- Scenario mode gives you goals like 'keep the resort beach ≥30 m wide for 50 years without the fishing village losing its harbour.'

## Technical approach
- One-line shoreline model: the shoreline is a polyline of N cells with offset y(x). Transport uses the CERC formula, Q = K·H_b^(5/2)·sin(2(θ_b − φ)), where φ is the local shoreline angle. Conservation is ∂y/∂t = −(1/D)·∂Q/∂x, solved with explicit finite differences and a CFL-limited timestep.
- High-angle wave instability (Ashton & Murray) is included, so cuspate forelands and spits emerge on their own. That's the main visual payoff.
- Wave shadowing behind breakwaters is approximated by ray-casting from the offshore angle, which lowers H_b in the shadow.
- Groynes are transport barriers that bypass sand once they're full.
- Real data: NOAA NDBC buoy history for the wave rose, OSM coastline for the initial geometry.
- Stack: TypeScript, solver in a Web Worker, PixiJS rendering with time-lapse sand colouring by age of deposit.
- The hard part: keeping the explicit solver stable at high-angle instability while letting complex geometry (spits curling back on themselves) happen. v1 restricts the coast to a single-valued y(x).

## v1 scope
- One straight coast, one wave angle slider, one height slider
- Groynes and a seawall only
- Shoreline position chart for 3 marked towns
- 100-year run in under 2 minutes

## Out of scope (for now)
- Cross-shore storm erosion, dunes, tides
- Real-coast import
- Sonification

## Risks & unknowns
- One-line models are crude, so the app should label it a toy, not a planning tool.
- Without scenarios, the sandbox can feel aimless.
- Parameter K varies wildly with grain size, so a sensible default needs tuning.

## Done means
On a straight coast with a 45° swell, one groyne produces updrift accretion and downdrift erosion visible within 20 simulated years. Total sediment volume is conserved to within 1% over 100 years with no structures. A spit forms at a coastline corner without being scripted.
