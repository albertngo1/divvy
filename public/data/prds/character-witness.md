## Overview
Character Witness is a 3-5 player concurrent-room game where everyone secretly, simultaneously writes one anonymous testimonial *for a specific assigned other player*. The keepsake is a deck of warm, laundered testimonial cards — everyone goes home with one written about them. The anonymity is the game: you "win" by staying unidentified as the author.

## Problem
Party games about saying nice things are either face-to-face (no anonymity, so people hedge) or they collapse into a points tally that cheapens the sentiment. The itch: hand everyone a genuine anonymous compliment they'll keep, while making "can they tell it was me?" a real, playable tension.

## How it works
The server arranges players in a secret cycle (a random derangement) so each person writes for exactly one other and receives exactly one. Each phone PRIVATELY shows: "You are the character witness for [assigned name]" plus a prompt frame ("Vouch for them: they're the kind of person who ___"). Everyone writes simultaneously and blind — no phone sees another's target or text. The host TV shows only anonymized progress dots. The server then disguises each entry into a uniform font/card layout. In the reveal phase the host lays out the deck face-up, and each phone PRIVATELY receives *its own* card ("someone vouched for you…") and privately submits one guess for who wrote it. The writer stays anonymous — and wins — if the recipient guesses wrong. The full deck exports as a printable card-sheet PNG keepsake. No score tally, just the artifact and who stayed hidden.

## Technical approach
Host tab + phone PWAs + WS server (Socket.IO over Tailscale Serve or PartyKit). Model: `room {players, cycle:[{authorId, targetId}], cards:[{authorId, targetId, text}], guesses:{recipientId: guessedAuthorId}}`. Sync is easy — clean turn-based phases (assign → write → reveal → guess). The genuinely hard part is anonymization: stripping stylometric tells so the guess is a real challenge. v1 only normalizes casing/whitespace and enforces uniform typography; author voice will still leak (flagged as a risk). The derangement guarantees nobody writes for themselves and everyone receives exactly one card.

## v1 scope
- 3 players, one card each
- One prompt, text-only entry
- One attribution guess per recipient
- PNG deck export

## Out of scope
- LLM style-laundering of entries
- Multiple prompts or >1 card per player
- Editing after submit; persistent gallery

## Risks & unknowns
With only 3 players the author pool is tiny, so guessing is easy and anonymity is weak — needs more players to bite. Writing voice leaks through uniform typography. Someone could write something unkind, so a soft-report/skip is needed. The warmth is group-dependent.

## Done means
Three phones each write a blind testimonial for a secret assigned target, the host renders an anonymized keepsake deck, each recipient makes one attribution guess, and the deck saves as a PNG.
