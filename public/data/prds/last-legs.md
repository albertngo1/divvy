## Overview

A B2B service for platform and security teams that answers one question precisely: *if I remove this crypto capability, exactly which paying accounts stop working?* Not "0.4% of requests" — the account names, contacts, last-seen timestamps, and a burn-down chart.

## Problem

RFC 10015 deprecates obsolete TLS 1.2 key exchange. Post-quantum migration is landing. Old SDK versions need to die. Every team faces the same wall: your access logs show negotiated cipher suites but not *who*, and your CRM shows customers but not what their integration speaks. So teams either delay the cutover for two more years or ship it and discover the breakage from a furious support ticket at 2am. The gap between "0.4% of traffic" and "Acme Health's fax gateway, which is worth $340k/yr" is the entire decision.

## How it works

1. An edge collector captures each connection's **offered** ClientHello — versions, cipher suites, supported groups, sigalgs, ALPN — plus a JA4 fingerprint, and echoes a request ID.
2. Your app emits a one-line mapping of request ID → authenticated account ID. That join is the whole product.
3. You write a policy: `deny kex in (rsa, dhe); require group x25519mlkem768`.
4. The engine replays 90 days of connections against the policy, and reports every account whose *entire* offered set fails — those break — separately from accounts that merely downgrade.
5. Output: ranked list by account ARR, per-account daily volume trend, and a drafted notice email with the specific fix ("your OpenSSL 1.0.2 client needs…").

## Technical approach

nginx `ssl_preread`-style module or an eBPF tap for ClientHello capture; FoxIO JA4 for fingerprinting. Events land in ClickHouse — one wide row per connection, high cardinality, cheap at billions of rows. Join key is the request ID; fallback join is (client IP, ±2s window) with a confidence score. Policies compile to a SQL predicate over the offered-capability arrays, so simulation is a single scan.

The genuinely hard part is capturing *offered* rather than *negotiated* capabilities. Cloud load balancer logs give you only what was negotiated, which is useless for simulation — a client that offered both TLS 1.2 and 1.3 looks identical to one that offered only 1.2. Degraded mode for managed LBs: publish a canary hostname with a restricted config and observe which fingerprints fail to complete a handshake there.

## v1 scope

- nginx module + ClickHouse + a single hardcoded policy ("disable TLS 1.2")
- Request-ID join only
- Static HTML report, no UI, no auth
- One design partner's staging environment

## Out of scope

Automatic remediation, non-TLS deprecations (API versions, SDK EOL), non-HTTP protocols, self-serve signup.

## Risks & unknowns

Managed load balancers may make ClientHello capture impossible for the majority of the market. Joining network fingerprints to customer identity is a privacy artifact that needs a retention policy and probably a DPA. Demand is spiky — teams only care in the four weeks before a mandated cutover, which is a hard sales cadence.

## Done means

On a real service with at least three distinct client types, the report predicts the exact set of clients that break in a staging cutover, and the subsequent production cutover produces zero unpredicted breakages.
