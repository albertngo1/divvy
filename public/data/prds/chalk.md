## Overview
Chalk is a concurrent-room party game for 4-6 players in which a small in-browser language model IS the house. The shared TV shows a sentence with its last word missing; every player, alone on their phone, privately wagers a pool of chips on what word the model believes comes next. You're not guessing a "correct" answer — you're reading a neural net's mind and betting against your friends' reads of it. For people who like poker-brain distribution-reading crossed with word games.

## Problem
Trivia rewards knowing facts; almost nothing rewards the weirder skill of intuiting a machine's expectations. No party game makes a live language model's probability distribution do double duty as both the answer key and the odds board — and none makes the tension social, where backing the obvious favorite pays nothing precisely because everyone else backed it too.

## How it works
Host shows a stem: "She opened the fridge and grabbed a cold ___." A 20-second private window opens. Each phone shows the stem, a 10-chip budget, and a free-text box: type up to three candidate words and split chips across them (beer×6, soda×3, one×1). Your bets are private — not shown on the TV, not to other phones — until reveal.

At lock the host runs one forward pass through the in-browser model and reads the next-token probability of every word anyone bet on. Payout is parimutuel: a chip on word w returns `P_model(w) / (table's chip-share on w)`. A token the model loves that nobody else backed pays huge; the crowd favorite pays thin; a word the model rates near-zero burns your chips. The host screen animates the model's top-8 bar chart, then each player's chips landing, then the leaderboard.

Private-per-phone is the whole point: if bets were public, or one phone were passed around, the parimutuel bluff collapses into copy-the-leader. Simultaneous hidden allocation is the game.

## Technical approach
Host browser tab loads `distilgpt2` via transformers.js (WebGPU, WASM fallback). Server is a PartyKit/Durable Object room (or Socket.IO over Tailscale Serve) holding authoritative state: `{roomId, stem, phase, players:{id,name,chips,bets:{word:chips}}, revealAt}`. Phones are PWA clients that POST bet objects; the server validates chip totals and withholds bets from broadcast until phase→reveal.

Scoring: the host tokenizes each bet word, takes the probability of its first token given the stem (softmax over logits), and broadcasts a `results` payload. The genuinely hard part is fair free-text scoring — multi-token words, casing, and leading-space tokenization (" beer" vs "beer"). v1 normalizes to lowercase + leading space and scores first-token probability only; the host is authoritative so every client agrees.

## v1 scope
- One stem, one round, 4 players.
- Fixed 10-chip budget, up to 3 words each.
- distilgpt2, first-token probability, parimutuel payout.
- Host reveal: top-8 bar chart + payout table. No accounts, no persistence.

## Out of scope
- Multi-round matches and running scores across stems.
- Multi-token/phrase bets, synonym merging.
- Model selection, difficulty, player-authored stems.
- Reconnect/spectator handling.

## Risks & unknowns
- Tokenization edge cases feel unfair ("why did 'soda' score zero?"). Mitigate with a live "the model knows this word" indicator as you type.
- distilgpt2's favorites may be boringly obvious ("water"/"one"), flattening spread; curate stems that produce high-entropy distributions.
- Forward-pass latency on weak devices — but only the host runs the model, so acceptable.

## Done means
Four phones join, each privately allocates 10 chips, the host runs one distilgpt2 forward pass, and every player sees a payout exactly equal to `P_model(word)/crowd_share`, with the biggest win going to whoever backed the model's high-probability word that fewest others chose.
