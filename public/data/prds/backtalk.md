## Overview
Backtalk is a self-hosted daemon (for people who already run Pi-hole/AdGuard or a mirror port) that turns the invisible background telemetry of your home network into two things: a competitive score you can rank against friends, and an ambient year-long artifact of exactly who your devices talk to behind your back.

## Problem
The Xe post 'you should probably check on your smart appliances' is a one-time scare that fades. Nobody sustains attention on the fact that a smart TV makes hundreds of tracker calls an hour. Passive dread isn't motivating; a scoreboard is. There's no fun, repeatable way to *watch your footprint shrink* — or to smugly beat your friend whose Roku won't shut up.

## How it works
Backtalk reads DNS query logs, buckets every resolved domain per client device, and classifies each domain against known telemetry/ad/tracker lists. It computes a nightly **Footprint Score** (weighted count of telemetry calls, normalized per active device-hour so a big household isn't unfairly penalized). Each morning you get a one-line deadpan report ('your Samsung TV made 4,113 calls to samsungads.com while you slept — up 12%'). An opt-in federated leaderboard lets a friend group compare normalized scores weekly. Over the year it accretes a poster: one column per day, one row per device, cell intensity = telemetry volume, so you literally see the days your new doorbell moved in and started shouting.

## Technical approach
Stack: Python + a small SQLite store, reading Pi-hole's `pihole-FTL.db` long-term query table (or Unbound/AdGuard logs) — no new capture infra for most users. Domain classification joins against OISD/Firebog telemetry blocklists plus a hand-curated smart-device tracker map (Samsung, LG, Roku, Ring, Amazon endpoints). Device attribution keys on client IP → DHCP lease → vendor OUI. Score = Σ(telemetry_hits · list_weight) / active_device_hours. Poster rendered as SVG (rows=devices, cols=day-of-year) exported to PNG via `cairosvg`. Federated leaderboard is a tiny FastAPI service accepting only the aggregate score + anon device-class histogram — never raw domains. **Hard part:** fair cross-household normalization and MAC-randomization/attribution drift, so scores mean the same thing on two very different networks.

## v1 scope
- Parse Pi-hole FTL SQLite only
- Classify against one telemetry blocklist + 10 hardcoded device vendors
- Nightly score + one-line text report to stdout/ntfy
- Local SVG year-poster that appends one column per run

## Out of scope
- Live packet capture / TLS SNI inspection
- Blocking anything (read-only, observe-don't-touch)
- Mobile app

## Risks & unknowns
- Cross-household fairness is genuinely fuzzy; leaderboard could feel arbitrary
- Device attribution breaks with mesh/guest VLANs and random MACs
- Blocklists mislabel CDNs as trackers, inflating scores

## Done means
Pointed at a real Pi-hole DB, Backtalk emits a per-device telemetry score for the last night, a one-line report naming the chattiest device, and appends a dated column to a growing PNG poster — run it 7 nights and the poster shows 7 legible columns.
