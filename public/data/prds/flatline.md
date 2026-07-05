## Overview
Flatline is a 4-6 player concurrent-room word game for party nights where the scoring engine is literally a small language model's *surprise*. A tiny GPT-2-class model runs in the browser; each player is secretly assigned one awkward mandated word and must bury it inside a sentence so ordinary the model barely flinches. Lowest perplexity wins the round. It's for word-game people who are tired of games that only reward the loudest joke.

## Problem
Every LLM party game so far uses the model as a *generator* — it writes the funny thing, players react. Nobody scores against the model's own felt experience of language. And party word games reward flamboyance; there's no game that rewards deliberate, surgical blandness. Flatline inverts both: you're trying to be *invisible* to an AI while carrying contraband.

## How it works
The host screen (TV) shows a shared neutral topic ("describe your commute") and a live scoreboard. Each phone PRIVATELY shows one mandated word — everyone's is different (yours: "tarantula"; theirs: "escrow") — and a text box. You write one sentence that (a) is about the topic and (b) contains your secret word verbatim. As you type, your phone shows a private "surprise-o-meter" so you can feel where the model spikes and rephrase to soften it ("On my commute I sometimes think about the tarantula in the terrarium at work").

On submit, the host feeds each sentence to the authoritative model, computes perplexity, and reveals all sentences ranked flattest-to-jumpiest, with per-word surprisal highlighted so the room sees exactly where each landmine detonated. Then a quick bonus: players guess *which word* each person was smuggling — right guesses steal points, so hiding it well matters twice.

## Technical approach
Host browser tab loads `transformers.js` with a small quantized GPT-2 as the single authoritative scorer. Perplexity = exp(mean token NLL) over the submitted string. Phones are PWA clients; a WebSocket server (PartyKit / Durable Object) relays submissions and holds room state: `{players: {id, mandatedWord, sentence, ppl}, phase}`. The private live meter runs the *same* model locally on each phone for advisory feedback only — never authoritative, since device/quantization drift would make scores unfair. The genuinely hard part is that a single ~120MB model must load once on the host and score 4-6 strings in under a couple seconds, plus guarding against degenerate gaming ("the the the tarantula") via a minimum length + a repetition penalty + requiring the mandated word appear exactly once.

## v1 scope
- 1 round, 4 players, 1 fixed topic
- 1 mandated word per phone, drawn from a hardcoded list
- Host-only scoring; phones are just a text box (no local meter yet)
- Reveal screen with per-word surprisal highlight + winner

## Out of scope
- Phone-side live surprise-o-meter
- Multiple rounds / topic decks / target-band scoring
- The "guess the smuggled word" bonus phase

## Risks & unknowns
Small-model perplexity is noisy and can reward gibberish that happens to be low-entropy; needs grammar/length guards. Model load (~20-30s) must be masked by the lobby. Perplexity is hard for players to intuit without the meter, so v1 may feel opaque until the reveal teaches it.

## Done means
Four phones each get a different secret word, submit a sentence, and the host renders a perplexity ranking with highlighted per-word surprisal and correctly names the lowest-perplexity player as winner.
