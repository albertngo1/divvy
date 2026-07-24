## Overview
Register is a concurrent-room party game for 3–6 players where every phone privately authors a single sentence and the score is the *gap* in how surprised a small in-browser LLM is by that same string under two different hidden framings. It's for word-nerds who love that a phrase can feel native in one voice and alien in another.

## Problem
Most LLM-perplexity party games reward one thing: fluent or weird. The itch here is register — the felt truth that 'the moon spills soft over the sleeping town' is butter in a bedtime story and nonsense in a court filing. Nobody's turned that context-dependence into a competitive lever.

## How it works
The host TV shows two framing prompts for the round, e.g. Prompt A = "A children's bedtime story:" and Prompt B = "Section 4 of a commercial lease:". Everyone sees both. Each phone PRIVATELY composes one sentence (≤14 words) and submits, blind to everyone else. The host prepends Prompt A to your sentence and scores its perplexity with distilgpt2 (transformers.js), then does the same with Prompt B. Your score = PPL_B − PPL_A: you want your string to flow perfectly as a bedtime line yet detonate as legalese. The host reveals a ranked leaderboard of gaps, showing each sentence with its two perplexity numbers and a little diverging bar. Highest legal gap wins the round.

PRIVATE per phone: your draft sentence and live character count. SHARED on host: the two framing prompts, a countdown, and — only at reveal — every sentence with both scores. Simultaneous blind authoring is the whole game; if one phone were passed around, players would copy each other's register tricks and the tension dies.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: Room{roomId, promptA, promptB, phase, deadline}, Player{id, name, draft, submitted, scoreA, scoreB, gap}. Phones stream nothing but a final submit; the host owns scoring. distilgpt2 runs in the host tab; scoring N≤6 short strings ×2 framings is well under a second. Sync is trivial (submit → server collects → host scores serially → broadcast leaderboard). The genuinely hard part is prompt-pair calibration: pairs must be far enough apart in register that skill separates players, so v1 ships 5 hand-tuned pairs validated to produce a wide gap spread on test sentences.

## v1 scope
- One round, one fixed prompt pair.
- 3–6 players, phones join by room code.
- 14-word cap, blind submit, host-side distilgpt2 scoring.
- Ranked reveal with both PPL numbers + winner.

## Out of scope
- Multiple rounds / cumulative scoring.
- Player-authored prompt pairs.
- Grammar/plausibility gating.
- Any second model or bigger LLM.

## Risks & unknowns
- Degenerate strategy: gibberish scores high PPL under BOTH framings, so the gap stays small — but needs playtest confirmation the A-fluency constraint truly bites.
- Prompt pairs may reward one obvious archetype (rhyme vs jargon) and get solved.
- distilgpt2 register sensitivity might be weaker than hoped on 14-word strings.

## Done means
3 phones join, each submits a sentence blind, the host prepends both prompts, scores each string twice with distilgpt2, and shows a correctly-ranked gap leaderboard with a clear winner — in under two seconds after the last submit.
