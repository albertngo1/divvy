## Overview

A 4-player negotiation game where the room co-writes one sentence under a shared surprisal ceiling — but nobody actually chooses words. The words are chosen by private random bits living on people's phones, and the only real decision is *whose* bits to spend next. For groups that like Hanabi's information economy but want lying to be legal.

## Problem

Bits-as-currency LLM games all reduce to "budget the interesting word." You control your spend, so it's an optimization puzzle wearing a party hat. Nobody is ever *forced* to be the reason the sentence went wrong, and nobody has anything to misrepresent.

## How it works

The TV shows the sentence so far and the model's four highest-probability next words, ranked 1–4, each labeled with its cost in bits of surprisal (rank 1 might be 0.4 bits, rank 4 might be 6.1). Below that: a shared **budget bar**. The finished 10-word sentence must total under 30 bits or the room busts.

PRIVATELY on each phone: your **tape** — a fixed random bit string dealt at game start, revealed to you two turns at a time. Bits are read in pairs and the pair *is* the rank: 00 picks the top word, 11 picks the fourth. You see your next two pairs. You cannot change them, reorder them, or skip them.

Each turn a rotating Foreman picks one player to spend (never the same player twice running). That player's next pair fires, its word is appended, its cost is deducted, and the tape pair is revealed publicly on the TV — so everyone finally learns whether you lied.

And you will lie, because you score 3 points every single time you are spent, whether the room busts or not. Before the Foreman decides, every phone submits a public **claim** ("my next pair is 01") that appears on the TV as a card with your name on it. The claim is free and unverified until the moment it costs the room five bits.

If the sentence lands under budget everyone doubles their points; if it busts, only players spent at most once score at all — so the loudest self-promoters are also the ones who sink themselves.

## Technical approach

Host tab runs SmolLM2-135M or Qwen2.5-0.5B via transformers.js/WebGPU and is authoritative for the candidate list and its bit costs, signing each step back to a PartyKit Durable Object. The server is authoritative for tapes (dealt server-side, never sent whole to any client), turn order, claims, and scoring. Model: `{ tapes: {pid: bits[]}, cursor: {pid: idx}, sentence[], spentBits, claims[], foreman }`.

Phones receive only a 2-pair window from their own tape via a per-player channel — the window is the entire private-information design, so leaking a full tape in a broadcast payload kills the game outright.

The hard part is that the model lives on an untrusted-ish client (the host tab) while the tapes live on the server, and both must agree on the same four candidates at the same instant. Fix: the server requests the step, the host returns a candidate set plus costs, the server freezes it and only *then* resolves the tape pair. Any host reload mid-round must replay the sentence deterministically (greedy top-4, fixed seed, temperature 0) or the ranks silently shift under everyone's claims.

## v1 scope

- Exactly 4 players, one seeded sentence stem, 10 turns
- 20-bit tapes, 2-pair private lookahead
- One free-text-free claim widget (four buttons: 00/01/10/11)
- Fixed 30-bit ceiling, no difficulty settings

## Out of scope

Multiple rounds, variable player counts, tape-trading, any mechanism that lets you verify a claim early, sound, avatars.

## Done means

Four phones each hold a distinct hidden tape; a full 10-turn sentence completes with claims rendered on the TV before each spend and the true pair revealed after; the budget bar busts or clears correctly; and in playtest at least one player is spent on the strength of a claim that turns out to be a lie.
