## Overview
Second Guess is a cooperative party word game for 3-6 players, a phone-native riff on *Just One*. One player is the Guesser; everyone else secretly and simultaneously writes a single clue word for a shared target. Clues that collide are struck out before the Guesser ever sees them — so the game is a silent battle to be helpful without being obvious.

## Problem
*Just One* is brilliant but physically clumsy: everyone scribbles on little easels, then leans in to compare and manually cancel duplicates, and the Guesser has to be shooed away and blindfolded. The tension — "will someone else write the same clue I'm about to?" — is entirely about hidden simultaneity, which paper handles badly and a single passed phone destroys outright.

## How it works
The host TV shows the round number and, to everyone except the Guesser, the target word (e.g. **VOLCANO**). The Guesser's phone shows only "eyes closed."
- **Each clue-giver's phone PRIVATELY shows** the target word and a text box. All givers type one word blind and submit — nobody sees anyone else's clue.
- The server normalizes (lowercase, singular, stem) and cancels any clue that matches or near-matches another. Struck clues vanish.
- **The fresh twist — the private re-write:** each surviving giver's phone privately shows *how many* clues survived ("3 of 5 made it") but never *which*. They get one 10-second chance to change their clue, gambling on whether a bolder, less obvious word would survive. Collisions are re-checked.
- The shared TV then reveals only the surviving clues to the now-unblinded Guesser, who gets one guess. Right = point.

The Guesser's screen and the givers' screens hold strictly different information at every step; that asymmetry is the whole game.

## Technical approach
Host tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object per room, or Socket.IO over Tailscale Serve). Data model: `Room{code, players[], guesserId, target, phase}`, `Clue{playerId, text, normalized, alive}`. Phases: `writing → cancel → rewrite → reveal → guess`. Server owns all clue text and never broadcasts a giver's word to another giver — only counts and the final surviving set (post-guess-unlock). Sync is turn-gated, not real-time-continuous, so latency is a non-issue; the hard part is the **normalization/collision engine** feeling fair (stemming, plurals, obvious typos, hyphenation) — get that wrong and players rage. Use a small stemmer + edit-distance threshold, tunable, with the struck words shown on the post-round recap TV so cancellations feel earned.

## v1 scope
- 3 players, one round, one target word from a hand-curated list of 30.
- One Guesser (rotates in future).
- One collision pass + one private re-write pass.
- Text clues only; server-side stem+exact+edit-distance≤1 cancellation.

## Out of scope
- Scoring across rounds, difficulty tiers, custom decks.
- Voice or drawing clues.
- Rejoin/reconnect handling beyond a simple room code.

## Risks & unknowns
- Collision engine over- or under-matching kills trust; needs playtesting the threshold.
- The re-write layer may add confusion rather than tension — validate it earns its place.
- Small groups (3) mean few clues; verify it's still fun with only 2 givers.

## Done means
Three phones join via room code; two givers type blind clues; the server cancels a genuine duplicate; both see "1 of 2 survived," one re-writes; the Guesser, previously blind, sees exactly the surviving clue(s) and guesses; the TV shows a correct/incorrect result and the struck words.
