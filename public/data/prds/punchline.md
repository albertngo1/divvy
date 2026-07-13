## Overview
Punchline is a 3-6 player Jackbox-style party game about *the shape* of a model's surprise. Every player privately writes one grammatical, human-sensible sentence that lulls a tiny in-browser language model into confidence and then blindsides it on the very last word — exactly like a joke's setup and punchline. It's for word-game people who enjoy engineering a rug-pull.

## Problem
Most LLM party games score overall perplexity (flattest or weirdest wins). That flattens the fun into one number. The genuinely delightful, unexplored thing is a *garden-path spike*: a sentence the model cruises through happily, then trips over at the end while a human nods along. Nobody has made the punchline the mechanic.

## How it works
The host TV shows a shared topic ("kitchens", "betrayal") and a countdown. Each phone PRIVATELY shows one thing the host never displays: a secret assigned FINAL WORD drawn from a curated list (e.g. "fell", "salt", "Tuesday"), plus a text box. Your sentence must end on exactly that word, be grammatical, and make sense to a human — but you want the model to find that ending maximally shocking.

After 75 seconds, the host runs each sentence through distilgpt2 and computes per-token surprisal (−log2 p). It animates each sentence as a flat line that suddenly erupts at the final token. Score = surprisal(final word) − mean(surprisal(setup)), so a flat setup with a huge terminal spike beats a uniformly weird sentence. Each spike is GATED by a blind human vote: every phone privately taps "lands / doesn't" (grammatical & sensible); majority-no zeroes it. Highest gated spike wins the round.

## Technical approach
Host browser tab loads transformers.js + distilgpt2 (~120MB, cached) and is the authoritative scorer. Phones are PWA clients over a WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO behind Tailscale Serve). Data model: Room{topic, phase, deadline}; Player{id, secretFinalWord, submission, gateVotes[]}. Sync: phones POST submissions; host pulls them at deadline, scores sequentially (a handful of ~15-token forward passes — fast), broadcasts a curve payload {tokens[], surprisals[], finalIdx, spikeScore}. Gate votes stream back and reduce live. The genuinely hard part is tokenization honesty: the assigned "final word" may be multiple BPE tokens, so 'final surprisal' must sum the surprisal of every token composing that word, and the server must verify the sentence actually ends on it before scoring.

## v1 scope
- One round, one topic, 3-6 players
- Curated 40-word secret-final-word list
- distilgpt2 only, host-tab inference
- Per-token surprisal chart + single spike score
- Blind majority "lands" gate

## Out of scope
- Multiple rounds / cumulative scoring
- Predicting opponents' spikes (a natural sequel phase)
- Model choice, difficulty tiers, profanity filtering beyond a blocklist

## Risks & unknowns
- distilgpt2 may find too many endings surprising, compressing scores — needs a normalized spike metric
- Players might satisfy the model but bore humans; the gate must bite
- Multi-token final words could be gamed; verification must be strict

## Done means
Five phones each get a distinct secret final word, submit sentences, and the host renders five surprisal curves with animated terminal spikes; the highest human-gated spike is crowned, and passing a single phone around would leak everyone's secret word — proving per-phone privacy is load-bearing.
