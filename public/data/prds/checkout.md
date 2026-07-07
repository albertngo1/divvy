## Overview
A competitive programming game riffing on the 'Strategic Buying Agents' arXiv paper. Players write a small buying-bot policy that competes against other players' bots to grab units in a simulated high-demand product drop (limited-edition sneakers, a GPU restock, concert tickets). It scratches the sniping itch entirely inside a sandbox—no real merchant, no real scalping, no real people priced out.

## Problem
Everyone has raged at bots buying out a drop in 400ms. But the mechanics—queue tokens, cart holds, rate limits, retry backoff, CAPTCHAs—are a genuinely rich adversarial game that nobody gets to *play* as a game; you only ever lose to it. There's an audience of devs who'd love to out-scheme each other in this arena without doing anything unethical.

## How it works
Each round, the server announces a drop: N units, a release tick, and a rule set (per-IP rate limit, cart-hold TTL, one-per-account, a CAPTCHA cost). Players submit a bot as a small sandboxed function that reacts to events (`stock_open`, `add_to_cart_result`, `throttled`) and emits actions (`poll`, `add_to_cart`, `checkout`, `solve_captcha`) each consuming a budget of requests/time. A deterministic discrete-event scheduler runs all bots against the shared inventory. Whoever legitimately checks out the most units under the rules wins; abusive patterns get throttled exactly as a real anti-bot system would, so cleverness beats brute force.

## Technical approach
Stack: TypeScript, deterministic event-loop simulator (single-threaded tick queue, seeded RNG for CAPTCHA/latency jitter so replays are exact). Bots run in isolated `QuickJS`/`isolated-vm` sandboxes with a request/CPU budget. The 'server' is a state machine: inventory, per-account cart holds with TTL, token-bucket rate limiters per IP identity. Matches are recorded as event logs and replayable in a browser timeline viewer so you can watch the frame where your bot got throttled. Hard part: designing anti-bot rules that reward strategy (timing, decoys, identity rotation within allowed limits) over spam, and keeping the sim deterministic for fair leaderboards.

## v1 scope
- One drop scenario, one rule set
- JS-only bot submission via web editor
- Deterministic sim + text result log
- Async ladder: your bot vs 7 stored opponent bots

## Out of scope
Real-time live matches, multiplayer lobbies, other languages, ML-based CAPTCHA, monetization.

## Risks & unknowns
Could read as a 'how to build a scalper bot' tutorial—needs framing as fictional sandbox. Sandbox escape/resource-abuse from submitted code. Balance: a dominant strategy makes it boring fast.

## Done means
Two different submitted bots run against the same seeded drop and produce identical, replayable results on re-run, with the smarter (timing/decoy) strategy reliably out-scoring a naive spam bot.
