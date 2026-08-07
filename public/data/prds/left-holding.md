## Overview

Left Holding is a three-minute elimination card game for 4 players. One sentence grows on the TV, one word at a time. Each phone privately holds six word cards. A card is only playable if the model currently ranks it in the top 60 continuations of the sentence so far — so as the sentence paints itself into a corner (*"in the nick of ___"*), most hands go dead. First player who cannot legally play loses, everyone sees their dead hand, round over.

## Problem

Entropy is usually rendered as a score you receive after the fact. Nobody feels a bit. Left Holding turns the model's next-token distribution into a **door that is closing**, and gives you the ability to close it on someone else — the corridor narrowing on the TV is the whole tension curve, and it happens in real time on somebody else's turn.

## How it works

1. **Deal.** 60-card deck of ordinary single-token English words (`hand`, `time`, `of`, `never`, `water`, `mother`, `almost`…). Six cards each, private.
2. **Seed.** TV shows a 4-word opener: *"She had always been"*. Below it, a **corridor bar** — width proportional to the model's entropy at the next slot, in bits. Wide bar = anything goes.
3. **Turn (12s).** In fixed order, the active player taps one card. Your phone shows your six cards with the illegal ones greyed out *live*, updating the instant the previous player commits. Nobody else sees your outs; the TV shows only card counts.
4. **Squeeze.** After each play the host recomputes the distribution. The good move is rarely the funny word — it's the word that collapses the corridor for the person to your left. Playing `nick` after `in the` is a knife.
5. **Bust.** If no card in your hand is in the top 60, you're out. The TV reveals your six dead cards next to the sentence that killed them, plus the final corridor width.

Private per phone: your six cards, your live legality mask, the exact rank of each of your cards. Public: the sentence, the corridor bar, card counts, the bust reveal.

## Technical approach

Host tab runs distilgpt2 (or Qwen2.5-0.5B) via transformers.js. After each committed word the host does one forward pass, takes the top-60 token ids, and computes entropy over the full softmax. It then sends **each phone a mask over only that phone's own hand** — never the candidate list, which would leak the shape of the corridor. Socket.IO server over Tailscale Serve, or a PartyKit DO holding `{deck, hands{playerId: cardId[]}, sentence: tokenId[], turnIdx, entropyBits}`. The server is authoritative on legality; the phone's grey-out is advisory UI that the server re-checks on submit.

The genuinely hard part is BPE alignment, not sync. `time` and `␣time` are different tokens; a card that tokenizes to two pieces has no single rank. v1 sidesteps this by curating the deck offline: every card must be a single token in the target tokenizer with a leading space, verified by a build script that refuses to ship an unaligned deck. Second hard part is the 12s turn clock against ~200ms inference — the host must pre-warm the pass the moment a card is tapped, not on commit.

## v1 scope

- 4 players, one round, elimination on first bust
- 60-card curated deck, hands of 6, no draw, no discard
- One hardcoded 4-word opener
- Top-60 legality threshold, hardcoded
- Corridor bar + card counts on TV; nothing else

## Out of scope

Drawing, multiple rounds, scoring across rounds, a mercy "punt" that appends a comma to reopen the corridor, player-chosen openers, sentences longer than 20 words.

## Risks & unknowns

The top-60 threshold may be far too generous (nobody ever busts) or brutal (round dies in five plays) — needs tuning against a real deck before art. Distilgpt2 may produce corridors that feel arbitrary rather than legible, which kills the "oh no" moment. Deck curation is the design work: too many function words and every hand is always legal.

## Done means

Four phones join, each sees six cards greyed in and out live as the shared sentence grows, the server rejects an illegal play attempted via a stale UI, and a full round reaches a genuine bust in under three minutes — with the losing player having visibly hesitated over a legal-but-suicidal card at least once.
