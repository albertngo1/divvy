## Overview

A productized audit for companies running IVRs, voice agents, or ASR-driven call routing. We drive hundreds of real calls into their live system using accent-diverse human speech and report a disparity matrix: for each caller cohort and each intent, did the bot actually resolve it? Buyers are CX leaders at insurers, telcos, healthcare, and utilities — sectors with high-volume phone traffic and regulatory attention.

## Problem

The support VP sees one number: containment rate, 62%. What's underneath is 78% for one cohort and 31% for another, and nothing in their stack surfaces that. ASR vendors publish WER on their own benchmarks; WER is also the wrong metric — a 12% WER that always garbles the product name is worse than a 20% WER that scatters. So vendor selection, prompt tuning, and escalation thresholds are all made blind, on a system that is measurably worse for some of the customers paying for it.

## How it works

1. Client provides a phone number or SIP endpoint, their intent taxonomy, and a vocabulary list (product names, plan tiers, common street names).
2. We build call scripts per intent, then place real calls into their live or staging system from a probe fleet, playing held-out human speech clips through a telephony codec chain.
3. We score **task outcome**: correct intent within k turns, correct slot capture for digits/names/dates, escalation, and dead-ends.
4. Deliverable: a cohort × intent disparity matrix with confidence intervals, the top 25 specific misrecognized tokens with what they became, and a **patch** — a vendor-formatted keyword-boost / phonetic-lexicon file — plus a re-test showing the delta.

## Technical approach

Speech corpora: EdAcc (Edinburgh International Accents of English) and L2-ARCTIC (non-native English, 24 speakers across 6 L1s) as the backbone, Common Voice accent-tagged clips for volume, Speech Accent Archive for coverage checks, and Prolific-recruited speakers reading the client's own vocabulary. TTS-simulated accents are deliberately excluded from headline numbers — they are caricatures and would invalidate the report; TTS is used only to permute slot values.

Call path: `sox`/`ffmpeg` to G.711 μ-law 8 kHz with realistic gain and simulated packet loss, placed via Twilio Programmable Voice or `pjsua`, recording both legs.

Scoring: ground truth comes from the script. Bot turns are labeled by an LLM judge against a written rubric, with 10% human spot-check and reported judge agreement. Slot accuracy is exact-match after normalization.

The statistically hard part: 20 utterances from one speaker is n=1, not n=20. Disparity estimates bootstrap over **speakers**, not utterances, with Wilson intervals on cohort rates — otherwise every finding is fake significance.

Stack: FastAPI + Postgres + object storage for audio; report as HTML→PDF. Patch emitted per vendor (Deepgram `keywords`, Google `speechContexts`, Whisper `initial_prompt`).

Pricing: $12k for the audit; $2.5k/mo to run it nightly against staging as a regression suite.

## v1 scope

- one design-partner client, one IVR, three cohorts, ~150 calls
- report hand-assembled in a doc; no product UI at all
- patch generated for whichever single ASR vendor they use

## Out of scope

Self-serve, dashboards, non-English, real-time production monitoring, anything touching their live customer traffic.

## Risks & unknowns

Budget owner is genuinely unclear — CX, legal, or accessibility — and "unclear owner" kills more B2B services than bad product does. Recording and probe-calling require contractual consent (fine for a client's own line, not otherwise). And the first meeting means telling a customer their product treats some callers worse, which is a hard sale in either direction.

## Done means

One paid audit delivered where applying the keyword patch raises the worst cohort's task-completion rate on a re-test, with a speaker-level bootstrap interval on the improvement that excludes zero.
