## Overview

Enter your home address and birthdate. The app renders the night sky as seen from your porch, but every visible star is annotated by how far it has physically "moved" across the sky since you were born — its proper motion accumulated over your lifetime, drawn as a little arrow. The sky quietly drifts under you. The share is one PNG: your personal sky, your lifetime of stellar drift, over your address.

## Problem

The night sky feels permanent, but it isn't — stars have proper motion, and over a human lifetime the nearest ones shift measurably. ESA ships proper-motion and star-trail visualizations from Gaia, but none are personalized to *your* address and *your* birthday. There's no artifact that says "since you were born, Barnard's Star has moved this far across your sky" — turning cold catalog data into a felt, personal drift.

## How it works

1. User enters address (geocoded to lat/lon) + birthdate.
2. App computes the local horizon and a representative clear-night sky for that location.
3. For each visible bright star, it pulls Gaia proper motion (mas/yr) and multiplies by the user's age in years to get accumulated angular drift.
4. Stars are plotted at current position with an arrow showing the drift vector (exaggerated by a fixed factor so it's visible), length-labeled for the nearest/fastest movers.
5. Export to one PNG: annotated sky + address + "drift since [birth year]".

## Technical approach — stack, data, model, hard part

**Stack:** Python precompute + static SPA. Use **astropy** (SkyCoord, AltAz, EarthLocation) offline to build a curated bright-star table; ship it as JSON so the browser does no heavy astronomy. Frontend: Svelte + Canvas/SVG for the sky and arrows. Geocoding via Nominatim (OSM), free.

**Data sources:**
- **Gaia DR3** via the ESA/astroquery TAP service: query the ~5,000 brightest stars (`phot_g_mean_mag < 6.5`) for `ra, dec, pmra, pmdec, parallax`. Precomputed once, cached as JSON.
- **astropy** for coordinate transforms: given lat/lon + a fixed reference time, compute alt/az to draw the local dome and cull below-horizon stars.

**Data model:** `Star { id, name, ra, dec, pmra, pmdec, mag, parallaxMas }`. Per user: `driftArcsec = hypot(pmra, pmdec) * ageYears / 1000`.

**Key algorithm:** proper motion accumulation `Δθ = pm(mas/yr) × ageYears`; project (ra,dec) → local alt/az via astropy; render drift arrows scaled by a shared exaggeration factor so the fastest movers (Barnard's Star, 61 Cygni) read clearly while distant stars stay near-static.

**Hard part:** Making sub-arcsecond drift *visible* and honest at the same time — a real lifetime's drift is invisible to the eye, so the arrow must be exaggerated, and the label must state the true value. Also getting the local dome projection right per address.

Ships as one shareable PNG.

## v1 scope (humiliatingly small)

- Fixed reference clear-night time (e.g. midnight on a set date), not user-chosen.
- Naked-eye stars only (~mag 6.5), precomputed JSON.
- Northern-hemisphere-first; single sky projection.
- Drift arrows with a fixed exaggeration factor + true-value labels on top 10 movers only.

## Out of scope (for now)

- Live sky-time / animate through a night.
- Planets, Moon, deep-sky objects.
- Future projection ("where will Barnard's Star be in 3000").
- Full interactive planetarium controls.

## Risks & unknowns

- **Prior-art verdict: Partial.** ESA ships star-trail/proper-motion viz, but none personalized to address + birthday. The personalization is the whole novelty; the astronomy is off-the-shelf.
- Real lifetime drift is tiny → the exaggeration factor risks feeling like a cheat unless labeled well (Wow score is the lowest of the round, 7).
- Local-dome projection correctness across latitudes.

## Done means

- Enter an address + birthdate → an annotated night sky renders with correct visible stars culled to the horizon.
- Top movers show drift arrows with true arcsecond values keyed to the user's age.
- "Export PNG" produces one image: sky + address + birth-year drift caption.
