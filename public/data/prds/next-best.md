## Overview

A real-time game for 3–5 players, a TV, and phones. A small in-browser LLM writes a story live at about 4 tokens per second. Players can veto the token about to be printed — and the price of a veto is the number of extra bits of surprise it forces into the story. Vetoing a confident model is ruinously expensive; vetoing a model that's already flailing is nearly free. Entropy isn't the theme, it's the currency.

## Problem

Watching a model generate text is a spectator sport with no controller. And LLM party games are all turn-based typing. This one is a twitch game where the thing you're fighting is a probability distribution, and its uncertainty is a live, visible market price.

## How it works

1. Host screen: the story, printed token by token, with a ~350ms pause on each one — the veto window. A confidence bar shows the model's certainty on the incoming token to everyone.
2. **Private per phone:** a *slice* of the top-8 candidates. Player 1 sees ranks 1–2, player 2 sees ranks 3–4, player 3 sees 5–6 — and the slices rotate every token. You know `hospital` is the front-runner; you have no idea what's waiting at rank 5.
3. Also private: your **secret word** (from a 12-word pool) and your **battery**, 40 bits.
4. Press VETO during the window: the token dies, the model resamples from the remainder, and you're charged `log2(p_vetoed / p_replacement)` bits. Killing a 0.95-probability token to force a 0.02 one costs ~5.6 bits. Killing a coin-flip costs ~0.1.
5. Simultaneous presses: first press wins, the others are refunded and told they were beaten — but not by whom.
6. Story ends at 60 tokens. You score if your secret word appeared, minus bits spent. Battery empty means you spectate.

One phone passed around cannot do this: the rotating private slices and the simultaneous press race are the entire mechanic.

## Technical approach

Host tab runs distilgpt2 or Qwen2.5-0.5B via transformers.js on WebGPU, holds the KV cache, and streams `{token, top8: [{str, logprob}], t_deadline}` to a PartyKit Durable Object, which fans a *different two-entry slice* to each phone. The DO arbitrates vetoes by server receive time and returns `{winner, cost}`.

The genuinely hard part is **KV cache rollback**: on a veto the host must truncate the cache by exactly one position and re-sample with the vetoed id masked, inside the 350ms budget, without desyncing the token index the phones are voting on. Second hard part is fairness under clock skew — the veto window is server-timed, and phones display a countdown corrected by a per-socket RTT estimate.

## v1 scope

- 3 players, one 60-token story, one fixed seed prompt
- Top-8 candidates, 2-per-phone slices, rotate each token
- One veto per token globally; flat 40-bit batteries
- Secret word from a 12-word pool; score = hit minus bits

## Out of scope

Objective-deduction endgame, multiple rounds, temperature control, custom prompts, rejoin, sound.

## Risks & unknowns

If 350ms is too tight on phones over Wi-Fi the veto race becomes a ping contest; may need 500ms plus RTT compensation. A tiny model may produce mush that nobody cares about steering. KV truncation in transformers.js may not be exposed cleanly — the fallback is a full re-prefill per veto, which blows the budget at 60 tokens.

## Done means

Three phones and a TV run one story end to end; every veto visibly changes the printed word within 500ms, charged bits match a hand-computed `log2(p_a/p_b)` from the logged distribution, and two players pressing within 50ms of each other produce exactly one charge and one refund.
