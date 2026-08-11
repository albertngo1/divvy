## Overview

A 3-5 player room game where a secret message is transmitted not as words but as **rank numbers** off a tiny language model's next-word list. Sender and receiver are privately primed with different paragraphs, so the same rank decodes to a different word on each phone. For groups who like Telephone but want the corruption to be mechanical, systematic, and hilariously legible.

## Problem

Every "the AI garbles your message" party game corrupts text with a black box — the drift feels arbitrary, so nobody can play *against* it. Here the corruption is a codec with rules you can see and steer: you know your partner is reading the same numbers through a different lens, and your whole job is to anticipate their lens.

## How it works

1. Each player's phone is privately handed a 40-word **prime** — a world. Sender: *"From a submarine repair log."* Receiver: *"From a wedding toast."* Eavesdropper: *"From a cat's veterinary chart."* Nobody sees anyone else's prime.
2. The sender's phone (only) shows a 6-word target message: *"the pressure will not hold tonight."*
3. **Encode, word by word.** The host model, conditioned on the sender's prime plus what's been sent so far, produces 8 candidate continuations. The sender's phone shows those 8, ranked. The sender taps the one closest to their intended word — often nothing is close, and picking "the least wrong of eight" is the whole tension.
4. **Only the rank goes public.** The TV shows `3 · 1 · 7 · 2 · 5 · 3`. No words.
5. **Decode.** Every other phone privately walks the same rank sequence through the same model under *its own* prime, revealing its own message one word at a time. Rank 3 under a wedding toast is not rank 3 under a submarine log.
6. Receiver types their guess at the original message; eavesdroppers do too. TV reveals all four texts side by side.

Private per phone: your prime, your candidate list, your decode. Public on TV: six digits, then the reveal. One phone passed around would expose every prime instantly.

## Technical approach

Host browser tab + phone PWAs + PartyKit Durable Object as the authority. **All inference runs in the host tab only** (transformers.js, int8 distilgpt2, WebGPU) — phones never load the model. This is deliberate: float nondeterminism across devices would silently desync the codec.

Data model: `Room { phase, senderId, message, primes: {pid: string}, steps: [{ rank, senderWord, decodes: {pid: word} }] }`. Server holds primes and pushes each phone only its own slice. On each rank commit the host runs one forward pass per player (4 players × 6 steps ≈ 24 passes, ~60ms each), publishes candidate lists keyed by player, server fans out privately.

Hard part: the round-trip stall after every tap. Target <400ms per step, with per-player KV caches kept warm in the host tab and a filler animation on the sender's phone.

## v1 scope

- 3 players: sender, receiver, one eavesdropper
- One round, 6 words, top-8 fixed, 3 hardcoded primes
- Candidates filtered to content words (≥3 chars, no stopwords) or the list is all "the/of/and"
- No scoring — just the four-way reveal

## Out of scope

Multiple rounds, custom primes, on-phone inference, arithmetic coding, spell-it-out escape tokens, chat, persistence.

## Risks & unknowns

Top-8 from a tiny model may be too bland for the sender to steer with — the stopword filter is load-bearing and may not be enough. The drift may land at either extreme: perfectly recoverable (boring) or total noise (unplayable). Tuning k and prime distance is the real design work.

## Done means

On three phones, a 6-word message is sent as six digits; each phone's decode differs from the original in at least two words; the receiver's guess is captured and shown next to the truth on the TV.
