## Overview

A 3–4 player game about the most famous failure mode of small language models: given the wrong prefix, greedy decoding eats its own tail and loops forever. Here that's the win condition. The TV shows the model babbling a 24-token continuation of a shared sentence; players hold private hands of word cards and race to be the one who tips it into a locked groove.

For people who have watched a small model repeat *"in other words, in other words, in other words"* and found it funny rather than disappointing.

## Problem

Every entropy party game so far asks players to be *surprising*. That's one direction on one dial, and it's been mined out. Nobody has made a game out of the other end — driving the model to near-zero entropy — even though degeneration is the single most legible, most physically funny thing a small LM does. Watching it happen live, on purpose, because of a card *you* played, is the game.

## How it works

**Host screen (shared):** a seed line (`The night supervisor explained that`) followed by the model's live greedy 24-token rollout, typed out character by character like something muttering. Above it, a **loop meter**: mean per-token entropy across the rollout, falling toward zero. Any 4-gram that appears twice in the rollout is highlighted in red — that's a lock.

**Each phone (private):** a hand of five word cards from a curated pool (connectives, hedges, appositive bait — *namely, that is, in other words, i.e., which is to say*, plus nouns and proper names). Nobody sees anyone's hand.

**Each tick:**
1. **Sounding (private, once per tick).** You pick one card and dry-run it: the host computes the rollout that card *would* produce and returns it **only to your phone**. The TV shows only that you spent a sounding, not what you learned.
2. **Commit (simultaneous).** Everyone plays one card face down.
3. **The model picks the winner.** The server appends each candidate independently, scores the resulting rollout, and permanently appends only the card producing the **lowest** rollout entropy. That card's owner takes the tick; everyone else's card returns to hand.

**House rule that makes it a game:** no word may appear twice in the shared visible text. You are forbidden from repeating yourself. Only the model is allowed to repeat.

**Win:** the player who authors the tick where a 4-gram locks wins. Eight ticks with no lock and the model wins, which the TV celebrates on the model's behalf.

## Technical approach

Host tab + phone PWAs + authoritative room server (PartyKit Durable Object; Socket.IO over Tailscale Serve for a home setup).

**Data model:** `Room { phase: DEAL|SOUND|COMMIT|RESOLVE|END, sharedText, hands: {playerId → [card]}, soundingsUsed, commits: {playerId → card}, tickLog: [{playerId, card, entropy, rollout}] }`. Hands and sounding results are filtered server-side per socket — a phone literally never receives another phone's hand.

**Model:** distilgpt2 (82M) via transformers.js on the host. It is chosen *because* it degenerates readily; a 0.5B model resists looping and pushes rounds past eight ticks. Greedy decode, no sampling, so rollouts are deterministic and the same card always means the same thing.

**Genuinely hard part:** the room has one GPU and four players demanding private computations from it. A tick needs P candidate rollouts (24 tokens each) plus up to P on-demand soundings — roughly 200 generated tokens per tick through a single host worker. That worker needs a priority queue where soundings are preemptible by the main resolve, results are addressed back to exactly one socket, and the TV animates plausible mutter while it waits so the room never sees a stall. Soundings must also be strictly rate-limited: an unmetered sounding button turns the game into brute-force search, which is both boring and a 30-second GPU melt.

## v1 scope

- Three players, one hardcoded seed line, one round, max eight ticks
- Five-card hands from a hand-tuned 40-card pool; no drawing, no discards
- One sounding per player per tick, 20-second commit timer
- Lock detection = any repeated 4-gram in the 24-token greedy rollout
- Host tab shows the mutter and the loop meter; phones show hand + two buttons

## Out of scope

Multiple rounds, model-generated seeds, deck-building, sampling temperature controls, spectators, reconnect mid-tick, running the model anywhere but the host.

## Risks & unknowns

- Difficulty is a knife-edge: distilgpt2 may lock on tick two (trivial) or never (frustrating). Tuning knobs are model size, rollout length, and n-gram width, and the right combination is unknown until playtest.
- "Lowest entropy card wins the tick" may reward one obvious card class (appositive bait) every time, collapsing strategy. Fix candidates: card-class cooldowns, or scoring the *drop* rather than the level.
- Soundings might dominate: if the dry-run is fully informative, commits become mechanical. The interesting version is soundings costing you the ability to check your second-best card.

## Done means

Three phones join, each sees a different hidden hand, each spends a sounding whose result appears on no other screen, all three commit simultaneously, and the TV appends whichever card the model found least surprising. In a majority of playtests the mutter visibly stutters into a red-highlighted repeat within eight ticks, and the room can name which player caused it.
