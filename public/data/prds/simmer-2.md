## Overview
Simmer is a 4-6 player concurrent-room word game where each phone is a private, live perplexity thermometer. Players simultaneously write a sentence about a shared topic, but the goal isn't to be clever — it's to land your sentence's *surprisingness* inside a narrow target band the host announces. A small in-browser LLM computes perplexity on every keystroke; the phone shows a wobbling temperature gauge that heats up when your text gets weird and cools when it gets bland. First player to hold the band for 2 seconds wins the round.

## Problem
Most LLM party games ask for the funniest or weirdest answer, then vote. That's Quiplash with extra steps. The itch here is *aiming for a middle* — writing something neither cliché nor gibberish — and getting instant, private, physical feedback as you type, which is a sensation no group-voting game can give.

## How it works
Host TV shows the topic ("a bad first date"), the target band (e.g. perplexity 45-60, drawn as a green zone on a shared thermometer), a live leaderboard of who has 'landed', and each player's gauge as an anonymous dot — but never their text.

Each PHONE privately shows: your text box, and a big vertical thermometer that fills/drains in real time as the model rescores your partial sentence. You feel the phrase 'a dark and stormy night' plunge the needle (too bland/low perplexity) and 'a dark and quantum otter night' spike it (too weird). You hunt for the band by editing word by word. Your text and exact needle are secret until reveal.

On landing (needle inside band, held 2s), your phone locks and you win; ties broken by who held steadiest.

## Technical approach
Host browser tab loads distilgpt2 via transformers.js (WebGPU, WASM fallback) as the single authoritative scorer. Phone PWAs connect over a WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: room {code, topic, band:[lo,hi], phase, players[]}; player {id, name, text, ppl, landedAt}. Phones debounce keystrokes at ~200ms and send {type:'draft', text}; host tab computes per-token log-probs → perplexity and returns {type:'score', ppl} only to that phone, plus an anonymized dot to the TV.

Genuinely hard part: one model instance serving 6 concurrent live-scoring streams under ~200ms so the thermometer feels analog. Solve with a priority queue keyed on most-recently-typed phone, dropping stale in-flight requests, and short (single-sentence) inputs to keep each forward pass cheap.

## v1 scope
- One round, 4 players, one topic, one fixed target band.
- distilgpt2 only; perplexity of full current text (no windowing).
- Thermometer + 'landed' state; simple first-to-land win.

## Out of scope
- Multiple rounds, scoring across rounds, band difficulty tiers.
- On-device models, offline mode, spectators.
- Anti-cheat on pasted text.

## Risks & unknowns
- Model load time and mobile-to-host round-trip latency may make the gauge laggy.
- Perplexity bands may feel arbitrary/unintuitive to players; tuning the 'sweet spot' range is critical.
- Debounce vs. responsiveness trade-off.

## Done means
Four phones in one room each edit a sentence, each sees its own thermometer update within ~250ms of typing, the host shows anonymous dots and the target zone, and exactly one phone locks as 'landed' when its perplexity holds the band for 2 seconds — with no phone ever seeing another's text.
