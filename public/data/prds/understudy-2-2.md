## Overview
Understudy is a hidden-role party game for 4–6 friends on a shared TV plus private phones. One player is secretly the Understudy, tasked with writing the most *predictable* possible answer — the answer a small language model would produce. Everyone else answers honestly. A tiny in-browser LM ranks all answers by how surprised it was, and that ranking becomes the room's evidence.

## Problem
Social-deduction games usually hinge on lying with your face or your alibi. Here the 'tell' is statistical and alien: the model literally measures how machine-like your writing is. The itch is that being *too smooth* now gets you accused — so honest players have to deliberately rough up their own prose, which is a delightfully unnatural act.

## How it works
The host TV shows a shared open prompt: e.g. "Describe a Tuesday morning in one sentence." Each phone PRIVATELY shows the prompt and a text box. One phone (chosen at random) ALSO privately reveals: "You are the Understudy. Write the sentence the AI would autocomplete — bland, expected, low-surprise. Blend in." Everyone else's phone just says "Answer honestly." All writing is simultaneous and hidden.

On reveal, the host runs every submission through distilgpt2 (transformers.js) and displays a leaderboard sorted by perplexity — flattest/most-predictable at top, labeled a neutral "Predictability Meter," NOT "the mole." The room discusses and each phone PRIVATELY votes for who the Understudy is. The Understudy wins if they dodge a majority; honest players win by fingering them. The model's ranking is suggestive but noisy — the flattest answer is often, but not always, the mole, so accusations misfire.

## Technical approach
Host tab loads distilgpt2 via transformers.js and is authoritative scorer. Phones are PWA clients over a WebSocket server (PartyKit / Durable Object, or Socket.IO behind Tailscale Serve). Data model: `Room{code, players[], roundState, understudyId, submissions{playerId→text}, votes{}}`. Sync: server broadcasts phase transitions (WRITE → SCORE → VOTE → REVEAL); submissions and votes are private writes to the server, never echoed to other phones until reveal. Hard part: role secrecy and vote privacy under a single authoritative clock, plus scoring latency — batch all N sentences through one forward pass per sentence on the host and stream a single ranked payload so the reveal feels instant.

## v1 scope
- 4–6 players, exactly one round, one Understudy
- One fixed host prompt, single text box per phone
- distilgpt2 perplexity ranking on the host only
- Private role assignment, private final vote, single reveal screen

## Out of scope
- Multiple rounds / scorekeeping across games
- Multiple mole roles, difficulty tiers, prompt decks
- Anti-cheat against players who paste model output

## Risks & unknowns
- distilgpt2 may rank a genuinely dull human above the mole, making it too swingy — needs playtest tuning of prompt style.
- Players could game it by pasting from a real chatbot; acceptable at party scale.
- Model load time on the host tab must be masked by the lobby.

## Done means
4 phones join, one is privately dealt the Understudy role, all four submit blind, the host renders a perplexity-sorted leaderboard, each phone casts a private vote, and the reveal correctly declares whether the Understudy evaded the majority.
