## Overview
Undertow is a concurrent-room party game for 4-6 players about tug-of-warring a language model's expectations. Everyone extends the same shared sentence stem on their own phone, but each player is secretly assigned a different target word — and you win by writing the extension that makes the in-browser model most likely to predict YOUR secret word at the blank. It's competitive prompt-engineering wearing a party hat.

## Problem
Everyone's now poked at chatbots and felt the odd craft of "steering" a model with just the right lead-in. No party game turns that craft into a race: same shared canvas, six hidden goals, and a machine's own probability distribution as the impartial, surprising referee. The fun is that the model rewards clever indirection over brute force — and nobody sees your target until the reveal.

## How it works
Host shows a shared stem ending in a blank: "At the museum, the guard quietly warned us about the ___." Privately, each phone reveals a different secret target (dragon, sandwich, budget, ghost…). You get 40 seconds to privately insert up to 8 words into the middle of the sentence so the model's most probable completion at the blank becomes your word — e.g. to steer toward "ghost" you might add "haunted east wing, cold spots, and the." Your edits and your target stay private; the TV shows only the shared stem and a countdown.

At lock the host runs each player's full sentence through the model and computes `P_model(target | your_sentence)` at the blank. The host screen then theatrically reveals, one at a time: each player's edited sentence, their secret word (surprise!), and the probability they squeezed out — ranked. Highest probability wins.

Per-phone is load-bearing: secrets are private and all different, and everyone writes at once — a single passed phone can't hold six hidden targets and six parallel edits. The asymmetry (one stem, six hidden goals) is the engine.

## Technical approach
Host tab runs `distilgpt2`/`gpt2` via transformers.js. Server (PartyKit DO or Socket.IO over Tailscale Serve) holds `{stem, blankIndex, players:{id,name,secretWord,sentence,score}, phase}`. Secret words are dealt from a curated deck at round start, one per player, never broadcast. Phones POST their edited sentence; the server keeps it hidden until reveal.

Scoring: the host tokenizes each submission, runs one forward pass, and reads the probability of the target word's first token at the blank. The hard part is keeping it skill, not spam — players could just append the word literally. v1 bans the target word and simple morphological variants from the edit (server-side check); you must steer contextually, not name it. Sync is trivial: one authoritative forward pass per submission on the host at reveal, results broadcast.

## v1 scope
- One shared stem, one round, 4 players.
- One secret word each from a fixed deck.
- Insert up to 8 words before the blank; target word banned from the edit.
- distilgpt2 first-token probability; host reveal ranks by probability.

## Out of scope
- Multiple rounds / cumulative scoring.
- A guessing phase (who chased which word).
- Multi-token target scoring; fuzzing beyond a basic blocklist.
- Custom decks or player-authored stems.

## Risks & unknowns
- Banning the literal word is easy to evade with near-synonyms; the blocklist is crude.
- distilgpt2 may reward degenerate edits (repetition, broken syntax) that spike a target's probability — could feel gamey rather than clever.
- 40 seconds may be too short to feel real steering; needs playtest tuning.

## Done means
Four phones each get a different secret word, all privately edit the same stem within the timer, the host runs one forward pass per submission, and the leaderboard ranks players by the model's probability on their hidden target — with a sentence that never once contains the target word taking first.
