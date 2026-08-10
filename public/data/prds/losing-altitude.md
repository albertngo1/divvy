## Overview
A macOS menubar toy that assigns you one real, derelict object in low Earth orbit — a spent Delta rocket body, a 1998 fairing, a fleck of a Chinese ASAT test — and shows its altitude quietly falling in real time. The number is not decorative: it is a live drag simulation fed by today's actual space weather. For anyone who likes a desk companion with a real clock on it.

## Problem
Ambient desktop toys are almost always fake — fake fish, fake weather, fake decay. Meanwhile there is a genuine, slow, legible physical process happening overhead right now that almost nobody can feel: a solar flare puffs up the thermosphere, density at 400 km jumps by an order of magnitude, and thousands of dead objects drop measurably that week. That's a beautiful thing to put in a menubar and nobody has.

## How it works
- First launch: you're dealt a random object from the debris/rocket-body catalog with 12–60 months of life left. It gets its real name (`SL-8 R/B`, NORAD 12345) and a birth year.
- Menubar shows perigee altitude to one decimal and a 30-day sparkline. Click for a card: current altitude, decay rate in m/day, estimated reentry window as a fan of dates, and today's solar drivers.
- When the sun is active, the sparkline visibly steepens and the toy says so: *"F10.7 hit 210 today; you lost 340 m."*
- When your object reenters, you get a notification with its final ground track, a small eulogy, and a new object.

## Technical approach
Swift + SwiftUI `MenuBarExtra` (or Tauri if cross-platform matters). Data: Celestrak GP API for TLEs (`/NORAD/elements/gp.php?GROUP=debris&FORMAT=json`) filtered against SATCAT to `OBJECT_TYPE in (DEBRIS, R/B)`, `DECAYED=0`, perigee 200–500 km — derelicts only, so no ISS reboost ruins the physics. Space weather from NOAA SWPC JSON (`f107_cm_flux`, `planetary_k_index_1m`) plus the 81-day F10.7 average.

Propagation: satellite.js SGP4 for position; decay modeled semi-analytically as `da/dt = −2·B*·ρ(h,F10.7,Ap)·a²·n/ρ₀`, using the TLE's own B* as the ballistic coefficient and an NRLMSISE-00 port for density. Every TLE refresh (6–24 h) the observed altitude corrects the integrator — the sim is continuously re-anchored to reality rather than drifting into fiction. Data model: one SQLite table of `(norad_id, epoch, perigee_km, f107, ap)` samples, ~200 rows/object.

The hard part is honesty about uncertainty: reentry prediction is chaotic, so v1 renders a date *fan* from a ±30% ballistic-coefficient sweep instead of a fake precise day.

## v1 scope
- One hardcoded NORAD ID, no adoption flow
- Altitude + sparkline in the menubar, 6-hour refresh
- Solar-flux line in the dropdown
- Cached last-good values, offline tolerant

## Out of scope
3D globe, ground tracks, collision/conjunction data, notifications, multiple objects, Windows.

## Risks & unknowns
TLE cadence for tiny debris can be sparse or stale; Celestrak rate limits and asks for polite clients; NRLMSISE-00 JS ports vary in quality; objects near reentry get TLE updates erratically, right when the toy is most interesting.

## Done means
Over two weeks the displayed altitude tracks fresh TLE-derived perigee within 1 km, and a real geomagnetic disturbance visibly bends the sparkline within 24 hours of the SWPC index moving.
