## Overview
In the Wild is a play-money forecasting game for security-adjacent nerds. Every day it surfaces a handful of trending vulnerabilities that just got a public exploit, and you bet on the single question that matters: will this actually get used against real targets, or is it noise? You're scored, weeks later, against ground truth from CISA's KEV catalog.

## Problem
Everyone in infosec passively doomscrolls CVE feeds, PoC repos, and 'critical!!!' vendor blogs — but has no skin in the game and no feedback loop on their own judgment. Most published PoCs never get exploited in the wild; a few become the next MOVEit. There's no fun, calibrated way to test whether you can actually tell the difference.

## How it works
Each market is a CVE with a fresh public PoC. You buy YES/NES shares on 'this CVE appears in CISA KEV within 45 days' (and side markets: 'reaches CVSS-amended', 'shows up in a ransomware writeup'). Prices move as other players trade a fixed daily point allowance. Markets resolve automatically when KEV updates or the timer expires. A rolling Brier-score leaderboard ranks forecasters by calibration, not just wins. A daily 'three-card' quick round lets casuals bet fast without portfolio management.

## Technical approach
Stack: SvelteKit + a small Postgres, one nightly cron. Data sources, all free public JSON: CISA KEV catalog (kev.json), nomi-sec/PoC-in-GitHub daily dumps for 'a PoC exists', NVD 2.0 API for CVSS/CWE/vendor metadata, and EPSS scores (first.org) as a baseline the house market-makes against. Ingestion pipeline dedupes CVE→PoC→metadata into a `markets` table; a constant-product LMSR automated market maker sets prices so there's always liquidity without other traders. Resolution job diffs today's KEV against open markets and settles. The genuinely hard part is fair, non-gameable resolution and timing — KEV additions lag real exploitation, so you seed secondary oracles (Shadowserver honeypot mentions, Metasploit module merges) and freeze market metadata at open to prevent hindsight edits.

## v1 scope
- Ingest KEV + PoC-in-GitHub + EPSS nightly
- One market type: 'in KEV within 45 days', LMSR pricing
- Play-money accounts, daily allowance, auto-resolution
- Brier-score leaderboard + share card

## Out of scope
- Real money / anything resembling a security
- Side markets, private leagues, chat
- Live intraday price ticks (daily settle is fine)

## Risks & unknowns
- KEV is a lagging, US-centric, incomplete oracle — resolution may feel arbitrary; need transparent rules.
- Base rates are low; markets could cluster near 0 and be boring — EPSS-seeded house maker mitigates.
- Ethical optics: must be clearly a calibration game, never a 'what to attack' tip sheet.

## Done means
A visitor can open the site, see today's five CVE markets with live LMSR prices, place a play-money bet, and — 45 days later — see it auto-resolve against KEV and update their Brier score and leaderboard rank, with zero manual intervention.
