## Overview

Sniff Test is a self-hosted passive network forensics box for one household. It sits on your homelab (a Pi or a container next to your router), consumes DNS + TLS SNI + NetFlow metadata, and produces one thing: a ranked daily list of *anomalous* egress, where anomalous means "this device contacted a destination that its peer devices, and its own past self, do not contact." No payload decryption, no cert pinning fights, no MITM.

For: privacy-curious homelabbers who installed Pi-hole, saw a wall of 400k queries, and learned nothing.

## Problem

Every existing tool answers "how much" and "blocked or not." Nobody answers *"is this normal?"* A smart TV phoning a telemetry CDN 200 times an hour looks identical to a smart TV that got compromised — both are just rows in a log. The itch: you want a short list of genuinely surprising things, not a firehose. Ranking by volume surfaces the boring stuff; ranking by novelty surfaces the interesting stuff.

## How it works

1. Ingest: your router mirrors DNS to the box (or you point clients at it as resolver), plus optional `sflow`/`ipfix` or a passive tap via `tcpdump` on a mirror port.
2. Each observation is `(device_mac, timestamp, fqdn, sni, dst_asn, bytes)`.
3. Devices are fingerprinted and *cohorted*: MAC OUI + DHCP option-55 fingerprint + mDNS service records → "Apple TV", "Roku", "generic Android".
4. For each device, maintain a rolling 30-day profile: set of contacted eTLD+1s, their frequency, their hour-of-day distribution, and the ASN mix.
5. Score each new destination by surprisal: `-log P(domain | device_cohort)` from the household's own cohort baseline, boosted when the domain is newly-registered (RDAP creation date < 90 days), resolves to an ASN this device has never used, or appears only during hours the device is nominally idle.
6. Daily digest: top 10 surprising destinations, each with a plain-English card — "Your thermostat talked to a domain registered 11 days ago, hosted on a Hetzner VPS, at 3:14am. It has never used that ASN before."

## Technical approach

- Go collector → DuckDB (columnar, cheap rollups) or ClickHouse if you already run it. Grafana/HTMX front end.
- DNS capture: `dnstap` from Unbound/BIND, or Pi-hole's FTL DB as a shim source. SNI extraction from ClientHello via `gopacket` — note ECH is coming and will eventually blind this; fall back to IP→ASN + reverse-DNS.
- Enrichment: Team Cymru IP-to-ASN whois service (bulk, free), MaxMind GeoLite2 ASN, RDAP for domain creation date, Tranco top-1M list for popularity prior.
- Baseline model: per-cohort Bayesian smoothing over domain counts; Dirichlet prior from the Tranco rank so that a first-ever contact with a top-1k domain is unsurprising and a first-ever contact with an unranked domain is very surprising. Hour-of-day handled with a 24-bin categorical vs. the device's own historical distribution (KL divergence gate).
- Hard part: suppressing the endless novelty of CDN churn. `*.akamaiedge.net`, per-session subdomains, and randomized ad-domains generate infinite "new" FQDNs. Needs aggressive normalization to eTLD+1 (Public Suffix List), plus a learned "high-cardinality parent" detector that collapses any parent domain producing >50 distinct children into a single entity.

## v1 scope

- DNS-only ingest from Pi-hole's FTL SQLite.
- One cohort dimension: MAC OUI vendor.
- Surprisal score = new-eTLD+1 for that device × (1 / log Tranco rank), plus RDAP age flag.
- One static HTML daily digest page, top 10.
- No blocking, no alerts, no app.

## Out of scope

- Any traffic blocking or interception.
- TLS MITM / payload inspection.
- Multi-household comparison (a real product later, a privacy minefield now).
- Mobile app.

## Risks & unknowns

- Encrypted Client Hello and DoH on-device (many phones bypass your resolver entirely) erode visibility — need to measure how much is still observable in 2026.
- False positive rate could make the digest noise; the CDN-collapsing heuristic is the make-or-break.
- Legal/ethical: this watches housemates' devices too. Ship with a prominent consent nag.

## Done means

After a 14-day baseline on my own network, I plant a known beacon (a Pi curling a freshly-registered domain hourly at 3am) and it appears in the next day's top-3 digest, while the digest's other 9 entries contain no more than 2 pure-CDN false positives.
