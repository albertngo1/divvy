## Overview
Off Spec is a paid monitoring service for *undocumented* third-party API drift. It maintains a fleet of sandbox/test-mode accounts across popular vendor APIs, replays a fixed suite of recorded requests daily, and publishes a structural changelog of what actually changed in the responses — not what the vendor's release notes claim. Buyers: platform/integrations teams at 20–500 person SaaS companies whose product breaks when a vendor silently widens a type or adds an enum value.

## Problem
Vendors ship breaking-ish changes constantly without bumping a version: a field goes nullable, an enum gains a value, `amount` becomes a string, a cursor format changes, an error body loses `code`. Published OpenAPI specs lag behind real behavior, and changelogs omit "minor" shape changes. Teams discover this from a 3am Sentry spike. Everyone re-derives the same knowledge in isolation.

## How it works
For each vendor we hold real sandbox credentials (Stripe test mode, Shopify partner dev store, Twilio test creds, Plaid sandbox, SendGrid, Slack, HubSpot dev portal). Each endpoint has a *cassette*: a deterministic request fixture, in the spirit of php-vcr. Nightly, every cassette is replayed against ≥2 independent accounts per vendor. Responses are scrubbed of volatile fields (ids, timestamps, request-ids, signatures) by a per-vendor scrubber, then a JSON schema is induced from the response body (types, nullability, observed enum sets, array element homogeneity, header set, status code).

Diffing happens at the schema level, not the text level — the difftastic move applied to payloads. Change events are keyed by canonical JSON Pointer path so they're stable across reorderings: `field_added`, `field_removed`, `type_widened`, `enum_value_new`, `nullability_changed`, `pagination_shape_changed`, `error_body_changed`, each classified additive / risky / breaking. A second diff compares induced schema against the vendor's published OpenAPI where one exists (Stripe publishes theirs on GitHub) to surface docs-vs-reality gaps — a distinct, sellable signal.

Free public changelog page per vendor drives inbound. Paid: Slack/webhook alerts filtered to the endpoints your stack actually calls, onboarded by uploading a HAR file or a list of outbound hosts.

## Technical approach
Python + httpx, cassettes as YAML in git (the repo *is* the audit trail). Postgres: `probes(vendor, endpoint, method, fixture)`, `observations(probe_id, run_at, account_id, status, body_sha, schema_jsonb)`, `schema_versions`, `events(path, change_type, severity, first_seen, confirmations)`. Schema induction is a recursive merge over observed values with a bounded enum-cardinality cutoff (stop treating a field as an enum above ~24 distinct values). Scheduler: plain cron + a worker; alerting via a Postgres NOTIFY queue.

The genuinely hard part is false positives. Vendors canary-roll changes to a percentage of accounts, and sandbox state (a leftover object, a plan tier) mimics schema change. Mitigation: ≥2 accounts per vendor, require the same change in 2 consecutive runs or 2 accounts before emitting, and a per-path flap score that suppresses chronically noisy fields. Second hard part: staying inside vendor ToS — test/sandbox modes only, documented low volume, honor rate limits, no scraping of production data.

## v1 scope
- 3 vendors, 10 endpoints total, one account each
- SQLite, a cron job, cassettes in a git repo
- Schema induction + diff for the six change types above
- One static HTML changelog page, generated nightly
- Email myself on any `breaking` event

## Out of scope
Code-level impact analysis, auto-generated client patches, GraphQL, gRPC, webhook payload monitoring, self-serve signup.

## Risks & unknowns
Vendor ToS and account bans; sandbox behavior may diverge from production (so a change we see may be sandbox-only — must be labeled); willingness to pay may collapse if vendors' own changelogs improve; the free changelog may be scraped by competitors.

## Done means
After 30 nightly runs across 3 vendors, the changelog page lists at least one real schema change I can confirm against the vendor's docs or forum, with zero unsuppressed false positives in the final 7 days.
