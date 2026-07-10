## Overview
Morning Line is a model-the-model prediction party game for 4–6 players (shared TV + private phones). You write a completion to a shared stem, then privately bet on how the in-browser model will rank *everyone's* completions by surprise. Half the game is your prose; the other half is guessing the alien taste of a tiny language model.

## Problem
Every perplexity game so far asks you to optimize your own output against the model. Morning Line flips the axis: the interesting skill is predicting the *scorer*. A distilgpt2 finds different things surprising than you do — and forcing players to build an intuition for that, blind and simultaneously, is a fresh itch that a single passed-around phone can't create.

## How it works
Host TV shows a shared stem: e.g. "The last thing I expected to find in the fridge was ___." Each phone PRIVATELY shows a text box; everyone completes the stem blind (no one sees others' text). 

Phase 2: the host displays all completions on the TV, anonymized and lettered A–E. Each phone PRIVATELY shows the same lettered list as draggable cards and asks: "Order these from what the model finds LEAST surprising (flattest) to MOST surprising." Every player submits a full predicted ranking, blind and simultaneous.

Phase 3: the host runs distilgpt2 over each completion, reveals the true perplexity order, and scores two ways: (a) a Writing bonus if YOUR completion landed inside a target band the host announced up front (not too flat, not too wild), and (b) a Bookie bonus = points for how closely your predicted ranking matched the model's actual ranking (Kendall-tau / adjacent-swap distance). Highest combined total wins.

## Technical approach
Host tab is authoritative scorer with distilgpt2 (transformers.js). Phones are PWA WebSocket clients (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{code, stem, targetBand, submissions{pid→text}, predictions{pid→orderedIds}, trueOrder[]}`. Sync: server drives WRITE → PREDICT → SCORE phases; text and predicted orders are private writes never echoed until their reveal. Hard part: anonymizing completions consistently (stable letter↔player map held only server-side), and ranking-distance scoring that feels fair when the model produces near-ties — round perplexities into buckets so a hairline gap isn't punished as a full inversion.

## v1 scope
- 4–6 players, one stem, one round
- One text box per phone, then one drag-to-rank per phone
- distilgpt2 perplexity on host; adjacent-swap distance scoring
- Single combined-score reveal screen

## Out of scope
- Multi-round matches, persistent scores, prompt decks
- Weighting/handicap systems, wagering chips per prediction
- Tie-break UX polish beyond bucket rounding

## Risks & unknowns
- Ranking 5 short sentences by a tiny model may be too random to predict, making Bookie points feel like luck — needs tuning of stem style and player count.
- Drag-to-rank on small phones must be thumb-friendly.
- Two scoring axes may confuse first-timers; the reveal must teach itself.

## Done means
4 phones join, all submit blind completions, the host shows an anonymized lettered list, each phone submits a private full ranking, and the reveal displays true model perplexity order plus each player's combined Writing + Bookie score with a clear winner.
