## Overview
A browser toy for the curious — students, sailors, storm nerds, anyone who's watched water go up and down — that treats a year of real tide-gauge data as a multitrack recording. Each astronomical tidal constituent (M2, S2, N2, K1, O1, Mf, …) gets its own fader. Solo the Moon. Mute the Sun. Whatever remains after every astronomical fader is pulled to zero is the **residual**, and the residual is weather: storm surge, wind setup, barometric bulges, El Niño.

## Problem
Everyone is taught "the Moon causes tides," and that's where it stops. The genuinely beautiful facts — that the tide is a *sum of a few dozen pure sinusoids at frequencies fixed by orbital mechanics*, that spring/neap tides are literally the beat frequency between the Moon's 12.42-hour term and the Sun's 12.00-hour term, and that hurricane surge is *what's left over when you subtract the sky* — are locked inside oceanography coursework and MATLAB toolboxes. There is no thing you can drag with your finger that makes it obvious.

## How it works
1. Pick a NOAA station (Battery NY, Anchorage AK, Galveston TX, Nantucket) and a year.
2. We fetch verified 6-minute water levels, fit the tidal constituents by least squares, and render a stacked view: the observed record on top, one thin waveform lane per constituent below, residual on the bottom.
3. Faders: mute/solo any constituent; the reconstruction redraws live and the residual updates. Mute everything but M2 and S2 and you *see* the spring/neap envelope emerge from two sine waves beating. Mute both and Anchorage's ±9 m tide flattens to a nearly straight line — which is the whole point.
4. **Storm mode:** jump to Oct 29 2012 at the Battery. The observed curve looks like a normal tide. The residual is a 2.8 m mountain. Sandy is not in the sky; it's in the leftovers.
5. Station personality cards: Nantucket is M2-dominated; Anchorage is enormous; St. Petersburg FL is diurnal (K1+O1 beat the semidiurnals) so it gets one tide a day. A small "guess the port" mode shows an unlabeled constituent bar chart and asks which of four stations it is.

## Technical approach
- Static site: TypeScript + Canvas2D (waveform lanes are cheap: 87,600 points/year, decimate with min/max binning per pixel column). No backend beyond a cache proxy.
- Data: NOAA CO-OPS API — `api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=water_level&datum=MLLW&interval=6&units=metric&…` for observations; `product=predictions` for NOAA's own reconstruction to sanity-check ours; and NOAA's published **harmonic constants** per station as the reference answer.
- Algorithm: classic harmonic analysis à la t_tide/UTide. Build a design matrix of cos/sin pairs at the 37 standard constituent frequencies (fixed, from Doodson numbers), solve by QR least squares, apply **nodal corrections** (f, u factors from the 18.6-year lunar node cycle) — skipping these is the standard rookie error and makes a one-year fit visibly wrong. Amplitude/phase per constituent → the faders.
- Data model: `Station → {constituents: [{name, freq, amp, phase, doodson}], observed[], residual[]}`, all precomputed at load and cached as compact Float32 arrays.
- **Hard part:** frequency resolution. M2 and S2 are 0.0805 vs 0.0833 cycles/hr — separating N2, NU2, and L2 cleanly needs a full year and correct nodal handling; short records force constituent *inference* (borrowing ratios from a nearby reference station). Getting agreement with NOAA's published constants to ~2 cm and a few degrees of phase is the real engineering.

## v1 scope
- 4 hardcoded stations, 1 precomputed year each, constants baked into JSON at build time.
- 8 faders (M2, S2, N2, K1, O1, P1, M4, Mf) + "all others" bundled.
- Three lanes: observed, reconstruction-from-active-faders, residual.
- One preset button: "Sandy, the Battery."

## Out of scope
- Sonification (obvious next move, but it drags in a whole audio graph).
- Live/forecast tides, currents, any navigational use — big disclaimer.
- Arbitrary station picker with on-the-fly fitting.

## Risks & unknowns
- Nodal corrections and phase conventions (GMT vs local, epoch) are a swamp of off-by-a-lunar-month errors; validation against NOAA constants is mandatory.
- Datum/quality flags: gauges go offline exactly during storms, so the residual can have gaps precisely where it's most interesting.
- Is the payoff legible in 15 seconds to a non-nerd? The Sandy preset has to be the landing state, not a menu item.

## Done means
For all four stations, our fitted amplitudes match NOAA's published harmonic constants within 3 cm and 10° of phase; muting all faders at the Battery for Oct 2012 leaves a residual with a clear 2.5–3 m peak on Oct 29; and a first-time visitor can, unprompted, produce the spring/neap beat by soloing M2 and S2.
