# Tap Water Card

## Overview
A ZIP-code lookup that returns a plain-language "your water" card: which utility serves you, what contaminants it reported, and how those compare to health guidelines — for anyone who has ever half-wondered whether to trust their tap.

## Problem
The itch is universal and slightly anxious: "is my tap water actually safe?" The official answers live in dense annual Consumer Confidence Reports and EPA compliance databases that no normal person can parse. There's a clear appetite for a single card that says, in human terms, what's in the water at *your* address — with a map to show you're not alone.

## How it works
A search box asks for a ZIP (or address). On submit, the app resolves the ZIP to the water utility (public water system) serving it, then renders a card: utility name, population served, and a ranked list of detected contaminants (lead, arsenic, radon, PFAS, disinfection byproducts) each with a bar showing the measured level vs the legal limit vs the stricter health-guideline level. A small map highlights the utility's service area. A "compare to a friend's ZIP" affordance lets two cards sit side by side. Share exports a card PNG.

## Technical approach
Static site — **Svelte** front end, **Observable Plot** for the contaminant bars, Leaflet/MapLibre for the service-area map. Data is pre-fetched and baked, not queried live.

- **Data sources:** **EPA** SDWIS (Safe Drinking Water Information System) violation/monitoring data and **EPA "How's My Waterway"** APIs for system→area mapping; **EWG Tap Water Database** as the model for contaminant-vs-health-guideline framing (their thresholds/curation are the reference, not a scrape target). ZIP→utility crosswalk via published PWS boundary datasets.
- **Data model:** `zip_to_pws.json` (ZIP → list of system IDs), `pws.json` (system → {name, population, geometry}), `contaminants.json` (system → [{name, level, legal_limit, health_guideline, unit}]).
- **Key algorithm:** ZIP→PWS is many-to-many and messy; resolve by spatial overlap of ZIP-code tabulation areas with PWS service boundaries, pick the dominant system, and disclose alternates. Normalize every contaminant to a `level / health_guideline` ratio for the bar encoding.
- **Hard part:** the ZIP-to-utility crosswalk. Water systems don't map cleanly to ZIPs; getting a defensible "your utility" answer is the real engineering, plus reconciling three different threshold definitions (MCL vs health guideline).

## v1 scope (humiliatingly small)
- ZIP search → one utility card with the top 5 contaminants as ratio bars.
- Baked data for a single state or metro (not all 50k systems).
- Legal-limit vs health-guideline bar for each contaminant.
- No map yet — just the card.

## Out of scope (for now)
- Live EPA API calls per lookup.
- Full national coverage on day one.
- Filter/product recommendations or affiliate links.
- Historical trend charts per contaminant.

## Risks & unknowns
Prior-art verdict: **Exists.** The **EWG Tap Water Database**, **EPA How's My Waterway**, and **WaterViolations.org** already ship ZIP-lookup water-quality tools. This is the clearest kill of the round. The only honest re-angle is a sharper *artifact*: a single screenshot-ready "your water card" with a side-by-side friend-comparison — a shareable social object rather than a database front end. Even so, treat this as low-priority; the core lookup is fully solved and the differentiation is thin.

## Done means
Enter a ZIP in the seeded region and get a card naming the correct utility with at least 5 contaminants shown as level-vs-limit-vs-guideline bars, plus a working friend-comparison and PNG export.
