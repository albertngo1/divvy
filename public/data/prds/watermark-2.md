## Overview
Watermark is a 3–6 player concurrent-room party game about smuggling a hidden payload past a language model. Each player privately receives a different secret word and must bury it, as an acrostic, inside a sentence so fluent the model barely notices. It's for word-nerds who like constraint-writing and the delicious tension of a hidden signal under a smooth surface.

## Problem
Acrostic and steganography games have no objective referee — 'is this sentence natural?' is a shouting match. A small LLM's perplexity is a perfect, brutal, impartial fluency judge, and the fun is watching a clever hidden structure get scored purely on how invisible it is.

## How it works
Each phone is dealt a PRIVATE 4–5 letter secret word (all different). Under a 90-second timer, you write a natural sentence where the first letters of consecutive words spell your secret word (e.g. secret WARM → 'Winter arrives; raccoons migrate.'). Your phone shows: your secret word, a text box, and a live phone-local perplexity meter (transformers.js distilgpt2) plus an acrostic-validity checkmark that lights only when your first-letters actually spell the word. The shared host screen shows only anonymous progress dots and each player's live perplexity as an unlabeled bar — never the words, never the secret. At reveal, the host recomputes perplexity authoritatively, ranks valid acrostics lowest-first, and unveils each sentence with its hidden word highlighted. Bonus: before the words are shown, each phone privately guesses ANY other player's secret word from their sentence for a steal.

## Technical approach
Host tab is authoritative scorer running distilgpt2 via transformers.js (WASM/WebGPU). Phones are PWA clients running the SAME model locally for the private live meter (cached after first load). WebSocket server (PartyKit Durable Object, or Socket.IO over Tailscale Serve) holds room state: `{players:[{id,secretWord,text,localPpl,valid}], phase, timer}`. Secret words dispatched per-socket, never broadcast. The genuinely hard part: keeping phone-local and host perplexity consistent enough that the live meter doesn't lie — solved by pinning identical model weights, tokenizer, and a fixed length-normalization formula, and treating host score as final. Sync is light (text deltas debounced to ~500ms).

## v1 scope
- One round, 3–6 players, single secret word each
- Fixed word list of ~40 common 4–5 letter words
- Acrostic = first letter of each whitespace-separated word
- Host-side authoritative distilgpt2 scoring; simple lowest-ppl-wins ranking
- Optional single steal-guess

## Out of scope
- Multi-round scoring, longer words, mid-word acrostics
- WebGPU optimization; slow CPU fallback is acceptable
- Anti-cheat on phone-local meters

## Risks & unknowns
- distilgpt2 may over-penalize any proper noun, making acrostics feel unfair; needs a demo calibration sentence
- 4-letter acrostics might be too easy — tune word length in playtest
- Model load time on old phones

## Done means
Five phones each get a distinct secret word, write validated acrostics blind, host ranks them by authoritative perplexity, reveals hidden words, and the lowest-perplexity valid acrostic is declared the cleanest smuggler — all in one round under two minutes.
