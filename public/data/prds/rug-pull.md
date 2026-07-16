## Overview
Rug Pull is a self-hosted watchdog for digital-purchase entitlements. It periodically snapshots the media you've *bought* — Steam games, Kindle books, Google Play/Apple movies, PlayStation titles — and detects when a storefront revokes access, silently edits content, or delists a title. It's for the person who read the Sony-deletes-your-movies story and realized 'buy' is a lie, and for journalists, refund-seekers, and digital-rights advocates who need proof, not vibes.

## Problem
Digital 'ownership' is revocable and invisible. Sony pulls movies you paid for; ebooks get quietly re-edited after purchase; games get delisted. Nobody keeps a dated ledger, so when access vanishes you have no evidence for a chargeback, a support ticket, or a class action. The platforms have all the logs; you have none.

## How it works
You connect read-only accounts (or paste library exports). Rug Pull takes a baseline snapshot of every entitlement — title, edition, purchase date, current availability, and a content fingerprint where a file exists locally. On a nightly cron it re-fetches and diffs: a removed title, a changed edition string, a shrunk page-count, or an altered checksum fires an alert and writes an immutable, timestamped ledger entry (append-only, hash-chained). You get a 'Revocation Report' PDF with dates suitable for a dispute.

## Technical approach
Python + SQLite (append-only `events` table, each row hash-chaining the prior for tamper-evidence). Sources v1: Steam Web API (`GetOwnedGames`, `GetAppList` for delist detection) and Kindle library via the user's exported `Content` list / Amazon 'Manage Your Content' scrape. Google Play Movies via account library scrape with a stored session cookie. Content fingerprinting: SHA-256 of locally-present DRM-free files, and for ebooks a normalized word-count + chapter-heading vector to catch silent edits. Diff engine emits typed events (`REVOKED`, `EDITED`, `DELISTED`, `EDITION_CHANGED`). The genuinely hard part is the absence of clean APIs — most stores require fragile authenticated scraping, and distinguishing a real revocation from a transient API hiccup needs a confirm-over-N-days debounce before alerting.

## v1 scope
- Steam owned-games nightly snapshot + delist/revoke diff
- Kindle library CSV import → diff against prior import
- Hash-chained SQLite ledger
- ntfy/email alert on any removal
- One-click 'Revocation Report' markdown export with dates

## Out of scope
- Real-time push; nightly is fine
- Automatic chargeback filing
- Recovering the content itself
- Mobile app

## Risks & unknowns
Scraping ToS and account-flagging risk; store HTML churn breaking parsers; false positives from API flakiness; Kindle/Apple have no official read API. Legal framing must stay 'personal evidence,' not redistribution.

## Done means
I delist a Steam title from a test account (or simulate a removed entitlement in a fixture) and within one nightly run Rug Pull records a hash-chained `REVOKED` event with a correct timestamp and produces a Revocation Report naming the title, store, and date.
