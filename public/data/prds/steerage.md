## Overview
A 3-player real-time game where a small LLM generates a story live on the host screen, one token every four seconds, and each player secretly tries to drag it toward a word only they can see. Steering is not free: overriding the model's preferred token costs bits of surprisal out of a fixed wallet. For groups who'd enjoy an economics game where the price list is a probability distribution.

## Problem
Perplexity games so far are all *write-then-score* — you submit text, a number comes back, you wait. Nothing has made surprisal a **live price** you pay in the moment, with a budget, under time pressure, against other people pulling the other way. The interesting behavior falls out of that framing for free: you can't afford to force your word now, so you spend a little steering the *topic* and wait for the model to make your word affordable later. Patience becomes the skill.

## How it works
- **Setup:** the host seeds a sentence ("The night the power went out on Ferris Street,"). Each phone privately receives one secret target word (common, single-token: " church", " money", " dog") and a wallet of 30 bits.
- **Each step (4s):** the host computes the top-8 next tokens. All phones see the same eight candidates, each priced at `log2(p_top / p_choice)` bits. **Privately**, each phone additionally shows only *its own* target's current standing: `" church" — rank 214, 9.1 bits`. That private thermometer is the whole information game.
- **Bidding:** tap one candidate to commit its listed cost, or pass. Blind and simultaneous. The highest bid wins and becomes the next token; **everyone pays what they tapped**, winner or not. No bids → the model's argmax.
- **Host screen (public):** the story growing token by token, all three wallet balances (public), and a burn ticker. You can see someone just spent 6 bits; you can't see why.
- **After 24 tokens, reveal:** score = bits by which you made your target cheaper (starting surprisal minus its lowest surprisal all game) + leftover wallet + 15 if it actually got emitted.

## Technical approach
Host tab runs transformers.js distilgpt2 in a manual generation loop with an explicit KV cache, so a forced token is simply appended and the cache advanced. A PartyKit Durable Object is the clock and the authority: it holds `{story:[tokenIds], step, deadline, players:[{id,target,bits}], bids:{}}`, broadcasts the candidate list, closes the bid window on its own timer, resolves, and asks the host for the next distribution.

The hard part is the **loop, not the model**: host inference latency must hide inside the 4s window, and a phone that taps at t=3.98s must either land or be visibly rejected — no ambiguity, since players are paying real currency. Server-stamped deadlines, optimistic "committed" state on the phone, and authoritative rollback on the broadcast.

## v1 scope
- 3 players, 1 story, exactly 24 tokens, one fixed seed sentence.
- 30-bit wallets, no cost-splitting when players agree, no bluffing mechanics.
- Targets drawn from a hand-checked list of 20 single-token words.
- Phone UI: 8 buttons with prices, your target line, your balance. Nothing else.

## Out of scope
Multi-token targets, coalitions, ante/raise bidding, live anonymized closeness bars on the TV, multiple rounds, any model larger than distilgpt2.

## Risks & unknowns
A target may never enter the top-8 in 24 tokens, making it feel unwinnable — hence the "made it cheaper" score, which must be tuned so progress is legible. Distilgpt2 may degenerate into repetition after forced tokens. And 4s may be too short to read eight prices and choose.

## Done means
Three phones join, each sees a different secret word with a live private bit-cost, 24 steps run on a server clock with no missed windows, at least one forced token visibly diverts the story on the host screen, and the final screen shows three different scores with each player's target's surprisal curve over time.
