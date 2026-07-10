## Overview
Switching Cost is a two-sided marketplace. On one side: product/growth teams who want brutally honest competitive intel. On the other: committed daily-drivers of Product A (Notion, Linear, Windows, Photoshop) who get paid to switch *exclusively* to the buyer's Product B for 2–4 weeks and document the migration. Inspired by the osnews 'you paid me to use Windows 11 for a month' piece — that was one blog post; this makes it a repeatable, structured research product.

## Problem
UserTesting-style tools give you 30-minute first-impression clips. They don't capture the real thing: the compounding friction of *committing* to a switch — the muscle memory you lose, the workflow that breaks on day 9, the feature you can't find that makes you rage-quit. PMs desperately want 'why do people bounce back to the competitor' data and today get it only from churn surveys after the fact.

## How it works
Buyer posts a brief: target competitor, exclusivity terms, duration, comp (e.g. $400 for 3 weeks). Diarists apply with proof they're a heavy user of the competitor (usage screenshots, account age). Selected diarists commit to exclusivity and submit a daily micro-entry via a templated form: what I tried to do, what broke, the emotional temperature (1–5), and a 30-sec Loom when frustrated. A weekly synthesis rolls up recurring friction themes; final deliverable is a 'defection report' — ranked switching barriers with verbatim clips and a day-by-day sentiment curve.

## Technical approach
Boring, buildable stack: Next.js + Supabase (Postgres) + Stripe Connect for escrowed payouts. Data model: `briefs`, `applications`, `enrollments`, `daily_entries` (structured JSON + optional video URL), `synthesis`. Diary entries structured so an LLM (Claude) can cluster friction points into themes across diarists and draft the report — the human PM edits. Video via a Loom/S3 upload. Exclusivity is honor-system in v1 (verified by asking diarists to share a competitor-usage screenshot at start and end showing a drop). The genuinely hard part isn't tech — it's supply: recruiting vetted, honest heavy-users of specific rival tools and preventing shills.

## v1 scope
- Single hardcoded category (dev/PM SaaS tools)
- Buyer brief form + manual diarist vetting
- Templated daily entry form + weekly LLM theme cluster
- Stripe escrow: hold on enroll, release on completed diary
- Final report as an exported PDF

## Out of scope
- Automated exclusivity enforcement / usage tracking
- Self-serve diarist marketplace at scale
- Non-software categories (physical products)
- Localization / multi-currency

## Risks & unknowns
- Supply chicken-and-egg: hard to seed enough credible defectors.
- Bias: paid switchers may over-report friction to seem thorough.
- Legal: inducing exclusivity + honest reviews near defamation lines for named competitors.
- Buyers may prefer to run this in-house once they see the template.

## Done means
One paying buyer runs a real brief end-to-end: ≥5 vetted diarists complete a 3-week exclusive switch, submit ≥15 daily entries each, funds escrow and release correctly via Stripe, and the buyer receives a themed defection report they rate 'actionable.'
