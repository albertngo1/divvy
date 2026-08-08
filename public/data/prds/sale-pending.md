## Overview
A market tape for the domain aftermarket assembled from DNS itself. Subscribers are domain investors, brand-protection teams, and anyone sitting on a want-list of names they'd buy tomorrow at the right price.

## Problem
The aftermarket is deliberately opaque. Listings sit behind broker walls, prices are "on request," and sold comps get scrubbed — so nobody can price anything without asking a broker who is not on their side. The new for-sale DNS record makes selling *intent* publicly observable for the first time in the history of the market, but only for whoever is willing to watch every zone continuously.

## How it works
Nightly ICANN CZDS zone-file diffs give the full domain universe plus daily adds and drops. A resolver fleet then probes the for-sale record across a prioritized working set:
- every domain ever seen carrying the record, re-checked daily
- every domain matching a subscriber watch pattern
- a rotating long-tail sweep ranked by RDAP expiry proximity and parking signatures (NS delegated to Sedo/Afternic/Dan, wildcard A into parking IP ranges)

Three events matter. **LISTED** — record appears. **REPRICED** — the price field changes. **PENDING** — the record vanishes while the domain stays registered *and* its NS moves off the parking provider. That third one is a probable sale, and a stream of them is the sold-comps dataset the industry refuses to publish. Delivery: a websocket tape, a daily CSV, watchlist email alerts, and a free public adoption dashboard as the top of funnel.

## Technical approach
Go crawler on `miekg/dns` over UDP with per-target token buckets, resolving through my own Unbound recursors on two VPSes rather than public resolvers (which will rate-limit and lie). A 50 M working set at 50 k qps is a ~17-minute pass, so politeness, not throughput, sets the schedule. Storage: Postgres for entities, a TimescaleDB hypertable for observations `(domain_id, ts, record_hash, price_minor, currency, contact)`; ClickHouse if it outgrows that. RDAP (`rdap.verisign.com/com/v1/domain/{name}`) supplies expiry and EPP status, heavily cached and only for candidates. Parking classification is a small gradient-boosted model over NS/A/MX/CNAME patterns plus TLS SNI fingerprints from a cheap HTTPS HEAD.

Hard part one: the spec is brand new, so adoption *is* the product risk — v1's public content is literally the adoption tracker, which is publishable and interesting on day one even at 400 domains. Hard part two: CZDS access is approved per-TLD, requires a stated purpose, takes weeks, and stays contingent on registry TOS compliance.

## v1 scope
- `.com` only
- Seed candidate set = all domains delegated to Afternic/Dan/Sedo nameservers from one zone-file pass
- Daily probe of that set plus everything already seen with the record
- One public page: "N .com domains now advertise for sale in DNS, +X this week"
- Email alert on a single 200-domain watchlist

## Out of scope
Brokering, escrow, appraisal ML, buying or reselling anything, TLDs without zone-file access.

## Risks & unknowns
Adoption could stay near zero for a year. A registrar auto-injecting the record across its whole book would flood and distort the tape overnight. CZDS denial kills the universe scan and forces reliance on passive DNS. Verisign or a broker could ship the same index with better data access.

## Done means
30 consecutive days of `.com` sweeps at under 1% probe failure; at least one PENDING event where the domain later resolves to a genuinely new owner's nameservers; and a watchlist alert delivered within 24 hours of a LISTED event, verified by hand against the domain's live DNS.
