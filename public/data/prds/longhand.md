## Overview
Longhand is a 3–6 player anonymity game about handwriting. Everyone finger-writes the SAME short phrase — 'Happy Birthday, Sam,' a group toast, an inside joke — on their own phone, privately and simultaneously. The host TV stitches the versions into a single anonymized poster (a group card in everyone's own hand). The win condition isn't points: it's staying anonymous — being the writer the fewest people can correctly identify — while the poster becomes a genuine giftable keepsake.

## Problem
Group cards are logistically annoying (one card passed around a table over an hour) and reveal who wrote what immediately. And there's no party game built on the surprisingly readable fingerprint of handwriting. The itch: a fast, funny, one-round toy where your own hand is the thing you're trying to disguise — and the byproduct is something worth keeping.

## How it works
The host shows one target phrase. Every phone privately displays a blank canvas and the phrase; players finger-write it at the same time, seeing ONLY their own strokes — never anyone else's in-progress. This simultaneity + privacy is load-bearing: with one phone passed around, everyone watches each version get written, and the anonymity guessing is dead on arrival. On submit, the host lays all versions into an anonymized, shuffled grid (a 'chorus' of the same words in many hands). Then each phone privately gets the shuffled grid and secretly attributes each cell to a player. Scoring is only used to pick the winner: you 'stay anonymous' if the fewest players correctly matched your handwriting to you. The host then reveals attributions, and — for the gift version — re-renders the poster WITHOUT names as a clean shareable PNG keepsake.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Phones capture strokes as vector polylines `{playerId, strokes: [[x,y,t]...]}` on a normalized canvas and send the finished path (small payload — no realtime stroke streaming needed, which sidesteps the hard sync problems). Data model: `{ roundId, phrase, submissions: {playerId: strokes}, guesses: {guesserId: {cellId: guessedPlayerId}} }`. Server anonymizes by assigning random `cellId`s and withholding the `cellId→playerId` map until the reveal. The genuinely hard part is rendering: replaying vector strokes crisply at both phone and poster resolution, and keeping the anonymized mapping leak-proof so no client can reverse-engineer authorship before reveal (all identity mapping stays server-side; phones only ever get cell IDs).

## v1 scope
- 3 players, one fixed phrase, one round
- Finger-draw canvas, submit, anonymized 1×3 grid
- One private attribution pass, one 'least-identified' winner
- One PNG poster export (names off)

## Out of scope
- Multiple phrases/rounds, custom phrases mid-game
- Pressure/tilt stroke styling, color, stickers
- Any cumulative scoreboard across rounds

## Risks & unknowns
- Handwriting on a tiny phone with a finger may be too illegible to attribute at all, flattening the guessing.
- With only 3 players the attribution space is small; may need 4+ to feel like a real lineup.
- Balancing 'gift keepsake' tone against 'gotcha anonymity' — the two moods may fight.

## Done means
Three phones simultaneously finger-write the same phrase seeing only their own canvas; the host displays a shuffled anonymized grid; each phone privately submits attributions; the host names a 'most anonymous' writer and exports a names-off PNG poster containing all three handwritten versions — with no persistent score.
