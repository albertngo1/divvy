## Overview
One-Off is a cooperative word-guessing party game for 4-7 players — a phone-native riff on *Just One*. One player is the Guesser; everyone else secretly writes a single one-word clue for a hidden target word. Clues that collide cancel each other out, so the team's job is to be *helpful but unique*. For groups who love word games but hate fiddling with pen, paper, and 'okay everyone hide your pad.'

## Problem
The magic of *Just One* is the duplicate-cancellation: two people who both wrote 'ocean' just wasted the team's best clues. But doing it in meatspace is clumsy — everyone scribbles on little easels, physically hides them, then a human eyeballs the row and manually pulls matches, which leaks information and stalls. Phones are perfect for this: private simultaneous writing, and instant, impartial collision-detection.

## How it works
One player becomes the Guesser and steps back / closes their eyes; their phone shows a neutral holding screen. The host TV privately reveals the secret word to *the room* (not the Guesser). Every other player's phone PRIVATELY shows the secret word plus a single text box. All givers type ONE word **simultaneously and blind** to each other, then lock in. The server normalizes and cancels exact duplicates and near-matches; each giver's phone then privately shows the sting — 'survived' or 'cancelled by collision (2 of you wrote MOON).' The Guesser's phone privately shows ONLY the surviving clues and one guess box.

Private vs shared: givers' phones = secret word + own clue + collision result; Guesser's phone = surviving clues + guess; host TV = the word (for the room), the collision drama, final score. Per-phone privacy is load-bearing — a single passed phone would leak earlier clues and destroy the blind-simultaneous write that the whole cancellation mechanic depends on.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{code, players[], phase, secretWord, clues:{pid->raw}, survivors[], guess}`. Phases: LOBBY → WRITE (barrier: collect all givers' submissions) → RESOLVE (server cancels) → GUESS → REVEAL. Sync is trivial small-state broadcast; the WRITE phase is a barrier. The genuinely hard part is fair collision detection — stemming + Levenshtein distance + a small curated synonym list, run deterministically server-side so 'run/running' cancels but 'run/sprint' is a design choice. Guesser isolation is a hard rule: never emit `secretWord` or raw clues to the Guesser's socket.

## v1 scope
- 4 players: 1 Guesser, 3 givers
- One target word, one round
- Exact-match + stemming cancellation only (no synonyms)
- Host TV shows word + collisions; Guesser gets survivors + one guess

## Out of scope
- Synonym/LLM matching, multi-round scoring, rejoins, spectators, profanity filtering, prompt packs

## Risks & unknowns
- Synonym detection can feel arbitrary and unfair
- Guesser peeking — relies on honor / stepping out
- With only 3 givers, collisions may be rare enough to feel flat

## Done means
Four phones connect; three givers submit clues blind and simultaneously; two identical clues auto-cancel and neither reaches the Guesser; the Guesser's phone shows only the surviving clue(s) and accepts one guess that the host scores correct/incorrect.
