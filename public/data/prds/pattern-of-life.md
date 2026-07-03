## Overview
A local, offline privacy self-audit tool for anyone who hoards photos. Where Immich exists to *archive your photos forever*, Pattern of Life inverts that purpose: it treats your own archive as an intelligence dataset and shows you exactly what a stalker, abuser, or data broker could infer about your movements from the EXIF metadata you've been silently accumulating. For privacy-anxious people, domestic-abuse survivors, journalists, and anyone about to list a house or post a moving-day photo.

## Problem
Every phone photo can carry GPS coordinates and a precise timestamp. Most people have tens of thousands of them synced to a folder. Virginia just banned the *sale* of geolocation data — but your own library leaks the same intelligence for free, and you have no way to see it. Deleting one geotag before posting doesn't help if the pattern is already inferable from your archive. Nobody can audit a threat they can't visualize.

## How it works
You point the tool at a photo directory. It parses EXIF from every image, extracts (lat, lon, timestamp), and runs a pattern-of-life analysis: DBSCAN clusters geotags into 'significant locations', then ranks them — the cluster most active 1am–5am is flagged HOME, the weekday-9-to-5 cluster is WORK, recurring short-dwell clusters near HOME on weekday mornings get flagged as possible school/daycare. It renders a heatmap + a timeline scrubber, and generates a plain-English 'threat report': "From these 8,400 photos, an attacker could locate your home to within 40m and predict you're there weeknights after 6pm." One-click 'scrub' strips geotags from a selected export copy.

## Technical approach
Rust or Python CLI + a local web UI (single static page, Leaflet + MapLibre, tiles from a bundled offline set or OSM). EXIF via `exiftool`/`pyexiv2`. Clustering: scikit-learn DBSCAN on haversine-projected coordinates (eps ≈ 50–100m). Home/work inference: histogram of cluster visits by hour-of-day and day-of-week. Everything runs on-device — no network calls, ever (that's the whole trust model). The genuinely hard part is *labeling* clusters correctly and phrasing findings so they inform rather than terrify, plus handling messy/absent timezones in EXIF.

## v1 scope
- Ingest a folder of JPEGs, extract geotag + timestamp
- DBSCAN into significant-location clusters
- Flag the single most-likely HOME cluster by night-hours dwell
- Render clusters + a heatmap on an offline map
- Export EXIF-scrubbed copies of selected photos

## Out of scope
- Video, RAW, HEIC-only libraries (v1 = JPEG)
- Cloud sync / iCloud / Google Photos direct integration
- Face recognition or object detection
- Multi-user or shared-library analysis

## Risks & unknowns
- Dual-use: same tool doxxes *others'* photos — mitigate by refusing folders that aren't the user's own is impossible, so lean on offline-only + clear framing.
- Many phones strip GPS on share; libraries vary wildly in coverage.
- Timezone/DST bugs corrupt hour-of-day inference.

## Done means
Given a test folder of 500 geotagged photos with a known home location, the tool identifies the correct HOME cluster within 100m, renders it on the map, produces a readable threat report, and exports scrubbed copies with zero GPS EXIF — with the network cable unplugged the entire time.
