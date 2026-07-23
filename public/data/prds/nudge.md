## Overview
Nudge is a concurrent-room party game where each player is secretly dealt one target word and must privately engineer a sentence lead-in that makes an in-browser LLM (distilgpt2 via transformers.js) predict that exact word as the most probable next token. It's for 3–6 people who like the delicious puzzle of talking a machine into a corner. Think of it as reverse autocomplete: instead of guessing what the model will say, you make the model say what you were told.

## Problem
Most perplexity party games ask you to lower or raise a score on text you freely choose — so players gravitate to the same safe clichés. Nudge removes that freedom: the target is imposed, often ridiculous ("walrus", "bankruptcy", "Tuesday"), so the fun is the contortion required to make an absurd word feel inevitable to the model. That constraint is the whole itch.

## How it works
The host TV shows a shared frame: "Everyone is steering toward THEIR secret word. Lead-in must end in a blank the model fills." Each PHONE privately shows only that player's secret target word plus a text box for a lead-in (≤14 words, 60s timer). Crucially, no phone sees anyone else's target or text. Players type simultaneously and blind.

At lock, the host appends each lead-in to a fixed prompt stem and runs one forward pass per player, reading the probability distribution over the next token. Your score is the probability mass the model assigns to YOUR target word (−log2 p, lower surprisal = better; or raw p, higher = better). The host TV then does a dramatic ranked reveal: each lead-in, the word the model actually wanted most, and where the secret target landed in the ranking. Nailing rank-1 on "walrus" earns a bonus.

Private per-phone target + simultaneous blind authoring is load-bearing: a single passed phone can't hold everyone's disjoint secret targets at once, and seeing another player's target would leak the joke.

## Technical approach
Host browser tab runs transformers.js (distilgpt2) as the single authority; phones are thin PWA clients. WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve) holds room state: `{players:[{id,target,leadIn,locked}], stem, phase}`. Phones send only their lead-in string; the host does all scoring so results are deterministic and un-spoofable. Genuinely hard part: model load latency and per-player inference on one tab — mitigate by loading the model during the lobby, batching the N forward passes sequentially with a visible "scoring…" spinner (N≤6 is fine, ~1–2s total), and caching tokenization of the shared stem.

## v1 scope
- One round, 3–6 players.
- Fixed prompt stem; target words drawn from a 40-word curated deck.
- Single forward pass per player, score = model probability of target token.
- Host-side scoring only; ranked reveal.

## Out of scope
- Multi-token targets, multiple rounds, scoreboard persistence.
- Player-authored target decks; difficulty tiers.
- Anti-cheat beyond host-authoritative scoring.

## Risks & unknowns
- distilgpt2 tokenization: multi-subword targets need a rule (score first subword, or require single-token words in the deck).
- Some targets may be nearly impossible; deck must be playtested for hittability.
- Latency spikes on weak host hardware.

## Done means
Five phones each get a distinct secret word, submit lead-ins blind within 60s, and the host renders a ranked reveal showing each target's model-assigned probability and rank, with the highest-probability player declared winner — reproducibly, from a single host tab.
