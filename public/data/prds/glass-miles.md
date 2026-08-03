## Overview

A single-user desktop app that watches your machine's outbound TCP connections and renders each remote host on a polar map centered on you, at a radius set by physics rather than by a database. For anyone who has ever squinted at a "this server is in Frankfurt" claim and wondered whether that's true.

## Problem

Every network visualizer draws arcs to GeoIP pins. GeoIP is a *claim* — it's registrant data, often stale by years, and it is meaningless for anycast, where a thousand machines share one address. Meanwhile you already hold ground truth: round-trip time. Light in single-mode fiber moves at c/1.4682 ≈ 204,190 km/s, so a 20 ms min-RTT means the host is *at most* ~2,040 km away, full stop, no exceptions. Nobody surfaces that constraint, so nobody notices when the pin and the physics disagree.

## How it works

A background collector samples per-socket minimum RTT. You get a dark polar plot: you at center, concentric rings labeled in milliseconds *and* kilometers. Each host is drawn as an arc at its light-limit radius — an arc, not a dot, because RTT constrains distance but not bearing. Overlay the GeoIP pin's true great-circle distance as a tick. Three states, color-coded: **impossible** (claimed distance exceeds the light budget — the claim is false), **slack** (host is far closer than its RTT would allow, meaning routing detours or middleboxes), and **tight** (RTT within ~15% of the physical floor — a real, directly-peered box roughly where it says it is). Click any host to fire RIPE Atlas probes from 4 anchors and shade the intersection region on a real map: constraint-based geolocation, a feasible *area* instead of a lying pin.

## Technical approach

Collector: Linux reads `min_rtt` straight from `tcp_info` via `ss -tinH` (or a netlink `INET_DIAG` socket) every 2 s — passive, free, no probing. macOS lacks that, so fall back to timing three `connect()` handshakes to the observed host:port and taking the min. Store `(ip, port, process, min_rtt_us, first_seen, samples)` in SQLite. Enrich with MaxMind GeoLite2 (local .mmdb, no API) plus Team Cymru's whois for ASN. Frontend: Tauri shell, D3 for the polar plot, MapLibre + a WGS84 geodesic-buffer intersection (turf.js) for the CBG view. Remote multilateration uses the RIPE Atlas measurement API (`/api/v2/measurements/`, ping type, credit-funded, ~30 s latency).

The genuinely hard part is the RTT floor: min-RTT includes serialization, kernel scheduling, and the last-mile access technology (DOCSIS ~10 ms, fiber ~2 ms, LTE ~40 ms). Without subtracting your own local baseline every radius is inflated and every host looks "slack." Calibrate by taking the 1st-percentile RTT to your ISP's first public hop and treating it as an additive constant.

## v1 scope

- `ss -tinH` poll loop → SQLite, Linux only
- One static polar plot, no zoom, no live animation
- GeoLite2 distance vs light-limit distance, three colors
- Hardcoded home coordinates in a config file
- Baseline calibration as a single manually-entered millisecond number

## Out of scope

RIPE Atlas multilateration, macOS/Windows, per-process breakdown, packet capture, IPv6 flow labels, history scrubbing.

## Risks & unknowns

Corporate VPNs and split tunnels make every RTT meaningless (detect and warn). Anycast to a nearby edge is *correct* behavior, not a lie — the tool must frame "impossible" as "the database is wrong," not "you are being attacked." RIPE Atlas credits run out fast.

## Done means

Open the app while browsing normally; within 60 seconds at least one CDN host is flagged **impossible** with its GeoIP claim exceeding its light budget by >500 km, and one directly-peered host reads **tight** at under 15% slack.
