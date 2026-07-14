## Overview
Cue is a Jackbox-shaped party game (3–6 players) where the scoring engine is a small in-browser language model's next-token probability. Everyone is handed the SAME absurd target word and privately races to write the sentence-so-far that makes the model most eager to say it next. It's for people who like word games with a hidden 'engineer the machine' puzzle underneath.

## Problem
Most LLM party games score a whole sentence's perplexity, which rewards bland coherence. The itch here is the opposite thrill: can you build a context so leading that a dumb model *has no choice* but to blurt out something ridiculous? That 'bait the argmax' feeling is unexplored and genuinely funny to reveal.

## How it works
The host TV shows one shared target word (e.g. **walrus**) and a category constraint ('write a lead-in of ≤12 words; the sentence must not contain the word itself'). Each phone PRIVATELY types a lead-in, e.g. *"At the aquarium the vet weighed the enormous tusked"*. Phones submit blind and simultaneously — nobody sees anyone else's text. The host appends each lead-in to a single forward pass through distilgpt2 (transformers.js), reads the logits at the final position, softmaxes, and computes p(target | lead-in) as the product of the target word's subword-token probabilities. The host TV then reveals a leaderboard: each lead-in shown with its probability as a percentage bar, sorted, with the model's *actual* top predicted word displayed beside each (the comedy: yours said 3% walrus, the model wanted 'fish'). Highest p(target) wins the round.

Private per-phone: your lead-in. Shared host screen: the target word, the countdown, then the scored reveal.

## Technical approach
Host browser tab loads distilgpt2 via transformers.js and is authoritative for scoring. Phone PWAs are thin controllers over a WebSocket server (PartyKit / Durable Object, or Socket.IO behind Tailscale Serve). Data model: `Round { targetWord, targetTokenIds[], deadline }`, `Submission { playerId, text }`. Sync is trivial — collect submissions, run N forward passes on the host, broadcast results. The genuinely hard part is *fair* tokenization: target words span multiple BPE tokens and are whitespace-sensitive, so we canonicalize as ' walrus' with a leading space and score the joint probability of its exact token sequence conditioned on the lead-in. Also cap lead-in length server-side so nobody games it with 200 tokens of priming.

## v1 scope
- 3–6 players, ONE round, one hardcoded target word.
- Host runs distilgpt2 locally; single forward pass per submission.
- Blind simultaneous text entry, 60s timer, one leaderboard reveal.
- No accounts, no persistence, room code only.

## Out of scope
- Multiple rounds / cumulative scoring.
- Player-chosen target words or difficulty tiers.
- Anti-cheat beyond a length cap.

## Risks & unknowns
- distilgpt2 may make some target words nearly impossible to elicit — needs a curated word list tuned for winnability.
- Multi-token targets can produce vanishingly small probabilities; may display log-prob or rank instead.
- One phone passed around trivially breaks the blind-simultaneous fun, so per-phone entry is load-bearing.

## Done means
Four phones submit different lead-ins for a shared target word; the host scores each with distilgpt2, and the TV shows a sorted probability leaderboard with the model's actual predicted word — all within ~3 seconds of the timer ending.
