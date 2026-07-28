## Overview
A 5-minute party game for 3–5 people with a TV and phones. Each player gets a secret word. You privately write a short prompt into a tiny language model running in the host's browser tab. The room never sees your prompt — the room sees only the model's probability distribution over the *next* word, drawn as a five-bar chart. Your job: make the model point directly at your word without ever letting it say the word.

## Problem
Every LLM party game so far uses the model as a *generator* (Quiplash with a bot) or a *judge* (rate this answer). Nobody plays the posterior. The next-token distribution is the strangest, most alien object in a language model, it's completely free to compute, and — this is the bet — humans get *good* at reading it after about ninety seconds. It also needs no API key, no cloud, no per-round cost, and no latency: an 82M-parameter model does a forward pass in ~15ms in a laptop tab.

## How it works
**Setup.** Host tab loads distilgpt2 (int8, ~50MB) and shows a 4-letter room code. Each phone joins and privately receives one target from a 40-word concrete-noun list (SYRINGE, ANCHOR, PIÑATA…).

**Compose — 90s, everyone at once.** Your phone shows: your target, a text box capped at 12 words, and a live private readout. As you type, debounced at 400ms, your phone displays *your* current top-5 tokens with probabilities and the distribution's entropy in bits. You iterate against this oracle — "The nurse tore open the sterile pack and lifted the" → is the model looking at SYRINGE-shaped space, or has it collapsed onto "lid"? Nobody else sees this. Ever.

**Reveal.** The TV shows N anonymous panels — just five horizontal bars each, tokens labeled, entropy printed underneath. No prompts, no names.

**Guess — 60s, simultaneous and private.** Each phone lists the panels that aren't yours; you type one guess per panel. Simultaneous and private matters: spoken guesses would let everyone free-ride on the first confident person.

**Score.** +2 for every player who decodes your panel, +1 for each panel you decode. **Automatic zero** if your target — or any token sharing its first four characters — appears in your top-5. Too literal. Ties break toward lower entropy: the crispest pointer wins.

The craft is building a funnel that stops exactly one token short.

## Technical approach
PartyKit Durable Object per room. State: `{phase, order, players: {id, name, target, draft (server-only), locked, panel}}`.

The host tab is the *only* inference site — a privileged WS client holding transformers.js. Phone keystroke → 400ms debounce → `preview` → server → host → forward pass → `{top5, entropyBits}` → routed back to **that socket only**. At most one in-flight preview per player; stale requests dropped. Five players at 2.5 req/s is ~12% of the host's budget.

No model on phones at all. That kills the two obvious failure modes outright: no 300MB download over a guest's LTE, and no quantization/tokenizer drift making your private preview disagree with the authoritative panel. Reveal reuses the cached result keyed by `(playerId, promptHash)`, so the panel is byte-identical to the last preview you saw.

Hard parts: keeping previews strictly unicast (one broadcast bug leaks the whole game), and displayable top-5s — see risks.

## v1 scope
- 3 players, exactly one round
- One 40-word noun list, one model, no packs
- Host = laptop Chrome; phones = a plain mobile web page, no install
- Final scoreboard as plain text
- Bars are CSS divs; no animation

## Out of scope
Teams, multiple rounds, spectators, custom word packs, mobile-side inference, rejoin mid-phase, i18n, model selection, persistent profiles.

## Risks & unknowns
1. **Top-5 may be all function words** — "the", ",", " a" dominating makes panels unreadable. Mitigation: filter the displayed top-5 to alphabetic tokens with a leading space, report true entropy separately. Needs a scripted check before any UI is built.
2. **Is it solvable, or is it noise?** Unknown until three humans try. This is the make-or-break.
3. distilgpt2 is dumb; the funnel may not aim reliably.
4. 12 words may be too tight.

## Done means
Three phones in one room. Each composes privately with a live top-5 that provably never appears on the TV or another phone (verified by watching the WS frames). The TV shows three anonymous bar charts with entropy. Guesses land privately. The four-character literal-token disqualifier fires on a deliberate test. And in a real playtest, at least one panel is decoded correctly by a majority of the table.
