## Overview
Headroom is a 4-player, one-sentence party game for a TV plus four phones. A tiny language model (distilgpt2) running in the host tab isn't a content generator here — it's the terrain. The room builds a single sentence, one word per turn, in public. Each player privately holds one secret word they must smuggle into that sentence. A word can only be appended when the model finds it *unsurprising*, so the whole game is steering a shared sentence until your secret becomes the obvious next thing.

## Problem
Every "AI party game" so far uses the model as a joke machine — prompt in, funny text out, laugh, move on. The genuinely interesting object is the next-token distribution, which reshapes with every committed word: high entropy means the sentence can still go anywhere, low entropy means it has committed. That's a *spatial* quantity and nobody has made it the board. Better still, it's legible asymmetrically: "how surprising is MY word right now" is a different number for every player staring at the same public context. That is exactly the shape of a private controller.

## How it works
**Host screen (public):** the committed sentence; a big HEADROOM gauge showing next-token entropy in bits (0 = locked, 7+ = wide open); turn N of 12; the model's top-3 guesses as ambient texture; each player's name, checked off once their secret lands.

**Each phone (private):** your secret word (LANDLORD); a live surprisal readout *for that word alone*, refreshing every time the context changes — "LANDLORD · 14.2 bits · ice cold" on a colour ramp, plus your best reading so far; one text box.

**Turn loop:** all four phones submit one word simultaneously on an 8s clock. The server scores each submission's surprisal under the current context and appends **only the cheapest one**. Losing submissions are burned and shown on the TV as ghosts with their bit costs — a public leak about what people were reaching for. If your secret lands you score 12 − turn_number and drop out of the auction (you keep submitting filler). At turn 12 the full sentence's perplexity is revealed; under a threshold, everyone shares a readability bonus, so pure nonsense loses.

The bite: bland steering words are always cheaper than your weird secret, so they win the auction. You have to spend turns building a runway you can't be seen building, blind to how warm anyone else's word is. Talking aloud is allowed and lying is expected ("nothing for me in the kitchen — go outside").

## Technical approach
A PartyKit Durable Object per room is authoritative: `{committedTokens, sentence, secrets: {playerId → word}, submissions, scores, turn}`. The host browser tab joins the same socket as the model oracle.

The elegance: **one forward pass per turn** over the committed prefix yields the entire logit vector, so every player's private readout is a lookup in that vector — four private views cost nothing extra. Multi-token submissions get a single batched teacher-forced pass (≤4 candidates × ≤4 tokens). KV cache is keyed by the committed prefix; because the sentence is append-only it is never invalidated.

Hard parts: (1) latency — one forward pass plus candidate scoring inside ~1.5s on a laptop with WebGPU; (2) the host tab is the oracle and can be closed mid-game, so a server-side ONNX fallback is required, not optional; (3) tokenizer hygiene — leading spaces, casing and subword splits make "landlord" and " Landlord" score very differently, so submissions must normalize to one canonical form or players will correctly call the game rigged.

## v1 scope
- Exactly 4 players, one game, 12 turns, hardcoded room code, no lobby.
- distilgpt2 int8 via transformers.js/WebGPU in the host tab; one seed stem drawn from five hand-picked branchy openers.
- Secret words dealt from a curated 40-word list of concrete nouns.
- Submissions: single word, a–z, ≤12 chars, server-normalized.
- Score = 12 − turn + flat readability bonus. No rematch, no persistence, no accounts.

## Out of scope
Running the model on phones; >4 players; multi-word plays; undo/editing the sentence; team modes; cross-round scoring; iOS Safari WebGPU; content moderation beyond the wordlist.

## Risks & unknowns
Entropy may not move enough over 12 words to feel like terrain — seed stems must be chosen for branchiness. distilgpt2's judgments can be baffling in a way that reads as broken rather than funny. The private readout risks making play mechanical (just wait for the number to fall), so the one-append-per-turn auction has to genuinely bite; the 8s clock and turn cap are the tuning knobs. Sub-second forward passes on integrated GPUs are unproven.

## Done means
Four phones on a LAN join one room; the TV builds a 12-word sentence; each phone displays a *different* live bit-reading for its own secret and never sees another player's; rejected words appear as ghosts with bit costs; at least one secret lands because a player deliberately steered the sentence toward it over multiple turns; and an observer watching only the TV cannot identify who holds which secret before it lands.
