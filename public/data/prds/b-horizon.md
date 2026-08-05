## Overview
B Horizon is a scroll-driven explorable of the ground under any US address: a to-scale cross-section of the soil profile, horizon by horizon, in the soil's real colors, with a small physics toy that shows how water actually moves through it. For gardeners, homebuyers, well-drillers, people wondering why their basement floods, and anyone who has never seen what is six feet below them.

## Problem
SSURGO is the most detailed public map of soil on earth — every US county surveyed down to the horizon, with pH, texture, hydraulic conductivity, rock fragment percentage. Its public interface is Web Soil Survey, a 2005-era ArcIMS app that makes you draw an area of interest with a rubber-band tool and emits a 40-page PDF. The data is gorgeous and nobody has ever drawn it.

## How it works
Enter an address. Geocode it, find the map unit polygon, pull its dominant component's horizon stack. Then the page becomes a vertical descent: as you scroll, you travel down the profile. Each horizon is a band, height proportional to its real thickness, filled with its Munsell color converted to sRGB and a procedural stipple whose grain reflects the sand/silt/clay fractions. A depth ruler runs alongside; annotations fade in per horizon ("Bt — clay accumulation, 34% clay, Ksat 0.6 μm/s, this is what stops your water").

Then the toys. **Pour water**: a 1-D infiltration sim runs through the real per-horizon Ksat values, animating the wetting front as it slows and perches on a restrictive layer. **Roots**: a slider showing which crops bottom out where. **Why is this here?**: surfaces parent material and landform text, so the profile becomes a story about the last glacier or floodplain.

## Technical approach
Data from USDA Soil Data Access — SQL POSTed to `SDMdataaccess.sc.egov.usda.gov/Tabular/post.rest` against `mapunit`, `component`, and `chorizon`, with the mukey resolved from a point via SDA's WKT-intersection query. Geocoding via the free Census Geocoder. Front end SvelteKit; profile drawn on canvas with a shader-ish stipple. Munsell→sRGB with the Centore conversion table. Sim is layered Green–Ampt (Richards-lite), ~50 nodes, explicit timestep in a rAF loop. Responses cached by mukey in sqlite.

The hard part is honest representation. A map unit is not one soil — it's a weighted mixture of components, and horizon depths come as low/representative/high ranges. Picking a defensible profile to draw, and showing the uncertainty band without wrecking the visual, is the entire design problem. Secondary: `chorizon` is null-heavy, so missing Ksat has to be estimated with Rosetta pedotransfer functions from texture and bulk density, and estimated values must be visually distinguished from measured ones.

## v1 scope
- One address in, dominant component only
- Static scrollable profile with real colors and depths
- Three properties annotated per horizon
- No sim, no roots, no sharing

## Out of scope
Non-US soils, gSSURGO rasters, 3-D block diagrams, mobile layout, saved locations.

## Risks & unknowns
SDA rate limits and periodic downtime; comically null tables in some survey areas; the representative-profile choice actively misleading someone on a three-component map unit who then sites a septic field.

## Done means
Paste a home address, see a to-scale, correctly colored profile with named horizons in under 4 seconds, scroll from O horizon to bedrock, hit "pour water" and watch the front stall on the Bt.
