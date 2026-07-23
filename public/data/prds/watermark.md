## Overview
Watermark is a 4–6 player concurrent-room game about hiding your own handwriting in a crowd. Every player rewrites the same short public statement on their phone, but each phone privately assigns a secret stylistic *tell* they are forced to obey (e.g. 'use exactly three commas', 'never use the letter S', 'end on a question'). All rewrites are posted anonymously to the host TV. Then everyone privately tries to match each tell to a rewrite. The room wins COLLECTIVELY if no tell is correctly attributed above chance — you don't beat each other, you disappear together. The wall of variations is the keepsake.

## Problem
Smuggle-a-word games (Quiplash-adjacent) reward being loud and clever. There's no party game about *steganography* — satisfying a hidden formal constraint while making it look effortless — and none where the win is the group collectively evading detection rather than one person scoring. Anonymity as a team sport is unexplored.

## How it works
The host TV shows one seed sentence ('The meeting has been moved to Thursday'). PRIVATELY, each phone shows: the seed, a text box, and a secret tell card visible only to that player, plus a live validator that turns green only when the rewrite actually obeys the tell (forcing honesty). Players write simultaneously, trying to obey their constraint while looking like everyone else. On submit, the server strips authorship and the TV displays all rewrites as an anonymous numbered wall.

Reveal phase: the TV lists the full menu of tells that were in play (not who had which). PRIVATELY, each phone gets a matching grid — assign each tell to a rewrite number. The server tallies correct matches. The TV shows, per tell, whether the room detected it. Zero-or-near-zero detection = collective win, and the wall exports as a shareable image.

The host screen shows only the anonymous wall and detection results; each phone privately holds its own tell, its private validator, and its private guesses.

## Technical approach
Authoritative WS server (Socket.IO over Tailscale Serve). State: `{ seed, players: [{ id, tellId, text, submitted }], guesses: {guesserId: {tellId: rewriteIdx}} }`. Tells are pure functions `(text) => bool` run BOTH client-side (live validator) and server-side (anti-cheat) at submit. The hard part isn't sync — payloads are tiny — it's the tell library: constraints must be objectively machine-checkable yet subtle enough to disguise. v1 hand-authors ~8 regex/count-based tells and validates server-side before accepting a submission.

## v1 scope
- 4 players, one seed sentence, one round
- 8 machine-checkable tells, dealt one per phone, private validator
- Anonymous wall + private matching grid + collective detection tally
- Export wall as PNG

## Out of scope
- LLM-scored 'natural-ness', freeform tells, multiple rounds
- Per-player scoring / leaderboards

## Risks & unknowns
- Some tells are far easier to spot than others (balance)
- 'Green validator' may telegraph the tell to shoulder-surfers — need per-phone privacy
- Is collective anonymity satisfying without a scoreboard? (core bet)

## Done means
Four phones each rewrite the seed under a private, server-validated tell; the TV shows an anonymous wall; each phone privately submits tell-to-rewrite guesses; the TV reports which tells escaped detection and exports the wall as an image.
