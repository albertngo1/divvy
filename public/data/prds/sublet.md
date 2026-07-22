## Overview
Sublet is a self-hosted network monitor for the privacy-conscious homelabber that answers one uncomfortable question: *is a device on my network secretly relaying strangers' internet traffic?* It surfaces IoT gadgets and 'free' apps that bundle residential-proxy SDKs and sell your IP as an exit node.

## Problem
LG just announced it's banning residential-proxy apps from webOS after Krebs reported smart TVs being enrolled into proxy botnets. But TVs are only the visible tip: free VPNs, coupon extensions, and Android SDKs (Bright Data/Luminati-style, Pawns/IPRoyal, Honeygain) silently turn consumer devices into exit nodes. Your home IP ends up sourcing someone else's ad fraud or credential stuffing, and you get blocklisted or subpoenaed. Nothing on the market tells a normal person *which box* is doing it.

## How it works
Run Sublet on your router/homelab (a container tapping a SPAN port or the router's conntrack). It baselines each device, then scores outbound behavior for proxy fingerprints: high fan-out to many diverse *residential* ASNs, lots of short-lived inbound-initiated-feeling sessions, persistent TLS to known proxy-SDK control domains, and traffic asymmetry where a 'media' device uploads far more than it downloads. Suspects get a plain-language card: 'Your Roku opened 340 connections to 210 home ISPs in Brazil last hour — this looks like a proxy exit.' One tap drops it to a quarantine VLAN via a router API hook.

## Technical approach
Stack: Go daemon + SQLite, deployed as a Docker container. Ingest via `conntrack -E` on OpenWrt/pfSense or a Zeek `conn.log` tap for richer metadata. Enrich destination IPs with Team Cymru's IP-to-ASN whois service and MaxMind ASN type (residential vs hosting/CDN). Maintain a versioned JSON of known proxy-SDK control endpoints (scraped from public threat feeds + the packages' own docs). Core detector: per-device rolling features (unique destination ASNs/hour, residential-ASN ratio, connection churn, up/down byte ratio) fed to a simple logistic score — deliberately explainable, no black box. Quarantine action via the router's firewall/VLAN API. Hardest part: distinguishing legit CDN/P2P chatter (a media box *should* fan out) from proxy relaying without drowning users in false positives — the residential-ASN-ratio signal is the load-bearing discriminator.

## v1 scope
- Single-router deploy on OpenWrt (conntrack ingest)
- Per-device dashboard with a 0–100 'sublet score' and top destination ASNs
- Built-in list of ~30 known proxy-SDK domains
- Manual quarantine button (writes an nftables drop rule)

## Out of scope
- Deep packet inspection / TLS interception
- Automatic remediation without confirmation
- Cloud dashboard or multi-site

## Risks & unknowns
- False positives on P2P/CDN-heavy devices; needs a tuning period
- Encrypted SNI (ECH) erodes the domain-matching signal over time
- ASN-type data quality for residential classification is imperfect

## Done means
On a test network running Honeygain in a VM, Sublet flags that VM within 15 minutes with a sublet score >80, correctly names its top residential destination ASNs, and a quarantine tap cuts its outbound traffic — while a Roku streaming Netflix stays below 30.
