## Overview
Reef is an ambient screensaver / second-monitor toy that renders your homelab's live network traffic as a coral reef aquarium — and is secretly a lightweight intrusion-detection system. Built for tinkerers who already stare at Grafana dashboards and would rather have their monitoring be beautiful and glanceable. Cross-pollinated from the arXiv 'Way of Water' aquatic-robotic-art paper (schooling choreography), the Pegasus spyware story (passive detection), and the Clickhouse observability wars.

## Problem
Homelab security monitoring is either invisible (you check logs when something's already wrong) or ugly and noisy (alert fatigue). Nobody watches a NetFlow dashboard for fun. But a screensaver you'd *choose* to display gets glanced at hundreds of times a day — free continuous situational awareness, if it's genuinely pretty.

## How it works
Each fish species = a protocol (HTTPS = blue tang, SSH = eel, DNS = darting minnows). School size and swim speed track live bandwidth; reef geography maps to subnets (LAN garden, WAN open water). Everything is calm and slow when traffic is normal. Anomalies spawn threats: a port scan sweeping your subnet becomes a barracuda cutting across the reef; a first-ever outbound connection to a new country materializes as an ominous shadow; regular-interval beaconing (C2 heartbeat) blinks a lure. Threats persist and grow until you acknowledge them, turning "is my network fine?" into a one-glance yes/no.

## Technical approach
Capture: a small Go or Rust collector reads NetFlow/IPFIX (or `pcap` via gopacket) on the router/mirror port, aggregates per-flow 5-tuples into 1s buckets, and enriches with GeoIP (MaxMind GeoLite2) and reverse DNS. Anomaly layer: simple, explainable detectors — EWMA baselines per protocol, a fan-out counter for port scans (many dst ports, one src), first-seen sets for country/ASN, and autocorrelation on inter-packet gaps for beaconing (FFT peak). No ML black box in v1. Render: WebGL (three.js or PixiJS) fed by a WebSocket stream of a compact JSON world-state (`{fish:[{proto,count,vel}], threats:[{type,severity,src}]}`); boids algorithm for schooling. Runs as a self-hosted page you cast to a spare monitor. Hard part: mapping continuous, bursty flow data onto stable, legible fish populations without seizure-inducing churn — needs hysteresis and smoothing so the reef breathes, not flickers.

## v1 scope
- Ingest NetFlow from one router, one LAN subnet
- Three fish species (HTTPS/DNS/SSH) + "other"
- One threat detector: horizontal port scan → barracuda
- WebGL reef with boids schooling, WebSocket live update
- Click a threat to see the offending src/dst/ports

## Out of scope
- ML anomaly detection, PCAP deep inspection
- Multi-site, mobile app, historical playback
- Auto-blocking / firewall actions

## Risks & unknowns
- NetFlow granularity varies by router; some homelabs need a mirror port
- Making it pretty enough to *want* on screen is the whole bet
- False-positive barracudas (CDN fan-out looks scan-ish) could cry wolf

## Done means
Running nmap against your own subnet makes a barracuda appear within ~10s and lingers until acknowledged, while normal browsing keeps the reef calm — verified on a real home network for a week without a false predator during idle periods.
