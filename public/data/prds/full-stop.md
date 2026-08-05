## Overview

A 4-player, one-sentence party game where an in-browser 60M-parameter LM's probability of ending the sentence *right now* is a literal kill-switch. The room co-writes a single sentence, one word at a time; after each word the model computes P(sentence terminates here) and rolls against it. Every phone privately holds a different target length band, so the room is silently split between people stuffing the sentence with clause-openers to keep it alive and people trying to slam the door.

## Problem

Co-writing games (Exquisite Corpse, one-word-at-a-time stories) have no engine — they end when someone gets bored, and everyone is nominally on the same side. There is no tension because there is no clock the players can *feel*. Meanwhile "LLM party game" usually means the model judges your joke. Here the model isn't a judge, it's a hazard function.

## How it works

Host screen shows the sentence so far and one big **CLOSING PRESSURE** bar: P("." | context) as a percentage, updated after every append. It also shows a graveyard of past sentences.

Each turn (12s): all four phones simultaneously type one word. The server picks **one submission uniformly at random**, appends it, and displays it **unattributed**. Then it rolls: with probability P(".") the sentence ends immediately, mid-thought, and the round is scored.

Privately, each phone shows:
- **Your stake card**: a secret length band, e.g. "END ON WORD 9, 10 OR 11." Bands overlap partially and are dealt so at least one player wants an early death and one wants a late one.
- **Your delta**: after each turn, how much *your* word would have moved the pressure bar (whether or not it was chosen). This is your only feedback on how the model reads your ideas.
- Nothing about anyone else's stake, delta, or submitted word.

So "although the man who" is a survival move and "home" is an assassination. Nobody can prove who submitted the word that killed it, because the append is anonymous and random.

Scoring: sentence ends at word N. Each player whose band contains N scores 3; adjacent-by-one scores 1. Then a 30-second accusation phase: everyone points at who they think wanted an early death. Correct guess, +1.

## Technical approach

Host tab loads a small causal LM via transformers.js / WebGPU (distilgpt2 or a 4-bit TinyStories-class model) — the **host is the only inference site**, so all players share one distribution and there is no cross-device numeric drift. Phones are dumb PWA views over a WebSocket (PartyKit Durable Object, one room object).

Data model: `Room { sentence: string[], phase, turn, seed }`, `Player { id, band: [lo,hi], lastDelta }`. Submissions live in a per-turn map the server never broadcasts until resolution.

P(end) = summed probability mass of terminal tokens (`.`, `!`, `?`, `."`, EOS) at the next position — one forward pass over the appended sentence, ~40ms with KV cache reuse. The death roll uses a **server-seeded PRNG**, published as a hash before the round and revealed after, so nobody can accuse the host of fudging it.

The hard part: computing four counterfactual deltas per turn (one forward pass per candidate word) inside the 1.5s reveal window, without stalling the main append. Solution: batch the four candidates into a single forward pass sharing the cached prefix, and send each phone only its own scalar.

## v1 scope

- Exactly 4 players, exactly one sentence, hard cap at word 16 (auto-death).
- Fixed opening stem on the TV ("The night before the wedding,").
- Three stake bands, dealt from a hand-authored deck of six.
- Text-only phones: one input, one submit button, one delta number.
- No accounts, no reconnect, no rematch — refresh to restart.

## Out of scope

Multiple rounds and cumulative scoring; more than 4 players; on-phone inference; word validation or profanity filtering; the accusation phase having any UI beyond four buttons; any animation on the pressure bar beyond a CSS transition.

## Risks & unknowns

A small LM's terminal-token mass may be too flat to feel controllable — if P(".") sits at 4-9% all game, the roll is noise and player agency evaporates. Mitigation: apply a monotone gain curve (temperature on the binary end/continue split) tuned so the observed range is roughly 2%-45%. Second risk: everyone learns that "and" is an immortality button; fix with a rule that the same word cannot be appended twice per sentence. Third: random append selection may feel unfair — playtest against "lowest-surprisal wins" as an alternative.

## Done means

Four phones on the same LAN join by QR code; the room plays one sentence to its death in under four minutes; at least one sentence dies before word 6 and at least one survives past word 12 across five test rounds; the pressure bar visibly and reproducibly rises when a player appends a noun and falls when they append a subordinating conjunction; and in post-game debrief at least two of four players say they deliberately tried to kill or save the sentence.
