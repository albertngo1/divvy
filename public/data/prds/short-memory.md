## Overview

Short Memory is a four-player argument game for a TV and four phones. A sentence is being built one word at a time. Four candidate next-words sit on the TV. Every phone shows you a private surprisal reading for each candidate — but your phone computes it under a secretly truncated context window. One player sees the whole sentence. One sees the last two words. Nobody knows which they are. You all read real numbers off the same model, and you all disagree.

## Problem

Hidden-information games usually hide *facts*. Short Memory hides *how much of the world you can see*, and makes the resulting disagreement quantitative. Nobody is lying — everyone can honestly show a number and be honestly wrong. That's a social texture party games rarely get: sincere, confident, incompatible testimony.

## How it works

TV shows a sentence-in-progress: *"The lighthouse keeper never once…"* and four candidate continuations: **complained / floated / apologized / bloomed**.

Each phone privately shows those four candidates with a bits reading beside each, computed under that phone's private context length `k` ∈ {2, 4, 8, ALL} words of the prefix. Your phone never tells you your `k`. The short-context player sees *floated* as perfectly reasonable; the full-context player knows it's absurd.

**Talk (60s).** Open table. You may say your numbers out loud. You cannot show your screen (a rule, and the phone dims if you tilt it flat — soft enforcement, honor system).

**Vote (simultaneous, private).** Each phone picks one candidate. Plurality commits; ties break toward the candidate with the lowest full-context surprisal.

**Payout — the twist.** The *room pot* is `10 − full_context_bits(committed)`, split four ways. Your *personal bonus* is `10 − your_own_meter_bits(committed)`. So the two-word-context player is genuinely, correctly paid for arguing toward a word that only fits locally. Nobody is a traitor. Everyone is optimizing their real instrument.

**Reveal.** TV prints every player's `k` and every player's private reading of all four candidates, side by side. This is the payoff moment: the table sees exactly whose testimony was structurally blind, and re-litigates the last 60 seconds.

## Technical approach

Host tab runs the model (`transformers.js`, SmolLM-135M or Qwen2.5-0.5B, WebGPU) and is the sole scorer. PartyKit Durable Object holds authoritative state; phones are PWAs on WebSocket.

Data model: `Room{prefix, candidates[4], phase, deadline}`, `Seat{id, k, meterReadings[4], vote}`. `k` and `meterReadings` are per-socket payloads and are never broadcast until Reveal.

Scoring: for each distinct `k`, prefill the truncated prefix once, then read the logit for each of the four candidate tokens off that single forward pass. Four `k` values × one prefill = four passes total, ~16 logit lookups. Effectively free — this is why the design is per-phone-cheap rather than per-phone-expensive.

Hard part: candidate selection. Candidates must be chosen so the `k`-variants genuinely disagree — otherwise the game is flat. v1 hardcodes hand-authored candidate sets validated offline; a real version would need a search that maximizes variance of rank across `k`, which is a live constraint-satisfaction problem against a model that's also computing the game.

Second hard part: the private meters must be pushed before the Talk timer starts, atomically, or an early-delivered phone gets extra reading time.

## v1 scope

- Exactly 4 players, exactly one word committed, one hardcoded prefix and candidate set.
- Fixed `k` assignment {2, 4, 8, ALL}, shuffled to seats.
- Bits rendered as a number *and* a four-bar chart (numbers alone read as noise).
- One 60s talk timer, one blind vote, one reveal screen.
- No persistence, no rejoin, no accounts.

## Out of scope

Multi-word sentence building, player-written candidates, more than four `k` bands, procedural candidate generation, teams, spectator mode.

## Risks & unknowns

The biggest risk is that the disagreement isn't dramatic enough to argue about — a small model may rank the four candidates similarly at `k=4` and `k=ALL`, collapsing the game. Requires offline validation that at least two players' top pick differs. Second risk: players may not trust or care about a number they can't verify, and default to whoever talks best — which would make it a normal party game with extra steps. The Reveal screen is the mitigation and must land hard.

## Done means

Four phones join by code and each receives a different, private, undisclosed context length; the TV runs one 60s talk phase and one blind vote; payouts split correctly between room pot and personal bonus; the Reveal prints all sixteen private readings in a grid — and in playtest, two players who both argued sincerely discover on screen that they were reading different sentences.
