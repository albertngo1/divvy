## Overview
White Line is a mobile evidence-capture tool for excavation contractors, plumbers, and site crews who work around buried utilities. Before digging, US law requires calling 811; a locator then paints the ground marking gas, electric, water, and fiber. When a line is struck anyway, the multi-thousand-dollar fight is always *whose fault* — and the contractor almost never has clean, timestamped proof of what the marks actually showed. White Line is that proof.

## Problem
Utility strikes are a massive, boring, expensive industry problem (the Common Ground Alliance logs hundreds of thousands of damages a year). Liability hinges on whether locate marks were present, accurate, and within tolerance. Today crews document this with a few random phone photos, no location metadata, and no defensible timeline — worthless when the utility's lawyer claims the marks were fine and the operator dug carelessly.

## How it works
1. Crew opens a **Dig Ticket**, entering the 811 ticket number.
2. 'White-lining' capture: photograph the operator-marked dig area with GPS + heading + timestamp baked in.
3. 'Locate' capture: walk each painted utility line, tapping to log color/type and shooting geotagged photos; the app plots them on a satellite basemap.
4. On a strike, one tap compiles a **Damage Packet** — chronological photos, GPS trail, ticket metadata, weather, and a map — exported as a native, editable Word/PDF report the contractor can hand to their insurer or the claims adjuster.

## Technical approach
React Native (offline-first — job sites have no signal). Local store: WatermelonDB/SQLite with a queued sync. Photos stamped client-side with EXIF GPS + a rendered overlay (lat/long, UTC, ticket#, accuracy). Map via MapLibre + a cached aerial tile layer; marks stored as GeoJSON points with `{utility_type, color, photo_ids}`. Report generation borrows the DOM-docx approach from the HN feed — build the packet as HTML, convert to a native editable .docx server-side so adjusters can annotate. The hard part is trustworthy metadata: preventing backdating (server-signed timestamps on upload), handling poor GPS accuracy honestly (log and display the accuracy radius), and a chain-of-custody hash so the packet is tamper-evident.

## v1 scope
- Create a dig ticket with 811 number
- Geotagged photo capture with burned-in overlay, works fully offline
- Points-on-satellite-map view of captured marks
- One-tap PDF damage packet export

## Out of scope
- Direct 811 center API integration / auto ticket pull
- Multi-crew accounts, billing, insurer portal
- Automatic strike detection

## Risks & unknowns
- Legal admissibility varies by state; needs a real damage-prevention lawyer's review.
- GPS accuracy under tree cover / near steel is poor — must be shown, not hidden.
- Adoption: crews are phone-averse mid-dig; capture must take under 60 seconds.

## Done means
A crew can, with no cell signal, create a ticket, capture white-line and three locate marks with valid embedded GPS+timestamp, and generate a coherent PDF packet — and re-opening the app after force-quit shows nothing lost and the export queued for sync.
