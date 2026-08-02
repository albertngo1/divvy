## Overview

Shorthand is a 4–6 player game where a tiny in-browser LLM is not the judge but the *opponent*. You are trying to write something a specific human in the room can finish and the model cannot. Every word your reader guesses correctly pays out its surprisal under the model — so obvious words are worth nothing and only weird-but-shared language scores.

## Problem

"Guess what your friend wrote" games reward the lowest common denominator: everyone converges on the safest phrasing and the guessing is trivially easy. There's no pressure toward the actual joy of a group with shared history — the private references, the running bits. Pricing each correct guess by model surprisal fixes that in one stroke: predictable writing is literally worth zero.

## How it works

**Host screen:** one stem — "The worst part of the airport is" — and nothing else during the writing phase.

**Phase 1 (private, 60s).** Every phone shows the stem and a box for exactly **five words**. Everyone writes simultaneously.

**Phase 2 (private, 60s).** The server computes a derangement: each player is secretly assigned one *other* player to read. Your phone shows the stem plus **only the first two words** of your target's continuation, and asks for the remaining three. You are never told who wrote it during the guessing — you are told after. The host screen shows only "3 of 4 readers have locked in."

**Scoring.** In parallel, the model computes per-token surprisal of each true continuation, conditioned on stem + first two words. For each of the three hidden words, if the reader's guess matches (case/lemma-insensitive), **the author and the reader both bank that word's surprisal in bits.** A word the model would have predicted anyway pays ~0.3. A word the model finds shocking that a friend still nails pays 9+.

**Reveal.** The host screen shows each continuation word-by-word: guessed words light up sized by their bit value, missed words go grey with their forfeited value ghosted underneath. The biggest single-word payout gets called out by name. The strategic lesson lands instantly: "nobody" was worth nothing, "my mother's" was worth eleven.

## Technical approach

Host tab + phone PWAs + authoritative WebSocket server (PartyKit or Socket.IO over Tailscale Serve). Model: distilgpt2 (q8, transformers.js) in the host tab only.

Data model: `Round{stem, submissions: {playerId → {text, tokens, surprisals}}, assignment: playerId → targetId, guesses: {readerId → [w1,w2,w3]}}`. The assignment is a server-side derangement generated after all submissions lock — never earlier, never sent to anyone but the reader, and each reader gets a *different* two-word prefix.

Sync is easy here (two barrier phases, no live streaming); the hard parts are elsewhere. **(a) Matching:** "mom's" vs "my mom's" vs "Mom" — v1 does lowercase + strip punctuation + a tiny stem list, and shows the raw comparison at reveal so the room can overrule. **(b) Word-to-token alignment:** surprisal is per BPE token; a word must sum its subword tokens, including the leading-space variant. Get this wrong and the payouts are nonsense. **(c) Prefix leakage:** the two-word prefix must be sent to exactly one socket.

## v1 scope

- 4 players, one stem, one round, no rematch
- Exactly 5 words in, exactly 3 guessed
- Exact-match-after-lowercasing only; no fuzzy matching
- Host-side reveal is a static list, no animation
- Derangement via naive reshuffle-until-valid

## Out of scope

Stem packs, teams, multi-round totals, reader-choice, synonym credit via embeddings, spectator mode, reconnect.

## Risks & unknowns

Three-word exact match may be brutally hard — if the average round scores zero the game is dead; the fallback is 2 hidden words, or partial credit for word 1 alone. distilgpt2's surprisal on a 7-token context is noisy and may over-reward typos. Groups without shared history may find the whole thing unwinnable.

## Done means

Four phones write, four different two-word prefixes go to four different readers, and the host reveal shows at least one correct guess whose bit-value visibly dwarfs another correct guess in the same sentence.
