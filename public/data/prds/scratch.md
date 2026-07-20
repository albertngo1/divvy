## Overview
Scratch is a cooperative concurrent-room party game for 3–6 players, a phone-native riff on *Just One*. Each round one player is the Guesser and everyone else privately writes a single-word clue for the same secret word — but any two clues judged to mean the same thing cancel each other out before the Guesser sees them. It's for groups who love the elegant 'give a helpful clue that nobody else thought of' tension of Just One but hate shuffling paper to hide slips from the guesser.

## Problem
Just One's magic is simultaneous, blind clue-writing plus duplicate cancellation. Around a physical table this breaks: you glimpse a neighbor's pad, the 'is this a duplicate?' call becomes a stalled group argument, and you have to physically choreograph hiding every clue from the one person who must not see them. The load-bearing privacy is fought for by hand instead of enforced.

## How it works
The server names a Guesser. The secret word appears PRIVATELY on every clue-giver's phone — never on the Guesser's phone, and never in the clear on the shared TV. Under a timer, each clue-giver privately types one single word.

Then the adjudication phase: each clue-giver's phone privately shows the OTHER clues (still hidden from the Guesser) and they tap any they think 'means the same as mine.' A clue is scratched if it's mutually flagged by two authors, or if it's normalized-identical. The novel load-bearing twist: flagging a near-match sacrifices your own clue too — a quiet altruism/strategy tension resolved in secret.

Survivors flip onto the TV and the Guesser's phone. The Guesser makes one guess; the host marks it right or wrong.

Private per phone: the secret word, your clue, your flag toggles. Shared TV: scratched clues rendered as theatrical black bars vs. the surviving clues; the Guesser's own phone stays blank until reveal.

## Technical approach
Host browser tab + phone PWA clients + authoritative WS server (PartyKit Durable Object or Socket.IO over Tailscale Serve). Data model: `Room{word, guesserId, clues:{playerId->{text, normalized, flaggedBy:Set, scratched}}, phase}`. Phases: WRITE → ADJUDICATE → REVEAL → GUESS, each gated by an all-submitted barrier. Sync strategy: server broadcasts per-player FILTERED state — the Guesser's socket never receives the word or any clue text until REVEAL (redaction is server-side; never trust the client). Normalization: lowercase, trim, strip punctuation, singularize. Genuinely hard part: authoritative redaction so the Guesser's client is physically incapable of leaking the word, plus fair collision handling that doesn't feel arbitrary.

## v1 scope
- 3 players: 1 Guesser, 2 clue-givers
- One word from a 50-word hardcoded list
- One round, no score tracking
- Scratch rule = mutual-flag OR normalized-identical
- Single guess, host taps right/wrong

## Out of scope
- Multi-round scoring, rotation of Guesser
- AI synonym detection
- Reconnection, spectators

## Risks & unknowns
With only 2 clue-givers collisions are rare — real fun needs 4–6. Private adjudication could feel fiddly. Normalization false-negatives let obvious dupes survive.

## Done means
On 3 phones, the Guesser sees only surviving clues (never the word), a mutually-flagged clue renders as a black bar on the TV, and the Guesser submits one guess the host marks right or wrong.
