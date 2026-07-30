## Overview
A title search for domain names. You paste a domain you're about to buy at auction or from a broker; you get a dated, evidence-linked history of every reputation event in its life, plus an ownership timeline that tells you which of those events you'd actually be inheriting. Customers: startup founders naming things, domain investors, SEO agencies, and brokers who want a clean-title badge on a listing.

## Problem
Buying an aftermarket domain means inheriting its ghosts. It may have spent 2019 on Spamhaus DBL, hosted a MetaMask phishing clone in 2021, and still be quietly blocked by three corporate DNS filters — none of which shows up in a whois lookup or a Wayback skim. People find out after the wire clears, when their signup emails all land in spam. Today's tools answer "is it listed *right now*," which is exactly the wrong question for an asset whose whole risk is historical.

## How it works
One input, one report. The report is a horizontal timeline: reputation events as red bars, ownership boundaries as vertical dividers. The headline verdict is one of CLEAN / PRIOR-OWNER TAINT / ACTIVE TAINT. Every claim links to primary evidence — a commit SHA, a CT log entry, an RDAP diff. Brokers can embed the badge; buyers can attach the PDF to an escrow thread.

## Technical approach
The arbitrage: **a large fraction of the world's blocklists live in public git repos**, so `git log -p` reconstructs their full history for free, retroactively. MetaMask/eth-phishing-detect, StevenBlack/hosts, EasyList/EasyPrivacy, uBO filter lists, various DNSBL mirrors. A worker clones each and walks every commit, diffing the domain set to emit `(domain, source, listed_from, listed_to, evidence_sha)` intervals. That means the product ships with years of history on day one instead of waiting a year to accrue a snapshot moat. Live-feed sources (URLhaus, OpenPhish, PhishTank, Google Safe Browsing Lookup) are snapshotted daily going forward.

Ownership inference is the differentiator. Signals: RDAP registrar/nameserver changes, crt.sh certificate issuance gaps >90 days, Wayback CDX title and favicon-hash discontinuities, and MX-record family changes. Cluster change-points across these into candidate ownership boundaries with a simple penalized change-point scan; confidence from how many independent signals agree. Then attribute each reputation interval to the epoch containing it.

Stack: Rust ingest workers, Postgres with a GiST index on `tstzrange` intervals, Cloudflare Workers front end, Stripe for one-off reports. Hard part is ownership-boundary precision — a false "new owner" divider launders real risk into someone else's past, which is the one failure mode that gets people burned.

## v1 scope
- Three git-hosted blocklists, full history ingested
- RDAP + Wayback CDX only for ownership boundaries
- Single-domain lookup, HTML report, $9 Stripe checkout
- No accounts — pay, get a permalink

## Out of scope
- Bulk auction-watchlist scoring, API, white-label
- Backlink/SEO toxicity, trademark screening
- Monitoring/alerts on domains you already own

## Risks & unknowns
- Spamhaus and several commercial feeds have restrictive licenses; v1 must stick to permissive sources
- Ownership inference confidently wrong is worse than absent
- Market may be small and seasonal around big auctions

## Done means
Ten historically dirty domains from expired-auction lists produce reports whose event dates match manual verification, and at least three correctly place the taint under a previous owner with the boundary within 60 days of the true transfer.
