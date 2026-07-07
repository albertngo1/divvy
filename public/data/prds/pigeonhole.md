## Overview
Pigeonhole flips every 'complete the sentence' game on its head: instead of answering a blank, you AUTHOR one. Each player privately gets a random mandated word and writes a fill-in-the-blank sentence that traps a tiny in-browser language model into near-certainty about the missing word. The model's *entropy* over that blank is your score — the lower (more forced), the better. It's a creative-constraint puzzle for word-game groups who want the machine as an opponent, not a Mad Libs generator.

## Problem
Cloze/fill-in games test whether you can find the obvious answer. That gets stale. Pigeonhole makes the interesting act *building the cage*: crafting context so constraining that only one word fits — while smuggling in an awkward mandated word — which is a genuinely different, more devious skill.

## How it works
The host TV shows the shared goal and a countdown. Each phone PRIVATELY receives a different mandated noun (e.g. "walrus," "lawsuit," "velvet"). On your phone you write a single sentence that (a) uses your word naturally somewhere and (b) contains one blank `___` that the context makes almost inevitable — e.g. "The dentist told the walrus to open its ___." You also privately type YOUR intended answer for the blank.

All submit at once. The host's model reads each stem and computes the probability distribution over the blank's first token; your **entropy score** = the Shannon entropy of that distribution (lower is better). The TV reveals each anonymized sentence, its entropy, and whether the model's argmax matched the author's intended word. Bonus round: each phone PRIVATELY guesses the forced word for one other player's sentence; correct guesses bank points. Lowest total entropy + bonus points wins.

Per-phone is load-bearing: mandated words are private and different, authoring and intended-answers are simultaneous and secret, and the guessing phase is a blind private submission — a single passed phone destroys both the secret words and the guessing game.

## Technical approach
Host tab runs distilgpt2 via transformers.js. WebSocket server (PartyKit/Durable Object or Socket.IO over Tailscale Serve) holds `{players[], mandatedWords{playerId}, submissions{playerId:{stem,intended}}, entropies{}, guesses{}}`. On submit, host tokenizes the stem up to the blank, runs one forward pass, reads the next-token softmax, computes entropy and top-1 token. Hard part: mapping a free-text `___` to a clean single-token measurement — normalize casing/whitespace, restrict scoring to the first sub-token, and reject stems with no blank or a blank not at a word boundary. Server enforces the mandated word appears (case-insensitive substring) before scoring.

## v1 scope
- 4 players, one round.
- One private mandated word each from a fixed pool.
- Entropy scoring on first blank token + one blind guessing pass.
- Local network only.

## Out of scope
- Multi-round, multi-token blank handling, categories/themes.
- Anti-trivia guards (e.g. banning 'capital of France' style layups).
- Reconnect, spectators, model selection.

## Risks & unknowns
- Trivia stems could trivially minimize entropy, making it un-fun — may need to reward the mandated-word integration too.
- First-token-only measurement can misjudge multiword answers.
- distilgpt2 entropy may be flat/uninformative for weird sentences.

## Done means
4 phones each get a private word, submit a stem+intended answer, the TV ranks them by the model's blank-token entropy and flags argmax matches, a blind guessing pass resolves, and a combined scoreboard names a winner in one round.
