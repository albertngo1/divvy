## Overview

Tailwind is a 4-player party game for a host screen plus phones. Everyone sees one open-ended card and privately writes one sentence, blind and simultaneously. A small in-browser LLM then measures, for every pair, how much *one* player's sentence lowers the surprisal of the *other's* — mutual predictability. Nobody is scored on their own sentence in isolation. You are scored on who you turned out to be riding with.

## Problem

Wavelength-style games need a human judge and collapse into "who knows whom best." Perplexity games measure one text against the model's generic prior, which is a lonely, single-player feeling. Tailwind uses the model as a neutral instrument for a genuinely two-body quantity — mutual information between two people's phrasings — so the payoff is social ("you and Dana think identically and neither of you knew") but the ruler is arithmetic and unarguable.

## How it works

**Host screen (public):** the card — deliberately underdetermined, e.g. *"a smell you can't describe"*, *"the worst possible gift"* — a 75-second timer, and four lock-in lights. Nothing else, all round.

**Each phone (private):** the card, a text box (8–15 words), a rule banner ("you may not reuse the card's own words"), and a submit button. Critically, **no meter, no feedback, no sight of anyone else**. The whole game is that you are conditioning on text you will never see.

**Scoring:** for every ordered pair the host computes `Δ(a→b) = bpt(s_b) − bpt(s_b | s_a + " ")` — how many bits per token of b's sentence a's sentence already paid for. Link strength `L(a,b) = min(Δ(a→b), Δ(b→a))`, so a bland freeloading sentence that helps others without being helped scores nothing. Your score is your single strongest link.

**Reveal:** the TV draws all six edges at once as weighted lines, thickest first, then the strongest edge pulses and both sentences fly in side by side. The room reads them out loud.

## Technical approach

Host tab runs quantized distilgpt2 (transformers.js, WebGPU with WASM fallback) and is the sole scorer. Phone PWAs connect through a PartyKit/Durable Object room. Data model: `Room{cardId, phase, deadline}`, `Player{id, name, text, locked}`, `Links{[a][b]: {delta, bpt_alone, bpt_cond}}`. Sync is trivial during writing — text never leaves the phone until lock — so the load is all at reveal.

The hard part is **making Δ fair rather than a length artifact**. Longer, blander `s_a` mechanically lowers almost anything downstream; short `s_b` has high variance because its first token dominates. Mitigations, all needed: strict 8–15 word band enforced client- *and* server-side; per-token normalization; drop the first token of `s_b` from the conditional average (it absorbs the prompt-boundary shock); and a fixed joining separator so tokenization is identical across pairs. All 12 forward passes run in one batch after lock-in — under two seconds.

## v1 scope

- 4 players, one card, one round, one graph, then over.
- 6 hardcoded cards, one drawn at random.
- 75-second timer, auto-submit whatever is typed.
- Word-count enforcement and card-word ban. No profanity filter.
- Host renders the edge graph and names the strongest pair.

## Out of scope

Multiple rounds, team scoring, three-way links, reconnects, spectators, a "guess your best partner before reveal" betting phase, any model larger than distilgpt2.

## Risks & unknowns

The real danger is **lexical degeneracy**: Δ may be dominated by literally repeating a rare word, reducing the game to Just One. The card-word ban helps; if playtests show single-token dominance, cap any one token's contribution to the delta. Second risk: with an 82M-param model, all six links may land within noise of each other, making the graph meaningless — needs an offline sweep over ~50 human sentence pairs before build to confirm the spread exceeds the variance.

## Done means

Four phones join, each writes blind with zero feedback, the host computes a symmetric 4-node link graph, the strongest pair is displayed with both sentences, the numbers match an offline reference implementation to ±0.01 bits/token, and in three playtests of five groups the winning pair is one the room finds surprising at least twice.
