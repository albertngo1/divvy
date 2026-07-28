## Overview

**Enforcement Gap** is a public, explorable visualization of email-spoofing exposure across the domains people actually interact with — banks, hospitals, school districts, city governments, the companies that email you receipts. It's for the curious-but-not-expert: someone who has never heard of DMARC should leave understanding exactly what `p=none` means and why their kid's school district having it matters.

## Problem

DMARC has been publishable since 2012 and the enforcement numbers are dismal, but this fact circulates exclusively as a *percentage in a blog post*. A percentage produces no feeling. Nobody has made this dataset beautiful, and nobody has made it **personal** — the gap between "63% of domains don't enforce" and "your pharmacy doesn't enforce" is the entire distance between trivia and alarm.

Secondarily: the existing DMARC checkers are all lead-gen forms for enterprise sales. This should just be a thing you can look at.

## How it works

The landing view is a **treemap-as-cityscape**: sectors (healthcare, .gov, banking, education, retail, ISPs) as districts, domains as buildings. Height encodes reach (rough traffic/size rank), and the *facade* encodes posture:

- `p=reject` — a solid, sealed building
- `p=quarantine` — shuttered but not locked
- `p=none` — lit windows, doors standing open
- no DMARC record at all — a doorway with no door, and the building faintly transparent

The emotional beat lands when you notice how many of the *tallest* buildings are wide open.

Three interactions:

1. **Walk your street** — paste a domain, or drop in an mbox/`.eml` export, and it extracts the sender domains you personally receive mail from, then rebuilds the city out of *only those*. Your actual correspondents, sorted by exposure. This runs entirely client-side; nothing uploads.
2. **Scrub the timeline** — SPF/DMARC records have been observable historically; a slider replays adoption from 2013 to now and the city visibly locks its doors, sector by sector, at wildly different rates.
3. **Read the door** — click any building to see the raw TXT record with each tag annotated in plain language (`pct=10` gets flagged as "enforcement theater — 90% of failures still delivered").

## Technical approach

**Collection.** A Go crawler resolving `_dmarc.<domain>` TXT and the domain's SPF, over a seed list of ~50k domains assembled from the Tranco top-domain list (research-grade, stable, freely downloadable), the U.S. `.gov` domain registry CSV (published by CISA), and NPPES for healthcare orgs. Rate-limited resolution against a local Unbound instance to avoid hammering public resolvers; ~50k lookups is minutes, not hours. Store as newline-delimited JSON, re-crawl weekly via cron.

**Data model.** One row per domain per crawl: `{domain, sector, rank, dmarc_policy, pct, rua_present, spf_all_qualifier, mx_provider, observed_at}`. Historical backfill from published Internet-measurement datasets rather than a time machine.

**Parsing.** DMARC record parsing is deceptively fiddly — malformed records, multiple TXT strings needing concatenation, `sp=` subdomain overrides, and organizational-domain lookup requiring the **Public Suffix List** to know whether `mail.foo.co.uk` inherits from `foo.co.uk`. That PSL walk is the part people get wrong.

**Frontend.** Static site, D3 for squarified treemap layout, but rendered to WebGL (regl or PixiJS) because 50k animated rects will not survive SVG. Client-side mbox parsing with a streaming reader so a 2GB export doesn't blow the tab.

**The genuinely hard part** is sector classification and the honesty of it. Mapping a domain to "hospital" vs "retail" is messy, and a wrong label on a visualization that implicitly shames people is a real reputational problem. v1 uses only registries where the sector is *authoritative* (`.gov` from CISA, NPPES for health) and buckets everything else as "other" rather than guessing.

## v1 scope

- Crawl the Tranco top 5,000 only — one snapshot, no history
- Two sectors with authoritative labels, plus "other"
- Static treemap, four facade states, click-to-see-record
- No mbox upload; just a domain search box

## Out of scope

Historical timeline, mbox ingestion, BIMI/MTA-STS/DNSSEC, remediation advice, alerting, anything with a login.

## Risks & unknowns

This publicly enumerates spoofable domains, which is genuinely dual-use — though the information is already trivially available via one `dig` and attackers are not the ones lacking it; the defenders are. Still worth an explicit rationale on the page rather than pretending the question doesn't exist. Other risks: DNS resolution from a single vantage point misses geo-split records; "reach" is hard to encode honestly without a traffic dataset; and the treemap could read as pretty-but-illegible if district boundaries aren't strong.

## Done means

A person who did not know what DMARC was five minutes ago can point at a specific building, say "anyone can send email pretending to be them," and be correct. Plus: the crawler reproduces a published enforcement percentage within 3 points on the same domain set — the number check that proves the pipeline isn't lying.
