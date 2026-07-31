## Overview
No Card is a 3-4 player gift exchange where the gift arrives unsigned and stays that way. Each phone is secretly assigned one other player to make an emblem for. All emblems appear unlabeled on the TV; every player privately picks the one they believe was made for them. You succeed if your person finds theirs and the room still can't name you as the maker. Everyone leaves with a PNG; nobody leaves with a score.

## Problem
Secret Santa's pleasure is the making; the reveal is what kills it. And "make something for X" games collapse instantly — handwriting, style, and the in-joke give the author away in one glance. The itch is a game where anonymity is a *craft problem* you can actually solve, and where the thing you made is the prize rather than a step toward one.

## How it works
The server deals a derangement (nobody draws themselves; with 3 players, a 3-cycle). Your phone privately shows exactly two secrets: your recipient's name, and one mandatory **camouflage glyph** you must place somewhere regardless of relevance.

The kit is deliberately identical for everyone and deliberately small — 6 frame shapes, 24 glyphs, one palette, plus a 4-word inscription you type. Since nobody has a private medium, personalization can only come from *choice*. That produces the double bind the game is built on: the detail that makes your recipient recognize the emblem (the bike, the nickname, the thing that happened in June) is also proof that **you** are the person who knows that about them. The camouflage glyph is the escape hatch — everyone is carrying one inexplicable element, so any inexplicable element is deniable.

The host TV shows all emblems side by side, unlabeled, in shuffled order. Each phone then privately (1) taps the emblem it thinks was made for it, and (2) names one maker. Reveal shows only which recipients found theirs (green) and whether any maker got correctly named. The authorship map is then deleted server-side and each player downloads an unsigned PNG.

Per-phone is load-bearing end to end: different secret recipients, different camouflage glyphs, simultaneous blind making, private claiming. A passed-around phone destroys all four.

## Technical approach
One Durable Object per room. State: `{phase, players[], assignment (server-only, never serialized to any client), emblems[{id, ownerId:secret, spec}]}`. An emblem spec is tiny JSON — `{frame, glyphs:[{id,x,y,scale,rot}], inscription}` — rendered to identical SVG by phone and host, so no image bytes cross the wire.

The hard part is the anonymity guarantee, not sync. The server must: never broadcast the assignment map; hold every submission until the last one lands so submit order leaks nothing; shuffle display order with a server-side seed; strip timestamps from the broadcast; and genuinely delete the authorship map and connection log at round end, so the claim on the reveal screen is true rather than decorative.

## v1 scope
- 3 players, one round, 90-second make timer.
- 6 frames, 24 glyphs, one palette, 4-word inscription.
- One claim + one maker guess per phone.
- Host reveal screen + per-player PNG download.

## Out of scope
Freehand drawing, photo import, multiple rounds, larger derangements, saved galleries, printing, any cumulative score.

## Risks & unknowns
With 3 players the derangement is guessable by elimination — 4 may be the real floor. A 24-glyph kit may be too poor to say anything personal, or so poor that every emblem looks alike and claims become coin flips. Tuning that vocabulary is the whole design risk.

## Done means
Three phones make three emblems; the TV shows them in an order uncorrelated with submission; each player privately claims one and at least one claim is correct; a WebSocket log inspection confirms no client ever received the assignment map; each player downloads an unsigned PNG.
