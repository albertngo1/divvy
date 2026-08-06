## Overview
Break Clause is a small finance tool that treats annual-vs-monthly SaaS billing as a derivatives problem. Every annual prepay is two trades bundled together: you lend the vendor a year of cash, and you *sell them your right to walk away*. Break Clause prices both legs and tells you which of your annual plans you're being underpaid for. For indie hackers, freelancers, and small teams with 15–40 tool subscriptions.

## Problem
"Two months free" sounds like free money, so people take it reflexively. But the real question is whether the discount exceeds the value of the abandonment option you just gave up. If there's a 35% chance you stop using a tool by month 5, the monthly plan's exit right is worth far more than 17% off. Nobody computes this, because the inputs feel unavailable — and every budgeting app just categorizes the charge after it's already happened.

## How it works
You enter (or import) each subscription: monthly price, annual price, start date, and a usage signal. The tool returns three numbers per row:

1. **Implied APR** — the annualized interest rate you're earning by prepaying, ignoring churn. `(12·m − a) / a`, annualized over the average 6-month float. Compared live against the current 1-year T-bill so you see whether the "discount" beats a Treasury.
2. **Option value of quitting** — the expected savings from being able to cancel at month *k*, under your own churn hazard curve. Monthly plan value = Σₖ S(k)·m where S is your survival function; annual = a. The spread is the option premium.
3. **Verdict + break-even churn** — "Annual wins only if you're ≥71% likely to still use this in month 12."

A one-screen ranked table shows which annual plans to let lapse at renewal and which monthly plans to convert.

## Technical approach
SvelteKit + a single SQLite file (`better-sqlite3`), fully local; no accounts, no Plaid, no server-side storage of financial data.

Data model: `subs(id, name, monthly, annual, term_start, category)`, `usage_events(sub_id, day, opened)`, `rates(date, tenor, yield)`.

Churn hazard: fitting a Weibull per-subscription from one user's history is hopeless (n=1). Instead, fit a **category-level Weibull prior** from published SaaS retention benchmarks (ChartMogul/Baremetrics public cohort posts) — dev tools, design tools, media, AI — then shrink toward it with the user's own tenure data via a Bayesian update with a Beta-Geometric/NBD-style conjugate step. Survival S(k) = exp(−(k/λ)^ρ).

Risk-free curve from the Treasury's public XML feed (`home.treasury.gov` daily yield curve) or FRED series `DGS1`, cached daily.

Usage signal without spyware: parse `~/Library/Application Support` bundle mtimes and browser history (`places.sqlite` / Chrome `History`) for domain hits per tool, mapped by a small YAML of `tool → domains + bundle ids`. Read-only, never leaves the machine.

Genuinely hard part: making the option-value number *trustworthy*. A user with 8 months of history and a prior-dominated hazard curve is getting a guess dressed as math, so the UI must show the confidence band and let the user drag their own "will I still use this?" slider and watch the verdict flip.

## v1 scope
- Manual CSV/table entry of 10–40 subs
- Implied APR vs. live 1-year Treasury
- Category priors hardcoded for six categories
- Break-even churn probability per row, sorted worst-first

## Out of scope
- Bank/email receipt import, cancellation automation, team seats, multi-currency, mobile

## Risks & unknowns
Public retention benchmarks are B2B-flavored and may not describe one person's tool habits at all. Browser-history mapping is brittle. And the honest answer for many tools is "the discount is small and it doesn't matter" — the tool has to be interesting even when the verdict is boring.

## Done means
Paste in 20 real subscriptions and get a ranked table where every row shows implied APR, break-even churn %, and a verdict — with at least three rows where the verdict contradicts the naive "annual is cheaper" instinct, each explainable in one sentence.
