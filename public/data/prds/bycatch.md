## Overview
Bycatch is a macOS menubar toy that turns the invisible RF neighborhood around your laptop into a small persistent aquarium. Click the menubar icon and a tank drops down, populated by every access point your card can currently see. It is a toy first, but there's a genuinely useful diagnostic hiding under the fish.

## Problem
Your radio environment is a living, shifting thing — hotspots come and go, a neighbor upgrades their router, a food truck parks outside on Thursdays — and the only way to look at it is a $20 engineer-grade scanner you open once a year during an outage. Also, "why is my wifi bad at 8pm" has a boring, real answer (channel contention) that nobody ever bothers to measure.

## How it works
Every 60 seconds, one passive scan. Each visible BSSID becomes a creature: **size** = RSSI, **depth band** = radio band (2.4GHz creatures swim low in the murk, 5GHz mid-water, 6GHz near the surface), **motion jitter** = RSSI variance over the last hour, **hidden/SSID-less networks** are eels that stay in the dark. Your own network wears a ring. Because identity persists by BSSID, the tank develops a memory: a network seen every day for a week becomes a **resident**; one that appears only Friday evenings is **migratory** (someone's phone hotspot); one that appears and stays gets a quiet "moved in" line in the log; one that vanishes for three days fades and drifts out. Below the tank, a two-line **Reef report**: the least-congested channel right now, and your own AP's signal trend across the day.

## Technical approach
Swift + CoreWLAN (`CWInterface.scanForNetworks(withSSID: nil)`), which on modern macOS requires Location Services authorization — that permission prompt is the first real friction and needs a good explanation string. `wdutil info` as a fallback for own-link stats. Store: SQLite `ap(bssid PK, ssid_hash, band, channel, width, first_seen, last_seen)` plus `sample(bssid, hour_bucket, rssi_mean, rssi_var, seen_count)` hourly rollups so the DB stays tiny forever. SSIDs are hashed by default with an explicit toggle to show plaintext — your neighbors' network names are personal-ish data and this should not be a wardriving tool. Rendering: SwiftUI Canvas with boids-lite steering (wander force + a depth-band spring), capped at 40 creatures, 10fps, and fully paused when the panel is closed so it costs nothing. Congestion score per channel = Σ 10^(RSSI/10) over overlapping channels, weighted by a 2.4GHz overlap mask. The hard parts: macOS throttles repeated scans (and on some hardware a scan briefly stutters the link), and mesh systems rotate BSSIDs, which quietly shatters creature identity.

## v1 scope
- 60s scan loop, SQLite rollups
- Tank with size/depth/color mapping, no polish
- Resident vs. transient labeling after 3 days of history
- One "least congested channel" line
- SSID hashing on by default

## Out of scope
Packet capture, monitor mode, anything that transmits, geolocation or mapping, export, iOS.

## Risks & unknowns
The Location Services prompt may kill installs outright; Apple has deprecated scan APIs before and could again. There's a creep-factor line here — the mitigation is that it never geolocates, never exports, and hashes names by default. Scan throttling may make 60s cadence unrealistic.

## Done means
After three days of running, the tank correctly labels which nearby networks are permanent residents and which are transients, and its recommended channel matches what an independent scanner reports.
