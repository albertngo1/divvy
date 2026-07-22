## Overview
Corner is a 3–6 player concurrent-room game about backing a language model into a corner. Each phone privately writes a short sentence stem ending in a blank, aiming to make the model's next-token distribution as *narrow* as possible — one nearly-inevitable continuation — and simultaneously predicts that continuation. It's for word-lovers who like the meta-puzzle of engineering certainty into language.

## Problem
Every other entropy game rewards chaos — maximize surprise, spike the perplexity. Corner inverts the whole theme: the skill is manufacturing *inevitability*. Writing "The opposite of hot is ___" corners the model onto "cold"; writing "My favorite thing is ___" leaves it hopelessly open. That's a genuinely different muscle, and it's satisfyingly hard: you must both trap the model AND prove you saw the trap coming.

## How it works
Each phone privately shows a stem editor and a separate "your prediction" field. You write, e.g., stem = "Roses are red, violets are ___" and prediction = "blue." Phones never see each other's stems during writing — simultaneous, blind, private. On submit, the host runs distilgpt2 (transformers.js) on each stem, computes the **Shannon entropy** of the next-token distribution (low entropy = well-cornered) and checks whether the model's argmax token matches your prediction.

Scoring rewards both: `score = predictionCorrect ? (maxEntropy - stemEntropy) : 0`. You only cash in your low-entropy trap if you actually predicted the model's top word — so you can't just spam clichés blindly; you must *know* where you cornered it. The host TV reveals a leaderboard of stems sorted by entropy, each shown as a little "how trapped was the model" meter, with a ✓/✗ for the prediction and the model's actual top-3 words displayed so the room sees near-misses ("you said 'blue,' model wanted 'blue' at 91% — nailed it" vs. "you said 'happy,' model said 'fine'").

## Technical approach
Host tab loads distilgpt2 via transformers.js; authoritative room state lives in a PartyKit / Durable Object (or Socket.IO over Tailscale Serve). Data model: `{ roomCode, phase, players: { id, name, stem, prediction, entropy, argmax, correct, score } }`. Phones are PWA clients sending only `{type:'submit', stem, prediction}`. The genuinely hard part is scoring fairness: entropy is computed over the full softmax, but must be normalized (e.g. truncated to top-k mass or temperature-fixed) so absurdly short vs. long stems compare fairly, and prediction matching must resolve the human-typed word to distilgpt2's BPE argmax token (leading-space handling, case-folding). Privacy is server-enforced: no stem leaves the host until the single reveal broadcast.

## v1 scope
- One round, 3–6 players.
- distilgpt2, single next-token entropy + argmax match.
- Prediction match = normalized string equals model's #1 token.
- Host TV: entropy-sorted leaderboard with trap-meters and top-3 reveal.

## Out of scope
- Multi-round play / totals.
- Multi-token predictions or completions.
- Semantic/synonym-tolerant prediction matching.
- Difficulty handicaps for stem length.

## Risks & unknowns
- Entropy normalization across differing stem lengths is fiddly; a fixed top-k mass may be needed.
- Strict argmax matching can feel harsh when the model's #1 and #2 are near-ties — may soften to "top-2 counts."
- Players may all reach for the same tired clichés ("violets are blue"); a one-shot demo + a soft novelty nudge helps.

## Done means
Three phones privately submit a stem + prediction; the host correctly computes each stem's next-token entropy with distilgpt2, awards points only when a player's prediction matches the model's argmax, ranks the tightest-cornered stem first on the TV with visible trap-meters, and the room can see at least one satisfying exact prediction hit — all resolved in one reveal within ~3 seconds of the last submit.
