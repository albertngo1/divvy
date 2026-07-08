## Overview
Even Hand is an anonymity game for 4–6 players that also produces a real keepsake: a signed group card. Everyone hand-writes the SAME sentence with a finger on their phone, trying to disguise their natural handwriting. You don't win points — you win by staying anonymous: nobody correctly identifies your handwriting.

## Problem
Signing a group birthday or farewell card is a serial chore — one card, passed around, one bored signature each. Meanwhile handwriting is a fingerprint nobody thinks about. Even Hand turns "sign the card" into a tense little game of self-erasure, and hands you a genuinely sendable artifact at the end.

## How it works
The host picks an occasion ("Farewell, Dana"). Every phone privately displays the SAME assigned sentence to write — because the words are identical, only *style* can give you away. Each player finger-writes it on their own private canvas while a coach line reminds them: disguise your hand, but stay legible. Nobody can see anyone else's canvas as they write. Everyone submits simultaneously.

The host assembles all entries into one card grid — the keepsake — each handwriting sample dropped into a random, unsigned slot. Then the attribution phase: each phone privately drags player-name tags onto the slots (you can't tag your own). The server tallies guesses hidden. Win condition: you are "clean" if no one correctly attributed your slot. The host reveal highlights which writers stayed anonymous; there's no leaderboard. The finished card exports to a PNG you can actually send.

Private per phone: your writing canvas, then your guess board. Shared host: the assembled unsigned card and the final "who stayed clean" reveal.

## Technical approach
Socket.IO over Tailscale Serve (or PartyKit). Data model: `submission {playerId, strokes[] as normalized polylines, slotId}` and `guess {guesserId, slotId → playerId}`. The server computes, per writer, `caught = any guesser guessed their slot correctly`. Sync is two hard barriers — a compose phase (wait for all submissions) then a guess phase (wait for all guesses) — so real-time tightness is NOT the challenge here; this is the rare Divvy game where sync is easy. Host renders strokes as SVG; keepsake export flattens the grid to PNG. The interesting bit is stroke-capture normalization (resolution-independent polylines) and randomizing slot order so writers can't be identified by turn order.

Per-phone is load-bearing: simultaneous private writing means nobody watches your hand form the letters (the whole disguise), and per-phone guess boards keep attributions secret until reveal. One passed phone destroys both.

## v1 scope
- 4 players, one fixed sentence
- One compose phase, one guess phase
- Randomized unsigned grid on host
- "Who stayed clean" reveal + PNG export

## Out of scope
- Multiple rounds/scoring, imitating a *specific* other player, ink/pen styles, emailing the card.

## Risks & unknowns
- Finger handwriting may be too illegible, or disguise too easy (everyone anonymous) / too hard.
- Small groups make guessing a coin flip — tune player count 4–6.
- Must randomize slots so position isn't a tell.

## Done means
Four phones each hand-write the same line privately; the host shows an unsigned randomized grid; each phone attributes every other slot; the reveal marks who stayed anonymous; the assembled card exports as a PNG.
