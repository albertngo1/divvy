## Overview
Bestiary is a self-hosted honeypot + generative field guide for homelabbers. It exposes a few tempting fake endpoints (a leaky `.git/config`, an SSH banner, an exposed `.env`), catches the bots that pounce, and renders each distinct attacker "species" as a procedurally-drawn creature in a growing illustrated bestiary you can browse like a nature encyclopedia.

## Problem
The Lobsters post "Caught a .git/config crawler" nails the quiet fascination of watching internet background radiation hit your box — but the raw evidence is a wall of nginx log lines. There's no way to *feel* the ecosystem: which bots recur, which are new, how the fauna shifts over seasons. Logs are for grepping, not for wonder.

## How it works
Bestiary listens on a handful of decoy paths/ports and records every hit: source ASN, requested paths, user-agent, TLS fingerprint (JA4), timing cadence, and the sequence of probes. It clusters hits into "species" by behavioral signature. Each species gets a deterministically generated illustration + a Latin-ish binomial name + a stat block (first seen, sightings, favored prey path, range/geography). A single-page field guide shows the collection; a menubar count ticks up as new species are discovered. Over a year it becomes a dated catalog of who's been knocking.

## Technical approach
Go honeypot binary (or a thin nginx + Lua front) writing structured JSON events to SQLite. Fingerprinting: JA4/JA4H TLS+HTTP hashes, path-sequence n-grams, and inter-request timing. Species clustering: online, incremental — hash the (JA4H, path-set, UA-family) tuple into a stable species key, with DBSCAN over embeddings of the request sequence for the fuzzy tail. Illustration: the species key seeds a parametric creature generator (SVG body plan where limbs/spikes/color map to traits — aggressive scanners get more teeth, slow crawlers get long legs), so the same bot always looks the same. Geo/ASN via a local MaxMind or Team Cymru whois. ntfy push on a *new* species. The genuinely hard part is stable clustering: distinguishing a genuinely new bot from the same botnet rotating IPs/UAs, without collapsing everything into one blob or shattering into thousands of singletons.

## v1 scope
- One decoy `.git/config` + `.env` path on an existing box
- SQLite event log, species key = hash(JA4H + sorted path-set)
- Static SVG creature generator, single HTML field-guide page
- ntfy alert on first sighting of a new species

## Out of scope
- Active response / tarpitting / blocking (pure observation)
- Real exploit sandboxing or malware capture
- Cloud aggregation across many homelabs

## Risks & unknowns
- Low-traffic boxes may see too few species to feel alive
- Over/under-clustering makes the bestiary noisy or empty
- Running any internet-exposed decoy is a (small) attack surface — must be sandboxed, read-only, no real secrets

## Done means
After two weeks live, the field-guide page shows at least 5 distinct, consistently-illustrated species, re-hits of the same bot map to the same creature, and a genuinely-new scanner triggers exactly one ntfy alert.
