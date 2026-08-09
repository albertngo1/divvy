## Overview

A scrollable, scrubbable explorable explanation of the North American Numbering Plan from 1947 to today, for map nerds and anyone who has wondered why their city has three area codes. It is the story of a namespace running out of room, told as geography.

## Problem

The existing artifacts are a static Wikipedia list and a handful of ugly GIFs of colored state maps. Nobody has drawn the actual mechanic, which is genuinely beautiful: for 48 years an area code's middle digit had to be 0 or 1, so exactly **152 codes existed in the entire continent**. Fax machines, pagers, and cell phones ate that rack. In 1995 the constraint was lifted ("interchangeable NPA codes") and the space blew open to 800. Then the relief mechanism itself changed shape — from *splits*, which divide territory, to *overlays*, which stack a second code on top of the same territory and force ten-digit dialing. That's a 2D-to-3D transition in the data, and it deserves to be drawn as one.

## How it works

A year scrubber, 1947→2026. On the plane, a choropleth of NPA territories; a split animates as a polygon fissioning, the child code flying out with its digits. On the Z axis, overlays extrude: every code covering the same footprint adds a slab, so Manhattan, Chicago, and Dallas grow visible towers while Wyoming stays flat at one. Alongside the map, the 152-slot rack fills through the mid-century, goes solid red around 1994, then bursts open to 800 slots in 1995 — the single frame the whole piece is built around.

Annotations pin the causes to dates: direct distance dialing (1951), the pager boom, the 1984 AT&T breakup, wireless, then LNP and VoIP numbers. Hover any code for its birth date, parent, and the population it served.

## Technical approach

Stack: deck.gl (PolygonLayer with `extruded`, ColumnLayer for overlay stacks) + d3 for the rack and timeline, static site, no backend.

Data: NANPA publishes the NPA database and the historical "NPA relief planning" / split-and-overlay activity records; Wikipedia's per-code articles fill in dates and parents (scrape once, hand-verify, commit as JSON — it's ~450 rows, small enough to curate by hand). Geometry comes from Census TIGER county polygons dissolved per year by NPA assignment, walking the split tree backward from present-day code→county mappings and applying each recorded split in reverse.

The hard part is honest historical geometry: no canonical per-year NPA polygon set exists, splits often follow rate-center boundaries that cut counties, and after ~1998 "boundary" stops being the right primitive at all because overlays share a footprint. The design answer is to be explicit — counties are an approximation, shown with soft edges, and overlay-era codes are drawn as height rather than area.

## v1 scope

- US lower 48, splits only, no overlays
- 12 keyframe years, static pre-baked GeoJSON per keyframe
- 2D choropleth + the 152-slot rack
- 5 annotated events

## Out of scope

Canada/Caribbean, 3D extrusion, per-NPA population and utilization data, NXX-level detail, mobile layout, animation between keyframes.

## Risks & unknowns

Backward reconstruction may be wrong for early splits with poor records; the county approximation could mislead where rate centers cut counties. Some NANPA files are PDFs needing manual transcription. Budget most of the time for data curation, not code.

## Done means

Scrubbing from 1947 to 2026 renders without a stutter, and 212's split lineage to 917/347/646 is factually correct against the NANPA record.
