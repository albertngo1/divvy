## Overview
Strictly Necessary is a subscription service for EU-facing small and mid-size sites (and the agencies that build them) that removes the cookie banner — legally. It audits what your pages actually do before consent, tells you exactly which requests are disqualifying you, ships the code changes to fix them, and issues a dated compliance memo so someone is willing to sign off on deleting the banner.

## Problem
Most sites do not need a consent banner. Article 5(3) of the ePrivacy Directive exempts storage that is strictly necessary for a service the user requested. But nobody knows whether *their* site qualifies, because nobody knows what their site loads — a Google Fonts link, an embedded YouTube iframe, a Hotjar tag a marketer added in 2021. So everyone installs a banner as insurance, degrading every visitor's experience forever to avoid a two-hour audit. Meanwhile the banner itself is often non-compliant (pre-ticked, no reject button), so it doesn't even work as insurance.

## How it works
1. You give a domain. A crawler visits the top ~50 URLs (sitemap + internal link BFS) with a clean browser profile and **never interacts with the consent UI**.
2. It records everything set or read before consent: cookies (via CDP `Network.getAllCookies` and `Storage`), localStorage/IndexedDB writes, and every outbound request with its initiator chain.
3. Each artifact is classified into: strictly necessary (session/auth/cart/CSRF/load balancing), arguably necessary (first-party analytics with no cross-site identifier), or disqualifying (third-party trackers, ad pixels, embedded players, CDN fonts).
4. You get a verdict — *banner removable*, *removable after N fixes*, or *not removable* — plus a per-fix remediation card.
5. For the common fixes it generates an actual diff: self-host the fonts, swap the YouTube embed for `youtube-nocookie` + click-to-load, move analytics to a cookieless first-party endpoint, drop the pixel.
6. Monthly re-scan. If a marketer re-adds a tag, you get an email before the regulator does.

## Technical approach
Playwright + Chrome DevTools Protocol workers in a queue (Postgres + a job table; no Kubernetes for v1). Classification joins three public datasets: DuckDuckGo **Tracker Radar** (domain → owner + category, refreshed from GitHub), **EasyPrivacy** / EasyList filter rules compiled into a matcher, and the **Open Cookie Database** for cookie-name → purpose. Unknown first-party cookies fall to an LLM classifier prompted with the cookie name, path, expiry, the setting script's URL, and 200 chars of surrounding source, with an explicit `unknown` escape hatch and a human review queue — expiry alone is a strong prior (a 2-year cookie is not a session cookie). Data model: `scan → page → artifact(kind, key, party, initiator_chain, classification, evidence_blob)`; every verdict links to raw evidence, because the memo's value is auditability. Fix diffs come from templated codemods per stack detected via Wappalyzer-style fingerprinting (Next.js, WordPress, Shopify, plain HTML). The genuinely hard part is the classification's false-negative cost: calling one tracker "necessary" makes the memo worthless, so the pipeline is deliberately biased toward *not removable* and sells the fix path instead of a cheap green checkmark.

## v1 scope
- One domain, 10 pages, homepage-only crawl depth 1.
- Verdict page listing every pre-consent cookie and third-party request with its classification and evidence.
- Three remediation recipes only: self-host Google Fonts, nocookie YouTube, remove Meta Pixel.
- PDF memo with scan date, method, and artifact table. No lawyer, no guarantee — it is evidence, not advice.
- Stripe checkout, €29/mo per domain, manual onboarding.

## Out of scope
CCPA/US state laws, DSAR handling, a consent-management platform (the anti-product), mobile app SDK auditing, authenticated-area crawling.

## Risks & unknowns
Legal exposure if a customer relies on the memo and gets fined — mitigated by framing as an evidence pack, not counsel, and by partnering with one privacy lawyer to countersign for a premium tier. Member-state divergence (Germany's TTDSG vs France's CNIL guidance) means "removable" is jurisdiction-shaped. Buyer discovery is the real unknown: does an SME pay to remove friction they've stopped noticing? Agencies, who feel the banner's conversion cost across 40 client sites, are the likelier first customer.

## Done means
A scan of a real WordPress site returns a classified artifact list a privacy engineer agrees with on manual review, the generated font-self-hosting diff applies cleanly, a re-scan after applying it flips the verdict to *removable*, and one paying customer has actually deleted their banner.
