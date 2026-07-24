## Overview
Fork is the divergence twin to a 'guess the mode' game: 3–6 players stand at a deliberately ambiguous sentence branch-point and each privately picks the next word. The model is the referee of what counts as *plausible*; humans compete to be *rare*. You want a word the LLM readily accepts yet every other player overlooked — the tine of the fork nobody else took.

## Problem
Anti-Schelling word games ('be uniquely valid') usually need a human judge to rule whether an answer is legit, which is slow and arguable. Fork hands the legality ruling to a language model's probability distribution, making 'is this plausible?' instant and objective — while keeping the human game of guessing where everyone else will crowd.

## How it works
Host screen (shared): shows a stem engineered to have HIGH next-token entropy, e.g. 'After the funeral, she opened the ___.' A short timer runs. On reveal it lists every submitted word with the model's probability, marks each valid/invalid and unique/duplicate, and ranks the survivors.

Phone (private): each player privately and simultaneously submits ONE continuation word. Blind — you can't see others, so you're gambling on what's both model-legal and human-lonely.

Scoring: the host runs one forward pass and reads P(word | stem). A word is VALID if it lands in the model's top-N (e.g. top-40) or above a probability floor — the model 'gets it.' Among valid words, you only score if your word is UNIQUE (no other player submitted it). Points = surprisal, −log p: the rarest still-plausible branch wins the most. Invalid (model finds it absurd) = 0. Duplicate valid words cancel to 0. The sweet spot is a word plausible enough to survive the model yet obscure enough that no twin picked it.

## Technical approach
Host tab runs transformers.js with distilgpt2 client-side. Authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve) holds `{roomId, stem, phase, players:{id,name,word,locked}, results}`. Phones are PWA clients; server locks all words at timer end and reveals nothing early. On reveal the host does one forward pass, softmaxes the next-token logits, and for each word looks up its probability and top-N membership; uniqueness is a normalized string compare (lowercase, trim, singularize) done server-side. Genuinely hard part: choosing the valid/invalid threshold so it feels fair — too strict and clever words die, too loose and gibberish scores. v1 uses top-40 OR p > 1e-4, tunable, and the host shows each word's rank so rulings are transparent.

## v1 scope
- One stem, one round, 3–6 players.
- Host + phone join by code/QR.
- Fixed list (~15) of high-entropy stems.
- Single forward pass; validity + uniqueness + surprisal scoring.
- Reveal board coloring words green (valid+unique), grey (dup), red (invalid).

## Out of scope
- Multi-round play, custom stems, difficulty tiers.
- Multi-token phrase submissions (single word only).
- Grammar checks beyond the model's own probability.

## Risks & unknowns
- Threshold tuning — the whole feel rides on the valid/invalid line.
- distilgpt2 may reject genuinely good rare words (small model, narrow tail).
- Collisions on obvious words leaving several players at 0 — accept, it's the point.

## Done means
Five phones each secretly submit one continuation word to a shared stem; the host reveals every word with its model probability and rank, marks each valid/invalid and unique/duplicate, and awards the round to the player whose word was plausible, unique, and rarest — decided entirely by one client-side model pass.
