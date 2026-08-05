## Overview
Priced In is a 3–5 player word game for a room with a TV and phones. Players build one sentence together, one word at a time, but every word has a live price measured in bits of surprisal from an 82M-parameter GPT-2 running entirely in the host browser tab. The model's next-token distribution is not flavor text — it is the economy, the scoreboard, and the referee.

## Problem
"AI party games" mostly use a model as a novelty oracle you ask a question and laugh at. Perplexity is far more interesting than that: it is a continuous, adversarial, *contextual* price signal that every player can manipulate by changing the sentence. Nobody has made it a resource. Meanwhile most such games are one-phone-passed-around, so the second phone is decoration.

## How it works
The host tab loads distilgpt2 and shows a seed stem on the TV: *"The night before the wedding, Dana finally admitted that the"*.

Each phone privately receives a HAND of 4 words, drawn from the model's single-token vocabulary (filtered to readable nouns/verbs/adjectives).

Every turn (12 turns = 12 words):
- **PRIVATE, on your phone:** your 4 cards, each with a live PRICE IN BITS — that word's surprisal given the current sentence. Prices re-compute every turn. You see nobody else's hand or prices; your price list is genuine private knowledge about the model's state.
- **PUBLIC, on the TV:** the sentence so far, a bit-meter, scores.
- All players secretly submit one card, simultaneously, 15-second timer.
- The server appends the **lowest-surprisal** submission — the model takes the continuation it finds most natural — and awards that player points equal to that word's surprisal. Everyone else keeps their card.

The whole game lives in that contradiction: to win the slot you must be the most predictable player; to score you must be the most surprising. You are hunting the highest bid that is still the lowest bid. And because prices move with the sentence, half the play is spending a boring cheap word now to drag the context toward the absurd card you're holding for turn 9.

The TV then reveals the losing candidates — "what almost happened" — which is where the laugh is.

## Technical approach
Host browser tab = the only inference site (phones never download a model; no cross-device float divergence). transformers.js + ONNX WASM, distilgpt2. Authoritative Socket.IO server over Tailscale Serve; server holds room state, host tab is a privileged client that publishes prices and consumes submissions.

Key trick: **one forward pass on the current prefix yields logits over the entire vocabulary**, so a single pass prices every player's whole hand at once — surprisal = −log2 softmax(logits)[token]. That is ~80ms on a laptop, once per turn, regardless of player count. Constraining hands to single-token words is what makes this exact and free.

Data model: `Room{seed, prefixTokenIds[], turn, players[]}`, `Player{id, hand:[{tokenId, word}], score}`, `Submission{playerId, tokenId, turn}`. Sync: turn-locked, not real-time — server closes submissions on timer or when all in, host scores, broadcasts `{appendedToken, winnerId, bits, losers[]}`, then pushes each phone a *personalized* `prices` message. Hard part: strict privacy of the price vectors (per-socket payloads, never a broadcast), and handling a tie or a no-submit timeout without stalling the sentence.

## v1 scope
- 3 players, one round, one 12-word sentence, one hardcoded seed stem
- Hands of 4 single-token words from a 300-word curated pool
- Simultaneous submit, lowest-surprisal wins slot, scorer gets the bits
- TV: sentence, running scores, losing-candidate reveal
- Phone: your 4 cards with live bit prices, tap to submit, locked state

## Out of scope
- Multi-token words, drafting/redrawing hands, multiple rounds
- Reconnect, spectators, audience play, persistent profiles
- Model choice, temperature, any generation at all (scoring only)

## Risks & unknowns
- The reverse-auction logic ("win by being boring, score by being weird") may take a full round to click; may need the TV to show the *rule* as a one-line reminder each turn.
- distilgpt2's tokenizer means many common words are multi-token; the curated pool must be built offline and sanity-checked.
- Play could be quiet and cerebral. The losing-candidate reveal is the designed comedy valve; if it doesn't land, the game is flat.
- Prices may be so dominated by function words that hands feel samey.

## Done means
Three phones join a room; each sees four words with different bit prices that visibly change after every turn; twelve turns produce one complete sentence on the TV; the player who won each slot is credited exactly the surprisal the host computed; and at least one table in playtest audibly reacts to a losing-candidate reveal.
