## Overview
Muniment is a self-hosted watchdog for public-record datasets—land registries, parcel maps, corporate filings, court dockets, voter rolls. It periodically snapshots an open dataset, commits each snapshot into a tamper-evident hash chain, and alerts you when records silently change or disappear. It turns 'trust me, the database says so' into 'here is the signed proof of what the database said on July 12.'

For whom: journalists, land-title researchers, conveyancers, transparency NGOs, and paranoid homelabbers who noticed the Romania land-registry wipe and realized public truth has no undo button.

## Problem
Government record systems are single points of truth with no public integrity guarantee. A malicious insider, ransomware, or a quiet 'correction' can rewrite or erase records, and nobody outside can prove it happened. Property title, the foundation of most people's net worth, is especially exposed. Existing backups belong to the same custodian who might be the problem.

## How it works
You point Muniment at an open dataset endpoint (a GIS parcel WFS layer, a Socrata/CKAN open-data API, a nightly CSV dump, or a scraped registry). On a schedule it fetches, canonicalizes each record to stable JSON, and computes a per-record Merkle leaf keyed by record ID. Each run produces a Merkle root that is chained to the prior run's root (prev_root || new_root) and optionally anchored to an external timestamp (OpenTimestamps → Bitcoin, or an RFC-3161 TSA). A diff engine emits added / modified / deleted records against the last snapshot. Deletions and out-of-band edits raise alerts (ntfy/email). A small web UI lets you query 'show me parcel 12345 as of any date' and export a signed inclusion proof.

## Technical approach
Stack: Python + SQLite (or DuckDB for big parcel sets), APScheduler for cadence, a pluggable fetcher interface (WFS/GeoJSON, Socrata, CKAN, generic CSV/JSON, HTML-scrape). Data model: `snapshots(run_id, ts, merkle_root, prev_root, anchor_receipt)`, `records(run_id, record_id, canonical_hash, blob)`. Merkle tree built with sorted record-ID leaves; inclusion proofs are standard sibling paths. Canonicalization (RFC 8785 JCS) is the subtle part—registries reorder fields, reformat dates, and shift float precision, all of which look like edits unless normalized. Anchoring via OpenTimestamps gives trustless proof-of-existence without running a chain. The genuinely hard part is per-source canonicalization and telling a real edit from cosmetic churn.

## v1 scope
- One fetcher: generic GeoJSON/CSV over HTTP
- SQLite store, sorted-leaf Merkle root per run, prev-root chaining
- Diff → added/modified/deleted, ntfy alert on delete
- CLI: `muniment watch <url>`, `muniment prove <record_id> <date>`
- Static HTML timeline of snapshots

## Out of scope
- Multi-node gossip / federated cross-verification
- Automatic source discovery
- Legal admissibility tooling
- Restoring data back into the source system

## Risks & unknowns
- Sources change schema/URLs without notice; scrapers rot
- Canonicalization false-positives drown real signal in noise
- Rate limits / ToS on scraping government portals
- 'Proof' is only as good as the source you captured—doesn't prove correctness, only continuity

## Done means
Point it at a live open parcel dataset, run it three days, manually edit and delete a record in a local mirror, and Muniment fires a deletion alert plus emits a verifiable inclusion proof for that record's pre-edit value that a second clean checkout validates.
