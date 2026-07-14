## Overview
Flinch is a 3–6 player real-time reflex game where the surprisal trace of a small in-browser LLM is the target you're racing to catch. Where every other perplexity game is a writing contest, Flinch is a *timing* contest — a game of nerve, not vocabulary. For people who like Fingerbang / buzzer games but want the buzzer wired to a language model's shock response.

## Problem
Perplexity-as-scoring has been mined almost entirely as slow, written submission games. Nobody's used the per-token surprisal signal as a *live, unfolding* stream you react to in real time. The itch: a sentence's biggest "huh?!" moment is objective (the max-surprisal token) but invisible until it arrives — a perfect one-shot commitment game.

## How it works
The host TV plays a pre-scored high-perplexity mystery sentence, revealing ONE token at a time (~1/sec) with a live climbing surprisal graph beside it. PRIVATELY, each phone is a single giant FLINCH button plus your remaining-taps counter (just: 1). You have exactly one tap. The moment a token appears that you believe is the single most-surprising token of the entire sentence, you slam FLINCH — your tap timestamps to whichever token was on screen, your phone locks, and you're committed for the rest of the reveal. You cannot see anyone else's tap.

After the full sentence finishes, the host reveals the true argmax-surprisal token. Scoring: closest tap to the real spike wins; exact hit is max points; ties broken by earliest tap (nerve beats hesitation). Waiting for a bigger spike that never comes and running out of sentence = zero. PRIVATE per phone: your button, your lock state, your one-shot pressure. SHARED on host: the unspooling sentence, the live meter, and the dramatic post-reveal scatter of everyone's taps against the true peak.

## Technical approach
Host browser tab pre-computes, via transformers.js + distilgpt2, each token's surprisal (−log p) for a chosen sentence, so the peak is known before play (v1 uses a curated sentence bank; scoring is deterministic and instant). Host drives the reveal clock and is the timing authority. Phone PWAs send a single `{tap: serverTimestamp}` over WebSocket (PartyKit DO or Socket.IO over Tailscale Serve). Data model: `Room{sentence, tokenSurprisals[], revealStartMs, players:{id, tapTokenIndex|null}}`. Sync: server maps each tap's arrival time to the token index that was live at that moment (using revealStart + tokenIndex*interval), so scoring is index-distance to argmax. Hard part: fair latency — phone-to-server round-trip must not decide winners; compensate by timestamping taps against the server's authoritative reveal clock and quantizing to the ~1s token window, making sub-100ms jitter irrelevant.

## v1 scope
- One curated sentence, one round, 3–6 players.
- One tap per player, index-distance scoring.
- Host reveal + meter; phone = one button.

## Out of scope
- Player-supplied sentences, live model scoring mid-game.
- Multiple taps / stake betting / multi-round.
- Audio TTS narration (nice-to-have later).

## Risks & unknowns
- Token pacing: too fast = pure luck, too slow = boring; needs tuning.
- distilgpt2 spikes may be unintuitive (rare BPE fragments), feeling arbitrary — curate sentences with one clear human-legible surprise.
- Latency fairness on flaky phone wifi.

## Done means
5 phones join, one sentence unspools token-by-token on the TV with a live surprise meter, each player privately fires their single FLINCH, and the reveal shows every tap plotted against the true peak token with the closest-and-earliest tapper crowned — verifiably unplayable by passing one phone around.
