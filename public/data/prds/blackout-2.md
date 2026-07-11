## Overview
Blackout is a 3-5 player concurrent-room game where the whole table collaboratively turns a shared block of text into a blackout poem (the keepsake) by striking out words — but each player is also secretly protecting one word from the executioner's pen, and wins by never being identified as its protector.

## Problem
Blackout poetry is a lovely, meditative craft, but solo it's private and slow. Group text games (Quiplash, etc.) reward the loudest joke and end in a scoreboard nobody remembers. The itch: make something you'd actually screenshot and keep, and layer just enough secrecy that everyone plays a quiet double game.

## How it works
The host TV shows a single shared 'source page': ~30 words (a public-domain sentence salad) laid out as a poem grid. Every word is owned by exactly one player, assigned disjointly and privately.

Each PHONE privately shows the full page, but only YOUR words are tappable (toggle keep ↔ redact); everyone else's words render locked/grey. Your phone also privately shows your secret KEEPER — one specific word (always one you control in v1) that must remain un-redacted in the final poem.

A 90-second timer runs. Everyone redacts simultaneously; the host page updates live as words go black — but the TV never shows WHO blacked out what. The comedy: you want to strike enough words that a poem emerges, but if you conspicuously leave one word pristine while nuking everything around it, you've flagged your keeper.

At time-out the poem freezes. The host renders it as a shareable image — that's the artifact everyone saves. THEN each phone privately submits one guess per opponent: 'which surviving word was their keeper?' You win (stay anonymous) if nobody correctly fingers yours. No points, no ranking — just the keepsake plus who slipped through clean.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `{ pageId, words: [{id, text, ownerId, redacted:bool}], keepers: {playerId → wordId}, phase }`. Redaction toggles are owner-scoped writes the server validates (reject edits to words you don't own) and broadcasts to all clients; the host reduces the word array to render live. Guess phase collects `{guesserId → {targetId → wordId}}`, scored server-side at reveal. Sync is trivial (tens of events, last-write-wins per word) — the genuinely hard part is authoring source pages that redact into something poem-shaped for many redaction paths, and tuning ownership so keepers are protectable but not obvious.

## v1 scope
- 3 players, one round, one hand-authored 30-word page.
- Disjoint ownership (~10 words each); keeper always self-owned.
- 90s simultaneous redaction, then one guess round.
- Host exports the poem as a PNG.

## Out of scope
- Cross-owned keepers / persuasion, multi-round, curated page library, undo, spectators.

## Risks & unknowns
- Does the poem read as anything, or just noise? Needs authored pages.
- Is hiding your keeper actually tense with only 3 players, or too easy?
- Griefers redacting a rival's keeper — mitigate by keeping keepers self-owned in v1.

## Done means
Three phones join, each redacts only its own words live on the TV, a saveable blackout-poem PNG is produced, and the server correctly reports which players' keepers went unguessed.
