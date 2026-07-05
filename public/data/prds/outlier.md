## Overview
Outlier is a 4-6 player concurrent-room word game where you hunt an in-browser LLM's blind spots. The host shows a sentence with a blank; every phone secretly submits one word that *fits* but that the model finds *unlikely*. Your score is the model's surprisal at your word — but it's zeroed unless a majority of humans agree your answer actually works. It's for people who like beating an AI at its own game while staying legible to real people.

## Problem
LLM games reward sounding like the model. That's the boring direction — regression to the mean. The interesting skill is the opposite: finding valid, human-obvious completions that a small model assigns tiny probability to (its coverage is thin, its priors are lazy). No party game turns "the model's ignorance" into a scoreboard, and none forces you to stay *human-plausible* while doing it.

## How it works
Host screen shows a shared stem: "The detective opened the door and found a ____." Each phone PRIVATELY shows the stem and a single-word entry box. Everyone submits simultaneously and secretly — no copying, no anchoring on what others say. The host feeds each `stem + word` to the model and computes that word's surprisal (−log p at the blank).

Then the reveal: every submitted word appears on the host at once, sorted by surprisal (juiciest longshots on top). But before points bank, each word gets a fast human gut-check — on their phones, players privately vote thumbs-up/down on whether each *other* word genuinely fits (you can't vote your own). A word scores its full surprisal only if it clears majority approval; otherwise it flatlines to zero. So "a xylophone" might be maximally surprising and get rejected as nonsense, while "a landlord" is both surprising *and* accepted — that's the sweet spot the game trains you toward.

## Technical approach
Host tab runs `transformers.js` (small GPT-2) as the authoritative scorer: one forward pass per submission, reading the logit at the blank position to get p(word). WebSocket server (PartyKit / Durable Object) holds `{stem, submissions: {id, word, surprisal, votes}, phase}`. Phones are PWA clients doing two private things: blind submission, then blind voting. The hard part is real-time fairness of the barrier — all submissions must be locked before *any* word is shown (else late players game the field), and multi-token words must be handled (sum surprisal or restrict v1 to single-token words). Voting must also be simultaneous-reveal to avoid bandwagoning.

## v1 scope
- 1 round, 4 players, 1 hardcoded stem
- Single-token words only (validated against the tokenizer on submit)
- Host-only model scoring
- Blind submit → surprisal sort → blind majority vote → banked score

## Out of scope
- Multi-token answers, stem decks, multiple rounds
- Weighting votes, tie-breaks, streak bonuses
- Any phone-side model

## Risks & unknowns
The human-vote layer adds friction and can swing wildly with a small room (a 2-2 split needs a rule). Surprisal is dominated by rare tokens, so the game may over-reward obscure single words unless a frequency floor is added. Simultaneous submit + simultaneous vote is two synchronization barriers, each a place the fun can stall on a laggy phone.

## Done means
Four phones blind-submit one word each, the host ranks them by the model's surprisal, players blind-vote validity, and the host banks full points only to surprising words that cleared majority approval.
