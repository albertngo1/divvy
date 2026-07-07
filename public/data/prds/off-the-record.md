## Overview
Off the Record is a co-op anonymity game for 4–6 friends who know each other well. Together you build a single anonymous document — a confession sheet — from your own true answers. The whole room wins, and keeps the artifact, only if you collectively stay unidentified. The win condition is literally *anonymity*, not points.

## Problem
Every hidden-author game (Quiplash, etc.) is competitive: guess right, score points, out each other. Nobody has made the inverse — a game where the *group* is on one side, trying to be a convincing anonymous crowd, and the fun is laundering your own voice so your closest friends can't pin a line on you.

## How it works
The server issues one personal, mildly revealing prompt to all phones at once ("the last time you chickened out," "a thing you've never admitted here"). Each phone PRIVATELY shows the prompt and a one-line text box; everyone types a true answer simultaneously. The server shuffles the lines and posts them, unattributed, to the shared TV as a numbered document. Then the guessing phase: each phone PRIVATELY shows the document and, for a random subset of lines, a "who wrote this?" picker — you're trying to fingerprint your friends, they're trying to fingerprint you. The server tallies confident correct attributions. If total correct guesses stay under a threshold (e.g. < N), the document "publishes": the TV stamps it OFF THE RECORD and every phone can save it as a keepsake. If too many land, it's shredded on screen and nobody keeps it.

The tension: a bland deniable line keeps you safe but makes a boring keepsake; an honest, vivid line is worth keeping but leaks your voice. The room must collectively find the register where the sheet is worth saving *and* unattributable.

Private (phone): the prompt, your typed answer, your guess pickers. Shared (TV): the shuffled document, a live "heat" bar of how close the room is to the shred threshold — never who guessed what.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Durable Object over Socket.IO/Tailscale Serve). Data model: `Room{prompt, entries:[{id, playerId, text}], guesses:[{guesserId, entryId, guessedPlayerId}], threshold}`. Sync: answers submitted → server shuffles and broadcasts a de-identified `entries` list (playerId stripped client-side never sent). Guesses are private WS writes; server resolves attribution and emits only the aggregate heat value. Hard part is trust: the client must NEVER receive authorship mapping until the final resolve, so shuffling, id-stripping, and tally all live server-side; the reveal is a single authoritative broadcast.

## v1 scope
- 4 players, one prompt, one round
- One-line text answers, single guess each
- Binary outcome: publish (all save) or shred

## Out of scope
Multiple prompts, a hidden informant/traitor role, scoring, images, editing after submit, printable export styling.

## Risks & unknowns
Blandness collapse (everyone plays safe, dull sheet); prompts too tame or too cruel for the group; small groups make voices too easy to guess; is a binary co-op win satisfying without a traitor.

## Done means
Four phones privately answer one prompt, the TV shows a shuffled anonymous sheet, each phone privately guesses, and the server either publishes the keepsake to all four phones or shreds it based solely on the server-side attribution tally.
