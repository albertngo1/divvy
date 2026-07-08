## Overview
Cull is a cooperative concurrent-room game for 3–7 players riffing on *Just One*. One player is the Guesser; everyone else secretly writes a single-word clue for a mystery word. Any clues that are duplicates — or even semantically too close — get silently voided before the Guesser ever sees them. For word-game groups who want the sweaty 'please don't let us both write DOG' telepathy of Just One without the paper, sleeves, and honor-system peeking.

## Problem
Just One is brilliant but analog: clue-givers scribble on little easels, physically hide them, then a referee manually compares and yanks duplicates — which means the referee sees everything and the elimination is only exact-match. The tension of avoiding your friends' obvious clue is the whole game, and it deserves to be automatic, private, and smarter than exact-string matching.

## How it works
The TV shows the target word (e.g. BEACH) to everyone **except** the Guesser, whose phone shows only 'waiting…'. **Each clue-giver's phone privately** shows the word and a text box; all write ONE word simultaneously, seeing only their own entry. On submit, each phone shows a spinner, not the result.

Server-side, clues are compared: exact matches void, AND near-matches via embedding similarity above a threshold also void (SAND and SANDY both die; so do OCEAN and SEA). **Each giver's phone then privately reveals** just their own fate: a green 'survived' or a red 'voided — too close to someone else.' The Guesser is never told how many were voided. The TV shows the Guesser only the surviving clues, and their phone takes one guess. The load-bearing twist: because writing is simultaneous and private, and dedup is secret and fuzzy, players must gamble on originality with no coordination — a single passed phone would destroy both the simultaneity and the privacy that make the void sting.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object). Model: `Room { word, guesserId, submissions: { playerId, clue, status }, phase }`. Clues sent only to the server, never peer-broadcast. On a submission barrier (all givers in), server lowercases/stems, exact-dedups, then calls a small embedding model (cached MiniLM, or a hosted embeddings endpoint) to compute pairwise cosine similarity and void anything over ~0.8. Sync: phase machine (WRITE → CULL → GUESS → REVEAL); the CULL phase blocks on all submissions or a 30s timer. Hard part: the fuzzy-similarity threshold — too loose voids nothing, too tight voids everything; needs tuning and a graceful offline fallback to exact-match-only if embeddings are unavailable.

## v1 scope
- 3 players: one Guesser + two clue-givers, ONE word, ONE round.
- Exact + one fuzzy-similarity pass with a fixed threshold.
- Private per-giver survived/voided reveal; single Guesser guess; win/lose on match.
- Hardcoded word list (~20).

## Out of scope
- Scoring across rounds, the full 13-card Just One deck, host-configurable thresholds, profanity filtering.

## Risks & unknowns
- Embedding latency/cost per round; may need a tiny on-device or cached model.
- Threshold feel: fuzzy voids could feel unfair ('SEA and OCEAN aren't the same!') — needs playtesting and maybe a visible reason.

## Done means
With three phones, the Guesser's phone hides the word while two givers privately submit clues simultaneously; the server voids any exact or too-similar pair; each giver privately sees only their own survived/voided status; and the Guesser sees only surviving clues and makes one guess — with the void decision made server-side and never leaked to the Guesser.
