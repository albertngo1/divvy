## Overview
Scion is a 4-player party game where each phone privately cultivates its own branch of a sentence. A tiny in-browser LLM (distilgpt2 via transformers.js) scores every branch by cumulative token log-probability. The TV shows the standings — but never the text. Once per game you may **graft**: abandon your own branch and copy the current leader's branch without ever being shown what it says. From then on you are writing into the dark, guided only by the model's next-token expectations. For groups who like the delicious horror of a public reveal.

## Problem
Every LLM party game shows you your own words. That makes the model a referee you can argue with. Scion takes the text away and leaves only the model's *anticipation* — you navigate a sentence the way a diver navigates silt, by feel. And the itch it scratches: the moment where four mangled sentences hit the screen and everyone learns whose words got welded onto whose.

## How it works
1. Host screen shows a shared 6-word stem: *The night the museum finally closed,*
2. Eight turns. Each turn, all four phones submit **one word** simultaneously, 15s clock.
3. **Phone (private):** your branch's visible text, your cumulative bit-cost, and a live **Top-5 panel** — the model's five most likely next tokens for *your* branch, with probability bars. That panel is the only navigation instrument.
4. **Host (public):** four colored branches shown as ordinal rank only (1st–4th) and word count. No text, no numbers.
5. **Graft:** once per game, tap GRAFT. You inherit the current 1st-place branch's text and score, minus a flat 8-bit penalty. Your composer now reads `▓▓▓ ▓▓▓ ▓▓▓ …` — the inherited words are permanently masked to you. Your Top-5 panel updates to reflect the hidden prefix. The leader is unaffected; grafts are announced publicly (*someone grafted onto 1st*) without naming the grafter.
6. Score = mean log-prob per token. Lowest perplexity wins. Then the TV prints all four sentences in full, with each grafted word highlighted by author.

## Technical approach
Host browser tab owns the model and is the scoring authority; phones are dumb PWA clients. PartyKit Durable Object holds room state: `{branches: [{ownerId, tokenIds[], logprobSum, grafted, maskUpTo}], turn, phase}`. Per turn the host runs one forward pass per branch (4 passes, ~80ms each on a laptop) to get both the submitted word's log-prob and the next Top-5; results fan out as **per-socket private payloads** — a phone is only ever sent its own branch state. Sync strategy: server-authoritative turn clock, phones send `{turn, word}`, late/absent submissions get the model's own argmax appended (a free but boring word). Genuinely hard part: **KV-cache management across grafts** — a graft must deep-copy another branch's cache without leaking the token strings into the grafter's socket payload, so masking has to happen server-side, not in the phone UI. Second hard part: multi-token words — sum sub-token log-probs, length-normalize, and reject anything over 4 tokens.

## v1 scope
- Exactly 4 players, one round, 8 turns, one fixed stem
- distilgpt2 only, host-side inference
- One graft per player, always onto current 1st place
- Top-5 panel, rank-only leaderboard, full reveal screen

## Out of scope
- Multiple rounds, scoring across games, phrase submissions, choosing your graft target, on-phone inference, spectators.

## Risks & unknowns
- Blind writing may feel like pure noise rather than skill — Top-5 must be readable at a glance.
- Grafting may be strictly dominant or strictly ignored; the 8-bit penalty needs playtest tuning.
- Rank-only leaderboards may feel information-starved for non-grafters.

## Done means
Four phones join, eight simultaneous turns resolve with no desync, at least one graft executes with the inherited text provably never sent to the grafter's socket, and the reveal screen prints four complete sentences with correct per-word authorship.
