## Overview

A 3-4 player competitive storytelling game where nobody writes. Each beat, a small local model proposes four possible next fragments; every player secretly **strikes one**, and the least-struck fragment gets appended. Each phone privately holds a secret **voice card** — a short prefix like *1950s insurance adjuster* or *nature documentary narration* — and privately sees how cheap each of the four candidates is under that voice. You win by dragging a story you never authored toward a register only you can see, using nothing but deletion.

## Problem

Every LLM party game asks players to type cleverly, which means it's a writing contest and the fast typist wins. Purely subtractive agency is almost unexplored, and it's socially delicious: you can't build, you can only starve the options you hate, and everyone else is doing the same thing blind. It also matches how people actually feel about generative text — you don't compose it, you veto it.

## How it works

**Host screen (TV)** shows the story-so-far and, each beat, four candidate fragments (4-7 tokens each) numbered 1-4, sampled from distilgpt2 with high temperature. It shows no probabilities, no strike counts until resolution, and never any player's voice card.

**Each phone privately shows** the same four candidates, but annotated with a private thermometer per candidate — bits of surprisal of that fragment computed under `[your secret voice prefix] + story-so-far`. Candidate 3 may read "warm" on your phone and be freezing on everyone else's. Each player taps exactly one candidate to strike, simultaneously, on a 15-second clock.

Resolution: candidates are ranked by strike count; the least-struck survives and is appended. Ties are broken by the base model's own likelihood. The TV shows only the survivor and a mute "struck" X over the dead ones — never who struck what.

After 10 beats, the finished story is scored under each player's voice prefix. Lowest mean perplexity wins. Then all voice cards are revealed and the room argues about who was obviously the *insurance adjuster* the whole time.

## Technical approach

Host tab runs `transformers.js`/distilgpt2 and does all inference. Per beat: one sampling call for four candidates, then 4 × N_players scoring passes (candidate conditioned on each private voice prefix) — small, but the KV cache for each player's prefix+story must be kept warm per player to stay inside the beat clock.

Authoritative PartyKit / Durable Object room. Data model: `Room { story[], beat, candidates[{text, logprob}], players[{id, voiceCardId, strike, private: {bitsPerCandidate[]}}] }`.

Hard part: the private thermometers must be pushed per socket (`viewFor(playerId)` strips every other player's `private` block) *and* strike counts must be hidden until all strikes land — a partial-tally leak turns the game into follow-the-leader. Also, simultaneous-strike resolution needs a real deadline: late strikes are dropped, not queued, or one slow phone stalls the story.

## v1 scope

- 3 players, 4 hardcoded voice cards, one story, 10 beats
- One fixed story seed sentence on the TV
- Strike-only agency; no abstain, no double-strike
- Final perplexity table + card reveal

## Out of scope

- Writing or editing any text; multiple rounds; audience play
- Spending strikes as currency, saving strikes across beats
- Custom voice cards, model choice, story packs

## Risks & unknowns

- With 3 players and 4 candidates, strike counts are usually 0/1 and ties dominate — tie-break rules may end up deciding the story more than players do
- distilgpt2's high-temperature candidates may all be equally incoherent, making thermometers meaningless noise
- Voice cards may be too similar in effect; needs cards that genuinely diverge on common words

## Done means

Three phones each show the same four candidates with visibly different private bit readings, all three strikes land inside 15s, the TV appends exactly one survivor per beat with no attribution shown, and after 10 beats the host displays a per-voice-card perplexity table that a human can sanity-check against the story's actual register.
