## Overview
Backstory is a 4-6 player reverse-engineering word game. The shared host screen shows a single suspicious sentence a small in-browser language model 'said.' Everyone secretly races to guess the hidden prompt that produced it. It's for people who like the 'guess the missing context' feeling — a private detective race where the model is both the witness and the judge.

## Problem
Most prompt games ask you to WRITE something and get scored on cleverness. There's a rarer, tastier itch: seeing an output and reasoning backward to the setup that caused it. And existing 'guess the prompt' party formats have no objective scorer — they devolve into a vote. Here perplexity IS the objective scorer, and asymmetric private clues make it a real race instead of a group shrug.

## How it works
The host secretly holds a real prompt (e.g. 'Explain why raccoons make terrible accountants:') and its model completion. The host screen shows ONLY the completion. Crucially, each phone privately receives a DIFFERENT single leaked word from the true prompt — player A sees 'raccoons,' player B sees 'accountants,' player C sees nothing but a decoy word. No phone sees the others' clue.

PRIVATE per phone: your leaked word, a text box to type your reconstructed prompt, and a live private perplexity meter — when you tap 'test,' the server runs the model on `your_prompt + shown_completion` and returns how surprised the model was by the completion (lower = your prompt explains the line better). You get 3 test taps to iterate blind.

SHARED host screen: the completion, a countdown, and a row of face-down cards (one per player) that flip at the end to reveal each reconstruction ranked by final perplexity, with the true prompt unveiled last.

Lowest-perplexity reconstruction wins the round; ties broken by fewest test taps used.

## Technical approach
Stack: host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Model: distilgpt2 via transformers.js, run on the HOST tab (single WebGPU/WASM instance) so scoring is consistent and phones stay thin.

Data model: `Room { hiddenPrompt, completion, players[] }`; `Player { id, leakedWord, draft, tapsLeft, bestScore }`. Phones never run the model; they POST a `score_request {playerId, promptText}` over the socket, the host tab evaluates `perplexity(promptText + completion)` (mean negative log-likelihood over completion tokens only) and returns the scalar privately to that phone.

Sync strategy: authoritative server holds all state; the host tab is a privileged client that owns the model. The genuinely hard part is throttling: 6 phones × 3 taps of eager players can flood one WASM forward-pass queue. Solution — a per-room serial job queue on the host with a 'thinking…' spinner on the requesting phone, plus per-player rate limiting server-side.

## v1 scope
- 4 players, one round, one hand-authored hidden prompt + precomputed completion.
- distilgpt2 on host only; phones are text box + meter + 3 taps.
- Perplexity-over-completion scoring; single winner reveal.
- One leaked word per player, dealt from a fixed script.

## Out of scope
- Model-generated prompts, multiple rounds, scoreboards across rounds.
- On-phone inference, difficulty tuning, decoy-clue balancing beyond hand-picked.

## Risks & unknowns
- distilgpt2 perplexity may be too flat to separate good guesses from mediocre — needs a completion picked to be prompt-sensitive.
- Players might game it with keyword stuffing rather than plausible prompts; may need a fluency floor.
- WASM forward-pass latency under a burst of test taps.

## Done means
Four phones on one LAN each get a distinct leaked word, submit reconstructions, see a private perplexity number update on tap, and the host flips all four cards ranked lowest-to-highest with the true prompt revealed — and the person who best reconstructed the prompt reliably wins.
