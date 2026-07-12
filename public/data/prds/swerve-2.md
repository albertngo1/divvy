## Overview
Swerve is a 3-5 player concurrent-room party game where being original is survival. The host TV shows a category; everyone types an answer at the same time on their own phone. The catch: the room only wins if every answer is unique. Duplicates don't just miss points — they blow up on the big screen. It's for friends who love the panic of Scattergories but want it fast, loud, and live.

## Problem
Category games like Scattergories resolve collisions *after* the round — you write in secret, then discover the overlap when it's too late. That kills the tension. There's no in-the-moment swerving, no watching the room crowd a lane and yanking your answer sideways at the last second. Swerve makes the collision *live*.

## How it works
Host TV shows one category (e.g. "a red thing," "an 80s movie"). A 20-second timer starts. Each phone PRIVATELY shows a text box with your full in-progress answer — only you see the whole word. The host TV PUBLICLY shows one blooming ghost tile per player containing ONLY the first letter of their current answer, updating in real time as people type and backspace. So the room sees "three people are all on B right now" but nobody knows if it's Banana, Brick, or Blood. You watch the letters crowd, sense a pile-up forming, and swerve to a lonelier letter. When the timer ends, all answers lock and reveal. Any exact-match collision (case/whitespace-normalized) makes BOTH answers detonate — a shared room penalty, and those players are marked "totaled." A clean sweep of all-unique answers is the win, celebrated on the TV.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room { code, category, phase, deadline }`, `Player { id, name, fullText (server-private), firstLetter (broadcast), locked, totaled }`. Sync: phones send throttled keystroke deltas (~10/s); server stores full text privately but broadcasts ONLY the derived first letter to all clients — the partial-leak asymmetry is the whole game and must be enforced server-side, never client-trusted. On deadline the server does exact-match grouping and computes detonations authoritatively. Genuinely hard part: the leak must feel instant (<150ms) yet never expose more than the first character, and normalization/collision rules have to be unambiguous and visibly fair when tempers flare.

## v1 scope
- 3 players, one hardcoded category, one round
- First-letter ghost tiles on host TV, private full text on phone
- Server-side exact-match collision + detonation animation
- No accounts, 4-letter room code join

## Out of scope
- Multiple rounds, scoring across rounds, categories deck
- Fuzzy/synonym collision detection
- Spectators, reconnection polish

## Risks & unknowns
- Is a single leaked letter enough signal to swerve, or too little? Tune leak amount.
- Fast typists may lock in an obvious word before slow players react — may need a mandatory reveal-at-deadline lock.
- Griefers copying the crowded letter to force detonations; mitigate by making detonation hurt everyone equally.

## Done means
Three phones join via code, all type simultaneously, the host TV shows live first-letter tiles for each, and at the timer two identical answers visibly detonate while three distinct answers trigger a clean-sweep win — with full text never leaving the server except at reveal.
