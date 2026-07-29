## Overview
True Up is a B2B SaaS that connects read-only to a company's Stripe account and finds billing bugs by *differential replay*: it re-derives what every invoice should have been from the subscription event log using its own independent implementation of proration, then diffs that against what was actually charged. Every discrepancy is reported in dollars. Sold to Series A–C SaaS companies with more than ~200 subscriptions and at least one grandfathered plan.

## Problem
Billing logic is the least-tested, highest-stakes code in any SaaS. It accretes: three pricing generations, coupons that were supposed to be one-time, a downgrade path someone added on a Friday, usage records that arrive after the invoice closes. Nobody writes tests for "customer upgrades on the same day their annual renews while holding a 20 % forever-coupon." The bugs don't crash anything — they silently under-bill for years, or over-bill and generate support tickets and chargebacks. Finance discovers them during diligence. Every founder suspects there's leakage and has no way to size it.

## How it works
1. **Connect** a restricted Stripe API key (read-only on invoices, subscriptions, prices, coupons, customers).
2. **Replay.** For each subscription, pull the full event stream (`customer.subscription.updated`, `invoice.created`, `invoice.finalized`, discount and credit-balance events) and reconstruct the timeline. An independent proration engine — written from the documented semantics, not from the customer's code — computes what each invoice *should* total. Diff line-by-line against reality.
3. **Classify.** Discrepancies get grouped into named leak patterns: *renewal-day downgrade credit*, *coupon that outlived its duration*, *proration on a metered price*, *trial extension that skipped an invoice*, *credit balance never drawn down*. Each carries a dollar total and the list of affected customers.
4. **Fuzz.** In the customer's Stripe *test* mode, generate synthetic subscription lifecycles — upgrade day 3, pause day 9, downgrade day 17, coupon applied mid-cycle, currency switch — run them against the customer's own billing endpoints, and assert invariants: no period is ever billed twice; total charged is monotonic in plan tier; upgrade-then-downgrade within a cycle never nets a credit exceeding what was paid.
5. **Report.** A weekly PDF plus a Slack digest: "$14,208 under-billed across 61 accounts, one pattern."

## Technical approach
Python/FastAPI + Postgres. Event ingestion via Stripe's `/v1/events` with cursor pagination, backfilled through the sigma-equivalent list endpoints for history beyond the 30-day event window. Data model: an append-only `subscription_fact` table keyed by (subscription_id, effective_at) so replay is a fold over an ordered log — the same shape as event sourcing, which makes re-running a fixed engine over all history cheap. Proration engine is pure functions over Decimal, no floats, with day-boundary and timezone handling as its own tested module. Fuzzing uses Hypothesis to generate lifecycle sequences, driving Stripe test mode via the SDK. Invariants are expressed as Hypothesis stateful-machine rules.

The genuinely hard part is not the math — it's distinguishing a bug from a deliberate business decision. A sales rep manually crediting an account looks identical to a proration bug. v1 handles this with a suppression workflow: every finding can be marked "intentional" with a reason, and the classifier learns which patterns a given account always suppresses.

## v1 scope
- Stripe only, USD only, recurring (non-metered) prices only
- Replay engine covering: upgrades, downgrades, cancellations, coupons with duration, trials
- One HTML report, emailed weekly; no dashboard
- Manual suppression via a checkbox list
- Design-partner pricing: flat $500/mo

## Out of scope
Metered/usage billing, tax and VAT reconciliation, multi-currency, Chargebee/Recurly/Paddle, automatic remediation (never write to Stripe), revenue recognition and ASC 606.

## Risks & unknowns
Stripe's proration semantics have undocumented edge cases; the independent engine will produce false positives until tuned, and false positives are fatal to trust in this category. Read-only key access is a security conversation with every prospect. Some companies bill outside Stripe entirely. Unclear whether under-billing findings are actionable — chasing customers for back-charges is often a no.

## Done means
Against a design partner's real account with 1,000+ subscriptions, the replay reproduces ≥99.5 % of historical invoice totals to the cent, and every one of the remaining discrepancies is confirmed by the partner as either a genuine bug or a known manual adjustment — with at least one previously unknown leak found and its dollar value agreed.
