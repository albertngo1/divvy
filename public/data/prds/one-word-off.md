## Overview

A 4-player, one-round riff on *Decrypto* for a shared TV plus phone controllers. In Decrypto, your team shares four secret keywords and you clue a code against them. Here the team **thinks** it shares a codebook, but each phone was quietly dealt a slightly different one — and nobody knows who matches them where.

## Problem

Decrypto's fun is calibrating a clue to an audience you can't test. But the audience is genuinely shared, so misfires are just bad cluing. The itch: what if the misfire wasn't your fault — what if the person nodding along was reading a different word the whole time? In person this is impossible to stage. Four phones make it trivial.

## How it works

The server picks four slots. Each slot gets a **near-twin pair** of words from a curated deck (slot 1: ANCHOR / ANVIL; slot 2: MOTH / MOSS; slot 3: LADDER / LATTICE; slot 4: HARBOR / HANGAR). For each slot, each phone is privately dealt one of the two — independently. So two players might agree on slots 1 and 4 and silently diverge on 2 and 3.

**Phone (private):** your four words, one per slot, and nothing else. No indication that anyone else's differs.

**Host TV (public):** slot numbers 1–4 as empty boxes, the current Speaker's name, a 90s timer, and the three clues as they're submitted. Never a word.

One player is Speaker. Their phone privately shows a code — `3-1-4` — and three text fields. They type one clue per referenced slot, aloud-and-typed, and the TV posts them in order. Every other phone then privately drags slot numbers into a 3-slot answer and locks. Simultaneous, no talking over each other, no order-of-reveal advantage.

Reveal on the TV, in one beat: the code, then each guesser's answer, then — the payoff — a grid showing every player's actual codebook, columns lighting green where two players matched. The Speaker scores 1 per correct guesser. Each guesser scores 1 for being right. Then the room re-litigates every clue out loud, which is the actual game.

## Technical approach

PartyKit Durable Object per room; host tab and phones are WebSocket clients of the same object.

Data model: `Room { code: [1..4]×3, slots: [{a,b}×4], players: {id, name, book: [0|1]×4, guess, locked} }`. `book` never leaves the server except in a per-connection projection — each socket receives only `slots[i][book[i]]` for its own player, resolved server-side at send time. Reconnect re-serves the same projection, never raw room state, so a player can't diff two payloads to learn that a slot is contested.

Sync is easy (three clue strings, four locks); the hard part is **leak discipline**. Every broadcast has to be authored as "what may the TV know" vs "what may this phone know," and the deck must be tuned so twin words are close enough that a natural clue survives both readings roughly half the time. Too close and it never diverges; too far and clues read as nonsense immediately.

## v1 scope

- Exactly 4 players, exactly 1 round, 1 Speaker
- 12 hand-written twin-pair slots, no generation
- Clues are typed on the Speaker's phone; no ASR
- Score shown, not persisted

## Out of scope

Interceptor team, multi-round codes, rejoin mid-round, avatars, sound.

## Risks & unknowns

Divergence may land too rarely to feel like a game (mitigate: force at least one contested slot). Speakers may clue the slot number rather than the word. Reveal grid may be confusing at a glance.

## Done means

Four phones join by room code; each shows a different-in-at-least-one-slot codebook; three clues post to the TV; all three guessers lock simultaneously; the reveal grid correctly shows who diverged from whom, and at least one table argues about it.
