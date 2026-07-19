## Overview
Lure is a 3–6 player concurrent-room word game where the scoring engine is a small in-browser LLM's next-token probability. Instead of judging text you wrote, it judges how well your text *seduces the model into speaking for you*. For friends who like clever, slightly nerdy party games with a fresh twist on autocomplete.

## Problem
Every perplexity party game so far scores the words the player typed. The untapped itch: the fun of *steering* the model — building a runway so the machine finishes your thought without being told to. Nobody has made the target a hidden, per-player word.

## How it works
At round start each phone is privately dealt a DIFFERENT secret target word (drawn from a common-ish word bank, e.g. "banana", "lawyer", "rain"). No one — not even the host screen — reveals whose word is whose. The host TV shows only the round theme and a countdown.

Each phone privately types a short prefix (max ~12 words) that ends anywhere it likes. Your goal: make the model, reading your prefix, want your secret word as its very next token. You never type your secret word — the model must produce it.

At lock-in the host runs distilgpt2 (transformers.js) over each prefix and reads the full next-token probability distribution. Your score = the probability mass the model assigns to your secret word as the immediate next token (shown as bits of surprisal; lower surprisal = better). The reveal is the payoff: for each player the host prints the prefix, the model's actual top-5 guesses, and where your secret word ranked — often hilariously ("the model was 71% sure you meant 'peel'"). Lowest-surprisal author wins the round.

PRIVATE per phone: your secret word, your prefix draft, and an optional live phone-local surprisal meter. SHARED on host: theme, timer, and the final ranked reveal.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object) holds room state: `{players:[{id, secretWord, prefix, locked}], phase}`. Phones send prefix updates; server never broadcasts prefixes until reveal. Host tab owns the canonical transformers.js distilgpt2 pipeline and, on reveal, computes `p(secretWord | prefix)` from a single forward pass per player (top-k logits + softmax). The genuinely hard part: tokenization mismatch — a target "word" may span multiple BPE tokens, so score on the probability of the first sub-token (or the joint of its token sequence) and pin the word bank to single-token-friendly words in v1. Optional phone-local preview loads a quantized model in the PWA; keep host as source of truth.

## v1 scope
- One round, 3–6 players.
- 20-word single-token target bank.
- Host-side scoring only; simple ranked reveal.
- No accounts, ephemeral room code.

## Out of scope
- Multi-round scoring, multi-token targets, phone-local model.
- Anti-cheat on typing the word literally (v1 just strips exact matches).

## Risks & unknowns
- Rare targets may be near-impossible; needs a curated, tuned bank.
- Distribution can be dominated by punctuation/function tokens — may need to mask those.
- Fun hinges on the reveal feeling like the model "chose" your word.

## Done means
Six phones each get a distinct hidden word, submit blind prefixes, and the host renders a correct ranked reveal (surprisal per player + model's top-5) within 3s of lock-in, with a clear winner.
