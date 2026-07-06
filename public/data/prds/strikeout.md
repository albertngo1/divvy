## Overview
Strikeout is a cooperative clue-giving party game — a phones-plus-TV riff on *Just One*. One player guesses a secret word; everyone else privately writes a single-word clue at the same time. Any duplicate clues cancel each other and disappear, so the guesser sees only the clever survivors. For groups who like collaborative word games with a cruel twist.

## Problem
The funniest beat in party word games is realizing three people all wrote the same obvious clue. Only *Just One* weaponizes it — but it needs opaque easels and error-prone manual duplicate-checking. Phones make the hidden simultaneous write airtight and cancel matches instantly and consistently.

## How it works
One player is the Guesser. Their PHONE shows only a "look away — waiting" screen; the HOST TV shows nothing that reveals the answer. The secret word is pushed PRIVATELY to each clue-giver's phone, where they each type one word into a box, unable to see anyone else's. When all clues are in, the server normalizes them (lowercase, trim) and cancels any that match — two identical words annihilate each other. The surviving clues then appear on the HOST TV; the guesser looks up and makes one guess aloud, then taps reveal. Private phones are load-bearing twice over: clue-givers must not see each other's word while writing (or no duplicates form) AND must privately receive a secret word the guesser is forbidden to see. Two asymmetric private channels at once — a single passed phone makes both impossible.

## Technical approach
Authoritative WebSocket room (PartyKit / Socket.IO). Data model: `room {code, guesserId, secretWord, clues:{playerId:word}, phase}` with phases WRITE → RESOLVE → GUESS → REVEAL. The server pushes `secretWord` ONLY to non-guesser phones. On submit it stores each clue; once all are in it normalizes + dedupes and broadcasts only the survivors — to the host and guesser. The hard part is the matching logic: "cat"/"Cat"/"cats" should cancel, "kitten" should not. v1 keeps it dead simple (lowercase + trim, exact match only) because false merges kill the fun. Equally critical: the secret word must never leak to the host TV or guesser phone before REVEAL.

## v1 scope
- 3 players: 1 guesser, 2 clue-givers
- ONE word from a fixed 20-word list
- Exact-match-after-lowercase-trim cancellation only
- One guess, one WIN / LOSE screen

## Out of scope
- Cross-round scoring, rotating guesser, pass option
- Fuzzy / stemmed / plural matching
- Invalid-clue policing (rhymes, same-root bans)
- Reconnection handling

## Risks & unknowns
- With only 2 clue-givers, duplicates are rare — the cancel gag scales with player count, so v1 may feel thin (accepted, to prove the pipe).
- Normalizer false positives/negatives are a live tuning risk.
- Not-peeking is honor-based.

## Done means
The guesser's phone shows only "look away," both clue-givers privately see the secret word and submit; identical words cancel and vanish; the guesser sees only the survivors, and a correct guess shows WIN — with the secret word never appearing on the host TV or guesser phone until REVEAL.
