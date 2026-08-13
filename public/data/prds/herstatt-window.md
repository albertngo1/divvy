## Overview
Herstatt Window is a browser tool that turns FX settlement risk from a phrase in a BIS report into a clock you can point at. You enter a currency pair, notional, and value date; it draws the two national payment systems as bars on a real timeline and shades the interval where your outgoing leg is irrevocable but the incoming leg has not settled. For treasury staff at fintechs doing cross-border payouts, crypto/FX startups building their own nostro plumbing, and anyone who has to explain to a board why the RMB leg is different.

## Problem
Everyone in payments repeats "Herstatt risk" and nobody can say how many hours theirs is. The answer is fully determined by public facts — RTGS operating hours, time zones, holiday calendars, CLS eligibility and session times — but those facts live in a dozen PDFs across a dozen central banks. So the number gets hand-waved, and the currencies outside CLS (notably CNY, INR, BRL, and most of Africa and Southeast Asia) get treated like the ones inside it.

## How it works
1. Choose pair (USD/CNY), direction, notional, trade timestamp.
2. The engine looks up each currency's RTGS window: Fedwire Funds (21:00 ET prior day → 19:00 ET), T2 (02:30–18:00 CET), CHAPS, BOJ-NET, CIPS, HKD CHATS, etc., converted through tzdb to a single UTC axis.
3. It applies a per-currency **nostro cutoff** offset — correspondent banks close hours before the RTGS does — and the unilateral-cancellation deadline defined by BIS: exposure starts when you can no longer pull the instruction, ends at final receipt.
4. Output: a shaded band with a number of hours, a maximum-exposure figure, and a plain sentence ("You are unsecured for 13h50m across a Chinese public holiday").
5. CSV upload of a trade blotter → portfolio view: % of notional PVP-protected via CLS vs naked, worst single window, weekend/holiday tail.

## Technical approach
TypeScript + Vite, no backend. Luxon over the IANA tzdb for all arithmetic (never naive UTC offsets — the DST misalignment between US and EU shifts is exactly where windows blow out). A hand-curated `currencies.json`: `{ code, rtgs, open, close, tz, clsEligible, holidayCalendar, defaultNostroCutoffMinutes }`, plus holiday sets (TARGET closing days, Fed holidays, Golden Week, Lunar New Year) as generated ICS-derived date lists. CLS modelled as its own actor: pay-in schedule, settlement session 00:00–06:00 CET, only 18 eligible currencies. Rendering in D3 on a shared UTC scale with per-currency lanes. The genuinely hard part is not code, it is honest data: real cutoffs are bank-specific and unpublished, so every offset is user-editable, versioned, and shown with a provenance link to the source document.

## v1 scope
- Six currencies: USD, EUR, GBP, JPY, CNY, HKD
- Single-trade mode only, one shaded exposure band, hour count
- Hardcoded 2026 holiday lists
- Provenance link under every timing claim

## Out of scope
Blotter upload, netting, credit-limit modelling, intraday liquidity, deliverable-vs-NDF distinction, any pricing of the risk.

## Risks & unknowns
Published RTGS hours drift and extensions are ad hoc; correspondent cutoffs are the real driver and are guesses; treating CIPS as a settlement rail rather than a clearing/messaging overlay is a modelling simplification that an expert will challenge.

## Done means
USD/CNY, trade Friday afternoon New York, renders two lanes and a shaded band labelled with hours and both calendar dates, and swapping CNY for EUR collapses the band to near-zero with a "CLS PvP" badge.
