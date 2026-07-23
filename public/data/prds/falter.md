## Overview
Falter is a no-writing prediction party game: an in-browser LLM (distilgpt2 via transformers.js) generates a short continuation from a shared seed, and each player privately bets on which single token in that not-yet-revealed sentence will carry the highest surprisal — the model's moment of maximum hesitation. It's for 3–6 people and rewards an intuition for where language models get uncertain (after commas, at content nouns, at the first word of a new clause). The whole round is fast, tactile, and reading-heavy rather than typing-heavy — a deliberate change of pace from the theme's writing games.

## Problem
Every other perplexity game makes you produce text. That's great but samey, and it excludes people who freeze at a blank text box. Falter flips the lens: nobody writes, everybody forecasts the machine's own doubt. The itch is meta — you're not being judged by the model, you're judging where the model will trip.

## How it works
The host TV shows a seed sentence (e.g. "The scientist opened the box and found") and announces the continuation will be exactly 8 tokens, positions 1–8. Each PHONE privately shows the seed, eight tappable position slots, and asks: "Which position will the model find MOST surprising?" You secretly tap one slot (optionally a second, half-value hedge) within a 20s timer. Phones do NOT reveal picks to each other.

At lock, the host greedily generates the 8 tokens with a fixed seed, recording per-token surprisal (−log2 p). The TV then animates the sentence appearing word by word with a rising surprisal bar over each, freezing on the true peak. Your score = the surprisal value at YOUR picked position (so a spiky-but-not-max pick still pays), with a bonus for hitting the exact argmax. Highest total wins the round.

Simultaneous private position-bets are load-bearing: the fun collapses if picks are made aloud or in sequence (later players copy earlier ones), and a single shared phone can't hold everyone's hidden bets at once.

## Technical approach
Host browser tab runs transformers.js (distilgpt2) as the authority, generating greedily/deterministically so the surprisal profile is reproducible. WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve) holds `{seed, length, picks:{playerId:{pos,hedge}}, profile, phase}`. Phones send only `{pos}`; the host owns generation and scoring. Genuinely hard part is less latency (one 8-token generation) and more determinism: pin the sampling to greedy/argmax with a fixed RNG seed so the revealed profile can't drift between the play and reveal phases, and pre-warm the model during the lobby.

## v1 scope
- One round, 3–6 players.
- Fixed seed sentence from a small curated deck; fixed 8-token greedy continuation.
- One secret position pick per phone (hedge optional but can ship later).
- Score = surprisal at picked position + argmax bonus.

## Out of scope
- Multiple rounds, cumulative scoreboard.
- Player-authored seeds, variable lengths, temperature choices.
- Confidence-weighted staking beyond a single hedge.

## Risks & unknowns
- Greedy generation can be boring/flat for some seeds; deck needs curation for spiky profiles.
- Token-vs-word alignment: subword tokens may confuse the position mapping — display model tokens, not whitespace words.
- Very short surprisal spread makes picks feel like coin flips; may need a minimum-variance seed filter.

## Done means
Five phones each lock one secret position within 20s, the host deterministically generates and reveals an 8-token surprisal profile word by word, and each player is scored on their picked position's surprisal with the argmax-hitter bonus applied — same seed producing the same profile every time.
