## Overview
Twice a day, from ~92 US sites (and ~800 worldwide), the weather service launches a radiosonde: a styrofoam brick with a GPS, a thermistor, a humidity sensor and a 403 MHz transmitter. It rises to ~30 km, the balloon bursts, and it parachutes down somewhere. The agency does not want them back. Fewer than 20% are ever recovered. This is a macOS menubar toy that quietly tracks the ones descending near you and alerts you only when one is going to land somewhere *reachable* — public land, near a road, no fence.

## Problem
SondeHub already shows every balloon in the air on a beautiful map. But it answers "where will it land," not "is it worth my Saturday." A predicted touchdown 400 m into a posted cattle ranch, or on the far side of a river, or 1,100 vertical feet up a scree slope, is not a recovery — it's a wasted drive. The chaser's actual question is a routing-and-land-access question, and nothing answers it.

## How it works
The menubar shows a tiny glyph: dormant most of the day, then a rising balloon around launch time, then a parachute as it descends. Click it for a small map with the live descent trail and a predicted landing ellipse. When a prediction enters your geofence *and* clears a reachability threshold, you get a notification: "Sonde 2Bxxxxxx, landing ~14:40, 0.6 mi walk from FR-238, national forest, 180 ft gain." One button opens walking directions to the nearest parking point.

## Technical approach
SwiftUI `MenuBarExtra`, no window, no dock icon. Data from SondeHub's public v2 API: live frames from `api.v2.sondehub.org/sondes/telemetry` (filtered by lat/lon bbox) and the burst/landing predictions endpoint; optionally the websocket feed for sub-minute updates.

The interesting work is after the last packet. Reception typically dies 1–3 km above ground while the sonde is still drifting, so the final leg must be integrated locally: parachute descent with terminal velocity scaled by air density, v(h) ≈ v₀·√(ρ₀/ρ(h)), stepped through the wind field. Wind comes from NOAA HRRR (CONUS, hourly, 3 km) via NOMADS GRIB2 subsetting, or from the Tawhiri predictor API if I want to skip GRIB parsing in v1. Monte Carlo 200 descent runs with perturbed drag and wind to get an ellipse rather than a false point.

Reachability scoring is the actual product. For each ellipse centroid: land ownership from USGS PAD-US (public/private, access class); OSM tags for `access=private`, `barrier`, `landuse=military`; nearest routable road via OSRM's nearest + a walking route to the point; elevation gain from USGS 3DEP; and a water/wetland exclusion from NHD. Score = walk distance + gain penalty, hard-gated on land access. Everything cached in SQLite so a repeat prediction re-scores in milliseconds.

Hard part: honest uncertainty. The ellipse is often 1–3 km wide; a reachability score computed on the centroid is a lie. The score must be integrated over the ellipse — "68% of the probability mass is on public land" — or the tool sends people onto someone's porch.

## v1 scope
- One hardcoded home lat/lon and radius
- Poll SondeHub predictions every 5 minutes; no local descent model, use their landing point
- Reachability = PAD-US public/private flag + straight-line distance to nearest OSM road
- One notification per sonde, with a maps link

## Out of scope
- RTL-SDR / `radiosonde_auto_rx` terminal-chase direction finding, iOS app, Windows, non-US land data, sharing/leaderboards

## Risks & unknowns
PAD-US access attributes are patchy and sometimes stale; false "public" calls are the main harm. HRRR GRIB subsetting is fiddly. Launch schedules are drifting as some sites move to less frequent or automated launches. Legally the sondes are abandoned and finders keep them, but the app should say so plainly and never route across private land.

## Done means
One real notification fires for a real sonde, and the walk described in it actually leads to the ground where the sonde landed — verified once, in person, with the styrofoam brick in hand.
