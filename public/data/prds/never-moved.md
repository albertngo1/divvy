## Overview
A single-page explorable that takes one street address and answers a question nobody has a good tool for: *which districts has this exact point belonged to, across all of American history, and who represented it?* Output is a vertical timeline — one band per Congress from 1789 to today — showing the district number, the member who sat in that seat, their party, and the shape of the district at that moment. For civic nerds, local journalists, redistricting-litigation researchers, and anyone who wants to see that they've been "moved" eleven times without ever leaving the house.

## Problem
Every redistricting map is drawn from the map's point of view: statewide polygons, compactness scores, efficiency gaps. But the lived experience of redistricting is *place-centric* — a house that flips between a rural district and a city district every other decade, whose representation swings from safe-red to safe-blue without a single voter changing their mind. There is no tool that renders that. Existing sites tell you your district *today*; historical shapefiles exist but sit in academic FTP directories as unusable ZIPs.

## How it works
1. Type an address. It geocodes to a lat/lon.
2. The point is tested against ~115 historical district layers, one per Congress.
3. You get a scrubber timeline: each band is a Congress, colored by the member's party, labeled with the district number and name. Hovering morphs a small inset map to that era's polygon, with the point pinned.
4. Derived stats: number of *redraw events* (the district's geometry around you materially changed), longest stable stretch, party-flip count attributable purely to line-moving vs. actual electoral swing, and a Polsby-Popper compactness sparkline of the containing district over time.

## Technical approach
Data: UCLA's *Digital Boundary Definitions of United States Congressional Districts, 1789–2012* (cdmaps.polisci.ucla.edu) for the historical layers; Census TIGER/Line for the 113th onward; Voteview's member CSVs (ICPSR ID, state, district, party, congress) to name the representative; Census Geocoder (`geocoding.geo.census.gov/geocoder/locations/onelineaddress`) for address→point.

Pipeline: an offline build step loads all shapefiles into DuckDB-spatial, repairs invalid historical geometries (`ST_MakeValid`, or shapely `buffer(0)` for self-intersecting hand-digitized coastlines), reprojects everything to EPSG:4326, simplifies with mapshaper for display, and writes one Parquet table `(congress, state_fips, district_no, geom, geom_simplified)`. Query time is a single `ST_Contains` scan with an R-tree — milliseconds. Frontend: SvelteKit + MapLibre, polygons served as PMTiles.

The genuinely hard part is the join to Voteview: at-large districts are variously coded 0, 98, or 99; multi-member districts existed into the 1840s; state boundaries themselves moved; and mid-decade redraws mean a Congress can have two valid maps. Expect a hand-curated exceptions table.

## v1 scope
- One state, hardcoded (California), 1849–present.
- Text timeline only — district number + member name + party, no inset map.
- Compactness and redraw-count stats omitted.

## Out of scope
- State legislative, school board, precinct layers.
- Anything predictive about future maps.
- Accounts, saved addresses, sharing.

## Risks & unknowns
Historical shapefile fidelity is uneven; a point near a river boundary may flip spuriously between eras. Address geocoding privacy — do it client-side against the Census API, log nothing. Total simplified geometry payload may be too big for a static host.

## Done means
Enter a Sacramento address, get a correct ordered list of every congressional district containing it since statehood, with representative names that match Voteview, verified by hand against three known cases.
