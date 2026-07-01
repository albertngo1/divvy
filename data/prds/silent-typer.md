## Overview
Silent Typer is a two-player browser party game about communicating under a brutal constraint: you can never type freely — you may only tap words offered by a next-word prediction bar. It's charades for the autocomplete age, sparked by Meta's brain2qwerty 'type without speaking' research and the Claude steganography thread about how predictable machine-shaped text is.

## Problem
We let autocomplete finish our sentences all day without noticing how much it steers us. There's a delicious game hiding in that leash: what can you actually *say* when a model, not you, picks the vocabulary? Existing word games test your knowledge; none turn the *predictor itself* into the obstacle course.

## How it works
One player is the Sender, given a secret target phrase (e.g. 'the cat knocked over the vase'). They compose a clue message, but each word must be chosen from the top-K suggestions the model offers given what they've typed so far — no free typing. To get an off-suggestion word they must 'coax' the model toward it, which is the whole puzzle. The Receiver reads the constrained message and guesses the target. Score rewards fewer taps and faster guesses; a timer adds pressure. Swap roles each round.

## Technical approach
Stack: fully static, transformers.js running a small GPT-2 / distil-GPT-2 in-browser via WebGPU (CPU fallback). On each keystroke-equivalent, run a forward pass on the current prefix and surface the top-K tokens as tappable chips; commit a chip to append it and re-predict. Data model is trivial: a phrase bank JSON, a per-round log of `{taps, elapsed_ms, guessed}`. Multiplayer via a tiny WebRTC datachannel or a Yjs/websocket relay so both browsers share the message state. The hard part is UX around tokenizer subwords (GPT-2 splits into BPE pieces, so 'chips' must merge subwords into whole-word suggestions) and keeping inference latency under ~150ms so tapping feels live.

## v1 scope
- Single-device hot-seat: Sender constructs a clue from top-K chips, Receiver guesses
- One GPT-2 model in-browser, whole-word chip merging
- 50-phrase bank, tap-count + timer scoring

## Out of scope
- Online multiplayer/matchmaking (hot-seat first)
- Multiple languages, difficulty tiers
- Bigger/finer models

## Risks & unknowns
- WebGPU availability and cold-load size of the model
- Whether the constraint is *fun* or just frustrating — needs playtesting on top-K size
- Subword merging edge cases making nonsense chips

## Done means
Two people at one laptop can play a full round: the Sender builds a message using only model-suggested chips, the Receiver guesses the secret phrase, and the game reports a score based on taps and time.
