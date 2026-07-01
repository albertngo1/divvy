## Overview
Chain of Custody is a self-hosted agent that periodically snapshots your digital purchase libraries (PlayStation, Steam, Kindle, iTunes) and appends a signed, hash-linked record of what you owned to an append-only log. It's for anyone burned by the Sony/StudioCanal deletion of 551 paid-for movies who wants provable evidence of silent revocation.

## Problem
Digital 'ownership' is revocable and undocumented. When a platform memory-holes content you bought, there's no neutral record it ever existed in your account — the storefront controls the only ledger. You can't dispute, screenshot-spam, or FOIA your way to proof after the fact.

## How it works
You connect read-only sessions to storefronts. On a schedule, the agent scrapes/queries your entitlement list, normalizes each item (title, id, purchase date, price, license terms), and writes a canonical JSON snapshot. Each snapshot is hashed and chained to the previous (Merkle-style), and the head hash is anchored to a public transparency log (Sigstore's Rekor) so the timeline is independently verifiable and tamper-evident. A diff engine flags DELETIONS and DOWNGRADES between snapshots and fires a notification: 'Sony removed 3 titles you owned since 2021-04.' You can export a court-ready PDF: item, when it appeared, when it vanished, with the Rekor inclusion proof.

## Technical approach
Stack: Python + Playwright for authenticated scraping of storefront library pages (the hardest, most fragile part — no clean public entitlement APIs; PSN/Kindle require session cookies and are actively anti-bot). Storage: SQLite for snapshots, plus a content-addressed log (each snapshot → SHA-256, prev-hash pointer). Notarization: sign the head hash with a local ed25519 key and submit to Rekor's public instance via its REST API, storing the returned log index + inclusion proof. Diffing: set-difference on normalized item ids across consecutive snapshots. Notifications via ntfy. The genuinely hard part is keeping scrapers alive against hostile storefronts and normalizing wildly different entitlement schemas.

## v1 scope
- One storefront (Steam — it has the friendliest API)
- Scheduled snapshot to SQLite with hash chaining
- Deletion/downgrade diff + ntfy alert
- Manual Rekor anchoring of head hash

## Out of scope
- PSN/Kindle scrapers
- Automated legal PDF export
- Multi-user / hosted SaaS
- Recovering the actual content

## Risks & unknowns
- Storefront ToS may prohibit scraping; keep it strictly personal/read-only
- Anti-bot defenses break Playwright flows
- Rekor is for software artifacts — using it as a general timestamp log is unorthodox (fallback: OpenTimestamps on Bitcoin)

## Done means
Removing a game from a test Steam account produces, on the next run, a correct 'removed' diff, an ntfy alert, and a Rekor entry whose inclusion proof verifies the snapshot's head hash.
