## Overview
Payola is a transparency service (public dashboard + API) that measures brand bias injected into AI assistant answers now that platforms are selling ad placement inside chat. It's for journalists, brand-safety teams, regulators, and skeptical consumers who want receipts on pay-for-play in AI recommendations — the way radio payola once corrupted the airwaves.

## Problem
'Advertise in ChatGPT' means the line between an organic recommendation and a paid one is dissolving inside a conversational UI that feels neutral. There's no volume knob, no 'Ad' label you can trust, and no independent measurement of how much a sponsored context tilts an answer. That's exactly the itch payola disclosure rules were invented for — and nobody's built the meter.

## How it works
Payola maintains a corpus of high-commercial-intent prompts ('best budget mattress', 'which CRM for a 5-person team'). For each, it queries multiple assistants across two arms: a control (clean session) and treatment arms that vary conditions likely to carry ad influence — logged-in vs anon, ad-tier accounts, region, and prompts seeded with competitor mentions. It diffs brand mention frequency, ranking position, and sentiment across arms, then computes a per-brand 'lift' score. Big statistically-significant lifts under ad-carrying conditions get flagged and published as a weekly 'payola chart' with reproducible transcripts.

## Technical approach
Stack: Python orchestrator hitting model APIs (OpenAI, Anthropic, Google, plus a headless browser arm via Playwright for the consumer chat UI where ads actually live). Brand extraction via NER + a curated brand/alias gazetteer; sentiment via a small classifier. Store every raw response with prompt hash, arm, timestamp in Postgres; embeddings (a vector store) to cluster paraphrased recommendations. Stats: bootstrap confidence intervals on mention-lift per brand per arm, Benjamini-Hochberg correction across the many prompt×brand tests. Hard part: attribution — proving a lift is *paid* vs organic drift or model nondeterminism, which demands large N, tight controls, and honest 'suggestive not proven' framing.

## v1 scope
- 50 commercial-intent prompts, one product vertical
- Two arms (clean control vs ad-context browser session), one model
- Weekly batch run, static public leaderboard of top brand lifts
- Downloadable transcript bundle per flagged brand

## Out of scope
- Real-time / on-demand consumer lookups
- Legal conclusions or FTC complaint filing
- Non-English, non-US markets

## Risks & unknowns
- ToS/rate-limit risk scraping consumer chat UIs
- Model nondeterminism could masquerade as bias without enough N
- Platforms may A/B or fingerprint the harness, poisoning the arm
- Monetization: watchdog credibility vs selling to the brands being measured

## Done means
One published weekly chart where at least one brand shows a statistically significant, reproducible mention-lift under ad-carrying conditions versus control, with a downloadable transcript bundle a journalist can independently re-run and confirm.
