## Overview
Sway is a hidden-influence party game for 3-6 players. There's one shared fill-in-the-blank stem, but each player is secretly assigned a *different* target word they want the model to predict there. Everyone writes a short priming passage; the passages are merged into one context, and the model's next-token distribution becomes a battleground nobody can fully see.

## Problem
'Coax'-style games are single-player steering: you alone nudge the model. The unexplored itch is *collision* — many people invisibly pulling one probability distribution in different directions at once. You never know how much the others diluted your influence, which turns priming into blind poker.

## How it works
Host TV shows a shared stem: "When I opened the fridge, I found ___."

Each phone PRIVATELY shows one secret **target word** (e.g. leftovers / regret / gravel / sunshine) and a text box. You write a 1-2 sentence priming passage meant to steer the model toward *your* word without naming it. You cannot see anyone's target or text.

The host concatenates all passages in a **shuffled, hidden order**, appends the stem, and runs distilgpt2 once to get the top-K next-token distribution. Your score = the probability mass (or inverse rank) your target word received. The host TV reveals the final ranked distribution and reads the assembled Frankenstein context aloud — the comedy is passages about gravel and sunshine mashed together. Since order and others' targets were hidden, you learn only afterward how badly you were crowded out.

Bonus deduction phase: each phone privately guesses which player was pulling for the model's #1 predicted word; correct guesses score a point.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket room (PartyKit / Durable Object or Socket.IO over Tailscale Serve). The model runs **on the host** (single canonical inference on the merged context — every phone must see the same distribution). Data model: `Room{stem, order[](hidden)}`, `Player{id, target(private), passage(private), score}`. Sync: phones upload passages; server locks, shuffles, runs one inference, broadcasts the distribution + per-player mass. The genuinely hard part is *steerability* — distilgpt2 on a few short sentences may barely move the blank; mitigate by picking stems with wide, easily-nudged distributions and by targeting *ranking* rather than raw probability. Assigned targets should be pre-vetted to appear plausibly in the model's top-100 for the stem.

## v1 scope
- One stem, one round, one host-side inference.
- 3-6 players, each a distinct pre-vetted target word.
- Score by target's probability mass; single reveal.
- One bonus "who pulled #1?" guess.

## Out of scope
- Multiple rounds, running totals, custom stems.
- Player-chosen targets (curated pool only in v1).
- Anti-cheat on passages naming the target directly.

## Risks & unknowns
- Model too weak to steer meaningfully → flat, luck-driven scores.
- Passages that literally contain the target trivialize it (may need a soft ban).
- Merged-context length blowing the model's window with 6 players.

## Done means
Three phones each get a different secret target, submit priming passages blind, and the host runs one inference on the shuffled merge that produces a ranked distribution with a clear per-player mass breakdown and a working 'who pulled #1?' guess — one room, one round, end to end.
