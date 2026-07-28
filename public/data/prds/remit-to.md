## Overview
Remit To is a monitoring service sold to accounts-payable and finance teams (not IT) that continuously grades the email-authentication posture of every *vendor* you pay, ranks them by dollars at risk, and alerts when a supplier's domain becomes easier to impersonate. The product name is the fraud: business email compromise almost always arrives as "we've changed banks — please update our remit-to."

## Problem
68.4% of domains still don't enforce DMARC. Every existing product in this space sells you protection for *your own* outbound domain. But invoice fraud doesn't come from your domain — it comes from a supplier whose domain publishes `p=none`, letting a fraudster send a pixel-perfect banking-change email from the supplier's real address, past every filter, to a clerk who has no way to know. Third-party risk platforms technically score this, but they're enterprise-priced, IT-shaped, and surface it as one row in a 400-control report. Nobody hands an AP manager a list that says: *these 11 vendors are the easy ones, and you owe them $380k this quarter.*

## How it works
1. Upload a vendor list — a CSV export from QuickBooks/NetSuite/Bill.com with vendor name, domain, and annual spend. No integration required to start.
2. Nightly, for each domain: resolve SPF (including a DNS-lookup count — 11+ lookups means permerror, which means SPF is decorative), DMARC policy with `pct` and `sp`, DKIM selectors, MTA-STS, and registrar/nameserver changes. Then a lookalike sweep: generate typo permutations, check RDAP registration and Certificate Transparency logs for recently issued certs on near-miss domains.
3. Each vendor gets a 0–100 **spoofability** grade with the reasoning spelled out in plain English.
4. The killer column is **exposure = spoofability × annual spend**, which converts a security score into dollars and makes the dashboard legible to a CFO in four seconds.
5. Alerts fire on *regression*, not state: "Acme Supply dropped DMARC from quarantine to none 6 days ago. A $42k payment is scheduled Friday. A lookalike domain acme-supply[.]co was registered Tuesday."
6. One-click "nudge": emails the vendor a jargon-free one-pager their IT person can act on. Customers love this because it makes them look diligent, and it fixes the actual problem.

## Technical approach
Go or Python + Postgres. DNS via a DNSSEC-aware resolver with aggressive caching; SPF evaluation via an existing library rather than hand-rolled (the RFC 7208 lookup-limit semantics are where everyone gets it wrong). `dnstwist` for permutations, crt.sh + RDAP for confirmation. Data model is append-only daily posture snapshots per domain, so regression detection is just a diff of consecutive rows — no separate state machine.

Optional paid tier: read-only Gmail/M365 scope to parse `Authentication-Results` headers on mail you've actually received from each vendor. This is the real differentiator — it reports what *passes*, not what DNS claims.

Hard parts: (a) scoring honestly — `p=quarantine; pct=10` is nearly nothing, and grading it as "quarantine" is malpractice; (b) lookalike false positives, which will destroy trust faster than misses; (c) finance teams' OAuth fear, hence the DNS-only default tier.

## v1 scope
- CSV upload: domain + annual spend, nothing else
- Nightly DNS-only posture check
- One ranked table sorted by exposure
- Email alert on any policy downgrade

## Out of scope
Fixing your own DMARC (commodity), inbound gateway/quarantine, blocking payments, ERP integrations, lookalike takedowns, SOC 2.

## Risks & unknowns
Adjacent market is crowded but pointed the other direction; the wedge is buyer (finance) and framing (dollars), not technology. Finance is a slower, more procurement-heavy buyer than IT. DNS propagation flaps will produce false downgrade alerts — needs a two-consecutive-night confirmation rule.

## Done means
Import 100 vendor domains from a CSV, get a spend-ranked spoofability table in under two minutes, and a deliberately downgraded DMARC record on a test domain produces a correctly-worded, correctly-priced alert email within 24 hours.
