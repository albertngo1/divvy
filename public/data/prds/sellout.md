## Overview
Sellout is a browser extension + tiny local daemon that watches the answers ChatGPT/Gemini give you and flags the moments the model appears to be shilling. It's the ad-blocker for the age of *Advertise in ChatGPT* — built for anyone who noticed their 'neutral' assistant keeps naming the same three brands.

## Problem
Ads in a chat model don't look like ads. There's no banner to block — sponsorship shows up as a subtly weighted recommendation woven into fluent prose. You can't diff it against 'the honest answer' because you never see one. The itch: I want a second opinion from a model that has literally no advertiser, run side-by-side, so commercial nudges surface as *divergence*.

## How it works
When you send a prompt in a supported web chat, the extension captures the prompt text (not your history) and fires the same prompt at a local open model via Ollama. When the hosted reply streams in, a judge pass compares the two answers along one axis: **named commercial entities** — brands, products, vendors, specific SKUs, 'buy/try/sign up' CTAs. Any brand the hosted model pushes that the sponsor-free local model didn't gets highlighted inline with a subtle underline and a hover card: *'Recommended here, not in the neutral baseline — possible placement.'* Everything logged to a local 'ad ledger' you can review: date, prompt topic, brand, confidence. A weekly digest shows which brands your assistant favors most.

## Technical approach
Manifest V3 extension (content script scrapes the rendered answer DOM + captures the outgoing prompt via fetch interception). Local daemon: Python/FastAPI wrapping Ollama running Qwen or Llama 3.x. Judge: a structured LLM call (JSON schema — `{brand, sentiment, cta:bool, in_baseline:bool}`) run against BOTH answers, plus a cheap NER/regex pre-pass to extract candidate entities so we only judge when brands actually appear. Ledger in SQLite. The genuinely hard part is false positives: the local model recommends brands too, and legitimately-relevant brand mentions aren't ads. Mitigation — only flag when the hosted model names a brand *absent from the baseline AND* carries a purchase-intent CTA, and require the divergence across 2 baseline samples (temperature jitter) to survive noise.

## v1 scope
- One host: ChatGPT web only
- One local baseline model via Ollama
- Inline underline + hover card on suspected placements
- SQLite ad ledger with a plain-text weekly summary

## Out of scope
- Blocking/rewriting the answer (detect only)
- Mobile, Gemini, Claude
- Any cloud component — baseline stays local

## Risks & unknowns
- Detection is inherently probabilistic; a wrong flag erodes trust fast
- OpenAI DOM/stream format churn breaks the scraper
- Local model latency doubles perceived response time (mitigate: judge async, annotate after render)
- ToS gray area for prompt interception

## Done means
On a seeded set of 20 prompts (10 obviously commercial like 'best VPN', 10 neutral), Sellout highlights ≥8 of the commercial ones with a brand+CTA hover card and produces zero flags on ≥8 of the neutral ones, with a populated SQLite ledger.
