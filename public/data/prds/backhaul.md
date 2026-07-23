## Overview
Backhaul is a self-hosted passive network monitor for anyone with a homelab or a busy household LAN. It answers one uncomfortable question: *is a device on my network being used as a residential proxy exit node without my knowledge?* — the exact abuse LG just moved to ban inside Smart TV apps.

## Problem
Residential-proxy networks (Bright Data, IPRoyal, Honeygain-style SDKs, and shadier ones) pay app developers to embed a bandwidth-resale SDK. Your smart TV, a free VPN app, a mobile game, or a rooted IoT gadget silently forwards strangers' traffic through your IP. You never see it, but your IP ends up on abuse lists, your ISP flags you, and scrapers/fraud rides on your name. There's no consumer-grade way to *notice* it happening.

## How it works
Backhaul sits on a mirror/SPAN port or runs on your router (OpenWrt/pfSense) and watches flow metadata — not payloads. It builds a per-device behavioral fingerprint and flags exit-node signatures: (1) inbound long-lived TLS connections from many distinct foreign ASNs to a device that should only *originate* traffic (a TV, a bulb); (2) fan-out to hundreds of unrelated destination IPs with proxy-typical timing; (3) DNS/SNI hits against a curated denylist of known proxy-SDK control endpoints; (4) upstream volume asymmetry (a passive gadget suddenly uploading gigabytes). A daily digest names the suspect device, shows its "who is riding your line" world map, and suggests a firewall rule. A red-alert fires the instant a device flips from consumer to relay behavior.

## Technical approach
Stack: Go daemon consuming NetFlow/IPFIX (softflowd) or eBPF/`AF_PACKET` capture; SQLite for rolling flow aggregates; a small React dashboard. Core data structure is a per-device rolling sketch (HyperLogLog for distinct-ASN cardinality, count-min for destination fan-out). Enrichment: MaxMind GeoLite2 ASN, plus a community-maintained denylist of proxy-SDK domains/IPs scraped from published SDK teardowns and threat-intel feeds. Detection is a weighted score, not ML — explainable per-signal. The genuinely hard part is a low false-positive rate: CDNs, P2P apps, and game matchmaking all fan out too, so Backhaul needs a whitelist model of "normal fan-out shape" per device class and a learning warm-up week.

## v1 scope
- OpenWrt/Linux daemon reading NetFlow from one router
- Per-device distinct-ASN + fan-out scoring with a static proxy-SDK denylist
- One HTML page: device list, risk score, "riders" map, suggested nftables rule
- ntfy/webhook alert on consumer→relay flip

## Out of scope
- DPI/payload inspection or TLS interception
- Automatic blocking (suggest only)
- Cloud multi-site aggregation

## Risks & unknowns
- False positives from P2P/CDN traffic; needs tuning
- Denylist rot — proxy SDKs rotate endpoints fast
- Encrypted DNS (DoH) hides SNI/lookups on some devices

## Done means
Given a lab device running a known bandwidth-resale SDK, Backhaul flags it within one hour with the correct device and a rider map, while a control week of normal streaming/gaming produces zero red alerts.
