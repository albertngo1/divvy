## Overview
Gloss is a bluffing word game for 3–6 players, a phone-native riff on *Balderdash* (the dictionary game). The host shows one genuinely obscure real word; every player privately invents a plausible-sounding definition; the real definition is hidden among the fakes; then everyone privately votes for which one is true. You score for fooling others and for spotting the truth. It's for groups who like the deadpan authority of a good fake definition but hate the physical version's tells.

## Problem
Tabletop Balderdash leaks the truth constantly: it needs a reader who must recite every definition — including the real one — in a perfectly neutral voice without laughing, handwriting tells reveal authors, and votes are tallied by hand. The whole game is about anonymity and simultaneity, and paper-and-a-reader undermine both.

## How it works
The TV shows one obscure word (e.g. 'zarf'). Every phone PRIVATELY shows the word and a text box; all players write a fake definition simultaneously and blind. The server injects the REAL definition into the pool. Reveal: the TV lists every definition in shuffled, anonymized, uniformly-typed order — no handwriting, no read-aloud inflection. Each phone privately votes for the one it believes is real; the server forbids voting for your own. Scoring: +2 for every player who votes for your fake, +3 for voting for the true one. Then the TV unmasks who wrote what.

Private per phone: the word, your authored definition, your vote. Shared TV: the anonymized numbered list, and at the end, authorship + the real answer.

Load-bearing per-phone: simultaneous secret authorship (a single passed phone exposes every bluff and kills the vote) and hidden voting (public votes are tells, and nobody would openly vote against their own lie).

## Technical approach
Host tab + phone PWA + authoritative WS server (PartyKit / Cloudflare Durable Objects or Socket.IO over Tailscale Serve). Data model: `Round{word, realDef, entries:{playerId->text}, ballots:{playerId->displayId}, phase}`. Phases WRITE → VOTE → SCORE, gated by all-in barriers. The server shuffles entries and assigns display ids DECOUPLED from author ids, filters state so no phone learns authorship during VOTE, and rejects self-votes. Genuinely hard part: keeping the shuffle/anonymization mapping strictly server-side, and normalizing capitalization/punctuation/trailing-period across ALL entries so the real definition doesn't betray itself by formatting.

## v1 scope
- 3 players, one word from a 20-word curated list with real defs
- One write phase, one vote, scores shown once
- No categories, no rounds

## Out of scope
- Multiple rounds, custom word packs
- Balderdash variants (movie plots, acronyms, dates)
- Profanity filtering, reconnection

## Risks & unknowns
Three players = a thin pool (real def has ~1/3 base odds). Players may drift toward jokey Quiplash answers instead of plausible ones — mitigate with framing. Formatting normalization must be airtight or the real definition stands out.

## Done means
On 3 phones each player writes a definition, the TV shows all fakes plus the real one shuffled with uniform formatting, each phone casts one non-self vote, and the host reveals authorship while tallying fooled-votes and correct guesses.
