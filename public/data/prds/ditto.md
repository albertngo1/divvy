## Overview
Ditto is a cooperative concurrent-room party game for 4-6 players, riffing directly on *Just One*. One player is the Guesser; everyone else privately writes a single-word clue for a secret target word. Clues that collide — not just identical, but *semantically too close* — are cancelled and never shown. The room wins by getting oblique, and loses by all thinking alike.

## Problem
The itch: you know the obvious clue, and you know everyone else knows it too. *Just One* only cancels exact duplicates, so 'apple → RED' survives if the wording differs. Ditto punishes shared thinking directly, turning 'don't be predictable' into the whole game. Doing this needs private, simultaneous, un-see-able clue entry — the exact thing a passed phone destroys.

## How it works
Host TV shows the target word (e.g. VOLCANO) to everyone EXCEPT the Guesser, whose phone shows only 'waiting…'. Each clue-giver's phone PRIVATELY shows the target and a one-word text box; you cannot see anyone else's screen or clue. All submit within a 30s timer. The server embeds every clue and cancels any pair with cosine similarity above a threshold (LAVA/MAGMA burn together; ERUPT survives). Survivors appear on the Guesser's phone (privately) and, face-down-then-flipped, on the TV. The Guesser says one guess aloud. The drama is the reveal of what got Ditto'd — the room groans at how alike they all thought.

Privately per phone: your own target + your own clue box + which of YOUR clues burned. Shared TV: the target (for givers), the burn count, the surviving clues, the verdict.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{code, guesserId, targetWord, phase}`, `Player{id, name, role}`, `Clue{playerId, text, embedding, burned}`. Sync: server holds truth; clients send `submitClue`, receive only role-appropriate state (Guesser never sees the target or raw clues). The genuinely hard part is the semantic-collision check: a fast embedding call (cached word-vector table for common words, small model fallback) must return within the reveal beat, and the threshold must feel *fair* — too tight and everything burns, too loose and it's plain Just One. Ship a tunable slider and a curated word list whose 'obvious clue' clusters are pre-tested.

## v1 scope
- 4 players exactly, one round, one target word.
- Precomputed embeddings for a 200-word target deck + top-5 likely clues each.
- Exact + near-duplicate burn only; single similarity threshold.
- Text clues only; host TV shows burn count and survivors.

## Out of scope
- Scoring across rounds, streaks, drawings, voice clues.
- Player-tunable difficulty, custom decks.
- Reconnect grace, spectators.

## Risks & unknowns
- Embedding latency/cost on the reveal beat; mitigated by caching.
- Threshold feel is the make-or-break — needs live playtest tuning.
- Cheap-shot risk: players intentionally colliding to grief; acceptable at v1.

## Done means
4 phones join, each privately sees VOLCANO and types a clue blind; two typing near-synonyms both see 'DITTO'D' while others survive; the Guesser's phone shows only survivors and they guess aloud — all within one 30s round, no phone ever leaking another's clue.
