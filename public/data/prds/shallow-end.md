## Overview
A 4–6 player Jackbox-shaped game where a small in-browser LLM does one forward pass on a shared sentence prefix, and each phone is handed the model's next-token prediction *from a different layer* of that pass. Early layers are confidently boring (`the`, `a`, `and`, copies of a nearby word) and high-entropy; late layers are semantic and sharp. The room must commit to one next word together, but everybody is arguing from a differently half-baked version of the same thought — and nobody is told how deep they are reading from.

For people who like Wavelength and Codenames but want the hidden asymmetry to come from something real rather than a dealt card.

## Problem
Most LLM party games use the model as a punchline generator or a scorekeeper bolted on afterwards. The genuinely strange fact about transformers — that a prediction *forms gradually* through depth, and the shallow guess is systematically frequency-biased garbage — has never been the toy. It's also a perfect asymmetry engine: it hands each player a private view that is wrong in a *characteristic* way, which is exactly the thing you can learn to detect in your friends.

## How it works
One round:
1. Host screen shows a prefix: *"The landlord returned the deposit, minus a charge for the..."* Nothing else. No distribution, no bar chart.
2. Server runs one forward pass, captures hidden states at every layer, applies the final layer-norm + lm_head to each, and softmaxes. It gets L distributions from one pass.
3. Each phone privately receives ONE layer's view: its top-5 tokens with probabilities, plus its entropy in bits. No layer index. Phones get distinct layers, spread from very shallow to final.
4. 90 seconds of open table talk. You may describe your top-5 out loud, but you may not read probabilities verbatim — that's the house rule the game leans on.
5. Room commits one word by majority vote on the host screen.
6. Before the reveal, each phone privately answers one question: **"Am I shallow, middle, or deep?"**

Scoring, all from the model: the room jointly scores bits saved on the committed word versus a uniform-over-top-50 baseline, under the FINAL layer. Individually, you score for correctly placing your own depth. The deep players want to be believed; the shallow players want to figure out that their confident `the` is an artifact of being four layers in, and say so before the reveal.

Host screen after the reveal: the depth ladder animating — the top-1 token at each layer, in order, so the room watches the sentence's meaning condense out of frequency noise. That animation is the dopamine.

## Technical approach
Host tab + phone PWAs + PartyKit Durable Object as the authority. `transformers.js` runs a ~30M-parameter GPT-2-small-ish or SmolLM checkpoint with `output_hidden_states: true`, **in the host tab** — phones never run inference, they only render a payload.

Data model in the DO: `{roundId, prefix, layerAssignment: {playerId → layerIdx}, views: {layerIdx → {top5, bitsEntropy}}, votes, depthGuesses, phase}`. Phases: `deal → talk → vote → guess → reveal`. Phones subscribe to their own `view` slice only; the DO never broadcasts the full layer map until reveal, so a leaked WebSocket frame can't out anyone.

The hard part is not sync — it's that the logit lens on an untuned model can be mush. Intermediate layers need the final `ln_f` applied before `lm_head` or the top-5 is noise, and even then some checkpoints have a dead zone where layers 3–7 are indistinguishable. Mitigation: an offline prefix-vetting script that scores candidate prefixes by *top-1 disagreement count across layers* and keeps only prefixes where at least three distinct depth-flavors exist. Ship 40 vetted prefixes as a static JSON, not a live model call.

## v1 scope
- One round, one hardcoded prefix, 4 players.
- 4 fixed layer assignments; no shuffling logic.
- Top-5 + bits on the phone; commit-by-vote on the host.
- One shallow/middle/deep self-guess per player.
- Reveal screen: the depth ladder animation and two numbers.

## Out of scope
- Multiple rounds, lobbies, reconnection, avatars.
- Running the model on phones.
- Any model bigger than 50M params.
- Chat, emotes, or a scoreboard across games.

## Risks & unknowns
- The layer-depth flavor may be too subtle for a living room; if layer 6 and layer 11 both say `damage`, the round is dead. The prefix-vetting script is the whole bet.
- 90 seconds may be too long once players learn the shallow tells; may need 45.
- Talking about probabilities out loud may collapse into everyone reading their screen aloud — the house rule needs UI enforcement (probabilities shown as bar lengths, no numerals).

## Done means
Four phones on a LAN, one host tab, one prefix. Every phone shows a different top-5 within 400ms of round start. The room votes, and the reveal shows: bits saved, each player's depth guess versus truth, and the layer ladder. At least two of four playtesters spontaneously say some version of "wait, mine is just function words" before the reveal.
