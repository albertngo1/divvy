## Overview

A 4-player game where the shared model is a shared body. Each phone secretly writes one short training sentence; the host applies all four in one gradient step to a small in-browser LM; then the TV shows what that step did to a public "canary" sentence everyone swore to keep intact. Each player also has a private canary they're secretly trying to improve. Perplexity before and after is the entire scoring engine.

## Problem

Every entropy game so far treats the model as fixed furniture and the players as writers of prompts. Nobody plays with the *weights*. Catastrophic forgetting is a genuinely social phenomenon — four people pulling one set of parameters in four directions, where two players wanting the same thing helps and two wanting opposite things wastes both — and it has never been a party mechanic.

## How it works

1. TV shows the **public canary**: `the coffee is on the third shelf.` Its current perplexity is displayed as a big health bar: `41.2 ppl`. The room is told: if this passes 70 after the step, everybody loses.
2. Each phone privately shows a **private canary** — a different sentence per player (`the dog sleeps under the truck.`, `the phone rang twice at midnight.`) — with its own current perplexity, visible only to that player.
3. Ninety seconds. Each phone privately types **one training sentence**, up to 12 words. You may talk, negotiate, and lie about what you're writing.
4. Host applies all four sentences as a single batch, one gradient step, one learning rate.
5. TV animates the public canary's health bar moving. Phones simultaneously animate their private canary's number moving.
6. Scoring: each player earns the bits their private canary gained; everyone loses if the public canary broke. TV reveals all four training sentences last, so the room can see who wrote the sentence that mauled it.

The fun is interference. Writing "the dog sleeps under the truck" verbatim spikes your private canary but drags the model's whole distribution toward dogs and trucks, wrecking a neighbour's canary and probably the public one. Writing something adjacent and general is safer and pays less. Two players quietly writing about coffee shelves can protect the room while a third free-rides.

## Technical approach

Host tab holds the model and does the training; phones are PWA clients over PartyKit / a Durable Object. The model is a ~2M-parameter 2-layer word-level nanoGPT trained offline on a small domestic-sentence corpus, shipped as a 10MB weights file and stepped in the browser via WebGPU (or tfjs-webgl fallback). Only the final block plus the output head are trainable in v1 — full backprop through the embedding table is both slow and chaotic.

Data model: `Room { publicCanary, privateCanaries: {playerId → text}, submissions: {playerId → text}, pplBefore, pplAfter, phase }`. The server is authoritative for phase, timer, and submission locking; the host publishes only the two perplexity numbers each phone is entitled to see.

The hard part is **making one step legible**. Too small a learning rate and nothing moves (boring); too large and every canary explodes together (unreadable, and the game becomes a coin flip). v1 needs an offline sweep to find an LR where a single 4-example step moves a targeted canary by 20-40% and an untargeted one by under 10%. Second hazard: step latency. A 400ms step is a drumroll; a 6-second step kills the table.

## v1 scope

- 4 players, one public canary, one gradient step, one round, done.
- Three hardcoded private canaries plus one spare, hand-picked to be mutually interfering.
- Fixed LR, fixed batch, no undo, no second step.
- Phone UI: your canary's number, a text box, a submit button.

## Out of scope

Multiple rounds, weight rollback, choosing your own private canary, player counts other than 4, any model above 5M params, showing loss curves.

## Risks & unknowns

The biggest unknown is whether a single step on a tiny model produces *differentiated* movement or just uniform noise; if the sweep can't find a workable LR, the fallback is three accumulated steps shown as one animation. WebGPU availability on the host machine is a hard dependency. Word-level tokenization means OOV words silently do nothing — the phone must reject unknown words at type time, with a visible dictionary hint, or players will feel cheated.

## Done means

Four phones submit one sentence each, one visible gradient step runs in under two seconds, the public canary's perplexity and all four private perplexities change by *different* amounts, and a scripted playtest reproduces the target moment: one player's canary improves sharply while the public canary breaks, and the reveal names who did it.
