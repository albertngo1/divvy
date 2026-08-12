## Overview

A 3–6 player party game where a small in-browser language model is the referee for a real algorithm: speculative decoding. Players are the draft models. The model is the verifier. For groups who like Quiplash but want the judge to be a machine with an actual opinion instead of a vote.

## Problem

Every "guess what the AI says next" game collapses into one-word bingo — you either nail the token or you don't, and the round is a coin flip with no arc. There's no dial to turn, no moment of pushing your luck, and nothing at stake in *how much* you commit.

## How it works

The TV holds one shared story prefix, e.g. *"The last bus out of town was already"*. A 20-second timer starts.

PRIVATELY on each phone: a text box and a slider marked 1–5. You type your continuation and choose how many of your words to actually **submit**. Nobody sees anyone else's draft, or how long it is, until the timer dies. Your phone also privately shows your one **wildcard word** for the round — if it survives inside your accepted prefix, your score doubles.

At lock, the host walks every draft against the model. Token by token, a word is ACCEPTED if it sits inside the model's nucleus (top-p 0.9) at that position; the first word outside is rejected and **everything after it is discarded**, even if it would have been fine. You bank one point per accepted word.

SHARED on the TV: all drafts revealed simultaneously and animated left-to-right, words lighting green as they clear, then a hard red cut where each one dies. Longest accepted prefix wins the round, is appended to the story, and everyone drafts again from it — so the winner has just handed the room their own choice of context.

The tension is entirely in the slider. Five words is five points and a near-certain early cut. Two words is timid but banks. And your wildcard has to be reachable inside the length you dared to submit.

## Technical approach

Host browser tab runs Qwen2.5-0.5B-Instruct via transformers.js on WebGPU; phones are thin PWAs and never load a model. Authoritative state in a PartyKit Durable Object (or Socket.IO over Tailscale Serve): `{ round, prefix, deadlineTs, players: { id, draftTokens[], submitLen, wildcard, score } }`. Phones send keystroke-free `submit` events; the server stamps the deadline, not the client.

Sync strategy: server is truth for timing and scores, host is truth for model output and signs its verdicts back to the server as a single `verdict` message.

The genuinely hard part is verification latency. Six drafts × 5 tokens against the same prefix must be scored inside ~1.5s or the reveal feels dead. Build the prefix KV cache once, then fork it per draft and run each draft as a single batched forward pass, reading per-position nucleus membership straight off the logits — never re-prefill. Tokenizer mismatch is the second trap: players type words, the model eats subword tokens, so accept/reject must be evaluated at word boundaries (all subtokens of a word must clear) or the red cut lands mid-word and reads as a bug.

## v1 scope

- 4 players, one seeded prefix, exactly 3 rounds
- Max draft length 5 words, slider 1–5
- One wildcard word per player per round
- Accept rule: nucleus p=0.9, whole-word granularity
- Score = accepted word count, ×2 if wildcard survived

## Out of scope

Persistent lobbies, avatars, sound design, model choice, difficulty tuning, spectator mode, any anti-cheat beyond deadline stamping.

## Done means

Four phones on the same LAN submit drafts of different lengths; within 1.5s of the deadline the TV animates all four cuts, the longest accepted prefix is appended, and round 2 starts from it — and at least one playtester audibly regrets their slider position.
