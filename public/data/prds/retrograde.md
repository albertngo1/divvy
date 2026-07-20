## Overview
Retrograde is a B2B guardrail API for the fast-growing category of consumer 'woo-tech' apps — astrology, tarot, manifestation, dream interpretation, numerology — that ship LLM-generated readings to millions of users. It scans every generated reading for regulated claims (medical, financial, legal) and rewrites them into non-actionable, safe-harbor language before they reach the user, keeping a signed audit log for app-store and regulator defense.

## Problem
An arXiv study on LLM fortunetelling shows people take these readings seriously and act on them. The moment a tarot bot says 'stop taking your medication, Mercury is clearing your body' or 'sell your house before the eclipse,' the app has made an unlicensed medical/financial claim. App Store 4.3/health rules, the FTC's 2025 crackdown on AI health claims, and plain liability make this a founder's nightmare — but no wellness-app team wants to build a claims-classifier in-house.

## How it works
Apps POST the model's draft reading (plus a vertical tag like `tarot` or `astrology`) to `/v1/review`. Retrograde returns: a risk verdict (`clear`/`soften`/`block`), a rewritten string with regulated claims neutralized ('the cards suggest reflecting on your health with a professional' instead of a diagnosis), and a `disclosure_id` referencing a tamper-evident log entry. Teams wire it as a post-generation middleware; latency budget ~300ms.

## Technical approach
Stack: FastAPI + Postgres + a small fine-tuned classifier. Core is a two-stage pipeline: (1) a cheap embedding + logistic classifier flags spans likely to be medical/financial/legal claims (trained on a labeled corpus of scraped astrology/wellness app outputs + FTC enforcement text); (2) flagged readings go to an LLM rewrite pass with a strict system prompt and a constrained-decoding checklist that must preserve the mystical framing while stripping actionability. Audit log is an append-only hash-chained table (each row hashes the prior) so a regulator can verify no entry was altered. The genuinely hard part is precision: over-softening makes the product feel neutered and churns customers, so the classifier threshold is per-vertical and per-customer tunable, with a shadow-mode that logs what *would* have been changed before enforcing.

## v1 scope
- One vertical: astrology/tarot, English only
- `/v1/review` endpoint: verdict + rewrite + disclosure_id
- Hash-chained audit log with a CSV export
- A 20-rule regex+embedding baseline classifier (no fine-tune yet)
- A dashboard showing flagged-claim counts per day

## Out of scope
- Real-time streaming rewrite (batch/per-message only)
- Non-English, voice, image readings
- Actual legal certification (we provide evidence, not a legal opinion)

## Risks & unknowns
- Precision/recall of claim detection on genuinely ambiguous mystical text
- Whether wellness founders perceive enough risk to pay before an enforcement action scares them
- Liability boundary: are we now partly responsible for what slips through? (Contract disclaims; log proves diligence.)

## Done means
Against a 500-reading holdout labeled by two humans, v1 catches ≥90% of medical/financial claims with ≤10% false-positive softening, returns in <400ms p95, and every review is independently verifiable in the hash-chained log.
