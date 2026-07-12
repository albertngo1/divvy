## Overview
Contraband is a 3–6 player concurrent-room party game about hiding a mandated word in plain sight from a tiny in-browser language model — and about spotting where everyone else failed. It's for people who like Codenames-style bluffing but want the referee to be math, not a human.

## Problem
Most 'weird sentence' party games score cleverness by vote, which rewards the loudest joke. There's an itch for a game where the *detector is objective* and the fun is adversarial: a real per-token surprisal signal you're actively trying to flatten while everyone reads the same chart against you.

## How it works
The host TV shows a shared topic ('airports'). Each phone PRIVATELY receives a different mandated secret word (e.g. 'lagoon', 'defenestrate', 'yogurt') it must weave into one sentence about the topic. You write blind to everyone else. The goal: make the model find your secret word *unsurprising* in context — build a runway around it so its surprisal doesn't spike.

On submit, the host runs each sentence through distilgpt2 and, one at a time, displays the full sentence (words visible) plus a per-token surprisal 'fever chart' below it. Everyone knows exactly one word was a mandated plant. Every phone PRIVATELY and simultaneously taps the word it thinks is the contraband. Reveal: the writer banks points if a majority missed the plant (great camouflage); each guesser banks points for a correct tap. A clean spike is a dead giveaway — so skilled writers also seed red-herring spikes elsewhere.

Private per phone: your secret word, your written sentence (until reveal), your simultaneous guess taps. Shared: the topic, and each sentence + chart during the reveal. Passing one phone around leaks the secret word instantly — private controllers are the whole game.

## Technical approach
Host browser tab loads transformers.js + distilgpt2 once (~few hundred ms/sentence, fine for 6 sentences). Authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{topic, phase, players[]}; Player{id, secretWord, sentence, guessOf:{targetId→wordIndex}}. Sync: server assigns disjoint secret words at start, gates the write phase on a 60s timer, then drives a reveal state machine (one target at a time) so all phones show the same chart in lockstep. Hard part: surprisal is only meaningful with consistent tokenization — the host must map model subword surprisals back onto whole visible words (max-pool subwords into the word's score) so a phone tap on a displayed word maps unambiguously to a scored token.

## v1 scope
- One topic, one round, 3–6 players
- Fixed pool of ~40 mandated words, disjointly dealt
- 60s write timer, sequential reveal, single scoreboard
- distilgpt2 only, host-side inference

## Out of scope
- Multiple rounds / running totals across games
- Player-chosen topics, custom word packs
- Difficulty tiers, GPU/quantized model swaps

## Risks & unknowns
- Some mandated words may be un-hideable (always spike) — needs curation for a fair band
- Word→subword surprisal mapping edge cases (punctuation, rare tokens)
- Reveal pacing: charts must be readable in a few seconds

## Done means
Four phones join, each gets a distinct secret word, all submit within the timer, the host renders correct per-word surprisal charts, every phone locks a private guess, and the scoreboard correctly credits undetected writers and correct guessers in one round.
