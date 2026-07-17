## Overview
Give Way is a 3–5 player anti-coordination word game where matching answers destroy each other. Host screen shows the shared prompt and a live collision radar; each phone is a private text field with a personalized proximity warning. It's for people who love unique-answer games ("name something obscure") but want the tension pushed into real time.

## Problem
The classic "give an answer nobody else gives" game resolves only at reveal — you commit blind and find out you clashed after it's too late. The itch: what if you could FEEL yourself converging on a friend's answer as you typed, and had to veer off in the last two seconds? Give Way makes anti-coordination a live, sweaty steering problem.

## How it works
The host TV shows one open prompt ("a reason to leave a party early"). All phones open a text box simultaneously with a 25s timer. Each phone shows ONLY your own in-progress text plus a heat meter and haptic buzz. As you type, the server embeds your current text and compares it to every OTHER live answer's embedding; the closer your answer is to anyone else's, the hotter your meter runs and the harder your phone buzzes — but it NEVER reveals whose you're near or what they wrote. You must swerve toward a more original answer to cool down.

The host screen shows an abstract radar: one dot per player (anonymous), dots drifting together glow red as a collective "about to collide" warning — pure ambient pressure, no text. At lock, any two answers whose similarity exceeds a threshold both score ZERO (a collision). Surviving unique answers score, most-original scores highest. Coordination — landing on the same obvious answer — is the failure mode; silent divergence wins.

Private per phone: your text, your heat, your buzz. Host: anonymous radar + final collision reveal only.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). A small sentence-embedding model runs server-side (e.g. a MiniLM ONNX). Data model: Room{prompt, phase, threshold}, Player{id, text, embedding, heat}. Sync: phones stream debounced text (every ~400ms) to the server; server re-embeds changed answers, computes each player's max pairwise similarity, and pushes back ONLY that player's own heat scalar plus the anonymized radar layout to the host. The genuinely hard part is latency and cost of continuous re-embedding under a live typing load — needs debouncing, caching unchanged text, and capping to a handful of players so the pairwise matrix stays trivial.

## v1 scope
- Exactly 3 players, ONE prompt, one 25s round.
- Server-side MiniLM, cosine similarity, single hand-tuned collision threshold.
- Host shows a 3-dot radar and a final zero-out-the-clashers reveal.

## Out of scope
- Scoring history, multiple prompts, per-word streaming below 400ms.
- Showing WHOSE answer you're near, or the near-miss content.
- Tunable difficulty, custom prompts, spectators.

## Risks & unknowns
- Embedding latency could make the buzz lag your typing and feel disconnected.
- Similarity threshold is fiddly: too tight and everyone survives, too loose and everyone busts.
- Short answers embed noisily; may need a minimum length or char-level fallback.

## Done means
Three phones type simultaneously; each feels its own heat rise as its answer nears any other's (without seeing which); at lock the server correctly zeroes out any two sufficiently-similar answers and ranks the rest — with no phone ever exposing another's text mid-round.
