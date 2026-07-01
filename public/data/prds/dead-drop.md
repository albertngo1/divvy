## Overview
Dead Drop is a live, room-based game of hidden messages. Each round one player is the Sender: they're given a short secret code and must embed it inside ordinary-looking text (or a string of emoji) using steganographic tricks. Everyone else is a Cracker, racing to extract it. For puzzle-hunt people, CTF players, and anyone who saw 'QR code inside a TrueType font' and grinned.

## Problem
Steganography is delightful and almost nobody plays with it. Existing tools hide data silently; there's no *game* where the tension is 'can I hide this in plain sight faster than you can find it.' Passive party word-games (Codenames, etc.) don't reward technical cleverness.

## How it works
The Sender picks a channel: zero-width characters, capitalization patterns, whitespace runs, an acrostic, or emoji-variation-selector bytes. They author a cover text; the app confirms the payload actually round-trips, then broadcasts *only the cover text* to the room. Crackers submit guesses; first correct decode scores, and the Sender scores for every second the message survives uncracked — so obvious tricks lose, but tricks nobody can ever find also lose. A 'hint decay' timer slowly reveals which channel was used.

## Technical approach
Stack: SvelteKit front end, a single Cloudflare Durable Object per room for authoritative state and turn timing (fits the realtime infra already in this Divvy repo). Payloads round-trip through a small library of encoders/decoders (zero-width via U+200B/C, whitespace, acrostic, Unicode variation selectors). The Durable Object holds the secret, validates decode attempts server-side, and runs the scoring clock. Hard part: a fair auto-verifier that confirms a cover text genuinely contains the payload *and* estimates 'detectability' (entropy/heuristic) so the scoring can nudge players toward the sweet spot instead of trivial or impossible hides.

## v1 scope
- 3 encoding channels: zero-width, acrostic, whitespace
- 4-person room via shareable link, one Sender per round
- Server-side decode validation + a live scoreboard
- 90-second round timer

## Out of scope
- Image/audio steganography
- Accounts, persistent ELO, anti-cheat beyond server validation
- Custom cover-text length limits per channel

## Risks & unknowns
- Copy-paste normalization (some apps strip zero-width chars) could break payloads mid-transit — need a 'copy safe' export.
- Balancing scoring so clever-but-findable beats both trivial and impossible.

## Done means
Four people in one room play three rounds; each round a hidden payload is authored, broadcast, and at least sometimes cracked, with the scoreboard correctly rewarding both crackers and a survived hide.
