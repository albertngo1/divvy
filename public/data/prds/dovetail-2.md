## Overview
A cooperative mind-meld game for pairs: two players each write half of a single sentence without seeing the other's half, and the model scores how smoothly the halves join. For 4-6 players (2-3 pairs); playable with a single pair to prove the fun.

## Problem
Perplexity games are mostly solo-competitive. But the model is a perfect, unbiased judge of "did these two independently-written pieces actually fit?" — an itch no existing Divvy game scratches: measuring *agreement* between two people who cannot communicate. It rewards shared instinct, not cleverness.

## How it works
The host shows a shared prompt, e.g. "Write about: a disastrous wedding." Each pair is split by role: Player A privately writes the FIRST half of one sentence; Player B privately writes the SECOND half — neither sees the other's text, only the prompt. On submit, the host concatenates A+B and runs distilgpt2, scoring the SEAM: the summed surprisal of B's opening tokens conditioned on all of A's text (how startled the model is at the junction). Low seam-perplexity = you two thought alike.

Phones show PRIVATELY: your role (A "opener" or B "closer"), the prompt, your text box, submit. Crucially, your partner's half is never shown until reveal — the blindness IS the game. Host shows: prompt, timer, and which pairs are done — no text.

Reveal: the host displays each pair's full stitched sentence with the seam highlighted and its perplexity, ranked. Lowest seam wins "most in sync." The high-perplexity train-wrecks get read aloud.

## Technical approach
Host + phone PWAs + authoritative WebSocket server. Data model: Room{prompt, pairs[]}, Pair{id, aText, bText, seamPerplexity}. Sync: each phone submits its half; the server holds both and computes the seam server-side (transformers.js distilgpt2): tokenize A, tokenize B, run the concatenation, sum -log p over B's first k tokens (k≈3), normalize. Hard part: defining the seam window *fairly* — score B's first token conditioned on full A (the pure junction) plus a short decay so one lucky token can't dominate; and pairing/role assignment so odd player counts get a clean bye.

## v1 scope
- One round, one prompt.
- Exactly one pair (2 players) to prove fun; up to 3 pairs.
- Fixed roles (A opener, B closer).
- Seam = surprisal of B's first 3 tokens given A; single number.
- Ranked reveal with the seam highlighted.

## Out of scope
- Swapping roles / multiple rounds.
- Cumulative team scoring over a match.
- >6 players / dynamic re-pairing.

## Risks & unknowns
- Seam-window gaming (start B with "and"/"the"); may need to skip leading function words.
- Very short halves distort perplexity; enforce a minimum length.
- distilgpt2 quality for judging "fit."

## Done means
Two phones, blind to each other, each submit a half; the host stitches them, computes a seam perplexity matching a manual check, and shows a ranked reveal. With 2 pairs, the more-coherent join reliably scores lower.
