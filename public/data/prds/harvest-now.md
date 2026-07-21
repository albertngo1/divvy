## Overview
A scanner + scorecard that tells a hardware/software vendor which of their internet-facing products are *not* post-quantum ready, mapped against the real compliance deadlines that are about to start biting: France's ANSSI blocking PQC-free products from certification in 2027, NSA's CNSA 2.0 timeline, and BSI guidance. For security/compliance leads and procurement teams at mid-size vendors who can't afford a crypto consultancy.

## Problem
"Harvest now, decrypt later" turned from a slide-deck bogeyman into a regulatory line item. But most vendors have no idea whether their fleet of devices, APIs, and web endpoints even *offers* a post-quantum key exchange, let alone which SKUs will fail a 2027 audit. Auditing this by hand means someone who understands ML-KEM hunched over `openssl s_client` for a week. That expertise is scarce and expensive; the scan itself is cheap. Classic arbitrage.

## How it works
1. Paste a list of hostnames (or upload an asset inventory / CSV of SKUs → endpoints).
2. For each host the tool runs a battery of TLS 1.3 handshakes, advertising post-quantum hybrid groups (X25519MLKEM768, and legacy X25519Kyber768Draft00) and observing what the server negotiates.
3. It records: negotiated key-exchange group, cert signature algorithm, TLS version floor, and whether any PQC group is even accepted.
4. Output: a per-asset scorecard (Ready / Hybrid-capable / Classical-only) and a compliance panel showing which assets clear ANSSI-2027, CNSA-2.0-2030, etc., plus a plain-English remediation note ("upgrade OpenSSL ≥3.5 / enable ML-KEM group on your load balancer").

## Technical approach
Stack: Go for the scanner (control over the TLS ClientHello is essential; use a fork of `crypto/tls` or `cloudflare/go` with PQC groups, or shell out to a patched OpenSSL 3.5 / BoringSSL). Concurrency-limited worker pool over the hostname set. Data model: `asset → {host, port, negotiated_group, sig_alg, tls_min, pqc_accepted}` in SQLite; a versioned `deadlines.json` encoding each regime's cutoff dates and required algorithms. Frontend: a static React scorecard exportable to PDF for the audit binder. The genuinely hard part is *interpretation* over raw probing: mapping observed crypto to the moving target of what each regulator will actually accept, and handling middleboxes/CDNs that mask the origin's true capability. Keep the deadline rules as data, not code, so they can be updated as ANSSI/NSA publish.

## v1 scope
- Scan a pasted list of hostnames on port 443.
- Detect X25519MLKEM768 support + classify Ready/Hybrid/Classical.
- One compliance regime (ANSSI 2027) with a single hard-coded ruleset.
- HTML scorecard, no login.

## Out of scope
- Non-TLS protocols (SSH, IPsec, S/MIME).
- Deep firmware/binary crypto inventory.
- Continuous monitoring / diffing over time.
- Actually remediating anything.

## Risks & unknowns
- Regulator rules are still shifting; the ruleset could be wrong or premature.
- CDNs/WAFs make origin capability ambiguous — false "ready" readings.
- Client-side PQC support in the scanner depends on libraries that are themselves in flux.

## Done means
Given a CSV of 50 hostnames, the tool produces a scorecard within a minute that correctly labels a known ML-KEM-enabled host (e.g. Cloudflare) as Ready and a legacy TLS-1.2-only host as Classical, with an exportable PDF listing every asset that fails ANSSI 2027.
