## Overview
Busy Signal is a cheap passive-RF occupancy sensor for small venues—climbing gyms, laundromats, saunas, coffee shops—that publishes a live 'busyness' bar customers can check before they leave home. It's a Google-Popular-Times 'live' meter that a single owner can self-host for the price of a Pi.

## Problem
Customers constantly wonder 'is it crowded right now?' and drive over to find out. Real-time occupancy exists (Density, camera counters) but costs thousands in hardware and subscriptions—unjustifiable for a two-person cafe or a neighborhood bouldering gym. The capability is cheap to build; the niche just can't buy it.

## How it works
A Pi in the corner passively counts distinct active WiFi/BLE transmitters and aggregate RF energy over rolling time windows, maps that to a calibrated 0–100 busyness index, and posts it to a hosted widget the venue embeds on its site or Instagram bio. No app, no identification, no images—just a moving bar.

## Technical approach
Raspberry Pi with a monitor-mode-capable NIC; scapy/Kismet sniff 802.11 management frames (probe requests, data-frame source addresses) and BLE advertisements. Because modern phones randomize MACs, we never identify—we count distinct randomized MAC+sequence clusters per window plus probe-request rate and RSSI energy as features. These are meaningless raw, so each venue runs a short supervised calibration: staff log actual head counts for a few hours and we fit a regression (feature vector → people). Output ships over MQTT to a tiny web widget. The hard part is exactly that: MAC randomization and phones-in-pockets mean the per-venue calibration IS the product; without it, counts are noise.

## v1 scope
- One Pi, one venue, one zone
- A single live busyness number on a public web page
- Hand-run calibration regression from a few hours of logged counts

## Out of scope
- Device identity, dwell time, or demographics
- Multi-zone / multi-venue dashboards
- Historical analytics beyond a rolling day
- Any camera or PII path

## Risks & unknowns
Aggressive MAC randomization can defeat naive counting; calibration may drift as phone OSes change. Even fully anonymous, 'sniffing' has bad privacy optics that need clear messaging. Passive monitoring legality varies by region. Accuracy may only ever be a coarse low/med/high band.

## Done means
Standing in a half-full cafe the widget reads about 50, climbs to ~90 during the lunch rush and settles at ~10 after close—tracking reality within a visible band, with zero cameras and no identifying data stored.
