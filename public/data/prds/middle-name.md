## Overview
A daily-refreshed public trust ledger for the free proxy lists that keep trending on GitHub. It does not rank proxies by speed — every list does that. It grades them by *what they do to your bytes*, and clusters them by who actually operates them. For scrapers, researchers, people behind censorship, and anyone who has ever pasted an IP out of a README into their network settings.

## Problem
Repos like proxifly/free-proxy-list publish tens of thousands of open proxies with uptime, country, and latency, refreshed every five minutes. None publish the only fact that matters: an open proxy is a volunteer man-in-the-middle. Some are misconfigured routers. Some are ad-injection appliances. Some are honeypots. Some are 400 IPs across 60 countries fronting a single residential-proxy reseller who is also reselling your session. The consumer has no way to tell these apart, and "it worked" is not evidence of safety.

## How it works
Canary-origin measurement. We run our own origin with known ground truth and fire a probe suite through each proxy:
1. HTTPS to a cert-pinned canary — does the leaf cert SPKI match ours? If not: interception. Record issuer DN and CA SPKI hash.
2. Plain HTTP fetch of a nonce-tagged document — byte-diff against ground truth. Detects injected script/iframe, stripped CSP/HSTS, rewritten links, transcoded images.
3. Header-echo endpoint — measures identity leakage (X-Forwarded-For, Via, Forwarded, real client IP) and captures the proxy's own egress fingerprints.
4. Downgrade probe — request an HSTS-preloaded canary over http and see whether the redirect survives intact.
5. DNS probe against a per-proxy wildcard subdomain — our authoritative nameserver logs reveal which resolver actually did the lookup.

Each proxy gets a rap sheet and a letter grade. Then the interesting part: cluster.

## Technical approach
Go or Rust prober for concurrency and raw socket fingerprints. Feature vector per proxy: JA4/JA4S of the ClientHello our origin observes (the proxy re-originates TLS, so this is *its* stack, not yours), HTTP/2 SETTINGS + WINDOW_UPDATE + pseudo-header ordering (Akamai fingerprint), TCP options/TTL/MSS, interception CA SPKI, HTTP header casing and order, resolver ASN. Cluster by connected components over exact matches on high-entropy features, then agglomerative on the rest. Storage: Postgres with a probe-results hypertable; CoreDNS with query logging as the authoritative NS. Publish static JSON plus a diffable `known-bad.txt`.

Hard part: separating proxy-caused mangling from upstream network mangling (captive portals, transparent ISP middleboxes). Requires a direct control run of the identical probe and, eventually, multiple vantage points.

## v1 scope
- 500 proxies/day pulled from proxifly's JSON, single vantage point
- Probes 1, 2, 3 only
- Grade = intercepts? injects? leaks identity? → A–F
- Static JSON + one sortable HTML table
- Clustering by exact interception-CA SPKI match only

## Out of scope
Using the proxies to route any real traffic; a browser extension; paid tiers; any probing of the proxy hosts themselves beyond the proxy protocol.

## Risks & unknowns
Probing 50k hosts resembles scanning — needs a visible abuse page, low rate, and an opt-out. Many proxies refuse unknown origins, so "insufficient data" will be the most common grade. Naming operator clusters invites takedown complaints.

## Done means
One command over the current proxifly list produces JSON in which at least one cluster of ≥10 proxies is proven to share an interception CA, and a browser configured with a graded-F proxy visibly loads our canary page carrying exactly the injected script the report predicted.
