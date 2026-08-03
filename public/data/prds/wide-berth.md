## Overview

A 3–6 player living-room game where one shared, tiny in-browser LLM writes a single paragraph on the TV while every player has secretly banned one token from its vocabulary. The model's contortions are the entertainment; the divergence those contortions cause is the score. For groups who like Codenames-adjacent inference but are tired of clue-giving.

## Problem

LLM party games mostly use the model as a joke generator or a judge. Nobody has made the model's *internal distress* the playable surface. There's a real, funny, legible signal — a language model routing around a forbidden word writes like a hostage — and it maps perfectly onto hidden-information play.

## How it works

1. Host screen shows a story seed: *"The detective opened the door and…"*
2. **Privately, simultaneously**, each phone picks ONE word from a curated 300-word list (common nouns, verbs, function words, spanning frequency tiers). Nobody sees anyone else's pick.
3. Server generates ~80 tokens from the seed, applying every player's ban as a `-inf` logit bias on that word's token IDs at every step. One generation, all bans live at once.
4. **Host screen (public):** the text streaming out, plus one unattributed "strain" gauge showing total distortion. That's all.
5. **Each phone (private):** your own live *bite meter* — how much probability mass your ban is stealing right now — and your **ghost token**: the word the model would have emitted this step if only your ban were lifted. You alone know the road not taken, and it's usually hilarious.
6. Scoring: at each step compute `KL(p_banned ‖ p_unbanned)` and attribute it to whichever single ban removed the most mass. Bite points accrue privately.
7. **The inversion:** after generation, the room debates and each phone privately submits guesses at the other players' banned words. Any ban correctly named by a majority scores **zero**. Common words bite enormously but leave a screaming hole; rare words are invisible and worthless. The whole game is finding the frequency sweet spot.

## Technical approach

Host tab runs the model (WebLLM / transformers.js, Qwen2.5-0.5B-Instruct q4) and is the only generator. A PartyKit Durable Object is the authority for room state, ban submissions, and scores — phones never touch the model. Data model: `Room{seed, phase, players[]}`, `Player{id, ban:tokenIds[], bite:number, guesses[]}`, `Step{idx, token, kl, attributedTo}`.

Sync: phones submit bans → DO locks the set → DO tells host to generate → host emits one `step` message per token (token text, per-player KL vector, per-player ghost token) → DO fans out **filtered** payloads, so each phone receives only its own slice. That filtering is the whole security model and must live server-side; a naive broadcast leaks every ban instantly.

The genuinely hard part: token-level attribution is noisy when two players ban words in the same semantic neighborhood, and multi-token words (a ban must cover ` dog`, `dog`, `Dog`, ` Dog`) need careful tokenizer expansion at pick time.

## v1 scope

- One seed, one 80-token generation, one round
- 4 players, fixed 300-word ban list (no free text)
- Bite meter = a single number, no chart
- Ghost token shown as plain text on your phone
- One guessing phase, majority = zeroed

## Out of scope

Multiple rounds, free-text bans, phrase bans, per-player seeds, audience mode, model choice, persistent scores.

## Risks & unknowns

A 0.5B model may just produce mush that's funny regardless of bans, killing the signal. Ban-list frequency tiers need real tuning or every player picks "the". Generation must stay under ~15s on a laptop GPU or the table goes quiet.

## Done means

Four phones each ban a word; the TV streams one paragraph containing none of them; each phone shows a bite number and a ghost token nobody else can see; the room correctly names at least one ban and that player's score drops to zero — all without a page reload.
