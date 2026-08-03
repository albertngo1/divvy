## Overview
A 4-player concurrent party game where a ~135M-parameter in-browser LLM performs **leave-one-out ablation** on a shared context of secret facts. Each phone privately holds one fact card. Everyone writes one claim. The model then answers a question no human can: *which hidden card was actually holding this sentence up?* For groups who like bluffing games but are bored of voting on jokes.

## Problem
LLM party games mostly reduce to "write text, get a perplexity number, low score wins." That's a leaderboard, not a game — there's no hidden information and no interaction between players' choices. The itch: make the model's *context* the contested resource, so what you write is entangled with what three other people secretly know.

## How it works
1. **Deal (private).** Each of 4 phones shows exactly one fact card, e.g. *"Octopuses have three hearts."* / *"Vantablack absorbs 99.965% of light."* Eight cards hardcoded. Nobody sees anyone else's.
2. **Banter (public, 60s).** Players talk out loud. You want the room steering *away* from your fact's territory without revealing it.
3. **Write (private, simultaneous, 90s).** Each phone writes one claim ≤15 words that should only make sense if *your* card is in the room. Your phone shows a live **leverage meter**: your draft's surprisal under a generic context minus its surprisal with your card present — updated as you type. You see this for your card only, never anyone else's.
4. **Ablate (host screen).** The host builds FULL = all four facts concatenated, and four LOO contexts (FULL minus fact *i*). For each claim C: `attribution_i(C) = meanSurprisal(C | LOO_i) − meanSurprisal(C | FULL)`. The TV animates each claim as four bars growing as passes complete.
5. **Score.** +3 if your card is the argmax attributor for *your* claim. −1 for every *other* player's claim your card tops (your fact was too generic, or you leaked it during banter). +1 if your claim has the largest cold→FULL gain in the room. Cards are revealed only here.

Private per phone: your fact, your leverage meter, your draft. Public on TV: claims (after lock-in), attribution bars, final reveal.

## Technical approach
Host browser tab runs transformers.js (SmolLM2-135M or distilgpt2) on WebGPU and is the sole authority; phones are dumb PWA controllers over a PartyKit/Durable Object room. Data model: `Room{code, phase, cards[], claims{playerId→{text, locked}}, scores}`; only `cards[i]` is fanned out to player *i*. Sync: phase transitions are server-broadcast; drafts go phone→server→host as throttled deltas.

Hard part: **one GPU, four live typists.** Four leverage meters demand continuous scoring while the host must stay responsive. Fix: a single-slot coalescing queue per player that drops stale drafts, 400ms debounce, and KV-cache reuse — the fact context is a fixed prefix, so only the claim tokens re-run. Scoring is length-normalized (mean per-token surprisal) or three-word claims dominate.

## v1 scope
- Exactly 4 players, one round, one deal of 4 cards from a hardcoded 8.
- One 90s writing phase, no rematch, no persistence.
- Attribution bars + reveal + final scores, then the room resets.
- Leverage meter can be 1Hz and ugly.

## Out of scope
Multiple rounds, custom card decks, player-authored facts, mobile-side inference, spectators, more than 6 players, any animation budget.

## Risks & unknowns
A 135M model may attribute noisily on short claims — needs a smoke test that hand-written "obviously about card 2" claims actually top card 2 (target ≥80%). Ties in argmax need a rule. Banter phase may collapse into everyone saying nothing.

## Done means
Four phones join a code, each sees a different card, all four submit claims, and the host screen shows a 4×4 attribution matrix where at least three of four claims attribute to their author's card — with final scores rendered and cards revealed, end to end, in under four minutes.
