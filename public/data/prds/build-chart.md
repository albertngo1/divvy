## Overview
A quoting tool that ranks life insurance carriers by the *underwriting class you will actually get*, not the teaser rate. For anyone applying for term life while their body is in motion — GLP-1 users, powerlifters, recent postpartum, anyone whose BMI lies about them. Built for consumers, monetized through licensed agents.

## Problem
Online quote engines ask your height, weight, and smoking status, then show you Preferred Plus pricing you will never be offered. The actual decision comes from a carrier's *build chart*: a private height-by-weight grid mapping to Preferred Plus / Preferred / Standard Plus / Standard / Table B. Those charts disagree wildly — at 5'10", Banner's Preferred cutoff sits near 202 lb while another carrier cuts at 183 lb. Same person, one grade apart, ~35% premium difference over 20 years. Two 2026 facts make this urgent: research now says abdominal fat beats BMI for cardiac risk, and a few carriers have started crediting waist circumference — while millions of GLP-1 users are hitting applications with 40 lb of recent loss, which several carriers treat as a *negative* (rapid unexplained loss) by averaging current and 12-month-prior weight, or by declining until weight stabilizes.

## How it works
Seven questions: height, current weight, weight 12 months ago, waist, nicotine last 5 years, A1C/blood pressure if known, meds (GLP-1 flagged explicitly). Output is a ranked table: carrier, predicted class, predicted 20-year-term monthly premium, and one plain sentence of *why* — "Carrier X averages your current and prior weight, which puts you 6 lb over their Preferred line; Carrier Y uses current weight only." Plus a lever list: "waiting 4 months at this weight moves you a class at three carriers." A "talk to an agent" button routes the lead.

## Technical approach
Stack: Next.js + Postgres, no login for the quiz. The asset is the ruleset. Ingest carrier underwriting guides (public agent-facing PDFs from Banner/Legal & General, Protective, Symetra, Pacific Life, Prudential, Lincoln, John Hancock) with `pdfplumber` for the gridded build tables, plus a Claude extraction pass for prose knockout rules into a small DSL: `{carrier, class, height_in, max_weight_lb, weight_basis: current|avg_current_prior, nicotine_lookback_months, build_credit_rules[]}`. Every extracted rule carries a page citation and lands in a human review queue — a wrong table is a wrong quote. Premiums from carrier rate cards (per-$1000 rates by age/class/term) so no live quote API is needed for v1. Hard part: the guides are versioned quarterly, formatted inconsistently, and semi-gated; freshness is the moat and the maintenance burden.

## v1 scope
- Six carriers, male/female, ages 30-55, 20-year term only
- Build chart + nicotine + rapid-loss rule only; ignore labs
- Static rate cards, refreshed by hand
- Ranked output page with the "why" sentence and one lever
- Email capture → forward to one partner agency, flat per-lead fee

## Out of scope
Binding quotes, applications, IUL/whole life, medical record parsing, anything that reads like advice from an unlicensed party.

## Risks & unknowns
Redistributing underwriting guides may violate agent-portal terms — cite and paraphrase, never host PDFs. State insurance advertising rules mean the output must be framed as an estimate. Carriers may change GLP-1 handling mid-quarter. Lead economics ($30-80/qualified life lead) only work at decent quiz-to-contact conversion.

## Done means
Ten real applicant profiles run through the tool, then run past a licensed underwriter; the predicted class matches the offered class on at least 8, and at least 3 profiles show a carrier ranking that differs from the ranking a naive BMI-only quote engine produces.
