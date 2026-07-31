## Overview

Soft Spot is a four-player writing brawl for a TV plus four phones. Everyone writes one sentence. Then everyone is privately handed one ugly word and must jam it into somebody *else's* sentence. A 0.5B language model running in the host tab scores the wreckage in bits. You are simultaneously an author defending text you can no longer touch and a vandal aiming a word nobody knows you hold.

## Problem

Writing party games score by vote, which means they score whoever is loudest at the table. Perplexity is a real, instant, unbiased number — but a game where *low* perplexity wins just rewards clichés, and one where *high* wins rewards keyboard mashing. Soft Spot scores the derivative instead: not how surprising your sentence is, but how much a single hostile word can make it worse. Nobody has intuitions about that quantity. Acquiring them in ten minutes is the game.

## How it works

**1. Compose (90s, private).** TV shows a stem: *"The manager insisted that…"*. Each phone privately composes 8–15 words. No one sees anyone else's draft, so no one can pre-harden against a known attack.

**2. Reveal (public).** All four sentences appear on the TV, attributed, each with a baseline meter: mean bits/token under the model.

**3. Wedge (simultaneous, private).** Each phone receives one Wedge word from a fixed deck (*regardless, moist, Nebraska, allegedly, banana*). Your phone renders the other three sentences as tappable gaps. You tap exactly one gap. All four submit blind and simultaneously. Two wedges may land in the same sentence — even the same gap, inserted in seat order. Pile-ups are a legal and hilarious outcome.

**4. Resolve.** Host re-scores each sentence with its wedges in place and animates it token by token on the TV: the wedge slides in, the needle spikes on the *following* tokens.

**5. Score.** Defense = `baseline_bits + damage_bits`; lowest total takes the Author crown. Offense = damage attributable to you alone (re-score with only your wedge). The squeeze is the whole design: tight idiomatic sentences are cheap at baseline but shatter, while unhinged sentences absorb anything and start expensive. The frontier between them is the skill.

## Technical approach

Host browser tab owns the model — WebLLM/`transformers.js` with SmolLM-135M or Qwen2.5-0.5B on WebGPU. One machine scores everything, so numbers are comparable by construction. PartyKit Durable Object is authoritative for state; phones are PWAs over WebSocket.

Data model: `Room{phase, stem, seats[]}`, `Seat{id, sentence, baselineBits, wedgeWord, wedgeTarget:{seatId, gapIndex}}`. Phones never receive another seat's `wedgeWord`; the server fans out per-socket payloads and only broadcasts sentences at Reveal.

Scoring is teacher-forced NLL over the full sentence, one forward pass per variant. Per resolution: 4 baselines + up to 4 single-wedge attributions + 4 final combined = ~12 passes on ≤25-token strings. Trivial for a 135M model; batch them and it's under a second.

The genuinely hard part is *fairness under simultaneity*: wedge submissions must be locked at the same instant with a server-side deadline (phones show a local countdown driven by server timestamps, not local clocks), and late packets are rejected rather than accepted — a wedge placed after seeing a pile-up would break the whole bluff layer.

## v1 scope

- Exactly 4 players, exactly one round, one hardcoded stem.
- Hardcoded 8-word Wedge deck, dealt without replacement.
- Damage = ΔNLL summed over tokens after the insertion point.
- TV shows: four sentences, four needles, one animated resolution, a two-column scoreboard.
- No accounts, no rejoin, no persistence. Refresh kills the room.

## Out of scope

Multiple rounds, player-authored wedges, teams, spectators, model choice, mobile-hosted models, anti-cheat against a player running the same model locally.

## Risks & unknowns

A tiny model may be noisy enough that damage scores feel arbitrary — needs a calibration pass on ~50 human sentences to confirm the ranking is legible. Degenerate defense (write gibberish) is countered by the baseline term, but the balance point between the two terms is unknown and probably needs a coefficient. Tokenizer boundaries at insertion points can produce artifacts; insert with explicit surrounding whitespace and re-tokenize the whole string.

## Done means

Four phones join a room by code; each writes a sentence privately; each is dealt a distinct wedge invisible to the others; all four place blind; the TV animates one resolution and prints per-seat baseline, damage taken, and damage dealt — and in playtest, at least one table audibly argues about whether writing something weird on purpose is cheating.
