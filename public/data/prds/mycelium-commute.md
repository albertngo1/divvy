## Overview

Take the fastest-spreading documented fungi — honey fungus (Armillaria), stinkhorn (Phallus), and friends — at their real measured growth rates in cm/day, and animate them "racing" your actual commute route. The result: "Your bus beat the honey fungus by 4 hours" — or, over a long enough route, it didn't. The share is one PNG: your commute line with a fungal spread-front marching along it, timestamped.

## Problem

Fungal growth is one of the great invisible processes — Armillaria colonies are among the largest organisms on Earth, spreading meters per year underground. But the numbers ("X cm/day") are inert. There's slime-mold-network art and fungus-growth-rate literature, but no artifact that maps a growth rate onto *your* daily route and gives you a personal race result. It makes an abstract biological rate suddenly legible against something you do every morning.

## How it works

1. User draws or enters a commute (two endpoints, or an origin/destination the app routes between).
2. App computes route distance and the user's typical travel time.
3. It animates a fungal spread-front advancing along the route polyline at the fungus's true cm/day rate, side-by-side with the user's commute progress.
4. Result caption: how far the fungus got in one commute, and how long it would take the fungus to cover the whole route ("your 12km commute would take Armillaria 9 years").
5. Export the frozen race frame to one PNG.

## Technical approach — stack, data, model, hard part

**Stack:** Static SPA (Vite + Svelte) + **Mapbox GL JS** for the map, route line, and animated spread-front layer. No backend; routing via Mapbox Directions API (free tier) or user-drawn line.

**Data sources:**
- **Mapbox Directions + Geocoding API** for the commute polyline and distance.
- **Mycology literature** (hand-curated JSON): measured growth rates for a handful of fast fungi — Armillaria rhizomorph extension (~1–2 m/yr, i.e. ~0.3–0.5 cm/day), Phallus fruiting-body elongation (documented at multiple mm/hour), Pilobolus, and a couple of mycelial front rates from culture studies. Schema: `Fungus { name, rateCmPerDay, contextNote, source }`.

**Data model:** `Race { routeGeoJSON, routeLengthM, commuteMinutes, fungus }`. Frame at time t: fungal front distance `= rate(cm/day) × t`, mapped onto the polyline via turf.js `lineSliceAlong`.

**Key algorithm:** Parameterize the route by arc length (turf.js), advance the fungal front by `rate × elapsedTime`, and simultaneously advance a commute marker by `routeLength × (t / commuteTime)`. The dramatic contrast (fungus barely moves in one commute; takes years for the route) IS the payload.

**Hard part:** Time-scale reconciliation — a commute is minutes, fungal spread is cm/day, so the honest race is almost always a blowout. The design must make "the fungus barely twitched" the *joke*, and offer a "fast-forward to when the fungus finishes" mode to deliver the deep-time punchline.

Ships as one shareable PNG.

## v1 scope (humiliatingly small)

- One fungus (Armillaria), one hardcoded rate.
- User-drawn straight-ish route or two-point Directions call — no multimodal routing.
- Static "frozen frame" export; animation optional.
- Single caption template.

## Out of scope (for now)

- Multiple fungi head-to-head.
- Real underground 3D spread / soil modeling.
- Saved routes, accounts, leaderboards.
- Elevation or terrain effects on spread.

## Risks & unknowns

- **Prior-art verdict: Open.** Fungus growth rates + slime-mold-network pieces exist, but no "race your commute" artifact does. This is un-built.
- Flagged as a **one-joke piece** — limited replay value once you've seen your own commute. High viral spike, low retention.
- Growth-rate figures vary widely by species/conditions; must cite and label as "measured under X."

## Done means

- Enter/draw a commute → the route renders on a Mapbox map with a fungal front advancing along it at the true rate.
- A caption states how far the fungus got in one commute and how long the full route would take it.
- "Export PNG" produces one image: map + route + fungal front + result caption.
