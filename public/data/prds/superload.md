## Overview
Superload is a web tool for small heavy-haul carriers, oversize-load dispatchers, and pilot-car operators who move excavators, transformers, and modular homes. Give it an origin, a destination, and a load envelope (height, width, length, gross weight, axle spacing) and it produces a per-state oversize/overweight permit checklist and a map of low-clearance bridges and weight-restricted structures on the route.

## Problem
Moving an oversize load across three states means manually pulling each state DOT's permit portal, decoding whether the load is legal / permit / superload class, and cross-checking bridge heights so you don't 11foot8 a $2M transformer. Dispatchers do this in spreadsheets and phone calls. Big carriers buy $10k/seat routing suites; owner-operators eat the risk. The clearance data is public and free — the assembly is the painful part.

## How it works
1. User draws or geocodes a route and enters the load envelope.
2. The route is snapped to a truck road graph; the tool buffers the geometry and spatially joins it against the National Bridge Inventory.
3. Any structure whose minimum vertical clearance is below (load height + safety margin) or whose posting is below gross weight is flagged with mileage, photo-link, and a suggested detour note.
4. Each state segment is classified (legal / single-trip permit / superload) against hand-encoded dimension thresholds, producing a checklist: which permit, rough fee, escort/pilot-car requirement, travel-time restrictions.
5. Export a PDF trip packet.

## Technical approach
Stack: Python + FastAPI, PostGIS, Leaflet front end. Data: FHWA National Bridge Inventory annual CSV (fields MINVCLRUNDER for vertical clearance, lat/long, posting) loaded into PostGIS; routing via a self-hosted Valhalla truck profile or OSRM. Spatial join = `ST_DWithin` between route line and bridge points. Permit rules live in a versioned per-state JSON pack (thresholds for legal max dims, superload triggers, escort rules) — hand-researched for the first 5 states. The genuinely hard part is the permit-rules corpus: every state defines superload differently and there's no API, so this is curated data, not scraped.

## v1 scope
- One region (e.g. TX + OK + LA + AR + NM).
- Vertical-clearance bridge flagging from NBI.
- Static per-state permit checklist from JSON pack.
- PDF export.

## Out of scope
- Live permit purchasing / DOT integrations.
- Real-time construction/detour feeds.
- Weight-distribution axle engineering.

## Risks & unknowns
- NBI clearance values lag real signage; must show "verify on site."
- Permit-rule accuracy is liability-sensitive — position as planning aid, not legal advice.
- Routing graph may not include private/industrial access roads.

## Done means
Enter a 13'6"-tall, 120k-lb load from Houston to Tulsa and receive a map flagging at least one real low-clearance NBI structure on the path plus a correct 3-state permit-class checklist, exported as a PDF.
