## Overview
A map tool and open dataset that flags freshwater species occurrences which natural dispersal **cannot** explain, and ranks them by how a human probably moved them. For state fisheries biologists, watershed councils, lake associations, and naturalists who want to know what's actually native to the water behind their house.

## Problem
Illegal introductions — bait-bucket dumps, aquarium releases, unauthorized stocking — are typically noticed years after establishment, when eradication is already hopeless. The evidence is usually sitting in public occurrence databases the whole time; it's just never checked against hydrology. Anomaly detection here is a graph reachability question, and nobody runs it because stitching the flow network to the occurrence records is a weekend of unglamorous plumbing.

## How it works
Pick a species. The map colors every occurrence by dispersal plausibility. Behind it: a directed graph of HUC12 watersheds (flow-to edges) is traversed outward from the species' documented native basins, with barrier edges weighted or cut — major dams, waterfalls, salinity thresholds for stenohaline fish, thermal limits. Basins reachable by in-water movement are green; occurrences outside the reachable set are jump dispersal, i.e. somebody's cooler. Each anomaly gets a vector-likelihood score from proximity to boat ramps, hatcheries, bait shops, reservoir age, and interstate crossings. A lightweight climate-niche check says whether the population is likely to establish or die out. Output: ranked anomaly table, downloadable GeoJSON, optional watch-list alerts on new records.

## Technical approach
Flow network from NHDPlus HR value-added attributes (HydroSHEDS for the global version), loaded as an edge list in Postgres/PostGIS; reachability by BFS over the basin graph with barrier costs, precomputed per species into a reachable-basin bitset. Occurrences from the GBIF Occurrence API, USGS Nonindigenous Aquatic Species database, and research-grade iNaturalist; native ranges from NatureServe/USGS/IUCN. Frontend MapLibre + deck.gl over pmtiles. The hard part is that junk georeferencing looks *exactly* like jump dispersal: museum records snapped to county centroids, swapped lat/long signs, and "Lake X, County Y" strings resolved to the county seat. Defenses: a centroid detector (records within 500m of a county or PLSS centroid get demoted), `coordinateUncertaintyInMeters` and `basisOfRecord` filtering, dropping captive/cultivated flags, and a three-tier confidence label so a biologist can see why something was flagged.

## v1 scope
- Three species in one state (northern snakehead, red swamp crayfish, white perch)
- Precomputed static GeoJSON, no live queries
- One map page: green/amber/red dots, click for record provenance
- No alerts, no accounts, no reporting workflow

## Out of scope
Terrestrial and marine species; eDNA; forward spread prediction; agency reporting integration; genetics-based source attribution.

## Risks & unknowns
Native-range polygons are coarse and sometimes wrong, which turns a cryptic native population into a false accusation. NatureServe licensing may not permit redistribution. Publishing precise coordinates is a poaching risk for anything rare — only publish for flagged non-natives.

## Done means
Against 20 documented introductions written up in USGS NAS literature, the tool flags ≥16 using occurrence data alone, while flagging ≤2 of 100 randomly sampled native-range occurrences of the same species.
