## Overview

A cooperative 4-player reconstruction game. A secret ten-word sentence is displayed on the host screen as ten empty slots. Nobody ever sees it. Instead, each phone shows a *complete, grammatical, plausible* sentence — its own tiny model's best guess at every slot, conditioned on a private "lens" context. The lenses differ wildly (a slow-cooker recipe, a commercial lease, a hockey recap, a horoscope), so four fluent lies are on the table at once. Truth is whatever they agree on. The room has 90 seconds of talking to reassemble the real sentence.

## Problem

Everyone has watched an LLM be confidently wrong. No party game has turned that into a *sense organ*. Existing hidden-info games hand out fragments of the truth; this hands out four complete falsehoods that each contain the truth in different places, and the social work is figuring out which agreement is signal and which is two lenses being wrong the same way.

## How it works

Setup: server picks a target sentence of exactly 10 words. Host screen shows ten numbered boxes and a 90-second timer. That is *all* the host ever shows during play.

Each phone privately shows:
- Its **lens name** ("You are wearing: LEASE AGREEMENT") — visible to its holder only.
- A **full ten-word sentence**: for slot *i*, `argmax P(w | lens_text + true_words[0..i-1])`. Teacher-forcing on the true prefix is what makes phones comparable — everyone is guessing the same position from the same real history, differing only by lens.
- A **per-slot confidence** bar: the model's probability for its own top pick, and the entropy over that slot. Low-entropy slots are where your lens is sure. It is *not* told whether it is right.

So phone A reads "the tenant shall reduce the sauce until the party is bound" and phone B reads "the winger shall reduce the sauce until the whistle is blown." Slots 3-7 agree — those are almost certainly true. Slots 1-2 and 9-10 are pure lens noise and must be argued out loud.

Players talk. Anyone can type a locked guess per slot; a slot locks on 3-of-4 agreement. At 90s the true sentence is revealed and the room scores one point per exactly-correct slot, out of 10. A shared score, a shared failure.

The twist that keeps it social: high confidence is *not* accuracy. The lease lens will report 94% on "hereinafter" and be wrong. Learning to distrust your own certainty — out loud, in front of friends — is the game.

## Technical approach

Host browser tab runs transformers.js (distilgpt2 or Qwen2.5-0.5B-Instruct, 4-bit, WebGPU) and does **all** inference for all four lenses; phones render only. Four lenses × ten slots = 40 next-token distributions, but with teacher forcing each lens is a *single* forward pass over `lens + sentence`, reading off the argmax and entropy at each of the ten positions. Four passes total, ~1.2s on an M-series host, computed during a "putting your glasses on" splash.

Stack: PartyKit Durable Object (or Socket.IO over Tailscale Serve) as the authoritative room. Data model: `Room { target: string[10], slots: {locked, value}[10], deadline }`, `Player { id, lensId, view: {word, p, entropy}[10], guesses }`. The server holds `target` and never sends it to any client until reveal — including never to the host DOM, which is why reveal is a separate server message.

The genuinely hard part is **lens calibration**, not sync: the lenses must overlap enough that agreement is achievable and diverge enough that the game isn't free. That means offline tuning — precompute agreement statistics for candidate (sentence, lens-set) pairs and ship only combinations where mean cross-lens agreement lands between 3 and 6 of 10 slots.

## v1 scope

- Exactly 4 players, exactly one sentence, one 90-second round.
- Four hand-written lens paragraphs, ~60 words each, hardcoded.
- One hardcoded target sentence, pre-validated to hit the 3-6 agreement band.
- Phone UI: ten rows, each showing your word + a confidence bar + a text input.
- Slot locks on 3-of-4; no undo.

## Out of scope

Sentence generation or a sentence bank; variable player counts; competitive scoring; showing anyone else's lens or words on any screen; reconnect; the host screen showing anything but boxes and a timer.

## Risks & unknowns

The biggest: a small model may only ever agree on function words ("the", "of", "is"), making every content slot a blind guess and the game unwinnable and unfunny. Mitigation is target-sentence selection, and if that fails, fall back to showing top-3 per slot instead of top-1. Second risk: 90 seconds of four people reading ten words each is chaotic — may need a forced round-robin "read slot 4" protocol. Third: teacher forcing means a phone's view can be *more* coherent than it deserves, which might make players over-trust it; that may be a feature.

## Done means

Four phones join by QR; each displays a different, fully grammatical ten-word sentence; the room reconstructs at least 6 of 10 slots correctly on a first play with no rules explanation beyond one screen; at least one slot is locked wrong at high confidence by 3 players; and playtesters can articulate afterward which lens they were wearing without ever having been told anyone else's.
