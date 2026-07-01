## Overview
Honeymail is a self-hosted tool that mints a unique email alias per service you sign up for, forwards them to your real inbox, and — when spam or a breach arrives — tells you *exactly which vendor* leaked, sold, or got popped. For privacy-minded folks burned by the Apple Hide My Email leak and the growing business of selling your data.

## Problem
Hide My Email was supposed to hide you and instead leaked real addresses; Cloudflare is literally building a marketplace for monetizing crawled data. Meanwhile you have no idea which of your 300 accounts sold you out when spam lands. The signal — provenance of a leak — exists but is thrown away the moment you use one address everywhere.

## How it works
You own a catch-all domain. For each new signup you generate an alias like `netflix.a7f2@you.example`. Honeymail forwards it to your inbox and tags every incoming message with the alias it hit. When spam or a phish arrives, the alias *is* the culprit's fingerprint: only Netflix ever knew `netflix.a7f2`, so Netflix leaked it. A dashboard ranks vendors by "leak score" (spam volume, first-leak date, whether the alias showed up in a known breach corpus).

## Technical approach
A tiny SMTP forwarder (Postfix virtual-alias map, or a Cloudflare Email Routing worker) feeding a Go/Node service. Data model: `alias -> {vendor, created_at, forward_to}` and `message -> {alias, from, spam_score, breach_hit}`. Spam scoring via rspamd; breach cross-reference by hashing aliases against Have I Been Pwned's k-anonymity API. The dashboard is a simple SvelteKit/Next app. The genuinely hard part is deliverability — running a forwarding domain without landing in spam yourself (SPF/DKIM/DMARC done right).

## v1 scope
- Catch-all domain + one-click alias generator (browser extension or bookmarklet)
- Forwarding with alias tagging
- A table of vendors sorted by spam-per-alias

## Out of scope
- Reply-from-alias (outbound)
- Multi-user / hosted SaaS
- Automated legal complaint generation (tempting, later)

## Risks & unknowns
Email deliverability is a swamp; a misconfigured domain gets you blocked. Some services reject `+` or dotted subdomains. Attribution is strong but not court-proof — a shared marketing processor can muddy which vendor "really" leaked.

## Done means
You can generate an alias, sign up somewhere, receive mail through it, and — after deliberately leaking one alias to a test list — see that exact vendor rise to the top of the leak board.
