## Overview
Burn Rate is a real-time management sim where you operate a shop of AI "temps." Gig tickets stream in, you assign each to a model-worker, and every actual LLM call debits your budget. Profit is payout-for-passing-work minus tokens-burned. It's for anyone who's rolled their eyes at "hire a 24/7 autonomous AI workforce" marketing and wants to feel the ledger underneath it.

## Problem
The agent-hype repos (PraisonAI's AI workforce, Solana's "let your agents pay for any API," coral/uni-api unifying model calls) all hide the one thing that actually decides viability: cost per call and the quality/price tradeoff. When is a cheap model good enough? When does a smart model pay for itself? That invisible economics *is* the fun — so make it the entire game.

## How it works
Tickets land on a queue — summarize this, extract JSON, classify sentiment, write a limerick — each with a payout and a quality bar. Your roster is model-workers backed by real models (e.g. Haiku vs Sonnet vs an open model). Drag a ticket onto a worker; it fires a real API call; an automated judge scores the output against the bar. Pass = payout; fail = penalty plus the tokens you already wasted. Budget is finite and a day-timer forces triage: dump the cheap classification jobs on the cheap worker, save the smart one for the high-bar creative gigs. Between days you hire/fire, buy prompt-template upgrades, and pay rent.

## Technical approach
React front-end, single-file FastAPI backend. Route all model calls through OpenRouter for a uniform OpenAI-format interface with real token counts and prices (the coral/uni-api pattern). The judge is either a cheap model as LLM-as-judge returning pass/fail + score, or deterministic checks for structured tasks (JSON-schema validation, regex). Data model: `Ticket{type,input,payout,bar}`, `Worker{model,speed,cost_mult}`, `Ledger{tokens_in,tokens_out,cost}`. A template-driven generator seeds tickets. The hard parts: an auto-judge cheap and consistent enough that players trust their wins and losses, and pacing multi-second API latency into an arcade loop — fire calls async, resolve into an in-flight tray, animate results as they land.

## v1 scope
- 3 task types
- 2 worker models
- LLM-judge for one type + schema-check for another
- A 3-minute "day" with a fixed budget
- Live running P&L

## Out of scope
- Hiring/firing and upgrades
- Multiplayer
- Real money / crypto rails
- Persistent campaign

## Risks & unknowns
API latency could wreck the arcade feel; judge flakiness reads as unfair losses; and running the game itself costs tokens (mitigate with cheap models + response caching for identical inputs). Rate limits under fast play are a concern.

## Done means
I clear a day of ~10 tickets, watch the ledger debit real token cost after each call, and finish with a P&L that comes out positive only if I actually routed the cheap tasks to the cheap worker and reserved the expensive model for high-bar jobs.
