## Overview
Contact Sheet is a 3–6 player concurrent-room photography party game. Each phone is privately dealt a different evocative prompt; everyone scatters to photograph something nearby that answers it; the host assembles all shots into a single film-strip-style contact sheet. The keepsake — an anonymous grid of the room as your group saw it — is the win. No score.

## Problem
Phones have great cameras and party games almost never touch them. Passing one phone around defeats the whole idea: the fun *requires* everyone in different corners, shooting at once, each answering something the others can't see. And a shared photo artifact of a specific evening is a genuinely lovely thing to keep.

## How it works
Each phone privately draws one prompt from a curated deck of oblique one-liners: *"something warm," "proof you were here," "a small betrayal," "the oldest thing you can reach," "something pretending to be something else."* Prompts are all different across the table and stay secret.

The shared TV shows a 90-second countdown and empty numbered frames — one per player — that fill in live with a blurred placeholder as each phone submits, so you feel the sheet assembling but can't yet see the photos. Each phone privately shows only its own prompt and a camera view; you roam the room/house and capture one frame. You can retake until you submit.

When the timer ends (or all submit), the host reveals the full contact sheet: every photo, unlabeled, laid out like a strip of negatives. Then a light closing round — each phone privately guesses which prompt produced each of the *other* photos — but the real point is the artifact and the delicious ambiguity of your own shot. The host exports the sheet as a downloadable PNG (optionally with the prompt list on the back, attribution omitted). You "win" by contributing to a sheet everyone saves; staying pleasantly un-decodable is the flex.

## Technical approach
Host tab + phone PWA + authoritative WebSocket server (PartyKit / Durable Object over Tailscale Serve). Phones capture via `getUserMedia`/file input, downscale client-side to ~1024px JPEG, upload over the socket (or a signed blob endpoint). Data model: `{ players:[{id,promptId}], shots:[{playerId, imgRef, submittedAt}], guesses:{playerId:{shotId:promptId}} }`. Sync: server assigns distinct prompts, gates reveal until timer/all-in, then broadcasts the ordered shot manifest; layout is a deterministic function of submission order. The genuinely hard part is **image transport under party conditions** — several multi-hundred-KB uploads racing a 90s window on flaky home wifi; needs aggressive client compression, chunked/resumable upload, and a "still uploading…" per-frame state so a slow phone doesn't stall the reveal.

## v1 scope
- 3 players, one prompt each, one 90s round, one contact sheet.
- Deck of ~20 prompts, distinct-per-player draw.
- Client-side downscale to a single fixed size; one PNG export.
- Skip the guessing phase entirely if needed — the sheet alone proves the fun.

## Out of scope
- Filters, multi-shot rounds, themed decks, printing.
- Scoreboards or persistent profiles.
- Content moderation beyond a local-network trust assumption.

## Risks & unknowns
- Upload latency on real home wifi is the make-or-break.
- Camera permission friction on iOS PWAs.
- Prompt quality: too literal kills the ambiguity; needs oblique, house-agnostic prompts.

## Done means
Three phones each receive a different secret prompt, capture and submit one photo within the window, and the host renders one anonymous contact sheet that all three phones can download as the same PNG.
