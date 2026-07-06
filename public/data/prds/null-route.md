## Overview
Null Route is a self-hosted tower-defense game whose creeps are your *actual* network flows. It sits on a homelab, ingests live netflow/conntrack data, and renders each outbound/inbound connection as an enemy walking a lane toward your gateway. You defend by placing towers — drop rules, rate-limiters, DNS sinkholes — learning your own traffic while you play. For homelabbers who run Pi-hole/pfSense and want to *feel* their network instead of squinting at a Grafana panel.

## Problem
Network observability tools (akvorado, ntopng, Grafana) are read-only dashboards nobody stares at until something breaks. Meanwhile most people have no intuition for what their devices actually talk to. Turning flows into a game creates a reason to look, and the act of "defending" builds a real mental model of normal vs. weird traffic.

## How it works
Flows stream in and spawn creeps. Creep appearance encodes metadata: size = byte volume, speed = packets/sec, color = ASN/geo, armor = TLS. Known-bad destinations (from eth-phishing-detect + threat lists) spawn as glowing bosses. You earn currency passively and spend it placing towers on lanes: a **Blackhole** tower null-routes a matching CIDR, a **Throttle** shapes bandwidth, a **Sinkhole** rewrites DNS. Towers that block a boss score big; blocking a legit flow (Netflix, your own backups) leaks "trust" and costs you. A round is a 5-minute window of real traffic; a "safe mode" replays recorded flows so you don't actually firewall your Netflix.

## Technical approach
Collector: `nfdump`/`goflow2` or a small eBPF `conntrack` reader → NATS/Redis stream. Backend in Go serves a WebSocket flow feed + enrichment (MaxMind GeoLite2 ASN, an offline phishing/threat-list join, reverse-DNS cache). Frontend is a canvas/PixiJS lane renderer. Two modes: **spectator** (towers are cosmetic, purely a viz), and **armed** (tower placement emits real nftables rules via a guarded API with a dry-run diff and auto-revert TTL). Data model: Flow{src,dst,asn,bytes,pkts,verdict}, Tower{type,match,ttl}. Hard part: mapping short-lived bursty flows to legible, non-overwhelming creeps — needs aggregation/coalescing by 5-tuple prefix and a spawn-rate governor so a torrent doesn't DDoS the renderer.

## v1 scope
- Spectator mode only (no real firewall writes)
- Single lane, creeps from goflow2 feed, 3 creep visual encodings
- GeoLite2 ASN enrichment + one offline threat list for bosses
- Score for "tagging" a creep by clicking it (guess good/bad)

## Out of scope
- Actually writing nftables rules
- Multiplayer / leaderboards
- Historical replay campaigns

## Risks & unknowns
- Flow volume overwhelming the canvas (needs coalescing)
- Arming mode is genuinely dangerous — a misplaced tower cuts your SSH
- Threat-list false positives making legit flows look like bosses

## Done means
Run the collector on a homelab, open the web UI, and watch real current connections spawn as creeps with correct geo/ASN coloring and bosses for flows matching the threat list — sustained for 5 minutes without dropping frames.
