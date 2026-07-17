## Overview
Foothold turns a passive spectacle — watching bots poke at an SSH honeypot (à la honeypotlive.cc) — into a spectator-betting game. Every real attacker session streaming into your honeypot becomes a live event; players wager play-money on the intruder's next move as commands scroll in. For security-curious folks, CTF crowds, and infosec Twitch streamers who want an interactive overlay.

## Problem
Honeypot live-feeds are mesmerizing but strictly lean-back: you watch, you don't participate. Meanwhile the *pattern* of an automated attack — recon, download, persist, mine, pivot — is surprisingly learnable, and predicting it is genuinely fun and educational. Nobody's built the sportsbook for it.

## How it works
A Cowrie honeypot feeds a live event bus. When a new session opens, Foothold spins up a "market" with categorical props derived from the session so far: *Will they `wget`/`curl` a payload in the next 5 commands? Persist via cron/authorized_keys? Discover the planted fake flag file? Disconnect within 60s?* Odds move pari-mutuel style with the crowd's stakes. As each real command lands (redacted for safety), props resolve, chips pay out, and a leaderboard updates. A post-session "autopsy" replays the kill-chain with annotations so you learn the tells. Sessions are anonymized and rate-limited so no one is doxxing a human.

## Technical approach
Stack: Cowrie (SSH/Telnet honeypot) → JSON event log tailed by a Python watcher → Redis pub/sub → FastAPI + WebSocket server → a Svelte front end with a live terminal render (xterm.js). Data model: `Session(id, src_asn, started_at)`, `Market(session_id, prop_type, opened_at)`, `Bet(user, market, stake, side)`, `Resolution(market, outcome, resolved_at)`. Prop resolution is a rule engine matching Cowrie event types (`cowrie.session.file_download`, `cowrie.command.input`, `cowrie.login.success`) against templated predicates. The genuinely hard part is *fair, non-gameable markets in real time*: sessions last seconds, so you must open props early and freeze betting a beat before the predictive command likely arrives — plus dedupe the flood of botnet sessions that all run the identical script (cluster by command-hash so the crowd isn't just memorizing one payload).

## v1 scope
- One Cowrie instance, one hardcoded prop set (download / persist / disconnect)
- Anonymous play-money accounts, single global room
- Live xterm feed with 3s betting freeze before each resolution
- Post-session autopsy replay

## Out of scope
- Real money, real-name accounts
- Multiple honeypot types / geo maps
- ML-driven dynamic odds

## Risks & unknowns
- Legal/ethical: must scrub any human-typed credentials or PII from the feed; keep everything read-only and clearly educational.
- Botnet monotony: if 95% of sessions run the same Mirai script, markets get boring — the command-hash clustering must surface the *novel* sessions.
- Latency: attacker commands can arrive faster than humans bet; needs tuned freeze windows.

## Done means
Two people on different machines watch the same live honeypot session, place opposing bets on "downloads a payload," the prop auto-resolves from the real Cowrie event within one second of the command, chips settle correctly, and the autopsy replays the session end to end.
